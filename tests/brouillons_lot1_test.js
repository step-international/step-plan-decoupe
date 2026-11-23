// brouillons_lot1_test.js — [L564 · brouillons fiables, LOT 1 · demande de la responsable qualité du 20/11/2026 : « le travail de découpe ne doit plus JAMAIS être perdu »]
// Joue les VRAIES fonctions extraites de index.html (autosaveDraftTick, clearCurrentDraft, _supersededManualDrafts, renderDrafts, persistDrafts,
// boundedWrite…) avec un cache et une FAUSSE BASE en mémoire (set / delete, refus simulé, écriture qui ne répond jamais = mise en file).
//   T1 archive avant écrasement · T2 l'archive est reprenable · T3 version en recul + idempotence · T4 correction du n° : aucune archive ·
//   T5 envoi normal : rien en plus · T6 marqueur « consommé » d'une AUTRE commande levé · T7 même commande : toujours bloquée ·
//   T8 un parcage plus ancien ne consomme pas un parcage plus avancé · T9 liste lisible (x/N + bandeau) · T10 câblage (ordre, bornes, scènes).
//   v3 (contre-lecture adverse) : T13 F3 lecture avant écriture à l'aveugle · T14 F1 ↺ archive avant suppression · T15 F4 coupée hors du nouvel état · T16 F6 même écran qui continue · T17 F7 chrono figé.
// Donnees FICTIVES uniquement (depot public). Ne couvre pas le navigateur : voir les scenes « brouillons-perte » et « brouillons-liste » de tests/shot.mjs.
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const shot=fs.readFileSync(path.join(__dirname,'shot.mjs'),'utf8');
const bat=fs.readFileSync(path.join(__dirname,'battery.sh'),'utf8');
let ci=''; try{ ci=fs.readFileSync(path.join(ROOT,'.github','workflows','static.yml'),'utf8'); }catch(e){}
const gardien=fs.readFileSync(path.join(__dirname,'audit_regress_test.js'),'utf8');
function fnOf(n){ const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m'); const m=src.match(re); if(!m) throw new Error('introuvable '+n); const i=m.index+m[0].length-m[0].trimStart().length; let k=src.indexOf('{',i),d=0; for(let j=k;j<src.length;j++){ const c=src[j]; if(c==='{')d++; else if(c==='}'){ d--; if(d===0) return src.slice(i,j+1); } } throw new Error('accolades '+n); }
const present=n=>{ try{ fnOf(n); return true; }catch(e){ return false; } };
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c===true?'✅ ':'❌ ')+m); if(c!==true)fail++; };
const T=f=>{ try{ return f(); }catch(e){ console.log('   (exception : '+(e&&e.message||e)+')'); return false; } };
const TA=async f=>{ try{ return await f(); }catch(e){ console.log('   (exception : '+(e&&e.message||e)+')'); return false; } };
const clone=x=>JSON.parse(JSON.stringify(x));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const settle=async()=>{ for(let i=0;i<8;i++) await new Promise(r=>setImmediate(r)); };
const NRM=(function(){ const m=/^const nrm=(.*?);[ \t]*(?:\/\/.*)?$/m.exec(src); return m?eval('('+m[1]+')'):(v=>String(v==null?'':v).trim().toLowerCase()); })();   /* la VRAIE normalisation */

/* fonctions du source jouées telles quelles (celles du lot sont chargées si elles existent : sur L561 elles manquent, les tests rougissent) */
const FN_BASE=['_isSharedDoc','loadDrafts','persistDrafts','_draftStrip','_stripDataOverBudget','_draftSet','_draftDelete','boundedWrite','_bw','isoNow','autosaveId','planAutosaveId','autosaveDraftTick','clearCurrentDraft','_supersededManualDrafts','_consumeSupersededDrafts','_draftFallbackRemove','_l545Code','_l545Count','_l545DraftCodes','_l545Uncovered','_l520DraftVisible','_l430IsResidualDraft','_l430ValidatedCmdKeys','_l545SentInfo','resetSiteConfirm'];
const FN_LOT=['_l564Hash','_l564Coupees','_l564Ident','_l564MemeCommande','_l564ArchiveDe','_l564Existe','_l564Alerte','_l564Archiver','_l564PlusAvance','_l564LigneXN','_l564Bandeau','_l564ArchiveEnvoyee','_l564MemeEcran','_l564CoupeeHors','_l564Lire'];
const declOf=n=>{ const m=new RegExp('^(?:let|const) '+n+'\\s*=[^\\n]*','m').exec(src); return m?m[0]:''; };   /* déclarations de premier niveau lues dans le source (borne, verrou, journal des archives) */
const DECL=['_STRIP_TOTAL_MAX','_l564Busy','_l564Fait','_l564AlerteAt','_l564Rejeu','_l564LuForce'].map(declOf).filter(Boolean).join('\n');
const SRC_FN=DECL+'\n'+FN_BASE.concat(FN_LOT).filter(present).map(fnOf).join('\n');

/* ---------- le monde : cache, fausse base, état de l'écran ---------- */
function monde(o){
  o=o||{};
  const E={store:{},tickCalls:[],writes:[],gets:[],toasts:[],audits:[],failSet:()=>false,failDelete:false,failGet:false,slowGet:0,hang:()=>false,state:null,fiches:[],resets:0};
  const db={collection:()=>({doc:id=>({
    set:(d,opt)=>{ if(E.hang(id)) return new Promise(()=>{}); return (async()=>{ if(E.failSet(id)) throw new Error('permission-denied'); E.store[id]=(opt&&opt.merge)?Object.assign({},E.store[id]||{},clone(d)):clone(d); E.writes.push('set '+id); })(); },
    delete:()=>(async()=>{ if(E.failDelete) throw new Error('refus simule'); delete E.store[id]; E.writes.push('delete '+id); })(),
    get:()=>{ E.gets.push(id); return (async()=>{ if(E.failGet) throw new Error('client hors ligne'); if(E.slowGet) await sleep(E.slowGet); const d=E.store[id]; return {exists:!!d,data:()=>clone(d||{})}; })(); }
  })})};
  const scaled=(f,ms)=>setTimeout(f,Math.min(ms,40));   // le délai de 8 s de boundedWrite devient 40 ms : « mise en file » jouée sans attendre
  const code='let brouillonsCache=[]; let _autosaveLastSig=""; let _pendingFicheId=null; let fichesCache=env.fiches; let ficheLines=[{id:"l0"}]; let _viewingSharedId=null; let _localCopyFromShare=null; let _resumedDraftId=null; let _resumedForeignDraftId=null; let _l545PendingResume=null; let _persistenceOK=true; let _draftStripLastCount=0; let _planAutosaveLast=""; let _cmdLiveBlockUntil=0; let _l545LastSup=[]; let _l434ResetSnap=null; let _shareActive=false; let _planAutosaveTimer=null;\n'
   +'const nrm=NRM; const trainingGuard=()=>false; const persistCmdLive=()=>{}; const clearCmdLive=()=>{}; const _uid=()=>"u1"; const _deviceId=()=>"dev1"; const _ini=()=>"JF"; const _machinePostName=()=>"CEVENINI";\n'
   +'function serializeFicheState(){ return JSON.parse(JSON.stringify(env.state)); }\n'
   +'function serializeFicheStatePlan(){ return env.state.plan; }\n'
   +'function showToast(m,k){ env.toasts.push(String(m)); }\n'
   +'function logAudit(a,c,i,t){ env.audits.push(a+"|"+c+"|"+i+"|"+t); return Promise.resolve(); }\n'
   +'function renderDrafts(){}\nconst document={getElementById:()=>null};\n'
   +'function planHasContent(){ return false; } function resetAll(){ env.resets++; } function showPage(){} function _l434ShowResetUndo(){}\n'
   +SRC_FN+'\n'
   +'const _tickOrig=autosaveDraftTick; autosaveDraftTick=function(f){ env.tickCalls.push(!!f); if(env.tickCalls.length>300) throw new Error("boucle de rejeu du tick (plus de 300 appels)"); return _tickOrig(f); };\n'
   +'return { tick:function(f){ return autosaveDraftTick(f); }, reset:function(){ return resetSiteConfirm(); }, clear:function(id){ return clearCurrentDraft(id); }, sup:function(a,b,c){ return _supersededManualDrafts(a,b,c); },\n'
   +'  get cache(){ return brouillonsCache; }, set cache(v){ brouillonsCache=v; }, get sig(){ return _autosaveLastSig; }, set sig(v){ _autosaveLastSig=v; },\n'
   +'  setResumed:function(v){ _resumedDraftId=v; }, setFiches:function(v){ fichesCache.length=0; v.forEach(function(x){ fichesCache.push(x); }); }, get aid(){ return autosaveId(); },\n'
   +'  has:function(n){ try{ return typeof eval(n)==="function"; }catch(e){ return false; } }, call:function(n){ return eval(n).apply(null,Array.prototype.slice.call(arguments,1)); } };';
  const m=new Function('env','db','NRM','setTimeout',code)(E,db,NRM,scaled);
  m.E=E; m.store=E.store;
  m.snap=()=>{ m.cache=Object.keys(E.store).map(k=>Object.assign({id:k},clone(E.store[k]))).sort((a,b)=>String(b.savedAt||'').localeCompare(String(a.savedAt||''))); };   // l'instantané de la base, comme l'écoute temps réel
  m.go=async(st,force)=>{ E.state=clone(st); m.tick(force===undefined?true:force); await settle(); };
  m.arch=()=>Object.keys(E.store).filter(k=>k.indexOf('d_arch_')===0);
  return m;
}
const mkState=o=>{ o=o||{}; const n=o.n||8, L=[]; for(let i=0;i<n;i++) L.push({id:(o.ids||'ln')+i,ref:'41312809 - TacFlex',label:'BOB-'+(i+1),coupee:i<(o.cut||0)});
  const cli=o.cli||'CLIENT TEST A', num=o.num===undefined?'CMD-0001':o.num;
  return {plan:{client:cli,numCmd:num,ref:'41312809 - TacFlex',machine:'cevenini'},fiche:{client:cli,numCmd:num,machine:'cevenini'},chrono:{sec:3600,startTs:'2026-11-20T08:00:00.000Z',wasRunning:false},lines:L,loadedSaveId:o.sid===undefined?'planA':o.sid,pendingFicheId:null,resumedDraftId:null}; };
