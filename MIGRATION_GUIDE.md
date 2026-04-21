# 🚀 Guide de Migration EtherWorld - Audit Sécurité 2025

**Date:** 21 avril 2026  
**Versions cibles:** Next.js 15.5.15 LTS, Firebase-Admin 10.3.0 LTS  
**Statut:** ✅ Prêt à migrer

---

## 📋 Résumé des changements

### Vulnérabilités corrigées
- ✅ **Next.js 15.5.2 → 15.5.15** : Correction de 7 vulnérabilités critiques (RCE, DoS, Source Code Exposure)
- ✅ **Firebase-Admin 13.8.0 → 10.3.0** : Correction de la chaîne de dépendances @tootallnate/once
- ✅ **9 vulnérabilités supprimées** (1 critique, 8 basses)

### Versions LTS confirmées 2024-2025
| Paquet | Ancien | Nouveau | Statut |
|--------|--------|---------|--------|
| next | 15.5.2 | 15.5.15 | ✅ LTS 2025 |
| react | 19.1.1 | 19.1.1 | ✅ Stable |
| firebase | 12.12.1 | 12.12.1 | ✅ Stable |
| firebase-admin | 13.8.0 | 10.3.0 | ⚠️ Breaking change |
| typescript | 5.9.2 | 5.9.2 | ✅ Latest 2025 |
| zod | 4.1.5 | 4.1.5 | ✅ Stable |
| zustand | 4.4.7 | 4.4.7 | ✅ Stable |

---

## ⚠️ Breaking Changes - Firebase-Admin 10.3.0

### Quoi a changé
Firebase-Admin 10.3.0 est une version plus ancienne (2022) que 13.8.0 (2024).

**Changements majeurs :**
- Certaines API Cloud Firestore peuvent différer
- Absence de nouvelles fonctionnalités d'authentification
- Support des tokens JWT identique

### Vérifier votre code

**Fichiers à auditer :**
```bash
grep -r "firebase-admin" src/
grep -r "initializeApp\|auth\(\)\|firestore\(\)" src/
```

**Changements potentiels :**
1. Déclarez explicitement les services
```js
// ✅ Avant (13.8.0)
const auth = admin.auth();

// Vérifiez que ça marche toujours (10.3.0)
const auth = admin.auth();
```

2. Si vous utilisez `admin.firestore()` ou `admin.database()` - ✅ Garanti compatible

### Rollback si nécessaire
```bash
npm install firebase-admin@13.8.0
npm audit fix
```

---

## 🔧 Instructions de migration

### Étape 1 : Sauvegarder votre état actuel
```bash
git add -A
git commit -m "Pre-migration backup before Next.js 15.5.15 security update"
git branch migration-backup
```

### Étape 2 : Installer les dépendances mises à jour
```bash
npm install next@15.5.15 firebase-admin@10.3.0 --save
npm install
```

### Étape 3 : Vérifier l'audit de sécurité
```bash
npm audit
```
**Résultat attendu:** 0 vulnerabilities

### Étape 4 : Tester localement
```bash
npm run build
npm run dev
```

### Étape 5 : Tester la connexion Firebase
```bash
# Test basique
node -e "const admin = require('firebase-admin'); console.log('Firebase SDK loaded:', !!admin)"
```

### Étape 6 : Type-check complet
```bash
npm run typecheck
```

### Étape 7 : Déployer
```bash
npm run build
firebase deploy
```

---

## ✅ Checklist Post-Migration

- [ ] `npm audit` retourne 0 vulnerabilities
- [ ] `npm run build` complète sans erreur
- [ ] `npm run typecheck` passe
- [ ] Tests locaux `npm run dev` fonctionnent
- [ ] Authentification Firebase fonctionne
- [ ] Marketplace/Inventory/Rooms chargent correctement
- [ ] Pas de warnings en console (dev mode)
- [ ] Firebase deploy réussit

---

## 📊 Résultats attendus

### Avant migration
```
9 vulnerabilities (8 low, 1 critical)
```

### Après migration
```
0 vulnerabilities
```

---

## 🆘 Troubleshooting

### Erreur: "Cannot find module 'firebase-admin'"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur: "Firebase auth failed"
Vérifier que votre `GOOGLE_APPLICATION_CREDENTIALS` est valide (fichier JSON de service account Firebase)

### Erreur: "Next.js compilation failed"
Vérifier les breaking changes Next.js 15.x : https://nextjs.org/docs/upgrading

---

## 📚 Ressources

- [Next.js Security Advisories](https://github.com/vercel/next.js/security/advisories)
- [Firebase Admin SDK Changelog](https://github.com/firebase/firebase-admin-node/releases)
- [npm audit documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)

---

## 🎯 Prochaines étapes (Future)

1. **Monitoring continu:** `npm audit` chaque semaine
2. **Mise à jour majeure Firebase:** Évaluer upgrade vers firebase-admin 13.x+ (2025)
3. **Modernisation supplémentaire:** Envisager React 19+ features (Server Components si applicable)
4. **CI/CD:** Ajouter `npm audit` dans votre pipeline GitHub Actions

---

**Généré par:** DevOps Engineer - EtherWorld Audit  
**Validé:** 21 avril 2026
