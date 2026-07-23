// props_test.js — [audit PBT] GARDE DE SENS du moteur : 12 propriétés prouvées TIENT (≥1000 cas), figées en
// anti-régression. engine_identity.js garantit le GEL byte-à-byte ; ce fichier garantit le SENS : conservation
// (0 pièce perdue), capacité, pic palettes ≤ 4, comptabilité, label↔fiche. LCG seed 424242, jamais Math.random.
// À lancer JUSTE APRÈS tests/engine_identity.js. NB : « solde = dernière bobine » n'est exact qu'en blade=0
// (audit P3 VIOLEE en blade>0, ~0,3%) ; conservation exigée SEULEMENT si !packTruncated.
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let s=(src.slice(i-6,i)==='async ')?i-6:i;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(s,k+1);}
global.PALETTES_MAX=4; global.MAX_USEFUL_MM=4000; global.MAX_BLADE_MM=50; global.packTruncated=false; global._laizeSortExcluded=()=>false;
['expandDemand','buildCounts','calcStats','makeLabel','bestPattern','pack','groupBobines','computeChutesUsed','reduceItemsByChutes',
 'assignChutesForDisplay','groupBobinesWithChutes','packRecutRolls','groupRecutRolls','packRefGroups','_pgW','_seqPeak','_seqPeakPartial',
 '_seqMinPalettes','_palRepack','_palBobines','_palSplitSolde','packRefGroupsPal','computePlanAggregate','clampUseful','clampBlade',
 'parseConf','_confIllisible','clampQ'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
{ const i=src.indexOf('const normConf='); const j=src.indexOf('.trim();',i); global.normConf=eval('('+src.slice(i+'const normConf='.length,j+7)+')'); }

let seed=424242; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}, ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)), pick=arr=>arr[ri(0,arr.length-1)];
const multiset=bob=>{const m={};bob.forEach(p=>p.forEach(x=>{m[x.width]=(m[x.width]||0)+x.qty;}));return m;};
const msEq=(a,b)=>Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>a[k]===b[k]); let fail=0;
function prop(nom,N,gen,check){
  let bad=0,first=null;
  for(let t=0;t<N;t++){const input=gen(t);let r;try{r=check(input);}catch(e){r='CRASH: '+e.message;}
    if(r){bad++;if(!first)first={input,r};if(bad>=5)break;}}
  if(bad)fail++;
  console.log((bad?'❌ ':'✅ ')+nom+' ('+N+' cas)'+(bad?' — '+bad+' échec(s), 1er: '+JSON.stringify(first).slice(0,400):''));
}
// domaine gardé = ce que getRefGroups laisse passer (largeur ≥ 1 mm, qty ≥ 1)
function genRows(nw,maxW,maxQ){const uw=new Set(),rows=[];for(let i=0;i<nw;i++){let w;do{w=ri(15,maxW)+(ri(0,3)===0?0.5:0);}while(uw.has(w));uw.add(w);rows.push({width:w,qty:ri(1,maxQ)});}return rows;}
const USEFULS=[620,1000,1240,2080,2100], BLADES=[0,0.5,5];

// P1 — bestPattern : jamais plus que le stock, jamais plus large que useful (+0.01, garde interne)
prop('P1 bestPattern: stock respecté + capacité ≤ useful',1500,
 ()=>({useful:pick(USEFULS),blade:pick(BLADES),rows:genRows(ri(1,10),600,60)}),
 ({useful,blade,rows})=>{
   const counts=buildCounts(expandDemand(rows.filter(r=>r.width<=useful)));
   if(!Object.keys(counts).length) return '';
   const pat=bestPattern(counts,useful,blade);
   for(const p of pat){ if(p.qty>(counts[p.width]|0)) return 'stock dépassé '+p.width; if(!(p.width>0)) return 'largeur≤0'; }
   return calcStats(pat,blade).total>useful+0.01?'capacité dépassée':'';
 });
