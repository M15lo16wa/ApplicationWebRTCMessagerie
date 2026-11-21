# Application Web RTC Messagerie

Application web de messagerie en temps réel inspirée de WhatsApp. Elle combine chat instantané, partage de fichiers, présence des utilisateurs, appels audio et appels vidéo via WebRTC.

## Fonctionnalités

- Inscription, connexion et renouvellement des sessions JWT
- Conversations individuelles
- Conversations de groupe
- Envoi de messages en temps réel avec Socket.IO
- Indication de présence des utilisateurs
- Appels audio et vidéo avec WebRTC
- Gestion des contacts
- Upload de fichiers via MinIO
- Interface responsive avec React et Tailwind CSS
- Certificats HTTPS pour le développement local

## Technologies

| Partie | Technologies |
| --- | --- |
| Frontend | React 18, Vite 6, Tailwind CSS 3, Zustand, Socket.IO Client, Axios |
| Backend | Node.js, Express 4, Socket.IO, Prisma 5, PostgreSQL |
| Authentification | JWT access/refresh, bcrypt |
| Stockage | MinIO compatible S3 |
| Temps réel | WebSockets et WebRTC |

## Structure du projet

```text
ApplicationWebRTCMessagerie/
├── Backend-chat/       # API REST, Socket.IO, Prisma et stockage
├── Front-chat/         # Interface React + Vite
├── certs/              # Certificats HTTPS locaux (non versionnés)
└── README.md           # Documentation principale
```

## Architecture

```text
Navigateur React
      │
      ├── API REST ──────────> Express / JWT
      ├── Socket.IO ─────────> Messages, présence, signalisation
      └── WebRTC ─────────────> Flux audio / vidéo directs
                                  │
                         PostgreSQL + MinIO
```

## Prérequis

- Node.js 18 ou supérieur
- npm 9 ou supérieur
- PostgreSQL 14 ou supérieur
- Docker avec Docker Compose
- Git

> PostgreSQL doit être installé localement. Docker Compose démarre uniquement MinIO ; PostgreSQL ne tourne pas dans un conteneur Docker dans la configuration actuelle.

## Installation rapide

### 1. Cloner le dépôt

```bash
git clone https://github.com/M15lo16wa/ApplicationWebRTCMessagerie.git
cd ApplicationWebRTCMessagerie
```

### 2. Configurer le backend

```bash
cd Backend-chat
copy .env.example .env
npm install
```

Modifiez ensuite `Backend-chat/.env` et configurez au minimum :

```env
DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/ChatPublic"
JWT_ACCESS_SECRET="votre-secret-acces"
JWT_REFRESH_SECRET="votre-secret-refresh"
CLIENT_ORIGIN="http://localhost:5173"
```

Créez la base PostgreSQL si nécessaire :

```bash
psql -U utilisateur -c "CREATE DATABASE \"ChatPublic\";"
```

### 3. Initialiser la base de données

Depuis le dossier `Backend-chat` :

```bash
npm run prisma:migrate
npm run prisma:generate
```

### 4. Configurer le frontend

Dans un autre terminal :

```bash
cd Front-chat
copy .env.example .env
npm install
```

Pour le fonctionnement avec le proxy Vite recommandé :

```env
VITE_API_URL="/api"
VITE_SOCKET_URL=""
VITE_UPLOAD_MAX_SIZE_MB=15
```

## Démarrage

### Démarrer le backend

Depuis `Backend-chat` :

```bash
npm run dev
```

Cette commande lance également MinIO avec Docker Compose et démarre le backend sur `https://localhost:4000` lorsqu'un certificat est disponible.

Le backend peut démarrer en HTTP sur `http://localhost:4000` si les certificats HTTPS locaux sont absents.

### Démarrer le frontend

Depuis `Front-chat` :

```bash
npm run dev
```

Ouvrez ensuite `https://localhost:5173` ou `http://localhost:5173` selon la configuration HTTPS.

## Ports locaux

| Port | Service |
| ---: | --- |
| 4000 | API Express, Socket.IO et serveur HTTPS |
| 5173 | Application React Vite |
| 5432 | PostgreSQL local |
| 9000 | API MinIO |
| 9001 | Console d'administration MinIO |

## HTTPS en développement

Le projet peut utiliser les certificats suivants :

```text
certs/dev-cert.pem
certs/dev-key.pem
```

Ces certificats ne sont pas inclus dans le dépôt. Vous pouvez les générer avec `mkcert` :

```bash
mkcert -install
mkcert -key-file certs/dev-key.pem -cert-file certs/dev-cert.pem localhost 127.0.0.1 ::1
```

Redémarrez ensuite le backend et le frontend.

## Vérification

Vérifiez que l'API répond :

```bash
curl https://localhost:4000/health
```

Réponse attendue :

```json
{"status":"ok"}
```

## Dépannage

| Problème | Vérifications |
| --- | --- |
| Erreur PostgreSQL | Vérifiez que PostgreSQL est démarré et que `ChatPublic` existe |
| Migrations impossibles | Vérifiez `DATABASE_URL`, puis lancez `npm run prisma:migrate` |
| MinIO indisponible | Lancez `docker compose up -d` depuis `Backend-chat` |
| Frontend sans backend | Démarrez le backend avant le frontend |
| Erreur CORS | Ajoutez l'origine frontend à `CLIENT_ORIGIN` dans `.env` |
| Alerte de certificat | Installez la CA racine avec `mkcert -install` |
| WebSocket refusé | Vérifiez les ports 4000/5173 et la configuration du proxy Vite |

## Documentation détaillée

- [Documentation du backend](./Backend-chat/README.md)
- [Documentation du frontend](./Front-chat/README.md)

## Scripts utiles

Backend :

```bash
npm run dev                # Développement avec redémarrage automatique
npm run start              # Démarrage normal
npm run prisma:migrate     # Appliquer les migrations
npm run prisma:generate    # Générer le client Prisma
npm run prisma:studio      # Ouvrir Prisma Studio
```

Frontend :

```bash
npm run dev                # Serveur de développement
npm run build              # Build de production
npm run preview            # Prévisualiser le build
```

## Licence

Aucune licence n'est actuellement définie pour ce dépôt.