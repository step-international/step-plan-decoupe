// restes_l558_test.js — [L558 · decisions Celine 28/10/2026, responsable qualite · contre-lecture 3 angles] RESTE DE LAIZE GARDE par bobine,
// SANS non-conformite : drapeau resteGarde (meta de ligne, predicat UNIQUE _l558Garde, purge du drapeau perime, emis / restaure / partage / solde),
// bouton « ✂ Chute gardée » + rappel ORANGE (seuil unique PERTE_LAIZE_ALERTE_MM = 20 mm) sur la bobine en cours en paysage, pastille GARDÉ,
// toast APRES la coupe si oubli (jamais bloquant), recap dans le volet de cloture (setter idempotent, re-rendu local, « annuler », anti-rebond,
// jamais une bobine d un collegue), _l513Matiere : le reste garde passe de PERTE a CHUTES GARDEES (invariant tenu, resteGardeN / M2 exposes),
// correction admin (case), papier : « Chute N mm » + « N reste(s) garde(s) » depuis la source unique. Donnees FICTIVES, aucun reseau.
// Fonctions VRAIES (extraites du source) sur un DOM FACTICE minimal ; une fonction absente = echec compte (le test continue : vu ROUGE un a un sur L557).
const fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const shot=fs.readFileSync(path.join(__dirname,'shot.mjs'),'utf8');
const bat=fs.readFileSync(path.join(__dirname,'battery.sh'),'utf8');
const ci=fs.readFileSync(path.join(ROOT,'.github','workflows','static.yml'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)return src.slice(i,j+1);}}throw new Error('non fermee '+n);}
const F=n=>{ try{ return fnOf(n); }catch(e){ return ''; } };   /* non fatal : une fonction absente rend '' (les regex echouent, le test CONTINUE) */
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
let fini=false; process.on('exit',c=>{ if(!fini&&c===0){ console.log('💥 test non termine : ROUGE'); process.exitCode=1; } });
const near=(a,b,t)=>Math.abs(a-b)<=(t||0.11);

ok(/const APP_VERSION='\d{4}\.\d\d\.\d\d-L(55[8-9]|5[6-9]\d|[6-9]\d\d|\d{4,})';/.test(src),'APP_VERSION >= L558');
const mS=src.match(/^const PERTE_LAIZE_ALERTE_MM=(\d+);/m); ok(!!mS&&+mS[1]===20,'seuil unique PERTE_LAIZE_ALERTE_MM = 20 mm (decision Celine 28/10 : on garde 20, pas 40 ; garde-fou vert par construction) → '+(mS&&mS[1]));
global.PERTE_LAIZE_ALERTE_MM=mS?+mS[1]:20;
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
const CHARGEES=[]; ['parseNum','parseConf','calcStats','_refIdKey','_refKeyOf','_l506RefGroupFor','_l505HorsPlan','_l507GroupUseful','fmt','ncLoss','_l513Matiere','_l513MatSig','_l516EstSolde','_l516ChipEtat','_l558Etat','_l558Conf','_l558Garde','_l558Purge','_l558Lire','_l558Set','_l558Toggle','_l558Rappel','_l558Candidats','_l558NonGardes','_l558VoletHtml','_l558VoletSet','_shareQualityRead','_shareQualityApply','getFicheLinesData'].forEach(n=>{ try{ global[n]=eval('('+fnOf(n)+')'); CHARGEES.push(n); }catch(e){ global[n]=function(){ return {}; }; } });   /* fonction absente → {} : chaque assertion qui en depend est ROUGE et le test CONTINUE (compte rouge honnete sur L557) */
ok(CHARGEES.length===29,'29 fonctions VRAIES extraites du source → '+CHARGEES.length+(CHARGEES.length<29?' (absentes : '+['_l558Conf','_l558Garde','_l558Purge','_l558Lire','_l558Set','_l558Toggle','_l558Rappel','_l558Candidats','_l558NonGardes','_l558VoletHtml','_l558VoletSet'].filter(n=>CHARGEES.indexOf(n)<0).join(', ')+')':''));
global.normConf=(function(){ try{ return eval('('+fnOf('normConf')+')'); }catch(e){ const m=src.match(/^(?:const|let|var) normConf=([^\n]+?);\s*(?:\/\/.*)?$/m); if(!m) throw e; return eval('('+m[1]+')'); } })();   /* normConf est declaree en const (pas en function) */
global._l507Traced=new WeakSet(); let warns=0; global._l505Warn=function(){ warns++; };
const T=(f)=>{ try{ return f(); }catch(e){ return 'ERR '+(e&&e.message||e); } };   /* une exception = valeur 'ERR …' (jamais un test qui s arrete) */

