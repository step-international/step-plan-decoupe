// chutes_l566_test.js — [L566] GARDE DE SENS des CHUTES REGROUPEES EN FIN DE PLAN, MEME POUR LES PLANS EN FAMILLES.
// Decision de la responsable qualite (23/11/2026) : « regle n°1 = le moins de chute possible ; pas d'usine a gaz ».
// _l444Pal regroupe de nouveau les chutes d'un plan produit par _l563Familles, DANS la limite existante de 6 (L448_PAL_TOL) :
// jamais plus de 6 laizes differentes dans une bobine, pic de palettes (_seqPeak) <= 6, meme nombre de bobines, multiset conserve,
// chute de la derniere bobine jamais diminuee ; sinon le plan en familles est garde. Le moteur reste gele (engine_identity).
// Proprietes : cas LEGRAND exact (3 bobines, perte 869, derniere chute >= 750, <= 6 laizes par bobine), 2000 commandes aleatoires a
// graine fixe (jamais Math.random) comparees au plan de L564 (jamais plus de bobines, perte totale identique, chute de fin jamais
// diminuee), regle L448 inchangee, plan identique a L564 quand _l563Familles n'est pas pose, sac-a-dos borne = force brute, purete,
// determinisme, borne d'etapes, motif d'origine garde quand le regroupement ne gagne rien. Vu ROUGE sur L564 avant d'etre vert.
const fs=require('fs');
const src=fs.readFileSync(process.env.L566_HTML||require('path').join(__dirname,'..','index.html'),'utf8');   // L566_HTML : rejouer le test sur un autre index.html (preuve « rouge avant » et mutations)
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
console.log((A566?'✅ ':'❌ ')+'L566 : _l566RegroupeBorne et L566_OPS_MAX presents dans index.html (version '+((src.match(/APP_VERSION='([^']*)'/)||[])[1]||'?')+')'); if(!A566) fail++;

let seed=566566; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}, ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)), pick=arr=>arr[ri(0,arr.length-1)];
const multiset=bob=>{const m={};bob.forEach(p=>p.forEach(x=>{m[x.width]=(m[x.width]||0)+x.qty;}));return m;};
const msEq=(a,b)=>Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>a[k]===b[k]);
const rowsMs=rows=>{const m={};rows.forEach(r=>{m[r.width]=(m[r.width]||0)+r.qty;});return m;};
function prop(nom,N,gen,check){
  let bad=0,first=null;
  for(let t=0;t<N;t++){const input=gen(t);let r;try{r=check(input);}catch(e){r='CRASH: '+(e&&e.stack||e);}
    if(r){bad++;if(!first)first={input:(input&&input.g)||input,r};if(bad>=5)break;}}
  if(bad)fail++;
  console.log((bad?'❌ ':'✅ ')+nom+' ('+N+' cas)'+(bad?' — '+bad+' échec(s), 1er: '+JSON.stringify(first).slice(0,600):''));
}
function genRows(nw,maxW,maxQ){const uw=new Set(),rows=[];for(let i=0;i<nw;i++){let w;do{w=ri(15,maxW)+(ri(0,4)===0?0.5:0);}while(uw.has(w));uw.add(w);rows.push({width:w,qty:ri(1,maxQ)});}return rows;}
const USEFULS=[1000,1240,2080,2100], BLADES=[0,0.5,5];
const mk=(rows,useful,blade)=>[{ref:'R1',useful,blade,longueur:ri(50,900),mother:0,edge:0,film:'',veka:'',machine:'maveg',rows:JSON.parse(JSON.stringify(rows)),chutes:[],recuts:[]}];
const clone=x=>JSON.parse(JSON.stringify(x));
const perteTot=c=>c.bobines.length*c.useful-c.bobines.reduce((s,p)=>s+calcStats(p,c.blade).total,0);
const chuteFin=c=>c.useful-calcStats(c.bobines[c.bobines.length-1],c.blade).total;
const nbLaizes=p=>_pgW({pattern:p}).length;
// Plan de L564 (couche AVANT ce lot) recalcule a partir des memes pal/brut : regle L448, recherche en familles, regroupement L444,
// et les plans en familles gardes TELS QUELS (ancien garde).
function avantL564(pal,brut){
  const out=pal.map((c,i)=>{ const b=brut[i]; if(b.bobines.length<c.bobines.length){ const peakNat=_seqPeak(b.planGroups||[]); if(peakNat<=L448_PAL_TOL){ const _o=_palSplitSolde(b.planGroups); return Object.assign({},b,{planGroups:_o,bobines:_palBobines(_o),_palPeak:peakNat,_l446Brut:true}); } const f=_l563Familles(c,b); if(f) return f; } return c; });
  return _l444Regroup(clone(out)).map((c,i)=>out[i]._l563Familles?out[i]:c);
}

