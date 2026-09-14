// papier_l518_test.js — [L518 · demandes Celine 10/09/2026, papier du plan imprime par Dominique] GARDE du formateur PAPIER
// (« 9 x 500 mm + 1 x 300 mm », makeLabel GELEE intouchable) et du rendu du tableau des bobines (« Perte / Solde »,
// « Perte 45 mm » / « Solde 45 mm », « 1 bobine (derniere : solde) »). Ne couvre ni coupeCol (papier fiche) ni multi-clients.
const fs=require('fs');
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
global.nrm=v=>String(v==null?'':v).trim().toLowerCase();
global.fmt=eval('('+fnOf('fmt')+')');
global.calcStats=eval('('+fnOf('calcStats')+')');
global.makeLabel=eval('('+fnOf('makeLabel')+')');
const mX=src.match(/^const _L518_X='([^']*)';/m); if(!mX) throw new Error('introuvable _L518_X'); global._L518_X=mX[1];
const CONF=eval('('+fnOf('_l518Conf')+')'); global._l518Conf=CONF;
const SEG=eval('('+fnOf('_l518SegPapier')+')'); global._l518SegPapier=SEG;

console.log('── A. formateur papier (pur) ──');
ok(_L518_X===' x ','separateur « x » (Celine : « 9 x 500MM ») → "'+_L518_X+'"');
ok(CONF([{qty:9,width:500},{qty:1,width:300}])==='9 x 500 mm + 1 x 300 mm','demande Celine (makeLabel rendait « 9×500 + 300mm ») → '+CONF([{qty:9,width:500},{qty:1,width:300}]));
ok(CONF([{qty:1,width:300}])==='1 x 300 mm','piece SEULE : le nombre est ecrit quand meme → '+CONF([{qty:1,width:300}]));
ok(CONF([{qty:4,width:92.5}])==='4 x 92.5 mm','laize decimale via fmt → '+CONF([{qty:4,width:92.5}]));
ok(CONF([])===''&&CONF(null)==='','pattern vide / null : jamais « undefined » sur le papier');
ok(SEG('6×100 + 4×120')==='6 x 100 mm + 4 x 120 mm','conf contigue multi-clients (_l415Conf) reformatee → '+SEG('6×100 + 4×120'));
ok(makeLabel([{qty:9,width:500},{qty:1,width:300}])==='9×500 + 300mm','NON-REGRESSION : makeLabel reste byte-identique (ecrans, fiche, etiquettes, archives)');

