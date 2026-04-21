#!/bin/bash

# EtherWorld Dependency Migration Script
# Automatise la migration des dépendances vers versions LTS 2024-2025
# Usage: bash scripts/migrate-dependencies.sh

set -e

echo "🚀 EtherWorld - Dependency Migration Script"
echo "=============================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Étape 1: Backup
echo -e "${YELLOW}[1/7]${NC} Sauvegarde de l'état actuel..."
git add -A
git commit -m "Pre-migration backup before Next.js 15.5.15 security update" || echo "No changes to commit"
git branch migration-backup-$(date +%s) || echo "Backup branch already exists"
echo -e "${GREEN}✓ Sauvegarde complétée${NC}"
echo ""

# Étape 2: Vérifier npm version
echo -e "${YELLOW}[2/7]${NC} Vérification de npm..."
npm --version
echo -e "${GREEN}✓ npm OK${NC}"
echo ""

# Étape 3: Audit pré-migration
echo -e "${YELLOW}[3/7]${NC} Audit de sécurité (avant)..."
npm audit --json > audit-before.json 2>/dev/null || true
echo "Vulnérabilités avant: $(npm audit 2>&1 | grep -o '[0-9]* vulnerabilities' || echo '0 vulnerabilities')"
echo ""

# Étape 4: Installation des nouvelles versions
echo -e "${YELLOW}[4/7]${NC} Installation des dépendances mises à jour..."
npm install next@15.5.15 firebase-admin@10.3.0 --save
npm install
echo -e "${GREEN}✓ Dépendances installées${NC}"
echo ""

# Étape 5: Audit post-migration
echo -e "${YELLOW}[5/7]${NC} Audit de sécurité (après)..."
npm audit --json > audit-after.json 2>/dev/null || true
VULN_COUNT=$(npm audit 2>&1 | grep -o '[0-9]* vulnerabilities' || echo '0 vulnerabilities')
echo "Vulnérabilités après: $VULN_COUNT"
echo ""

# Étape 6: Build test
echo -e "${YELLOW}[6/7]${NC} Build test..."
npm run build
echo -e "${GREEN}✓ Build réussi${NC}"
echo ""

# Étape 7: Type-check
echo -e "${YELLOW}[7/7]${NC} Type-checking..."
npm run typecheck
echo -e "${GREEN}✓ Type-check réussi${NC}"
echo ""

echo -e "${GREEN}════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ Migration complétée avec succès!${NC}"
echo -e "${GREEN}════════════════════════════════════════${NC}"
echo ""
echo "Prochaines étapes:"
echo "1. Vérifiez les tests locaux: npm run dev"
echo "2. Validez Firebase: npm run start"
echo "3. Commitez les changements: git add -A && git commit -m 'Upgrade dependencies to LTS 2024-2025'"
echo "4. Déployez: firebase deploy"
echo ""
echo "Ressources:"
echo "- Migration guide: MIGRATION_GUIDE.md"
echo "- Audit détaillé: audit-before.json / audit-after.json"