// ---- C1 : cas REEL LEGRAND SPAIN p427611 : 11 laizes, utile 2080, lame 0 ----
const LEGRAND=[[200,2],[110,4],[75,18],[66,12],[63,6],[61,3],[59,4],[56,8],[48,10],[44,10],[28,8]].map(([width,qty])=>({width,qty}));
prop('C1 cas LEGRAND (2080, lame 0, 11 laizes) : plan final = memes 3 bobines, perte totale 869, derniere chute >= 750, chaque bobine <= 6 laizes, pic <= 6',1,()=>null,()=>{
  const g=mk(LEGRAND,2080,0); global.packTruncated=false;
  const c=_l444Pal(clone(g))[0]; const b=c.bobines||[];
  if(b.length!==3) return '3 bobines attendues, '+b.length;
  if(Math.round(perteTot(c))!==869) return 'perte totale 869 attendue, '+perteTot(c);
  if(!msEq(multiset(b),rowsMs(LEGRAND))) return 'multiset different';
  if(!(chuteFin(c)>=750)) return 'chute de la derniere bobine >= 750 attendue, '+chuteFin(c)+' ('+b.map(p=>makeLabel(p)).join(' | ')+')';
  for(const p of b){ if(nbLaizes(p)>6) return 'bobine a '+nbLaizes(p)+' laizes (> 6) : '+makeLabel(p); if(calcStats(p,0).total>2080) return 'capacite'; }
  if(_seqPeak(c.planGroups||[])>L448_PAL_TOL) return 'pic > tolerance : '+_seqPeak(c.planGroups);
  if(!c._l563Familles) return 'le plan ne vient pas de la recherche en familles';
  if(global.packTruncated) return 'packTruncated leve';
  const interm=b.slice(0,-1).reduce((s,p)=>s+(2080-calcStats(p,0).total),0);
  if(interm>perteTot(c)-750) return 'restes intermediaires '+interm+' mm : la chute n est pas regroupee en fin de plan';
  console.log('   LEGRAND : '+c.planGroups.map(g=>(g.count||1)+'x['+g.pattern.map(p=>p.qty+'x'+p.width).join('+')+'] reste '+Math.round(2080-calcStats(g.pattern,0).total)).join('  ')+'  (perte totale '+Math.round(perteTot(c))+', pic '+_seqPeak(c.planGroups)+')');
  return '';
});
prop('C1b cas LEGRAND : meme resultat sur d autres lames/utiles proches (2080 lame 0 puis 2100 lame 0.5) : jamais plus de bobines que L564, chute de fin >= L564, <= 6 laizes',2,t=>mk(LEGRAND,[2080,2100][t],[0,0.5][t]),(g)=>{
  const pal=packRefGroupsPal(clone(g)), brut=packRefGroups(clone(g)); const old=avantL564(pal,brut)[0], now=_l444Pal(clone(g))[0];
  if(now.bobines.length>old.bobines.length) return 'plus de bobines';
  if(chuteFin(now)<chuteFin(old)-1e-9) return 'chute de fin diminuee';
  for(const p of now.bobines){ if(nbLaizes(p)>6) return '> 6 laizes'; }
  return '';
});

