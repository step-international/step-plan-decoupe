// ordre_l560_test.js — [L560 · demande Celine 05/11/2026, remontee des equipes] GARDE de « commande DEMARREE : on peut changer l ordre des
// references PAS ENCORE COMMENCEES, sans rien regenerer ni recalculer ; une reference commencee garde sa place ». Helper pur execute,
// application executee sur un DOM factice a freres chaines (memes noeuds avant / apres), vraies gardes chargees du source, cablage lu
// dans le source. Horloge pilotee (anti-rebond, jeton d annulation). Ne couvre pas le rendu navigateur (scene « fiche-ordre » de
// tests/shot.mjs). Durci apres la contre-lecture du lot (41 mutations jouees : chaque garde a ete vue rouge).
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const shot=fs.readFileSync(path.join(__dirname,'shot.mjs'),'utf8');
const bat=fs.readFileSync(path.join(__dirname,'battery.sh'),'utf8');
let ci=''; try{ ci=fs.readFileSync(path.join(ROOT,'.github','workflows','static.yml'),'utf8'); }catch(e){}
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)return src.slice(i,j+1);}}throw new Error('non fermee '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c===true?'✅ ':'❌ ')+m); if(c!==true)fail++; };
const T=f=>{ try{ return f(); }catch(e){ console.log('   (exception : '+(e&&e.message||e)+')'); return false; } };
const F=n=>{ try{ return fnOf(n); }catch(e){ return ''; } };
function load(n){ try{ global[n]=eval('('+fnOf(n)+')'); return true; }catch(e){ global[n]=function(){ throw new Error('fonction absente : '+n); }; return false; } }
['_l560Echange','_l560RefCommencee','_l560Pivots','_l560Bandes','_l560RailSync','_l560SoldeSig','_l560SoldeSnap','_l560SoldeRestore','_l560Deplacer','_l525Done','_l527DomIdx','fmmCutOrder','fmmMoveRef','fmmUndoOrder'].forEach(load);
let clock=1700000000000; Date.now=()=>clock;   /* horloge pilotee */

console.log('── A. helper PUR _l560Echange ──');
const E=(c,a,b)=>_l560Echange(c,a,b);
ok(T(()=>E([0,0,1,1,2,2],1,2).join()==='0,1,4,5,2,3'),'A A B B C C, echange B / C → A A C C B B (les rangs 4,5 passent devant 2,3)');
ok(T(()=>E([0,0,1,1,2,2],2,1).join()==='0,1,4,5,2,3'),'meme resultat quel que soit le sens de l appel (C / B)');
ok(T(()=>E([0,0,1,1,2,2],0,1).join()==='2,3,0,1,4,5'),'echange A / B : la fin de la fiche (C) ne bouge pas');
ok(T(()=>E([0,1,1,1,2],1,2).join()==='0,4,1,2,3'),'plages de tailles differentes (3 bobines / 1 bobine)');
ok(T(()=>E([0,0,1,1,2,2],0,2)===null),'references NON voisines (A / C avec B entre les deux) → refus (null)');
ok(T(()=>E([0,1,0,1],0,1)===null),'plage MORCELEE (A B A B) → refus (null), jamais un echange partiel');
ok(T(()=>E([0,0,1,1],1,1)===null&&E(null,0,1)===null&&E('x',0,1)===null),'meme reference deux fois, ou entree invalide → null');
ok(T(()=>E([0,0,2,2],1,2).join()==='0,1,2,3'&&E([0,0,2,2],2,1).join()==='0,1,2,3'),'une des deux references n a AUCUNE bobine a l ecran (stock) → identite : seul l ordre du rail change');
ok(T(()=>{ const c=[5,5,5,7,7,9,3,3]; const p=E(c,7,9); const s=p.slice().sort((x,y)=>x-y).join(); const apres=p.map(i=>c[i]); return s==='0,1,2,3,4,5,6,7'&&apres.join()==='5,5,5,9,7,7,3,3'&&p.filter(i=>c[i]===7).join()==='3,4'; }),'c est une PERMUTATION (aucune ligne perdue ni doublee) et l ordre INTERNE de chaque reference est conserve');
ok(T(()=>{ const c=[0,0,1,1,2,2]; const p=E(c,1,2); return p[0]===0&&p[1]===1; }),'les bobines de la reference commencee (en tete) gardent exactement leur rang');

console.log('── B. application sur un DOM factice (memes noeuds avant / apres) ──');
let cont, byId, toasts, compte, shared, lidPivot, frozenIds, untouched, ctxNom;
function mkNode(id,cls){ const n={id:id,_c:new Set(cls||[]),parentNode:null,dataset:{},classList:{contains:c=>n._c.has(c),toggle:(c,v)=>{ v?n._c.add(c):n._c.delete(c); },add:c=>n._c.add(c),remove:c=>n._c.delete(c)},querySelector:sel=>{ if(sel==='#act_dechet_'+id) return null; if(sel==='.frs-change') return n._band?{textContent:n._band}:null; return null; },compareDocumentPosition:o=>{ const a=cont.children.indexOf(n), b=cont.children.indexOf(o); return (b>a)?4:2; },remove:()=>{ const i=cont.children.indexOf(n); if(i>=0) cont.children.splice(i,1); }};
  Object.defineProperty(n,'previousElementSibling',{get(){ const i=cont.children.indexOf(n); return i>0?cont.children[i-1]:null; }});
  Object.defineProperty(n,'nextElementSibling',{get(){ const i=cont.children.indexOf(n); return (i>=0&&i<cont.children.length-1)?cont.children[i+1]:null; }});
  return n; }
