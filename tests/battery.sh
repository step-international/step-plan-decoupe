#!/usr/bin/env bash
# battery.sh — [L504 · audit 30 agents, pattern 3 « la regle est ecrite, rien ne l applique »]
# LE SEUL CHEMIN VERS LE PUSH. Chaque etape echoue au 1er rouge, AUCUN code de retour n est masque par
# un pipe, la liste des tests est derivee du DISQUE (pas recopiee a la main), le capteur des smokes est
# verifie, le rapport de sim n est jamais ecrase par un plus faible.
set -Eeuo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"   # [L506 · verification adverse] etait utilise sans etre defini : sous set -u le serveur autonome mourait et l etape 5 sortait rouge avec un message faux
red(){ printf '\033[31m%s\033[0m\n' "$*"; }
step(){ printf '\n\033[1m== %s ==\033[0m\n' "$*"; }

step "0. version bumpee vs origin/main"
git fetch -q origin || red "fetch impossible (hors-ligne ?) — verification de version sautee"
LOCAL=$(grep -o "APP_VERSION='[^']*'" index.html | head -1 || true)
REMOTE=$(git show origin/main:index.html 2>/dev/null | grep -o "APP_VERSION='[^']*'" | head -1 || echo "")
# le bump n est du QUE si l app change : un lot d outillage (tests/, CI, CLAUDE.md) ne doit pas declencher un « Recharger » a l atelier
if [ -n "$REMOTE" ] && [ "$LOCAL" = "$REMOTE" ] && ! git diff --quiet origin/main -- index.html 2>/dev/null; then red "index.html modifie mais APP_VERSION identique a origin/main ($LOCAL) : bump obligatoire (regle 6 — seul declencheur du bandeau Recharger)"; exit 1; fi
echo "$LOCAL (origin: ${REMOTE:-?})"

step "1. syntaxe"
node tests/syntax_test.js

step "2. moteur gele (empreintes figees)"
node tests/engine_identity.js

