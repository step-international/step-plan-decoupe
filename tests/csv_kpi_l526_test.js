// csv_kpi_l526_test.js — [L526 · demande Celine 16/09/2026] GARDE du CSV tableau de bord (section KPI) recale sur la regle L513 :
// UNE definition du % matiere (_l526PctM2 = perte m² / m² coupes, base bobine mere, comme le CSV fiches et les tuiles), fenetre
// 12 mois glissants sans mois vide (_l526KpiMois), ligne PURE a 30 colonnes (_l526KpiRow), plus le predicat du filtre machine
// (_l526MachKeep). L ancien pertePct (moyenne de f.pct, base laize utile) n est PLUS exporte. Ne couvre pas le navigateur.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
function grab(n){ try{ return eval('('+fnOf(n)+')'); }catch(e){ ok(false,'fonction '+n+' introuvable ('+e.message+')'); return null; } }
global._l517Num=grab('_l517Num');
global._l526PctM2=grab('_l526PctM2');
const KEEP=grab('_l526MachKeep'), MOIS=grab('_l526KpiMois'), ROW=grab('_l526KpiRow');
const mH=src.match(/^const _L526_KPI_HDR=(\[[^\]]*\]);/m); const HDR=mH?eval('('+mH[1]+')'):null;
ok(!!HDR,'en-tete _L526_KPI_HDR trouve en debut de ligne');
const col=(r,n)=>{ const i=HDR.indexOf(n); if(i<0) throw new Error('colonne absente : '+n); return r[i]; };

