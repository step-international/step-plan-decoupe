// dechet_l554_test.js — [L554 · 22/10/2026, decision Celine (responsable qualite) apres le signalement MR du 21/10, commande p26/01129]
// Verrou MAVEG L418 RETIRE (la MAVEG programme chaque bobine mere independamment : plus de gel des 2 lignes suivantes),
// barre « Le plan a change » lisible (motif en clair, paysage), garde « NC cochee mais non chiffree » PARTAGEE barre / recalcul
// (le recalcul refuse sur tous les chemins, au clic ET a l application), Chutes chiffrees deduites par le detecteur comme par le recalcul
// (L426), barre re-verifiee apres TOUT recalcul, toast qui dit ce qui a CHANGE par reference (10 s), ✕ Retirer rafraichit le resume.
// Donnees FICTIVES, aucun appel reseau. Le comportement de bout en bout est rejoue par la smoke « fiche-dechet » (tests/shot.mjs ; boucles
// de tests/battery.sh et de la CI) sur l application reelle en entrainement — vue ROUGE sur L553 (garde absente) et sur L554 avec le verrou remis.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const shot=fs.readFileSync(path.join(__dirname,'shot.mjs'),'utf8');
const bat=fs.readFileSync(path.join(__dirname,'battery.sh'),'utf8');
const ci=fs.readFileSync(path.join(__dirname,'..','.github','workflows','static.yml'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const has=(n)=>{ try{ fnOf(n); return true; }catch(e){ return false; } };

ok(/const APP_VERSION='\d{4}\.\d\d\.\d\d-L(55[4-9]|5[6-9]\d|[6-9]\d\d|\d{4,})';/.test(src),'APP_VERSION >= L554');

console.log('── 1. verrou MAVEG L418 RETIRE (decision Celine 22/10) — EXECUTE sur un faux DOM a 2 bobines MAVEG non coupees ──');
{ global.ficheLines=[{id:'b1'},{id:'b2'},{id:'b3'}]; global.document={getElementById:()=>({classList:{contains:()=>false}})}; global._flMachineOf=()=>'maveg';
  const FZ=eval('('+fnOf('_l418Frozen2Ids')+')'); const s=FZ();
  ok(s instanceof Set&&s.size===0,'_l418Frozen2Ids() renvoie un ensemble VIDE meme avec 2 bobines MAVEG non coupees (avant : les 2 etaient gelees → le reste partait sur une NOUVELLE bobine)');
  ok(/\[L554 · decision Celine/.test(fnOf('recalcEcartsFromFiche'))&&/_l418Frozen2Ids\(\)\|\|new Set\(\)\)\.forEach/.test(fnOf('recalcEcartsFromFiche')),'le recalcul appelle toujours le helper (retour arriere = git revert du lot), decision tracee');
  ok(/_l418Frozen2Ids\(\):null;/.test(fnOf('_fichePlanDriftCheck')),'le detecteur d equilibre appelle toujours le helper (jumeau du recalcul)'); }

console.log('── 2. detecteur : Dechet OU Chutes chiffres deduits (aligne sur le recalcul et les cumuls, L426) ──');
{ const D=fnOf('_fichePlanDriftCheck');
  ok(/const _o54=_l426NcOut\(d\.actDechet,d\.actChutes,_l416NcByWidthFd\(d\)\); const _dl19=_o54\?_l419Delivered\(d\.conf,_o54,d\.origConf\|\|null\):null; if\(d\.actDechet&&!_dl19\) return; if\(_dl19\)\{/.test(D),'production engagee : _l426NcOut (Dechet OU Chutes chiffres) puis _l419Delivered ; Dechet non chiffre = bobine entiere exclue (B54)');
  global.parseConf=eval('('+fnOf('parseConf')+')'); global.console=console; const NCO=eval('('+fnOf('_l426NcOut')+')'), DEL=eval('('+fnOf('_l419Delivered')+')');
  const liv=DEL('42×20 + 8×15',NCO(false,true,{20:4}),null);
  ok(liv&&liv[20]===38&&liv[15]===8,'helpers L426 (inchanges) sur le cas MR en ✂ Chutes chiffrees 4×20 : 38×20 + 8×15 livres — la valeur que le detecteur lit DESORMAIS'); }

console.log('── 3. garde « NC cochee mais NON chiffree » : helper PARTAGE, EXECUTE ; refus du recalcul au clic ET a l application ──');
{ const NQ=eval('('+fnOf('_l554NcNonChiffree')+')');
  const L=(o)=>Object.assign({id:'x',actDechet:false,actChutes:false,ncLarg:false,ncQty:false,ncCasse:false,ncAng:false,ncHum:false,ncLots:[],ncDetail:''},o);
  ok(NQ([L({id:'a',actDechet:true,ncCasse:true})]).length===1&&NQ([L({id:'a',actDechet:true,ncCasse:true})])[0].id==='a','Dechet + casse cochee, ni lot ni commentaire → bloque (la bobine entiere compterait comme perdue)');
  ok(NQ([L({actDechet:true,ncCasse:true,ncLots:[{q:4,w:20}]})]).length===0,'Dechet chiffre 4 × 20 → pas bloque');
  ok(NQ([L({actDechet:true,ncCasse:true,ncDetail:'bobine tombee, tout est perdu'})]).length===0,'Dechet commente (rebut total voulu, meme regle que l envoi L400) → pas bloque');
  ok(NQ([L({actChutes:true,ncQty:true})]).length===0,'✂ Chutes non chiffrees (Qte en trop) → pas bloque : la bobine est comptee livree en entier, aucun risque');
  ok(NQ([L({actDechet:true})]).length===0&&NQ(null).length===0,'Dechet sans aucune NC cochee, ou donnees absentes → pas bloque, jamais d erreur');
  global.document={getElementById:(id)=>id==='pos_a'?{textContent:' 2/3 '}:null}; global.ficheLines=[{id:'a',ref:'41312809 - TacFlex® KX1045-1'}]; global.refDisp=(r)=>String(r).replace(/^\d+ - /,'').replace('TacFlex® ','');
  const POS=eval('('+fnOf('_l554PosDe')+')'), REF=eval('('+fnOf('_l554RefDe')+')'), MSG=eval('('+fnOf('_l554MsgNonChiffre')+')'); global._l554PosDe=POS; global._l554RefDe=REF;
  ok(POS('a')==='bobine 2/3'&&POS('zz')==='bobine ?','numero RELATIF a la reference (texte de la carte « 2/3 »), jamais le rang global (piege L500)');
  global.fmmIsMulti=()=>false; ok(REF('a')===''&&/^bobine 2\/3 au Déchet : saisis la quantité × laize du défaut \(ou un commentaire si toute la bobine est perdue\)/.test(MSG([{id:'a'}])),'mono-ref : « bobine 2/3 au Déchet : saisis … »');
  global.fmmIsMulti=()=>true; ok(REF('a')==='KX1045-1 · '&&/^KX1045-1 · bobine 2\/3 au Déchet/.test(MSG([{id:'a'}])),'multi-ref : la reference precede le numero (« KX1045-1 · bobine 2/3 »)'); global.fmmIsMulti=()=>false;
  const D=fnOf('_fichePlanDriftCheck'), R=fnOf('recalcEcartsFromFiche');
  ok(/const _nq=_l554NcNonChiffree\(data\); if\(_nq\.length\)\{ _l554Bloque=_l554MsgNonChiffre\(_nq\); _l554NqIds=new Set\(_nq\.map\(function\(d\)\{ return d\.id; \}\)\); \}/.test(D)&&/if\(_l554Bloque\) needClick=true;/.test(D),'barre : garde via le helper (+ ids bloques), jamais d auto-application');
  const iG=R.indexOf('_l554NcNonChiffree(getFicheLinesData())'), iOp2=R.indexOf('const op2=opts.op2||null;'), iST=R.indexOf('setTimeout(()=>{');
  ok(/if\(_nq54\.length\)\{ showToast\('⛔ '\+_l554MsgNonChiffre\(_nq54\),'err'\); return \{started:false,l554:true\}; \}/.test(R)&&iG>0&&iG<iOp2&&iG<iST,'RECALCUL (au clic) : refus par le meme helper AVANT toute etape destructive — tous les chemins (bouton, ♻ Ecarts, blur de config, changement plan, VALIDER, op.2)');
  const iA=R.indexOf("const _nqA=(typeof _l554NcNonChiffree==='function')?_l554NcNonChiffree(getFicheLinesData()):[]; if(_nqA.length){"), iDel=R.indexOf('// 2) Supprimer définitivement les bobines NON figées');
  ok(iA>iST&&iDel>iA&&/if\(_nqA\.length\)\{ try\{ updateCoupeeStatus\(\); \}catch\(_\)\{ \} showToast\('⛔ '\+_l554MsgNonChiffre\(_nqA\),'err'\); try\{ if\(typeof _fichePlanDriftCheck==='function'\) _fichePlanDriftCheck\(\); \}catch\(_\)\{ \} return; \}/.test(R),'RECALCUL (a l application, 1 s plus tard, D-4) : la garde est re-evaluee avant la suppression des bobines — un Dechet pose pendant l attente ne re-produit pas la bobine entiere');
  ok(/let started=false, _r54=null;/.test(fnOf('_l345EditChip'))&&/else if\(!\(_r54&&_r54\.l554\)\) \{ try\{ showToast\('♻ Recalcul non lancé/.test(fnOf('_l345EditChip')),'blur de config : le toast generique ne recouvre pas celui de la garde');
  ok(/else if\(!\(_res&&_res\.l554\)\) \{ showToast\('⚠ Recalcul NON appliqué/.test(fnOf('_applyPlanDriftFix')),'bouton de la barre : idem');
  ok(/if\(!\(_res&&_res\.l554\)\) showToast\('⚠ Recalcul NON appliqué — corrige le point signalé ci-dessus puis re-valide cette référence\.','err'\);/.test(fnOf('applyFicheRefPlanChange')),'✓ VALIDER une reference (multi-ref) : idem (jumeau)');
  ok(/if\(!_res\|\|\(!_res\.started&&!_res\.l554\)\) showToast\('⚠ Recalcul NON appliqué — corrige le point signalé ci-dessus puis reclique « 🔄 Changement plan »/.test(src),'🔄 Changement plan : idem (jumeau)');
  ok(!/_l554Bloque\?'':'<button/.test(D)&&/:'<button class="btn btn-red btn-sm" id="planDriftApplyBtn" onclick="_applyPlanDriftFix\(\)"/.test(D),'le bouton RESTE dans toutes les orientations (regle 3 : portrait = layout historique) — c est le recalcul qui refuse'); }

console.log('── 4. la barre dit POURQUOI (paysage) et OU vont les laizes manquantes, sans promesse fausse ──');
{ const D=fnOf('_fichePlanDriftCheck');
  ok(/const _tt17=String\(\(_l554Bloque\?\['⛔ '\+_l554Bloque\]:\[\]\)\.concat\(drifts\)\.join\(' · '\)\)/.test(D),'l infobulle porte aussi la garde');
  ok(/let _why54=\(_l554Bloque\?\('⛔ '\+esc\(_l554Bloque\)\+' · '\):''\)\+drifts\.join\(' · '\); if\(_why54\.length>280\)\{ _why54=Array\.from\(_why54\)\.slice\(0,280\)\.join\(''\)\.replace\(\/&\[\^;&\]\*\$\/,''\)\+'…'; \}/.test(D)&&/⚠ Le plan a changé<span class="l554-why">'\+_why54\+'<\/span><\/span>/.test(D),'motif (garde + derives) sous le titre, coupe par caracteres sans casser une entite HTML ni un emoji');
  ok(/^\.l554-why\{display:none\}/m.test(src),'CSS de base : motif masque (portrait = layout historique, regle 3)');
  const iMq=src.indexOf('  #ficheRight>#planDriftBanner{flex:none}'), iWhy=src.indexOf('  .l554-why{display:block;font-size:12px;font-weight:400;opacity:.92;margin-top:2px}');
  ok(iMq>0&&iWhy===src.indexOf('\n',iMq)+1&&/^  body\.atelier \.l554-why\{font-size:14px\}/m.test(src),'CSS paysage (>=1100px) : motif visible sous la regle existante de la barre ; 14 px en mode atelier (gants)');
  ok(/const _bloq54=lines\.some\(d=>_l554NqIds\.has\(d\.id\)\); const _libre54=lines\.find\(d=>!d\.coupee&&!_frozenLike\(d\)&&!\(_mvIds19&&_mvIds19\.has\(d\.id\)\)\);/.test(D)&&/\(_bloq54\?' — en attente du chiffrage du défaut':\(_libre54\?\(' → « Appliquer » les répartit sur les bobines non coupées \(ex\. '\+_l554PosDe\(_libre54\.id\)\+' ; une bobine de plus si elles sont pleines\)'\):' → « Appliquer » ajoute une bobine à la fin de cette référence \(les bobines non coupées sont figées par un geste/.test(D)&&/ — ⚠ une bobine retirée volontairement sera recréée'\); needClick=true; \}/.test(D),'message « manque » : « en attente du chiffrage » tant que la garde est active (plus de promesse fausse) ; sinon « repartit sur les bobines non coupees (ex. bobine 2/2 ; une de plus si pleines) » ou « ajoute une bobine a la fin de cette reference » ; avertissement L375 conserve'); }

console.log('── 5. recalcul : barre re-verifiee, exception RELANCEE, toast = ce qui a CHANGE par reference (EXECUTE) ──');
{ const R=fnOf('recalcEcartsFromFiche');
  ok(/else \{ try\{ if\(typeof _fichePlanDriftCheck==='function'\) _fichePlanDriftCheck\(\); \}catch\(e\)\{\} \}   \/\* \[L554 · contre-lecture 22\/10\] tout recalcul re-verifie la barre/.test(R),'sans onApplied (♻ Ecarts, blur de config, changement plan) : la barre est re-verifiee en fin de recalcul (plus de barre perimee)');
  const iCatch=R.indexOf("}catch(e){ console.warn('[recalc] exception :',e);"), iFin=R.indexOf('finally{ _recalcPending=false; }');
  ok(iCatch>0&&iFin>iCatch&&/Recalcul interrompu — ne touche plus à la fiche, recharge la page/.test(R)&&/_el54\.innerHTML='<span style="flex:1;min-width:120px">⚠ Recalcul interrompu — ne touche plus à la fiche, recharge la page<\/span>'; \} \}catch\(_\)\{ \} setTimeout\(function\(\)\{ throw e; \},0\); \}/.test(R),'exception dans le recalcul : toast + barre SANS bouton (fiche a moitie reconstruite), bandeau remis, exception RELANCEE hors du try (capteur de la batterie + mail automatique L332) — jamais avalee');
  ok(/try\{ if\(typeof _fichePlanDriftCheck==='function'\) _fichePlanDriftCheck\(\); \}catch\(e\)\{\}   \/\* \[L554\] jumeau : tout recalcul re-verifie la barre \*\//.test(fnOf('applyFicheRefPlanChange'))&&/if\(!\(window\._l554DernierChg&&window\._l554DernierChg\.length\)\) showToast\('✓ Plan recalculé — '\+rlbl,'ok'\);/.test(fnOf('applyFicheRefPlanChange')),'✓ VALIDER (multi-ref) : son onApplied re-verifie la barre et ne recouvre pas le toast « ce qui a change »');
  ok(!/_l554Added|_n054/.test(R)&&/const _avant54=\{\}; try\{ ficheLines\.forEach\(function\(l\)\{ if\(frozenSet\.has\(l\.id\)\) return; const k=lineKey\(l\); \(_avant54\[k\]=_avant54\[k\]\|\|\[\]\)\.push\(normConf/.test(R)&&R.indexOf('const _avant54={}')<R.indexOf('// 2) Supprimer définitivement les bobines NON figées'),'photo des configs des bobines NON figees prise AVANT la suppression, PAR REFERENCE');
  ok(/_chg54=_l554Diff\(_avant54,_apres54,!!multi\);/.test(R)&&R.indexOf('const _apres54={}')>R.indexOf('renumberFicheLines();')&&/window\._l554DernierChg=_chg54;/.test(R),'apres reconstruction et renumerotation : comparaison par reference via _l554Diff ; memo pour l onApplied de VALIDER');
  ok(/showToast\(head\+\(_chg54\.length\?\(' — '\+_chg54\.slice\(0,3\)\.join\(' · '\)\+\(_chg54\.length>3\?\(' · \+'\+\(_chg54\.length-3\)\+' autre\(s\)'\):''\)\+' — si une de ces bobines était déjà programmée sur la machine, reprogramme-la'\):''\),'ok',_chg54\.length\?10000:undefined\);/.test(R)&&/'♻ Plan mis à jour — bobines déjà coupées conservées\.'/.test(R),'le toast NOMME les changements + consigne « reprogramme-la », 10 s quand quelque chose a change (4 s sinon) ; en-tete neutre');
  ok(/^function showToast\(msg,kind,durOpt\)\{/m.test(src)&&/const dur=\(durOpt>0\)\?durOpt:\(\(kind==='err'\)/.test(src),'showToast accepte une duree explicite (les autres appels sont inchanges : 4 s / 8-14 s)');
  global.normConf=(c)=>String(c||'').replace(/\s+/g,'').toLowerCase(); const DIFF=eval('('+fnOf('_l554Diff')+')');
  const av={A:['52×20+2×15']}, ap={A:[{pos:'bobine 2/2',conf:'56×20 + 2×15',ref:'KX1045-1'}]};
  ok(JSON.stringify(DIFF(av,ap,false))===JSON.stringify(['♻ bobine 2/2 : 56×20 + 2×15 (était 52×20+2×15)']),'EXECUTE mono-ref (cas MR) : « ♻ bobine 2/2 : 56×20 + 2×15 (était …) », rien d ajoute');
  const av2={A:['52×20+2×15'],B:['10×30','10×30']}, ap2={A:[{pos:'bobine 2/3',conf:'52×20 + 2×15',ref:'KX1045-1'},{pos:'bobine 3/3',conf:'4×20',ref:'KX1045-1'}],B:[{pos:'bobine 1/2',conf:'10×30',ref:'DQ1009'},{pos:'bobine 2/2',conf:'10×30',ref:'DQ1009'}]};
  ok(JSON.stringify(DIFF(av2,ap2,true))===JSON.stringify(['➕ KX1045-1 · bobine 3/3 ajoutée : 4×20']),'EXECUTE multi-ref : la reference A gagne une bobine → UN seul message « ➕ KX1045-1 · bobine 3/3 ajoutee » ; la reference B, intacte, n est PAS annoncee changee (une comparaison a plat decalait tout)');
  ok(JSON.stringify(DIFF({A:['10×30','10×30']},{A:[{pos:'bobine 1/1',conf:'10×30',ref:'A'}]},false))===JSON.stringify(['➖ une bobine retirée : 10×30'])&&DIFF(null,null,false).length===0&&DIFF({A:['x']},{},false).length===1,'EXECUTE : une bobine en moins est signalee (« ➖ ») ; donnees absentes → rien, jamais d erreur'); }

console.log('── 6. tap refuse, bouton vert desactive, ✕ Retirer, les 2 lignes d Esteban (22/10) ──');
ok(/setTimeout\(function\(\)\{ try\{ _fichePlanDriftCheck\(\); \}catch\(e\)\{\} \},1300\); \}/.test(fnOf('_applyPlanDriftFix')),'« Recalcul NON applique » (recalcul deja en cours) → la barre est re-verifiee 1,3 s apres (plus de barre rouge figee)');
ok(/_b\.disabled=true; _b\.onclick=null;/.test(fnOf('_applyPlanDriftFix')),'apres le 1er tap, le bouton vert est desactive (un 2e tap declenchait deux toasts rouges)');
ok(/\n  renumberFicheLines\(\);\n  try\{ refreshEtiquetteSolde\(\); \}catch\(e\)\{\}/.test(fnOf('removeFicheLine')),'✕ Retirer rafraichit le resume « N mm conserves » (jumeau du recalcul)');
ok(/try\{ if\(typeof _scheduleDriftCheck==='function'\) _scheduleDriftCheck\(\); \}catch\(e\)\{\} \}   \/\* \[L426\]/.test(fnOf('toggleAction'))&&/\(typeof _bulkRestore==='undefined'\|\|!_bulkRestore\)&&typeof _scheduleDriftCheck==='function'\) _scheduleDriftCheck\(\);/.test(fnOf('updateNC')),'les 2 lignes d Esteban (Claude cloud 22/10) sont reprises : Dechet / chiffrage NC → detecteur replanifie tout de suite (la garde partagee rend ce declenchement precoce SUR)');
{ const calls=[]; global._fichePlanDriftCheck=function(o){ calls.push(o); }; global._driftAutoTimer=null; const realST=setTimeout, realCT=clearTimeout; global.setTimeout=(fn,ms)=>{ fn(); return 1; }; global.clearTimeout=()=>{};
  const SD=eval('('+fnOf('_scheduleDriftCheck')+')'); SD(); global.setTimeout=realST; global.clearTimeout=realCT;
  ok(calls.length===1&&calls[0]===undefined,'_scheduleDriftCheck EXECUTE (inchange, desormais protege) : un seul appel du detecteur, sans autoApply — jamais de recalcul silencieux'); }

console.log('── 7. preuve de bout en bout : smoke « fiche-dechet » (tests/shot.mjs) dans la batterie ET dans la CI ──');
ok(/const v=\(\$\{CHECKS\[scene\]\}\); if\(typeof v==='string'\) return v; return v===true && !document\.getElementById\('bootOverlay'\)/.test(shot)&&/k < 70/.test(shot),'shot.mjs : une CHAINE de diagnostic renvoyee par un CHECK est un ECHEC (avant : !!texte = vrai, la smoke etait verte dans tous les cas) ; 14 s d attente');
ok(/'fiche-dechet': `/.test(shot)&&/makeOrderRow\('150','20'\)/.test(shot)&&/ficheLines\.every\(function\(l\)\{ return _flMachineOf\(l\.id\)==='maveg'; \}\)/.test(shot)&&/nc_casse_/.test(shot)&&/const W=function\(cond,next,label\)/.test(shot)&&!/prevolPop/.test(shot),'scene : MAVEG verifiee, 2 meres 2080, bobine 1 coupee, NC casse (Dechet auto) sans chiffrage, etapes enchainees sur CONDITIONS (plus de pop pre-vol)');
ok(/whyVisible:!!\(why&&getComputedStyle\(why\)\.display==='block'&&why\.getBoundingClientRect\(\)\.height>0\)/.test(shot)&&/window\.__l554\.refus=\{lines:ficheLines\.length, memes:/.test(shot),'scene : motif VISIBLE (style calcule + hauteur), puis tap pendant la garde → le recalcul doit REFUSER (memes bobines, memes configs, toast de la garde)');
ok(/'fiche-dechet': "\(function\(\)\{ const s=window\.__l554/.test(shot)&&/'tap pendant la garde \(le recalcul devait refuser\) : '/.test(shot)&&/manque 4×20/.test(shot)&&/tot\[20\]===154&&tot\[15\]===10/.test(shot)&&/ficheLines\.length!==s\.lines0/.test(shot)&&/const _att='♻ bobine 2\/2 : 56×20 \+ 2×15 \(était 52×20 \+ 2×15\)'; if\(tt\.indexOf\(_att\)<0\) return 'toast : '\+tt;/.test(shot)&&/le toast annonce un ajout/.test(shot),'CHECK : garde vue (bouton + motif), tap refuse, « manque 4×20 » vu, puis Appliquer : barre fermee, TOUJOURS 2 bobines, 154×20 + 10×15, toast « ♻ bobine 2/2 : 56×20 + 2×15 (était 52×20 + 2×15) » sans « ajoutee »');
ok(/for s in plan fiche fiche-start fiche-cut fiche-dechet donnees analyse; do/.test(bat),'la batterie rejoue la scene (etape 7, code de sortie juge)');
ok(/for s in plan fiche fiche-start fiche-cut fiche-dechet donnees analyse; do/.test(ci)&&/Smokes \(7 scenes/.test(ci),'la CI GitHub (jumeau de battery.sh) rejoue aussi la scene');

console.log(fail?('💥 '+fail+'/'+total+' ECHEC(S) DECHET L554'):('🏆 DECHET L554 OK ('+total+' verifications)'));
process.exit(fail?1:0);
