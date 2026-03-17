# Meet Space

Plateforme SaaS de gestion et de reservation d'espaces professionnels (coworking, bureaux prives, salles de reunion, salles de conference, etc.). Developpee lors du hackathon organise par InCharge Madagascar et Vahatra Center.

---

## Table des matieres

- [Presentation du projet](#presentation-du-projet)
- [Fonctionnalites](#fonctionnalites)
- [Stack technique](#stack-technique)
- [Architecture du projet](#architecture-du-projet)
- [Schema de la base de donnees](#schema-de-la-base-de-donnees)
- [Prerequis](#prerequis)
- [Guide d'installation](#guide-dinstallation)
- [Configuration](#configuration)
- [Lancement](#lancement)
- [Structure des routes API](#structure-des-routes-api)
- [Roles et permissions](#roles-et-permissions)
- [Equipe](#equipe)

---

## Presentation du projet

Meet Space est une solution web complete permettant aux entreprises de gerer leurs espaces de travail (salles de reunion, bureaux prives, postes de coworking, etc.) et aux clients de rechercher, consulter et reserver ces espaces en ligne.

La plateforme offre un systeme multi-entreprises ou chaque entreprise peut enregistrer ses propres ressources, definir ses tarifs (a l'heure, a la journee, a la semaine, au mois ou a l'annee), et gerer les reservations de ses clients. Un panier et un systeme de paiement en ligne via Stripe sont integres pour finaliser les reservations.

---

## Fonctionnalites

### MVP (indispensable)

- **Gestion des comptes et roles** : Admin, Manager, Employe, Client
- **Authentification** : inscription et connexion par email/mot de passe, gestion des sessions via JWT (access token + refresh token en cookies HttpOnly)
- **Catalogue de ressources** : salles, bureaux, espaces de coworking avec nom, description, capacite, equipements, photos et tarifs personnalises
- **Reservation** : selection de la ressource, choix du creneau (date debut / date fin), formulaire de reservation avec notes
- **Panier** : ajout de plusieurs reservations au panier, gestion des articles, calcul automatique du prix total
- **Paiement en ligne** : integration de Stripe pour le paiement securise
- **Anti-chevauchement** : verification cote serveur des conflits de creneaux sur une meme ressource (transactions atomiques)
- **Gestion multi-entreprises** : chaque entreprise possede ses propres ressources, types de ressources et tarifs
- **Notifications par email** : envoi d'emails de confirmation, rappel et annulation via Nodemailer (SMTP Gmail)
- **Generation de recus** : generation de documents PDF via PDFKit
- **Panneau d'administration** : interface dediee accessible a `/manage` pour la gestion des ressources, reservations et utilisateurs
- **Geolocalisation** : affichage des ressources sur une carte interactive via Leaflet
- **Tableaux de bord** : graphiques et statistiques via Recharts
- **Theme clair/sombre** : support du mode clair et sombre via next-themes

---

## Stack technique

### Frontend

| Technologie | Version | Role |
|---|---|---|
| Next.js | 15.5 | Framework React avec SSR, routing App Router et Turbopack |
| React | 19.1 | Bibliotheque UI |
| TypeScript | 5.x | Typage statique |
| TailwindCSS | 4.x | Framework CSS utilitaire |
| shadcn/ui (Radix UI) | -- | Composants UI accessibles (Dialog, Select, Tabs, Tooltip, etc.) |
| Zustand | 5.x | Gestion d'etat global (authentification, panier, ressources) |
| Framer Motion | 12.x | Animations et transitions |
| React Hook Form + Zod | 7.x / 4.x | Formulaires avec validation de schema |
| Recharts | 2.x | Graphiques et visualisations de donnees |
| Leaflet + React Leaflet | 1.9 / 5.0 | Cartes interactives et geolocalisation |
| Sonner | 2.x | Notifications toast |
| date-fns | 4.x | Manipulation des dates |
| Embla Carousel | 8.x | Carrousel d'images |
| jsPDF | 3.x | Generation de PDF cote client |

### Backend

| Technologie | Version | Role |
|---|---|---|
| Node.js | -- | Environnement d'execution |
| Express | 5.1 | Framework HTTP / API REST |
| MySQL / MariaDB | 11.6+ | Base de donnees relationnelle |
| mysql2 | 3.x | Driver MySQL pour Node.js |
| JWT (jsonwebtoken) | 9.x | Authentification par tokens |
| bcrypt | 6.x | Hachage des mots de passe |
| Passport + passport-jwt | 0.7 / 4.x | Strategie d'authentification |
| Stripe | 18.x | Paiement en ligne |
| Nodemailer | 7.x | Envoi d'emails |
| Multer | 2.x | Upload de fichiers (photos des ressources) |
| Sharp | 0.34 | Traitement et optimisation d'images |
| PDFKit | 0.17 | Generation de recus PDF |
| Winston | 3.x | Journalisation (logging) |
| Helmet | 8.x | En-tetes de securite HTTP |
| Morgan | 1.x | Logging des requetes HTTP (dev) |
| Nodemon | 3.x | Rechargement automatique en developpement |

---

## Architecture du projet

Le projet suit une architecture client-serveur classique avec separation complete du frontend et du backend.

```
Hackathon-RedShalk/
|
|-- backend/                    # API REST (Node.js / Express)
|   |-- config/
|   |   |-- db.config.js        # Configuration du pool de connexion MySQL
|   |-- controller/
|   |   |-- auth.controller.js        # Inscription, connexion, gestion des tokens
|   |   |-- reservation.controller.js # CRUD reservations, detection de chevauchements
|   |   |-- ressources.controller.js  # CRUD ressources, photos, tarifs
|   |   |-- cart.controller.js        # Gestion du panier
|   |   |-- paiement.controller.js    # Integration Stripe, creation de paiements
|   |   |-- achat.controller.js       # Finalisation des achats
|   |   |-- role.controller.js        # Liste des roles
|   |   |-- type.controller.js        # CRUD types de ressources
|   |   |-- panier.controller.js      # Logique panier (alternative)
|   |-- db/
|   |   |-- connectDB.js        # Connexion a la base de donnees
|   |   |-- vahatra_center.sql  # Schema initial de la base
|   |   |-- dump.sql            # Dump complet avec donnees de demonstration
|   |-- middleware/
|   |   |-- auth.js             # Verification du token JWT
|   |   |-- authenticate.js     # Middleware d'authentification
|   |   |-- checkReservation.js # Validation des donnees de reservation
|   |   |-- checksignup.js      # Validation des donnees d'inscription
|   |   |-- reservationAuth.js  # Autorisation specifique aux reservations
|   |-- routes/
|   |   |-- auth.routes.js      # Routes d'authentification
|   |   |-- reservation.routes.js
|   |   |-- ressources.routes.js
|   |   |-- cart.routes.js
|   |   |-- achat.routes.js
|   |   |-- paiement.routes.js
|   |   |-- companies.routes.js
|   |   |-- role.routes.js
|   |   |-- type.routes.js
|   |   |-- validation.routes.js
|   |-- server.js               # Point d'entree de l'application
|   |-- .env                    # Variables d'environnement
|   |-- package.json
|
|-- frontend/                   # Application Next.js
|   |-- src/
|   |   |-- app/
|   |   |   |-- layout.tsx      # Layout racine (theme, session, navigation)
|   |   |   |-- page.tsx        # Page d'accueil
|   |   |   |-- globals.css     # Styles globaux et tokens TailwindCSS
|   |   |   |-- sign-in/        # Page de connexion
|   |   |   |-- sign-up/        # Page d'inscription
|   |   |   |-- ressources/     # Catalogue et details des ressources
|   |   |   |-- manage/         # Panneau d'administration
|   |   |   |-- checkout/       # Processus de paiement
|   |   |-- components/
|   |   |   |-- ui/             # Composants shadcn/ui (Button, Dialog, Card, etc.)
|   |   |   |-- navigation/     # Barre de navigation
|   |   |   |-- container/      # Composants de mise en page (Wrapper)
|   |   |   |-- design/         # Composants de design specifiques
|   |   |   |-- session-provider.tsx  # Fournisseur de session utilisateur
|   |   |   |-- themes-provider.tsx   # Fournisseur de theme (clair/sombre)
|   |   |-- stores/
|   |   |   |-- useAuthStore.ts   # Store Zustand pour l'authentification
|   |   |   |-- cartStore.ts     # Store Zustand pour le panier
|   |   |   |-- roomsStore.ts    # Store Zustand pour les ressources
|   |   |-- hooks/
|   |   |   |-- use-mobile.ts        # Detection du mode mobile
|   |   |   |-- useInfiniteRooms.ts  # Chargement infini des ressources
|   |   |   |-- useUserLocator.ts    # Geolocalisation de l'utilisateur
|   |   |-- types/
|   |   |   |-- room.ts         # Types TypeScript pour les ressources
|   |   |   |-- types.tsx       # Types communs
|   |   |-- lib/                # Utilitaires
|   |   |-- middleware.ts       # Middleware Next.js (protection des routes)
|   |-- public/                 # Assets statiques
|   |-- .env                    # Variables d'environnement frontend
|   |-- package.json
|   |-- tsconfig.json
|   |-- next.config.ts
|   |-- components.json         # Configuration shadcn/ui
|
|-- Fonctionnalites.txt         # Liste des fonctionnalites planifiees
|-- Cas_utilisation.drawio       # Diagramme de cas d'utilisation
```

### Flux de communication

```
Client (navigateur)
    |
    v
Frontend Next.js (port 3000)
    |  requetes HTTP vers l'API
    v
Backend Express (port 8000)
    |  requetes SQL
    v
MySQL / MariaDB (port 3306)
```

- Le frontend communique avec le backend via des appels HTTP a `http://localhost:8000/api`
- L'authentification repose sur des tokens JWT stockes dans des cookies HttpOnly
- Le middleware Next.js protege les routes `/manage`, `/ressources` et `/reservations` (redirection vers `/sign-in` si non authentifie)
- Les routes `/sign-in` et `/sign-up` sont inaccessibles si l'utilisateur est deja connecte

---

## Schema de la base de donnees

La base de donnees `vahatra_center` est composee des tables suivantes :

| Table | Description |
|---|---|
| `users` | Utilisateurs (nom, email, mot de passe, role, entreprise) |
| `roles` | Roles disponibles (admin, manager, employe, client) |
| `companies` | Entreprises (nom, manager, coordonnees, adresse) |
| `ressources` | Espaces reservables (nom, description, capacite, localisation, coordonnees GPS, statut) |
| `ressource_types` | Categories de ressources (salle de reunion, bureau prive, coworking, etc.) |
| `ressource_photos` | Photos associees aux ressources |
| `tarifs` | Grille tarifaire par ressource (horaire, journalier, hebdomadaire, mensuel, annuel) |
| `reservations` | Reservations (ressource, utilisateur, dates, statut, prix, notes) |
| `carts` | Paniers des utilisateurs |
| `cart_items` | Articles dans les paniers (ressource, dates, prix) |
| `payments` | Paiements Stripe (montant, statut, identifiant Stripe) |

### Relations principales

- Un utilisateur appartient a une entreprise (`users.company_id` -> `companies.id`)
- Une ressource appartient a une entreprise et possede un type (`ressources.company_id`, `ressources.type_id`)
- Chaque ressource peut avoir plusieurs photos (`ressource_photos`) et un tarif associe (`tarifs`)
- Une reservation lie un utilisateur a une ressource avec des dates et un statut
- Un panier appartient a un utilisateur et contient des articles lies a des ressources

---

## Prerequis

Avant de commencer, assurez-vous d'avoir installe les outils suivants :

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MySQL** >= 8.x ou **MariaDB** >= 11.x
- **Git**

---

## Guide d'installation

### 1. Cloner le depot

```bash
git clone https://github.com/Yonni-coder/Hackathon-RedShalk.git
cd Hackathon-RedShalk
```

### 2. Configurer la base de donnees

Connectez-vous a MySQL/MariaDB et creez la base de donnees :

```bash
mysql -u root -p
```

```sql
CREATE DATABASE IF NOT EXISTS vahatra_center
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Importez le dump complet (schema + donnees de demonstration) :

```bash
mysql -u root -p vahatra_center < backend/db/dump.sql
```

Ou, pour importer uniquement le schema sans les donnees :

```bash
mysql -u root -p vahatra_center < backend/db/vahatra_center.sql
```

### 3. Installer les dependances du backend

```bash
cd backend
npm install
```

### 4. Installer les dependances du frontend

```bash
cd ../frontend
npm install
```

---

## Configuration

### Backend (`backend/.env`)

Creez ou modifiez le fichier `backend/.env` avec vos propres informations :

```env
# Base de donnees
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=vahatra_center

# JWT
JWT_SECRET=votre_cle_secrete_jwt
JWT_REFRESH_SECRET=votre_cle_secrete_refresh
JWT_EXPIRES_IN=24h

# Serveur
PORT=8000

# SMTP (pour l'envoi d'emails)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=votre_email@gmail.com
SMTP_PASS=votre_mot_de_passe_application

# Frontend (CORS)
FRONT_URL=http://localhost:3000
```

> Pour utiliser Gmail comme serveur SMTP, vous devez generer un mot de passe d'application dans les parametres de securite de votre compte Google.

### Frontend (`frontend/.env`)

Creez ou modifiez le fichier `frontend/.env` :

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000/api
BACKEND=http://localhost:8000
```

---

## Lancement

### Demarrer le backend

```bash
cd backend
npm run dev
```

Le serveur API demarre sur `http://localhost:8000`. Le rechargement automatique est assure par Nodemon.

### Demarrer le frontend

```bash
cd frontend
npm run dev
```

L'application Next.js demarre sur `http://localhost:3000` avec Turbopack pour un rechargement rapide.

### Scripts disponibles

#### Backend

| Commande | Description |
|---|---|
| `npm run dev` | Demarrer le serveur en mode developpement (nodemon) |
| `npm run db:export` | Exporter la base de donnees vers `db/dump.sql` |
| `npm run db:import` | Importer le dump dans la base de donnees |

#### Frontend

| Commande | Description |
|---|---|
| `npm run dev` | Demarrer le serveur de developpement (Turbopack) |
| `npm run build` | Compiler l'application pour la production |
| `npm start` | Demarrer le serveur de production |

---

## Structure des routes API

Toutes les routes sont prefixees par `/api`.

| Methode | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/signup` | Inscription d'un utilisateur |
| POST | `/api/auth/login` | Connexion (retourne un token JWT) |
| GET | `/api/roles` | Liste des roles |
| GET | `/api/ressources` | Liste des ressources |
| POST | `/api/ressources` | Creer une ressource |
| PUT | `/api/ressources/:id` | Modifier une ressource |
| DELETE | `/api/ressources/:id` | Supprimer une ressource |
| GET | `/api/reservations` | Liste des reservations |
| POST | `/api/reservations` | Creer une reservation |
| PUT | `/api/reservations/:id` | Modifier une reservation |
| DELETE | `/api/reservations/:id` | Annuler une reservation |
| GET | `/api/types` | Liste des types de ressources |
| POST | `/api/types` | Creer un type de ressource |
| GET | `/api/cart` | Contenu du panier de l'utilisateur |
| POST | `/api/cart` | Ajouter un article au panier |
| DELETE | `/api/cart/:id` | Retirer un article du panier |
| POST | `/api/achat` | Finaliser un achat |
| POST | `/api/paiement` | Creer un paiement Stripe |

> Les routes protegees necessitent un token JWT valide dans les cookies HttpOnly de la requete.

---

## Roles et permissions

| Role | Droits |
|---|---|
| **Admin** | Acces complet : gestion des entreprises, des utilisateurs, des ressources et des reservations |
| **Manager** | Gestion des ressources et reservations de son entreprise |
| **Employe** | Consultation et reservation des ressources de son entreprise |
| **Client** | Recherche, consultation et reservation des ressources disponibles |

---

## Equipe

Projet realise lors du hackathon organise par **InCharge Madagascar** et **Vahatra Center**.

### Developpeurs

- **Yonni** : [github.com/yonni-Coder](https://github.com/yonni-Coder)
- **Norman** : [github.com/NormanVonizara](https://github.com/NormanVonizara)
- **Roedrino** : [github.com/Rinoh-Coder](https://github.com/Rinoh-Coder)

---

## Licence

Ce projet est sous licence ISC.
