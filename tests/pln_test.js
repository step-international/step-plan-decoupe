// pln_test.js — L112 : 📅 Planning ÉTAPE 2 + garde RESTE (hygiène & planning).
// Fonctions RÉELLES extraites de index.html (repo), moteur inclus pour l'estimation.
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let s=(src.slice(i-6,i)==='async ')?i-6:i;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(s,k+1);}
let fail=0;const ok=(c,m)=>{console.log((c?'✅ ':'❌ ')+m);if(!c)fail++;};

// ── globals de base ──
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.MAX_USEFUL_MM=10000;
global.MACHINE_KEYS=['feba','maveg','cevenini'];
global.DUJ_MACHINES=global.MACHINE_KEYS;
global.DUJ_LABEL2KEY={FEBA:'feba',MAVEG:'maveg',CEVENINI:'cevenini'};
global.esc=s=>String(s==null?'':s);
global.getMachineLabel=k=>({feba:'FEBA',maveg:'MAVEG',cevenini:'CEVENINI'}[String(k||'').toLowerCase()]||'');
let toasts=[];global.showToast=(m,t)=>toasts.push({m,t});
global.fmt=x=>String(x);
// moteur + helpers réels
for(const n of ['parseNum','clampUseful','clampBlade','dujMachKey','expandDemand','bestPattern','pack','packRecutRolls','groupRecutRolls','groupBobines','buildCounts','makeLabel','computeChutesUsed','reduceItemsByChutes','assignChutesForDisplay','groupBobinesWithChutes','calcStats','packRefGroups']){
  global[n]=eval('('+fnOf(n)+')');
}
// planning réels
global._plnEstCache={};
global._dujAddOverride=null; global._plnAddCalCache={}; global.dujCalibrateAdditive=()=>null;   // [L125] pas de calibration en test → repli m/h (comportement historique)
global._plnDebitCache={};   // [L132] cache débit m/h mémoïsé (vidé par rendu dans l'appli)
global._plnSpanCache={}; global._friesCache={};    // [L133] cache span jours ouvrés mémoïsé
for(const n of ['_plnMonday','_plnIsoWeekNum','_plnIso','_plnSentKeys','_plnDejaCoupe','_plnDateLivMin','_plnPlanMeters','_plnHoursPart','_plnAddCal','_plnDebit','_plnHoursOn','_plnHoursAuto','_plnH','hygieneDryRun','_plnDays','_joursFeriesFR','_plnSpanIsos']){
  global[n]=eval('('+fnOf(n)+')');
}

// ── 1) semaine ISO ──
ok(_plnMonday(0).getDay()===1,'lundi de la semaine courante = lundi');
ok(_plnIsoWeekNum(new Date(2026,6,6))===28,'06/07/2026 → S28');
ok(_plnIsoWeekNum(new Date(2026,0,1))===1,'01/01/2026 → S1');
ok(_plnIsoWeekNum(new Date(2026,11,31))===53,'31/12/2026 → S53 (année à 53 semaines)');

// ── 2) livraison min (multi-clients) ──
ok(_plnDateLivMin({dateLiv:'2026-07-20'})==='2026-07-20','dateLiv simple');
ok(_plnDateLivMin({dateLiv:'2026-07-20',cmdClients:[{dateLiv:'2026-07-15'},{dateLiv:'2026-08-01'}]})==='2026-07-15','multi-clients → livraison la plus PROCHE');
ok(_plnDateLivMin({})==='','sans livraison → vide');

// ── 2b) MULTI-JOURS (L119) : _plnDays + _plnSpanIsos · [L127 · audit #8] jours OUVRÉS uniquement ──
ok(_plnDays({})===1,'plannedDays absent → 1 jour');
ok(_plnDays({plannedDays:3})===3,'plannedDays=3 → 3');
ok(_plnDays({plannedDays:99})===14&&_plnDays({plannedDays:0})===1,'plannedDays borné 1..14');
// mer 08 + 3 j ouvrés = mer, jeu, ven (pas de week-end traversé)
ok(JSON.stringify(_plnSpanIsos({plannedDate:'2026-07-08',plannedDays:3}))===JSON.stringify(['2026-07-08','2026-07-09','2026-07-10']),'span 3 j = 3 jours ouvrés consécutifs');
// [L127 · audit #8] ven 31 + 2 j : ven puis LUNDI (sam/dim sautés), pas samedi
ok(JSON.stringify(_plnSpanIsos({plannedDate:'2026-07-31',plannedDays:2}))===JSON.stringify(['2026-07-31','2026-08-03']),'span franchit le week-end → jours ouvrés (ven+lun, pas sam)');
// [L127 · audit #8] jeu 16 + 3 j : jeu, ven, LUNDI (week-end sauté au milieu)
ok(JSON.stringify(_plnSpanIsos({plannedDate:'2026-07-16',plannedDays:3}))===JSON.stringify(['2026-07-16','2026-07-17','2026-07-20']),'span 3 j depuis jeudi = jeu+ven+lun (week-end exclu)');
ok(_plnSpanIsos({plannedDate:'2026-07-08'}).length===1,'sans plannedDays → 1 seul jour');
ok(_plnSpanIsos({}).length===0,'plan non posé → aucun jour');