// P2 — pack : CONSERVATION exacte du multiset + capacité par bobine (cas non tronqués)
prop('P2 pack: conservation multiset + capacité par bobine',1500,
 ()=>({useful:pick(USEFULS),blade:pick(BLADES),rows:genRows(ri(1,9),600,40)}),
 ({useful,blade,rows})=>{
   global.packTruncated=false; const items=expandDemand(rows.filter(r=>r.width<=useful)), bob=pack(items,useful,blade);
   if(global.packTruncated) return '';
   if(!msEq(buildCounts(items),multiset(bob))) return 'conservation violée';
   for(const p of bob){ if(calcStats(p,blade).total>useful+0.01) return 'bobine > useful'; }
   return '';
 });
// P3 — pack : déterminisme strict (2 exécutions byte-identiques)
prop('P3 pack: déterminisme',1000,
 ()=>({useful:pick(USEFULS),blade:pick(BLADES),rows:genRows(ri(1,8),600,30)}),
 ({useful,blade,rows})=>{
   const items=expandDemand(rows.filter(r=>r.width<=useful));
   return JSON.stringify(pack(items,useful,blade))===JSON.stringify(pack(items,useful,blade))?'':'non déterministe';
 });
// P4 — CROSS-SURFACE : tout label moteur est relu à l'identique par parseConf∘normConf ET accepté par _confIllisible
prop('P4 makeLabel → parseConf/normConf roundtrip + _confIllisible vide',1500,
 ()=>({useful:pick(USEFULS),blade:pick(BLADES),rows:genRows(ri(1,8),600,40)}),
 ({useful,blade,rows})=>{
   const bob=pack(expandDemand(rows.filter(r=>r.width<=useful)),useful,blade);
   for(const p of bob){
     const lbl=makeLabel(p), want={},got={};
     p.forEach(x=>want[x.width]=(want[x.width]||0)+x.qty);
     parseConf(normConf(lbl)).forEach(x=>got[x.width]=(got[x.width]||0)+x.qty);
     if(!msEq(want,got)) return 'roundtrip "'+lbl+'"';
     if(_confIllisible(lbl,useful,blade)) return 'label moteur jugé illisible "'+lbl+'"';
   }
   return '';
 });
// P5 — chutes stock : used ≤ min(demande,stock) ; reduceItemsByChutes conserve ; affichage (bobines+orphan) = used
prop('P5 chutes: bornes + conservation + affichage',1200,
 ()=>{
   const useful=pick(USEFULS), rows=genRows(ri(1,7),600,25);
   const chutes=Array.from({length:ri(0,4)},()=>({width:pick(rows).width,qty:ri(1,40)}));
   if(ri(0,2)===0) chutes.push({width:ri(15,600),qty:ri(1,5)});
   return {useful,blade:pick(BLADES),rows,chutes};
 },
 (g)=>{
   const used=computeChutesUsed(g), demand={}, stock={};
   g.rows.forEach(r=>{if(r.width<=g.useful)demand[r.width]=(demand[r.width]||0)+r.qty;});
   g.chutes.forEach(c=>{stock[c.width]=(stock[c.width]||0)+c.qty;});
   for(const w in used){ if(used[w]>(demand[w]||0)) return 'used > demande'; if(used[w]>(stock[w]||0)) return 'used > stock'; }
   const items=expandDemand(g.rows.filter(r=>r.width<=g.useful));
   const want=buildCounts(items); Object.entries(used).forEach(([w,q])=>{want[w]-=q; if(want[w]<=0)delete want[w];});
   if(!msEq(want,buildCounts(reduceItemsByChutes(items,used)))) return 'reduceItems conservation';
   const asg=assignChutesForDisplay(pack(reduceItemsByChutes(items,used),g.useful,g.blade),used), disp={};
   asg.bobines.forEach(b=>{if(b.chute)Object.entries(b.chute).forEach(([w,q])=>disp[w]=(disp[w]||0)+q);});
   Object.entries(asg.orphan).forEach(([w,q])=>disp[w]=(disp[w]||0)+q);
   return msEq(disp,{...used})?'':'affichage chutes ≠ used';
 });
