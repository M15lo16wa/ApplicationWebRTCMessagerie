# Backend-chat

API de messagerie temps réel (chat, présence, appels, signalisation WebRTC) pour l'application de chat.

- **Framework** : Node.js + Express 4 + Socket.IO
- **Base de données** : PostgreSQL via Prisma 5
- **Stockage fichiers** : MinIO (S3-compatible)
- **Authentification** : JWT (access + refresh) + bcrypt

## Architecture

```
Backend-chat/
├── docker-compose.yml      # MinIO (stockage fichiers)
├── prisma/
│   ├── schema.prisma       # Modèle de données
│   └── migrations/         # Migrations Prisma
├── src/
│   ├── index.js            # Point d'entrée (app bootstrap)
│   ├── config/env.js       # Validation des variables d'environnement
│   ├── lib/prisma.js       # Client Prisma
│   ├── middlewares/        # auth, error
│   ├── sockets/            # Socket.IO (chat, présence, signaling)
│   └── modules/            # auth, users, conversations, messages, files, calls, contacts
└── .env                    # Configuration (NE PAS committer)
```

## Prérequis

| Outil        | Version minimale | Rôle                                    |
| ------------ | ---------------- | --------------------------------------- |
| Node.js      | 18+              | Exécution du backend                    |
| npm          | 9+               | Gestion des dépendances                 |
| Docker       | —                | Démarre MinIO (stockage fichiers)       |
| PostgreSQL   | 14+              | Installé **localement** (port 5432)     |

> **Important** : ce projet utilise un **PostgreSQL local** (service Windows ou autre),
> pas un conteneur Docker. Le `docker-compose.yml` ne fournit que MinIO.
> Sans PostgreSQL opérationnel sur `localhost:5432`, les migrations échouent
> et le backend ne se lance pas.

## Démarrage pas à pas

Toutes les commandes s'exécutent depuis le dossier `Backend-chat/`.

### 1. Créer le fichier `.env`

```bash
copy .env.example .env
```

Puis adapter les valeurs dans `.env`, surtout `DATABASE_URL` :

```env
DATABASE_URL="postgresql://<UTILISATEUR>:<MOT_DE_PASSE>@localhost:5432/ChatPublic"
```

Les 3 variables obligatoires sont : `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`.
Sans elles, le backend refuse de démarrer (`Variable d'environnement manquante`).

### 2. S'assurer que PostgreSQL tourne et que la base existe

Vérifier que le service PostgreSQL est démarré puis créer la base de données si besoin :

```bash
psql -U <UTILISATEUR> -c "CREATE DATABASE \"ChatPublic\";"
```

### 3. Installer les dépendances

```bash
npm install
```

### 4. Démarrer Docker Compose (MinIO)

```bash
docker compose up -d
```

Vérifier que MinIO répond : console web sur http://localhost:9001 (minioadmin / minioadmin).

> `npm run dev` exécute automatiquement `docker compose up -d` (script `predev`)
> avant de lancer le serveur. Mais pour `npm start`, il faut le faire manuellement.

### 5. Appliquer les migrations Prisma

⚠️ PostgreSQL doit être démarré **avant** cette étape. Sans base accessible, les
migrations échouent et le backend plante ensuite.

```bash
npm run prisma:migrate    # = prisma migrate dev
npm run prisma:generate   # = prisma generate (regénère le client)
```

### 6. Lancer le backend

```bash
npm run dev     # développement : nodemon (reload auto) + docker compose up -d automatique
```

ou en mode production :

```bash
npm start       # node src/index.js (penser à `docker compose up -d` avant)
```

Le serveur démarre sur **https://localhost:4000** (HTTP seul si les fichiers
`../certs/dev-cert.pem` et `../certs/dev-key.pem` n'existent pas).

### 7. Vérifier que tout fonctionne

```bash
curl https://localhost:4000/health
# => {"status":"ok"}
```

## Liste de contrôle — « le backend ne se lance pas »

| Symptôme                              | Cause probable                              | Solution                                        |
| ------------------------------------- | ------------------------------------------- | ----------------------------------------------- |
| `Variable d'environnement manquante`  | `.env` absent ou incomplet                  | Refaire l'étape 1                               |
| `PrismaClientInitializationError`     | PostgreSQL arrêté ou base inconnue          | Démarrer le service PostgreSQL + créer `ChatPublic` |
| `table "..." does not exist`          | Migrations non appliquées                   | Refaire l'étape 5 (`npm run prisma:migrate`)    |
| Erreur de connexion MinIO / port 9000 | MinIO pas démarré                           | `docker compose up -d`                          |
| CORS bloqué côté front                 | `CLIENT_ORIGIN` ne contient pas l'origine   | Ajouter l'origine dans `.env`                   |

## Ports

| Port   | Service                          |
| ------ | -------------------------------- |
| 4000   | Backend HTTPS + Socket.IO        |
| 5173   | Frontend Vite (proxy `/api`, `/uploads`, `/socket.io`) |
| 5432   | PostgreSQL (local)               |
| 9000   | MinIO API                        |
| 9001   | MinIO console                    |

## Scripts npm

| Commande                | Description                                    |
| ----------------------- | ---------------------------------------------- |
| `npm run dev`           | `docker compose up -d` (predev) + nodemon       |
| `npm start`             | Lance `node src/index.js` directement           |
| `npm run prisma:migrate`| Applique les migrations (`prisma migrate dev`)  |
| `npm run prisma:generate`| Regénère le client Prisma                       |
| `npm run prisma:studio` | Ouvre l'interface de gestion de la base         |

## Réseau Socket.IO

La partie temps réel est transportée par Socket.IO attaché au même serveur HTTP(S) :

- messages (événements chat),
- présence (online / offline),
- signalisation WebRTC (offre, réponse, ICE pour les appels).