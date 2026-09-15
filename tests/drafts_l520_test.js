// drafts_l520_test.js — [L520 · demande Esteban 15/09/2026] GARDE de la visibilite des brouillons (Donnees > Brouillons) :
// « les comptes feba, maveg, cevenini n ont acces qu aux brouillons de ces trois utilisateurs ; ils ne voient pas les brouillons
// d Esteban, de Dominique… ». _l520DraftVisible(d, ctx) est PURE : admin/pilotage voient tout ; un operateur (personnel ou
// compte machine) voit les brouillons crees sur un POSTE machine (ownerPost) et les siens (ownerUid / owner = ses initiales).
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i);let d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
const VIS=eval('('+fnOf('_l520DraftVisible')+')');
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

const FEBA={manage:false,uid:'uid-feba',ini:''};          // compte machine feba@ (ini vide)
const JF={manage:false,uid:'uid-jf',ini:'JF'};            // operateur personnel
const ADMIN={manage:true,uid:'uid-er',ini:'ER'};
const dFeba={id:'d1',owner:'TB',ownerPost:'FEBA',ownerUid:'uid-feba'};
const dMaveg={id:'d2',owner:'JF',ownerPost:'MAVEG',ownerUid:'uid-maveg'};
const dCev={id:'d3',owner:'?',ownerPost:'CEVENINI',ownerUid:'uid-cev'};
const dEsteban={id:'d4',owner:'ER',ownerPost:'',ownerUid:'uid-er'};
const dDominique={id:'d5',owner:'DC',ownerUid:'uid-dc'};
const dJfPerso={id:'d6',owner:'JF',ownerPost:'',ownerUid:'uid-jf'};
const dLegacyFeba={id:'d7',owner:'?',ownerUid:'uid-feba'};   // ancien brouillon du poste FEBA sans ownerPost
const dLegacyNoOwner={id:'d8'};

console.log('── 1. tablette machine (feba@) ──');
ok(VIS(dFeba,FEBA)===true,'brouillon cree sur FEBA → visible');
ok(VIS(dMaveg,FEBA)===true,'brouillon cree sur MAVEG → visible (passation entre tablettes)');
ok(VIS(dCev,FEBA)===true,'brouillon cree sur CEVENINI (sans initiales) → visible');
ok(VIS(dEsteban,FEBA)===false,'brouillon d Esteban (bureau) → INVISIBLE');
ok(VIS(dDominique,FEBA)===false,'brouillon de Dominique → INVISIBLE');
ok(VIS(dJfPerso,FEBA)===false,'brouillon de JF sur son compte personnel → invisible sur la tablette (pas un poste machine, pas le meme compte)');
ok(VIS(dLegacyFeba,FEBA)===true,'ancien brouillon du MEME compte machine (ownerUid) → visible');
ok(VIS(dLegacyNoOwner,FEBA)===false,'brouillon sans aucune identite → invisible pour un operateur (fail-closed)');
const dSoldeAdmin={id:'d_solde_F123',owner:'ER',ownerPost:'',ownerUid:'uid-er',fromFicheId:'F123'};
ok(VIS(dSoldeAdmin,FEBA)===true,'SOLDE manque-matiere parque depuis un compte non machine (tablette sous compte admin, L519) → RESTE visible a l atelier (passe adverse)');
ok(VIS({id:'d_solde_F9',owner:'DC'},FEBA)===true,'solde legacy sans fromFicheId mais id d_solde_ → visible');
ok(VIS({id:'d1',owner:'ER',fromFicheId:'F5'},JF)===true,'solde vu par un operateur personnel → visible');
console.log('── 2. operateur personnel (JF) ──');
ok(VIS(dJfPerso,JF)===true,'son propre brouillon (ownerUid) → visible');
ok(VIS({id:'d9',owner:'JF'},JF)===true,'son brouillon legacy (owner = ses initiales) → visible');
ok(VIS(dMaveg,JF)===true,'brouillon d un poste machine → visible');
ok(VIS(dEsteban,JF)===false,'brouillon d Esteban → invisible');
console.log('── 3. admin / pilotage ──');
[dFeba,dMaveg,dCev,dEsteban,dDominique,dJfPerso,dLegacyFeba,dLegacyNoOwner].forEach(d=>ok(VIS(d,ADMIN)===true,'admin voit tout : '+d.id));
ok(VIS(dEsteban,{manage:true,uid:'uid-dc',ini:'DC'})===true,'pilotage (Dominique) voit le brouillon d Esteban');
console.log('── 4. robustesse ──');
ok(VIS(null,FEBA)===false,'brouillon null → false, pas d exception');
ok(VIS(dFeba,undefined)===true,'contexte absent : ownerPost suffit (regle 1) → visible');
ok(VIS({owner:'ER',ownerUid:'anon'},{manage:false,uid:'anon',ini:''})===false,'uid « anon » des deux cotes ne fait JAMAIS une identite commune');
console.log('── 5. cablage ──');
ok(/const _l520c=_l520DraftCtx\(\);/.test(src)&&/\.filter\(function\(d\)\{ return _l520DraftVisible\(d,_l520c\); \}\)/.test(src),'renderDrafts filtre l AFFICHAGE avec le contexte du compte connecte');
ok(!/^function loadDrafts\(\)\{[^\n]*_l520DraftVisible/m.test(src),'loadDrafts (source de persistDrafts) n est PAS filtree — filtrer la source aurait supprime les brouillons caches a la reecriture');

console.log((fail?'\n💥 '+fail+' echec(s)':'\n🏆 drafts_l520 OK')+' — '+total+' verifications');
process.exit(fail?1:0);
