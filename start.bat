@echo off
title TypeTrend Launcher
echo =====================================================
echo    Starting TypeTrend: Typing Speed Predictor
echo =====================================================
echo.

echo [1/2] Starting Flask Backend on http://127.0.0.1:5000 ...
start "TypeTrend Backend (Port 5000)" cmd /k "cd /d "%~dp0backend" && python app.py"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "TypeTrend Frontend (Port 5173)" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Both services are running in their respective command windows!
echo Waiting a moment before opening your default browser...
timeout /t 3 >nul
start http://localhost:5173
