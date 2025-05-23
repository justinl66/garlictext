@echo off
REM Windows batch script to start the database backend

REM Load environment variables from .env file
for /f "tokens=*" %%a in ('type .env ^| findstr /v "^#" ^| findstr /v "^$"') do (
    set %%a
)

echo Starting GarlicText Database Backend...

REM Check if database is initialized
echo Checking database connection...
node -e "require('./models').sequelize.authenticate().then(() => console.log('Database connected.')).catch(err => { console.error('Database connection failed:', err); process.exit(1); })"

if %ERRORLEVEL% NEQ 0 (
    echo Database connection failed. Please check your PostgreSQL installation and .env configuration.
    exit /b 1
)

REM Start the server
echo Starting server...
if "%1"=="--dev" (
    npx nodemon server.js
) else (
    node server.js
)