function monde(opt){ const o=opt||{}; clock+=5000; window._l560T=0; window._l560Undo=null; global._fmmPrevOrder=null; global._fmmOrderGuardsOk=()=>false;
  toasts=[]; compte={imp:0,rec:0,renum:0,op2:0,rail:0,cup:0,cum:0,sol:0,auto:0,audit:[],undo:0,warn:0,sep:[],btn:0}; shared=false; lidPivot={}; frozenIds=new Set(); untouched=false; byId={}; ctxNom={};
  cont={id:'ficheLines',children:[],insertBefore(n,ref){ const i=this.children.indexOf(n); if(i>=0) this.children.splice(i,1); const j=this.children.indexOf(ref); this.children.splice(j<0?this.children.length:j,0,n); n.parentNode=this; },appendChild(n){ this.insertBefore(n,null); },replaceChild(neuf,vieux){ const i=this.children.indexOf(neuf); if(i>=0) this.children.splice(i,1); const j=this.children.indexOf(vieux); this.children.splice(j,1,neuf); neuf.parentNode=this; },querySelectorAll(sel){ return this.children.filter(n=>sel==='.fiche-ref-sep'?n._c.has('fiche-ref-sep'):false); },get lastElementChild(){ return this.children[this.children.length-1]; }};
  byId.ficheLines=cont;
  global.ficheLines=[]; const refs=o.refs||[{idx:0,ref:'A',refKey:'kA',machine:''},{idx:1,ref:'B',refKey:'kB',machine:''},{idx:2,ref:'C',refKey:'kC',machine:''}];
  global.fmmRawRefs=()=>refs; global.ficheRefOrder=(o.ordre||refs.map(r=>r.idx)).slice();
  global.getEtiquetteSoldeList=()=>[]; global.refreshEtiquetteSolde=()=>{ compte.sol++; }; global.updateEtiquetteBtn=()=>{ compte.btn++; };
  (o.ordre||refs.map(r=>r.idx)).forEach(function(i){ const r=refs.find(x=>x.idx===i); const n=(o.nb&&o.nb[i]!=null)?o.nb[i]:2; const pre=(o.pre&&o.pre[i])||r.ref.toLowerCase();
    if(!o.sansSep){ const s=mkNode('sep'+i,['fiche-ref-sep'].concat(r.machine?[r.machine]:[])); s.dataset.ref=r.ref; s.dataset.refKey=r.refKey; cont.appendChild(s); byId[s.id]=s; }
    if(n>0&&!o.sansCarte){ const b=mkNode('blk'+i,['fmm-block']); cont.appendChild(b); byId[b.id]=b; }
    for(let k=1;k<=n;k++){ const id=pre+k; const nd=mkNode(id,['fiche-line']); cont.appendChild(nd); byId[id]=nd; ficheLines.push({id:id,ref:r.ref,refIdKey:r.refKey,refIdx:refs.indexOf(r)}); } });   /* refIdx = rang dans le plan CALCULE (comme importPlanToFiche), pas l index du rail */
  return refs; }
global.document={getElementById:id=>byId[id]||null};
global.window=global; global.MACHINE_KEYS=['feba','maveg','cevenini']; global.getMachineLabel=m=>String(m||'').toUpperCase(); global.refDisp=x=>String(x); global.nrm=x=>String(x||'').toLowerCase();
global.refDispCtx=(ref,key)=>String(ref)+(ctxNom[key]||'');   /* bouchon du nom « avec contexte » (metrage) : la vraie fonction lit le Plan */
global.showToast=(m,k)=>{ toasts.push(String(k||'')+'|'+String(m)); };
global._shareCurrentDocId=()=>shared?'doc':null; global._recalcPending=false;
global.isLineFrozen=id=>frozenIds.has(id); global.isFicheUntouched=()=>untouched;
global._bobineSelLid=id=>lidPivot[id]||null;
global.importPlanToFiche=()=>{ compte.imp++; }; global.recalcEcartsFromFiche=()=>{ compte.rec++; };
global.renumberFicheLines=()=>{ compte.renum++; }; global.refreshOp2BobineList=()=>{ compte.op2++; }; global.renderFicheMachineBlocks=()=>{ compte.rail++; }; global.updateCoupeeStatus=()=>{ compte.cup++; }; global.updateAllCumuls=()=>{ compte.cum++; };
global.autosaveDraftTick=f=>{ compte.auto+=(f===true?1:100); }; global.logAudit=function(){ compte.audit.push(Array.prototype.slice.call(arguments)); return Promise.resolve(); };
global._fmmShowUndo=()=>{ compte.undo++; }; global._l505Warn=()=>{ compte.warn++; };
global._l434SnapLabels=()=>({}); global._l434RestoreLabels=()=>{};
global.insertFicheRefSeparator=function(ref,u,lg,mach,prev,mo,ed,twin,key){ const s=mkNode('neuf'+compte.sep.length,['fiche-ref-sep'].concat(mach?[mach]:[])); s.dataset.ref=ref; s.dataset.refKey=key; const lb=mach?getMachineLabel(mach):'', pl=prev?getMachineLabel(prev):''; if(lb&&pl&&lb!==pl) s._band='⚙ CHANGEMENT DE MACHINE — '+pl+' → '+lb; cont.appendChild(s); compte.sep.push({ref:ref,mach:mach,prev:prev,twin:twin,key:key,lg:lg}); };
const couper=id=>byId[id]._c.add('coupee');
const lignes=()=>ficheLines.map(l=>l.id).join(' ');
const ecran=()=>cont.children.map(n=>n.id).join(' ');
const der=()=>toasts[toasts.length-1]||'';

