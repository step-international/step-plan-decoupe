// laize_l527_test.js — [L527 · incident Celine 17/09/2026 (commande REINAL : ref 2 demarree sur la laize par defaut 2100−bords)]
// GARDE « reference sans laize MESUREE » : (A) helpers purs ; (B) case « Laize utilisable » VIDE au poste OPERATEUR tant que la laize
// mesuree n est pas saisie, valeur PROVISOIRE affichee au bureau (process Celine : Dominique calcule et imprime, l operateur mesure) ;
// (C) la frappe confirme SEULEMENT au poste operateur ; (D) VALIDER la preparation REFUSE sans laize saisie (le scenario exact de
// l incident : ref 2 jamais touchee, 2100/10) ; (E) rappel de fin de reference (helpers purs) ; (F) cablage.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
function grab(n){ try{ return eval('('+fnOf(n)+')'); }catch(e){ ok(false,'fonction '+n+' introuvable ('+e.message+')'); return null; } }
global.parseNum=v=>{const n=parseFloat(String(v==null?'':v).replace(',','.'));return isNaN(n)?0:n;};
global.fmt=v=>String(Math.round(Number(v)*10)/10);
const toasts=[]; global.showToast=(m,k)=>toasts.push(String(k)+': '+m);
let pages=[]; global.showPage=i=>pages.push(i); global.refDisp=r=>String(r);
global.clearTimeout=()=>{}; global.setTimeout=()=>0; global._recalcPlanTimer=null; global.recalcPlan=()=>{}; global.onParamChange=()=>{}; global.debouncedRecalcPlan=()=>{};
global.ficheRefValidated=new Set();
global.currentRole='operateur'; global.currentUser={role:'operateur',ini:'TB',nom:'Taïeb'}; global._l363DefaultMachine=()=>'';
const bodyCls=new Set();
function el(v){ const e={value:String(v==null?'':v),style:{},focused:false,scrolled:false,focus(){this.focused=true;},scrollIntoView(){this.scrolled=true;}}; return e; }
function block(o){ const m={mother:el(o.mother),edge:el(o.edge),blade:el(o.blade),machine:el(o.machine)}; const useful=el(o.useful==null?'':o.useful); const btn={}; const b={dataset:Object.assign({},o.dataset||{}),els:m,useful,querySelector:s=>{ if(s==='[data-op-useful]') return useful; if(s==='.rb-op-validate') return btn; if(s==='#motherWidth') return null; const k=(s.match(/data-rb="(\w+)"/)||[])[1]; return m[k]||null; }}; useful.closest=()=>b; btn.closest=()=>b; b.btn=btn; return b; }
let blocks=[]; let ini='TB';
global.USER_PROFILES={a:{role:'admin',ini:'ER',nom:'Esté'},d:{role:'pilotage',ini:'DC',nom:'Dominique'},t:{role:'operateur',ini:'TB',nom:'Taïeb'},j:{role:'operateur',ini:'JF',nom:'Jordan'}};
global.document={activeElement:null,body:{classList:{toggle(c,on){ if(on) bodyCls.add(c); else bodyCls.delete(c); }}},getElementById:id=>id==='fInitiales'?{value:ini}:null,querySelectorAll:sel=>(sel==='#refBlocks .ref-block'||sel==='.ref-block')?blocks:[],querySelector:()=>null};
global._l514NetTyped=grab('_l514NetTyped'); global._l527PosteOp=grab('_l527PosteOp'); const OK=grab('_l527LaizeOk'); global._l527LaizeOk=OK; global._l527LaizeOkIdx=grab('_l527LaizeOkIdx'); global._l527FocusCase=grab('_l527FocusCase'); const GO=grab('_l527GoPlan');
global._l421SyncUseful=grab('_l421SyncUseful'); global._l420SyncStart=grab('_l420SyncStart'); global._l420Invalidate=grab('_l420Invalidate'); global._l421UsefulInput=grab('_l421UsefulInput');
const VAL=grab('_l420OpValidate'); const NEW=grab('_l527NewlyDone'); const MSG=grab('_l527RefDoneMsg');

