// ordre_decroissant_l568_test.js — [L568] GARDE D'ORDRE : DANS CHAQUE BOBINE MERE d'un plan final, les laizes sont rangees de la plus
// grande a la plus petite (ordre decroissant au sens large), y compris pour les plans produits par _l444Pal : plan en palettes, plan brut
// (L446/L448), plan en familles (_l563Familles), plan regroupe (_l566RegroupeBorne). Une bobine stocke ses laizes dans c.bobines[i] =
// tableau de {width,qty} (ordre du tableau = ordre de coupe) ; la fiche affiche makeLabel(c.bobines[i]) ; c.planGroups[j].pattern suit la meme regle.
// Proprietes : O1 cas LEGRAND (donnees, planGroups, texte makeLabel), O2 500 commandes a graine fixe (jamais Math.random) via _l444Pal,
// O3 affichage (makeLabel relu en largeurs = donnees), O4 mecanisme : un plan dont on inverse une bobine DOIT etre vu rouge. Moteur intouche.
const fs=require('fs');
const src=fs.readFileSync(process.env.L568_HTML||require('path').join(__dirname,'..','index.html'),'utf8');   // L568_HTML : rejouer le test sur un autre index.html (preuve « rouge » sur version mutee)
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let s=(src.slice(i-6,i)==='async ')?i-6:i;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(s,k+1);}
global.PALETTES_MAX=4; global.MAX_USEFUL_MM=4000; { const m=src.match(/var L448_PAL_TOL=(\d+)/); global.L448_PAL_TOL=m?Number(m[1]):6; } global.MAX_BLADE_MM=50; global.packTruncated=false; global._laizeSortExcluded=()=>false;
['expandDemand','buildCounts','calcStats','makeLabel','bestPattern','pack','groupBobines','computeChutesUsed','reduceItemsByChutes',
 'assignChutesForDisplay','groupBobinesWithChutes','packRecutRolls','groupRecutRolls','packRefGroups','_pgW','_seqPeak','_seqPeakPartial',
 '_seqMinPalettes','_palRepack','_palBobines','_palSplitSolde','packRefGroupsPal',
 '_l444PalettePeak','_l444Fill','_l444RegroupRef','_l444Regroup'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
{ const m=src.match(/^var L563_N_MAX=(\d+);/m), p=src.match(/^var L563_PACK_MAX=(\d+);/m); global.L563_N_MAX=m?Number(m[1]):14; global.L563_PACK_MAX=p?Number(p[1]):800; }
global._l563Familles=eval('('+fnOf('_l563Familles')+')');
global._l444Pal=eval('('+fnOf('_l444Pal')+')');
const A566=src.indexOf('\nfunction _l566RegroupeBorne(c,regroupe){')>=0&&/^var L566_OPS_MAX=(\d+);/m.test(src);
if(A566){
  global.L566_OPS_MAX=Number(src.match(/^var L566_OPS_MAX=(\d+);/m)[1]);
  ['_l566Fill','_l566Chute','_l566Bornee','_l566Respecte','_l566RegroupeBorne'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
}
let fail=0;
console.log((A566?'✅ ':'❌ ')+'L568 : _l566RegroupeBorne et L566_OPS_MAX presents dans index.html (version '+((src.match(/APP_VERSION='([^']*)'/)||[])[1]||'?')+')'); if(!A566) fail++;

let seed=568568; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}, ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)), pick=arr=>arr[ri(0,arr.length-1)];
const clone=x=>JSON.parse(JSON.stringify(x));
function genRows(nw,maxW,maxQ){const uw=new Set(),rows=[];for(let i=0;i<nw;i++){let w;do{w=ri(15,maxW)+(ri(0,4)===0?0.5:0);}while(uw.has(w));uw.add(w);rows.push({width:w,qty:ri(1,maxQ)});}return rows;}
const USEFULS=[1000,1240,2080,2100], BLADES=[0,0.5,5];
const mk=(rows,useful,blade)=>[{ref:'R1',useful,blade,longueur:ri(50,900),mother:0,edge:0,film:'',veka:'',machine:'maveg',rows:JSON.parse(JSON.stringify(rows)),chutes:[],recuts:[]}];
const LEGRAND=[[200,2],[110,4],[75,18],[66,12],[63,6],[61,3],[59,4],[56,8],[48,10],[44,10],[28,8]].map(([width,qty])=>({width,qty}));

