@echo off
title QSE - Diagnostic Windows Android
cd /d "%~dp0"

<<<<<<< codex/rendre-l-application-autonome
echo === QSE Diagnostic (Windows + Android) ===
echo.
echo OBJECTIF 1: Generer APK (icone Android)
echo.

echo [APK 1/3] Node
where node >nul 2>nul
if errorlevel 1 (
  echo - Node: ABSENT ^(BLOQUANT APK^)
) else (
  node -v
)

echo [APK 2/3] npm
where npm >nul 2>nul
if errorlevel 1 (
  echo - npm: ABSENT ^(BLOQUANT APK^)
) else (
  npm -v
)

echo [APK 3/3] Internet
echo - Requis pour build cloud Expo/EAS

echo.
echo OBJECTIF 2: Lancer en mode local QR (optionnel)
echo.

echo [LOCAL 1/3] Docker
where docker >nul 2>nul
if errorlevel 1 (
  echo - Docker: ABSENT ^(bloque uniquement le mode local QR^)
) else (
  docker --version
)

echo [LOCAL 2/3] Yarn
where yarn >nul 2>nul
if errorlevel 1 (
  echo - Yarn: ABSENT ^(sera installe automatiquement par GENERER_APK_WINDOWS.bat^)
=======
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
>>>>>>> main
) else (
  yarn -v
)

<<<<<<< codex/rendre-l-application-autonome
echo [LOCAL 3/3] Fichier frontend\.env
=======
echo.
echo [4/4] Fichier frontend\.env
>>>>>>> main
if exist "frontend\.env" (
  echo - PRESENT
  findstr /B "EXPO_PUBLIC_BACKEND_URL=" "frontend\.env"
) else (
<<<<<<< codex/rendre-l-application-autonome
  echo - ABSENT ^(normal si tu n'utilises pas le mode local QR^)
)

echo.
echo === Lecture rapide ===
echo - Pour TON besoin (icone Android): Node+npm doivent etre presents.
echo - Docker n'est PAS obligatoire pour generer l'APK.
echo.
=======
  echo - ABSENT
)

echo.
echo === Fin diagnostic ===
>>>>>>> main
pause