// P6 — packRefGroups : conservation GLOBALE (mère + rouleaux + chutes = demande valide), oversize classé, rouleaux ≤ rollW
prop('P6 packRefGroups: conservation globale + oversize + capacité rouleaux',1000,
 ()=>{
   const useful=pick(USEFULS), rows=genRows(ri(1,7),600,25);
   if(ri(0,3)===0) rows.push({width:useful+ri(1,200),qty:ri(1,5)});
   return {ref:'T',longueur:'',useful,blade:pick(BLADES),mother:useful,edge:0,rows,
     chutes:ri(0,1)?[{width:pick(rows).width,qty:ri(1,10)}]:[], recuts:ri(0,1)?[{width:ri(30,useful),qty:ri(1,3)}]:[]};
 },
 (g)=>{
   global.packTruncated=false; const c=packRefGroups([g])[0];
   if(global.packTruncated) return '';
   const valid=g.rows.filter(r=>r.width<=g.useful), placed=multiset(c.bobines);
   c.recutBobines.forEach(r=>r.pattern.forEach(p=>placed[p.width]=(placed[p.width]||0)+p.qty));
   for(const r of c.recutBobines){ if(calcStats(r.pattern,g.blade).total>r.rollW+0.01) return 'rouleau surchargé'; }
   Object.entries(c.chutesUsed).forEach(([w,q])=>placed[w]=(placed[w]||0)+q);
   if(!msEq(buildCounts(expandDemand(valid)),placed)) return 'conservation globale violée';
   if(c.oversize.length!==g.rows.length-valid.length) return 'oversize mal classé';
   return (c.stats.totalUsed>c.stats.totalMat+0.01)?'used > mat':'';
 });
// P7 — _seqMinPalettes : permutation exacte, dernier motif moteur épinglé dernier, peak annoncé = peak recalculé
prop('P7 _seqMinPalettes: permutation + solde dernier + peak exact',1200,
 ()=>{
   const useful=pick(USEFULS),blade=pick(BLADES);
   const pg=groupBobines(pack(expandDemand(genRows(ri(2,9),600,20).filter(r=>r.width<=useful)),useful,blade),blade);
   return {pg,prefix:ri(0,1)?[{pattern:[{width:ri(20,300),qty:ri(1,4)}]}]:[]};
 },
 ({pg,prefix})=>{
   if(!pg.length) return '';
   const s=_seqMinPalettes(pg,prefix), lbl=g=>makeLabel(g.pattern)+'#'+g.count;
   if(s.order.reduce((n,g)=>n+g.count,0)!==pg.reduce((n,g)=>n+g.count,0)) return 'Σcount changé';
   if(JSON.stringify(s.order.map(lbl).sort())!==JSON.stringify(pg.map(lbl).sort())) return 'pas une permutation';
   if(pg.length>=2 && lbl(s.order[s.order.length-1])!==lbl(pg[pg.length-1])) return 'solde plus en dernier';
   return s.peak!==_seqPeak(prefix.concat(s.order))?'peak annoncé ≠ réel':'';
 });
// P8 — packRefGroupsPal : conservation + planGroups ↔ bobines même multiset + capacité + déterminisme
prop('P8 packRefGroupsPal: conservation + planGroups↔bobines + déterminisme',1000,
 ()=>({ref:'T',longueur:'',useful:pick([1240,2080,2100]),blade:pick(BLADES),mother:2080,edge:0,rows:genRows(ri(2,9),400,30),chutes:[],recuts:[]}),
 (g)=>{
   global.packTruncated=false; const c=packRefGroupsPal([g])[0];
   if(global.packTruncated) return '';
   if(!msEq(buildCounts(expandDemand(g.rows.filter(r=>r.width<=g.useful))),multiset(c.bobines))) return 'conservation';
   if(!msEq(multiset(_palBobines(c.planGroups||[])),multiset(c.bobines))) return 'planGroups ≠ bobines';
   for(const p of c.bobines){ if(calcStats(p,g.blade).total>g.useful+0.01) return 'bobine > useful'; }
   return JSON.stringify(c.planGroups)===JSON.stringify(packRefGroupsPal([g])[0].planGroups)?'':'non déterministe';
 });