// suite des largeurs d'un motif ; premier indice qui remonte (largeur plus grande que la precedente), -1 si decroissant au sens large
const widthsOf=p=>(p||[]).map(x=>Number(x.width));
const premierDesordre=ws=>{ for(let i=1;i<ws.length;i++) if(ws[i]>ws[i-1]) return i; return -1; };
// largeurs relues dans le TEXTE de la fiche (makeLabel : qty>1 => "qtyxwidth", sinon "widthmm")
const labelWidths=t=>String(t).split(' + ').map(s=>{ const m=s.match(/×(\d+(?:\.\d+)?)$/)||s.match(/^(\d+(?:\.\d+)?)mm$/); return m?Number(m[1]):NaN; });
// verifie UN plan final : bobines (donnees), makeLabel (texte), planGroups (fiche). Rend '' si OK, sinon la description exacte du desordre.
function ordrePlan(c){
  if(!c||!Array.isArray(c.bobines)) return 'plan sans bobines';
  for(let i=0;i<c.bobines.length;i++){
    const ws=widthsOf(c.bobines[i]), k=premierDesordre(ws);
    if(k>=0) return 'bobine '+(i+1)+'/'+c.bobines.length+' non decroissante a la laize '+(k+1)+' ('+ws[k-1]+' puis '+ws[k]+') : '+makeLabel(c.bobines[i]);
    const lw=labelWidths(makeLabel(c.bobines[i]));
    if(lw.some(isNaN)||lw.length!==ws.length) return 'bobine '+(i+1)+' : texte illisible '+makeLabel(c.bobines[i]);
    if(premierDesordre(lw)>=0) return 'bobine '+(i+1)+' : texte makeLabel non decroissant : '+makeLabel(c.bobines[i]);
  }
  const pg=c.planGroups||[];
  for(let j=0;j<pg.length;j++){ const ws=widthsOf(pg[j].pattern), k=premierDesordre(ws);
    if(k>=0) return 'planGroups['+j+'] non decroissant ('+ws[k-1]+' puis '+ws[k]+') : '+makeLabel(pg[j].pattern); }
  return '';
}
function prop(nom,N,gen,check){
  let bad=0,first=null;
  for(let t=0;t<N;t++){const input=gen(t);let r;try{r=check(input);}catch(e){r='CRASH: '+(e&&e.stack||e);}
    if(r){bad++;if(!first)first={input:(input&&input.desc)||t,r};if(bad>=5)break;}}
  if(bad)fail++;
  console.log((bad?'❌ ':'✅ ')+nom+' ('+N+' cas)'+(bad?' — '+bad+' échec(s), 1er: '+JSON.stringify(first).slice(0,800):''));
}

// ---- O1 : cas LEGRAND SPAIN (2080, lame 0) ----
prop('O1 cas LEGRAND : dans chaque bobine, laizes de la plus grande a la plus petite (donnees c.bobines, texte makeLabel, planGroups)',1,()=>null,()=>{
  const c=_l444Pal(clone(mk(LEGRAND,2080,0)))[0];
  if(!c._l563Familles) return 'prealable : le plan LEGRAND doit venir de la recherche en familles';
  if(c.bobines.length!==3) return 'prealable : 3 bobines attendues, '+c.bobines.length;
  if(!c.bobines.some(p=>p.length>=3)) return 'prealable : bobines a plusieurs laizes attendues';
  console.log('   LEGRAND : '+c.bobines.map(p=>'['+makeLabel(p)+']').join('  '));
  return ordrePlan(c);
});
prop('O1b LEGRAND sur 2100 lame 0.5 et sur utile 1240 lame 5 : meme regle',2,t=>t,(t)=>{
  const c=_l444Pal(clone(mk(LEGRAND,[2100,1240][t],[0.5,5][t])))[0]; return ordrePlan(c);
});

