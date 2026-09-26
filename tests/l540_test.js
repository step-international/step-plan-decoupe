// l540_test.js — [L540 · 25/09/2026] Les 6 profils (uid -> role / initiales / prenom) et l abreviation du fournisseur sortent du
// fichier public : ils vivent dans Firestore config/refs (profiles, suppliers.bkShort), relus depuis le cache local avant init()
// et par abonnement apres connexion (mecanisme L537). Le login ne doit JAMAIS etre degrade : au premier demarrage sans cache,
// une lecture unique bornee de config/refs precede la decision « UID non reconnu » ; si le referentiel ne peut pas etre LU
// (hors ligne, reseau lent, cache sans profils) la session est CONSERVEE et la resolution est rejouee (passe adverse du 25/09).
// Les valeurs controlees sont ENCODEES.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const ROOT=path.join(__dirname,'..'); const src=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','referentiel_test.json'),'utf8'));
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const _d=b=>Buffer.from(b,'base64').toString('utf8').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const UIDS=['eWRvYlVJMXdwTmVzcW5sbU5Gcm95b1FMR0htMQ==','R0JHaUE1azFoRlpnd2hIT2cxeTAzd0JyN00zMw==','NHZsbXBlQlc5cFVGUVA1OWVDa1U1MWJkVlpzMg==','c21pQmhib3hUWlpLcG1KV2lSYXBUeHMxUDMyMw==','cWxWb2x5N1BzeU1uZFdNbmltVFk5bUtVdTUzMg==','ejFlOVRHT1RVRFo5S1l0R2wxMmk2SG5JU3J2Mg=='];
const NOMS=['VGHDr2Vi','Sm9yZGFu','TWF0aGlldQ==','Q2hyaXN0aWFu','RG9taW5pcXVl','RXN0w6k='];

console.log('── 1. plus de profil, d uid ni d abreviation fournisseur dans le fichier ──');
ok(/^var USER_PROFILES=\{\};/m.test(src),'table des profils VIDE (var, reassignable)');
ok(!new RegExp(UIDS.map(_d).join('|')).test(src),'aucun des 6 uid Firebase dans le fichier (ni table, ni liste de partage)');
ok(!new RegExp(NOMS.map(b=>"nom:'"+_d(b)+"'").join('|')).test(src),'aucun prenom dans une entree de profil');
ok(!/const _shareHiddenUids/.test(src)&&/function _shareHidden\(u\)\{ try\{ return !!\(USER_PROFILES\[u\]&&USER_PROFILES\[u\]\.role==='admin'\); \}/.test(src)&&/!_shareHidden\(u\)/.test(fnOf('_shareOtherUids')),'liste de partage : les admins sont exclus par leur ROLE (plus deux uid codes en dur), meme resultat qu avant');
const out=path.join(require('os').tmpdir(),'l540_site_'+process.pid); cp.execFileSync(process.execPath,[path.join(__dirname,'build_public.mjs'),'--out',out],{stdio:'pipe'});
const pub=fs.readFileSync(path.join(out,'index.html'),'utf8');
ok(!/B\+K/.test(pub.replace(/\[BK:\$\{matno\}[^\]]*\]|\[BKCO:[^\]]*\]/g,''))&&/\[BK:\$\{matno\}/.test(src),'fichier PUBLIE construit : plus aucun « B+K » en clair (les jetons techniques [BK:…]/[BKCO:…] de l import sont intacts)');
ok((src.match(/_l540Bk\(\)/g)||[]).length>=13,'au moins 13 libelles de l ecran stock passent par _l540Bk() → '+(src.match(/_l540Bk\(\)/g)||[]).length);

