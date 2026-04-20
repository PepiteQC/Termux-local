# EtherWorld

Projet Next.js 14 + PocketBase pour une chambre isometrique premium inspiree de Habbo Classique et EtherCristal.

## Demarrage

1. Installer les dependances :

```bash
npm install
```

2. Creer `.env.local` :

```bash
NEXT_PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
POCKETBASE_ADMIN_EMAIL=admin@example.com
POCKETBASE_ADMIN_PASSWORD=change-me
```

3. Lancer PocketBase puis envoyer schema + seed :

```bash
npm run seed:pocketbase
```

4. Demarrer l'app :

```bash
npm run dev
```

## Fonctions livrees

- Chambre isometrique 12x12 avec murs premium et profondeur isometrique.
- Avatar pixel-art stylise avec deplacement par clic et pathfinding grille.
- Inventaire drag and drop vers la chambre.
- Placement, rotation, suppression et collision des meubles.
- Boutons admin conditionnes au role PocketBase.
- Persistance PocketBase avec fallback local si le backend n'est pas configure.

## Collections PocketBase

- `users`: collection auth native.
- `rooms`: proprietaire, nom, settings.
- `furnitures`: type, position, rotation, room, owner.
- `inventory`: user, item, quantity.
- `avatar`: user, position, direction, skin.

## Seed livre

Le script `npm run seed:pocketbase` :

- verifie la collection auth `users`
- cree ou met a jour `rooms`, `furnitures`, `inventory`, `avatar`
- cree l'utilisateur demo `ether@demo.local`
- injecte la chambre `ether-suite`, l'inventaire, l'avatar et les meubles initiaux