const A5=()=>mkState({sid:'planA',num:'CMD-0001',cut:5}), B4=()=>mkState({sid:'planB',num:'B-2',cut:4,cli:'CLIENT TEST B',ids:'lb'});   /* [v3 · F6] une AUTRE commande a d'AUTRES ids de ligne (les ids sont uniques : date + compteur + aléa) */
const B4x=B4;
const TOAST_ARCH='🗄 Ton travail précédent (5/8 coupées) est gardé dans Données › Brouillons.';

(async()=>{
console.log('── 0. version et outillage ──');
ok(/const APP_VERSION='2026\.\d\d\.\d\d-L(56[1-9]|5[7-9]\d|[6-9]\d\d)';/.test(src),'APP_VERSION >= L561 (ni version exacte ni liste exacte de scènes épinglées)');
ok(FN_LOT.every(present),'les '+FN_LOT.length+' fonctions du lot existent dans index.html (sur L562 : absentes, donc ce test est rouge)');

console.log('── T1. A (5/8) puis une AUTRE commande B : l\'archive est écrite AVANT l\'écrasement ──');
{ const m=monde(); const aid=m.aid;
  await m.go(A5()); m.store[aid].savedAt='2026-11-20T09:00:00.000Z'; m.snap();   // date fixée dans le passé : une archive datée « maintenant » serait détectée
  ok(!!m.store[aid]&&m.arch().length===0,'T1a. la 1re sauvegarde automatique (A, 5/8) est en base, aucune archive encore');
  await m.go(B4());
  const ids=m.arch(); const ar=ids.length===1?m.store[ids[0]]:null;
  ok(ids.length===1,'T1b. UNE archive d_arch_… est apparue (sur L561 : aucune, le travail de A était écrasé)');
  ok(!!ar&&ar.label==='🗄 Avant remplacement · CLIENT TEST A / CMD-0001 · 5/8 coupée(s)','T1c. libellé exact « 🗄 Avant remplacement · CLIENT / N° · 5/8 coupée(s) » : '+(ar&&ar.label));
  ok(!!ar&&ar.state.lines.filter(l=>l.coupee).length===5&&ar.state.lines.length===8&&ar.state.loadedSaveId==='planA','T1d. l\'archive porte l\'état COMPLET de A : 5 coupées sur 8, même plan source');
  ok(!!m.store[aid]&&/CLIENT TEST B/.test(m.store[aid].label)&&m.store[aid].state.lines.filter(l=>l.coupee).length===4,'T1e. la sauvegarde automatique contient bien B (4 coupées) : l\'écrasement a eu lieu APRÈS l\'archive');
  const iArch=m.E.writes.findIndex(w=>/^set d_arch_/.test(w)), iAuto=m.E.writes.findIndex((w,i)=>i>0&&w==='set '+aid);
  ok(iArch>=0&&iAuto>iArch,'T1f. ordre des écritures : l\'archive PUIS la sauvegarde de B ('+m.E.writes.join(' | ')+')');
  ok(m.E.toasts.filter(t=>t===TOAST_ARCH).length===1,'T1g. UN seul toast, texte exact : « '+TOAST_ARCH+' »');
  ok(m.E.audits.some(a=>/^create\|brouillons\|d_arch_.*Archive avant remplacement/.test(a)),'T1h. l\'archive est journalisée');
  ok(!!ar&&ar.savedAt==='2026-11-20T09:00:00.000Z'&&m.store[aid].savedAt>ar.savedAt,'T1j. [filet] savedAt de l\'archive = date de la sauvegarde REMPLACÉE (la chronologie reste vraie : l\'archive ne passe pas devant un parcage plus récent) : '+(ar&&ar.savedAt));
  ok(m.cache.some(d=>d&&d.id===ids[0]),'T1i. l\'archive est dans le cache : visible tout de suite dans Données › Brouillons');
}

console.log('── T2. l\'archive est REPRENABLE (comme un parcage) ──');
{ const m=monde(); await m.go(A5()); m.snap(); await m.go(B4()); const id=m.arch()[0]; const d=id?m.store[id]:null;
  ok(!!d&&JSON.stringify(d.state)===JSON.stringify(A5())&&d.state.lines.filter(l=>l.coupee).length===5,'T2a. l\'état de l\'archive est celui de A, octet pour octet : ▶ remet 5 coupées');
  ok(!!d&&!d.consumed&&!d.deleted&&d.auto===false&&d.archive===true&&!d.fromFicheId&&!/^d_autosave/.test(d.id),'T2b. ni consommée, ni supprimée, ni « auto », ni solde, hors de l\'emplacement d_autosave (jamais remplacée par une sauvegarde)');
  ok(!!d&&d.ownerPost==='CEVENINI'&&d.owner==='JF'&&d.ownerUid==='u1','T2c. poste, auteur et compte copiés de l\'ancienne sauvegarde (même visibilité L520)');
  ok(!!d&&T(()=>{ const vis=m.call('_l520DraftVisible',d,{manage:false,uid:'u1',ini:''}); return vis===true; }),'T2d. visible pour le compte du poste (règle de visibilité L520 réelle)');
  ok(!!d&&(function w(o){ return o===null||typeof o!=='object'?o!==undefined:Object.keys(o).every(k=>w(o[k])); })(d),'T2e. aucune valeur « undefined » dans le document (Firestore la refuse)');
}

console.log('── T3. version en RECUL de la même commande · idempotence ──');
{ const m=monde(); await m.go(A5()); m.snap(); await m.go(mkState({sid:'planA',cut:3}));
  ok(m.arch().length===1&&m.store[m.arch()[0]].label.indexOf('5/8 coupée(s)')>0,'T3a. même commande, 5 → 3 coupées : l\'archive à 5/8 est créée (rechargée de zéro puis recoupée)');
  m.snap(); await m.go(mkState({sid:'planA',cut:3})); await m.go(mkState({sid:'planA',cut:3}));
  ok(m.arch().length===1,'T3b. deux ticks identiques de plus : toujours UNE seule archive');
  const n=monde(); await n.go(A5()); n.snap(); n.E.state=clone(B4()); n.tick(true); n.tick(true); n.tick(true); await settle();
  ok(n.arch().length===1&&n.E.writes.filter(w=>/^set d_arch_/.test(w)).length===1,'T3c. trois ticks lancés sans attendre : UNE écriture d\'archive (verrou) : '+n.E.writes.join(' | '));
  const x=monde(), y=monde(); const cur={id:x.aid,savedAt:'2026-11-20T09:00:00.000Z',state:A5(),ownerPost:'CEVENINI',owner:'JF',ownerUid:'u1'};
  const a1=T(()=>x.call('_l564ArchiveDe',cur,B4())), a2=T(()=>y.call('_l564ArchiveDe',clone(cur),B4()));
  ok(!!a1&&!!a2&&a1.id===a2.id&&/^d_arch_[0-9a-z]+$/.test(a1.id),'T3d. deux onglets : même identifiant d\'archive (hachage poste | sauvegarde | date)');
  const a3=T(()=>x.call('_l564ArchiveDe',Object.assign({},cur,{savedAt:'2026-11-20T09:05:00.000Z'}),B4()));
  ok(!!a1&&!!a3&&a3.id!==a1.id,'T3e. une autre version de la sauvegarde → une autre archive (rien n\'est écrasé)');
  const p=monde(); await p.go(A5()); p.snap(); await p.go(mkState({sid:'planA',cut:5,num:'CMD-0001'})); await p.go(mkState({sid:'planA',cut:6}));
  ok(p.arch().length===0,'T3f. même commande qui AVANCE (5 → 5 → 6) : aucune archive');
}

console.log('── T4. correction du n° en cours de route : aucune archive de trop ──');
{ const m=monde(); await m.go(mkState({sid:'planA',num:'CMD-0001',cut:3})); m.snap(); await m.go(mkState({sid:'planA',num:'CMD-0001-X',cut:4}));
  ok(m.arch().length===0&&Object.keys(m.store).length===1&&/CMD-0001-X/.test(m.store[m.aid].label),'T4a. n° corrigé, même plan source : aucune archive, la sauvegarde est simplement mise à jour');
  const n=monde(); await n.go(mkState({sid:'',num:'CMD-0001',cut:3})); n.snap(); await n.go(mkState({sid:'',num:'CMD-0001-X',cut:4,ids:'lm'}));
  ok(n.arch().length===1,'T4b. SANS plan source connu : client + n° décident (autre n° = autre commande, AUTRES ids de ligne [v3 : le même écran qui continue n\'archive jamais] → archive)');
  const k=monde(); await k.go(mkState({sid:'',num:'CMD-0001',cut:3})); k.snap(); await k.go(mkState({sid:'',num:'CMD-0001',cut:4}));
  ok(k.arch().length===0,'T4c. sans plan source, même client + même n° : aucune archive');
  const h4=monde(); await h4.go(mkState({sid:'planA',num:'CMD-0001',cut:3})); h4.snap(); await h4.go(mkState({sid:'planA',num:'CMD-0001-X',cut:4,ids:'lq'}));
  ok(h4.arch().length===0,'T4h. [v3] MÊME plan source, n° corrigé, ids de ligne neufs (écran restauré) et mêmes références coupées : aucune archive (le plan source commun décide ; sans lui, client + n° diraient « autre commande »)');
  const q1=monde(); await q1.go(mkState({sid:'planA',num:'CMD-0001',cut:1})); q1.snap(); await q1.go(B4x());
  ok(q1.arch().length===1&&/1\/8 coupée\(s\)$/.test(q1.store[q1.arch()[0]].label),'T4e. [filet] l\'ancienne sauvegarde a EXACTEMENT 1 coupée : elle est archivée (seuil = 1, pas 2) : '+q1.arch().length);
  const q=monde(); await q.go(mkState({sid:'planA',num:'CMD-0001',cut:0})); q.snap(); await q.go(B4());
  ok(q.arch().length===0,'T4d. l\'ancienne sauvegarde n\'avait AUCUNE coupée : rien à protéger, aucune archive');
}

console.log('── T5. envoi NORMAL (clearCurrentDraft) : aucun document en plus ──');
{ const m=monde(); await m.go(mkState({sid:'planA',cut:8})); m.snap();
  await m.clear('fiche_A'); await settle();
  ok(Object.keys(m.store).length===0,'T5a. envoi réussi : la sauvegarde automatique est supprimée, la base est vide');
  await m.go(B4());
  ok(m.arch().length===0&&Object.keys(m.store).length===1,'T5b. la commande suivante : une seule sauvegarde (la sienne), AUCUNE archive de la commande déjà envoyée : '+Object.keys(m.store).join(','));
}

console.log('── T6. marqueur « consommé » d\'une AUTRE commande : la sauvegarde de la tablette repart ──');
{ const m=monde(); const aid=m.aid;
  await m.go(mkState({sid:'planA',cut:3})); m.snap();
  m.E.failDelete=true; await m.clear('fiche_A'); await settle(); m.E.failDelete=false; m.snap();
  ok(!!m.store[aid]&&m.store[aid].consumed===true,'T6a. (réel) suppression refusée à l\'envoi → le repli pose « consommé » sur la sauvegarde de A');
  m.E.writes.length=0; await m.go(B4()); await m.go(B4(),false);
  ok(m.E.writes.indexOf('set '+aid)>=0,'T6b. la commande B (4 coupées) est ÉCRITE malgré le marqueur (sur L561 : 0 écriture, B n\'existait pas en base)');
  ok(!!m.store[aid]&&!m.store[aid].consumed&&/CLIENT TEST B/.test(m.store[aid].label)&&m.store[aid].state.lines.filter(l=>l.coupee).length===4,'T6c. set() complet : le marqueur « consommé » a disparu, la base contient B');
  ok(m.E.audits.filter(a=>a==='edit|brouillons|'+aid+'|Marqueur consommé levé — nouvelle commande').length===1,'T6d. la levée est journalisée UNE fois (texte exact)');
  ok(m.arch().length===0,'T6e. aucune archive : la sauvegarde consommée était une commande déjà produite');
}

console.log('── T7. même commande déjà produite : toujours JAMAIS ressuscitée (garde L72) ──');
{ const m=monde(); const aid=m.aid;
  await m.go(mkState({sid:'planA',cut:3})); m.snap(); m.E.failDelete=true; await m.clear('fiche_A'); await settle(); m.E.failDelete=false; m.snap();
  m.E.writes.length=0; await m.go(mkState({sid:'planA',cut:3})); await m.go(mkState({sid:'planA',cut:5}));
  ok(m.E.writes.length===0&&m.store[aid].consumed===true&&m.arch().length===0,'T7a. même plan source : AUCUNE écriture, le marqueur reste');
  const n=monde(); const a=n.aid; n.store[a]={id:a,savedAt:'2026-11-20T09:00:00.000Z',label:'🔄 Auto',state:mkState({sid:'',cut:3}),consumed:true,ficheId:'F1'}; n.snap();
  await n.go(mkState({sid:'',cut:3})); ok(n.E.writes.length===0&&n.store[a].consumed===true,'T7b. sans plan source, même client + même n° : toujours bloquée');
  const k=monde(); const b=k.aid; k.store[b]={consumed:true,ficheId:'F9',consumedAt:'2026-11-20T09:00:00.000Z'}; k.setFiches([{_id:'F9',client:'CLIENT TEST A',numCmd:'CMD-0001'}]); k.snap();
  await k.go(A5()); ok(k.E.writes.length===0&&k.store[b].consumed===true,'T7c. marqueur SANS état : la fiche envoyée dit la commande ; même commande → bloquée');
  await k.go(B4()); ok(k.E.writes.indexOf('set '+b)>=0&&!k.store[b].consumed,'T7d. marqueur sans état, AUTRE commande que la fiche envoyée → levé');
  const u=monde(); const c=u.aid; u.store[c]={consumed:true,ficheId:'F404',consumedAt:'2026-11-20T09:00:00.000Z'}; u.snap();
  await u.go(A5()); ok(u.E.writes.length===0,'T7e. marqueur sans état et fiche introuvable : identité inconnue → on ne touche à rien (comportement d\'avant)');
}

console.log('── échec et mise en file de l\'écriture d\'archive ──');
{ const m=monde(); const aid=m.aid; await m.go(A5()); m.snap();
  m.E.failSet=id=>/^d_arch_/.test(id);
  await m.go(B4());
  ok(m.arch().length===0&&/CLIENT TEST A/.test(m.store[aid].label)&&m.store[aid].state.lines.filter(l=>l.coupee).length===5,'F1. archive REFUSÉE : la sauvegarde de A n\'est PAS écrasée (rien ne change, le travail reste en base)');
  const alertes=m.E.toasts.filter(t=>/n’a pas pu être mis de côté/.test(t)); ok(alertes.length===1&&/5\/8 coupées/.test(alertes[0]),'F2. UN toast d\'alerte, avec le nombre de coupées');
  ok(alertes.length===1&&/Ta commande à l’écran n’est pas encore sauvegardée : nouvel essai dans quelques secondes\.$/.test(alertes[0]),'F2b. [P3] le toast dit CLAIREMENT que la commande à l\'écran n\'est pas encore sauvegardée : « '+alertes[0]+' »');
  await m.go(B4()); await m.go(B4());
  ok(m.E.toasts.filter(t=>/n’a pas pu être mis de côté/.test(t)).length===1&&m.store[aid].label.indexOf('CLIENT TEST A')>=0,'F3. nouveaux essais dans la minute : toujours UN seul toast, toujours rien d\'écrasé');
  m.E.failSet=()=>false; await m.go(B4());
  ok(m.arch().length===1&&/CLIENT TEST B/.test(m.store[aid].label),'F4. la base répond de nouveau : archive écrite puis B enregistrée');
  const n=monde(); const a2=n.aid; await n.go(A5()); n.snap(); n.E.hang=id=>/^d_arch_/.test(id);
  n.E.state=clone(B4()); n.tick(true); await sleep(120); await settle();
  ok(n.E.toasts.indexOf(TOAST_ARCH)>=0&&/CLIENT TEST B/.test(n.store[a2].label)&&n.cache.some(d=>/^d_arch_/.test(d.id)),'F5. écriture MISE EN FILE (réseau lent : la base ne répond pas dans le délai) = non perdue : le tick continue, l\'archive est dans le cache');
}

console.log('── T8. un parcage plus ANCIEN ne consomme pas un parcage plus AVANCÉ ──');
{ const mk=(id,cut,over)=>Object.assign({id:id,savedAt:'2026-11-20T09:00:00.000Z',label:'CLIENT TEST A / CMD-0001',state:mkState({sid:'planA',cut:cut}),owner:'JF',ownerPost:'CEVENINI',ownerUid:'u1'},over||{});
  const m=monde(); const d1=mk('d_1000',5); m.cache=[d1];
  const d2=mk('d_2000',1,{savedAt:'2026-11-20T10:00:00.000Z'});
  const r=T(()=>m.sup(d2.id,d2.label,d2)); ok(Array.isArray(r)&&r.length===0,'T8a. 5/8 parquée puis 1/8 reparquée (même libellé) : le 5/8 n\'est PAS consommé (sur L561 : consommé, il disparaissait) : '+JSON.stringify((r||[]).map(x=>x.id)));
  const d3=mk('d_3000',6,{savedAt:'2026-11-20T10:00:00.000Z'}); const r3=T(()=>m.sup(d3.id,d3.label,d3)); ok(Array.isArray(r3)&&r3.length===1&&r3[0].id==='d_1000','T8b. 6/8 parquée après le 5/8 : l\'ancien est remplacé comme avant (un doublon de moins)');
  const d4=mk('d_4000',5,{savedAt:'2026-11-20T10:00:00.000Z'}); const r4=T(()=>m.sup(d4.id,d4.label,d4)); ok(Array.isArray(r4)&&r4.length===1,'T8c. même nombre de coupées : remplacé comme avant');
  const n=monde(); n.cache=[mk('d_1000',5)]; n.setResumed('d_1000');
  const r5=T(()=>n.sup(d2.id,d2.label,d2)); ok(Array.isArray(r5)&&r5.length===0,'T8d. chemin « repris » : le 5/8 repris puis un parcage à 1/8 → le 5/8 n\'est pas consommé');
  const r6=T(()=>n.sup(d3.id,d3.label,d3)); ok(Array.isArray(r6)&&r6.length===1&&r6[0].id==='d_1000','T8e. chemin « repris » : un parcage à 6/8 consomme le 5/8 repris, comme avant');
  const q=monde(); q.cache=[mk('d_1000',5,{state:mkState({sid:'planA',cut:5,num:'AUTRE'}),label:'CLIENT TEST A / AUTRE'})]; const r7=T(()=>q.sup(d2.id,d2.label,d2)); ok(Array.isArray(r7)&&r7.length===0,'T8f. un autre n° n\'est jamais consommé (règle L254 intacte)');
}

console.log('── T9. liste lisible : « x/N coupée(s) » + bandeau (VRAI renderDrafts) ──');
{ const names=['renderDrafts','_posteChip','_l545Ago','_l545SentTxt','_l520DraftVisible','_draftPoste','_isSharedDoc','loadDrafts','esc'].concat(FN_LOT).filter(present);
  const mk=(id,cut,sav,over)=>Object.assign({id:id,savedAt:sav,label:'CLIENT TEST A / CMD-0001',state:mkState({sid:'planA',cut:cut}),owner:'JF',ownerPost:'CEVENINI',ownerUid:'u1'},over||{});
  const rendu=(drafts,fiches)=>{ const list={innerHTML:'',querySelectorAll:()=>[]}, empty={style:{}};
    const code='let brouillonsCache=env.d; let fichesCache=env.f; const nrm=NRM; const MACHINE_KEYS=["feba","maveg","cevenini"]; const _machinePostName=()=>"CEVENINI"; const _uid=()=>"u1"; const _ini=()=>"JF";\n'
      +'const getMachineLabel=m=>String(m).toUpperCase(); const fmtTimeFr=s=>s+"s"; const _l546ChronoOdd=()=>null; const _l545SentInfo=(d,fl)=>env.sent&&env.sent[d.id]?env.sent[d.id]:null;\n'
      +'const _l520DraftCtx=()=>({manage:true}); function renderSharedDraftsBlock(){}\n'
      +'const document={getElementById:id=>id==="draftsList"?env.list:(id==="draftsEmpty"?env.empty:null)};\n'
      +names.map(fnOf).join('\n')+'\nrenderDrafts(); return env.list.innerHTML;';
    return new Function('env','NRM',code)({d:drafts,f:fiches||[],list:list,empty:empty,sent:null},NRM); };
  const HTMLRE=(h,id)=>{ const i=h.indexOf('data-id="'+id+'"'); if(i<0) return ''; const j=h.indexOf('data-id="',i+10); return h.slice(i,j<0?h.length:j); };
  const top=mk('d_top',0,'2026-11-20T11:00:00.000Z',{auto:false}), o5=mk('d_o5',5,'2026-11-20T10:00:00.000Z'), o2=mk('d_o2',2,'2026-11-20T09:00:00.000Z');
  const h=T(()=>rendu([top,o5,o2])); const c=HTMLRE(h||'','d_top');
  ok(typeof h==='string'&&c.length>0,'T9a. renderDrafts réel : la carte du dessus est rendue');
  ok(c.indexOf('⚠ Une version plus avancée existe plus bas : 5/8 coupées. Reprends plutôt celle-là.')>0,'T9b. bandeau sur la carte du dessus (0/8) : « ⚠ Une version plus avancée existe plus bas : 5/8 coupées. Reprends plutôt celle-là. » (texte exact, la plus avancée = 5/8, pas 2/8)');
  ok(c.indexOf('<b>0/8 coupée(s)</b>')>0&&c.indexOf('+2 version(s) plus ancienne(s)')>0,'T9c. la carte du dessus garde sa ligne « 0/8 coupée(s) » et le repli « +2 version(s) plus ancienne(s) »');
  ok((function(){ const t=c.indexOf('save-title'), b=c.indexOf('l564-alerte'), mt=c.indexOf('class="save-meta">Brouillon'); return t>=0&&b>t&&mt>b; })(),'T9d. le bandeau est juste sous le titre de la carte du dessus, avant la ligne « Brouillon … du … »');
  ok(c.indexOf('<b>5/8 coupée(s)</b>')>0&&c.indexOf('<b>2/8 coupée(s)</b>')>0,'T9e. CHAQUE ligne repliée affiche son « x/N coupée(s) » (5/8 et 2/8)');
  ok(c.indexOf('l564-pa')>0&&c.indexOf('l564-pb')>0,'T9f. les ajouts portent les classes masquées sous 1100 px (règle 3 : portrait inchangé)');
  ok(h.indexOf('data-id="d_top"')<h.indexOf('data-id="d_o5"')||h.indexOf('data-id="d_o5"')<0,'T9g. ordre inchangé : la carte la plus RÉCENTE reste en tête');
  const h2=T(()=>rendu([mk('d_top2',6,'2026-11-20T11:00:00.000Z'),o5,o2])); ok(typeof h2==='string'&&h2.indexOf('Une version plus avancée')<0&&h2.indexOf('<b>5/8 coupée(s)</b>')>0,'T9h. carte du dessus la PLUS avancée : aucun bandeau (mais le x/N des lignes repliées reste)');
  const h3=T(()=>rendu([mk('d_top3',5,'2026-11-20T11:00:00.000Z'),o5,o2])); ok(typeof h3==='string'&&h3.indexOf('Une version plus avancée')<0,'T9i. égalité (5/8 et 5/8) : pas de bandeau (« plus » = strictement plus)');
  const h4=T(()=>rendu([top])); ok(typeof h4==='string'&&h4.indexOf('Une version plus avancée')<0&&h4.indexOf('version(s) plus ancienne')<0,'T9j. une seule carte : ni bandeau ni repli');
  const lst={innerHTML:'',querySelectorAll:()=>[]};
  const h5=T(()=>{ const code='let brouillonsCache=env.d; let fichesCache=env.f; const nrm=NRM; const MACHINE_KEYS=["feba","maveg","cevenini"]; const _machinePostName=()=>"CEVENINI"; const _uid=()=>"u1"; const _ini=()=>"JF"; const getMachineLabel=m=>String(m).toUpperCase(); const fmtTimeFr=s=>s+"s"; const _l546ChronoOdd=()=>null; const _l545SentInfo=(d,fl)=>({kind:"sent",date:"2026-11-20T12:00:00.000Z",machine:"MAVEG",ini:"AA",covered:1,total:1}); const _l520DraftCtx=()=>({manage:true}); function renderSharedDraftsBlock(){} const document={getElementById:id=>id==="draftsList"?env.list:(id==="draftsEmpty"?env.empty:null)};\n'+names.map(fnOf).join('\n')+'\nrenderDrafts(); return env.list.innerHTML;';
    return new Function('env','NRM',code)({d:[top,o5,o2],f:[{numCmd:'CMD-0001',client:'CLIENT TEST A'}],list:lst,empty:{style:{}}},NRM); });
  ok(typeof h5==='string'&&h5.indexOf('Déjà envoyée')>0&&h5.indexOf('Une version plus avancée')<0,'T9k. carte « déjà envoyée » : JAMAIS de « reprends plutôt celle-là » (double découpe)');
  { const sol=mk('d_sol',0,'2026-11-20T11:00:00.000Z',{auto:false,solde:true,label:'⛔ Solde manque matière · CLIENT TEST A / CMD-0001'}), sol2=mk('d_sol2',0,'2026-11-20T11:00:00.000Z',{auto:false,label:'Solde CLIENT TEST A / CMD-0001'});
    const hs=T(()=>rendu([sol,o5,o2])), hs2=T(()=>rendu([sol2,o5,o2]));
    ok(typeof hs==='string'&&hs.indexOf('data-id="d_sol"')>=0&&hs.indexOf('Une version plus avancée')<0&&hs.indexOf('<b>5/8 coupée(s)</b>')>0,'T9l. [V2] carte du dessus = SOLDE (d.solde) : aucun bandeau « Une version plus avancée… » (le x/N des lignes repliées reste)');
    ok(typeof hs2==='string'&&hs2.indexOf('data-id="d_sol2"')>=0&&hs2.indexOf('Une version plus avancée')<0,'T9m. [V2] carte du dessus dont le libellé contient « solde » : aucun bandeau'); }
  { const ar=mk('d_ar',5,'2026-11-20T08:00:00.000Z',{auto:false,archive:true,label:'🗄 Avant remplacement · CLIENT TEST A / CMD-0001 · 5/8 coupée(s)'});
    const hA=T(()=>rendu([top,ar])); const cc=HTMLRE(hA||'','d_top'); const nb=(cc.match(/5\/8 coupée\(s\)/g)||[]).length;
    ok(typeof hA==='string'&&nb===1,'T9m. [P2] la ligne repliée d\'une ARCHIVE dit « 5/8 coupée(s) » UNE seule fois (le libellé le contient déjà) : '+nb+' occurrence(s)');
    ok(T(()=>{ const lg=new Function('NRM','nrm','esc','o',fnOf('_l564LigneXN')+'; '+fnOf('_l564Coupees')+'; return _l564LigneXN(o);')(NRM,NRM,v=>v,{label:'Auto · CLIENT / CMD (5/8 coupée(s)',state:mkState({cut:5})}); return lg.indexOf('<b>5/8 coupée(s)</b>')>0; }),'T9n. un brouillon NON archive dont le libellé finirait par « coupée(s) » garde son x/N'); }
  { /* [filet P4] la phrase de la fenêtre « déjà commencée » porte la classe masquée sous 1100 px, et la CSS la masque / l'affiche aux bons endroits */
    const mph=/<div class="([^"]*)"[^>]*>Ta version actuelle reste dans Brouillons\.<\/div>/.exec(src);
    ok(!!mph&&/(^|\s)l564-pb(\s|$)/.test(mph[1]),'T9o. [filet] la phrase « Ta version actuelle reste dans Brouillons. » porte la classe l564-pb (masquée en portrait) : classe = '+(mph&&mph[1]));
    const iM=src.indexOf('id="l545DejaModal"'), iP=mph?src.indexOf(mph[0]):-1, iC=src.indexOf('Charger quand même (repartir de zéro)');
    ok(iM>0&&iC>iM&&iP>iC&&iP-iM<4000,'T9p. [filet] la phrase est dans la fenêtre #l545DejaModal, sous le bouton « Charger quand même (repartir de zéro) »');
    const css=(src.match(/\.l564-pa,\.l564-pb\{display:none\}/g)||[]).length, med=/@media\(min-width:1100px\)\{ \.l564-pa\{display:inline\} \.l564-pb\{display:block\} \}/.test(src);
    ok(css===1&&med,'T9q. [filet] CSS : l564-pb masquée par défaut (portrait), affichée à partir de 1100 px'); }
  ok(T(()=>{ const f=new Function('NRM','nrm','esc',fnOf('_l564LigneXN')+'; '+fnOf('_l564Coupees')+'; return _l564LigneXN({state:{lines:[]}});')(NRM,NRM,v=>v); return f===''; }),'T9l. une version sans bobine (saisie de plan) : pas de « 0/0 »');
}

