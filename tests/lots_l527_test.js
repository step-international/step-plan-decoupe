// lots_l527_test.js — [L527 · incident Celine 17/09/2026, commande REINAL] GARDE « deux references de MEME NOM et MEME CONTENU = deux
// references distinctes partout » : (A) rang de lot dans l identite (_refIdKey « ¦#N », pose par _l527AssignLots sur les blocs PRODUCTIFS
// en collision seulement ; cle byte-identique sinon) ; (B) archives anterieures (cle ambigue) resolues par l INDEX et TRACEES ;
// (C) matiere L513 : deux seaux -> le solde de CHAQUE reference est une chute gardee ; (D) filtres par cle ; (E) cablage.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
function grab(n){ try{ return eval('('+fnOf(n)+')'); }catch(e){ ok(false,'fonction '+n+' introuvable ('+e.message+')'); return null; } }
const near=(a,b,eps)=>typeof a==='number'&&Math.abs(a-b)<=(eps==null?0.6:eps);
global.MAX_USEFUL_MM=4000; global.MAX_BLADE_MM=20;
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.parseNum=eval('('+fnOf('parseNum')+')');
global.parseConf=eval('('+fnOf('parseConf')+')');
global.calcStats=eval('('+fnOf('calcStats')+')');
global.clampUseful=eval('('+fnOf('clampUseful')+')');
global.clampBlade=eval('('+fnOf('clampBlade')+')');
global._refIdKey=eval('('+fnOf('_refIdKey')+')');
global._refKeyOf=eval('('+fnOf('_refKeyOf')+')');
global._refMatchFn=eval('('+fnOf('_refMatchFn')+')');
global._cliQKey=eval('('+fnOf('_cliQKey')+')');
global._l507Traced=new WeakSet();
let warns=[]; global._l505Warn=function(w,e){ warns.push(String(w)); };
global._l507GroupUseful=eval('('+fnOf('_l507GroupUseful')+')');
global._l507KeyOf=eval('('+fnOf('_l507KeyOf')+')');
global._l506RefGroupFor=eval('('+fnOf('_l506RefGroupFor')+')');
global._l505HorsPlan=eval('('+fnOf('_l505HorsPlan')+')');
global.ncLoss=eval('('+fnOf('ncLoss')+')');
const M=eval('('+fnOf('_l513Matiere')+')');
const ASSIGN=grab('_l527AssignLots'), LOT=grab('_l527Lot'), LBL=grab('_l527LotLbl'); global._l527Lot=LOT; global._l527AssignLots=ASSIGN;
const REF='41312809 - TacFlex® KX1045-1';
const G=(x)=>Object.assign({ref:REF,film:'',veka:'',longueur:'250',mother:2100,edge:10,useful:2090,blade:5,machine:'feba',rows:[{width:500,qty:4}],chutes:[],recuts:[]},x||{});

