# Plan de découpe STEP — consignes pour Claude

## Contexte (à lire avant toute modification)
- L'application est **UN seul fichier** : `index.html` (~25 000 lignes au 05/09/2026 — chiffre à ne pas recopier : `wc -l index.html`, JS vanilla + Firebase compat, une lib html2canvas minifiée embarquée en tête). Elle est servie par **GitHub Pages** depuis ce repo, branche `main`.
- **Un push sur `main` = mise en production immédiate** (~2 min). Les 3 tablettes de l'atelier voient alors une bannière « Recharger ».
- Atelier ISO 9001 : 3 machines (FEBA, MAVEG, CEVENINI), 3 tablettes Galaxy Tab A9+ (paysage 1280×800), comptes machine `feba@/maveg@/cevenini@step-international.com`. Administrateur : **Esteban**.
- L'utilisateur de cette session peut être **NON TECHNIQUE** (la mère d'Esteban assure les modifications simples : clients, références, petits correctifs). Dans ce cas : parle simplement, sans jargon, ne montre pas de code, fais tout toi-même, vérifie tout, et dis clairement quand c'est en ligne.

## Règles absolues — une violation = NE PAS POUSSER
1. **Moteur de calcul intouchable** : 11 fonctions gelées byte-identiques. `node tests/engine_identity.js` doit rester 🏆. Ne jamais les modifier, même « pour améliorer ».
2. **Sorties papier / PDF / étiquettes : format strictement inchangé** (documents qualité ISO).
3. **Portrait (tablette verticale) = layout historique.** Tout changement visuel se scope en `@media(min-width:1100px)` (paysage).
4. **Les `confirm()` de sécurité restent** (dé-marquage d'une bobine coupée, reset chrono, suppressions). Seuls les dialogues « conservateurs » ont été retirés sur décision d'Esteban (L390). **L434** : le confirm de l'ordre de coupe et celui de ↺ Réinitialiser sont retirés sur demande explicite d'Esteban — règle de remplacement : ne jamais retirer un garde-fou sans **supprimer la perte** qu'il protégeait (étiquettes préservées à travers la régénération) ou sans offrir une **annulation** (bandeau « ↩ Annuler » 15 s).
5. **Jamais de suppression de données de production. Jamais toucher à la console Firebase / aux règles Firestore** — c'est le domaine d'Esteban.
6. Un lot de modifications = **APP_VERSION bumpé** (`'AAAA.MM.JJ-LNNN'`, LNNN incrémenté) + un **marqueur** dans `tests/audit_regress_test.js` pour tout correctif important.
7. Écrire dans le fichier via des scripts : attention aux commentaires `//` qui avalent la fin de ligne — toujours re-vérifier la syntaxe (étape 1 ci-dessous).

## Avant CHAQUE mise en ligne — UN SEUL CHEMIN : `tests/battery.sh`
```bash
bash tests/battery.sh
```
Il enchaîne, dans l'ordre et en s'arrêtant au premier rouge : version bumpée vs `origin/main` → syntaxe des
3 scripts inline (`tests/syntax_test.js`) → moteur gelé (empreintes SHA-256 figées) → tous les `tests/*_test.js`
(liste dérivée du disque) → gardien de régression (jugé par son CODE DE SORTIE) → serveur `:8000` → simulation
(plancher 8 scénarios, rapport committé protégé) → 4 smokes avec un VRAI capteur d'erreurs → recensement des
écritures Firestore non bornées (doit être vide) et des `await logAudit(` (doit être 0).
**Ne jamais recopier ces étapes à la main** : c'est exactement comme ça que `grep -c "❌"` (sort en code 1 quand tout
est vert), `| tail -1` (masque l'échec) et le capteur `__jsErrors` (qui n'existait pas) ont validé des lots cassés.
Le même contrôle tourne sur GitHub Actions (job `verifier`, `needs:` sur le déploiement) : un push cassé ne se déploie plus.