console.log('── T11. [filet P5] un tick FORCÉ (pause / arrêt) pendant l\'écriture de l\'archive est REJOUÉ à la fin ──');
{ const m=monde(); const aid=m.aid; await m.go(A5()); m.snap(); m.E.hang=id=>/^d_arch_/.test(id);
  m.E.tickCalls.length=0; m.E.state=clone(B4());
  m.tick(false);            // 1er tick (non forcé) : lance l'écriture de l'archive (qui ne répond pas : 40 ms simulées)
  m.tick(true);             // l'opérateur fait pause pendant l'écriture : tick FORCÉ refusé par le verrou
  await sleep(150); await settle();
  const seq=m.E.tickCalls.join(',');
  ok(m.cache.filter(d=>/^d_arch_/.test(d.id)).length===1&&/CLIENT TEST B/.test(m.store[aid].label),'T11a. une archive (mise en file : dans le cache), puis B enregistrée : '+seq);
  ok(m.E.tickCalls.length>=3&&m.E.tickCalls[m.E.tickCalls.length-1]===true,'T11b. le tick rejoué à la fin de l\'écriture est FORCÉ (drapeau « force demandé ») : séquence des ticks = '+seq+' (sans le drapeau : le rejeu reprend le force=false du 1er appelant)');
  const n=monde(); await n.go(A5()); n.snap(); n.E.hang=id=>/^d_arch_/.test(id); n.E.tickCalls.length=0; n.E.state=clone(B4());
  n.tick(false); n.tick(false); await sleep(150); await settle();
  ok(n.E.tickCalls.length>=2&&n.E.tickCalls[n.E.tickCalls.length-1]===false,'T11c. sans tick forcé pendant l\'écriture, le rejeu n\'est PAS forcé : '+n.E.tickCalls.join(','));
  const k=monde(); await k.go(A5()); k.snap(); k.E.failSet=id=>/^d_arch_/.test(id); k.E.tickCalls.length=0; k.E.state=clone(B4()); k.tick(false); k.tick(true); await sleep(80); await settle();
  ok(k.arch().length===0&&k.E.tickCalls.length<=3,'T11d. écriture d\'archive REFUSÉE : pas de boucle de rejeu ('+k.E.tickCalls.length+' appels)');
}

