@echo off
setlocal

set RUN_MODE=dev
if /I "%~1"=="prod" set RUN_MODE=prod

echo.
echo ============================================
echo   Ninja Must Die 3 Clan Website Service Starter
echo ============================================
echo.

REM Check Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found
    echo Please install Node.js 16+: https://nodejs.org/
    pause
    exit /b 1
)

echo Checking Node.js version...
node --version
echo Backend mode: %RUN_MODE%

echo.
echo 1. Checking MySQL database service...
net start mysql >nul 2>&1
if %errorlevel% equ 0 (
    echo MySQL service started
) else (
    echo WARNING: MySQL service not running
    echo Make sure MySQL service is running on port 3306
    echo Command: net start mysql
)

echo.
echo 2. Starting backend API service...
cd backend
if exist src\server.js (
    if /I "%RUN_MODE%"=="prod" (
        start "Backend API" cmd /c "npm start"
        echo Backend service starting with npm start...
    ) else (
        start "Backend API (dev)" cmd /c "npm run dev"
        echo Backend service starting with npm run dev...
    )
) else (
    echo ERROR: Backend code not found
    pause
    exit /b 1
)

echo.
echo 3. Waiting for backend to start (5 seconds)...
timeout /t 5 >nul

echo.
echo 4. Testing backend health...
curl -s http://localhost:5000/health >nul
if %errorlevel% equ 0 (
    echo Backend API service started successfully
) else (
    echo Backend service may not be ready, continuing...
)

echo.
echo 5. Starting frontend website...
cd ..\frontend
if exist src\index.js (
    start "Frontend Website" cmd /c "node node_modules\react-scripts\bin\react-scripts.js start"
    echo Frontend service starting...
) else (
    echo ERROR: Frontend code not found
    pause
    exit /b 1
)

echo.
echo 6. Waiting for frontend to start (8 seconds)...
timeout /t 8 >nul

echo.
echo ============================================
echo              Startup Complete!
echo ============================================
echo.
echo Access Links:
echo   Frontend Website: http://localhost:3000
echo   Backend API: http://localhost:5000
echo   Health Check: http://localhost:5000/health
echo.
echo Test Account: see project docs for credentials.
echo.
echo Notes:
echo   1. Default mode is dev with backend auto-reload
echo   2. Use "start_services.bat prod" for production-style backend start
echo   3. Ensure MySQL database is properly configured
echo   4. Check firewall settings if services are inaccessible
echo.
echo ============================================
echo Press any key to open browser, or close window...
pause >nul

start http://localhost:3000
echo Browser opened, accessing website...

echo.
echo To stop all services, close all CMD windows.
echo Or run: taskkill /F /IM node.exe
echo.
pause