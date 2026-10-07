// l552_test.js — [L552 · 07/10/2026, B14 de l audit d usage du 06/10] un releve de temps corrige au bureau (saveTempsEdit) ne mettait pas
// a jour le temps AFFICHE sur sa fiche (tempsStr : carte, fiche imprimee, CSV). La fiche liee est retrouvee de facon STRICTE (meme
// client, meme ref, meme n° de commande, date a 5 s au plus — exactement un candidat) ; seule la duree du texte change ; une fiche
// VALIDEE demande confirmation ; l ecriture de la fiche n a lieu qu APRES la reussite du releve, jamais dans le meme lot. Donnees FICTIVES.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const withCtx=(fnSrc,ctx)=>new Function('ctx','with(ctx){ return ('+fnSrc+'); }')(ctx);
ok(/const APP_VERSION='2026\.\d\d\.\d\d-L(55[2-9]|5[6-9]\d|[6-9]\d\d)';/.test(src),'APP_VERSION >= L552');
const nrm=v=>String(v==null?'':v).trim().toLowerCase();
const fmtTimeFr=withCtx(fnOf('fmtTimeFr'),{Math,String});
const FIND=withCtx(fnOf('_l552FicheOfTemps'),{nrm,Array,Date,Math,isNaN});
const STR=withCtx(fnOf('_l552TempsStr'),{fmtTimeFr,Number,Math});

console.log('── 1. retrouver la fiche d un releve (strict) ──');
const T0={client:'CLIENT A',ref:'REF 1',numCmd:'4501',machine:'FEBA',operateur:'AB',dateEnd:'2026-05-14T14:00:03.000Z'};
const FI=(o)=>Object.assign({_id:'f1',client:'CLIENT A',ref:'REF 1',numCmd:'4501',machine:'FEBA',ini:'AB',date:'2026-05-14T14:00:02.400Z',tempsStr:'71h 12min 05s (AB — 14/05/2026)'},o||{});
ok(FIND(T0,[FI()])&&FIND(T0,[FI()])._id==='f1','un seul candidat → trouve');
ok(FIND(T0,[FI(),FI({_id:'f2',date:'2026-05-14T14:00:04.000Z'})])===null,'deux candidats dans les 5 s → aucun (on n ecrit rien)');
ok(FIND(T0,[FI({date:'2026-05-14T13:59:57.000Z'})])===null,'ecart de 6 s → aucun');
ok(FIND(T0,[FI({date:'2026-05-14T13:59:58.000Z'})])!==null,'ecart de 5 s pile → trouve');
ok(FIND(T0,[FI({deleted:true})])===null,'fiche archivee (supprimee) → aucune');
ok(FIND(T0,[FI(),FI({_id:'f0',deleted:true,date:'2026-05-14T14:00:01.000Z'})])===null,'doublon ARCHIVE dans les 5 s + fiche active → ambigu → aucune (revue adverse)');
ok(FIND(T0,[FI({machine:'MAVEG'})])===null,'autre machine (meme commande coupee sur 2 tablettes en meme temps) → aucune (revue adverse)');
ok(FIND(T0,[FI({ini:'CD'})])===null,'autres initiales → aucune');
ok(FIND(T0,[FI({machine:'MAVEG',ini:'CD',_id:'f2'}),FI()])._id==='f1','deux tablettes, meme commande, 5 s : chaque releve retrouve SA fiche');
ok(FIND(T0,[FI({client:'CLIENT B'})])===null&&FIND(T0,[FI({ref:'REF 2'})])===null,'autre client ou autre ref → aucune');
ok(FIND(T0,[FI({numCmd:' 4501 '})])!==null,'n° de commande « 4501 » contre « 4501 » avec espaces → trouve');
ok(FIND(T0,[FI({numCmd:'4502'})])===null,'autre n° de commande → aucune');
ok(FIND(Object.assign({},T0,{numCmd:''}),[FI({numCmd:''})])!==null&&FIND(Object.assign({},T0,{numCmd:''}),[FI({numCmd:'4501'})])===null,'n° vide des deux cotes → trouve ; vide contre rempli → aucune');
ok(FIND(Object.assign({},T0,{dateEnd:''}),[FI()])===null&&FIND(Object.assign({},T0,{dateEnd:'n/a'}),[FI()])===null,'releve sans fin datee → aucune');
ok(FIND(T0,[FI({date:''})])===null&&FIND(T0,[null,undefined,'x',FI({date:'zz'})])===null,'fiche sans date ou entrees invalides → aucune, sans exception');
ok(FIND(null,[FI()])===null&&FIND(T0,null)===null&&FIND(T0,'x')===null,'entrees vides → aucune, sans exception');
{ const before=Object.assign({},T0), after=Object.assign({},T0,{client:'CLIENT CORRIGE'});
  ok(FIND(before,[FI()])!==null&&FIND(after,[FI()])===null,'le client est modifie par la correction : on cherche avec les valeurs d AVANT'); }

