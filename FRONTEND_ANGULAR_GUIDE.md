# Guide d'implementation du frontend Angular

Ce document décrit comment construire une application Angular moderne pour le backend Gym Management. Les routes et contrats ci-dessous correspondent à l'API existante : utilisez Swagger (`/swagger-ui/index.html` ou `/v3/api-docs`) comme référence si le backend évolue.

## 1. Objectif et choix techniques

Construire une application de gestion de salle de sport, responsive et accessible, utilisable par les administrateurs et le personnel. Le frontend est un client REST séparé : il ne se connecte jamais directement à PostgreSQL et ne contient aucun secret serveur.

Stack recommandée :

- Angular avec composants standalone, TypeScript strict et lazy loading des pages ;
- Angular Material pour les composants accessibles (navigation, formulaires, tableaux, dialogues) et SCSS avec des variables de thème pour l'identité visuelle ;
- Reactive Forms pour les formulaires ; services HTTP typés et RxJS pour les appels réseau ; Signals peuvent servir à l'état local ou aux petits états partagés ;
- tests unitaires avec le runner Angular choisi par le projet et tests de parcours critiques avec Playwright ou Cypress.

Créer le projet dans un dépôt ou dossier frontend distinct :

```powershell
npm install -g @angular/cli
ng new gym-management-ui --standalone --routing --style=scss
cd gym-management-ui
ng add @angular/material
```

Activer `strict`, `strictTemplates` et les contrôles de qualité TypeScript dans `tsconfig`. Ne pas désactiver ces vérifications pour contourner des erreurs de typage.

## 2. Configuration locale et environnements

Définir l'URL de base dans les environnements Angular, sans y mettre de secret :

```ts
// src/environments/environment.development.ts
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8080/api',
};
```

```ts
// src/environments/environment.ts
export const environment = {
  production: true,
  apiBaseUrl: '/api',
};
```

Le backend autorise par défaut l'origine `http://localhost:4200`. Si le frontend est servi depuis une autre origine, configurez `CORS_ALLOWED_ORIGIN` côté backend. En production, privilégier un reverse proxy qui sert le frontend et relaie `/api` vers Spring Boot sur la même origine.

Lancer le backend avec PostgreSQL et ses variables locales (`DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`), puis démarrer Angular :

```powershell
ng serve --host localhost
```

## 3. Organisation conseillée

Organiser le code par fonctionnalité et garder les composants de page indépendants des détails HTTP :

```text
src/app/
  core/
    auth/                 # session, guard, état de connexion
    http/                 # interceptor, gestion commune des erreurs
    layout/               # shell, navigation, en-tête
  shared/
    components/           # confirmation, chargement, erreur, pagination
    models/               # contrats communs (PageResponse, ApiError)
  features/
    auth/                 # inscription, connexion
    dashboard/
    customers/
    packs/
    subscriptions/
    payments/
    users/                # administration
    audit/
    notifications/        # outbox, administration
  app.routes.ts
```

Déclarer les routes privées en lazy loading. Utiliser un guard pour améliorer la navigation, mais ne jamais considérer un guard comme une autorisation de sécurité : Spring Security reste la source d'autorité et renvoie `401`/`403`.

Exemple de routes :

```ts
export const routes: Routes = [
  { path: 'login', loadComponent: () => import('./features/auth/login-page.component') },
  { path: 'register', loadComponent: () => import('./features/auth/register-page.component') },
  {
    path: '',
    canActivate: [authenticatedGuard],
    loadComponent: () => import('./core/layout/app-shell.component'),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard-page.component') },
      { path: 'customers', loadChildren: () => import('./features/customers/customers.routes') },
      { path: 'packs', loadChildren: () => import('./features/packs/packs.routes') },
      { path: 'subscriptions', loadChildren: () => import('./features/subscriptions/subscriptions.routes') },
      { path: 'payments', loadChildren: () => import('./features/payments/payments.routes') },
      { path: 'admin/users', canActivate: [adminGuard], loadChildren: () => import('./features/users/users.routes') },
      { path: 'admin/audit', canActivate: [adminGuard], loadChildren: () => import('./features/audit/audit.routes') },
      { path: 'admin/notifications', canActivate: [adminGuard], loadChildren: () => import('./features/notifications/notifications.routes') },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '**', redirectTo: '' },
];
```

Adapter la syntaxe des imports à la version Angular et aux exports de composants générés.

## 4. Authentification et sécurité frontend

### Contrats d'authentification

Inscription `POST /api/auth/register` :

```json
{
  "organizationName": "Gym Exemple",
  "organizationSlug": "gym-exemple",
  "username": "admin",
  "email": "admin@example.com",
  "password": "mot-de-passe-long"
}
```

