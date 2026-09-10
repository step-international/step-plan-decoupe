// matiere_l513_test.js — [L513 · decisions Celine 09/09/2026] GARDE de _l513Matiere : UNE seule matiere en m², familles
// DISJOINTES (perte = bords + lames + laize restante non gardee ; chutes gardees = solde derniere bobine + fins de phase +
// ✂ Chutes ; dechet NC = 🗑 Dechet). Invariant : perte + chutes + dechet + client = m2Coupes. Jamais un faux 0.
// + _l513MatSig : l instantane d une fiche editee ne bouge que si la MATIERE change.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.parseNum=eval('('+fnOf('parseNum')+')');
global.parseConf=eval('('+fnOf('parseConf')+')');
global.calcStats=eval('('+fnOf('calcStats')+')');
global._refIdKey=eval('('+fnOf('_refIdKey')+')');
global._refKeyOf=eval('('+fnOf('_refKeyOf')+')');
global._l507Traced=new WeakSet();
global._l506RefGroupFor=eval('('+fnOf('_l506RefGroupFor')+')');
global._l505HorsPlan=eval('('+fnOf('_l505HorsPlan')+')');
global._l507GroupUseful=eval('('+fnOf('_l507GroupUseful')+')');
let warns=0; global._l505Warn=function(){ warns++; };
global.ncLoss=eval('('+fnOf('ncLoss')+')');
const M=eval('('+fnOf('_l513Matiere')+')');
const SIG=eval('('+fnOf('_l513MatSig')+')');
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const near=(a,b,eps)=>typeof a==='number'&&Math.abs(a-b)<=(eps==null?0.11:eps);
const L=(conf,extra)=>Object.assign({conf,useful:1240,blade:0,coupee:true,refIdx:0},extra||{});

