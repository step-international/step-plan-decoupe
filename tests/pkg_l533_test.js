// pkg_l533_test.js — [L533 · signalement JF 21/09/2026, commande VEKA 4501964870 sur CEVENINI]
// « Pas de cerclage veka 40mm pour la ref kx1006 ». Le ratio EXISTE dans la regle VEKA (« 40mm=4 ») mais la ligne
// emballage de la fiche est coupee a 3 lignes (-webkit-line-clamp, L510) : mesure en navigateur a 1280x800 ET
// 1194x800 — 4 lignes reelles, 3 affichees, et « 40mm=4 » tombe dans la 4e. L operateur ne pouvait PAS le lire.
// (La capture jointe au signalement, elle, montrait le texte entier : html2canvas ignore le line-clamp — d ou le
// « mais c est ecrit » cote bureau.) Ce lot rend la suite ATTEIGNABLE : un bouton « voir la suite » quand ca depasse.
// [L534 · verification Celine / atelier 21-22/09] la lecture ci-dessus etait INCOMPLETE : la donnee ETAIT fausse (« 40mm=4 » = ratio du KX1075 applique au KX1006-1),
// corrigee dans la regle VEKA (ecrite par reference et par impression). Verifications n°1 et n°2 et celle de la coupure recalees ; le bouton reste en place, dormant :
// la coupure a 3 lignes est levee sur decision de Celine du 22/09 (« pour l affichage c est mieux s il voit tout »).
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

console.log('── 1. [L534] la donnee ETAIT fausse (verification Celine / atelier 21-22/09) : la regle VEKA est ecrite par reference et par impression ──');
/* [L537] les regles d emballage ne sont plus dans le fichier : la verification de CONTENU de la regle VEKA (une ligne par
   reference et par impression, 8 lignes) se fait sur Firestore config/clients par un controle PRIVE (hors depot public :
   ~/Documents/step/prep-suite-expo-publique/verif_config_clients.js). Ici : la graine est bien vide. */
ok(/^var PKG_CLIENTS=\{\n\};/m.test(src),'[L537] plus de regle d emballage dans le fichier public (graine vide)');

