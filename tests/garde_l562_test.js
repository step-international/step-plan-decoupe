// garde_l562_test.js — [L562 · bug atelier du 06/11/2026 (MAVEG, laize 2080 → 2110) · règle de la responsable qualité (09/11) :
// « pas de changement sur la bobine en cours ; OUI pour une question au moment d'Appliquer »]
// R1 : commande COMMENCÉE (fiche non vide ET chrono démarré une fois OU bobine cochée) → plus JAMAIS de régénération complète silencieuse
//      (isFicheUntouched → false : import auto, Changement plan, Valider la bobine mère, ordre de coupe, doLoad, reprises) ; filet « le Plan a été modifié ».
// R2 : UNE question PAR MACHINE avant un recalcul qui peut modifier sa bobine en cours (1re non cochée, pas figée) — OUI / NON / Annuler ;
//      drapeau l562Garde posé à l'INSTANT de l'application (D-4), levé à la coche, porté par tous les jumeaux ; NON sans rien de figé = fiche
//      refaite comme le Plan (avec _ficheGenPlanSig=null). R3 : plus d'application automatique sur commande commencée. R4 : 3 machines, verrou
//      L418 non remis. R5 : moteur gelé (engine_identity) et papier intacts.
// v2 (contre-lecture par 3 vérificateurs, VRAIS gestes CDP) : anti-rebond de la fenêtre — 400 ms après l'AFFICHAGE de chaque question (double tap sur
//      OUI/NON de la 1/2 répondait aussi à la 2/2 ; double tap sur Appliquer annulait par le voile) et 400 ms après la FERMETURE (le 2e tap atteignait le ✂
//      COUPÉE sous la fenêtre) — vrais gestes seulement (isTrusted) ; écouteur Échap non empilé quand la question est re-posée pendant qu'elle est ouverte.
// v3 (contre-lecture 2, vrais gestes souris et tactiles + filets sous charge) : l'avaleur « fenêtre fermée » est posé sur WINDOW (il passe avant _l386ConfTap, écouteur de
//      capture posé sur document au chargement, qui mettait la configuration de la bobine en cours en mode édition sous le bouton tapé) et avale aussi mousedown /
//      pointerdown / touchstart ; les 400 ms sont ré-armés après la relance synchrone et à chaque geste avalé (fenêtre glissante) ; envoi groupé des gestes de la scène multi.
// Fonctions VRAIES extraites du source et EXÉCUTÉES sur un DOM factice ; une fonction absente = assertion ROUGE (le test continue).
// Vu ENTIÈREMENT ROUGE sur L561 (L562_HTML=.../base_l561/index.html, L562_ROOT=.../base_l561) ; les vérifications v2 (sections 1, 15, 16) vues ROUGES sur la v1 du lot ;
// les vérifications v3 (section 15 : envoi groupé ; section 16 : window, 4 types d'événements, ré-armement, fenêtre glissante) vues ROUGES sur la v2 du lot.
const fs=require('fs'),path=require('path');
const ROOT=process.env.L562_ROOT||path.join(__dirname,'..');
const src=fs.readFileSync(process.env.L562_HTML||path.join(ROOT,'index.html'),'utf8');
const rd=f=>{ try{ return fs.readFileSync(path.join(ROOT,f),'utf8'); }catch(e){ return ''; } };
const shot=rd('tests/shot.mjs'), battery=rd('tests/battery.sh'), ci=rd('.github/workflows/static.yml');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)return src.slice(i,j+1);}}throw new Error('non fermee '+n);}
const F=n=>{ try{ return fnOf(n); }catch(e){ return ''; } };
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
let fini=false; process.on('exit',c=>{ if(!fini&&c===0){ console.log('💥 test non terminé : ROUGE'); process.exitCode=1; } });
const T=(f)=>{ try{ return f(); }catch(e){ console.log('   (exception : '+(e&&e.message||e)+')'); return false; } };

ok(/const APP_VERSION='\d{4}\.\d\d\.\d\d-L(56[2-9]|5[7-9]\d|[6-9]\d\d|\d{4,})';/.test(src),'APP_VERSION >= L562 (jamais la version exacte)');

console.log('── 1. les fonctions neuves ──');
const NOMS=['_l562Commencee','_l562Figee','_l562StockSaisi','_l562AQuestionner','_l562PrendreReponse','_l562Laize','_l562NoteTexte','_l562Poser','_l562Lever','_l562Rebond','_l562Demander'];
const CHARGEES=[]; NOMS.forEach(n=>{ try{ global[n]=eval('('+fnOf(n)+')'); CHARGEES.push(n); }catch(e){ global[n]=function(){ return undefined; }; } });
ok(CHARGEES.length===NOMS.length,NOMS.length+' fonctions L562 présentes → '+CHARGEES.length+(CHARGEES.length<NOMS.length?' (absentes : '+NOMS.filter(n=>CHARGEES.indexOf(n)<0).join(', ')+')':''));
ok(/^let _l562Jeton=null;/m.test(src),'jeton de réponse déclaré (usage unique)');
global.window=global; global._l562Jeton=null;

console.log('── 2. R1 « commande commencée » : prédicat PUR, EXÉCUTÉ (cas a-f) ──');
global.chronoStartTs=null; global.chronoRunning=false; global.chronoSec=0; global.countCoupees=()=>0; global.ficheLines=[];
global.chronoStartTs='2026-11-05T12:02:00.000Z'; global.chronoRunning=true; ok(T(()=>_l562Commencee()===false),'fiche VIDE + chrono démarré (repli « chrono seul », 9 bobines retirées) → PAS commencée : elle doit pouvoir se régénérer (cas qui cassait le prototype 2)');
global.ficheLines=[{id:'b1',useful:2080,ref:'KX'},{id:'b2',useful:2080,ref:'KX'},{id:'b3',useful:2080,ref:'KX'}];
global.chronoStartTs=null; global.chronoRunning=false; ok(T(()=>_l562Commencee()===false),'(f) chrono jamais démarré, aucune coche → PAS commencée (régénération comme aujourd hui)');
global.chronoStartTs='2026-11-05T12:02:00.000Z'; ok(T(()=>_l562Commencee()===true),'(c) chronoStartTs posé (1er ▶, même chrono en pause ou le lendemain) → commencée');
global.chronoStartTs=null; global.chronoRunning=true; ok(T(()=>_l562Commencee()===true),'chrono en marche → commencée');
global.chronoRunning=false; global.chronoSec=12; ok(T(()=>_l562Commencee()===true),'cumul > 0 → commencée');
global.chronoSec=0; global.countCoupees=()=>1; ok(T(()=>_l562Commencee()===true),'(a) une bobine cochée → commencée (même sans chrono)');
global.countCoupees=()=>0;

