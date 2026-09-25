// l537_test.js — [L537 · 24/09/2026] PLUS AUCUNE DONNEE METIER DANS LE FICHIER PUBLIC (index.html est servi par GitHub Pages).
// Catalogue clients, regles d emballage, table Legrand, destinataires des signalements, migration des anciennes notes et libelle
// fournisseur vivent dans Firestore (config/clients, config/refs) ; le fichier ne garde que les MECANISMES : cache local relu en
// synchrone au demarrage (le role des graines), abonnement apres connexion, gardes contre la degradation silencieuse.
// Contrainte d Esteban : « aucun changement pour les operateurs ». Ce test verifie les gardes qui la tiennent.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','referentiel_test.json'),'utf8'));
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const _d=b=>Buffer.from(b,'base64').toString('utf8').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');   // decode + echappe pour new RegExp (« + » serait un quantificateur)

console.log('── 1. le fichier ne porte plus aucune donnee metier ──');
ok(/^var CLIENT_DATA = \{\n\};/m.test(src)&&/^var PKG_CLIENTS=\{\n\};/m.test(src),'graines clients et regles VIDES');
ok(/^var LEGRAND_PKG=\{\};/m.test(src)&&/^var _OLD_NOTES=\[\];/m.test(src)&&/^var REPORT_RECIPIENTS=\[\];/m.test(src),'table Legrand, migration des anciennes notes, destinataires : VIDES');
ok(/^const _L529_PKG_PATCHES=\[\];/m.test(src)&&/^const _L532_PKG_FORCE=\[\];/m.test(src),'listes de patch et de forcage vides (elles portaient des noms de clients)');
ok(!/@gmail\.com|@step-international\.com/.test(src),'aucune adresse e-mail');
ok(!new RegExp(_d('QmlzY2hvZiArIEtsZWlu')).test(src),'nom du fournisseur absent (3 sites : liste des emplacements, tuile, articles importes)');
ok((src.match(/_l537Supplier\('bk'\)/g)||[]).length===3,'les 3 sites lisent le libelle fournisseur dans config/refs (repli neutre « Fournisseur »)');
ok(!new RegExp(_d('Ik10ZWNobm9sb2dpZSI6')).test(src)&&!new RegExp(_d('REgxMDA0IGltcHJpbcOp')).test(src)&&!new RegExp(_d('NDU6e2M6IjA0NTMiLGs6NQ==')).test(src),'ni catalogue, ni consigne d emballage, ni code mandrin dans le fichier');

console.log('── 2. ORDRE de demarrage : le cache local joue le role des graines, AVANT tout rendu ──');
const iDecl=src.indexOf("var CLIENT_DATA = {\n};"), iCache=src.indexOf("localStorage.getItem('step_clients_v1')||'null')"), iEch=src.indexOf("CLIENT_DATA['ÉCHANTILLON']=(function(){"), iInit=src.indexOf("\n(function init(){"), iRefs=src.indexOf("localStorage.getItem('step_refs_v1')||'null')"), iLeg=src.indexOf("var LEGRAND_PKG={};"), iOld=src.indexOf("var _OLD_NOTES=[];");
ok(iDecl>0&&iCache>iDecl&&iCache<iEch,'cache clients relu juste apres la declaration, AVANT le calcul d ÉCHANTILLON (qui s appuie dessus)');
ok(iCache<iInit&&iEch<iInit,'… et avant init() (menus construits sur la liste chargee, comme hier sur la graine)');
ok(iRefs>iLeg&&iRefs>iOld&&iRefs<iInit&&iRefs>src.indexOf('function _l537ApplyRefs('),'cache refs relu apres TOUTES les declarations (LEGRAND_PKG, _OLD_NOTES, _l537ApplyRefs) et avant init()');
ok(/try\{ _l486LoadClients\(\); \}catch\(e\)\{\}\n\s*try\{ _l537LoadRefs\(\); \}catch\(e\)\{\}/.test(src),'a la connexion : abonnement clients PUIS refs, chacun dans son try');
ok(/try\{ _l486StopClients\(\); \}catch\(_\)\{ \}   try\{ _l537StopRefs\(\); \}catch\(_\)\{ \}/.test(src),'a la deconnexion : les deux abonnements sont detaches');

console.log('── 3. _l537ApplyRefs : ce qu elle applique, ce qu elle refuse ──');
global.LEGRAND_PKG={}; global.REPORT_RECIPIENTS=[]; global._OLD_NOTES=[]; global._L537_REFS={suppliers:null}; global._l537Loaded=false; global.console=console;
global._l486Valid=eval('('+fnOf('_l486Valid')+')');
global._l540Order=eval('('+fnOf('_l540Order')+')');   /* [L540] ordre stable des profils */
const APPLY=eval('('+fnOf('_l537ApplyRefs')+')'); const SUP=eval('('+fnOf('_l537Supplier')+')');
ok(SUP('bk')==='Fournisseur','avant chargement : libelle neutre « Fournisseur » (jamais le nom, jamais undefined)');
global.USER_PROFILES={};
ok(APPLY(FIX.refs,'test')===5&&Object.keys(LEGRAND_PKG).length===2&&REPORT_RECIPIENTS.length===1&&_OLD_NOTES.length===1&&SUP('bk')==='Fournisseur test','document complet → 5 champs appliques (table Legrand, destinataires, anciennes notes, fournisseurs, profils [L540])');
ok(APPLY({legrandPkg:[],suppliers:'x',reportTo:[],oldNotes:'non'},'test')===0&&Object.keys(LEGRAND_PKG).length===2&&REPORT_RECIPIENTS.length===1,'document malforme → rien n est ecrase (tableau au lieu d objet, liste vide, chaine)');
ok(APPLY(null,'test')===0&&APPLY(undefined,'test')===0,'document absent → 0, jamais d exception');
ok(REPORT_RECIPIENTS!==FIX.refs.reportTo&&_OLD_NOTES!==FIX.refs.oldNotes,'copies defensives (slice) : le cache ou le doc ne partagent pas leurs tableaux avec l app');

