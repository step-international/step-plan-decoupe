#!/usr/bin/env node
// ============================================================
// [L328 · REDESIGN LOT 28 · §2.23-C] AGENT DE TEST 24 h/24 — HORS index.html (règle du fichier unique intacte,
// l'app installée ne grossit pas). Node ESM. Hébergement (Q4, décision Esteban) : un poste de bureau allumé
// avec une tâche planifiée launchd (voir tests/agent.launchd.plist + README en bas de ce fichier).
//
// TROIS MISSIONS (§2.23-C) :
//   1. GARDIEN DU MOTEUR (à chaque exécution) — rejoue TOUTE la batterie tests/ (dont engine_identity :
//      11 fonctions moteur byte-identiques vs HEAD, et props_test : ~75 000 cas). C'est ce qui rend la règle
//      « moteur intouchable » VÉRIFIABLE en continu.
//   2. PARCOURS NOMINAL (--flow, toutes les 2 h) — Playwright rejoue une commande de bout en bout + 5 pièges
//      connus, en vérifiant des RÉSULTATS CHIFFRÉS (pas des captures). Nécessite Playwright installé + STEP_URL
//      (un projet de TEST, jamais la prod). Dégrade proprement si absent.
//   3. MAIL — immédiat si un test casse ; sinon UN résumé le matin. Regroupement : 1 mail / heure / signature.
//      Le transport est enfichable (par défaut : journal tests/agent-report.log ; SMTP à brancher — voir sendMail).
//
// USAGE :
//   node tests/agent.mjs            # mission 1 (batterie) — runnable MAINTENANT, aucun prérequis
//   node tests/agent.mjs --flow     # missions 1 + 2 (Playwright, si dispo + STEP_URL)
//   node tests/agent.mjs --sim 20   # [L356] missions 1 + 2 bis : sim200.mjs (Chrome headless, serveur local 8000 ou STEP_URL)
//   node tests/agent.mjs --summary  # force l'envoi du résumé du matin
// ============================================================
import { spawnSync } from 'node:child_process';
import { readdirSync, appendFileSync, readFileSync, existsSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(HERE);
const LOG = join(HERE, 'agent-report.log');
const STATE = join(HERE, '.agent-mailstate.json');   // horodatage par signature (regroupement horaire)
const NOW = new Date();

function log(line) {
  const stamp = NOW.toISOString().replace('T', ' ').slice(0, 19);
  const msg = `[${stamp}] ${line}`;
  console.log(msg);
  try { appendFileSync(LOG, msg + '\n'); } catch (_) {}
}

// ── MAIL enfichable ─────────────────────────────────────────
// Règles §2.23-C : regroupement (1/h/signature), zéro donnée sensible (identifiants + contexte technique
// seulement), silence quand tout va bien (hors résumé du matin). Transport par défaut = journal ; pour un vrai
// e-mail, remplacer le corps de `deliver` par un envoi SMTP (nodemailer) — aucune autre partie à changer.
function loadState() { try { return JSON.parse(readFileSync(STATE, 'utf8')); } catch (_) { return {}; } }
function saveState(s) { try { writeFileSync(STATE, JSON.stringify(s)); } catch (_) {} }
function deliver(subject, body) {
  // TODO SMTP : brancher ici l'extension mail / nodemailer. Par défaut on journalise (visible, testable).
  log(`✉️  MAIL → ${subject}\n${body}\n`);
}
function mailGrouped(signature, subject, body) {
  const st = loadState();
  const last = st[signature] || 0;
  const t = NOW.getTime();
  if (t - last < 3600_000) { log(`(mail regroupé, <1 h depuis « ${signature} » — non renvoyé)`); return; }
  st[signature] = t; saveState(st);
  deliver(subject, body);
}

// ── MISSION 1 : gardien du moteur + batterie ────────────────
function runBattery() {
  const files = readdirSync(HERE).filter(f => f.endsWith('_test.js')).sort();
  const results = [];
  for (const f of files) {
    const r = spawnSync('node', [join(HERE, f)], { encoding: 'utf8', timeout: 600_000 });
    const okc = r.status === 0;
    results.push({ f, ok: okc, tail: (r.stdout || '').trim().split('\n').slice(-1)[0] || (r.stderr || '').trim().slice(0, 200) });
  }
  // engine_identity n'est pas un *_test.js : le lancer explicitement (garde byte-identique du moteur)
  const ei = spawnSync('node', [join(HERE, 'engine_identity.js')], { encoding: 'utf8', timeout: 120_000 });
  results.push({ f: 'engine_identity.js', ok: ei.status === 0, tail: (ei.stdout || '').trim().split('\n').slice(-1)[0] });
  return results;
}

// ── MISSION 2 : parcours nominal (Playwright, optionnel) ────
async function runFlow() {
  let chromium;
  try { ({ chromium } = await import('playwright')); }
  catch (_) { log('⏭️  --flow ignoré : Playwright non installé (npm i -D playwright && npx playwright install chromium).'); return null; }
  const URL = process.env.STEP_URL;
  if (!URL) { log('⏭️  --flow ignoré : STEP_URL non défini (doit pointer un projet de TEST, jamais la prod).'); return null; }
  const fails = [];
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(URL, { waitUntil: 'networkidle', timeout: 30_000 });
    // Parcours nominal + 5 pièges — VÉRIFICATIONS CHIFFRÉES (à ancrer sur des sélecteurs stables : le contrat
    // d'ids ~350, cf. IDS-CRITIQUES-redesign.md). Squelette volontairement conservateur : chaque étape est un
    // point d'extension. On ne prétend PAS couvrir sans le vrai environnement de test connecté.
    const scenarios = [
      { nom: 'app chargée', run: async () => { const v = await page.locator('#verTag').textContent().catch(() => ''); if (!/L\d+/.test(v || '')) fails.push('APP_VERSION absente de l\'en-tête'); } },
      { nom: 'onglets présents', run: async () => { const n = await page.locator('#nav button').count(); if (n < 3) fails.push('nav : moins de 3 onglets'); } },
      // Pièges à câbler quand le projet de test est connecté (Firebase test) :
      //  · NC sans motif refusée · dé-marquage · chrono en pause · hors-ligne · 60 bobines
      //  · résultats chiffrés attendus : 8 bobines, perte 1,0 %, 0 pièce perdue (commande EPCO de référence)
    ];
    for (const s of scenarios) { try { await s.run(); } catch (e) { fails.push(`${s.nom} : ${e.message}`); } }
  } finally { await browser.close(); }
  return fails;
}