L'inscription crée une organisation et son premier compte **ADMIN**. Le rôle n'est jamais envoyé par le client.

Connexion `POST /api/auth/login` :

```json
{
  "organizationSlug": "gym-exemple",
  "username": "admin",
  "password": "mot-de-passe-long"
}
```

La réponse contient `{ "token": "...", "type": "Bearer", "role": "ADMIN" }`. Le backend n'a pas de refresh token : l'access token expire après 15 minutes par défaut.

### Session et en-têtes HTTP

Créer un `AuthService` qui garde le token et le rôle dans un état central. Un `HttpInterceptorFn` ajoute `Authorization: Bearer <token>` aux requêtes vers l'API et peut ajouter un `X-Request-ID`. Ne jamais ajouter l'en-tête d'autorisation aux appels vers un domaine externe.

Le backend ne fournit pas de cookie HttpOnly pour la session. Pour limiter l'exposition en cas de faille XSS, privilégier un token en mémoire et demander une nouvelle connexion après rechargement. Ne pas stocker le token dans `localStorage` par défaut. Si le produit choisit malgré tout une persistance navigateur, documenter explicitement le risque XSS et réduire les risques (CSP stricte, dépendances maîtrisées, pas de HTML non fiable).

Comportement recommandé :

- `401` : vider l'état de session, rediriger vers `/login` et afficher un message de session expirée ;
- `403` : conserver la session, afficher un accès refusé et ne pas boucler vers le login ;
- logout `POST /api/auth/logout` : attendre la réponse, vider la session locale et rediriger. La révocation invalide tous les tokens du compte, pas seulement l'appareil courant ;
- lors d'un changement de mot de passe ou de rôle, demander une nouvelle authentification si l'API invalide le token courant.

Le slug de l'organisation fait partie du formulaire login et peut être conservé comme préférence non sensible, mais ne constitue pas une preuve d'identité. Ne jamais envoyer `organizationId` sur les appels métier : le backend déduit le tenant du JWT.

## 5. Contrats TypeScript partagés

Définir des modèles explicites plutôt que d'utiliser `any` :

```ts
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  details: Record<string, string>;
}

export type UserRole = 'USER' | 'ADMIN';
export type SubscriptionStatus = 'SCHEDULED' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_MONEY' | 'BANK_TRANSFER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'PARTIALLY_REFUNDED' | 'REFUNDED';
```

Les montants arrivent comme nombres décimaux JSON. Éviter les calculs monétaires flottants côté UI ; garder les valeurs décimales pour affichage et envoyer des chaînes décimales telles que `"49.90"` quand un formulaire compose la requête.

## 6. Routes REST à intégrer

Toutes les routes métier requièrent `Authorization: Bearer <token>`, sauf inscription, connexion et callback de paiement.

| Fonction | API | Contrat / comportement |
|---|---|---|
| Inscription | `POST /auth/register` | Nom/slug organisation, username, email, mot de passe ; crée le premier ADMIN |
| Connexion | `POST /auth/login` | Slug organisation, username, mot de passe ; retourne access token et rôle |
| Déconnexion | `POST /auth/logout` | Révoque les tokens du compte ; réponse `204` |
| Profil courant | `GET /users/me` | Utilisateur courant |
| Modifier email profil | `PUT /users/me` | `{ "email": "..." }` |
| Changer mot de passe | `POST /users/change-password` | `{ "oldPassword": "...", "newPassword": "..." }` |
| Organisation courante | `GET /organizations/me` | Identité de l'organisation extraite du token |
| Clients | `/customers` | CRUD ; suppression logique ; page avec `q`, `lastName`, `phone`, `page`, `size`, `sort` |
| Packs | `/packs` | CRUD ; `PATCH /packs/{id}/status` avec `{ "active": true }` ; lecture accessible à tout utilisateur authentifié, mutations ADMIN |
| Abonnements | `/subscriptions` | Liste, détail, création, modification, renouvellement `POST /{id}/renew`, annulation `DELETE /{id}` |
| Abonnements d'un client | `GET /subscriptions/customer/{customerId}` | Liste paginée |
| Dashboard | `GET /statistics/dashboard` | KPI, revenu mensuel estimé et répartition par pack |
| Revenus période | `GET /statistics/revenue?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` | Valeur mensuelle estimée des abonnements démarrés dans la période |
| Revenus mensuels | `GET /statistics/revenue/monthly?...` | Série mensuelle pour graphique |
| Export CSV | `GET /statistics/export?...` | Réponse `text/csv`, télécharger comme fichier |
| Utilisateurs ADMIN | `/users` | Liste paginée, création, modification de rôle et désactivation |
| Audit ADMIN | `GET /audit` | Journal paginé de l'organisation |
| Paiements | `/payments` | Liste paginée ; création idempotente |
| Remboursements | `POST /payments/{id}/refunds` | Demande ADMIN `{ "amount": 10.00, "reason": "..." }` |
| Outbox ADMIN | `/notifications/outbox` | Liste paginée et relance `POST /{id}/retry` |

