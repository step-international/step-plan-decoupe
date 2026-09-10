// lame_check_test.js — [L514 · signalement JF 08/09] GARDE de _l514LameCheck : une lame connue sur une AUTRE machine ne peut pas
// être déclarée sur la machine en cours (la fiche acceptait n importe quel n° : « lame 9 sur la FEBA », fantôme irrécupérable
// par l opérateur). Fonction pure (cache en paramètre).
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length,k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.nrm=s=>String(s||'').trim().toLowerCase();
global.getMachineLabel=m=>({feba:'FEBA',maveg:'MAVEG',cevenini:'CEVENINI'})[m]||m;
global._activeLameIn=eval('('+fnOf('_activeLameIn')+')');
const C=eval('('+fnOf('_l514LameCheck')+')');
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const E=(cat,machine,num,date)=>({type:'lame',categorie:cat,machine,lameNum:num,dateInstall:date,date,createdAt:date,deleted:false});
const cache=[
  E('installation','maveg','9','2026-09-01T08:00:00.000Z'),          // 9 montée sur la MAVEG
  E('installation','feba','4','2026-09-08T07:00:00.000Z'),           // 4 montée sur la FEBA
  E('installation','feba','34','2026-08-20T08:00:00.000Z'), E('demonte','feba','34','2026-09-01T08:00:00.000Z'),   // 34 : à affûter sur FEBA
  E('stock','cevenini','23','2026-07-23T08:00:00.000Z'),             // 23 en stock CEVENINI
  E('rebut','maveg','77','2026-08-01T08:00:00.000Z'),                // 77 jetée (MAVEG)
  E('affutage','maveg','2','2026-09-08T08:00:00.000Z'),              // 2 partie à l affûtage (MAVEG)
  Object.assign(E('installation','feba','99','2026-05-01T08:00:00.000Z'),{deleted:true}),   // trace supprimée : invisible
];
console.log('── le cas JF ──');
{ const r=C('feba','9',cache); ok(r.status==='autre-machine'&&r.ailleurs.length===1&&r.ailleurs[0].machine==='maveg'&&r.ailleurs[0].etat==='montée','lame 9 déclarée sur FEBA → refus : montée sur MAVEG ('+JSON.stringify(r.ailleurs)+')'); }
console.log('── autres cas ──');
ok(C('feba','4',cache).status==='ok','4 sur FEBA (déjà là) → ok');
ok(C('feba','34',cache).status==='ok','34 sur FEBA (à affûter sur cette machine) → ok (re-pose possible)');
ok(C('maveg','34',cache).status==='autre-machine','34 sur MAVEG (jamais vue là, à affûter FEBA) → autre-machine → 2e tap explicite');
{ const c3=cache.concat([E('installation','feba','23','2026-09-09T08:00:00.000Z')]); ok(C('feba','23',c3).status==='ok','23 CONNUE sur FEBA et en stock CEVENINI : deux lames distinctes (n° PAR machine) → ok'); }
{ const c4=cache.concat([E('rebut','feba','4','2026-09-09T08:00:00.000Z')]); const r=C('feba','4',c4); ok(r.status==='jetee'&&/2026-09-09/.test(r.quand),'4 jetée à la benne sur FEBA → jetee (date)'); }
global.maintLoaded=false; ok(C('feba','9',[]).status==='indispo','registre NON chargé (cache vide, maintLoaded=false) → indispo, jamais « inconnue »'); global.maintLoaded=true; ok(C('feba','9',[]).status==='inconnue','registre chargé mais vide → inconnue');
{ const r=C('feba','23',cache); ok(r.status==='autre-machine'&&r.ailleurs[0].etat==='en stock','23 sur FEBA → refus : en stock CEVENINI'); }
{ const r=C('feba','2',cache); ok(r.status==='autre-machine'&&r.ailleurs[0].etat==='à l affûtage','2 sur FEBA → refus : à l affûtage (MAVEG)'); }
{ const r=C('maveg','2',cache); ok(r.status==='affutage'&&/2026-09-08/.test(r.quand),'2 sur SA machine mais partie chez l affûteur → affutage (2e tap « de retour ? »)'); }
ok(C('feba','77',cache).status==='inconnue','77 jetée ailleurs → une lame jetée ne compte plus : inconnue (lame neuve à confirmer)');
ok(C('feba','99',cache).status==='inconnue','trace supprimée → inconnue');
ok(C('feba','123',cache).status==='inconnue','n° jamais vu → inconnue (2e tap pour lame NEUVE)');
ok(C('feba','',cache).status==='vide','n° vide → vide');
ok(C('maveg',' 9 ',cache).status==='ok','« 9 » avec espaces sur sa propre machine → ok (normalisation)');
ok(C('feba','L-9',cache).status==='inconnue','« L-9 » ≠ « 9 » → inconnue (pas de rapprochement hasardeux)');
{ const r=C('cevenini','9',cache); ok(r.status==='autre-machine','9 sur CEVENINI → refus aussi (la règle vaut pour toutes les machines)'); }
{ const c2=cache.concat([E('demonte','maveg','9','2026-09-09T08:00:00.000Z')]); const r=C('feba','9',c2); ok(r.status==='autre-machine'&&r.ailleurs[0].etat==='à affûter','9 démontée de la MAVEG → toujours refusée sur FEBA (à affûter MAVEG)'); }
console.log(fail?('\n💥 '+fail+' échec(s) sur '+total):'\n🏆 vérification lame : '+total+'/'+total+' OK');
process.exit(fail?1:0);