console.log('── 1. calcul matiere : le reste GARDE passe de PERTE a CHUTES GARDEES (EXECUTE, vraie _l513Matiere) ──');
{ const L=(conf,x)=>Object.assign({conf:conf,coupee:true,useful:2090},x||{});
  const f0={mother:2100,useful:2090,blade:0,longueur:'1000',ficheDetail:[L('1x1180'),L('1x1180'),L('1x1180')]};   /* CONTISTEEL simplifie : 3 bobines, reste 910 mm chacune, derniere = solde */
  const m0=_l513Matiere(f0);
  ok(m0.ok&&near(m0.perteM2,2*910+3*10)&&near(m0.chutesM2,910)&&near(m0.m2Coupes,3*2100)&&near(m0.perteM2+m0.chutesM2+m0.dechetM2+m0.clientM2,m0.m2Coupes)&&m0.resteGardeN===0&&m0.resteGardeM2===0,'sans marquage : les 2 restes intermediaires (910 mm) sont en PERTE, le dernier en chute gardee, invariant tenu, resteGardeN 0 → perte '+m0.perteM2+' chutes '+m0.chutesM2);
  const f1={mother:2100,useful:2090,blade:0,longueur:'1000',ficheDetail:[L('1x1180',{resteGarde:true}),L('1x1180'),L('1x1180')]};
  const m1=_l513Matiere(f1);
  ok(m1.ok&&near(m1.perteM2,910+30)&&near(m1.chutesM2,2*910)&&near(m1.resteM2,910)&&near(m1.lamesM2+m1.bordsM2+m1.resteM2,m1.perteM2)&&near(m1.perteM2+m1.chutesM2+m1.dechetM2+m1.clientM2,m1.m2Coupes),'bobine 1 marquee « reste garde » : 910 m² passent de perte a chutes gardees, decomposition et invariant tenus → perte '+m1.perteM2+' chutes '+m1.chutesM2);
  ok(m1.resteGardeN===1&&near(m1.resteGardeM2,910),'resteGardeN / resteGardeM2 exposes (papier, plafond L559) → '+m1.resteGardeN+' / '+m1.resteGardeM2);
  const f2={mother:2100,useful:2090,blade:0,longueur:'1000',ficheDetail:[L('1x1180',{resteGarde:true}),L('1x1180',{resteGarde:true}),L('1x1180',{resteGarde:true})]};
  const m2=_l513Matiere(f2); ok(m2.ok&&near(m2.perteM2,30)&&near(m2.chutesM2,3*910)&&m2.resteGardeN===2,'toutes gardees (derniere comprise : deja solde) : perte = bords seuls, chutes = 3 restes, resteGardeN = 2 (la derniere ne compte pas : elle etait deja solde) → '+m2.resteGardeN);
  const f2b={mother:2100,useful:2090,blade:0,longueur:'1000',ficheDetail:[L('1x1180',{resteGarde:true,phaseEnd:true}),L('1x1180',{resteGarde:true,actChutes:true}),L('1x1180')]};
  const m2b=_l513Matiere(f2b); ok(m2b.ok&&m2b.resteGardeN===0&&near(m2b.chutesM2,3*910),'fin de phase / ✂ Chutes NC marquees en plus : chutes inchangees, resteGardeN = 0 (le drapeau n y change rien)');
  const f2c={mother:2100,useful:2090,blade:0,longueur:'1000',manqueMatiere:true,ficheDetail:[L('1x1180',{resteGarde:true}),L('1x1180',{resteGarde:true}),L('1x1180',{coupee:false,resteGarde:true})]};
  const m2c=_l513Matiere(f2c); ok(m2c.ok&&m2c.resteGardeN===1&&near(m2c.chutesM2,2*910),'fiche manque-matiere : la bobine NON coupee est hors perimetre meme marquee (keepNc) ; derniere COUPEE = solde → resteGardeN 1 → '+m2c.resteGardeN);
  const f3={mother:2100,useful:2090,blade:0,longueur:'1000',ficheDetail:[L('1x1180'),L('1x300',{recut:true,rollW:600,useful:600,resteGarde:true}),L('1x1180')]};
  const m3=_l513Matiere(f3); ok(m3.ok&&near(m3.perteM2,910+20+300)&&m3.resteGardeN===0,'un rouleau ♻ marque par erreur reste en PERTE (jamais une chute) → perte '+m3.perteM2);
  const f4={mother:2100,useful:2090,blade:5,longueur:'1000',ficheDetail:[L('2x500 + 1x900',{resteGarde:true,actDechet:true,ncLots:[{q:1,w:500}]}),L('1x1180')]};
  const m4=_l513Matiere(f4); ok(m4.ok&&m4.dechetM2>0&&near(m4.chutesM2,(2090-1900-10)+(2090-1180)),'reste garde ET bobineau NC jete sur la meme bobine : le reste va en chutes, le bobineau en dechet (drapeaux orthogonaux) → dechet '+m4.dechetM2+' chutes '+m4.chutesM2);
  ok(m1.regleVer==='L513','la regle reste L513 (les anciennes fiches sans drapeau donnent le meme resultat ; pas de recalcul force)');
  const mKo=_l513Matiere({mother:2100,useful:2090,blade:0,longueur:'',ficheDetail:[L('1x1180',{resteGarde:true})]}); ok(mKo.ok===false&&mKo.resteGardeN===0&&mKo.resteGardeM2===null,'fiche non calculable : resteGardeM2 null (jamais un 0 a la place d un inconnu)'); }

