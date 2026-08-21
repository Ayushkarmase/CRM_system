@echo off
title DeskFlow Frontend
echo Starting DeskFlow React Frontend on http://localhost:5173 ...
cd /d "%~dp0frontend"
set "PATH=C:\Program Files\nodejs;%PATH%"
call npm run dev
pause
