// machine_l523_test.js — [L523 · audit L521 C1/C2 (Esteban 15/09/2026), decision Celine 16/09] GARDE de « MACHINE A CHOISIR »
// sur le poste de pilotage : (C1) ce qui est persiste est la machine CHOISIE ('' si aucune), un brouillon / plan repris sans machine
// reste sur « — choisir — » ; (C2) au changement de client la geometrie repart aux defauts FEBA (bords sauf laize nette L514b, lame
// toujours) et currentMachine='feba'. Tablettes inchangees (repli = machine du poste). Ne couvre pas le rendu navigateur.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
function grab(n){ try{ return eval('('+fnOf(n)+')'); }catch(e){ ok(false,'fonction '+n+' introuvable ('+e.message+')'); return null; } }

global.parseNum=v=>{const n=parseFloat(String(v==null?'':v).replace(',','.'));return isNaN(n)?0:n;};
global.MACHINE_DEFAULTS={feba:{edge:'10',blade:'5'},maveg:{edge:'20',blade:'0'},cevenini:{edge:'20',blade:'0'}};
const SEL=grab('_l523MachineSel'), PERSIST=grab('_l523PersistMachine'), GEOM=grab('_l523GeomFeba');
global._l523MachineSel=SEL; global._l523PersistMachine=PERSIST; global._l523GeomFeba=GEOM;   /* les fonctions DOM extraites resolvent leurs helpers en globales */

console.log('── A. helpers PURS ──');
ok(SEL&&SEL(['','maveg',''])==='maveg','1re machine choisie parmi des selects : [\'\',\'maveg\',\'\'] → maveg');
ok(SEL&&SEL([' ',''])===''&&SEL([])===''&&SEL(null)==='','aucune machine choisie / liste vide / null → \'\' (jamais undefined)');
ok(SEL&&SEL(['feba','maveg'])==='feba','plusieurs machines : la premiere (bloc 1) fait foi pour l etiquette du plan');
ok(PERSIST&&PERSIST('maveg','feba',false)==='maveg','pilotage, machine choisie → persistee telle quelle');
ok(PERSIST&&PERSIST('','feba',false)==='','pilotage, « — choisir — » → \'\' persiste (plus jamais FEBA en silence : C1)');
ok(PERSIST&&PERSIST('','feba',true)==='feba','tablette (poste), select vide → repli du poste INCHANGE');
ok(PERSIST&&PERSIST('cevenini','feba',true)==='cevenini'&&PERSIST(null,'',true)==='','tablette : choix respecte ; repli vide → \'\'');
ok(GEOM&&JSON.stringify(GEOM(false))==='{"edge":"10","blade":"5"}','geometrie provisoire FEBA : bords 10, lame 5');
ok(GEOM&&JSON.stringify(GEOM(true))==='{"edge":null,"blade":"5"}','laize nette saisie (L514b) : bords intacts (null), la lame suit toujours');

console.log('── B. simulation DOM (blocs de reference) ──');
function el(v){ return {value:String(v==null?'':v)}; }
function block(o){ const m={mother:el(o.mother),edge:el(o.edge),blade:el(o.blade),machine:el(o.machine)}; return {els:m,querySelector:s=>{ const k=(s.match(/data-rb="(\w+)"/)||[])[1]; return m[k]||null; }}; }
let blocks=[block({mother:2100,edge:20,blade:0,machine:''}),block({mother:1250,edge:0,blade:0,machine:''})];   /* A : MAVEG tout juste vide par L516 ; B : laize nette saisie (bords 0) */
global.document={querySelectorAll:sel=>{ if(sel==='#refBlocks .ref-block') return blocks; if(sel==='#refBlocks [data-rb="machine"]') return blocks.map(b=>b.els.machine); return []; }};
global._l514NetTyped=grab('_l514NetTyped');
global._l363DefaultMachine=()=>'';
global.currentMachine='maveg';
const PROV=grab('_l523GeomProvisoire'), PLANM=grab('_l523PlanMachine');
if(PROV) PROV();
ok(blocks[0].els.edge.value==='10'&&blocks[0].els.blade.value==='5','C2 : bloc A (ex-MAVEG 20/0) → bords 10, lame 5');
ok(blocks[1].els.edge.value==='0'&&blocks[1].els.blade.value==='5','C2 : bloc B laize nette (mere 1250, bords 0) → bords INTACTS, lame 5 (L514b/c)');
ok(global.currentMachine==='feba','C2 : currentMachine repasse a feba (repli interne = ce que le libelle promet)');
ok(blocks[0].els.machine.value===''&&blocks[1].els.machine.value==='','C2 : les selects machine ne sont pas re-remplis (E6 « MACHINE A CHOISIR » reste affiche)');
ok(PLANM&&PLANM()==='','C1 : pilotage, aucun select choisi → plan.machine = \'\'');
blocks[1].els.machine.value='maveg';
ok(PLANM&&PLANM()==='maveg','C1 : une machine choisie sur un bloc → persistee (ici bloc 2, bloc 1 vide)');
blocks[1].els.machine.value=''; global._l363DefaultMachine=()=>'feba'; global.currentMachine='feba';
ok(PLANM&&PLANM()==='feba','tablette FEBA, selects vides → repli du poste inchange (E5 / _l376PostMachineSwap)');

