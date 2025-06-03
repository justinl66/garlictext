@echo off
REM Windows batch script to set up PostgreSQL database for GarlicText

echo Setting up PostgreSQL database for GarlicText...

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL is not installed or not in PATH. Please install PostgreSQL.
    exit /b 1
)

REM Drop and recreate database
echo Dropping database if it exists...
psql -U postgres -c "DROP DATABASE IF EXISTS garlictext;"
echo Creating database...
psql -U postgres -c "CREATE DATABASE garlictext;"
echo Database 'garlictext' dropped and recreated.

REM Create UUID extension
echo Creating UUID extension...
psql -U postgres -d garlictext -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

echo PostgreSQL database setup complete!
echo You can now run 'npm install' and 'npm run dev' in the database_backend folder.
