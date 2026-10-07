// l545_test.js — [L545 · 07/10/2026, suite de l audit d usage reel du 06/10 : « commandes commencees »]
// B9 plan deja entame sur un autre poste (fenetre « deja commencee ») · F effacement d une commande entamee en 1 tap + parcage
// rate qui vidait la fiche · B10 reprise auto d une commande deja envoyee ailleurs · B11 brouillons multi-ref jamais ranges ·
// A5 carte brouillon muette · B15 synchro des brouillons morte pour la session. DONNEES FICTIVES uniquement (depot public).
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
function braceFrom(i){ let k=src.indexOf('{',i),d=0; for(let j=k;j<src.length;j++){ const c=src[j]; if(c==='{')d++; else if(c==='}'){ d--; if(d===0) return src.slice(k,j+1); } } throw new Error('accolades'); }
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const withCtx=(fnSrc,ctx)=>new Function('ctx','with(ctx){ return ('+fnSrc+'); }')(ctx);

global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
['_l545Code','_l545Count','_l545DraftCodes','_l545Uncovered','_l545Describe','_l545SentInfo','_l545Ago','_l545SentTxt','_l545CopiesEntamees','_l545Badge'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });

// ── donnees fictives ──
const A='90000001 - Film A', B='90000002 - Film B', C='90000003 - Film C';
const lines=spec=>{ const L=[]; spec.forEach(([r,n,c])=>{ for(let i=0;i<n;i++) L.push({id:'l'+L.length,ref:r,coupee:i<(c||0)}); }); return L; };
const det=spec=>{ const D=[]; spec.forEach(([r,n])=>{ for(let i=0;i<n;i++) D.push({ref:r,coupee:true}); }); return D; };
const draft=o=>({id:o.id||'d_1',savedAt:o.savedAt||'2026-09-22T09:00:00.000Z',owner:o.owner,ownerPost:o.ownerPost,ownerUid:o.ownerUid,consumed:o.consumed,fromFicheId:o.fromFicheId,planDraft:o.planDraft,auto:o.auto,kind:o.kind,fromSend:o.fromSend,
  state:{plan:{client:o.client||'Client Alpha',ref:(o.groups||[])[0]||o.pref||'',numCmd:o.num==null?'CMD-001':o.num,refGroups:(o.groups||[]).map(r=>({ref:r,rows:[{qty:1,width:100}]})),machine:o.pmach||''},
    fiche:{client:o.client||'Client Alpha',numCmd:o.num==null?'CMD-001':o.num,ref:(o.groups||[]).join(' + '),machine:o.fmach||''},
    chrono:{startTs:o.startTs===undefined?'2026-09-21T09:00:00.000Z':o.startTs},lines:o.lines||[],loadedSaveId:o.loadedSaveId||null,pendingFicheId:o.pendingFicheId||null}});
const fiche=o=>({_id:o.id||'F1',date:o.date||'2026-09-28T07:00:00.000Z',client:o.client||'Client Alpha',numCmd:o.num==null?'CMD-001':o.num,ref:o.ref||'',machine:o.machine||'MAVEG',ini:o.ini||'AA',deleted:o.deleted,valide:o.valide,manqueMatiere:o.mm,ficheDetail:o.detail||[]});

console.log('── 0. version ──');
ok(/const APP_VERSION='2026\.10\.07-L545';/.test(src),'APP_VERSION = 2026.10.07-L545');

console.log('── 1. reference = code article ──');
ok(_l545Code(A)==='90000001'&&_l545Code('90000001 - Film A renomme au catalogue')==='90000001','code article stable malgre un renommage du catalogue');
ok(_l545Code('—')===''&&_l545Code('?')===''&&_l545Code('')===''&&_l545Code(null)==='','« — », « ? », vide = reference sans nom');
ok(_l545Code(' Film Sans Code ')==='film sans code'&&_l545Code('12345 - court')==='12345 - court','sans code a 6 chiffres : libelle normalise');

console.log('── 2. B11 : travail du brouillon couvert par l envoi ──');
const d3=draft({groups:[A,B,C],lines:lines([[A,4,2],[B,3,3],[C,4,0]])});
ok(JSON.stringify(_l545Uncovered(d3,[_l545Code(A),_l545Code(B)]))==='["90000003"]','3 refs, envoi de 2 → la 3e est signalee (cas reel : 96×40 d une 3e ref hors fiche)');
ok(_l545Uncovered(d3,[_l545Code(A),_l545Code(B),_l545Code(C)]).length===0,'3 refs envoyees → tout est couvert');
ok(_l545Uncovered(draft({groups:[A,A],lines:lines([[A,4,0]])}),[_l545Code(A)]).length===1,'meme ref en double dans le brouillon, une seule dans l envoi → non couvert (multiplicite)');
ok(_l545Uncovered(draft({groups:[A],lines:lines([[A,2,1]])}),[_l545Code('90000001 - Film A v2')]).length===0,'ref renommee au catalogue (meme code) → couverte');
ok(_l545Uncovered(draft({groups:[A],lines:[{ref:'',coupee:false},{ref:A}]}),[_l545Code(A)]).length===0,'bobine sans reference ignoree');
ok(_l545Uncovered(draft({groups:['?'],lines:[{ref:'?'}]}),[_l545Code('?')]).length===0,'ref sans nom des deux cotes → couverte');
ok(_l545Uncovered(draft({groups:[],pref:A,lines:lines([[A,3,0]])}),[_l545Code(A)]).length===0,'mono-ref sans bloc garni : la ref du plan sert de reference');
ok(/90000003 - Film C \(4 bob\., 0 coupée\(s\)\)/.test(_l545Describe(d3,['90000003'])),'description lisible : « ref (N bob., M coupee(s)) »');

