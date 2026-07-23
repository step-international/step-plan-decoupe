// kpi_test.js — [L247 · R3] GARDE de buildMonthlyKpi (fonction PURE, agrégats figés 'agregats').
// Couvre : R2.1 manque-matière (bobines coupées, perte exclue) · ventilation relais machine2 ·
// R3 qual (NC par type, ouvertes, délai fiche→clôture) · R3 liv (ponctualité, repli fr-FR, « — » exclu) ·
// R3 ecartsN · rétro-compat (champs TOUJOURS présents dans un agrégat neuf).
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.MACHINE_LABELS=['FEBA','MAVEG','CEVENINI'];
global.parseNum=v=>{const n=parseFloat(String(v==null?'':v).replace(',','.'));return isNaN(n)?0:n;};
global._localYM=eval('('+fnOf('_localYM')+')');
global.tempsShareParts=eval('('+fnOf('tempsShareParts')+')');
const buildMonthlyKpi=eval('('+fnOf('buildMonthlyKpi')+')');
let fail=0; const ok=(c,m)=>{ console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const YM='2026-07';
const D=(j,h)=>new Date(2026,6,j,h==null?10:h).toISOString();   // juillet 2026 local

console.log('── R2.1 manque-matière ──');
{
  const k=buildMonthlyKpi(YM,[
    {date:D(3),totalBobines:10,pct:'4.0',machine:'FEBA',ficheDetail:[{coupee:true},{coupee:true},{coupee:false},{}],manqueMatiere:true},
    {date:D(4),totalBobines:5,pct:'2.0',machine:'FEBA',ficheDetail:[{coupee:true}]}
  ],[]);
  ok(k.totalBobines===7,'manque-matière : bobines = 2 COUPÉES (pas 10 du plan) + 5 → '+k.totalBobines);
  ok(k.pertePct===2.0,'manque-matière : perte du plan complet EXCLUE de la moyenne pondérée → '+k.pertePct);
}
console.log('── ventilation relais machine2 ──');
{
  const k=buildMonthlyKpi(YM,[
    {date:D(5),totalBobines:10,pct:'3.0',machine:'FEBA',machine2:'MAVEG',op2Bob:'7'}
  ],[]);
  ok(k.machines.FEBA.bobines===6&&k.machines.MAVEG.bobines===4,'op2Bob=7 : FEBA 6 bob · MAVEG 4 bob (1re bobine op.2 incluse)');
}
console.log('── R3 qualité (NC) ──');
{
  const k=buildMonthlyKpi(YM,[
    {date:D(6),totalBobines:3,pct:'1',machine:'FEBA',ficheDetail:[
      {ncLarg:true,ncStatut:'cloture',ncDateTraite:D(13)},   // clôturée à J+7
      {ncCasse:true,ncQty:true},                             // ouverte (statut absent), 2 types, 1 bobine
      {}
    ]},
    {date:D(7),totalBobines:2,pct:'1',machine:'FEBA',ficheDetail:[{},{}]}
  ],[]);
  ok(k.qual.ctrl===5,'bobines contrôlées = 5 (toutes lignes ficheDetail)');
  ok(k.qual.nc===2,'bobines NC = 2 (multi-type = UNE bobine)');
  ok(k.qual.larg===1&&k.qual.qty===1&&k.qual.casse===1&&k.qual.ang===0,'répartition par type larg/qty/casse/ang = 1/1/1/0');
  ok(k.qual.ouv===1,'NC ouvertes = 1 (statut absent = ouvert ; clôturée non comptée)');
  ok(k.qual.delaiMoy===7,'délai moyen fiche→clôture = 7 j → '+k.qual.delaiMoy);
}
console.log('── L254 dénominateur NC manque-matière ──');
{
  const k=buildMonthlyKpi(YM,[
    // plan de 5 bobines, 2 coupées (dont 1 NC), 3 jamais coupées (manque matière)
    {date:D(6),totalBobines:5,pct:'3',machine:'FEBA',manqueMatiere:true,ficheDetail:[
      {coupee:true,ncCasse:true},{coupee:true},{coupee:false},{coupee:false},{coupee:false}
    ]}
  ],[]);
  ok(k.qual.ctrl===2,'contrôlées = 2 (bobines COUPÉES seules — pas les 5 du plan) → '+k.qual.ctrl);
  ok(k.qual.nc===1&&k.totalBobines===2,'taux NC = 1/2 (50 %), cohérent avec « Bobines » = 2 (plus de contrôlées > bobines)');
}
console.log('── R3 ponctualité ──');
{
  const k=buildMonthlyKpi(YM,[
    {date:D(10),totalBobines:1,pct:'1',machine:'FEBA',dateLivIso:'2026-07-15'},        // à temps (ISO)
    {date:D(20),totalBobines:1,pct:'1',machine:'FEBA',dateLiv:'15/07/2026'},           // EN RETARD (repli fr-FR)
    {date:D(11),totalBobines:1,pct:'1',machine:'FEBA',dateLiv:'—'},                    // exclue (« — »)
    {date:D(12),totalBobines:1,pct:'1',machine:'FEBA'},                                // exclue (aucune date)
    {date:D(14),totalBobines:1,pct:'1',machine:'FEBA',dateLivIso:'2026-07-25',clients:[{dateLiv:'2026-07-13'}]}  // min clients ⇒ RETARD
  ],[]);
  ok(k.liv.tot===3,'fiches datées = 3 (« — » et sans date EXCLUES) → '+k.liv.tot);
  ok(k.liv.ok===1,'à temps = 1 (fr-FR parsé en retard ; promesse client MIN prime) → '+k.liv.ok);
}
{
  const k=buildMonthlyKpi(YM,[{date:D(15),totalBobines:1,pct:'1',machine:'FEBA',dateLivIso:'2026-07-15'}],[]);
  ok(k.liv.ok===1,'fin découpe = jour promis ⇒ À TEMPS (comparaison au jour, pas à l\'heure)');
}
console.log('── R3 écarts + rétro-compat ──');
{
  const k=buildMonthlyKpi(YM,[
    {date:D(8),totalBobines:1,pct:'1',machine:'FEBA',hasEcart:true},
    {date:D(9),totalBobines:1,pct:'1',machine:'FEBA'}
  ],[]);
  ok(k.ecartsN===1,'ecartsN = 1 (hasEcart===true uniquement)');
  ok(k.qual&&k.liv&&typeof k.ecartsN==='number','agrégat NEUF : qual/liv/ecartsN TOUJOURS présents (le « — » écran est réservé aux mois figés AVANT L247)');
  ok(k.qual.delaiMoy===null,'aucune NC clôturée → delaiMoy null (jamais un faux 0)');
}
console.log('── invariants historiques conservés ──');
{
  const k=buildMonthlyKpi(YM,[
    {date:D(2),totalBobines:4,pct:'2.5',machine:'FEBA',valide:false},   // refusée → exclue [L79·AN-1]
    {date:'2026-06-30T22:00:00.000Z',totalBobines:9,pct:'1',machine:'FEBA'},   // 1er juillet 00h local (UTC+2) → compté juillet [L98·#13]
    {date:D(1),totalBobines:3,pct:'2',machine:'FEBA',deleted:true}
  ],[]);
  ok(k.totalBobines===9&&k.nbFiches===1,'refusée + deleted exclues · mois LOCAL (fiche 00h30 le 1er) conservés');
}
// marqueurs UI (écran + PDF — règle « toutes les surfaces »)
const has=(re,m)=>{const okk=(re instanceof RegExp?re.test(src):src.includes(re));console.log((okk?'✅ ':'❌ ')+m);if(!okk)fail++;};
has('figé avant cette version — ♻ Recalculer','écran : mois figé sans champs R3 → « — » + invitation Recalculer (jamais 0)');
has(/kpi\.qual\?`<tr><td style="\$\{td\}">Bobines NC<\/td>/,'PDF revue de direction : lignes NC/ponctualité présentes (toutes les surfaces)');
has(/function buildTendancesBlock\(\)/,'bloc Tendances 12 mois présent');
has(/buildTendancesBlock:',e\); return '';/,'Tendances : try/catch — une erreur ne casse JAMAIS le rendu Analyse');

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 KPI MENSUEL VALIDÉ : manque-matière · relais · qualité NC · ponctualité (fr-FR + exclusions) · écarts · rétro-compat');
process.exit(fail?1:0);
