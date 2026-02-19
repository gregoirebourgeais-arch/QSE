@echo off
title QSE - Diagnostic Windows Android
cd /d "%~dp0"

echo === QSE Diagnostic ===
echo.

echo [1/4] Docker
where docker >nul 2>nul
if errorlevel 1 (
  echo - Docker: ABSENT
) else (
  docker --version
)

echo.
echo [2/4] Node
where node >nul 2>nul
if errorlevel 1 (
  echo - Node: ABSENT
) else (
  node -v
)

echo.
echo [3/4] Yarn
where yarn >nul 2>nul
if errorlevel 1 (
  echo - Yarn: ABSENT
) else (
  yarn -v
)

echo.
echo [4/4] Fichier frontend\.env
if exist "frontend\.env" (
  echo - PRESENT
  findstr /B "EXPO_PUBLIC_BACKEND_URL=" "frontend\.env"
) else (
  echo - ABSENT
)

echo.
echo === Fin diagnostic ===
pause