console.log('── 2. signature d edition, pastille, etat etendu (EXECUTE) ──');
{ const f={mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[{conf:'4x502',useful:2090}]};
  ok(_l513MatSig(f,f.ficheDetail)!==_l513MatSig(f,[Object.assign({},f.ficheDetail[0],{resteGarde:true})]),'cocher « chute gardee » → signature differente : la correction admin recalcule f.mat (mutation « signature aveugle » → rouge)');
  global.ficheLines=[{id:'a',ref:'R1'},{id:'b',ref:'R1'},{id:'c',ref:'R1'}];
  ok(_l516EstSolde({id:'a',ref:'R1',resteGarde:true})===true&&_l516EstSolde({id:'a',ref:'R1'})===false&&_l516EstSolde({id:'a',ref:'R1',recut:true,resteGarde:true})===false,'_l516EstSolde : reste garde = solde ; rouleau ♻ jamais');
  const E=_l558Etat;
  ok(E(140,false,false,20).cls==='rappel'&&E(140,false,false,20).label==='PERTE 140 mm','140 mm non garde → RAPPEL (orange) « PERTE 140 mm »');
  ok(E(140,false,true,20).cls==='chute'&&E(140,false,true,20).label==='GARDÉ 140 mm','140 mm garde → « GARDÉ 140 mm » (ambre)');
  ok(E(140,true,false,20).cls==='solde'&&E(140,true,false,20).label==='SOLDE 140 mm','derniere bobine → SOLDE (inchange)');
  ok(E(19.9,false,false,20).cls===''&&E(20,false,false,20).cls==='rappel','seuil 20 mm : 19,9 → neutre (perte assumee), 20 → rappel');
  ok(E(-10,false,true,20).cls==='over'&&E(-10,true,false,20).cls==='over','⚠ DÉPASSE prime sur tout (L353)');
  ok(E(140,false,false,undefined).cls==='rappel','seuil absent → constante');
  const E0=_l516ChipEtat; ok(E0(40,false,20).cls==='perte'&&E0(40,true,20).cls==='solde','_l516ChipEtat intacte : sert au rouleau ♻ (etat L516 historique)'); }

/* ── DOM factice minimal : 3 bobines meres (R1), 1 rouleau ♻ ; b1 coupee par moi, b2x coupee par un collegue (coupee-other), b3 = derniere (solde) ── */
const DOM={}; let toasts=[], renders=0, repubs=[], autosaves=0, landscape=true, outer=[];
function mkCL(){ const s=new Set(); return {contains:c=>s.has(c),add:c=>{s.add(c);},remove:c=>{s.delete(c);},toggle:(c,v)=>{ if(v) s.add(c); else s.delete(c); }}; }
function mk(id,props){ const el=Object.assign({id:id,value:'',textContent:'',classList:mkCL(),querySelector(){ return null; },querySelectorAll(){ return []; },dataset:{},style:{},checked:false},props||{}); Object.defineProperty(el,'outerHTML',{set(v){ outer.push(v); },get(){ return ''; }}); el.remove=function(){ delete DOM[id]; }; DOM[id]=el; return el; }
global.document={getElementById:id=>DOM[id]||null, querySelector:()=>null, querySelectorAll:()=>[], createElement:()=>mk('_tmp'+Math.random(),{}), body:{classList:mkCL()}, activeElement:null};
global.window=global;
global.showToast=function(m,k){ toasts.push([String(m),k||'']); };
global._l340RenderChuteChip=function(){ renders++; };
global._l426ShareRepub=function(id){ repubs.push(id); };
global.autosaveDraftTick=function(){ autosaves++; };
global.getUseful=()=>2090; global.getBlade=()=>0;
global._l554PosDe=id=>'bobine '+((DOM['pos_'+id]||{}).textContent||'?');
global._l554RefDe=()=>'';
global.esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
global.fmmIsMulti=()=>false;
global._isLandscapeFiche=()=>landscape;
global._l408NcLots=()=>[]; global.updateAllCumuls=()=>{}; global.updateNC=()=>{}; global.updateTest2Subs=()=>{}; global.toggleAction=()=>{};
global._l558VoletT=0;
function fixture(){ for(const k of Object.keys(DOM)) delete DOM[k]; toasts=[]; renders=0; repubs=[]; autosaves=0; outer=[]; landscape=true; global._l558VoletT=0;
  global.ficheLines=[{id:'b1',ref:'R1',useful:2090,blade:0},{id:'b2x',ref:'R1',useful:2090,blade:0},{id:'r1',ref:'R1',recut:true,rollW:600,useful:600,blade:0},{id:'b3',ref:'R1',useful:2090,blade:0}];
  mk('b1'); DOM.b1.classList.add('coupee'); mk('flConf_b1',{value:'1×1180'}); mk('pos_b1',{textContent:'1/3'});
  mk('b2x'); DOM.b2x.classList.add('coupee'); DOM.b2x.classList.add('coupee-other'); mk('flConf_b2x',{value:'1×1180'}); mk('pos_b2x',{textContent:'2/3'});
  mk('r1'); DOM.r1.classList.add('coupee'); mk('flConf_r1',{value:'1×100'});
  mk('b3'); mk('flConf_b3',{value:'1×1180'}); mk('pos_b3',{textContent:'3/3'}); }
const L1=()=>ficheLines[0];