console.log('── A. identite : rang de lot SEULEMENT en cas de collision de contenu ──');
const base=_refIdKey(G());
ok(base==='41312809 - tacflex® kx1045-1¦¦¦250¦2090¦5','cle de base byte-identique a aujourd hui (sans lot) → '+base);
ok(_refIdKey(G({lot:2}))===base+'¦#2','lot 2 → 7e segment « ¦#2 »');
ok(_refIdKey(G({lot:0}))===base&&_refIdKey(G({lot:null}))===base,'lot 0 / null → aucun segment');
{ const gs=[G(),G()]; const out=ASSIGN?ASSIGN(gs):null;
  ok(out===gs&&gs[0].lot===1&&gs[1].lot===2,'deux blocs REINAL identiques → lots 1 et 2 (ordre des blocs)');
  ok(_refIdKey(gs[0])!==_refIdKey(gs[1])&&_refIdKey(gs[1]).endsWith('¦#2'),'cles DISTINCTES → deux identites, deux seaux, deux bandes'); }
{ const gs=[G(),G({ref:'AUTRE'})]; if(ASSIGN) ASSIGN(gs); ok(gs[0].lot==null&&gs[1].lot==null&&_refIdKey(gs[0])===base,'deux references differentes → aucun lot, cle inchangee'); }
{ const gs=[G({rows:[]}),G()]; if(ASSIGN) ASSIGN(gs); ok(gs[0].lot==null&&gs[1].lot==null&&_refIdKey(gs[1])===base,'bloc-stub sans ligne + bloc rempli → aucune collision (regle L156 #6), cle de la ref remplie inchangee'); }
{ const gs=[G(),G(),G()]; if(ASSIGN) ASSIGN(gs); ok(gs.map(g=>g.lot).join(',')==='1,2,3','trois blocs identiques → 1,2,3'); }
{ const gs=[G({lot:2}),G({ref:'AUTRE',lot:1})]; if(ASSIGN) ASSIGN(gs); ok(gs[0].lot==null&&gs[1].lot==null,'un lot perime (plus de collision) est EFFACE au recalcul'); }
ok(LOT&&LOT(base+'¦#2')===2&&LOT({refKey:base+'¦#1'})===1&&LOT({lot:3})===3&&LOT({})===0&&LOT('')===0&&LOT(null)===0,'_l527Lot : chaine « ¦#N », objet refKey / lot, sinon 0');
ok(LBL&&LBL({lot:2})===' (réf 2)'&&LBL({})===''&&LBL(base)==='','_l527LotLbl : « (réf N) » (mot de Celine : ref 1 / ref 2, pas « lot »), vide sinon');
ok(_refIdKey(G({machine:'maveg',edge:20,useful:2080,blade:0}))===_refIdKey(G({machine:'cevenini',edge:20,useful:2080,blade:0})),'MAVEG / CEVENINI meme geometrie, sans lot → meme cle (pm130 inchange)');

console.log('── B. archives : cle portee par PLUSIEURS groupes → l index tranche, TRACE ──');
const rgNew=[G({lot:1}),G({lot:2})]; const K1=_l507KeyOf(rgNew[0]), K2=_l507KeyOf(rgNew[1]);
ok(K1!==K2&&K2.endsWith('¦#2'),'_l507KeyOf recompose la cle suffixee des archives L527');
warns=[]; const fNew={refGroups:rgNew};
ok(_l506RefGroupFor(fNew,{refIdKey:K2,refIdx:1,ref:REF})===rgNew[1]&&_l506RefGroupFor(fNew,{refIdKey:K1,refIdx:0,ref:REF})===rgNew[0]&&warns.length===0,'lots persistes : resolution par IDENTITE, 0 trace');
const rgOld=[G(),G()]; const K=_l507KeyOf(rgOld[0]); const fOld={refGroups:rgOld};
warns=[]; ok(_l506RefGroupFor(fOld,{refIdKey:K,refIdx:1,ref:REF})===rgOld[1]&&warns.length===1&&warns[0]==='ref·identite-ambigue','archive ANCIENNE (cle ambigue) : la ligne refIdx=1 → groupe 1 + 1 trace « ref·identite-ambigue » (regle 7)');
warns=[]; ok(_l506RefGroupFor(fOld,{refIdKey:K,ref:REF})===rgOld[0]&&warns.length===1,'archive ancienne sans refIdx → 1er groupe + 1 trace (plus jamais un « premier trouve » muet)');
warns=[]; ok(_l506RefGroupFor(fOld,{refIdKey:K,refIdx:5,ref:REF})===rgOld[0]&&warns.length===1,'index hors des groupes de meme cle → 1er groupe + trace');
warns=[]; const rgU=[G(),G({ref:'AUTRE'})]; const KU=_l507KeyOf(rgU[0]);
ok(_l506RefGroupFor({refGroups:rgU},{refIdKey:KU,refIdx:1,ref:REF})===rgU[0]&&warns.length===0,'cle unique : identite avant index, 0 trace (L507 inchange)');

