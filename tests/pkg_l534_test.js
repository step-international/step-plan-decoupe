// pkg_l534_test.js — [L534 · signalement JF 21/09/2026 (VEKA 4501964870 sur CEVENINI), verifie par Celine avec l atelier les 21 et 22/09] VEKA : « pas de cerclage 40mm pour la ref KX1006 ».
// L outil ecrivait UNE ligne pour deux references (« Bob/pile cerclee (KX1075/1006-1) : 15=11 | 20=8 | 25=7 | 30=6 | 35=5 | 40=4 ») : les chiffres
// du KX1075 etaient appliques au KX1006-1. Les TABLES ci-dessous sont retranscrites des 4 fiches atelier (K:\\...\\matrices commandes clients) :
//   KX1006-1 : les 2 fiches Excel (janvier 2025 : 15 = cerclees/11 · 20 = cerclees/8 · 25 = cerclees/7, rien de 30 a 190 mm) sont PERIMEES. Source = verification de Celine avec l atelier le 21/09/2026 :
//     KX1006-1 PROFILE : en 700 ml, 15 = 11 / pile · 20 = 8 · 25 = 7, cercles ; a partir de 30 mm, bobine mere 1000 ml : 30 et 35 mm cercles, 5 par pile ; PAS de cerclage en 40 mm (le signalement). Celine 22/09 : « pas besoin de cerclage en 40mm » → la mention n est PAS ecrite : une laize non listee n est pas cerclee (meme convention que KX1075 et DQ1009).
//     KX1006-1 IMPRESSION VEKA (1000 ml seulement) : 15 = 11 · 20 = 8 · 25 = 7 · 30 = 5 · 35 = 5 cercles ; « tout en rehausse chez VEKA » (Celine 21/09).
//   Le L533 d Esteban (22/09) avait lu le meme signalement comme un defaut d AFFICHAGE seul (« rien a corriger dans la donnee ») : son bouton « Voir la suite » est CONSERVE, ses deux affirmations sur la donnee sont recalees ici (tests/pkg_l533_test.js, gardien).
//   « commande VEKA matrice commande kx 1075.docx » : 20 = 8 cerclees · 25 = 7 · 30 = 6 · 35 = 5 · 40 = 4 cerclees · 45 a 150 mm : AUCUNE mention (pas de 15 mm)
//   « commande VEKA dq 1009 vleu.xls » : 20 mm = cercler par 10 · 40 mm : AUCUNE mention
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const mP=src.match(/^var PKG_CLIENTS=(\{[\s\S]*?\n\});/m); if(!mP) throw new Error('introuvable PKG_CLIENTS'); global.PKG_CLIENTS=eval('('+mP[1]+')');
const mL=src.match(/^const _L529_PKG_PATCHES=(\[[^\]]*\]);/m); global._L529_PKG_PATCHES=mL?eval(mL[1]):[];
const mF=src.match(/^const _L532_PKG_FORCE=(\[[^\]]*\]);/m); global._L532_PKG_FORCE=mF?eval(mF[1]):[];
const MERGE=eval('('+fnOf('_l529PkgMerge')+')');
const mO=src.match(/^const _OLD_NOTES=(\[[\s\S]*?\n\]);/m); if(!mO) throw new Error('introuvable _OLD_NOTES'); global._OLD_NOTES=eval('('+mO[1]+')');
const MIG=eval('('+fnOf('_migrateOldNotes')+')');
const mD=src.match(/var _dejaKx=([^;]+);/); if(!mD) throw new Error('introuvable _dejaKx'); const DEJAKX=new Function('rules','return '+mD[1]+';');   /* l expression REELLE de applyPackagingRules */
const V=PKG_CLIENTS['VEKA']||{}; const N=V.notes||''; const L=N.split('\n');
const CELINE_KX1006_700={15:'11',20:'8',25:'7'}, CELINE_KX1006_1000={30:'5',35:'5'}, CELINE_KX1006_VEKA={15:'11',20:'8',25:'7',30:'5',35:'5'}, FICHE_KX1075={20:'8',25:'7',30:'6',35:'5',40:'4'};
const parse=function(l){ const o={}; String(l||'').split('—')[0].split('|').forEach(function(seg){ const m=seg.match(/(\d+)mm=(\d+)/); if(m) o[m[1]]=m[2]; }); return o; };
const same=function(a,b){ return JSON.stringify(Object.keys(a).sort().map(function(k){ return [k,a[k]]; }))===JSON.stringify(Object.keys(b).sort().map(function(k){ return [String(k),b[k]]; })); };
console.log('── 1. VEKA : une ligne PAR reference, chiffres des fiches atelier ──');
const l067=L.find(function(l){ return /^KX1006-1 Profilé en 700ml :/.test(l); })||'', l061=L.find(function(l){ return /^KX1006-1 Profilé en 1000ml :/.test(l); })||'', l06v=L.find(function(l){ return /^KX1006-1 impression VEKA en 1000ml :/.test(l); })||'', l75=L.find(function(l){ return /^KX1075 :/.test(l); })||'', l09=L.find(function(l){ return /^DQ1009 :/.test(l); })||'';
ok(same(parse(l067),CELINE_KX1006_700)&&!/PAS de cerclage/.test(l067)&&/^KX1006-1 Profilé en 700ml : bob\/pile cerclée /.test(l067),'KX1006-1 PROFILE en 700 ml : cerclees 15 = 11 · 20 = 8 · 25 = 7, et RIEN d autre → '+l067);
ok(same(parse(l061),CELINE_KX1006_1000)&&!/PAS de cerclage/.test(l061)&&/^KX1006-1 Profilé en 1000ml : bob\/pile cerclée /.test(l061),'KX1006-1 PROFILE en 1000 ml : cerclees 30 = 5 · 35 = 5, et RIEN d autre — le 40 mm n est plus liste, donc plus cercle (le signalement de l atelier) → '+l061);
ok(same(parse(l06v),CELINE_KX1006_VEKA)&&!/PAS de cerclage/.test(l06v)&&/^KX1006-1 impression VEKA en 1000ml : bob\/pile cerclée /.test(l06v),'KX1006-1 IMPRESSION VEKA en 1000 ml : cerclees 15 = 11 · 20 = 8 · 25 = 7 · 30 = 5 · 35 = 5, et RIEN d autre (Celine 22/09) → '+l06v);
ok(!/PAS de cerclage/.test(N),'aucune ligne n affirme « PAS de cerclage » (Celine 22/09 : « pas besoin de cerclage en 40mm ») : seules les laizes CERCLEES sont ecrites, pour les 4 references — meme convention partout');
ok(!L.some(function(l){ return /^KX1006-1 impression VEKA en 700ml/.test(l); }),'l impression VEKA n existe pas en 700 ml (Celine 22/09 : « 700ml profile seulement ») : aucune ligne ne l affirme');
ok(!/40mm=/.test(l067+l061+l06v)&&!/30mm=6/.test(l067+l061+l06v),'KX1006-1 : plus AUCUN chiffre de pile cerclee pour le 40 mm, et le 30 mm n est plus « 6 » (c etaient les chiffres du KX1075)');
ok(same(parse(l75),FICHE_KX1075)&&/^KX1075 : bob\/pile cerclée /.test(l75)&&!/15mm/.test(l75)&&!/PAS de cerclage/.test(l75),'KX1075 : bob/pile cerclee 20 = 8 · 25 = 7 · 30 = 6 · 35 = 5 · 40 = 4 ; pas de 15 mm sur sa fiche ; AUCUNE affirmation « PAS de cerclage » (la fiche est muette au-dela de 40 mm, Celine ne l a pas confirme) → '+l75);
ok(l09==='DQ1009 : bob/pile cerclée 20mm=10','DQ1009 bleu : 20 mm = 10 par pile cerclee (fiche « cercler par 10 ») ; rien d affirme sur le 40 mm (fiche muette) → '+l09);
ok(L.slice(3).every(function(l){ return /: bob\/pile cerclée \d+mm=/.test(l); }),'chaque ligne de chiffres porte son UNITE (« bob/pile cerclee ») : « 15mm=11 » seul ne disait plus 11 QUOI');
ok(!/KX1075\/1006-1/.test(N),'la ligne fusionnee « (KX1075/1006-1) » a disparu de la regle');
ok(L.length===8&&L[0]==='⚡ SPÉCIFICITÉ : NE PAS filmer. Réhausses obligatoires, palettes solides.'&&L[1]==='⚠ Alterner bobines pile & face · télescopage ≤10mm.'&&L[2]==='Gerbage autorisé par référence UNIQUEMENT.','les 3 premieres lignes de la consigne sont INCHANGEES (« Rehausses obligatoires » compris : « tout en rehausse chez VEKA », Celine 21/09) ; 8 lignes en tout → '+L.length);
ok(V.palette==='80×120'&&V.type==='Palette nue + réhausses'&&V.etiquetage==='Standard'&&V.cerclage==='Par piles cerclées (ratio fourni)','palette / type / etiquetage / cerclage de la regle inchanges (aucun libelle de liste deroulante touche)');
console.log('── 2. la ligne automatique « Film KX detecte → cerclage automatique quelle que soit la largeur » ne doit JAMAIS sortir chez VEKA (elle serait fausse) ──');
ok(DEJAKX(V)===true,'la note VEKA parle deja de KX + cerclage → la ligne automatique ne s ajoute pas');
ok(DEJAKX({cerclage:V.cerclage,notes:'⚡ SPÉCIFICITÉ : NE PAS filmer.'})===false,'controle du test : sans « KX » ni « cercl » dans la note, l expression rendrait faux (le champ Cerclage VEKA ne contient pas « KX »)');
console.log('── 3. la table partagee ne masque pas la correction ──');
global.PKG_CLIENTS_SEED=PKG_CLIENTS;
const OLDV='⚡ SPÉCIFICITÉ : NE PAS filmer. Réhausses obligatoires, palettes solides.\n⚠ Alterner bobines pile & face · télescopage ≤10mm.\nGerbage autorisé par référence UNIQUEMENT.\nBob/pile cerclée (KX1075/1006-1) : 15mm=11 | 20mm=8 | 25mm=7 | 30mm=6 | 35mm=5 | 40mm=4\nDQ1009 : 20mm=10/pile';
const remote={'VEKA':{palette:'80×120',type:'Palette nue + réhausses',etiquetage:'Standard',cerclage:'Par piles cerclées (ratio fourni)',notes:OLDV},'EPCO':{palette:'X',notes:'table partagee'}};
const out=MERGE(remote);
ok(_L532_PKG_FORCE.indexOf('VEKA')>=0&&out!==remote&&out['VEKA']===V&&remote['VEKA'].notes===OLDV&&out['EPCO'].notes==='table partagee','table partagee avec l ANCIENNE regle VEKA → la regle du code gagne ; l objet recu n est pas modifie ; EPCO reste celui de la table partagee');
const _tri=function(o){ const r={}; Object.keys(o).sort().forEach(function(k){ r[k]=o[k]; }); return r; };
const r2={}; _L532_PKG_FORCE.concat(_L529_PKG_PATCHES).forEach(function(k){ r2[k]=_tri(PKG_CLIENTS[k]); }); ok(MERGE(r2)===r2,'table partagee DEJA a jour (cles triees comme Firestore) → rendue telle quelle');
console.log('── 4. commandes et plans DEJA enregistres avec l ancienne note (la commande VEKA en cours sur CEVENINI) ──');
ok(N!==OLDV&&MIG(OLDV)===N,'ancienne note EXACTE → nouvelle note a l impression, au PDF et au rechargement du plan');
ok(MIG(OLDV+'\nattention palette 2')===N+'\nattention palette 2','une ligne ajoutee a la main APRES l ancienne note est conservee');
ok(MIG('NE PAS filmer. Bob/pile cerclée (KX1075/1006-1) : 40mm=4')==='NE PAS filmer. Bob/pile cerclée (KX1075/1006-1) : 40mm=4','un texte retouche a la main (prefixe different) n est JAMAIS denature');
ok(MIG(N)===N,'la nouvelle note est stable (pas de double migration)');
console.log('── 4 bis. la commande VEKA EN COURS : tablette, reprise de brouillon, clients B/C/D (l ancien texte ne doit plus sortir NULLE PART) ──');
{ global._migrateOldNotes=MIG; const MIG2=eval('('+fnOf('_l534Mig')+')');   /* _l534Mig lit _migrateOldNotes comme un global, au moment de l appel */
  ok(MIG2(OLDV)===N&&MIG2(null)===null&&MIG2(undefined)===undefined&&MIG2('')==='','_l534Mig : ancienne note → nouvelle ; null / undefined / vide rendus TELS QUELS (le comportement des champs restaures ne change pas)');
  const pl=fnOf('_l510PkgLine'), rs=fnOf('restoreFicheState');
  ok(/const notes=_l534Mig\(v\('fNotesEmballage','planNotesEmballage'\)\)\.split/.test(pl),'ligne emballage de la TABLETTE : la note est migree a la LECTURE (c est l ecran ou le signalement est ne)');
  ok(/g\('planNotesEmballage'\)\.value=_l534Mig\(st\.plan\.notes\);/.test(rs)&&/setV\('fNotesEmballage',_l534Mig\(st\.fiche\.notes\)\);/.test(rs),'reprise d un brouillon / d une fiche en cours : les 2 champs sont restaures MIGRES (sinon l ancien texte repartait en base a la sauvegarde suivante)');
  ok((src.match(/esc\(_l534Mig\(c\.notes\)\)/g)||[]).length===4&&!/esc\(c\.notes\)/.test(src),'clients B/C/D : les 4 sorties (plan papier, PDF, 2 ecrans) passent par la migration ; plus aucun esc(c.notes) brut');
  // fonctionnel : la vraie _l510PkgLine sur un faux DOM, champ rempli avec l ANCIENNE note
  const mk=function(val){ return {value:val,textContent:'',innerHTML:'',className:'',id:'',dataset:{},classList:{add:function(){},remove:function(){}},setAttribute:function(){},insertAdjacentElement:function(){}}; };   /* dataset : la signature de texte du L533 (el.dataset.l533Sig) */
  const dom={ficheHeadPills:mk(''),fichePkgLine:mk(''),fPalette:mk('80×120'),fType:mk('Palette nue + réhausses'),fEtiquetage:mk('Standard'),fCerclage:mk('Par piles cerclées (ratio fourni)'),fNotesEmballage:mk(OLDV)};
  global.document={getElementById:function(id){ return dom[id]||null; },createElement:function(){ return mk(''); }}; global.esc=function(s){ return String(s); }; global._migrateOldNotes=MIG; global._l534Mig=MIG2; let fitCalls=0; global._l533PkgFit=function(){ fitCalls++; };   /* la mesure du L533 est un GLOBAL appele apres le rendu : on la compte */
  eval('('+pl+')')();
  ok(fitCalls===1,'la mesure du L533 (_l533PkgFit) est appelee UNE fois, apres le rendu du texte migre — coexistence reelle, pas un appel avale par un try/catch');
  const rendu=dom.fichePkgLine.innerHTML;
  ok(/KX1006-1 Profilé en 1000ml : bob\/pile cerclée 30mm=5 \| 35mm=5 · KX1006-1 impression VEKA en 1000ml : bob\/pile cerclée 15mm=11 \| 20mm=8 \| 25mm=7 \| 30mm=5 \| 35mm=5 · KX1075 :/.test(rendu)&&!/KX1075\/1006-1/.test(rendu)&&!/35mm=5 \| 40mm=4 · DQ1009 : 20mm=10\/pile/.test(rendu)&&/ · DQ1009 : bob\/pile cerclée 20mm=10$/.test(rendu.replace(/<\/span>$/,'')),'tablette, fiche ouverte avec l ANCIENNE note → la ligne affiche la NOUVELLE consigne (plus de « (KX1075/1006-1) … 40mm=4 »)'); }
