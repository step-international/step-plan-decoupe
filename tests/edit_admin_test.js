// edit_admin_test.js — [L506 · 2e vérification adverse] GARDE de _l506GroupsFromDetail (édition admin d une fiche archivée).
// Le regroupement doit suivre la laize et la lame de CHAQUE ligne (comme showFicheDetail) et conserver le marqueur ♻ que
// la fiche imprimée lit pour ne pas annoncer une chute gardée inexistante.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length,k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
const cst=n=>{const m=src.match(new RegExp('^const '+n+'=([^\\n]*);','m')); if(!m) throw new Error('const introuvable '+n); return eval('('+m[1]+')');};
global.normConf=cst('normConf'); global.fmt=eval('('+fnOf('fmt')+')');
global.parseNum=eval('('+fnOf('parseNum')+')'); global.parseConf=eval('('+fnOf('parseConf')+')');
global.calcStats=eval('('+fnOf('calcStats')+')'); global.makeLabel=eval('('+fnOf('makeLabel')+')');
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global._refIdKey=eval('('+fnOf('_refIdKey')+')');
global._l505HorsPlan=eval('('+fnOf('_l505HorsPlan')+')');
global._l506RefGroupFor=eval('('+fnOf('_l506RefGroupFor')+')');
const G=eval('('+fnOf('_l506GroupsFromDetail')+')'); global._l506GroupsFromDetail=G;
const D=eval('('+fnOf('_l506EditDerived')+')');
const R=_l506RefGroupFor;
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
{ const g=G([{conf:'1x285',useful:300,blade:0,recut:true,rollW:300},{conf:'1x285',useful:300,blade:0,recut:true,rollW:300},{conf:'2x600',useful:1560,blade:0},{conf:'2x600',useful:1560,blade:0}],1560,0);
  ok(g.length===2,'2 groupes (2 ♻ identiques puis 2 mères identiques) → '+g.length);
  ok(g[0]&&g[0].label.indexOf('♻')===0&&/rouleau 300 mm/.test(g[0].label),'le groupe ♻ garde son marqueur et son rouleau : '+(g[0]&&g[0].label));
  ok(g[0]&&parseNum(g[0].waste)===15,'chute du ♻ = 300 − 285 = 15 mm (était 1275 : laize de la mère) → '+(g[0]&&g[0].waste));
  ok(g[1]&&parseNum(g[1].waste)===360&&g[1].count===2,'mères : 1560 − 1200 = 360 mm, ×2 → '+(g[1]&&g[1].waste)+' ×'+(g[1]&&g[1].count)); }
{ const g=G([{conf:'2x600',useful:1560},{conf:'2x600',useful:1300}],1560,0);
  ok(g.length===2&&parseNum(g[0].waste)===360&&parseNum(g[1].waste)===100,'même conf, laizes différentes → 2 groupes (360 / 100 mm), jamais fusionnés'); }
{ const g=G([{conf:'2x600'},{conf:'2x600'}],1560,0);
  ok(g.length===1&&g[0].count===2&&parseNum(g[0].waste)===360,'lignes sans laize propre → laize de la fiche (rétro-compat) : 1 groupe ×2, 360 mm'); }
{ const g=G([{conf:'1x1700',useful:1560}],1560,0);
  ok(g.length===1&&parseNum(g[0].waste)===0,'motif plus large que la laize : chute clampée à 0, pas négative'); }
