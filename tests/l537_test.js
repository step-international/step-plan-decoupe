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
ok(/filter\(function\(k\)\{ return k!=='ÉCHANTILLON'; \}\)\.length/.test(CK)&&/var nP=Object\.keys\(PKG_CLIENTS\|\|\{\}\)\.length/.test(CK)&&/if\(nC>0&&nP>=5&&okR\)\{ if\(b\) b\.remove\(\); try\{ document\.body\.classList\.remove\('l542-banner'\); \}catch\(_\)\{ \} return; \}/.test(CK)&&/role','alert'/.test(CK),'[L541 · 2e passe adverse] bandeau « liste clients / regles emballage non chargees » : ÉCHANTILLON ne compte pas, retire QUAND LES DEUX tables sont chargees ET la table d emballage a au moins 5 regles (pas seulement non vide — une table TRONQUEE reste signalee), role=alert');
ok(/setTimeout\(function\(\)\{ _l537Grace=false; try\{ _l537CatalogCheck\(\); \}catch\(_\)\{ \} \},7000\);/.test(fnOf('_l486LoadClients'))&&/try\{ _l537CatalogCheck\(\); \}catch\(_\)\{ \}/.test(fnOf('_l486Apply')),'… verifie 7 s apres la connexion et a chaque application du referentiel');

console.log('── 4b. [L541 · audit adverse 26/09] catalogue charge SEUL ne masque plus le manque de regles d emballage ──');
global.document={ _b:null, _cls:new Set(), _vars:{}, getElementById(id){ if(id==='l537CatalogBanner') return this._b; return null; }, createElement(){ const el={ style:{}, offsetHeight:61, setAttribute(){}, remove:()=>{ global.document._b=null; } }; global.document._b=el; return el; }, body:{ appendChild(el){ global.document._b=el; }, classList:{ add(c){ global.document._cls.add(c); }, remove(c){ global.document._cls.delete(c); } } }, documentElement:{ style:{ setProperty(k,v){ global.document._vars[k]=v; } } } };
global._l537Loaded=true; global._l537Grace=false;   /* [L542] hors periode de grace pour les cas ci-dessous */   /* [L542] referentiel complementaire charge (cas nominal des tests ci-dessous) */
const CHECK=eval('('+CK+')');
global.CLIENT_DATA={A:[1]}; global.PKG_CLIENTS={}; global.document._b=null; CHECK();
ok(!!global.document._b&&/[Rr]ègles d.emballage non chargées/.test(global.document._b.textContent),'[L541] catalogue seul charge, regles VIDES → bandeau affiche, message specifique « regles d emballage »');
global.CLIENT_DATA={}; global.PKG_CLIENTS={A:1,B:1,C:1,D:1,E:1}; global.document._b=null; CHECK();
ok(!!global.document._b&&/clients non chargée/.test(global.document._b.textContent),'[L541] regles seules chargees (5), catalogue VIDE → bandeau affiche, message « clients »');
global.CLIENT_DATA={A:[1]}; global.PKG_CLIENTS={A:1,B:1,C:1,D:1,E:1}; global.document._b={ remove(){ global.document._b=null; } }; CHECK();
ok(global.document._b===null,'[L541] les DEUX tables chargees (>=5 regles) → bandeau retire');
global.CLIENT_DATA={A:[1]}; global.PKG_CLIENTS={Suys:1,Cougnaud:1}; global.document._b=null; CHECK();
ok(!!global.document._b&&/[Rr]ègles d.emballage non chargées/.test(global.document._b.textContent),'[L541 · 2e passe adverse] catalogue charge, regles TRONQUEES (2 sur ~20, pas 0) → bandeau affiche (nP>=5, pas nP>0 : une perte partielle est desormais signalee)');
global.CLIENT_DATA={A:[1]}; global.PKG_CLIENTS={A:1,B:1,C:1,D:1,E:1}; global._l537Loaded=false; global.document._b=null; CHECK();
ok(!!global.document._b&&/Référentiel complémentaire non chargé/.test(global.document._b.textContent)&&!/clients non chargée/.test(global.document._b.textContent),'[L542 · audit 26/09] catalogue et regles OK mais referentiel complementaire (config/refs) jamais charge → bandeau, message specifique');
global._l537Loaded=true; global.CLIENT_DATA={}; global.PKG_CLIENTS={}; global.document._b=null; CHECK();
ok(!!global.document._b&&/clients non chargée/.test(global.document._b.textContent)&&/emballage non chargées/.test(global.document._b.textContent),'[L542] plusieurs manques → un seul bandeau qui les liste tous');
ok(/pointer-events:none/.test(CK),'[L542] le bandeau n absorbe jamais un tap (tablette : il recouvrait le bouton chrono/Confirmer)');
ok(/body\.has-actionbar #l537CatalogBanner\{bottom:calc\(100px \+ env\(safe-area-inset-bottom,0px\)\)!important\}/.test(src),'[L542] … et il remonte au-dessus de la barre d action tablette (meme regle que le toast)');
ok(/if\(n\)\{ _l537Loaded=true; if\(typeof currentRole!=='undefined'&&currentRole\)\{ try\{ _l537CatalogCheck\(\); \}catch\(_\)\{ \} \}/.test(fnOf('_l537ApplyRefs')),'[L542] le bandeau est re-evalue quand config/refs arrive (apres connexion) — il ne reste pas affiche a tort');

console.log('── 4c. [L542 · audit 26/09] un abonnement Firestore ne meurt plus apres 5 essais ──');
ok(/else\{ _l542RearmArm\('refs',function\(\)\{ _l537Retries=0; _l537LoadRefs\(\); \}\); \}/.test(fnOf('_l537LoadRefs'))&&/else\{ _l542RearmArm\('clients',function\(\)\{ _l486Retries=0; _l486LoadClients\(\); \}\); \}/.test(fnOf('_l486LoadClients')),'apres les 5 essais : relance armee (refs ET clients) au lieu d un abandon definitif');
ok(/_l542RearmStop\('refs'\)/.test(fnOf('_l537StopRefs'))&&/_l542RearmStop\('clients'\)/.test(fnOf('_l486StopClients')),'deconnexion : les relances sont desarmees');
let rTimers=[]; const _rst=global.setTimeout,_rct=global.clearTimeout; global.setTimeout=(f,ms)=>{ const id={f,ms}; rTimers.push(id); return id; }; global.clearTimeout=id=>{ rTimers=rTimers.filter(x=>x!==id); };
let rListeners=[]; global.window={ addEventListener:(ev,f)=>rListeners.push({ev,f}), removeEventListener:(ev,f)=>{ rListeners=rListeners.filter(l=>l.f!==f); } };
global._l542Rearm={}; global.currentRole='operateur'; global._l542RearmStop=eval('('+fnOf('_l542RearmStop')+')'); const RARM=eval('('+fnOf('_l542RearmArm')+')');
let rCalls=0; RARM('refs',()=>{ rCalls++; });
ok(rTimers.length===1&&rTimers[0].ms===300000&&rListeners.length===1&&rListeners[0].ev==='online','arme : un minuteur de 5 min + un ecouteur « online »');
rListeners[0].f(); ok(rCalls===1&&rTimers.length===0&&rListeners.length===0,'retour reseau → une relance, minuteur et ecouteur retires');
RARM('refs',()=>{ rCalls++; }); RARM('refs',()=>{ rCalls++; }); ok(rTimers.length===1&&rListeners.length===1,'rearmer n empile pas');
global.currentRole=null; rTimers[0].f(); ok(rCalls===1,'session fermee entre-temps → pas de relance');
global.currentRole='operateur'; RARM('clients',()=>{ rCalls++; }); RARM('refs',()=>{ rCalls++; }); ok(rTimers.length===2,'clients et refs ont chacun leur relance');
_l542RearmStop('clients'); ok(rTimers.length===1&&rListeners.length===1,'desarmer l un ne touche pas l autre');
_l542RearmStop('refs'); ok(rTimers.length===0&&rListeners.length===0,'tout desarme');
global.setTimeout=_rst; global.clearTimeout=_rct;
global.CLIENT_DATA={}; global.PKG_CLIENTS={}; global._l537Grace=true; global.document._b=null; CHECK();
ok(global.document._b===null,'[L542 · 2e passe] periode de grace (7 s apres la connexion) : un instantane incomplet ne CREE pas le bandeau (plus de flash rouge au 1er demarrage sans cache)');
global._l537Grace=false; CHECK(); const _b1=global.document._b;
global._l537Grace=true; global.CLIENT_DATA={A:[1]}; CHECK();
ok(!!_b1&&global.document._b===_b1&&/emballage/.test(_b1.textContent)&&!/clients non chargée/.test(_b1.textContent),'… mais un bandeau DEJA affiche est toujours mis a jour pendant la grace');
global.PKG_CLIENTS={A:1,B:1,C:1,D:1,E:1}; CHECK();
ok(global.document._b===null&&!global.document._cls.has('l542-banner'),'… et retire quand tout arrive, classe de mise en page retiree');
global._l537Grace=false; global.CLIENT_DATA={}; CHECK();
ok(global.document._cls.has('l542-banner')&&global.document._vars['--l542-h']==='61px','[L542 · 2e passe] bandeau affiche → classe l542-banner + hauteur reelle exposee au CSS (--l542-h)');
ok(/body\.l542-banner #ficheMain\{height:calc\(100dvh - var\(--fiche-top,89px\) - var\(--l542-h,56px\) - env\(safe-area-inset-bottom,0px\)\)\}/.test(src)&&/body\.l542-banner #planRight\{height:calc\(100dvh - 89px - var\(--l542-h,56px\)\)\}/.test(src),'[L542 · 2e passe] paysage (tablettes 1280 px) : la fiche et la colonne COMMENCER raccourcissent de la hauteur du bandeau — barre Imprimer/Confirmer et COMMENCER jamais recouvertes');
ok(/if\(!_l486Unsub&&!_l542CacheReplayed\)\{ _l542CacheReplayed=true;/.test(fnOf('_l486LoadClients')),'[L542 · 2e passe] le cache clients n est rejoue qu UNE fois par page (les relances ne rafraichissent plus les listes pour rien)');
const PUB=fnOf('_l486Publish');
ok(/if\(nP<5\)\{ showToast\('Règles d.emballage en mémoire anormalement peu nombreuses/.test(PUB),'[L541] publication de l onglet Clients REFUSEE si moins de 5 regles d emballage en memoire (meme garde que le catalogue, jamais ecraser config/clients par une table d emballage vide)');
ok(/try\{ _saveClientOptsHtml=null; Object\.keys\(_saveRefOptsByClient\)\.forEach/.test(fnOf('_l488RefreshClientUI')),'les filtres de Donnees > Plans suivent le referentiel charge (memo L80 invalide)');

console.log('── 5. la fusion des regles d emballage est inerte et la table partagee gagne ──');
ok(/_l486Valid\(_l537c\.pkgClients\)\) PKG_CLIENTS=_l537c\.pkgClients/.test(src),'au demarrage, les regles du cache sont appliquees (comme les clients)');
console.log('── 6. regles Firestore : jamais de mail sans destinataire ──');
const rules=fs.readFileSync(path.join(__dirname,'..','firestore.rules'),'utf8');
ok(/request\.resource\.data\.to\.size\(\) >= 1/.test(rules)&&/request\.resource\.data\.to\.hasOnly\(/.test(rules),'mail.to : au moins 1 adresse ET seulement des adresses connues (la liste vit dans les regles, jamais dans le fichier servi)');
console.log(fail?('\n💥 '+fail+' echec(s) sur '+total):('\n🏆 L537 OK : '+total+' verifications'));
process.exit(fail?1:0);
