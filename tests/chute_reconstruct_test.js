// chute_reconstruct_test.js — [L505 · audit #8] GARDE de _l493ChuteFromDetail (chute gardée reconstruite pour les fiches
// archivées AVANT L485, et pour toute fiche ÉDITÉE par un admin depuis L505). Les 7 cas de L493 ne vivaient que dans un
// script jetable (tests/shot.mjs --js) : ils sont ici pour de bon, plus les 4 cas que l audit 30 agents a trouvés faux.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length,k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.parseNum=eval('('+fnOf('parseNum')+')');
global.parseConf=eval('('+fnOf('parseConf')+')');
global.calcStats=eval('('+fnOf('calcStats')+')');
global._l505HorsPlan=eval('('+fnOf('_l505HorsPlan')+')');
let warns=0; global._l505Warn=function(){ warns++; };
const chute=eval('('+fnOf('_l493ChuteFromDetail')+')');
let fail=0; const ok=(c,m)=>{ console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const L=(conf,extra)=>Object.assign({conf,useful:1200,blade:0,coupee:true},extra||{});
console.log('── les 7 cas de L493 ──');
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0}),L('2x500',{refIdx:0})]})===160,'mono-réf 800 m, solde 200 mm → 160 m²');
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'B',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('2x500',{refIdx:0,ref:'A'}),L('1x900',{refIdx:1,ref:'B'})]})===760,'multi-réf : 200 mm × 800 m + 300 mm × 2000 m → 760 m²');
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0,phaseEnd:true}),L('1x1000',{refIdx:0})]})===320,'fin de phase 200 mm + dernière 200 mm → 320 m²');
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0}),L('1x100',{refIdx:0,recut:true})]})===160,'rouleau ♻ ignoré (résidu = perte) → 160 m²');
ok(chute({longueur:'800',manqueMatiere:true,ficheDetail:[L('2x500',{refIdx:0,coupee:false})]})===0,'manque-matière, bobine jamais montée → 0');
ok(chute({ficheDetail:[L('2x500',{refIdx:0})]})===0,'métrage absent → 0 (jamais un chiffre inventé)');
{ const p=parseConf('2x500'), t=calcStats(p,3).total, att=Math.round((1200-t)/1000*800*10)/10;
  ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0,blade:3})]})===att,'lame 3 mm passée à calcStats → '+att+' m²'); }
console.log('── L505 · audit #8 ──');
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'B',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('2x500',{refIdx:0,ref:'A'}),L('1x900',{ref:'B'})]})===760,'ligne SANS refIdx résolue par NOM (B → 2000 m), pas rg[0] → 760 m² (était 240+160)');
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'B',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('1x900',{ref:'ZZZ'})]})===0,'multi-réf, nom inconnu et sans index → réf OMISE (0), jamais f.longueur « 800 / 2000 »');
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0}),L('1x900',{label:'RESTE-01'})]})===160,'bobine RESTE-01 (hors plan) exclue → 160 m² (était 400 : 2e seau)');
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0}),L('1x900',{horsPlan:true}),L('1x900',{rattrapage:true}),L('1x900',{autoLabel:'B7 · OP2-2'})]})===160,'horsPlan / rattrapage / OP2- : même règle unique _l505HorsPlan → 160 m²');
ok(_l505HorsPlan({label:'B12'})===false&&_l505HorsPlan({label:'B12 · RESTE-2'})===true&&_l505HorsPlan({autoLabel:'OP2-3'})===true&&_l505HorsPlan(null)===false,'_l505HorsPlan : B12 non · RESTE-2 oui · OP2-3 oui · null non');
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0})],refGroups:'pas un tableau'})===160,'refGroups corrompu : repli f.longueur sans planter → 160 m²');
ok(warns===0,'aucun calcul en repli sur ces cas ('+warns+' warn)');
console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 reconstruction chute : '+(14-fail)+'/14 OK');
process.exit(fail?1:0);