console.log('── 4. gardes contre la degradation silencieuse ──');
const RW=fnOf('_reportWrite');
ok(/if\(!\(Array\.isArray\(REPORT_RECIPIENTS\)&&REPORT_RECIPIENTS\.length\)\)\{/.test(RW)&&/return _l537FetchRefs\(4000\)\.then\(function\(\)\{ return \(Array\.isArray\(REPORT_RECIPIENTS\)&&REPORT_RECIPIENTS\.length\)\?_reportWrite\.apply\(null,_l537args\):false; \}\);/.test(RW),'signalement sans destinataire connu : lecture unique bornee (4 s) puis envoi, sinon false (toast « non envoye ») — jamais to:[]');
ok(RW.indexOf('REPORT_RECIPIENTS.length')<RW.indexOf('var ctx=_reportCtx()'),'… la garde precede la construction du message');
const AF=fnOf('autofillLegrandRow');
ok(/else if\(mEl&&Object\.keys\(LEGRAND_PKG\|\|\{\}\)\.length\)\{ mEl\.value=''; \}/.test(AF),'autofill Legrand : un code mandrin deja saisi n est efface QUE si la table est chargee et ne le connait pas (table vide = on ne touche a rien)');
global.parseNum=v=>parseFloat(String(v==null?'':v).replace(',','.'))||0; global.legrandRefCode=eval('('+fnOf('legrandRefCode')+')'); const LP=eval('('+fnOf('legrandPkg')+')');
global.LEGRAND_PKG={}; ok(LP('41319051 - TacFlex® DQ1002',45)===null,'table vide → null (aucune exception, aucun code invente)');
global.LEGRAND_PKG=FIX.refs.legrandPkg; ok(LP('41319051 - TacFlex® DQ1002',45).c==='1003'&&LP('41319051 - TacFlex® DQ1002',999)===null,'table chargee → code de la fixture ; laize inconnue → null');
ok(/if\(nC<10\)\{ showToast\('Catalogue en mémoire anormalement petit \('\+nC\+' client\(s\)\) — publication refusée/.test(fnOf('_l486Publish')),'publication de l onglet Clients REFUSEE si moins de 10 clients en memoire (jamais ecraser config/clients par une liste vide)');
const CK=fnOf('_l537CatalogCheck');
ok(/filter\(function\(k\)\{ return k!=='ÉCHANTILLON'; \}\)\.length/.test(CK)&&/if\(n>0\)\{ if\(b\) b\.remove\(\); return; \}/.test(CK)&&/role','alert'/.test(CK),'bandeau « liste clients non chargee » : ÉCHANTILLON ne compte pas, retire des que la liste arrive, role=alert');
ok(/setTimeout\(function\(\)\{ try\{ _l537CatalogCheck\(\); \}catch\(_\)\{ \} \},7000\);/.test(fnOf('_l486LoadClients'))&&/try\{ _l537CatalogCheck\(\); \}catch\(_\)\{ \}/.test(fnOf('_l486Apply')),'… verifie 7 s apres la connexion et a chaque application du referentiel');
ok(/try\{ _saveClientOptsHtml=null; Object\.keys\(_saveRefOptsByClient\)\.forEach/.test(fnOf('_l488RefreshClientUI')),'les filtres de Donnees > Plans suivent le referentiel charge (memo L80 invalide)');

console.log('── 5. la fusion des regles d emballage est inerte et la table partagee gagne ──');
ok(/_l486Valid\(_l537c\.pkgClients\)\) PKG_CLIENTS=_l537c\.pkgClients/.test(src),'au demarrage, les regles du cache sont appliquees (comme les clients)');
console.log('── 6. regles Firestore : jamais de mail sans destinataire ──');
const rules=fs.readFileSync(path.join(__dirname,'..','firestore.rules'),'utf8');
ok(/request\.resource\.data\.to\.size\(\) >= 1/.test(rules)&&/request\.resource\.data\.to\.hasOnly\(/.test(rules),'mail.to : au moins 1 adresse ET seulement des adresses connues (la liste vit dans les regles, jamais dans le fichier servi)');
console.log(fail?('\n💥 '+fail+' echec(s) sur '+total):('\n🏆 L537 OK : '+total+' verifications'));
process.exit(fail?1:0);
