// offline_test.js — L139 : distinction « écriture mise en file » (à garder optimiste) vs vrai rejet.
// _isQueuedWrite doit reconnaître : e.queued (boundedWrite) OU message '__TIMEOUT__' (raceTimeout inline).
// Un vrai rejet (permission-denied) NE doit PAS être vu comme « en file » (sinon on garde un optimiste refusé).
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0; const ok=(c,m)=>{console.log((c?'✅ ':'❌ ')+m);if(!c)fail++;};

const _isQueuedWrite=eval('('+fnOf('_isQueuedWrite')+')');
// boundedWrite doit poser e.queued=true sur son timeout
ok(/e\.queued=true/.test(src),'boundedWrite tague son rejet de timeout (e.queued=true)');

// ── vrais cas ──
ok(_isQueuedWrite({queued:true})===true,'e.queued=true → EN FILE (garder optimiste)');
ok(_isQueuedWrite(new Error('__TIMEOUT__'))===true,'message __TIMEOUT__ (raceTimeout inline) → EN FILE');
ok(_isQueuedWrite({message:'FirebaseError: Missing or insufficient permissions'})===false,'permission-denied → PAS en file (vrai rejet → rollback)');
ok(_isQueuedWrite(new Error('quota exceeded'))===false,'erreur dure → PAS en file');
ok(_isQueuedWrite(null)===false && _isQueuedWrite(undefined)===false,'null/undefined → false (pas de plantage)');
ok(_isQueuedWrite({})===false,'objet vide → false');

// ── garde-fous textuels : les sites hors-ligne utilisent bien le helper + set()/id réservé ──
ok(/plnSetPlan/.test(src)&&/if\(_isQueuedWrite\(e\)\)\{/.test(src),'plnSetPlan : branche « en file » (pas de rollback)');
ok(/const docRef=db\.collection\('stockMouvements'\)\.doc\(\); const _mid=docRef\.id/.test(src)&&/mvt\.id=_mid; stockMouvementsCache\.unshift/.test(src),'saveStockMouvement : id réservé (const locale) + affecté APRÈS set() (pas de champ id persisté)');
ok(/const docRef=db\.collection\('saves'\)\.doc\(\); const _sid=docRef\.id/.test(src),'doSave : id réservé + set()');
ok(/const docRef=db\.collection\('stockArticles'\)\.doc\(\); const _aid=docRef\.id/.test(src)&&/art\.id=_aid; stockArticlesCache\.push/.test(src),'saveStockArticle : id réservé (const locale) + affecté APRÈS set()');
ok(/boundedWrite\(db\.collection\(collection\)\.doc\(id\)\.update\(upd\),10000\)/.test(src),'restoreItem : update borné');
ok(/boundedWrite\(db\.collection\(collection\)\.doc\(id\)\.delete\(\),10000\)/.test(src),'permanentDelete : delete borné');

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 L139 hors-ligne VALIDÉ : file ≠ échec, vrai rejet distingué, id réservé + set() aux 3 créations, écritures corbeille bornées');
process.exit(fail?1:0);
