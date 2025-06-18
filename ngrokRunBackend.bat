@echo off
echo Starting ngrok tunnel for backend...
echo Backend URL: http://localhost:5000
echo Public URL: https://credible-promptly-shiner.ngrok-free.app

REM Check if Node.js and npm are installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

REM Start ngrok tunnel using npx
echo Starting tunnel...
npx ngrok http 5000 --url=credible-promptly-shiner.ngrok-free.app