console.log('── C. matiere L513 : deux seaux → le solde de CHAQUE reference est une chute gardee ──');
const L=(conf,g,idx)=>({conf,coupee:true,refIdx:idx,ref:REF,refIdKey:_l507KeyOf(g),useful:2090,blade:5});
{ warns=[]; const rg=[G({lot:1}),G({lot:2})];
  const f={refGroups:rg,useful:'2090 / 2090',blade:'5 / 5',longueur:'250 / 250',ficheDetail:[L('4x500',rg[0],0),L('2x500',rg[0],0),L('4x500',rg[1],1),L('2x500',rg[1],1)]};
  const m=M(f);
  ok(m.ok===true&&near(m.chutesM2,542.5)&&near(m.perteM2,57.5)&&warns.length===0,'deux lots : chutes 542,5 (solde des DEUX) · perte 57,5 · ok · 0 trace → '+m.chutesM2+' / '+m.perteM2+' / '+warns.length);
  ok(near(m.perteM2+m.chutesM2+m.dechetM2+m.clientM2,m.m2Coupes,0.6),'invariant perte + chutes + dechet + client = m² coupes'); }
{ warns=[]; const rg=[G(),G()]; const K0=_l507KeyOf(rg[0]);
  const f={refGroups:rg,useful:'2090 / 2090',blade:'5 / 5',longueur:'250 / 250',ficheDetail:[{conf:'4x500',coupee:true,refIdx:0,ref:REF,refIdKey:K0,useful:2090,blade:5},{conf:'2x500',coupee:true,refIdx:0,ref:REF,refIdKey:K0,useful:2090,blade:5},{conf:'4x500',coupee:true,refIdx:1,ref:REF,refIdKey:K0,useful:2090,blade:5},{conf:'2x500',coupee:true,refIdx:1,ref:REF,refIdKey:K0,useful:2090,blade:5}]};
  const m=M(f);
  ok(m.ok===true&&near(m.chutesM2,542.5)&&near(m.perteM2,57.5)&&warns.length>=1,'archive ANCIENNE (cle ambigue, refIdx presents) : memes chiffres via l index, TRACEE → '+m.chutesM2+' / '+m.perteM2+' / '+warns.length+' trace(s)'); }
{ warns=[]; const rg=[G(),G()];
  const f={refGroups:rg,ficheDetail:[{conf:'20x55',useful:1240,blade:0,coupee:true,ref:REF}]};
  const m=M(f); ok(m.ok===false&&m.perteM2===null&&warns.length>=1,'matiere_l513 bloc 5 conserve : homonymes SANS identite ni index → ok=false, trace'); }

console.log('── D. filtres par cle ──');
{ const rg=[G({lot:1}),G({lot:2})]; const lines=[L('4x500',rg[0],0),L('2x500',rg[0],0),L('4x500',rg[1],1),L('2x500',rg[1],1)];
  ok(lines.filter(_refMatchFn(_l507KeyOf(rg[1]),nrm(REF))).length===2,'_refMatchFn(cle du lot 2) → 2 lignes sur 4 (rail, cartes, compteurs par lot)');
  ok(_cliQKey(_l507KeyOf(rg[0]),'feba')!==_cliQKey(_l507KeyOf(rg[1]),'feba'),'cumul client : deux cles (les commandes des deux lots ne sont plus sommees)'); }

