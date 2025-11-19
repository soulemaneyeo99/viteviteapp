"""
Alembic Environment Configuration
Pour migrations automatiques de la base de données
"""

from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys

# Ajouter le backend au path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import des configs et models
from app.core.config import settings
from app.core.database import Base
from app.models import user, service, ticket  # Import tous les models

# Configuration Alembic
config = context.config

# Interpréter le fichier de config pour logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata pour autogenerate
target_metadata = Base.metadata

# Database URL depuis settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace("+asyncpg", "+psycopg2"))


def run_migrations_offline() -> None:
    """Run migrations en mode 'offline' (génération SQL uniquement)"""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations en mode 'online' (connexion DB réelle)"""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, 
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()