console.log('── 3. DOM factice + fonctions VRAIES du source (isFicheUntouched, isLineFrozen, _flMachineOf) ──');
const DOM={}; function mk(id,p){ const el=Object.assign({id,value:'',textContent:'',checked:false,classList:{_s:new Set(),contains(c){ return this._s.has(c); },add(c){ this._s.add(c); },remove(c){ this._s.delete(c); }},dataset:{},style:{},querySelector(){ return null; },remove(){ delete DOM[id]; },getBoundingClientRect(){ return {height:1}; }},p||{}); DOM[id]=el; return el; }
global.document={getElementById:id=>DOM[id]||null,createElement:()=>mk('_tmp'+Math.random(),{parentNode:null}),body:{appendChild(){}},addEventListener(){},removeEventListener(){}};
global.fmt=v=>String(v); global.esc=s=>String(s); global.fmmIsMulti=()=>false; global.refDisp=r=>r; global._shareCurrentDocId=()=>null; global.ficholinePhotos={}; global.normConf=s=>String(s||'').replace(/\s+/g,''); global._l345ConfDirty=()=>false; global.ficheMachine='maveg'; global.getMachineLabel=m=>String(m).toUpperCase(); global.showToast=()=>{}; global.console=console;
global._l554RefDe=()=>'';
['isFicheUntouched','isLineFrozen','_flMachineOf'].forEach(n=>{ try{ global[n]=eval('('+fnOf(n)+')'); }catch(e){ global[n]=function(){ return undefined; }; } });
global.ficheLines=[{id:'b1',useful:2080,ref:'KX',origConf:''},{id:'b2',useful:2080,ref:'KX',origConf:''},{id:'b3',useful:2080,ref:'KX',origConf:''}];
['b1','b2','b3'].forEach((id,i)=>{ mk(id); mk('pos_'+id,{textContent:(i+1)+'/3'}); mk('flConf_'+id,{value:''}); mk('l562Note_'+id); });
global.chronoStartTs=null; global.countCoupees=()=>0;
ok(T(()=>isFicheUntouched()===true&&(ficheLines[1].l562Garde=true, isFicheUntouched()===false)&&(ficheLines[1].l562Garde=false, true)),'isFicheUntouched (VRAIE) : vierge sans rien ; une bobine GARDÉE = fiche touchée');
global.chronoStartTs='2026-11-05T12:02:00.000Z'; ok(T(()=>isFicheUntouched()===false),'(c) isFicheUntouched (VRAIE) : commande commencée (chrono, aucune coche) → fiche « touchée » : plus de régénération silencieuse par aucun appelant');
ok(/if\(typeof _l562Commencee==='function'&&_l562Commencee\(\)\) return false;   \/\* \[L562 · R1\]/.test(F('isFicheUntouched'))&&/if\(ficheLines\.some\(function\(l\)\{ return !!\(l&&l\.l562Garde===true\); \}\)\) return false;/.test(F('isFicheUntouched'))&&/flTest2nc_'\+id\)\?\.checked\) return false;/.test(F('isFicheUntouched')),'isFicheUntouched : les deux gardes L562 en tête, le test L290 toujours en place');
ok(T(()=>isLineFrozen('b2')===false&&(ficheLines[1].l562Garde=true, isLineFrozen('b2')===true)&&(ficheLines[1].l562Garde=false, true)),'isLineFrozen (VRAIE) : la bobine gardée est FIGÉE (le recalcul la préserve, production engagée)');
ok(/if\(meta&&meta\.l562Garde===true\) return true;/.test(F('isLineFrozen')),'isLineFrozen : lecture du drapeau après la méta de ligne');

console.log('── 4. prédicat unique « figée » sur les données (_l562Figee), EXÉCUTÉ, hissé dans le détecteur ──');
ok(T(()=>_l562Figee({})===false&&_l562Figee(null)===false),'ligne nue → pas figée');
ok(T(()=>_l562Figee({l562Garde:true})===true),'drapeau l562Garde → figée');
ok(T(()=>_l562Figee({coupee:true})===true&&_l562Figee({actDechet:true})===true&&_l562Figee({ncCasse:true})===true),'cochée / déchet / NC → figée (miroir d isLineFrozen)');
ok(T(()=>_l562Figee({conf:'36×55 + 1×50',origConf:normConf('36×55 + 2×50')})===true&&_l562Figee({conf:'36×55 + 2×50',origConf:normConf('36×55 + 2×50')})===false),'config retapée → figée ; identique → pas figée');
const DET=F('_fichePlanDriftCheck');
ok(/^      const _frozenLike=_l562Figee;/m.test(DET)&&!/const _frozenLike=d=>\{/.test(DET)&&/!_frozenLike\(d\)\) _l527DriftIds\.add\(d\.id\)/.test(DET),'détecteur : _frozenLike = la fonction unique (plus de copie locale) ; les usages L527/L554 inchangés');
ok(/\|\|!!\(d\.ncDetail\|\|''\)\.trim\(\)\|\|d\.l562Garde===true;   \/\* \[L562\] jumeau \*\//.test(DET)&&/d\.ncAng\|\|d\.ncHum\|\|d\.l562Garde===true;   \/\* \[L562\] jumeau \*\//.test(DET),'détecteur : engagedOf et le prédicat des lignes orphelines lisent le drapeau (jumeaux)');

console.log('── 5. R2 : qui interroger — _l562AQuestionner EXÉCUTÉ (mono, multi-machine, cas sans question) ──');
global.chronoStartTs=null; global.countCoupees=()=>1; DOM.b1.classList.add('coupee');
const q0=T(()=>_l562AQuestionner()); ok(Array.isArray(q0)&&q0.length===1&&q0[0].id==='b2','(a) 1 cochée, bobine en cours b2 non figée → UNE question, sur b2 → '+JSON.stringify(q0&&q0.map(x=>x.id)));
global.countCoupees=()=>0; DOM.b1.classList.remove('coupee'); ok(T(()=>_l562AQuestionner().length===0),'(f) commande PAS commencée → aucune question'); DOM.b1.classList.add('coupee'); global.countCoupees=()=>1;
ficholinePhotos.b2='p'; ok(T(()=>_l562AQuestionner().length===0),'bobine en cours déjà FIGÉE par un geste (photo, config retapée, NC…) → aucune question'); delete ficholinePhotos.b2;
ficheLines[1].l562Garde=true; ok(T(()=>_l562AQuestionner().length===0),'bobine en cours déjà GARDÉE → aucune question (2e changement de laize après un OUI)'); ficheLines[1].l562Garde=false;
global._shareCurrentDocId=()=>'doc'; ok(T(()=>_l562AQuestionner().length===0),'commande partagée → aucune question (le recalcul est refusé avant)'); global._shareCurrentDocId=()=>null;
['b2','b3'].forEach(id=>DOM[id].classList.add('coupee')); ok(T(()=>_l562AQuestionner().length===0),'plus aucune bobine à couper → aucune question'); ['b2','b3'].forEach(id=>DOM[id].classList.remove('coupee'));
global.ficheLines=[{id:'b1',useful:2080,ref:'KX',machine:'maveg',origConf:''},{id:'b2',useful:2080,ref:'KX',machine:'maveg',origConf:''},{id:'b3',useful:2080,ref:'KX',machine:'maveg',origConf:''},{id:'c1',useful:2080,ref:'KA',machine:'cevenini',origConf:''},{id:'c2',useful:2080,ref:'KA',machine:'cevenini',origConf:''}];
['c1','c2'].forEach((id,i)=>{ mk(id); mk('pos_'+id,{textContent:(i+1)+'/2'}); mk('flConf_'+id,{value:''}); mk('l562Note_'+id); });
const qm=T(()=>_l562AQuestionner()); ok(Array.isArray(qm)&&qm.map(x=>x.id).join()==='b2,c1','(question 1) deux machines : UNE question par machine, sa 1re bobine non cochée → b2 (MAVEG) puis c1 (CEVENINI) → '+JSON.stringify(qm&&qm.map(x=>x.id)));
ficholinePhotos.c1='p'; ok(T(()=>_l562AQuestionner().map(x=>x.id).join()==='b2'),'la 1re non cochée de CEVENINI est figée → pas de question pour cette machine (c2 est une « suivante »)'); delete ficholinePhotos.c1;
global.ficheLines=global.ficheLines.slice(0,3);

console.log('── 6. le jeton de réponse (EXÉCUTÉ) ──');
global._l562Jeton={reps:{b2:'oui'},t:Date.now()}; const r1=T(()=>_l562PrendreReponse([ficheLines[1]])); ok(r1&&r1.b2==='oui'&&global._l562Jeton===null,'jeton frais → réponses rendues, jeton consommé');
ok(T(()=>_l562PrendreReponse([ficheLines[1]])===null),'2e lecture → null (usage unique)');
global._l562Jeton={reps:{b2:'non'},t:Date.now()-6000}; ok(T(()=>_l562PrendreReponse([ficheLines[1]])===null),'jeton de plus de 5 s → null');
global._l562Jeton={reps:{b2:'oui'},t:Date.now()}; ok(T(()=>_l562PrendreReponse([ficheLines[1],{id:'c1'}])===null),'jeton incomplet (une machine sans réponse) → null : la question est reposée');

console.log('── 7. drapeau « gardée » : pose / levée (EXÉCUTÉ), note de carte ──');
ok(T(()=>_l562Poser('b2')===true&&ficheLines[1].l562Garde===true&&DOM.b2.classList.contains('l562-gardee')&&DOM.l562Note_b2.textContent.indexOf('laize 2080 mm')>=0&&DOM.l562Note_b2.textContent.indexOf('Gardée telle quelle')>=0),'OUI → drapeau + classe + note « Gardée telle quelle — laize 2080 mm »');
ok(T(()=>_l562Poser('b1')===false&&!ficheLines[0].l562Garde),'jamais sur une bobine cochée (D-4 : cochée pendant la seconde d attente)');
ok(T(()=>_l562Lever('b2')===true&&ficheLines[1].l562Garde===false&&!DOM.b2.classList.contains('l562-gardee')&&DOM.l562Note_b2.textContent===''),'la coche lève le drapeau, retire la classe et la note');
ok(T(()=>_l562Laize({useful:2080})===2080&&_l562Laize({recut:true,rollW:600,useful:2080})===600),'laize dite = celle de la ligne (rouleau chute : sa largeur)');

console.log('── 8. R2 dans recalcEcartsFromFiche : question avant tout, pose à l application, régénération explicite ──');
const RES=F('recalcEcartsFromFiche');
const iQ=RES.indexOf("if(!_rep62){ _l562Demander(_q62,opts); return {started:false,l562:true}; }"), iCmd=RES.indexOf("showToast('Aucune commande à recalculer.','err')"), iOver=RES.indexOf('const over=[].concat('), iTo=RES.indexOf('setTimeout(()=>{');
ok(iQ>0&&iCmd>0&&iQ>iCmd&&iOver>iQ&&iTo>iQ,'la question est posée APRÈS les gardes (partage, NC non chiffrée, plan vide) et AVANT l alerte oversize et le setTimeout destructif ; refus {started:false,l562:true}');
ok(/const _rep62=_l562PrendreReponse\(_q62\);/.test(RES)&&/opts\._l562Rep=_rep62;/.test(RES),'réponses lues par le jeton puis portées par opts (lues à l instant de l application)');
const iPose=RES.indexOf("if(opts._l562Rep){ Object.keys(opts._l562Rep).forEach(function(id){ if(opts._l562Rep[id]==='oui'&&typeof _l562Poser==='function') _l562Poser(id); }); }"), iFz=RES.indexOf('frozenSet=new Set(ficheLines.filter(l=>isLineFrozen(l.id)).map(l=>l.id));');
ok(iPose>iTo&&iFz>iPose&&RES.slice(iPose,iFz).split('\n').length===2,'le drapeau est posé DANS le setTimeout (à l INSTANT de l application, D-4), sur la ligne juste avant frozenSet');
ok(/if\(force && !op2 && typeof _l562Commencee==='function' && _l562Commencee\(\) && !ficheLines\.some\(function\(l\)\{ return isLineFrozen\(l\.id\); \}\) && !\(opts\._l562Rep&&Object\.keys\(opts\._l562Rep\)\.some\(function\(k\)\{ return opts\._l562Rep\[k\]==='oui'; \}\)\)\)\{/.test(RES),'(b, c) réponse NON sans AUCUNE bobine figée ni gardée (un OUI, drapeau pas encore posé, exclut ce chemin) → régénération explicite');
ok(/_ficheGenPlanSig=null;\n    importPlanToFiche\(\{auto:true,_l562Ok:true,keepRefValidation:!!opts\._l562KeepVal\}\);/.test(RES),'régénération explicite = importPlanToFiche({auto,_l562Ok}) avec la signature du Plan invalidée AVANT (bobine retirée par ✕ : plus de barre rouge à vie — correctif du critique)');
ok(/showToast\('♻ Fiche refaite avec le nouveau plan : '\+ficheLines\.length\+' bobine\(s\)\. Aucune bobine n’était cochée ni gardée — relis la bobine n° 1 avant de la programmer\.','ok',10000\);/.test(RES)&&/return \{started:true,l562Regen:_refait62\};/.test(RES),'toast « Fiche refaite… relis la bobine n° 1 » (10 s) et retour l562Regen pour l appelant');
ok(/const head=_g562\+\(op2/.test(RES)&&/' gardée telle quelle \(laize '\+fmt\(_l562Laize\(l\)\)\+' mm\)'/.test(RES)&&/_g562='🔒 '\+_gs62\.join\(' · '\)\+' ; les suivantes sont recalculées\. ';/.test(RES)&&/showToast\(head\+\(_chg54\.length\?/.test(RES),'toast après OUI : « 🔒 Bobine n° N gardée telle quelle (laize N mm) ; les suivantes sont recalculées. » devant le détail L554 (intact)');
ok(/if\(!opts\._l562Ok && !isFicheUntouched\(\)\)\{/.test(F('importPlanToFiche'))&&/if\(auto && Array\.isArray\(ficheLines\) && ficheLines\.length && _ficheGenPlanSig\)\{/.test(F('importPlanToFiche')),'importPlanToFiche : contournement explicite _l562Ok seulement ; la sortie « plan inchangé » (signature) reste (d où le =null avant)');

console.log('── 9. les appelants : la question n est pas une erreur, la réponse relance le bon geste ──');
const APF=F('_applyPlanDriftFix');
ok(/\}, _l562Retry:function\(\)\{ _applyPlanDriftFix\(opts\); \}\}\);/.test(APF)&&/if\(_res&&_res\.l562\) return;/.test(APF)&&/else if\(!\(_res&&_res\.l554\)\) \{ showToast\('⚠ Recalcul NON appliqué/.test(APF),'bouton de la barre : relance par la réponse, question ≠ erreur, garde L554 intacte');
ok(/if\(!\(_res&&_res\.l562Regen\)\) showToast\('✓ Plan appliqué à la fiche \(bobines coupées conservées\)\.','ok'\);/.test(APF),'bouton de la barre : « Plan appliqué » n est pas affiché par-dessus « Fiche refaite »');
const ARP=F('applyFicheRefPlanChange');
ok(/recalcEcartsFromFiche\(\{force:true,_l562KeepVal:true,onApplied:\(\)=>\{/.test(ARP)&&/if\(_res&&_res\.l562\)\{ \/\* \[L562\] question posée : pas une erreur \*\/ \}\n    else if\(!_res\|\|!_res\.started\)\{\n      if\(!\(_res&&_res\.l554\)\) showToast\('⚠ Recalcul NON appliqué — corrige le point signalé ci-dessus puis re-valide cette référence\.','err'\);/.test(ARP),'✓ VALIDER par référence (multi) : validation gardée après régénération, question ≠ erreur, L554 intact');
ok(/if\(_res&&_res\.l562\)\{ \/\* \[L562\] question posée : pas une erreur \*\/ \}\n    else if\(!_res\|\|\(!_res\.started&&!_res\.l554\)\) showToast\('⚠ Recalcul NON appliqué — corrige le point signalé ci-dessus puis reclique « 🔄 Changement plan »/.test(F('applyFichePlanChange')),'🔄 Changement plan / ✓ Valider la bobine mère (mono, champs cachés, choix machine) : question ≠ erreur');
const CHIP=F('_l345EditChip');
ok(/recalcEcartsFromFiche\(\{_l562Retry:function\(\)\{ _l345EditChip\(id\); \}\}\)/.test(CHIP)&&/else if\(_r54&&_r54\.l562\)\{[^\n]*\n\s*else if\(!\(_r54&&_r54\.l554\)\) \{ try\{ showToast\('♻ Recalcul non lancé/.test(CHIP),'config retapée sur une AUTRE bobine (blur = recalcul) : la réponse relance le chip, question ≠ erreur');
ok(/if\(\(typeof countCoupees!=='function'\|\|countCoupees\(\)===0\)&&!\(typeof _l562Commencee==='function'&&_l562Commencee\(\)\)\)\{   \/\* \[L562\]/.test(F('startCutFromPlan')),'« Commencer à couper » : plus de ré-ordonnancement des références sur une commande commencée (rail = lignes)');

console.log('── 10. R3 + filet + barre ──');
ok(/opts\.autoApply && !needClick && !shared && !_pm\n       && !\(typeof _l562Commencee==='function'&&_l562Commencee\(\)\)   \/\* \[L562 · R3\]/.test(DET),'R3 : auto-application (stock / rouleaux / machine) coupée dès que la commande est commencée (condition L286 lisible)');
ok(/if\(!needClick&&!shared&&!_pm&&typeof _l562Commencee==='function'&&_l562Commencee\(\)\) _why54\+=' · commande commencée : rien n\\'est appliqué tout seul';/.test(DET),'R3 : la barre dit « commande commencée : rien n est appliqué tout seul »');
ok(/try\{ if\(!shared&&typeof _l562AQuestionner==='function'&&_l562AQuestionner\(\)\.length\) drifts\.unshift\('🔒 « Appliquer » demande d’abord si la bobine en cours reste telle quelle'\); \}catch\(e\)\{\}/.test(DET),'la barre annonce la question quand elle sera posée');
const iFilet=DET.indexOf("drifts.push('📝 le Plan a été modifié depuis le calcul de la fiche'); needClick=true;"), iHide=DET.indexOf("if(!drifts.length){ hide(); return; }");
ok(iFilet>0&&iHide>iFilet&&/if\(!drifts\.length && typeof _l562Commencee==='function' && _l562Commencee\(\) && _ficheGenPlanSig && !data\.some\(_l562Figee\) && _planSigOf\(\)!==_ficheGenPlanSig\)/.test(DET),'filet : commande commencée, aucune bobine figée, signature du Plan ≠ génération → dérive « 📝 le Plan a été modifié » (métrage, n° de commande…), posée avant le hide()');
ok(!/if\(typeof isFicheUntouched==='function'&&isFicheUntouched\(\)&&!\(typeof _l562Commencee/.test(DET)&&/if\(typeof isFicheUntouched==='function'&&isFicheUntouched\(\)\)\{ hide\(\); return; \}/.test(DET)&&/if\(typeof _l562Commencee==='function'&&_l562Commencee\(\)\) return false;   \/\* \[L562 · R1\]/.test(F('isFicheUntouched')),'la sortie « fiche vierge » du détecteur est inchangée : c est isFicheUntouched qui dit « touchée » sur une commande commencée (un seul endroit)');

console.log('── 11. la fenêtre : 3 boutons, OUI par défaut, Annuler = rien, avertissements, laize, une question par machine ──');
const DEM=F('_l562Demander');
ok(/id="l562Oui"/.test(DEM)&&/id="l562Non"/.test(DEM)&&/id="l562Annuler">Annuler — ne rien changer pour l’instant<\/button>/.test(DEM),'trois boutons : OUI, NON, Annuler explicite (au doigt)');
ok(/'<span>OUI — elle est sur la machine<\/span><b>NE PAS LA MODIFIER<\/b><small>elle garde sa configuration et sa laize de '\+esc\(fmt\(_l562Laize\(l\)\)\)\+' mm<\/small>'/.test(DEM)&&/'<span>NON — pas encore commencée<\/span><b>LA RECALCULER AUSSI<\/b><small>comme avant<\/small>'/.test(DEM),'OUI dit la laize gardée ; NON = comme avant — français simple, pas de prénom');
ok(/'La bobine n° '\+pos\+mach\+' est-elle DÉJÀ EN COURS DE DÉCOUPE \?'/.test(DEM)&&/\(N>1\?\('Question '\+\(k\+1\)\+'\/'\+N\+' · '\):''\)/.test(DEM)&&/const mach=\(N>1\)\?\(' — '\+getMachineLabel\(String\(_flMachineOf\(id\)\|\|''\)\)\):'';/.test(DEM),'titre : « La bobine n° 4/9 est-elle DÉJÀ EN COURS DE DÉCOUPE ? » ; plusieurs machines : « Question 1/2 · … — MAVEG »');
ok(/role="alertdialog"/.test(DEM)&&/ov\.style\.zIndex='100000'/.test(DEM)&&/ov\.style\.display='flex';\n  montrer\(\);/.test(DEM)&&/try\{ oui\.focus\(\); \}catch\(e\)\{\}   \/\* le choix sûr par défaut/.test(DEM),'au-dessus de tout (comme confirmDlg), fenêtre affichée PUIS focus immédiat sur OUI (le choix sûr)');
ok(/ov\.onclick=function\(e\)\{ if\(e\.target===ov\) fin\(null\); \};/.test(DEM)&&/if\(e\.key==='Escape'\) fin\(null\);/.test(DEM)&&/ann\.onclick=function\(\)\{ fin\(null\); \};/.test(DEM)&&/if\(!rep\)\{ try\{ showToast\('Rien n’a été changé\. Le plan modifié n’est pas encore appliqué à la fiche\.'\); \}catch\(e\)\{\} return; \}/.test(DEM),'Annuler / tap dehors / Échap = rien ne change (toast, aucun jeton, aucune relance)');
ok(/_l562Jeton=\{reps:rep,t:Date\.now\(\)\};/.test(DEM)&&/if\(opts&&typeof opts\._l562Retry==='function'\) opts\._l562Retry\(\); else recalcEcartsFromFiche\(opts\|\|\{\}\);/.test(DEM),'réponse → jeton puis relance de l appelant (barre, chip) ou du même recalcul (Changement plan, Valider, ♻ Écarts, op.2)');
ok(/const repondre=function\(r\)\{ if\(fini\) return; reps\[lignes\[k\]\.id\]=r; k\+\+; if\(k<N\) montrer\(\); else fin\(reps\); \};/.test(DEM),'questions enchaînées : la fenêtre passe à la machine suivante, le jeton part quand toutes ont répondu');
ok(/\(zero\?' ⚠ Aucune bobine n’est cochée « coupée » : si des bobines sont déjà coupées, tape Annuler et coche-les d’abord\.':''\)/.test(DEM),'aucune coche → avertissement « coche-les d abord »');
ok(/const avert=zero&&_l562StockSaisi\(\); st\.textContent=avert\?'⚠ Du stock « déjà en bobineaux » est saisi dans le Plan : si c’est la production déjà faite, répondre OUI produirait en trop\.':'';/.test(DEM),'(question 2) stock saisi + aucune coche → avertissement ROUGE, OUI reste possible');
global.getRefGroups=()=>[{chutes:[{qty:1,width:150}]}]; ok(T(()=>_l562StockSaisi()===true&&(global.getRefGroups=()=>[{chutes:[]}], _l562StockSaisi()===false)),'_l562StockSaisi (EXÉCUTÉ) : vrai avec une ligne de stock, faux sans');

console.log('── 12. jumeaux du drapeau ──');
const ADD=F('addFicheLine');
ok(/^    l562Garde:\(data\.l562Garde===true\),   \/\* \[L562\]/m.test(ADD)&&/resteGarde:!!data\.resteGarde, resteGardeConf:\(data\.resteGarde\?_l558Conf\(data\.conf\):''\)\}\);/.test(ADD),'addFicheLine : meta l562Garde (la ligne L558 reste byte-identique)');
ok(/if\(data\.l562Garde===true\) div\.classList\.add\('l562-gardee'\);/.test(ADD)&&/<div class="l562-note" id="l562Note_\$\{id\}">\$\{data\.l562Garde===true\?esc\(_l562NoteTexte\(\(data\.recut\?data\.rollW:data\.useful\)\|\|0\)\):''\}<\/div>/.test(ADD),'addFicheLine : classe + note rendues depuis la méta (reprise d une bobine gardée : la carte le dit)');
ok(/^      l562Garde:\(L\.l562Garde===true&&!\(document\.getElementById\(id\)\?\.classList\.contains\('coupee'\)\)\)\|\|undefined,/m.test(F('getFicheLinesData')),'getFicheLinesData : émis seulement quand posé, JAMAIS sur une bobine cochée (brouillon, autosave, partage, envoi)');
ok(/^    l562Garde:\(!!ld\.l562Garde&&!ld\.coupee\),/m.test(F('restoreFicheLineFromData'))&&/^    resteGarde:!!ld\.resteGarde,/m.test(F('restoreFicheLineFromData')),'(e) restoreFicheLineFromData : drapeau restauré (reprise, brouillon, partage, rechargement), L558 intact');
ok(/actAccept:false, resteGarde:false, l562Garde:false/.test(F('stopManqueMatiere')),'arrêt manque de matière : le solde repart SANS bobine gardée (commande neuve)');
ok(/if\(isCoupee\)\{ line\.dataset\.cutAt=String\(Date\.now\(\)\); _lastCoupeeMarkMs=Date\.now\(\); try\{ if\(typeof _l562Lever==='function'\) _l562Lever\(id\); \}catch\(e\)\{\} \}/.test(F('toggleCoupee')),'toggleCoupee : la coche lève le drapeau');
ok(/function _l418Frozen2Ids\(\)\{ return new Set\(\); \}/.test(src)&&CHARGEES.indexOf('_l562AQuestionner')>=0,'R4 : le verrou L418 reste un ensemble vide — c est la question qui protège, pas un gel');

console.log('── 13. textes opérateur ──');
ok(/\(_st27\?\(\(\(typeof _l562Commencee!=='function'\)\|\|_l562Commencee\(\)\)\?' ⚠ Les bobines restantes de cette référence ont été calculées sur une AUTRE laize : onglet Fiche → bouton ROUGE de la bannière en haut \(« Appliquer »\) avant de couper\. L’outil demandera si la bobine en cours doit rester telle quelle\.':' La fiche sera refaite avec cette laize \(rien n’est commencé\)\.'\):''\)/.test(src)&&/,\(_st27&&\(\(typeof _l562Commencee!=='function'\)\|\|_l562Commencee\(\)\)\)\?'err':'ok'\);/.test(src),'✓ VALIDER au Plan : commencée → rouge « bouton ROUGE … l outil demandera » ; pas commencée → vert « la fiche sera refaite » (plus de bouton rouge annoncé puis absent)');
ok(/showToast\('⛔ La laize de cette référence a changé dans le Plan APRÈS le calcul de cette bobine : tape le bouton ROUGE de la bannière en haut \(« Appliquer »\)\. Si cette bobine est déjà en cours de découpe, réponds OUI : elle restera telle quelle et tu pourras la cocher\.','err'\);/.test(F('coupeeTapOne')),'refus de coche sous barre rouge : dit quoi répondre (mots attendus par laize_l527_test conservés)');

console.log('── 14. CSS (règle 3 : portrait = layout historique) ──');
ok(/^\.l562-note\{display:none\}/m.test(src)&&/^\.btn\.l562-btn\{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;width:100%;min-height:96px;font-size:19px;/m.test(src)&&/^\.btn\.l562-annuler\{display:flex;justify-content:center;width:100%;min-height:52px;/m.test(src),'CSS global : note masquée par défaut ; boutons OUI/NON ≥ 96 px, Annuler ≥ 52 px (gants)');
{ const iMq=src.indexOf('  #ficheRight>#planDriftBanner{flex:none}'), iNote=src.indexOf('  .fiche-line.l562-gardee .l562-note{display:block;'), iAt=src.indexOf('  body.atelier .l554-why{font-size:14px}'); ok(iMq>0&&iAt>iMq&&iNote===src.indexOf('\n',iAt)+1&&/^  body\.atelier \.fiche-line\.l562-gardee \.l562-note\{font-size:15px\}/m.test(src),'CSS paysage (bloc @media min-width:1100px) : note visible sous la règle L554, lisible en atelier'); }

console.log('── 15. scènes Chrome (tests/shot.mjs) et leur branchement (batterie + CI) ──');
const SCENES=['fiche-garde-oui','fiche-garde-vierge','fiche-garde-auto','fiche-garde-multi'];
ok(SCENES.every(s=>shot.indexOf("  '"+s+"': `")>=0)&&SCENES.every(s=>shot.indexOf("    '"+s+"': \"(function(){ const s=window.__l562||{};")>=0),'4 scènes présentes : SETUP et CHECK (chaîne = échec explicite) → '+SCENES.join(', '));
ok(SCENES.every(s=>/Usage : node shot\.mjs --scene [^\n]*/.exec(shot)&&/Usage : node shot\.mjs --scene [^\n]*/.exec(shot)[0].indexOf(s)>=0),'la ligne d usage de shot.mjs les cite');
ok(shot.indexOf("document.getElementById('l562Annuler').click(); S.step='annuler';")>=0&&shot.indexOf("document.getElementById('l562Oui').click(); S.step='oui';")>=0&&shot.indexOf("document.getElementById('l562Non').click(); S.step='non';")>=0,'les scènes répondent par les VRAIS boutons (OUI, NON, Annuler)');
ok(shot.indexOf("S.question2=S.Q(); S.lignesEntreQuestions=S.snap();")>=0,'(question 1) la scène multi répond aux deux questions, une par machine');
ok(shot.indexOf("document.getElementById('l562Non').click(); window.__l554.step='applique'; }, 'question L562');")>=0&&shot.indexOf("s.question.txt.indexOf('bobine n° 2/2')<0")>=0,'(d) scène fiche-dechet : la question est posée sur la bobine 2/2 et la scène répond NON — la décision du 22/10 (compléter la bobine suivante) tient');
ok(/const gestesReels = async \(\) => \{/.test(shot)&&shot.indexOf("JSON.stringify((window.__shotGestes||[]).splice(0))")>=0&&shot.indexOf("envois.push(S('Input.dispatchMouseEvent', { type: 'mousePressed', x: c.x, y: c.y, button: 'left', clickCount: i + 1 }));")>=0&&shot.indexOf("await Promise.all(envois);")>=0&&shot.indexOf("for (let k = 0; k < 70; k++) { await gestesReels(); screenOk = await evalJs(")>=0,'(contre-lecture) shot.mjs : gestes RÉELS (souris CDP, isTrusted) demandés par une scène via window.__shotGestes, joués pendant l attente du CHECK, événements envoyés GROUPÉS (contre-lecture 2 : sous charge, 6 allers-retours attendus un par un écartaient les deux taps de plus de 400 ms) — un .click() ne prouve rien contre un anti-rebond');
ok(shot.indexOf("S.G('l562Oui',2); S.step='double-tap-1';")>=0&&shot.indexOf("S.G('l562Oui',2); S.step='double-tap-2';")>=0&&shot.indexOf("if(!(dt.dlg===true&&dt.clics===1&&dt.titre.indexOf('Question 2/2')===0)) return 'anti-rebond")>=0&&shot.indexOf("if(s.clicsApres!==2) return 'anti-rebond apres la fermeture")>=0,'(contre-lecture) la scène multi répond par de VRAIS doubles taps (2 taps à 80 ms, souris CDP) : la question 2/2 reste affichée (un seul clic arrive), puis le 2e tap du double tap final est avalé sous la fenêtre fermée');
ok(shot.indexOf("S.retour={dlg:S.OV(), barre:BL().style.display!=='none'")>=0&&shot.indexOf("if(r.dlg) return 'la question s est ouverte TOUTE SEULE a l arrivee sur la Fiche")>=0,'(contre-lecture) la scène fiche-garde-auto rougit si la question s ouvre toute seule à l arrivée sur la Fiche (application automatique rétablie)');
const loop=(txt)=>{ const m=/for s in ([^;]*?); do/.exec(txt); return m?m[1].trim().split(/\s+/):null; };
const lb=loop(battery), lc=loop(ci);
ok(!!lb&&SCENES.every(s=>lb.indexOf(s)>=0)&&lb.slice(-2).join(' ')==='donnees analyse'&&lb.indexOf(SCENES[0])<lb.indexOf('donnees'),'tests/battery.sh : les 4 scènes sont dans la boucle des smokes, AVANT « donnees analyse »');
ok(!!lc&&SCENES.every(s=>lc.indexOf(s)>=0)&&lc.slice(-2).join(' ')==='donnees analyse'&&lc.indexOf(SCENES[0])<lc.indexOf('donnees'),'.github/workflows/static.yml : idem dans la CI');
{ const m=/Smokes \((\d+) scenes,/.exec(ci); ok(!!m&&!!lc&&Number(m[1])===lc.length&&lc.indexOf(SCENES[0])>=0,'la CI annonce le VRAI nombre de scènes ('+(lc&&lc.length)+') → « Smokes ('+(m&&m[1])+' scenes, »'); }

console.log('── 16. anti-rebond (contre-lecture : double tap avec gants) et écouteur Échap — la fenêtre VRAIE sur un DOM factice, EXÉCUTÉE ──');
ok(T(()=>_l562Rebond(Date.now()+300)===true&&_l562Rebond(Date.now()+400)===true),'_l562Rebond (EXÉCUTÉ) : vrai pendant les 400 ms qui précèdent l échéance');
ok(T(()=>_l562Rebond(Date.now()-1)===false&&_l562Rebond(0)===false&&_l562Rebond(undefined)===false),'échéance passée ou jamais posée → pas un rebond');
ok(T(()=>_l562Rebond(Date.now()+1000)===false),'horloge reculée (plus de 400 ms d avance) → pas un rebond : un tap n est jamais avalé en silence (règle L103 / L560)');
// DOM factice de la fenêtre : createElement rend un nœud dont l id s enregistre ; add/removeEventListener sont ENREGISTRÉS (capture comprise) sur les nœuds, sur document et sur window
const DOC_L=[], WIN_L=[];   // [v3] window enregistre aussi ses écouteurs : l avaleur « fenêtre fermée » y est posé (premier nœud de la phase de capture, avant _l386ConfTap sur document)
global.window={addEventListener(t,f,c){ WIN_L.push({t,f,c:!!(c===true||(c&&c.capture)),passive:!!(c&&c.passive)}); }, removeEventListener(t,f){ const i=WIN_L.findIndex(x=>x.t===t&&x.f===f); if(i>=0) WIN_L.splice(i,1); }};
const ecoute=(el)=>{ el.listeners=[]; el.addEventListener=function(t,f,c){ el.listeners.push({t,f,c:!!c}); }; el.removeEventListener=function(t,f){ el.listeners=el.listeners.filter(x=>!(x.t===t&&x.f===f)); }; el.focus=function(){ document.activeElement=el; }; return el; };
['l562Titre','l562Conf','l562Aide','l562Stock','l562Oui','l562Non','l562Annuler'].forEach(id=>ecoute(mk(id)));
global.document={getElementById:id=>DOM[id]||null,body:{appendChild(){}},activeElement:null,
  createElement:()=>{ const el=ecoute(mk('_neuf'+Math.random())); let _id=el.id; Object.defineProperty(el,'id',{get(){ return _id; },set(v){ delete DOM[_id]; _id=v; DOM[v]=el; }}); return el; },
  addEventListener(t,f,c){ DOC_L.push({t,f,c:!!c}); }, removeEventListener(t,f){ const i=DOC_L.findIndex(x=>x.t===t&&x.f===f); if(i>=0) DOC_L.splice(i,1); }};
global.recalcEcartsFromFiche=function(){ return {started:true}; };
global.countCoupees=()=>1; global.ficheLines=[{id:'b1',useful:2080,ref:'KX',machine:'maveg',origConf:''},{id:'b2',useful:2080,ref:'KX',machine:'maveg',origConf:''},{id:'b3',useful:2080,ref:'KX',machine:'maveg',origConf:''},{id:'c1',useful:2080,ref:'KA',machine:'cevenini',origConf:''},{id:'c2',useful:2080,ref:'KA',machine:'cevenini',origConf:''}];
const ev=(trusted,extra)=>{ const e=Object.assign({isTrusted:trusted,key:'',stop:false,prev:false,stopImmediatePropagation(){ e.stop=true; },preventDefault(){ e.prev=true; }},extra||{}); return e; };
const joue=(lst,e)=>{ lst.forEach(x=>x.f(e)); return e; };
const OV=()=>DOM.l562Dlg; const capOv=()=>((OV()&&OV().listeners)||[]).filter(x=>x.t==='click'&&x.c); const capDoc=(t)=>DOC_L.filter(x=>x.t===t&&x.c); const capWin=(t)=>WIN_L.filter(x=>x.t===t&&x.c); const kb=()=>DOC_L.filter(x=>x.t==='keydown'&&!x.c);
T(()=>_l562Demander([ficheLines[1]],{}));
ok(T(()=>!!OV()&&OV().style.display==='flex'&&_l562Rebond(OV()._l562ArmeA)===true),'la fenêtre affichée est ARMÉE : pas de réponse réelle pendant les 400 ms qui suivent l affichage');
ok(T(()=>capOv().length===1&&joue(capOv(),ev(true)).stop===true&&joue(capOv(),ev(true)).prev===true),'(P1/P2) écouteur de CAPTURE sur la fenêtre, posé une fois : un clic RÉEL pendant ces 400 ms est avalé (OUI / NON / Annuler / voile ne le voient pas)');
ok(T(()=>capOv().length===1&&joue(capOv(),ev(false)).stop===false),'un clic programmé (isTrusted=false : scènes, simulateur) passe');
ok(T(()=>capDoc('keydown').length===1&&joue(capDoc('keydown'),ev(true,{key:'Escape'})).stop===true&&joue(capDoc('keydown'),ev(false,{key:'Escape'})).stop===false),'idem pour un Échap réel pendant les 400 ms (programmé : passe)');
ok(T(()=>{ OV()._l562ArmeA=Date.now()-1; return capOv().length===1&&joue(capOv(),ev(true)).stop===false&&joue(capDoc('keydown'),ev(true,{key:'Escape'})).stop===false; }),'400 ms passées → le clic réel et l Échap passent (Annuler fonctionne après 400 ms)');
ok(T(()=>{ DOM.l562Annuler.onclick(); return OV().style.display==='none'&&_l562Rebond(OV()._l562AvaleA)===true; }),'Annuler → fenêtre fermée et window ARMÉ 400 ms (le 2e tap d un double tap sur Annuler n atteint rien dessous)');
ok(T(()=>{ _l562Demander([ficheLines[1],ficheLines[3]],{}); OV()._l562ArmeA=Date.now()-1; DOM.l562Oui.onclick(); return OV().style.display==='flex'&&DOM.l562Titre.textContent.indexOf('Question 2/2')===0&&_l562Rebond(OV()._l562ArmeA)===true; }),'(P1) réponse à la question 1/2 → la question 2/2 est RÉ-ARMÉE 400 ms : le 2e tap d un double tap ne lui répond pas (CHAQUE question, pas seulement la première)');
ok(T(()=>{ const n=capWin('click').length, nd=capDoc('click').length; OV()._l562ArmeA=Date.now()-1; OV()._l562AvaleA=0; DOM.l562Oui.onclick(); return n===1&&nd===0&&capWin('mousedown').length===1&&capWin('pointerdown').length===1&&capWin('touchstart').length===1&&capOv().length===1&&capDoc('keydown').length===1&&OV().style.display==='none'&&_l562Rebond(OV()._l562AvaleA)===true; }),'(P3, v3) dernière réponse → fenêtre fermée, WINDOW ARMÉ 400 ms ; les écouteurs de capture restent UNIQUES (1 clic sur la fenêtre, 1 Échap sur document, 4 sur window — posés à la création, jamais empilés) et plus aucun avaleur « click » sur document (v3 : il passait APRÈS _l386ConfTap)');
ok(T(()=>capWin('click').length===1&&joue(capWin('click'),ev(true)).stop===true&&joue(capWin('click'),ev(true)).prev===true),'(v3) pendant ces 400 ms un clic RÉEL n importe où (le ✂ COUPÉE sous la fenêtre…) est avalé en phase de capture sur WINDOW (avant _l386ConfTap : la configuration de la bobine en cours ne passe plus en mode édition)');
ok(T(()=>capWin('click').length===1&&joue(capWin('click'),ev(false)).stop===false),'(v3) un clic programmé passe (window)');
ok(T(()=>{ OV()._l562AvaleA=Date.now()+1000; const a=joue(capWin('click'),ev(true)).stop; const ra=OV()._l562AvaleA-Date.now(); OV()._l562AvaleA=Date.now()-1; const b=joue(capWin('click'),ev(true)).stop; const rb=OV()._l562AvaleA-Date.now(); return capWin('click').length===1&&a===false&&b===false&&ra>900&&rb<=0; }),'(v3) horloge reculée ou 400 ms passées → rien n est avalé ET rien n est ré-armé');
ok(T(()=>['mousedown','pointerdown','touchstart'].every(t=>{ OV()._l562AvaleA=Date.now()+300; const e=joue(capWin(t),ev(true,{cancelable:true})); return capWin(t).length===1&&capWin(t)[0].passive===false&&e.stop===true&&e.prev===true; })),'(v3) mousedown, pointerdown et touchstart RÉELS avalés pendant les 400 ms (stopImmediatePropagation + preventDefault, écouteurs non passifs) : plus de focus résiduel ni de clavier tablette sous la fenêtre fermée');
ok(T(()=>{ OV()._l562AvaleA=Date.now()+300; const e=joue(capWin('touchstart'),ev(true,{cancelable:false})); return e.stop===true&&e.prev===false; }),'(v3) touchstart réel NON annulable : propagation arrêtée, preventDefault non appelé (aucun avertissement du navigateur)');
ok(T(()=>['click','mousedown','pointerdown','touchstart'].every(t=>{ OV()._l562AvaleA=Date.now()+300; const e=joue(capWin(t),ev(false,{cancelable:true})); return capWin(t).length===1&&e.stop===false&&e.prev===false; })),'(v3) un geste programmé (isTrusted=false : scènes, simulateur) passe sur les 4 types (l avaleur est bien là et le laisse passer)');
ok(T(()=>{ OV()._l562AvaleA=Date.now()+120; const e1=joue(capWin('click'),ev(true)); const r1=OV()._l562AvaleA-Date.now(); OV()._l562AvaleA=Date.now()+120; const e2=joue(capWin('mousedown'),ev(true)); const r2=OV()._l562AvaleA-Date.now(); return e1.stop===true&&e2.stop===true&&r1>350&&r1<=400&&r2>350&&r2<=400; }),'(v3) fenêtre GLISSANTE : chaque geste réel avalé (clic, mousedown) ré-arme les 400 ms (120 ms restantes → 400) : le 3e tap d un triple tap reste avalé');
ok(T(()=>{ const lent=function(){ const t=Date.now()+250; while(Date.now()<t){} return {started:true}; }; global.recalcEcartsFromFiche=lent; _l562Demander([ficheLines[1]],{}); OV()._l562ArmeA=Date.now()-1; OV()._l562AvaleA=0; DOM.l562Oui.onclick(); const r1=OV()._l562AvaleA-Date.now(); _l562Demander([ficheLines[1]],{_l562Retry:lent}); OV()._l562ArmeA=Date.now()-1; OV()._l562AvaleA=0; DOM.l562Oui.onclick(); const r2=OV()._l562AvaleA-Date.now(); global.recalcEcartsFromFiche=function(){ return {started:true}; }; return OV().style.display==='none'&&r1>350&&r1<=400&&r2>350&&r2<=400; }),'(v3) réponse avec une relance LENTE (250 ms de travail synchrone simulé, recalcEcartsFromFiche et opts._l562Retry) → les 400 ms « fenêtre fermée » sont RÉ-ARMÉS APRÈS la relance : il en reste ~400 quand le 2e tap est traité (v2 : 400 − 250)');
ok(T(()=>kb().length===0&&OV()._l562OnKey===null),'fenêtre fermée : plus aucun écouteur Échap, ov._l562OnKey remis à null');
ok(T(()=>{ _l562Demander([ficheLines[1]],{}); const f1=OV()._l562OnKey, n1=kb().length; _l562Demander([ficheLines[1]],{}); const f2=OV()._l562OnKey, n2=kb().length; return n1===1&&n2===1&&typeof f1==='function'&&typeof f2==='function'&&f1!==f2&&kb()[0].f===f2; }),'(regression P1) question re-posée pendant qu une autre est ouverte (recalcul venu d un minuteur) : l ancien écouteur Échap est RETIRÉ, un seul survit — le nouveau');
ok(T(()=>{ OV()._l562ArmeA=Date.now()-1; DOM.l562Oui.onclick(); return kb().length===0&&OV()._l562OnKey===null&&!!(_l562Jeton&&_l562Jeton.reps&&_l562Jeton.reps.b2==='oui'); }),'réponse → plus aucun écouteur Échap, ov._l562OnKey à null, jeton posé : un Échap plus tard n affiche plus « Rien n a été changé » à tort');
const DEM2=F('_l562Demander');
ok(/^function _l562Rebond\(jusqua\)\{ const r=\(jusqua\|\|0\)-Date\.now\(\); return r>0&&r<=400; \}/m.test(src)&&/ov\._l562ArmeA=Date\.now\(\)\+400;/.test(DEM2)&&/ov\._l562AvaleA=Date\.now\(\)\+400;/.test(DEM2)&&/if\(e\.isTrusted&&_l562Rebond\(ov\._l562ArmeA\)\)/.test(DEM2)&&/if\(e\.isTrusted&&_l562Rebond\(ov\._l562AvaleA\)\)/.test(DEM2),'un seul prédicat _l562Rebond (400 ms, horloge sûre) pour les deux échéances ; armement à l affichage (montrer) et à la fermeture (fin) ; filtre isTrusted');
ok(/\['click','mousedown','pointerdown','touchstart'\]\.forEach\(function\(t\)\{ window\.addEventListener\(t,function\(e\)\{ if\(e\.isTrusted&&_l562Rebond\(ov\._l562AvaleA\)\)\{ e\.stopImmediatePropagation\(\); if\(t!=='touchstart'\|\|e\.cancelable\) e\.preventDefault\(\); ov\._l562AvaleA=Date\.now\(\)\+400; \} \},\{capture:true,passive:false\}\); \}\);/.test(DEM2)&&!/document\.addEventListener\('click'/.test(DEM2),'(v3) forme : l avaleur « fenêtre fermée » est UNE boucle sur window pour les 4 types (capture, non passif, ré-armement dans l avaleur, preventDefault du touchstart seulement s il est annulable) ; plus aucun écouteur click sur document dans la fenêtre');
ok(/console\.warn\('\[L562\] relance :',e\); \}\n    ov\._l562AvaleA=Date\.now\(\)\+400;/.test(DEM2),'(v3) forme : le ré-armement « fenêtre fermée » suit la relance synchrone dans fin() (ligne à part : la ligne de la relance, épinglée, n est pas réécrite)');

fini=true;
console.log('\n'+(fail?('❌ '+fail+' rouge(s) sur '+total):('🏆 L562 : '+total+' vérifications vertes')));
process.exit(fail?1:0);
