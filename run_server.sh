#!/bin/bash -e

# Set environment variables
export NODE_ENV=development
export PORT=3000

# Check if uploads folder exists
if [ ! -d "uploads" ]; then
  mkdir -p uploads
fi

# Print environment variables for database connection
echo "Database Connection Information:"
echo "DATABASE_URL: $DATABASE_URL"
echo "PGHOST: $PGHOST"
echo "PGUSER: $PGUSER"
echo "PGDATABASE: $PGDATABASE"
echo "PGPORT: $PGPORT"

# Run server with required environment variables
echo "Starting server..."
npx tsx server/index.ts