console.log('── 3. predicat unique du drapeau, purge, lecture (EXECUTE sur DOM factice) ──');
fixture();
ok(T(()=>_l558Conf('5×80 + 3×50')===_l558Conf('5x80+3x50')&&_l558Conf('5×80 + 3×50')==='5×80+3×50'),'_l558Conf : comparaison du marquage sans espaces ni x/× (retaper la meme configuration ne fait pas tomber le drapeau)');
L1().resteGarde=true; L1().resteGardeConf=_l558Conf('1×1180');
ok(T(()=>_l558Garde(L1())===true),'_l558Garde : drapeau pose + configuration inchangee → VALIDE');
DOM.flConf_b1.value='1×1000';
ok(T(()=>_l558Garde(L1())===false),'_l558Garde : configuration changee → INVALIDE');
ok(T(()=>_l558Purge(L1())===true&&L1().resteGarde===false&&L1().resteGardeConf===''),'_l558Purge : le drapeau perime tombe (resteGarde false, conf effacee)');
ok(T(()=>_l558Purge(L1())===false),'_l558Purge : rien a purger → false');
ok(T(()=>_l558Garde({id:'zz',resteGarde:true,resteGardeConf:'x'})===true),'_l558Garde : ligne sans champ (hors DOM) → le drapeau fait foi');
ok(T(()=>_l558Garde({id:'r1',recut:true,resteGarde:true})===false),'_l558Garde : rouleau ♻ → jamais');
DOM.flConf_b1.value='1×1180';
ok(T(()=>{ const x=_l558Lire('b1'); return x&&near(x.w,910)&&x.soldeRegle===false&&x.garde===false&&x.over===false; }),'_l558Lire b1 : reste 910 mm, pas solde, pas garde');
ok(T(()=>{ const x=_l558Lire('b3'); return x&&x.soldeRegle===true&&x.garde===false; }),'_l558Lire b3 (derniere de sa ref) : solde par la REGLE');
ficheLines[3].resteGarde=true; ficheLines[3].resteGardeConf=_l558Conf('1×1180');
ok(T(()=>{ const x=_l558Lire('b3'); return x&&x.soldeRegle===true&&x.garde===false; }),'_l558Lire b3 marquee (admin / partage) : le solde de la regle PRIME, jamais « GARDÉ » (l etiquette solde s imprime)');
ficheLines[3].resteGarde=false; ficheLines[3].resteGardeConf='';
ok(T(()=>_l558Lire('r1')===null),'_l558Lire rouleau ♻ → null');
L1().resteGarde=true; L1().resteGardeConf=_l558Conf('1×1180');
ok(T(()=>{ const x=_l558Lire('b1'); return x&&x.garde===true; }),'_l558Lire b1 marquee → garde');
DOM.flConf_b1.value='1×1000';
ok(T(()=>{ const x=_l558Lire('b1'); return x&&x.garde===false&&L1().resteGarde===false&&near(x.w,1090); }),'_l558Lire b1 configuration changee APRES la coupe : drapeau purge, reste recalcule 1090 (le rappel revient, mutation « purge seulement sur la carte en cours » → rouge)');
DOM.flConf_b1.value='1×1180';

console.log('── 4. rappel, candidats du recap (EXECUTE) ──');
fixture();
ok(T(()=>near(_l558Rappel('b1'),910)),'_l558Rappel b1 non gardee : 910 mm (>= seuil)');
ok(T(()=>_l558Rappel('b3')===0),'_l558Rappel b3 : 0 (solde par la regle)');
ok(T(()=>_l558Rappel('r1')===0),'_l558Rappel rouleau ♻ : 0');
DOM.flConf_b1.value='1×3000'; ok(T(()=>_l558Rappel('b1')===0),'_l558Rappel depassement : 0 (⚠ DÉPASSE prime, pas de doublon avec le toast L515)');
DOM.flConf_b1.value='1×2080'; ok(T(()=>_l558Rappel('b1')===0),'_l558Rappel reste 10 mm (< 20) : 0 (perte assumee)');
DOM.flConf_b1.value='1×2070'; ok(T(()=>near(_l558Rappel('b1'),20)),'_l558Rappel reste 20 mm : 20 (seuil inclus)');
DOM.flConf_b1.value='1×1180';
L1().resteGarde=true; L1().resteGardeConf=_l558Conf('1×1180'); ok(T(()=>_l558Rappel('b1')===0),'_l558Rappel b1 gardee : 0');
L1().resteGarde=true; L1().resteGardeConf=_l558Conf('1×999'); ok(T(()=>near(_l558Rappel('b1'),910)&&L1().resteGarde===false),'_l558Rappel b1 drapeau PERIME : purge + rappel 910 (mutation « drapeau perime pris pour un solde » → rouge)');
ok(T(()=>{ const c=_l558Candidats(); return c.length===1&&c[0].id==='b1'&&c[0].garde===false&&near(c[0].w,910)&&c[0].lbl==='bobine 1/3'&&c[0].n===1; }),'_l558Candidats : b1 seule (b2x coupee par un COLLEGUE exclue, ♻ exclu, b3 solde exclue), libelle RELATIF « bobine 1/3 »');
ok(T(()=>_l558NonGardes().length===1&&_l558NonGardes()[0].id==='b1'),'_l558NonGardes : b1');
DOM.b1.classList.remove('coupee'); ok(T(()=>_l558Candidats().length===0),'_l558Candidats : une bobine NON coupee n est pas candidate (mutation « filtre des coupees inverse » → rouge)'); DOM.b1.classList.add('coupee');
global._l554RefDe=()=>'KX1045-1 · '; ok(T(()=>_l558Candidats()[0].lbl==='KX1045-1 · bobine 1/3 (n° 1)'),'multi-ref : « KX1045-1 · bobine 1/3 (n° 1) » (numero de la carte + rang global du papier)'); global._l554RefDe=()=>'';

