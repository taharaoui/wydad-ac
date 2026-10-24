# CMS Supabase et administration `/admin`

Ce document décrit comment le contenu du site est stocké dans Supabase, comment l'activer et comment l'administrer.

## Architecture

| Couche | Rôle |
|---|---|
| `supabase/migrations/` | Schéma SQL versionné : tables, contraintes, RLS, buckets Storage, fonction `media_usage`. |
| `supabase/seed.sql` | Import du contenu actuellement intégré au code. Il est généré par `apps/web/scripts/seed.ts` et peut être rejoué sans risque. |
| `apps/web/src/lib/supabase/` | Clients Supabase : public (anonyme, mis en cache), session admin (cookies httpOnly) et service role (scripts uniquement). |
| `apps/web/src/lib/cms/` | Lecteurs typés utilisés par les pages publiques. Chacun retombe sur le contenu intégré si Supabase n'est pas actif ou ne répond pas. |
| `apps/web/src/lib/admin/` | Définition des modules de l'admin, validation serveur et contrôle d'accès. |
| `apps/web/src/app/admin/` | Interface d'administration : connexion, tableau de bord, modules, médiathèque et aperçu. |

### Ce qui reste hors de Supabase, volontairement

- **Football de l'équipe première** (matchs, résultats, classement, effectif de Botola). Ces données viennent en direct de TheStatsAPI. Les copier créerait deux sources contradictoires. L'admin peut seulement les compléter :
  - `match_notes` : arbitres, buteurs manquants, lieu, résumé vidéo ;
  - `players.external_id` : remplacer la photo d'un joueur.
- **Flux externes** : vidéos YouTube, posts Instagram, catalogue de la boutique et billetterie. Ils sont lus en direct sur les sources officielles.
- **Textes d'interface et constantes techniques** (libellés des boutons, couleurs, configuration) : ils restent dans `messages/*.json` et dans le code.

## Tables

| Module admin | Table | Utilisée par |
|---|---|---|
| Actualités, Catégories | `news_articles`, `categories` | Accueil (hero, actualités), `/news`, `/news/[slug]` avec son SEO, recherche |
| Pages | `pages` | `/p/[slug]` : blocs intertitre, paragraphe, citation, image (aucun HTML libre) |
| Galeries | `galleries`, `gallery_items` | Galerie du staff (`staff-first-team`), archives de la natation (`swimming-archives`) |
| À la une des sections | `section_highlights` | Pages Natation, Boxe, Escrime, Handball, Féminines, School, Basket |
| Bandeau d'annonce | `announcements` | Bandeau en haut du site, affiché pendant ses dates |
| Staff | `staff_members` | `/team/staff`, l'entraîneur principal étant mis en avant |
| Joueurs | `players` | Photos des joueurs TheStatsAPI ; effectifs hors Botola |
| Matchs (hors Botola) | `matches`, `competitions`, `teams` | Basket : calendrier de l'accueil et page Basket, avec la billetterie |
| Classements (hors Botola) | `standings` | Classements saisis à la main |
| Notes de match | `match_notes` | Centre de match : arbitres, buteurs, lieu, résumé |
| Abonnements | `membership_offers` | Page Gold Membership : prix, avantages, lien d'adhésion |
| Menus | `navigation_items` | Menu latéral, barre du haut, colonnes du pied de page |
| Page d'accueil | `home_sections` | Ordre, visibilité et titre des sections de l'accueil |
| Paramètres du site | `site_settings` (une ligne) | Réseaux sociaux, partenaires, SEO par défaut, identité |
| Médiathèque | `media` + Storage | Métadonnées des fichiers importés |
| — | `admin_users` | Liste des administrateurs |

Conventions :
- Les textes traduits sont stockés en `jsonb` `{ "ar", "fr", "en" }`, validés par la contrainte `is_l10n`.
- Les contenus publiables ont un `status` : `draft`, `published` ou `archived`.
- Les URL utilisent des `slug` uniques.
- `updated_at` est mis à jour par un trigger.
- Les clés étrangères sont en `restrict` : on ne peut pas supprimer une catégorie qui a encore des articles.

## Sécurité

- **Authentification** par Supabase Auth (e-mail et mot de passe), avec une session en cookies httpOnly rafraîchie par le middleware.
- **Rôle administrateur** : un utilisateur est administrateur seulement s'il figure dans `admin_users`. L'inscription ne donne aucun droit.
  - Cette table n'a aucune politique d'écriture : ni un visiteur ni un administrateur ne peut s'y ajouter via l'API.
  - On l'alimente uniquement par `npm run admin:grant` ou depuis l'éditeur SQL.
- **Trois contrôles successifs** :
  1. Le middleware redirige vers la page de connexion toute requête sans session.
  2. Chaque page et chaque action serveur revérifie l'utilisateur (`getUser`) et `is_admin()`.
  3. RLS revérifie dans la base à chaque écriture.
