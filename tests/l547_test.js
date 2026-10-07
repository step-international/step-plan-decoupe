// l547_test.js — [L547 · 07/10/2026, suite de l audit d usage reel du 06/10] (1) l arret « manque de matiere » rappelle la photo d etiquettes
// quand aucune n est jointe (dans la question deja posee : jamais bloquant) ; (2) le journal dit CE QUI A CHANGE quand le bureau modifie un
// plan enregistre (avant → apres) ; (3) la banniere « Nouvelle version » existante est reproposee juste apres un envoi (ecran vide),
// meme apres « ✕ Plus tard » — jamais de rechargement automatique. Donnees FICTIVES.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const D=eval('('+fnOf('_l547SaveDiff')+')');

console.log('── 0. version ──');
ok(/const APP_VERSION='2026\.\d\d\.\d\d-L(54[7-9]|5[5-9]\d|[6-9]\d\d)';/.test(src),'APP_VERSION >= L547');

console.log('── 1. journal : ce qui a change dans un plan modifie ──');
const base={client:'Client Alpha',numCmd:'CMD-001',dateLiv:'2026-10-12',machine:'feba',mother:'1240',blade:'3',edgeLoss:'10',longueur:'500',typeCond:'Carton',palette:'Europe',
  refGroups:[{ref:'90000001 - Film A',rows:[{qty:5,width:700},{qty:3,width:500}],machine:'feba',mother:1240}]};
