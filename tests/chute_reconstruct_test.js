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
global._refIdKey=eval('('+fnOf('_refIdKey')+')');
global._l506RefGroupFor=eval('('+fnOf('_l506RefGroupFor')+')');
let warns=0; global._l505Warn=function(){ warns++; };
const chute=eval('('+fnOf('_l493ChuteFromDetail')+')');
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
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
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'B',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('1x900',{ref:'ZZZ'})]})===0&&warns===1,'multi-réf, nom inconnu et sans index → réf OMISE (0) + 1 trace, jamais f.longueur « 800 / 2000 »'); warns=0;
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0}),L('1x900',{label:'RESTE-01'})]})===160,'bobine RESTE-01 (hors plan) exclue → 160 m² (était 400 : 2e seau)');
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0}),L('1x900',{horsPlan:true}),L('1x900',{rattrapage:true}),L('1x900',{autoLabel:'B7 · OP2-2'})]})===160,'horsPlan / rattrapage / OP2- : même règle unique _l505HorsPlan → 160 m²');
ok(_l505HorsPlan({label:'B12'})===false&&_l505HorsPlan({label:'B12 · RESTE-2'})===true&&_l505HorsPlan({autoLabel:'OP2-3'})===true&&_l505HorsPlan(null)===false,'_l505HorsPlan : B12 non · RESTE-2 oui · OP2-3 oui · null non');
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0})],refGroups:'pas un tableau'})===160,'refGroups corrompu : repli f.longueur sans planter → 160 m²');
ok(warns===0,'aucun calcul en repli sur ces cas ('+warns+' warn)');
console.log('── L506 · homonymes, seaux, manque-matière (vérification adverse) ──');
warns=0;
ok(chute({refGroups:[{ref:'KX1006-1',longueur:'1000'},{ref:'KX1006-1',longueur:'1000'}],longueur:'1000 / 1000',ficheDetail:[L('1x900',{ref:'KX1006-1'})]})===0&&warns===1,'homonymes de MÊME métrage sans refIdx : ambigu → 0 + trace (la ligne ne se rattache à aucune bobine mère précise)'); warns=0;
ok(chute({refGroups:[{ref:'KX1006-1',longueur:'1000'},{ref:'KX1006-1',longueur:'700'}],longueur:'1000 / 700',ficheDetail:[L('1x900',{ref:'KX1006-1'})]})===0&&warns===1,'homonymes de métrages DIFFÉRENTS sans refIdx : ambigu → 0 + 1 trace (jamais la 1re trouvée)'); warns=0;
ok(chute({refGroups:[{ref:'KX1006-1',longueur:'1000'},{ref:'KX1006-1',longueur:'700'}],longueur:'1000 / 700',ficheDetail:[L('1x900',{ref:'KX1006-1',refIdx:1})]})===210&&warns===0,'homonymes avec refIdx (fiches ≥ L500) : l index tranche → 300 mm × 700 m = 210 m²');
ok(chute({refGroups:[{ref:'KX',longueur:'1000'},{ref:'KX',longueur:'1000'}],longueur:'1000 / 1000',ficheDetail:[L('2x500',{ref:'KX'}),L('2x500',{ref:'KX'})]})===0&&warns===1,'2 bobines mères homonymes sans refIdx (audit) : plus de demi-chiffre silencieux → 0 + trace'); warns=0;
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'A',longueur:'1000'}],longueur:'800 / 1000',ficheDetail:[L('2x500',{ref:'A'}),L('1x900',{ref:'A',useful:1300})]})===0&&warns===1,'homonymes de laizes différentes sans refIdx (audit) : plus de fusion de seaux → 0 + trace'); warns=0;
ok(chute({longueur:'800',ficheDetail:[L('2x500',{refIdx:0}),L('1x900',{})]})===240&&warns===0,'mono-réf, ligne ajoutée par l admin sans refIdx : UN seul seau, solde de la vraie dernière bobine (300 mm × 800 m = 240, était 160+240)');
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'B',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('2x500',{refIdx:0,ref:'A'}),L('1x900',{ref:'A'})]})===240&&warns===0,'multi-réf, ligne sans refIdx au nom unique : rejoint le seau de sa réf (solde de la dernière = 300 mm × 800 m = 240)');
ok(chute({longueur:'800',manqueMatiere:true,ficheDetail:[L('2x500',{refIdx:0,coupee:true})]})===0,'manque-matière avec bobines coupées : 0 (règle L492, même doctrine que la branche chiffrée — upd.chuteM2=null ne la contourne plus)');
console.log('── L506 · 2e vérification adverse ──');
warns=0;
ok(chute({longueur:'800',useful:'1200',ficheDetail:[L('2x500',{refIdx:0}),{conf:'1x900',coupee:true}]})===240&&warns===0,'mono-réf, ligne SANS laize (ajoutée par l admin) : la laize de la fiche fait foi → 300 mm × 800 m = 240 (était 0 m² pour toute la fiche)');
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'B',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('1x900',{refIdx:0,ref:'B'})]})===600&&warns===0,'refIdx DÉCALÉ (index 0 mais nom B) : le nom tranche → 300 mm × 2000 m = 600 (était 240 sans trace)');
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'B',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('2x500',{refIdx:5,ref:'A'}),L('1x900',{refIdx:0,ref:'A'})]})===240&&warns===0,'refIdx HORS BORNES sur une ligne : même seau que sa réf (solde de la dernière = 300 mm × 800 m = 240, pas 160+240)');
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'B',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('2x500',{refIdx:0,ref:'A'}),{conf:'1x900',coupee:true}]})===160&&warns===1,'multi-réf, ligne ajoutée sans laize ni réf : omise + trace, la réf A garde son solde (160)'); warns=0;
console.log('── L506 · 3e vérification adverse ──');
warns=0;
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'TacFlex',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('1x900',{refIdx:1,ref:'TacFlex®'})]})===600&&warns===0,'réf RENOMMÉE entre gel et archive (« TacFlex® » vs « TacFlex ») : l index reste fiable → 300 mm × 2000 m = 600 (la garde-nom stricte donnait 0 + trace)');
ok(chute({refGroups:[{ref:'A',longueur:'800'},{ref:'B',longueur:'2000'}],longueur:'800 / 2000',ficheDetail:[L('1x900',{refIdx:0,ref:'B'})]})===600&&warns===0,'index qui désigne un AUTRE groupe existant : le nom tranche → 600');
console.log(fail?('\n💥 '+fail+' échec(s) sur '+total):'\n🏆 reconstruction chute : '+total+'/'+total+' OK');
process.exit(fail?1:0);