- **RLS activée sur toutes les tables.** Le public ne lit que :
  - les contenus `published` (et dont la date est passée pour les articles) ;
  - les menus visibles ;
  - les annonces actives dans leurs dates.

  Seuls les administrateurs écrivent, et eux seuls lisent les brouillons et la table `media`.
- **Validation serveur** de chaque formulaire (`lib/admin/validate.ts`) : types, longueurs, formats, options autorisées. Les liens `javascript:`, `data:` et `//` sont refusés, et chaque élément des listes répétables est validé.
- **Uploads** :
  - formats JPEG, PNG, WebP et AVIF reconnus par leur signature binaire, pas seulement par l'extension ;
  - SVG accepté uniquement pour les logos, et refusé s'il contient du script ;
  - 8 Mo maximum, limite également fixée sur les buckets.
- **Suppression d'un média** : elle est refusée tant que le fichier est encore utilisé (fonction `media_usage`).
- **Clé `SUPABASE_SERVICE_ROLE_KEY`** : jamais préfixée `NEXT_PUBLIC_` ni importée côté client. Elle n'est pas nécessaire sur Vercel.

## Storage

Il y a quatre buckets publics en lecture : `site-assets` (logos, visuels), `news`, `people` (joueurs et staff) et `galleries`. Seuls les administrateurs peuvent y importer, remplacer ou supprimer des fichiers. Les tables stockent l'URL publique, jamais le fichier lui-même.

## Mise en service

1. **Créer le projet** sur https://supabase.com/dashboard (région Europe, par exemple Frankfurt).
2. **Renseigner `apps/web/.env.local`** (voir `.env.example`) :
   - `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Project Settings › API ;
   - `SUPABASE_DB_URL` : Project Settings › Database › Connection string › URI, en mode « Session pooler ».
3. **Appliquer les migrations** :
   ```bash
   npm run db:migrate -w apps/web
   ```
4. **Importer le contenu actuel** (on peut le relancer sans risque) :
   ```bash
   npm run db:seed:build -w apps/web   # régénère supabase/seed.sql depuis le code
   npm run db:seed -w apps/web
   ```
5. **Créer le premier administrateur** :
   - Dans Authentication › Users › Add user, cocher « Auto Confirm User » et choisir un mot de passe fort.
   - Puis lancer :
     ```bash
     npm run admin:grant -w apps/web -- prenom.nom@exemple.ma
     ```
6. **Tester** : `npm run dev`, puis se connecter sur http://localhost:3000/admin.
7. **Vérifier l'import** avec `npm run db:status -w apps/web`, puis activer la lecture publique :
   - ajouter `CMS_SOURCE=supabase` dans `.env.local` ;
   - contrôler que les pages publiques sont identiques.
8. **Mettre en production sur Vercel** (Settings › Environment Variables), puis redéployer :
   - `NEXT_PUBLIC_SUPABASE_URL` ;
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ;
   - `CMS_SOURCE=supabase`.
9. **Sécuriser l'authentification**, dans Authentication › Providers › Email :
   - désactiver les inscriptions publiques (« Allow new users to sign up ») ;
   - activer la protection des mots de passe divulgués si elle est disponible.

Tant que `CMS_SOURCE` n'est pas défini, le site public garde le contenu intégré au code. Connecter Supabase n'affiche donc jamais un site vide. L'admin, lui, fonctionne dès que l'URL et la clé sont renseignées.

## Commandes

| Commande (`-w apps/web`) | Effet |
|---|---|
| `npm run db:migrate` | Applique les migrations non encore appliquées (suivies dans `supabase_migrations.schema_migrations`, comme le CLI Supabase). |
| `npm run db:seed:build` | Régénère `supabase/seed.sql` depuis le contenu du code. |
| `npm run db:seed` | Importe `seed.sql`. Une ligne déjà présente n'est ni dupliquée ni écrasée. |
| `npm run db:status` | Affiche les migrations appliquées, le nombre d'administrateurs et le nombre de lignes. |
| `npm run admin:grant -- <email>` / `node scripts/db.mjs revoke-admin <email>` | Donne ou retire le rôle administrateur. |
| `npm run db:types` | Régénère `src/types/database.ts` depuis les migrations (équivalent de `supabase gen types`). |
| `npm run test:db` | Teste les migrations, RLS, `media_usage` et l'import sur un Postgres en mémoire (PGlite). |
| `npm run test:unit` | Teste la validation serveur des formulaires. |

## Mise à jour du site après une modification

Chaque enregistrement ou suppression dans l'admin invalide le tag de cache `cms` et le layout. Les pages publiques affichent la nouvelle version à la visite suivante, sans redéploiement. Sans action de l'admin, le cache se renouvelle au plus tard toutes les 5 minutes.