Les utilisateurs non ADMIN reçoivent `403` sur les routes d'administration. Le backend valide l'appartenance au tenant ; une ressource d'une autre organisation doit apparaître comme introuvable. Ne pas s'appuyer uniquement sur le masquage du menu.

### Pagination, tri et recherche

Les listes acceptent `page` (index à partir de 0), `size` (1 à 100 maximum) et `sort=champ,asc|desc`. La réponse est l'enveloppe `PageResponse<T>` ci-dessus. Réinitialiser `page` à zéro lors d'une nouvelle recherche ou d'un changement de filtre.

Exemples :

```text
GET /api/customers?q=marie&page=0&size=20&sort=registrationDate,desc
GET /api/packs?page=0&size=20&sort=createdAt,desc
GET /api/subscriptions?size=20&page=0&sort=startDate,desc
```

Ne proposer dans l'interface que les champs de tri supportés :

- clients : `id`, `firstName`, `lastName`, `registrationDate` ;
- offres : `id`, `offerName`, `durationMonths`, `monthlyPrice`, `createdAt` ;
- abonnements : `id`, `startDate`, `endDate`, `status` ;
- paiements : `id`, `amount`, `status`, `createdAt` ;
- utilisateurs : `id`, `username`, `email`, `createdAt`, `lastLogin` ;
- audit : `id`, `actor`, `action`, `occurredAt`.

Pour les clients, `/api/customers/search?lastName=...` est également disponible. Les filtres de `GET /api/customers` peuvent être combinés.

## 7. Écrans et parcours fonctionnels

### Shell / navigation

Créer une barre latérale adaptative avec les sections Tableau de bord, Clients, Offres, Abonnements et Paiements. Pour un ADMIN, ajouter Utilisateurs, Audit et Notifications. Sur mobile, transformer la barre en navigation latérale temporaire ou menu compact. Dans l'en-tête, afficher le nom/slug de l'organisation via `/organizations/me`, l'utilisateur courant et l'action de déconnexion.

### Dashboard

Charger `GET /statistics/dashboard` une fois à l'ouverture et afficher :

- total/actifs/nouveaux clients ;
- abonnements actifs/expirés/à échéance ;
- abonnements vendus ce mois ;
- revenu mensuel estimé ;
- distribution des souscriptions par pack.

Préciser visuellement que le revenu est une estimation des abonnements actifs, pas le montant réellement encaissé. Pour un graphique mensuel, appeler `/statistics/revenue/monthly` avec des bornes de dates explicites.

### Clients

Table responsive avec recherche, filtres, pagination serveur, tri, fiche détaillée, formulaire création/modification et confirmation avant désactivation. Un `enabled: false` signifie désactivé, pas supprimé de la base. Afficher `activeSubscription` comme information, pas comme champ modifiable.

### Offres et abonnements

Les offres incluent nom, description, durée en mois, prix mensuel et statut actif. Les offres inactives ne doivent pas être proposées pour une nouvelle souscription. Un abonnement utilise `customerId`, `packId` et `startDate` au format `YYYY-MM-DD` ; le backend calcule la date de fin et conserve un instantané du nom/prix/durée de l'offre.

Présenter les états `SCHEDULED`, `ACTIVE`, `EXPIRED`, `CANCELLED` comme badges traduits. Renouveler crée une nouvelle période historique. Annuler affiche une confirmation et ne supprime pas l'historique.

### Paiements

Le formulaire envoie `subscriptionId`, `amount`, `currency` majuscule ISO-4217, `method` et une `idempotencyKey` nouvelle par intention de paiement (par exemple `crypto.randomUUID()`). En cas de timeout ou de réponse perdue, réutiliser la même clé pour répéter exactement la même demande ; ne jamais générer une nouvelle clé pour un retry réseau.

Les méthodes prises en charge sont `CASH`, `CARD`, `MOBILE_MONEY` et `BANK_TRANSFER`. Le backend n'intègre actuellement aucun fournisseur : les méthodes électroniques restent `PENDING`. Le parcours d'espèces crée aussi un paiement en attente, puis un ADMIN le confirme via `POST /payments/{id}/cash-confirmation`. Ne pas collecter ni conserver de numéro de carte dans le frontend ou le backend.

