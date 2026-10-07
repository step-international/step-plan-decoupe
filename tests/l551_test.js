// l551_test.js — [L551 · 07/10/2026, B3 de l audit d usage du 06/10] une commande coupee sur 2 machines (lignes ficheDetail[].machine
// de 2 machines differentes) etait rangee en ENTIER sous la machine de l en-tete (celle de la derniere ref active a l envoi) : bobines,
// perte et defauts par machine faux dans l Analyse, les KPI du mois et la page Lames. Les STATISTIQUES suivent maintenant la machine de
// chaque ligne ; rien d enregistre ne change. Hors de ce cas (une seule machine, relais vers une autre machine, changement de machine),
// le calcul est EXACTEMENT celui d avant. Donnees FICTIVES.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
function fnLine(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const withCtx=(fnSrc,ctx)=>new Function('ctx','with(ctx){ return ('+fnSrc+'); }')(ctx);
const J=JSON.stringify;
ok(/const APP_VERSION='2026\.\d\d\.\d\d-L(55[1-9]|5[6-9]\d|[6-9]\d\d)';/.test(src),'APP_VERSION >= L551');

// ── socle KPI (memes briques que kpi_test) ──
global.MACHINE_LABELS=['FEBA','MAVEG','CEVENINI'];
global.parseNum=v=>{const n=parseFloat(String(v==null?'':v).replace(',','.'));return isNaN(n)?0:n;};
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global._l505Warn=function(){};
global._l507Traced=new WeakSet();
global._refIdKey=eval('('+fnOf('_refIdKey')+')');
global._l506RefGroupFor=eval('('+fnOf('_l506RefGroupFor')+')');
global._l507GroupIdxOf=eval('('+fnOf('_l507GroupIdxOf')+')');
global._localYM=eval('('+fnOf('_localYM')+')');
global._l543FixYear=eval('('+fnOf('_l543FixYear')+')'); global._l543FixIsoDate=eval('('+fnOf('_l543FixIsoDate')+')');
global.tempsShareParts=eval('('+fnOf('tempsShareParts')+')');
global.parseConf=eval('('+fnLine('parseConf')+')'); global.calcStats=eval('('+fnLine('calcStats')+')'); global._refKeyOf=eval('('+fnLine('_refKeyOf')+')');
global._l505HorsPlan=eval('('+fnLine('_l505HorsPlan')+')'); global.ncLoss=eval('('+fnLine('ncLoss')+')'); global._l507GroupUseful=eval('('+fnLine('_l507GroupUseful')+')');
global._l513Matiere=eval('('+fnLine('_l513Matiere')+')'); global._l513MatiereOf=eval('('+fnLine('_l513MatiereOf')+')');
const ML=eval('('+fnLine('_machLignes')+')'), SPLIT=eval('('+fnLine('_l551Split')+')');
global._machLignes=ML; global._l551Split=SPLIT;
const KPI=eval('('+fnOf('buildMonthlyKpi')+')');
// « ancien calcul » = le meme code avec la nouvelle branche coupee (_l551Split -> null) : les lignes d avant sont intactes (epinglees plus bas)
const KPI_OLD=(ym,F,T)=>{ global._l551Split=()=>null; try{ return KPI(ym,F,T); } finally { global._l551Split=SPLIT; } };
const YM='2026-09', D=(j,h)=>new Date(2026,8,j,h==null?10:h).toISOString();
const MAT=(p)=>({perteM2:p,chutesM2:1,dechetM2:0,m2Coupes:100,clientM2:90,ok:true,calcWarn:0,regleVer:'L513'});
const L=(machine,nc,coupee)=>{ const o={conf:'4x500',useful:2090,blade:5}; if(machine!==undefined) o.machine=machine; if(nc) o.ncLarg=true; if(coupee!==undefined) o.coupee=coupee; return o; };
const rep=(n,f)=>Array.from({length:n},(_,i)=>f(i));

console.log('── 1. _machLignes : quand on s abstient (null = calcul d avant) ──');
ok(ML(null)===null&&ML(undefined)===null&&ML('x')===null,'entree vide ou non-objet → null');
ok(ML({machine:'FEBA',ficheDetail:rep(5,()=>L('feba'))})===null,'une seule machine sur les lignes → null');
ok(ML({machine:'FEBA',ficheDetail:rep(5,()=>L())})===null,'lignes sans machine (fiches anciennes, tests) → null');
ok(ML({machine:'FEBA',ficheDetail:rep(5,()=>L('cevenini'))})===null,'en-tete FEBA, toutes les lignes CEVENINI → null (on ne tranche pas)');
ok(ML({machine:'FEBA',machine2:'MAVEG',op2Bob:3,ini2:'JF',ficheDetail:[L('feba'),L('feba'),L('maveg'),L('maveg')]})===null,'relais vers une AUTRE machine → null (ventilation op2Bob d avant)');
ok(ML({machine:'FEBA',machine2:'MAVEG',ficheDetail:[L('feba'),L('maveg')]})===null,'machine2 differente meme sans op2Bob valide → null (prudence)');
ok(ML({machine:'FEBA',machineChg:{to:'MAVEG'},ficheDetail:[L('feba'),L('maveg')]})===null,'changement de machine en cours de fiche → null');
ok(ML({machine:'FEBA',ficheDetail:'x'})===null&&ML({machine:'FEBA'})===null,'ficheDetail absent ou non tableau → null');
{ const r=ML({machine:'MAVEG',ficheDetail:[L('cevenini'),L(' Maveg '),L(),null,L('feba')]});
  ok(J(r)===J(['CEVENINI','MAVEG','','','FEBA']),'2 machines ou plus : tableau ALIGNE sur les lignes, majuscules, \'\' si la ligne n en porte pas → '+J(r)); }
ok(ML({machine:'FEBA',machine2:'FEBA',ini2:'JF',op2Bob:2,ficheDetail:[L('feba'),L('maveg')]})!==null,'relais sur la MEME machine (machine2 = machine) : la regle s applique');
ok(ML({machine:'FEBA',ini2:'JF',op2Bob:2,ficheDetail:[L('feba'),L('maveg')]})!==null,'relais op.2 sans machine 2 : la regle s applique');

console.log('── 2. _l551Split : entiers, total conserve, plus fort reste ──');
const f2409={machine:'MAVEG',ficheDetail:[].concat(rep(11,i=>L('cevenini',i<5)),rep(4,()=>L('maveg')))};
ok(J(SPLIT(f2409,14))===J({MAVEG:4,CEVENINI:10}),'cas « 24/09 » (en-tete MAVEG, 11 lignes CEVENINI + 4 MAVEG, b=14) → CEVENINI 10, MAVEG 4 → '+J(SPLIT(f2409,14)));
const fMM={machine:'FEBA',manqueMatiere:true,ficheDetail:[].concat(rep(21,()=>L('feba',false,false)),rep(5,()=>L('maveg',false,true)))};
ok(J(SPLIT(fMM,5))===J({MAVEG:5}),'cas « 08/09 » (manque matiere : 21 FEBA jamais coupees, 5 MAVEG coupees) → MAVEG 5, FEBA 0 → '+J(SPLIT(fMM,5)));
ok(J(SPLIT({machine:'MAVEG',ficheDetail:[L('feba'),L('cevenini')]},1))===J({FEBA:1,CEVENINI:0}),'egalite parfaite, en-tete absente des lignes : FEBA avant CEVENINI');
ok(J(SPLIT({machine:'CEVENINI',ficheDetail:[L('feba'),L('cevenini')]},1))===J({CEVENINI:1,FEBA:0}),'egalite parfaite : la machine de l en-tete passe en premier');
ok(J(SPLIT({machine:'FEBA',ficheDetail:[L('feba'),L('zz'),L('maveg')]},2))===J({FEBA:1,MAVEG:1,ZZ:0}),'machine inconnue : derniere au departage');
ok(J(SPLIT({machine:'FEBA',ficheDetail:[L('maveg'),L(),L('feba')]},3))===J({FEBA:2,MAVEG:1}),'ligne sans machine : comptee sur l en-tete');
ok(SPLIT({machine:'FEBA',ficheDetail:[L('maveg'),L(),L('maveg')]},3)===null,'une seule machine de ligne + une ligne vide → null (le vide ne compte pas comme une 2e machine)');
{ const R=(m)=>Object.assign(L(m),{recut:true});
  const fr={machine:'FEBA',ficheDetail:[R('feba'),R('feba'),R('feba'),R('feba'),L('feba'),L('feba'),L('maveg'),L('maveg')]};
  ok(J(SPLIT(fr,4))===J({FEBA:2,MAVEG:2}),'lignes ♻ (rouleaux de chute recoupes) hors du total de bobines meres : exclues de la cle (revue adverse) → '+J(SPLIT(fr,4)));
  const fmr={machine:'FEBA',manqueMatiere:true,ficheDetail:[R('maveg'),Object.assign(L('maveg',false,true)),Object.assign(L('feba',false,true)),L('feba',false,false)]}; fmr.ficheDetail[0].coupee=true;
  ok(J(SPLIT(fmr,3))===J({FEBA:1,MAVEG:2}),'manque matiere : b = lignes coupees ♻ comprises → la cle les garde → '+J(SPLIT(fmr,3)));
  ok(SPLIT({machine:'FEBA',ficheDetail:[R('feba'),R('maveg')]},2)===null,'fiche normale faite que de ♻ : rien a repartir → null (calcul d avant)'); }
ok(SPLIT(f2409,0)===null&&SPLIT(f2409,-1)===null&&SPLIT(f2409,2.5)===null&&SPLIT(f2409,NaN)===null,'b nul, negatif ou non entier → null (calcul d avant)');
ok(SPLIT({machine:'FEBA',ficheDetail:rep(4,()=>L('feba'))},4)===null,'une seule machine → null');
ok(SPLIT({machine:'FEBA',manqueMatiere:true,ficheDetail:[L('feba',false,false),L('maveg',false,false)]},3)===null,'manque matiere sans aucune ligne coupee → null');
{ let bad=0; let seed=7; const rnd=n=>{ seed=(seed*1103515245+12345)%2147483648; return seed%n; };
  const MS=['feba','maveg','cevenini','','zz'];
  for(let t=0;t<3000;t++){ const n=1+rnd(30), b=1+rnd(60), det=rep(n,()=>{ const o=L(MS[rnd(5)],false,rnd(4)>0); if(rnd(5)===0) o.recut=true; return o; }); const f={machine:['FEBA','MAVEG','CEVENINI',''][rnd(4)],manqueMatiere:rnd(3)===0,ficheDetail:det};
    const s=SPLIT(f,b); if(!s) continue; const vals=Object.values(s); const sum=vals.reduce((a,c)=>a+c,0);
    if(sum!==b||vals.some(v=>!Number.isInteger(v)||v<0)) bad++;
    const keep=d=>(f.manqueMatiere?d.coupee===true:d.recut!==true); const cnt={},nn=det.filter(keep).length; det.forEach(d=>{ if(!keep(d)) return; const k=String(d.machine||'').toUpperCase()||f.machine; cnt[k]=(cnt[k]||0)+1; });
    Object.keys(s).forEach(k=>{ if(Math.abs(s[k]-b*cnt[k]/nn)>=1) bad++; }); }
  ok(bad===0,'3000 fiches tirees au hasard : total = b, entiers >= 0, chaque part a moins d une bobine de sa part exacte'); }

console.log('── 3. buildMonthlyKpi : rien ne change hors du cas vise ──');
const base=[
  {date:D(2),totalBobines:10,pct:'3.0',machine:'FEBA',ficheDetail:rep(10,i=>L('feba',i===0)),mat:MAT(12)},
  {date:D(3),totalBobines:8,pct:'2.0',machine:'MAVEG',ficheDetail:rep(8,()=>L()),mat:MAT(7)},
  {date:D(4),totalBobines:6,pct:'4.0',machine:'FEBA',ficheDetail:rep(6,()=>L('cevenini')),mat:MAT(5)},
  {date:D(5),totalBobines:10,pct:'5.0',machine:'FEBA',machine2:'MAVEG',op2Bob:7,ini:'TB',ini2:'JF',ficheDetail:[].concat(rep(6,()=>L('feba')),rep(4,()=>L('maveg'))),mat:MAT(20)},
  {date:D(6),totalBobines:12,pct:'1.0',machine:'CEVENINI',manqueMatiere:true,ficheDetail:[].concat(rep(4,()=>L('cevenini',false,true)),rep(8,()=>L('cevenini',false,false))),mat:MAT(3)},
  {date:D(7),totalBobines:5,pct:'2.5',machine:'XYZ',ficheDetail:rep(5,()=>L('xyz')),mat:MAT(2)},
  {date:D(8),totalBobines:4,pct:'3.0',machine:'FEBA',machineChg:{to:'MAVEG'},ficheDetail:[L('feba'),L('feba'),L('maveg'),L('maveg')],mat:MAT(4)}
];
{ const a=KPI(YM,base,[]), o=KPI_OLD(YM,base,[]);
  ok(J(a)===J(o),'7 fiches hors cas (1 machine, sans machine de ligne, en-tete ≠ lignes, relais autre machine, manque matiere, machine inconnue, changement de machine) : agregat IDENTIQUE octet pour octet');
  ok(a.machines.FEBA.bobines===26&&a.machines.MAVEG.bobines===12&&a.machines.CEVENINI.bobines===4&&a.autresBobines===5,'en-tete comme avant : FEBA 10+6+6(relais)+4(chg), MAVEG 8+4(relais), CEVENINI 4 coupees, autres 5 → '+J(a.machines)); }
{ const a=KPI(YM,[base[3]],[]); ok(a.machines.FEBA.bobines===6&&a.machines.MAVEG.bobines===4,'relais FEBA→MAVEG des la bobine 7, lignes sur 2 machines : FEBA 6 + MAVEG 4 comme avant (kpi_test)'); }
console.log('── 4. buildMonthlyKpi : fiches coupees sur 2 machines ──');
{ const F=[Object.assign({date:D(24),totalBobines:14,pct:'4.0',mat:MAT(28)},f2409)];
  const a=KPI(YM,F,[]), o=KPI_OLD(YM,F,[]);
  ok(a.machines.CEVENINI.bobines===10&&a.machines.MAVEG.bobines===4&&a.machines.FEBA.bobines===0,'« 24/09 » : CEVENINI 10, MAVEG 4 (avant : MAVEG 14) → '+J(a.machines));
  ok(o.machines.MAVEG.bobines===14,'reference : l ancien calcul mettait tout sous MAVEG');
  ok(a.machines.CEVENINI.pertePct===4&&a.machines.MAVEG.pertePct===4,'perte ponderee : chaque machine recoit le % de la fiche avec SA part de bobines');
  ok(Math.abs(a.machines.CEVENINI.perteM2-20)<1e-9&&Math.abs(a.machines.MAVEG.perteM2-8)<1e-9,'perte m² : meme cle que les bobines (28 × 10/14 = 20 ; 28 × 4/14 = 8) → '+a.machines.CEVENINI.perteM2+' / '+a.machines.MAVEG.perteM2);
  const strip=k=>{ const c=JSON.parse(J(k)); delete c.machines; return J(c); };
  ok(strip(a)===strip(o),'tout le reste de l agregat est IDENTIQUE (total, qualite, temps, m², perte globale, clients, refs…)'); }
{ const F=[Object.assign({date:D(8),totalBobines:26,pct:'2.0',mat:MAT(6)},fMM)];
  const a=KPI(YM,F,[]);
  ok(a.totalBobines===5&&a.machines.MAVEG.bobines===5&&a.machines.FEBA.bobines===0,'« 08/09 » manque matiere : MAVEG 5, FEBA 0, total 5 → '+J(a.machines));
  ok(a.machines.MAVEG.pertePct===0&&a.pertePct===0,'manque matiere : la perte du plan complet reste EXCLUE (R2.1)'); }
{ const F=[{date:D(9),totalBobines:3,pct:'2.0',machine:'FEBA',ficheDetail:[L('feba'),L('zz'),L('maveg')],mat:MAT(3)}];
  const a=KPI(YM,F,[]);
  ok(a.machines.FEBA.bobines===1&&a.machines.MAVEG.bobines===1&&a.autresBobines===1&&a.totalBobines===3,'ligne sur machine inconnue : comptee dans « autres », total = machines + autres'); }
{ const F=[{date:D(10),totalBobines:4,pct:'2.0',machine:'FEBA',ini:'TB',ini2:'JF',op2Bob:3,ficheDetail:[L('feba'),L('feba'),L('maveg'),L('maveg')],mat:MAT(4)}];
  const a=KPI(YM,F,[]);
  ok(a.machines.FEBA.bobines===2&&a.machines.MAVEG.bobines===2,'relais op.2 sans machine 2, lignes sur 2 machines : la machine vient des lignes'); }
{ let bad=0,badTot=0; let seed=11; const rnd=n=>{ seed=(seed*1103515245+12345)%2147483648; return seed%n; };
  const MS=['feba','maveg','cevenini',''];
  for(let t=0;t<300;t++){ const F=rep(1+rnd(6),()=>{ const n=1+rnd(15); const f={date:D(1+rnd(28)),totalBobines:rnd(4)?n:n+rnd(3)-1,pct:String(rnd(60)/10),machine:['FEBA','MAVEG','CEVENINI'][rnd(3)],ficheDetail:rep(n,()=>L(MS[rnd(4)],rnd(5)===0,rnd(4)>0)),mat:MAT(rnd(50))};
      if(rnd(4)===0) f.manqueMatiere=true; if(rnd(6)===0){ f.machine2=['FEBA','MAVEG','CEVENINI'][rnd(3)]; f.ini2='JF'; f.op2Bob=1+rnd(n); } return f; });
    const a=KPI(YM,F,[]), o=KPI_OLD(YM,F,[]);
    ['totalBobines','m2','perteM2','dechetM2','chuteM2','pertePct','nbFiches'].forEach(k=>{ if(J(a[k])!==J(o[k])) bad++; });
    if(J(a.qual)!==J(o.qual)||J(a.liv)!==J(o.liv)||J(a.topClients)!==J(o.topClients)) bad++;
    const sm=MACHINE_LABELS.reduce((s,m)=>s+a.machines[m].bobines,0)+(a.autresBobines||0);
    if(sm!==a.totalBobines||MACHINE_LABELS.some(m=>!Number.isInteger(a.machines[m].bobines))) badTot++; }
  ok(bad===0,'300 mois tires au hasard : total bobines, m², perte, dechet, chutes, %, qualite, livraisons, top clients IDENTIQUES a l ancien calcul');
  ok(badTot===0,'300 mois tires au hasard : machines + autres = total, bobines entieres'); }

console.log('── 5. Analyse (buildFicheAnalytics) : defauts par machine au niveau bobine ──');
const anaRun=(fiches,filt)=>{ const bars=[]; const ctx={fichesCache:fiches,analyseFilter:Object.assign({mach:'ALL',op:'ALL',month:'ALL',client:'ALL'},filt||{}),_anaFiltered:()=>false,nrm,iniDisp:v=>v,OP_COLORS:{},
    svgHBars:(items)=>{ bars.push(items); return ''; },svgPie:()=>'',esc:s=>String(s),canManageData:()=>false,_machLignes:ML,Math,String,Object,Date,isNaN,parseInt,Number};
  withCtx(fnOf('buildFicheAnalytics'),ctx)(); const mb=bars.find(b=>b.some(i=>/^(FEBA|MAVEG|CEVENINI|\?)$/.test(i.label)))||[];
  const o={}; mb.forEach(i=>o[i.label]=i.sub); const ob=bars.find(b=>b!==mb)||[]; const op={}; ob.forEach(i=>op[i.label]=i.sub); return {mach:o,op}; };
{ const r=anaRun([Object.assign({date:D(24),ini:'AB',valide:true},f2409)]);
  ok(r.mach.CEVENINI==='(5/11)'&&r.mach.MAVEG==='(0/4)','« 24/09 » : CEVENINI 5/11, MAVEG 0/4 (avant : MAVEG 5/15) → '+J(r.mach));
  ok(r.op.AB==='(5/15)','l operateur ne change pas : AB 5/15'); }
{ const r=anaRun([Object.assign({date:D(8),ini:'AB'},fMM)]);
  ok(J(r.mach)===J({MAVEG:'(0/5)'}),'« 08/09 » manque matiere : seules les 5 coupees comptent, sous MAVEG → '+J(r.mach)); }
{ const fr={date:D(5),ini:'TB',ini2:'JF',machine:'FEBA',machine2:'MAVEG',op2Bob:7,ficheDetail:[].concat(rep(6,i=>L('feba',i===0)),rep(4,()=>L('maveg')))};
  const r=anaRun([fr]); ok(r.mach.FEBA==='(1/6)'&&r.mach.MAVEG==='(0/4)'&&r.op.TB==='(1/6)'&&r.op.JF==='(0/4)','relais vers une autre machine : ventilation op2Bob d avant (FEBA 1/6, MAVEG 0/4)'); }
{ const fs1={date:D(5),ini:'TB',machine:'FEBA',ficheDetail:rep(6,()=>L('cevenini',true))};
  const r=anaRun([fs1]); ok(J(r.mach)===J({FEBA:'(6/6)'}),'en-tete FEBA, toutes les lignes CEVENINI : inchange (FEBA)'); }
{ const r=anaRun([Object.assign({date:D(24),ini:'AB'},f2409)],{mach:'CEVENINI'});
  ok(J(r.mach)===J({CEVENINI:'(5/11)'}),'filtre machine CEVENINI : seules SES bobines de la fiche'); }

console.log('── 6. page Lames (lameNcByMachine) ──');
{ const ctx={fichesCache:[Object.assign({date:D(24)},f2409),{date:D(2),machine:'FEBA',ficheDetail:[L('feba',true),L('feba',true)]},{date:D(3),machine:'',ficheDetail:[L('feba',true),L('maveg',true)]}],
    _inPeriod:()=>true,getMachineLabel:eval('('+fnOf('getMachineLabel')+')'),LAME_MACHINES:['feba','maveg','cevenini'],_mcol:()=>'#000',_machLignes:ML,Array,String};
  const r=withCtx(fnOf('lameNcByMachine'),ctx)('all'); const o={}; r.forEach(x=>o[x.label]=x.value);
  ok(J(o)===J({FEBA:2,MAVEG:0,CEVENINI:5}),'defauts par machine : les 5 de la fiche « 24/09 » vont a CEVENINI ; fiche sans en-tete toujours ignoree → '+J(o)); }

console.log('── 7. filtre machine L526 (_l526MachKeep) : on AJOUTE, on ne retire jamais ──');
{ const K=withCtx(fnOf('_l526MachKeep'),{_machLignes:ML,String});
  const f=Object.assign({},f2409);
  ok(K(f,'MAVEG')&&K(f,'CEVENINI')&&!K(f,'FEBA'),'fiche a 2 machines : gardee sous chacune de ses machines, pas sous la 3e');
  ok(K(fMM,'FEBA')&&K(fMM,'MAVEG')&&!K(fMM,'CEVENINI'),'manque matiere : en-tete FEBA garde, MAVEG ajoutee (lignes coupees)');
  ok(!K({machine:'FEBA',manqueMatiere:true,ficheDetail:[L('feba',false,true),L('maveg',false,false)]},'MAVEG'),'manque matiere : une ligne JAMAIS coupee ne fait pas passer la fiche par sa machine');
  ok(K({machine:'FEBA',machine2:'MAVEG',ficheDetail:[]},'MAVEG')&&K({machine:'FEBA',machineChg:{to:'CEVENINI'}},'CEVENINI'),'relais et changement de machine : comme avant');
  ok(!K({machine:'FEBA',ficheDetail:rep(3,()=>L('cevenini'))},'CEVENINI'),'en-tete FEBA, toutes les lignes CEVENINI : inchange (pas sous CEVENINI)');
  ok(K({machine:'MAVEG',operateur:'TB'},'MAVEG')&&!K({machine:'MAVEG'},'FEBA')&&K({machine:'X'},'ALL'),'releves de temps (sans lignes) : inchanges');
  const K0=withCtx(fnOf('_l526MachKeep'),{String,_machLignes:undefined}); ok(K0(f,'MAVEG')&&!K0(f,'CEVENINI'),'sans _machLignes (test isole d avant) : comportement L526 d origine, sans exception'); }

console.log('── 8. epingles : ce qui ne doit PAS bouger ──');
ok(/const _hasRelay=!isNaN\(_o2s\)&&_o2s>=1&&_o2s<=det\.length&&\(f\.ini2\|\|f\.machine2\);/.test(src),'_hasRelay (R2.3) intact');
ok(src.includes("if(mach[m]){mach[m].bobines+=b1;if(!isNaN(p)){mach[m].wpNum+=p*b1;mach[m].wpDen+=b1;}}")&&src.includes("if(cut2>0){mach[m2].bobines+=cut2;if(!isNaN(p)){mach[m2].wpNum+=p*cut2;mach[m2].wpDen+=cut2;}}"),'ventilation relais b1/cut2 d avant : lignes intactes (repli quand _l551Split rend null)');
ok(src.includes("const _sh1=(b>0)?(b1/b):1, _sh2=(b>0&&cut2>0)?(cut2/b):0;"),'perte m² relais d avant : ligne intacte');
ok(/return \{mois:ym,regleVer:'L513',/.test(src),'regleVer reste L513 (sinon « ancienne definition » sur tous les mois)');
ok(/b=Math\.min\(b,_cut\); p=NaN;/.test(src),'bloc manque matiere R2.1 intact');
{ const sc=fnOf('saveCommandeFiche'); ok(!/_machLignes|_l551Split/.test(sc),'envoi de la fiche : aucune nouvelle regle (en-tete, lame, releve de temps inchanges)'); }
ok(!/_machLignes|_l551Split/.test(fnOf('tempsShareParts')),'heures par machine (tempsShareParts) : inchangees');

console.log('\n'+(fail?('❌ '+fail+' echec(s) sur '+total):('🏆 L551 OK : '+total+' verifications')));
process.exit(fail?1:0);