console.log('── 1. cas EPCO simplifie : mono-ref, mere 2100, bords 10, utile 2090, lame 5, 500 m ──');
{
  // 3 bobines : 4x502 (=2008+15 lame -> reste 67) ; 3x612 (=1836+10 -> reste 244) ; derniere 2x157 (=314+5 -> reste 1771 = solde garde)
  const f={mother:2100,useful:2090,blade:5,longueur:'500',ficheDetail:[L('4x502',{blade:5,useful:2090}),L('3x612',{blade:5,useful:2090}),L('2x157',{blade:5,useful:2090})]};
  const m=M(f);
  const k=0.5;   // 1 mm = 0,5 m² sur 500 m
  const bords=3*10*k, lames=(3*5+2*5+1*5)*k, restes=(67+244)*k, solde=1771*k, client=(2008+1836+314)*k;
  ok(m.ok===true,'calcul possible (ok)');
  ok(near(m.perteM2,bords+lames+restes),'perte = bords '+bords+' + lames '+lames+' + restes non gardes '+restes+' = '+(bords+lames+restes)+' m² → '+m.perteM2);
  ok(near(m.chutesM2,solde),'chutes gardees = solde de la derniere bobine '+solde+' m² → '+m.chutesM2);
  ok(m.dechetM2===0,'dechet NC = 0 sans bobineau jete → '+m.dechetM2);
  ok(m.m2Coupes===Math.round(3*2100*k),'m² coupes = 3 meres × 2100 × 0,5 = '+(3*2100*k)+' → '+m.m2Coupes);
  ok(near(m.perteM2+m.chutesM2+m.dechetM2+m.clientM2,m.m2Coupes,0.5),'INVARIANT : perte + chutes + dechet + client = m² coupes ('+(m.perteM2+m.chutesM2+m.dechetM2+m.clientM2)+' vs '+m.m2Coupes+')');
}
console.log('── 2. un bobineau 157 jete (🗑 Dechet) : dechet 78,5 m², perte et chutes INCHANGEES ──');
{
  const base={mother:2100,useful:2090,blade:5,longueur:'500',ficheDetail:[L('4x502',{blade:5,useful:2090}),L('3x612',{blade:5,useful:2090}),L('2x157',{blade:5,useful:2090})]};
  const m0=M(base);
  const f=JSON.parse(JSON.stringify(base)); f.ficheDetail[2].ncLots=[{q:1,w:157}]; f.ficheDetail[2].ncLarg=true; f.ficheDetail[2].actDechet=true;
  const m=M(f);
  ok(near(m.dechetM2,78.5),'dechet NC = 1 × 157 mm × 500 m = 78,5 m² → '+m.dechetM2);
  ok(near(m.perteM2,m0.perteM2)&&near(m.chutesM2,m0.chutesM2),'perte et chutes inchangees ('+m0.perteM2+' / '+m0.chutesM2+') → '+m.perteM2+' / '+m.chutesM2);
  ok(near(m.perteM2+m.chutesM2+m.dechetM2+m.clientM2,m.m2Coupes,0.5),'invariant conserve avec un dechet');
}
console.log('── 3. fin de phase : le reste d une bobine intermediaire phaseEnd est une CHUTE GARDEE ──');
{
  const f={mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[L('3x612',{useful:2090,phaseEnd:true}),L('4x502',{useful:2090}),L('2x157',{useful:2090})]};
  const m=M(f);
  const solde=(2090-314)*0.5, phase=(2090-1836)*0.5;
  ok(near(m.chutesM2,solde+phase),'chutes = solde derniere '+solde+' + fin de phase '+phase+' = '+(solde+phase)+' → '+m.chutesM2);
  ok(near(m.perteM2,3*10*0.5+(2090-2008)*0.5),'perte = bords 15 + reste de la bobine intermediaire non gardee 41 = 56 → '+m.perteM2);
}
console.log('── 4. « + Acceptable » n agit que sur le bobineau : la laize restante suit la regle normale ──');
{
  const f={mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[L('4x502',{useful:2090,ncLots:[{q:1,w:502}],ncLarg:true,actAccept:true}),L('2x157',{useful:2090})]};
  const m=M(f);
  ok(m.dechetM2===0&&near(m.perteM2,2*10*0.5+(2090-2008)*0.5),'bobineau accepte : pas de dechet, reste 82 mm de la 1re bobine en perte (+ bords) → perte '+m.perteM2+', dechet '+m.dechetM2);
}
console.log('── 5. jamais un faux zero ──');
{
  warns=0; const m=M({mother:2100,useful:2090,blade:0,ficheDetail:[L('4x502',{useful:2090})]});
  ok(m.ok===false&&m.perteM2===null&&warns>=1,'metrage absent → ok=false, m² null, trace ('+warns+' warn)');
  warns=0; const f={refGroups:[{ref:'KX1006-1',longueur:'1000',mother:1260,edge:20},{ref:'KX1006-1',longueur:'700',mother:1260,edge:20}],ficheDetail:[{conf:'20x55',useful:1240,blade:0,coupee:true,ref:'KX1006-1'}]};
  const m2=M(f);
  ok(m2.ok===false&&m2.perteM2===null&&warns>=1,'multi-ref homonymes sans identite → ok=false, m² null, trace ('+warns+' warn)');
}
console.log('── 6. manque-matiere : seules les lignes coupees ; la derniere COUPEE porte le solde ──');
{
  const f={mother:2100,useful:2090,blade:0,longueur:'500',manqueMatiere:true,ficheDetail:[L('4x502',{useful:2090,coupee:true}),L('3x612',{useful:2090,coupee:true}),L('2x157',{useful:2090,coupee:false})]};
  const m=M(f);
  ok(m.m2Coupes===Math.round(2*2100*0.5),'m² coupes = 2 meres seulement → '+m.m2Coupes);
  ok(near(m.chutesM2,(2090-1836)*0.5),'solde de la derniere bobine COUPEE (3x612 → 254 mm) en chutes → '+m.chutesM2);
}
console.log('── 7. residu d un rouleau ♻ recoupe = perte, hors m² coupes ──');
{
  const f={mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[L('2x157',{useful:2090}),L('1x100',{recut:true,rollW:300,useful:300})]};
  const m=M(f);
  ok(m.m2Coupes===Math.round(2100*0.5),'le rouleau ♻ ne compte pas dans les m² coupes → '+m.m2Coupes);
  ok(near(m.perteM2,10*0.5+(300-100)*0.5),'perte = bords de la mere 5 + residu du rouleau 100 = 105 → '+m.perteM2);
}
console.log('── 8. signature d edition : seule la MATIERE compte ──');
{
  const f={client:'VEKA',numCmd:'1',mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[L('4x502',{useful:2090})]};
  const s0=SIG(f,f.ficheDetail);
  const f1=Object.assign({},f,{client:'AUTRE',numCmd:'2',lame:'9'});
  ok(SIG(f1,f1.ficheDetail)===s0,'changer client / n° de commande / lame → signature IDENTIQUE (aucun m² ne bouge)');
  const d2=[Object.assign({},f.ficheDetail[0],{conf:'3x502'})];
  ok(SIG(f,d2)!==s0,'changer une configuration → signature DIFFERENTE (recalcul + trace)');
  const d3=[Object.assign({},f.ficheDetail[0],{actDechet:true,ncLots:[{q:1,w:502}]})];
  ok(SIG(f,d3)!==s0,'marquer un bobineau 🗑 Dechet → signature DIFFERENTE');
}
console.log('── 9. fiche avec des bobines mais sans configuration lisible : jamais un faux 0 ──');
{
  warns=0; const m=M({mother:2100,useful:2090,blade:0,longueur:'500',totalBobines:3,ficheDetail:[{coupee:true},{coupee:true}]});
  ok(m.ok===false&&m.perteM2===null&&warns>=1,'totalBobines 3, aucune conf lisible → ok=false, m² null, trace ('+warns+' warn)');
}
console.log('── 10. multi-ref : bords lus sur la ref (edge) ; edge absent → mere − utile de la ref ──');
{
  const f={refGroups:[{ref:'A',longueur:'500',mother:2100,edge:10},{ref:'B',longueur:'1000',mother:1260,useful:1240}],
           ficheDetail:[{conf:'4x502',useful:2090,blade:0,coupee:true,refIdx:0,ref:'A'},{conf:'20x55',useful:1240,blade:0,coupee:true,refIdx:1,ref:'B'}]};
  const m=M(f);
  ok(near(m.perteM2,5+20),'bords A (edge 10 → 5 m²) + bords B (mere − utile = 20 mm × 1 = 20 m²) = 25 → '+m.perteM2);
  ok(near(m.chutesM2,41+140),'solde de chaque ref en chutes : 41 + 140 = 181 → '+m.chutesM2);
  ok(m.m2Coupes===Math.round(2100*0.5+1260*1),'m² coupes 1050 + 1260 = 2310 → '+m.m2Coupes);
}
console.log('── 11. formateur m² : au plus un dixieme (le dechet NC 78,5 n est jamais arrondi a 79), « — » si inconnu ──');
{
  const F=eval('('+fnOf('_l513M2')+')');
  ok(F(185.5)==='185,5'&&F(78.5)==='78,5'&&F(7.5)==='7,5'&&F(0)==='0'&&F(193)==='193'&&F(null)==='—'&&F(undefined)==='—','_l513M2 : 185,5 / 78,5 / 7,5 / 0 / 193 / — / — → '+[F(185.5),F(78.5),F(7.5),F(0),F(193),F(null),F(undefined)].join(' / '));
}
console.log('── 12. revue adversariale : mono-ref, lignes anciennes SANS refIdx + ligne ajoutee par l admin AVEC refIdx 0 → UN seul solde ──');
{
  const f={mother:2100,useful:2090,blade:5,longueur:'500',ficheDetail:[L('4x502',{blade:5,useful:2090,refIdx:undefined}),L('3x612',{blade:5,useful:2090,refIdx:undefined}),L('2x157',{blade:5,useful:2090,refIdx:0})]};
  const m=M(f);
  ok(near(m.chutesM2,885.5),'un seul seau en mono-ref : chutes = solde de la DERNIERE ligne 885,5 (pas 122 + 885,5) → '+m.chutesM2);
  ok(near(m.perteM2,185.5),'perte inchangee 185,5 → '+m.perteM2);
}
console.log('── 13. revue adversariale (tranche) : une ligne RESTE-/OP2- (reliquat re-empaquete par ♻ Ecarts) est une bobine mere reellement coupee ; la DERNIERE ligne de la ref porte le solde ──');
{
  const f={mother:2100,useful:2090,blade:5,longueur:'500',ficheDetail:[L('4x502',{blade:5,useful:2090}),L('3x612',{blade:5,useful:2090}),L('2x157',{blade:5,useful:2090}),L('1x500',{blade:5,useful:2090,label:'RESTE-1 · 1x500',ncLots:[{q:1,w:500}],ncLarg:true,actDechet:true})]};
  const m=M(f);
  ok(m.m2Coupes===4200,'4 meres coupees (RESTE- comprise) : 4 × 1050 = 4200 → '+m.m2Coupes);
  ok(near(m.chutesM2,795),'le solde est sur la DERNIERE ligne (RESTE- 1x500 : 2090 − 500 = 1590 mm → 795 m²) → '+m.chutesM2);
  ok(near(m.perteM2,20+15+33.5+122+885.5),'perte = bords 20 + lames 15 + restes non gardes des 3 premieres (33,5 + 122 + 885,5) = 1076 → '+m.perteM2);
  ok(near(m.dechetM2,250),'bobineau jete de la ligne RESTE- : 500 mm × 500 m = 250 m² de dechet NC → '+m.dechetM2);
  ok(near(m.perteM2+m.chutesM2+m.dechetM2+m.clientM2,m.m2Coupes,0.6),'invariant conserve');
}
console.log('── 15. revue adversariale : une configuration NON VIDE mais illisible n est jamais ignoree en silence ──');
{
  warns=0; const m=M({mother:2100,useful:2090,blade:5,longueur:'500',ficheDetail:[L('4x502',{blade:5,useful:2090}),L('abc',{blade:5,useful:2090})]});
  ok(m.ok===false&&m.perteM2===null&&warns>=1,'conf « abc » → ok=false, m² null, trace ('+warns+' warn) — pas une fiche a 1 bobine');
  warns=0; const m2=M({mother:2100,useful:2090,blade:5,longueur:'500',ficheDetail:[L('4x502',{blade:5,useful:2090}),L('',{blade:5,useful:2090,coupee:false})]});
  ok(m2.ok===true&&m2.m2Coupes===1050&&warns===0,'ligne VIDE non coupee (« + Ajouter une bobine » sans saisie) → ignoree sans bruit, 1 mere → '+m2.m2Coupes+' ('+warns+' warn)');
  warns=0; const m3=M({mother:2100,useful:2090,blade:5,longueur:'500',ficheDetail:[L('4x502',{blade:5,useful:2090}),L('',{blade:5,useful:2090,coupee:true})]});
  ok(m3.ok===false&&m3.perteM2===null&&warns>=1,'ligne VIDE mais pointee COUPEE = une bobine reelle sans configuration → fiche incalculable + trace ('+warns+' warn), jamais une mere evaporee');
  warns=0; const m4=M({mother:2100,useful:'',blade:5,longueur:'500',ficheDetail:[L('4x502',{blade:5,useful:0})]});
  ok(m4.ok===false&&m4.perteM2===null&&warns>=1,'laize utile inconnue (ligne sans laize, en-tete vide) → fiche incalculable + trace ('+warns+' warn), jamais un reste a 0');
}
console.log('── 16. revue adversariale : multi-ref, ligne sans laize propre → laize de SA ref (jamais la chaine « 2090 / 1240 » de l en-tete) ──');
{
  const f={useful:'2090 / 1240',blade:'5 / 0',longueur:'500 / 1000',refGroups:[{ref:'A',longueur:'500',mother:2100,edge:10,useful:2090,blade:5},{ref:'B',longueur:'1000',mother:1260,edge:20,useful:1240,blade:0}],
           ficheDetail:[{conf:'4x502',coupee:true,refIdx:0,ref:'A'},{conf:'20x55',coupee:true,refIdx:1,ref:'B'}]};
  const m=M(f);
  // A : bords 5 + lames 3x5=15 mm → 7,5 ; reste 2090-2008-15=67 → derniere → chutes 33,5. B : bords 20 m² ; lame 0 ; reste 1240-1100=140 → chutes 140
  ok(near(m.chutesM2,33.5+140),'solde de B calcule sur la laize 1240 de B (pas 2090) : chutes 33,5 + 140 = 173,5 → '+m.chutesM2);
  ok(near(m.perteM2,5+7.5+20),'perte = bords A 5 + lames A 7,5 + bords B 20 = 32,5 → '+m.perteM2);
}
console.log('── 14. revue adversariale : fiche NON calculable (ok=false) → le DECHET NC (indicateur ISO) est quand meme rendu ──');
{
  warns=0; const m=M({mother:2100,useful:2090,blade:0,longueur:'500',totalBobines:2,ficheDetail:[{coupee:true,ncLots:[{q:1,w:157}],ncLarg:true,actDechet:true},{coupee:true}]});
  ok(m.ok===false&&m.perteM2===null&&m.chutesM2===null,'perte et chutes inconnues (null) → ok=false, trace ('+warns+' warn)');
  ok(near(m.dechetM2,78.5),'mais dechet NC = 78,5 m² (ncLoss ne depend pas des configurations) → '+m.dechetM2);
}
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 MATIERE L513 OK : '+total+' verifications'));
process.exit(fail?1:0);
