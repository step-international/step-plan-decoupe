// l550_test.js — [L550 · 07/10/2026, defaut latent releve par la relecture de L548] l archive froide locale n etait bornee qu en NOMBRE
// (2000 entrees) : un brouillon archive pese ~16 Ko, elle atteignait donc le plafond du stockage local (~5 Mo) bien avant — sur la
// tablette qui purge chaque matin, en quelques mois — et les filets locaux (chrono en direct, photo de la commande, brouillon de secours)
// n ecrivaient plus, en silence. Bornee maintenant aussi en TAILLE (1,5 M caracteres), les plus ANCIENNES entrees partent en premier,
// jamais le lot qu on vient d ajouter ; une archive deja trop grosse est ramenee sous la borne au demarrage. Donnees FICTIVES.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const withCtx=(fnSrc,ctx)=>new Function('ctx','with(ctx){ return ('+fnSrc+'); }')(ctx);
ok(/const APP_VERSION='2026\.\d\d\.\d\d-L(5[5-9]\d|[6-9]\d\d)';/.test(src),'APP_VERSION >= L550');
const MAX=+(src.match(/const _L550_ARCH_MAX=(\d+);/)||[])[1]; ok(MAX===2500000,'borne : 2,5 M caracteres (≈ 2,5 Mo sur ~5 Mo : le reste pour les filets locaux)');
const ctx={_L550_ARCH_MAX:MAX,JSON,Math,Number,Array}; const AJ=withCtx(fnOf('_l550ArchJson'),ctx);
const entry=(i,size)=>({_id:'b'+i,_col:'brouillons',state:{blob:'x'.repeat(size)},_archivedAt:'2026-01-01'});
let arch=Array.from({length:400},(_,i)=>entry(i,16000));   // ~6,4 M caracteres : au-dela du stockage reel
let js=AJ(arch,5), back=JSON.parse(js);
ok(js.length<=MAX,'archive trop grosse → ramenee sous la borne');
ok(back[back.length-1]._id==='b399'&&back.slice(-5).map(x=>x._id).join()==='b395,b396,b397,b398,b399','le lot qu on vient d ajouter (5 dernieres) est TOUJOURS garde');
ok(back[0]._id!=='b0'&&+back[0]._id.slice(1)>0,'ce sont les plus ANCIENNES entrees qui partent');
ok(js.length>MAX-16200,'retrait EXACT : on ne retire que le necessaire (moins d une entree de marge sous la borne)');
const small=Array.from({length:10},(_,i)=>entry(i,100)); ok(AJ(small,1)===JSON.stringify(small),'archive petite : inchangee (octet pour octet)');
const huge=[entry(0,16000),entry(1,3000000)]; const jh=JSON.parse(AJ(huge,1)); ok(jh.length===1&&jh[0]._id==='b1','un lot a lui seul plus gros que la borne : garde quand meme (regle L170), le reste part');
ok(AJ(null,0)==='[]'&&AJ([],0)==='[]','entree vide : jamais d exception');
// ecriture dans addToColdArchive
const store={}; const ls={getItem:k=>(k in store)?store[k]:null,setItem:(k,v)=>{ if(String(v).length>5200000) { const e=new Error('QuotaExceededError'); throw e; } store[k]=String(v); }};
const actx={localStorage:ls,COLD_ARCHIVE_KEY:'step_cold_archive',JSON,Math,console:{warn(){},log(){}},Date,_l550ArchJson:AJ};
const add=withCtx(fnOf('addToColdArchive'),actx);
store.step_cold_archive=JSON.stringify(Array.from({length:300},(_,i)=>entry(i,16000)));   // archive deja a ~4,8 M (stockage presque plein)
ok(add([entry(999,16000)])===true&&store.step_cold_archive.length<=MAX&&JSON.parse(store.step_cold_archive).slice(-1)[0]._id==='b999','ajout sur une archive presque pleine : ecrit (avant : refus au plafond), borne respectee, nouvel element present');
// rognage au demarrage
const tctx={localStorage:ls,COLD_ARCHIVE_KEY:'step_cold_archive',_L550_ARCH_MAX:MAX,JSON,console:{log(){}},_l550ArchJson:AJ,Array};
const trim=withCtx(fnOf('_l550TrimColdArchive'),tctx);
store.step_cold_archive=JSON.stringify(Array.from({length:300},(_,i)=>entry(i,16000)));
ok(trim()===true&&store.step_cold_archive.length<=MAX,'demarrage : archive deja trop grosse ramenee sous la borne');
const before=store.step_cold_archive; ok(trim()===false&&store.step_cold_archive===before,'deja sous la borne : rien n est reecrit');
store.step_cold_archive='pas du json'; ok(trim()===false&&store.step_cold_archive==='pas du json','contenu illisible : laisse tel quel, pas d exception');
delete store.step_cold_archive; ok(trim()===false,'pas d archive : rien');
ok(/setTimeout\(function\(\)\{ try\{ _l550TrimColdArchive\(\); \}catch\(e\)\{\} \},8000\);/.test(src),'rognage 8 s apres le demarrage (filets locaux vite retablis)');
ok(AJ([undefined,function(){},entry(1,100)],1).length>0,'entrees bizarres (undefined, fonction) : jamais d exception');
ok(/localStorage\.setItem\(COLD_ARCHIVE_KEY,_l550ArchJson\(arch,items\.length\)\);/.test(fnOf('addToColdArchive'))&&/return true;   \/\/ \[L169/.test(fnOf('addToColdArchive'))&&/return false;\}/.test(fnOf('addToColdArchive')),'addToColdArchive : borne en nombre (L169) + en taille, meme retour vrai/faux qu avant');
console.log('\n'+(fail?('❌ '+fail+' echec(s) sur '+total):('🏆 L550 : '+total+'/'+total+' verts')));
process.exit(fail?1:0);