console.log('── 2. nouveau texte : seule la duree change ──');
ok(STR('71h 12min 05s (AB — 14/05/2026)',25925)==='7h 12min 05s (AB — 14/05/2026)','71h 12min 05s → 7h 12min 05s, parenthese intacte → '+STR('71h 12min 05s (AB — 14/05/2026)',25925));
ok(STR('45s (CD — 10/09/2026)',45)===null,'meme duree → rien a ecrire');
ok(STR('non enregistré',100)===null,'« non enregistré » → rien');
ok(STR('3h 10min',100)===null&&STR('3h 10min (AB)',100)===null&&STR('',100)===null&&STR(null,100)===null&&STR(42,100)===null,'texte mal forme ou absent → rien');
ok(STR('02min 57s (CD+AB — 10/09/2026)',3600)==='1h 00min 00s (CD+AB — 10/09/2026)','initiales composees conservees');
ok(STR('1h 00min 00s (EF — 01/10/2026)',-5)===null&&STR('1h 00min 00s (EF — 01/10/2026)',NaN)===null&&STR('1h 00min 00s (EF — 01/10/2026)',Infinity)===null,'duree negative ou invalide → rien');
ok(STR('1h 00min 00s (EF — 01/10/2026)',0)==='00s (EF — 01/10/2026)','duree 0 : format fmtTimeFr (« 00s »)');
ok(STR('7h 12min 05s (AB — 14/05/2026) (copie)',25925)===null,'parenthese finale qui n est pas « (initiales — date) » → rien');