console.log('── _l506EditDerived : les 5 divergences de la 3e vérification ──');
{ const det=[]; for(let i=0;i<10;i++) det.push({conf:'2x600',useful:1560,blade:0,refIdx:0}); det.push({conf:'1x285',useful:300,blade:0,recut:true,rollW:300},{conf:'1x285',useful:300,blade:0,recut:true,rollW:300});
  const d=D({useful:'1560',blade:'0',longueur:'1000'},det);
  ok(d.totalBobines===10&&d.nbPlan===12,'10 mères + 2 ♻ : totalBobines 10 (était 12 → m² +20 %), nbPlan 12 → '+d.totalBobines+'/'+d.nbPlan);
  const mat=10*1560+600, used=10*1200+2*285, cs=360, reste=2*15, att=+(Math.max(0,mat-used-cs-reste)/mat*100).toFixed(1);
  ok(d.pct===att&&Math.abs(d.pctMl-att)<0.06,'pct = (mat − utilisé − solde 360 − résidu ♻ 30)/mat = '+att+' % → '+d.pct+' (pctMl '+d.pctMl+')');
  ok(d.groups.length===2&&d.groups[1].label.indexOf('♻')===0,'groups : mères puis ♻ marqué'); }
{ const det=[]; for(let i=0;i<7;i++) det.push({conf:'4x300',useful:1275,blade:15}); det.push({conf:'2x500',useful:1275,blade:15,phaseEnd:true},{conf:'1x250',useful:1275,blade:15});
  const t=c=>calcStats(parseConf(c),15).total; const d=D({useful:'1275',blade:'15',longueur:'500'},det);
  const mat=9*1275, used=7*t('4x300')+t('2x500')+t('1x250'), cs=(1275-t('2x500'))+(1275-t('1x250')), att=+(Math.max(0,mat-used-cs)/mat*100).toFixed(1);
  ok(d.chuteStock===cs,'solde stock = fin de phase '+(1275-t('2x500'))+' + dernière mère '+(1275-t('1x250'))+' = '+cs+' → '+d.chuteStock);
  ok(d.pct===att,'pct plan phasé = '+att+' % (une fin de phase requalifiée en perte donnait ×2,3) → '+d.pct); }
{ const det=[]; for(let i=0;i<5;i++) det.push({conf:'4x300',useful:1275,blade:15}); det.push({conf:'1x250',useful:1275,blade:15},{label:'RESTE-01',conf:'2x400',useful:1275,blade:15,horsPlan:true});
  const t=c=>calcStats(parseConf(c),15).total; const d=D({useful:'1275',blade:'15',longueur:'500'},det);
  ok(d.chuteStock===1275-t('1x250')&&d.groups.length===2&&d.totalBobines===6&&d.nbPlan===6,'RESTE-01 exclue du solde, des groups et du plan : solde '+d.chuteStock+', groups '+d.groups.length+', mères '+d.totalBobines); }
{ const f={useful:'1560 / 1300',blade:'0',longueur:'1500 / 1500',refGroups:[{ref:'A',useful:1560,longueur:'1500'},{ref:'B',useful:1300,longueur:'1500'}]};
  const det=[{conf:'2x600',refIdx:0,ref:'A',useful:1560},{conf:'2x600',refIdx:0,ref:'A',useful:1560},{conf:'2x600',refIdx:1,ref:'B',useful:1300},{conf:'2x600',refIdx:1,ref:'B',useful:1300},{conf:'2x600',refIdx:1,ref:'B',useful:1300},{conf:'1x700',refIdx:1,ref:'B',useful:1300}];
  const d=D(f,det);
  ok(d.groups.length===3&&parseNum(d.groups[0].waste)===360&&parseNum(d.groups[1].waste)===100&&parseNum(d.groups[2].waste)===600,'multi-réf : 3 groupes à la laize de chaque ligne (360/100/600)');
  ok(d.chuteStock===360+600,'solde = dernière mère de CHAQUE réf : 360 + 600 = '+d.chuteStock);
  ok(d.totalBobines===6&&d.pctMl!=null&&Math.abs(d.pctMl-d.pct)<0.06,'pctMl pondéré (métrages égaux) = pct → '+d.pct+' / '+d.pctMl);
  const d2=D({...f,refGroups:[{ref:'A',useful:1560,longueur:'1500'},{ref:'B',useful:1300,longueur:''}]},det);
  ok(d2.pctMl===null&&d2.pct===d.pct,'un métrage manquant → pctMl null (repli pct chez les lecteurs), pct inchangé'); }
{ const f={useful:'1560 / 1300',blade:'0',refGroups:[{ref:'A',useful:1560,longueur:'1500'},{ref:'B',useful:1300,longueur:'1500'}]};
  const d=D(f,[{conf:'2x600',refIdx:0,ref:'A'},{conf:'2x600',refIdx:1,ref:'B'}]);
  ok(parseNum(d.groups[1].waste)===100,'ligne B sans fd.useful : laize de B (1300) → chute 100, pas 360 (laize de la 1re réf)'); }
console.log('── _l506RefGroupFor ──');
{ const rg=[{ref:'A',longueur:'800'},{ref:'TacFlex',longueur:'2000'}], f={refGroups:rg};
  ok(R(f,{refIdx:1,ref:'TacFlex®'})===rg[1],'réf renommée (aucun groupe ne porte le nom) : l index reste fiable');
  ok(R(f,{refIdx:0,ref:'TacFlex'})===rg[1],'index qui désigne un autre groupe existant : le nom tranche');
  ok(R(f,{refIdx:1})===rg[1],'sans nom : l index');
  ok(R(f,{ref:'A'})===rg[0],'sans index : nom unique');
  ok(R(f,{ref:'ZZZ'})===null,'nom inconnu, sans index → null');
  ok(R({refGroups:[rg[0]]},{ref:'ZZZ',refIdx:7})===rg[0],'mono-réf → le seul groupe');
  const h=[{ref:'KX',longueur:'1000'},{ref:'KX',longueur:'700'}];
  ok(R({refGroups:h},{ref:'KX'})===null&&R({refGroups:h},{ref:'KX',refIdx:1})===h[1],'homonymes : sans index → null (ambigu), avec index → l index'); }
{ const g=G([{conf:'1x285',recut:true,rollW:300}],1560,0); ok(parseNum(g[0].waste)===15&&/rouleau 300/.test(g[0].label),'♻ sans fd.useful : rollW fait foi (15 mm, « rouleau 300 mm »)'); }
console.log(fail?('\n💥 '+fail+' échec(s) sur '+total):'\n🏆 regroupement édition admin : '+total+'/'+total+' OK');
process.exit(fail?1:0);
