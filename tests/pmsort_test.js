// pmsort_test.js — [L171 · demande Esteban] le plan manuel affiche les bobineaux GRANDES LAIZES D'ABORD.
// Vérifie _pmSortBobinesOnce (tri par plus grande laize du motif, ordre stable pour égalités) + le câblage
// dans renderPlanManual (tri à chaque rendu SAUF si un champ bobine a le focus).
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0; const ok=(c,m)=>{console.log((c?'✅ ':'❌ ')+m);if(!c)fail++;};
global.parseConf=eval('('+fnOf('parseConf')+')');
global._laizeSortExcluded=eval('('+fnOf('_laizeSortExcluded')+')');
const _pmSortBobinesOnce=eval('('+fnOf('_pmSortBobinesOnce')+')');

// bobineaux saisis dans le DÉSORDRE (petites d'abord) → doivent ressortir grandes laizes d'abord
const pm=[{ref:'REF-A',blade:5,useful:1200,bobines:[
  {count:2,conf:'3×80'},        // plus grande laize 80
  {count:1,conf:'5×250'},       // plus grande laize 250
  {count:4,conf:'2×120 + 1×60'} // plus grande laize 120
]}];
_pmSortBobinesOnce(pm);
const order=pm[0].bobines.map(b=>b.conf);
ok(order[0]==='5×250','1er bobineau = la plus grande laize (250)');
ok(order[1]==='2×120 + 1×60','2e = 120');
ok(order[2]==='3×80','3e = 80 (petites en dernier)');

// stabilité pour laizes égales (ordre de saisie conservé)
const pm2=[{ref:'REF-B',blade:5,useful:1000,bobines:[{count:1,conf:'1×100',_tag:'a'},{count:1,conf:'2×100',_tag:'b'}]}];
_pmSortBobinesOnce(pm2);
ok(pm2[0].bobines[0]._tag==='a'&&pm2[0].bobines[1]._tag==='b','égalité de laize → ordre de saisie conservé (tri stable)');

// câblage renderPlanManual : tri SAUF si un champ bobine a le focus
ok(/if\(!_editing\) _pmSortBobinesOnce\(planManual\);/.test(src),'renderPlanManual : re-trie sauf pendant l\'édition d\'un champ bobine');
ok(/_ae\.matches\('#planCards input\[data-mri\]'\)/.test(src),'garde de focus : ne reshuffle jamais sous les doigts');

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 TRI PLAN MANUEL VALIDÉ : bobineaux grandes laizes d\'abord, stable, jamais pendant la frappe');
process.exit(fail?1:0);
