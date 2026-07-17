// pm130_test.js — L130 : plan manuel · #1 homonymes 2 machines (rattachement injectif) + #2 réf ajoutée
// après passage en manuel (vue par la cohérence). Extraction RÉELLE des fonctions du source.
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0; const ok=(c,m)=>{console.log((c?'✅ ':'❌ ')+m);if(!c)fail++;};

// stubs partagés
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.parseConf=s=>String(s||'').split('+').map(t=>{const m=t.trim().match(/(\d+)\s*[x×]\s*(\d+)/);return m?{qty:+m[1],width:+m[2]}:null;}).filter(Boolean);
global.computeChutesUsed=()=>({});
global.fmt=v=>String(v);
for(const n of ['_refIdKey','_pmSameJob','_pmFindGroup','_pmFindEntry','planManualCoherence','calcStats','planCoherenceText']) global[n]=eval('('+fnOf(n)+')');

// ── #1 : deux blocs même réf (même film/veka/longueur/useful/blade) sur DEUX machines ──
const gMav={ref:'PVC-100',film:'F',veka:'V',longueur:'800',useful:1200,blade:0,machine:'MAVEG',rows:[{qty:4,width:300}]};
const gCev={ref:'PVC-100',film:'F',veka:'V',longueur:'800',useful:1200,blade:0,machine:'CEVENINI',rows:[{qty:4,width:300}]};
ok(_refIdKey(gMav)===_refIdKey(gCev),'les deux blocs ont un refIdKey IDENTIQUE (la machine n\'est pas dans la clé)');
// planManual = [entréeMAVEG, entréeCEVENINI], l'opérateur a édité MAVEG
global.planManual=[
  {ref:'PVC-100',film:'F',veka:'V',longueur:'800',useful:1200,blade:0,machine:'MAVEG',refIdKey:_refIdKey(gMav),bobines:[{count:1,conf:'4×300'}]},
  {ref:'PVC-100',film:'F',veka:'V',longueur:'800',useful:1200,blade:0,machine:'CEVENINI',refIdKey:_refIdKey(gCev),bobines:[{count:1,conf:'4×300'}]},
];
// _pmFindEntry pour le groupe CEVENINI (index 1) DOIT renvoyer l'entrée CEVENINI, pas la 1re (MAVEG)
const eCev=_pmFindEntry(gCev,1);
ok(eCev&&eCev.machine==='CEVENINI','#1 _pmFindEntry(groupe CEVENINI) → entrée CEVENINI (avant : renvoyait MAVEG = fiche croisée)');
const eMav=_pmFindEntry(gMav,0);
ok(eMav&&eMav.machine==='MAVEG','#1 _pmFindEntry(groupe MAVEG) → entrée MAVEG');
// _pmFindGroup symétrique : l'entrée CEVENINI doit retrouver le groupe CEVENINI
const cur=[gMav,gCev];
const gg=_pmFindGroup(planManual[1],1,cur);
ok(gg&&gg.machine==='CEVENINI','#1 _pmFindGroup(entrée CEVENINI) → groupe CEVENINI (adaptation/archive non croisées)');
// non-régression : réf unique (pas de collision) → toujours trouvée
global.planManual=[{ref:'SOLO',film:'',veka:'',longueur:'500',useful:1000,blade:2,machine:'FEBA',refIdKey:_refIdKey({ref:'SOLO',longueur:'500',useful:1000,blade:2}),bobines:[]}];
ok(_pmFindEntry({ref:'SOLO',longueur:'500',useful:1000,blade:2,machine:'FEBA'},0)!=null,'non-régression : réf unique toujours rattachée');

// ── #2 : réf AJOUTÉE après passage en manuel (absente de planManual) ──
global.planManual=[planManual[0]];   // manuel figé sur la 1re réf seulement
const refGroups=[
  {ref:'SOLO',film:'',veka:'',longueur:'500',useful:1000,blade:2,machine:'FEBA',rows:[{qty:6,width:400}]},   // rattachée
  {ref:'AJOUT-B',film:'',veka:'',longueur:'600',useful:1000,blade:2,machine:'FEBA',rows:[{qty:10,width:250}]},// AJOUTÉE après
];
global.planManual[0]={ref:'SOLO',film:'',veka:'',longueur:'500',useful:1000,blade:2,machine:'FEBA',refIdKey:_refIdKey(refGroups[0]),bobines:[{count:3,conf:'2×400'}]};   // 3 bobines de 2×400 = 6×400 (couvre la commande), chaque bobine 802 ≤ 1000 (tient)
const coh=planManualCoherence(planManual,refGroups);
const manqueB=coh.filter(x=>x.diff>0&&/AJOUT-B/.test(x.ref));
ok(manqueB.length>0,'#2 la réf ajoutée produit un écart diff>0 (avant : invisible → badge « ✓ plan=commande » faux)');
ok(manqueB.some(x=>x.width===250&&x.diff===10),'#2 écart = TOUTE la quantité commandée non planifiée (10×250, couverture 0)');
// la réf rattachée équilibrée ne doit PAS générer de faux manque
ok(!coh.some(x=>/SOLO/.test(x.ref)&&x.diff>0),'#2 la réf rattachée et équilibrée ne crée pas de faux écart');

