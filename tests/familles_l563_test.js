// familles_l563_test.js — [L563] GARDE DE SENS de la recherche en FAMILLES DE LAIZES DISJOINTES (couche _l563Familles,
// appelee par _l444Pal quand le plan « palettes » coute plus de bobines que le brut et que le brut est refuse par L448).
// Le moteur reste gele (engine_identity) ; ce fichier prouve que la couche ne peut RIEN casser et qu'elle fait ce qu'elle
// promet : cas LEGRAND exact (3 bobines, perte 869, familles de la plus petite SOMME des ecarts = 181), jamais plus de bobines
// que le plan palettes d'avant, multiset conserve, capacite, au plus PALETTES_MAX laizes par bobine, pic _seqPeak <= PALETTES_MAX,
// determinisme, forme de sortie identique a _palRepack, regle L448 inchangee, repli au-dela de la borne, chutes/rouleaux intouches,
// packTruncated remis meme quand une famille est TRONQUEE, optimum identique a la force brute (n <= 8), temps borne,
// plan FINAL de _l444Pal regroupe dans la limite de 6 laizes / 6 palettes (adapte L566 : chutes regroupees en fin de plan), borne de surete L563_PACK_MAX (un compte
// d appels au moteur, jamais un temps). LCG seed 563563, jamais Math.random. Vu ROUGE sur L561 (fonction absente) avant d'etre vert.
// Les commandes aleatoires sont calculees UNE fois (plan palettes, brut, plan d'avant, plan nouveau) puis relues par chaque propriete.
const fs=require('fs');
const src=fs.readFileSync(process.env.L563_HTML||require('path').join(__dirname,'..','index.html'),'utf8');   // L563_HTML : rejouer le test sur un autre index.html (preuve « rouge avant »)
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let s=(src.slice(i-6,i)==='async ')?i-6:i;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(s,k+1);}
global.PALETTES_MAX=4; global.MAX_USEFUL_MM=4000; { const m=src.match(/var L448_PAL_TOL=(\d+)/); global.L448_PAL_TOL=m?Number(m[1]):6; } global.MAX_BLADE_MM=50; global.packTruncated=false; global._laizeSortExcluded=()=>false;
['expandDemand','buildCounts','calcStats','makeLabel','bestPattern','pack','groupBobines','computeChutesUsed','reduceItemsByChutes',
 'assignChutesForDisplay','groupBobinesWithChutes','packRecutRolls','groupRecutRolls','packRefGroups','_pgW','_seqPeak','_seqPeakPartial',
 '_seqMinPalettes','_palRepack','_palBobines','_palSplitSolde','packRefGroupsPal',
 '_l444PalettePeak','_l444Fill','_l444RegroupRef','_l444Regroup','_l444Pal'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
// [L566] _l444Pal regroupe aussi les plans en familles par _l566RegroupeBorne : sans ces fonctions chargees, l'appel echoue DANS le try de _l444Pal et le plan en familles reste tel quel (le test ne verrait rien).
if(src.indexOf('\nfunction _l566RegroupeBorne(c,regroupe){')>=0&&/^var L566_OPS_MAX=(\d+);/m.test(src)){ global.L566_OPS_MAX=Number(src.match(/^var L566_OPS_MAX=(\d+);/m)[1]); ['_l566Fill','_l566Chute','_l566Bornee','_l566Respecte','_l566RegroupeBorne'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); }); }
let fail=0;
if(src.indexOf('\nfunction _l563Familles(c,b){')<0||!/^var L563_N_MAX=(\d+);/m.test(src)){
  console.log('❌ L563 : _l563Familles ou L563_N_MAX absent d index.html (lot non pose) — version '+((src.match(/APP_VERSION='([^']*)'/)||[])[1]||'?'));
  console.log('\n💥 1 propriete(s) VIOLEE(S)'); process.exit(1);
}
global.L563_N_MAX=Number(src.match(/^var L563_N_MAX=(\d+);/m)[1]);
const PACK_MAX_FICHIER=/^var L563_PACK_MAX=(\d+);/m.test(src)?Number(src.match(/^var L563_PACK_MAX=(\d+);/m)[1]):null;   // null : v1 sans borne de surete (F14 rouge)
global.L563_PACK_MAX=PACK_MAX_FICHIER===null?1e9:PACK_MAX_FICHIER;
global._l563Familles=eval('('+fnOf('_l563Familles')+')');

let seed=563563; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;}, ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)), pick=arr=>arr[ri(0,arr.length-1)];
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
function genGroups(nMin,nMax){ return mk(genRows(ri(nMin,nMax),260,24),pick(USEFULS),pick(BLADES)); }
const clone=x=>JSON.parse(JSON.stringify(x));
// compteur d appels au moteur (pack) : la couche appelle le pack GLOBAL, on l enveloppe le temps d une mesure
const packReel=global.pack; let packCalls=0, packTruncVu=false;
const compterPack=(fn)=>{ packCalls=0; packTruncVu=false; global.pack=function(){ const r=packReel.apply(this,arguments); packCalls++; if(global.packTruncated) packTruncVu=true; return r; }; try{ return fn(); }finally{ global.pack=packReel; } };
// Plan de la couche AVANT ce lot (L561 : packRefGroupsPal, puis regle L448, puis _l444Regroup), recalcule a partir des memes pal/brut.
function avant561(pal,brut){
  const out=pal.map((c,i)=>{ const b=brut[i]; if(b.bobines.length<c.bobines.length){ const peakNat=_seqPeak(b.planGroups||[]); if(peakNat<=L448_PAL_TOL){ const _o=_palSplitSolde(b.planGroups); return Object.assign({},b,{planGroups:_o,bobines:_palBobines(_o),_palPeak:peakNat,_l446Brut:true}); } } return c; });
  return _l444Regroup(clone(out));
}
// Familles d un plan de _l563Familles (coupure a chaque _phaseEnd) -> vecteur (nb, somme des ecarts, perte, nb familles) + ecarts
function vecteurDe(f){
  const fams=[]; let cur=[]; (f.planGroups||[]).forEach(g=>{ cur.push(g); if(g._phaseEnd){ fams.push(cur); cur=[]; } }); if(cur.length) fams.push(cur);
  let nb=0, esum=0, perte=0; const ecarts=[];
  fams.forEach(gs=>{ const ws=new Set(); let n=0, waste=0; gs.forEach(g=>{ const k=Math.max(1,parseInt(g.count)||1); n+=k; waste+=k*(f.useful-calcStats(g.pattern,f.blade).total); _pgW(g).forEach(w=>ws.add(w)); });
    const arr=[...ws]; const e=Math.max(...arr)-Math.min(...arr); const solde=Math.max(0,f.useful-calcStats(gs[gs.length-1].pattern,f.blade).total);
    nb+=n; esum+=e; ecarts.push(e); perte+=waste-solde; });
  return {nb,esum,perte,fam:fams.length,ecarts};
}
// critere v2 (decision du 19/11/2026) : bobines, puis SOMME des ecarts, puis perte, puis nb de familles — plus d ecart maximal
const cmpVec=(a,z)=>a.nb!==z.nb?a.nb-z.nb:(Math.abs(a.esum-z.esum)>1e-9?a.esum-z.esum:(Math.abs(a.perte-z.perte)>1e-9?a.perte-z.perte:a.fam-z.fam));
// FORCE la recherche : un c « palettes » gonfle de k bobines (la cible devient le nb du plan palettes + k - 1)
const force=(pal,k)=>Object.assign({},pal,{bobines:pal.bobines.concat(Array.from({length:k||1},()=>pal.bobines[0]))});
// ---- banc de commandes aleatoires (5 a 12 laizes : la ou le plan palettes peut couter plus que le brut), calculees UNE fois ----
const CASES=[]; let directes=0, atteintes=0, finales=0;
for(let t=0;t<260;t++){
  const g=genGroups(5,12); global.packTruncated=false;
  const pal=packRefGroupsPal(clone(g)), brut=packRefGroups(clone(g)); const trunc=global.packTruncated;
  const old=avant561(pal,brut); global.packTruncated=false; const now=_l444Pal(clone(g)); const trunc2=global.packTruncated;
  const fam=compterPack(()=>_l563Familles(pal[0],brut[0])); const packs=packCalls;
  const atteinte=brut[0].bobines.length<pal[0].bobines.length&&_seqPeak(brut[0].planGroups)>L448_PAL_TOL;   /* la recherche est reellement atteinte dans _l444Pal */
  if(atteinte) atteintes++;
  if(fam) directes++;
  if(now[0]._l563Familles) finales++;
  CASES.push({g,pal,brut,old,now,fam,packs,atteinte,trunc:trunc||trunc2});
}
const caseAt=t=>CASES[t%CASES.length];