console.log('── 3. B10/A5 : commande deja partie ? ──');
const W=draft({groups:[A,B],lines:lines([[A,4,2],[B,3,0]])});
let r=_l545SentInfo(W,[fiche({ref:A+' + '+B,detail:det([[A,4],[B,3]])})]);
ok(r&&r.kind==='sent'&&r.machine==='MAVEG'&&r.ini==='AA'&&r.covered===2&&r.total===2,'fiche d un AUTRE poste apres le 1er ▶, toutes les bobines → « deja envoyee »');
ok(_l545SentInfo(W,[fiche({date:'2026-09-20T07:00:00.000Z',ref:A+' + '+B,detail:det([[A,4],[B,3]])})])===null,'fiche ANTERIEURE au debut de ce travail (manque matiere avant le solde, n° reutilise) → rien');
ok(_l545SentInfo(W,[fiche({deleted:true,ref:A+' + '+B,detail:det([[A,4],[B,3]])})])===null&&_l545SentInfo(W,[fiche({valide:false,ref:A+' + '+B,detail:det([[A,4],[B,3]])})])===null,'fiche supprimee ou refusee → ignoree');
ok(_l545SentInfo(W,[fiche({client:'Client Alpha bis',ref:A+' + '+B,detail:det([[A,4],[B,3]])})])===null,'client different → rien (homonymes)');
ok(_l545SentInfo(draft({num:'',groups:[A],lines:lines([[A,2,0]])}),[fiche({num:'—',ref:A,detail:det([[A,2]])})])===null&&_l545SentInfo(draft({num:'—',groups:[A],lines:lines([[A,2,0]])}),[fiche({num:'',ref:A,detail:det([[A,2]])})])===null,'n° vide (ou « — ») → JAMAIS de preuve (L128/L254)');
ok(_l545SentInfo(W,[fiche({ref:'90000001 - Film A nouveau nom + 90000002 - Film B nouveau nom',detail:det([['90000001 - Film A nouveau nom',4],['90000002 - Film B nouveau nom',3]])})]).kind==='sent','refs jointes « A + B » renommees, memes codes → deja envoyee');
ok(_l545SentInfo(W,[fiche({ref:C,detail:det([[C,9]])})])===null,'meme n° mais aucune ref commune (commande coupee ref par ref) → rien');
ok(_l545SentInfo(draft({groups:[A],lines:lines([[A,2,2]]),pendingFicheId:'F1'}),[fiche({id:'F1',ref:A,detail:det([[A,2]])})])===null,'fiche reservee par CE brouillon (renvoi idempotent ENVOI-1) → comportement d avant');
const S=draft({id:'d_solde_M1',fromFicheId:'M1',startTs:null,savedAt:'2026-09-08T08:00:00.000Z',groups:[A],lines:lines([[A,5,0]])});
ok(_l545SentInfo(S,[fiche({id:'M1',date:'2026-09-09T08:00:00.000Z',mm:true,ref:A,detail:det([[A,9]])})])===null,'fiche MERE d un solde → jamais une preuve');
ok(_l545SentInfo(S,[fiche({id:'M2',date:'2026-09-10T08:00:00.000Z',ref:A,detail:det([[A,5]])})]).kind==='sent','solde ensuite envoye → deja envoye');
r=_l545SentInfo(d3,[fiche({ref:A+' + '+B,detail:det([[A,4],[B,3]])})]);
ok(r&&r.kind==='partial'&&r.covered===2&&r.total===3&&r.reste===4,'2 refs sur 3 dans la fiche → « en partie », 4 bobines non coupees de la ref absente');
r=_l545SentInfo(draft({groups:[A],lines:lines([[A,14,2]])}),[fiche({ref:A,detail:det([[A,10]])})]);
ok(r&&r.kind==='partial','moins de bobines dans la fiche que dans le brouillon (travail partage entre machines) → « en partie », jamais « deja envoyee »');
ok(_l545SentInfo(draft({groups:[A],lines:lines([[A,2,0]])}),[fiche({ref:A,detail:[]})]).kind==='partial','fiche sans detail par bobine → prudence : « en partie »');
const NS=draft({startTs:null,savedAt:'2026-09-22T09:00:00.000Z',groups:[A],lines:lines([[A,2,0]])});
ok(_l545SentInfo(NS,[fiche({date:'2026-09-21T09:00:00.000Z',ref:A,detail:det([[A,2]])})])===null&&_l545SentInfo(NS,[fiche({date:'2026-09-23T09:00:00.000Z',ref:A,detail:det([[A,2]])})]).kind==='sent','chrono jamais lance : repere = date du brouillon');
const RW=draft({startTs:'2026-08-24T06:11:17.439Z',savedAt:'2026-09-04T08:48:57.596Z',groups:[A,B],lines:lines([[A,10,2],[B,4,0]])});
ok(_l545SentInfo(RW,[fiche({date:'2026-08-26T07:00:00.000Z',ref:A+' + '+B,detail:det([[A,10],[B,4]])})]).kind==='sent','cas du 04/09 : brouillon REECRIT apres la fiche (savedAt posterieur) → reconnu grace au 1er ▶');
r=_l545SentInfo(d3,[fiche({id:'P',date:'2026-09-29T07:00:00.000Z',ref:A,detail:det([[A,4]])}),fiche({id:'T',date:'2026-09-28T07:00:00.000Z',ref:A+' + '+B+' + '+C,detail:det([[A,4],[B,3],[C,4]])})]);
ok(r&&r.kind==='sent'&&r.fiche._id==='T','deux fiches : la fiche complete prime sur une fiche partielle plus recente');
ok(_l545SentInfo(draft({planDraft:true,groups:[A,B],lines:[]}),[fiche({ref:A+' + '+B,detail:det([[A,1],[B,1]])})]).kind==='sent','saisie de plan sans bobine : refs des blocs');
const MMf=(cut)=>fiche({id:'MM',mm:true,ref:A,detail:Array.from({length:15},(_,i)=>({ref:A,coupee:i<cut}))});
r=_l545SentInfo(draft({groups:[A],lines:lines([[A,15,11]])}),[MMf(4)]);
ok(r&&r.kind==='partial'&&r.mm===true,'fiche MANQUE MATIERE d une autre tablette (4 coupees) face a une copie a 11 coupees → « en partie » (la copie a du travail a elle : reprise auto comme avant)');
r=_l545SentInfo(draft({groups:[A],lines:lines([[A,15,2]])}),[MMf(10)]);
ok(r&&r.kind==='sent'&&r.mm===true,'copie a 2 coupees, manque matiere a 10 → copie depassee (le reste est dans le brouillon Solde)');
ok(_l545SentInfo(draft({groups:[A],lines:lines([[A,15,0]])}),[MMf(4)]).kind==='sent'&&_l545SentInfo(W,[fiche({ref:A+' + '+B,detail:det([[A,4],[B,3]])})]).mm===false,'copie jamais coupee + manque matiere → depassee ; fiche normale → mm faux');
ok(_l545SentInfo(null,[])===null&&_l545SentInfo({id:'x'},null)===null&&_l545SentInfo(W,null)===null,'entrees nulles : jamais d exception');
ok(/le 28\/09 à \d\d:\d\d sur MAVEG \(AA\)/.test(_l545SentTxt({date:'2026-09-28T07:00:00.000Z',machine:'MAVEG',ini:'AA'})),'texte « le 28/09 a hh:mm sur MAVEG (AA) »');
ok(_l545Ago(5*60000)==='il y a 5 min'&&_l545Ago(3*3600000)==='il y a 3 h'&&_l545Ago(50*3600000)==='il y a 2 j','anciennete lisible');

console.log('── 4. B9 : copies entamees d un plan ──');
const P1='P1';
const C9=[
  draft({id:'d_a',ownerPost:'MAVEG',owner:'BB',loadedSaveId:P1,savedAt:'2026-09-01T07:00:00.000Z',groups:[A],lines:lines([[A,21,19]])}),
  draft({id:'d_park_b',ownerPost:'CEVENINI',owner:'?',loadedSaveId:P1,savedAt:'2026-08-28T09:00:00.000Z',groups:[A],lines:lines([[A,20,0]])}),
  draft({id:'d_c',consumed:true,loadedSaveId:P1,groups:[A],lines:lines([[A,3,3]])}),
  draft({id:'d_shared_x',kind:'shared',loadedSaveId:P1,groups:[A],lines:lines([[A,3,3]])}),
  draft({id:'d_autosave_plan_u_dev',planDraft:true,loadedSaveId:P1,groups:[A],lines:lines([[A,3,3]])}),
  draft({id:'d_autosave_me_dev',auto:true,loadedSaveId:P1,groups:[A],lines:lines([[A,5,5]])}),
  draft({id:'d_other',loadedSaveId:'P2',groups:[A],lines:lines([[A,3,3]])}),
  draft({id:'d_empty',loadedSaveId:P1,groups:[A],lines:[]}),
  draft({id:'d_noid',groups:[A],lines:lines([[A,3,3]])})];