console.log('── 1. structure : 30 colonnes, libelles du CSV fiches, anciennes colonnes disparues ──');
if(HDR&&ROW){
  const K={mois:'2026-07',regleVer:'L513',nbFiches:2,totalBobines:4,m2:4200,perteM2:193,dechetM2:78.5,chuteM2:1771,pertePct:7.4,tempsSec:0,calcWarn:0,machines:{FEBA:{bobines:3,secLaize:0,perteM2:185.5},MAVEG:{bobines:1,secLaize:0,perteM2:7.5},CEVENINI:{bobines:0,secLaize:0,perteM2:0}},chutesPieces:0};
  const r=ROW(K,'2026-09');
  ok(HDR.length===30&&r.length===30,'30 colonnes en-tete et 30 cellules (meme nombre qu avant : aucun decalage) → '+HDR.length+' / '+r.length);
  ok(HDR.indexOf('Perte %')<0&&HDR.indexOf('Rendement %')<0&&HDR.indexOf('FEBA perte %')<0,'« Perte % » (base utile), « Rendement % » et « X perte % » ont disparu');
  ok(HDR.join(';').indexOf('m²;Perte % (m²);Perte m²;Déchet m²;Déchet %;Chutes gardées m²')>=0,'bloc matiere dans l ORDRE du CSV fiches : m² ; Perte % (m²) ; Perte m² ; Déchet m² ; Déchet % ; Chutes gardées m²');
  console.log('── 2. jeu de reference kpi_test (m² 4200, perte 193, dechet 78,5, ancien pertePct 7,4) ──');
  ok(col(r,'Perte % (m²)')==='4,6','Perte % (m²) = 193 / 4200 = 4,6 (et NON 7,4 = ancien pertePct) → '+col(r,'Perte % (m²)'));
  ok(col(r,'Déchet %')==='1,9','Dechet % = 78,5 / 4200 = 1,9 → '+col(r,'Déchet %'));
  ok(col(r,'Déchet m²')==='78,5'&&col(r,'m²')==='4200'&&col(r,'Perte m²')==='193','virgule FR sur les decimaux, entiers intacts → '+col(r,'Déchet m²')+' / '+col(r,'m²')+' / '+col(r,'Perte m²'));
  ok(col(r,'FEBA perte m²')==='185,5'&&col(r,'MAVEG perte m²')==='7,5'&&col(r,'FEBA bob')==='3','par machine : perte m² L513 (ce que l ecran affiche), plus de % ancienne base → '+col(r,'FEBA perte m²')+' / '+col(r,'MAVEG perte m²'));
  ok(col(r,'Statut')==='figé','statut « figé » → '+col(r,'Statut'));
  console.log('── 3. mois fige AVANT L513 : jamais un faux 0, jamais un repli sur l ancien pertePct ──');
  const O={mois:'2026-03',nbFiches:4,totalBobines:9,pertePct:3.2,tempsSec:3600,machines:{FEBA:{bobines:9,secLaize:40}}};
  const ro=ROW(O,'2026-09');
  ok(/ancienne définition \(avant L513\)/.test(col(ro,'Statut')),'statut porte « ancienne définition (avant L513) » → '+col(ro,'Statut'));
  ok(col(ro,'Perte % (m²)')==='n/d'&&col(ro,'Perte m²')==='n/d'&&col(ro,'m²')==='n/d'&&col(ro,'FEBA perte m²')==='n/d','m², Perte m², % et perte machine en n/d');
  ok(col(ro,'FEBA bob')==='9'&&col(ro,'Temps (h)')==='1','bobines et temps rendus (9 ; 1 h) → '+col(ro,'FEBA bob')+' / '+col(ro,'Temps (h)'));
  console.log('── 4. mois courant avec replis ──');
  const rc=ROW(Object.assign({},K,{mois:'2026-09',calcWarn:2}),'2026-09');
  ok(col(rc,'Statut')==='EN COURS (live) · 2 calcul(s) incertain(s)','statut « EN COURS (live) · 2 calcul(s) incertain(s) » (meme mot que la tuile) → '+col(rc,'Statut'));
}
console.log('── 5. fenetre 12 mois glissants, mois vides omis, mois courant exclu, tri croissant ──');
if(MOIS){
  const fen=['2026-09','2026-08','2026-07','2026-06','2026-05','2026-04','2026-03','2026-02','2026-01','2025-12','2025-11','2025-10'];
  const out=MOIS([{mois:'2024-10',nbFiches:5},{mois:'2025-10',nbFiches:0,totalBobines:0},{mois:'2025-11',nbFiches:3},{mois:'2026-08',nbFiches:0,totalBobines:2},{mois:'2026-09',nbFiches:9}],'2026-09',fen).map(a=>a.mois);
  ok(out.join(',')==='2025-11,2026-08','hors fenetre (2024-10) exclu, vide (2025-10) exclu, courant (2026-09) exclu, tri croissant → '+out.join(','));
}
console.log('── 6. _l526PctM2 : une definition, arrondi au dixieme, null (jamais 0) si inconnu ──');
if(global._l526PctM2){
  const P=global._l526PctM2;
  ok(P(193,4200)===4.6&&P(78.5,4200)===1.9,'193/4200 = 4,6 ; 78,5/4200 = 1,9 → '+P(193,4200)+' / '+P(78.5,4200));
  ok(P(5,0)===null&&P(null,10)===null&&P(undefined,10)===null,'denominateur 0 ou terme inconnu → null');
  ok(P(0,10)===0,'vrai zero : 0 / 10 = 0');
}
console.log('── 7. _l526MachKeep : machine OU relais, normalisation, ALL ──');
if(KEEP){
  ok(KEEP({machine:'FEBA',machine2:'MAVEG'},'MAVEG')===true,'relais machine2 = MAVEG → gardee sous MAVEG');
  ok(KEEP({machine:' feba '},'FEBA')===true,'« feba » avec espaces → gardee sous FEBA');
  ok(KEEP({machine:'FEBA'},'MAVEG')===false,'FEBA seule → exclue sous MAVEG');
  ok(KEEP({machine:'FEBA'},'ALL')===true&&KEEP(null,'FEBA')===false,'ALL garde tout ; objet absent exclu');
  ok(KEEP({machine:'FEBA',machineChg:{to:'maveg',bob:'3'}},'MAVEG')===true,'changement de machine en cours de fiche (machineChg.to) → gardee sous MAVEG (revue adverse)');
  const F=[{machine:'FEBA'},{machine:'MAVEG'},{machine:'FEBA',machine2:'MAVEG'}];
  ok(F.filter(f=>KEEP(f,'MAVEG')).length===2,'le filtre est un simple sous-ensemble de fiches (2 sur 3 sous MAVEG)');
}
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 CSV KPI L526 OK : '+total+' verifications'));
process.exit(fail?1:0);
