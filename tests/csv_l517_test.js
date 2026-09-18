// csv_l517_test.js — [L517 · 12 points Celine 26/08 + ajouts 10/09] GARDE de la ligne du CSV des fiches (_l517FicheRow, PURE)
// et de la cause lisible d une fiche non calculable (_l517Cause). La matiere elle-meme reste prouvee par matiere_l513_test.js.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.window=global;
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.parseNum=eval('('+fnOf('parseNum')+')');
global.parseConf=eval('('+fnOf('parseConf')+')');
global.calcStats=eval('('+fnOf('calcStats')+')');
global._refIdKey=eval('('+fnOf('_refIdKey')+')');
global._refKeyOf=eval('('+fnOf('_refKeyOf')+')');
global._l507Traced=new WeakSet();
global._l506RefGroupFor=eval('('+fnOf('_l506RefGroupFor')+')');
global._l505HorsPlan=eval('('+fnOf('_l505HorsPlan')+')');
global._l507GroupUseful=eval('('+fnOf('_l507GroupUseful')+')');
global.ncLoss=eval('('+fnOf('ncLoss')+')');
let warns=0; const warnOrig=function(){ warns++; }; global._l505Warn=warnOrig; global._l505WarnN=0;
global._l513Matiere=eval('('+fnOf('_l513Matiere')+')');
global._l513MatiereOf=eval('('+fnOf('_l513MatiereOf')+')');
global.CLIENT_DATA={'EPCO':[],'VEKA':[],'Alphacan 25':[]};
['_l517Num','_l517NoAcc','_l517ClientNom','_l517NumCmd','_l517Iso','_l517LivIso','_l517SansSec','_l517Blade','_l517NbMeres','_l517Bobineaux'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
const mC=src.match(/^const _L517_CAUSES=(\{[\s\S]*?\});/m); if(!mC) throw new Error('introuvable _L517_CAUSES'); global._L517_CAUSES=eval('('+mC[1]+')');
global._l517Cause=eval('('+fnOf('_l517Cause')+')');
/* [L526] la ligne appelle desormais _l526Decomp / _l526Diag, qui lisent MACHINE_DEFAULTS et les deux seuils (patron perte_l516_test) */
const mD=src.match(/^const MACHINE_DEFAULTS=(\{[^;]*\});/m); if(!mD) throw new Error('introuvable MACHINE_DEFAULTS'); global.MACHINE_DEFAULTS=eval('('+mD[1]+')');
global.PERTE_DIAG_SEUIL_PCT=+((src.match(/^const PERTE_DIAG_SEUIL_PCT=(\d+);/m)||[])[1]); global.PERTE_DIAG_LAIZE_ETROITE_MM=+((src.match(/^const PERTE_DIAG_LAIZE_ETROITE_MM=(\d+);/m)||[])[1]);
['_l526PctM2','_l526Decomp','_l526Diag'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
/* [L530] la ligne appelle _l530Bilan (m² decoupes / mis au stock / pris du stock / livres) */
global._l528BugN=0; ['computeChutesUsed','_sanStoredRows','_l528Livres','_l530ChutesOfGroup','_l530Stock','_l530Surplus','_l530Bilan'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
const ROW=eval('('+fnOf('_l517FicheRow')+')');
const HDR=(src.match(/const hdr='([^']*)'/)||[])[1].split(';');
const col=(r,n)=>{ const i=HDR.indexOf(n); if(i<0) throw new Error('colonne absente : '+n); return r[i]; };
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const L=(c,x)=>Object.assign({conf:c,useful:2090,blade:5,coupee:true,refIdx:0},x||{});
const F1=()=>({name:'EPCO-1',date:'2026-09-02T08:00:00Z',client:'EPCO pour le 02 09 2026 n°C12345',numCmd:'—',dateLiv:'02/09/2026',ini:'JF',machine:'FEBA',mother:2100,useful:2090,blade:5,longueur:'500',totalBobines:3,tempsStr:'1h 05min 32s (JF — 10/09/2026)',ficheDetail:[L('4x502'),L('3x612'),L('2x157')]});

console.log('── 0. structure : autant de cellules que de colonnes ──');
{ const r=ROW(F1()); ok(r.length===HDR.length,'ligne = '+r.length+' cellules pour '+HDR.length+' colonnes (le test qui manquait : un decalage rend le CSV illisible)'); ok(HDR.length===50,'50 colonnes (43 + decomposition L526 + Diagnostic + 3 colonnes L530 en fin de ligne) → '+HDR.length);
  ok(HDR.slice(47).join(';')==='m² mis au stock (quantité en trop);m² pris du stock;m² livrés (bobineaux)','[L530] les 3 colonnes AJOUTEES EN FIN DE LIGNE (positions 1-47 stables pour les classeurs du DG) → '+HDR.slice(47).join(';'));
  ok(HDR.slice(43,47).join(';')==='Traits de lame m²;Bords m²;Laize restante m²;Diagnostic','[L526] les 4 colonnes AJOUTEES EN FIN DE LIGNE (positions 1-43 stables pour les classeurs du DG) → '+HDR.slice(43).join(';'));
  ok(HDR.slice(0,43).join(';').endsWith(';Règle;Matière'),'[L526] la 43e colonne reste « Matière » : rien n a bouge avant'); }
console.log('── 1. cas EPCO mono (4x502 / 3x612 / 2x157, mere 2100, utile 2090, lame 5, 500 m) ──');
{ const r=ROW(F1());
  ok(col(r,'Perte m²')==='185,5','Perte m² = 185,5 (virgule) → '+col(r,'Perte m²'));
  ok(col(r,'Chutes gardées m²')==='885,5','Chutes gardees m² = 885,5 → '+col(r,'Chutes gardées m²'));
  ok(col(r,'m² coupés (bobines mères)')===3150&&HDR.indexOf('m²')<0,'[L530] « m² coupés (bobines mères) » = 3150 (source unique) ; la colonne nue « m² » n existe plus → '+col(r,'m² coupés (bobines mères)'));
  ok(col(r,'Perte % (m²)')==='5,9','Perte % (m²) = 185,5 / 3150 = 5,9 → '+col(r,'Perte % (m²)'));
  ok(col(r,'Déchet m²')==='0'&&col(r,'Déchet %')==='0','Dechet m² 0 et Dechet % 0 (vrai zero) → '+col(r,'Déchet m²')+' / '+col(r,'Déchet %'));
  ok(col(r,'m² découpés (bobineaux)')==='2079'&&col(r,'m² livrés (bobineaux)')==='2079'&&col(r,'m² pris du stock')==='0'&&col(r,'m² mis au stock (quantité en trop)')==='0'&&HDR.indexOf('m² découpés et livrés')<0,'[L530] decoupes 2079 = livres 2079 (ni stock ni quantite en trop : vrais zeros) ; « m² découpés et livrés » n existe plus → '+col(r,'m² découpés (bobineaux)')+' / '+col(r,'m² livrés (bobineaux)'));
  { const f=F1(); f.ficheDetail[2].ncQty=true; f.ficheDetail[2].ncDetail='un de plus'; f.ficheDetail[2].actChutes=true; const r3=ROW(f);
    ok(col(r3,'m² mis au stock (quantité en trop)')===''&&col(r3,'m² livrés (bobineaux)')==='2079'&&/quantité en trop non chiffrée/.test(col(r3,'Diagnostic')),'[L530 · revue adverse] quantite en trop NON chiffree : cellule « mis au stock » VIDE (jamais un faux 0) et la ligne le DIT dans Diagnostic → « '+col(r3,'m² mis au stock (quantité en trop)')+' » / '+col(r3,'Diagnostic')); }
  { const f=F1(); f.ficheDetail.push(L('1x100',{recut:true,rollW:300,useful:300,blade:0})); const r4=ROW(f);
    ok(col(r4,'m² découpés (bobineaux)')==='2129'&&col(r4,'m² coupés (bobines mères)')===3150,'[L530 · revue adverse] la colonne 37 a change de VALEUR : bobineaux des bobines meres (2079) + bobineaux du rouleau ♻ (1x100 sur 500 m = 50) = 2129 ; les m² coupes ne bougent pas → '+col(r4,'m² découpés (bobineaux)')); }
  { const f=F1(); f.chutesStock={'157':4}; f.ficheDetail[2].ncQty=true; f.ficheDetail[2].ncLots=[{q:1,w:157}]; f.ficheDetail[2].actChutes=true; const r2=ROW(f);
    ok(col(r2,'m² découpés (bobineaux)')==='2079'&&col(r2,'m² mis au stock (quantité en trop)')==='78,5'&&col(r2,'m² pris du stock')==='314'&&col(r2,'m² livrés (bobineaux)')==='2314,5','[L530] 1x157 en trop (78,5 au stock) et 4x157 pris du stock (314) : livres = 2079 − 78,5 + 314 = 2314,5 → '+[col(r2,'m² mis au stock (quantité en trop)'),col(r2,'m² pris du stock'),col(r2,'m² livrés (bobineaux)')].join(' / ')); }
  ok(col(r,'Bobineaux découpés')===9&&col(r,'Bobines mères coupées')===3&&col(r,'Total bobines mères')===3,'bobineaux 9, meres coupees 3, total meres 3 → '+col(r,'Bobineaux découpés')+' / '+col(r,'Bobines mères coupées')+' / '+col(r,'Total bobines mères'));
  ok(col(r,'Client')==='EPCO pour le 02 09 2026 n°C12345'&&col(r,'Client (nom seul)')==='EPCO','Client brut conserve + Client (nom seul) = EPCO → '+col(r,'Client (nom seul)'));
  ok(col(r,'N° commande')==='C12345','N° commande extrait du texte libre quand numCmd vaut « — » → '+col(r,'N° commande'));
  ok(col(r,'Livraison')==='2026-09-02'&&col(r,'Mois livraison')==='2026-09','Livraison ISO + mois → '+col(r,'Livraison')+' / '+col(r,'Mois livraison'));
  ok(col(r,'Temps')==='1h 05min (JF — 10/09/2026)','Temps sans les secondes → '+col(r,'Temps'));
  ok(col(r,'Perte lame (mm)')===5&&col(r,'Largeur bobine mère (mm)')===2100&&col(r,'Longueur bobine mère (m)')==='500','Perte lame 5 · largeur mere 2100 · longueur 500 → '+col(r,'Perte lame (mm)')+' / '+col(r,'Largeur bobine mère (mm)')+' / '+col(r,'Longueur bobine mère (m)'));
  ok(col(r,'Matière')==='calculée'&&col(r,'Règle')==='','Matiere « calculee », Regle vide (pas de f.mat) → '+col(r,'Matière')+' / "'+col(r,'Règle')+'"');
  ok(HDR.indexOf('Perte %')<0,'l ancienne colonne « Perte % » (base utile) a disparu de l en-tete'); }
console.log('── 2. un bobineau 157 jete ──');
{ const f=F1(); f.ficheDetail[2].ncLots=[{q:1,w:157}]; f.ficheDetail[2].ncLarg=true; f.ficheDetail[2].actDechet=true; const r=ROW(f);
  ok(col(r,'Déchet m²')==='78,5'&&col(r,'Déchet %')==='2,5','Dechet 78,5 m² = 2,5 % des 3150 → '+col(r,'Déchet m²')+' / '+col(r,'Déchet %'));
  ok(col(r,'Perte m²')==='185,5'&&col(r,'Chutes gardées m²')==='885,5','perte et chutes inchangees');
  ok(col(r,'Bobineaux découpés')===9,'le bobineau jete reste un bobineau decoupe (son m² est dans Dechet) → '+col(r,'Bobineaux découpés')); }
console.log('── 3. multi-ref : perte de lame par ref, largeur « 1260 / 1080 » ──');
{ const f={name:'M',date:'2026-09-03T08:00:00Z',client:'VEKA',mother:'1260 / 1080',useful:'1240 / 1060',blade:'5',longueur:'600 / 500',totalBobines:2,
    refGroups:[{ref:'A',mother:1260,useful:1240,edge:10,blade:5,longueur:'600'},{ref:'B',mother:1080,useful:1060,edge:10,blade:0,longueur:'500'}],
    ficheDetail:[{conf:'2x600',coupee:true,refIdx:0,ref:'A'},{conf:'2x500',coupee:true,refIdx:1,ref:'B'}]};
  const r=ROW(f);
  ok(col(r,'Perte lame (mm)')==='5 / 0','Perte lame (mm) lue dans refGroups : « 5 / 0 » (f.blade scalaire mentirait) → '+col(r,'Perte lame (mm)'));
  ok(col(r,'Largeur bobine mère (mm)')==='1260 / 1080','largeur mere archivee « 1260 / 1080 » conservee → '+col(r,'Largeur bobine mère (mm)'));
  ok(col(r,'Matière')==='calculée','multi-ref calculable → '+col(r,'Matière')); }
console.log('── 4. fiche NON calculable : cellules m² vides, dechet rendu, cause lisible ──');
{ const f={name:'NC',date:'2026-09-04T08:00:00Z',client:'X',totalBobines:2,mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[{conf:'',coupee:true,refIdx:0}]};
  const r=ROW(f);
  ok(col(r,'Matière')==='non calculable : bobine pointée coupée sans configuration','cause lisible → '+col(r,'Matière'));
  ok(['m² coupés (bobines mères)','Perte m²','Perte % (m²)','Chutes gardées m²','m² découpés (bobineaux)','m² mis au stock (quantité en trop)','m² pris du stock','m² livrés (bobineaux)','Déchet %'].every(n=>col(r,n)===''),'toutes les cellules matiere VIDES (jamais 0)');
  ok(col(r,'Déchet m²')==='0','Dechet m² rendu quand meme (0 reel) → '+col(r,'Déchet m²'));
  const f2=F1(); f2.longueur=''; ok(col(ROW(f2),'Matière')==='non calculable : métrage de la bobine mère absent','metrage absent → cause « metrage … absent » → '+col(ROW(f2),'Matière')); }
console.log('── 5. temps, livraison historique, regle ──');
{ const f=F1(); f.tempsStr='45s (JF — 10/09/2026)'; ok(col(ROW(f),'Temps')==='45s (JF — 10/09/2026)','« 45s » d une decoupe < 1 min reste intact → '+col(ROW(f),'Temps'));
  f.tempsStr='non enregistré'; ok(col(ROW(f),'Temps')==='non enregistré','« non enregistre » inchange');
  const g=F1(); delete g.dateLivIso; g.dateLiv='02/09/2026'; ok(col(ROW(g),'Livraison')==='2026-09-02','repli fr-FR jj/mm/aaaa → ISO → '+col(ROW(g),'Livraison'));
  g.clients=[{dateLiv:'2026-08-28'}]; ok(col(ROW(g),'Livraison')==='2026-08-28','promesse la plus exigeante (min) avec les clients B/C/D → '+col(ROW(g),'Livraison'));
  const h=F1(); h.mat={perteM2:1,chutesM2:2,dechetM2:0,m2Coupes:9,clientM2:6,ok:true,calcWarn:0,regleVer:'L513'}; ok(col(ROW(h),'Règle')==='L513','Regle = L513 lue sur f.mat → '+col(ROW(h),'Règle'));
  const k=F1(); k.client='Alphacan 25 pour le 03 09 2026'; ok(col(ROW(k),'Client (nom seul)')==='Alphacan 25','nom client resolu par le catalogue (limite de mot) → '+col(ROW(k),'Client (nom seul)'));
  k.client='Société Inconnue pour le 03 09 2026 n°42'; ok(col(ROW(k),'Client (nom seul)')==='Société Inconnue'&&col(ROW(k),'N° commande')==='42','client hors catalogue : coupe avant « pour le » + n° extrait → '+col(ROW(k),'Client (nom seul)')+' / '+col(ROW(k),'N° commande')); }
console.log('── 6. _l517Cause sans effet de bord ──');
{ global._l505WarnN=7; const before=global._l505Warn; const c=_l517Cause({totalBobines:2,mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[{conf:'',coupee:true,refIdx:0}]});
  ok(c.ok===false&&/configuration/.test(c.cause),'cause rendue → '+c.cause);
  ok(global._l505Warn===before&&global._l505WarnN===7,'traceur et compteur restaures apres le rejeu (la tuile du mois ne voit rien)'); }
console.log('── 7. [L526 · demande Celine 16/09] decomposition de « Perte m² » + Diagnostic (seuil PERTE_DIAG_SEUIL_PCT) ──');
{ const r=ROW(F1());
  ok(col(r,'Traits de lame m²')==='15'&&col(r,'Bords m²')==='15'&&col(r,'Laize restante m²')==='155,5','EPCO : traits de lame 15 · bords 15 · laize restante 155,5 → '+col(r,'Traits de lame m²')+' / '+col(r,'Bords m²')+' / '+col(r,'Laize restante m²'));
  const num=v=>parseFloat(String(v).replace(',','.'));
  const som=['Traits de lame m²','Bords m²','Laize restante m²'].reduce((a,n)=>a+num(col(r,n)),0);
  ok(Math.abs(som-num(col(r,'Perte m²')))<=0.16,'somme des 3 colonnes = Perte m² ('+som+' vs '+col(r,'Perte m²')+')');
  ok(String(col(r,'Diagnostic')).indexOf('5,9 % des m² = traits de lame 0,5 % + bords 0,5 % + laize restante non gardée 4,9 %')===0,'Diagnostic (5,9 > 5) commence par la decomposition en % → '+col(r,'Diagnostic'));
  ok(_l517Num(_l526PctM2(185.5,3150))===col(r,'Perte % (m²)'),'meme arrondi partout : _l526PctM2(185,5 / 3150) = '+_l517Num(_l526PctM2(185.5,3150))+' = colonne Perte % (m²)');
  const V=()=>({name:'VEKA-T',date:'2026-09-05T08:00:00Z',client:'VEKA',machine:'MAVEG',mother:2100,useful:2080,blade:5,longueur:'500',totalBobines:2,ficheDetail:[L('30x40+10x25+8x20',{useful:2080}),L('30x40+10x25+8x20',{useful:2080})]});
  const rv=ROW(V()); const dg=String(col(rv,'Diagnostic'));
  ok(/traits de lame : lame 5 mm sur des laizes de 20 à 40 mm \(laizes étroites\)/.test(dg)&&/⚠ lame 5 mm sur MAVEG/.test(dg),'VEKA/MAVEG lame 5 sur laizes 20-40 : le Diagnostic nomme les traits de lame, les laizes etroites et l alerte de reglage → '+dg);
  ok(dg.indexOf('traits de lame')<dg.indexOf('bords')&&dg.indexOf('bords')<dg.indexOf('laize restante'),'ordre des termes = ordre des colonnes (lames → bords → laize restante)');
  const sv=['Traits de lame m²','Bords m²','Laize restante m²'].reduce((a,n)=>a+num(col(rv,n)),0);
  ok(Math.abs(sv-num(col(rv,'Perte m²')))<=0.16&&col(rv,'Perte % (m²)')==='17,7','VEKA : 235 + 20 + 117,5 = 372,5 = Perte m² (17,7 %) → '+sv+' vs '+col(rv,'Perte m²')+' / '+col(rv,'Perte % (m²)'));
  const fnc={name:'NC',date:'2026-09-04T08:00:00Z',client:'X',totalBobines:2,mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[{conf:'',coupee:true,refIdx:0}]}; const rn=ROW(fnc);
  ok(['Traits de lame m²','Bords m²','Laize restante m²'].every(n=>col(rn,n)==='')&&col(rn,'Diagnostic')==='perte non chiffrable : bobine pointée coupée sans configuration','fiche NON calculable : 3 cellules VIDES + Diagnostic = « perte non chiffrable : <cause _L517_CAUSES> » → '+col(rn,'Diagnostic'));
  const h=F1(); h.mat={perteM2:1,chutesM2:2,dechetM2:0,m2Coupes:9,clientM2:6,ok:true,calcWarn:0,regleVer:'L513'}; const rh=ROW(h);
  ok(['Traits de lame m²','Bords m²','Laize restante m²'].every(n=>col(rh,n)==='')&&String(col(rh,'Diagnostic')).indexOf('décomposition non écrite')===0,'f.mat pre-L526 DIVERGENT du rejeu : cellules vides + « décomposition non écrite » (jamais une decomposition qui contredit sa ligne) → '+col(rh,'Diagnostic'));
  const h2=F1(); h2.mat={perteM2:185.5,chutesM2:885.5,dechetM2:0,m2Coupes:3150,clientM2:2079,ok:true,calcWarn:0,regleVer:'L513'}; const rh2=ROW(h2);
  ok(col(rh2,'Traits de lame m²')==='15'&&col(rh2,'Laize restante m²')==='155,5','f.mat pre-L526 CONCORDANT : cellules remplies par le rejeu → '+col(rh2,'Traits de lame m²')+' / '+col(rh2,'Laize restante m²'));
  const h3=F1(); h3.mat={perteM2:185.5,chutesM2:885.5,dechetM2:0,m2Coupes:3150,clientM2:2079,lamesM2:1,bordsM2:2,resteM2:182.5,ok:true,calcWarn:0,regleVer:'L513'};
  const d3=_l526Decomp(h3,_l513MatiereOf(h3),null); ok(d3.ok===true&&d3.src==='mat'&&d3.lamesM2===1,'f.mat AVEC decomposition : lue sur l instantane (src=mat) → '+d3.src+' / '+d3.lamesM2);
  const f1=F1(), m1=_l513MatiereOf(f1), c1=_l517Cause(f1), d1=_l526Decomp(f1,m1,c1.mat);
  ok(_l526Diag(f1,d1,c1,10)===''&&_l526Diag(f1,d1,c1,5).indexOf('5,9 % des m²')===0,'seuil : a 10 % rien (EPCO 5,9 %) ; a 5 % la decomposition');
  const fv=V(), mv=_l513MatiereOf(fv), cv=_l517Cause(fv), dv=_l526Decomp(fv,mv,cv.mat);
  ok(/⚠ lame 5 mm sur MAVEG/.test(_l526Diag(fv,dv,cv,50)),'l alerte de reglage lame/machine sort MEME sous le seuil (seuil 50) : un reglage faux est un signal qualite');
}
console.log('── 8. [L526] _l526Decomp sans effet de bord ; une vraie exception est TRACEE (regle 7), jamais avalee ──');
{ const h=F1(); h.mat={perteM2:1,chutesM2:2,dechetM2:0,m2Coupes:9,clientM2:6,ok:true,calcWarn:0,regleVer:'L513'}; const mh=_l513MatiereOf(h);
  const fnc={totalBobines:2,mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[{conf:'',coupee:true,refIdx:0}]}; const mn=_l513MatiereOf(fnc);   /* la source unique est calculee par l APPELANT (comme dans _l517FicheRow) : ses traces sont les siennes */
  global._l505WarnN=7; const before=global._l505Warn; global._l517Replay=false; const w0=warns;
  _l526Decomp(h,mh,null); _l526Decomp(fnc,mn,null);
  ok(global._l505Warn===before&&global._l505WarnN===7&&global._l517Replay!==true&&warns===w0,'traceur et compteur restaures, rejeu MUET (aucune trace emise), _l517Replay jamais pose (la tuile du mois ne voit rien)');
  const d=_l526Decomp(F1(),{get ok(){ throw new Error('boom'); }},null);
  ok(d.ok===false&&d.err.indexOf('boom')>=0&&warns===w0+1&&global._l505Warn===before,'exception forcee : err renseigne, UNE trace emise (regle 7), traceur restaure → '+d.err+' / '+(warns-w0));
  ok(_l526Diag(F1(),d,{ok:true},5).indexOf('décomposition indisponible')===0,'Diagnostic dit « décomposition indisponible … »');
}
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 CSV L517 OK : '+total+' verifications'));
process.exit(fail?1:0);
