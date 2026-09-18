// parref_l528_test.js — [L528 · demandes Celine 17/09/2026] GARDE du lecteur pur _l528ParRef (matiere PAR REFERENCE par rejeu de
// _l513Matiere sur des sous-fiches, regle INTACTE), de _l528Livres (m² livres TOUT COMPRIS = bobines meres + rouleaux ♻), de l agregat / des
// lignes du CSV « volumes livres » (12 mois TERMINES), des periodes et du bloc « Chiffres ».
// Vu ROUGE sur L527 (fonctions absentes → fnOf leve). Chiffres verifies par rejeu node des fonctions reelles le 17/09/2026.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.window=global;
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
['parseNum','parseConf','calcStats','_refIdKey','_refKeyOf','_l505HorsPlan','_l507GroupUseful','_l507KeyOf','_l506RefGroupFor','ncLoss','_l513Matiere','_l513MatiereOf','_l526PctM2','_l517Num','_l517NoAcc','_l517ClientNom','_localYM','monthLabelFr','prevMonthsYM','currentMonthYM'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
global._l507Traced=new WeakSet();
let warns=0; global._l505Warn=function(){ warns++; }; global._l505WarnN=0; global._l528BugN=0;   /* [revue adverse] compteur des vraies exceptions des lecteurs L528 (module-level dans index.html) */
global.CLIENT_DATA={'EPCO':[],'VEKA':[],'ACTA':[],'Alphacan 25':[]};
['_l528Livres','_l528ParRef','_l528RefKey','_l528CliNom','_l528Fiches','_l528Win','_l528VolAgg','_l528VolHdr','_l528VolRows','_l528Periodes','_l528Chiffres'].forEach(n=>{ global[n]=eval('('+fnOf(n)+')'); });
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const near=(a,b,eps)=>typeof a==='number'&&Math.abs(a-b)<=(eps==null?0.11:eps);
const L=(c,x)=>Object.assign({conf:c,coupee:true},x||{});
const RA='41313870 - TacFlex® KX1006-1', RB='41317395 - TacFlex® KX1006-1';
const F1=()=>({name:'M',date:'2026-09-03T08:00:00Z',client:'VEKA pour le 03 09 2026 n°1',mother:'1260 / 1080',useful:'1240 / 1060',blade:'5',longueur:'600 / 500',totalBobines:3,
  refGroups:[{ref:RA,mother:1260,edge:10,blade:5,longueur:'600'},{ref:RB,mother:1080,edge:10,blade:0,longueur:'500'}],
  ficheDetail:[L('2x600',{refIdx:0,ref:RA}),L('4x300',{refIdx:0,ref:RA}),L('2x500',{refIdx:1,ref:RB})]});
const F5=()=>({name:'E',date:'2026-08-20T08:00:00Z',client:'EPCO pour le 20 08 2026 n°C12345',ref:'41116929 - TacFlex® DQ1000-1',mother:2100,useful:2090,blade:5,longueur:'500',totalBobines:3,ficheDetail:[L('4x502',{useful:2090,blade:5,refIdx:0}),L('3x612',{useful:2090,blade:5,refIdx:0}),L('2x157',{useful:2090,blade:5,refIdx:0})]});
/* ACTA : F1 + un 3e groupe C (400 ml) coupe UNIQUEMENT dans un rouleau ♻ 500 mm (1x200 → 80 m² livres, residu 300 mm = 120 m² de perte) */
const FA=()=>{ const f=F1(); f.client='ACTA n°7'; f.refGroups.push({ref:'C',mother:1000,edge:10,blade:0,longueur:'400'}); f.ficheDetail.push(L('1x200',{recut:true,rollW:500,refIdx:2,ref:'C'})); return f; };
console.log('── 1. multi-ref A/B : Σ sous-fiches == fiche (m² coupes, livres, perte, chutes) ──');
{ const f=F1(), m=_l513Matiere(f), p=_l528ParRef(f,m);
  ok(m.ok&&m.m2Coupes===2052&&m.clientM2===1940&&m.perteM2===56&&m.chutesM2===56&&m.recutM2===0,'fiche : 2052 / 1940 / 56 / 56, ♻ 0 → '+[m.m2Coupes,m.clientM2,m.perteM2,m.chutesM2,m.recutM2].join(' / '));
  ok(p.ok===true&&p.src==='rejeu'&&p.refs.length===2,'ventilation acceptee (rejeu, 2 references)');
  const a=p.refs[0], b=p.refs[1];
  ok(a.ref===RA&&a.longueur==='600'&&a.m2Coupes===1512&&a.clientM2===1440&&a.livresM2===1440&&a.perteM2===51&&a.chutesM2===21&&a.nMeres===2,'ref A (600 ml) : 1512 / 1440 (livres 1440) / 51 / 21, 2 meres → '+[a.m2Coupes,a.clientM2,a.livresM2,a.perteM2,a.chutesM2,a.nMeres].join(' / '));
  ok(b.ref===RB&&b.m2Coupes===540&&b.clientM2===500&&b.livresM2===500&&b.perteM2===5&&b.chutesM2===35&&b.nMeres===1,'ref B (500 ml) : 540 / 500 (livres 500) / 5 / 35, 1 mere → '+[b.m2Coupes,b.clientM2,b.livresM2,b.perteM2,b.chutesM2].join(' / '));
  ok(a.m2Coupes+b.m2Coupes===m.m2Coupes&&a.clientM2+b.clientM2===m.clientM2&&a.perteM2+b.perteM2===m.perteM2&&a.chutesM2+b.chutesM2===m.chutesM2,'Σ references == fiche, exactement');
  ok(_l528Livres(f,m)===1940,'m² livres tout compris = 1940 (aucun rouleau ♻)'); }
console.log('── 2. metrages non ronds (537 / 913 ml) : derive d arrondi bornee, ventilation ACCEPTEE ──');
{ const f=F1(); f.refGroups[0].longueur='537'; f.refGroups[1].longueur='913'; const m=_l513Matiere(f), p=_l528ParRef(f,m);
  ok(m.m2Coupes===2339&&near(m.clientM2,2201.8,0.01)&&near(m.perteM2,54.8,0.01),'fiche : 2339 / 2201,8 / 54,8 → '+[m.m2Coupes,m.clientM2,m.perteM2].join(' / '));
  ok(p.ok===true&&p.refs[0].m2Coupes===1353&&near(p.refs[0].clientM2,1288.8,0.01)&&near(p.refs[0].perteM2,45.6,0.01)&&p.refs[1].m2Coupes===986&&near(p.refs[1].clientM2,913,0.01)&&near(p.refs[1].perteM2,9.1,0.01),'A 1353 / 1288,8 / 45,6 + B 986 / 913 / 9,1 (perte 54,7 vs 54,8 : arrondi r1 par sous-fiche) → acceptee'); }
console.log('── 3. fiche NON calculable (ref sans metrage) : RIEN par reference, livres null ──');
{ const f=F1(); f.refGroups[1].longueur=''; const m=_l513Matiere(f), p=_l528ParRef(f,m);
  ok(m.ok===false&&p.ok===false&&p.refs.length===0&&_l528Livres(f,m)===null,'fiche !ok → ventilation refusee, 0 reference, livres null (la ref A saine n est PAS publiee)'); }
console.log('── 4. groupe commande mais sans ligne : ABSENT (jamais une ligne a 0) ──');
{ const f=F1(); f.refGroups.push({ref:'C',mother:1000,edge:10,blade:0,longueur:'400'}); const p=_l528ParRef(f,_l513Matiere(f));
  ok(p.ok===true&&p.refs.map(r=>r.gi).join(',')==='0,1','refs gi = 0,1 (le groupe C absent) → '+p.refs.map(r=>r.gi).join(',')); }
console.log('── 5. mono-ref : la fiche est la reference (aucun rejeu) ──');
{ const f=F5(), m=_l513Matiere(f), p=_l528ParRef(f,m);
  ok(p.ok&&p.src==='mono'&&p.refs.length===1&&p.refs[0].gi===-1&&p.refs[0].ref===f.ref&&p.refs[0].longueur==='500'&&p.refs[0].clientM2===2079&&p.refs[0].livresM2===2079&&p.refs[0].m2Coupes===3150&&p.refs[0].nMeres===null,'mono : ref = f.ref, 500 ml, 3150 / 2079 (livres 2079) → '+p.src); }
console.log('── 6. instantane f.mat : divergent du rejeu → refuse ; concordant → accepte ; ancien (sans recutM2) : livres par rejeu muet ──');
{ const f=F1(); f.mat={perteM2:1,chutesM2:2,dechetM2:0,m2Coupes:9,clientM2:6,ok:true,calcWarn:0,regleVer:'L513'}; ok(_l528ParRef(f,_l513MatiereOf(f)).ok===false,'f.mat divergent (9 / 6 / 1) → non ventilable');
  const g=F1(); g.mat=Object.assign({},_l513Matiere(F1())); const p=_l528ParRef(g,_l513MatiereOf(g)); ok(p.ok===true&&p.src==='rejeu','f.mat concordant → ventile par rejeu');
  const h=FA(); const mh=_l513Matiere(FA()); delete mh.recutM2; h.mat=mh; ok(typeof _l513MatiereOf(h).recutM2==='undefined'&&_l528Livres(h,_l513MatiereOf(h))===2020,'instantane ANTERIEUR a L528 avec rouleau ♻ : rejeu muet concordant → 1940 + 80 = 2020');
  const h2=FA(); const mh2=_l513Matiere(FA()); delete mh2.recutM2; mh2.clientM2=1000; h2.mat=mh2; ok(_l528Livres(h2,_l513MatiereOf(h2))===null,'instantane ancien DIVERGENT avec rouleau ♻ : livres null (jamais un chiffre invente)');
  const h3=F1(); const mh3=_l513Matiere(F1()); delete mh3.recutM2; mh3.clientM2=1000; h3.mat=mh3; ok(_l528Livres(h3,_l513MatiereOf(h3))===1000,'instantane ancien SANS ligne ♻ : clientM2 de l instantane, aucun rejeu (recutM2 vaut 0 par construction)'); }
console.log('── 7. rouleau ♻ + bobineau 🗑 : additivite conservee ; les bobineaux du rouleau sont LIVRES (decision Celine 17/09) ──');
{ const f=F1(); f.ficheDetail.push(L('1x100',{recut:true,rollW:300,refIdx:0,ref:RA})); f.ficheDetail[2].ncLots=[{q:1,w:500}]; f.ficheDetail[2].ncLarg=true; f.ficheDetail[2].actDechet=true;
  const m=_l513Matiere(f), p=_l528ParRef(f,m);
  ok(m.m2Coupes===2052&&m.clientM2===1690&&m.perteM2===176&&m.dechetM2===250&&m.recutM2===60,'fiche : 2052 / 1690 / 176, dechet 250, ♻ livres 60 (1x100 sur 600 m) → '+[m.m2Coupes,m.clientM2,m.perteM2,m.dechetM2,m.recutM2].join(' / '));
  ok(p.ok&&p.refs[0].clientM2===1440&&p.refs[0].livresM2===1500&&p.refs[0].perteM2===171&&p.refs[1].clientM2===250&&p.refs[1].livresM2===250&&p.refs[1].perteM2===5,'A 1440 → livres 1500 / 171 (residu ♻ dans SA perte) + B 250 → livres 250 / 5 (500 − 250 jete)');
  ok(_l528Livres(f,m)===1750,'m² livres tout compris = 1690 + 60 = 1750');
  const g=F1(); g.ficheDetail.push(L('1x100',{recut:true,rollW:300,refIdx:0,ref:RA,ncLots:[{q:1,w:100}],ncLarg:true,actDechet:true})); const mg=_l513Matiere(g);
  ok(mg.recutM2===0&&mg.dechetM2===60&&mg.clientM2===1940&&_l528Livres(g,mg)===1940,'bobineau ♻ JETE : ♻ livres 0 (60 − 60), dechet 60, livres tout compris 1940'); }
console.log('── 7b. groupe coupe UNIQUEMENT dans un rouleau ♻ : 0 m² coupe, 80 m² livres, sa perte = le residu ──');
{ const f=FA(), m=_l513Matiere(f), p=_l528ParRef(f,m);
  ok(m.ok&&m.m2Coupes===2052&&m.clientM2===1940&&m.recutM2===80&&m.perteM2===176&&_l528Livres(f,m)===2020,'fiche ACTA : 2052 / 1940, ♻ 80, perte 176 (56 + 120), livres 2020 → '+[m.m2Coupes,m.clientM2,m.recutM2,m.perteM2].join(' / '));
  const c=p.refs.find(r=>r.ref==='C');
  ok(p.ok&&p.refs.length===3&&c&&c.nMeres===0&&c.m2Coupes===0&&c.clientM2===0&&c.livresM2===80&&c.perteM2===120,'ref C : 0 mere, 0 m² coupe, 80 livres, perte 120 → '+(c?[c.nMeres,c.m2Coupes,c.clientM2,c.livresM2,c.perteM2].join(' / '):'absente')); }
console.log('── 8. manque-matiere : seules les lignes coupees ; la sous-fiche herite du perimetre ──');
{ const f=F1(); f.manqueMatiere=true; f.ficheDetail[1].coupee=false; const m=_l513Matiere(f), p=_l528ParRef(f,m);
  ok(m.m2Coupes===1296&&m.clientM2===1220&&p.ok&&p.refs[0].m2Coupes===756&&p.refs[0].clientM2===720&&p.refs[1].m2Coupes===540,'1296 / 1220 = A 756 / 720 + B 540 / 500'); }
{ const f=F1(); f.manqueMatiere=true; f.ficheDetail[2].coupee=false; const m=_l513Matiere(f), p=_l528ParRef(f,m);
  ok(m.ok&&m.m2Coupes===1512&&m.clientM2===1440&&p.ok===true&&p.refs.length===1&&p.refs[0].ref===RA&&p.refs[0].clientM2===1440,'manque-matiere, reference B JAMAIS commencee : la fiche reste ventilee (A seule, 1512 / 1440), B absente — avant : toute la fiche « non ventilable » → '+JSON.stringify({ok:p.ok,n:p.refs.length})); }
console.log('── 8b. cle d article : metrage NUMERIQUE ; une fiche = une fiche ──');
{ ok(_l528RefKey(RA,'1 000')===_l528RefKey(RA,'1000')&&_l528RefKey(RA,'1000,0')===_l528RefKey(RA,'1000')&&_l528RefKey(RA,'600')!==_l528RefKey(RA,'500')&&_l528RefKey(RA,'')===_l528RefKey(RA,null),'« 1 000 », « 1000 », « 1000,0 » = le MEME article ; 600 ≠ 500 ; metrage vide stable');
  const f2=F1(); f2.refGroups[1]={ref:RA,mother:1260,edge:10,blade:5,longueur:'600',lot:2}; f2.refGroups[0].lot=1; f2.ficheDetail[2]=L('2x600',{refIdx:1,ref:RA}); f2.longueur='600 / 600';
  const win=['2026-09']; const C=_l528VolAgg([f2],win); const rows=_l528VolRows(C,win).map(r=>r.join(';')); const lr=rows.find(r=>r.indexOf(RA)>=0)||'';
  ok(rows.filter(r=>r.indexOf(RA)>=0).length===1&&/;1$/.test(lr),'deux groupes du MEME article dans une fiche (réf 1 / réf 2 de L527) : UNE ligne reference, m² additionnes, « Fiches » = 1 (pas 2) → '+lr); }
console.log('── 9. sans effet de bord : rejeu MUET, traceur et compteur restaures ; une vraie exception est TRACEE (regle 7) ──');
{ const f=F1(), m=_l513Matiere(f); const g=F1(); g.refGroups[1].longueur=''; const mg=_l513Matiere(g); const h=FA(); const mh=_l513Matiere(FA()); delete mh.recutM2; h.mat=mh;
  global._l505WarnN=7; const before=global._l505Warn, w0=warns; _l528ParRef(f,m); _l528ParRef(g,mg); _l528Livres(h,_l513MatiereOf(h));
  ok(global._l505Warn===before&&global._l505WarnN===7&&warns===w0,'traceur et compteur restaures, aucune trace emise par les rejeux (ParRef, Livres)');
  { const ft=F1(); delete ft.refGroups[0].edge; let tr=0; const stub=function(){ tr++; global._l505WarnN++; }; global._l505Warn=stub; global._l505WarnN=7; const mt=_l513Matiere(ft); const tr0=tr; global._l505WarnN=7;
    const pt=_l528ParRef(ft,mt); ok(mt.ok&&tr0>0&&pt.ok===true&&tr===tr0&&global._l505WarnN===7&&global._l505Warn===stub,'fixture qui TRACE (bords non renseignes, fiche calculable) : le rejeu par reference n emet AUCUNE trace et ne touche pas au compteur → '+tr0+' trace(s) vives, '+(tr-tr0)+' pendant le rejeu');
    global._l505WarnN=7; _l528ParRef(ft); ok(global._l505WarnN===7,'appel SANS instantane : les traces du calcul vif sont rejouees, le compteur revient a 7 → '+global._l505WarnN);
    const ho=FA(); delete ho.refGroups[0].edge; const mo=_l513Matiere(ho); delete mo.recutM2; ho.mat=mo; const tr1=tr; global._l505WarnN=7; const lv=_l528Livres(ho,_l513MatiereOf(ho)); ok(typeof lv==='number'&&tr===tr1&&global._l505WarnN===7&&global._l505Warn===stub,'_l528Livres sur un instantane ancien avec rouleau ♻ et une fiche qui trace : rejeu MUET, compteur intact → '+lv);
    global._l505Warn=before; global._l505WarnN=7; }
  const pe=_l528ParRef(f,{get ok(){ throw new Error('boom'); }});
  ok(pe.ok===false&&pe.err.indexOf('boom')>=0&&warns===w0+1&&global._l505Warn===before,'exception forcee : err renseigne, UNE trace, traceur restaure → '+pe.err);
  const le=_l528Livres(f,{get ok(){ throw new Error('boum'); }});
  ok(le===null&&warns===w0+2&&global._l505Warn===before,'_l528Livres : exception forcee → null + UNE trace, traceur restaure');
  ok(global._l528BugN===2,'les deux vraies exceptions sont COMPTEES a part (_l528BugN) : l appelant qui restaure le compteur de replis les re-ajoute (regle 7) → '+global._l528BugN); }
console.log('── 10. CSV volumes : agregat + lignes (mois en colonnes, client = total puis references, cellules VIDES) ──');
{ const fNC={name:'NC',date:'2026-09-04T08:00:00Z',client:'VEKA n°2',totalBobines:2,mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[{conf:'',coupee:true,refIdx:0}]};
  const fDiv=F1(); fDiv.client='VEKA n°3'; fDiv.mat={perteM2:1,chutesM2:2,dechetM2:0,m2Coupes:9,clientM2:6,ok:true,calcWarn:0,regleVer:'L513'};
  const fOld=Object.assign(F5(),{date:'2025-01-05T08:00:00Z',client:'EPCO n°9'}); const fRef=Object.assign(F1(),{valide:false}); const fDel=Object.assign(F1(),{deleted:true});
  const win=['2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09'];
  const C=_l528VolAgg([F1(),F5(),fNC,fDiv,fOld,fRef,fDel,FA()],win); const rows=_l528VolRows(C,win); const hdr=_l528VolHdr(win);
  const X=(cli,ref,lg,map,tot,n)=>[cli,ref,lg].concat(win.map(ym=>(map[ym]==null?'':map[ym]))).concat([tot,n]).join(';');
  ok(hdr.length===17&&rows.every(r=>r.length===17),'17 cellules par ligne = 3 + 12 mois + Total + Fiches → '+hdr.length+' / '+rows.map(r=>r.length).join(','));
  ok(hdr.slice(0,3).join(';')==='Client;Référence;Longueur (m)'&&hdr[3]==='2025-10'&&hdr[14]==='2026-09'&&hdr.slice(15).join(';')==='Total m²;Fiches','en-tete : Client;Référence;Longueur (m);2025-10…2026-09;Total m²;Fiches');
  const J=rows.map(r=>r.join(';'));
  ok(J[0]===X('ACTA','TOTAL CLIENT','',{'2026-09':'2020'},'2020',1),'ACTA total : 2020 en 2026-09 (1940 meres + 80 rouleau ♻), 1 fiche → '+J[0]);
  ok(J[1]===X('ACTA',RA,'600',{'2026-09':'1440'},'1440',1)&&J[2]===X('ACTA',RB,'500',{'2026-09':'500'},'500',1)&&J[3]===X('ACTA','C','400',{'2026-09':'80'},'80',1),'ACTA references : A 1440, B 500, C 80 (coupee dans un rouleau ♻ seulement : PRESENTE) → '+J[3]);
  ok(J[4]===X('EPCO','TOTAL CLIENT','',{'2026-08':'2079'},'2079',1),'EPCO total : 2079 en 2026-08, cellules vides ailleurs (jamais 0), 1 fiche → '+J[4]);
  ok(J[5]===X('EPCO','41116929 - TacFlex® DQ1000-1','500',{'2026-08':'2079'},'2079',1),'EPCO ref DQ1000-1 500 ml : 2079 → '+J[5]);
  ok(J[6]===X('VEKA','TOTAL CLIENT','',{'2026-09':'1946'},'1946',2),'VEKA total = somme des FICHES (1940 + 6 instantane divergent), 2 fiches chiffrees → '+J[6]);
  ok(J[7]===X('VEKA',RA,'600',{'2026-09':'1440'},'1440',1)&&J[8]===X('VEKA',RB,'500',{'2026-09':'500'},'500',1),'les deux KX1006-1 (600 / 500 ml) sont DEUX lignes : 1440 et 500');
  ok(J[9]===X('VEKA','(non ventilé par référence)','',{'2026-09':'6'},'6',1),'fiche calculable non ventilable : ligne a part (6 m²), le total client reste complet → '+J[9]);
  ok(J[10]===X('VEKA','(non chiffrable : 1 fiche(s), m² inconnus)','',{},'',1),'fiche non calculable : ligne VISIBLE, cellules VIDES (jamais 0) → '+J[10]);
  ok(J[11]===X('TOTAL GÉNÉRAL','','',{'2026-08':'2079','2026-09':'3966'},'6045',4),'total general 2079 / 3966 / 6045, 4 fiches → '+J[11]);
  ok(rows.length===12,'fiche hors fenetre (2025-01), fiche REFUSEE et fiche supprimee ABSENTES : 12 lignes → '+rows.length); }
console.log('── 11. fenetre et periodes : 12 mois TERMINES, mois en cours (provisoire), trimestres civils, chaque mois ──');
{ const w=_l528Win(); ok(w.length===12&&w.indexOf(currentMonthYM())<0&&w[0]===prevMonthsYM(2)[1]&&w[11]===prevMonthsYM(13)[12],'_l528Win : 12 mois, le mois en cours EXCLU, du mois dernier au 12e → '+w[0]+' … '+w[11]);
  const win=['2026-09','2026-08','2026-07','2026-06','2026-05','2026-04','2026-03','2026-02','2026-01','2025-12','2025-11','2025-10']; const P=_l528Periodes(win,'2026-10');
  ok(P[0].v==='ALL'&&P[0].mois.length===12&&P[0].mois[0]==='2025-10'&&/terminés/.test(P[0].lbl),'ALL = 12 mois terminés, croissants → '+P[0].lbl);
  ok(P[1].v==='2026-10'&&/mois en cours \(provisoire\)/.test(P[1].lbl)&&P[1].mois.join(',')==='2026-10','puis le mois en cours, marque provisoire → '+P[1].lbl);
  ok(P[2].v==='Q:2026-T3'&&P[2].lbl==='T3 2026'&&P[2].mois.join(',')==='2026-07,2026-08,2026-09'&&P[5].v==='Q:2025-T4','T3 2026 = juil./aout/sept. ; 4 trimestres → '+P.slice(2,6).map(p=>p.v).join(','));
  ok(P[6].v==='2026-09'&&P[17].v==='2025-10'&&P.length===18,'puis les 12 mois termines du plus recent au plus ancien → '+P.length);
  const P2=_l528Periodes(['2026-10','2026-09','2026-08'],''); ok(/partiel : 1 mois/.test(P2.find(p=>p.v==='Q:2026-T4').lbl)&&P2[1].v==='Q:2026-T4','trimestre incomplet dans la fenetre : « partiel » ; sans mois en cours : pas d entree provisoire'); }
console.log('── 12. bloc Chiffres : client / reference / periode ; null (jamais 0) sans fiche chiffree ──');
{ const fNC={name:'NC',date:'2026-09-04T08:00:00Z',client:'VEKA n°2',totalBobines:2,mother:2100,useful:2090,blade:0,longueur:'500',ficheDetail:[{conf:'',coupee:true,refIdx:0}]};
  const fDiv=F1(); fDiv.client='VEKA n°3'; fDiv.mat={perteM2:1,chutesM2:2,dechetM2:0,m2Coupes:9,clientM2:6,ok:true,calcWarn:0,regleVer:'L513'};
  const ALL=[F1(),F5(),fNC,fDiv,Object.assign(F5(),{date:'2025-01-05T08:00:00Z'}),Object.assign(F1(),{valide:false}),FA()];
  const asc=['2025-10','2025-11','2025-12','2026-01','2026-02','2026-03','2026-04','2026-05','2026-06','2026-07','2026-08','2026-09'];
  const a=_l528Chiffres(ALL,'VEKA','',asc); ok(a.n===3&&a.nOk===2&&a.nNC===1&&a.m2Coupes===2061&&a.clientM2===1946&&a.livresM2===1946&&a.perteM2===57,'VEKA, toutes refs, 12 mois : 3 fiches (1 non chiffrable) → 2061 / 1946 (livres 1946) / 57 → '+JSON.stringify(a));
  const b=_l528Chiffres(ALL,'VEKA',_l528RefKey(RA,'600'),['2026-09']); ok(b.n===2&&b.nOk===1&&b.nNV===1&&b.m2Coupes===1512&&b.clientM2===1440&&b.livresM2===1440&&b.perteM2===51,'VEKA × KX1006-1 600 ml × sept. 2026 : 1512 / 1440 / 51, 1 non ventilable → '+JSON.stringify(b));
  const c=_l528Chiffres(ALL,'VEKA',_l528RefKey(RB,'500'),['2026-07','2026-08','2026-09']); ok(c.m2Coupes===540&&c.clientM2===500&&c.perteM2===5,'VEKA × KX1006-1 500 ml × T3 : 540 / 500 / 5');
  const d=_l528Chiffres(ALL,'EPCO','',['2026-09']); ok(d.n===0&&d.m2Coupes===null&&d.clientM2===null&&d.livresM2===null&&d.perteM2===null,'EPCO × sept. 2026 : aucune fiche → null partout (jamais 0)');
  const e=_l528Chiffres(ALL,'','',asc); ok(e.n===5&&e.nOk===4&&e.m2Coupes===7263&&near(e.clientM2,5965)&&near(e.livresM2,6045)&&near(e.perteM2,418.5),'tous clients, 12 mois : 7263 / 5965 (livres 6045) / 418,5 → '+JSON.stringify(e));
  const g=_l528Chiffres(ALL,'ACTA',_l528RefKey('C','400'),['2026-09']); ok(g.nOk===1&&g.m2Coupes===0&&g.clientM2===0&&g.livresM2===80&&g.perteM2===120&&_l526PctM2(g.perteM2,g.m2Coupes)===null,'ACTA × C (rouleau ♻ seul) : 0 coupe, 80 livres, perte 120, % sans denominateur → null → '+JSON.stringify(g));
  { const fc=F1(); fc.client='VEKA n°8'; fc.refGroups.push({ref:'C',mother:1000,edge:10,blade:0,longueur:'400'}); const h=_l528Chiffres([fc],'VEKA',_l528RefKey('C','400'),['2026-09']); ok(h.n===0&&h.nOk===0&&h.m2Coupes===null,'reference COMMANDEE mais jamais coupee : 0 fiche (avant : « 1 fiche(s) » et trois tirets sans explication) → '+JSON.stringify(h)); }
  { const hd=FA(); const mh=_l513Matiere(FA()); delete mh.recutM2; mh.clientM2=1000; hd.mat=mh; const z=_l528Chiffres([hd],'','',['2026-09']); ok(z.n===1&&z.nOk===1&&z.nRC===1&&z.m2Coupes===2052&&z.perteM2===176&&z.clientM2===1000&&z.livresM2===null,'rouleaux ♻ non chiffrables (instantane ancien divergent) : m² coupes et perte COMPTES (meme base que les tuiles KPI), seuls les m² livres restent inconnus → '+JSON.stringify(z)); }
  ok(_l526PctM2(b.perteM2,b.m2Coupes)===3.4,'% du bloc = _l526PctM2(51 / 1512) = 3,4 (meme definition que tuiles et CSV)');
  ok(_l528CliNom({client:'VEKA pour le 03 09 2026 n°1'})==='VEKA'&&_l528CliNom({client:'Commande ZZZ du 3'})==='Commande ZZZ du 3'&&_l528CliNom({client:'—'})==='—','nom seul par le catalogue, sinon texte brut VISIBLE, sinon —'); }
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 PAR REFERENCE L528 OK : '+total+' verifications'));
process.exit(fail?1:0);
