@echo off
REM Windows batch script to set up PostgreSQL database for GarlicText

echo Setting up PostgreSQL database for GarlicText...

REM Check if PostgreSQL is installed
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo PostgreSQL is not installed or not in PATH. Please install PostgreSQL.
    exit /b 1
)

REM Create database if it doesn't exist
echo Creating database if it doesn't exist...
psql -U postgres -c "SELECT 1 FROM pg_database WHERE datname = 'garlictext'" | findstr /C:"1 row" >nul
if %ERRORLEVEL% NEQ 0 (
    psql -U postgres -c "CREATE DATABASE garlictext;"
    echo Database 'garlictext' created.
) else (
    echo Database 'garlictext' already exists.
)

REM Create UUID extension
echo Creating UUID extension...
psql -U postgres -d garlictext -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";"

echo PostgreSQL database setup complete!

REM Run npm run db:setup to initialize tables and seed data
echo Running npm run db:setup to initialize tables and seed data...
npm run db:setup
if %ERRORLEVEL% NEQ 0 (
    echo Failed to run npm run db:setup. Make sure you have run 'npm install' first.
    exit /b 1
)

echo Database setup and initialization complete!
echo You can now run 'npm run dev' to start the server.