// ── MISSION 2 bis [L356 · backlog n°14] : parcours nominal RÉEL via tests/sim200.mjs (Chrome headless + CDP, zéro dépendance,
//    mode entraînement = aucune écriture) — remplace le squelette Playwright quand un serveur local sert l'app.
//    `--sim [n]` : n commandes (déf. 20) sur STEP_URL ou http://127.0.0.1:8000/. Ignoré proprement si le serveur ne répond pas.
async function runSim(n) {
  const URL = process.env.STEP_URL || 'http://127.0.0.1:8000/';
  try { const r = await fetch(URL, { signal: AbortSignal.timeout(2500) }); if (!r.ok) throw new Error('HTTP ' + r.status); }
  catch (e) { log(`⏭️  --sim ignoré : ${URL} injoignable (${e.message}). Lance : cd ~/step-plan-decoupe && python3 -m http.server 8000 --bind 127.0.0.1`); return null; }
  const r = spawnSync('node', [join(HERE, 'sim200.mjs'), '--n', String(n), '--url', URL], { encoding: 'utf8', timeout: 1_800_000 });
  const tail = (r.stdout || '').trim().split('\n').slice(-1)[0] || (r.stderr || '').trim().slice(0, 200);
  log(`sim200 (${n}) : ${tail}`);
  if (r.status === 0) return [];
  // détail des anomalies depuis le rapport JSON (mêmes chemins que sim200.mjs)
  try { const rep = JSON.parse(readFileSync(join(HERE, 'sim200-report.json'), 'utf8')); return (rep.summary.bugKinds || []).map(([k, c]) => `sim200 : ${k} (×${c})`); }
  catch (_) { return [`sim200 : sortie ${r.status} — ${tail}`]; }
}