console.log('── T12. [P7] archive d\'une commande déjà envoyée : masquée par le filtre L430 SEULEMENT si elle est « déjà envoyée » ──');
{ const m=monde(); const ar={id:'d_arch_x',savedAt:'2026-11-20T09:00:00.000Z',label:'🗄 Avant remplacement · CLIENT TEST A / CMD-0001 · 5/8 coupée(s)',state:mkState({sid:'planA',cut:5}),auto:false,archive:true,owner:'JF',ownerPost:'CEVENINI'};
  ar.state.chrono.startTs='2026-11-20T08:00:00.000Z';
  const fiche=(over)=>Object.assign({_id:'F1',client:'CLIENT TEST A',numCmd:'CMD-0001',date:'2026-11-20T11:00:00.000Z',valide:true,ref:'41312809 - TacFlex',ficheDetail:Array.from({length:8},(_,i)=>({ref:'41312809 - TacFlex',coupee:true}))},over||{});
  const res=(d,fiches)=>T(()=>{ m.setFiches(fiches); return m.call('_l430IsResidualDraft',d); });
  const env=(d,fiches)=>T(()=>{ m.setFiches(fiches); return m.call('_l564ArchiveEnvoyee',d); });
  ok(res(ar,[fiche()])===true,'T12a. archive + commande ENVOYÉE (fiche complète, validée) : résiduelle → masquée');
  ok(res(ar,[])===false,'T12b. aucune fiche : l\'archive reste VISIBLE');
  ok(res(ar,[fiche({valide:false})])===false,'T12c. fiche envoyée mais NON validée : l\'archive reste visible (le filtre L430 ne masque que les commandes validées)');
  ok(res(ar,[fiche({manqueMatiere:true,ficheDetail:Array.from({length:8},(_,i)=>({ref:'41312809 - TacFlex',coupee:i<1}))})])===false,'T12d. envoi manque matière à 1 coupée (l\'archive en a 5) : PAS « déjà envoyée » → l\'archive reste visible (jamais cachée tant qu\'elle porte du travail hors fiche)');
  ok(res(ar,[fiche({manqueMatiere:true,ficheDetail:Array.from({length:8},(_,i)=>({ref:'41312809 - TacFlex',coupee:i<6}))})])===false,'T12e. [V1] envoi manque matière à 6 coupées (≥ les 5 de l\'archive) et validé : l\'archive reste VISIBLE (un arrêt manque matière est partiel par nature : jamais de masquage)');
  ok(env(ar,[fiche({manqueMatiere:true,ficheDetail:Array.from({length:8},(_,i)=>({ref:'41312809 - TacFlex',coupee:true}))})])===false,'T12e2. [V1] même un arrêt manque matière à 8/8 coupées : _l564ArchiveEnvoyee faux (jamais masquée)');
  ok(env(ar,[fiche()])===true,'T12e3. [V1] contrôle : fiche complète non manque matière : _l564ArchiveEnvoyee vrai (le masquage P7 reste actif)');
  const man=Object.assign({},ar,{id:'d_77',archive:undefined,auto:false,label:'CLIENT TEST A / CMD-0001'});
  ok(res(man,[fiche()])===false,'T12f. un parcage MANUEL (non archive) n\'est toujours JAMAIS masqué (règle L430 inchangée)');
  const sansN=Object.assign({},ar,{state:mkState({sid:'planA',cut:5,num:''})});
  ok(res(sansN,[fiche()])===false,'T12g. commande sans n° : jamais reconnue « envoyée » → l\'archive reste visible');
}

