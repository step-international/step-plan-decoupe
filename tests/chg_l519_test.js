// chg_l519_test.js — [L519 · demandes Esteban 15/09/2026] GARDE de deux regles d ecran :
// 1. _l519ChgEtat (pure) : la pastille « 🔧 CHANGEMENT EN COURS » s eteint L519_CHG_OFF_MS apres « ✓ Valide »
//    (coche + non valide = allumee ; validee depuis < delai = allumee ; validee depuis >= delai = eteinte ; non cochee = eteinte).
// 2. _l519PreselIni : les initiales du compte connecte ne sont PRE-COCHEES que pour un compte OPERATEUR — un compte
//    admin/pilotage sur une tablette partagee laisse l operateur toucher SES initiales (enquete Taieb : fiches FEBA signees ER).
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i);let d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
const mD=src.match(/^const L519_CHG_OFF_MS=(\d+);/m); if(!mD) throw new Error('introuvable L519_CHG_OFF_MS');
const DELAI=+mD[1];
const ETAT=eval('('+fnOf('_l519ChgEtat')+')');
const PRESEL=eval('('+fnOf('_l519PreselIni')+')');
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

console.log('── 1. delai ──');
ok(DELAI===5000,'delai unique = 5000 ms (constante lue dans le code) → '+DELAI);
console.log('── 2. pastille CHANGEMENT EN COURS ──');
{
  const T=1_000_000;
  ok(ETAT(false,false,0,T,DELAI)===false,'case non cochee → eteinte');
  ok(ETAT(true,false,0,T,DELAI)===true,'cochee, pas encore validee → allumee');
  ok(ETAT(true,true,T-1000,T,DELAI)===true,'validee depuis 1 s → encore allumee');
  ok(ETAT(true,true,T-4999,T,DELAI)===true,'validee depuis 4,999 s → encore allumee');
  ok(ETAT(true,true,T-5000,T,DELAI)===false,'validee depuis 5 s → ETEINTE (>= delai)');
  ok(ETAT(true,true,T-60000,T,DELAI)===false,'validee depuis 1 min → eteinte');
  ok(ETAT(true,true,0,T,DELAI)===false,'validee sans horodatage (cas inconnu) → eteinte, jamais allumee pour toujours');
  ok(ETAT(true,true,undefined,T,DELAI)===false,'validee, horodatage absent → eteinte');
  ok(ETAT(false,true,T-1000,T,DELAI)===false,'decochee apres validation → eteinte');
  ok(ETAT(true,false,T-60000,T,DELAI)===true,'re-touchee apres validation (chg-ok retire) → rallumee, quel que soit l horodatage');
}
console.log('── 3. pre-selection des initiales ──');
{
  global.currentRole='operateur'; ok(PRESEL()===true,'compte operateur (JF, TB, MR) → initiales pre-cochees');
  global.currentRole='admin'; ok(PRESEL()===false,'compte admin (ER, CH) sur une tablette → RIEN de pre-coche : l operateur touche ses initiales');
  global.currentRole='pilotage'; ok(PRESEL()===false,'compte pilotage (DC) → rien de pre-coche');
  global.currentRole=undefined; ok(PRESEL()===false,'role inconnu → rien de pre-coche (fail-closed)');
  delete global.currentRole;
}
console.log('── 4. cablage ──');
ok(/const chg=\(typeof _l519ChgPill==='function'\)\?_l519ChgPill\(\):/.test(src),'renderFicheHeadPills lit _l519ChgPill (delai) et non plus la case brute');
ok(/const on=\(typeof _l519ChgPill==='function'\)\?_l519ChgPill\(\):_l79ChgActive\(\);/.test(src),'le bouton 🔧 Changements suit la meme regle que la pastille');
ok(/if\(sec\) sec\.classList\.add\('chg-ok'\);\s*\n\s*try\{ _l519ChgDone\(kind\); \}catch\(e\)\{\}/.test(src),'✓ Valide horodate le changement et programme l extinction');
ok((src.match(/if\(currentUser&&currentUser\.ini&&_l519PreselIni\(\)\)\{/g)||[]).length===2,'les DEUX sites de pre-selection (applyRole + reset de fiche) passent par _l519PreselIni');
ok(/c\.addEventListener\('change',function\(\)\{\s*\n[^\n]*\n[^\n]*\n\s*try\{ _l435ChgTouch\(id==='fLameChg'\?'lame':\(id==='fMachChg'\?'mach':'op2'\)\); \}catch\(e\)\{\}/.test(src),'(de)cocher une case = retouche : chg-ok et horodatage purges (passe adverse : case re-cochee restait eteinte)');
ok(/delete window\._l519ChgOkAt\[kind==='lame'\?'fLameChg':\(kind==='mach'\?'fMachChg':'fOp2Active'\)\]/.test(src),'_l435ChgTouch purge l horodatage du ✓ precedent');
ok(!/if\(currentUser&&currentUser\.ini\)\{\s*\n\s*(const h=document\.getElementById\('fInitiales'\);if\(h\)h\.value=currentUser\.ini;|document\.getElementById\('fInitiales'\)\.value=currentUser\.ini;)/.test(src),'plus aucune pre-selection sans garde de role');

console.log((fail?'\n💥 '+fail+' echec(s)':'\n🏆 chg_l519 OK')+' — '+total+' verifications');
process.exit(fail?1:0);
