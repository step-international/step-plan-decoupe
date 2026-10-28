// reglages_l556_test.js — [L556 · demande Celine 23/10/2026, etape 1] photo de l ecran de reglages MAVEG attachee a la commande :
// bloc « 📷 Réglages » (paysage + machine courante MAVEG + commande ouverte, jamais en vue miroir), camera arriere, PHOTO SEULE (pas de
// n° de recette : etape 2), envoi borne 10 s, compteur _photoUploadsPending DES L APPUI (compression comprise), photo rattachee a la SEULE
// commande de l appui, rangee dans commandeFiles (regl:true), JAMAIS sur le papier (filtre + bloc no-print EXECUTES sur le vrai gabarit),
// rappel facultatif orange a la cloture, solde manque-matiere sans ces photos. Donnees FICTIVES, aucun appel reseau.
// Fonctions VRAIES extraites de index.html, executees sur un faux DOM. Contre-lecture 23/10 (3 angles) : les mutations « photo imprimee »,
// « no-print hors @media print », « bloc sur FEBA », « borne 10 min », « compression hors compteur », « photo dans la commande suivante »
// sont ROUGES ici.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const shot=fs.readFileSync(path.join(__dirname,'shot.mjs'),'utf8');
const bat=fs.readFileSync(path.join(__dirname,'battery.sh'),'utf8');
const ci=fs.readFileSync(path.join(__dirname,'..','.github','workflows','static.yml'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)return src.slice(i,j+1);}}throw new Error('non fermee '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
global.window=global;

ok(/const APP_VERSION='\d{4}\.\d\d\.\d\d-L(55[6-9]|5[6-9]\d|[6-9]\d\d|\d{4,})';/.test(src),'APP_VERSION >= L556');

console.log('── 1. reconnaitre une photo de reglages (EXECUTE) ──');
const EST=eval('('+fnOf('_l556EstRegl')+')'); global._l556EstRegl=EST;
ok(EST({name:'Réglages MAVEG 1',type:'image'})===true&&EST({regl:true,name:'autre'})===true,'regl:true ou nom « Réglages MAVEG N » → photo de reglages');
ok(EST({name:'Étiquette 1',type:'image'})===false&&EST({name:'Commande.pdf',type:'pdf'})===false&&EST(null)===false&&EST({})===false,'etiquette, PDF, vide, null → non');

(async()=>{
  console.log('── 2. chemin de stockage : prefixe REGL_ dans le dossier commande/ deja autorise (EXECUTE sur la vraie fonction) ──');
  { global.storage={ref:(p)=>({put:async()=>{},getDownloadURL:async()=>'url:'+p})}; const UP=eval('('+fnOf('uploadCommandeFile')+')');
    const u1=await UP({},'jpg','image/jpeg','REGL'); const u2=await UP({},'jpg','image/jpeg');
    ok(/^url:commande\/REGL_\d+_\d+\.jpg$/.test(u1),'photo de reglages → commande/REGL_<ts>_<alea>.jpg (meme dossier que les etiquettes : aucune regle Storage a publier)');
    ok(/^url:commande\/CMD_\d+_\d+\.jpg$/.test(u2),'sans prefixe → commande/CMD_… (comportement historique inchange pour etiquettes et fichiers client)'); }

  console.log('── 3. visibilite : paysage + machine courante MAVEG + commande ouverte, jamais en miroir (EXECUTE sur un faux DOM) ──');
  const mk=()=>({style:{},textContent:'',innerHTML:'',value:'',insertAdjacentHTML(){} });
  const dom={reglPhotoField:mk(),reglPhotoZone:mk()};
  global.document={getElementById:id=>dom[id]||null};
  global._isLandscapeFiche=()=>true; global._l555MachineCourante=()=>'maveg'; global.ficheLines=[{id:'a'}]; global.commandeFiles=[]; global.esc=s=>String(s==null?'':s); global._viewingSharedId=null;
  ['_l556Actif','_l556Sync','refreshReglPhotoZone','_l556Upload','_l556OnPhoto'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
  _l556Sync(); ok(dom.reglPhotoField.style.display==='','paysage + MAVEG + commande ouverte → bloc visible');
  global._isLandscapeFiche=()=>false; _l556Sync(); ok(dom.reglPhotoField.style.display==='none','PORTRAIT → bloc absent (regle 3 : portrait intact)'); global._isLandscapeFiche=()=>true;
  global._l555MachineCourante=()=>'cevenini'; _l556Sync(); const cev=dom.reglPhotoField.style.display;
  global._l555MachineCourante=()=>'feba'; _l556Sync(); ok(cev==='none'&&dom.reglPhotoField.style.display==='none','machine courante CEVENINI ou FEBA → bloc absent (MAVEG seulement, decision Celine)'); global._l555MachineCourante=()=>'maveg';
  global.ficheLines=[]; _l556Sync(); ok(dom.reglPhotoField.style.display==='none','aucune bobine (pas de commande ouverte) → bloc absent'); global.ficheLines=[{id:'a'}];
  global._viewingSharedId='s1'; _l556Sync(); ok(dom.reglPhotoField.style.display==='none','vue MIROIR (recepteur d un partage) → bloc absent : sa photo serait ecrasee a la revision suivante'); global._viewingSharedId=null;
  _l556Sync(); ok(dom.reglPhotoField.style.display==='','retour aux conditions normales → bloc revenu');

  console.log('── 4. vignettes (EXECUTE) ──');
  global.commandeFiles=[{url:'u1',type:'image',name:'Étiquette 1'},{url:'u2',type:'image',name:'Réglages MAVEG 1',regl:true,by:'MT'},{url:'u3',type:'image',name:'Réglages MAVEG 2',regl:true}];
  refreshReglPhotoZone(); const Z=dom.reglPhotoZone.innerHTML;
  ok((Z.match(/<img /g)||[]).length===2&&/openCommandeFileViewer\(1\)/.test(Z)&&/openCommandeFileViewer\(2\)/.test(Z)&&!/u1/.test(Z),'seules les photos de reglages sont affichees, avec le bon index pour agrandir / supprimer (l etiquette n y est pas)');
  ok(/deleteCommandeFile\(1\)/.test(Z)&&/deleteCommandeFile\(2\)/.test(Z)&&!/recette/.test(Z),'✕ pour supprimer (confirmation existante) ; plus de badge « n° de recette »');

  console.log('── 5. envoi BORNE (EXECUTE : faux upload) ──');
  let deleted=[]; global.deletePhotoFromStorage=async(u)=>{ deleted.push(u); };
  window._l556UploadMs=40; global.uploadCommandeFile=()=>new Promise(()=>{});
  { let err=null; try{ await _l556Upload({}); }catch(e){ err=e; } ok(err&&/délai réseau dépassé \(10 s\)/.test(err.message),'upload qui ne repond pas → rejet « délai réseau dépassé (10 s) »'); }
  { deleted=[]; global.uploadCommandeFile=()=>new Promise(r=>setTimeout(()=>r('url-tardive'),90)); let err=null; try{ await _l556Upload({}); }catch(e){ err=e; } await sleep(120);
    ok(err&&deleted.indexOf('url-tardive')>=0,'upload qui aboutit APRES la borne → rejet, puis le fichier arrive en retard est EFFACE de Storage (pas d orphelin)'); }
  { global.uploadCommandeFile=async()=>'ok-url'; const u=await _l556Upload({}); ok(u==='ok-url','upload qui aboutit dans le delai : URL rendue'); }
  ok(/window\._l556UploadMs\|\|10000/.test(fnOf('_l556Upload')),'borne par defaut : 10 000 ms (mutation « 10 min » → rouge)');

  console.log('── 6. gestionnaire photo (EXECUTE : faux fichier, fausse compression, faux Storage) ──');
  const toasts=[]; global.showToast=(m,k)=>toasts.push((k||'')+':'+m); global.trainingGuard=()=>false; global.storage={}; global.isoNow=()=>'2026-10-23T10:00:00.000Z'; global._l543LameWho=()=>'MT'; global.refreshCommandePhotoZone=()=>{}; global._sendingFiche=false; global._viewingSharedId=null;
  const _warn=console.warn; console.warn=()=>{};
  let compressCalls=0; global.compressImageBlob=async()=>{ compressCalls++; await sleep(30); return {blob:1}; }; global.uploadCommandeFile=async()=>'url-1';
  global._photoUploadsPending=0; global.commandeFiles=[]; global.ficheLines=[{id:'a'}]; deleted=[];
  { const arr=global.commandeFiles; const p=_l556OnPhoto({name:'x.jpg'}); const pendant=global._photoUploadsPending; const res=await p;
    ok(pendant===1,'compteur _photoUploadsPending a 1 DES L APPUI, pendant la compression (CONFIRMER et l arret manque-matiere attendent — mutation « compteur dans l upload seulement » → rouge)');
    ok(res==='ok'&&arr.length===1&&arr[0].regl===true&&arr[0].name==='Réglages MAVEG 1'&&arr[0].by==='MT'&&arr[0].at==='2026-10-23T10:00:00.000Z'&&arr[0].url==='url-1'&&arr[0].type==='image'&&!('recette' in arr[0]),'photo rangee DANS la fiche (commandeFiles) : nom, regl:true, initiales, date, URL ; pas de recette');
    ok(global._photoUploadsPending===0&&/^ok:📷 Réglages MAVEG enregistrés/.test(toasts[toasts.length-1]),'compteur rendu a 0, toast vert');
    const res2=await _l556OnPhoto({}); ok(res2==='ok'&&arr.length===2&&arr[1].name==='Réglages MAVEG 2','2e photo → « Réglages MAVEG 2 »'); }
  { const avant=global.commandeFiles; deleted=[]; toasts.length=0; const p=_l556OnPhoto({}); setTimeout(()=>{ global.commandeFiles=[]; },5); const res=await p; const apres=global.commandeFiles;
    ok(res==='commande-changee'&&apres.length===0&&avant.length===2&&deleted.indexOf('url-1')>=0&&/^err:⚠ La commande a changé/.test(toasts[toasts.length-1])&&global._photoUploadsPending===0,'resetAll / chargement pendant l envoi → RIEN de rattache (ni a l ancienne ni a la nouvelle commande), fichier efface, toast rouge, compteur a 0 : la photo ne peut plus atterrir dans la commande suivante'); }
  { toasts.length=0; deleted=[]; const arr=global.commandeFiles; const p=_l556OnPhoto({}); setTimeout(()=>{ global.ficheLines=[]; },5); const res=await p;
    ok(res==='commande-changee'&&arr.length===0&&deleted.length===1,'plus aucune bobine a l arrivee de la photo → refusee aussi'); global.ficheLines=[{id:'a'}]; }
  { compressCalls=0; toasts.length=0; global.trainingGuard=()=>true; const r1=await _l556OnPhoto({}); global.trainingGuard=()=>false;
    global.storage=null; const r2=await _l556OnPhoto({}); global.storage={};
    global._viewingSharedId='s1'; const r3=await _l556OnPhoto({}); global._viewingSharedId=null;
    global._sendingFiche=true; const r4=await _l556OnPhoto({}); global._sendingFiche=false;
    const r5=await _l556OnPhoto(null);
    ok(r1==='entrainement'&&r2==='stockage'&&r3==='miroir'&&r4==='envoi'&&r5==='vide'&&compressCalls===0&&global.commandeFiles.length===0&&global._photoUploadsPending===0,'entrainement / sans Storage / vue miroir / fiche en cours d envoi / pas de fichier → refus AVANT toute compression, rien d ajoute, compteur intact');
    ok(toasts.some(t=>/🎓/.test(t))&&toasts.some(t=>/stockage indisponible/.test(t))&&toasts.some(t=>/Vue miroir/.test(t))&&toasts.some(t=>/Envoi de la fiche en cours/.test(t)),'chaque refus a son message a l operateur'); }
  { toasts.length=0; global.compressImageBlob=async()=>{ throw {type:'error'}; }; const r=await _l556OnPhoto({});
    ok(r==='echec'&&/photo illisible ou réseau/.test(toasts[toasts.length-1])&&global._photoUploadsPending===0&&global.commandeFiles.length===0,'photo illisible (format refuse par le navigateur) → toast rouge honnete, rien d ajoute, compteur a 0'); }
  { toasts.length=0; global.compressImageBlob=async()=>({}); global.uploadCommandeFile=()=>new Promise(()=>{}); const r=await _l556OnPhoto({});
    ok(r==='echec'&&/délai réseau dépassé/.test(toasts[toasts.length-1])&&global._photoUploadsPending===0,'envoi qui ne repond pas → toast « délai réseau dépassé », compteur a 0 (pas de sablier infini)'); }
  console.warn=_warn;

  console.log('── 7. forme : cablage, sans Storage, compression ──');
  ok(/^document\.getElementById\('reglPhotoInput'\)\.addEventListener\('change',function\(\)\{ const file=\(this\.files\|\|\[\]\)\[0\]; this\.value=''; _l556OnPhoto\(file\); \}\);/m.test(src),'l input camera appelle le gestionnaire nomme (une photo par appui, champ vide apres)');
  const H=fnOf('_l556OnPhoto');
  ok(/^async function _l556OnPhoto\(file\)\{[^\n]*\n  if\(trainingGuard\(\)\)\{/.test(H),'mode entrainement : premiere garde');
  ok(/if\(!storage\)\{ showToast\('⚠ Photo NON enregistrée : stockage indisponible/.test(H)&&!/compressImage\(file/.test(H),'sans Storage : refus honnete (pas de repli data-URL : il serait supprime a l envoi par _ficheStripHeavyPhotos)');
  ok(/compressImageBlob\(file,1400,0\.7\)/.test(H)&&/const url=await _l556Upload\(blob\);/.test(H),'photo compressee comme les etiquettes (1400 px, chiffres lisibles) et envoyee par l envoi borne');

  console.log('── 8. PAPIER / ECRAN : le VRAI gabarit de la fiche (EXECUTE) ──');
  const P=fnOf('buildFichePrintHTML');
  { global.esc=s=>String(s==null?'':s); global._l471FicheM2=()=>0; global._l513MatiereOf=()=>({ok:false}); global._l513M2=v=>(v==null?'—':String(v)); global.parseNum=v=>Number(v)||0; global.fmt=v=>String(v); global.ficheBLs=()=>[]; global.safeUrl=u=>u; global.getMachineLabel=m=>m; global.cliPrintChip=()=>'';
    const mM=src.match(/^const _L553_PAPIER=(\{[\s\S]*?\n\});/m); global._L553_PAPIER=eval('('+mM[1]+')'); global._l553PalettePapier=eval('('+fnOf('_l553PalettePapier')+')');
    global.readCommandeFiles=eval('('+fnOf('readCommandeFiles')+')');
    const BUILD=eval('('+P+')');
    const base={f:{name:'Test L556',client:'Client',date:'2026-10-23T10:00:00Z',totalBobines:1,ini:'MT',ref:'KX1006-1',machine:'MAVEG',mother:1260,useful:1200,blade:1,longueur:1000,lame:'12',numJour:'1',tempsStr:'0 h 10',valide:true,rows:[{qty:2,width:100}],ficheDetail:[],
      commandeFiles:[{url:'https://exemple.test/commande/REGL_1.jpg',type:'image',name:'Réglages MAVEG 1',regl:true,by:'MT'},{url:'https://exemple.test/commande/CMD_1.jpg',type:'image',name:'Étiquette 1'}]},
      ecartBanner:'',partageBanner:'',op2Line:'',machLbl:'MAVEG',machCol:'#2fb85f',pkgLine:'',notesLine:'',planRows:'',horsPlanRows:'',shareCol:false,cliBanner:''};
    let html=''; try{ html=BUILD(base); }catch(e){ html='ERREUR '+(e&&e.message); }
    const iNP=html.indexOf('<div class="card no-print">'), iCli=html.indexOf('Fichiers de la commande client');
    const np=iNP>=0?html.slice(iNP,html.indexOf('</div></div>',iNP)+12):'';
    const cli=iCli>=0?html.slice(iCli,html.indexOf('</div>',html.indexOf('<img',iCli))):'';
    ok(html.indexOf('ERREUR')!==0&&iNP>=0&&iCli>=0,'le vrai gabarit se genere avec une photo de reglages + une etiquette (bloc no-print ET carte client presents)'+(html.indexOf('ERREUR')===0?(' → '+html):''));
    ok(np.indexOf('REGL_1.jpg')>=0&&np.indexOf('>MT<')>=0&&np.indexOf('CMD_1.jpg')<0&&/max-width:480px/.test(np),'bloc no-print : la photo de reglages (bornee a 480 px) et les initiales ; PAS l etiquette');
    ok(cli.indexOf('CMD_1.jpg')>=0&&cli.indexOf('REGL_1.jpg')<0,'carte « Fichiers de la commande client » : l etiquette ; PAS la photo de reglages (mutation « photo imprimee » → rouge)');
    const sansNP=html.slice(0,iNP)+html.slice(html.indexOf('</div></div>',iNP)+12);
    ok(sansNP.indexOf('REGL_1.jpg')<0&&sansNP.indexOf('CMD_1.jpg')>=0,'ce que montre l impression / le PDF (bloc no-print retire) : plus de photo de reglages, l etiquette toujours la');
    const seule=Object.assign({},base,{f:Object.assign({},base.f,{commandeFiles:[base.f.commandeFiles[0]]})}); let h2=''; try{ h2=BUILD(seule); }catch(e){ h2='ERREUR'; }
    ok(h2.indexOf('ERREUR')!==0&&h2.indexOf('Fichiers de la commande client')<0&&h2.indexOf('<div class="card no-print">')>=0,'photo de reglages SEULE : pas de carte client vide, juste le bloc ecran');
    ok(/@media print\{body\{padding:12px\}button\{display:none\}html\{filter:grayscale\(1\)!important;-webkit-print-color-adjust:exact;print-color-adjust:exact\}\}@media print\{\.no-print\{display:none!important\}\}/.test(html),'.no-print DANS un @media print, juste apres la regle niveaux de gris de L553 restee byte-identique (mutation « hors @media print » → rouge)');
    ok(/📷 Réglages MAVEG — écran machine \(à l’écran seulement, jamais imprimé\)/.test(np),'titre du bloc ecran : « à l’écran seulement, jamais imprimé »'); }
  ok(/const cfAll=readCommandeFiles\(f\); const regl=cfAll\.filter\(_l556EstRegl\); const cf=cfAll\.filter\(function\(x\)\{ return !_l556EstRegl\(x\); \}\);/.test(P)&&/if\(!cf\.length&&!regl\.length\) return '';/.test(P),'forme : filtre du papier en tete du bloc fichiers');

  console.log('── 9. cloture, solde, cablage, HTML, CSS ──');
  ok(/const _reglCount=\(commandeFiles\|\|\[\]\)\.filter\(_l556EstRegl\)\.length, _reglMaveg=\(typeof _l556Actif==='function'&&_l556Actif\(\)\);/.test(fnOf('confirmCommandeRecap'))&&/regl:_reglCount,reglMaveg:_reglMaveg/.test(fnOf('confirmCommandeRecap')),'cloture : comptage des photos de reglages, transmis au volet');
  const V=fnOf('_openVictory');
  ok(/p\.reglMaveg&&!p\.regl\?'<div style="margin:0 0 10px;padding:10px 12px;border:2px solid #92400e/.test(V)&&/📷 Photo des réglages MAVEG \? <span/.test(V)&&/Facultatif/.test(V),'volet de cloture : encadre ORANGE facultatif, seulement sur MAVEG en paysage sans photo de reglages');
  ok(/bouton « 📷 Réglages » dans la barre du bas, à gauche d’IMPRIMER/.test(V)&&!/📷＋ « Réglages/.test(V),'le rappel nomme le BON bouton (« 📷 Réglages », pas le 📷＋ des etiquettes : une photo d ecran rangee en etiquette serait IMPRIMEE)');
  ok(/st\.plan\.commandeFiles=st\.plan\.commandeFiles\.filter\(function\(f\)\{ return !_l556EstRegl\(f\); \}\)/.test(fnOf('stopManqueMatiere')),'solde manque-matiere : le brouillon du solde repart SANS les photos de reglages de la partie coupee (la fiche archivee les garde ; rappel orange actif au solde)');
  ok(/try\{ _l556Sync\(\); \}catch\(_\)\{ \}/.test(fnOf('renderFicheHeadPills')),'le bloc suit la machine courante (renderFicheHeadPills, comme la carte Entretien)');
  ok(/try\{ if\(typeof _l556Sync==='function'\) _l556Sync\(\); \}catch\(_\)\{\}   \/\* \[L556\] paysage seulement \*\//.test(src),'le bloc suit l orientation (meme ecouteur que le deplacement du bloc photos)');
  ok(/try\{ refreshReglPhotoZone\(\); \}catch\(e\)\{\}   \/\* \[L556\] la vignette reglages aussi \*\//.test(fnOf('deleteCommandeFile')),'supprimer une photo rafraichit la zone reglages');
  ok(/<input type="file" id="reglPhotoInput" accept="image\/\*" capture="environment" style="display:none">/.test(src)&&!/id="reglPhotoInput"[^>]*multiple/.test(src),'camera arriere directe, une photo par appui');
  ok(/<div id="reglPhotoField" style="display:none;margin-top:10px">/.test(src)&&!/reglRecette/.test(src)&&/aria-label="Photographier l’écran de réglages de la MAVEG">📷 Réglages<\/button>/.test(src),'HTML : bloc cache par defaut, AUCUN champ n° de recette (etape 1 = photo seule, decision Celine), bouton « 📷 Réglages »');
  { const iE=src.indexOf('id="etiqPhotoField"'), iR=src.indexOf('id="reglPhotoField"'); ok(iE>0&&iR>iE&&iR<src.indexOf('</div>\n  </div>',iE)+20,'le bloc reglages vit DANS le bloc photos etiquettes : il voyage avec lui (barre d action en paysage)'); }
  ok(/@media\(min-width:1100px\)\{#barExtras #etiqPhotoField\{display:flex;align-items:center;gap:8px\} #barExtras #reglPhotoField\{margin:0!important\} #reglPhotoZone:has\(img\)~button\{border-color:var\(--green\)!important;color:var\(--green\)!important\}\}/.test(src)&&(src.match(/#reglPhotoZone:has\(img\)~button/g)||[]).length===1,'CSS paysage : bloc reglages sur la MEME rangee que le 📷＋ des etiquettes (barre d action sur une ligne), bouton vert avec photo — regle scopee ≥ 1100 px');
  ok(/@media\(max-width:1099px\)\{#reglPhotoField\{display:none!important\}\}/.test(src),'ceinture CSS de la regle 3 : jamais en portrait, meme sans JavaScript');

  console.log('── 10. preuve navigateur : smoke « fiche-reglages » dans la batterie et la CI ──');
  ok(/'fiche-reglages': `/.test(shot)&&/reglPhotoField/.test(shot)&&/document\.elementFromPoint/.test(shot)&&/sameRow/.test(shot)&&/barH/.test(shot)&&/sansRecette/.test(shot)&&/_l556EstRegl\(\{name:'Réglages MAVEG 1'\}\)/.test(shot),'scene : bloc visible au doigt sur MAVEG, meme rangee que les etiquettes, hauteur de la barre, pas de champ recette, camera arriere, cache sur CEVENINI, revient');
  ok(/'fiche-reglages': "\(function\(\)\{ const s=window\.__l556/.test(shot)&&/\/Réglages\/\.test\(s\.maveg\.btn\)\|\|s\.maveg\.btn===s\.maveg\.etiqBtn\|\|!s\.maveg\.inBar\|\|!s\.maveg\.sansRecette\)/.test(shot)&&/s\.maveg\.barH<=80/.test(shot),'CHECK : chaine = echec explicite ; bouton « 📷 Réglages » distinct du 📷＋, dans la barre, une seule rangee (≤ 80 px)');
  ok(/for s in plan fiche fiche-start fiche-cut fiche-dechet fiche-entretien fiche-reglages[a-z -]*donnees analyse; do/.test(bat)&&/for s in plan fiche fiche-start fiche-cut fiche-dechet fiche-entretien fiche-reglages[a-z -]*donnees analyse; do/.test(ci)&&/Smokes \(\d+ scenes/.test(ci),'la batterie ET la CI GitHub rejouent la scene (9 scenes ou plus)');
  console.log(fail?('💥 '+fail+'/'+total+' ECHEC(S) REGLAGES L556'):('🏆 REGLAGES L556 OK : '+total+' verifications')); process.exit(fail?1:0);
})().catch(e=>{ console.log('💥 harnais : '+(e&&e.stack||e)); process.exit(1); });
