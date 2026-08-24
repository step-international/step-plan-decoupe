# Plan de découpe STEP — consignes pour Claude

## Contexte (à lire avant toute modification)
- L'application est **UN seul fichier** : `index.html` (~23 000 lignes, JS vanilla + Firebase compat, une lib html2canvas minifiée embarquée en tête). Elle est servie par **GitHub Pages** depuis ce repo, branche `main`.
- **Un push sur `main` = mise en production immédiate** (~2 min). Les 3 tablettes de l'atelier voient alors une bannière « Recharger ».
- Atelier ISO 9001 : 3 machines (FEBA, MAVEG, CEVENINI), 3 tablettes iPad, comptes machine `feba@/maveg@/cevenini@step-international.com`. Administrateur : **Esteban**.
- L'utilisateur de cette session peut être **NON TECHNIQUE** (la mère d'Esteban assure les modifications simples : clients, références, petits correctifs). Dans ce cas : parle simplement, sans jargon, ne montre pas de code, fais tout toi-même, vérifie tout, et dis clairement quand c'est en ligne.

## Règles absolues — une violation = NE PAS POUSSER
1. **Moteur de calcul intouchable** : 11 fonctions gelées byte-identiques. `node tests/engine_identity.js` doit rester 🏆. Ne jamais les modifier, même « pour améliorer ».
2. **Sorties papier / PDF / étiquettes : format strictement inchangé** (documents qualité ISO).
3. **Portrait (tablette verticale) = layout historique.** Tout changement visuel se scope en `@media(min-width:1100px)` (paysage).
4. **Les `confirm()` de sécurité restent** (dé-marquage d'une bobine coupée, reset chrono, suppressions). Seuls les dialogues « conservateurs » ont été retirés sur décision d'Esteban (L390).
5. **Jamais de suppression de données de production. Jamais toucher à la console Firebase / aux règles Firestore** — c'est le domaine d'Esteban.
6. Un lot de modifications = **APP_VERSION bumpé** (`'AAAA.MM.JJ-LNNN'`, LNNN incrémenté) + un **marqueur** dans `tests/audit_regress_test.js` pour tout correctif important.
7. Écrire dans le fichier via des scripts : attention aux commentaires `//` qui avalent la fin de ligne — toujours re-vérifier la syntaxe (étape 1 ci-dessous).

## Avant CHAQUE mise en ligne (obligatoire, dans l'ordre)
1. **Syntaxe** des 3 scripts inline :
   `python3 -c "import re,subprocess; s=open('index.html').read(); [print(i,subprocess.run(['node','--check',f'/tmp/sc{i}.js'],capture_output=True,text=True).stderr[:200]) for i,sc in enumerate(re.findall(r'<script>(.*?)</script>',s,re.S)) if open(f'/tmp/sc{i}.js','w').write(sc) or True]"`
2. **Batterie complète** (tout doit afficher 🏆) :
   `node tests/engine_identity.js` puis `node tests/X_test.js` pour X ∈ refs, pln, multiref, solde_phase, pm130, bk18, t5_estim, pmsort, offline, lames, kpi, analyse_fixes, draft_concordance, audit_regress, props.
3. **Simulation** : `node tests/sim200.mjs --n 8 --seed 7 --multi 0.5` → « sans anomalie ». (Un échec isolé sous forte charge machine peut être transitoire : relancer une fois avant de conclure.)
4. **Smoke headless** : `node tests/shot.mjs --scene plan --w 1180 --h 820 --nopng --json --js "(function(){return (window.__jsErrors||[]).length})()"` → 0, idem scènes `fiche-cut` et `donnees`, + un passage portrait `--w 820 --h 1180`. (Le harnais démarre en mode entraînement — appeler `stopTraining()` avant de tester l'entrée en entraînement.)
5. **Miroir** : `cp index.html "/Users/EstebanR/Documents/step/code plan de découpe/index.html"`
6. **Commit** : message SANS accents, préfixé `LNNN (AAAA.MM.JJ) - `, avec la ligne `Co-Authored-By: Claude <noreply@anthropic.com>`. Puis `git push origin main` et `git branch -f redesign main && git push origin redesign`.
7. **Vérifier la prod** : `curl -s "https://step-international.github.io/step-plan-decoupe/?nc=$RANDOM" | grep -o "APP_VERSION='[^']*'"` doit montrer la nouvelle version (parfois 1-2 min).

## Où sont les choses
- **Catalogue clients** : `CLIENT_DATA` dans `index.html`. **Règles d'emballage par client** : `PKG_CLIENTS`. Pour ajouter un client/une référence : copier la structure d'une entrée existante similaire.
- **Assistant IA de la bulle 💬** : `functions/index.js` (Cloud Function `assistReply`). **Règles Firestore** : `firestore.rules` (publication en console = Esteban uniquement).
- **Tests et outils** : dossier `tests/` (batterie, simulateur `sim200.mjs`, captures `shot.mjs` — serveur local `python3 -m http.server 8000` requis pour shot).
- **Journal du chantier** : messages de commit `git log --oneline` (marqueurs LNNN).

## En cas de doute
- Un test échoue, un comportement surprend, une demande touche le moteur / le papier / Firebase → **NE POUSSE PAS**. Explique simplement le problème et propose d'appeler Esteban.
- **Revenir en arrière** (urgence) : `git revert <commit fautif>` puis la checklist ci-dessus (jamais de `reset --hard` forcé sur le remote).
- Une seule demande à la fois ; après chaque mise en ligne, dire à l'utilisateur de recharger la page pour vérifier.