let cp=_l545CopiesEntamees(P1,C9,{myAutoId:'d_autosave_me_dev',myPost:'FEBA'});
ok(cp.length===2&&cp[0].id==='d_a'&&cp[1].id==='d_park_b','seules les vraies copies entamees : ni consommee, ni partage, ni saisie de plan, ni MA sauvegarde auto, ni autre plan, ni vide, ni sans lien');
ok(cp[0].cut===19&&cp[0].total===21&&cp[0].poste==='MAVEG'&&cp[0].owner==='BB'&&cp[0].ici===false&&cp[0].auto===false,'« MAVEG · BB · 19/21 », pas ici');
ok(cp[1].owner===''&&cp[1].cut===0,'initiales inconnues « ? » jamais affichees (L156)');
ok(_l545CopiesEntamees(P1,C9,{myPost:'CEVENINI'}).find(x=>x.id==='d_park_b').ici===true,'compte machine : « sur CETTE tablette » par le poste');
ok(_l545CopiesEntamees(P1,[draft({id:'d_u',ownerUid:'u1',loadedSaveId:P1,groups:[A],lines:lines([[A,2,1]])})],{myPost:'',uid:'u1'})[0].ici===true,'compte personnel : « ici » par l uid');
ok(_l545CopiesEntamees(P1,[draft({id:'d_m',fmach:'feba',loadedSaveId:P1,groups:[A],lines:lines([[A,2,1]])})],{posteOf:d=>String(d.state.fiche.machine).toUpperCase()})[0].poste==='FEBA','poste lu par _draftPoste (machine de la fiche) quand ownerPost manque');
ok(_l545CopiesEntamees(P1,[draft({id:'d_m',fmach:'feba',ownerUid:'bureau',loadedSaveId:P1,groups:[A],lines:lines([[A,2,1]])})],{myPost:'FEBA',uid:'feba-uid',posteOf:d=>'FEBA'})[0].ici===false,'brouillon d un compte du bureau sans poste : jamais « sur CETTE tablette » (deduit de la machine du plan)');
cp=_l545CopiesEntamees(P1,C9,{myPost:'FEBA',visible:d=>d.id!=='d_a'});
ok(cp[0].vis===false&&cp[0].owner===''&&cp[1].vis===true,'brouillon invisible pour ce compte (L520) : signale sans initiales, et marque non reprenable');
ok(_l545CopiesEntamees('',C9,{}).length===0&&_l545CopiesEntamees(P1,null,{}).length===0,'sans plan / sans brouillons : rien');
cp=_l545CopiesEntamees(P1,[draft({id:'o',loadedSaveId:P1,savedAt:'2026-09-01T07:00:00.000Z',groups:[A],lines:lines([[A,4,2]])}),draft({id:'n',loadedSaveId:P1,savedAt:'2026-09-02T07:00:00.000Z',groups:[A],lines:lines([[A,4,2]])})],{});
ok(cp[0].id==='n','a coupees egales : la plus recente d abord');
ok(/✂ Commencée sur MAVEG · BB — 19\/21 coupée\(s\) \(\+1\)/.test(_l545Badge(P1,C9,{myAutoId:'d_autosave_me_dev',myPost:'FEBA'}))&&_l545Badge('P9',C9,{})==='','pastille de la carte du plan');

