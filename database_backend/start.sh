#!/bin/bash
# Unix shell script to start the database backend

# Load environment variables from .env file
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

echo "Starting GarlicText Database Backend..."

# Check if database is initialized
echo "Checking database connection..."
node -e "require('./models').sequelize.authenticate().then(() => console.log('Database connected.')).catch(err => { console.error('Database connection failed:', err); process.exit(1); })"

if [ $? -ne 0 ]; then
  echo "Database connection failed. Please check your PostgreSQL installation and .env configuration."
  exit 1
fi

# Start the server
echo "Starting server..."
if [ "$1" = "--dev" ]; then
  npx nodemon server.js
else
  node server.js
fi