console.log('── A. helpers PURS ──');
ok(OK&&OK(block({mother:2100,edge:10,blade:5,machine:'feba'}))===false,'bloc jamais touche (gabarit 2100/10) → NON confirme');
ok(OK&&OK(block({mother:2100,edge:20,blade:0,machine:'maveg'}))===false,'bloc MAVEG herite (2100/20) → NON confirme');
ok(OK&&OK(block({mother:1240,edge:0,blade:5,machine:'feba'}))===false,'laize nette tapee AU BUREAU (mere 1240 / bords 0, sans marqueur) → PROVISOIRE, pas confirmee (process Celine : l operateur mesure)');
ok(OK&&OK(block({mother:1250,edge:10,blade:5,machine:'feba',dataset:{laizeOk:'1'}}))===true,'marqueur data-laize-ok (mere tapee dans la Fiche 1250/10) → confirme');
ok(OK&&OK(block({mother:'',edge:10,blade:5,machine:'feba'}))===false&&OK(null)===false,'mere vide (apres ↺) / bloc absent → NON confirme, jamais d exception');
ok(global._l527PosteOp&&_l527PosteOp()===true,'role operateur = poste operateur');
currentRole='pilotage'; ini='DC'; ok(_l527PosteOp()===false,'role pilotage (Dominique) = bureau');
currentRole='admin'; ini='ER'; ok(_l527PosteOp()===false,'role admin = bureau');
global._l363DefaultMachine=()=>'maveg'; ok(_l527PosteOp()===true,'compte machine (poste maveg) = poste operateur, quel que soit le role'); global._l363DefaultMachine=()=>''; currentRole='operateur'; ini='TB';

currentRole='admin'; ini='TB'; ok(_l527PosteOp()===true,'compte ADMIN a la machine (cas L519 : tablette FEBA connectee avec le compte d Esteban), initiales d un OPERATEUR choisies (TB) → poste operateur : sa frappe confirme, la commande mono-reference peut demarrer');
ini='ER'; ok(_l527PosteOp()===false,'compte admin, initiales ER (pas un operateur) → bureau'); ini=''; ok(_l527PosteOp()===false,'compte admin, aucune initiale → bureau (VALIDER demande d abord les initiales, L448)');
currentRole='pilotage'; ini='JF'; ok(_l527PosteOp()===true,'compte pilotage a la machine, initiales JF → poste operateur'); ini='DC'; ok(_l527PosteOp()===false,'Dominique (DC) au bureau → provisoire');
currentRole='operateur'; ini='TB';
console.log('── B. case « Laize utilisable » : VIDE au poste operateur tant que non confirmee, PROVISOIRE au bureau ──');
blocks=[block({mother:1240,edge:0,blade:5,machine:'feba'}),block({mother:2100,edge:10,blade:5,machine:'feba'}),block({mother:1250,edge:10,blade:5,machine:'feba',dataset:{laizeOk:'1'}})];
_l421SyncUseful();
ok(blocks[0].useful.value===''&&blocks[0].dataset.laizeOk!=='1','poste operateur : laize tapee au bureau (1240/0) sans marqueur → case VIDE (a mesurer), aucun marqueur materialise');
ok(blocks[1].useful.value==='','poste operateur : ref INCOMPLETE (2100/10 jamais tapee) → case VIDE — plus jamais « 2090 » affiche comme une saisie');
ok(blocks[2].useful.value==='1240','poste operateur : marqueur pose (Fiche 1250/10) → case remplie mere−bords = 1240');
ok(bodyCls.has('l527-op'),'body.l527-op pose au poste operateur (libelle rouge « LAIZE A SAISIR » en CSS)');
currentRole='pilotage'; ini='DC'; _l421SyncUseful();
ok(blocks[1].useful.value==='2090'&&blocks[0].useful.value==='1240','bureau (pilotage) : valeur PROVISOIRE affichee (2090 par defaut, 1240 tapee) — Dominique calcule et imprime');
ok(!bodyCls.has('l527-op'),'body.l527-op retire au bureau (libelle gris « provisoire »)');
currentRole='operateur'; ini='TB';

