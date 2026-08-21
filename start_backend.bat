@echo off
title DeskFlow Backend
echo Starting DeskFlow FastAPI Backend on http://localhost:8000 ...
cd /d "%~dp0backend"
if exist "venv\Scripts\python.exe" (
    venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
) else (
    python -m uvicorn app.main:app --reload --port 8000
)
pause
