# MR SHEIN — Paulin N'ZIAN Personal Shopper

Plateforme Full Stack professionnelle pour l'activité de Personal Shopper de Paulin N'ZIAN.

## Stack technique

- **Frontend** : Next.js 16, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend** : Next.js Server Actions
- **Base de données** : PostgreSQL + Prisma ORM
- **Authentification** : NextAuth / Auth.js (JWT)
- **Validation** : Zod + React Hook Form
- **Notifications** : Sonner (toasts)
- **PWA** : installable sur smartphone

---

## Installation

```bash
npm install
cp .env.example .env
# Éditez .env avec vos vraies valeurs
```

## Configuration PostgreSQL

```sql
CREATE DATABASE mrshein;
```

Mettez votre DATABASE_URL dans .env.

## Migration et seed

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
```

Crédentiels admin créés par le seed :
- Email    : admin@mrshein.fr
- Password : Admin@2026!

**Changez ce mot de passe immédiatement en production.**

## Lancement

```bash
npm run dev
```

Site : http://localhost:3000  
Admin : http://localhost:3000/admin

## Build production

```bash
npm run build
npm start
```

## Pages publiques

| URL | Description |
|-----|-------------|
| / | Accueil |
| /boutiques | Boutiques en ligne |
| /tarifs | Taux de change & expédition |
| /suivi | Suivi de commande |
| /comment-ca-marche | Guide du service |
| /contact | Contact |

## Dashboard Admin

| URL | Description |
|-----|-------------|
| /admin/login | Connexion |
| /admin | Dashboard |
| /admin/commandes | Commandes & suivi colis |
| /admin/boutiques | Boutiques |
| /admin/tarifs | Tarifs |
| /admin/temoignages | Témoignages |
| /admin/faq | FAQ |
| /admin/messages | Messages clients |
| /admin/parametres | Paramètres du site |

## Variables d'environnement

| Variable | Description |
|----------|-------------|
| DATABASE_URL | URL PostgreSQL |
| AUTH_SECRET | Clé secrète NextAuth (min 32 chars) |
| NEXTAUTH_URL | URL complète de l'app |
| NEXT_PUBLIC_APP_URL | URL publique |

## Commandes

```bash
npm run dev           # Développement
npm run build         # Build production
npm run db:generate   # Prisma generate
npm run db:migrate    # Migration
npm run db:seed       # Seed base de données
npm run db:studio     # Prisma Studio GUI
```

## Déploiement Vercel

1. Connectez le repo à Vercel
2. Ajoutez les variables d'environnement
3. Déployez — Vercel exécute automatiquement le build

© 2026 Paulin N'ZIAN — Personal Shopper
