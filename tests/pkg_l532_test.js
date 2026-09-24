// pkg_l532_test.js — [L532 · demande Celine 18/09/2026 → L537 · 24/09/2026] MIGRATION des anciennes notes d emballage :
// une commande ou un plan enregistre avec l ANCIEN texte d une regle affiche le NOUVEAU (correspondance EXACTE du prefixe,
// un texte edite a la main n est jamais denature). Depuis L537 la table de migration (_OLD_NOTES) n est plus dans le fichier
// public : elle vient de Firestore config/refs (oldNotes). Le mecanisme est teste ici sur des textes FICTIFS ; le contenu
// reel (5 entrees : VEKA ×3, BOUVET, Cougnaud) se controle en prive sur Firestore.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
const FIX=JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures','referentiel_test.json'),'utf8'));
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const MIG=eval('('+fnOf('_migrateOldNotes')+')');
console.log('── 1. [L537] la table de migration n est plus dans le fichier ──');
ok(/^var _OLD_NOTES=\[\];/m.test(src),'_OLD_NOTES vide dans le fichier public (elle vient de config/refs.oldNotes)');
ok(/_OLD_NOTES=d\.oldNotes\.slice\(\)/.test(fnOf('_l537ApplyRefs')),'_l537ApplyRefs la remplit depuis le document Firestore ou le cache local');
console.log('── 2. mecanisme de migration (patron L297), sur des textes fictifs ──');
global._OLD_NOTES=FIX.refs.oldNotes.concat([{o:'ANCIEN A',n:'NOUVEAU A'},{o:'ANCIEN A bis',n:'NOUVEAU A bis'}]);
const O=FIX.refs.oldNotes[0].o, N=FIX.refs.oldNotes[0].n;
ok(O!==N&&MIG(O)===N,'ancienne note EXACTE → remplacee par la nouvelle');
ok(MIG(O+'\nNote ajoutée à la main par Dominique')===N+'\nNote ajoutée à la main par Dominique','un complement tape a la main APRES l ancienne note est CONSERVE');
ok(MIG('Texte tapé à la main')==='Texte tapé à la main','une note tapee a la main n est jamais touchee');
ok(MIG(N)===N,'la nouvelle note est stable (pas de double migration)');
ok(MIG('ANCIEN A')==='NOUVEAU A'&&MIG('ANCIEN A bis')==='NOUVEAU A bis','premiere correspondance de prefixe qui gagne : « ANCIEN A bis » commence par « ANCIEN A » → remplace par NOUVEAU A + « bis »'.replace('NOUVEAU A + « bis »','NOUVEAU A bis (verifie tel quel)')||true);
ok(MIG(null)===''&&MIG(undefined)==='','absence de texte → chaine vide, jamais d exception');
global._OLD_NOTES=[]; ok(MIG(O)===O,'table vide (poste sans cache ni Firestore) → texte rendu tel quel, jamais denature');
console.log('── 3. la ligne automatique « Film KX detecte » disparait quand la note dit deja le cerclage ──');
global._OLD_NOTES=[];
ok(MIG('Cerclage : automatique (film KX)\n🔵 Film KX détecté → cerclage automatique quelle que soit la largeur.')==='Cerclage : automatique (film KX)','ligne « Film KX detecte » retiree');
console.log(fail?('💥 '+fail+' echec(s) sur '+total):('🏆 PKG L532 OK : '+total+' verifications'));
process.exit(fail?1:0);
