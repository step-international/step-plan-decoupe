// syntax_test.js — [L504 · audit 30 agents, pattern 3] ETAPE 0 de la batterie : le fichier PARSE.
// 96,8 % d'index.html est du JavaScript inline que node --check ne voit jamais et que les tests
// n'evaluent que par morceaux : une accolade ecrasee par une edition (arrive en L484) passait toute
// la batterie « verte » et cassait l'app entiere en prod. Ici : les 3 scripts inline sont compiles
// (new Function), il doit y en avoir EXACTEMENT 3, et toute erreur sort en code 1.
const fs=require('fs'), path=require('path'), vm=require('vm');
const FILE=path.join(__dirname,'..','index.html');
const src=fs.readFileSync(FILE,'utf8');
const blocks=[...src.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
let fail=0;
if(blocks.length!==3){ console.log('❌ scripts inline : '+blocks.length+' (3 attendus) — structure du fichier modifiee'); fail++; }
blocks.forEach((b,i)=>{
  try{ new vm.Script(b); console.log('✅ script inline #'+(i+1)+' parse ('+b.length+' o)'); }   // [L506] vm.Script = grammaire d un <script> (new Function acceptait un « return » orphelin ou un en-tete mange)
  catch(e){ fail++;
    const m=/(\d+):(\d+)/.exec(e.stack||''); 
    console.log('❌ script inline #'+(i+1)+' : '+e.message+(m?' (vers la ligne '+m[1]+' du bloc)':''));
  }
});
// [L506 · verification adverse] les <style> aussi : une suppression de regle CSS laissant une accolade orpheline passait
// (le JS compile, le gardien greppe). Equilibre des accolades par bloc, commentaires retires.
const _noScript=src.replace(/<script[\s\S]*?<\/script>/g,'');   // les gabarits d impression contiennent des <style> DANS des chaines JS : on ne regarde que le document
const styles=[..._noScript.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]);
if(!styles.length){ console.log('❌ aucun bloc <style> trouve'); fail++; }
styles.forEach((c,i)=>{ const s2=c.replace(/\/\*[\s\S]*?\*\//g,'').replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g,'""'); /* [L506] chaines CSS retirees avant de compter */ let d=0,bad=-1; for(let k=0;k<s2.length;k++){ if(s2[k]==='{') d++; else if(s2[k]==='}'){ d--; if(d<0){ bad=k; break; } } }
  if(d!==0||bad>=0){ fail++; console.log('❌ <style> #'+(i+1)+' : accolades desequilibrees ('+(bad>=0?('fermante orpheline vers l offset '+bad):('profondeur finale '+d))+')'); }
  else console.log('✅ <style> #'+(i+1)+' : accolades equilibrees ('+c.length+' o)'); });
// Une fonction async devenue sync (ou l inverse) par une ancre qui a coupe le mot-cle : liste FIGEE.
const ASYNC_MUST=['renderAudit','_lameEvent','lameEnvoyerAffutage','lameRetourStock','_l486Publish','_l487Valider','_l489DelCli','_l486DelRef','maintDelete','lameRetirerDuSuivi','logAudit','computeMonthAggregate','recalcTousMois','exportAuditComplet','clearCurrentDraft','recalcMois'];
ASYNC_MUST.forEach(n=>{
  const re=new RegExp('^\\s*async\\s+function\\s+'+n+'\\s*\\(','m');
  if(!re.test(src)){ fail++; console.log('❌ '+n+' n est plus declaree « async function » (une ancre a coupe le mot-cle ?)'); }
});
console.log(fail?('\n💥 SYNTAXE : '+fail+' probleme(s)'):('\n🏆 SYNTAXE OK : 3 scripts inline compilent, '+styles.length+' bloc(s) <style> equilibres, '+ASYNC_MUST.length+' fonctions async intactes'));
process.exit(fail?1:0);