console.log('── C. cablage dans index.html ──');
const sfs=(()=>{ try{ return fnOf('serializeFicheState'); }catch(e){ return ''; } })();
ok(/plan:\{machine:_l523PlanMachine\(\),mother:/.test(sfs),'serializeFicheState persiste _l523PlanMachine() (plus jamais currentMachine brut)');
const srg=(()=>{ try{ return fnOf('serializeRefGroups'); }catch(e){ return ''; } })();
ok(/machine:_l523PersistMachine\(\(\(_blks20\[i\]&&_blks20\[i\]\.querySelector\('\[data-rb="machine"\]'\)\)\|\|\{\}\)\.value,g\.machine,/.test(srg),'serializeRefGroups persiste la machine du SELECT du bloc (\'\' sur pilotage sans choix), pas le repli l.8117');
const occ=(()=>{ try{ return fnOf('onClientChange'); }catch(e){ return ''; } })();
const iGeom=occ.indexOf('_l523GeomProvisoire();'), iRz=occ.indexOf("_rz++; } });"), iRecalc=occ.indexOf('recalcPlan();');
ok(iGeom>0&&iRz>0&&iGeom>iRz,'onClientChange : la geometrie est remise APRES le vidage des selects (meme branche pilotage L516)');
ok(iGeom>0&&iRecalc>0&&iGeom<iRecalc,'onClientChange : … et AVANT recalcPlan() (aucun premier rendu avec la machine du client precedent)');
const dl=(()=>{ try{ return fnOf('doLoad'); }catch(e){ return ''; } })();
ok(/if\(!s\.machine\) _l523SansMachine\(\);/.test(dl),'doLoad : plan enregistre sans machine → repli interne feba, selects VIDES sur le pilotage');
const rfs=(()=>{ try{ return fnOf('restoreFicheState'); }catch(e){ return ''; } })();
ok(/if\(!st\.plan\.machine\) _l523SansMachine\(\);/.test(rfs),'restoreFicheState : brouillon sans machine → selects VIDES (la machine de l ecran precedent ne colle plus au brouillon repris)');
{ /* helper _l523SansMachine : pilotage = repli feba + selects vides ; tablette = no-op */
  const SM=grab('_l523SansMachine'); blocks[0].els.machine.value='maveg'; global._l363DefaultMachine=()=>''; global.currentMachine='maveg';
  ok(SM&&SM()===true&&blocks[0].els.machine.value===''&&global.currentMachine==='feba','_l523SansMachine (pilotage) : select vide, currentMachine=feba');
  /* [L524] tablette MAVEG : les selects portent deja la machine du POSTE (applyRole) ; un plan persiste SANS machine doit repartir en
     FEBA implicite (selects 'feba' + selectMachine('feba')) pour que _l376PostMachineSwap le voie et applique les reglages du poste */
  blocks[0].els.machine.value='maveg'; global._l363DefaultMachine=()=>'maveg'; global.currentMachine='maveg'; global.__sm=[]; global.selectMachine=m=>{ global.__sm.push(m); global.currentMachine=m; };
  ok(SM&&SM()===false&&blocks[0].els.machine.value==='feba'&&global.__sm.join(',')==='feba','_l523SansMachine (tablette) : selects remis sur feba + selectMachine(feba) → le filet du poste (_vals[0]!==_post) s applique ensuite (L524)');
}
ok(/const rk=_cliQKey\(_refIdKey\(_x\),_x\.machine\|\|'feba'\);/.test(src),'restoreFicheState : la cle ref¦machine lit le vide persiste comme le repli feba des groupes vivants (L524, R3)');
const ds=(()=>{ try{ return fnOf('doSave'); }catch(e){ return ''; } })();
ok(/rows:rows,machine:\(\(refGroups\[0\]&&refGroups\[0\]\.machine\)\|\|''\),/.test(ds)&&!/machine:\(refGroups\[0\]&&refGroups\[0\]\.machine\)\|\|currentMachine,/.test(ds),'doSave : \'\' quand aucune machine (Donnees > Plans ne re-remplit plus FEBA)');
ok(!/selectMachine\(_lastM\|\|'feba'\);/.test(src)&&!/_lastM/.test(src)&&/selectMachine\('feba'\); document\.querySelectorAll\('#refBlocks \[data-rb="machine"\]'\)\.forEach\(el=>\{el\.value='';\}\);/.test(src),'boot : plus de « derniere machine » pre-remplie (E1) ; selects vides, repli feba, tablette servie a la connexion (L363 B3)');
ok(/if\(st\.plan\.machine\) selectMachine\(st\.plan\.machine\); else currentMachine='feba';/.test(src),'restoreFicheState : la ligne L516 est conservee (marqueur 2219) — elle devient EFFECTIVE grace a C1');
ok(/const _net=_l514NetTyped\(block\); const e=block\.querySelector\('\[data-rb="edge"\]'\); if\(e&&!_net\) e\.value=d\.edge;/.test(src),'L514c (propagation L511) intacte');

console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 MACHINE L523 OK : '+total+' verifications'));
process.exit(fail?1:0);
