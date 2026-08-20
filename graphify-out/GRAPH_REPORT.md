# Graph Report - step-plan-decoupe  (2026-08-21)

## Corpus Check
- 26 files · ~429,378 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 389 nodes · 468 edges · 29 communities (27 shown, 2 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.88)
- Token cost: 579,853 input · 0 output

## Community Hubs (Navigation)
- Moteur & page Plan
- Données Firestore & KPI
- Brouillons, partage & chrono
- Tests lames
- Tests plan manuel
- Batterie de tests navigateur
- Tests multi-références
- Tests planning
- Dépendances Cloud Functions
- Tests propriétés moteur
- Tests solde & phases
- Manifest PWA
- Tests concordance brouillons
- Déploiement GitHub Pages
- Tests import bobineaux
- Tests estimation temps
- Tests tri plan manuel
- Assistant IA & signalements
- Tests KPI
- Cloud Function assistReply
- Test intégrité audit
- Outil captures headless
- Test gel du moteur
- Tests hors-ligne
- Tests parsing réfs
- Simulateur de commandes
- Gestion de version
- Service worker & cache
- Tests correctifs analyse

## God Nodes (most connected - your core abstractions)
1. `packRefGroupsPal (enveloppe palettes)` - 11 edges
2. `saveCommandeFiche (archivage fiche+temps)` - 11 edges
3. `Écran Fiche de découpe (page1)` - 9 edges
4. `Collection Firestore fiches` - 9 edges
5. `importPlanToFiche` - 9 edges
6. `Écran Plan (page0)` - 8 edges
7. `Collection Firestore brouillons` - 8 edges
8. `toggleCoupee` - 8 edges
9. `logAudit (piste d'audit)` - 8 edges
10. `STEP International — Plan de découpe (PWA)` - 7 edges

## Surprising Connections (you probably didn't know these)
- `step-plan-decoupe` --conceptually_related_to--> `Deploy static content to Pages (workflow)`  [INFERRED]
  README.md → .github/workflows/static.yml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Parcours 1·Commande → 2·Je coupe → 3·J'envoie** — index_page_plan, index_recalcplan, index_importplantofiche, index_page_fiche_de_decoupe, index_coupeetapone, index_confirmcommanderecap, index_savecommandefiche [EXTRACTED 1.00]
- **Verrou entraînement : zéro écriture en base** — index_trainingguard, index_mode_entrainement, index_savecommandefiche, index_autosavedrafttick, index_logaudit, index_reportwrite, index_persistchronolive [EXTRACTED 1.00]
- **Résilience hors-ligne / crash (état jamais perdu)** — index_mode_hors_ligne, index_boundedwrite, index_boundedtx, index_persistchronolive, index_autosavedrafttick, index_planautosavetick [INFERRED 0.85]
- **GitHub Pages deployment pipeline (checkout -> configure -> upload -> deploy)** — _github_workflows_static_deploy, _github_workflows_static_actions_checkout, _github_workflows_static_actions_configure_pages, _github_workflows_static_actions_upload_pages_artifact, _github_workflows_static_actions_deploy_pages [EXTRACTED 1.00]

## Communities (29 total, 2 thin omitted)

### Community 0 - "Moteur & page Plan"
Cohesion: 0.08
Nodes (45): addFicheLine, STEP International — Plan de découpe (PWA), bestPattern (sac à dos DP), buildPlanPrintHTML (PDF du plan), Catalogue clients CLIENT_DATA, cliPartsFromGroups (attribution clients FIFO), computeChutesUsed (bobineaux en stock), confirmCommande (+37 more)

### Community 1 - "Données Firestore & KPI"
Cohesion: 0.10
Nodes (31): applyRole (gating par rôle), boundedTx, boundedWrite, buildFicheAnalytics (graphiques Analyse), buildMonthlyKpi (KPI mensuels), Collection Firestore agregats (KPI mensuels), Collection Firestore audit, Collection Firestore fiches (+23 more)

### Community 2 - "Brouillons, partage & chrono"
Cohesion: 0.11
Nodes (29): applySharedCuts (verrous reçus), autosaveDraftTick (autosave fiche 15s), Brouillons par poste/tablette, Chronomètre de découpe, chronoStart, Collection Firestore brouillons, Collection Firestore machines (annuaire postes), Commande partagée (partage live) (+21 more)

### Community 3 - "Tests lames"
Cohesion: 0.07
Nodes (23): fs, i5, i6, i7, lameActiveForMachine, lameClasseurEtat, r, r2 (+15 more)

### Community 4 - "Tests plan manuel"
Cohesion: 0.08
Nodes (22): coh, coh2, coh3, cohOver, cur, eCev, eMav, fs (+14 more)

### Community 5 - "Batterie de tests navigateur"
Cohesion: 0.11
Nodes (16): allFails, argv, battery, broken, deliver(), forceSummary, HERE, loadState() (+8 more)

### Community 6 - "Tests multi-références"
Cohesion: 0.11
Nodes (12): bDup, bImp, bNon, _dupRefKeyOf, fs, gImp, gNon, _machineProfileOf (+4 more)

### Community 7 - "Tests planning"
Cohesion: 0.14
Nodes (11): arch, audits, ctx, dr, est, fs, sEst, src (+3 more)

