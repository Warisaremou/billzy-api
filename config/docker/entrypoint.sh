#!/bin/sh
set -e

echo "🔄 Starting application initialization..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
DATABASE_PORT=${DATABASE_PORT:-3306}
until nc -z "$DATABASE_HOST" "$DATABASE_PORT"; do
  echo "Database is unavailable - sleeping"
  sleep 2
done
echo "✅ Database is ready!"

# Run migrations
echo "🔄 Running database migrations..."
npm run migration:run:prod || {
  echo "⚠️ Migration failed, but continuing..."
}

# Run seeders (only if SEED_DATABASE env var is set)
if [ "$SEED_DATABASE" = "true" ]; then
  echo "🌱 Running database seeders..."
  npm run seed:run:prod || {
    echo "⚠️ Seeding failed, but continuing..."
  }
fi

echo "🚀 Starting application..."
exec "$@"