// ---- F1 : cas REEL LEGRAND SPAIN p427611 (19/11/2026) : 11 laizes, 2080, lame 0 ----
const LEGRAND=[[200,2],[110,4],[75,18],[66,12],[63,6],[61,3],[59,4],[56,8],[48,10],[44,10],[28,8]].map(([width,qty])=>({width,qty}));
prop('F1 cas LEGRAND (2080, 11 laizes) : plan final 3 bobines, perte totale 869 mm, pic <= tolerance',1,()=>null,()=>{
  const g=mk(LEGRAND,2080,0); global.packTruncated=false;
  const c=_l444Pal(clone(g))[0]; const b=c.bobines||[];
  if(b.length!==3) return '3 bobines attendues, '+b.length;
  const perte=b.length*2080-b.reduce((s,p)=>s+calcStats(p,0).total,0);
  if(Math.round(perte)!==869) return 'perte totale 869 attendue, '+perte;
  if(!msEq(multiset(b),rowsMs(LEGRAND))) return 'multiset different';
  if(_seqPeak(c.planGroups||[])>L448_PAL_TOL) return 'pic > tolerance : '+_seqPeak(c.planGroups);
  if(!c._l563Familles) return 'le plan ne vient pas de la recherche en familles';
  if(global.packTruncated) return 'packTruncated leve';
  return '';
});
prop('F1b cas LEGRAND : la recherche = 3 familles voisines (somme des ecarts 181, la plus petite possible), <= 4 laizes par bobine, pic 4',1,()=>null,()=>{
  const g=mk(LEGRAND,2080,0);
  const pal=packRefGroupsPal(clone(g))[0], brut=packRefGroups(clone(g))[0];
  if(!(pal.bobines.length===4&&brut.bobines.length===3&&_seqPeak(brut.planGroups)>L448_PAL_TOL)) return 'prealable : palettes 4 / brut 3 refuse attendu, '+pal.bobines.length+'/'+brut.bobines.length+' pic '+_seqPeak(brut.planGroups);
  const f=_l563Familles(pal,brut); if(!f) return 'null';
  if(f.bobines.length!==3||f._palPhases!==3||f._palPeak!==4||_seqPeak(f.planGroups)!==4) return 'attendu 3 bobines / 3 familles / pic 4 : '+f.bobines.length+'/'+f._palPhases+'/'+f._palPeak;
  for(const p of f.bobines){ if(_pgW({pattern:p}).length>PALETTES_MAX) return 'bobine a plus de 4 laizes : '+makeLabel(p); }
  const v=vecteurDe(f);
  if(v.esum!==181||v.ecarts.join('/')!=='137/16/28') return 'criteres voisines attendus somme des ecarts 181 (137/16/28), obtenu '+JSON.stringify(v);
  // optimum sous le critere v2 (unique, confirme par force brute independante sur les 556 711 partitions) : verrou de regression
  const fams=f.planGroups.map(g=>g.pattern.map(p=>p.qty+'x'+p.width).join('+')+(g._phaseEnd?'|':''));
  const attendu=['2x200+4x110+12x66+6x63|','18x75+3x61+4x59|','8x56+10x48+10x44+8x28'];
  if(fams.join(' ')!==attendu.join(' ')) return 'familles attendues '+attendu.join(' ')+', obtenu '+fams.join(' ');
  if(_pgW(f.planGroups[0]).indexOf(200)<0) return 'la famille de la plus grande laize doit ouvrir le plan';
  // le plan FINAL de _l444Pal (L566) : memes 3 bobines et meme perte totale que le plan des familles, chutes regroupees (derniere >= celle des familles), <= 6 laizes par bobine, pic <= 6
  { const fin=_l444Pal(clone(g))[0]; const ch=c=>c.useful-calcStats(c.bobines[c.bobines.length-1],c.blade).total;
    if(fin.bobines.length!==f.bobines.length||!msEq(multiset(fin.bobines),multiset(f.bobines))) return 'le plan final de _l444Pal differe du plan de la recherche (bobines ou multiset)';
    if(ch(fin)<ch(f)) return 'la chute de la derniere bobine a ete diminuee par le plan final';
    if(!(ch(fin)>=750)) return 'LEGRAND : chute regroupee en fin de plan attendue (derniere bobine >= 750 mm), obtenu '+ch(fin);
    for(const p of fin.bobines){ if(_pgW({pattern:p}).length>L448_PAL_TOL) return 'plan final : bobine a plus de '+L448_PAL_TOL+' laizes'; }
    if(_seqPeak(fin.planGroups)>L448_PAL_TOL) return 'plan final : pic > '+L448_PAL_TOL; }
  console.log('   LEGRAND : '+fams.join('  ')+'  (ecarts 137 / 16 / 28, somme 181, perte totale 869)');
  return '';
});
// ---- proprietes sur le banc ----
prop('F2 jamais plus de bobines que le plan de la couche d avant (L561) ; strictement moins quand la recherche s applique ; sinon plan identique',CASES.length,caseAt,(k)=>{
  if(k.trunc) return '';
  for(let i=0;i<k.now.length;i++){
    if(k.now[i].bobines.length>k.old[i].bobines.length) return 'plus de bobines qu avant : '+k.now[i].bobines.length+' > '+k.old[i].bobines.length;
    if(k.now[i]._l563Familles){ if(!(k.now[i].bobines.length<k.pal[i].bobines.length)) return 'recherche appliquee sans gain strict'; if(k.old[i]._l446Brut) return 'recherche appliquee alors que le brut etait accepte (L448)'; if(!k.fam) return 'incoherent'; }
    else if(JSON.stringify(k.now[i])!==JSON.stringify(k.old[i])) return 'plan change sans recherche appliquee (rien d autre ne doit bouger)';
  }
  return '';
});
prop('F3 conservation : multiset des laizes identique a la commande',CASES.length,caseAt,(k)=>{
  if(k.trunc) return '';
  for(let i=0;i<k.now.length;i++){ const valid=k.g[i].rows.filter(r=>r.width<=k.g[i].useful); if(!msEq(multiset(k.now[i].bobines||[]),rowsMs(valid))) return 'multiset different'; }
  return '';
});
prop('F4 capacite : chaque bobine <= laize utile, lame comprise',CASES.length,caseAt,(k)=>{
  if(k.trunc) return '';
  for(const c of k.now){ for(const p of (c.bobines||[])){ if(calcStats(p,c.blade).total>c.useful+0.01) return 'capacite depassee : '+makeLabel(p); } }
  return '';
});
prop('F5 recherche appliquee : <= PALETTES_MAX laizes par bobine, pic _seqPeak <= PALETTES_MAX, gain strict, forme _palRepack',CASES.length,caseAt,(k)=>{
  const f=k.fam, pal=k.pal[0], brut=k.brut[0]; if(!f||k.trunc) return '';
  if(!(brut.bobines.length<pal.bobines.length)) return 'appliquee sans que le plan palettes coute plus que le brut';
  if(!(f.bobines.length<pal.bobines.length)) return 'pas de gain strict';
  for(const p of f.bobines){ if(_pgW({pattern:p}).length>PALETTES_MAX) return '> PALETTES_MAX laizes : '+makeLabel(p); if(calcStats(p,f.blade).total>f.useful+0.01) return 'capacite'; }
  if(_seqPeak(f.planGroups)>PALETTES_MAX||f._palPeak!==_seqPeak(f.planGroups)) return 'pic '+_seqPeak(f.planGroups)+' / _palPeak '+f._palPeak;
  if(!msEq(multiset(f.bobines),multiset(pal.bobines))) return 'multiset different du plan palettes';
  // forme : memes cles que _palRepack (+ le drapeau), planGroups {pattern,count,_phaseEnd?}, bobines = _palBobines(planGroups), solde eclate, fins de famille
  const cles=Object.keys(f).filter(x=>x!=='_l563Familles').sort().join(','), attendu=Object.keys(Object.assign({},pal,{bobines:1,planGroups:1,stats:1,_palPhases:1,_palPeak:1})).sort().join(',');
  if(cles!==attendu) return 'cles differentes de _palRepack : '+cles+' vs '+attendu;
  const sk=Object.keys(f.stats).sort().join(','); if(sk!=='pct,totalBobines,totalMat,totalUsed') return 'stats : '+sk;
  if(f.stats.totalBobines!==f.bobines.length||f.stats.totalMat!==f.bobines.length*f.useful||Math.abs(f.stats.totalUsed-f.bobines.reduce((s,p)=>s+calcStats(p,f.blade).total,0))>1e-6) return 'stats incoherentes';
  for(const gr of f.planGroups){ const ks=Object.keys(gr).filter(x=>x!=='pattern'&&x!=='count'&&x!=='_phaseEnd'); if(ks.length) return 'cle inattendue dans planGroups : '+ks.join(); if(!(gr.count>=1)) return 'count'; for(const p of gr.pattern){ if(Object.keys(p).sort().join()!=='qty,width') return 'motif : '+Object.keys(p).join(); } }
  const fromG=_palBobines(f.planGroups); if(fromG.length!==f.bobines.length||fromG.some((p,i)=>makeLabel(p)!==makeLabel(f.bobines[i]))) return 'bobines != _palBobines(planGroups)';
  const fins=f.planGroups.filter(gr=>gr._phaseEnd); if(fins.length!==f._palPhases-1||fins.some(gr=>gr.count!==1)) return 'fins de famille : '+fins.length+' pour '+f._palPhases+' familles';
  const last=f.planGroups[f.planGroups.length-1]; if(last.count!==1||last._phaseEnd) return 'dernier motif : count '+last.count;
  // ordre : la famille de la plus grande laize ouvre le plan (premiere famille = motifs jusqu au premier _phaseEnd inclus)
  const wmax=Math.max(...f.bobines.map(p=>Math.max(..._pgW({pattern:p})))); const iFin=f.planGroups.findIndex(gr=>gr._phaseEnd); const fam1=iFin<0?f.planGroups:f.planGroups.slice(0,iFin+1);
  if(!fam1.some(gr=>_pgW(gr).indexOf(wmax)>=0)) return 'la plus grande laize n ouvre pas le plan';
  return '';
});
prop('F6 determinisme : deux passes = resultat identique (JSON)',80,caseAt,(k)=>{
  const a=_l444Pal(clone(k.g)), b=_l444Pal(clone(k.g));
  return JSON.stringify(a)!==JSON.stringify(b)||JSON.stringify(a)!==JSON.stringify(k.now)?'non deterministe':'';
});
prop('F7 regle L448 inchangee : brut accepte (pic <= tolerance, moins de bobines) => meme plan qu avant, jamais de recherche',CASES.length,caseAt,(k)=>{
  if(k.trunc) return '';
  for(let i=0;i<k.now.length;i++){ if(k.old[i]._l446Brut){ if(!k.now[i]._l446Brut||k.now[i]._l563Familles) return 'brut accepte avant, plus maintenant'; if(JSON.stringify(k.now[i])!==JSON.stringify(k.old[i])) return 'plan brut modifie'; } }
  return '';
});
prop('F8 repli au-dela de la borne : L563_N_MAX+1 laizes => null, plan identique a avant',60,()=>genGroups(L563_N_MAX+1,L563_N_MAX+2),(g)=>{
  global.packTruncated=false; const pal=packRefGroupsPal(clone(g)), brut=packRefGroups(clone(g)); if(global.packTruncated) return '';
  if(_l563Familles(force(pal[0],2),brut[0])!==null) return 'recherche lancee au-dela de la borne';
  const now=_l444Pal(clone(g)), old=avant561(pal,brut); if(JSON.stringify(now)!==JSON.stringify(old)) return 'plan change au-dela de la borne';
  return '';
});
prop('F9 chutes en stock ou rouleaux a recouper presents, entree invalide, brut pas moins cher => la recherche ne s applique pas',CASES.length,caseAt,(k)=>{
  const pal=k.pal[0], brut=k.brut[0], w0=k.g[0].rows[0].width;
  const c1=Object.assign({},force(pal,2),{chutesUsed:{[w0]:1}}); if(_l563Familles(c1,brut)!==null) return 'appliquee avec chutes stock';
  const c2=Object.assign({},force(pal,2),{recutBobines:[{rollW:500,pattern:[{width:w0,qty:1}]}]}); if(_l563Familles(c2,brut)!==null) return 'appliquee avec rouleaux';
  if(_l563Familles(pal,force(pal,1))!==null) return 'appliquee alors que le brut n est pas moins cher';
  if(_l563Familles(null,brut)!==null||_l563Familles(pal,null)!==null) return 'appliquee sur entree invalide';
  return '';
});
prop('F10 garde-fou du moteur : packTruncated remis tel qu il etait (banc)',60,caseAt,(k)=>{
  const pal=k.pal[0], brut=k.brut[0];
  global.packTruncated=false; _l563Familles(force(pal,1),brut); if(global.packTruncated!==false) return 'leve a tort';
  global.packTruncated=true; _l563Familles(force(pal,1),brut); if(global.packTruncated!==true) return 'efface a tort';
  global.packTruncated=false; return '';
});
prop('F10b troncature FORCEE : une famille que pack() tronque (quantite aberrante, > 400 bobines) leve packTruncated DANS la recherche, est ecartee, et le drapeau est remis tel qu il etait',1,()=>null,()=>{
  // 450 pieces de 900 sur une laize utile de 1000 : chaque famille qui contient le 900 demande 450 bobines ; pack() s arrete a 400 (+ 1 bobine de reste)
  // => packTruncated leve et pieces manquantes => famille ecartee ; aucune partition valide => null
  const rows=[{width:900,qty:450},{width:800,qty:1},{width:700,qty:1},{width:600,qty:1},{width:500,qty:1}];
  global.packTruncated=false; const seul=pack(expandDemand([rows[0]]),1000,0); if(global.packTruncated!==true||seul.length>=450) return 'prealable : pack() ne tronque pas 450 bobines ('+seul.length+' rendues)';
  const c={useful:1000,blade:0,rows,bobines:new Array(500).fill([])}, b={bobines:new Array(5).fill([])};   /* cible 499 bobines : la DP accepte les familles du 900 (borne basse 405) */
  global.packTruncated=false; const r1=compterPack(()=>_l563Familles(c,b));
  if(r1!==null) return 'un plan a ete rendu alors que toutes les familles du 900 sont tronquees';
  if(!packTruncVu||packCalls<1) return 'la troncature n a pas eu lieu dans la recherche (appels pack : '+packCalls+')';
  if(global.packTruncated!==false) return 'packTruncated laisse leve apres une famille tronquee';
  global.packTruncated=true; const r2=compterPack(()=>_l563Familles(c,b)); if(r2!==null||global.packTruncated!==true) return 'drapeau deja leve efface a tort';
  global.packTruncated=false; return '';
});
// ---- F11 : optimum IDENTIQUE a la force brute (toutes les partitions en familles de <= 4 laizes, n <= 8), critere v2 ----
function forceBrute(c,T){
  const useful=c.useful, blade=Math.max(0,Number(c.blade)||0);
  const items=expandDemand(c.rows.filter(r=>r.width<=useful)); const widths=[...new Set(items)].sort((x,y)=>y-x); const n=widths.length;
  const memo=new Map();
  const cost=S=>{ if(memo.has(S)) return memo.get(S); const set=new Set(); let pieces=0; for(let i=0;i<n;i++) if((S>>i)&1){ set.add(widths[i]); pieces+=items.filter(w=>w===widths[i]).length; }
    const bobs=pack(items.filter(w=>set.has(w)),useful,blade); let placed=0,used=0; bobs.forEach(p=>{ p.forEach(x=>{placed+=x.qty;}); used+=calcStats(p,blade).total; });
    let r=null; if(bobs.length&&placed===pieces){ const gs=groupBobines(bobs,blade); const solde=Math.max(0,useful-calcStats(gs[gs.length-1].pattern,blade).total); const ws=[...set]; r={nb:bobs.length,perte:bobs.length*useful-used-solde,e:Math.max(...ws)-Math.min(...ws)}; }
    memo.set(S,r); return r; };
  let best=null;
  (function rec(rem,acc){
    if(!rem){ let nb=0,esum=0,perte=0; for(const S of acc){ const r=cost(S); if(!r) return; nb+=r.nb; esum+=r.e; perte+=r.perte; }
      if(nb>T) return; const v={nb,esum,perte,fam:acc.length}; if(!best||cmpVec(v,best)<0) best=v; return; }
    const low=rem&-rem, others=[]; for(let x=rem^low;x;x&=x-1) others.push(x&-x);
    const sub=(S,start,k)=>{ acc.push(S); rec(rem^S,acc); acc.pop(); if(k<PALETTES_MAX-1) for(let i=start;i<others.length;i++) sub(S|others[i],i+1,k+1); };
    sub(low,0,0);
  })((1<<n)-1,[]);
  return best;
}
prop('F11 optimum identique a la force brute (n = 5..8, cible = nb du plan palettes, puis nb palettes + 1 ; vecteur nb / somme ecarts / perte / familles)',100,()=>genGroups(5,8),(g)=>{
  global.packTruncated=false; const pal=packRefGroupsPal(clone(g))[0], brut=packRefGroups(clone(g))[0]; if(global.packTruncated) return '';
  for(const k of [1,2]){
    const c=force(pal,k), T=c.bobines.length-1;
    const f=_l563Familles(c,brut); const fb=forceBrute(c,T);
    if(!f&&!fb) continue;
    if(!f||!fb) return 'DP '+(f?'trouve':'null')+' / force brute '+(fb?'trouve':'null')+' (cible '+T+')';
    const v=vecteurDe(f); if(cmpVec(v,fb)!==0) return 'vecteurs differents : DP '+JSON.stringify(v)+' / brute '+JSON.stringify(fb);
  }
  return '';
});
// ---- F12 : temps (n = 14, recherche forcee = pire cas) : seuil LARGE 1500 ms pour ne jamais rougir sur un runner CI charge ; la VRAIE borne est le COMPTE d appels pack L563_PACK_MAX (F14) ----
{
  let worst=0, tot=0; const N=12;
  for(let t=0;t<N;t++){
    const g=mk(genRows(14,260,24),2080,pick([0,5])); const pal=packRefGroupsPal(clone(g))[0], brut=packRefGroups(clone(g))[0];
    const c=force(pal,1); const t0=process.hrtime.bigint(); _l563Familles(c,brut); const dt=Number(process.hrtime.bigint()-t0)/1e6; tot+=dt; if(dt>worst) worst=dt;
  }
  const okT=worst<1500; if(!okT) fail++;
  console.log((okT?'✅ ':'❌ ')+'F12 temps (seuil large) : n = 14 laizes, '+N+' recherches forcees, pire '+worst.toFixed(0)+' ms (< 1500 ms exige : seuil large pour un runner CI charge ; la VRAIE borne est le COMPTE d appels pack L563_PACK_MAX, voir F14), moyenne '+(tot/N).toFixed(0)+' ms');
}
// ---- F13 : plan FINAL de _l444Pal quand la recherche s applique (L566 : decision du 23/11/2026 — les chutes sont REGROUPEES en fin de plan aussi pour les plans en familles, DANS la limite de 6) ----
{
  const vus=CASES.filter(k=>k.atteinte&&k.fam&&!k.trunc);
  const chuteFin=c=>c.useful-calcStats(c.bobines[c.bobines.length-1],c.blade).total;
  prop('F13 plan FINAL de _l444Pal quand la recherche s applique : meme nombre de bobines que le plan des familles, multiset conserve, <= L448_PAL_TOL laizes par bobine, pic _seqPeak <= L448_PAL_TOL, chute de la derniere bobine jamais diminuee ('+vus.length+' cas atteints)',Math.max(1,vus.length),t=>vus[t%Math.max(1,vus.length)],(k)=>{
    if(!k) return 'aucun cas atteint dans le banc : propriete vide';
    const c=k.now[0], f=k.fam;
    if(!c._l563Familles) return 'le plan final n est pas issu de la recherche en familles alors qu elle a trouve un plan';
    if(c.bobines.length!==f.bobines.length) return 'nombre de bobines change : '+c.bobines.length+' au lieu de '+f.bobines.length;
    if(!msEq(multiset(c.bobines),multiset(f.bobines))) return 'multiset different du plan des familles';
    for(const p of c.bobines){ if(_pgW({pattern:p}).length>L448_PAL_TOL) return 'plan final : bobine a '+_pgW({pattern:p}).length+' laizes (> '+L448_PAL_TOL+') : '+makeLabel(p); if(calcStats(p,c.blade).total>c.useful+0.01) return 'plan final : capacite depassee'; }
    if(_seqPeak(c.planGroups)>L448_PAL_TOL) return 'plan final : pic '+_seqPeak(c.planGroups)+' > '+L448_PAL_TOL;
    if(chuteFin(c)<chuteFin(f)-1e-9) return 'chute de la derniere bobine diminuee : '+chuteFin(c)+' < '+chuteFin(f);
    if(JSON.stringify(c)!==JSON.stringify(f)&&!(chuteFin(c)>chuteFin(f)+0.5)) return 'plan change sans gain de chute en fin de plan';
    return '';
  });
}
// ---- F14 : borne de surete L563_PACK_MAX (un COMPTE d appels au moteur par recherche, jamais un temps) ----
{
  let r='';
  if(PACK_MAX_FICHIER===null) r='var L563_PACK_MAX absent d index.html';
  else {
    const sur=CASES.filter(k=>k.packs>PACK_MAX_FICHIER); if(sur.length) r='recherche(s) a plus de '+PACK_MAX_FICHIER+' appels pack : '+sur.length+' (max '+Math.max(...CASES.map(k=>k.packs))+')';
    const k=CASES.find(k=>k.fam&&k.packs>2);
    if(!r&&!k) r='aucun cas du banc avec un plan trouve en plus de 2 appels pack : borne non testable';
    if(!r){
      const pal=k.pal[0], brut=k.brut[0]; const sauve=global.L563_PACK_MAX;
      try{
        global.L563_PACK_MAX=k.packs-1; global.packTruncated=false; const a=compterPack(()=>_l563Familles(pal,brut));
        if(a!==null) r='borne '+(k.packs-1)+' depassee ('+k.packs+' appels necessaires) et pourtant un plan est rendu';
        else if(packCalls>k.packs-1) r='la borne ne limite pas les appels : '+packCalls+' > '+(k.packs-1);
        else if(global.packTruncated!==false) r='packTruncated leve par une recherche bornee';
        if(!r){ global.packTruncated=true; const a2=_l563Familles(pal,brut); if(a2!==null||global.packTruncated!==true) r='recherche bornee : drapeau deja leve efface'; global.packTruncated=false; }
        if(!r){ global.L563_PACK_MAX=k.packs; const b=compterPack(()=>_l563Familles(pal,brut)); if(!b||JSON.stringify(b)!==JSON.stringify(k.fam)) r='borne = nombre d appels necessaires ('+k.packs+') : le plan devrait etre retrouve a l identique'; }
        if(!r){ global.L563_PACK_MAX=0; if(_l563Familles(pal,brut)!==null) r='borne 0 : aucune recherche ne devrait aboutir'; }
      }finally{ global.L563_PACK_MAX=sauve; global.packTruncated=false; }
    }
  }
  if(r) fail++;
  console.log((r?'❌ ':'✅ ')+'F14 borne de surete L563_PACK_MAX='+PACK_MAX_FICHIER+' : jamais plus d appels pack que la borne sur le banc (max '+Math.max(...CASES.map(k=>k.packs))+'), borne forcee a (appels - 1) => null et packTruncated intact, borne = appels => meme plan, borne 0 => null'+(r?' — '+r:''));
}
console.log('   (banc : '+CASES.length+' commandes de 5 a 12 laizes ; familles trouvees par appel direct : '+directes+' ; dont recherche reellement atteinte dans _l444Pal (brut moins cher mais refuse par L448) : '+atteintes+' ; plan final en familles : '+finales+')');
console.log(fail?('\n💥 '+fail+' propriete(s) VIOLEE(S)'):'\n🏆 FAMILLES L563 VALIDEES : LEGRAND 3 bobines/869/somme 181 · jamais plus de bobines · conservation · capacite · <= 4 laizes/bobine · pic · determinisme · forme _palRepack · L448 · borne n · chutes/rouleaux · packTruncated (troncature forcee) · force brute · temps · plan final regroupe (L566) · borne pack');
process.exit(fail?1:0);