step "3. tests unitaires (liste derivee de tests/*_test.js)"
for f in tests/*_test.js; do
  case "$f" in *audit_regress_test.js|*syntax_test.js) continue;; esac
  printf '%-32s' "$(basename "$f")"; node "$f" >/tmp/_bat_$$.log 2>&1 && echo "✅" || { red "❌"; tail -20 /tmp/_bat_$$.log; exit 1; }
done

step "4. gardien de regression (juge par son CODE DE SORTIE, jamais par un grep -c)"
node tests/audit_regress_test.js >/tmp/_bat_$$.log 2>&1 || { grep "❌" /tmp/_bat_$$.log | head -20 || true; tail -6 /tmp/_bat_$$.log; red "gardien ROUGE (ou plante : voir les 6 dernieres lignes)"; exit 1; }
tail -1 /tmp/_bat_$$.log

step "4b. meta-gardien : sur la version PRECEDENTE, le gardien doit etre ROUGE (sinon il est vert par construction)"
# [L505 · audit famille 2] un gardien qui passe aussi sur HEAD ne prouve rien pour ce lot : chaque lot d app doit laisser
# au moins un marqueur qui echoue sur la version d avant. Lot d outillage (index.html inchange) : sans objet.
# [L506 · 3e verification] la reference est CHAQUE base dont index.html differe : origin/main (la prod) ET HEAD (un lot committe
# non pousse) — sinon deux lots committes d affilee laissaient le 2e passer sur le rouge du 1er.
_BASES="HEAD"; git rev-parse -q --verify origin/main >/dev/null 2>&1 && _BASES="origin/main HEAD"
_DONE=0
for _B in $_BASES; do
  if git diff --quiet "$_B" -- index.html 2>/dev/null; then echo "index.html identique a $_B : rien a discriminer sur cette base"; continue; fi
  _DONE=1; _PREV="$(mktemp)"; git show "$_B":index.html > "$_PREV"
  if AUDIT_HTML="$_PREV" node tests/audit_regress_test.js >/dev/null 2>&1; then
    rm -f "$_PREV"; red "le gardien est VERT sur $_B : aucun marqueur de ce lot ne discrimine (gardien vert par construction)"; exit 1
  fi
  _NRED="$(AUDIT_HTML="$_PREV" node tests/audit_regress_test.js 2>/dev/null | grep -c '❌' || true)"; rm -f "$_PREV"
  echo "meta-gardien OK : $_NRED marqueur(s) rouge(s) sur $_B, tous verts sur le fichier courant"
done
[ "$_DONE" = "1" ] || echo "lot d outillage (index.html inchange) : meta-gardien sans objet"

step "5. serveur local :8000 (sinon sims et smokes sont FAUSSEMENT verts)"
# [L504] pas de tube vers grep -q : sous pipefail, grep ferme le tube et curl sort en 23 -> FAUX ROUGE (vu au 1er passage reel).
# Si aucun serveur ne repond, la batterie lance le sien (et le coupe a la fin) : le chemin est autonome.
_SRV_PID=""
if ! curl -fsS --max-time 3 -o /dev/null http://127.0.0.1:8000/index.html 2>/dev/null; then
  (cd "$ROOT" && exec python3 -m http.server 8000 --bind 127.0.0.1 >/dev/null 2>&1) & _SRV_PID=$!   # exec : le PID est celui de python (sinon le trap tuait le sous-shell et laissait un serveur orphelin)
  trap '[ -n "$_SRV_PID" ] && kill "$_SRV_PID" 2>/dev/null' EXIT
  for i in 1 2 3 4 5 6 7 8 9 10; do curl -fsS --max-time 1 -o /dev/null http://127.0.0.1:8000/index.html 2>/dev/null && break; sleep 0.5; done
  echo "serveur :8000 lance par la batterie (pid $_SRV_PID)"
fi
_TMP_SERVED="$(mktemp)"
curl -fsS --max-time 10 -o "$_TMP_SERVED" http://127.0.0.1:8000/index.html || { red "serveur :8000 absent ou ne sert pas index.html"; exit 1; }
SERVED="$(grep -o "APP_VERSION='[^']*'" "$_TMP_SERVED" | head -1 | cut -d"'" -f2 || true)"; rm -f "$_TMP_SERVED"
[ -n "$SERVED" ] || { red "le serveur :8000 ne sert pas un index.html (APP_VERSION introuvable)"; exit 1; }
# la version SERVIE doit etre la version LOCALE : un serveur pointe sur un autre dossier (miroir Documents, worktree)
# rendrait sims et smokes verts sur un fichier qui n est pas celui qu on va pousser
LOCAL_V="$(printf '%s' "$LOCAL" | cut -d"'" -f2)"
[ "$SERVED" = "$LOCAL_V" ] || { red "le serveur :8000 sert $SERVED alors que le fichier local est $LOCAL_V : mauvais dossier servi"; exit 1; }
echo "serveur :8000 OK, sert bien $SERVED"
echo "ok"

step "6. simulation (plancher 8 scenarios, jamais --n 4 : ecrase le rapport committe)"
node tests/sim200.mjs --n 8 --seed 7 --multi 0.5 >/tmp/_bat_$$.log 2>&1 || { tail -12 /tmp/_bat_$$.log; red "sim : sim200.mjs sort en erreur (code de sortie)"; exit 1; }
grep -q "🏆" /tmp/_bat_$$.log || { tail -12 /tmp/_bat_$$.log; red "sim : anomalie"; exit 1; }
# [L504] les compteurs vivent sous r.summary (lire r.n direct rendait la batterie ROUGE sur un rapport vert)
node -e "const r=require('./tests/sim200-report.json'); const s=r.summary||r; if((s.withBugs||0)+(s.jsErrors||0)+(s.domGuards||0)>0||(s.n||0)<8){console.log(JSON.stringify(s));process.exit(1)} console.log('rapport relu : n='+s.n+' bugs='+(s.withBugs||0)+' errs='+(s.jsErrors||0)+' gardes='+(s.domGuards||0))"
tail -1 /tmp/_bat_$$.log

step "7. smokes (le capteur doit EXISTER : 0 erreur ne vaut rien si rien ne compte)"
for s in plan fiche donnees analyse; do
  # [L506 · verification adverse] le CODE DE SORTIE juge (le || true le jetait : une smoke rouge passait verte) ; le grep n est qu un 2e filet, sentinelles de shot.mjs comprises (il echoue en francais)
  if ! node tests/shot.mjs --scene "$s" --out "/tmp/_bat_${s}_$$.png" --json >"/tmp/_bat_${s}_$$.log" 2>&1; then tail -8 "/tmp/_bat_${s}_$$.log"; red "smoke $s : shot.mjs sort en erreur"; exit 1; fi
  if grep -qiE "SETUP ERR|pageerror|CAPTEUR ABSENT|❌" "/tmp/_bat_${s}_$$.log"; then tail -8 "/tmp/_bat_${s}_$$.log"; red "smoke $s : sentinelle d erreur dans la sortie"; exit 1; fi
  printf '%-9s ok\n' "$s"
done

step "8. recensement : ecritures Firestore attendues SANS borne (doit etre vide)"
UNB=$(grep -n "db\.collection([^)]*)\(\.doc([^)]*)\)\?\.\(set\|update\|delete\|add\)(" index.html | grep -v "boundedWrite\|boundedTx\|raceTimeout\|_commitRace\|_bw(\|tx\.\|batch\." | grep "await " || true)
[ -z "$UNB" ] || { echo "$UNB"; red "ecritures non bornees"; exit 1; }
# [L506 · verification adverse] la FORME generale : 5 ecritures « await x.set/update() » vivaient hors du motif db.collection(...)
UNB2=$(grep -nE "await [A-Za-z_$][A-Za-z0-9_$.]*\.(set|update|delete|add|commit)\(" index.html | grep -vE "_bw\(|boundedWrite|boundedTx|raceTimeout|refFromURL|\.add\(new |classList|searchParams|headers" || true)
[ -z "$UNB2" ] || { echo "$UNB2"; red "ecriture(s) await x.set/update/delete/add SANS borne (forme generale)"; exit 1; }
UNB3=$(grep -n "runTransaction(" index.html | grep -vE "boundedTx|function boundedTx|Promise\.race\(|^[0-9]+:\s*//" || true)   # Promise.race([tx, delai]) = borne posee AVANT boundedTx (2 sites : doSave, saveFicheConfigs)
[ -z "$UNB3" ] || { echo "$UNB3"; red "transaction(s) Firestore hors boundedTx"; exit 1; }
echo "vide"
AWL=$(grep -c "await logAudit(" index.html || true); [ "$AWL" = "0" ] || { red "$AWL await logAudit( (interdit depuis L501)"; exit 1; }

printf '\n\033[32m🏆 BATTERIE COMPLETE VERTE — push autorise\033[0m\n'
