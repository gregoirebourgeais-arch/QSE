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