console.log('── 5. setter idempotent, bascule, refus (EXECUTE) ──');
fixture();
ok(T(()=>_l558Set('b1',true)===true&&L1().resteGarde===true&&L1().resteGardeConf==='1×1180'&&repubs.join()==='b1'&&autosaves===1&&renders===1&&toasts.length===1&&toasts[0][1]==='ok'),'_l558Set(b1,true) : drapeau + configuration memorisee, pastille, partage republie, brouillon auto, toast ok');
ok(T(()=>_l558Set('b1',true)===true&&repubs.length===1&&toasts.length===1&&autosaves===1),'_l558Set(b1,true) une 2e fois : IDEMPOTENT (rien ne bouge : ni toast, ni republication — mutation « bascule » → rouge)');
ok(T(()=>_l558Toggle('b1')===false&&L1().resteGarde===false&&L1().resteGardeConf===''&&toasts.length===2&&repubs.length===2),'_l558Toggle(b1) : annule (toast « a nouveau compte en PERTE », republie)');
ok(T(()=>_l558Set('b2x',true)===false&&ficheLines[1].resteGarde!==true&&repubs.length===2&&toasts[toasts.length-1][1]==='err'&&/collègue/.test(toasts[toasts.length-1][0])),'_l558Set sur une bobine coupee par un COLLEGUE : refuse, toast, AUCUNE republication (sa trace « coupee par » reste la sienne)');
ok(T(()=>_l558Set('b3',true)===false&&ficheLines[3].resteGarde!==true&&/SOLDE/.test(toasts[toasts.length-1][0])),'_l558Set sur la derniere bobine (solde par la regle) : refuse avec explication (etiquette solde)');
ok(T(()=>_l558Set('r1',true)===false&&_l558Toggle('r1')===false&&ficheLines[2].resteGarde!==true),'_l558Set / _l558Toggle sur un rouleau ♻ : refuse');
ok(T(()=>_l558Set('zzz',true)===false),'id inconnu : false, sans exception');

console.log('── 6. volet de cloture : rendu pur, re-rendu local, annuler, anti-rebond, portrait (EXECUTE) ──');
fixture();
ok(T(()=>{ landscape=false; const h=_l558VoletHtml(); landscape=true; return h===''; }),'portrait : encadre VIDE (regle 3 : portrait = ecran historique)');
ok(T(()=>{ const h=_l558VoletHtml(); return /id="l558Volet"/.test(h)&&/1 bobine\(s\) avec un reste de 20 mm ou plus non gardé/.test(h)&&/bobine 1\/3 · 910 mm → ✂ garder/.test(h)&&/onclick="_l558VoletSet\('b1',true\)"/.test(h)&&!/annuler/.test(h)&&!/b2x/.test(h); }),'paysage, b1 non gardee : encadre avec « bobine 1/3 · 910 mm → ✂ garder » (setter, pas la bascule), jamais la bobine du collegue');
mk('l558Volet');
ok(T(()=>{ _l558VoletSet('b1',true); return L1().resteGarde===true&&outer.length===1&&/✓ bobine 1\/3 · 910 mm gardé/.test(outer[0])&&/onclick="_l558VoletSet\('b1',false\)">annuler<\/button>/.test(outer[0])&&/Reste\(s\) gardé\(s\)/.test(outer[0]); }),'appui « garder » : drapeau pose, l ENCADRE SEUL est redessine (outerHTML) avec « ✓ bobine 1/3 · 910 mm gardé · annuler » (position stable)');
ok(T(()=>{ _l558VoletSet('b1',false); return L1().resteGarde===true&&outer.length===1; }),'2e appui dans les 500 ms : IGNORE (anti-rebond : un double appui ne bascule pas)');
ok(T(()=>{ global._l558VoletT=0; _l558VoletSet('b1',false); return L1().resteGarde===false&&outer.length===2&&/→ ✂ garder/.test(outer[1]); }),'« annuler » (apres l anti-rebond) : drapeau retire, encadre redessine avec « garder »');
ok(T(()=>{ global._l558VoletT=0; DOM.b1.classList.remove('coupee'); _l558VoletSet('b1',true); const gone=!DOM.l558Volet; DOM.b1.classList.add('coupee'); return gone; }),'plus aucun candidat → l encadre est retire');
ok(T(()=>_l558VoletHtml()!==''&&/min-height:44px/.test(_l558VoletHtml())),'bouton « garder » 44 px');

