"""
ViteviteApp - ML Trainer avec Kaggle Dataset
Entraîne un modèle XGBoost sur données réelles de files d'attente
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import joblib
from pathlib import Path
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class QueueTimePredictor:
    """Prédicteur de temps d'attente avec XGBoost"""
    
    def __init__(self, model_path: str = "models/queue_predictor.pkl"):
        self.model_path = Path(model_path)
        self.model = None
        self.label_encoders = {}
        self.feature_columns = [
            'queue_size', 'hour', 'day_of_week', 'day_of_month',
            'is_salary_day', 'is_start_of_month', 'is_peak_hour',
            'service_category_encoded', 'affluence_level_encoded'
        ]
    
    def prepare_kaggle_data(self, csv_path: str) -> pd.DataFrame:
        """
        Prépare les données Kaggle pour l'entraînement
        
        Format attendu du CSV Kaggle:
        - service_name: Nom du service
        - service_category: Catégorie (Banque, Mairie, Santé)
        - timestamp: Date/heure de la visite
        - queue_size: Taille de la file
        - wait_time_minutes: Temps d'attente réel (TARGET)
        - affluence_level: Niveau d'affluence
        """
        try:
            df = pd.read_csv(csv_path)
            
            # Convertir timestamp
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            df['hour'] = df['timestamp'].dt.hour
            df['day_of_week'] = df['timestamp'].dt.dayofweek
            df['day_of_month'] = df['timestamp'].dt.day
            
            # Features contextuelles ivoiriennes
            df['is_salary_day'] = df['day_of_month'].isin([1, 5, 10, 15, 20, 25]).astype(int)
            df['is_start_of_month'] = (df['day_of_month'] <= 7).astype(int)
            df['is_peak_hour'] = ((df['hour'] >= 9) & (df['hour'] <= 12)).astype(int)
            
            # Encoder les catégories
            for col in ['service_category', 'affluence_level']:
                if col not in self.label_encoders:
                    self.label_encoders[col] = LabelEncoder()
                    df[f'{col}_encoded'] = self.label_encoders[col].fit_transform(df[col])
                else:
                    df[f'{col}_encoded'] = self.label_encoders[col].transform(df[col])
            
            # Nettoyer les valeurs aberrantes
            df = df[df['wait_time_minutes'] > 0]
            df = df[df['wait_time_minutes'] < 300]  # Max 5h
            df = df[df['queue_size'] >= 0]
            
            logger.info(f"Dataset préparé: {len(df)} lignes")
            return df
        
        except Exception as e:
            logger.error(f"Erreur préparation données: {e}")
            raise
    
    def train(self, csv_path: str, test_size: float = 0.2):
        """Entraîne le modèle sur les données Kaggle"""
        
        # Préparer les données
        df = self.prepare_kaggle_data(csv_path)
        
        # Features et target
        X = df[self.feature_columns]
        y = df['wait_time_minutes']
        
        # Split
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Entraîner XGBoost
        logger.info("Entraînement du modèle XGBoost...")
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=5,
            learning_rate=0.1,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            early_stopping_rounds=10,
            verbose=False
        )
        
        # Évaluation
        train_score = self.model.score(X_train, y_train)
        test_score = self.model.score(X_test, y_test)
        
        logger.info(f"✅ Entraînement terminé:")
        logger.info(f"  - R² train: {train_score:.3f}")
        logger.info(f"  - R² test: {test_score:.3f}")
        
        # Sauvegarder
        self.save_model()
        
        return {
            'train_score': train_score,
            'test_score': test_score,
            'n_samples': len(df)
        }
    
    def predict(self, features: dict) -> dict:
        """
        Prédit le temps d'attente
        
        Args:
            features: {
                'queue_size': int,
                'service_category': str,
                'affluence_level': str
            }
        
        Returns:
            {'predicted_time': int, 'confidence': float}
        """
        if self.model is None:
            self.load_model()
        
        # Préparer les features
        now = datetime.now()
        feature_vector = {
            'queue_size': features.get('queue_size', 0),
            'hour': now.hour,
            'day_of_week': now.weekday(),
            'day_of_month': now.day,
            'is_salary_day': 1 if now.day in [1, 5, 10, 15, 20, 25] else 0,
            'is_start_of_month': 1 if now.day <= 7 else 0,
            'is_peak_hour': 1 if 9 <= now.hour <= 12 else 0,
        }
        
        # Encoder catégories
        try:
            category = features.get('service_category', 'Administration')
            affluence = features.get('affluence_level', 'modérée')
            
            if 'service_category' in self.label_encoders:
                feature_vector['service_category_encoded'] = \
                    self.label_encoders['service_category'].transform([category])[0]
            else:
                feature_vector['service_category_encoded'] = 0
            
            if 'affluence_level' in self.label_encoders:
                feature_vector['affluence_level_encoded'] = \
                    self.label_encoders['affluence_level'].transform([affluence])[0]
            else:
                feature_vector['affluence_level_encoded'] = 0
        
        except Exception as e:
            logger.warning(f"Erreur encodage: {e}, utilisation valeurs par défaut")
            feature_vector['service_category_encoded'] = 0
            feature_vector['affluence_level_encoded'] = 0
        
        # Prédiction
        X = pd.DataFrame([feature_vector])[self.feature_columns]
        prediction = self.model.predict(X)[0]
        
        # Confidence basée sur la cohérence
        confidence = min(0.95, 0.75 + (0.20 if features.get('queue_size', 0) > 0 else 0))
        
        return {
            'predicted_time': int(max(5, prediction)),  # Min 5 minutes
            'confidence': confidence
        }
    
    def save_model(self):
        """Sauvegarde le modèle entraîné"""
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        
        joblib.dump({
            'model': self.model,
            'label_encoders': self.label_encoders,
            'feature_columns': self.feature_columns
        }, self.model_path)
        
        logger.info(f"✅ Modèle sauvegardé: {self.model_path}")
    
    def load_model(self):
        """Charge le modèle depuis le disque"""
        if not self.model_path.exists():
            raise FileNotFoundError(f"Modèle non trouvé: {self.model_path}")
        
        data = joblib.load(self.model_path)
        self.model = data['model']
        self.label_encoders = data['label_encoders']
        self.feature_columns = data['feature_columns']
        
        logger.info(f"✅ Modèle chargé: {self.model_path}")


# Instance globale
predictor = QueueTimePredictor()


# ========== SCRIPT D'ENTRAÎNEMENT ==========
if __name__ == "__main__":
    """
    Usage:
        python -m app.services.ml_trainer
    
    Placer le CSV Kaggle dans: data/queue_data.csv
    """
    import sys
    
    csv_path = "data/queue_data.csv"
    
    if not Path(csv_path).exists():
        print(f"❌ Fichier non trouvé: {csv_path}")
        print("\n📥 Téléchargez un dataset Kaggle sur les files d'attente")
        print("   Exemple: https://www.kaggle.com/datasets/queue-management")
        sys.exit(1)
    
    print("🚀 Entraînement du modèle ML...")
    results = predictor.train(csv_path)
    
    print(f"\n✅ Entraînement terminé:")
    print(f"   - Échantillons: {results['n_samples']}")
    print(f"   - R² test: {results['test_score']:.2%}")
    print(f"\n💾 Modèle sauvegardé dans: models/queue_predictor.pkl")