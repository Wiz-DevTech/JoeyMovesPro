#!/bin/bash

# Joey Moves Pro - Database Migration Script

set -e

echo "🗄️  Starting database migration..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

# Backup production database (if in production)
if [ "$NODE_ENV" = "production" ]; then
  echo "📦 Creating database backup..."
  # Add your backup command here
  # pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
fi

# Run Prisma migrations
echo "🔄 Running Prisma migrations..."
bunx prisma migrate deploy

# Generate Prisma Client
echo "⚙️  Generating Prisma Client..."
bunx prisma generate

# Seed database (optional, only in development)
if [ "$NODE_ENV" != "production" ]; then
  echo "🌱 Seeding database..."
  bunx prisma db seed
fi

echo "✅ Migration completed successfully!"