#!/usr/bin/env node
// sim200.mjs — SIMULATION DE COMMANDES DE BOUT EN BOUT (Plan → Fiche → coupe → clôture) dans l'app réelle,
// en Chrome headless + CDP, MODE ENTRAÎNEMENT (trainingGuard : AUCUNE écriture en base). Node ≥22, zéro dépendance.
// Usage : node tests/sim200.mjs [--n 200] [--seed 42] [--url http://127.0.0.1:8000/] [--verbose]
// Vérifie à chaque commande : plan calculé (bobines, perte, solde ≥0), fiche = plan (nb lignes), chrono auto au 1er ✂,
// garde « config modifiée → ✂ refusé tant que non recalculé », RESTE n, HUD n/T, jalons, clôture (volet victoire),
// aucune erreur JS, aucun _domGuardWarn, resetAll propre. Sortie : rapport JSON + résumé texte.
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith('--') ? [a.slice(2), (arr[i + 1] && !arr[i + 1].startsWith('--')) ? arr[i + 1] : true] : []).filter(Boolean));
const N = +(args.n || 200), SEED = +(args.seed || 42), URL_ = args.url || 'http://127.0.0.1:8000/';
// [L356] --multi <p> proba d'une 2e référence (déf. .3) · --nc <p> proba d'une NC réelle motif+action (déf. .25) · --nomulti / --nonc pour couper
const P_MULTI = args.nomulti ? 0 : +(args.multi || 0.3), P_NC = args.nonc ? 0 : +(args.nc || 0.25);
const PORT = 9400 + Math.floor(Math.random() * 400);
const CHROME = process.env.CHROME_BIN || (process.platform === 'win32'
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const udd = mkdtempSync(join(tmpdir(), 'stepsim-'));
const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${udd}`, '--no-first-run', '--disable-gpu', '--window-size=1180,820', 'about:blank'], { stdio: 'ignore' });
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function waitPort() { for (let i = 0; i < 100; i++) { try { const r = await fetch(`http://127.0.0.1:${PORT}/json/version`); if (r.ok) return await r.json(); } catch { } await sleep(100); } throw new Error('chrome not up'); }

// ---------- script exécuté DANS la page : une commande aléatoire de bout en bout, retourne un rapport ----------
const PAGE_SETUP = `
  window.__errs=[]; window.__guards=[];
  window.addEventListener('error',e=>{ try{ __errs.push(String(e.message).slice(0,200)); }catch(_){} });
  window.addEventListener('unhandledrejection',e=>{ try{ __errs.push('unhandled: '+String(e.reason&&e.reason.message||e.reason).slice(0,200)); }catch(_){} });
  (function(){ const o=window._domGuardWarn; if(typeof o==='function'&&!o.__sim){ const w=function(k,m){ try{ __guards.push(k+': '+String(m).slice(0,120)); }catch(_){} return o.apply(this,arguments); }; w.__sim=true; window._domGuardWarn=w; } })();
  window.confirm=function(){ return true; }; window.alert=function(){}; window.prompt=function(){ return null; };
  currentRole='operateur'; currentUser={role:'operateur',ini:'TB',nom:'Taïeb'}; applyRole(); startTraining();
  const st=document.createElement('style'); st.textContent='*{animation:none!important;transition:none!important}'; document.head.appendChild(st);
  window.__rng=(function(seed){ let s=seed>>>0; return function(){ s=(s*1664525+1013904223)>>>0; return s/4294967296; }; })(${SEED});
`;
const PAGE_ONE = `(async function(k){
  const R=window.__rng, ri=(a,b)=>a+Math.floor(R()*(b-a+1)), pick=arr=>arr[Math.floor(R()*arr.length)];
  const rep={k, errs0:__errs.length, guards0:__guards.length, steps:[], bugs:[]};
  const bug=(m)=>rep.bugs.push(m);
  const q=s=>document.querySelector(s);
  const set=(id,v)=>{const e=document.getElementById(id); if(e){e.value=v; e.dispatchEvent(new Event('input',{bubbles:true})); e.dispatchEvent(new Event('change',{bubbles:true}));}};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  try{
    // 1) plan
    resetAll(); showPage(0);
    const clients=Object.keys(CLIENT_DATA).filter(c=>Array.isArray(CLIENT_DATA[c])&&CLIENT_DATA[c].length);
    const cli=pick(clients); set('planClient',cli); if(typeof onClientChange==='function') onClientChange();
    const refs=[...(document.getElementById('planRef')||{}).options||[]].map(o=>o.value).filter(Boolean);
    if(!refs.length){ rep.skip='client sans réf'; return rep; }
    const ref=pick(refs); set('planRef',ref); set('planNumCmd','SIM-'+k);
    const mach=q('#refBlocks [data-rb="machine"]'); if(mach&&!mach.value){ mach.value=pick(['feba','maveg','cevenini']); mach.dispatchEvent(new Event('change',{bubbles:true})); }
    const rows=q('.ref-block .rb-rows'); rows.innerHTML='';
    const useful=(typeof getUseful==='function')?getUseful():2000;
    const nL=ri(1,4); let cmd=[];
    for(let i=0;i<nL;i++){ const w=pick([40,49,60,70,80,100,120,157,200,250,300,400,502,612]); const qty=ri(1,60); if(w>useful) continue; cmd.push({w,qty}); rows.appendChild(makeOrderRow(String(qty),String(w))); }
    if(!cmd.length){ cmd=[{w:100,qty:10}]; rows.appendChild(makeOrderRow('10','100')); }
    if(R()<0.15){ if(typeof addPlanChuteTo==='function'){ const b=q('.ref-block button[onclick^="addPlanChuteTo"]'); if(b) b.click(); const cr=q('.rb-chutes .rb-chute-row, .rb-chutes>*'); const ins=cr?cr.querySelectorAll('input'):[]; if(ins.length>=2){ ins[0].value=String(cmd[0].w); ins[1].value='2'; ins[0].dispatchEvent(new Event('input',{bubbles:true})); ins[1].dispatchEvent(new Event('input',{bubbles:true})); rep.chute=true; } } }
    // [L356] MULTI-RÉF : 2e référence du même client (autre réf si possible), 1-2 laizes, mère 1250 si vide
    let multi=false; if(R()<${P_MULTI}&&refs.length>1&&typeof addRefBlock==='function'){ try{ addRefBlock(); const b2=document.querySelectorAll('.ref-block')[1]; const sel=b2.querySelector('[data-rb=ref]'); const o=[...sel.options].map(o=>o.value).filter(v=>v&&v!==ref); sel.value=o.length?pick(o):ref; sel.dispatchEvent(new Event('change',{bubbles:true})); const m2=b2.querySelector('[data-rb=mother]'); if(m2&&!m2.value){ m2.value='1250'; m2.dispatchEvent(new Event('input',{bubbles:true})); } const mc2=b2.querySelector('[data-rb=machine]'); if(mc2&&!mc2.value){ mc2.value=pick(['feba','maveg','cevenini']); mc2.dispatchEvent(new Event('change',{bubbles:true})); } const r2=b2.querySelector('.rb-rows'); r2.innerHTML='';
      /* [enquête seed 7] la 2e réf a SA PROPRE largeur utile : certaines réfs du catalogue sont étroites
         (ex. SK 6008AD32, mère 260 → utile 250). Sans ce filtre, une laize 300/450 rendait la commande
         PHYSIQUEMENT impossible ; l'app refusait alors la fiche (garde L359 · QW2, comportement correct)
         et le harnais comptait ce refus comme anomalie « fiche : 0 lignes ». Même règle que la réf 1 (l.54). */
      const u2=(function(){ try{ const m=parseFloat(String(b2.querySelector('[data-rb=mother]')?.value||'').replace(',','.'))||0; const e=parseFloat(String(b2.querySelector('[data-rb=edge]')?.value||'').replace(',','.'))||0; return (typeof clampUseful==='function')?clampUseful(m-e):(m-e); }catch(_){ return 0; } })();
      const w2s=[100,157,200,300,450].filter(w=>!(u2>0)||w<=u2);
      rep.useful2=u2;
      if(!w2s.length){ rep.multiSkip='réf 2 trop étroite (utile '+u2+' mm)'; }
      else { const n2=ri(1,2); for(let i=0;i<n2;i++){ r2.appendChild(makeOrderRow(String(ri(1,20)),String(pick(w2s)))); } multi=true; } }catch(e){ bug('multi : addRefBlock a levé '+e.message); } }
    rep.multi=multi;
    recalcPlan(); await wait(60);
    const cards=document.querySelectorAll('#planCards .bobine-card').length;
    const tiles=[...document.querySelectorAll('#statsBar .stat-tile b')].map(e=>e.textContent.trim());
    rep.plan={cli,ref,cmd,cards,tiles,useful};
    if(!cards) bug('plan : aucune bobine calculée ('+JSON.stringify(cmd)+', utile '+useful+')');
    const pct=parseFloat(document.getElementById('statsBar')?.dataset?.pertePct||''); if(!(pct>=0&&pct<=100)) bug('plan : % perte invalide '+(document.getElementById('statsBar')?.dataset?.pertePct));   /* [L457] la tuile perte n'existe plus (retrait Esteban) : lecture via data-perte-pct */
    if(q('.badge-solde')){ const sm=parseInt(String(q('.badge-solde').textContent).replace(/\\D/g,''),10); if(!(sm>=0)) bug('plan : SOLDE négatif/illisible '+q('.badge-solde').textContent); }
    // 2) fiche
    startCutFromPlan(); await wait(80);
    if(!document.getElementById('page1').classList.contains('active')){ showPage(1); await wait(80); }
    const nb=(typeof totalBobinesPlan==='number')?totalBobinesPlan:parseInt(tiles[0],10);
    rep.fiche={lines:ficheLines.length, planBob:nb};
    if(ficheLines.length!==nb) bug('fiche : '+ficheLines.length+' lignes pour '+nb+' bobines mères');
    set('fNumLame','L-'+ri(1,40));
    // 3) garde config modifiée (1 commande sur 3)
    if(R()<0.34&&ficheLines.length){ const l0=ficheLines[0]; const ta=document.getElementById('flConf_'+l0.id); if(ta&&ta.dataset.conf0){ ta.value=ta.value+' + 1×'+pick([50,80]); ta.dispatchEvent(new Event('input',{bubbles:true})); await wait(260); const chip=document.getElementById(l0.id).querySelector('.fl-edit-chip'); const btn=document.getElementById('coupeeBtn_'+l0.id); btn.click(); await wait(80); const refused=!document.getElementById(l0.id).classList.contains('coupee'); rep.guard={chip:chip?chip.textContent:null, refused}; if(!refused) bug('garde recalcul : coupe ACCEPTÉE malgré config modifiée'); if(chip&&chip.textContent.indexOf('APPLIQUER')<0) bug('garde recalcul : bouton pas passé en APPLIQUER (libellé L389)'); if(typeof _l345EditChip==='function') _l345EditChip(l0.id); await wait(1500); rep.guard.linesAfter=ficheLines.length; rep.guard.stillDirty=(typeof _l345ConfDirty==='function')?_l345ConfDirty(ficheLines[0]&&ficheLines[0].id):null; } }
    // [L356] MULTI-RÉF : le bloc « valider la bobine mère » de la réf 1 doit exister ; en-tête dépliée (L352) → il vient dans #ficheHeadSide et VALIDER y marche
    const _valRef=async()=>{ const blk=document.querySelector('.fmm-inline-block.active'); const btn=blk&&blk.querySelector('.btn-blue'); if(btn){ btn.click(); await wait(120); return true; } return false; };
    if(multi){ if(typeof fmmIsMulti!=='function'||!fmmIsMulti()) bug('multi : fmmIsMulti() faux après import'); const blk0=document.querySelector('.fmm-inline-block.active'); if(!blk0) bug('multi : aucun bloc « valider la bobine mère » actif'); else { try{ toggleFicheHead(true); await wait(60); const side=document.getElementById('ficheHeadSide'); const inSlot=!!(side&&side.contains(document.querySelector('.fmm-inline-block.active'))); rep.l352={inSlot, twocol:document.getElementById('ficheHeadSec').classList.contains('head-2col'), hdrMiniHidden:getComputedStyle(document.querySelector('#ficheHeadSec .hdr-mini')).display==='none'}; if(!inSlot) bug('L352 : bloc réf actif PAS dans le slot en-tête déplié'); if(!rep.l352.hdrMiniHidden) bug('L352 : Client/Réf visibles dans l en-tête dépliée'); const okV=await _valRef(); if(!okV) bug('L352 : bouton VALIDER absent dans le slot'); toggleFicheHead(false); await wait(60); if(side&&side.children.length) bug('L352 : slot non vidé au repli'); if(document.querySelectorAll('.l352-home').length) bug('L352 : jalon .l352-home orphelin après repli'); if(!ficheRefValidated.size) bug('multi : réf 1 non validée après VALIDER dans le slot'); }catch(e){ bug('L352 : '+e.message); } } }
    // [L356] NC RÉELLE sur une bobine (motif + action + test 2e cochés à la main, comme un opérateur)
    let ncLine=null; if(R()<${P_NC}&&ficheLines.length){ ncLine=pick(ficheLines); try{ const id=ncLine.id; const det=document.getElementById(id).querySelector('details.fl-more'); if(det) det.open=true; const cb=document.getElementById('nc_'+pick(['larg','qty','casse','ang','hum'])+'_'+id).querySelector('input'); cb.checked=true; updateNC(id); const act=pick(['dechet','chutes']); toggleAction(id,act); const dv=document.getElementById('flDevi_'+id); if(dv&&!dv.checked){ dv.checked=true; dv.dispatchEvent(new Event('change',{bubbles:true})); } const feba=(typeof _flMachineOf==='function')?(_flMachineOf(id)==='feba'):false; const dr=document.getElementById('flDroit_'+id); if(!feba&&dr&&!dr.checked){ dr.checked=true; dr.dispatchEvent(new Event('change',{bubbles:true})); } try{ updateTest2Subs(id); }catch(_){} rep.nc={id, act, badge:!!document.querySelector('#'+id+' .fl-badge.badge-red')}; if(!rep.nc.badge) bug('NC : badge rouge absent après motif coché'); }catch(e){ bug('NC : '+e.message); } }
    // 4) coupe de toutes les bobines (chrono AUTO au 1er ✂) — [L356] en multi, valider chaque réf quand son bloc devient actif
    let cut=0, tries=0, wasRunning=chronoRunning; const T=ficheLines.length; let jalonSeen=false;
    const popGo=async()=>{ const p=document.getElementById('prevolPop'); if(p){ const g=[...p.querySelectorAll('button')].find(x=>/je lance/.test(x.textContent)); if(g){ g.click(); await wait(150); } } };   /* [L413] le 1er ✂ ouvre le pop pre-vol : l'operateur simule « ✓ je lance » (le geste est rejoue par l'app) */
    /* [L420] l'operateur VALIDE la preparation de chaque reference (zone Partie operateur du Plan) avant de couper */
    try{ document.querySelectorAll('#refBlocks .ref-block .rb-op-validate').forEach(b=>{ try{ b.click(); }catch(e){} }); await wait(400); }catch(e){}
    for(let i=0;i<ficheLines.length&&tries<T*3+20;i++){ if(multi){ if(await _valRef()) await wait(1500); }   /* [L359] borne vivante : une NC déchet + recalcul peut AJOUTER une bobine de remplacement */   /* [L356] valider AVANT de lire la ligne : la validation régénère les lignes (ids neufs) */
      const l=ficheLines[i]; if(!l){ bug('ligne '+i+' disparue après validation'); break; } const el=document.getElementById(l.id); const b=document.getElementById('coupeeBtn_'+l.id); if(!el||!b){ bug('bobine sans bouton ✂ '+i); continue; }
      if(el.classList.contains('coupee')){ cut++; continue; }
      b.click(); await wait(40); await popGo(); for(let r=0;r<3&&!el.classList.contains('coupee');r++){ await wait(800); b.click(); await wait(40); await popGo(); tries++; }
      if(el.classList.contains('coupee')) cut++; else { bug('✂ refusé bobine '+(i+1)+'/'+T+' ('+(document.querySelector('#globalToast')?.textContent||'').slice(0,80)+')'); }
      if(i===0&&!chronoRunning) bug('chrono NON démarré automatiquement au 1er ✂');
      if(document.querySelector('.fp-jalon')) jalonSeen=true;
      const reste=(document.getElementById('sendPlanBtn')||{}).dataset?.reste; if(reste!=null&&parseInt(reste,10)!==ficheLines.length-cut) bug('RESTE '+reste+' ≠ '+(ficheLines.length-cut));
    }
    const Tf=ficheLines.length; rep.cut={cut,T:Tf,T0:T,jalonSeen,chrono:chronoRunning,hud:(document.querySelector('#coupeeBanner .fp-num')||{}).textContent};
    if(cut!==Tf) bug('coupe incomplète '+cut+'/'+Tf);
    if(T>=4&&!jalonSeen) rep.note='jalon non vu (peut être masqué par le timing)';
    // 5) clôture : volet victoire (aucun envoi : le volet s'ouvre, on le ferme)
    try{ confirmCommandeRecap(); }catch(e){ bug('confirmCommandeRecap a levé : '+e.message); }
    await wait(150);
    const vo=document.querySelector('#victoryOverlay.open'); rep.victory=!!vo; if(!vo) bug('volet de clôture NON ouvert après coupe complète');
    else { const t=document.getElementById('victoryBody').innerText; if(t.indexOf(Tf+'/'+Tf)<0) bug('volet : compteur '+Tf+'/'+Tf+' absent'); if(t.indexOf('Perte matière')<0) bug('volet : perte % absente'); if(ncLine&&!/1 NC/.test(t)) bug('volet : la NC déclarée n apparaît pas ('+(t.match(/[^\\n]*NC[^\\n]*/)||[''])[0]+')'); if(!ncLine&&/\\d+ NC déclarée/.test(t)) bug('volet : NC fantôme'); try{ victoryClose(); }catch(_){} }
    resetAll(); await wait(60);
    if(ficheLines.length) bug('resetAll : fiche non vidée');
    if(document.getElementById('victoryOverlay')?.classList.contains('open')) bug('resetAll : volet resté ouvert');
  }catch(e){ bug('EXCEPTION : '+String(e&&e.stack||e).slice(0,300)); }
  rep.errs=__errs.slice(rep.errs0); rep.guards=__guards.slice(rep.guards0);
  return rep;
})`;

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
  await S('Emulation.setDeviceMetricsOverride', { width: 1180, height: 820, deviceScaleFactor: 1, mobile: false });
  await S('Page.navigate', { url: URL_ }); await sleep(2500);
  const evalJs = async (expr) => { const r = await S('Runtime.evaluate', { expression: expr, awaitPromise: true, returnByValue: true, timeout: 120000 }); if (r.result.exceptionDetails) return { error: r.result.exceptionDetails.text + ' ' + (r.result.exceptionDetails.exception?.description || '') }; return r.result.result?.value; };
  for (let i = 0; i < 40; i++) { const ok = await evalJs(`typeof applyRole==='function' && typeof recalcPlan==='function' && !!document.getElementById('planClient')`); if (ok === true) break; await sleep(250); }
  const se = await evalJs(`(function(){ try{ ${PAGE_SETUP} return 'ok'; }catch(e){ return 'SETUP ERR '+e; } })()`); console.log('setup:', se);
  const reports = []; const t0 = Date.now();
  for (let k = 1; k <= N; k++) {
    const rep = await evalJs(`${PAGE_ONE}(${k})`);
    if (!rep || rep.error) { reports.push({ k, bugs: ['EVAL: ' + (rep && rep.error)] }); }
    else reports.push(rep);
    if (args.verbose || (rep && rep.bugs && rep.bugs.length)) console.log(`#${k}`, rep && rep.bugs && rep.bugs.length ? '❌ ' + rep.bugs.join(' | ') : '✅', rep && rep.plan ? `${rep.plan.cli} · ${rep.plan.cards} bob · ${rep.cut ? rep.cut.cut + '/' + rep.cut.T : ''}` : '');
    if (k % 25 === 0) console.log(`… ${k}/${N} (${Math.round((Date.now() - t0) / 1000)} s)`);
  }
  const bugs = reports.filter(r => r.bugs && r.bugs.length); const errs = reports.filter(r => (r.errs || []).length); const guards = reports.filter(r => (r.guards || []).length);
  const summary = { n: N, seed: SEED, ok: N - bugs.length, withBugs: bugs.length, jsErrors: errs.length, domGuards: guards.length, secs: Math.round((Date.now() - t0) / 1000),
    bugKinds: Object.entries(bugs.flatMap(r => r.bugs).reduce((m, b) => { const kk = b.replace(/\d+/g, 'n').slice(0, 70); m[kk] = (m[kk] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]),
    errKinds: Object.entries(errs.flatMap(r => r.errs).reduce((m, b) => { m[b.slice(0, 90)] = (m[b.slice(0, 90)] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]).slice(0, 10) };
  writeFileSync(join(process.cwd(), 'tests', 'sim200-report.json'), JSON.stringify({ summary, reports }, null, 1));
  console.log('\n===== RÉSUMÉ =====\n' + JSON.stringify(summary, null, 2));
  console.log(bugs.length ? `💥 ${bugs.length} commande(s) avec anomalie` : `🏆 ${N} commandes simulées sans anomalie`);
  ws.close(); chrome.kill(); process.exit(bugs.length ? 1 : 0);
})().catch(e => { console.error(e); chrome.kill(); process.exit(2); });
