@echo off
echo =================================================================
echo                    CareChrono 1.0 Clinical Suite
echo =================================================================
echo.
echo [1/2] Starting FastAPI Backend on http://localhost:8000...
start "CareChrono Backend" cmd /c "title CareChrono Backend && venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000"

echo [2/2] Starting Next.js Frontend on http://127.0.0.1:3000...
start "CareChrono Frontend" cmd /c "title CareChrono Frontend && cd frontend && npm run dev"

echo.
echo =================================================================
echo CareChrono is spinning up!
echo.
echo   - Frontend Portal: http://127.0.0.1:3000
echo   - Backend Docs:    http://127.0.0.1:8000/docs
echo.
echo   - Demo Credentials:
echo       * Email:    doctor@carechrono.com
echo       * Password: password123
echo.
echo Press any key to exit this launch helper (servers will remain running)...
echo =================================================================
echo.
pause