console.log('── 5. B9 : fenetre « deja commencee » ──');
function fakeEl(){ return {style:{},onclick:null,textContent:'',innerHTML:'',classList:{_s:new Set(),add(c){this._s.add(c);},remove(c){this._s.delete(c);},contains(c){return this._s.has(c);}}}; }
const els={l545DejaModal:fakeEl(),l545DejaInfo:fakeEl(),l545DejaResume:fakeEl(),l545DejaLoad:fakeEl(),l545DejaCancel:fakeEl()};
const dctx={document:{getElementById:id=>els[id]||null},_l545AskRes:null,esc:global.esc,_l545Ago:global._l545Ago,confirm:()=>true};
const ask=withCtx(fnOf('_l545AskDeja'),dctx);
(async()=>{
  const cpA=[{id:'d_a',poste:'MAVEG',owner:'BB',vis:true,cut:21,total:21,savedAt:new Date(Date.now()-5*60000).toISOString(),auto:true,ici:false}];
  const p1=ask(cpA,cpA[0]);
  ok(els.l545DejaModal.classList.contains('open')&&/Reprendre ici — passation depuis MAVEG \(21\/21\)/.test(els.l545DejaResume.textContent)&&els.l545DejaResume.style.display==='','fenetre ouverte, bouton « Reprendre ici — passation depuis MAVEG »');
  ok(/Sur MAVEG · BB/.test(els.l545DejaInfo.innerHTML)&&/21\/21 coupée\(s\)/.test(els.l545DejaInfo.innerHTML)&&/il reste à l'ENVOYER/.test(els.l545DejaInfo.innerHTML),'detail lisible + « tout est coupe : il reste a l ENVOYER »');
  const p2=ask(cpA,null);
  ok((await p1)==='cancel','un 2e appel ANNULE le 1er (jamais de promesse orpheline)');
  ok(els.l545DejaResume.style.display==='none','pas de copie reprenable (L520) → bouton Reprendre masque');
  els.l545DejaLoad.onclick();
  ok((await p2)==='load'&&!els.l545DejaModal.classList.contains('open')&&els.l545DejaLoad.onclick===null,'« Charger quand meme » → load, fenetre fermee, boutons desarmes');
  const p3=ask(cpA,cpA[0]); els.l545DejaModal.onclick({target:els.l545DejaModal});
  ok((await p3)==='cancel','tap hors de la boite = Annuler');
  const p5=ask(cpA,cpA[0],{cut:5,total:15}); ok(/À l'écran \(cette commande\)<\/b> : <b style="color:var\(--orange\)">5\/15 coupée\(s\)/.test(els.l545DejaInfo.innerHTML),'meme commande a l ecran : la fenetre montre aussi ou en est l ecran'); els.l545DejaCancel.onclick(); await p5;
  const p4=ask([{id:'d_x',poste:'CEVENINI',owner:'',vis:false,cut:9,total:9,savedAt:new Date().toISOString(),auto:false,ici:false}],null);
  ok(/autre compte, pas dans tes brouillons/.test(els.l545DejaInfo.innerHTML)&&/demande au bureau/.test(els.l545DejaInfo.innerHTML)&&!/reprends-la/.test(els.l545DejaInfo.innerHTML),'copie invisible : « autre compte », jamais « reprends-la » sans bouton Reprendre');
  els.l545DejaCancel.onclick(); await p4;
  delete els.l545DejaModal; ok((await ask(cpA,null))==='load','fenetre absente → confirm natif (repli sur)');

  console.log('── 6. B9 : doLoad ──');
  const DL=fnOf('doLoad');
  const iSrv=DL.indexOf("get({source:'server'})"), iCp=DL.indexOf('_l545CopiesEntamees(s._id'), iG=DL.indexOf('if(!_l545Res && !isFicheUntouched())'), iL=DL.indexOf('loadedSaveId=s._id;');
  ok(iSrv>0&&iCp>iSrv&&iG>iCp&&iL>iG,'ordre : revérif serveur (un plan consomme ne declenche rien) < fenetre B9 < garde « commande en cours » < chargement');
  ok(DL.split('\n').slice(0,4).join('\n').indexOf('_l545AckId=null;')>0,'reponse « Charger quand meme » consommee des l entree');
  ok(/resumeDraft\(_best\.id,\{l545:true\}\); return;/.test(DL)&&!/resumeDraft\(_best\.id,\{l545:true\}\); return true/.test(DL),'« Reprendre » : resumeDraft puis return (jamais dans doLoad L113, jamais true L316)');
  const mk=(ans,touched,extra)=>{ const rec={ask:0,resume:[],conflict:0,audit:[]}; const c=Object.assign({loadTargetIdx:P1,_l545AckId:null,_shareCurrentDocId:()=>null,savesCache:[{_id:P1,client:'Client Alpha',numCmd:'CMD-001'}],db:null,
      _l545CopiesEntamees:global._l545CopiesEntamees,loadDrafts:()=>C9,_l545Ctx:()=>({myAutoId:'d_autosave_me_dev',myPost:'FEBA',visible:()=>true}),
      _l545AskDeja:async(cp,best)=>{ rec.ask++; rec.best=best; return ans; },closeLoadModal(){ c.loadTargetIdx=null; },isFicheUntouched:()=>!touched,
      resumeDraft:(id,o)=>{ rec.resume.push([id,o]); },openNewCmdConflictModal:()=>{ rec.conflict++; },logAudit:(...a)=>{ rec.audit.push(a); return {catch(){}}; },
      _pendingLoadId:null,_l545PendingResume:null,_newCmdResolved:false,showToast(){},confirm:()=>true,console},extra||{}); c.rec=rec; c.fn=withCtx(DL,c); return c; };
  let c=mk('cancel',true); let ret=await c.fn();
  ok(ret===undefined&&c.rec.ask===1&&c.rec.conflict===0&&c.rec.audit.length===0&&c.rec.resume.length===0,'Annuler : rien ne bouge (ni parcage, ni journal)');
  c=mk('resume',false); ret=await c.fn();
  ok(ret===undefined&&c.rec.resume.length===1&&c.rec.resume[0][0]==='d_a'&&c.rec.resume[0][1].l545===true&&c.rec.conflict===0,'Reprendre, ecran vide → reprise directe de la copie (passation nommee)');
  c=mk('resume',true); ret=await c.fn();
  ok(c.rec.resume.length===0&&c.rec.conflict===1&&c._l545PendingResume==='d_a'&&c._pendingLoadId===null,'Reprendre, commande a l ecran → Parquer/Effacer d abord (jamais le confirm destructif L72)');
  c=mk('load',true); ret=await c.fn();
  ok(ret===undefined&&c.rec.conflict===1&&c._pendingLoadId===P1&&c._l545AckId===P1&&c.rec.audit.length===1&&/« Charger quand même » choisi pour un plan DÉJÀ ENTAMÉ \(MAVEG BB 19\/21 ; CEVENINI 0\/20\)/.test(c.rec.audit[0][3]),'Charger quand meme + commande a l ecran → modale de conflit, reponse memorisee pour la relance, journal de la DECISION (vrai quelle que soit la suite)');
  c=mk('cancel',true,{_l545AckId:P1}); ret=await c.fn();
  ok(c.rec.ask===0&&c.rec.conflict===1&&c._l545AckId===null,'relance apres Parquer/Effacer : pas de 2e question');
  c=mk('cancel',false,{_newCmdResolved:true}); ret=await c.fn();
  ok(c.rec.ask===1&&c._newCmdResolved===false,'drapeau « relance » consomme des l entree, meme si la fenetre est annulee');
  c.isFicheUntouched=()=>false; c.loadDrafts=()=>[]; c.loadTargetIdx='Q1'; c.savesCache=[{_id:'Q1'}]; ret=await c.fn();
  ok(c.rec.conflict===1,'le chargement SUIVANT d un autre plan, commande entamee a l ecran → modale Parquer/Effacer (avant le correctif : sautee)');
  c=mk('resume',false,{_l545PendingResume:'d_vieux'}); c.isFicheUntouched=()=>false; c.loadDrafts=()=>[]; ret=await c.fn();
  ok(c.rec.conflict===1&&c._l545PendingResume===null,'nouvelle demande de chargement : une reprise restee en attente (Echap) est oubliee');
  ok(/c\.screenIds/.test(fnOf('_l545CopiesEntamees'))&&/screenIds:\[_resumedDraftId,_resumedForeignDraftId,_loadedSoldeDraftId\]/.test(fnOf('_l545Ctx')),'la copie dont l ecran est la suite n est jamais proposee');
  ok(_l545CopiesEntamees(P1,C9,{myAutoId:'d_autosave_me_dev',myPost:'FEBA',screenIds:['d_a']}).map(x=>x.id).join()==='d_park_b','… verifie : copie reprise exclue');
  c=mk('cancel',true,{loadDrafts:()=>[]}); ret=await c.fn();
  ok(c.rec.ask===0&&c.rec.conflict===1,'plan sans copie : comportement d avant');
  c=mk('resume',false,{_l545Ctx:()=>({myPost:'FEBA',visible:()=>false})}); ret=await c.fn();
  ok(c.rec.best===null&&c.rec.resume.length===0,'aucune copie visible (L520) : jamais de reprise proposee');
  ok(/_newCmdResolved=true;        \/\/ édition de plan : pas de modale parquer\/effacer\n  _l545AckId=id;/.test(fnOf('editSavedPlan')),'edition bureau (✏️) : pas de fenetre');

  console.log('── 7. F : effacement et parcage ──');
  const mkE=(cut,tot,sec,dlg,extra)=>{ const rec={dlg:[],audit:0,clear:0,load:0,resume:[],closed:0};
    const modal={classList:{remove(){ rec.closed++; }}};
    const c=Object.assign({ficheLines:Array.from({length:tot},(_,i)=>({id:'b'+i})),countCoupees:()=>cut,chronoSec:sec,fmtTimeFr:s=>s+' s',
      confirmDlg:async(m,o)=>{ rec.dlg.push([m,o]); if(dlg==='throw') throw new Error('x'); return dlg; },logAudit:(a)=>{ if(a==='discard') rec.audit++; return {catch(){}}; },
      document:{getElementById:id=>id==='newCmdConflictModal'?modal:{value:''}},_newCmdClearLiveFiche:()=>{ rec.clear++; },_l545PendingResume:null,
      resumeDraft:(id,o)=>{ rec.resume.push([id,o]); },doLoad:()=>{ rec.load++; },_newCmdResolved:false,loadTargetIdx:null,_pendingLoadId:'P7',_l545AckId:null,console:{warn(){},log(){}}},extra||{});
    c.rec=rec; c.fn=withCtx(fnOf('newCmdErase'),c); return c; };
  let e=mkE(5,15,0,false); await e.fn();
  ok(e.rec.dlg.length===1&&/5 bobine\(s\) DÉJÀ COUPÉE\(S\) sur 15/.test(e.rec.dlg[0][0])&&e.rec.dlg[0][1].ok==='Effacer les 5 coupée(s)'&&e.rec.audit===0&&e.rec.clear===0&&e.rec.closed===0,'5 coupees : 2e confirmation CHIFFREE ; « Retour » → rien efface, modale toujours ouverte');
  e=mkE(5,15,0,true); await e.fn();
  ok(e.rec.audit===1&&e.rec.clear===1&&e.rec.load===1&&e.loadTargetIdx==='P7','confirme : journal ISO, fiche videe, plan charge');
  e=mkE(15,15,0,false); await e.fn(); ok(/TOUT est coupé : envoie plutôt la commande/.test(e.rec.dlg[0][0]),'tout coupe : conseil « envoie plutot »');
  e=mkE(0,15,0,false); await e.fn(); ok(e.rec.dlg.length===0&&e.rec.clear===1,'0 coupee, chrono < 1 min : un seul tap, comme avant');
  e=mkE(0,15,600,false); await e.fn(); ok(e.rec.dlg.length===1&&/Chrono déjà lancé/.test(e.rec.dlg[0][0])&&e.rec.clear===0,'chrono lance (≥ 1 min) sans coupee : 2e confirmation aussi (definition L440)');
  e=mkE(3,9,0,'throw'); await e.fn(); ok(e.rec.clear===0&&e.rec.audit===0,'erreur dans la confirmation : on n efface PAS (fail-closed)');
  e=mkE(3,9,0,true,{_l545PendingResume:'d_a'}); await e.fn(); ok(e.rec.resume.length===1&&e.rec.resume[0][1].cleared===true&&e.rec.load===0,'effacer puis REPRENDRE la copie choisie (B9)');
  const NE=fnOf('newCmdErase'); ok(/^async function newCmdErase/.test(NE)&&NE.indexOf('confirmDlg(')<NE.indexOf("logAudit('discard'"),'confirmation AVANT le journal et le vidage');

  const mkP=(saved,nLines,training,extra)=>{ const rec={clear:0,load:0,resume:[],toast:[]};
    const c=Object.assign({document:{getElementById:()=>({classList:{remove(){}}})},chronoRunning:false,chronoPause(){},_savingDraftManual:false,saveDraftManual:async()=>saved,trainingGuard:()=>training,
      ficheLines:Array.from({length:nLines},(_,i)=>({id:'b'+i})),showToast:(m)=>rec.toast.push(m),_localCopyFromShare:null,_newCmdClearLiveFiche:()=>{ rec.clear++; },
      _l545PendingResume:null,resumeDraft:(id,o)=>{ rec.resume.push([id,o]); c._resumedDraftId=id; },doLoad:()=>{ rec.load++; rec.ack=c._l545AckId; },loadTargetIdx:null,_pendingLoadId:'P7',_newCmdResolved:false,_l545AckId:null,_l545LastSup:[],_resumedDraftId:null,loadDrafts:()=>[],console,setTimeout},extra||{});
    c.rec=rec; c.fn=withCtx(fnOf('newCmdPark'),c); return c; };
  let p=mkP(false,4,false); await p.fn();
  ok(p.rec.clear===0&&p.rec.load===0&&/RESTE à l'écran/.test(p.rec.toast[0]||'')&&p._pendingLoadId===null,'parcage ECHOUE : la commande reste a l ecran (avant : videe quand meme)');
  p=mkP('d_new',4,false); await p.fn(); ok(p.rec.clear===1&&p.rec.load===1&&p.loadTargetIdx==='P7'&&p.rec.ack==='P7','parcage reussi : vidage puis chargement, comme avant (relance sans 2e fenetre « deja commencee »)');
  p=mkP(undefined,4,true); await p.fn(); ok(p.rec.clear===1&&p.rec.load===1,'entrainement : inchange');
  p=mkP('d_new',4,false,{_l545PendingResume:'d_a',loadDrafts:()=>[{id:'d_a'}]}); await p.fn(); ok(p.rec.resume.length===1&&p.rec.resume[0][1].l545===true&&p.rec.resume[0][1].cleared===true&&p.rec.load===0,'parquer puis REPRENDRE la copie choisie (B9)');
  p=mkP('d_new',4,false,{_l545PendingResume:'d_a',loadDrafts:()=>[{id:'d_a',consumed:true}]}); p.saveDraftManual=async()=>{ p._l545LastSup=['d_a']; return 'd_new'; }; await p.fn();
  ok(p.rec.resume.length===1&&p.rec.resume[0][0]==='d_new'&&/version à jour est reprise/.test(p.rec.toast.join(' ')),'copie choisie = version PLUS ANCIENNE de l ecran, remplacee par CE parcage → la version a jour est reprise (message apres la reprise)');
  p=mkP('d_new',4,false,{_l545PendingResume:'d_a',loadDrafts:()=>[{id:'d_a',consumed:true}]}); await p.fn();
  ok(p.rec.resume[0][0]==='d_new'&&/n'est plus disponible/.test(p.rec.toast.join(' ')),'copie choisie disparue entre-temps (envoyee/supprimee ailleurs) → l ecran d avant revient, message exact');
  p=mkP('d_new',4,false,{_l545PendingResume:'d_a',loadDrafts:()=>[{id:'d_a'}]}); await p.fn();
  ok(p.rec.resume[0][0]==='d_a'&&!/ℹ/.test(p.rec.toast.join(' ')),'copie choisie toujours la → c est elle qui est reprise');
  { const cutL=n=>Array.from({length:10},(_,i)=>({coupee:i<n}));
    p=mkP('d_new',4,false,{_l545PendingResume:'d_a',loadDrafts:()=>[{id:'d_a',state:{loadedSaveId:'P1',lines:cutL(2)}},{id:'d_new',state:{loadedSaveId:'P1',lines:cutL(5)}}]}); await p.fn();
    ok(p.rec.resume[0][0]==='d_a'&&/Ta commande parquée avait 5 coupée\(s\), cette copie 2/.test(p.rec.toast.join(' ')),'copie choisie MOINS avancee que la commande parquee (meme plan) : reprise comme demande, avertissement chiffre'); }
  p=mkP('d_new',0,false); await p.fn(); ok(p.rec.clear===1,'fiche sans bobine : comportement d avant');
  const SD=fnOf('saveDraftManual');
  ok((SD.match(/return false;/g)||[]).length===5&&/return \(firestore\|\|local\)\?draft\.id:false;[^\n]*\n  \}finally\{/.test(SD),'saveDraftManual dit s il a reellement parque (5 refus ; id du brouillon si un support a tenu)');
  ok(/\(_l545Res \? |_newCmdResolved=true;\n  loadTargetIdx=_pendingLoadId; _pendingLoadId=null; _l545AckId=loadTargetIdx;/.test(fnOf('newCmdErase')),'effacer puis charger : relance sans 2e fenetre');
  ok(/_pendingLoadId=null; _newCmdResolved=false; _l545PendingResume=null; _l545AckId=null;/.test(fnOf('closeNewCmdConflictModal')),'Annuler la modale de conflit oublie les reponses B9');
  const OC=fnOf('openNewCmdConflictModal');
  ok(/C\\'est LA MÊME commande que celle à l\\'écran/.test(OC)&&/Effacer — '\+done\+' coupée\(s\) PERDUE\(S\)/.test(OC)&&/eb\.className=done>0\?'btn btn-ghost':'btn btn-red'/.test(OC),'modale de conflit : « la MEME commande », effacement chiffre et plus rouge a cote du vert');
  ok(/id="newCmdParkBtn"/.test(src)&&/id="newCmdEraseBtn"/.test(src)&&/id="l545DejaModal" style="z-index:100000"/.test(src),'boutons identifies + fenetre « deja commencee » au-dessus de tout (L79)');

  console.log('── 8. B10 : reprise ──');
  const MR=fnOf('maybeResumeRunningChrono');
  const iCons=MR.indexOf('if(d && d.consumed) d=null;'), iF=MR.indexOf('await _l545FindSent(d)'), iRes=MR.indexOf('restoreFicheState(d.state); _rearmResume(d.state); showPage(1);'), iGraft=MR.indexOf('let c=(d&&d.state&&d.state.chrono)');
  ok(iCons>0&&iF>iCons&&iF<iGraft&&iRes>iF,'reprise auto : controle « deja envoyee » apres la garde consumed, AVANT la greffe du chrono et la restauration');
  ok(/pas de reprise automatique \(rien n\\'est effacé\)/.test(MR)&&/_l545Told\[d\.id\]/.test(MR)&&!/confirm\(/.test(MR.slice(iF,iRes)),'un message (pas de confirm : L414), une fois par session');
  ok(/localStorage\.removeItem\(CHRONO_LS_KEY\); if\(live&&live\.began&&_chronoRunBeganAt===live\.began\) _chronoRunBeganAt=null;/.test(MR)&&MR.indexOf('localStorage.removeItem(CHRONO_LS_KEY)')<MR.indexOf('restoreFicheState(d.state)'),'refus : la cle du chrono « en direct » de la commande refusee est retiree (elle aurait ete greffee sur la commande suivante)');
  { const live={startTs:'2026-10-07T07:00:00.000Z',runStart:1,began:5}; let removed=0; const bctx={localStorage:{removeItem:()=>removed++},CHRONO_LS_KEY:'k',_chronoRunBeganAt:5};
    const purge=MR.slice(MR.indexOf("try{ const _c5="),MR.indexOf("return;",MR.indexOf("try{ const _c5=")));
    const run=(d,lv)=>{ removed=0; bctx._chronoRunBeganAt=5; new Function('ctx','d','live','with(ctx){ '+purge+' }')(bctx,d,lv); return removed; };
    ok(run({savedAt:'2026-10-06T15:00:00.000Z',state:{chrono:{startTs:'2026-10-07T07:00:00.000Z'}}},live)===1&&bctx._chronoRunBeganAt===null,'… cle de la MEME commande (meme startTs) : retiree');
    ok(run({savedAt:'2026-10-07T09:00:00.000Z',state:{chrono:{startTs:null}}},live)===1,'… cle plus ancienne que le brouillon refuse : retiree');
    ok(run({savedAt:'2026-10-06T15:00:00.000Z',state:{chrono:{startTs:'2026-10-06T08:00:00.000Z'}}},live)===0,'… cle d une AUTRE commande lancee apres : intacte');
    ok(run({savedAt:'2026-10-07T09:00:00.000Z',state:{chrono:{startTs:null}}},Object.assign({},live,{mir:'x'}))===0,'… temps d une vue miroir : intact (L298)'); }
  { const MW=withCtx(fnOf('_l545MmWhere'),{loadDrafts:()=>[{id:'d_solde_MM',fromFicheId:'MM'}]}); const MW2=withCtx(fnOf('_l545MmWhere'),{loadDrafts:()=>[{id:'d_solde_MM',fromFicheId:'MM',consumed:true}]});
    ok(MW({fiche:{_id:'MM'}})==='le reste est dans le brouillon ⛔ Solde'&&/n'est PAS sur cette copie/.test(MW2({fiche:{_id:'MM'}}))&&/n'est PAS sur cette copie/.test(MW({fiche:{_id:'X'}})),'manque matiere : « brouillon Solde » cite SEULEMENT s il existe encore (sinon plan du reste / formule neutre)'); }
  ok(/arrêt MANQUE MATIÈRE déjà envoyé /.test(MR)&&/Un arrêt MANQUE MATIÈRE de cette commande a DÉJÀ été envoyé /.test(fnOf('resumeDraft')),'textes propres a l arret manque matiere (le reste est dans le brouillon Solde)');
  const MP=fnOf('maybeResumePlan');
  ok(MP.indexOf('await _l545FindSent(d)')>0&&MP.indexOf('await _l545FindSent(d)')<MP.indexOf('restoreFicheState(d.state)')&&/if\(await _l545FindSent\(d\)\) return;\n    if\(\(ficheLines&&ficheLines\.length\)\|\|chronoRunning\|\|\(typeof planHasContent==='function'&&planHasContent\(\)\)\) return;/.test(MP),'saisie plan : meme controle, puis revérification apres l attente (rien n est ecrase)');
  const RD=fnOf('resumeDraft');
  ok(/^function resumeDraft\(id,opt\)\{/.test(RD)&&/!d\.consumed&&!_o545\.l545&&!confirm\('🔁 Brouillon de la tablette '/.test(RD)&&/if\(!_o545\.cleared\) try\{/.test(RD)&&/Une sauvegarde AUTO plus récente existe/.test(RD),'reprise manuelle : options B9 additives, textes L365/L287 inchanges');
  ok(RD.indexOf('// DRAFT-4')<RD.indexOf('_l545SentInfo(d,')&&RD.indexOf('_l545SentInfo(d,')<RD.indexOf('restoreFicheState(d.state)')&&/DÉJÀ été ENVOYÉE/.test(RD),'reprise manuelle d une commande deja partie : confirmation (jamais un blocage)');
  // _l545FindSent : memo, requete ciblee unique, hors ligne = reprise comme avant
  { const q={n:0}; const fctx={_l545Memo:{},_l545Asked:{},fichesCache:[],_l545SentInfo:global._l545SentInfo,console:{warn(){}},
      raceTimeout:(p)=>p,db:{collection:()=>({where:(f,op,v)=>({limit:()=>({get:async()=>{ q.n++; q.v=v; return {forEach:cb=>[fiche({id:'FX',date:'2026-08-26T07:00:00.000Z',ref:A+' + '+B,detail:det([[A,10],[B,4]])})].forEach(x=>cb({id:x._id,data:()=>x}))}; }})})})}};
    const FS=withCtx(fnOf('_l545FindSent'),fctx);
    const s1=await FS(RW), s2=await FS(RW);
    ok(s1&&s1.kind==='sent'&&s1.fiche._id==='FX'&&q.n===1&&q.v==='CMD-001'&&s2===s1,'fiches pas encore chargees : UNE requete ciblee sur le n°, resultat memorise');
    const W2=draft({id:'d_w2',groups:[A],lines:lines([[A,2,0]])}); fctx.db={collection:()=>({where:()=>({limit:()=>({get:async()=>{ q.n++; throw new Error('offline'); }})})})};
    const n0=q.n; const s3=await FS(W2), s4=await FS(W2);
    ok(s3===null&&s4===null&&q.n===n0+1,'hors ligne : null (reprise comme avant) et pas de nouvelle requete pour la meme version');
    ok((await FS(draft({id:'d_w3',num:'',groups:[A],lines:lines([[A,2,0]])})))===null,'sans n° : aucune requete, aucune preuve'); }

  console.log('── 9. B11 : rangement a l envoi ──');
  const iV=src.indexOf('const _victims=(Array.isArray(brouillonsCache)?brouillonsCache:[]).filter(d=>');
  const body=braceFrom(src.indexOf('d=>',iV)+3);
  const mkV=(o)=>{ const c=Object.assign({_resumedDraftId:null,_loadedSoldeDraftId:null,nrm:global.nrm,client:'Client Alpha',ref:A,_ncSend:'CMD-001',_kSend:'',_mineIni:'',_machinePostName:()=>'CEVENINI',
      _l545Uncovered:global._l545Uncovered,_l545Code:global._l545Code,_l545Count:global._l545Count,_l545Sent:[_l545Code(A)],_l545Fc:{'90000001':99,'90000002':99,'90000003':99},_l545CutIds:new Set(),_l545Kept:[]},o||{}); c.f=new Function('ctx','with(ctx){ return function(d)'+body+'; }')(c); return c; };
  const V=(o)=>draft(Object.assign({id:'d_v',ownerPost:'CEVENINI',owner:'BB'},o));
  let v=mkV({ref:A+' + '+B,_l545Sent:[_l545Code(A),_l545Code(B)]});
  ok(v.f(V({groups:[A,B,C],lines:lines([[A,4,2],[B,3,3],[C,4,0]])}))===false&&v._l545Kept.length===1&&v._l545Kept[0].unc[0]==='90000003','multi-ref, une ref absente de l envoi → GARDE et signale');
  v=mkV({ref:A+' + '+B,_l545Sent:[_l545Code(A),_l545Code(B)]});
  ok(v.f(V({groups:[A,B],lines:lines([[A,4,2],[B,3,3]])}))===true&&v._l545Kept.length===0,'multi-ref, tout envoye → RANGE (avant : jamais, plan.ref ≠ « A + B »)');
  v=mkV(); ok(v.f(V({groups:[A],lines:lines([[A,3,3]])}))===true,'mono-ref meme commande → range, comme avant');
  v=mkV({ref:'90000001 - Film A v2',_l545Sent:[_l545Code('90000001 - Film A v2')]}); ok(v.f(V({groups:[A],lines:lines([[A,3,3]])}))===true,'ref renommee (meme code) → range');
  v=mkV(); ok(v.f(V({ownerPost:'MAVEG',groups:[A],lines:lines([[A,3,3]])}))===false,'autre tablette → jamais (L365)');
  v=mkV({_ncSend:''}); ok(v.f(V({num:'',groups:[A],lines:lines([[A,3,3]])}))===false,'n° vide → jamais (L128)');
  v=mkV(); ok(v.f(V({client:'Client Beta',groups:[A],lines:lines([[A,3,3]])}))===false&&v.f(V({num:'CMD-002',groups:[A],lines:lines([[A,3,3]])}))===false,'autre client ou autre n° → jamais (homonymes)');
  v=mkV({_machinePostName:()=>'',_mineIni:'?'}); ok(v.f(V({ownerPost:'',owner:'?',groups:[A],lines:lines([[A,3,3]])}))===false,'identite inconnue « ? » → jamais (L156)');
  v=mkV(); ok(v.f(V({groups:[A,A],lines:lines([[A,6,0]])}))===false&&v._l545Kept.length===1,'ref en double, envoyee une fois → garde');
  v=mkV(); ok(v.f(V({groups:[A,B],lines:lines([[A,3,3],[B,2,0]])}))===false,'brouillon A+B, envoi de A seul → GARDE (avant : range en silence avec B)');
  v=mkV(); ok(v.f(V({id:'d_autosave_x',groups:[A],lines:lines([[A,3,3]])}))===false&&v.f(V({fromFicheId:'M1',groups:[A],lines:lines([[A,3,3]])}))===false,'sauvegarde auto et solde : jamais (inchange)');
  v=mkV({ref:A+' + '+A,_l545Sent:[_l545Code(A),_l545Code(A)],_l545Fc:{'90000001':17}});
  ok(v.f(V({groups:[A,A],lines:lines([[A,26,10]])}))===false&&v._l545Kept.length===1&&v._l545Kept[0].short[0]==='90000001','cas reel de septembre : brouillon 10/26 face a un plan du RESTE de 17 bobines envoye → GARDE (ses 10 coupes ne sont dans aucune fiche)');
  v=mkV({_l545Fc:{'90000001':3}}); ok(v.f(V({groups:[A],lines:lines([[A,3,3]])}))===true,'meme nombre de bobines → range');
  v=mkV({_l545Fc:{'90000001':11},_l545CutIds:new Set(['l0','l1','l2','l3'])}); ok(v.f(V({groups:[A],lines:lines([[A,12,4]])}))===true&&v._l545Kept.length===0,'💾 puis une bobine ✕ avant l envoi : ses coupees sont dans la fiche (memes ids) → range, pas de fausse alerte');
  v=mkV({ref:'—',_l545Sent:[''],_l545Fc:{'':16}}); ok(v.f(V({groups:[''],lines:lines([['',26,10]])}))===false&&v._l545Kept.length===1&&v._l545Kept[0].short[0]==='','reference SANS NOM : brouillon 10/26 face a un reste de 16 → GARDE (L544 le gardait aussi)');
  v=mkV({ref:'—',_l545Sent:[''],_l545Fc:{'':26}}); ok(v.f(V({groups:[''],lines:lines([['',26,10]])}))===true,'reference sans nom, envoi identique → range');
  v=mkV({_resumedDraftId:'d_r',ref:A+' + '+B,_l545Sent:[_l545Code(A),_l545Code(B)]}); ok(v.f(V({id:'d_r',ownerPost:'MAVEG',groups:[A,B,C],lines:lines([[A,1,1],[B,1,1],[C,1,0]])}))===true,'brouillon REPRIS : regle L245 inchangee (n° egal) — protection anti double reprise');
  const SV=src.slice(iV-2000,iV+9000);
  ok(/const _l545Sent=multi\?computed\.map\(function\(c\)\{ return _l545Code\(c\.ref\|\|'\?'\); \}\):\[_l545Code\(\(computed\[0\]&&computed\[0\]\.ref\)\|\|ref\)\];/.test(SV)&&/const _l545Fc=_l545Count\(ficheDetailTagged\.map/.test(SV),'codes envoyes = blocs reellement decoupes (mono : pas forcement le bloc 0) ; bobines envoyees comptees sur la fiche');
  ok(/Vérifie AVANT de le supprimer \(pas de corbeille\) : ses coupées peuvent n\\'être dans aucune fiche/.test(SV)&&!/bobine retirée \?/.test(SV)&&/setTimeout\(function\(\)\{ try\{ showToast\(_kMsg,'err'\); \}catch\(_\)\{\} \},4500\);/.test(SV)&&/Brouillon CONSERVÉ à l\\'envoi/.test(SV)&&/Brouillon repris RANGÉ à l\\'envoi alors que ces réf\. sont hors fiche/.test(SV),'rien de silencieux : message apres « ✓ Commande confirmee » + journal (garde ou repris range)');
  { const SMD=fnOf('_supersededManualDrafts');
    const mkS=(pending,cache)=>withCtx(SMD,{brouillonsCache:cache,_ini:()=>'?',_machinePostName:()=>'FEBA',_resumedDraftId:null,_isSharedDoc:()=>false,nrm:global.nrm,_l545Uncovered:global._l545Uncovered,_l545DraftCodes:global._l545DraftCodes,_l545PendingResume:pending});
    const idl=(n,cutIds)=>Array.from({length:n},(_,i)=>({id:'x'+i,ref:A,coupee:cutIds.indexOf('x'+i)>=0}));
    const Mk=(id,lsid,L)=>Object.assign(draft({id:id,ownerPost:'FEBA',loadedSaveId:lsid,groups:[A],lines:L}),{label:'Client Alpha / CMD-001'});
    const NEW=Mk('d_new','P1',idl(20,['x0','x1']));
    ok(mkS('d_M',[Mk('d_M','P1',idl(20,['x2','x3','x4','x5','x6','x7','x8','x9']))])('d_new','Client Alpha / CMD-001',NEW).length===0,'copie DEMANDEE plus avancee (8/20, autres coupes) : jamais remplacee par le parcage');
    ok(mkS('d_M',[Mk('d_M','P2',idl(20,['x0']))])('d_new','Client Alpha / CMD-001',NEW).length===0,'copie demandee d un AUTRE plan (meme libelle) : jamais remplacee');
    ok(mkS('d_M',[Mk('d_M','P1',idl(20,['x0']))])('d_new','Client Alpha / CMD-001',NEW).length===1,'copie demandee = version plus ancienne de CE parcage (ses coupes y sont) : remplacee comme avant');
    ok(mkS(null,[Mk('d_M','P1',idl(20,['x5']))])('d_new','Client Alpha / CMD-001',NEW).length===1,'sans reprise demandee : regle L109 inchangee (meme avancement)');
    ok(mkS(null,[Mk('d_M','P1',idl(20,['x2','x3','x4']))])('d_new','Client Alpha / CMD-001',NEW).length===1,'L109 hors reprise demandee : regle d avant inchangee (meme libelle, meme poste → remplace, y compris apres un de-marquage volontaire)');
    const ren=(L)=>L.map((l,i)=>Object.assign({},l,{id:'r'+i,label:'BOB-'+i}));   // ids renouvelles par une restauration
    const Lold=idl(20,['x0']).map((l,i)=>Object.assign({},l,{label:'BOB-'+i})), Lnew=ren(idl(20,['x0','x1','x2']));
    ok(mkS('d_M',[Mk('d_M','P1',Lold)])('d_new','Client Alpha / CMD-001',Mk('d_new','P1',Lnew)).length===1,'apres un RECHARGEMENT (ids renouvelles) : la copie plus ancienne de l ecran est reconnue par position (meme bobine coupee) et remplacee');
    const Lnew2=ren(idl(20,['x5','x6','x7']));
    ok(mkS('d_M',[Mk('d_M','P1',Lold)])('d_new','Client Alpha / CMD-001',Mk('d_new','P1',Lnew2)).length===0,'apres un rechargement, coupes DIFFERENTES : pas un predecesseur, gardee');
    ok(mkS('d_M',[Mk('d_M','P1',Lold)])('d_new','Client Alpha / CMD-001',Mk('d_new','P1',ren(idl(19,['x0','x1'])))).length===0,'nombre de lignes different et ids renouvelles : gardee (prudence)'); }
  ok(/if\(hasNum&&d\.label===newLabel&&typeof _l545Uncovered==='function'&&typeof _l545DraftCodes==='function'&&_l545Uncovered\(d,_l545DraftCodes\(newDraft\)\)\.length\) return false;/.test(fnOf('_supersededManualDrafts')),'💾 : une ancienne version contenant une ref absente de la nouvelle n est plus remplacee');

  console.log('── 10. A5 : carte brouillon ──');
  const RDR=fnOf('renderDrafts');
  ok(/_l545SentInfo\(d,_by\[n\]\)/.test(RDR)&&/drafts=drafts\.filter\(function\(d\)\{ return !_dn\(d\); \}\)\.concat\(drafts\.filter\(_dn\)\);/.test(RDR),'etat d envoi calcule une fois par rendu ; les « deja envoyees » en bas');
  ok(/'<b>'\+_cut\+'\/'\+nb\+' coupée\(s\)<\/b>'/.test(RDR)&&/_age>2\*86400000\?' style="color:var\(--red\);font-weight:700"'/.test(RDR)&&/✓ Déjà envoyée /.test(RDR)&&/'◐ Une fiche'\+\(_si\.mm\?' \(manque matière\)':''\)\+' de cette commande est déjà partie '/.test(RDR),'« x/N coupees », anciennete rouge apres 2 jours, « deja envoyee » / « deja partie »');
  ok(/data-l545sent="1"/.test(RDR)&&/<\/div>\$\{_sentH\}\$\{_oldH\}/.test(RDR)&&/\.save-card\[data-l545sent="1"\],\.save-card\.poste-other\[data-l545sent="1"\]\{opacity:\.62\}/.test(src)&&/⛔ Arrêt manque matière envoyé /.test(RDR),'carte grisee (attribut dedie : le style tient les marqueurs L365)');
  ok(/const _l520c=_l520DraftCtx\(\);/.test(RDR)&&/\.filter\(function\(d\)\{ return _l520DraftVisible\(d,_l520c\); \}\)/.test(RDR),'L520 intact : on filtre l affichage, jamais la source');
  ok(/\$\{_l545C\?_l545Badge\(s\._id,_l545D,_l545C\):''\}/.test(fnOf('renderSaves')),'Donnees > Plans : pastille « ✂ Commencee sur … »');

  console.log('── 10b. revue adverse : mode Modifier, Echap ──');
  const RD2=fnOf('resumeDraft');
  ok(/restoreFicheState\(d\.state\);\n  editingSaveId=null; _editSaveBase=null; try\{ updateSaveBtnLabel\(\); \}catch\(e\)\{\}/.test(RD2)&&RD2.indexOf('editingSaveId=null')>RD2.indexOf('if(d.consumed)'),'reprise : le mode ✏️ Modifier d un AUTRE plan tombe (sinon « Modifier le plan » l ecrasait) — apres la restauration seulement');
  const ESC=src.slice(src.indexOf("document.addEventListener('keydown',function(e){\n  if(e.key==='Escape'){"),src.indexOf("document.addEventListener('keydown',function(e){\n  if(e.key==='Escape'){")+900);
  ok(/if\(_cd&&_cd\.style\.display==='flex'\) return;/.test(ESC)&&/open\.id==='newCmdConflictModal'\)\{ closeNewCmdConflictModal\(\); return; \}/.test(ESC)&&/open\.id==='l545DejaModal'&&_l545AskRes\)\{ _l545AskRes\('cancel'\); return; \}/.test(ESC),'Echap : confirmation = « Retour » seul ; modale de conflit et fenetre « deja commencee » = Annuler (etat remis a zero)');

  console.log('── 11. B15 : synchro des brouillons ──');
  { let now=0; const timers=[]; const errs=[]; const toasts=[]; let subs=0, live=0, rearm=0, rearmStop=0;
    const bctx={Date:{now:()=>now},window:{},showToast:(m)=>toasts.push(m),console:{warn(){}},currentRole:'operateur',
      setTimeout:(f,ms)=>{ timers.push({f,at:now+ms,id:timers.length}); return timers.length-1; },clearTimeout:(id)=>{ if(timers[id]) timers[id].f=null; },
      _l542RearmArm:(k,fn)=>{ rearm++; bctx._rearmFn=fn; },_l542RearmStop:()=>{ rearmStop++; },brouillonsCache:[],_brouillonsUnsub:null,
      db:{collection:()=>({orderBy:()=>({limit:()=>({onSnapshot:(ok2,err)=>{ subs++; live++; errs.push(err); return ()=>{ live--; }; }})})})}};
    const start=withCtx(fnOf('startBrouillons'),bctx); bctx.startBrouillons=start; const stop=withCtx(fnOf('stopBrouillons'),bctx);
    const tick=(ms)=>{ now+=ms; timers.forEach(t=>{ if(t.f&&t.at<=now){ const f=t.f; t.f=null; f(); } }); };
    start(); start(); ok(subs===1,'double appel : un seul abonnement (garde d idempotence)');
    for(let i=0;i<5;i++){ errs[errs.length-1]({message:'refus'}); live--; tick(60000); }
    ok(subs===6&&bctx.window._l373BrRetries===5,'refus serveur repete : 5 relances rapides');
    errs[errs.length-1]({message:'refus'}); live--;
    ok(rearm===1&&/Synchro des brouillons ARRÊTÉE — nouvel essai au retour du réseau/.test(toasts[toasts.length-1]),'6e echec : plus d abandon pour la session → relance au retour du reseau / toutes les 5 min (L542), dit une fois');
    bctx._rearmFn(); ok(subs===7,'la relance L542 se reabonne');
    const nT=toasts.length; errs[errs.length-1]({message:'refus'}); ok(rearm===2&&toasts.length===nT,'nouvel echec rapide : re-armement SILENCIEUX');
    bctx._rearmFn(); now+=120000; errs[errs.length-1]({message:'coupure'});
    ok(bctx.window._l373BrRetries===1&&/interrompue/.test(toasts[toasts.length-1]),'erreur isolee apres > 1 min de vie : compteur remis a zero (nouvelle serie d essais)');
    stop(); const before=subs; tick(60000);
    ok(subs===before&&bctx.window._l373BrRetries===0&&rearmStop>=1,'deconnexion : relances desarmees, compteur a zero');
    bctx.currentRole=null; bctx._brouillonsUnsub=null; start(); errs[errs.length-1]({message:'x'}); const b2=subs; tick(60000); ok(subs===b2,'plus connecte : aucune relance'); }
  ok(/\[L373 · audit chrono E6\] un listener mort gelait/.test(fnOf('startBrouillons')),'commentaire L373 E6 conserve (gardien)');

  console.log('\n'+(fail?('❌ '+fail+' echec(s) sur '+total):('🏆 L545 : '+total+'/'+total+' verts')));
  process.exit(fail?1:0);
})().catch(e=>{ console.error('❌ exception',e); process.exit(1); });
