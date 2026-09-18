// pkg_l529_test.js — [L529 · demande Celine 18/09/2026] note d emballage du client SUYS (« DH1004 imprimé : écrire à la main la largeur dans le mandrin »).
// Les regles d emballage n ont pas d ecran d edition : elles vivent dans le code (PKG_CLIENTS) et sont REMPLACEES en bloc par la table partagee
// (Firestore config/clients, _l486Apply). Une regle ajoutee au code serait donc ecrasee en silence : _l529PkgMerge re-ajoute les seules cles
// listees dans _L529_PKG_PATCHES quand la table recue ne les a pas — la table partagee GAGNE toujours sur une cle qu elle porte.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
const mP=src.match(/^var PKG_CLIENTS=(\{[\s\S]*?\n\});/m); if(!mP) throw new Error('introuvable PKG_CLIENTS'); global.PKG_CLIENTS=eval('('+mP[1]+')');
const mL=src.match(/^const _L529_PKG_PATCHES=(\[[^\]]*\]);/m); global._L529_PKG_PATCHES=mL?eval(mL[1]):null;
let MERGE=null; try{ MERGE=eval('('+fnOf('_l529PkgMerge')+')'); }catch(e){ ok(false,'fonction _l529PkgMerge introuvable ('+e.message+')'); }
global._l410PkgResolve=eval('('+fnOf('_l410PkgResolve')+')');
console.log('── 1. la regle Suys existe dans le code ──');
const S=PKG_CLIENTS['Suys'];
ok(!!S&&/DH1004 imprimé/.test(S.notes||'')&&/écrire à la main la largeur dans le mandrin/.test(S.notes||''),'PKG_CLIENTS[Suys].notes porte la consigne « DH1004 imprimé … écrire à la main la largeur dans le mandrin »');
ok(!!S&&/^⚡ SPÉCIFICITÉ/.test(S.notes||'')&&S.palette==='80×120'&&S.type==='Caisse'&&S.etiquetage==='Standard'&&/Standard/.test(S.cerclage||''),'entree complete (palette / type / etiquetage / cerclage par defaut) et note marquee ⚡ SPÉCIFICITÉ (bandeau visible)');
ok(/Pile max 25cm/.test((S&&S.notes)||''),'les regles par defaut restent lisibles sous la consigne');
ok(_l410PkgResolve('Suys')===S&&_l410PkgResolve('SUYS pour le 22 09 2026')===S,'resolution par nom de client (exacte et tolerante)');
console.log('── 2. la table partagee ne peut plus effacer la regle, et gagne toujours sur ses propres cles ──');
global.PKG_CLIENTS_SEED=PKG_CLIENTS;
const remote={'EPCO':{palette:'X',notes:'table partagee'},'VEKA':{palette:'Y',notes:'v'}};
const out=MERGE?MERGE(remote):null;
ok(!!out&&out!==remote&&out['Suys']===S&&out['EPCO'].notes==='table partagee'&&Object.keys(out).length===3&&Object.keys(remote).length===2,'table partagee SANS Suys → Suys re-ajoutee, les cles recues intactes, l objet recu non modifie');
const remote2={'Suys':{palette:'Z',notes:'saisie par un admin'}}; const out2=MERGE?MERGE(remote2):null;
ok(!!out2&&out2['Suys'].notes==='saisie par un admin','table partagee AVEC sa propre entree Suys → elle GAGNE (jamais ecrasee par le code)');
ok(Array.isArray(_L529_PKG_PATCHES)&&_L529_PKG_PATCHES.join(',')==='Suys'&&!!out&&!('CARRETIER ROBIN' in out),'seules les cles LISTEES sont re-ajoutees (une regle retiree de la table partagee ne ressuscite pas)');
global.PKG_CLIENTS_SEED=null; ok(MERGE&&MERGE(remote)===remote,'graine pas encore capturee → table recue telle quelle');
global.PKG_CLIENTS_SEED=PKG_CLIENTS; ok(MERGE&&MERGE(null)===null,'table recue invalide → rendue telle quelle (la garde _l486Valid a deja tranche)');
console.log('── 3. cablage ──');
ok(/PKG_CLIENTS=_l529PkgMerge\(d\.pkgClients\);/.test(fnOf('_l486Apply')),'_l486Apply (seul point de convergence cache local / Firestore) passe par la fusion');
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 PKG L529 OK : '+total+' verifications'));
process.exit(fail?1:0);
