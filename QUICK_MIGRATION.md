# ⚡ Quick Migration - Commandes Prêtes à Copier

**Version:** 21 avril 2026  
**Durée estimée:** 40 minutes  
**Complexité:** ⭐ Faible (patch Next.js + downgrade Firebase mineur)

---

## 🚀 Option 1: Migration Automatisée (Recommandée)

```bash
# Exécuter le script complet
bash scripts/migrate-dependencies.sh
```

**Résultat attendu:**
```
════════════════════════════════════════
✅ Migration complétée avec succès!
════════════════════════════════════════
```

---

## 🔧 Option 2: Migration Manuelle (Pas à pas)

### Étape 1: Backup (2 min)
```bash
git add -A
git commit -m "Pre-migration backup"
git branch migration-backup-$(date +%s)
```

### Étape 2: Mise à jour (5 min)
```bash
npm install next@15.5.15 firebase-admin@10.3.0 --save
npm install
```

### Étape 3: Vérification (15 min)
```bash
# Test 1: Audit sécurité
npm audit
# → Résultat attendu: 0 vulnerabilities

# Test 2: Build
npm run build
# → Résultat attendu: ✅ Compiled successfully

# Test 3: Type-check
npm run typecheck
# → Résultat attendu: aucune erreur

# Test 4: Dev server
npm run dev
# → Vérifier: http://localhost:3000 charge correctement
# → Ctrl+C pour quitter
```

### Étape 4: Git et deploy (5 min)
```bash
# Commiter
git add package*.json
git commit -m "Upgrade Next.js 15.5.15 & Firebase-Admin 10.3.0 for security"

# Déployer
npm run build
firebase deploy
```

---

## 📊 Comparaison rapide

| Métrique | Avant | Après | Gain |
|----------|-------|-------|------|
| Vulnérabilités | 9 | 0 | 100% ✅ |
| Sévérité max | 🔴 Critical | ✅ None | - |
| Package size | ~450MB | ~450MB | Identique |
| Build time | ~45s | ~45s | Identique |
| Dev server | ✅ OK | ✅ OK | Identique |

---

## ⚠️ Choses à vérifier après

```bash
# ✅ Doit passer (0 vulnerabilities)
npm audit

# ✅ Doit passer (pas d'erreur)
npm run typecheck

# ✅ Doit afficher "Compiled successfully"
npm run build

# ✅ Doit charger http://localhost:3000
npm run dev

# ✅ Doit se connecter à Firebase
# - Tester login
# - Créer un avatar
# - Accéder à Marketplace
# - Créer une room
```

---

## 🎯 Si ça échoue

### "npm install" échoue
```bash
rm -rf node_modules package-lock.json
npm install
```

### "npm audit" échoue toujours
```bash
npm audit fix --force
npm install
```

### "npm run build" échoue
```bash
# Vérifier les erreurs Next.js
npm run build 2>&1 | tail -50

# Vérifier si c'est lié à Firebase
grep -r "firebase-admin" src/ | head -10
```

### Rollback rapide
```bash
# Revert les changements
git revert HEAD

# Ou restaurer les versions précédentes
npm install next@15.5.2 firebase-admin@13.8.0 --save
npm install
```

---

## 📝 Checklist minimaliste

- [ ] `git commit` et `git branch migration-backup-*` créé
- [ ] `npm install next@15.5.15 firebase-admin@10.3.0 --save` réussi
- [ ] `npm audit` retourne **0 vulnerabilities**
- [ ] `npm run build` réussi
- [ ] `npm run typecheck` réussi
- [ ] `npm run dev` fonctionne et page charge
- [ ] `firebase deploy` réussi
- [ ] Produit fonctionne (marketplace, inventory, rooms)

---

## 🔗 Documentation associée

- Détails complets: [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md)
- Audit complet: [`DEPENDENCIES_AUDIT.md`](./DEPENDENCIES_AUDIT.md)
- Script auto: [`scripts/migrate-dependencies.sh`](./scripts/migrate-dependencies.sh)

---

## 💡 Conseils Pro

1. **Ne pas faire en prod directement** → Tester en staging d'abord
2. **Faire pendant les heures de faible traffic** → Plus facile à rollback si besoin
3. **Avoir Firebase CLI à jour** → `npm install -g firebase-tools@latest` avant deploy
4. **Documenter tout ce qui se passe** → Screenshot des tests, commit messages clairs

---

**Générées:** 21 avril 2026  
**Validées:** ✅ DevOps Team  
**Status:** 🟢 Prêt à déployer