// ---- banc de 2000 commandes aleatoires a graine fixe (7 a 11 laizes : la ou la recherche en familles s applique), calculees UNE fois ----
// Pour ne pas payer deux fois le moteur, packRefGroupsPal / packRefGroups / _l563Familles sont MEMOISES le temps d UNE commande (cle = leurs arguments en JSON,
// resultat rendu en copie) : le plan de L564 (avantL564) et le plan de _l444Pal relisent les memes calculs, rien d autre n est simule.
const REEL={pal:global.packRefGroupsPal,brut:global.packRefGroups,fam:global._l563Familles};
let MEMO=new Map();
const memo=(nom,fn)=>function(){ const key=nom+JSON.stringify(Array.prototype.slice.call(arguments)); if(!MEMO.has(key)) MEMO.set(key,{r:fn.apply(this,arguments),t:global.packTruncated}); const e=MEMO.get(key); if(e.t) global.packTruncated=true; return e.r===null||e.r===undefined?e.r:clone(e.r); };
global.packRefGroupsPal=memo('pal',REEL.pal); global.packRefGroups=memo('brut',REEL.brut); global._l563Familles=memo('fam',REEL.fam);
const CASES=[]; let enFamilles=0, regroupes=0, gains=0;
for(let t=0;t<2000;t++){
  const g=mk(genRows(ri(7,11),260,ri(4,10)),pick(USEFULS),pick(BLADES)); MEMO=new Map(); global.packTruncated=false;
  const pal=packRefGroupsPal(clone(g)), brut=packRefGroups(clone(g)); const trunc=global.packTruncated;
  const old=avantL564(pal,brut); global.packTruncated=false; const now=_l444Pal(clone(g)); const trunc2=global.packTruncated;
  const k={g,pal,brut,old,now,trunc:trunc||trunc2};
  CASES.push(k);
  if(now[0]._l563Familles){ enFamilles++; if(JSON.stringify(now[0])!==JSON.stringify(old[0])){ regroupes++; gains+=chuteFin(now[0])-chuteFin(old[0]); } }
}
global.packRefGroupsPal=REEL.pal; global.packRefGroups=REEL.brut; global._l563Familles=REEL.fam; MEMO=new Map();
const caseAt=t=>CASES[t%CASES.length];
prop('C2 jamais plus de bobines qu avant (L564) ; perte TOTALE identique ; multiset conserve ; capacite',CASES.length,caseAt,(k)=>{
  if(k.trunc) return '';
  for(let i=0;i<k.now.length;i++){
    const n=k.now[i], o=k.old[i];
    if(n.bobines.length>o.bobines.length) return 'plus de bobines qu avant : '+n.bobines.length+' > '+o.bobines.length;
    if(Math.abs(perteTot(n)-perteTot(o))>1e-6) return 'perte totale differente : '+perteTot(n)+' vs '+perteTot(o);
    const valid=k.g[i].rows.filter(r=>r.width<=k.g[i].useful); if(!msEq(multiset(n.bobines||[]),rowsMs(valid))) return 'multiset different';
    for(const p of n.bobines){ if(calcStats(p,n.blade).total>n.useful+0.01) return 'capacite depassee : '+makeLabel(p); }
  }
  return '';
});
prop('C3 la chute de la derniere bobine n est JAMAIS diminuee (vs le plan de L564), et un plan change a une derniere chute strictement plus grande',CASES.length,caseAt,(k)=>{
  if(k.trunc) return '';
  for(let i=0;i<k.now.length;i++){ const n=k.now[i], o=k.old[i];
    if(chuteFin(n)<chuteFin(o)-1e-9) return 'chute de fin diminuee : '+chuteFin(n)+' < '+chuteFin(o);
    if(n._l563Familles&&JSON.stringify(n)!==JSON.stringify(o)&&!(chuteFin(n)>chuteFin(o)+0.5)) return 'plan en familles change sans gain';
  }
  return '';
});
prop('C4 plan en familles : jamais plus de 6 laizes differentes par bobine, pic _seqPeak <= 6, meme nombre de bobines que le plan en familles',CASES.length,caseAt,(k)=>{
  if(k.trunc) return '';
  for(let i=0;i<k.now.length;i++){ const n=k.now[i]; if(!n._l563Familles) continue;
    if(n.bobines.length!==k.old[i].bobines.length) return 'nombre de bobines change';
    for(const p of n.bobines){ if(nbLaizes(p)>L448_PAL_TOL) return nbLaizes(p)+' laizes : '+makeLabel(p); }
    if(_seqPeak(n.planGroups)>L448_PAL_TOL) return 'pic '+_seqPeak(n.planGroups);
  }
  return '';
});
prop('C5 plan IDENTIQUE a L564 quand _l563Familles n est pas pose (brut accepte par L448 compris : regle L448 inchangee)',CASES.length,caseAt,(k)=>{
  if(k.trunc) return '';
  for(let i=0;i<k.now.length;i++){
    if(k.now[i]._l563Familles) continue;
    if(JSON.stringify(k.now[i])!==JSON.stringify(k.old[i])) return 'plan different de L564 sans plan en familles';
    if(k.old[i]._l446Brut&&!k.now[i]._l446Brut) return 'brut accepte avant, plus maintenant (L448)';
  }
  return '';
});
prop('C6 determinisme : deux passes = resultat identique (JSON)',80,caseAt,(k)=>{
  const a=_l444Pal(clone(k.g)), b=_l444Pal(clone(k.g));
  return JSON.stringify(a)!==JSON.stringify(b)||JSON.stringify(a)!==JSON.stringify(k.now)?'non deterministe':'';
});
{ const ok=enFamilles>=100&&regroupes>=50&&gains>0; if(!ok) fail++;
  console.log((ok?'✅ ':'❌ ')+'C7 banc non vide : plans en familles '+enFamilles+' (>= 100 exige), regroupes '+regroupes+' (>= 50 exige), gain cumule de chute en fin de plan '+Math.round(gains)+' mm (> 0 exige)'); }

