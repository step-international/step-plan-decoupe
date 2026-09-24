// pkg_l534_test.js — [L534 · signalement JF 21/09/2026, verifie par Celine avec l atelier → L537 · 24/09/2026] la regle VEKA est ecrite
// PAR reference et par impression et les anciens textes (3 versions) sont migres. Depuis L537 ni la regle ni la table de migration
// ne sont dans le fichier public : le CONTENU (8 lignes VEKA, 5 anciennes notes) se controle en prive sur Firestore
// (config/clients, config/refs). Ici : l expression _dejaKx de applyPackagingRules (la ligne automatique « Film KX detecte »
// ne doit JAMAIS sortir quand la note parle deja de KX + cerclage) et la migration, sur la regle FICTIVE « VEKA TEST ».
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','referentiel_test.json'),'utf8'));
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const mD=src.match(/var _dejaKx=([^;]+);/); if(!mD) throw new Error('introuvable _dejaKx'); const DEJAKX=new Function('rules','return '+mD[1]+';');
const MIG=eval('('+fnOf('_migrateOldNotes')+')');
const V=FIX.pkgClients['VEKA TEST']; const L=(V.notes||'').split('\n');
console.log('── 1. forme d une regle « par reference et par impression » (fixture VEKA TEST, meme convention que la regle reelle) ──');
ok(L.length===8&&L.slice(3).every(l=>/: bob\/pile cerclée \d+mm=/.test(l)),'8 lignes ; chaque ligne de chiffres porte son unite (« bob/pile cerclee »)');
ok(!/KX1075\/1006-1/.test(V.notes)&&!/PAS de cerclage/.test(V.notes),'aucune ligne fusionnee « (KX1075/1006-1) » ni « PAS de cerclage » : seules les laizes CERCLEES sont ecrites');
console.log('── 2. la ligne automatique « Film KX detecte → cerclage automatique » ne doit JAMAIS sortir quand la note le dit deja ──');
ok(DEJAKX(V)===true,'la note parle de KX + cerclage → la ligne automatique ne s ajoute pas');
ok(DEJAKX({cerclage:V.cerclage,notes:'⚡ SPÉCIFICITÉ : NE PAS filmer.'})===false,'controle : sans « KX » ni « cercl » dans la note, l expression rend faux');
console.log('── 3. migration des anciens textes (mecanisme, textes fictifs ; les 3 anciennes notes VEKA reelles vivent dans config/refs) ──');
const OLD1='⚡ SPÉCIFICITÉ TEST : ancienne regle 1.', OLD2='⚡ SPÉCIFICITÉ TEST : ancienne regle 2 (jumeau).', OLD3='ancienne regle 3 (origine)';
global._OLD_NOTES=[{o:OLD1,n:V.notes},{o:OLD2,n:V.notes},{o:OLD3,n:V.notes}];
ok(MIG(OLD1)===V.notes&&MIG(OLD2)===V.notes&&MIG(OLD3)===V.notes,'les trois anciens textes → la regle actuelle (papier, PDF, planning, rechargement)');
ok(MIG(OLD1+'\nattention palette 2')===V.notes+'\nattention palette 2','une ligne ajoutee a la main APRES l ancienne note est conservee');
ok(MIG('NE PAS filmer. Bob/pile cerclée (KX1075/1006-1) : 40mm=4')==='NE PAS filmer. Bob/pile cerclée (KX1075/1006-1) : 40mm=4','un texte retouche a la main (prefixe different) n est JAMAIS denature');
ok(MIG(V.notes)===V.notes,'la regle actuelle est stable (pas de double migration)');
console.log('── 4 bis. la commande EN COURS : tablette, reprise de brouillon, clients B/C/D (l ancien texte ne doit plus sortir NULLE PART) ──');
{ global._migrateOldNotes=MIG; const MIG2=eval('('+fnOf('_l534Mig')+')');   /* _l534Mig lit _migrateOldNotes comme un global, au moment de l appel */
  ok(MIG2(OLD1)===V.notes&&MIG2(null)===null&&MIG2(undefined)===undefined&&MIG2('')==='','_l534Mig : ancienne note → nouvelle ; null / undefined / vide rendus TELS QUELS (le comportement des champs restaures ne change pas)');
  const pl=fnOf('_l510PkgLine'), rs=fnOf('restoreFicheState');
  ok(/const notes=_l534Mig\(v\('fNotesEmballage','planNotesEmballage'\)\)\.split/.test(pl),'ligne emballage de la TABLETTE : la note est migree a la LECTURE');
  ok(/g\('planNotesEmballage'\)\.value=_l534Mig\(st\.plan\.notes\);/.test(rs)&&/setV\('fNotesEmballage',_l534Mig\(st\.fiche\.notes\)\);/.test(rs),'reprise d un brouillon / d une fiche en cours : les 2 champs sont restaures MIGRES');
  ok((src.match(/esc\(_l534Mig\(c\.notes\)\)/g)||[]).length===4&&!/esc\(c\.notes\)/.test(src),'clients B/C/D : les 4 sorties (plan papier, PDF, 2 ecrans) passent par la migration ; plus aucun esc(c.notes) brut');
  /* fonctionnel : la vraie _l510PkgLine sur un faux DOM, champ rempli avec l ANCIENNE note (fixture) */
  const mk=function(val){ return {value:val,textContent:'',innerHTML:'',className:'',id:'',dataset:{},classList:{add:function(){},remove:function(){}},setAttribute:function(){},insertAdjacentElement:function(){}}; };
  const dom={ficheHeadPills:mk(''),fichePkgLine:mk(''),fPalette:mk(V.palette),fType:mk(V.type),fEtiquetage:mk(V.etiquetage),fCerclage:mk(V.cerclage),fNotesEmballage:mk(OLD1)};
  global.document={getElementById:function(id){ return dom[id]||null; },createElement:function(){ return mk(''); }}; global.esc=function(s){ return String(s); }; global._l534Mig=MIG2; let fitCalls=0; global._l533PkgFit=function(){ fitCalls++; };
  eval('('+pl+')')();
  ok(fitCalls===1,'la mesure du L533 (_l533PkgFit) est appelee UNE fois, apres le rendu du texte migre');
  const rendu=dom.fichePkgLine.innerHTML;
  ok(/KX1006-1 Profilé en 1000ml : bob\/pile cerclée 30mm=4 \| 35mm=4 · KX1006-1 impression VEKA en 1000ml/.test(rendu)&&!/ancienne regle 1/.test(rendu),'rendu tablette : la NOUVELLE note (fixture) est affichee, plus l ancienne');
  ok(pl.indexOf('_l534Mig(')>0&&pl.indexOf('_l534Mig(')<pl.indexOf('el.dataset.l533Sig'),'la note est migree AVANT la signature et la mesure de L533 : le texte affiche, signe et mesure est le NOUVEAU'); }
console.log('── 5. TABLETTE (decision Celine 22/09) : plus de coupure ; le bouton du L533 reste en place, dormant ──');
{ const pl=fnOf('_l510PkgLine');
  ok(/#ficheMain #fichePkgLine\{display:-webkit-box;-webkit-line-clamp:none;/.test(src)&&/function _l533PkgFit\(/.test(src)&&/_l533PkgFit\(\)/.test(pl),'plus de coupure en paysage : l operateur lit toute la consigne');
  ok(/#fichePkgLine\{display:none\}/.test(src)&&/^#fichePkgMore\{display:none\}/m.test(src),'portrait inchange : ni ligne emballage ni bouton (regle 3, layout historique)'); }
console.log('── 4. [L537] plus de regle ni de migration dans le fichier public ──');
ok(/^var PKG_CLIENTS=\{\n\};/m.test(src)&&/^var _OLD_NOTES=\[\];/m.test(src),'graine et table de migration vides');
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 PKG L534 OK : '+total+' verifications'));
process.exit(fail?1:0);
