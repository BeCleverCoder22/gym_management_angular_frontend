# Gym Management Frontend

Application web de gestion de salle de sport, construite avec Angular 22, TypeScript strict, Reactive Forms et Bootstrap. Elle consomme l'API REST Spring Boot ; elle ne se connecte pas directement à PostgreSQL.

## Prérequis

- Node.js et npm compatibles avec Angular 22
- Backend Gym Management disponible sur `http://localhost:8080`
- Un compte rattaché à une organisation connue du backend

Le backend, PostgreSQL, les migrations et les comptes de test sont décrits dans le README du projet Spring Boot. Les endpoints et scénarios Postman sont détaillés dans [POSTMAN_API_TEST_GUIDE.md](POSTMAN_API_TEST_GUIDE.md).

## Installation et lancement

À la racine de ce dossier :

```powershell
npm.cmd install
npm.cmd run start
```

Ouvrir ensuite `http://localhost:4200`. `npm.cmd` permet d'éviter le blocage du script `npm.ps1` lorsque la stratégie d'exécution PowerShell est restrictive. Dans un terminal où npm fonctionne directement, les commandes équivalentes sont `npm install` et `npm start`.

Le serveur de développement recharge l'application lors des modifications de fichiers.

## Configuration de l'API

L'URL de base est centralisée dans les environnements Angular :

- Développement : `src/environments/environment.development.ts` utilise `http://localhost:8080/api`.
- Production : `src/environments/environment.ts` utilise `/api`, à relayer vers Spring Boot par le reverse proxy.

La configuration Angular remplace l'environnement de production par celui de développement lors de `ng serve`. Si le frontend et le backend sont servis sur des origines différentes, l'origine `http://localhost:4200` doit être autorisée par la configuration CORS du backend.

## Authentification et données

La connexion exige le slug de l'organisation, le nom d'utilisateur et le mot de passe. L'access token est conservé uniquement en mémoire : un rechargement complet de la page nécessite une nouvelle connexion. Le frontend envoie le bearer token uniquement aux requêtes vers l'API.

Les listes sont paginées côté serveur et lisent leurs éléments dans `content`. Le tenant est déduit du JWT : le frontend ne transmet pas d'identifiant d'organisation dans les requêtes métier. Les guards Angular améliorent la navigation, mais les permissions restent appliquées par Spring Security.

L'application comprend les écrans Tableau de bord, Clients, Offres, Abonnements, Paiements et Profil, ainsi que les écrans d'administration Utilisateurs, Audit et Notifications. Les paiements électroniques restent en attente : aucun fournisseur de paiement n'est intégré.

## Commandes

```powershell
npm.cmd run build
npm.cmd test
```

`npm.cmd test` lance Karma en mode watch. Pour une exécution unique avec Chrome headless :

```powershell
npm.cmd run test -- --watch=false --browsers=ChromeHeadless
```

Le build de production est généré dans `dist/gym-management2`. Après un build SSR, le script `npm.cmd run serve:ssr:gym-management2` démarre le serveur généré.

## Dépannage

- Vérifier la disponibilité backend avec `http://localhost:8080/actuator/health` et la documentation sur `http://localhost:8080/swagger-ui/index.html`.
- Dans les outils réseau du navigateur, vérifier que les requêtes métier contiennent `Authorization: Bearer …` et que le statut est `2xx`.
- Une réponse `200` pour une liste contient une enveloppe paginée ; les lignes sont dans `content`.
- Une liste vide peut être normale si le JWT appartient à une organisation différente de celle qui possède les données. Les anciennes données peuvent appartenir au tenant `legacy-gym`.
- Après un rechargement complet ou un hot reload qui réinitialise l'application, se reconnecter avant de retester les routes privées.

## Documentation

- [Guide frontend Angular et contrats API](FRONTEND_ANGULAR_GUIDE.md)
- [Guide de tests Postman](POSTMAN_API_TEST_GUIDE.md)
