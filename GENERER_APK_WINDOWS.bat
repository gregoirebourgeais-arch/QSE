@echo off
title QSE - Generer APK Android (icone sur smartphone)
cd /d "%~dp0\frontend"

echo [QSE] Generation d'un APK Android (gratuit via Expo/EAS)
echo [QSE] Une connexion Expo peut etre demandee la premiere fois.

yarn install
npx eas build --platform android --profile preview

echo.
echo [QSE] Build lance. Ouvre le lien affiche pour telecharger l'APK.
echo [QSE] Installe l'APK sur Android: tu auras une icone QSE.
pause