// P9 — _palRepack (plan phasé) : pic palettes ≤ 4 + conservation + totalMat cohérent
prop('P9 _palRepack: pic ≤ PALETTES_MAX + conservation',1000,
 ()=>({ref:'T',useful:pick([1240,2080,2100]),blade:pick(BLADES),rows:genRows(ri(5,10),300,30)}),
 (g)=>{
   global.packTruncated=false; const rp=_palRepack(g);
   if(!rp||global.packTruncated) return '';
   if(_seqPeak(rp.planGroups)>global.PALETTES_MAX) return 'pic > 4';
   if(!msEq(buildCounts(expandDemand(g.rows.filter(r=>r.width<=g.useful))),multiset(rp.bobines))) return 'conservation repack';
   return Math.abs(rp.stats.totalMat-rp.bobines.length*g.useful)>1e-6?'totalMat incohérent':'';
 });
// P10 — clamps frontière (anti-freeze DP) : bornes [0,4000]/[0,50], idempotence, NaN/±Inf/chaînes neutralisés
prop('P10 clampUseful/clampBlade: bornes + idempotence + non-finis',2000,
 ()=>({v:ri(0,3)===0?pick([NaN,Infinity,-Infinity,-5,0,0.4,50,51,4000,4001,21e7,'abc','2080',null,undefined,1e308,-0]):(rnd()*1e7-1e6)}),
 ({v})=>{
   const u=clampUseful(v),b=clampBlade(v);
   if(!(u>=0&&u<=4000&&b>=0&&b<=50)) return 'hors bornes';
   if(clampUseful(u)!==u||clampBlade(b)!==b) return 'non idempotent';
   return isFinite(u)&&isFinite(b)?'':'non fini';
 });
// P11 — computePlanAggregate : positivité + pas de fuite comptable (chute+perte ≥ non-utilisé) + pertePct ≤ 100
prop('P11 computePlanAggregate: positivité + comptabilité',1000,
 ()=>Array.from({length:ri(1,3)},(_,i)=>({ref:'R'+i,longueur:'',useful:pick(USEFULS),blade:pick(BLADES),mother:2080,edge:0,
   rows:genRows(ri(1,7),400,20),chutes:ri(0,1)?[{width:ri(15,400),qty:ri(1,8)}]:[],recuts:ri(0,1)?[{width:ri(30,600),qty:ri(1,2)}]:[]})),
 (groups)=>{
   global.packTruncated=false; const computed=packRefGroupsPal(groups);
   if(global.packTruncated) return '';
   const a=computePlanAggregate(computed);
   for(const k of ['totalBobines','totalMat','totalUsed','chuteStockMm','perteMm','resteRouleauxMm','perteMereMm','pertePct','chutesPieces','recutCountAll'])
     if(!(a[k]>=-1e-9)) return k+' négatif';
   if(a.totalUsed>a.totalMat+0.01) return 'used > mat';
   if(a.chuteStockMm+a.perteMm<a.totalMat-a.totalUsed-1e-6) return 'fuite comptable';
   return a.pertePct>100+1e-9?'pertePct > 100':'';
 });
// P12 — _palSplitSolde : Σcount conservé + solde isolé en count=1 (y compris counts sales '3'/1.7)
prop('P12 _palSplitSolde: Σcount conservé + solde isolé',1000,
 ()=>Array.from({length:ri(1,6)},()=>({pattern:[{width:ri(20,500),qty:ri(1,6)}],count:pick([ri(1,5),'3',1.7,ri(1,5)])})),
 (order)=>{
   const out=_palSplitSolde(order), tot=a=>a.reduce((s,g)=>s+Math.max(1,parseInt(g.count)||1),0);
   if(tot(out)!==tot(order)) return 'Σcount changé';
   return (order.length&&out[out.length-1].count!==1&&Math.max(1,parseInt(order[order.length-1].count)||1)>1)?'solde non isolé':'';
 });

console.log(fail?('\n💥 '+fail+' propriété(s) violée(s)'):'\n🏆 12 propriétés du moteur TIENNENT (conservation, capacité, palettes, comptabilité, label↔fiche)');
process.exit(fail?1:0);
