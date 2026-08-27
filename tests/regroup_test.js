// regroup_test.js — [L444] GARDE DE SENS du POST-TRAITEMENT « chutes regroupees sur la derniere bobine ».
// Le moteur reste gele (engine_identity) ; ce fichier prouve que _l444Regroup ne peut RIEN casser :
// conservation exacte du multiset, capacite, nombre de bobines constant, chute de la derniere bobine
// jamais diminuee, pic palettes jamais aggrave au-dela de 4, coherence bobines<->planGroups,
// determinisme et idempotence. LCG seed 444444, jamais Math.random.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let s=(src.slice(i-6,i)==='async ')?i-6:i;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(s,k+1);}
global.PALETTES_MAX=4; global.MAX_USEFUL_MM=4000; global.MAX_BLADE_MM=50; global.packTruncated=false; global._laizeSortExcluded=()=>false;
['expandDemand','buildCounts','calcStats','makeLabel','bestPattern','pack','groupBobines','computeChutesUsed','reduceItemsByChutes',
 'assignChutesForDisplay','groupBobinesWithChutes','packRecutRolls','groupRecutRolls','packRefGroups','_pgW','_seqPeak','_seqPeakPartial',
 '_seqMinPalettes','_palRepack','_palBobines','_palSplitSolde','packRefGroupsPal',
 '_l444PalettePeak','_l444Fill','_l444RegroupRef','_l444Regroup','_l444Pal'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });

let seed=444444; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}, ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)), pick=arr=>arr[ri(0,arr.length-1)];
const multiset=bob=>{const m={};bob.forEach(p=>p.forEach(x=>{m[x.width]=(m[x.width]||0)+x.qty;}));return m;};
const msEq=(a,b)=>Object.keys(a).length===Object.keys(b).length&&Object.keys(a).every(k=>a[k]===b[k]); let fail=0;
function prop(nom,N,gen,check){
  let bad=0,first=null;
  for(let t=0;t<N;t++){const input=gen(t);let r;try{r=check(input);}catch(e){r='CRASH: '+e.message;}
    if(r){bad++;if(!first)first={input,r};if(bad>=5)break;}}
  if(bad)fail++;
  console.log((bad?'❌ ':'✅ ')+nom+' ('+N+' cas)'+(bad?' — '+bad+' échec(s), 1er: '+JSON.stringify(first).slice(0,400):''));
}
function genRows(nw,maxW,maxQ){const uw=new Set(),rows=[];for(let i=0;i<nw;i++){let w;do{w=ri(15,maxW)+(ri(0,3)===0?0.5:0);}while(uw.has(w));uw.add(w);rows.push({width:w,qty:ri(1,maxQ)});}return rows;}
const USEFULS=[620,1000,1240,2080,2100], BLADES=[0,0.5,5];
function genGroups(){ return [{ref:'R1',useful:pick(USEFULS),blade:pick(BLADES),longueur:ri(50,900),mother:0,edge:0,film:'',veka:'',machine:'feba',rows:genRows(ri(2,9),600,50),chutes:[],recuts:[]}]; }
function runPair(groups){
  global.packTruncated=false;
  const base=packRefGroupsPal(JSON.parse(JSON.stringify(groups)));
  const post=_l444Regroup(JSON.parse(JSON.stringify(base)));
  return {base,post,trunc:global.packTruncated};
}