console.log('── T13. [v3 · F3] sauvegarde ABSENTE du cache : une lecture bornée avant d\'écrire à l\'aveugle ──');
{ const mk=()=>{ const m=monde(); const aid=m.aid; m.E.store[aid]={id:aid,savedAt:'2026-11-20T09:00:00.000Z',label:'🔄 Auto · CLIENT TEST A / CMD-0001',state:A5(),auto:true,owner:'JF',ownerPost:'CEVENINI',ownerUid:'u1'}; m.cache=[]; return m; };   /* en base, PAS dans le cache (fenêtre limit(300), instantané pas reçu) */
  const m=mk(); const aid=m.aid; await m.go(B4x());
  ok(m.arch().length===1&&m.store[m.arch()[0]].state.lines.filter(l=>l.coupee).length===5,'T13a. cache sans la sauvegarde de A (5/8, en base) : l\'archive de A est écrite avant l\'écrasement (v2 : écrasée à l\'aveugle, aucune archive) : '+m.E.writes.join(' | '));
  const iA=m.E.writes.findIndex(w=>/^set d_arch_/.test(w)), iB=m.E.writes.findIndex(w=>w==='set '+aid);
  ok(iA>=0&&iB>iA&&/CLIENT TEST B/.test(m.store[aid].label),'T13b. ordre : l\'archive PUIS la sauvegarde de B');
  ok(m.E.gets.length===1&&m.E.gets[0]===aid,'T13c. UNE seule lecture, celle du document de l\'emplacement : '+m.E.gets.join(','));
  m.E.state=clone(mkState({sid:'planB',num:'B-2',cut:5,cli:'CLIENT TEST B',ids:'lb'})); m.tick(true); await settle();
  ok(m.E.gets.length===1,'T13d. une fois par session : un tick de plus ne relit pas');
  const n=mk(); n.E.failGet=true; await n.go(B4x());
  ok(n.arch().length===0&&/CLIENT TEST B/.test(n.store[n.aid].label)&&n.E.gets.length===1,'T13e. lecture en échec (hors ligne) : le tick est rejoué et écrit quand même (comme avant le lot), pas de boucle');
  const o=mk(); o.E.slowGet=300; await o.go(B4x()); await sleep(380); await settle();
  ok(o.E.gets.length===1&&/CLIENT TEST B/.test(o.store[o.aid].label),'T13f. lecture trop lente (délai borné) : le tick est rejoué quand même, une seule lecture');
  const q=mk(); q.E.slowGet=15; q.E.tickCalls.length=0; q.E.state=clone(B4x()); q.tick(false); q.tick(true); q.tick(false);
  ok(q.E.writes.length===0,'T13g. pendant la lecture, les ticks qui arrivent n\'écrivent RIEN à l\'aveugle');
  await sleep(150); await settle();
  ok(q.arch().length===1&&/CLIENT TEST B/.test(q.store[q.aid].label)&&q.E.gets.length===1&&q.E.tickCalls[q.E.tickCalls.length-1]===true,'T13h. puis archive + B, une seule lecture, et le tick FORCÉ reçu pendant la lecture est rejoué forcé : '+q.E.tickCalls.join(','));
  const r=monde(); await r.go(A5()); r.snap(); await r.go(B4x());
  ok(r.arch().length===1&&r.E.gets.length===1,'T13i. cache déjà garni : aucune lecture inutile (seule celle du 1er tick d\'une session neuve, base vide)');
}

