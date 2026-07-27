// draft_concordance_test.js — [L273 · audit #6] GARDE anti-doublon au PARCAGE 💾 : le brouillon REPRIS
// (_resumedDraftId) n'est consommé que si la commande parquée est LE MÊME travail (règle de concordance
// unifiée avec l'ENVOI, L245). Sinon une commande retapée par-dessus une reprise consommait en silence le
// plan repris (brouillons « consumed » dans aucune corbeille → double découpe possible de l'autre commande).
const fs=require('fs');
const src=fs.readFileSync('/Users/EstebanR/step-plan-decoupe/index.html','utf8');
function fnOf(n){let i=src.indexOf('function '+n+'(');if(i<0)throw new Error('introuvable '+n);let k=src.indexOf('{',i),d=0;for(;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)break;}}return src.slice(i,k+1);}
global.nrm=s=>String(s||'').trim().toLowerCase();
global._ini=()=>'ER';
global._isSharedDoc=d=>!!(d&&(d.kind==='shared'||/^d_shared_/.test(String(d.id||''))));
const _supersededManualDrafts=eval('('+fnOf('_supersededManualDrafts')+')');
let fail=0; const ok=(c,m)=>{ console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const draft=(id,client,num,ref)=>({id,owner:'ER',state:{fiche:{client,numCmd:num,ref},plan:{client,numCmd:num,ref}}});

// La commande A (n° 111) a été REPRISE ; on parque ensuite une commande différente B (n° 222).
global.brouillonsCache=[draft('dA','Prima','111','KX1045')];
global._resumedDraftId='dA';
let newB=draft('dNEW','Deceuninck','222','KX9999');
ok(_supersededManualDrafts('dNEW','Deceuninck / 222',newB).length===0,
   'reprise A (n°111) + parcage B (n°222) → A N\'EST PAS consommé (plans distincts préservés) [bug #6 corrigé]');

// Même commande reprise puis reparquée (n° identique) → consommée (remplacement légitime).
let newA=draft('dNEW2','Prima','111','KX1045');
ok(_supersededManualDrafts('dNEW2','Prima / 111',newA).some(d=>d.id==='dA'),
   'reprise A (n°111) + parcage A (n°111) → A consommé (remplacement du même travail)');

// Deux commandes SANS n° : concordance sur la réf (n° vides des deux côtés).
global.brouillonsCache=[draft('dC','Prima','','KX1045')];
global._resumedDraftId='dC';
ok(_supersededManualDrafts('dNEW3','Prima / sans n°',draft('dNEW3','Prima','','KX1045')).some(d=>d.id==='dC'),
   'sans n° des deux côtés + même réf → consommé');
ok(_supersededManualDrafts('dNEW4','Prima / sans n°',draft('dNEW4','Prima','','KX2222')).length===0,
   'sans n° des deux côtés + réf DIFFÉRENTE → PAS consommé (deux commandes distinctes)');

// Client différent → jamais le même travail.
global.brouillonsCache=[draft('dD','Prima','111','KX1045')];
global._resumedDraftId='dD';
ok(_supersededManualDrafts('dNEW5','Autre / 111',draft('dNEW5','AutreClient','111','KX1045')).length===0,
   'client différent (même n°) → PAS consommé');

// Brouillon d'un AUTRE poste jamais consommé par la clé (hors reprise explicite).
global.brouillonsCache=[Object.assign(draft('dE','Prima','111','KX1045'),{owner:'JF'})];
global._resumedDraftId=null;
ok(_supersededManualDrafts('dNEW6','Prima / 111',draft('dNEW6','Prima','111','KX1045')).length===0,
   'brouillon d\'un autre poste (owner JF) non repris → jamais consommé');

// [revue sceptique #1] DIVERGENCE fiche/plan au parcage (💾 autorisé sur des bobines stale).
const draftFP=(id,fiche,plan)=>({id,owner:'ER',state:{fiche,plan}});
const idA={client:'Prima',numCmd:'111',ref:'KX1045'};
const idB={client:'Prima',numCmd:'222',ref:'KX9999'};
// S2 : reprise A, puis on retape B dans l'ONGLET PLAN seulement → fiche reste périmée = A(111), plan = B(222).
global.brouillonsCache=[draftFP('dA',idA,idA)];
global._resumedDraftId='dA';
ok(_supersededManualDrafts('dNEWs2','Prima / 111',draftFP('dNEWs2',{...idA},{...idB})).length===0,
   '[S2] fiche périmée A(111) + plan retapé B(222) → A N\'EST PAS consommé (plus de perte silencieuse) [trou résiduel fermé]');
// S3 : symétrique — on retape B dans la FICHE, plan reste A.
ok(_supersededManualDrafts('dNEWs3','Prima / 222',draftFP('dNEWs3',{...idB},{...idA})).length===0,
   '[S3] fiche B(222) + plan A(111) → A N\'EST PAS consommé (désaccord = jamais consommer)');
// re-parcage LÉGITIME du même travail (fiche = plan = A) → consommé.
ok(_supersededManualDrafts('dNEWok','Prima / 111',draftFP('dNEWok',{...idA},{...idA})).some(d=>d.id==='dA'),
   '[contrôle] fiche = plan = A → A consommé (remplacement légitime, pas de faux négatif)');
// workflow plan-only : fiche VIDE, plan = A → consommé (concordance sur le plan).
ok(_supersededManualDrafts('dNEWpo','Prima / 111',draftFP('dNEWpo',{},{...idA})).some(d=>d.id==='dA'),
   '[contrôle] fiche vide + plan A → A consommé (concordance plan, fiche non renseignée)');

console.log(fail?('\n💥 '+fail+' échec(s)'):'\n🏆 DRAFT CONCORDANCE VALIDÉ : parcage anti-doublon (reprise consommée seulement si même commande — parité avec l\'envoi L245)');
process.exit(fail?1:0);