console.log('── 2. le login n est JAMAIS degrade ──');
const A0=src.indexOf('firebase.auth().onAuthStateChanged(async function _l540OnAuth(user){'), A1=src.indexOf('// Utilisateur déconnecté',A0);
ok(A0>0&&A1>A0,'rappel d authentification NOMME (_l540OnAuth) : il peut etre rejoue');
const AUTH=src.slice(A0,A1);
ok(/let profile=USER_PROFILES\[user\.uid\]\|\|_machineProfileOf\(user\.email\);/.test(AUTH)&&/let _l540Read=true;/.test(AUTH)&&/if\(!profile\)\{ try\{[^}]*Chargement du profil[^}]*\}catch\(_\)\{ \} _l540Read=await _l537FetchRefs\(\d+\)\.catch\(function\(\)\{ return false; \}\); profile=USER_PROFILES\[user\.uid\]\|\|_machineProfileOf\(user\.email\); \}/.test(AUTH),'profil inconnu → message « Chargement du profil » puis lecture unique bornee de config/refs puis nouvelle resolution, AVANT « UID non reconnu » (premier demarrage sans cache) ; la lecture ne peut pas jeter');
const iGen=AUTH.indexOf('if(_l540G!==_l540Gen) return;');
ok(/const _l540G=\+\+_l540Gen;/.test(AUTH)&&iGen>AUTH.indexOf('_l540Read=await _l537FetchRefs(')&&iGen<AUTH.indexOf('if(profile){')&&AUTH.indexOf('const _l540G=++_l540Gen;')<AUTH.indexOf('let profile='),'generation de l appel prise AVANT toute attente, verifiee juste APRES la lecture et avant toute action : un appel perime (autre compte, deconnexion pendant la lecture) ne touche a rien');
const bound=Number((AUTH.match(/_l537FetchRefs\((\d+)\)\.catch/)||[])[1]);
ok(bound>=10000,'borne de lecture '+bound+' ms ≥ 10 000 ms (bascule hors-ligne du SDK Firestore : le cache IndexedDB doit avoir le temps de repondre)');
const iFetch=AUTH.indexOf('_l540Read=await _l537FetchRefs('), iProf=AUTH.indexOf('if(profile){'), iKeep=AUTH.indexOf('}else if(_l540Read!==true||!Object.keys(USER_PROFILES).length){'), iOut=AUTH.indexOf('firebase.auth().signOut()');
ok(iFetch>0&&iFetch<iProf,'… placee avant la branche qui applique le role');
const iElse=AUTH.indexOf('}else{',iKeep);
ok(iKeep>iProf&&iElse>iKeep&&iOut>iElse&&(AUTH.match(/signOut\(\)/g)||[]).length===1,'referentiel NON LU ou sans profil → session CONSERVEE (branche AVANT la deconnexion, sans aucun signOut) ; une seule deconnexion possible : table lue ET uid absent');
ok(/_l540Read==='denied'/.test(AUTH.slice(iKeep,iElse))&&/Accès refusé par le serveur/.test(AUTH.slice(iKeep,iElse))&&/réseau/.test(AUTH.slice(iKeep,iElse))&&/res\(\(e&&e\.code==='permission-denied'\)\?'denied':false\)/.test(fnOf('_l537FetchRefs')),'refus serveur (regles / App Check) distingue du reseau : message « Accès refusé » au lieu de « réseau », session conservee dans les deux cas');
ok(/_l540RetryArm\(user\.uid,_l540OnAuth\);/.test(AUTH.slice(iKeep,iOut))&&/loginErr/.test(AUTH.slice(iKeep,iOut)),'… avec message sur l ecran de connexion et nouvel essai automatique (retour reseau / 15 s)');
ok(/_l540RetryStop\(\);/.test(AUTH.slice(iProf,iKeep)),'profil resolu → l essai en attente est annule');
ok(/_l540Gen\+\+;/.test(src.slice(A1,A1+400))&&/try\{ _l540RetryStop\(\); \}catch\(_\)\{\}/.test(src.slice(A1,A1+400)),'deconnexion → les appels en attente deviennent perimes et l essai est annule');
ok(/^function _machineProfileOf\(email\)\{/m.test(src)&&!/USER_PROFILES/.test(fnOf('_machineProfileOf')),'les 3 postes machine (email) ne dependent pas de la table : jamais touches');
const iRefs=src.indexOf("localStorage.getItem('step_refs_v1')||'null')"), iInit=src.indexOf("\n(function init(){");
ok(iRefs>0&&iRefs<iInit,'le cache refs (profils compris) est relu en SYNCHRONE avant init() — donc avant tout rappel d authentification (asynchrone)');
ok(A0>0&&A0<iRefs,'… l abonnement auth est enregistre plus haut dans le script mais ne peut se declencher qu apres la fin du script');
ok(src.indexOf('function _l540RetryArm(')>A0&&src.indexOf('function _l540RetryArm(')<iRefs&&!/<\/?script/.test(src.slice(A0,src.indexOf('function _l540RetryArm('))),'les aides _l540Retry* sont des declarations du MEME <script> que le rappel auth (hissees : disponibles quel que soit l ordre)');

(async()=>{   /* sections asynchrones (await) dans un module CommonJS */
const DL=fnOf('doLogin');
ok(DL.indexOf("try{ if(!currentRole&&typeof _l540RetryOn==='function') _l540RetryOn(); }catch(_){}")>DL.indexOf('await firebase.auth().signInWithEmailAndPassword(email, password);'),'doLogin : retaper le MEME compte pendant une session conservee rejoue la resolution tout de suite (Firebase ne rappelle pas onAuthStateChanged pour le meme uid)');
console.log('── 2a. _l537FetchRefs REELLE : ce qu elle repond ──');
global.LEGRAND_PKG={}; global.REPORT_RECIPIENTS=[]; global._OLD_NOTES=[]; global._L537_REFS={suppliers:null}; global._l537Loaded=false; global.USER_PROFILES={}; global.console=console;
global.localStorage={ getItem:()=>null, setItem(){}, removeItem(){} };
global._l486Valid=eval('('+fnOf('_l486Valid')+')'); global._l540Order=eval('('+fnOf('_l540Order')+')'); global._l537ApplyRefs=eval('('+fnOf('_l537ApplyRefs')+')');
const FETCH=eval('('+fnOf('_l537FetchRefs')+')');
const dbWith=get=>({ collection:()=>({ doc:()=>({ get }) }) });
global.db=dbWith(()=>Promise.resolve({ exists:true, data:()=>FIX.refs, metadata:{ fromCache:false } }));
ok((await FETCH(2000))===true&&Object.keys(USER_PROFILES).length===4,'doc lu sur le SERVEUR → true, profils appliques');
global.USER_PROFILES={}; global.db=dbWith(()=>Promise.resolve({ exists:true, data:()=>FIX.refs, metadata:{ fromCache:true } }));
ok((await FETCH(2000))===false&&Object.keys(USER_PROFILES).length===4,'doc servi par le CACHE Firestore → profils appliques (un compte connu est resolu) mais PAS un verdict serveur (false : jamais de deconnexion dessus)');
global.db=dbWith(()=>Promise.reject({ code:'permission-denied' }));
ok((await FETCH(2000))==='denied','refus serveur (regles / App Check) → denied');
global.db=dbWith(()=>Promise.reject({ code:'unavailable' }));
ok((await FETCH(2000))===false,'autre erreur → false');
global.db=dbWith(()=>new Promise(()=>{}));
ok((await FETCH(60))===false,'pas de reponse dans la borne → false (jamais bloquant)');
global.db=dbWith(()=>Promise.resolve({ exists:false, data:()=>null, metadata:{ fromCache:false } }));
ok((await FETCH(2000))===true,'doc absent (lu) → true : la branche conservee se declenche alors sur la table vide, pas sur cette valeur');
console.log('── 2b. nouvel essai : une fois, meme session, non resolue ──');
let timers=[]; const _st=global.setTimeout,_ct=global.clearTimeout;
global.setTimeout=(f,ms)=>{ const id={f,ms}; timers.push(id); return id; }; global.clearTimeout=id=>{ timers=timers.filter(t=>t!==id); };
let listeners=[]; global.window={ addEventListener:(ev,f)=>listeners.push({ev,f}), removeEventListener:(ev,f)=>{ listeners=listeners.filter(l=>l.f!==f); } };
global.firebase={ auth:()=>({ currentUser:{uid:'uid-test-op1'} }) }; global.currentRole=null; global.console=console;
global._l540RetryT=null; global._l540RetryOn=null;
global._l540RetryStop=eval('('+fnOf('_l540RetryStop')+')'); const ARM=eval('('+fnOf('_l540RetryArm')+')');
let calls=[]; const FN=u=>{ calls.push(u.uid); return Promise.resolve(); };
ARM('uid-test-op1',FN);
ok(timers.length===1&&timers[0].ms===15000&&listeners.length===1&&listeners[0].ev==='online','arme : un minuteur de 15 s + un ecouteur « online »');
listeners[0].f();
ok(calls.length===1&&calls[0]==='uid-test-op1'&&timers.length===0&&listeners.length===0,'retour reseau → UNE nouvelle resolution, minuteur et ecouteur retires');
ARM('uid-test-op1',FN); global.currentRole='operateur'; timers[0].f();
ok(calls.length===1&&timers.length===0,'session deja resolue entre-temps → pas de nouvel appel');
global.currentRole=null; ARM('uid-test-op1',FN); global.firebase={ auth:()=>({ currentUser:null }) }; timers[0].f();
ok(calls.length===1,'deconnecte entre-temps → pas de nouvel appel');
global.firebase={ auth:()=>({ currentUser:{uid:'uid-autre'} }) }; ARM('uid-test-op1',FN); timers[0].f();
ok(calls.length===1,'autre compte connecte entre-temps → pas de nouvel appel');
ARM('uid-test-op1',FN); ARM('uid-test-op1',FN); ok(timers.length===1&&listeners.length===1,'rearmer n empile jamais (un seul minuteur, un seul ecouteur)');
_l540RetryStop(); ok(timers.length===0&&listeners.length===0,'_l540RetryStop : tout est retire');

console.log('── 2c. rappel REEL rejoue : la session change pendant la lecture (poste partage) ──');
const CB=(()=>{ const i=src.indexOf('async function _l540OnAuth(user){'); let k=src.indexOf('{',i),d=0; for(let j=k;j<src.length;j++){ const c=src[j]; if(c==='{')d++; else if(c==='}'){ d--; if(d===0) return src.slice(i,j+1); } } })();
const _warn=console.warn; console.warn=()=>{};
function world(){
  let cur=null; const calls={}; const count=n=>{ calls[n]=(calls[n]||0)+1; }; const els={}; timers=[]; listeners=[];
  Object.assign(global,{ USER_PROFILES:{}, currentRole:null, currentUser:null, _l540Gen:0, _l540RetryT:null, _l540RetryOn:null, _L537_REFS:{suppliers:null}, _l537Loaded:false, LEGRAND_PKG:{}, REPORT_RECIPIENTS:[], _OLD_NOTES:[], db:{},
    firebase:{ auth:()=>({ get currentUser(){ return cur; }, signOut:()=>{ count('signOut'); cur=null; return Promise.resolve(); } }) },
    window:{ addEventListener:(ev,f)=>listeners.push({ev,f}), removeEventListener:(ev,f)=>{ listeners=listeners.filter(l=>l.f!==f); }, _l428TryResume(){} },
    document:{ getElementById:id=>(els[id]=els[id]||{ style:{}, classList:{add(){},remove(){}}, textContent:'', value:'' }), querySelectorAll:()=>[] },
    localStorage:{ getItem:()=>null, setItem(){}, removeItem(){} }, sessionStorage:{ getItem:()=>null, setItem(){}, removeItem(){} },
    _machineProfileOf:eval('('+fnOf('_machineProfileOf')+')'), _l486Valid:eval('('+fnOf('_l486Valid')+')'), _l540Order:eval('('+fnOf('_l540Order')+')'), _l537ApplyRefs:eval('('+fnOf('_l537ApplyRefs')+')'), _l540RetryStop:eval('('+fnOf('_l540RetryStop')+')'), _l540RetryArm:eval('('+fnOf('_l540RetryArm')+')'),
    applyRole:()=>count('applyRole'), loadFirestoreData:()=>count('loadFirestoreData'), startBrouillons:()=>count('startBrouillons'), refreshAppCheckToken:()=>Promise.resolve(), loadMaintenance:()=>Promise.resolve() });
  const pend=[]; global._l537FetchRefs=ms=>{ count('fetch'); return new Promise(res=>pend.push(res)); };
  const env=new Proxy(global,{ has:()=>true, get:(t,k)=>{ if(k===Symbol.unscopables) return undefined; if(k in t) return t[k]; return function(){ count(String(k)); return Promise.resolve(); }; }, set:(t,k,v)=>{ t[k]=v; return true; } });
  const fn=new Function('env','with(env){ return ('+CB+'); }')(env);
  const tick=()=>new Promise(r=>setImmediate(r));
  return { calls, els, fn, setUser:u=>{ cur=u; }, resolve:async v=>{ const r=pend.shift(); if(v===true) _l537ApplyRefs(FIX.refs,'sim'); r(v); await tick(); await tick(); await tick(); }, tick };
}
const A={uid:'uid-test-admin',email:'a@test'}, B={uid:'uid-machine',email:'feba@step-international.com'}, X={uid:'uid-inconnu',email:'x@test'};
let w=world(); w.setUser(A); let p=w.fn(A); await w.tick();
ok(w.calls.fetch===1&&w.calls.applyRole===undefined&&w.els.loginErr.textContent.indexOf('Chargement du profil')>=0,'nominal : cache vide → lecture lancee, ecran de connexion : « Chargement du profil… »');
await w.resolve(true); await p;
ok(w.calls.applyRole===1&&currentRole==='admin'&&currentUser.ini==='AT'&&timers.filter(t=>t.ms===15000).length===0&&!w.calls.signOut,'nominal : profil applique une fois, aucun essai arme, pas de deconnexion');
w=world(); w.setUser(A); p=w.fn(A); await w.tick(); w.setUser(B); await w.fn(B);
ok(w.calls.applyRole===1&&currentUser.nom==='Poste FEBA'&&currentRole==='operateur','S9 : le poste feba@ se connecte pendant la lecture → resolu en synchrone (par email)');
await w.resolve(true); await p;
ok(w.calls.applyRole===1&&currentRole==='operateur'&&currentUser.nom==='Poste FEBA'&&!w.calls.signOut&&(w.calls.loadFirestoreData||0)===1,'S9 : la lecture tardive du compte A NE touche a rien (ni identite, ni role, ni rechargement des donnees)');
w=world(); w.setUser(X); p=w.fn(X); await w.tick(); w.setUser(B); await w.fn(B); await w.resolve(true); await p;
ok(!w.calls.signOut&&currentUser.nom==='Poste FEBA'&&w.calls.applyRole===1,'S7 : compte inconnu en attente, puis feba@ se connecte → l appel perime ne deconnecte PAS le poste');
w=world(); w.setUser(A); p=w.fn(A); await w.tick(); w.setUser(null); await w.fn(null); await w.resolve(true); await p;
ok(!w.calls.applyRole&&currentRole===null&&currentUser===null,'S14 : deconnexion pendant la lecture → l appel perime n ouvre pas l application');
w=world(); w.setUser(A); p=w.fn(A); await w.tick(); w.setUser(null); await w.fn(null); w.setUser(A); const p2=w.fn(A); await w.tick(); await w.resolve(true); await w.resolve(true); await p; await p2;
ok(w.calls.applyRole===1&&currentRole==='admin','S3bis : deconnexion puis reconnexion du MEME compte pendant la lecture → la branche profil ne s execute qu une fois');
w=world(); w.setUser(A); p=w.fn(A); await w.tick(); await w.resolve(false); await p;
ok(!w.calls.applyRole&&!w.calls.signOut&&currentRole===null&&/réseau/.test(w.els.loginErr.textContent)&&timers.filter(t=>t.ms===15000).length===1&&listeners.length===1,'lecture impossible (hors ligne / lent) → session conservee, message reseau, essai arme (15 s + online)');
w=world(); w.setUser(A); p=w.fn(A); await w.tick(); await w.resolve('denied'); await p;
ok(!w.calls.applyRole&&!w.calls.signOut&&/Accès refusé/.test(w.els.loginErr.textContent)&&timers.filter(t=>t.ms===15000).length===1,'refus serveur → session conservee, message « Accès refusé », essai arme');
w=world(); w.setUser(A); p=w.fn(A); await w.tick(); await w.resolve(false); await p; global.currentRole=null; listeners[0].f(); await w.tick();
ok(w.calls.fetch===2&&timers.filter(t=>t.ms===15000).length===0,'retour reseau → la resolution est rejouee (nouvelle lecture), l essai est desarme');
await w.resolve(true); await p; await w.tick();
ok(w.calls.applyRole===1&&currentRole==='admin','… et le profil s applique une fois');
w=world(); w.setUser(A); p=w.fn(A); await w.tick(); await w.resolve(false); await p; global.currentRole=null; (typeof _l540RetryOn==='function')&&_l540RetryOn(); await w.tick();
ok(w.calls.fetch===2&&timers.filter(t=>t.ms===15000).length===0,'meme compte retape (crochet de doLogin) → nouvelle resolution immediate, essai desarme');
w=world(); _l537ApplyRefs(FIX.refs,'cache'); w.setUser(X); p=w.fn(X); await w.tick(); await w.resolve(true); await p;
ok(w.calls.signOut===1&&!w.calls.applyRole,'table lue ET uid absent → deconnexion (comme en L539 pour un compte inconnu)');
w=world(); _l537ApplyRefs(FIX.refs,'cache'); w.setUser(X); p=w.fn(X); await w.tick(); await w.resolve('denied'); await p;
ok(!w.calls.signOut&&!w.calls.applyRole&&/Accès refusé/.test(w.els.loginErr.textContent)&&timers.filter(t=>t.ms===15000).length===1,'[L542 · audit 26/09] cache deja rempli d AUTRES profils + lecture REFUSEE par le serveur → session conservee, message « Accès refusé » (la chaine denied n est plus prise pour une table lue)');
w=world(); _l537ApplyRefs(FIX.refs,'cache'); w.setUser(X); p=w.fn(X); await w.tick(); await w.resolve(false); await p;
ok(!w.calls.signOut&&!w.calls.applyRole&&/réseau/.test(w.els.loginErr.textContent),'[L540 · garde] cache deja rempli d AUTRES profils + lecture non aboutie → session conservee, message reseau');
w=world(); w.setUser(B); await w.fn(B);
ok(w.calls.applyRole===1&&!w.calls.fetch&&currentUser.nom==='Poste FEBA','poste machine : jamais de lecture, jamais d attente');
console.warn=_warn; global.setTimeout=_st; global.clearTimeout=_ct;

console.log('── 3. _l537ApplyRefs applique les profils (ordre stable) et l abreviation (fixture) ──');
global.LEGRAND_PKG={}; global.REPORT_RECIPIENTS=[]; global._OLD_NOTES=[]; global._L537_REFS={suppliers:null}; global._l537Loaded=false; global.USER_PROFILES={};
global._l486Valid=eval('('+fnOf('_l486Valid')+')'); global._l540Order=eval('('+fnOf('_l540Order')+')');
const APPLY=eval('('+fnOf('_l537ApplyRefs')+')'); const BK=eval('('+fnOf('_l540Bk')+')');
ok(BK()==='Fourn.','avant chargement : abreviation neutre « Fourn. »');
const n=APPLY(FIX.refs,'test');
ok(n===5&&Object.keys(USER_PROFILES).length===4&&USER_PROFILES['uid-test-op1'].ini==='OP'&&BK()==='FT','document complet → 5 champs (dont profils et abreviation) ; profils de la fixture appliques');
ok(Object.keys(USER_PROFILES).join(',')==='uid-test-pilot,uid-test-op2,uid-test-admin,uid-test-op1','ordre d affichage = champ « ordre » de la fixture — different de l ordre des cles/uid ET de l ordre des initiales (discriminant)');
ok(Object.keys(_l540Order({a:{ini:'AA'},b:null,c:'x',d:['AA'],e:{ini:'EE'}})).join(',')==='a,e','entrees non-objet (null, chaine, tableau) ignorees a l affichage — aucun ecran ne peut planter dessus');
ok(Object.keys(_l540Order({b:{ini:'ZZ'},a:{ini:'AA'},c:{ini:'MM'}})).join(',')==='a,c,b','sans champ ordre → tri par initiales (deterministe quelle que soit la source)');
ok(Object.keys(_l540Order({b:{ini:'ZZ',ordre:1},a:{ini:'AA'}})).join(',')==='b,a'&&_l540Order(null)===null,'ordre explicite avant les autres ; entree invalide → rendue telle quelle (jamais d exception)');
ok(APPLY({profiles:[]},'test')===0&&Object.keys(USER_PROFILES).length===4,'profils malformes (tableau) → ignores, la table en memoire reste');
global._uid=()=>'uid-test-op1'; global._machineUids={'uid-machine':'FEBA'};
const HID=eval('('+fnOf('_shareHidden')+')'); global._shareHidden=HID; const OTH=eval('('+fnOf('_shareOtherUids')+')');
ok(HID('uid-test-admin')===true&&HID('uid-test-op2')===false&&HID('inconnu')===false,'_shareHidden : vrai pour un admin, faux sinon (jamais d exception)');
const others=OTH();
ok(others.indexOf('uid-test-admin')<0&&others.indexOf('uid-test-op1')<0&&others.indexOf('uid-test-op2')>=0&&others.indexOf('uid-machine')>=0,'liste de partage : sans moi, sans les admins, avec les autres operateurs et les postes machine');

console.log('── 4. harnais et fixture sans prenom reel ──');
const harn=fs.readFileSync(path.join(__dirname,'shot.mjs'),'utf8')+fs.readFileSync(path.join(__dirname,'sim200.mjs'),'utf8');
ok(!new RegExp(NOMS.map(b=>_d(b)).join('|')).test(harn),'shot.mjs et sim200.mjs : aucun prenom reel');
ok(FIX.refs.profiles&&Object.values(FIX.refs.profiles).every(p=>/test/i.test(p.nom)&&Number.isInteger(p.ordre))&&FIX.refs.suppliers.bkShort==='FT','fixture : profils (avec ordre) et abreviation fictifs');
try{ fs.rmSync(out,{recursive:true,force:true}); }catch(_){ }
console.log(fail?('\n💥 '+fail+' echec(s) sur '+total):('\n🏆 L540 OK : '+total+' verifications'));
process.exit(fail?1:0);
})().catch(e=>{ console.error('💥 exception dans la partie asynchrone :',e); try{ fs.rmSync(out,{recursive:true,force:true}); }catch(_){ } process.exit(1); });