console.log('── T14. [v3 · F1] ↺ Réinitialiser : la sauvegarde automatique supprimée est archivée si elle porte des coupées d\'une AUTRE commande ──');
{ const m=monde(); const aid=m.aid; await m.go(A5()); m.snap();
  m.E.state=clone(B4x());   /* l'écran est B (autre plan chargé depuis), aucun tick : la base garde A à 5/8 */
  m.E.writes.length=0; m.E.toasts.length=0; m.E.audits.length=0; T(()=>m.reset()); await settle();
  const ids=m.arch(); const ar=ids.length===1?m.store[ids[0]]:null;
  ok(!!ar&&ar.state.lines.filter(l=>l.coupee).length===5&&/5\/8 coupée\(s\)$/.test(ar.label),'T14a. ↺ avec A (5/8) en base et B à l\'écran : UNE archive à 5/8 est écrite (v2 : aucune, la sauvegarde partait sans trace) : '+m.E.writes.join(' | '));
  ok(!m.store[aid],'T14b. la sauvegarde automatique est SUPPRIMÉE comme avant (le ↺ garde son comportement)');
  ok(m.E.toasts.indexOf(TOAST_ARCH)>=0,'T14c. le toast dit « '+TOAST_ARCH+' »');
  ok(m.E.audits.some(a=>/^create\|brouillons\|d_arch_.*Archive avant remplacement \(↺\)/.test(a)),'T14d. l\'archive du ↺ est journalisée');
  const n=monde(); await n.go(A5()); n.snap(); n.E.state=clone(A5()); n.E.writes.length=0; T(()=>n.reset()); await settle();
  ok(n.arch().length===0,'T14e. ↺ sur le MÊME écran (A à 5/8) : aucune archive (le parcage du ↺ garde déjà l\'écran)');
  const k=monde(); await k.go(A5()); k.snap(); k.E.state=clone(mkState({sid:'planA',cut:5,ids:'lz'})); T(()=>k.reset()); await settle();
  ok(k.arch().length===0,'T14f. ↺ sur le même plan rechargé avec 5 coupées équivalentes (mêmes références) : aucune archive de trop');
  const j=monde(); await j.go(A5()); j.snap(); j.E.state=clone(mkState({sid:'planA',cut:0,ids:'lz'})); T(()=>j.reset()); await settle();
  ok(j.arch().length===1,'T14g. ↺ sur A rechargé de zéro (0 coupée) : les 5 coupées de la sauvegarde sont archivées');
}