Les demandes et validations de remboursement sont des actions ADMIN distinctes. Afficher l'état et le montant déjà remboursé, demander une confirmation, et empêcher l'utilisateur d'interpréter une demande comme un remboursement déjà exécuté.

### Administration, audit et notifications

Protéger visuellement les fonctions de gestion des comptes, des rôles et de l'outbox. La réponse d'audit peut contenir acteur, action, type/ID de ressource et date ; ne pas afficher de secrets. Dans l'outbox, afficher statut, nombre de tentatives, prochaine tentative, dernière erreur et action de relance lorsque l'état le permet.

## 8. Validation et gestion d'erreurs

Reproduire les validations du serveur pour aider l'utilisateur sans les considérer comme une garantie :

- username : 3 à 50 caractères ;
- mot de passe : 12 à 72 caractères ;
- slug d'organisation : 3 à 80 caractères, minuscules/chiffres séparés par des tirets ;
- email valide, maximum 254 caractères ;
- nom/prénom client : maximum 100 caractères ;
- téléphone client : 7 à 25 caractères parmi chiffres, espace, `+ ( ) . -` ;
- durée d'offre : 1 à 120 mois ; montant positif ou nul pour une offre, strictement positif pour un paiement.

Afficher les erreurs de champ de `ApiError.details` à proximité des contrôles, et `ApiError.message` pour les erreurs globales. Mapper les codes importants : `400` validation/requête incorrecte, `401` session invalide, `403` permission manquante, `404` ressource absente, `409` conflit métier/idempotence, `500` erreur inattendue. Ne jamais exposer une stack trace dans l'interface.

Prévoir pour chaque liste et page un état de chargement, un état vide actionnable, un état d'erreur avec bouton Réessayer, et éviter les doubles soumissions des formulaires.

## 9. Présentation et accessibilité

Définir un système de design cohérent : palette courte, typographie lisible, échelle d'espacement, rayons, ombres, états de focus/erreur, composants de badges par statut. Garder une densité adaptée aux tables administratives, mais transformer ou faire défiler horizontalement les tables sur petit écran.

Exigences de base :

- utiliser des éléments HTML sémantiques et des labels associés aux champs ;
- rendre les parcours clavier possibles, conserver un focus visible et gérer correctement les dialogues ;
- ne pas communiquer un statut uniquement par couleur ;
- viser WCAG 2.2 AA pour contrastes, focus et interaction ;
- respecter `prefers-reduced-motion` et fournir des formats de date/nombre localisés (`fr-FR` si le produit reste francophone) ;
- utiliser des notifications/toasts non intrusifs et des confirmations explicites pour les actions destructrices.

## 10. Tests frontend

Tester au minimum :

- inscription, login tenant-aware, logout, chargement du profil et expiration `401` ;
- interceptor : bearer token ajouté uniquement aux URLs de l'API ;
- guard d'authentification et affichage conditionnel ADMIN ;
- affichage, recherche, tri et pagination d'une enveloppe `PageResponse` ;
- validation de formulaires et présentation des erreurs `ApiError` ;
- création/modification/désactivation client, création d'offre et souscription ;
- réutilisation d'une clé idempotente après échec réseau d'un paiement ;
- téléchargement CSV et erreurs de réponse non-JSON.

Utiliser `HttpTestingController` pour tester les services HTTP sans backend réel. Garder quelques scénarios navigateur de bout en bout pour les flux essentiels.

## 11. Ordre d'implémentation proposé

1. Initialiser Angular, thème, layout responsive, environnements et service API de base.
2. Ajouter les modèles typés, gestion commune des erreurs, session, interceptor et guards.
3. Implémenter login/inscription et valider les contrats avec Swagger.
4. Ajouter dashboard, clients et pagination.
5. Ajouter offres puis cycle de vie des abonnements.
6. Ajouter paiements avec clé idempotente ; afficher clairement les statuts pending.
7. Ajouter écrans ADMIN, audit et outbox.
8. Compléter accessibilité, tests, états vides/erreurs, performance et déploiement.

À chaque étape, vérifier le frontend avec `ng build` et les tests concernés. Tester aussi contre un backend local avec deux organisations différentes afin de vérifier les parcours tenant-aware.

## 12. Documentation de référence

- Swagger UI local : `http://localhost:8080/swagger-ui/index.html`
- OpenAPI JSON : `http://localhost:8080/v3/api-docs`
- Configuration backend, variables d'environnement et limites connues : `README.md`

Le backend expose les API sous `/api` sans préfixe `/v1` pour le moment. Centraliser cette base URL dans la configuration frontend plutôt que de la répéter dans les composants.
