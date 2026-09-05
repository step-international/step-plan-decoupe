// syntax_test.js — [L504 · audit 30 agents, pattern 3] ETAPE 0 de la batterie : le fichier PARSE.
// 96,8 % d'index.html est du JavaScript inline que node --check ne voit jamais et que les tests
// n'evaluent que par morceaux : une accolade ecrasee par une edition (arrive en L484) passait toute
// la batterie « verte » et cassait l'app entiere en prod. Ici : les 3 scripts inline sont compiles
// (new Function), il doit y en avoir EXACTEMENT 3, et toute erreur sort en code 1.
const fs=require('fs'), path=require('path');
const FILE=path.join(__dirname,'..','index.html');
const src=fs.readFileSync(FILE,'utf8');
const blocks=[...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let fail=0;
if(blocks.length!==3){ console.log('❌ scripts inline : '+blocks.length+' (3 attendus) — structure du fichier modifiee'); fail++; }
blocks.forEach((b,i)=>{
  try{ new Function(b); console.log('✅ script inline #'+(i+1)+' parse ('+b.length+' o)'); }
  catch(e){ fail++;
    const m=/(\d+):(\d+)/.exec(e.stack||''); 
    console.log('❌ script inline #'+(i+1)+' : '+e.message+(m?' (vers la ligne '+m[1]+' du bloc)':''));
  }
});
// Une fonction async devenue sync (ou l inverse) par une ancre qui a coupe le mot-cle : liste FIGEE.
const ASYNC_MUST=['renderAudit','_lameEvent','lameEnvoyerAffutage','lameRetourStock','_l486Publish','_l487Valider','_l489DelCli','_l486DelRef','maintDelete','lameRetirerDuSuivi','logAudit','computeMonthAggregate','recalcTousMois','exportAuditComplet','clearCurrentDraft','recalcMois'];
ASYNC_MUST.forEach(n=>{
  const re=new RegExp('^\\s*async\\s+function\\s+'+n+'\\s*\\(','m');
  if(!re.test(src)){ fail++; console.log('❌ '+n+' n est plus declaree « async function » (une ancre a coupe le mot-cle ?)'); }
});
console.log(fail?('\n💥 SYNTAXE : '+fail+' probleme(s)'):('\n🏆 SYNTAXE OK : 3 scripts inline compilent, '+ASYNC_MUST.length+' fonctions async intactes'));
process.exit(fail?1:0);