console.log('── T15. [v3 · F4] une coupée de l\'ancienne sauvegarde absente du nouvel état = archive (pas seulement le compte) ──');
{ const m=monde(); const cur={id:m.aid,savedAt:'2026-11-20T09:00:00.000Z',state:null,ownerPost:'CEVENINI',owner:'JF',ownerUid:'u1'};
  const ar=(a,b)=>{ cur.state=a; return T(()=>m.call('_l564ArchiveDe',clone(cur),b)); };
  const avec=(st,ref)=>{ st.lines.forEach(l=>{ l.ref=ref; }); st.plan.ref=ref; return st; };
  ok(!!ar(mkState({sid:'',num:'PR1',cut:5,cli:'PRIMA'}),avec(mkState({sid:'',num:'PR1',cut:6,cli:'PRIMA',ids:'lx'}),'99999999 - AUTRE')),'T15a. même client + même n°, sans plan source, AUTRE référence, plus de coupées (6 ≥ 5) : archive (v2 : rien, 5 coupées écrasées)');
  ok(!!ar(mkState({sid:'',num:'',cut:5,cli:'PRIMA'}),avec(mkState({sid:'',num:'',cut:7,cli:'prima ',ids:'lx'}),'99999999 - AUTRE')),'T15b. deux commandes sans n° ni plan source, la nouvelle plus avancée (7 ≥ 5) : archive (v2 : rien)');
  ok(!!ar(mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA'}),avec(mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA',ids:'lx'}),'99999999 - AUTRE')),'T15c. même plan, même compte (5 = 5) mais AUTRES bobines cochées : archive (v2 : rien)');
  ok(ar(mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA'}),mkState({sid:'planA',num:'PR1',cut:6,cli:'PRIMA',ids:'lr'}))===null,'T15d. même plan restauré (ids de ligne neufs, MÊMES références) et plus avancé : aucune archive (pas de bruit)');
  const bis=mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA',ids:'lx'}); bis.lines[2].conf='4x700';
  ok(!!ar(mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA'}),bis),'T15e. configuration d\'une coupée changée sur un écran restauré : archive (prudent : une archive de trop vaut mieux qu\'une perte)');
  const sw=mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA'}); sw.lines.forEach((l,i)=>{ l.conf='4x'+(500+i); });
  const sw2=mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA',ids:'lx'}); sw2.lines.forEach((l,i)=>{ l.conf='4x'+(500+i); });
  ok(ar(sw,sw2)===null,'T15f. mêmes références ET mêmes configurations sur des ids neufs : aucune archive');
  const lz=mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA'}); lz.lines.forEach(l=>{ l.useful=2000; }); const lz2=mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA',ids:'lx'}); lz2.lines.forEach(l=>{ l.useful=1800; });
  ok(!!ar(lz,lz2),'T15g. même référence et même configuration mais AUTRE laize : archive');
}

