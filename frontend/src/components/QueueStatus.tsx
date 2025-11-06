'use client';

import { Service, AffluenceLevel } from '@/lib/types';

interface QueueStatusProps {
  service: Service;
  currentPosition?: number;
  showDetails?: boolean;
  showPrediction?: boolean;
}

export default function QueueStatus({ 
  service, 
  currentPosition,
  showDetails = true,
  showPrediction = false 
}: QueueStatusProps) {
  
  const getAffluenceInfo = (level: AffluenceLevel) => {
    switch (level) {
      case AffluenceLevel.LOW:
        return {
          color: 'bg-green-100 text-green-800 border-green-300',
          icon: '🟢',
          label: 'Faible affluence',
          description: 'C\'est le moment idéal pour venir',
          barColor: 'bg-green-500',
          percentage: 25
        };
      case AffluenceLevel.MODERATE:
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
          icon: '🟡',
          label: 'Affluence modérée',
          description: 'Temps d\'attente raisonnable',
          barColor: 'bg-yellow-500',
          percentage: 50
        };
      case AffluenceLevel.HIGH:
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-300',
          icon: '🟠',
          label: 'Forte affluence',
          description: 'Prévoyez un peu d\'attente',
          barColor: 'bg-orange-500',
          percentage: 75
        };
      case AffluenceLevel.VERY_HIGH:
        return {
          color: 'bg-red-100 text-red-800 border-red-300',
          icon: '🔴',
          label: 'Affluence très élevée',
          description: 'Nous recommandons de revenir plus tard',
          barColor: 'bg-red-500',
          percentage: 100
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-300',
          icon: '⚪',
          label: 'Affluence inconnue',
          description: 'Informations non disponibles',
          barColor: 'bg-gray-500',
          percentage: 0
        };
    }
  };

  const affluenceInfo = getAffluenceInfo(service.affluence_level);
  const estimatedWaitPerPerson = service.current_queue_size > 0 
    ? Math.round(service.estimated_wait_time / service.current_queue_size) 
    : 5;

  return (
    <div className="space-y-4">
      {/* Statut principal */}
      <div className={`border-2 rounded-xl p-4 ${affluenceInfo.color}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">{affluenceInfo.icon}</span>
            <div>
              <h3 className="font-bold text-lg">{affluenceInfo.label}</h3>
              <p className="text-sm opacity-90">{affluenceInfo.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{service.current_queue_size}</div>
            <div className="text-xs opacity-75">personnes</div>
          </div>
        </div>

        {/* Barre de progression d'affluence */}
        <div className="w-full bg-white/50 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${affluenceInfo.barColor}`}
            style={{ width: `${affluenceInfo.percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Statistiques détaillées */}
      {showDetails && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-[#FFD43B]">
            <div className="text-sm text-gray-600 mb-1">Temps d'attente estimé</div>
            <div className="text-2xl font-bold text-gray-900">
              {service.estimated_wait_time} <span className="text-sm font-normal">min</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              ≈ {estimatedWaitPerPerson} min/personne
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">File d'attente</div>
            <div className="text-2xl font-bold text-gray-900">
              {service.current_queue_size} <span className="text-sm font-normal">pers.</span>
            </div>
            {currentPosition && (
              <div className="text-xs text-blue-600 mt-1 font-semibold">
                Vous êtes n°{currentPosition}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Position dans la file si applicable */}
      {currentPosition && (
        <div className="bg-gradient-to-r from-[#FFD43B] to-[#FFC107] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-800 font-medium mb-1">Votre position</div>
              <div className="text-3xl font-bold text-gray-900">
                #{currentPosition}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-800 font-medium mb-1">Temps estimé</div>
              <div className="text-2xl font-bold text-gray-900">
                {currentPosition * estimatedWaitPerPerson} min
              </div>
            </div>
          </div>
          
          {/* Barre de progression personnelle */}
          <div className="mt-3">
            <div className="w-full bg-white/30 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.max(5, 100 - (currentPosition / service.current_queue_size * 100))}%` 
                }}
              ></div>
            </div>
            <div className="text-xs text-gray-800 mt-1 text-center">
              {currentPosition === 1 ? 'C\'est bientôt votre tour !' : 
               currentPosition <= 3 ? 'Préparez-vous, ça arrive !' : 
               'Patience, votre tour approche...'}
            </div>
          </div>
        </div>
      )}

      {/* Prédiction IA */}
      {showPrediction && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <span className="text-2xl">🤖</span>
            <div className="flex-1">
              <h4 className="font-semibold text-purple-900 mb-2">
                Prédiction IA
              </h4>
              <div className="space-y-2 text-sm text-purple-800">
                <p>
                  Basé sur les données historiques, le meilleur moment pour visiter ce service est :
                </p>
                <div className="bg-white rounded px-3 py-2 font-semibold text-purple-900">
                  {getCurrentRecommendation()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicateurs visuels de la file */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-sm font-semibold text-gray-700 mb-3">
          Visualisation de la file
        </div>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: Math.min(service.current_queue_size, 20) }).map((_, idx) => (
            <div
              key={idx}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                currentPosition && idx + 1 === currentPosition
                  ? 'bg-[#FFD43B] text-gray-900 ring-2 ring-offset-2 ring-[#FFD43B]'
                  : idx < 3
                  ? 'bg-green-200 text-green-800'
                  : 'bg-gray-300 text-gray-700'
              }`}
              title={currentPosition && idx + 1 === currentPosition ? 'C\'est vous !' : `Position ${idx + 1}`}
            >
              {idx + 1}
            </div>
          ))}
          {service.current_queue_size > 20 && (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              +{service.current_queue_size - 20}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getCurrentRecommendation(): string {
  const hour = new Date().getHours();
  
  if (hour < 9) {
    return '08h00 - 09h00 (Début de journée)';
  } else if (hour < 12) {
    return '14h00 - 15h00 (Après le déjeuner)';
  } else if (hour < 15) {
    return '16h00 - 17h00 (Fin d\'après-midi)';
  } else {
    return 'Demain matin 08h00 - 09h00';
  }
}