### Community 8 - "Dépendances Cloud Functions"
Cohesion: 0.15
Nodes (12): @anthropic-ai/sdk, firebase-admin, firebase-functions, dependencies, @anthropic-ai/sdk, firebase-admin, firebase-functions, description (+4 more)

### Community 9 - "Tests propriétés moteur"
Cohesion: 0.19
Nodes (8): BLADES, fs, genRows(), pick(), ri(), rnd(), src, USEFULS

### Community 10 - "Tests solde & phases"
Cohesion: 0.17
Nodes (7): d1, d2, fs, REELS, ri(), rnd(), src

### Community 11 - "Manifest PWA"
Cohesion: 0.17
Nodes (11): background_color, description, dir, display, lang, name, orientation, scope (+3 more)

### Community 12 - "Tests concordance brouillons"
Cohesion: 0.17
Nodes (7): fs, idA, idB, newA, newB, src, _supersededManualDrafts

### Community 13 - "Déploiement GitHub Pages"
Cohesion: 0.22
Nodes (10): actions/checkout@v4, actions/configure-pages@v5, actions/deploy-pages@v5, actions/upload-pages-artifact@v3 (uploads entire repository, path '.'), deploy job, Deploy static content to Pages (workflow), github-pages environment, GITHUB_TOKEN permissions (contents:read, pages:write, id-token:write) (+2 more)

### Community 14 - "Tests import bobineaux"
Cohesion: 0.22
Nodes (8): assignIds(), _bkHash, dup, fs, hm, ledger, line, src

### Community 15 - "Tests estimation temps"
Cohesion: 0.20
Nodes (6): cal, calG, est, fs, src, temps

### Community 16 - "Tests tri plan manuel"
Cohesion: 0.22
Nodes (6): fs, order, pm, pm2, _pmSortBobinesOnce, src

### Community 17 - "Assistant IA & signalements"
Cohesion: 0.29
Nodes (8): Assistant IA atelier (bulle 💬), Collection Firestore assist, Collection Firestore config (doc assistant), Collection Firestore mail (Trigger Email), _l380AssistSend (ouverture fil assistant), _l380Snapshot (scan texte de la page), Remontée terrain (signalements), _reportWrite (envoi signalement)

### Community 18 - "Tests KPI"
Cohesion: 0.25
Nodes (3): buildMonthlyKpi, fs, src

### Community 19 - "Cloud Function assistReply"
Cohesion: 0.29
Nodes (6): Anthropic, ANTHROPIC_API_KEY, { defineSecret }, { getFirestore, FieldValue }, { initializeApp }, { onDocumentWritten }

### Community 20 - "Test intégrité audit"
Cohesion: 0.29
Nodes (3): fs, src, sw

### Community 21 - "Outil captures headless"
Cohesion: 0.33
Nodes (6): args, chrome, SETUP, sleep(), udd, waitPort()

### Community 22 - "Test gel du moteur"
Cohesion: 0.33
Nodes (4): cur, { execSync }, FROZEN, fs

### Community 23 - "Tests hors-ligne"
Cohesion: 0.33
Nodes (3): fs, _isQueuedWrite, src

### Community 24 - "Tests parsing réfs"
Cohesion: 0.33
Nodes (3): fs, parseNum, src

### Community 25 - "Simulateur de commandes"
Cohesion: 0.40
Nodes (5): args, chrome, sleep(), udd, waitPort()

### Community 26 - "Gestion de version"
Cohesion: 0.70
Nodes (5): APP_VERSION (gel + maîtrise documentaire), checkAppUpdate (veille de version), Gel de version (L89), Service worker sw.js, updReload (rechargement de version)

## Knowledge Gaps
- **177 isolated node(s):** `{ onDocumentWritten }`, `{ defineSecret }`, `{ initializeApp }`, `{ getFirestore, FieldValue }`, `Anthropic` (+172 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `saveCommandeFiche (archivage fiche+temps)` connect `Moteur & page Plan` to `Données Firestore & KPI`, `Brouillons, partage & chrono`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Écran Fiche de découpe (page1)` connect `Moteur & page Plan` to `Assistant IA & signalements`, `Données Firestore & KPI`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `packRefGroupsPal (enveloppe palettes)` (e.g. with `computeChutesUsed (bobineaux en stock)` and `packRecutRolls (rouleaux à recouper)`) actually correct?**
  _`packRefGroupsPal (enveloppe palettes)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `saveCommandeFiche (archivage fiche+temps)` (e.g. with `logAudit (piste d'audit)` and `resetAll (remise à zéro site)`) actually correct?**
  _`saveCommandeFiche (archivage fiche+temps)` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `Collection Firestore fiches` (e.g. with `buildFicheAnalytics (graphiques Analyse)` and `buildMonthlyKpi (KPI mensuels)`) actually correct?**
  _`Collection Firestore fiches` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `{ onDocumentWritten }`, `{ defineSecret }`, `{ initializeApp }` to the rest of the system?**
  _177 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Moteur & page Plan` be split into smaller, more focused modules?**
  _Cohesion score 0.07878787878787878 - nodes in this community are weakly interconnected._