console.log('── 3. saveTempsEdit : ordre des ecritures et confirmation ──');
function run(opt){
  const log=[]; const t=Object.assign({_id:'t1',duree:337600,operateur:'AB',date:'2026-05-14T04:37:00.000Z'},T0);
  const fiche=FI(opt.fiche||{});
  const vals={teH:'7',teM:'12',teS:'05',teDate:'',teMachine:'feba',teClient:'CLIENT A',teRef:'REF 1',teNumCmd:'4501',teOp:'AB',teOp2:'',teOp2Bob:'',teLaizes:'10',teBob:'2',teLong:'',teLarg:'',teNumJour:'',teComm:''};
  Object.assign(vals,opt.vals||{});
  const doc=(col,id)=>({update:(ch)=>{ log.push(col+':'+id+':'+Object.keys(ch).join(',')); if(opt.failCol===col) return Promise.reject(new Error('refus')); return Promise.resolve(); }});
  const ctx={canManageData:()=>true,tempsCache:[t],fichesCache:[fiche],document:{getElementById:i=>i==='tempsEditOverlay'?{remove(){}}:(i in vals?{value:vals[i]}:null)},
    db:{collection:c=>({doc:id=>doc(c,id)})},_bw:(p)=>p.then(()=>(opt.queued?null:undefined)),logAudit:(a,b,c,d)=>{ log.push('audit:'+b+':'+d); return Promise.resolve(); },
    refreshAnalyseIfPresent:()=>{},renderFiches:()=>{ log.push('renderFiches'); },showToast:(m)=>log.push('toast:'+m),fmtTimeFr,
    confirmDlg:(m)=>{ log.push('confirm:'+m); return Promise.resolve(!!opt.confirm); },
    parseInt,String,Math,isNaN,Number,Date,Object,Array,Promise,nrm,
    _l552FicheOfTemps:null,_l552TempsStr:null,_l552ReportFiche:null};
  ctx._l552FicheOfTemps=withCtx(fnOf('_l552FicheOfTemps'),ctx); ctx._l552TempsStr=withCtx(fnOf('_l552TempsStr'),ctx); ctx._l552ReportFiche=withCtx(fnOf('_l552ReportFiche'),ctx);
  const save=withCtx(fnOf('saveTempsEdit'),ctx);
  return save('t1').then(()=>({log,fiche,t}));
}
(async()=>{
  { const r=await run({});
    ok(r.log[0].startsWith('temps:t1:')&&r.log.some(x=>x==='fiches:f1:tempsStr'),'fiche non validee : releve PUIS fiche, sans question → '+r.log.filter(x=>/^(temps|fiches|confirm)/.test(x)).join(' | '));
    ok(r.log.findIndex(x=>x.startsWith('temps:'))<r.log.findIndex(x=>x.startsWith('fiches:')),'la fiche est ecrite APRES le releve');
    ok(r.fiche.tempsStr==='7h 12min 05s (AB — 14/05/2026)','cache de la fiche mis a jour');
    ok(r.log.some(x=>x.startsWith('audit:fiches:')&&x.includes('71h 12min 05s (AB — 14/05/2026) → 7h 12min 05s (AB — 14/05/2026)')),'journal : avant → apres');
    ok(r.log.includes('renderFiches'),'liste des fiches re-affichee');
    ok(!r.log.some(x=>x.startsWith('confirm:')),'aucune question pour une fiche non validee'); }
  { const r=await run({fiche:{valide:true,valideBy:'XY',valideAt:'2026-05-15T08:00:00.000Z'},confirm:true});
    const c=r.log.find(x=>x.startsWith('confirm:'))||'';
    ok(/validée par XY le 15\/05/.test(c)&&c.includes('71h 12min 05s')&&c.includes('→ 7h 12min 05s'),'fiche VALIDEE : question claire (qui, quand, avant → apres) → '+c.replace(/\n/g,' / '));
    ok(r.log.findIndex(x=>x.startsWith('confirm:'))<r.log.findIndex(x=>x.startsWith('temps:')),'la question vient AVANT toute ecriture');
    ok(r.log.some(x=>x==='fiches:f1:tempsStr'),'confirme → fiche mise a jour'); }
  { const r=await run({fiche:{valide:true,valideBy:'XY'},confirm:false});
    ok(r.log.some(x=>x.startsWith('temps:t1:'))&&!r.log.some(x=>x.startsWith('fiches:')),'« Relevé seul » → releve corrige, fiche INTACTE');
    ok(r.fiche.tempsStr==='71h 12min 05s (AB — 14/05/2026)','fiche validee refusee : texte d origine garde');
    ok(r.log[r.log.length-1].startsWith('toast:✓ Relevé corrigé — fiche validée laissée telle quelle'),'« Relevé seul » (ou Echap, ou tap a cote) : on le DIT'); }
  { const r=await run({failCol:'temps'});
    ok(!r.log.some(x=>x.startsWith('fiches:'))&&r.log.some(x=>x.startsWith('toast:Erreur enregistrement')),'echec du releve → la fiche n est PAS touchee'); }
  { const r=await run({failCol:'fiches'});
    ok(r.log.some(x=>x.startsWith('toast:⚠ Relevé corrigé, mais le temps de la fiche'))&&r.fiche.tempsStr.startsWith('71h'),'echec de la fiche → releve corrige, avertissement, cache de la fiche inchange'); }
  { const r=await run({queued:true});
    ok(r.log.some(x=>x.startsWith('toast:⏳ Relevé corrigé — temps de la fiche mis en file')),'hors ligne : la fiche est mise en file et on le dit'); }
  { const r=await run({vals:{teH:'71'}});
    ok(!r.log.some(x=>x.startsWith('fiches:'))&&!r.log.some(x=>x.startsWith('confirm:')),'duree inchangee par rapport a la fiche → aucune ecriture fiche');
    ok(r.log[r.log.length-1]==='toast:✓ Relevé corrigé','fiche deja a jour : message habituel seul'); }
  { const r=await run({fiche:{date:'2026-05-14T13:00:00.000Z'}});
    ok(r.log.some(x=>x.startsWith('temps:t1:'))&&!r.log.some(x=>x.startsWith('fiches:')),'aucune fiche liee (date trop loin) → releve seul, comme avant');
    ok(r.log[r.log.length-1].startsWith('toast:✓ Relevé corrigé — fiche liée non retrouvée'),'duree changee et fiche non retrouvee : on le DIT'); }
  { const r=await run({fiche:{date:'2026-05-14T13:00:00.000Z'},vals:{teH:'93',teM:'46',teS:'40'}});
    ok(r.log[r.log.length-1]==='toast:✓ Relevé corrigé','duree inchangee, fiche non retrouvee : message habituel seul'); }
  { const r=await run({vals:{teOp2:'CD',teOp2Bob:''}});
    ok(!r.log.some(x=>/^(temps|fiches|confirm)/.test(x)),'correction refusee (op.2 sans bobine) → rien n est ecrit ni demande'); }

  console.log('── 4. epingles ──');
  const st=fnOf('saveTempsEdit');
  ok(!/batch\(\)/.test(st)&&!/batch\(\)/.test(fnOf('_l552ReportFiche')),'jamais dans un lot d ecritures (batch)');
  ok(st.indexOf("db.collection('temps').doc(id).update(changes)")<st.indexOf('_l552ReportFiche('),'le report fiche est APRES la mise a jour du releve');
  ok(/catch\(e\)\{ showToast\('Erreur enregistrement : '\+e\.message,'err'\); return; \}/.test(st),'echec du releve = sortie (la fiche n est pas ecrite)');
  ok(/update\(\{tempsStr:ns\}\)/.test(fnOf('_l552ReportFiche')),'seul le champ tempsStr de la fiche est ecrit');
  ok(!/_l552/.test(fnOf('saveCommandeFiche')),'envoi de la fiche : inchange');

  console.log('\n'+(fail?('❌ '+fail+' echec(s) sur '+total):('🏆 L552 OK : '+total+' verifications')));
  process.exit(fail?1:0);
})();