prop('R1 conservation : multiset identique apres regroupement',900,genGroups,(groups)=>{
  const {base,post,trunc}=runPair(groups); if(trunc) return '';
  for(let i=0;i<base.length;i++){ if(!msEq(multiset(base[i].bobines||[]),multiset(post[i].bobines||[]))) return 'multiset different ref '+i; }
  return '';
});
prop('R2 capacite : aucune bobine ne depasse la laize utile',900,genGroups,(groups)=>{
  const {post,trunc}=runPair(groups); if(trunc) return '';
  for(const c of post){ for(const p of (c.bobines||[])){ if(calcStats(p,c.blade).total>c.useful+0.01) return 'capacite depassee'; } }
  return '';
});
prop('R3 nombre de bobines constant',900,genGroups,(groups)=>{
  const {base,post,trunc}=runPair(groups); if(trunc) return '';
  for(let i=0;i<base.length;i++){ if((base[i].bobines||[]).length!==(post[i].bobines||[]).length) return 'nb bobines change'; }
  return '';
});
prop('R4 la chute de la DERNIERE bobine ne diminue jamais',900,genGroups,(groups)=>{
  const {base,post,trunc}=runPair(groups); if(trunc) return '';
  for(let i=0;i<base.length;i++){
    const b=base[i].bobines||[], p=post[i].bobines||[];
    if(!b.length||!p.length) continue;
    const cb=base[i].useful-calcStats(b[b.length-1],base[i].blade).total;
    const cp=post[i].useful-calcStats(p[p.length-1],post[i].blade).total;
    if(cp<cb-0.01) return 'chute derniere diminuee ('+cb+' -> '+cp+')';
  }
  return '';
});
prop('R5 pic palettes jamais pire que max(4, original)',900,genGroups,(groups)=>{
  const {base,post,trunc}=runPair(groups); if(trunc) return '';
  for(let i=0;i<base.length;i++){
    const po=_l444PalettePeak((base[i].bobines||[])), pn=_l444PalettePeak((post[i].bobines||[]));
    if(pn>Math.max(4,po)) return 'pic aggrave ('+po+' -> '+pn+')';
  }
  return '';
});
prop('R6 coherence bobines <-> planGroups (memes sequences)',900,genGroups,(groups)=>{
  const {post,trunc}=runPair(groups); if(trunc) return '';
  for(const c of post){
    const fromGroups=_palBobines(c.planGroups||[]);
    if(fromGroups.length!==(c.bobines||[]).length) return 'longueurs divergentes';
    for(let i=0;i<fromGroups.length;i++){ if(makeLabel(fromGroups[i])!==makeLabel(c.bobines[i])) return 'sequence divergente bobine '+i; }
  }
  return '';
});
prop('R7 determinisme : deux passes = resultat identique',400,genGroups,(groups)=>{
  const a=runPair(groups), b=runPair(groups);
  return JSON.stringify(a.post)!==JSON.stringify(b.post)?'non deterministe':'';
});
prop('R8 idempotence : re-regrouper ne change plus rien',400,genGroups,(groups)=>{
  const {post,trunc}=runPair(groups); if(trunc) return '';
  const again=_l444Regroup(JSON.parse(JSON.stringify(post)));
  for(let i=0;i<post.length;i++){
    const a=(post[i].bobines||[]).map(p=>makeLabel(p)).join('|'), b=(again[i].bobines||[]).map(p=>makeLabel(p)).join('|');
    if(a!==b) return 'seconde passe a modifie le plan';
  }
  return '';
});
// R9 — le cas REEL valide par Esteban (27/08) : 2 bobines pleines PILE, solde 1680 sur la derniere
prop('R9 cas Esteban (2080, 6 laizes) : intermediaires pleines + solde 1680 en fin',1,()=>null,()=>{
  const groups=[{ref:'KX',useful:2080,blade:0,longueur:250,mother:0,edge:0,film:'',veka:'',machine:'cevenini',
    rows:[{width:70,qty:10},{width:58,qty:20},{width:40,qty:15},{width:35,qty:10},{width:30,qty:40},{width:55,qty:10}],chutes:[],recuts:[]}];
  const post=_l444Pal(groups);
  const b=post[0].bobines;
  if(b.length!==3) return '3 bobines attendues, '+b.length;
  const t=b.map(p=>calcStats(p,0).total);
  if(t[0]!==2080||t[1]!==2080) return 'intermediaires non pleines : '+t.join('/');
  if(2080-t[2]!==1680) return 'solde attendu 1680, obtenu '+(2080-t[2]);
  return '';
});
// R10 — commande REELLE PRIMA pr767511 (27/08) : le re-pack palettes coutait une bobine mere entiere
prop('R10 cas PRIMA (2080, 8 laizes, ~1630 pieces) : 31 bobines, chute unique 1300 en FIN, pic <=4',1,()=>null,()=>{
  const groups=[{ref:'P',useful:2080,blade:0,longueur:600,mother:0,edge:0,film:'',veka:'',machine:'maveg',
    rows:[{width:20,qty:506},{width:30,qty:406},{width:40,qty:402},{width:50,qty:160},{width:60,qty:60},{width:70,qty:60},{width:80,qty:50},{width:100,qty:50}],chutes:[],recuts:[]}];
  const c=_l444Pal(groups)[0]; const b=c.bobines||[];
  if(b.length!==31) return '31 bobines attendues, '+b.length;
  const chutes=b.map((p,i)=>[i,2080-calcStats(p,0).total]).filter(x=>x[1]>=30);
  if(chutes.length!==1) return 'une seule chute attendue, '+chutes.length;
  if(chutes[0][0]!==30) return 'chute pas en DERNIERE position (bobine '+(chutes[0][0]+1)+')';
  if(Math.round(chutes[0][1])!==1300) return 'chute 1300 attendue, '+Math.round(chutes[0][1]);
  if(_l444PalettePeak(b)>4) return 'pic palettes > 4';
  return '';
});
// R11 — le brut n'est JAMAIS choisi si son ordre naturel casse les 4 palettes
prop('R11 le choix brut respecte toujours PALETTES_MAX',400,genGroups,(groups)=>{
  const out=_l444Pal(JSON.parse(JSON.stringify(groups)));
  for(const c of out){ if(c._l446Brut&&_seqPeak(c.planGroups||[])>PALETTES_MAX) return 'brut choisi avec pic > 4'; }
  return '';
});
console.log(fail?('\n💥 '+fail+' propriete(s) VIOLEE(S)'):'\n🏆 REGROUPEMENT VALIDÉ : conservation · capacité · nb constant · chute finale jamais réduite · palettes · cohérence · déterminisme · idempotence · cas Esteban');
process.exit(fail?1:0);
