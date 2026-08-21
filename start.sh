#!/bin/bash
# Railway start script for DeskFlow backend
cd backend
exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}