monde(); couper('a1'); const objAvant=ficheLines.slice(); const noeudsAvant=cont.children.slice();
ok(T(()=>_l560Deplacer(2,-1)===true&&lignes()==='a1 a2 c1 c2 b1 b2'&&ficheRefOrder.join()==='0,2,1'),'A commencee, on fait monter C : les bobines deviennent A A C C B B et l ordre de coupe 0,2,1');
ok(T(()=>ecran()==='sep0 blk0 a1 a2 sep2 blk2 c1 c2 sep1 blk1 b1 b2'),'a l ecran, le bloc ENTIER de C (separateur, carte de reference, bobines) est passe devant celui de B');
ok(T(()=>ficheLines.every(l=>objAvant.indexOf(l)>=0)&&ficheLines.length===objAvant.length&&cont.children.every(n=>noeudsAvant.indexOf(n)>=0)&&cont.children.length===noeudsAvant.length),'ce sont les MEMES objets et les MEMES noeuds qu avant : rien n est recree, rien n est perdu');
ok(T(()=>ficheLines[0].id==='a1'&&byId.a1._c.has('coupee')&&cont.children.indexOf(byId.a1)===2),'la bobine COUPEE n a pas bouge (meme rang, toujours coupee)');
ok(T(()=>compte.imp===0&&compte.rec===0),'aucune regeneration (importPlanToFiche) ni recalcul (recalcEcartsFromFiche)');
ok(T(()=>compte.renum===1&&compte.op2===1&&compte.rail===1&&compte.cup===1&&compte.cum===1&&compte.sol===1&&compte.auto===1),'rafraichissements : numeros, listes « a partir de la bobine », rail, compteurs, cumuls, etiquette solde, et sauvegarde IMMEDIATE du brouillon (force)');
ok(T(()=>compte.audit.length===1&&compte.audit[0][0]==='edit'&&/EN COURS de commande/.test(compte.audit[0][3])&&/« C » passe avant « B »/.test(compte.audit[0][3])),'une ligne au journal : qui passe avant qui, en cours de commande');
ok(T(()=>compte.undo===1&&window._l560Undo&&window._l560Undo.idx===2&&window._l560Undo.dir===1&&/^ok\|/.test(der())&&/« C » passe avant « B »/.test(der())&&/Le plan de découpe ne change pas/.test(der())),'bandeau Annuler arme (echange inverse) + message vert dans le BON sens : « C » passe avant « B », le plan de decoupe ne change pas');
ok(T(()=>{ const n=toasts.length; const r=_l560Deplacer(2,-1); return r===false&&lignes()==='a1 a2 c1 c2 b1 b2'&&ficheRefOrder.join()==='0,2,1'&&toasts.length===n+1&&/« A » a déjà une bobine coupée ou renseignée/.test(toasts[n])&&/^err\|/.test(toasts[n]); }),'faire monter C DEVANT A (commencee) : refuse, rien ne bouge, le message nomme la reference qui bloque');
ok(T(()=>{ const r=_l560Deplacer(0,1); return r===false&&lignes()==='a1 a2 c1 c2 b1 b2'&&ficheRefOrder.join()==='0,2,1'; }),'faire DESCENDRE A (commencee) : refuse, rien ne bouge');
ok(T(()=>{ untouched=false; fmmUndoOrder(); return lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,1,2'&&ecran()==='sep0 blk0 a1 a2 sep1 blk1 b1 b2 sep2 blk2 c1 c2'&&window._l560Undo===null&&/Ordre de coupe rétabli/.test(der())&&compte.imp===0; }),'« Annuler » : l echange inverse remet exactement l ordre et l ecran d avant, sans regeneration');
ok(T(()=>{ _l560Deplacer(2,-1); clock+=60000; const l=lignes(); fmmUndoOrder(); return lignes()===l&&window._l560Undo===null&&compte.imp===0; }),'un jeton d annulation PERIME (bandeau disparu depuis longtemps) n annule plus rien');
monde(); couper('a1'); T(()=>_l560Deplacer(2,-1)); untouched=true;
ok(T(()=>{ const l=lignes(); fmmUndoOrder(); return lignes()===l&&ficheRefOrder.join()==='0,2,1'&&window._l560Undo===null&&compte.imp===0; }),'« Annuler » alors que la fiche est REDEVENUE vierge : le jeton est jete, rien ne bouge');

monde(); couper('a1'); frozenIds.add('b1');
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&/« B » a déjà une bobine coupée ou renseignée/.test(der())),'B engagee par un GESTE (etiquette tapee, photo, NC : isLineFrozen) = commencee : C ne passe pas devant');
monde(); couper('a1'); couper('a2');
ok(T(()=>_l560Deplacer(1,1)===true&&lignes()==='a1 a2 c1 c2 b1 b2'),'A FINIE : l operateur choisit laquelle vient ensuite (B descend sous C)');
monde(); couper('a1'); shared=true;
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&/PARTAGÉE/.test(der())&&compte.auto===0),'commande PARTAGEE : _l560Deplacer refuse lui aussi (L113), rien ne bouge, rien n est sauvegarde');
monde(); couper('a1'); global._recalcPending=true;
ok(T(()=>{ const r=_l560Deplacer(2,-1); global._recalcPending=false; return r===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&/Recalcul en cours/.test(der()); }),'pendant la seconde d attente d un recalcul : refuse');
global._recalcPending=false;
monde(); couper('a1'); byId.fLameChg={checked:true}; lidPivot.fLameChgBob='c2';
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&/changement de lame démarre sur une bobine de ces références/.test(der())),'un changement de lame ACTIF qui demarre sur une bobine de la reference DEPLACEE : refuse (le pivot changerait de rang)');
monde(); couper('a1'); byId.fLameChg={checked:true}; lidPivot.fLameChgBob='b1';
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,1,2'&&/changement de lame démarre sur une bobine de ces références/.test(der())),'pivot LAME sur une bobine de la reference VOISINE (B) alors qu on deplace C : refuse, rien ne bouge');
monde(); couper('a1'); byId.fMachChg={checked:true}; lidPivot.fMachChgBob='b1';
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,1,2'&&/changement de machine démarre sur une bobine de ces références/.test(der())),'changement de MACHINE actif a partir d une bobine de B : refuse, rien ne bouge (la machine s applique par rang)');
monde(); couper('a1'); byId.fOp2Active={checked:true}; lidPivot.fOp2Bobine='c1';
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,1,2'&&/opérateur 2 démarre sur une bobine de ces références/.test(der())),'OPERATEUR 2 actif a partir d une bobine de C : refuse, rien ne bouge');
monde(); couper('a1'); byId.fLameChg={checked:true}; lidPivot.fLameChgBob='a2';
ok(T(()=>_l560Deplacer(2,-1)===true&&lignes()==='a1 a2 c1 c2 b1 b2'),'le pivot est sur une bobine de A (hors des deux blocs) : l echange est permis');
monde(); couper('a1'); byId.fLameChg={checked:false}; lidPivot.fLameChgBob='c2';
ok(T(()=>_l560Deplacer(2,-1)===true),'un pivot dont la case est DECOCHEE (bascule inactive) ne bloque rien');
monde(); couper('a1'); ficheLines[5].refIdKey=null; ficheLines[5].refIdx=undefined;
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ecran()==='sep0 blk0 a1 a2 sep1 blk1 b1 b2 sep2 blk2 c1 c2'&&ficheRefOrder.join()==='0,1,2'&&/n'est pas rattachée à sa référence/.test(der())),'une bobine rattachee a AUCUNE reference : refuse avec le bon message, rien ne bouge');
monde(); couper('a1'); byId.c1.parentNode={id:'ailleurs'};
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,1,2'&&/n'est pas rattachée à sa référence/.test(der())),'une carte de bobine qui n est pas un enfant direct de la liste : refuse, rien ne bouge');
monde(); couper('a1'); cont.insertBefore(byId.c1,byId.b1);
ok(T(()=>_l560Deplacer(2,-1)===false&&ficheRefOrder.join()==='0,1,2'&&/Rien n'a été changé/.test(der())),'l ecran ne suit pas l ordre de ficheLines (disposition inhabituelle) : refuse plutot que de deplacer a l aveugle');
monde(); couper('a1'); ficheRefOrder=[0,2,1];
ok(T(()=>_l560Deplacer(1,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,2,1'&&/ne sont pas dans le même ordre/.test(der())&&compte.auto===0),'rail et cartes deja en DESACCORD (rail A C B, cartes A B C) : refuse, jamais un echange a contresens');
monde({sansSep:true}); couper('a1');
ok(T(()=>_l560Deplacer(2,-1)===true&&lignes()==='a1 a2 c1 c2 b1 b2'&&ecran()==='blk0 a1 a2 blk2 c1 c2 blk1 b1 b2'),'brouillon repris SANS separateurs : les cartes de bobine (et la carte de reference) se deplacent quand meme');
ok(T(()=>{ monde(); couper('a1'); couper('a2'); const ph=mkNode('ph352',['l352-home']); cont.insertBefore(ph,byId.blk1); byId.blk1.remove(); const e0=ecran(); const r=_l560Deplacer(2,-1); const e1=ecran(); _l560Deplacer(2,1,{undo:true}); const e2=ecran(); return r===true&&e1==='sep0 blk0 a1 a2 sep2 blk2 c1 c2 sep1 ph352 b1 b2'&&e2===e0; }),'noeud etranger (jalon cache de l en-tete depliee) entre le separateur et la 1re bobine : le separateur SUIT sa reference, et Annuler rend l ecran de depart');
monde({nb:{0:2,1:0,2:2}}); couper('a1');
ok(T(()=>_l560Deplacer(2,-1)===true&&lignes()==='a1 a2 c1 c2'&&ficheRefOrder.join()==='0,2,1'),'B entierement couverte par le stock (aucune bobine) : seul l ordre du rail change, aucune carte ne bouge');
monde(); couper('a1');
ok(T(()=>_l560Deplacer(2,1)===false&&_l560Deplacer(7,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&toasts.length===0),'hors bornes (descendre la derniere, reference inconnue) : rien, sans message');
monde({refs:[{idx:0,ref:'A',refKey:'kA',machine:'feba'},{idx:1,ref:'B',refKey:'kB',machine:'feba'},{idx:2,ref:'C',refKey:'kC',machine:'maveg'}]}); couper('a1'); byId.sep2._band='⚙ CHANGEMENT DE MACHINE — FEBA → MAVEG';
ok(T(()=>{ const r=_l560Deplacer(2,-1); const s=cont.children.filter(n=>n._c.has('fiche-ref-sep')); return r===true&&compte.sep.length===1&&compte.sep[0].ref==='B'&&compte.sep[0].mach==='feba'&&compte.sep[0].prev==='maveg'&&s.length===3&&s[1]._band==='⚙ CHANGEMENT DE MACHINE — FEBA → MAVEG'&&s[2]._band==='⚙ CHANGEMENT DE MACHINE — MAVEG → FEBA'; }),'fiche a DEUX machines : la bande rouge « CHANGEMENT DE MACHINE » est recalculee la ou elle change (B derriere C), les autres separateurs ne sont pas refaits');
monde({refs:[{idx:0,ref:'A',refKey:'kA',machine:''},{idx:2,ref:'B',refKey:'kA',machine:''},{idx:3,ref:'C',refKey:'kC',machine:''}]}); couper('c1');
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,2,3'&&/MÊME référence/.test(der())&&compte.auto===0),'deux blocs de la MEME reference (une cle, deux machines) : leur echange est refuse (ils partagent le compteur n/T et la derniere bobine)');
monde(); couper('a1'); byId.planDriftBanner={style:{display:''},textContent:'Le plan a changé'};
ok(T(()=>_l560Deplacer(2,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,1,2'&&/applique d'abord les changements/.test(der())),'bandeau « Le plan a change » en attente : refuse (les bobines a l ecran ne correspondent plus forcement aux references de la liste)');
monde(); couper('a1'); byId.planDriftBanner={style:{display:'none'},textContent:'vieux texte'};
ok(T(()=>_l560Deplacer(2,-1)===true),'bandeau de derive MASQUE : aucun refus');
monde(); couper('a1'); global._fmmPrevOrder=[9,9,9];
ok(T(()=>{ const sv=global.renumberFicheLines; global.renumberFicheLines=()=>{ throw new Error('boum'); }; const r=_l560Deplacer(2,-1); global.renumberFicheLines=sv; return r===true&&lignes()==='a1 a2 c1 c2 b1 b2'&&compte.warn===1&&der().indexOf('err|')===0&&/un affichage ne s'est pas rafraîchi/.test(der())&&toasts.some(t=>t.indexOf('ok|')===0)&&compte.auto===1&&global._fmmPrevOrder===null; }),'un rafraichissement en panne : l echange est fait et sauvegarde, la panne est TRACEE et DITE (jamais un vert seul) ; l ancien ordre memorise avant la 1re coupe est purge');
ok(T(()=>{ const sv=global._l527DomIdx; global._l527DomIdx=()=>{ throw new Error('boum'); }; const r=_l560RefCommencee(1); global._l527DomIdx=sv; return r===true; }),'critere « commencee » en erreur : le verrou se FERME (reference tenue pour commencee)');
/* rattachement par _l527DomIdx : index du rail (0,2,3 : un bloc du Plan SANS ligne devant) different du rang dans le plan calcule (0,1,2), et cle PARTAGEE par deux blocs (repli sur refIdx converti) */
const DEC=()=>[{idx:0,ref:'A',refKey:'kA',machine:''},{idx:2,ref:'B',refKey:'kA',machine:''},{idx:3,ref:'C',refKey:'kC',machine:''}];
monde({refs:DEC()}); couper('a1'); couper('a2'); couper('b1');
ok(T(()=>ficheLines.map(l=>l.refIdx).join()==='0,0,1,1,2,2'&&ficheLines.map(l=>_l527DomIdx(l)).join()==='0,0,2,2,3,3'&&_l560Deplacer(3,-1)===false&&_l560Deplacer(2,1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,2,3'&&cont.children.indexOf(byId.b1)===6&&/« B » a déjà une bobine coupée ou renseignée/.test(der())),'index du rail ≠ rang du plan calcule + cle partagee : la reference COMMENCEE (b1 coupee) garde sa place, dans les deux sens');
monde({refs:DEC()}); couper('a1');
ok(T(()=>_l560Deplacer(3,-1)===true&&lignes()==='a1 a2 c1 c2 b1 b2'&&ecran()==='sep0 blk0 a1 a2 sep3 blk3 c1 c2 sep2 blk2 b1 b2'&&ficheRefOrder.join()==='0,3,2'),'meme jeu, echange NORMAL : les CARTES de C passent devant celles de B (pas seulement le rail)');
monde({refs:DEC()}); couper('a1'); byId.fLameChg={checked:true}; lidPivot.fLameChgBob='b2';
ok(T(()=>_l560Deplacer(3,-1)===false&&lignes()==='a1 a2 b1 b2 c1 c2'&&ficheRefOrder.join()==='0,2,3'&&/changement de lame démarre sur une bobine de ces références/.test(der())),'meme jeu : un pivot sur une bobine de la reference VOISINE est bien rattache a son bloc (refus)');
/* homonymes : meme nom court, metrages differents */
monde({refs:[{idx:0,ref:'A',refKey:'kA',machine:''},{idx:1,ref:'KX1035',refKey:'k500',machine:''},{idx:2,ref:'KX1035',refKey:'k700',machine:''}],pre:{1:'b',2:'c'}}); couper('a1'); ctxNom={k500:' · 500 ml',k700:' · 700 ml'};
ok(T(()=>_l560Deplacer(2,-1)===true&&/« KX1035 · 700 ml » passe avant « KX1035 · 500 ml »/.test(der())&&/« KX1035 · 700 ml » passe avant « KX1035 · 500 ml »/.test(compte.audit[0][3])&&compte.audit[0][4].ref==='KX1035 · 700 ml'),'references HOMONYMES : le message et le journal nomment chacune avec son metrage (plus de « KX1035 passe avant KX1035 »)');
/* etiquette solde : la saisie SUIT sa reference */
function soldeMonde(jumeaux){ const info={0:{ref:'A',lg:500,mo:1250,def:'120'},1:{ref:'B',lg:500,mo:1250,def:'80'},2:{ref:jumeaux?'B':'C',lg:jumeaux?500:700,mo:1250,def:'60'}};
  const liste=()=>fmmCutOrder().map((idx,rang)=>({key:'r'+rang,ref:info[idx].ref,film:'',veka:'',longueur:info[idx].lg,mother:info[idx].mo,def:info[idx].def}));
  const rendre=()=>{ compte.sol++; Object.keys(byId).filter(k=>/^etiq/.test(k)).forEach(k=>{ delete byId[k]; }); liste().forEach(d=>{ byId['etiqSolde_'+d.key]={value:d.def,defaultValue:d.def}; byId['etiqNumMere_'+d.key]={value:'',defaultValue:''}; byId['etiqRefNum_'+d.key]={value:'',defaultValue:''}; }); };
  global.getEtiquetteSoldeList=liste; global.refreshEtiquetteSolde=rendre; rendre(); compte.sol=0; }
monde(); couper('a1'); couper('a2'); soldeMonde(false); byId.etiqSolde_r0.value='95'; byId.etiqNumMere_r0.value='11'; byId.etiqRefNum_r0.value='GHX173A'; byId.etiqNumMere_r1.value='B-77';
ok(T(()=>_l560Deplacer(1,1)===true&&compte.sol===1&&byId.etiqSolde_r0.value==='95'&&byId.etiqNumMere_r0.value==='11'&&byId.etiqRefNum_r0.value==='GHX173A'),'etiquette solde de A (finie) : laize restante corrigee, n° de bobine mere et n° de reference TAPES survivent au changement d ordre');
ok(T(()=>byId.etiqNumMere_r2.value==='B-77'&&byId.etiqNumMere_r1.value===''&&byId.etiqSolde_r1.value==='60'&&byId.etiqSolde_r2.value==='80'&&compte.btn>=2),'le n° tape pour B SUIT B (rang 2 apres l echange), il ne reste pas sur le rang 1 devenu C ; un champ non tape garde la valeur fraiche');
ok(T(()=>{ _l560Deplacer(1,-1,{undo:true}); return byId.etiqNumMere_r1.value==='B-77'&&byId.etiqNumMere_r2.value===''&&byId.etiqSolde_r0.value==='95'; }),'apres « Annuler », la saisie revient avec sa reference');
monde(); couper('a1'); couper('a2'); soldeMonde(true); byId.etiqNumMere_r1.value='B-77';
ok(T(()=>_l560Deplacer(1,1)===true&&byId.etiqNumMere_r1.value===''&&byId.etiqNumMere_r2.value===''),'deux etiquettes INDISCERNABLES (meme reference, meme metrage) : la saisie n est PAS reposee plutot que transplantee sur la mauvaise');

console.log('── C. aiguillage de fmmMoveRef (fleches du rail), vraies gardes ──');
monde(); couper('a1'); untouched=false;
ok(T(()=>{ fmmMoveRef(2,-1); return lignes()==='a1 a2 c1 c2 b1 b2'&&compte.imp===0; }),'commande DEMARREE : la fleche passe par le deplacement par blocs, jamais par la regeneration');
monde(); couper('a1'); untouched=false;
ok(T(()=>{ fmmMoveRef(2,-1); clock+=80; fmmMoveRef(fmmCutOrder()[2],-1); clock+=80; fmmMoveRef(fmmCutOrder()[1],1); const un=(lignes()==='a1 a2 c1 c2 b1 b2'&&compte.audit.length===1&&compte.auto===1); clock+=900; fmmMoveRef(fmmCutOrder()[2],-1); return un&&lignes()==='a1 a2 b1 b2 c1 c2'&&compte.audit.length===2; }),'DOUBLE APPUI (rail re-rendu, rangees decalees par le bandeau) : les appuis a moins de 500 ms sont ignores → UN seul echange ; un appui volontaire 900 ms plus tard passe');
monde(); couper('a1'); untouched=false;
ok(T(()=>{ fmmMoveRef(2,-1); fmmMoveRef(2,-1); clock+=80; const n=toasts.length; fmmMoveRef(0,1); return toasts.length===n&&lignes()==='a1 a2 c1 c2 b1 b2'; }),'pendant l anti-rebond, un appui est IGNORE en silence (ni echange, ni message d erreur parasite)');
monde(); untouched=true;
ok(T(()=>{ fmmMoveRef(2,-1); return compte.imp===1&&ficheRefOrder.join()==='0,2,1'&&compte.auto===0; }),'fiche VIERGE : comportement d avant (regeneration dans le nouvel ordre), le nouveau chemin n est pas pris');
monde(); couper('a1'); shared=true; untouched=false;
ok(T(()=>{ fmmMoveRef(2,-1); return lignes()==='a1 a2 b1 b2 c1 c2'&&compte.imp===0&&/PARTAGÉE/.test(der()); }),'partage, commande demarree : refuse');
monde(); shared=true; untouched=true;
ok(T(()=>{ fmmMoveRef(2,-1); return compte.imp===0&&ficheRefOrder.join()==='0,1,2'&&lignes()==='a1 a2 b1 b2 c1 c2'&&toasts.length===1&&/^err\|/.test(toasts[0])&&/PARTAGÉE/.test(toasts[0]); }),'fiche VIERGE + partage : la garde L113 de fmmMoveRef refuse AVANT la regeneration (ordre intact, aucun import)');
load('_fmmOrderGuardsOk'); load('fmmMoveRefTo'); const GARDE=global._fmmOrderGuardsOk;   /* la VRAIE garde remplace le bouchon : « Couper en 1er », le glisser et l ancienne annulation REGENERENT */
monde(); couper('a1'); untouched=false; global._fmmOrderGuardsOk=GARDE;
ok(T(()=>{ const r=fmmMoveRefTo(2,0); return r===false&&compte.imp===0&&compte.rail===0&&ficheRefOrder.join()==='0,1,2'&&lignes()==='a1 a2 b1 b2 c1 c2'&&global._fmmPrevOrder===null&&/^err\|/.test(der())&&/Commande démarrée/.test(der()); }),'« Couper en 1er » / glisser, commande DEMARREE : la VRAIE garde refuse (aucune regeneration, ordre et bobines inchanges, rien a annuler)');
monde(); couper('a1'); untouched=false; global._fmmOrderGuardsOk=GARDE; global._fmmPrevOrder=[2,0,1];
ok(T(()=>{ fmmUndoOrder(); return compte.imp===0&&ficheRefOrder.join()==='0,1,2'&&/Commande démarrée/.test(der()); }),'ancienne « Annuler » (ordre memorise AVANT la 1re coupe), commande DEMARREE : refusee, aucune regeneration');
monde(); untouched=true; global._fmmOrderGuardsOk=GARDE;
ok(T(()=>{ const r=fmmMoveRefTo(2,0); return r===true&&compte.imp===1&&ficheRefOrder.join()==='2,0,1'; }),'temoin fiche VIERGE : « Couper en 1er » regenere toujours (la garde ne refuse pas tout)');
monde();

console.log('── D. cablage (source) ──');
{ const m=F('fmmMoveRef'), d=F('_l560Deplacer');
  ok(m.indexOf('_l560Deplacer(idx,dir);')>0&&m.indexOf('_l560Deplacer(idx,dir);')<m.indexOf('importPlanToFiche(')&&m.indexOf('_d560<500')>0&&m.indexOf('_d560<500')<m.indexOf('_l560Deplacer(idx,dir);'),'fmmMoveRef : l anti-rebond puis l aiguillage « commande demarree » precedent la regeneration');
  ok(!!d&&d.indexOf('importPlanToFiche(')<0&&d.indexOf('recalcEcartsFromFiche(')<0&&d.indexOf('addFicheLine(')<0,'_l560Deplacer n appelle ni la regeneration, ni le recalcul, ni la creation de bobine');
  ok(/const fig=\[idx,autre\]\.filter\(_l560RefCommencee\);/.test(d)&&/_l525Done\(document\.getElementById\(l\.id\),l\.id\)/.test(F('_l560RefCommencee'))&&/_l527DomIdx\(l\)===idx&&_l525Done\(/.test(F('_l560RefCommencee')),'critere UNIQUE « reference commencee » : _l525Done sur les bobines rattachees par _l527DomIdx');
  ok(d.indexOf('const sol560=_l560SoldeSnap();')>0&&d.indexOf('const sol560=_l560SoldeSnap();')<d.indexOf('ficheLines=perm.map(')&&/refreshEtiquetteSolde\(\); _l560SoldeRestore\(sol560\);/.test(d),'etiquette solde : saisie relevee AVANT la permutation, reposee juste APRES le re-rendu de la liste');
  ok(/if\(window\._l560Undo\)\{/.test(F('fmmUndoOrder'))&&F('fmmUndoOrder').indexOf('window._l560Undo')<F('fmmUndoOrder').indexOf('importPlanToFiche('),'fmmUndoOrder : l annulation d un echange « commande demarree » passe AVANT la regeneration');
  ok(/^  if\(typeof isFicheUntouched==='function' && !isFicheUntouched\(\)\)\{\n    showToast\('🔒 Commande démarrée : utilise les flèches ▲▼ de la liste « Ordre de coupe »[^\n]*?','err'\); return false; \}/m.test(src)&&!/Ordre de découpe FIGÉ/.test(src),'_fmmOrderGuardsOk : le refus RENVOIE false (ces chemins regenerent) et le message dit quoi faire (plus de « FIGE » sans issue)');
  ok(/try\{ _l560RailSync\(\); \}catch\(_\)\{ \}/.test(F('_l340SyncOrderStates'))&&/orderEl\.innerHTML=oh;\n    try\{ _l560RailSync\(\); \}catch\(_\)\{ \}/.test(src),'le cadenas du rail suit le rendu ET les coupes (les deux jumeaux)');
  const blocs560=function(r){ const p=src.indexOf(r); if(p<0||p!==src.lastIndexOf(r)) return null; const deb=src.indexOf('>',src.lastIndexOf('<style',p))+1; const pile=[]; let d0=deb;
    for(let k=deb;k<p;k++){ const c=src[k];
      if(c==='/'&&src[k+1]==='*'){ const f=src.indexOf('*/',k+2); if(f<0||f>=p) return null; k=f+1; continue; }
      if(c==='"'||c==="'"){ let j=k+1; while(j<p&&src[j]!==c){ if(src[j]==='\\') j++; j++; } k=j; continue; }
      if(c==='{'){ pile.push(src.slice(d0,k).replace(/\/\*[\s\S]*?\*\//g,'').trim()); d0=k+1; } else if(c==='}'){ pile.pop(); d0=k+1; } else if(c===';'){ d0=k+1; } }
    return pile; };
  ok(['.fmm-order-row.l560-fig .fmm-order-btns .btn{display:none}','.fmm-order-row.l560-fig .fmm-order-btns::after{'].every(function(r){ const b=blocs560(r); return !!b&&b.length===1&&b[0]==='@media(min-width:1100px)'; }),'les DEUX regles du cadenas (fleches masquees, 🔒) vivent, une seule fois, dans un unique bloc @media(min-width:1100px) (accolades comptees) : portrait inchange (regle 3)');
  ok((function(){ const m=/const APP_VERSION='[0-9.]+-L(\d+)';/.exec(src); return !!m&&(+m[1])>=560; })(),'version L560 ou suivante');
  ok(/'fiche-ordre': `/.test(shot)&&/'fiche-ordre': "/.test(shot)&&/fiche-horscmd fiche-ordre (?:[a-z0-9-]+ )*analyse/.test(bat)&&/fiche-horscmd fiche-ordre (?:[a-z0-9-]+ )*analyse/.test(ci)&&/Smokes .[0-9]+ scenes/.test(ci),'scene « fiche-ordre » (3 references, vraie fleche) dans shot.mjs, la batterie ET la CI (d autres scenes peuvent suivre)');
}
console.log(fail?('\n💥 '+fail+'/'+total+' ECHEC(S) ORDRE L560'):('\n🏆 ORDRE L560 OK : '+total+' verifications'));
process.exit(fail?1:0);