console.log('── 2. CSS : l etat deplie existe, le bouton est masque par defaut ──');
ok(/#ficheMain #fichePkgLine\.l533-open\{[^}]*-webkit-line-clamp:\s*unset/.test(src),'.l533-open retire la coupure a 3 lignes');
ok(/#ficheMain #fichePkgMore\{[^}]*display:none/.test(src),'#fichePkgMore est masque par defaut (paysage)');
ok(/#ficheMain #fichePkgMore\.l533-on\{[^}]*display:inline-block/.test(src),'.l533-on affiche le bouton');
ok(/^#fichePkgMore\{display:none\}/m.test(src),'portrait (hors @media) : le bouton n existe pas non plus — regle 3, layout historique intact');
ok(/#ficheMain #fichePkgLine\{[^}]*-webkit-line-clamp:none/.test(src),'[L534 · decision Celine 22/09 : « pour l affichage c est mieux s il voit tout »] plus de coupure par defaut (la decision du 08/09 valait pour une note deux fois plus courte) ; le bouton « Voir la suite » reste en place, dormant');

console.log('── 3. _l533PkgFit : mesure, garde-fous, libelles ──');
const FIT=fnOf('_l533PkgFit');
ok(/getElementById\('fichePkgMore'\)/.test(FIT)&&/createElement\('button'\)/.test(FIT),'le bouton est cree une seule fois, a cote du bandeau');
ok(/insertAdjacentElement\('afterend',b\)/.test(FIT),'le bouton est insere APRES le bandeau (jamais dans le <button> de l en-tete)');
ok(/stopPropagation/.test(FIT),'le clic ne remonte pas a l en-tete de fiche (qui se replierait)');
ok(/l510-vide[\s\S]*?classList\.remove\('l533-on'\)/.test(FIT),'client SANS regle d emballage : le bouton est retire (pas d etat fantome)');
ok(/if\(!el\.offsetParent\)\s*return;/.test(FIT),'bandeau invisible (portrait, autre page) : on NE mesure PAS — scrollHeight vaudrait 0 et le bouton apparaitrait a tort (lecon L522)');
ok(/el\.scrollHeight>el\.clientHeight\+2/.test(FIT),'la troncature est MESUREE (pas devinee sur la longueur du texte)');
ok(/▼ Voir la suite/.test(FIT)&&/▲ Replier/.test(FIT),'deux libelles avec des fleches REELLEMENT rendues par la police (▲▼, pas ▴▾)');
ok(/min-height:44px/.test(src.slice(src.indexOf('#ficheMain #fichePkgMore{'),src.indexOf('#ficheMain #fichePkgMore{')+400)),'cible tactile : le plancher du projet est 44 px (.btn-sm), pas 40 (passe adverse)');
ok(/body\.atelier #ficheMain #fichePkgMore\{min-height:48px/.test(src),'mode atelier : 48 px, comme .lb-act / .lc-act');
ok(/#ficheMain #fichePkgMore\.l533-on\{display:inline-block;align-self:flex-start\}/.test(src),'[L535 · mesure navigateur] zone cliquable limitee au texte : inline-block SEUL etait inerte (#ficheMain est un flex column → blockification, 974 px mesures au lieu de 238) ; align-self:flex-start ramene la boite au texte, hauteur 48 px conservee');
ok(src.indexOf("#ficheMain #fichePkgLine.l533-open")<src.indexOf("#ficheMain #fichePkgLine.l510-vide"),'ORDRE CSS : .l533-open AVANT .l510-vide — a specificite egale la derniere gagne, un bandeau vide reste masque meme s il a garde la classe depliee');

console.log('── 3bis. accessibilite (doctrine L357 du projet) ──');
ok(/setAttribute\('aria-controls','fichePkgLine'\)/.test(FIT),'le bouton DIT ce qu il deplie');
ok(/setAttribute\('aria-expanded',open\?'true':'false'\)/.test(FIT),'… et dans quel etat il est, a chaque mesure');

console.log('── 3ter. l etat deplie ne suit pas le texte d une AUTRE commande ──');
{ const PL=fnOf('_l510PkgLine');
  ok(/el\.dataset\.l533Sig!==h\)\{ el\.dataset\.l533Sig=h; el\.classList\.remove\('l533-open'\); \}/.test(PL),'texte different (autre commande / client / reference) → retour aux 3 lignes (passe adverse : l etat deplie fuitait d une commande a l autre)');
  ok(PL.indexOf("dataset.l533Sig")<PL.indexOf("el.innerHTML=h"),'… compare AVANT d ecrire le nouveau texte (sinon la comparaison porterait sur le texte deja remplace)'); }

console.log('── 4. _l533PkgToggle ──');
const TOG=fnOf('_l533PkgToggle');
ok(/classList\.toggle\('l533-open'\)/.test(TOG),'le tap bascule l etat deplie');
ok(/_l533PkgFit\(\)/.test(TOG),'… et re-mesure derriere (le libelle du bouton suit)');

console.log('── 5. cablage : la mesure est refaite a chaque fois que le bandeau peut changer ──');
ok(/el\.innerHTML=h; el\.classList\.remove\('l510-vide'\);\s*try\{ _l533PkgFit\(\); \}catch\(_\)\{ \}/.test(src),'_l510PkgLine : mesure apres chaque re-rendu du texte');
ok(/l510-vide'\); try\{ _l533PkgFit\(\); \}catch\(_\)\{ \} return; \}/.test(src),'_l510PkgLine, branche SANS regle d emballage : elle sortait avant la mesure — le bouton restait sous un bandeau vide (preuve navigateur)');
{ const SP=fnOf('showPage'); const a=SP.indexOf('if(i===1){'), b=SP.indexOf('if(i===2){');
  ok(a>0&&b>a&&SP.slice(a,b).indexOf('_l533PkgFit')>0,'showPage(1) : mesure au retour sur la fiche, DANS le bloc i===1 (la mesure precedente valait 0 : ecran cache)'); }
ok(/_l533PkgFit/.test(src.slice(src.indexOf('_l522PlaceAllShares();'),src.indexOf('_l522PlaceAllShares();')+900))||/resize[\s\S]{0,400}_l533PkgFit/.test(src),'rotation / redimensionnement : la mesure est refaite (3 lignes a 1280 ≠ 3 lignes a 800)');
ok((src.match(/function _l533PkgFit\(/g)||[]).length===1&&(src.match(/function _l533PkgToggle\(/g)||[]).length===1,'une seule definition de chaque fonction');

console.log('── 6. simulation : le bouton n apparait QUE quand du texte est cache ──');
{
  const mk=function(scrollH,clientH,vide,open){
    const cls=new Set(); if(vide) cls.add('l510-vide'); if(open) cls.add('l533-open');
    const bcls=new Set();
    const bouton={id:'fichePkgMore',textContent:'',type:'',addEventListener:function(){},
      classList:{toggle:function(c,v){ if(v===undefined) v=!bcls.has(c); v?bcls.add(c):bcls.delete(c); },remove:function(c){bcls.delete(c);},contains:function(c){return bcls.has(c);}},_cls:bcls};
    const el={scrollHeight:scrollH,clientHeight:clientH,offsetParent:(vide?{}:{}),
      classList:{contains:function(c){return cls.has(c);},remove:function(c){cls.delete(c);},toggle:function(c,v){ if(v===undefined) v=!cls.has(c); v?cls.add(c):cls.delete(c); }},
      dataset:{},
      insertAdjacentElement:function(){}};
    if(scrollH<0) el.offsetParent=null;
    global.document={getElementById:function(id){ return id==='fichePkgLine'?el:(id==='fichePkgMore'?bouton:null); },
      createElement:function(){ return bouton; }};
    return {el:el,b:bouton,bcls:bcls,cls:cls};
  };
  const RUN=eval('('+FIT+')');
  let c=mk(97,77,false,false); RUN(); ok(c.bcls.has('l533-on')&&/Voir la suite/.test(c.b.textContent),'texte VEKA (4 lignes pour 3 affichees) → bouton « voir la suite » (le cas de JF)');
  c=mk(77,77,false,false); RUN(); ok(!c.bcls.has('l533-on'),'note courte qui tient en 3 lignes → aucun bouton');
  c=mk(200,200,false,true); RUN(); ok(c.bcls.has('l533-on')&&/Replier/.test(c.b.textContent),'deja deplie → bouton « replier » (meme si plus rien ne depasse)');
  c=mk(97,77,true,false); RUN(); ok(!c.bcls.has('l533-on')&&!c.cls.has('l533-open'),'client sans regle d emballage → pas de bouton, etat deplie remis a zero');
  c=mk(-1,0,false,false); c.bcls.add('l533-on'); RUN(); ok(c.bcls.has('l533-on'),'ecran cache (offsetParent null) → l etat en place est CONSERVE, aucune mesure fausse');

  // le GESTE lui-meme, execute (pas seulement decrit) : _l533PkgToggle appelle _l533PkgFit, il faut les deux
  const src2=src; global._l533PkgFit=eval('('+FIT+')');
  const TOGGLE=eval('('+fnOf('_l533PkgToggle')+')');
  c=mk(-1,0,true,true); c.bcls.add('l533-on'); RUN();
  ok(!c.bcls.has('l533-on')&&!c.cls.has('l533-open'),'ORDRE DES GARDES : bandeau vide ET invisible → la garde « vide » passe AVANT celle d offsetParent, le bouton part quand meme');
  c=mk(97,77,false,false); RUN();
  ok(c.bcls.has('l533-on')&&/Voir la suite/.test(c.b.textContent),'depart : replie, bouton « voir la suite »');
  c.el.clientHeight=97;   // deplier retire la coupure : plus rien ne depasse
  TOGGLE();
  ok(c.cls.has('l533-open'),'TAP 1 → deplie');
  ok(/Replier/.test(c.b.textContent)&&c.bcls.has('l533-on'),'… le bouton devient « replier » et RESTE affiche (sinon on ne pourrait plus replier)');
  c.el.clientHeight=77;
  TOGGLE();
  ok(!c.cls.has('l533-open')&&/Voir la suite/.test(c.b.textContent),'TAP 2 → replie, le libelle repart en « voir la suite » (geste reversible)');
}

console.log((fail?'\n💥 '+fail+' echec(s)':'\n🏆 pkg_l533 OK')+' — '+total+' verifications');
process.exit(fail?1:0);
