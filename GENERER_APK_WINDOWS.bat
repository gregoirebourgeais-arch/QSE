@echo off
title QSE - Generer APK Android
cd /d "%~dp0\frontend"

echo =====================================
echo QSE - GENERATION APK ANDROID
echo =====================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] Node.js n'est pas installe.
  echo Installe Node LTS puis relance ce fichier:
  echo https://nodejs.org/en/download
  echo.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERREUR] npm n'est pas disponible.
  echo Reinstalle Node.js LTS:
  echo https://nodejs.org/en/download
  echo.
  pause
  exit /b 1
)

echo [OK] Node/npm detectes.

echo.
echo [1/4] Installation de Yarn (si necessaire)
call npm install -g yarn >nul 2>nul

echo [2/4] Installation de eas-cli (si necessaire)
call npm install -g eas-cli >nul 2>nul

echo [3/4] Installation des dependances projet
call yarn install
if errorlevel 1 (
  echo.
  echo [ERREUR] yarn install a echoue.
  pause
  exit /b 1
)

echo [4/4] Connexion Expo + build APK
echo Si demande: connecte-toi a ton compte Expo dans la fenetre.
call npx eas login
call npx eas build --platform android --profile preview

echo.
echo [SUCCES] Build lance.
echo Le lien APK apparait dans cette fenetre.
echo Sinon: https://expo.dev/accounts  ^> projet qse-app  ^> Builds
echo.
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
