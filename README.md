# QSE — objectif: une icône sur Android (Windows)

Tu as raison: ce que tu veux est simple à formuler.

## Résultat attendu

- Tu touches une **icône QSE** sur ton smartphone Android.
- L'app s'ouvre directement.

## Chemin le plus simple (gratuit)

### Étape 1 — Générer l'APK (une seule fois)

Sur Windows, double-clique:

- **`GENERER_APK_WINDOWS.bat`**

Ensuite:
1. attends la fin,
2. ouvre le lien affiché,
3. télécharge l'APK,
4. installe l'APK sur ton Android.

Tu auras l'icône QSE sur le téléphone.

### Étape 2 — Utiliser l'app au quotidien

- Tu peux lancer l'app via son icône Android.
- La synchronisation des fiches en attente reste **manuelle** (bouton `Synchroniser`).

## Si tu veux lancer l'environnement local (backend + QR)

- Double-clique **`DEMARRER_QSE_WINDOWS.bat`**

## Important

- `github.io/QSE` ne lance pas l'application mobile.
- C'est seulement une page d'information.
# QSE - démarrage fiable (mobile terrain + mode manuel)


> ⚠️ Important: ouvrir `https://...github.io/QSE/` ne lance **pas** l'application.
> GitHub Pages affiche seulement une page statique d'instructions.
> Pour utiliser l'app, il faut lancer le backend + Expo localement (voir étapes ci-dessous).

Tu as demandé du **manuel** pour la synchro. C'est maintenant le comportement: rien ne part automatiquement.

## 1) Backend: 2 options

### Option A (avec Docker)
```bash
docker compose up -d --build
```
API: `http://localhost:8001`

### Option B (sans Docker, gratuit)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001
```

## 2) Frontend mobile (Expo)

```bash
cd frontend
yarn install
yarn start:local
```

Si ton réseau bloque les checks Expo:
```bash
yarn start:offline
```

## 3) URL backend côté mobile

Ordre de priorité:
1. `EXPO_PUBLIC_BACKEND_URL`
2. web: `http://<hostname_courant>:8001`
3. mobile Expo: IP machine Expo + `:8001`
4. fallback: `http://localhost:8001`

Exemple conseillé sur mobile réel (phone sur même Wi‑Fi que le PC):
```bash
cd frontend
cp env.sample .env
# puis mets l'IP locale de ton PC
# EXPO_PUBLIC_BACKEND_URL=http://192.168.1.50:8001
```

## 4) Hors ligne en atelier

- Si réseau KO: la fiche est mise en file locale.
- Tu appuies manuellement sur **Synchroniser** pour envoyer.
- Pas de sync auto.

## 5) Dépannage rapide (si "je ne peux pas lancer")

1. Vérifie backend vivant:
```bash
curl http://localhost:8001/api/
```
2. Vérifie que le téléphone atteint ton PC:
   - depuis le téléphone: ouvre `http://IP_DU_PC:8001/api/` dans le navigateur
3. Si ça ne répond pas:
   - pare-feu PC à ouvrir sur port `8001`
   - téléphone et PC sur le même réseau
4. Si Expo refuse de démarrer (erreurs réseau): utiliser `yarn start:offline`.