console.log('── E. cablage ──');
ok(/return _l527AssignLots\(groups\);/.test(fnOf('getRefGroups')),'getRefGroups pose les lots (ordre DOM)');
ok(/\.\.\.\(g\.lot>0\?\{lot:g\.lot\}:\{\}\), \.\.\.\(\(_blks20\[i\]&&_blks20\[i\]\.dataset\.lotOk==='1'\)\?\{lotOk:true\}:\{\}\),/.test(fnOf('serializeRefGroups')),'serializeRefGroups persiste lot / lotOk (cles absentes sinon)');
ok(/if\(g&&g\.lotOk\) _b20\[i\]\.dataset\.lotOk='1'; else delete _b20\[i\]\.dataset\.lotOk;/.test(fnOf('restoreRefGroups')),'restoreRefGroups restaure lotOk');
ok(/delete b\.dataset\.laizeOk; delete b\.dataset\.lotOk;/.test(fnOf('resetAll')),'resetAll efface lotOk');
ok((src.match(/refIdKey:_refIdKey\(c\), refIdx:ci,/g)||[]).length===6,'refIdx pose sur les 6 points de creation (4 import + 2 recalcul) → '+(src.match(/refIdKey:_refIdKey\(c\), refIdx:ci,/g)||[]).length);
ok(/l\.refIdKey=_refIdKey\(c\); l\.refIdx=ci; if\(!l\.machine&&c\.machine\)/.test(fnOf('recalcEcartsFromFiche')),'refIdx resynchronise au re-attachement des figees');
ok(/if\(typeof l\.refIdx==='number'&&computed\[l\.refIdx\]&&_pool\.indexOf\(refKey\(computed\[l\.refIdx\]\)\)>=0\) return refKey\(computed\[l\.refIdx\]\);/.test(fnOf('recalcEcartsFromFiche')),'lineKey : entre candidats de meme prefixe d identite (ou sans cle), l INDEX du bloc tranche');
ok(/^function dupRefKeepLots\(di\)\{/m.test(src)&&/onclick="dupRefKeepLots\('\+di\+'\)"/.test(src),'banniere doublons : 3e issue « Garder les 2 references »');
ok(/if\(list\.every\(bl=>bl\.dataset\.lotOk==='1'\)\) return;/.test(fnOf('mergeDuplicateRefBlocks')),'un groupe arbitre « 2 references » n est plus bloquant');
{ const b=src.indexOf('function buildPlanPrintHTML('), e=src.indexOf('function getPlanHTML('); ok(b>0&&e>b&&!/_l527Lot/.test(src.slice(b,e)),'papier : buildPlanPrintHTML sans « (réf N) » (aucun changement de format)'); }
ok(!/_l497RefLbl=c0=>\{[^\n]*_l527/.test(src),'libelles BOB non suffixes (persistes, parses par _l507MatchRefByLabel)');
console.log('── F. revue adverse 18/09 : rang COLLANT (nom + film + veka + metrage + machine), jamais entre deux machines ──');
{ const gs=[G({machine:'maveg',edge:20,useful:2080,blade:0}),G({machine:'cevenini',edge:20,useful:2080,blade:0})]; if(ASSIGN) ASSIGN(gs);
  ok(gs[0].lot==null&&gs[1].lot==null&&_refIdKey(gs[0])===_refIdKey(gs[1]),'meme reference scindee MAVEG + CEVENINI (meme contenu, cas reel L130/L286) → AUCUN rang : une seule reference, continuite RESTE-NN de L298 intacte'); }
{ const gs=[G({useful:2085,mother:2095}),G()]; if(ASSIGN) ASSIGN(gs);
  ok(gs[0].lot===1&&gs[1].lot===2&&_refIdKey(gs[0]).endsWith('¦2085¦5¦#1')&&_refIdKey(gs[1]).endsWith('¦2090¦5¦#2'),'deux references de meme nom sur la meme machine, laizes MESUREES differentes → « réf 1 / réf 2 » CONSERVES (avant : le rang tombait des la 1re laize tapee) → '+_refIdKey(gs[0])); }
{ const gs=[G({longueur:'400'}),G()]; if(ASSIGN) ASSIGN(gs); ok(gs[0].lot==null&&gs[1].lot==null,'twins L497 de metrages differents → pas de rang (le metrage les distingue deja)'); }
{ const gs=[G({film:'mat'}),G()]; if(ASSIGN) ASSIGN(gs); ok(gs[0].lot==null&&gs[1].lot==null,'meme nom, films differents → pas de rang'); }
ok(/if\(_ph\.length===1\) return _ph\[0\];/.test(fnOf('recalcEcartsFromFiche')),'lineKey : le PREFIXE d identite tranche quand il est discriminant (correctif L103 intact), l index seulement entre candidats de meme prefixe');
ok(/'ref·identite-ambigue':'deux références de même contenu/.test(src),'cause lisible dans « Fiches à vérifier » pour la trace ref·identite-ambigue (plus de jargon)');
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 LOTS L527 OK : '+total+' verifications'));
process.exit(fail?1:0);