console.log('── C. la frappe confirme SEULEMENT au poste operateur ──');
blocks[1].useful.value='1235'; _l421UsefulInput(blocks[1].useful);
ok(blocks[1].els.mother.value==='1235'&&blocks[1].els.edge.value==='0'&&blocks[1].dataset.laizeOk==='1','poste operateur : frappe 1235 → mere 1235 / bords 0 (L421) + marqueur');
const bP=block({mother:2100,edge:10,blade:5,machine:'feba'}); currentRole='pilotage'; ini='DC'; bP.useful.value='1240'; _l421UsefulInput(bP.useful); currentRole='operateur'; ini='TB';
ok(bP.els.mother.value==='1240'&&bP.els.edge.value==='0'&&bP.dataset.laizeOk!=='1','bureau : la frappe pose mere/bords (le plan se calcule) mais NE confirme PAS (provisoire jusqu a la machine)');
const b0=block({mother:2100,edge:10,blade:5,machine:'feba'}); b0.useful.value='0'; _l421UsefulInput(b0); ok(b0.dataset.laizeOk!=='1','frappe « 0 » ne confirme rien');
const bE=block({mother:2100,edge:10,blade:5,machine:'feba'}); bE.useful.value=''; _l421UsefulInput(bE); ok(bE.els.mother.value==='2100'&&bE.dataset.laizeOk!=='1','case videe en cours de frappe : mere conservee (L426), aucune confirmation');

console.log('── D. INCIDENT 17/09 : VALIDER la preparation sur la ref 2 jamais touchee ──');
blocks=[block({mother:1240,edge:0,blade:5,machine:'feba',dataset:{laizeOk:'1'}}),block({mother:2100,edge:10,blade:5,machine:'feba'})]; ficheRefValidated.clear(); toasts.length=0;
if(VAL) VAL(blocks[1].btn);
ok(blocks[1].dataset.opValidated!=='1','ref 2 (2100/10, laize jamais saisie) : VALIDER REFUSE (sur L526 : opValidated=1)');
ok(!ficheRefValidated.has(1),'…et la ref 2 n entre PAS dans ficheRefValidated (le verrou de coupe coupeeTapOne reste arme)');
ok(toasts.some(t=>/Laize utilisable NON saisie/.test(t)&&/2090/.test(t)),'toast atelier : « Laize utilisable NON saisie » + plan provisoire 2090 mm');
ok(blocks[1].useful.focused===true&&blocks[1].useful.scrolled===true,'refus : focus + scroll sur la case « Laize utilisable » du BON bloc');
blocks[1].useful.value='1240'; _l421UsefulInput(blocks[1].useful); toasts.length=0; if(VAL) VAL(blocks[1].btn);
ok(blocks[1].dataset.opValidated==='1'&&ficheRefValidated.has(1),'apres la frappe de la laize mesuree : VALIDER passe (opValidated + ficheRefValidated)');
blocks=[block({mother:1240,edge:0,blade:5,machine:'feba'})]; currentRole='pilotage'; ini='DC'; toasts.length=0; if(VAL) VAL(blocks[0].btn); currentRole='operateur'; ini='TB';
ok(blocks[0].dataset.opValidated!=='1'&&toasts.some(t=>/se valide à la MACHINE/.test(t)),'bureau : VALIDER refuse aussi et dit que la preparation se valide a la machine');
ini=''; blocks=[block({mother:1240,edge:0,blade:5,machine:'feba',dataset:{laizeOk:'1'}})]; if(VAL) VAL(blocks[0].btn); ok(blocks[0].dataset.opValidated!=='1','la garde initiales (L448) passe toujours AVANT'); ini='TB';
blocks=[block({mother:1240,edge:0,blade:5,machine:'feba',dataset:{laizeOk:'1'}}),block({mother:2100,edge:20,blade:0,machine:'maveg'})]; toasts.length=0; pages=[]; if(GO) GO(1,'KX1045-1');
ok(pages[0]===0&&toasts.length===1&&/KX1045-1/.test(toasts[0])&&/NON saisie/.test(toasts[0])&&blocks[1].useful.focused===true&&blocks[0].useful.focused===false,'ceinture de coupe : toast nomme la ref + onglet PLAN ouvert + focus sur la case du BON bloc');

