@echo off
title DeskFlow Launcher
echo ====================================================
echo Starting DeskFlow Full-Stack Application...
echo Backend:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo Frontend: http://localhost:5173
echo ====================================================

start "DeskFlow Backend" "%~dp0start_backend.bat"
timeout /t 2 /nobreak >nul
start "DeskFlow Frontend" "%~dp0start_frontend.bat"

echo.
echo Both servers are launching in separate windows!
timeout /t 3 >nul
