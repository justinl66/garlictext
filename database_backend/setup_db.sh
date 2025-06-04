#!/bin/bash
# Unix shell script to set up PostgreSQL database for GarlicText

echo "Setting up PostgreSQL database for GarlicText..."

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null
then
    echo "PostgreSQL is not installed or not in PATH. Please install PostgreSQL."
    exit 1
fi

# Create database if it doesn't exist
echo "Creating database if it doesn't exist..."
if ! psql -U postgres -lqt | cut -d \| -f 1 | grep -qw garlictext; then
    psql -U postgres -c "CREATE DATABASE garlictext;"
    echo "Database 'garlictext' created."
else
    echo "Database 'garlictext' already exists."
fi

# Create UUID extension
echo "Creating UUID extension..."
psql -U postgres -d garlictext -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

echo "PostgreSQL database setup complete!"
echo "You can now run 'npm install' and 'npm run dev' in the database_backend folder."
