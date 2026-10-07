// l548_test.js — [L548 · 07/10/2026, defaut latent releve par les relectures de L545] les ecoutes config/refs et config/clients ne
// bouclent plus toutes les 8 s sous un refus serveur permanent : le compteur d essais n est remis a zero que sur une reponse du
// SERVEUR (ou apres > 1 min de vie), plus sur l instantane du cache. La purge des brouillons reste INCHANGEE (voir section 1).
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const withCtx=(fnSrc,ctx)=>new Function('ctx','with(ctx){ return ('+fnSrc+'); }')(ctx);

console.log('── 0. version ──');
ok(/const APP_VERSION='2026\.\d\d\.\d\d-L(54[8-9]|5[5-9]\d|[6-9]\d\d)';/.test(src),'APP_VERSION >= L548');

(async()=>{
  console.log('── 1. purge automatique des brouillons : INCHANGEE ──');
  ok(/  addToColdArchive\(doomed\);   \/\/ même filet que la corbeille : copie JSON locale avant suppression/.test(fnOf('purgeExpiredBrouillons')),'purge des brouillons inchangee (revue L548 : l archive froide se remplit en TAILLE, exiger son ecriture bloquerait la purge pour toujours sur une tablette pleine)');

  console.log('── 2. ecoutes config/refs et config/clients ──');
  const harness=(fnName,unsubName,retName,rearmKey,extra)=>{ let now=0; const timers=[]; const subs=[]; const rearms=[];
    const ctx=Object.assign({db:{collection:()=>({doc:()=>({onSnapshot:(okCb,errCb)=>{ subs.push({okCb,errCb}); return ()=>{}; }})})},Date:{now:()=>now},
      setTimeout:(f,ms)=>{ timers.push({f,at:now+ms}); return timers.length; },console:{warn(){},log(){}},localStorage:{setItem(){}},JSON,
      _l542RearmArm:(k,f)=>rearms.push(k)},extra||{}); ctx[unsubName]=null; ctx[retName]=0;
    const fn=withCtx(fnOf(fnName),ctx); ctx[fnName]=fn;
    const tick=ms=>{ now+=ms; timers.forEach(t=>{ if(t.f&&t.at<=now){ const f=t.f; t.f=null; f(); } }); };
    return {ctx,fn,subs,rearms,tick,setNow:v=>{ now=v; }}; };
  for(const [fnName,unsubName,retName,key,extra] of [['_l537LoadRefs','_l537Unsub','_l537Retries','refs',{_l537ApplyRefs:()=>true}],['_l486LoadClients','_l486Unsub','_l486Retries','clients',{_l486Apply:()=>1,_l537Grace:true,_l537CatalogCheck(){},_l486SeenAt:null,CLIENT_DATA_SEED:{},PKG_CLIENTS_SEED:{},CLIENT_DATA:{},PKG_CLIENTS:{},_l542CacheReplayed:true}]]){
    const h=harness(fnName,unsubName,retName,key,extra);
    h.fn();
    const cacheSnap={exists:true,data:()=>({a:1}),metadata:{fromCache:true}}, srvSnap={exists:true,data:()=>({a:1}),metadata:{fromCache:false}};
    for(let i=0;i<7;i++){ const s=h.subs[h.subs.length-1]; s.okCb(cacheSnap); s.errCb(new Error('permission-denied')); h.ctx[unsubName]=null; h.tick(60000); }
    ok(h.rearms.length>=1&&h.subs.length<=7,fnName+' : refus serveur PERMANENT precede d un instantane du cache → 5 essais puis relance au retour du reseau / 5 min (avant : boucle de 8 s sans fin)');
    const h2=harness(fnName,unsubName,retName,key,extra); h2.fn(); h2.subs[0].okCb(srvSnap); ok(h2.ctx[retName]===0,fnName+' : reponse du SERVEUR → compteur a zero (comme avant)');
    h2.ctx[retName]=3; h2.subs[0].okCb(cacheSnap); ok(h2.ctx[retName]===3,fnName+' : instantane du cache → compteur inchange');
    h2.ctx[retName]=4; h2.setNow(120000); h2.subs[0].errCb(new Error('coupure')); ok(h2.ctx[retName]===1,fnName+' : erreur apres > 1 min de vie → nouvelle serie d essais rapides');
    const h3=harness(fnName,unsubName,retName,key,extra); h3.fn(); h3.subs[0].okCb({exists:false,data:()=>null,metadata:{fromCache:false}}); ok(h3.ctx[retName]===0,fnName+' : document absent cote serveur : pas d exception'); }
  ok(/else\{ _l542RearmArm\('refs',function\(\)\{ _l537Retries=0; _l537LoadRefs\(\); \}\); \}/.test(fnOf('_l537LoadRefs'))&&/else\{ _l542RearmArm\('clients',function\(\)\{ _l486Retries=0; _l486LoadClients\(\); \}\); \}/.test(fnOf('_l486LoadClients')),'relance L542 inchangee');
  console.log('\n'+(fail?('❌ '+fail+' echec(s) sur '+total):('🏆 L548 : '+total+'/'+total+' verts')));
  process.exit(fail?1:0);
})().catch(e=>{ console.error('❌ exception',e); process.exit(1); });
