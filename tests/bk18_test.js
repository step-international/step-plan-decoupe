// bk18_test.js — bkRunImport : attribution d'id déterministe (recréé après purge /tmp — code inchangé depuis L135).
//  · collision avec un mouvement ANNULÉ (corrigePar) → id neuf _rN ; · doublon INTRA-import → ids distincts ;
//  · id actif isolé → conservé (retry idempotent) ; · solde +Q préservé.
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
let fail=0; const ok=(c,m)=>{console.log((c?'✅ ':'❌ ')+m);if(!c)fail++;};
const hm=src.match(/const _bkHash=(t=>\{[\s\S]*?return h\.toString\(36\)\+'_'\+\(t\.length%97\)\.toString\(36\);\s*\});/);
ok(!!hm,'_bkHash localisé');
const _bkHash=eval('('+hm[1]+')');
ok(/_bkSeen=new Set\(\)/.test(src)&&/if\(_bkAnnulled\.has\(base\)\|\|_bkSeen\.has\(base\)\)\{ let g=1; while\(_bkAllIds\.has\(docId\)\|\|_bkSeen\.has\(docId\)\)/.test(src),'logique L135 présente (annulé OU intra-import → _rN)');
function assignIds(mvts,cache){
  const annulled=new Set((cache||[]).filter(m=>m&&m.corrigePar&&m.id).map(m=>m.id));
  const allIds=new Set((cache||[]).map(m=>m&&m.id).filter(Boolean));
  const seen=new Set();
  return mvts.map(m=>{ const tok=(String(m.note||'').match(/\[BK(?:CO)?:[^\]]+\]/)||[String(m.note||'')])[0];
    const base='bk_'+_bkHash(tok+'|'+m.type+'|'+m.location);
    let docId=base; if(annulled.has(base)||seen.has(base)){ let g=1; while(allIds.has(docId)||seen.has(docId)){ docId=base+'_r'+g; g++; } }
    seen.add(docId); return docId; });
}
const line={note:'lot X · [BK:41116929/3333172801/103950]',type:'entree',location:'bk'};
const base='bk_'+_bkHash('[BK:41116929/3333172801/103950]'+'|entree|bk');
ok(assignIds([line],[])[0]===base,'ligne neuve → id de base');
ok(assignIds([line],[{id:base,corrigePar:'x'}])[0]===base+'_r1','collision ANNULÉE → _r1');
ok(assignIds([line],[{id:base,corrigePar:'x'}])[0]===assignIds([line],[{id:base,corrigePar:'x'}])[0],'retry idempotent');
const dup=assignIds([line,line],[]); ok(dup[0]===base&&dup[1]===base+'_r1','doublon intra-import → ids distincts');
ok(assignIds([line],[{id:base}])[0]===base,'collision active isolée → base conservée');
const Q=103950, ledger=[{id:base,m2:Q,corrigePar:'x'},{id:'c1',m2:-Q}];
const nid=assignIds([line],ledger)[0]; ledger.push({id:nid,m2:Q});
ok(ledger.reduce((s,x)=>s+x.m2,0)===Q&&nid!==base,'solde net +Q via id neuf');
console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 bkRunImport VALIDÉ');
process.exit(fail?1:0);