// ── ORCHESTRATION ───────────────────────────────────────────
const argv = process.argv.slice(2);
const wantFlow = argv.includes('--flow');
const simIdx = argv.indexOf('--sim'); const wantSim = simIdx >= 0; const simN = wantSim ? (+(argv[simIdx + 1]) || 20) : 0;   // [L356]
const forceSummary = argv.includes('--summary');

const battery = runBattery();
const broken = battery.filter(r => !r.ok);
let flowFails = null;
if (wantFlow) { flowFails = await runFlow(); }
let simFails = null; if (wantSim) { simFails = await runSim(simN); }   // [L356]

const allFails = [...broken.map(b => `TEST ${b.f} : ${b.tail}`), ...((flowFails || []).map(f => `FLOW ${f}`)), ...((simFails || []).map(f => `SIM ${f}`))];

if (allFails.length) {
  // Mail IMMÉDIAT (regroupé par signature = liste triée des tests cassés)
  const sig = allFails.map(x => x.split(' : ')[0]).sort().join('|');
  mailGrouped(sig,
    `⚠ STEP agent — ${allFails.length} vérification(s) en échec`,
    `Poste : ${process.env.USER || '?'} · ${NOW.toISOString()}\nRepo : ${REPO}\n\n` + allFails.join('\n'));
  log(`❌ ${allFails.length} échec(s) : ` + allFails.join(' | '));
  process.exit(1);
} else {
  log(`✅ tout vert : ${battery.length} suites` + (wantFlow ? ` + parcours (${flowFails === null ? 'flow non exécuté' : flowFails.length + ' échec flow'})` : '') + (wantSim ? ` + sim200 (${simFails === null ? 'serveur absent' : simN + ' commandes OK'})` : ''));
  // Résumé du matin (7 h ± ou forcé) : UN mail quand tout va bien, jamais sinon.
  if (forceSummary || NOW.getHours() === 7) {
    deliver('✅ STEP agent — nuit calme',
      `Poste : ${process.env.USER || '?'} · ${NOW.toISOString()}\n${battery.length} suites vertes, moteur byte-identique.` +
      (wantFlow && flowFails !== null ? `\nParcours nominal : ${flowFails.length ? flowFails.length + ' échec(s)' : 'OK'}.` : ''));
  }
  process.exit(0);
}

/* ============================================================
   INSTALLATION launchd (macOS · Q4 décision Esteban : PC de bureau allumé) — fichier tests/agent.launchd.plist :

   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0"><dict>
     <key>Label</key><string>com.step.agent</string>
     <key>ProgramArguments</key>
       <array><string>/usr/local/bin/node</string><string>/Users/EstebanR/step-plan-decoupe/tests/agent.mjs</string><string>--flow</string></array>
     <key>StartInterval</key><integer>7200</integer>   <!-- toutes les 2 h -->
     <key>StandardOutPath</key><string>/Users/EstebanR/step-plan-decoupe/tests/agent-stdout.log</string>
     <key>StandardErrorPath</key><string>/Users/EstebanR/step-plan-decoupe/tests/agent-stderr.log</string>
     <key>EnvironmentVariables</key><dict><key>STEP_URL</key><string>https://PROJET-DE-TEST.example</string></dict>
   </dict></plist>

   Charger :  launchctl load  ~/Library/LaunchAgents/com.step.agent.plist
   Décharger: launchctl unload ~/Library/LaunchAgents/com.step.agent.plist

   ⚠ STEP_URL doit pointer un PROJET FIREBASE DE TEST — l'agent ne doit JAMAIS écrire dans le Firestore de prod
   (GitHub Actions n'y a de toute façon pas accès : d'où le choix du poste local, Q4).
   ============================================================ */
