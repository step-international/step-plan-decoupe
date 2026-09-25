// expo_l536_test.js — [L536 · audit « que voit un inconnu ? » du 24/09/2026, question de Celine 23/09]
// Le fichier index.html est SERVI PUBLIQUEMENT (GitHub Pages) : tout ce qui y est ecrit est lisible sans compte.
// Deux jeux de donnees fournisseur (BK_XLS_20260526, BK_CSV_20260701) y etaient colles en clair comme raccourcis
// d import, et quelques commentaires de code parlaient nominativement de salaries. Ce lot retire tout cela du fichier.
// L import fournisseur reste possible : on colle sa liste dans la zone prevue, dont le format est montre en exemple.
// Les prenoms controles ne sont PAS ecrits en clair ici (ce fichier est public lui aussi) : ils sont encodes.
const fs=require('fs');
const _d=function(b){ return Buffer.from(b,'base64').toString('utf8'); };
const P1=_d('VGFpZWI='), P1T=_d('VGHDr2Vi'), P2=_d('TWFyb3VhbmU='), P3=_d('Y2hleiBKb3JkYW4='), P3b=_d('Sm9yZGFu');
const rx=function(x,f){ return new RegExp(x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),f||''); };
const src=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };

console.log('── 1. plus AUCUN export fournisseur colle dans le fichier ──');
ok(!/const BK_XLS_20260526\s*=/.test(src),'BK_XLS_20260526 (etat Excel du 26/05, 38 lignes) retire');
ok(!/const BK_CSV_20260701\s*=/.test(src),'BK_CSV_20260701 (liste du 01/07) retire');
ok(!/^41\d{6},[^\n]*,"\d{1,4},\d{2}",/m.test(src),'aucune ligne « matno,...,"prix,xx", » au format de l export B+K ne subsiste (valeur decimale entre guillemets, ex. "12,34")');
ok(!/^41\d{6},TacFlex/m.test(src),'aucune ligne CSV « 41xxxxxx,TacFlex … » (article + designation fournisseur) ne subsiste');
ok(!/function bkFillSample\(/.test(src)&&!/onclick="bkFillSample\(\)"/.test(src),'bouton « Liste 01/07 » et sa fonction retires (il rechargeait l export reel)');
ok(!/function bkRemplacerParXls\(/.test(src)&&!/onclick="bkRemplacerParXls\(\)"/.test(src),'bouton orange « remplacer par l etat Excel du 26/05 » et sa fonction retires (annulait l import en base pour recharger un etat de MAI)');

console.log('── 2. l import fournisseur MANUEL fonctionne toujours ──');
ok(/function _bkParseTable\(/.test(src),'_bkParseTable : le parseur de la liste collee est intact');
ok(/function bkAnalyseImport\(/.test(src),'bkAnalyseImport : l analyse de la liste collee est intacte');
ok(/id="bkImportText"/.test(src),'la zone ou l on colle la liste existe toujours');
ok(/id="bkImportText"[^>]*placeholder="matno,typ,mm,ml,ar,batch,qty_m2,price,req,onstock,storage,calloff_m2,pal,delnote,deldate/.test(src),'le FORMAT attendu est montre en exemple gris dans la zone (en-tete des colonnes), sans aucune donnee reelle');
ok(!/id="bkImportText"[^>]*placeholder="[^"]*41\d{6}/.test(src),'l exemple de format de la zone d import ne contient aucun vrai numero d article (le champ « Reference » de l ecran stock garde son propre exemple : une reference deja presente dans le catalogue, lot separe)');
ok(!rx(_d('QmlzY2hvZiArIEtsZWlu')).test(src),'[L537] le nom du fournisseur n est plus dans le fichier (libelle lu dans config/refs, repli neutre « Fournisseur »)');

console.log('── 3. plus aucun commentaire nominatif sur un salarie ──');
ok(!rx(P1).test(src),'prenom 1 (forme sans accent, celle des commentaires) : absent');
ok(!rx(P1T).test(src),'[L540] prenom 1 (forme accentuee) : absent du fichier (la table des utilisateurs vit dans config/refs)');
ok(/\[L519 · enquete Esteban 15\/09\/2026 « pourquoi je ne vois pas le temps d un operateur \? »\]/.test(src),'le commentaire L519 est conserve, anonymise (l enquete reste documentee)');
ok(!rx(P3).test(src),'« chez <prenom 2> » (reproduction d un bug L490) : anonymise');
ok((src.match(new RegExp('\\b'+P3b+'\\b','g'))||[]).length===(src.match(new RegExp('Gauss-'+P3b,'g'))||[]).length,'[L540] prenom 2 n apparait plus que dans le nom d un algorithme (Gauss-…)');
ok(!rx(P2).test(src),'l ancien prenom d usage d un salarie (L414) n est plus dans le fichier public');
ok(/\[L414 · demande Esteban\] affichage modifie \(uid, ini et historique INTACTS\)/.test(src),'le marqueur L414 est conserve, sans le prenom ni la nature du changement');
ok(/Débloque les commandes du type « bobine mère changée en cours de découpe »/.test(src),'commentaire de applyFichePlanChange : le prenom remplace par la description du cas');

console.log('── 4. rien d autre n a bouge ──');
ok(/var REPORT_RECIPIENTS=\[\];/.test(src)&&!/@gmail\.com|@step-international\.com/.test(src),'[L537] plus aucune adresse e-mail dans le fichier : destinataires lus dans config/refs (la regle Firestore mail les borne cote serveur)');
ok(/var CLIENT_DATA = \{\n\};/.test(src)&&/var PKG_CLIENTS=\{\n\};/.test(src),'[L537] le catalogue clients et les regles d emballage ne sont PLUS embarques (graines vides ; Firestore config/clients + cache local)');

console.log((fail?'\n💥 '+fail+' echec(s)':'\n🏆 expo_l536 OK')+' — '+total+' verifications');
process.exit(fail?1:0);
