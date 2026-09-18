// livres_l530_test.js — [L530 · decisions Celine 18/09/2026] TROIS MOTS, UN SEUL SENS CHACUN :
//   « m² coupés (bobines mères) » = surface des bobines meres passees en machine (m2Coupes, inchange) ;
//   « m² découpés (bobineaux) »   = bons bobineaux produits (clientM2 + recutM2 : meres + rouleaux ♻, quantite en trop COMPRISE) ;
//   « m² livrés »                 = m² decoupes − quantite en trop partie au stock + bobineaux PRIS du stock (toujours de la longueur de la reference).
// GARDE : surplusM2 de _l513Matiere (quantite en trop SEULE, condition exacte de L446), _l530ChutesOfGroup / _l530Stock (rejeu du plafond de stock
// sur une fiche archivee, accepte seulement s il retombe sur f.chutesStock), _l530Surplus / _l530Bilan, ventilation par reference (une reference
// ENTIEREMENT servie par le stock reste visible), bloc Chiffres. Vu ROUGE sur L529 (fonctions absentes).
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.window=global;
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
['parseNum','parseConf','calcStats','_refIdKey','_refKeyOf','_l505HorsPlan','_l507GroupUseful','_l507KeyOf','_l506RefGroupFor','ncLoss','_l513Matiere','_l513MatiereOf','_l526PctM2','_l517Num','_l517NoAcc','_l517ClientNom','_localYM','monthLabelFr','prevMonthsYM','currentMonthYM','computeChutesUsed','_sanStoredRows'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
global._l507Traced=new WeakSet();
let warns=0; global._l505Warn=function(){ warns++; }; global._l505WarnN=0; global._l528BugN=0;
global.CLIENT_DATA={'EPCO':[],'VEKA':[]};
['_l528Livres','_l530ChutesOfGroup','_l530Stock','_l530Surplus','_l530Bilan','_l528ParRef','_l528RefKey','_l528CliNom','_l528Fiches','_l528VolAgg','_l528VolHdr','_l528VolRows','_l528Chiffres'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const L=(c,x)=>Object.assign({conf:c,coupee:true},x||{});
const RA='41313870 - TacFlex® KX1006-1', RB='41317395 - TacFlex® KX1006-1';
/* mono : utile 1000, lame 0, 500 m, UNE bobine 15x65 (commande 13x65 : 2 bobineaux EN TROP, dans la configuration — habitude de saisie confirmee par le code L425/L426) */
const FQ=(x)=>({name:'Q',date:'2026-08-05T08:00:00',client:'EPCO n°1',ref:'DQ',mother:1010,useful:1000,blade:0,longueur:'500',totalBobines:1,ficheDetail:[L('15x65',Object.assign({refIdx:0,ncQty:true,ncLots:[{q:2,w:65}],actChutes:true},x||{}))]});
const F1=()=>({name:'M',date:'2026-08-12T08:00:00',client:'VEKA pour le 12 08 2026 n°1',mother:'1260 / 1080',useful:'1240 / 1060',blade:'5',longueur:'600 / 500',totalBobines:3,
  refGroups:[{ref:RA,mother:1260,edge:10,blade:5,longueur:'600',rows:[{qty:8,width:600}],chutes:[]},{ref:RB,mother:1080,edge:10,blade:0,longueur:'500',rows:[{qty:2,width:500}],chutes:[]}],
  ficheDetail:[L('2x600',{refIdx:0,ref:RA}),L('4x300',{refIdx:0,ref:RA}),L('2x500',{refIdx:1,ref:RB})]});

console.log('── 1. _l513Matiere : surplusM2 = quantite en trop SEULE (condition exacte de L446), plafonnee a la production de la ligne ──');
{ const f=FQ(), m=_l513Matiere(f);
  ok(m.ok&&m.clientM2===487.5&&m.surplusM2===65&&m.surplusInc===0,'15x65 sur 500 m, 2x65 en trop : clientM2 487,5 (inchange, surplus DEDANS) · surplusM2 65 → '+[m.clientM2,m.surplusM2,m.surplusInc].join(' / '));
  ok(f.ficheDetail[0].ncLarg===undefined,'la ligne de la fiche n est PAS modifiee par le calcul (drapeau rendu)');
  const m2=_l513Matiere(FQ({ncLarg:true})); ok(m2.surplusM2===0&&m2.clientM2===422.5,'quantite en trop + DEFAUT de largeur : deja sortie de clientM2 par la regle ✂ (422,5) → surplus 0, jamais compte deux fois → '+[m2.clientM2,m2.surplusM2].join(' / '));
  const m3=_l513Matiere(FQ({actAccept:true})); ok(m3.surplusM2===0&&m3.surplusInc===0&&m3.clientM2===487.5,'« + Acceptable » (archives) : le bobineau part AVEC la commande → rien a retirer');
  const m4=_l513Matiere(FQ({ncLots:undefined,ncDetail:'deux de plus'})); ok(m4.surplusM2===0&&m4.surplusInc===1,'quantite en trop NON chiffree (commentaire libre) : 0 retire et COMPTEE a part (surplusInc 1) → '+[m4.surplusM2,m4.surplusInc].join(' / '));
  const m4b=_l513Matiere(FQ({ncLots:undefined,ncDetail:'2x65 en trop sur 13x65 commandes'})); ok(m4b.surplusM2===0&&m4b.surplusInc===1,'[revue adverse] chiffrage lu dans un COMMENTAIRE LIBRE (« 2x65 en trop sur 13x65 ») : la phrase contient deux « q×w », toute la ligne etait retiree des m² livres → seules les saisies STRUCTUREES (lots, quantite × largeur) sont chiffrees, le reste est « non chiffre » → '+[m4b.surplusM2,m4b.surplusInc].join(' / '));
  const m4c=_l513Matiere(FQ({ncLots:undefined,ncQtyVal:'2',ncWidthVal:'65'})); ok(m4c.surplusM2===65&&m4c.surplusInc===0,'saisie structuree par la paire quantite × largeur (L400) : chiffree comme les lots');
  const m5=_l513Matiere(FQ({ncLots:[{q:100,w:65}]})); ok(m5.surplusM2===487.5,'chiffrage aberrant (100x65) : plafonne a la production de la ligne → '+m5.surplusM2);
  const f6={name:'R',date:'2026-08-05T08:00:00',client:'EPCO n°2',mother:2100,useful:2090,blade:0,longueur:'500',totalBobines:1,ficheDetail:[L('2x157',{useful:2090,refIdx:0}),L('4x100',{recut:true,rollW:500,refIdx:0,ncQty:true,ncLots:[{q:1,w:100}],actChutes:true})]}; const m6=_l513Matiere(f6);
  ok(m6.recutM2===200&&m6.surplusM2===50,'rouleau ♻ 4x100 dont 1x100 en trop : recutM2 200 (decoupes) · surplusM2 50 → '+[m6.recutM2,m6.surplusM2].join(' / '));
  const m7=_l513Matiere({mother:2100,useful:2090,blade:0,ficheDetail:[L('4x502',{useful:2090})]}); ok(m7.ok===false&&m7.surplusM2===null,'fiche non calculable : surplusM2 null, jamais 0'); }
console.log('── 2. bobineaux PRIS du stock : rejeu du plafond sur un groupe archive ──');
{ const g={mother:2090,edge:10,rows:[{qty:30,width:300},{qty:4,width:1240}],chutes:[{width:300,qty:5}]};
  ok(JSON.stringify(_l530ChutesOfGroup(g))==='{"300":5}'&&JSON.stringify(computeChutesUsed(g))==='{}','le groupe archive n a PAS de laize utile : appel direct du moteur → {} en silence ; avec la laize recomposee → {"300":5}');
  ok(JSON.stringify(_l530ChutesOfGroup(Object.assign({},g,{chutes:[{width:300,qty:99},{width:1240,qty:1},{width:9999,qty:2}]})))==='{"300":30,"1240":1}','plafonne par la commande (99 → 30), largeur hors laize ignoree');
  ok(JSON.stringify(_l530ChutesOfGroup(Object.assign({},g,{rows:[{qty:'30',width:'300'},{qty:'2',width:'300'}],chutes:[{width:'300',qty:'40'}]})))==='{"300":32}','valeurs en CHAINES (archives anciennes) assainies : 30 + 2 = 32, pas « 0302 »');
  ok(JSON.stringify(_l530ChutesOfGroup(null))==='{}'&&JSON.stringify(_l530ChutesOfGroup({rows:[],chutes:[{width:100,qty:2}]}))==='{}','groupe absent / bloc sans ligne → rien'); }
console.log('── 3. _l530Stock : m² des bobineaux pris du stock (longueur = celle de la reference, confirme par Celine) ──');
{ const f=FQ(); f.chutesStock={'65':3}; const s=_l530Stock(f,_l513Matiere(f));
  ok(s.ok&&s.m2===97.5&&s.src==='mono'&&s.pieces===3,'mono : 3x65 sur 500 m = 97,5 m² → '+JSON.stringify(s));
  const s0=_l530Stock(FQ(),_l513Matiere(FQ())); ok(s0.ok&&s0.m2===0&&s0.src==='aucun','aucun bobineau pris du stock : VRAI zero');
  const fm=F1(); fm.refGroups[0]={ref:RA,mother:1240,edge:10,blade:5,longueur:'1000',rows:[{qty:10,width:152}],chutes:[{width:152,qty:3}]}; fm.refGroups[1]={ref:RB,mother:2100,edge:10,blade:0,longueur:'700',rows:[{qty:4,width:152}],chutes:[{width:152,qty:6}]};
  fm.ficheDetail=[L('7x152',{refIdx:0,ref:RA})]; fm.totalBobines=1; fm.chutesStock={'152':7}; const sm=_l530Stock(fm,_l513Matiere(fm));
  ok(sm.ok&&sm.src==='ventile'&&sm.m2===881.6&&sm.parRef[0].m2===456&&sm.parRef[1].m2===425.6&&sm.parRef[1].pieces===4,'multi, metrages DIFFERENTS : A 3x152x1000 = 456 + B 4x152x700 (6 declares, plafonnes a 4) = 425,6 → 881,6 → '+JSON.stringify({m2:sm.m2,src:sm.src}));
  const fd=JSON.parse(JSON.stringify(fm)); fd.chutesStock={'152':5}; const sd=_l530Stock(fd,_l513Matiere(fd)); ok(sd.ok===false&&sd.m2===null,'le rejeu ne retombe PAS sur f.chutesStock et les metrages different → INCONNU (null), jamais un chiffre invente');
  const fu=JSON.parse(JSON.stringify(fd)); fu.refGroups[1].longueur='1000'; fu.longueur='1000 / 1000'; const su=_l530Stock(fu,_l513Matiere(fu)); ok(su.ok&&su.src==='metrage-unique'&&su.m2===760&&su.parRef===null,'meme divergence mais UN seul metrage : total connu (5x152x1000 = 760), sans ventilation par reference');
  const sk=_l530Stock({chutesStock:{'100':1},ficheDetail:[]},{ok:false}); ok(sk.ok===false,'fiche non calculable → stock inconnu'); }
console.log('── 4. _l530Bilan : m² livres = m² decoupes − quantite en trop + pris du stock ──');
{ const f=FQ(); f.chutesStock={'65':3}; const b=_l530Bilan(f,_l513Matiere(f));
  ok(b.ok&&b.decoupesM2===487.5&&b.surplusM2===65&&b.stockM2===97.5&&b.livresM2===520,'487,5 decoupes − 65 en trop (au stock) + 97,5 pris du stock = 520 livres → '+JSON.stringify(b));
  const b0=_l530Bilan(FQ({ncQty:false,ncLots:undefined,actChutes:false})); ok(b0.ok&&b0.decoupesM2===487.5&&b0.livresM2===487.5&&b0.surplusM2===0&&b0.stockM2===0,'ni quantite en trop ni stock : livres = decoupes');
  const h=FQ(); const mh=_l513Matiere(FQ()); delete mh.surplusM2; delete mh.surplusInc; h.mat=mh; const bh=_l530Bilan(h,_l513MatiereOf(h)); ok(bh.ok&&bh.surplusM2===65&&bh.livresM2===422.5,'instantane ANTERIEUR a L530 (sans surplusM2) avec une quantite en trop : rejeu muet concordant → 422,5');
  const h2=FQ(); const mh2=_l513Matiere(FQ()); delete mh2.surplusM2; delete mh2.surplusInc; mh2.clientM2=100; h2.mat=mh2; const bh2=_l530Bilan(h2,_l513MatiereOf(h2)); ok(bh2.ok===false&&bh2.livresM2===null&&bh2.decoupesM2===100,'instantane ancien DIVERGENT : m² livres inconnus (null), m² decoupes de l instantane conserves');
  const h3=FQ({ncQty:false,ncLots:undefined,actChutes:false}); const mh3=_l513Matiere(h3); delete mh3.surplusM2; delete mh3.surplusInc; h3.mat=mh3; const w0=warns, n0=global._l505WarnN; const bh3=_l530Bilan(h3,_l513MatiereOf(h3)); ok(bh3.ok&&bh3.surplusM2===0&&warns===w0&&global._l505WarnN===n0,'instantane ancien SANS ligne en quantite en trop : 0 par construction, aucun rejeu, aucune trace');
  const bk=_l530Bilan({ficheDetail:[]},{ok:false}); ok(bk.ok===false&&bk.livresM2===null&&bk.decoupesM2===null,'fiche non calculable → tout null'); }
console.log('── 5. par reference : une reference ENTIEREMENT servie par le stock reste visible ──');
{ const f=F1(); f.refGroups.push({ref:'C-STOCK',mother:1000,edge:10,blade:0,longueur:'400',rows:[{qty:2,width:100}],chutes:[{width:100,qty:2}]}); f.chutesStock={'100':2};
  const m=_l513Matiere(f), p=_l528ParRef(f,m), b=_l530Bilan(f,m); const c=p.refs.find(r=>r.ref==='C-STOCK');
  ok(b.ok&&b.decoupesM2===1940&&b.stockM2===80&&b.livresM2===2020,'fiche : 1940 decoupes + 80 pris du stock (2x100 sur 400 m) = 2020 livres → '+JSON.stringify({d:b.decoupesM2,s:b.stockM2,l:b.livresM2}));
  ok(p.ok&&p.refs.length===3&&!!c&&c.nMeres===0&&c.m2Coupes===0&&c.decoupesM2===0&&c.stockM2===80&&c.livresM2===80&&c.perteM2===0,'reference C sans AUCUNE bobine coupee (tout vient du stock) : presente, 0 coupe / 0 decoupe / 80 livres → '+(c?JSON.stringify({d:c.decoupesM2,s:c.stockM2,l:c.livresM2}):'absente'));
  const a=p.refs[0]; ok(a.decoupesM2===1440&&a.livresM2===1440&&a.stockM2===0&&a.surplusM2===0,'reference A : decoupes = livres = 1440');
  const g=JSON.parse(JSON.stringify(f)); g.chutesStock={'100':1}; ok(_l528ParRef(g,_l513Matiere(g)).ok===false,'stock non rattachable par reference (le rejeu ne retombe pas sur f.chutesStock) → fiche « non ventilable », jamais une repartition inventee'); }
console.log('── 6. bloc Chiffres et CSV volumes : les trois notions ──');
{ const f=F1(); f.refGroups.push({ref:'C-STOCK',mother:1000,edge:10,blade:0,longueur:'400',rows:[{qty:2,width:100}],chutes:[{width:100,qty:2}]}); f.chutesStock={'100':2};
  const q=FQ(); q.chutesStock={'65':3}; q.client='VEKA n°4';
  const r=_l528Chiffres([f,q],'VEKA','',['2026-08']);
  ok(r.n===2&&r.nOk===2&&r.m2Coupes===2557&&r.decoupesM2===2427.5&&r.surplusM2===65&&r.stockM2===177.5&&r.livresM2===2540,'VEKA août : 2557 coupes · 2427,5 decoupes · − 65 en trop · + 177,5 pris du stock · = 2540 livres → '+JSON.stringify(r));
  const rc=_l528Chiffres([f,q],'VEKA',_l528RefKey('C-STOCK','400'),['2026-08']); ok(rc.n===1&&rc.nOk===1&&rc.livresM2===80&&rc.decoupesM2===0&&rc.stockM2===80,'filtre sur la reference servie par le stock : 1 fiche, 80 livres');
  const q2=FQ({ncLots:undefined,ncDetail:'deux de plus'}); q2.client='VEKA n°5'; const r2=_l528Chiffres([q2],'VEKA','',['2026-08']); ok(r2.nQT===1&&r2.livresM2===487.5,'quantite en trop NON chiffree : les m² livres sont donnes SANS retrait et la fiche est COMPTEE a part (nQT 1) — le bloc le dit');
  const r3=_l528Chiffres([q2],'VEKA',_l528RefKey('DQ','500'),['2026-08']); ok(r3.nQT===1&&r3.nOk===1,'[revue adverse] sous un filtre par REFERENCE, la quantite en trop non chiffree reste signalee (nQT) → '+JSON.stringify({nQT:r3.nQT,nOk:r3.nOk}));
  const fk=JSON.parse(JSON.stringify(f)); fk.chutesStock={'100':1}; fk.client='VEKA n°6'; const r4=_l528Chiffres([fk,q],'VEKA','',['2026-08']);
  ok(r4.nRC===1&&r4.livresM2===null&&r4.decoupesM2===2427.5&&r4.m2Coupes===2557,'[revue adverse] une fiche dont les m² LIVRES sont inconnus (stock non rattachable) n efface plus les m² DECOUPES, qui sont connus → '+JSON.stringify({nRC:r4.nRC,livres:r4.livresM2,decoupes:r4.decoupesM2}));
  const ho=FQ(); const mo=_l513Matiere(FQ()); delete mo.surplusM2; delete mo.surplusInc; mo.clientM2=487; ho.mat=mo; const po=_l528ParRef(ho,_l513MatiereOf(ho));
  ok(po.ok===true&&po.refs[0].livresM2===null&&po.refs[0].m2Coupes===505&&po.refs[0].decoupesM2===487,'[revue adverse] fiche mono dont seuls les m² LIVRES sont inconnus (instantane ancien divergent + quantite en trop) : m² coupes, perte et m² decoupes par reference restent donnes → '+JSON.stringify(po.refs[0]||{}));
  const win=['2026-08']; const rows=_l528VolRows(_l528VolAgg([f,q],win),win).map(x=>x.join(';'));
  ok(_l528VolHdr(win).join(';')==='Client;Référence;Longueur (m);2026-08;Total m² livrés;Fiches','en-tete du CSV volumes : « Total m² livrés »');
  ok(rows[0]==='VEKA;TOTAL CLIENT;;2540;2540;2'&&rows.some(x=>x==='VEKA;C-STOCK;400;80;80;1')&&rows.some(x=>x==='VEKA;DQ;500;520;520;1'),'CSV volumes : total client 2540 (= somme des fiches), la reference servie par le stock a sa ligne (80), la fiche mono 520 → '+rows.join(' | ')); }
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 LIVRES L530 OK : '+total+' verifications'));
process.exit(fail?1:0);