Puis : miroir (Mac d'Esteban UNIQUEMENT) `cp index.html "/Users/EstebanR/Documents/step/code plan de découpe/index.html"`,
commit **sans accents ni accents graves (backticks : le shell les interprète)**, préfixé `LNNN (AAAA.MM.JJ) - `, avec
`Co-Authored-By: Claude <noreply@anthropic.com>`, `git push origin main` et `git branch -f redesign main && git push origin redesign`,
et vérifier la prod : `curl -s "https://step-international.github.io/step-plan-decoupe/?nc=$RANDOM" | grep -o "APP_VERSION='[^']*'"`.

## Règles de MÉTHODE (audit à 30 agents du 05/09/2026 — chaque règle a son garde-fou mécanique)
1. **Un correctif n'est fini que quand ses jumeaux le sont** : `grep -n` sur la FORME du bug (pas le nom), chaque site
   traité ou justifié dans le commit (« Jumeaux vérifiés : … »). Cause des deux bugs d'atelier de la semaine (L495, L496).
   Garde-fou : le recensement des écritures Firestore dans `battery.sh` / CI.
2. **Reproduire le bug AVANT de le déclarer réglé, et re-tester APRÈS** (le 1er correctif du chrono faisait tomber la garde
   mais laissait 28:00:00 — seul le test l'a vu).
3. **Un test n'existe que s'il a été vu ROUGE** : tout marqueur ou test nouveau est lancé contre le code d'avant. Un `has()`
   sur un commentaire ou une chaîne de texte ne prouve rien.
4. **Ancre = signature complète en début de ligne, `async` compris, comptée == 1 avant d'écrire.** `function X(){` matche
   l'intérieur de `async function X(){` et coupe le mot-clé (arrivé en L486). Jamais de numéro de ligne dans une édition :
   un numéro calculé avant une suppression plus haut a écrasé une accolade 43 lignes plus loin (L484).
5. **Tout `git push` commence par `git fetch origin && git log HEAD..origin/main`** : deux postes poussent sur `main`
   (Mac + Windows de Céline). Push refusé = repartir de `origin/main` et ré-appliquer par ancrage, jamais de force.
6. **Changer la nature d'une donnée** (lecture unique → temps réel, position → identité, lectrice → écrivaine d'un global)
   = lister dans le commit chaque écran, index, `await`, rollback et message qui s'y fiait.
7. **Un message de succès lit une variable calculée par ce qu'il annonce** (compteur `okN`), un geste = un toast, jamais
   « tout partira » ; un `catch(_){}` sur un chiffre ISO est interdit (`console.warn` + compteur affiché).
8. **Une écriture Firestore = `_bw`/`boundedWrite`/`boundedTx`**, mise en file traitée comme un succès, cache optimiste,
   re-rendu, toast honnête — jamais un `await` nu. Transaction = `boundedTx` (une transaction qui expire n'est PAS en file).
9. **Les agents d'audit sont en LECTURE SEULE** (`agentType: Explore`) : des agents ont édité `index.html` pendant un audit.
10. **Une règle nouvelle ici arrive AVEC le test ou le script qui la fait rougir**, dans le même commit — sinon c'est un souhait.

## Sur le PC Windows (poste de Céline)

Le dépôt y est cloné dans `K:\STEP INTERNATIONAL\ESTEBAN Alternance 2025 2026\claude\claude index\`,
sur le partage réseau `\192.168.0.250\commun\`. **La checklist ci-dessus s'applique intégralement**,
avec ces différences :

- **Étape 5 (miroir) : à sauter.** Le dossier `/Users/EstebanR/Documents/…` n'existe que sur le Mac.
- **Étape 4 (smoke)** : le serveur local se lance avec `python3 -m http.server 8000` depuis la racine du
  dépôt, comme sur Mac. `shot.mjs` choisit Chrome selon la plateforme (`CHROME_BIN` pour forcer un chemin).
- Outils installés le 24/08/2026 : Node 24, Python 3.13 (la commande `python3` est un relais posé dans
  `C:\Users\admin\bin` — le raccourci Microsoft Store la masquait), GitHub CLI, et `PYTHONUTF8=1`.
- Réglages Git obligatoires, déjà en place : `core.autocrlf false` (sinon `index.html` est réécrit en CRLF
  et `engine_identity` ne compare plus les mêmes octets), `core.protectNTFS false`, et un sparse-checkout
  excluant `site internet ` — son nom a un espace final, chemin illégal sous Windows.
- **Publication en liste blanche** : le workflow ne sert que `index.html`, `manifest.json` et `sw.js`.
  Tout nouveau fichier utile à l'app doit être ajouté à la ligne `cp` de `.github/workflows/static.yml`,
  sinon il répondra 404 en production.
- **Dossier de passation** : `passation/PASSATION.md` — zone verte / zone rouge des modifications
  autorisées. À lire avant toute demande venant d'un utilisateur non technique.

## Où sont les choses

### ⚠ Publication GitHub Pages = LISTE BLANCHE (depuis le 24/08/2026)
Le site public ne contient QUE ce que le workflow `.github/workflows/static.yml` copie dans `_site`
(étape « Assembler le site public », ligne `cp index.html manifest.json sw.js _site/`). Tout le reste
du dépôt répond **404 en production, sans message d'erreur**. Si tu ajoutes un fichier dont l'application
a besoin au runtime (icône, police, asset), tu DOIS l'ajouter à cette ligne `cp`, sinon il ne sera
jamais servi. (Note : les icônes `icon-192*.png` / `icon-512*.png` sont dans le dépôt depuis L473 et copiées par le workflow.)

### Deux machines poussent sur `main`
Un clone Windows existe (`K:\STEP INTERNATIONAL\ESTEBAN Alternance 2025 2026\claude\claude index\`).
Si un push est rejeté (« fetch first » / non fast-forward) : `git pull --rebase` puis re-pousser —
les fichiers des deux machines ne se recouvrent pas.
- **Catalogue clients** : `CLIENT_DATA` dans `index.html`. **Règles d'emballage par client** : `PKG_CLIENTS`. Pour ajouter un client/une référence : copier la structure d'une entrée existante similaire.
- **Assistant IA de la bulle 💬** : `functions/index.js` (Cloud Function `assistReply`). **Règles Firestore** : `firestore.rules` (publication en console = Esteban uniquement).
- **Tests et outils** : dossier `tests/` (batterie, simulateur `sim200.mjs`, captures `shot.mjs` — serveur local `python3 -m http.server 8000` requis pour shot).
- **Journal du chantier** : messages de commit `git log --oneline` (marqueurs LNNN).

## Leçons durement apprises (audit du 24/08 — à respecter pour chaque lot UI)
1. **Visibilité ≠ présence DOM.** Tester un élément d'interface = vérifier `getBoundingClientRect()` + `getComputedStyle` (display, z-index), PAS seulement son existence. Et tester HORS mode entraînement : le harnais `shot.mjs` démarre en `body.training`, où certains z-index/règles CSS diffèrent de la prod (un pop peut être visible en test et invisible en prod).
2. **Avant d'intercepter une fonction, recenser TOUS ses appelants** (`grep` exhaustif). Le pop pré-vol branché sur le bouton ▶ ne sortait jamais : le bouton réellement tapé en atelier était la barre d'action, qui appelait `chronoStart()` directement.
3. **Simuler le VRAI geste.** Un test qui pose `el.value` sans dispatcher l'événement `input` ment : les oninput de propagation ne tournent pas et le test valide un chemin qui n'existe pas au clavier. Dispatcher les événements réels (input, focusout), et tester les clics AVEC le focus sur le bouton (une garde anti-focus peut bloquer son propre re-rendu).
4. **Après tout retrait de bloc HTML, compter les balises.** Une découpe qui laisse un `</div>` orphelin ferme un conteneur parent trop tôt et décale toute la page — symptômes en cascade loin du site d'édition.
5. **Après une grosse journée de lots, lancer un audit adversarial multi-agents** sur le diff cumulé (6 zones, mission « casser, pas défendre ») : le 24/08 il a trouvé 19 signalements dont 13 vrais bugs, tous corrigés en L412.

## En cas de doute
- Un test échoue, un comportement surprend, une demande touche le moteur / le papier / Firebase → **NE POUSSE PAS**. Explique simplement le problème et propose d'appeler Esteban.
- **Revenir en arrière** (urgence) : `git revert <commit fautif>` puis la checklist ci-dessus (jamais de `reset --hard` forcé sur le remote).
- Une seule demande à la fois ; après chaque mise en ligne, dire à l'utilisateur de recharger la page pour vérifier.

- **Module Stock SUPPRIME (L470, 29/08/2026, demande Esteban x3)** : bouton + panneau retires du DOM, corbeille sans stockArticles/stockMouvements. Les FONCTIONS stock (bkRunImport, loadStock, stockLocTotal...) restent en code DORMANT pour que bk18_test reste vert — ne pas les rebrancher sans demande explicite.