console.log('── B. rendu HTML du tableau des bobines (buildPlanPrintHTML dans Node, cas Leszelles 5 bobines meme configuration) ──');
try{
  const G=Object.create(null);
  ['fmt','calcStats','makeLabel','_planGroupsByLaize','chutePrintConfig','chutePrintRecap','recutPrintRows','recutPrintRecap','_chkBoxes','_l512Has','_l512ByW','_l512Cell','_palSplitSolde','_l518Conf','_l518SegPapier','cliAllocText','_l415Conf'].forEach(n=>{ try{ G[n]=eval('('+fnOf(n)+')'); }catch(e){ console.log('   (non extrait : '+n+' — '+e.message+')'); } });
  G.nrm=global.nrm; G._L518_X=global._L518_X;
  G.esc=s=>String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  G.refDisp=x=>String(x||''); G.refColor=()=>'#000'; G.getMachineLabel=m=>String(m||'').toUpperCase(); G.filmAttrStr=()=>''; G.packagingRecapHTML=()=>''; G.today=()=>'14/09/2026'; G.parseNum=v=>{const n=parseFloat(String(v==null?'':v).replace(',','.'));return isNaN(n)?0:n;};
  G.document={getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]}; G.window=G; G.console=console; G.Math=Math; G.Number=Number; G.String=String; G.Array=Array; G.Object=Object; G.JSON=JSON; G.Set=Set; G.Map=Map; G.parseInt=parseInt; G.parseFloat=parseFloat; G.isNaN=isNaN; G.isFinite=isFinite; G.Date=Date; G.RegExp=RegExp; G.Error=Error; G.undefined=undefined; G.NaN=NaN; G.Infinity=Infinity; G.encodeURIComponent=encodeURIComponent; G.Boolean=Boolean;
  Object.keys(G).forEach(k=>{ try{ global[k]=G[k]; }catch(e){} });   /* les helpers extraits resolvent leurs globals (esc, fmt…) hors du with() */
  const STUBS={}; const ctx=new Proxy(G,{has:()=>true,get:(t,k)=>{ if(k===Symbol.unscopables) return undefined; if(k in t) return t[k]; if(typeof k==='string'){ STUBS[k]=(STUBS[k]||0)+1; return function(){ return ''; }; } return undefined; }});
  const build=new Function('ctx','with(ctx){ return (function(){ return ('+fnOf('buildPlanPrintHTML')+')(o); })(); }');
  const pg=G._palSplitSolde([{count:5,pattern:[{qty:9,width:500},{qty:1,width:300}]}]);
  const o={groups:[{ref:'41316120 - DH1006-2',useful:4890,blade:5,mother:4910,longueur:'1000',machine:'feba',rows:[{qty:45,width:500},{qty:5,width:300}],planGroups:pg,recutGroups:[],recutBobines:[],chutesUsed:{}}],mn:'FEBA',client:'Leszelles',refLabelFallback:'',motherFallback:4910,typeCond:'—',palette:'—',etiquetage:'—',cerclage:'—',notesEmb:'',cmdInfoHtml:'',cmdClients:null,numCmdHead:''};
  G.o=o; const h=build(ctx);
  const rows=(h.match(/<tr[^>]*>[\s\S]*?<\/tr>/g)||[]).filter(x=>/bobine/.test(x));
  ok(pg.length===2&&pg[0].count===4&&pg[1].count===1,'_palSplitSolde isole la derniere bobine : 4 + 1 → '+JSON.stringify(pg.map(g=>g.count)));
  ok(/<th>Perte \/ Solde<\/th>/.test(h),'en-tete « Perte / Solde »');
  ok(!/<th>Chute<\/th>/.test(h),'plus de « Chute » en tete de colonne');
  ok(/Perte 45 mm/.test(h),'bobines intermediaires : « Perte 45 mm » (utile 4890 − 4845)');
  ok(/Solde 45 mm/.test(h),'derniere bobine : « Solde 45 mm »');
  ok(h.indexOf('9 x 500 mm + 1 x 300 mm')>=0,'configuration « 9 x 500 mm + 1 x 300 mm » sur le papier');
  ok(/4 bobines/.test(h)&&/1 bobine <span style="white-space:nowrap">\(derni.re : solde\)<\/span>/.test(h),'« 4 bobines » puis « 1 bobine (derniere : solde) »');
  ok(h.indexOf('9×500 + 300mm')<0,'l ancien format « 9×500 + 300mm » a disparu du tableau papier');
  const stubbed=Object.keys(STUBS); if(stubbed.length) console.log('   (fonctions bouchonnees a vide : '+stubbed.join(', ')+')');
}catch(e){ ok(false,'rendu HTML dans Node : '+String(e&&e.message||e)); }
console.log('── C. formateur TEXTE _l518Label (archive groups[].label reformatee a l impression) ──');
{
  const LBL=eval('('+fnOf('_l518Label')+')'); global._l518Label=LBL;
  ok(LBL('9×500 + 300mm')==='9 x 500 mm + 1 x 300 mm','cas Celine : « 9×500 + 300mm » → '+LBL('9×500 + 300mm'));
  ok(LBL('♻ 4×100 (rouleau 300 mm)')==='♻ 4 x 100 mm (rouleau 300 mm)','rouleau : suffixe isole → '+LBL('♻ 4×100 (rouleau 300 mm)'));
  ok(LBL('TACFLEX 300mm · 9×500')==='TACFLEX 300mm · 9 x 500 mm','prefixe « REF · » : le nom de ref (300mm) n est PAS touche → '+LBL('TACFLEX 300mm · 9×500'));
  ok(LBL('4×92.5')==='4 x 92.5 mm'&&LBL('92,5mm')==='1 x 92,5 mm','decimales conservees telles quelles → '+LBL('4×92.5')+' / '+LBL('92,5mm'));
  ok(LBL('1×300 carton 3 (2404)')==='1 x 300 mm carton 3 (2404)','Legrand : le code mandrin reste → '+LBL('1×300 carton 3 (2404)'));
  const once=LBL('9×500 + 300mm'); ok(LBL(once)===once,'idempotent : '+LBL(once));
  ok(LBL('—')==='—'&&LBL('')===''&&LBL(null)==='','« — », vide, null : jamais « undefined »');
}
console.log('── D. ecrans : _l518Ecran (echo du champ, texte libre intact) ──');
{
  global.parseConf=eval('('+fnOf('parseConf')+')');
  global.normConf=eval(src.match(/^const normConf=(.*?);\s{2,}\/\//m)[1]);
  const ECR=eval('('+fnOf('_l518Ecran')+')');
  ok(ECR('24×50')==='24 x 50 mm','champ canonique « 24×50 » → echo « 24 x 50 mm » → '+ECR('24×50'));
  ok(ECR('24 x 50')==='24 x 50 mm'&&ECR('24*50')==='24 x 50 mm','saisie « 24 x 50 » / « 24*50 » (normConf en amont) → '+ECR('24 x 50')+' / '+ECR('24*50'));
  ok(ECR('4×502 + 3×612 + 157mm')==='4 x 502 mm + 3 x 612 mm + 1 x 157 mm','plusieurs laizes → '+ECR('4×502 + 3×612 + 157mm'));
  ok(ECR('2×612 + 157')==='2 x 612 mm + 1 x 157 mm','saisie operateur « 2×612 + 157 » (nombre nu = une piece) → '+ECR('2×612 + 157'));
  ok(ECR('Non réalisée - manque matière')==='Non réalisée - manque matière','texte libre intact (garde parseConf)');
  ok(ECR('')===''&&ECR(null)==='','vide / null → vide');
  const pats=[[{qty:9,width:500},{qty:1,width:300}],[{qty:24,width:50}],[{qty:4,width:92.5},{qty:2,width:157}]];
  ok(pats.every(p=>JSON.stringify(parseConf(normConf(CONF(p))))===JSON.stringify(p)),'aller-retour : parseConf(normConf(_l518Conf(p))) redonne exactement p (l appli relit le format atelier)');
}
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 PAPIER L518 OK : '+total+' verifications'));
process.exit(fail?1:0);