console.log('── 7. partage : lecture / rejeu du drapeau (EXECUTE, vraies _shareQualityRead / _shareQualityApply) ──');
fixture();
ok(T(()=>_shareQualityRead('b1').rg===false),'_shareQualityRead b1 : rg false');
L1().resteGarde=true; L1().resteGardeConf=_l558Conf('1×1180');
ok(T(()=>_shareQualityRead('b1').rg===true),'_shareQualityRead b1 gardee : rg true');
L1().resteGardeConf=_l558Conf('1×999');
ok(T(()=>_shareQualityRead('b1').rg===false),'_shareQualityRead b1 drapeau PERIME : rg false (jamais un drapeau faux chez l emetteur)');
L1().resteGarde=false; L1().resteGardeConf='';
ok(T(()=>{ _shareQualityApply('b1',{rg:true}); return L1().resteGarde===true&&L1().resteGardeConf==='1×1180'; }),'_shareQualityApply {rg:true} : pose chez l emetteur, lie a SA configuration (mutation « corps ignorant rg » → rouge)');
ok(T(()=>{ _shareQualityApply('b1',{rg:false}); return L1().resteGarde===false; }),'_shareQualityApply {rg:false} : retire (dans les deux sens)');
ok(T(()=>{ L1().resteGarde=true; L1().resteGardeConf='1×1180'; _shareQualityApply('b1',{larg:false}); return L1().resteGarde===true; }),'_shareQualityApply sans rg (collegue reste en L557) : inchange');
ok(T(()=>{ _shareQualityApply('r1',{rg:true}); return ficheLines[2].resteGarde!==true; }),'_shareQualityApply sur un rouleau ♻ : ignore');
ok(/\|\|q\.act\|\|q\.rg\) _prevQ\[lbl\]=q;/.test(src)&&/const _prevRg=\{\}; try\{ \(Array\.isArray\(ficheLines\)\?ficheLines:\[\]\)\.forEach\(function\(l\)\{ const line=document\.getElementById\(l\.id\); if\(!line\|\|line\.classList\.contains\('coupee-other'\)\) return; if\(typeof _l558Garde==='function'&&_l558Garde\(l\)\)/.test(src)&&/if\(lbl&&_prevRg\[lbl\]&&l\.resteGarde!==true\)\{ l\.resteGarde=true; l\.resteGardeConf=_l558Conf\(/.test(src),'miroir du destinataire : le « ✂ Chute gardée » pose AVANT la coupe survit au rafraichissement (toutes ses lignes non verrouillees + la ligne en cours d edition)');

console.log('── 8. envoi / brouillon : getFicheLinesData (EXECUTE) et jumeaux (forme) ──');
fixture();
ok(T(()=>{ const d=getFicheLinesData(); return d.length===4&&d[0].resteGarde===undefined; }),'getFicheLinesData : sans drapeau → undefined (retire du JSON)');
L1().resteGarde=true; L1().resteGardeConf=_l558Conf('1×1180');
ok(T(()=>getFicheLinesData()[0].resteGarde===true),'getFicheLinesData : drapeau VALIDE → true');
L1().resteGardeConf=_l558Conf('1×999');
ok(T(()=>getFicheLinesData()[0].resteGarde===undefined),'getFicheLinesData : drapeau PERIME → undefined (mutation « emis toujours » → rouge)');
ok(T(()=>{ ficheLines[2].resteGarde=true; ficheLines[2].resteGardeConf='1×100'; return getFicheLinesData()[2].resteGarde===undefined; }),'getFicheLinesData : rouleau ♻ → jamais');
ok(/resteGarde:!!data\.resteGarde, resteGardeConf:\(data\.resteGarde\?_l558Conf\(data\.conf\):''\)\}\);/.test(F('addFicheLine')),'meta de ligne : resteGarde + configuration du marquage (_l558Conf)');
ok(/resteGarde:!!ld\.resteGarde,/.test(F('restoreFicheLineFromData')),'restaure (brouillon, partage, reprise) → addFicheLine relie la configuration restauree');
ok(/actAccept:false, resteGarde:false/.test(F('stopManqueMatiere')),'solde manque-matiere : repart sans reste garde');
ok(/!!fd\.actAccept,!!fd\.resteGarde,fd\.ncLots,/.test(F('_l513MatSig')),'signature d edition : le drapeau en fait partie');
ok(/if\(fd\.resteGarde===true&&!fd\.actChutes&&!fd\.phaseEnd&&!lastIdx\.has\(i\)\)\{ rgN\+\+; rgM2\+=w\*k; \}\n\s+if\(fd\.actChutes\|\|fd\.phaseEnd\|\|fd\.resteGarde===true\|\|lastIdx\.has\(i\)\) chutes\+=w\*k; else \{ perte\+=w\*k; pReste\+=w\*k; \}/.test(F('_l513Matiere')),'source unique : predicat chute gardee etendu au drapeau + compte des restes qui changent le calcul');

console.log('── 9. ecran : pastille, note, rouleau ♻, toast apres la coupe, volet, manque-matiere, correction admin, CSS (forme) ──');
const CHIP=F('_l340RenderChuteChip');
ok(/const _x=\(l&&!l\.recut\)\?_l558Lire\(id\):null;/.test(CHIP)&&/const _garde=!!\(_x&&_x\.garde\); const _solde=_x\?_x\.soldeRegle:_l516EstSolde\(l\);/.test(CHIP)&&!/normConf\(conf\)!==\(l\.resteGardeConf/.test(CHIP),'la pastille passe par la lecture unique (purge, solde de la regle, garde valide)');
ok(/const _e=\(l&&l\.recut\)\?_l516ChipEtat\(waste,false,PERTE_LAIZE_ALERTE_MM\):_l558Etat\(waste,_solde,_garde,PERTE_LAIZE_ALERTE_MM\);/.test(CHIP),'rouleau ♻ : etat L516 historique (rouge) ; bobine mere : etat etendu');
ok(/chip\.classList\.toggle\('perte',_e\.cls==='perte'\);/.test(CHIP)&&/chip\.classList\.toggle\('rappel',_e\.cls==='rappel'\); chip\.classList\.toggle\('chute',_e\.cls==='chute'\);/.test(CHIP),'classes de pastille : perte (♻), rappel, chute');
ok(/if\(_e\.cls==='rappel'\|\|_e\.cls==='chute'\|\|_e\.cls==='perte'\)\{ if\(!note\)\{ note=document\.createElement\('div'\); note\.className='l516-note';/.test(CHIP)&&/if\(_e\.cls==='perte'\)\{ note\.textContent='⚠ PERTE '\+fmt\(Math\.abs\(waste\)\)\+' mm · VOIR '\+_l543PilotNom\(\)\+' : laize réutilisable \?'; \}/.test(CHIP),'rouleau ♻ : note L516 historique SANS bouton (jamais un tap mort)');
ok(/'⚠ RESTE '\+fmt\(Math\.abs\(waste\)\)\+' mm · VOIR '\+_l543PilotNom\(\)\+' : laize réutilisable \?'\+' <button type="button" class="l558-btn" onclick="_l558Toggle\(\\''\+id\+'\\'\)" aria-label="Garder ce reste comme chute">✂ Chute gardée<\/button>'/.test(CHIP),'note rappel : « ⚠ RESTE N mm · VOIR DOMINIQUE : laize réutilisable ? » + bouton « ✂ Chute gardée » (formulation L516 conservee)');
ok(/'✂ RESTE GARDÉ '\+fmt\(Math\.abs\(waste\)\)\+' mm — compté en chute gardée, pas en perte \(pas d’étiquette\)'\+' <button type="button" class="l558-btn" onclick="_l558Toggle\(\\''\+id\+'\\'\)" aria-label="Annuler : compter ce reste en perte">annuler<\/button>'/.test(CHIP),'note garde : « ✂ RESTE GARDÉ N mm … pas d’étiquette » + annuler');
ok(!/chip\.title=\(_e\.cls==='over'\)/.test(CHIP),'ancien chip.title mort retire');
const TAP=F('coupeeTapOne');
ok(/if\(!already&&cutNow&&typeof _l558Rappel==='function'&&\(typeof _isLandscapeFiche!=='function'\|\|_isLandscapeFiche\(\)\)\)\{ const _r=_l558Rappel\(id\); if\(_r>0\) showToast\('🟠 Reste '\+fmt\(_r\)\+' mm non gardé = compté en PERTE\. Tu peux encore le garder à la fin, dans l’écran CONFIRMER \(encadré orange\)\.',null,8000\); \}/.test(TAP),'a la coupe : toast APRES la coupe reelle, paysage seulement, 8 s, texte honnete (le rattrapage est dans CONFIRMER)');
ok(TAP.indexOf("showToast('🟠 Reste ")>TAP.indexOf('const cutNow=')&&TAP.indexOf("showToast('🟠 Reste ")>TAP.indexOf('toggleCoupee(id);')&&(TAP.match(/🟠 Reste /g)||[]).length===1,'le toast vient APRES toggleCoupee (jamais avant un refus de coupe), une seule fois');
ok(!/confirm\([^)]*non gardé/.test(TAP)&&!/confirmDlg\([^)]*non gardé/.test(TAP),'JAMAIS bloquant (ni confirm ni confirmDlg)');
ok(/regl:_reglCount,reglMaveg:_reglMaveg,chronoZero:/.test(F('confirmCommandeRecap'))&&!/resteNG/.test(F('confirmCommandeRecap')),'volet : plus de liste passee en parametre (regex L556 intacte)');
ok(/\+\(\(typeof _l558VoletHtml==='function'\)\?_l558VoletHtml\(\):''\)/.test(F('_openVictory'))&&!/id="l558Volet"/.test(F('_openVictory'))&&/📷 Photo des réglages MAVEG \? <span/.test(F('_openVictory')),'volet : encadre rendu par la fonction pure ; encadres L556 intacts');
ok(/_ng558='🟠 '\+_n\+' bobine\(s\) coupée\(s\) avec un reste de '\+PERTE_LAIZE_ALERTE_MM\+' mm ou plus NON gardé : compté en PERTE \(le pilotage peut corriger après coup dans Données > Fiches\)\.\\n\\n';/.test(F('stopManqueMatiere'))&&/\+_ng558\+`⛔ Arrêt manque de matière \?/.test(F('stopManqueMatiere')),'arret manque-matiere : dit les restes non gardes (perte, correction par le pilotage), paysage seulement');
ok(/class="ef-rg-cb"/.test(F('editFicheConfigs'))&&/canManageData\(\)&&!fd\.recut&&fd\.coupee!==false/.test(F('editFicheConfigs'))&&/'\+\(fd\.resteGarde===true\?'checked':''\)\+'/.test(F('editFicheConfigs')),'correction admin : case « ✂ chute gardee » PRE-COCHEE selon le drapeau, pilotage / admin seulement, pas sur un ♻ ni une bobine non coupee');
ok(/if\(_cb\.checked\) _d\.resteGarde=true; else delete _d\.resteGarde;/.test(F('saveFicheConfigs')),'correction admin : la valeur est ecrasee explicitement (…base recopiait l ancienne)');
ok(/\.fl-current \.l516-note\.l558-rappel\{color:var\(--orange\)\}/.test(src)&&/\.fl-current \.l516-note\.l558-garde\{color:#f5b301\}/.test(src)&&/\.fl-current \.l516-note \.l558-btn\{[^}]*min-height:40px/.test(src)&&/\.fl-current \.fl-chute\.rappel\{color:var\(--orange\)\}/.test(src)&&/\.fl-current \.fl-chute\.chute\{color:#f5b301\}/.test(src),'CSS paysage : note orange / ambre, bouton 40 px, pastille rappel / chute');
ok(/\.fl-current \.fl-chute:not\(\.over\):not\(\.perte\):not\(\.solde\):not\(\.rappel\):not\(\.chute\)\{color:var\(--text2\)\}/.test(src),'CSS : le gris B1 (0,5,0) n ecrase plus l orange / l ambre (piege de cascade L516, vu deux fois — la smoke lit la couleur CALCULEE)');
ok(/body\.atelier \.fl-current \.l516-note \.l558-btn\{font-size:17px;min-height:44px\}/.test(src),'mode atelier : bouton 17 px / 44 px');
ok(/^\.l516-note\{display:none\}/m.test(src)&&/\.fh-pills,#soldeSummary,\.fl-chute\{display:none\}/.test(src),'PORTRAIT : note (donc bouton) et pastille n existent qu en paysage ; toast, encadre du volet et manque-matiere bornes par _isLandscapeFiche (tablettes toujours en paysage, decision Celine)');

console.log('── 10. papier (decision Celine 28/10 : papier ok) ──');
const SFD=F('showFicheDetail'), BFP=F('buildFichePrintHTML');
ok(/\?'Solde ':\(\(fd&&fd\.resteGarde===true&&!fd\.recut&&!fd\.phaseEnd&&!fd\.actChutes&&fd\.coupee!==false\)\?'Chute ':'Perte '\)\}\$\{g\.waste\} mm/.test(SFD),'tableau : « Chute N mm » seulement la ou le drapeau compte (pas ♻, pas fin de phase, pas ✂ Chutes NC, pas non coupee) ; « Solde » prime');
ok(/const _ng=\(_m13&&_m13\.ok&&_m13\.resteGardeN>0\)\?_m13\.resteGardeN:0;/.test(BFP)&&/\(' \+ '\+_ng\+' reste\(s\) gardé\(s\)'\)/.test(BFP)&&/else if\(_ng\) chutesLbl=_ng\+' reste\(s\) gardé\(s\)'\+_tot;/.test(BFP),'en-tete : « ✂ Chutes gardées : 1 bobineau … + N reste(s) gardé(s) (total …) » — N depuis la source unique (jamais la derniere bobine)');
ok(!/#[0-9a-fA-F]{3,6}/.test((BFP.match(/const _ng=[\s\S]*?catch\(_\)\{ \}/)||[''])[0]),'aucune nouvelle couleur sur le papier (fiche_print_l553_test : palette)');
ok(!/<!--[^>]*(Celine|Céline|Dominique|Esteban|Christian)[^>]*-->/.test(SFD),'aucun prenom dans un commentaire HTML du gabarit imprime (batterie 1 rouge : l543)');

console.log('── 11. scene smoke + boucles ──');
ok(/'fiche-reste': `document\.querySelectorAll\('#refBlocks \.ref-block \.rb-op-validate'\)/.test(shot)&&/inp\.value='1x612 \+ 2x502 \+ 2x157'/.test(shot)&&/document\.getElementById\('planDriftApplyBtn'\)\.click\(\); S8\.step='applique';/.test(shot)&&/getComputedStyle\(chip\)\.color/.test(shot)&&/document\.getElementById\('coupeeBtn_'\+S8\.id\)\.click\(\); S8\.step='coupe';/.test(shot)&&/vb\.innerHTML=_l558VoletHtml\(\);/.test(shot)&&/S8\.step='fin';/.test(shot),'scene : reste 140 mm, plan APPLIQUE, couleurs calculees, garder / annuler, COUPE reelle, recap, encadre du volet (etapes enchainees)');
ok(/'fiche-reste': "\(function\(\)\{ const s=window\.__l558\|\|\{\}; if\(s\.err\) return 'ERR '\+s\.err; if\(s\.step!=='fin'\) return false;/.test(shot)&&/rgb\(240, 116, 42\)/.test(shot)&&/rgb\(245, 179, 1\)/.test(shot)&&/drapeau perdu a la coupe/.test(shot)&&/anti-rebond/.test(shot)&&/annuler dans le volet/.test(shot),'CHECK en lecture pure : chaine = echec ; orange puis ambre CALCULES, drapeau conserve a la coupe, volet garder / anti-rebond / annuler');
ok(/for s in plan fiche fiche-start fiche-cut fiche-dechet fiche-entretien fiche-reglages fiche-dossier fiche-reste[a-z -]*donnees analyse; do/.test(bat)&&/for s in plan fiche fiche-start fiche-cut fiche-dechet fiche-entretien fiche-reglages fiche-dossier fiche-reste[a-z -]*donnees analyse; do/.test(ci)&&/Smokes \(\d+ scenes/.test(ci),'la batterie ET la CI rejouent la scene');
fini=true; console.log(fail?('💥 '+fail+'/'+total+' ECHEC(S) RESTES L558'):('🏆 RESTES L558 OK : '+total+' verifications')); process.exit(fail?1:0);
