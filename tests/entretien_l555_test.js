// entretien_l555_test.js — [L555 · demande Celine 14/10/2026, lots 1+2] boutons Graissage (MAVEG), Antirouille (CEVENINI), Mandrin change (les deux)
// dans « 🔧 Changements » ; 1 appui = 1 evenement {type:'entretien'} dans le registre `maintenance` ; stats Analyse par annee ; derniers appuis sur
// Donnees > Lame. Ecrit comme L554 (14/10), corrige par deux contre-lectures (14/10) puis renumerote L555 (22/10, apres le lot Dechet L554).
// Fonctions PURES et harnais de COMPORTEMENT (faux db / faux DOM / ecriture en attente) : rien n est ecrit nulle part.
process.env.TZ='Europe/Paris';   /* cles de jour / d annee en heure LOCALE : fixe pour que le cas de minuit soit reproductible */
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
const shot=fs.readFileSync(require('path').join(__dirname,'shot.mjs'),'utf8');
const bat=fs.readFileSync(require('path').join(__dirname,'battery.sh'),'utf8');
const ci=fs.readFileSync(require('path').join(__dirname,'..','.github','workflows','static.yml'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const cst=n=>{ const m=src.match(new RegExp('^const '+n+'=(.+);(?:\\s*/\\*.*)?$','m')); if(!m) throw new Error('introuvable '+n); return eval('('+m[1]+')'); };
global.window=global;
global.L555_CATS=cst('L555_CATS'); global.L555_LABEL=cst('L555_LABEL'); global.L555_UNDO_MS=cst('L555_UNDO_MS'); global.L555_BTN=cst('L555_BTN'); global.L555_ERR_HTML=cst('L555_ERR_HTML');
['_l555CatsFor','_l555Vivants','_l555DejaFait','_l555DayKey','_l555UndoRefus','_l555Agg','_l555Heure','_l555DateCourte','_l555Tronque','_l555ResetCarte','_l555Lock','_l555MachineCourante','_l555EntretienSync','_l555OpenAttr','_l555OpenMemo','_l555DerniersHTML','_l555LameRender','_l555EntretienInner','_l555RenderEntretien','_l555ErreurRegistre','_l555Entretien','_l555EntretienUndo'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
const mk=v=>({style:{},textContent:'',innerHTML:'',dataset:{},value:v||'',disabled:false,classList:{_s:new Set(),add(c){this._s.add(c)},remove(c){this._s.delete(c)},contains(c){return this._s.has(c)}}});

console.log('── 1. quelles machines, quels boutons (decisions 1f / 2b : rien sur FEBA) ──');
ok(JSON.stringify(_l555CatsFor('maveg'))==='["graissage","mandrin"]'&&JSON.stringify(_l555CatsFor('cevenini'))==='["antirouille","mandrin"]','MAVEG : graissage + mandrin ; CEVENINI : antirouille + mandrin');
ok(_l555CatsFor('feba').length===0&&_l555CatsFor('').length===0&&_l555CatsFor(undefined).length===0,'FEBA, machine vide ou inconnue : aucun bouton');

console.log('── 2. « deja fait aujourd hui » (decision 1c) et cles de jour en heure LOCALE ──');
const E=(cat,mk2,iso,extra)=>Object.assign({type:'entretien',categorie:cat,machine:mk2,date:iso,deleted:false},extra||{});
const cache=[E('graissage','maveg','2026-10-14T08:10:00.000Z'),E('graissage','maveg','2026-10-13T16:00:00.000Z'),E('mandrin','cevenini','2026-10-14T09:00:00.000Z'),E('graissage','maveg','2026-10-14T06:00:00.000Z',{annule:true}),{type:'lame',categorie:'installation',machine:'maveg',date:'2026-10-14T09:30:00.000Z',deleted:false,lameNum:'12'},E('antirouille','cevenini','2026-10-02T10:00:00.000Z'),E('mandrin','maveg','2026-09-30T10:00:00.000Z',{deleted:true})];
const dk=_l555DayKey('2026-10-14T08:10:00.000Z');
ok(_l555DejaFait(cache,'maveg','graissage',dk)&&_l555DejaFait(cache,'maveg','graissage',dk).date==='2026-10-14T08:10:00.000Z','graissage MAVEG deja fait le 14/10 → l appui de 08:10 est retrouve (pas celui de 06:00, annule)');
ok(_l555DejaFait(cache,'cevenini','antirouille',dk)===null&&_l555DejaFait(cache,'MAVEG','graissage',dk)!==null,'antirouille CEV : rien ce jour-la ; machine comparee sans casse');
const off=-new Date('2026-12-31T23:30:00Z').getTimezoneOffset();
ok(off===60,'horloge du test en heure de Paris (TZ) — sinon le cas de minuit ne prouve rien');
ok(_l555DayKey('2026-12-31T23:30:00.000Z')==='2027-01-01'&&_l555DayKey('2026-12-31T22:30:00.000Z')==='2026-12-31','cle de jour en heure LOCALE : 23 h 30 UTC le 31/12 = 1er janvier a Paris (un decoupage UTC se tromperait d annee)');
ok(_l555Agg([E('graissage','maveg','2026-12-31T23:30:00.000Z')],'2027').totaux.maveg.graissage===1&&_l555Agg([E('graissage','maveg','2026-12-31T23:30:00.000Z')],'2026').totaux.maveg.graissage===0,'un graissage a 00 h 30 le 1er janvier compte dans la nouvelle annee');

console.log('── 3. annulation : l auteur, moins de 2 h (decision 1d) ──');
const last={id:'x',mk:'maveg',cat:'graissage',by:'JF',at:1000000};
ok(_l555UndoRefus(last,'JF',1000000+3599000)===''&&_l555UndoRefus(last,'jf ',1000000+10)==='','le meme operateur annule pendant 2 h (initiales comparees sans casse ni espaces)');
ok(/2 h/.test(_l555UndoRefus(last,'JF',1000000+L555_UNDO_MS+1))&&/Données › Lame/.test(_l555UndoRefus(last,'JF',1000000+L555_UNDO_MS+1)),'apres 2 h : refus, renvoi vers Donnees › Lame (pilotage) ou Analyse (admin)');
ok(/Seul l opérateur/.test(_l555UndoRefus(last,'TB',1000000+10))&&/Données › Lame/.test(_l555UndoRefus(last,'TB',10))&&!/dans Analyse/.test(_l555UndoRefus(last,'TB',10)),'un autre operateur : refus, meme orientation');
ok(/initiales/.test(_l555UndoRefus(last,'',1000000+10)),'aucune initiale (compte machine apres envoi) : on demande les initiales, pas « seul l operateur »');
ok(/Rien/.test(_l555UndoRefus(null,'JF',0)),'rien a annuler');

console.log('── 4. agregat Analyse : annee civile, par machine, par categorie, detail mois, dernier (decision 1e) ──');
const A=_l555Agg(cache,'2026');
ok(A.totaux.maveg.graissage===2&&A.totaux.cevenini.antirouille===1&&A.totaux.cevenini.mandrin===1&&A.totaux.maveg.mandrin===0,'2026 : 2 graissages MAVEG (l annule et la lame ne comptent pas), 1 antirouille CEV, 1 mandrin CEV, 0 mandrin MAVEG (l archive ne compte pas)');
ok(A.mois['2026-10']&&A.mois['2026-10'].maveg.graissage===2&&A.mois['2026-10'].cevenini.mandrin===1&&!A.mois['2026-09'],'detail par mois : octobre porte 2 graissages et 1 mandrin CEV ; septembre vide (mandrin archive)');
ok(A.totaux.maveg.dernier.graissage==='2026-10-14T08:10:00.000Z'&&A.totaux.cevenini.dernier.antirouille==='2026-10-02T10:00:00.000Z'&&!A.totaux.maveg.dernier.mandrin,'dernier evenement par machine et categorie (le plus recent vivant)');
ok(_l555Agg([],'').annee===String(new Date().getFullYear())&&_l555Agg(null,'').totaux.maveg.graissage===0,'cache vide ou absent : annee courante, zeros — jamais une erreur');

console.log('── 5. le registre des lames ignore les evenements d entretien ──');
global.nrm=s=>String(s||'').trim().toLowerCase(); global.maintLoaded=true;
const CHECK=eval('('+fnOf('_l514LameCheck')+')');
ok(CHECK('maveg','12',cache).status==='ok'&&CHECK('maveg','7',cache).status==='inconnue','_l514LameCheck (inchange) : la lame 12 est connue, la 7 inconnue — les evenements d entretien ne perturbent pas la verification');
ok(/r\.type&&r\.type!=='lame'\) return false;/.test(fnOf('maintFilteredRows')),'l historique des lames (Donnees > Lame, inchange) filtre type==lame');
global.maintLoaded=false;
ok(CHECK('maveg','9',[E('graissage','maveg','2026-10-14T08:10:00.000Z')]).status==='indispo'&&CHECK('maveg','9',[]).status==='indispo','REGISTRE NON CHARGE + un entretien deja en tete du cache → la garde L514b repond toujours « indispo » (avant : « inconnue » → classe du bug JF, lame fantome) — contre-lecture 22/10');
global.maintLoaded=true;
ok(CHECK('maveg','9',cache).status==='inconnue','registre charge : une lame absente est bien « inconnue » (la garde ne s est pas elargie)');

console.log('── 6. ecriture : forme (bornee, file = succes, entrainement, annule sans deleted, verrou dans un finally) ──');
const W=fnOf('_l555Entretien'), U=fnOf('_l555EntretienUndo');
ok(/^async function _l555Entretien\(cat\)\{ try\{\n  if\(trainingGuard\(\)\)\{/.test(W)&&/^async function _l555EntretienUndo\(\)\{ const u=document\.getElementById\('chgUndoEnt'\); try\{\n  if\(trainingGuard\(\)\)\{/.test(U),'mode entrainement : premiere garde de l appui ET de l annulation');
ok(/boundedWrite\(ref\.set\(rec\),10000\)/.test(W)&&/_isQueuedWrite\(e\)\) enFile=true/.test(W),'ecriture bornee (10 s), mise en file traitee comme un succes (regle 8)');
ok(/type:'entretien', categorie:cat, machine:mk, date:now, dateInstall:now/.test(W)&&/deleted:false, annule:false/.test(W),'document : type entretien, categorie, machine, date, deleted:false (requete du registre), annule:false');
ok(/update\(\{annule:true,annuleAt:isoNow\(\),annuleBy:/.test(U)&&!/deleted:true/.test(U),'annulation par l auteur = champ annule (les regles reservent deleted au pilotage/admin)');
ok(W.indexOf('maintenanceCache.unshift(rec)')>0&&W.indexOf('maintenanceCache.unshift(rec)')<W.indexOf('await boundedWrite(ref.set(rec)')&&W.indexOf('window._l555Last={')<W.indexOf('await boundedWrite(ref.set(rec)'),'ecriture OPTIMISTE : cache et memo d annulation poses AVANT l attente');
ok(/window\._l555Busy\[key\]=true; _l555Lock\(true\);/.test(W)&&/finally\{ window\._l555Busy\[key\]=false; _l555Lock\(false\); \}/.test(W),'VERROU pose avant l attente et TOUJOURS libere (finally)');
ok(/if\(card\) card\.classList\.add\('ent-ok'\);/.test(W)&&!/classList\.add\('chg-ok'\)/.test(W)&&/#chgEntretien\.ent-ok \.chg-done\{display:block\}/.test(src),'retour visuel : classe DEDIEE ent-ok (chg-ok aurait peint les deux boutons en vert « fait » pour toute la session)');
ok(/logAudit\('create','maintenance'/.test(W)&&/logAudit\('edit','maintenance'/.test(U),'piste d audit : creation et annulation (action « edit », libellee et filtrable)');
ok(/_persistenceOK/.test(W)&&/NE RECHARGE PAS/.test(W)&&/NE RECHARGE PAS/.test(U),'toast honnete hors-ligne : sans file offline active, « ne recharge pas l app » (comme boundedWrite)');

console.log('── 7. la carte suit la machine COURANTE et se remet a zero (faux DOM avec classList) ──');
{ const dom={chgEntretien:mk(),chgEntMach:mk(),chgEntBtns:mk(),chgDoneEnt:mk(),chgUndoEnt:mk()};
  global.document={getElementById:id=>dom[id]||null,querySelectorAll:()=>[]}; global.getMachineLabel=m=>({feba:'FEBA',maveg:'MAVEG',cevenini:'CEVENINI'}[m]||''); global._isLandscapeFiche=()=>true;
  global.ficheMachine='maveg'; _l555EntretienSync(); ok(dom.chgEntretien.style.display===''&&dom.chgEntMach.textContent==='MAVEG'&&/Graissage fait/.test(dom.chgEntBtns.innerHTML)&&/Mandrin changé/.test(dom.chgEntBtns.innerHTML)&&!/Antirouille/.test(dom.chgEntBtns.innerHTML),'MAVEG : carte visible, boutons Graissage + Mandrin');
  dom.chgEntretien.classList.add('ent-ok'); dom.chgDoneEnt.textContent='✓ Graissage MAVEG'; dom.chgUndoEnt.style.display=''; window._l555Last={id:'a'};
  global.ficheMachine='cevenini'; _l555EntretienSync(); ok(/Antirouille fait/.test(dom.chgEntBtns.innerHTML)&&!/Graissage/.test(dom.chgEntBtns.innerHTML)&&!dom.chgEntretien.classList.contains('ent-ok')&&dom.chgDoneEnt.textContent===''&&dom.chgUndoEnt.style.display==='none'&&window._l555Last===null,'CEVENINI : Antirouille + Mandrin, et le resume / ↩ / memo de l appui MAVEG sont effaces (autre contexte)');
  global.ficheMachine='feba'; _l555EntretienSync(); ok(dom.chgEntretien.style.display==='none','FEBA : carte masquee');
  global._isLandscapeFiche=()=>false; global.ficheMachine='maveg'; _l555EntretienSync(); ok(dom.chgEntretien.style.display==='none','PORTRAIT : carte absente (regle 3)'); global._isLandscapeFiche=()=>true;
  dom.fMachChg={checked:true}; dom.fMachChgTo={value:'cevenini'}; _l555EntretienSync(); ok(dom.chgEntMach.textContent==='CEVENINI'&&/Antirouille/.test(dom.chgEntBtns.innerHTML),'« ⚙ Machine changee → CEVENINI » : la carte suit la machine COURANTE'); dom.fMachChg.checked=false; _l555EntretienSync(); ok(dom.chgEntMach.textContent==='MAVEG','case decochee : retour a la machine de la fiche'); delete dom.fMachChg; delete dom.fMachChgTo; }

console.log('── 8. cablage, jumeaux, rien sur le papier ni en portrait ──');
ok(/\['chgLame','chgMach','chgOp2','chgEntretien'\]/.test(fnOf('_l79SetupChangements'))&&/_l555EntretienSync\(\)/.test(fnOf('_l79SetupChangements'))&&/_l555EntretienSync\(\)/.test(fnOf('renderFicheHeadPills')),'la carte est deplacee sous « Changements » avec les 3 autres et suit l en-tete');
ok(/_l555ResetCarte\(\); \}catch\(e\)\{\}   \/\* \[L555 · contre-lecture 2\] jumeau/.test(fnOf('resetAll'))&&(src.match(/_l555ResetCarte\(\);/g)||[]).length===3,'resetAll et la deconnexion remettent la carte a zero (jumeaux L440 #9 / L514b) — 3 appels : machine changee, reset, deconnexion');
ok(/CHG_IDS=\['fLameChg','fMachChg','fOp2Active'\]/.test(src),'hors CHG_IDS : pas une case « changement en cours », rien dans le brouillon ni la fiche');
ok(!/outils-chg"[^>]*>[^<]*entretien/.test(src)&&/outils-badge">lame · machine · op\.2 · entretien/.test(src),'tiroir ⚙ OUTILS (portrait) INTACT ; badge du rail (paysage) mentionne l entretien');
ok(/\$\{_l555EntretienBlock\(scopeNote\)\}/.test(fnOf('renderAnalyse'))&&/_l555RenderEntretien\(\); \}catch\(e\)\{\}/.test(fnOf('renderAnalyse')),'bloc dans Analyse, annee resynchronisee apres un re-rendu complet');
{ const I=fnOf('_l555EntretienInner'); ok(/if\(maintLoaded\) _l555RenderEntretien\(\); else _l555ErreurRegistre\(\);/.test(I)&&/Réessayer/.test(L555_ERR_HTML),'registre non charge : un seul chargement, re-rendu seulement s il a reussi, sinon message + ↻ (lecon L441 #2)');
  ok(/if\(_maintLoadedAt>t0&&currentUser\) _l555RenderEntretien\(\);/.test(I)&&/window\._l555RefreshAt/.test(I),'rafraichissement 5 min : re-rendu SEULEMENT si le registre a vraiment ete recharge, un essai par 5 min (pas de boucle)');
  ok(/_l555Tronque\(\)/.test(I)&&/_maintRawN/.test(fnOf('_l555Tronque'))&&(fnOf('loadMaintenance').match(/window\._maintRawN=s\.docs\.length/g)||[]).length===2,'avertissement « registre tronque » sur la taille BRUTE lue (2000), posee aux 2 lectures'); }
ok(/<div id="l555Lame"><\/div>/.test(fnOf('maintViewHTML'))&&/id="l555LameBox"/.test(fnOf('maintViewHTML'))&&/_l555LameRender\(\)/.test(fnOf('renderMaintenance')),'Donnees > Lame : volet avec memoire d ouverture, rempli par _l555LameRender (pilotage ne voit pas Analyse)');
ok(/it\._col==='maintenance'&&it\.type==='entretien'\) label=/.test(fnOf('renderCorbeille'))&&/d\.ent\?'Entretien'/.test(fnOf('renderCorbeille'))&&/_l555RenderEntretien\(\)/.test(fnOf('restoreItem')),'corbeille : « Entretien — Graissage MAVEG du … » ; une restauration recompte l Analyse');
ok(/RETENTION_VALID_DAYS\+' jours via la Corbeille/.test(fnOf('maintDelete')),'maintDelete annonce le vrai delai de conservation du registre');
ok(!/entretien|graissage|mandrin changé/i.test(fnOf('buildFichePrintHTML'))&&!/_l555|entretien/i.test(fnOf('_l517FicheRow')),'rien sur le PDF de la fiche ni dans le CSV par commande (decision 1g)');
ok(/#changementsZone #chgEntretien\{grid-column:1\/-1\}/.test(src)&&/#chgEntBtns \.chg-ok-btn\{min-height:48px;/.test(src),'paysage : carte pleine largeur, boutons 48 px');
ok(/^  #ficheChgSec\.reveal\{max-height:44vh;overflow-y:auto\}/m.test(src),'paysage : zone Changements 44vh (30vh cachait la 4e carte des qu une case etait cochee — contre-lecture 22/10)');
ok(!/45 j/.test(fnOf('_l514LameUndo'))&&!/45 j/.test(fnOf('lameRetirerDuSuivi'))&&(src.match(/RETENTION_VALID_DAYS\+' j\)|\$\{RETENTION_VALID_DAYS\} j\)/g)||[]).length>=3,'jumeaux de maintDelete : les 3 autres messages du registre annoncent le vrai delai (plus de « 45 j »)');

console.log('── 9. COMPORTEMENT (faux db, faux DOM, ecriture en attente) : verrou, rejet, annulation, finally, Analyse, Lame ──');
(async function(){
  const dom={chgEntretien:mk(),chgEntMach:mk(),chgEntBtns:mk(),chgDoneEnt:mk(),chgUndoEnt:mk(),l555Content:mk(),l555Lame:mk()};
  const btns=[Object.assign(mk(),{dataset:{cat:'graissage'}}),Object.assign(mk(),{dataset:{cat:'mandrin'}})];
  global.document={getElementById:id=>dom[id]||null,querySelectorAll:()=>btns};
  const toasts=[]; global.showToast=(m,k)=>toasts.push(String(m));
  global.trainingGuard=()=>false; global.currentUser={uid:'u'}; global._l543LameWho=()=>'JF'; global.isoNow=()=>new Date().toISOString();
  global.boundedWrite=(p)=>p; global._isQueuedWrite=e=>!!(e&&e.queued); global.logAudit=()=>Promise.resolve(); global.confirmDlg=async()=>true; global._persistenceOK=true; global.esc=s=>String(s==null?'':s); global.canManageData=()=>true; global._l505Warn=()=>{}; global.ficheMachine='maveg'; global._isLandscapeFiche=()=>true;
  const timers=[]; const realST=setTimeout; global.setTimeout=(fn,ms)=>{ timers.push({fn,ms}); return timers.length; }; global.clearTimeout=()=>{};
  const tick=()=>new Promise(r=>realST(r,5));
  let n=0; const sets=[], updates=[]; let setMode='pending', updMode='pending', pend=[];
  const PERM=()=>Object.assign(new Error('Missing or insufficient permissions.'),{code:'permission-denied'});
  global.db={collection:()=>({doc:(id)=>{ const d={id:id||('D'+(++n))}; d.set=(rec)=>{ sets.push(rec); if(setMode==='throw') throw new Error('boum'); if(setMode==='reject') return Promise.reject(new Error('permission refusée')); if(setMode==='permission') return Promise.reject(PERM()); if(setMode==='queued') return Promise.reject(Object.assign(new Error('timeout'),{queued:true})); if(setMode==='ok') return Promise.resolve(); return new Promise((res,rej)=>pend.push({res,rej})); }; d.update=(u)=>{ updates.push(u); if(updMode==='permission') return Promise.reject(PERM()); return new Promise((res,rej)=>pend.push({res,rej})); }; return d; }})};
  global.maintenanceCache=[]; global.maintLoaded=true; global._maintLoadedAt=Date.now();
  window._l555Arm=null; window._l555Busy={};
  const p1=_l555Entretien('graissage'); await tick();
  ok(sets.length===1&&window._l555Busy['maveg|graissage']===true&&btns[0].disabled===true&&btns[1].disabled===false&&/⏳/.test(dom.chgDoneEnt.textContent)&&dom.chgEntretien.classList.contains('ent-ok')&&maintenanceCache.length===1&&window._l555Last&&window._l555Last.id===sets[0].id,'appui : OPTIMISTE (cache, memo, resume ⏳, ent-ok) et verrou du SEUL bouton concerne pendant l attente');
  await _l555Entretien('graissage'); await tick(); ok(sets.length===1&&toasts.some(t=>/Enregistrement en cours/.test(t)),'2e appui pendant l attente : refuse, aucun 2e set');
  pend.shift().res(); await p1; await tick();
  ok(window._l555Busy['maveg|graissage']===false&&btns[0].disabled===false&&/^✓ Graissage MAVEG/.test(dom.chgDoneEnt.textContent)&&dom.chgUndoEnt.style.display===''&&timers.some(t=>t.ms===L555_UNDO_MS),'ecriture aboutie : verrou libere, resume ✓, ↩ visible, minuterie 2 h armee');
  window._l555Arm=null; setMode='ok'; await _l555Entretien('graissage'); await tick();
  ok(sets.length===2&&/déjà fait/.test(dom.chgDoneEnt.textContent)&&toasts.some(t=>/compté quand même/.test(t))&&maintenanceCache.length===2,'meme jour, 2e appui : compte quand meme, « deja fait » dans le resume ET le toast (decision 1c)');
  const idB=window._l555Last.id; const pu=_l555EntretienUndo(); await tick();
  ok(updates.length===1&&updates[0].annule===true&&!('deleted' in updates[0])&&dom.chgUndoEnt.disabled===true,'↩ : update {annule:true} (jamais deleted), bouton ↩ verrouille pendant l attente');
  await _l555EntretienUndo(); await tick(); ok(updates.length===1,'double tap sur ↩ pendant l attente : une seule annulation');
  window._l555Arm=null; await _l555Entretien('mandrin'); await tick(); const idC=window._l555Last&&window._l555Last.id;
  pend.shift().res(); await pu; await tick();
  ok(idC&&idC!==idB&&window._l555Last&&window._l555Last.id===idC&&/^✓ Mandrin changé/.test(dom.chgDoneEnt.textContent)&&dom.chgUndoEnt.style.display===''&&dom.chgUndoEnt.disabled===false,'annulation terminee APRES un nouvel appui : la memo et la carte restent sur le nouvel appui (le ↩ n est pas mort)');
  const rB=maintenanceCache.find(x=>x.id===idB); ok(rB&&rB.annule===true&&!rB.deleted,'l appui annule reste dans le cache, marque annule (tracabilite)');
  const pu2=_l555EntretienUndo(); await tick(); pend.shift().res(); await pu2; await tick();
  ok(window._l555Last===null&&/annulé/.test(dom.chgDoneEnt.textContent)&&dom.chgDoneEnt.style.color==='var(--orange)'&&dom.chgUndoEnt.style.display==='none','annulation de l appui courant : « annule » visible (orange), ↩ masque, memo videe');
  window._l555Arm=null; setMode='reject'; const nb=maintenanceCache.length; await _l555Entretien('graissage'); await tick();
  ok(maintenanceCache.length===nb&&window._l555Last===null&&dom.chgDoneEnt.textContent===''&&!dom.chgEntretien.classList.contains('ent-ok')&&dom.chgUndoEnt.style.display==='none'&&window._l555Busy['maveg|graissage']===false&&toasts.some(t=>/permission refusée/.test(t)),'vrai rejet : cache, memo, resume, ent-ok et ↩ defaits, verrou libere, erreur affichee');
  window._l555Arm=null; setMode='throw'; await _l555Entretien('graissage'); await tick();
  ok(window._l555Busy['maveg|graissage']===false&&btns[0].disabled===false&&maintenanceCache.length===nb&&window._l555Last===null,'exception pendant l envoi : verrou libere (finally), cache et memo defaits — jamais un bouton bloque jusqu au rechargement');
  global.trainingGuard=()=>true; window._l555Last={id:'z',mk:'maveg',cat:'graissage',by:'JF',at:Date.now()}; const nu=updates.length; await _l555EntretienUndo(); await tick();
  ok(updates.length===nu&&toasts.some(t=>/Entraînement/.test(t)),'↩ en mode entrainement : rien d ecrit (meme garde que l appui)'); global.trainingGuard=()=>false; window._l555Last=null;
  // --- contre-lecture 22/10 : anti-rebond, rejet APRES un appui valide (memo restauree), refus du serveur lisible, hors-ligne (file / perdu), annulation refusee, refus auteur / 2 h
  window._l555Arm=null; setMode='ok'; const nS=sets.length; await _l555Entretien('graissage'); await tick(); await _l555Entretien('graissage'); await tick();
  ok(sets.length===nS+1&&window._l555Last&&window._l555Last.id===sets[sets.length-1].id,'anti-rebond : deux appuis a moins de 1,5 s (sans ecriture en attente) = UN seul evenement');
  const prevId=window._l555Last.id, prevDone=dom.chgDoneEnt.textContent; window._l555Arm=null; setMode='permission'; await _l555Entretien('mandrin'); await tick();
  ok(window._l555Last&&window._l555Last.id===prevId&&dom.chgDoneEnt.textContent===prevDone&&dom.chgUndoEnt.style.display===''&&dom.chgEntretien.classList.contains('ent-ok')&&toasts.some(t=>/Refusé par le serveur/.test(t)),'un appui REFUSE par le serveur restaure la memo, le resume et le ↩ de l appui precedent (encore annulable) ; message lisible « Refusé par le serveur »');
  window._l555Arm=null; setMode='queued'; global._persistenceOK=true; await _l555Entretien('mandrin'); await tick();
  ok(/\(en attente réseau\)/.test(dom.chgDoneEnt.textContent)&&toasts.some(t=>/Hors-ligne.*ça partira au retour du réseau/.test(t))&&window._l555Busy['maveg|mandrin']===false&&dom.chgUndoEnt.style.display==='','HORS-LIGNE (ecriture mise en file apres 10 s) = succes : resume « (en attente reseau) », toast « ca partira au retour du reseau », verrou libere, ↩ visible');
  window._l555Arm=null; global._persistenceOK=false; await _l555Entretien('graissage'); await tick();
  ok(toasts.some(t=>/NE RECHARGE PAS/.test(t)),'sans file hors-ligne active : toast honnete « NE RECHARGE PAS l app avant le retour du reseau »'); global._persistenceOK=true;
  updMode='permission'; const idQ=window._l555Last.id; const nuQ=updates.length; await _l555EntretienUndo(); await tick();
  ok(updates.length===nuQ+1&&window._l555Last&&window._l555Last.id===idQ&&dom.chgUndoEnt.disabled===false&&dom.chgUndoEnt.style.display===''&&toasts.some(t=>/Annulation refusée par le serveur/.test(t))&&!(maintenanceCache.find(x=>x.id===idQ)||{}).annule,'annulation REFUSEE par le serveur : memo gardee, ↩ reactive (on peut reessayer), rien de marque annule, message lisible'); updMode='pending';
  global._l543LameWho=()=>'TB'; const nu2=updates.length; await _l555EntretienUndo(); await tick(); ok(updates.length===nu2&&toasts.some(t=>/Seul l opérateur/.test(t)),'↩ par un AUTRE operateur : aucune ecriture, refus explique'); global._l543LameWho=()=>'JF';
  const atSave=window._l555Last.at; window._l555Last.at=Date.now()-L555_UNDO_MS-1000; await _l555EntretienUndo(); await tick(); ok(updates.length===nu2&&toasts.some(t=>/2 h/.test(t)),'↩ apres 2 h : aucune ecriture, renvoi vers pilotage / admin'); window._l555Last.at=atSave;
  setMode='pending'; window._l555Last=null; dom.chgUndoEnt.style.display='none'; dom.chgDoneEnt.textContent='';
  window._l555Arm=null; setMode='pending'; dom.chgEntBtns.dataset={}; _l555EntretienSync(); const p4=_l555Entretien('graissage'); await tick();
  dom.fMachChg={checked:true}; dom.fMachChgTo={value:'cevenini'}; _l555EntretienSync(); await tick();
  ok(dom.chgEntMach.textContent==='CEVENINI'&&dom.chgDoneEnt.textContent===''&&window._l555Last===null,'« Machine changee → CEVENINI » pendant l attente : carte remise a zero');
  pend.shift().res(); await p4; await tick();
  ok(dom.chgDoneEnt.textContent===''&&dom.chgUndoEnt.style.display==='none'&&window._l555Busy['maveg|graissage']===false,'fin de l ecriture MAVEG : rien n est ecrit sur la carte CEVENINI, pas de ↩ orphelin');
  delete dom.fMachChg; delete dom.fMachChgTo; _l555EntretienSync();
  let loads=0, loadOk=false; global.loadMaintenance=()=>{ loads++; return Promise.resolve().then(()=>{ if(loadOk){ global._maintLoadedAt=Date.now(); } }); };
  global.currentUser={uid:'u'}; global._maintLoadedAt=Date.now()-10*60000; window._l555Loading=false; window._l555RefreshAt=0;
  _l555RenderEntretien(); await tick(); await tick();
  ok(loads===1&&/MAVEG/.test(dom.l555Content.innerHTML)&&window._l555Loading===false,'registre vieux de 10 min, rechargement qui ECHOUE : un seul essai, le tableau reste affiche, pas de boucle (L441 #2)');
  _l555RenderEntretien(); await tick(); ok(loads===1,'re-rendu juste apres : pas de nouvel essai avant 5 min');
  loadOk=true; window._l555RefreshAt=0; _l555RenderEntretien(); await tick(); await tick();
  ok(loads===2&&/MAVEG/.test(dom.l555Content.innerHTML),'rechargement qui REUSSIT : re-rendu une fois, puis plus rien (registre frais)');
  _l555RenderEntretien(); await tick(); ok(loads===2,'registre frais : aucun rechargement');
  global.maintLoaded=false; window._l555Loading=false; let lo2=0; global.loadMaintenance=()=>{ lo2++; return Promise.resolve(); };
  _l555RenderEntretien(); await tick(); await tick();
  ok(lo2===1&&/Réessayer/.test(dom.l555Content.innerHTML),'registre non charge et lecture en echec : un seul essai, message + ↻ Reessayer');
  global.maintLoaded=true;
  global.maintenanceCache=[]; for(let i=0;i<25;i++) maintenanceCache.push({id:'e'+i,type:'entretien',categorie:'graissage',machine:'maveg',date:new Date(Date.UTC(2026,9,1+(i%28),8+(i%10))).toISOString(),responsable:'JF',deleted:false});
  window._l555ToutL=false; _l555LameRender(); const L1=dom.l555Lame.innerHTML;
  ok((L1.match(/🗑 Archiver/g)||[]).length===20&&/20 sur 25/.test(L1)&&/Tout afficher \(25\)/.test(L1),'Donnees › Lame : 20 derniers appuis avec 🗑 (pilotage), « 20 sur 25 » et bouton Tout afficher');
  window._l555ToutL=true; _l555LameRender(); ok((dom.l555Lame.innerHTML.match(/🗑 Archiver/g)||[]).length===25,'« Tout afficher » : les 25 appuis (un appui ancien reste archivable)');
  global.canManageData=()=>false; _l555LameRender(); ok(!/🗑/.test(dom.l555Lame.innerHTML)&&/MAVEG/.test(dom.l555Lame.innerHTML),'sans droit de gestion (operateur) : la liste se lit, sans 🗑'); global.canManageData=()=>true;
  maintenanceCache.push({id:'nomach',type:'entretien',categorie:'graissage',date:'2026-10-05T08:00:00.000Z',responsable:'JF',deleted:false}); _l555LameRender();
  ok(!/erreur d affichage/.test(dom.l555Lame.innerHTML)&&(dom.l555Lame.innerHTML.match(/🗑 Archiver/g)||[]).length===25,'un document sans machine (donnee abimee) est ignore : la liste ne plante pas'); maintenanceCache.pop();
  maintenanceCache.push({id:'old',type:'entretien',categorie:'graissage',machine:'maveg',date:'2025-03-01T08:00:00.000Z',responsable:'JF',deleted:false});
  window._l555ToutA=false; window._l555Open={m:true,d:false}; _l555RenderEntretien('2025'); const A1=dom.l555Content.innerHTML;
  ok(/Appuis 2025 \(1\)/.test(A1)&&/id="l555DetMois"[^>]* open/.test(A1)&&!/id="l555DetDerniers"[^>]* open/.test(A1),'Analyse : les appuis suivent l annee choisie (2025 → 1) ; les volets gardent leur etat ouvert entre deux re-rendus');
  _l555RenderEntretien('2026'); ok(/Appuis 2026 \(20 sur 25\)/.test(dom.l555Content.innerHTML),'Analyse 2026 : 20 sur 25, Tout afficher');
  window._maintRawN=2000; ok(_l555Tronque()===true,'avertissement « registre tronque » sur la taille BRUTE lue (2000), meme si le cache filtre est plus petit'); window._maintRawN=0; ok(_l555Tronque()===false,'registre sous 2000 : pas d avertissement');
  global.setTimeout=realST;
  console.log('── 10. preuve navigateur : smoke « fiche-entretien » dans la batterie et la CI ──');
  ok(/'fiche-entretien': `/.test(shot)&&/chgEntBtns/.test(shot)&&/Graissage fait/.test(shot)&&/Antirouille/.test(shot),'scene : carte MAVEG (Graissage + Mandrin), appui en entrainement = rien d ecrit, machine changee → CEVENINI (Antirouille)');
  ok(/'fiche-entretien': "\(function\(\)\{ const s=window\.__l555/.test(shot)&&/visibles:VIS\(\)/.test(shot)&&/document\.elementFromPoint/.test(shot)&&/gt\.textContent=''; bs\[0\]\.click\(\)/.test(shot),'CHECK : chaine = echec explicite ; boutons VRAIMENT visibles au doigt (elementFromPoint apres defilement) avant et apres machine changee ; toast vide avant l appui');
  ok(/for s in plan fiche fiche-start fiche-cut fiche-dechet fiche-entretien[a-z -]*donnees analyse; do/.test(bat)&&/for s in plan fiche fiche-start fiche-cut fiche-dechet fiche-entretien[a-z -]*donnees analyse; do/.test(ci)&&/Smokes \(\d+ scenes/.test(ci),'la batterie ET la CI GitHub rejouent la scene fiche-entretien');   /* [L556] la boucle accueille d autres scenes apres fiche-entretien */
  console.log(fail?('💥 '+fail+'/'+total+' ECHEC(S) ENTRETIEN L555'):('🏆 ENTRETIEN L555 OK : '+total+' verifications')); process.exit(fail?1:0);
})().catch(e=>{ console.log('💥 harnais : '+(e&&e.stack||e)); process.exit(1); });