// ---- O2 : 500 commandes a graine fixe, via _l444Pal (7 a 11 laizes : plans en familles / regroupes ; 2 a 8 laizes : palettes / brut) ----
const T0=Date.now(); const ORIG={pal:0,brut:0,fam:0,reg:0}; const CASES=[];
for(let t=0;t<500;t++){
  const g=mk(genRows(t%2?ri(7,11):ri(2,8),260,ri(4,10)),pick(USEFULS),pick(BLADES)); global.packTruncated=false;
  const now=_l444Pal(clone(g)); const c=now[0];
  if(c._l563Familles){ ORIG.fam++; if(c._l566) ORIG.reg++; } else if(c._l446Brut) ORIG.brut++; else ORIG.pal++;
  CASES.push({g,now,desc:{t,useful:g[0].useful,blade:g[0].blade,rows:g[0].rows.map(r=>r.qty+'x'+r.width).join(' ')}});
}
prop('O2 500 commandes (graine 568568) via _l444Pal : chaque bobine de chaque plan final est decroissante (donnees, texte, planGroups)',CASES.length,t=>CASES[t],(k)=>{
  for(const c of k.now){ const r=ordrePlan(c); if(r) return r; } return '';
});
{ const ok=ORIG.fam>=50&&ORIG.reg>=10&&ORIG.brut>=1&&ORIG.pal>=50; if(!ok) fail++;
  console.log((ok?'✅ ':'❌ ')+'O2b banc non vide : plans en palettes '+ORIG.pal+' (>= 50), bruts L446/L448 '+ORIG.brut+' (>= 1), en familles '+ORIG.fam+' (>= 50) dont regroupes L566 '+ORIG.reg+' (>= 10)'); }
prop('O2c entrees de _l444Pal : packRefGroupsPal (plan palettes) et packRefGroups (plan brut) sur les memes commandes : meme regle',CASES.length,t=>CASES[t],(k)=>{
  for(const f of [packRefGroupsPal,packRefGroups]){ for(const c of f(clone(k.g))){ const r=ordrePlan(c); if(r) return f.name+' : '+r; } } return '';
});

// ---- O3 : affichage = donnees (le texte de la fiche suit l'ordre des bobines) ----
prop('O3 le texte makeLabel d une bobine liste exactement les laizes de la bobine, dans le meme ordre (banc de 500 commandes)',CASES.length,t=>CASES[t],(k)=>{
  for(const c of k.now) for(const p of c.bobines){
    const lw=labelWidths(makeLabel(p)), ws=widthsOf(p);
    if(JSON.stringify(lw)!==JSON.stringify(ws)) return 'texte '+makeLabel(p)+' != donnees '+JSON.stringify(ws);
  } return '';
});

// ---- O4 : mecanisme. Un plan dont on inverse une bobine DOIT etre detecte (et pas de faux rouge) ----
prop('O4 mecanisme : bobine inversee, planGroups inverse, laize plus grande en 2e position => detectes ; laizes egales / une seule laize => pas de faux rouge',1,()=>null,()=>{
  const c0=_l444Pal(clone(mk(LEGRAND,2080,0)))[0];
  if(ordrePlan(c0)) return 'prealable : le plan sain doit etre accepte : '+ordrePlan(c0);
  const i=c0.bobines.findIndex(p=>new Set(widthsOf(p)).size>=2); if(i<0) return 'prealable : bobine a 2 largeurs attendue';
  const c1=clone(c0); c1.bobines[i].reverse(); if(!ordrePlan(c1)) return 'bobine inversee NON detectee';
  const c2=clone(c0); const j=c2.planGroups.findIndex(g=>new Set(widthsOf(g.pattern)).size>=2); if(j<0) return 'prealable : planGroups a 2 largeurs attendu'; c2.planGroups[j].pattern.reverse(); if(!ordrePlan(c2)) return 'planGroups inverse NON detecte';
  const c3=clone(c0); c3.bobines[i]=[c3.bobines[i][0],{width:c3.bobines[i][0].width+1,qty:1}]; if(!ordrePlan(c3)) return 'laize plus grande en 2e position NON detectee';
  const egal=clone(c0); egal.bobines[0]=[{width:100,qty:1},{width:100,qty:2}]; egal.planGroups=[]; if(ordrePlan(egal)) return 'faux rouge sur laizes egales : '+ordrePlan(egal);
  const seul=clone(c0); seul.bobines[0]=[{width:100,qty:3}]; seul.planGroups=[]; if(ordrePlan(seul)) return 'faux rouge sur une seule laize';
  if(!ordrePlan({})||!ordrePlan(null)) return 'plan invalide accepte';
  return '';
});
const dt=Date.now()-T0; const okT=dt<60000; if(!okT) fail++;
console.log((okT?'✅ ':'❌ ')+'O5 duree du banc '+Math.round(dt/1000)+' s (< 60 s)');
console.log(fail?('\n💥 '+fail+' propriete(s) VIOLEE(S)'):'\n🏆 ORDRE L568 VALIDE : chaque bobine mere rangee de la plus grande a la plus petite laize (LEGRAND, 500 commandes, palettes / brut / familles / regroupe, texte de fiche) · mecanisme vu rouge');
process.exit(fail?1:0);