console.log('── E. rappel de fin de reference (helpers purs) ──');
ok(NEW&&JSON.stringify(NEW(null,['A']))==='[]'&&JSON.stringify(NEW(undefined,['A']))==='[]','1er rendu (reprise / rechargement) : muet');
ok(NEW&&JSON.stringify(NEW([],['A']))==='["A"]'&&JSON.stringify(NEW(['A'],['A','B']))==='["B"]'&&JSON.stringify(NEW(['A'],['A']))==='[]','ref qui VIENT de se terminer detectee une seule fois');
ok(MSG&&MSG('KX1006-1','KX1045-1',false)==='✓ KX1006-1 terminée. AVANT KX1045-1 : onglet Plan → tes initiales, la laize mesurée de la bobine, les chutes en stock → ✓ VALIDER la préparation.','texte du rappel (Celine 17/09)');
ok(MSG&&/Sa laize n'est PAS saisie/.test(MSG('A','B',true))&&!/PAS saisie/.test(MSG('A','B',false)),'ref suivante incomplete : le rappel le dit');
ok(MSG&&/AVANT la réf suivante/.test(MSG('X','',false)),'sans nom de ref suivante : « la réf suivante »');

console.log('── F. cablage ──');
ok(/_l527LaizeOk\(_blks20\[i\]\)\)\?\{laizeOk:true\}:\{\}\),/.test(fnOf('serializeRefGroups')),'serializeRefGroups persiste laizeOk (vrai seulement — revue adverse 18/09)');
ok(/if\(g&&g\.laizeOk\) _b20\[i\]\.dataset\.laizeOk='1'; else delete _b20\[i\]\.dataset\.laizeOk; if\(g&&g\.opValidated&&_l527LaizeOk\(_b20\[i\]\)\)/.test(fnOf('restoreRefGroups')),'restoreRefGroups restaure OU efface, et ne restaure opValidated qu avec laize confirmee');
ok(/delete b\.dataset\.laizeOk;/.test(fnOf('resetAll')),'resetAll efface le marqueur (lecon L514d)');
ok(/delete block\.dataset\.laizeOk;/.test(fnOf('onRefChangeBlock'))&&/delete _b27\.dataset\.laizeOk;/.test(fnOf('onRefChange')),'choix catalogue : marqueur efface sur les 2 jumeaux');
ok(/const _ok27=_l527LaizeOkIdx\(r\.idx\);/.test(fnOf('renderFicheMachineBlocks'))&&/value="'\+\(_ok27\?V\(r\.mother\):''\)\+'"/.test(fnOf('renderFicheMachineBlocks')),'carte Fiche : mere non pre-remplie sans laize confirmee');
ok(/planBlock\.dataset\.laizeOk='1';/.test(fnOf('applyFicheRefPlanChange'))&&/laize NON saisie — tape ici la VRAIE bobine mère/.test(fnOf('applyFicheRefPlanChange')),'bouton bleu : refus explicite + confirmation par la mere tapee');
const CT=fnOf('coupeeTapOne'); ok(CT.indexOf("if(_ko27){ _l527GoPlan(_i27,_r27?refDisp(_r27):''); return; }")>0&&CT.indexOf('_ko27')<CT.indexOf("let _blockCut=false, _lref='';"),'coupeeTapOne : ceinture L527 AVANT le verrou L379 (validation heritee sans laize = pas de coupe)');
ok(/_l527NewlyDone\(window\._l527Done,_dn27\)/.test(fnOf('updateCoupeeStatus'))&&/window\._l527Done=null;/.test(fnOf('updateCoupeeStatus')),'updateCoupeeStatus : rappel branche, remis a zero sur fiche vide');
ok(!/function (packRefGroups|packRefGroupsPal|pack|bestPattern|calcStats|makeLabel|clampUseful)\(/.test((OK?fnOf('_l527LaizeOk'):'')+(GO?fnOf('_l527GoPlan'):'')),'aucun helper L527 ne redefinit une fonction gelee');
console.log('── G. revue adverse 18/09 : confirmation retiree hors poste operateur, index DOM, bobines calculees sur une autre laize ──');
currentRole='pilotage'; ini='DC'; { const b=block({mother:1240,edge:0,blade:5,machine:'feba',dataset:{laizeOk:'1',opValidated:'1'}}); blocks=[b]; b.useful.value='2090'; _l421UsefulInput(b.useful);
  ok(b.dataset.laizeOk!=='1'&&b.dataset.opValidated!=='1','frappe au BUREAU apres confirmation machine → marqueur RETIRE (la valeur du bureau redevient provisoire)'); }
{ const b=block({mother:1240,edge:0,blade:5,machine:'feba',dataset:{laizeOk:'1'}}); blocks=[b]; _l420Invalidate(b); ok(b.dataset.laizeOk!=='1','mere / bords modifies au BUREAU (_l420Invalidate) → marqueur retire'); }
currentRole='operateur'; ini='TB'; { const b=block({mother:1240,edge:0,blade:5,machine:'feba',dataset:{laizeOk:'1'}}); blocks=[b]; _l420Invalidate(b); ok(b.dataset.laizeOk==='1','mere modifiee au poste OPERATEUR → confirmation conservee (c est lui qui mesure)');
  b.useful.value='0'; _l421UsefulInput(b.useful); ok(b.dataset.laizeOk!=='1','laize 0 tapee au poste operateur → plus de confirmation'); }
const DOMIDX=grab('_l527DomIdx'); global._l527DomIdx=DOMIDX;
global.fmmRawRefs=()=>[{idx:1,refKey:'KA'},{idx:2,refKey:'KB'}];   /* bloc-stub en DOM 0 : les references productives sont en DOM 1 et 2, refIdx (plan CALCULE) 0 et 1 */
ok(DOMIDX&&DOMIDX({refIdKey:'KB',refIdx:1})===2&&DOMIDX({refIdKey:'perimee',refIdx:0})===1&&DOMIDX({refIdx:1})===2&&DOMIDX({})===-1&&DOMIDX(null)===-1,'index DOM d une ligne : par cle, sinon refIdx (index du plan CALCULE) converti — un bloc-stub place avant ne decale plus la lecture');
global.fmmRawRefs=()=>[{idx:0,refKey:'K'},{idx:1,refKey:'K'}]; ok(DOMIDX&&DOMIDX({refIdKey:'K',refIdx:1})===1,'cle partagee par deux blocs (meme reference sur deux machines) → refIdx tranche');
const CT9=grab('coupeeTapOne'); global._l527DriftIds=new Set(); global.fmmIsMulti=()=>true; let cut9=0; global.toggleCoupee=()=>{ cut9++; };   /* si la coupe PASSE (trou), toggleCoupee est appelee : le test le voit */
{ const lineEl={classList:{contains:()=>false}}; const prevGet=document.getElementById; document.getElementById=id=>id==='L1'?lineEl:(id==='fInitiales'?{value:ini}:null);
  global.ficheLines=[{id:'L1',ref:'KX',refIdKey:'KB',refIdx:1}]; global.fmmRawRefs=()=>[{idx:1,refKey:'KA'},{idx:2,refKey:'KB'}];
  blocks=[block({mother:2100,edge:10,blade:5,machine:'feba'}),block({mother:1240,edge:0,blade:5,machine:'feba',dataset:{laizeOk:'1'}}),block({mother:2100,edge:10,blade:5,machine:'feba'})];
  ficheRefValidated.clear(); ficheRefValidated.add(2); toasts.length=0; pages=[];   /* [L531 · audit adverse 18/09] ficheRefValidated est indexe par index de BLOC DOM (index.html l.21309 : « i = index DOM », l.7076 : indexOf(blk), l.21307 : r.idx de fmmRawRefs). La reference de cette ligne est le bloc DOM 2 : c est 2 qu il faut y mettre. La fixture posait 1 — l index du PLAN CALCULE — et ne passait que parce que coupeeTapOne lisait le Set dans ce meme mauvais cadre. */
  let went=null; const prevGo=global._l527GoPlan; global._l527GoPlan=(i)=>{ went=i; };
  if(CT9) CT9('L1'); ok(went===2&&cut9===0,'CEINTURE jouee de bout en bout (coupeeTapOne) : ref du bloc DOM 2 (refIdx 1, bloc-stub devant), validee par heritage, laize non confirmee → renvoi sur le bloc 2 (avant : lisait le bloc 1, confirme → coupe acceptee) → '+went);
  went=null; cut9=0; blocks[2].dataset.laizeOk='1'; _l527DriftIds.add('L1'); toasts.length=0; if(CT9) CT9('L1');   /* laize confirmee : seule la garde « autre laize » doit arreter la coupe */
  ok(went===null&&cut9===0&&toasts.some(t=>/laize de cette référence a changé dans le Plan/.test(t)),'bobine NON coupee calculee sur une AUTRE laize que celle du Plan (derive DIMENSIONS) → coupe REFUSEE avant « Appliquer » (chemin Plan → VALIDER de l incident)');
  /* [L531] cas MIROIR, celui qui manquait : la reference de la ligne (bloc DOM 2) n est PAS validee — seul le bloc DOM 1 l est.
     Le verrou L379 doit REFUSER la coupe, laize confirmee ou non. Avant L531 : has(_ln.refIdx)=has(1)=vrai -> coupe ACCEPTEE (verrou ISO perce). */
  _l527DriftIds.clear(); ficheRefValidated.clear(); ficheRefValidated.add(1); blocks[2].dataset.laizeOk='1'; went=null; cut9=0; toasts.length=0; if(CT9) CT9('L1');
  ok(cut9===0&&went===null&&toasts.some(t=>/bobine m\u00e8re/.test(t)),'[L531] reference NON validee (son bloc DOM absent du Set) -> coupe REFUSEE meme laize confirmee -> coupes='+cut9+' toasts='+toasts.length);
  _l527DriftIds.clear(); global._l527GoPlan=prevGo; document.getElementById=prevGet; ficheRefValidated.clear(); }
{ const b0=block({mother:1240,edge:0,blade:5,machine:'feba',dataset:{laizeOk:'1'}}), b1=block({mother:2080,edge:0,blade:5,machine:'feba',dataset:{laizeOk:'1'}}); blocks=[b0,b1]; ini='TB';
  global.getRefGroups=()=>[{useful:1240},{useful:2080}]; global.fmmRawRefs=()=>[{idx:0,refKey:'K0'},{idx:1,refKey:'K1'}];
  global.ficheLines=[{id:'A',refIdx:0,refIdKey:'K0',useful:1240},{id:'B',refIdx:1,refIdKey:'vieille-cle',useful:2090}]; toasts.length=0;
  if(VAL) VAL(b1.btn); ok(b1.dataset.opValidated==='1'&&toasts.some(t=>/^err: ✓ Préparation validée/.test(t)&&/AUTRE laize/.test(t)),'fiche ENTAMEE : VALIDER au Plan avec une laize differente de celle des bobines restantes → le toast DIT d appliquer le recalcul (banniere rouge de la Fiche)');
  global.ficheLines=[{id:'B',refIdx:1,refIdKey:'K1',useful:2080}]; delete b1.dataset.opValidated; toasts.length=0; if(VAL) VAL(b1.btn);
  ok(toasts.some(t=>/^ok: ✓ Préparation validée/.test(t))&&!toasts.some(t=>/AUTRE laize/.test(t)),'bobines deja calculees sur la laize confirmee → toast vert habituel'); ficheRefValidated.clear(); }
{ const SIGF=grab('_planSigOf'); global._stableSig=grab('_stableSig');
  global.serializeFicheState=()=>({plan:{rows:[],refGroups:[{ref:'A',mother:'2100',laizeOk:true,lotOk:true}],commandeFiles:[]}}); const s1=SIGF?SIGF():null;
  global.serializeFicheState=()=>({plan:{rows:[],refGroups:[{ref:'A',mother:'2100'}],commandeFiles:[]}}); const s2=SIGF?SIGF():null;
  global.serializeFicheState=()=>({plan:{rows:[],refGroups:[{ref:'A',mother:'2095'}],commandeFiles:[]}}); const s3=SIGF?SIGF():null;
  ok(!!s1&&s1===s2&&s2!==s3,'signature du plan : les marqueurs de CONFIRMATION (laizeOk, lotOk) n y entrent pas — une fiche vierge n est plus regeneree (ordre de coupe perdu) parce qu une laize identique est confirmee ; un vrai changement de mere la change toujours'); }
ok(/\.\.\.\(\(_blks20\[i\]&&_l527LaizeOk\(_blks20\[i\]\)\)\?\{laizeOk:true\}:\{\}\),/.test(fnOf('serializeRefGroups')),'serializeRefGroups : cle laizeOk ABSENTE quand non confirmee (les brouillons d avant L527 gardent leur signature)');
ok(/delete b\.dataset\.opValidated; delete b\.dataset\.laizeOk; \}\); if\(typeof _l420SyncStart/.test(src),'plan ENREGISTRE recharge (doLoad) : arrive sans validation (L428) ET sans laize confirmee — la bobine de la nouvelle production se mesure');
ok(/nrm\(d\.ref\|\|''\)===nm&&d\.refIdx===_ci27\);/.test(fnOf('_fichePlanDriftCheck'))&&/_l527DriftIds\.add\(d\.id\)/.test(fnOf('_fichePlanDriftCheck')),'detecteur de derive : entre deux references de MEME NOM les bobines orphelines sont rattachees par refIdx (angle mort L241 ferme) et les bobines a recalculer sont memorisees');
ok(/_l527PosteOp\(\)\?_l527NewlyDone\(window\._l527Done,_dn27\):\[\]/.test(fnOf('updateCoupeeStatus'))&&/window\._l527DoneSig!==_sg27/.test(fnOf('updateCoupeeStatus')),'rappel de fin de reference : poste operateur seulement, jeton stable par bloc, remis a zero quand la fiche change');
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 LAIZE L527 OK : '+total+' verifications'));
process.exit(fail?1:0);
