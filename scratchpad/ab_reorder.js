// ab_reorder.js — SCEPTIQUE n°2 : preuve A/B du FIX réordonnancement des phases dans _palRepack.
// A = code ACTUEL (index.html). B = code PATCHÉ (phase au plus gros solde envoyée en DERNIER).
// Vérifie : nb bobines, waste, reuse, perte, MULTISET produit, conservation, déterminisme, midMax jamais aggravé.
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let s=(src.slice(i-6,i)==='async ')?i-6:i;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(s,k+1);}
global.PALETTES_MAX=4;
['expandDemand','buildCounts','calcStats','makeLabel','bestPattern','pack','groupBobines','_palSplitSolde'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });

const srcA=fnOf('_palRepack');
const OLD='const phases=best.keys.map(kk=>slice[kk].bobs).filter(ph=>ph.length);';
if(srcA.indexOf(OLD)<0){ console.log('❌ ligne cible introuvable — le fix n\'est plus alignable'); process.exit(2); }
const NEW='let _ph=best.keys.map(kk=>({bobs:slice[kk].bobs,solde:slice[kk].phaseEndSolde})).filter(p=>p.bobs.length); if(_ph.length>1){ let mi=0; for(let i=1;i<_ph.length;i++) if(_ph[i].solde>_ph[mi].solde+1e-9) mi=i; if(mi<_ph.length-1) _ph.push(_ph.splice(mi,1)[0]); } const phases=_ph.map(p=>p.bobs);';
const srcB=srcA.replace(OLD,NEW);
const _palRepackA=eval('('+srcA+')');
const _palRepackB=eval('('+srcB+')');

function info(rp,c){
  if(!rp) return null;
  const pg=rp.planGroups; let midMax=0;
  pg.forEach(g=>{ if(g._phaseEnd) midMax=Math.max(midMax,Math.max(0,c.useful-calcStats(g.pattern,c.blade).total)); });
  const last=pg[pg.length-1];
  let reuse=Math.max(0,c.useful-calcStats(last.pattern,c.blade).total);
  pg.forEach(g=>{ if(g._phaseEnd) reuse+=Math.max(0,c.useful-calcStats(g.pattern,c.blade).total); });
  const waste=rp.stats.totalMat-rp.stats.totalUsed;
  const placed=rp.bobines.reduce((s,b)=>s+b.reduce((a,x)=>a+(Number(x.qty)||0),0),0);
  // multiset produit : width -> total qty produit sur toutes les bobines
  const ms={}; rp.bobines.forEach(b=>b.forEach(x=>{ const w=Number(x.width)||0, q=Number(x.qty)||0; ms[w]=(ms[w]||0)+q; }));
  return {midMax,nb:rp.stats.totalBobines,placed,waste,reuse,perte:Math.max(0,waste-reuse),ms,peak:rp._palPeak};
}
const msKey=m=>Object.keys(m).map(Number).sort((a,b)=>a-b).map(w=>w+':'+m[w]).join(',');
const demandTot=rows=>rows.reduce((s,r)=>s+r.qty,0);

function run(c){ return {A:info(_palRepackA(c),c), B:info(_palRepackB(c),c)}; }

// ── PRIMA ──
const PRIMA={ useful:2080, blade:0, rows:[{width:20,qty:165},{width:30,qty:105},{width:40,qty:120},{width:50,qty:400},{width:60,qty:300},{width:70,qty:102},{width:80,qty:150},{width:100,qty:26}] };
const p=run(PRIMA);
console.log('── PRIMA ──');
console.log('  A: nb='+p.A.nb+' waste='+p.A.waste+' reuse='+p.A.reuse+' perte='+p.A.perte+' midMax='+p.A.midMax+' peak='+p.A.peak);
console.log('  B: nb='+p.B.nb+' waste='+p.B.waste+' reuse='+p.B.reuse+' perte='+p.B.perte+' midMax='+p.B.midMax+' peak='+p.B.peak);
console.log('  multiset identique : '+(msKey(p.A.ms)===msKey(p.B.ms)));
console.log('  conservation A/B == demande('+demandTot(PRIMA.rows)+') : '+(p.A.placed===demandTot(PRIMA.rows))+'/'+(p.B.placed===demandTot(PRIMA.rows)));

// ── fuzz ──
let seed=13579; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}, ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));
let cases=0, dNb=0,dWaste=0,dReuse=0,dPerte=0,dMs=0,consV=0,midWorse=0,peakBad=0,detBad=0,improved=0,crash=0;
for(let t=0;t<900;t++){
  const nw=ri(5,9), useful=[1240,2080,2100][ri(0,2)], blade=[0,5][ri(0,1)], uw=new Set(), rows=[];
  for(let i=0;i<nw;i++){ let w; do{w=ri(15,Math.min(200,useful-10));}while(uw.has(w)); uw.add(w); rows.push({width:w,qty:ri(1,300)}); }
  const c={useful,blade,rows}; let r;
  try{ r=run(c); }catch(e){ crash++; continue; }
  if(!r.A||!r.B) continue; cases++;
  if(r.A.nb!==r.B.nb) dNb++;
  if(Math.abs(r.A.waste-r.B.waste)>1e-9) dWaste++;
  if(Math.abs(r.A.reuse-r.B.reuse)>1e-9) dReuse++;
  if(Math.abs(r.A.perte-r.B.perte)>1e-9) dPerte++;
  if(msKey(r.A.ms)!==msKey(r.B.ms)) dMs++;
  if(r.B.placed!==demandTot(rows)) consV++;
  if(r.B.midMax>r.A.midMax+1e-9) midWorse++;
  if(r.B.peak>4) peakBad++;
  if(r.B.midMax<r.A.midMax-1e-9) improved++;
  // déterminisme B
  const d1=JSON.stringify(_palRepackB(c).planGroups), d2=JSON.stringify(_palRepackB(c).planGroups);
  if(d1!==d2) detBad++;
}
console.log('\n── fuzz '+cases+' cas phasés (crash='+crash+') ──');
const ok=(c,m)=>console.log((c?'✅ ':'❌ ')+m);
ok(dNb===0,'nb bobines identique A==B : '+dNb+' diff (rendement intact)');
ok(dWaste===0,'waste identique A==B : '+dWaste+' diff');
ok(dReuse===0,'reuse identique A==B : '+dReuse+' diff');
ok(dPerte===0,'perte identique A==B : '+dPerte+' diff');
ok(dMs===0,'MULTISET produit identique A==B : '+dMs+' diff (mêmes bobines produites)');
ok(consV===0,'conservation B == demande : '+consV+' violation');
ok(midWorse===0,'midMax JAMAIS aggravé (B<=A) : '+midWorse+' cas');
ok(peakBad===0,'peak B <= 4 (contrainte palettes) : '+peakBad+' violation');
ok(detBad===0,'déterminisme B : '+detBad+' cas non-déterministes');
console.log('   midMax AMÉLIORÉ (B<A) dans '+improved+'/'+cases+' cas');
const allok = dNb===0&&dWaste===0&&dReuse===0&&dPerte===0&&dMs===0&&consV===0&&midWorse===0&&peakBad===0&&detBad===0&&crash===0;
console.log('\n'+(allok?'🏆 FIX SÛR : aucune régression, midMax jamais pire':'💥 RÉGRESSION DÉTECTÉE'));
process.exit(allok?0:1);
