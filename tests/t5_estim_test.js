// t5_estim_test.js — modèle ADDITIF d'estimation (tient compte de la laize / nb de coupes).
// On génère des relevés d'un modèle additif CONNU + bruit, et on vérifie que la calibration le retrouve
// et que l'erreur du modèle additif < celle du modèle m/h (surtout sur les petites laizes). [reconstruit]
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let s=(src.slice(i-6,i)==='async ')?i-6:i;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(s,k+1);}
let fail=0;const ok=(c,m)=>{console.log((c?'✅ ':'❌ ')+m);if(!c)fail++;};

// ── modèle « vérité terrain » : duree = a + b·nm + c·(lg·nm) + f·nf ──
const A=300, Bc=120, C=0.5, F=45;   // setup 5min, 2min/mère, 0.5 s/m·mère (=7200 m/h), 45 s/fille
const D_MH=7200;
const noise=i=>((Math.sin(i*12.9898)*43758.5453)%1)*0.06-0.03;   // ±3% déterministe
const temps=[]; let i=0;
for(let nm=1;nm<=8;nm++){
  for(const dens of [2,3,5,8,12,18]){
    const nf=nm*dens;
    for(const lg of [150,400,800]){
      const base=A+Bc*nm+C*(lg*nm)+F*nf;
      temps.push({machine:'FEBA',nbBobines:nm,totalLaizes:nf,longueur:String(lg),duree:Math.round(base*(1+noise(i++))),deleted:false});
    }
  }
}
// ── stubs + fonctions réelles ──
global.tempsCache=temps;
global.parseNum=v=>{const n=parseFloat(String(v==null?'':v).replace(',','.'));return isFinite(n)?n:0;};
global.dujMachKey=m=>({feba:'feba',maveg:'maveg',cevenini:'cevenini'}[String(m||'').toLowerCase()]||'');
global.dujDebit=()=>({d:D_MH,n:temps.length,src:'machine'});
global._dujAddOverride=null;
for(const n of ['_dujAddSamples','_lsqSolve','dujCalibrateAdditive','dujEstimateAdditive']) global[n]=eval('('+fnOf(n)+')');

ok(_dujAddSamples('feba').length===temps.length,'tous les relevés valides retenus ('+temps.length+')');
const cal=dujCalibrateAdditive('feba');
ok(!!cal,'calibration renvoie un résultat');
const c=cal.coef;
console.log('   coef estimés [a,b,c,f] = ['+c.map(x=>x.toFixed(2)).join(', ')+'] · vérité ['+[A,Bc,C,F].join(', ')+']');
ok(Math.abs(c[0]-A)/A<0.25,'a (setup) retrouvé ±25%');
ok(Math.abs(c[1]-Bc)/Bc<0.25,'b (par mère) retrouvé ±25%');
ok(Math.abs(c[2]-C)/C<0.15,'c (déroulé) retrouvé ±15%');
ok(Math.abs(c[3]-F)/F<0.2,'f (par bobine fille) retrouvé ±20%');
console.log('   MAPE additif '+cal.mapeA.toFixed(1)+'% · m/h '+(cal.mapeM==null?'—':cal.mapeM.toFixed(1)+'%'));
ok(cal.scope==='machine','scope=machine (≥10 relevés FEBA) → mapeM calculé (pas masqué)');
ok(cal.mapeA<10,'erreur moyenne modèle additif < 10%');
ok(cal.mapeM!=null&&cal.mapeA<cal.mapeM,'modèle additif PLUS FIABLE que le m/h globalement');
ok(cal.fineMapeA!=null&&cal.fineMapeM!=null&&cal.fineMapeA<cal.fineMapeM,'sur PETITES laizes : additif meilleur ('+cal.fineMapeA.toFixed(0)+'% vs '+cal.fineMapeM.toFixed(0)+'%)');

const nm=4,lg=800,nf=4*15, truth=A+Bc*nm+C*(lg*nm)+F*nf;
const est=dujEstimateAdditive('feba',nm,lg,nf), mh=(lg*nm)/D_MH*3600;
console.log('   commande fine : réel≈'+Math.round(truth)+'s · additif='+Math.round(est.sec)+'s · m/h='+Math.round(mh)+'s');
ok(Math.abs(est.sec-truth)/truth<0.12,'estimation additive proche du réel (±12%)');
ok(Math.abs(est.sec-truth)<Math.abs(mh-truth),'estimation additive plus proche du réel que le m/h (petite laize)');

// ── [L141 audit #26] scope GLOBAL (machine sans assez de relevés) → mapeM MASQUÉ ──
global.tempsCache=temps.map(t=>({...t,machine:'FEBA'}));   // aucune sur MAVEG → MAVEG bascule en global
const calG=dujCalibrateAdditive('maveg');
ok(calG&&calG.scope==='global','MAVEG (0 relevé) → calibration en scope global');
ok(calG&&calG.mapeM==null,'#26 scope global → mapeM MASQUÉ (débit d\'une machine sur relevés de toutes = faux)');

// ── repli : trop peu de relevés → null ──
global.tempsCache=temps.slice(0,4);
ok(dujCalibrateAdditive('maveg')===null,'trop peu de relevés → pas de calibration (null, pas de chiffre inventé)');
global.tempsCache=temps;

// ── surcharge manuelle ──
global._dujAddOverride={feba:[0,0,0.5,0]};
ok(Math.abs(dujEstimateAdditive('feba',2,500,20).sec-0.5*(500*2))<1,'surcharge manuelle des coefficients respectée (rétro-compat m/h)');
global._dujAddOverride=null;

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 modèle additif VALIDÉ : calibration OK · additif < m/h · scope global masque mapeM (#26) · repli sûr · surcharge manuelle');
process.exit(fail?1:0);
