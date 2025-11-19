"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=20), nullable=True),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_verified', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('role', sa.Enum('user', 'admin', 'super', name='userrole'), nullable=False, server_default='user'),
        sa.Column('last_login_at', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_phone'), 'users', ['phone'], unique=True)

    # Services table
    op.create_table(
        'services',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('slug', sa.String(length=255), nullable=False),
        sa.Column('category', sa.String(length=100), nullable=False),
        sa.Column('description', sa.String(length=1000), nullable=True),
        sa.Column('icon', sa.String(length=50), nullable=False, server_default='building'),
        sa.Column('status', sa.Enum('ouvert', 'fermé', 'en_pause', name='servicestatus'), nullable=False, server_default='ouvert'),
        sa.Column('affluence_level', sa.Enum('faible', 'modérée', 'élevée', 'très_élevée', name='affluencelevel'), nullable=False, server_default='faible'),
        sa.Column('estimated_wait_time', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('current_queue_size', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('max_queue_size', sa.Integer(), nullable=True),
        sa.Column('opening_hours', sa.String(length=100), nullable=False, server_default='08:00 - 17:00'),
        sa.Column('location', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column('required_documents', postgresql.JSON(astext_type=sa.Text()), nullable=False, server_default='[]'),
        sa.Column('average_service_time', sa.Integer(), nullable=False, server_default='10'),
        sa.Column('total_tickets_served', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('rating', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_services_name'), 'services', ['name'])
    op.create_index(op.f('ix_services_slug'), 'services', ['slug'], unique=True)
    op.create_index(op.f('ix_services_category'), 'services', ['category'])
    op.create_index(op.f('ix_services_status'), 'services', ['status'])

    # Tickets table
    op.create_table(
        'tickets',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('service_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=True),
        sa.Column('ticket_number', sa.String(length=20), nullable=False),
        sa.Column('position_in_queue', sa.Integer(), nullable=False),
        sa.Column('status', sa.Enum('en_attente', 'appelé', 'en_service', 'terminé', 'annulé', 'absent', name='ticketstatus'), nullable=False, server_default='en_attente'),
        sa.Column('user_name', sa.String(length=255), nullable=True),
        sa.Column('user_phone', sa.String(length=20), nullable=True),
        sa.Column('estimated_wait_time', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('called_at', sa.String(), nullable=True),
        sa.Column('started_at', sa.String(), nullable=True),
        sa.Column('completed_at', sa.String(), nullable=True),
        sa.Column('notes', sa.String(length=500), nullable=True),
        sa.Column('qr_code', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('now()')),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['service_id'], ['services.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
    )
    op.create_index(op.f('ix_tickets_service_id'), 'tickets', ['service_id'])
    op.create_index(op.f('ix_tickets_user_id'), 'tickets', ['user_id'])
    op.create_index(op.f('ix_tickets_ticket_number'), 'tickets', ['ticket_number'])
    op.create_index(op.f('ix_tickets_status'), 'tickets', ['status'])


def downgrade() -> None:
    op.drop_table('tickets')
    op.drop_table('services')
    op.drop_table('users')
    op.execute('DROP TYPE IF EXISTS ticketstatus')
    op.execute('DROP TYPE IF EXISTS servicestatus')
    op.execute('DROP TYPE IF EXISTS affluencelevel')
    op.execute('DROP TYPE IF EXISTS userrole')