# Front-chat

Application de chat temps réel (messagerie, présence, appels vidéo WebRTC) côté client.

- **Framework** : React 18 + Vite 6 (JavaScript/JSX, pas de TypeScript)
- **Stylage** : Tailwind CSS 3
- **État** : Zustand (auth, conversations, appels, présence)
- **Temps réel** : Socket.IO client
- **Réseau** : axios (JWT) + proxy Vite vers le backend

## Architecture

```
Front-chat/
├── vite.config.js          # Port 5173, HTTPS via ../certs, proxy vers le backend (4000)
├── tailwind.config.js      # Thème (couleurs via variables CSS, dark mode)
├── index.html              # Page d'entrée (titre "Chat")
├── .env                    # Configuration (NE PAS committer)
├── src/
│   ├── main.jsx            # Point d'entrée (BrowserRouter + App)
│   ├── App.jsx             # Routes (/login, /register, /) + CallManager global
│   ├── api/                # http.js (axios + refresh token), socket.js (Socket.IO)
│   ├── features/           # auth, chat, group, call (WebRTC)
│   ├── store/              # Stores Zustand
│   └── styles/tokens.css   # Variables CSS (couleurs)
```

## Prérequis

| Outil  | Version | Rôle                    |
| ------ | ------- | ----------------------- |
| Node.js | 18+   | Exécution du frontend   |
| npm    | 9+      | Gestion des dépendances |
| Backend | —     | API sur `https://localhost:4000` |
| Certificats | —    | `../certs/dev-cert.pem` + `dev-key.pem` (HTTPS) |

> Le frontend **ne marche pas sans le backend démarré** : toutes les requêtes
> `/api`, `/uploads` et `/socket.io` sont proxysées vers `https://localhost:4000`.
> Démarre d'abord le backend (voir `Backend-chat/README.md`).

## Démarrage pas à pas

Toutes les commandes s'exécutent depuis le dossier `Front-chat/`.

### 1. Créer le fichier `.env`

```bash
copy .env.example .env
```

Puis ajuster selon le mode souhaité :

- **Mode proxy (recommandé, utilisé actuellement)** : mêmes origines, pas de problème
  de certificat ni de contenu mixte.

  ```env
  VITE_API_URL="/api"
  VITE_SOCKET_URL=""
  VITE_UPLOAD_MAX_SIZE_MB=15
  ```

- **Mode connexion directe** (défaut du `.env.example`) : le frontend appelle
  directement le backend sur son origine.

  ```env
  VITE_API_URL="http://localhost:4000/api"
  VITE_SOCKET_URL="http://localhost:4000"
  VITE_UPLOAD_MAX_SIZE_MB=15
  ```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Démarrer le backend

Le backend doit écouter sur `https://localhost:4000` (voir `Backend-chat/README.md`) :

```bash
cd ../Backend-chat
npm run dev
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

Le frontend est servi sur **https://localhost:5173/** (HTTP seul si les fichiers
`../certs/dev-cert.pem` et `../certs/dev-key.pem` n'existent pas).

### 5. Vérifier

Ouvrir https://localhost:5173/ → créer un compte ou se connecter.

> Si le navigateur affiche une alerte de certificat, c'est normal : ce sont des
> certificats de développement (mkcert). Ajouter l'exception ou installer la CA
> racine `certs/mkcert-rootCA.pem`.

## Fonctionnement du proxy

Reprenant `vite.config.js`, le serveur Vite redirige vers le backend :

| Chemin      | Cible                     | Type      |
| ----------- | ------------------------- | --------- |
| `/api`      | `https://localhost:4000`  | HTTP      |
| `/uploads`  | `https://localhost:4000`  | HTTP      |
| `/socket.io`| `https://localhost:4000`  | WebSocket (`ws: true`) |

Toutes les entrées utilisent `secure: false` car le certificat backend est auto-signé (mkcert).

## Liste de contrôle — « le frontend ne se lance pas / ne charge pas »

| Symptôme                              | Cause probable                              | Solution                                        |
| ------------------------------------- | ------------------------------------------- | ----------------------------------------------- |
| `ECONNREFUSED` / `ECONNRESET` sur `/socket.io` ou `/api` | Backend arrêté | Démarrer le backend (`../Backend-chat`, `npm run dev`) |
| Page en HTTP au lieu de HTTPS         | Certificats absents dans `../certs/`         | Regénérer les certs mkcert               |
| Erreur 401 permanente                 | Session expirée / jeton invalide             | Se reconnecter                             |
| CORS bloqué                            | `CLIENT_ORIGIN` du backend ne contient pas l'origine | Ajouter l'origine dans `Backend-chat/.env` et redémarrer |
| Connexion WebSocket refusée           | Proxy `/socket.io` non accessible ou backend down | Vérifier backend + port 4000     |

## Ports

| Port   | Service                          |
| ------ | -------------------------------- |
| 5173   | Frontend Vite (dev)              |
| 4000   | Backend HTTPS + Socket.IO        |

## Scripts npm

| Commande          | Description                               |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Lance Vite en développement (port 5173)   |
| `npm run build`   | Build de production dans `dist/`          |
| `npm run preview` | Prévisualise le build de production       |

## Ce que voit le navigateur

- `/login` → page de connexion
- `/register` → création de compte
- `/` → application de chat (route protégée, redirige vers `/login` si non connecté)
- Gestionnaire d'appels (WebRTC) monté globalement quand un utilisateur est connecté.