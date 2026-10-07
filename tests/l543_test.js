// l543_test.js — [L543 · 07/10/2026, suite de l audit d usage reel du 06/10] (1) registre des lames : numero canonique (« L-4 » = « 4 »),
// fenetre explicite a l envoi (plus de OK/Annuler natif valide par reflexe), jamais de pose d un numero deja MONTE sur une autre machine,
// auteur = initiales choisies ; (2) annees de livraison impossibles (0026, 20026…) corrigees ou signalees, et lues comme 2026 dans les
// indicateurs ; (3) plus aucun prenom de l equipe dans le fichier PUBLIE ; (4) trois defauts d affichage tablette. Valeurs sensibles ENCODEES.
const fs=require('fs'),path=require('path'),cp=require('child_process');
const ROOT=path.join(__dirname,'..'); const src=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
(async()=>{
console.log('── 1. registre des lames ──');
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
const CANON=eval('('+fnOf('_l543LameCanon')+')'); global._l543LameCanon=CANON;
ok(CANON('L-4')==='4'&&CANON('L4')==='4'&&CANON(' l 4 ')==='4'&&CANON('L–7')==='7'&&CANON('n° L-12')==='12'&&CANON('25')==='25'&&CANON('LX-3')==='LX-3'&&CANON(null)==='','numero canonique : « L-4 », « L4 », « l 4 » → « 4 » ; un autre texte est garde tel quel');
ok(!/placeholder="[^"]*ex : L-/.test(src),'plus aucun exemple « ex : L-… » dans les champs de lame (il faisait taper « L-4 »)');
global.document={ getElementById:id=>id==='fInitiales'?{value:' JF '}:null };
const WHO=eval('('+fnOf('_l543LameWho')+')');
global.currentUser={ini:'',nom:'Poste FEBA'}; ok(WHO()==='JF','compte machine : l auteur est l initiale CHOISIE (avant : vide sur 72 traces sur 90)');
global.currentUser={ini:'AT',nom:'Admin test'}; ok(WHO()==='AT','compte personnel : ses initiales');
global.document={ getElementById:()=>null }; global.currentUser={ini:'',nom:'Poste FEBA'}; ok(WHO()==='','aucune initiale choisie → vide (jamais d exception)');
const a=src.indexOf('function _l543LameCanon'), b=src.indexOf('function lameJeter'), REG=src.slice(src.lastIndexOf('async function lameInstall(',a)>0?Math.min(a,src.indexOf('async function lameInstall(')):a, b+4000);
ok(!/currentUser\?currentUser\.ini:/.test(src.slice(src.indexOf('async function lameInstall('),src.indexOf('async function lameInstall(')+3500))&&!/currentUser\?currentUser\.ini:/.test(fnOf('_lameEvent')),'ecritures du registre (pose, demontage, affutage, rebut) : plus de currentUser.ini — _l543LameWho()');
ok(/const num=String\(lameNum\|\|''\)\.trim\(\);/.test(fnOf('lameInstall'))&&/lameNum:String\(num\)\.trim\(\),/.test(fnOf('_lameEvent'))&&/const n=nrm\(num\);/.test(fnOf('_l514LameCheck')),'[2e passe] les numeros RELUS du registre (Monter, Envoyer a l affuteur, Recue…) ne sont jamais convertis : seule la SAISIE l est');
ok(/nrm\(num\)===nrm\(_l543LameCanon\(_lp\.prev\|\|''\)\)\) return;/.test(fnOf('lameDetectOnFiche')),'[2e passe] garde L440 : l ancienne lame « L35 » memorisee est comparee en chiffres (pas de re-pose par-dessus une pose toute fraiche)');
const DET=fnOf('lameDetectOnFiche');
ok(!/[^a-zA-Z_.]confirm\(/.test(DET)&&/await confirmDlg\(msg,\{ok:'Oui, j\\'ai posé la lame '\+num, cancel:\(cur\?'Non, garder la lame '/.test(DET),'envoi de fiche : fenetre de l appli avec deux boutons NOMMES (« Oui, j ai posé la lame N » / « Non, garder la lame X »), focus sur « garder » — plus de OK/Annuler natif');
// simulation de la detection a l envoi
const reg=[{type:'lame',categorie:'installation',machine:'maveg',lameNum:'4',dateInstall:'2026-10-05T13:01:00Z'},{type:'lame',categorie:'installation',machine:'feba',lameNum:'32',dateInstall:'2026-10-05T13:00:00Z'},{type:'lame',categorie:'installation',machine:'cevenini',lameNum:'25',dateInstall:'2026-10-05T13:01:00Z'}];
Object.assign(global,{ window:{}, maintLoaded:true, maintenanceCache:reg, LAME_MACHINES:['feba','maveg','cevenini'], getMachineLabel:m=>String(m).toUpperCase() });
global._activeLameIn=eval('('+fnOf('_activeLameIn')+')');
global.lameActiveForMachine=m=>_activeLameIn(reg,m);
global._l514LameCheck=eval('('+fnOf('_l514LameCheck')+')');
let toasts=[], dlg=[], installs=[], dlgAnswer=false;
global.showToast=(m,k)=>toasts.push([m,k]); global.confirmDlg=(m,o)=>{ dlg.push([m,o]); return Promise.resolve(dlgAnswer); }; global.lameInstall=(mk,n)=>{ installs.push([mk,n]); return Promise.resolve(true); };
global._l514LameMsg=()=>'msg'; global.loadMaintenance=()=>Promise.resolve();
const DETF=eval('('+DET+')');
await DETF('cevenini','L-4');
ok(dlg.length===1&&/connu sur MAVEG \(montée\) et JAMAIS sur CEVENINI/.test(dlg[0][0])&&dlg[0][1].cancel==='Non, garder la lame 25'&&!installs.length,'CEVENINI envoie une fiche « L-4 », la 4 est MONTÉE sur la MAVEG → la fenetre AVERTIT (regle « n° par machine » : ce peut etre une autre lame 4) ; « garder » ou tap a cote → rien n est pose (c est le reflexe OK qui avait mis la « L-4 » sur les 3 machines)');
dlg=[]; toasts=[]; await DETF('maveg','L-4');
ok(!dlg.length&&!installs.length&&!toasts.length,'MAVEG, fiche « L-4 », lame 4 montee → rien a demander (meme lame)');
reg.push({type:'lame',categorie:'rebut',machine:'feba',lameNum:'4',dateInstall:'2026-09-09T10:00:00Z'},{type:'lame',categorie:'installation',machine:'feba',lameNum:'L-4',dateInstall:'2026-10-01T09:53:00Z'},{type:'lame',categorie:'demonte',machine:'feba',lameNum:'L-4',dateInstall:'2026-10-05T13:00:00Z'});
toasts=[]; await DETF('feba','L-4');
ok(!dlg.length&&!installs.length&&toasts.length===1,'registre reel : la 4 de la FEBA est JETEE (09/09) → « L-4 » tape sur la FEBA est refuse comme en L542 (les anciennes traces « L-4 » du registre ne sont jamais converties)');
toasts=[];
await DETF('feba','12'); 
ok(dlg.length===1&&dlg[0][1].ok==="Oui, j'ai posé la lame 12"&&dlg[0][1].cancel==='Non, garder la lame 32'&&!installs.length,'FEBA, lame 12 inconnue → la question est posee avec deux boutons nommes ; « garder » (ou tap a cote) → rien n est enregistre');
dlg=[]; dlgAnswer=true; await DETF('feba','L-12');
ok(dlg.length===1&&installs.length===1&&installs[0][0]==='feba'&&installs[0][1]==='12','« Oui, j ai posé » → pose enregistree avec le numero canonique « 12 »');

console.log('── 2. annees de livraison ──');
const FY=eval('('+fnOf('_l543FixYear')+')'); global._l543FixYear=FY; const FI=eval('('+fnOf('_l543FixIsoDate')+')');
ok(FI('0026-10-19')==='2026-10-19'&&FI('20026-10-19')==='2026-10-19'&&FI('72026-01-05')==='2026-01-05'&&FI('2026-10-19')==='2026-10-19','0026 / 20026 / 72026 → 2026 ; une date normale est inchangee');
ok(FI('0920-10-19')==='0920-10-19'&&FI('2062-10-19')==='2062-10-19'&&FI('')===''&&FI('—')==='—','annee ambigue (0920, 2062) : laissee telle quelle (et signalee a l ecran), jamais devinee');
ok(/document\.addEventListener\('focusout',function\(e\)\{ try\{ var t=e\.target; if\(!t\|\|t\.type!=='date'/.test(src)&&/Année corrigée : /.test(src)&&/improbable — vérifie la date/.test(src),'a la sortie d un champ date : correction visible (toast) ou alerte — pas a chaque chiffre tape');
ok(/const dateLivRaw=_l543FixIsoDate\(/.test(src)&&/dateLiv:_l543FixIsoDate\(document\.getElementById\('planDateLiv'\)/.test(src)&&/if\(field==='dateLiv'\) value=_l543FixIsoDate\(value\);/.test(fnOf('cliEdit')),'enregistrement : fiche envoyee, plan enregistre et clients additionnels passent par la correction');
const KPI=src.slice(src.indexOf('const _pDate=v=>'),src.indexOf('const _pDate=v=>')+900);
ok(/v=_l543FixIsoDate\(v\);/.test(KPI)&&/_l543FixYear\(_f\[3\]\)/.test(KPI),'indicateurs : les 14 fiches deja enregistrees en 0026/20026 sont lues comme 2026 (ponctualite juste sans reecrire la base)');

console.log('── 3. prenoms : plus rien dans le fichier PUBLIE ──');
const out=path.join(require('os').tmpdir(),'l543_site_'+process.pid); cp.execFileSync(process.execPath,[path.join(__dirname,'build_public.mjs'),'--out',out],{stdio:'pipe'});
const pub=fs.readFileSync(path.join(out,'index.html'),'utf8');
const NOMS=['RXN0ZWJhbg==','RG9taW5pcXVl','Q8OpbGluZQ==','Q2VsaW5l','Q2hyaXN0aWFu','VGHDr2Vi','Sm9yZGFu','TWF0aGlldQ=='].map(b=>Buffer.from(b,'base64').toString('utf8'));
const trouves=NOMS.map(n=>(pub.match(new RegExp(n,'gi'))||[]).length);
ok(trouves.every(x=>x===0),'fichier publie construit : 0 prenom de l equipe (avant : 53 + 11 + 3 dans des messages et des commentaires HTML) → '+trouves.join('/'));
const PN=eval('('+fnOf('_l543PilotNom')+')');
global.USER_PROFILES={a:{role:'admin',nom:'Admin test',ini:'AT'},p:{role:'pilotage',nom:'Pilotage test',ini:'PT'}}; ok(PN()==='PILOTAGE TEST','note « PERTE … VOIR … » : le prenom vient du referentiel (meme texte a l ecran qu avant)');
global.USER_PROFILES={}; ok(PN()==='LE PILOTAGE','… et « LE PILOTAGE » si les profils ne sont pas charges');
try{ fs.rmSync(out,{recursive:true,force:true}); }catch(_){ }

console.log('── 4. affichage tablette ──');
ok(/\.btn:not\(\.btn-ghost\):not\(\.btn-green\)[^{]*:not\(\.val-todo\)\{/.test(src)&&/\.rb-op-validate\.val-todo\{background:linear-gradient\(#ffc21a,#f5b301\)/.test(src),'VALIDER LA PRÉPARATION redevient JAUNE (prochaine action) : la regle grise ne l ecrase plus');
ok(/\.nc-check input,\.test2-sub input,\.test2-nc input\{display:inline-block;position:absolute;opacity:0/.test(src),'« Test NC » : plus de rectangle vide par-dessus la pastille');
ok(/\.chg-section input\[type=checkbox\]\{-webkit-appearance:auto;appearance:auto;padding:0\}/.test(src),'Changements (lame / machine / 2e operateur) : la coche est visible');
console.log(fail?('\n💥 '+fail+' echec(s) sur '+total):('\n🏆 L543 OK : '+total+' verifications'));
process.exit(fail?1:0);
})().catch(e=>{ console.error('💥 exception :',e); process.exit(1); });
