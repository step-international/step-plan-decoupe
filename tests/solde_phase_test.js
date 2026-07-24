// solde_phase_test.js — [L220] GARDE du sélecteur DOMINANT de _palRepack (soldes du milieu → grosse chute en FIN,
// SANS jamais aggraver la perte réelle affichée). Vérifie : (1) les 3 cas réels des captures Esteban ;
// (2) CONSERVATION (aucune pièce perdue) ; (3) déterminisme ; (4) fuzz : DOMINANT n'aggrave JAMAIS ni la perte
// ni le solde du milieu vs l'optimum de rendement d'origine, et correspond exactement à la référence DOMINANT.
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let s=(src.slice(i-6,i)==='async ')?i-6:i;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(s,k+1);}
global.PALETTES_MAX=4;
['expandDemand','buildCounts','calcStats','makeLabel','bestPattern','pack','groupBobines','_palSplitSolde','_palRepack'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
let fail=0; const ok=(c,m)=>{ console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const demandTot=rows=>rows.reduce((s,r)=>s+r.qty,0);

// info RÉELLE depuis _palRepack (ce que l'app affiche)
function palInfo(c){
  const rp=_palRepack(c); if(!rp) return null;
  const pg=rp.planGroups; let midMax=0;
  pg.forEach(g=>{ if(g._phaseEnd) midMax=Math.max(midMax,Math.max(0,c.useful-calcStats(g.pattern,c.blade).total)); });
  const last=pg[pg.length-1];
  let reuse=Math.max(0,c.useful-calcStats(last.pattern,c.blade).total);
  pg.forEach(g=>{ if(g._phaseEnd) reuse+=Math.max(0,c.useful-calcStats(g.pattern,c.blade).total); });
  const waste=rp.stats.totalMat-rp.stats.totalUsed;
  const placed=rp.bobines.reduce((s,b)=>s+b.reduce((a,x)=>a+(Number(x.qty)||0),0),0);
  return {midMax,nb:rp.stats.totalBobines,placed,perte:Math.max(0,waste-reuse)};
}
// référence indépendante : OLD (optimum rendement) et DOMINANT (min midMax sous perte ≤ OLD.perte)
function refs(cs){
  const {useful,blade}=cs, items=expandDemand(cs.rows), widths=[...new Set(items)].sort((a,b)=>b-a);
  if(widths.length<=4||widths.length>12) return null;
  const slice={};
  for(let st=0;st<widths.length;st++)for(let len=1;len<=Math.min(4,widths.length-st);len++){
    const set=new Set(widths.slice(st,st+len)), bobs=pack(items.filter(w=>set.has(w)),useful,blade);
    const used=bobs.reduce((s,p)=>s+calcStats(p,blade).total,0), gs=groupBobines(bobs,blade), lp=gs.length?gs[gs.length-1].pattern:[];
    slice[st+'/'+len]={nb:bobs.length,waste:bobs.length*useful-used,pieces:bobs.reduce((s,p)=>s+p.reduce((a,x)=>a+(+x.qty||0),0),0),pe:Math.max(0,useful-calcStats(lp,blade).total)};
  }
  const parts=[]; (function b(st,ac){ if(st>=widths.length){parts.push(ac.slice());return;} for(let l=1;l<=Math.min(4,widths.length-st);l++){ac.push(st+'/'+l);b(st+l,ac);ac.pop();} })(0,[]);
  const M=parts.map(keys=>{let w=0,p=0,nb=0,mm=0,re=0;keys.forEach((kk,ki)=>{const r=slice[kk];w+=r.waste;p+=r.pieces;nb+=r.nb;re+=r.pe;if(ki<keys.length-1)mm=Math.max(mm,r.pe);});return {keys,w,p,nb,ph:keys.length,mm,perte:w-re,pes:keys.map(kk=>slice[kk].pe)};});
  const opt=M.slice().sort((a,b)=>b.p-a.p||a.w-b.w||a.nb-b.nb||a.ph-b.ph)[0];
  const yk=o=>o.p+'|'+o.w+'|'+o.nb+'|'+o.ph;
  const dom=M.filter(m=>yk(m)===yk(opt)&&m.perte<=opt.perte+1e-9).sort((a,b)=>a.mm-b.mm||a.perte-b.perte)[0];
  // [L268] la SÉLECTION de partition est inchangée ; _palRepack RÉORDONNE ensuite les phases (plus gros solde en
  // dernier). Le solde du milieu AFFICHÉ devient donc le 2e plus gros pe de la partition (le plus gros part en fin).
  const domMidNew=(dom.pes.slice().sort((a,b)=>b-a)[1]||0);
  return {oldMid:opt.mm,oldPerte:opt.perte,domMid:dom.mm,domMidNew,domPerte:dom.perte};
}

const REELS=[
  { nom:'PRIMA (8 laizes)', midAttendu:1790, nbAttendu:36, useful:2080, blade:0, rows:[{width:20,qty:165},{width:30,qty:105},{width:40,qty:120},{width:50,qty:400},{width:60,qty:300},{width:70,qty:102},{width:80,qty:150},{width:100,qty:26}] },   // [L268] réordre phases : le gros solde 1840 part en FIN, le 2e (1790) reste à la frontière (irréductible en 2 phases)
  { nom:'Legrand FR 526 (7 laizes)', midAttendu:664, nbAttendu:8, useful:2080, blade:0, rows:[{width:26,qty:8},{width:44,qty:10},{width:61,qty:30},{width:63,qty:144},{width:66,qty:3},{width:75,qty:21},{width:86,qty:20}] },
  { nom:'Legrand Spain (6 laizes)', midAttendu:328, nbAttendu:2, useful:2080, blade:0, rows:[{width:28,qty:8},{width:44,qty:10},{width:48,qty:5},{width:61,qty:18},{width:63,qty:3},{width:75,qty:3}] },
];
console.log('── cas réels ──');
REELS.forEach(cs=>{
  const r=palInfo(cs);
  ok(r&&r.midMax===cs.midAttendu, cs.nom+' : solde milieu max = '+(r?r.midMax:'null')+' (attendu '+cs.midAttendu+')');
  ok(r&&r.nb===cs.nbAttendu, '   nb bobines = '+(r?r.nb:'null')+' (rendement inchangé)');
  ok(r&&r.placed===demandTot(cs.rows), '   conservation : '+(r?r.placed:'null')+' = '+demandTot(cs.rows)+' pièces');
});
ok(palInfo(REELS[2]).midMax===328,'Legrand Spain : gros reste renvoyé en FIN (1666 → 328), perte inchangée (0)');
// [L268] bug Prima « solde au milieu » : le PLUS GROS solde du plan phasé doit être sur la DERNIÈRE bobine, pas au milieu
REELS.forEach(cs=>{
  const rp=_palRepack(cs); const pg=rp.planGroups;
  const pe=g=>Math.max(0,cs.useful-calcStats(g.pattern,cs.blade).total);
  const soldes=pg.map((g,i)=>({i,s:(g._phaseEnd||i===pg.length-1)?pe(g):-1})).filter(o=>o.s>=0);
  const maxS=Math.max(...soldes.map(o=>o.s));
  const enFin=maxS===0||soldes.some(o=>o.s===maxS&&o.i>=pg.length-1);
  ok(enFin, cs.nom+' : le plus gros solde ('+maxS+' mm) est sur la DERNIÈRE bobine (plus jamais au milieu)');
});

const d1=JSON.stringify(_palRepack(REELS[0]).planGroups), d2=JSON.stringify(_palRepack(REELS[0]).planGroups);
ok(d1===d2, 'déterministe');

// fuzz : jamais pire (perte ET midMax) vs OLD, et = référence DOMINANT
let seed=98765; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}, ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
let fz=0, cons=0, pWorse=0, mWorse=0, mism=0, crash=0;
for(let t=0;t<1200;t++){
  const nw=ri(5,9), useful=[1240,2080,2100][ri(0,2)], blade=[0,5][ri(0,1)], uw=new Set(), rows=[];
  for(let i=0;i<nw;i++){ let w; do{w=ri(15,Math.min(200,useful-10));}while(uw.has(w)); uw.add(w); rows.push({width:w,qty:ri(1,300)}); }
  const cs={useful,blade,rows}; let r,ref;
  try{ r=palInfo(cs); ref=refs(cs); }catch(e){ crash++; continue; }
  if(!r||!ref) continue; fz++;
  if(r.placed!==demandTot(rows)) cons++;
  if(r.perte>ref.oldPerte+1e-9) pWorse++;                 // JAMAIS aggraver la perte
  if(r.midMax>ref.oldMid+1e-9) mWorse++;                  // JAMAIS aggraver le solde du milieu
  if(Math.abs(r.midMax-ref.domMidNew)>1e-9||Math.abs(r.perte-ref.domPerte)>1e-9) mism++;
}
console.log('── fuzz '+fz+' cas phasés ──');
ok(crash===0,'aucun crash ('+crash+')');
ok(cons===0,'CONSERVATION : '+cons+' violation(s) (doit être 0)');
ok(pWorse===0,'PERTE jamais aggravée vs optimum : '+pWorse+' cas (doit être 0)');
ok(mWorse===0,'SOLDE MILIEU jamais aggravé vs optimum : '+mWorse+' cas (doit être 0)');
ok(mism===0,'conforme à la référence DOMINANT : '+mism+' écart(s) (doit être 0)');
console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 L220+L268 VALIDÉ : gros solde en FIN (réordre phases), solde milieu jamais aggravé, perte + rendement + conservation intacts (1200 cas)');
process.exit(fail?1:0);