console.log('── 5. TABLETTE (decision Celine 22/09 : « pour l affichage c est mieux s il voit tout ») : plus de coupure ; le bouton du L533 reste en place, dormant ; la ligne migree est celle que L533 signe et mesure ──');
{ const pl=fnOf('_l510PkgLine');
  ok(/#ficheMain #fichePkgLine\{display:-webkit-box;-webkit-line-clamp:none;/.test(src)&&/function _l533PkgFit\(/.test(src)&&/_l533PkgFit\(\)/.test(pl),'plus de coupure en paysage : l operateur lit toute la consigne sans toucher l ecran (la limite de 3 lignes du 08/09 valait pour une note deux fois plus courte) ; le bouton « Voir la suite » du L533 reste en place, dormant — il ne s affiche que si du texte est cache');
  ok(/#fichePkgLine\{display:none\}/.test(src)&&/^#fichePkgMore\{display:none\}/m.test(src),'portrait inchange : ni ligne emballage ni bouton (regle 3, layout historique)');
  ok(pl.indexOf('_l534Mig(')>0&&pl.indexOf('_l534Mig(')<pl.indexOf('el.dataset.l533Sig'),'la note est migree AVANT la signature et la mesure de L533 : le texte affiche, signe et mesure est le NOUVEAU'); }
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 PKG L534 OK : '+total+' verifications'));
process.exit(fail?1:0);
