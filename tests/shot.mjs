#!/usr/bin/env node
// shot.mjs — capture headless de l'app STEP (Chrome + CDP, zéro dépendance, Node ≥22)
// Usage : node shot.mjs --scene plan|fiche|donnees|fiche-start --w 1180 --h 820 [--full] [--out out.png] [--js "expr"] [--json]
// Prérequis : serveur local http://127.0.0.1:8000 (python3 -m http.server dans ~/step-plan-decoupe)
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), (arr[i + 1] && !arr[i + 1].startsWith('--')) ? arr[i + 1] : true] : []).filter(Boolean));
const scene = args.scene || 'plan';
const W = +(args.w || 1180), H = +(args.h || 820);
const out = args.out || `shot-${scene}-${W}x${H}${args.full ? '-full' : ''}.png`;
const URL_ = args.url || 'http://127.0.0.1:8000/';
const PORT = 9333 + Math.floor(Math.random() * 500);
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const udd = mkdtempSync(join(tmpdir(), 'stepshot-'));
const chrome = spawn(CHROME, [`--headless=new`, `--remote-debugging-port=${PORT}`, `--user-data-dir=${udd}`, '--no-first-run', '--no-default-browser-check', '--disable-gpu', `--window-size=${W},${H}`, '--hide-scrollbars', '--force-device-scale-factor=1', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitPort() { for (let i = 0; i < 100; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return await r.json(); } catch { } await sleep(100); } throw new Error('chrome not up'); }

// ---- scènes : setup JS exécuté dans la page (session simulée + mode entraînement = zéro écriture) ----
const SETUP = {
  common: `
    window.confirm=function(){ return true; }; window.alert=function(){}; currentRole='operateur'; currentUser={role:'operateur',ini:'TB',nom:'Taïeb'}; applyRole();
    startTraining();
    (function(){ const st=document.createElement('style'); st.id='__auditNoHatch'; st.textContent='body.training::before,body.training::after{display:none!important} #trainingBanner{display:none!important} .toast,#globalToast{display:none!important} body.training #sendPlanWrap{bottom:0!important} body.training #actionBar{bottom:0!important}'; document.head.appendChild(st); })();
    window.__set=(id,v)=>{const e=document.getElementById(id); if(e){e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}));}};
    __set('planClient','EPCO'); onClientChange&&onClientChange();
    __set('planRef','41312809 - TacFlex® KX1045-1'); __set('planNumCmd','CMD-2026-0871');
    (function(){ const rows=document.querySelector('.ref-block .rb-rows'); rows.innerHTML=''; rows.appendChild(makeOrderRow('9','502')); rows.appendChild(makeOrderRow('3','612')); rows.appendChild(makeOrderRow('65','157')); })();
    recalcPlan();
  `,
  plan: `showPage(0); window.scrollTo(0,0);`,
  fiche: `showPage(1); __set('fNumLame','L-12'); window.scrollTo(0,0);`,
  'fiche-start': `showPage(1); __set('fNumLame','L-12'); chronoStart(); window.scrollTo(0,0);`,
  'fiche-cut': `showPage(1); __set('fNumLame','L-12'); chronoStart(); (function(){ const l=ficheLines[0]; const b=document.getElementById('coupeeBtn_'+l.id); b&&b.click(); })(); window.scrollTo(0,0);`,
  donnees: `stopTraining(); showPage(2); window.scrollTo(0,0);`,
  // [L352] en-tête DÉPLIÉE (tap sur les pastilles) — mono-réf
  'fiche-open': `showPage(1); __set('fNumLame','L-12'); toggleFicheHead(true); window.scrollTo(0,0);`,
  // [L352] MULTI-RÉF (2 références EPCO) — bloc « valider la bobine mère » de la réf 1 visible
  'fiche-multi': `addRefBlock(); (function(){ const b=document.querySelectorAll('.ref-block')[1]; const sel=b.querySelector('[data-rb=ref]'); const o=Array.from(sel.options).find(o=>o.value&&o.value!==document.getElementById('planRef').value)||sel.options[1]; sel.value=o.value; sel.dispatchEvent(new Event('change',{bubbles:true})); const m=b.querySelector('[data-rb=mother]'); if(m&&!m.value){ m.value='1250'; m.dispatchEvent(new Event('input',{bubbles:true})); } const rows=b.querySelector('.rb-rows'); rows.innerHTML=''; rows.appendChild(makeOrderRow('6','300')); rows.appendChild(makeOrderRow('4','450')); })(); recalcPlan(); showPage(1); __set('fNumLame','L-12'); window.scrollTo(0,0);`,
  'fiche-multi-open': `addRefBlock(); (function(){ const b=document.querySelectorAll('.ref-block')[1]; const sel=b.querySelector('[data-rb=ref]'); const o=Array.from(sel.options).find(o=>o.value&&o.value!==document.getElementById('planRef').value)||sel.options[1]; sel.value=o.value; sel.dispatchEvent(new Event('change',{bubbles:true})); const m=b.querySelector('[data-rb=mother]'); if(m&&!m.value){ m.value='1250'; m.dispatchEvent(new Event('input',{bubbles:true})); } const rows=b.querySelector('.rb-rows'); rows.innerHTML=''; rows.appendChild(makeOrderRow('6','300')); rows.appendChild(makeOrderRow('4','450')); })(); recalcPlan(); showPage(1); __set('fNumLame','L-12'); toggleFicheHead(true); window.scrollTo(0,0);`,
};

(async () => {
  const ver = await waitPort();
  const ws = new WebSocket(ver.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map();
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } };
  const send = (method, params = {}, sessionId) => new Promise(res => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });
  const { result: { targetId } } = await send('Target.createTarget', { url: 'about:blank' });
  const { result: { sessionId } } = await send('Target.attachToTarget', { targetId, flatten: true });
  const S = (m, p) => send(m, p, sessionId);
  await S('Page.enable'); await S('Runtime.enable');
  await S('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false });
  await S('Page.navigate', { url: URL_ });
  await sleep(2500);
  const evalJs = async (expr) => { const r = await S('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result.exceptionDetails) return { error: r.result.exceptionDetails.text + ' ' + (r.result.exceptionDetails.exception?.description || '') }; return r.result.result?.value; };
  // attendre que l'app soit initialisée
  for (let i = 0; i < 40; i++) { const ok = await evalJs(`typeof applyRole==='function' && typeof recalcPlan==='function' && !!document.getElementById('planClient')`); if (ok === true) break; await sleep(250); }
  const setupErr = await evalJs(`(function(){ try { ${SETUP.common} ${SETUP[scene] || ''} return null; } catch(e){ return String(e && e.stack || e); } })()`);
  if (setupErr) console.error('SETUP ERROR:', setupErr);
  await sleep(700);
  let extra = null;
  if (args.js) extra = await evalJs(String(args.js));
  if (args.json) { console.log(JSON.stringify(extra, null, 2)); }
  if (!args.nopng) {
    let clip;
    if (args.full) { const dims = await evalJs(`JSON.stringify({w:document.documentElement.scrollWidth,h:document.documentElement.scrollHeight})`); const d = JSON.parse(dims); await S('Emulation.setDeviceMetricsOverride', { width: W, height: Math.min(d.h, 6000), deviceScaleFactor: 1, mobile: false }); await sleep(300); }
    const shot = await S('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!args.full });
    writeFileSync(out, Buffer.from(shot.result.data, 'base64'));
    console.log('PNG', out, extra !== null && !args.json ? JSON.stringify(extra).slice(0, 400) : '');
  }
  ws.close(); chrome.kill(); process.exit(0);
})().catch(e => { console.error(e); chrome.kill(); process.exit(1); });
