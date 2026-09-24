// pkg_l529_test.js — [L529 · demande Celine 18/09/2026 → L537 · 24/09/2026] resolution d une regle d emballage par nom de client
// (exacte et tolerante) et fusion graine → table partagee. Depuis L537 les regles ne vivent PLUS dans le fichier public
// (graine vide) : la table partagee Firestore config/clients est la seule verite, la fusion reste en place mais INERTE
// (listes de patch / forcage vides). Le test travaille sur la FIXTURE (noms fictifs) — le contenu reel se controle en prive.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','referentiel_test.json'),'utf8'));
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.PKG_CLIENTS=FIX.pkgClients;
const mL=src.match(/^const _L529_PKG_PATCHES=(\[[^\]]*\]);/m); global._L529_PKG_PATCHES=mL?eval(mL[1]):null;
const mF=src.match(/^const _L532_PKG_FORCE=(\[[^\]]*\]);/m); global._L532_PKG_FORCE=mF?eval(mF[1]):null;
const MERGE=eval('('+fnOf('_l529PkgMerge')+')');
global._l410PkgResolve=eval('('+fnOf('_l410PkgResolve')+')');
console.log('── 1. resolution par nom de client (exacte et tolerante) sur la table chargee ──');
const A=PKG_CLIENTS['CLIENT TEST A'];
ok(_l410PkgResolve('CLIENT TEST A')===A,'cle exacte');
ok(_l410PkgResolve('CLIENT TEST A pour le 22 09 2026')===A&&_l410PkgResolve('client test a')===A,'nom avec suffixe / casse differente → meme regle (inclusion normalisee)');
ok(_l410PkgResolve('CLIENT INCONNU')===null,'client sans regle → null (l appelant applique PKG_DEFAULT)');
console.log('── 2. [L537] plus aucune regle dans le fichier public ──');
ok(/^var PKG_CLIENTS=\{\n\};/m.test(src),'graine PKG_CLIENTS vide');
ok(Array.isArray(_L529_PKG_PATCHES)&&_L529_PKG_PATCHES.length===0&&Array.isArray(_L532_PKG_FORCE)&&_L532_PKG_FORCE.length===0,'listes de patch (L529) et de forcage (L532) vides : le code ne porte plus de regle');
console.log('── 3. la fusion est inerte : la table recue est rendue TELLE QUELLE (meme objet, jamais modifiee) ──');
global.PKG_CLIENTS_SEED=FIX.pkgClients;
const remote={'CLIENT TEST A':{palette:'X',notes:'table partagee'},'VEKA TEST':{palette:'Y',notes:'v'}};
const out=MERGE(remote);
ok(out===remote&&out['CLIENT TEST A'].notes==='table partagee'&&Object.keys(out).length===2,'graine capturee (fixture) + listes vides → aucune cle ajoutee ni forcee');
global.PKG_CLIENTS_SEED=null; ok(MERGE(remote)===remote,'graine non capturee → table recue telle quelle');
global.PKG_CLIENTS_SEED=FIX.pkgClients; ok(MERGE(null)===null,'table recue invalide → rendue telle quelle (la garde _l486Valid a deja tranche)');
console.log('── 4. cablage ──');
ok(/PKG_CLIENTS=_l529PkgMerge\(d\.pkgClients\);/.test(fnOf('_l486Apply')),'_l486Apply (seul point de convergence cache local / Firestore) passe toujours par la fusion');
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 PKG L529 OK : '+total+' verifications'));
process.exit(fail?1:0);