// ── [L132 revue] réf AJOUTÉE mais COUVERTE par des chutes en stock → PAS de faux manque ──
global.computeChutesUsed=g=>(g&&/AJOUT-B/.test(g.ref))?{250:10}:{};   // 10×250 déjà en stock (bobineaux à la bonne largeur)
const coh2=planManualCoherence(planManual,refGroups);
ok(!coh2.some(x=>/AJOUT-B/.test(x.ref)&&x.diff>0),'#1(revue) réf ajoutée entièrement couverte par chutes → aucun faux manque (chiffre cohérent avec la 1re boucle)');
global.computeChutesUsed=g=>(g&&/AJOUT-B/.test(g.ref))?{250:4}:{};   // couverture PARTIELLE : 4 sur 10
const coh3=planManualCoherence(planManual,refGroups);
ok(coh3.some(x=>/AJOUT-B/.test(x.ref)&&x.width===250&&x.diff===6),'#1(revue) couverture partielle par chutes → manque = part NON couverte (6×250, pas 10)');
global.computeChutesUsed=()=>({});

// ── [L140 audit #5] motif manuel qui DÉPASSE la laize utile → écart bloquant (over) ──
const gFit={ref:'FIT',film:'',veka:'',longueur:'500',useful:500,blade:2,machine:'FEBA',rows:[{qty:5,width:100},{qty:1,width:80}]};
const pmOver=[{ref:'FIT',film:'',veka:'',longueur:'500',useful:500,blade:2,machine:'FEBA',refIdKey:_refIdKey(gFit),bobines:[{count:1,conf:'5×100 + 1×80'}]}];   // 5×100+1×80 = 580+lames > 500
const cohOver=planManualCoherence(pmOver,[gFit]);
const over=cohOver.find(x=>x&&x.over);
ok(!!over&&over.diff>0,'#5 motif 580 mm > laize 500 → écart « over » BLOQUANT (diff>0) — plus de faux « ✓ plan=commande »');
ok(/laize utile/.test(planCoherenceText(cohOver,false)),'#5 message dédié « motif > laize utile »');
const pmFit=[{ref:'FIT',film:'',veka:'',longueur:'500',useful:500,blade:2,machine:'FEBA',refIdKey:_refIdKey(gFit),bobines:[{count:1,conf:'4×100'},{count:1,conf:'1×80'}]}];   // 4×100=406 ≤ 500, 1×80 ≤ 500 : tiennent
ok(!planManualCoherence(pmFit,[gFit]).some(x=>x&&x.over),'#5 motifs qui tiennent (4×100 puis 1×80) → aucun faux « over »');

// ── [L140 audit #4] entrée ORPHELINE (réf supprimée) → _pmFindGroup renvoie null (plus de transplant positionnel) ──
const gSurv=[{ref:'AAA',film:'',veka:'',longueur:'1',useful:100,blade:0,machine:'FEBA',rows:[{qty:1,width:50}]},{ref:'CCC',film:'',veka:'',longueur:'1',useful:100,blade:0,machine:'FEBA',rows:[{qty:1,width:60}]}];
const orphan={ref:'BBB-supprimée',film:'',veka:'',longueur:'1',useful:100,blade:0,machine:'FEBA',refIdKey:_refIdKey({ref:'BBB',longueur:'1',useful:100,blade:0}),bobines:[{count:1,conf:'2×40'}]};
ok(_pmFindGroup(orphan,1,gSurv)===null,'#4 entrée orpheline (ni clé ni nom) → null (ne prend PAS cur[1]=CCC → plus de transplant)');

// ── [L149 revue L148 #1] MONO-réf : renommage (mêmes dims) vs remplacement (dims changées) ──
global.planManual=[{ref:'ALU-100',film:'F',veka:'V',longueur:'800',useful:1200,blade:3,machine:'FEBA',refIdKey:_refIdKey({ref:'ALU-100',film:'F',veka:'V',longueur:'800',useful:1200,blade:3}),bobines:[{count:1,conf:'5×220'}]}];
const renamed=[{ref:'ALU-100-B',film:'F',veka:'V',longueur:'800',useful:1200,blade:3,machine:'FEBA',rows:[{qty:5,width:220}]}];   // même job, nom ≠
ok(_pmFindGroup(global.planManual[0],0,renamed)===renamed[0],'#1 RENOMMAGE mono-réf (mêmes film/veka/longueur/useful/blade) → repli positionnel conservé (bobines préservées)');
const replaced=[{ref:'PVC-40',film:'X',veka:'W',longueur:'600',useful:960,blade:5,machine:'FEBA',rows:[{qty:8,width:300}]}];   // job TOTALEMENT différent
ok(_pmFindGroup(global.planManual[0],0,replaced)===null,'#1 REMPLACEMENT mono-réf (dims changées) → null (plus de transplant des bobines ALU sur PVC)');
ok(_pmSameJob(renamed[0],global.planManual[0])===true && _pmSameJob(replaced[0],global.planManual[0])===false,'#1 _pmSameJob distingue renommage (true) de remplacement (false)');
global.planManual=null;

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 L130+L140 plan manuel VALIDÉ : homonymes non croisés · réf ajoutée + chutes · motif hors-laize bloqué · orphelin non transplanté');
process.exit(fail?1:0);