// ── 3) déjà coupé + GARDE RESTE + GARDE DATE (L118 audit #20) + fiche REFUSÉE (L118 audit #1) ──
// [L118] fiche « couvre » un plan seulement si POSTÉRIEURE au plan (fiche.date > plan.date).
global.fichesCache=[{client:'ACME',ref:'KX1',numCmd:'C100',date:'2026-07-05T10:00:00Z'},{client:'VEKA',ref:'DQ2',numCmd:'C200',date:'2026-07-05T10:00:00Z'},{client:'REF',ref:'RR',numCmd:'C300',valide:false,date:'2026-07-05T10:00:00Z'}];
const ctx=_plnSentKeys();
ok(_plnDejaCoupe({client:'ACME',ref:'KX1',numCmd:'C100',date:'2026-07-01T09:00:00Z'},ctx)===true,'fiche POSTÉRIEURE au plan → déjà coupé (masqué du planning)');
ok(_plnDejaCoupe({client:'ACME',ref:'KX1',numCmd:'C100',date:'2026-07-09T09:00:00Z'},ctx)===false,'🛡 RECOUPE : plan RE-CRÉÉ APRÈS la fiche (n° réutilisé) → PAS coupé (audit #20)');
ok(_plnDejaCoupe({client:'ACME',ref:'KX1',numCmd:'C100',reste:true,date:'2026-07-01'},ctx)===false,'🛡 plan ♻ RESTE même n° → PAS masqué (le solde reste à couper)');
ok(_plnDejaCoupe({client:'ACME',ref:'KX1',numCmd:'C100',resteFromFiche:'F1',date:'2026-07-01'},ctx)===false,'🛡 resteFromFiche → PAS masqué');
ok(_plnDejaCoupe({client:'REF',ref:'RR',numCmd:'C300',date:'2026-07-01'},ctx)===false,'🛡 fiche REFUSÉE (valide:false) → plan RESTE visible au planning (audit #1)');
ok(_plnDejaCoupe({client:'ACME',ref:'KX1',numCmd:'',date:'2026-07-01'},ctx)===false,'plan SANS n° → jamais considéré coupé');
ok(_plnDejaCoupe({client:'NEUF',ref:'ZZ',numCmd:'C999',date:'2026-07-01'},ctx)===false,'plan sans fiche → pas coupé');

// ── 3c) _hygienePlansToArchive (détection PARTAGÉE bouton + AUTO) : mêmes gardes ──
global._hygienePlansToArchive=eval('('+fnOf('_hygienePlansToArchive')+')');
global.fichesCache=[{client:'ACME',ref:'KX1',numCmd:'C100',date:'2026-07-05'},{client:'REF',ref:'RR',numCmd:'C300',valide:false,date:'2026-07-05'}];
global.savesCache=[
  {_id:'a1',client:'ACME',ref:'KX1',numCmd:'C100',date:'2026-07-01'},  // fiche postérieure → à archiver
  {_id:'a2',client:'ACME',ref:'KX1',numCmd:'C100',reste:true,date:'2026-07-01'},    // RESTE → JAMAIS
  {_id:'a3',client:'REF',ref:'RR',numCmd:'C300',date:'2026-07-01'},    // fiche REFUSÉE → PAS coupé
  {_id:'a4',client:'NEUF',ref:'ZZ',numCmd:'C900',date:'2026-07-01'},   // pas de fiche → non
  {_id:'a5',client:'ACME',ref:'KX1',numCmd:'C100',deleted:true,date:'2026-07-01'},  // déjà supprimé → ignoré
  {_id:'a6',client:'ACME',ref:'KX1',numCmd:'C100',date:'2026-07-09'},  // RECOUPE (plan après fiche) → PAS archivé
];
const arch=_hygienePlansToArchive().map(s=>s._id).sort();
ok(arch.length===1&&arch[0]==='a1','_hygienePlansToArchive : seul le vrai doublon (fiche postérieure) — obtenu '+JSON.stringify(arch));
ok(!arch.includes('a2'),'🛡 RESTE exclu');
ok(!arch.includes('a3'),'🛡 fiche REFUSÉE → plan PAS archivé');
ok(!arch.includes('a6'),'🛡 RECOUPE (plan re-créé après la fiche) PAS archivé (audit #20 CRITIQUE)');

