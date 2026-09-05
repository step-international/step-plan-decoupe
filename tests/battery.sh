#!/usr/bin/env bash
# battery.sh — [L504 · audit 30 agents, pattern 3 « la regle est ecrite, rien ne l applique »]
# LE SEUL CHEMIN VERS LE PUSH. Chaque etape echoue au 1er rouge, AUCUN code de retour n est masque par
# un pipe, la liste des tests est derivee du DISQUE (pas recopiee a la main), le capteur des smokes est
# verifie, le rapport de sim n est jamais ecrase par un plus faible.
set -Eeuo pipefail
cd "$(dirname "$0")/.."
red(){ printf '\033[31m%s\033[0m\n' "$*"; }
step(){ printf '\n\033[1m== %s ==\033[0m\n' "$*"; }

step "0. version bumpee vs origin/main"
git fetch -q origin || red "fetch impossible (hors-ligne ?) — verification de version sautee"
LOCAL=$(grep -o "APP_VERSION='[^']*'" index.html | head -1)
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
node tests/audit_regress_test.js >/tmp/_bat_$$.log 2>&1 || { grep "❌" /tmp/_bat_$$.log | head -20; red "gardien ROUGE"; exit 1; }
tail -1 /tmp/_bat_$$.log

step "5. serveur local :8000 (sinon sims et smokes sont FAUSSEMENT verts)"
# [L504] pas de tube vers grep -q : sous pipefail, grep ferme le tube et curl sort en 23 -> FAUX ROUGE (vu au 1er passage reel).
# Si aucun serveur ne repond, la batterie lance le sien (et le coupe a la fin) : le chemin est autonome.
_SRV_PID=""
if ! curl -fsS --max-time 3 -o /dev/null http://localhost:8000/index.html 2>/dev/null; then
  (cd "$ROOT" && python3 -m http.server 8000 --bind 127.0.0.1 >/dev/null 2>&1) & _SRV_PID=$!
  trap '[ -n "$_SRV_PID" ] && kill "$_SRV_PID" 2>/dev/null' EXIT
  for i in 1 2 3 4 5 6 7 8 9 10; do curl -fsS --max-time 1 -o /dev/null http://localhost:8000/index.html 2>/dev/null && break; sleep 0.5; done
  echo "serveur :8000 lance par la batterie (pid $_SRV_PID)"
fi
_TMP_SERVED="$(mktemp)"
curl -fsS --max-time 10 -o "$_TMP_SERVED" http://localhost:8000/index.html || { red "serveur :8000 absent ou ne sert pas index.html"; exit 1; }
SERVED="$(grep -o "APP_VERSION='[^']*'" "$_TMP_SERVED" | head -1 | cut -d"'" -f2)"; rm -f "$_TMP_SERVED"
[ -n "$SERVED" ] || { red "le serveur :8000 ne sert pas un index.html (APP_VERSION introuvable)"; exit 1; }
# la version SERVIE doit etre la version LOCALE : un serveur pointe sur un autre dossier (miroir Documents, worktree)
# rendrait sims et smokes verts sur un fichier qui n est pas celui qu on va pousser
LOCAL_V="$(printf '%s' "$LOCAL" | cut -d"'" -f2)"
[ "$SERVED" = "$LOCAL_V" ] || { red "le serveur :8000 sert $SERVED alors que le fichier local est $LOCAL_V : mauvais dossier servi"; exit 1; }
echo "serveur :8000 OK, sert bien $SERVED"
echo "ok"

step "6. simulation (plancher 8 scenarios, jamais --n 4 : ecrase le rapport committe)"
node tests/sim200.mjs --n 8 --seed 7 --multi 0.5 >/tmp/_bat_$$.log 2>&1 || true
grep -q "🏆" /tmp/_bat_$$.log || { tail -12 /tmp/_bat_$$.log; red "sim : anomalie"; exit 1; }
# [L504] les compteurs vivent sous r.summary (lire r.n direct rendait la batterie ROUGE sur un rapport vert)
node -e "const r=require('./tests/sim200-report.json'); const s=r.summary||r; if((s.withBugs||0)+(s.jsErrors||0)+(s.domGuards||0)>0||(s.n||0)<8){console.log(JSON.stringify(s));process.exit(1)} console.log('rapport relu : n='+s.n+' bugs='+(s.withBugs||0)+' errs='+(s.jsErrors||0)+' gardes='+(s.domGuards||0))"
tail -1 /tmp/_bat_$$.log

step "7. smokes (le capteur doit EXISTER : 0 erreur ne vaut rien si rien ne compte)"
for s in plan fiche donnees analyse; do
  out=$(node tests/shot.mjs --scene "$s" --out "/tmp/_bat_${s}_$$.png" --json 2>&1 || true)
  echo "$out" | grep -qi "SETUP ERR\|error\|pageerror" && { echo "$out" | tail -5; red "smoke $s"; exit 1; }
  printf '%-9s ok\n' "$s"
done

step "8. recensement : ecritures Firestore attendues SANS borne (doit etre vide)"
UNB=$(grep -n "db\.collection([^)]*)\(\.doc([^)]*)\)\?\.\(set\|update\|delete\|add\)(" index.html | grep -v "boundedWrite\|boundedTx\|raceTimeout\|_commitRace\|_bw(\|tx\.\|batch\." | grep "await " || true)
[ -z "$UNB" ] || { echo "$UNB"; red "ecritures non bornees"; exit 1; }
echo "vide"
AWL=$(grep -c "await logAudit(" index.html || true); [ "$AWL" = "0" ] || { red "$AWL await logAudit( (interdit depuis L501)"; exit 1; }

printf '\n\033[32m🏆 BATTERIE COMPLETE VERTE — push autorise\033[0m\n'