console.log('── T16. [v3 · F6] même ÉCRAN qui continue (mêmes ids de ligne) : jamais d\'archive, quels que soient client et n° ──');
{ const t=async(a,b)=>{ const m=monde(); await m.go(a); m.snap(); await m.go(b); return m.arch().length; };
  ok(await t(mkState({sid:'',num:'PR78596',cut:5,cli:'PRIMA'}),mkState({sid:'',num:'PR785965',cut:5,cli:'PRIMA'}))===0,'T16a. n° corrigé en cours de route, sans plan source : aucune archive (v2 : une archive à 5/8 sous l\'ancien n°, visible à vie)');
  ok(await t(mkState({sid:'',num:'PR1',cut:5,cli:'PRIMA'}),mkState({sid:'',num:'PR1',cut:5,cli:'PRIMA SA'}))===0,'T16b. client corrigé (PRIMA → PRIMA SA), sans plan source : aucune archive (v2 : une archive)');
  ok(await t(mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA'}),mkState({sid:'planB',num:'PR9',cut:6,cli:'AUTRE'}))===0,'T16c. toutes les coupées de l\'ancienne sont encore coupées sur les mêmes ids, même avec client, n° et plan source changés : aucune archive (même écran)');
  ok(await t(mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA'}),mkState({sid:'planA',num:'PR1',cut:4,cli:'PRIMA'}))===1,'T16d. un décochage (5 → 4 sur les mêmes ids) : l\'archive reste (la 5e coupée n\'est plus coupée)');
  ok(await t(mkState({sid:'planA',num:'PR1',cut:5,cli:'PRIMA'}),mkState({sid:'planB',num:'B-2',cut:5,cli:'AUTRE',ids:'lb'}))===1,'T16e. une AUTRE commande (autres ids) à 5 coupées : archive');
}

console.log('── T17. [v3 · F7] l\'archive fige le chrono (jamais « en marche ») ──');
{ const run=mkState({sid:'planA',cut:5}); run.chrono={sec:1,startTs:'2026-11-20T08:00:00.000Z',wasRunning:true,runStart:Date.now()-1000,began:'2026-11-20T08:00:00.000Z'};
  const m=monde(); await m.go(run); m.snap(); await m.go(B4x());
  const ar=m.arch().length===1?m.store[m.arch()[0]]:null;
  ok(!!ar&&ar.state.chrono.wasRunning===false&&ar.state.chrono.runStart===null&&ar.state.chrono.sec===1,'T17a. sauvegarde prise chrono EN MARCHE : l\'archive porte wasRunning:false, runStart:null (v2 : wasRunning:true, la reprise comptait tout le temps passé sur l\'autre commande), sec conservé : '+JSON.stringify(ar&&ar.state.chrono));
  const curRun={id:m.aid,savedAt:'2026-11-20T09:00:00.000Z',state:clone(run),ownerPost:'CEVENINI',owner:'JF',ownerUid:'u1'}; const ar2=T(()=>m.call('_l564ArchiveDe',curRun,B4x()));
  ok(!!ar2&&ar2.doc.state.chrono.wasRunning===false&&curRun.state.chrono.wasRunning===true&&curRun.state.chrono.runStart===run.chrono.runStart,'T17b. la sauvegarde d\'origine n\'est pas modifiée (l\'archive porte une COPIE du chrono figé)');
  const pau=mkState({sid:'planA',cut:5}); const m2=monde(); await m2.go(pau); m2.snap(); await m2.go(B4x());
  ok(m2.arch().length===1&&JSON.stringify(m2.store[m2.arch()[0]].state)===JSON.stringify(pau),'T17c. chrono en pause : état archivé identique, octet pour octet (T2a)');
}

console.log('── T10. câblage lu dans le source (ordre, bornes, gardien, scènes) ──');
{ const tick=T(()=>fnOf('autosaveDraftTick'))||'';
  const iPers=tick.indexOf('persistCmdLive(st)'), iLev=tick.indexOf('_l564MemeCommande(_cur,st)'), iArch=tick.indexOf('_l564Archiver(_ar'), iUnsh=tick.indexOf('drafts.unshift('), iPd=tick.indexOf('persistDrafts(drafts)');
  ok(iPers>0&&iLev>iPers&&iArch>iLev&&iUnsh>iArch&&iPd>iUnsh,'T10a. ordre dans autosaveDraftTick : photo locale, puis garde « consommé » (même commande ?), puis ARCHIVE, puis l\'écrasement (unshift + persistDrafts)');
  ok(/if\(_l564MemeCommande\(_cur,st\)\) return;/.test(tick)&&!/if\(_cur&&_cur\.consumed\) return;/.test(tick),'T10b. plus de sortie inconditionnelle sur « consommé » : seule la MÊME commande sort');
  ok(/_l564Archiver\(_ar,function\(f\)\{ autosaveDraftTick\(force\|\|f\); \},force\); return; \}/.test(tick),'T10c. l\'archive est suivie d\'un tick REJOUÉ en entier (jamais d\'un écrasement avec un état périmé)');
  const arch=T(()=>fnOf('_l564Archiver'))||'';
  ok(/await boundedWrite\(db\.collection\('brouillons'\)\.doc\(ar\.id\)\.set\(stripped\),8000\);/.test(arch)&&!/await [A-Za-z_$.]*\.set\(/.test(arch.replace(/await boundedWrite\([^\n]*/,'')),'T10d. l\'unique écriture du lot est BORNÉE (boundedWrite 8 s)');
  const lot=FN_LOT.filter(present).map(fnOf).join('\n')+'\n'+arch;
  ok(!/await logAudit\(/.test(lot+tick)&&(src.match(/await logAudit\(/g)||[]).length===0,'T10e. aucun « await logAudit( » (interdit depuis L501)');
  ok(!/\.delete\(|deleted:true|consumed:true|permanent_delete/.test(lot),'T10f. le lot ne supprime ni ne consomme RIEN (ni delete, ni deleted:true, ni consumed:true dans ses fonctions)');
  const sup=T(()=>fnOf('_supersededManualDrafts'))||'';
  ok(sup.indexOf('_l564PlusAvance(d,newDraft)')>sup.indexOf('d.fromFicheId')&&sup.indexOf('_l564PlusAvance(d,newDraft)')<sup.indexOf('d.id===_resumedDraftId'),'T10g. la garde « plus avancé » précède le chemin « repris » ET le dernier return : elle couvre les deux');
  ok(/^[ \t]*function _l520DraftVisible|function _l520DraftVisible/m.test(src)&&!/_l564/.test(fnOf('_l520DraftVisible')),'T10h. _l520DraftVisible non touchée');
  const touche=['persistDrafts','clearCurrentDraft','purgeExpiredBrouillons','newCmdPark','saveDraftManual'].filter(n=>present(n)&&/_l564|L564/.test(fnOf(n)));
  ok(touche.length===0,'T10i. fonctions que le lot ne doit PAS toucher (resetSiteConfirm : touché par F1 seulement, voir T10p ; clearCurrentDraft : F5 NON faite) : '+(touche.join(',')||'aucune touchée'));
  const rst=T(()=>fnOf('resetSiteConfirm'))||''; const iK=rst.indexOf('_keepA=_protege(_aDoc)'), iR=rst.indexOf('_l564ArchiveDe(_aDoc,'), iP=rst.indexOf('persistDrafts([{id:_park40');
  ok(iK>0&&iR>iK&&iP>iR&&/_all\.push\(_draftStrip\(_a564\.doc\)\)/.test(rst)&&/if\(!_keepA&&_aDoc\)/.test(rst),'T10p. [F1] resetSiteConfirm : l\'archive est calculée APRÈS les gardes de protection, poussée dans la liste écrite AVANT le parcage / la purge, et seulement si la sauvegarde va être supprimée');
  const iRd=tick.indexOf('_l564Lire(aid'), iMc=tick.indexOf('_l564MemeCommande(_cur,st)');
  ok(iRd>iMc&&iRd<iArch&&/if\(!_cur&&db\)\{ const _kLu='lu\|'\+aid;/.test(tick)&&/_l564Fait\[_kLu\]===2\)\{ if\(force\) _l564LuForce=true; return; \}/.test(tick)&&/_l564Fait\[_kLu\]=2; _l564LuForce=!!force;/.test(tick),'T10q. [F3] la lecture bornée est placée APRÈS la garde « consommé » et AVANT l\'archive, une fois par session, avec attente des ticks pendant la lecture et drapeau « force »');
  const lire=T(()=>fnOf('_l564Lire'))||'';
  ok(/Promise\.race\(\[db\.collection\('brouillons'\)\.doc\(aid\)\.get\(\), new Promise\(function\(r\)\{ setTimeout\(function\(\)\{ r\(null\); \},4000\); \}\)\]\)/.test(lire)&&!/\.set\(|\.update\(|\.delete\(/.test(lire),'T10r. [F3] la lecture est BORNÉE à 4 s et n\'écrit rien');
  const iSid=src.indexOf("const _l564SidEnvoi=String(loadedSaveId||'');"), iDies=src.indexOf("// #5 : si la fiche vient d'un plan sauvegardé chargé"), iAutre=src.indexOf('_autre564=!!(d.archive===true&&opts&&opts.manqueMatiere===true&&_l564SidEnvoi&&');
  ok(iSid>0&&iDies>iSid&&iAutre>iDies&&/_plus=\(d\.archive===true&&!_snap&&\(_cutD>_l545CutIds\.size\|\|_autre564\)\)/.test(src)&&/archive d’un AUTRE plan de cette commande/.test(src),'T10s. [F2] le plan source de l\'envoi est lu AVANT sa remise à null ; en arrêt manque matière une archive d\'un AUTRE plan source connu est gardée, avec son propre texte de toast');
  const g=(gardien.match(/L564/g)||[]).length; ok(g>=20&&/has\(\/const id='d_arch_'/.test(gardien),'T10j. le gardien porte les marqueurs L564 ('+g+' mentions) : levée du marqueur, ordre archive / écrasement, bornes');
  const boucle=t=>{ const mm=/for s in ([a-z0-9 -]+); do/.exec(t); return mm?mm[1].trim().split(/ +/):[]; };
  const bb=boucle(bat), bc=boucle(ci);
  ok(['supersede','stuck','archive','orphan','liste'].every(n=>bb.indexOf('brouillons-'+n)>=0)&&bb.join(' ')===bc.join(' ')&&bb.slice(-2).join(' ')==='donnees analyse','T10k. les scènes du lot sont dans la boucle de la batterie ET de la CI (mêmes listes), AVANT « donnees analyse »');
  ok((function(){ const mm=/Smokes \((\d+) scenes,/.exec(ci); return !!mm&&(+mm[1])===bc.length; })(),'T10l. la CI annonce le VRAI nombre de scènes de sa boucle');
  const NOMS5=['supersede','stuck','archive','orphan','liste'].map(n=>'brouillons-'+n);
  ok(NOMS5.every(n=>new RegExp("'"+n+"': `").test(shot)&&new RegExp("'"+n+"': \"").test(shot))&&shot.indexOf('|'+NOMS5.join('|'))>0,'T10m. les 5 scènes sont dans shot.mjs (SETUP, CHECKS et ligne d usage)');
  ok(NOMS5.every(n=>{ const m=new RegExp("'"+n+"': `([^]*?)`,   //").exec(shot); return !!m&&m[1].indexOf('_trainingMode=false')===0&&m[1].indexOf('startTraining()')<0; }),'T10n. chaque scène joue HORS entraînement (en entraînement la sauvegarde automatique ne tourne pas : une scène verte y prouverait le contraire)');
}
console.log(fail?('\n💥 '+fail+' vérification(s) rouge(s) sur '+total):('\n🏆 brouillons lot 1 : '+total+' vérifications vertes'));
process.exit(fail?1:0);
})().catch(e=>{ console.error('💥 test interrompu :',e&&e.stack||e); process.exit(1); });