// ── 3b) hygieneDryRun : mêmes gardes ──
global.savesCache=[
  {_id:'s1',client:'ACME',ref:'KX1',numCmd:'C100',date:'2026-07-01'},                 // doublon vrai → détecté
  {_id:'s2',client:'ACME',ref:'KX1',numCmd:'C100',reste:true,date:'2026-07-01'},      // RESTE → JAMAIS
  {_id:'s3',client:'NEUF',ref:'ZZ',numCmd:'C999',date:'2026-07-01'},                  // pas de fiche → non
];
global.brouillonsCache=[];
const _log=console.log; console.log=()=>{};   // silence l'aperçu
const dr=hygieneDryRun(); console.log=_log;
ok(dr.plans.length===1&&dr.plans[0]==='s1','hygieneDryRun : 1 seul plan détecté (le vrai doublon)');
ok(!dr.plans.includes('s2'),'🛡 hygieneDryRun : le plan RESTE est EXCLU du nettoyage');

// ── 4) estimation via le MOTEUR réel ──
// 10×500 sur mère 1000 (edge 0, lame 0), longueur 500 m → 5 mères → 2500 m
const sEst={_id:'e1',date:'d',refGroups:[{ref:'KX',longueur:'500',mother:1000,edge:0,blade:0,machine:'feba',rows:[{qty:10,width:500}]}]};
const est=_plnPlanMeters(sEst);
ok(est&&est.metres===2500,'métrage = longueur × nb bobines mères du MOTEUR (2500 m pour 5 mères × 500 m) — obtenu : '+(est&&est.metres));
ok(est&&est.byMach.feba===2500,'métrage ventilé par machine');
global.dujDebit=(mk,op)=>mk==='feba'?{d:1000,n:5,src:'machine'}:{d:800,n:20,src:'global'};
ok(Math.abs(_plnHoursOn(sEst,'feba')-2.5)<1e-9,'durée = métrage ÷ débit médian machine (2 h 30)');
ok(_plnHoursOn(sEst,'maveg')===0,'[L148 revue #10] MAVEG ne coupe RIEN de cette commande (∉ byMachDetail) → 0 h (avant : repli sur le total = double-comptage avec les fantômes L145)');
ok(_plnHoursPart('maveg',{metres:1000,nbMother:2,nbDaughters:8})===null,'débit en repli GLOBAL → null (jamais un faux chiffre, affiché « — »)');
ok(_plnH(2.5)==='≈ 2 h 30','format « ≈ 2 h 30 »');
ok(_plnH(null)==='—','pas de donnée → « — »');
const sSansLong={_id:'e2',date:'d',refGroups:[{ref:'KX',longueur:'',mother:1000,edge:0,blade:0,machine:'feba',rows:[{qty:2,width:400}]}]};
ok(_plnPlanMeters(sSansLong)===null,'plan sans métrage → estimation null (« — »)');

