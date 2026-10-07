// l549_test.js — [L549 · 07/10/2026, trou releve a l etude de L545 (du a L440 #18)] au demarrage, les filets de reprise de 2,5 s / 6 s
// partent AVANT que le compte soit connu : aucun brouillon ne peut etre lu, et le repli « chrono seul » relancait le chrono — apres quoi
// toutes les tentatives d apres la connexion sortaient sur « if(chronoRunning) return » : la fiche ne revenait JAMAIS. Le chrono seul
// attend maintenant que le compte soit connu ; le rendez-vous suivant rend la fiche ET le chrono.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const withCtx=(fnSrc,ctx)=>new Function('ctx','with(ctx){ return ('+fnSrc+'); }')(ctx);
ok(/const APP_VERSION='2026\.\d\d\.\d\d-L(549|5[5-9]\d|[6-9]\d\d)';/.test(src),'APP_VERSION >= L549');
const MR=fnOf('maybeResumeRunningChrono');
(async()=>{
  const mk=(uid,draft)=>{ const rec={chrono:0,fiche:0,toast:[]}; const now=Date.now();
    const ctx={ficheLines:[],chronoRunning:false,planHasContent:()=>false,readChronoLive:()=>({runStart:now-3600e3,startTs:new Date(now-3600e3).toISOString(),began:now-3600e3}),_chronoRunBeganAt:null,
      autosaveId:()=>'d_autosave_'+uid+'_dev',loadDrafts:()=>draft?[draft]:[],db:null,readCmdLive:()=>null,_deviceId:()=>'dev',_uid:()=>uid,
      _dateKey:ms=>{ const d=new Date(ms); return d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate(); },restoreChrono:()=>{ rec.chrono++; ctx.chronoRunning=true; },
      _chronoAutoStopOverride:null,_mirChronoDoc:null,showToast:(m)=>rec.toast.push(m),console:{warn(){}},
      _l545FindSent:async()=>null,_l545Told:{},dayChronoCutoffMs:()=>null,chronoCrossDaySec:s=>s,fmtTimeFr:s=>s+'s',restoreFicheState:()=>{ rec.fiche++; ctx.ficheLines=[1]; },_rearmResume(){},showPage(){},
      _l546AtAutoResume:()=>null,_shareActive:false,_sharePushHold:false,brouillonsCache:[],_shareDocId:null,applySharedCuts(){},logAudit:()=>({catch(){}})};
    ctx.fn=withCtx(MR,ctx); ctx.rec=rec; return ctx; };
  let c=mk('anon',null); await c.fn();
  ok(c.rec.chrono===0&&c.chronoRunning===false,'compte PAS ENCORE connu : le chrono seul n est PAS relance (il bloquerait la reprise de la fiche)');
  const draft={id:'d_autosave_u1_dev',savedAt:new Date().toISOString(),state:{lines:[{id:'a'}],chrono:{sec:100,wasRunning:false},fiche:{},plan:{}}};
  c._uid=()=>'u1'; c.autosaveId=()=>'d_autosave_u1_dev'; c.loadDrafts=()=>[draft]; await c.fn();
  ok(c.rec.fiche===1,'… puis, compte connu : la tentative suivante rend bien la FICHE (avant : bloquee par le chrono deja relance)');
  c=mk('u1',null); await c.fn();
  ok(c.rec.chrono===1&&/Chrono repris/.test(c.rec.toast.join(' ')),'compte connu et aucun brouillon : le chrono seul est relance comme avant');
  { const c2=mk('anon',null); let uid='anon'; c2._uid=()=>uid; c2.autosaveId=()=>'d_autosave_'+uid+'_dev';
    c2.db={collection:()=>({doc:()=>({get:async()=>{ uid='u1'; return {exists:false}; }})})};   // la connexion aboutit PENDANT la lecture
    await c2.fn(); ok(c2.rec.chrono===0&&c2.rec.fiche===0,'connexion PENDANT la lecture du brouillon (cherche sous « anon ») : rien n est conclu, ni chrono seul ni fiche');
    c2.db=null; c2.loadDrafts=()=>[{id:'d_autosave_u1_dev',savedAt:new Date().toISOString(),state:{lines:[{id:'a'}],chrono:{sec:100,wasRunning:false},fiche:{},plan:{}}}];
    await c2.fn(); ok(c2.rec.fiche===1,'… la tentative suivante (bon compte) rend la fiche'); }
  ok(/if\(live && live\.runStart && _dateKey\(live\.runStart\)===_dateKey\(Date\.now\(\)\) && _uid\(\)!=='anon'\)\{/.test(MR),'garde posee sur le seul repli « chrono seul »');
  console.log('\n'+(fail?('❌ '+fail+' echec(s) sur '+total):('🏆 L549 : '+total+'/'+total+' verts')));
  process.exit(fail?1:0);
})().catch(e=>{ console.error('❌ exception',e); process.exit(1); });
