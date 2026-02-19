# QSE — Windows + Android (icône sur smartphone)

Tu as trouvé le vrai problème. Ta capture indique:
- Docker absent
- Node absent
- Yarn absent

**Pour générer l'APK, le blocage principal est Node/npm absent.**
Docker n'est pas obligatoire pour l'APK.

## Ce que tu fais maintenant (simple)

1. Installe Node.js LTS: https://nodejs.org/en/download
2. Ferme/réouvre Windows (ou au minimum la session).
3. Double-clique `GENERER_APK_WINDOWS.bat`.
4. Connecte-toi à Expo si demandé.
5. À la fin, clique le lien du build APK affiché.

## Où cliquer si tu rates le lien

- https://expo.dev/accounts
- projet `qse-app`
- onglet `Builds`
- dernier build Android (APK)

## Aide rapide

- Double-clique `DIAGNOSTIC_WINDOWS_ANDROID.bat` pour vérifier.
- Double-clique `INSTALLER_APK_GUIDE.bat` pour ouvrir directement Expo Accounts.


## Si tu n'as PAS de PC (mobile uniquement)

Réponse franche: sans PC, tu ne peux pas compiler localement ni héberger le backend chez toi.

Chemin faisable et gratuit (ou quasi gratuit):
1. Build APK via GitHub Actions (déjà prêt dans ce repo): `.github/workflows/android-apk.yml`.
2. Héberger le backend sur un service cloud (Render / Railway / Fly.io).
3. Mettre `EXPO_PUBLIC_BACKEND_URL` vers ce backend avant build.

### Activer le build APK depuis GitHub (sans PC)
1. Crée un compte Expo.
2. Dans GitHub > Settings > Secrets and variables > Actions, ajoute:
   - `EXPO_TOKEN` (token Expo).
3. Dans GitHub > Actions > **Build Android APK** > **Run workflow**.
4. Le lien APK apparaîtra dans les logs EAS/Expo du workflow.

⚠️ Sans backend hébergé, l'app installée ne pourra pas synchroniser les données.


## Backend: configuration a posteriori (après installation)

Oui, c'est possible sans reconstruire l'APK.

Dans l'app Android:
1. Ouvre onglet **Profil**
2. Champ **URL backend**
3. Bouton **Tester + Enregistrer**

Tu peux donc changer l'URL backend plus tard (ex: changement d'hébergeur).

## Solution backend sans PC (mobile-only)

Tu dois héberger le backend en ligne. Option low-cost/gratuite:
- Render (facile)
- Railway
- Fly.io

Minimum à configurer côté backend:
- variable `MONGO_URL`
- variable `DB_NAME` (optionnelle, défaut `qse_database`)
- port `8001`

Une fois l'URL obtenue (ex: `https://qse-backend.onrender.com`), colle-la dans **Profil > URL backend > Tester + Enregistrer**.