// ---- unites de la couche ----
const LG=()=>{ const g=mk(LEGRAND,2080,0); const pal=packRefGroupsPal(clone(g))[0], brut=packRefGroups(clone(g))[0]; return {g,pal,brut,f:_l563Familles(pal,brut)}; };
function gele(o){ if(o&&typeof o==='object'&&!Object.isFrozen(o)){ Object.freeze(o); Object.keys(o).forEach(k=>gele(o[k])); } return o; }
prop('C8 _l566RegroupeBorne : pure (entrees GELEES, aucune mutation), deterministe, rend le plan regroupe sur LEGRAND, et c LUI-MEME quand rien ne s ameliore',1,()=>null,()=>{
  const {f}=LG(); if(!f) return 'prealable : plan en familles absent';
  const copie=JSON.stringify(f); const fg=gele(clone(f));
  const r1=_l566RegroupeBorne(fg,fg), r2=_l566RegroupeBorne(fg,fg);
  if(JSON.stringify(f)!==JSON.stringify(fg)||copie!==JSON.stringify(fg)) return 'entree modifiee';
  if(JSON.stringify(r1)!==JSON.stringify(r2)) return 'non deterministe';
  if(r1===fg||!r1._l566) return 'LEGRAND : plan regroupe attendu';
  if(!(chuteFin(r1)>=750)) return 'derniere chute '+chuteFin(r1);
  const r3=_l566RegroupeBorne(r1,r1); if(r3!==r1) return 'rien a gagner : le plan doit etre rendu tel quel';
  if(_l566RegroupeBorne(fg,fg)===undefined) return 'undefined';
  return '';
});
prop('C9 branches de _l566RegroupeBorne : regroupe valide fourni => rendu tel quel ; regroupe a 7 laizes => refuse (le regroupement borne le remplace) ; regroupe inchange/null/absurde => c',1,()=>null,()=>{
  const {f}=LG(); if(!f) return 'prealable';
  const b=_l566Bornee(f); if(!b||!_l566Respecte(f,b)) return 'prealable : regroupement borne valide attendu';
  if(_l566RegroupeBorne(f,b)!==b) return 'un regroupe valide doit etre rendu tel quel (meme objet)';
  const sauve=global.L448_PAL_TOL; let r7; try{ global.L448_PAL_TOL=99; r7=_l566Bornee(f); }finally{ global.L448_PAL_TOL=sauve; }
  if(!r7||!r7.bobines.some(p=>nbLaizes(p)>6)) return 'prealable : un regroupement sans borne doit produire une bobine a plus de 6 laizes';
  if(_l566Respecte(f,r7)) return 'un plan a plus de 6 laizes par bobine ne doit pas etre accepte';
  const r=_l566RegroupeBorne(f,r7); if(r===r7||r.bobines.some(p=>nbLaizes(p)>6)) return 'regroupe a 7 laizes non refuse';
  if(JSON.stringify(r)!==JSON.stringify(b)) return 'le regroupement borne devrait remplacer le regroupe refuse';
  for(const bad of [null,undefined,{},{bobines:[]},{bobines:f.bobines,planGroups:f.planGroups}]){ const x=_l566RegroupeBorne(f,bad); if(x!==f&&!(x&&x._l566)) return 'regroupe absurde : plan inattendu'; }
  if(_l566RegroupeBorne(f,f)===null) return 'null';
  return '';
});
prop('C10 pic de palettes > 6 refuse : _l566Respecte mesure le pic avec _seqPeak (la fonction officielle), jamais une promesse',1,()=>null,()=>{
  const {f}=LG(); const b=_l566Bornee(f); if(!b||!_l566Respecte(f,b)) return 'prealable : regroupement borne valide attendu';
  // meme bobines, mais un ordre de plan qui ouvre 7 laizes distinctes dans la meme bobine : pic officiel 7 > 6 => refuse
  const sept=[{pattern:[1,2,3,4,5,6,7].map(i=>({width:100+i,qty:1})),count:1}];
  if(_seqPeak(sept)<=L448_PAL_TOL) return 'prealable : le faux plan doit avoir un pic > '+L448_PAL_TOL;
  if(_l566Respecte(f,Object.assign({},b,{planGroups:sept}))) return 'pic > '+L448_PAL_TOL+' accepte';
  return '';
});
prop('C15 _l566Respecte refuse : nombre de bobines different, multiset different, capacite depassee, chute de fin egale (pas strictement plus grande), chute de fin plus petite, r identique a c ; accepte le regroupement borne valide',1,()=>null,()=>{
  const {f}=LG(); const b=_l566Bornee(f); if(!b||!_l566Respecte(f,b)) return 'prealable : regroupement borne valide attendu';
  const avec=(o)=>Object.assign({},b,o);
  if(_l566Respecte(f,avec({bobines:b.bobines.concat([b.bobines[0]])}))) return 'une bobine de plus acceptee';
  if(_l566Respecte(f,avec({bobines:b.bobines.slice(0,-1)}))) return 'une bobine de moins acceptee';
  { const sep=clone(b.bobines); const der=sep.pop(); sep.push([der[0]],der.slice(1)); if(der.length<2) return 'prealable : derniere bobine a une seule laize'; if(_l566Respecte(f,avec({bobines:sep}))) return 'une bobine coupee en deux (meme multiset, une bobine de plus) acceptee'; }
  const qte=clone(b.bobines); qte[0][0].qty+=1; if(_l566Respecte(f,avec({bobines:qte}))) return 'multiset different accepte (une piece de plus)';
  const moins=clone(b.bobines); moins[2].pop(); if(_l566Respecte(f,avec({bobines:moins}))) return 'multiset different accepte (une laize de moins)';
  if(_l566Respecte(Object.assign({},f,{useful:1000}),b)) return 'capacite depassee acceptee (bobines de 2080 dans une laize utile de 1000)';
  if(_l566Respecte(f,Object.assign({},f))) return 'un plan de meme chute de fin (copie de c) accepte';
  if(_l566Respecte(f,f)) return 'c accepte comme son propre regroupement';
  if(_l566Respecte(f,avec({bobines:b.bobines.slice().reverse()}))) return 'une chute de fin PLUS PETITE acceptee';
  if(_l566Respecte(f,null)||_l566Respecte(null,b)||_l566Respecte(f,{})||_l566Respecte(f,avec({planGroups:null}))) return 'entree invalide acceptee';
  return '';
});
prop('C16 _l566Bornee : jamais de bobine VIDE (tout tient dans les premieres : le nombre de bobines changerait) => null',1,()=>null,()=>{
  const pat=[{width:100,qty:2}], c={useful:1000,blade:0,planGroups:[{pattern:pat,count:2}],bobines:[pat,pat],stats:{}};   /* 2 x 200 mm sur 2 bobines : la 1re bobine prend tout (400 mm), la derniere resterait vide */
  const r=_l566Bornee(c); if(r!==null) return 'plan rendu avec '+JSON.stringify(r.bobines);
  return '';
});
// sac-a-dos borne : optimum IDENTIQUE a la force brute (n <= 7 largeurs, kmax 1..4), vecteur (remplissage, largeurs epuisees)
function fbFill(pool,useful,blade,kmax){
  const ts=Object.keys(pool).map(Number).filter(w=>pool[w]>0), budget=Math.floor(useful+blade+0.001), cost=w=>Math.max(1,Math.round(w+blade));
  let best=[0,-1];
  (function rec(i,k,b,ex){ if(i===ts.length){ if(k>=1){ if(b>best[0]||(b===best[0]&&ex>best[1])) best=[b,ex]; } return; }
    rec(i+1,k,b,ex); if(k<kmax){ const w=ts[i]; for(let j=1;j<=pool[w]&&b+j*cost(w)<=budget;j++) rec(i+1,k+1,b+j*cost(w),ex+(j===pool[w]?1:0)); } })(0,0,0,0);
  return best[0]>0?best:null;
}
prop('C11 _l566Fill = force brute : occupation maximale avec <= kmax largeurs, puis maximum de largeurs epuisees ; jamais plus de kmax largeurs ; jamais plus que la quantite du pool ; borne d etapes respectee',300,()=>{
  const n=ri(2,7), pool={}, uw=new Set(); for(let i=0;i<n;i++){ let w; do{ w=ri(20,300)+(ri(0,3)===0?0.5:0); }while(uw.has(w)); uw.add(w); pool[w]=ri(1,9); }
  return {pool,useful:pick([600,1000,1240]),blade:pick(BLADES),kmax:ri(1,4)};
},(k)=>{
  const cost=w=>Math.max(1,Math.round(Number(w)+k.blade)); const ops={n:0};
  const take=_l566Fill(k.pool,k.useful,k.blade,k.kmax,ops,null), fb=fbFill(k.pool,k.useful,k.blade,k.kmax);
  if(!take&&!fb) return ''; if(!take||!fb) return 'DP '+(take?'trouve':'null')+' / force brute '+(fb?'trouve':'null');
  const ws=Object.keys(take); if(ws.length>k.kmax) return ws.length+' largeurs > kmax '+k.kmax;
  let b=0,ex=0; ws.forEach(w=>{ if(!(take[w]>=1&&take[w]<=k.pool[w])) b=-1e9; b+=cost(w)*take[w]; if(take[w]===k.pool[w]) ex++; });
  if(b!==fb[0]||ex!==fb[1]) return 'vecteur DP '+b+'/'+ex+' vs brute '+fb[0]+'/'+fb[1];
  if(b>Math.floor(k.useful+k.blade+0.001)) return 'budget depasse';
  if(!(ops.n>0)) return 'etapes non comptees';
  return '';
});
prop('C12 _l566Fill garde le motif d origine (pref) quand il fait AUSSI bien (occupation egale, autant de largeurs epuisees) et qu il tient dans le pool ; sinon calcule un autre motif',1,()=>null,()=>{
  const pool={200:2,110:4,75:18,66:12};
  const bon={200:2,110:3,75:18};                      // 400+330+1350 = 2080 : plein, tient dans le pool
  const r=_l566Fill(pool,2080,0,4,{n:0},bon); if(JSON.stringify(r)!==JSON.stringify(bon)) return 'motif d origine plein non garde : '+JSON.stringify(r);
  const sans=_l566Fill(pool,2080,0,4,{n:0},null); if(!sans) return 'prealable : motif plein attendu';
  const rien={200:1}; const r2=_l566Fill(pool,2080,0,4,{n:0},rien); if(JSON.stringify(r2)===JSON.stringify(rien)) return 'motif a moitie vide garde a tort';
  const horsPool={200:3,110:2,75:8,66:10}; const r3=_l566Fill(pool,2080,0,4,{n:0},horsPool); if(r3[200]>2) return 'motif hors pool garde (200 x3 alors que le pool en a 2)';   // 600+220+600+660 = 2080 : plein mais hors pool
  // motif d origine plein mais qui epuise MOINS de largeurs que le meilleur : il n est pas garde (le reste du pool garderait plus de largeurs)
  const p2={100:3,60:5,40:5}, pref2={100:2,60:5}, fb=fbFill(p2,500,0,4), r4=_l566Fill(p2,500,0,4,{n:0},pref2);   // pref2 = 200+300 = 500 plein, epuise 1 largeur ; {100:3,40:5} = 500 en epuise 2
  if(!fb||fb[0]!==500||fb[1]<2) return 'prealable : meilleur motif plein epuisant 2 largeurs attendu '+JSON.stringify(fb);
  if(JSON.stringify(r4)===JSON.stringify(pref2)) return 'motif d origine garde alors qu il epuise moins de largeurs';
  // motif d origine plein et epuisant autant de largeurs que le meilleur, mais HORS POOL (60 x6 alors que le pool n en a que 5) : refuse
  const p3={100:2,80:30,60:5}, pref3={100:2,60:6}, fb3=fbFill(p3,560,0,4), r5=_l566Fill(p3,560,0,4,{n:0},pref3);
  if(!fb3||fb3[0]!==560||fb3[1]!==1) return 'prealable : meilleur motif a 560 epuisant 1 largeur attendu '+JSON.stringify(fb3);
  if(!r5||!(r5[60]<=5)) return 'motif d origine hors pool garde : '+JSON.stringify(r5);
  let ex4=0; Object.keys(r4).forEach(w=>{ if(r4[w]===p2[w]) ex4++; }); if(ex4!==fb[1]) return 'largeurs epuisees '+ex4+' au lieu de '+fb[1];
  return '';
});
prop('C13 borne d etapes : L566_OPS_MAX forcee a 0 => _l566Fill null, _l566Bornee null, et le plan final de LEGRAND reste le plan EN FAMILLES (rien de casse) ; borne rendue => regroupe',1,()=>null,()=>{
  const {g,f}=LG(); const sauve=global.L566_OPS_MAX; let a,b,fin;
  try{ global.L566_OPS_MAX=0; a=_l566Fill({75:18,110:4},2080,0,4,{n:0},null); b=_l566Bornee(f); fin=_l444Pal(clone(g))[0]; }finally{ global.L566_OPS_MAX=sauve; }
  if(a!==null) return '_l566Fill doit renoncer quand la borne est atteinte';
  if(b!==null) return '_l566Bornee doit renoncer';
  if(JSON.stringify(fin)!==JSON.stringify(f)) return 'borne atteinte : le plan final doit rester le plan en familles';
  if(!(chuteFin(_l444Pal(clone(g))[0])>=750)) return 'borne rendue : le regroupement doit revenir';
  return '';
});
{ // temps CPU du processus (process.cpuUsage, pas l horloge murale : une machine chargee ne fait pas rougir le test) : LEGRAND et 12 commandes de 12 laizes — seuil LARGE ; la vraie borne est le COMPTE d etapes L566_OPS_MAX (C13)
  const cpu=()=>{ const u=process.cpuUsage(); return (u.user+u.system)/1000; };
  const g=mk(LEGRAND,2080,0); const t0=cpu(); _l444Pal(clone(g)); const dt=cpu()-t0;
  let worst=0; for(let t=0;t<12;t++){ const gg=mk(genRows(12,260,24),2080,pick([0,5])); const t1=cpu(); _l444Pal(clone(gg)); const d=cpu()-t1; if(d>worst) worst=d; }
  const ok=dt<3000&&worst<5000; if(!ok) fail++;
  console.log((ok?'✅ ':'❌ ')+'C14 temps CPU (seuil large) : LEGRAND '+dt.toFixed(0)+' ms (< 3000), pire de 12 commandes a 12 laizes '+worst.toFixed(0)+' ms (< 5000)');
}
console.log('   (banc : '+CASES.length+' commandes de 7 a 11 laizes ; plans en familles '+enFamilles+' ; dont regroupes en fin de plan '+regroupes+' ; gain cumule de chute en fin '+Math.round(gains)+' mm)');
console.log(fail?('\n💥 '+fail+' propriete(s) VIOLEE(S)'):'\n🏆 CHUTES L566 VALIDEES : LEGRAND 3 bobines/869/derniere chute >= 750/<= 6 laizes · jamais plus de bobines · perte totale identique · chute de fin jamais diminuee · <= 6 laizes + pic <= 6 · L448 inchangee · plan identique a L564 sans familles · sac-a-dos = force brute · pur · deterministe · borne d etapes');
process.exit(fail?1:0);
