# etherworld-deploy

Pack original de jeu social isometrique type hotel, pilote par JSON et assets. Le contenu jouable vit dans `data/` et `public/assets/`.

## Ce qui est modifiable sans toucher au code principal

- `data/avatars.json`: skins, couches, categories.
- `data/items.json`: boutique, vetements, effets cosmetiques.
- `data/furnitures.json`: meubles placables et catalogues.
- `data/rooms.json`: nouvelles rooms, previews, spawn, mobilier par defaut.
- `public/assets/**`: PNG des avatars, items, rooms, UI, tiles et icones.

## Demarrage Debian / Ubuntu

```bash
cd etherworld-deploy
npm install
npm run generate:assets
npx serve .
```

Ouvrir ensuite `http://localhost:3000/public/`.

## Demarrage Termux

```bash
pkg update
pkg install nodejs
cd etherworld-deploy
npm install
npm run generate:assets
npx serve .
```

## Firebase

Ne mets pas de cles dans le repo. Utilise uniquement des variables d'environnement ou un compte de service local non versionne.

Variables attendues :

```bash
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@example.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
ETHERSYNC_AES_SECRET=replace-with-32-byte-secret
```

## Scripts

- `npm run generate:assets`: genere les PNG placeholder manquants.
- `npm run upload:assets`: upload recursif de `public/assets` vers Firebase Storage.
- `npm run seed:firestore`: pousse les JSON dans Firestore.

## Convention de contenu

- Ajoute un PNG dans un dossier d'assets.
- Ajoute l'entree correspondante dans le JSON.
- Relance `npm run upload:assets` puis `npm run seed:firestore`.

Le front recharge les donnees depuis les JSON a chaque chargement de page. Aucun rebuild de contenu n'est necessaire.
