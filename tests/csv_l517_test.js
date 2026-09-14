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
const ROW=eval('('+fnOf('_l517FicheRow')+')');
const HDR=(src.match(/const hdr='([^']*)'/)||[])[1].split(';');
const col=(r,n)=>{ const i=HDR.indexOf(n); if(i<0) throw new Error('colonne absente : '+n); return r[i]; };
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const L=(c,x)=>Object.assign({conf:c,useful:2090,blade:5,coupee:true,refIdx:0},x||{});
const F1=()=>({name:'EPCO-1',date:'2026-09-02T08:00:00Z',client:'EPCO pour le 02 09 2026 n°C12345',numCmd:'—',dateLiv:'02/09/2026',ini:'JF',machine:'FEBA',mother:2100,useful:2090,blade:5,longueur:'500',totalBobines:3,tempsStr:'1h 05min 32s (JF — 10/09/2026)',ficheDetail:[L('4x502'),L('3x612'),L('2x157')]});

console.log('── 0. structure : autant de cellules que de colonnes ──');
{ const r=ROW(F1()); ok(r.length===HDR.length,'ligne = '+r.length+' cellules pour '+HDR.length+' colonnes (le test qui manquait : un decalage rend le CSV illisible)'); ok(HDR.length===43,'43 colonnes → '+HDR.length); }
console.log('── 1. cas EPCO mono (4x502 / 3x612 / 2x157, mere 2100, utile 2090, lame 5, 500 m) ──');
{ const r=ROW(F1());
  ok(col(r,'Perte m²')==='185,5','Perte m² = 185,5 (virgule) → '+col(r,'Perte m²'));
  ok(col(r,'Chutes gardées m²')==='885,5','Chutes gardees m² = 885,5 → '+col(r,'Chutes gardées m²'));
  ok(col(r,'m²')===3150,'m² coupes = 3150 (source unique, pas _l471FicheM2) → '+col(r,'m²'));
  ok(col(r,'Perte % (m²)')==='5,9','Perte % (m²) = 185,5 / 3150 = 5,9 → '+col(r,'Perte % (m²)'));
  ok(col(r,'Déchet m²')==='0'&&col(r,'Déchet %')==='0','Dechet m² 0 et Dechet % 0 (vrai zero) → '+col(r,'Déchet m²')+' / '+col(r,'Déchet %'));
  ok(col(r,'m² découpés et livrés')==='2079','m² livres = client 2079 → '+col(r,'m² découpés et livrés'));
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
  ok(['m²','Perte m²','Perte % (m²)','Chutes gardées m²','m² découpés et livrés','Déchet %'].every(n=>col(r,n)===''),'toutes les cellules matiere VIDES (jamais 0)');
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
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 CSV L517 OK : '+total+' verifications'));
process.exit(fail?1:0);