const cl=o=>JSON.parse(JSON.stringify(o));
ok(D(base,cl(base))==='','rien de change : rien a ajouter au journal');
let b=cl(base); b.numCmd='CMD-002'; b.dateLiv='2026-10-15';
ok(D(base,b)==='Changements : n° : CMD-001 → CMD-002 ; livraison : 2026-10-12 → 2026-10-15','n° et date de livraison : avant → apres');
b=cl(base); b.refGroups[0].rows[0].qty=6;
ok(D(base,b)==='Changements : laizes 90000001 - Film A : 5×700 + 3×500 → 6×700 + 3×500','quantites de laizes : avant → apres');
b=cl(base); b.refGroups.push({ref:'90000002 - Film B',rows:[{qty:2,width:300}],machine:'maveg',mother:1000});
ok(/réf\. ajoutée : 90000002 - Film B \(2×300\)/.test(D(base,b)),'reference ajoutee');
ok(/réf\. retirée : 90000002 - Film B \(2×300\)/.test(D(b,base)),'reference retiree');
const m2=cl(b); m2.refGroups[1].machine='cevenini';
ok(/machine 90000002 - Film B : maveg → cevenini/.test(D(b,m2)),'multi-ref : machine d une reference');
b=cl(base); b.planManual=[{x:1}];
ok(D(base,b)==='Changements : plan modifié à la main'&&D(b,base)==='Changements : plan manuel retiré','plan modifie a la main / retire');
ok(D({client:'X',ref:'90000001 - Film A',rows:[{qty:1,width:100}]},{client:'X',ref:'90000001 - Film A',rows:[{qty:2,width:100}]})==='Changements : laizes 90000001 - Film A : 1×100 → 2×100','ancien plan sans blocs (rows a plat) : lu aussi');
ok(D(null,base)===''&&D(base,null)===''&&D(undefined,undefined)==='','version d avant inconnue : rien (jamais d exception)');
b=cl(base); b.notesEmballage='x'.repeat(5000); b.refGroups=Array.from({length:40},(_,i)=>({ref:'R'+i,rows:[{qty:i,width:100+i}]}));
const long=D(base,b); ok(long.length<=14+900&&/…$/.test(long),'texte borne (900 caracteres au plus)');
ok(D({client:'X  Y',numCmd:'1'},{client:'X Y',numCmd:'1'})==='','espaces en trop : pas un changement');
const DS=src.slice(src.indexOf("      editingSaveId=null; _editSaveBase=null;\n      const idx=savesCache.findIndex(x=>x._id===target);"),src.indexOf("      editingSaveId=null; _editSaveBase=null;\n      const idx=savesCache.findIndex(x=>x._id===target);")+1200);
ok(DS.indexOf('_l547SaveDiff(idx>=0?savesCache[idx]:null,updEntry)')>0&&DS.indexOf('_l547SaveDiff(')<DS.indexOf('savesCache[idx]={...savesCache[idx],...updEntry'),'resume calcule AVANT d ecraser la version chargee dans le cache');
ok(/logAudit\('edit','saves',target,`Plan modifié — \$\{entry\.client\|\|''\} \/ \$\{entry\.ref\|\|''\}`\+\(_chg547\?' · '\+_chg547:''\)\+_ow547,\{client:entry\.client\|\|'',ref:entry\.ref\|\|''\}\)/.test(DS)&&/if\(curDate\) _ow547=' · ⚠ a écrasé une version modifiée ailleurs le '/.test(DS),'journal : meme debut qu avant + changements ; client et reference transmis explicitement (non relus dans le texte)');
ok(/try\{ _chg547=_l547SaveDiff/.test(DS),'calcul protege : une erreur ne bloque jamais l enregistrement du plan');

console.log('── 2. arret manque de matiere : rappel photo d etiquettes ──');
const MM=fnOf('stopManqueMatiere');
const iE=MM.indexOf('let _etq547=1;'), iC=MM.indexOf("if(!confirm((_etq547?'':'🛑 AUCUNE PHOTO D\\'ÉTIQUETTE jointe à cette commande");
ok(iE>0&&iC>iE,'rappel DANS la question deja posee (pas de fenetre de plus, jamais bloquant : OK continue)');
ok(/_etq547=\(commandeFiles\|\|\[\]\)\.filter\(function\(f\)\{ return f&&\/\^Étiquette \/\.test\(f\.name\|\|''\); \}\)\.length;/.test(MM),'meme controle que le volet de cloture (photos nommees « Etiquette … »)');
{ const prefix=eval("(function(commandeFiles){ let _etq547=1; try{ _etq547=(commandeFiles||[]).filter(function(f){ return f&&/^Étiquette /.test(f.name||''); }).length; }catch(e){} return (_etq547?'':'🛑'); })");
  ok(prefix([])==='🛑'&&prefix([{name:'Étiquette 1'}])===''&&prefix([{name:'Bon de commande'}])==='🛑'&&prefix(null)==='🛑','aucune photo d etiquette → rappel ; au moins une → question inchangee'); }
ok(/\$\{done\} bobine\(s\) coupée\(s\), \$\{reste\} non réalisée\(s\)\./.test(MM)&&/est placé en brouillon, reprenable quand la matière arrive\./.test(MM),'texte de la question d avant conserve');

console.log('── 3. nouvelle version reproposee apres l envoi ──');
const SC=fnOf('saveCommandeFiche');
const iR=SC.indexOf('setTimeout(function(){ resetAll(); }, 300);'), iU=SC.indexOf("_updDismissedUntil=0; Promise.resolve(checkAppUpdate())");
ok(iR>0&&iU>iR&&iU-iR<400,'juste apres le vidage qui suit un envoi reussi');
ok(/if\(!\(typeof ficheLines!=='undefined'&&ficheLines&&ficheLines\.length\)\)\{ const _sv547=_updDismissedUntil; _updDismissedUntil=0;/.test(SC),'seulement si l ecran est vide (jamais au milieu d une commande)');
ok(/\}, 20000\);   \/\* \[L547/.test(SC),'20 s apres l envoi : apres l avertissement L545 (4,5 s + 14 s) qu elle recouvrirait');
{ const m=SC.match(/setTimeout\(function\(\)\{ try\{ if\(!\(typeof ficheLines[^\n]*?\}, 20000\);/); const body=m[0].replace(/^setTimeout\(/,'(').replace(/, 20000\);$/,')');
  const run=async(found,fail)=>{ const ctx={ficheLines:[],_updDismissedUntil:12345,banner:false,document:{getElementById:id=>(id==='updBanner'&&ctx.banner)?{}:null},checkAppUpdate:()=>fail?Promise.reject(new Error('x')):Promise.resolve().then(()=>{ if(found) ctx.banner=true; }),Promise};
    new Function('ctx','with(ctx){ return '+body+'; }')(ctx)(); await new Promise(r=>setTimeout(r,20)); return ctx; };
  (async()=>{ let c=await run(true,false); ok(c._updDismissedUntil===0&&c.banner,'nouvelle version trouvee : la banniere revient (meme apres « Plus tard »)');
    c=await run(false,false); ok(c._updDismissedUntil===12345,'pas de nouvelle version : le report « Plus tard » est retabli');
    c=await run(false,true); ok(c._updDismissedUntil===12345,'pas de reseau : le report « Plus tard » est retabli');
    console.log('\n'+(fail?('❌ '+fail+' echec(s) sur '+total):('🏆 L547 : '+total+'/'+total+' verts'))); process.exit(fail?1:0); })(); }
ok(!/location\.reload/.test(SC.slice(iU-200,iU+300)),'aucun rechargement automatique : la banniere demande toujours « Recharger »');
ok(/function checkAppUpdate\(\)\{|async function checkAppUpdate\(\)\{/.test(src)&&/if\(Date\.now\(\)<_updDismissedUntil\|\|document\.getElementById\('updBanner'\)\) return;/.test(fnOf('_updBanner')),'banniere existante inchangee (une seule a la fois)');