// ── 5) plnSetPlan : optimiste + audit + retour arrière sur refus ──
global.canManageData=()=>true;
global.plnCanEdit=eval('('+fnOf('plnCanEdit')+')');
global.renderPlanning=()=>{};
global.boundedWrite=(p,ms)=>p;
global._isQueuedWrite=eval('('+fnOf('_isQueuedWrite')+')');   // [L139] détecte une écriture en file (queued/__TIMEOUT__)
let audits=[];global.logAudit=(a,c,id,txt,meta)=>{audits.push({a,c,id,txt,meta});return Promise.resolve();};
let writes=[];let _rejectNext=null;
global.db={collection:()=>({doc:id=>({update:payload=>{writes.push({id,payload});return _rejectNext?Promise.reject(_rejectNext):Promise.resolve();}})})};
global._plnWriteBusy=new Set();   // [L118] verrou d'écriture par sid
global.plnSetPlan=eval('('+fnOf('plnSetPlan')+')');
global.savesCache=[{_id:'p1',client:'ACME',numCmd:'C100'}];
(async()=>{
  const r1=await plnSetPlan('p1','2026-07-15','maveg');
  const p=savesCache[0];
  ok(r1===true&&p.plannedDate==='2026-07-15'&&p.plannedMachine==='maveg','pose : champs écrits (optimiste + Firestore)');
  ok(writes.length===1&&writes[0].payload.plannedDate==='2026-07-15'&&writes[0].payload.plannedMachine==='maveg','Firestore : update {plannedDate,plannedMachine} uniquement');
  ok(audits.length===1&&audits[0].a==='planning'&&/posé 2026-07-15/.test(audits[0].txt),'logAudit : pose tracée');
  await plnSetPlan('p1',null,null);
  ok(p.plannedDate===null&&p.plannedMachine===null&&/retiré/.test(audits[1].txt),'retrait : champs nullés + audit « retiré »');
  // refus de règles → retour arrière
  _rejectNext=new Error('Missing or insufficient permissions.');
  const r3=await plnSetPlan('p1','2026-07-16','feba');
  ok(r3===false&&p.plannedDate===null&&p.plannedMachine===null,'refus permission → retour arrière complet (rien de cassé)');
  ok(/REFUSÉ/.test(toasts[toasts.length-1].m),'refus → message clair règles Firestore');
  _rejectNext=null;
  // lecture seule
  global.canManageData=()=>false;
  const r4=await plnSetPlan('p1','2026-07-17','feba');
  ok(r4===false&&p.plannedDate===null,'atelier (lecture seule) → écriture bloquée');
  // ── multi-jours (L119) : plnSetPlan(...,days) + plnSetDays ──
  global.canManageData=()=>true; writes.length=0;
  global.plnSetDays=eval('('+fnOf('plnSetDays')+')');
  await plnSetPlan('p1','2026-07-20','feba',3);
  ok(p.plannedDays===3,'étalement : plannedDays=3 dans le cache');
  ok(writes[writes.length-1].payload.plannedDays===3,'Firestore : plannedDays inclus dans l\'update');
  ok(/sur 3 j/.test(audits[audits.length-1].txt),'audit : « sur 3 j » tracé');
  await plnSetDays('p1',1);   // resserrer à 1 j (même date/machine)
  ok(p.plannedDays===1&&p.plannedDate==='2026-07-20'&&p.plannedMachine==='feba','plnSetDays(1) : resserré, date/machine conservées');
  await plnSetPlan('p1',null,null);
  ok(p.plannedDate===null&&(p.plannedDays===null||p.plannedDays===undefined),'retrait : plannedDays effacé aussi');
  // [L169 · audit #19] jours fériés FR exclus de l'étalement
  const _f=_joursFeriesFR(2026);
  ok(_f.has('2026-01-01')&&_f.has('2026-12-25')&&_f.has('2026-05-01')&&_f.has('2026-04-06'),'fériés FR 2026 : 1er janv, Noël, 1er mai, lundi de Pâques (6 avr)');
  global._plnSpanCache={};
  const _span=_plnSpanIsos({plannedDate:'2026-05-01',plannedDays:2});   // vendredi 1er mai (férié) + week-end
  ok(_span.indexOf('2026-05-01')<0 && _span.indexOf('2026-05-02')<0 && _span.indexOf('2026-05-03')<0,'étalement saute le férié (1er mai) et le week-end');
  // [L182] planning optimisé : capacité 7h30/j + étalement auto
  ok(/Math\.ceil\(h\/PLN_OVER_H\)/.test(src),'plnAutoFill : étalement AUTO (D=ceil(h/7,5))');
  ok(/best\.startIso,best\.mk,best\.D/.test(src),'plnAutoFill : pose sur D jours + machine choisie (équilibrage 3 machines)');
ok(/nat=\(native&&mk!==native\)\?1\.5:0/.test(src),'plnAutoFill : équilibrage 3 machines (pénalité machine étrangère = préférence native)');
ok(/D===1\?0:1/.test(src)&&/remStart/.test(src),'plnAutoFill : commande ENTIÈRE d\'abord + BEST-FIT (journées proches de 7h30 — L210)');
ok(/if\(sp\.length<_?D\) break;/.test(src)&&/\+pd<=PLN_OVER_H\+/.test(src),'plnAutoFill/plnSetPlan : D minimal qui TIENT sous 7h30 (jamais de dépassement — L210)');
ok(/notFit\+\+/.test(src),'plnAutoFill : commande sans place sous 7h30 laissée au pool (jamais forcée au-dessus — L210)');
ok(/Math\.min\(14,Math\.ceil\(h\/PLN_OVER_H\)\)/.test(src),'plnAutoFill : D borné à 14 (L208 audit #2)');
  console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 L119 PLANNING VALIDÉ : ISO · garde date/refusée · multi-jours (span/étalement) · fériés · pose/retrait/retour-arrière');
  process.exit(fail?1:0);
})();
