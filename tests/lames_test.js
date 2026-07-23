// lames_test.js — [L232/L233] GARDE de la refonte Lames : machine à états parMachine (fonction PURE
// lameClasseurEtat) + intégrité de l'UI 3 sections (marqueurs). Clé machine|num : les n° de lame sont
// PAR machine (le 20 cevenini ≠ un 20 ailleurs — demande Esteban).
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.nrm=s=>String(s||'').trim().toLowerCase();
global.isoNow=()=>'2026-07-23T12:00:00.000Z';
const lameClasseurEtat=eval('('+fnOf('lameClasseurEtat')+')');
let fail=0; const ok=(c,m)=>{ console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

console.log('── machine à états parMachine ──');
const T=[
 {type:'lame',categorie:'installation',machine:'cevenini',lameNum:'24',dateInstall:'2026-07-01'},
 {type:'lame',categorie:'stock',machine:'cevenini',lameNum:'20',dateInstall:'2026-07-20'},
 {type:'lame',categorie:'stock',machine:'maveg',lameNum:'20',dateInstall:'2026-07-20'},
 {type:'lame',categorie:'affutage',machine:'maveg',lameNum:'9',dateInstall:'2026-05-01'},
 {type:'lame',categorie:'installation',machine:'feba',lameNum:'32',dateInstall:'2026-06-01'},
 {type:'lame',categorie:'installation',machine:'feba',lameNum:'31',dateInstall:'2026-07-10'},
 {type:'lame',categorie:'affutage',machine:'feba',lameNum:'32',dateInstall:'2026-07-15'},   // 32 part à l'affûtage APRÈS démontage
 {type:'lame',categorie:'stock',machine:'feba',lameNum:'32',dateInstall:'2026-07-20'},      // puis revient en stock (cycle complet)
 {type:'lame',categorie:'mystere',machine:'maveg',lameNum:'99',dateInstall:'2026-07-01'},   // catégorie inconnue
 {type:'lame',categorie:'stock',machine:'',lameNum:'50',dateInstall:'2026-07-01'},          // sans machine → hors
];
const r=lameClasseurEtat(T,'2026-07-23T12:00:00.000Z');
const pm=r.parMachine;
ok(pm.cevenini.montees.some(x=>x.num==='24'),'MONTÉE : cev 24');
ok(pm.cevenini.stockees.some(x=>x.num==='20')&&pm.maveg.stockees.some(x=>x.num==='20'),'clé machine|num : n° 20 en stock chez cev ET maveg (distincts)');
ok(pm.maveg.enAffutage.some(x=>x.num==='9'),'EN AFFÛTAGE : maveg 9 conservée même >30 j (plus de disparition)');
ok(pm.feba.montees.some(x=>x.num==='31'),'MONTÉE : feba 31');
ok(pm.feba.stockees.some(x=>x.num==='32')&&!pm.feba.aAffuter.some(x=>x.num==='32')&&!pm.feba.enAffutage.some(x=>x.num==='32'),'CYCLE COMPLET : feba 32 démontée→affûtage→stock = STOCKÉE (une seule fois)');
ok(pm.maveg.aAffuter.some(x=>x.num==='99'),'catégorie inconnue → visible en à-affûter (jamais perdue)');
ok(pm.hors.stockees.some(x=>x.num==='50'),'sans machine → groupe hors');
ok(!!r.groupes&&!!r.recentes,'rétro-compat : groupes/recentes toujours servis');
// tri numérique
const T2=[['2','stock'],['10','stock'],['1','stock']].map(([n,c])=>({type:'lame',categorie:c,machine:'maveg',lameNum:n,dateInstall:'2026-07-01'}));
const r2=lameClasseurEtat(T2,'2026-07-23T12:00:00.000Z');
ok(r2.parMachine.maveg.stockees.map(x=>x.num).join(',')==='1,2,10','tri numérique des n° (1,2,10 — pas 1,10,2)');

console.log('── intégrité UI L233 (marqueurs) ──');
const has=(re,m)=>{const okk=(re instanceof RegExp?re.test(src):src.includes(re));console.log((okk?'✅ ':'❌ ')+m);if(!okk)fail++;};
const absent=(re,m)=>{const okk=!(re instanceof RegExp?re.test(src):src.includes(re));console.log((okk?'✅ ':'❌ ')+m);if(!okk)fail++;};
has('id="lameSections"','3 sections par statut présentes (lameSections)');
has('id="maintHistBox"','historique lames DERRIÈRE un bouton Afficher/Masquer (details replié)');
has(/Afficher l'historique des lames/,'libellé « Afficher l\'historique des lames »');
has(/function lameMonterDepuisStock/,'action Stockée → Montée (lameMonterDepuisStock)');
has(/function lameEnvoyerAffutage/,'action À affûter → En affûtage');
has(/function lameRetourStock/,'action En affûtage → Stockée');
has(/stock:'Retour en stock'/,'catégorie stock dans MAINT_CAT_LABEL');
absent(/id="affutHorsNum"/,'input « hors machine » retiré de l\'UI (fonction gardée inerte)');
has(/renderLameStats\(\); \}catch\(e\)\{ console\.warn\('renderLameStats:',e\); \}   \/\/ \[L233/,'stats lames rendues DANS l\'onglet Lame');
absent(/<div id="lameStatsBlock" style="margin-top:20px"><\/div>/,'lameStatsBlock retiré d\'Analyse');

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 LAMES VALIDÉ : états par machine + cycle complet + UI 3 sections + historique replié');
process.exit(fail?1:0);
