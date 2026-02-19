@echo off
title QSE - Demarrage Windows + Android
cd /d "%~dp0"

where docker >nul 2>nul
if errorlevel 1 (
  echo.
  echo [QSE][ERREUR] Docker Desktop n'est pas installe.
  echo Installe Docker Desktop puis relance ce fichier.
  echo.
  pause
  exit /b 1
)

echo [QSE] Demarrage en cours... merci de patienter.
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\run-local.ps1"
set EXITCODE=%ERRORLEVEL%

if not "%EXITCODE%"=="0" (
  echo.
  echo [QSE][ERREUR] Le demarrage a echoue (code %EXITCODE%).
  echo Relance Docker Desktop, verifie le Wi-Fi, puis relance ce fichier.
  echo.
  pause
)
