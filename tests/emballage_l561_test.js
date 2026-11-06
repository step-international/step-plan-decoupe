// emballage_l561_test.js — [L561 · demande Celine 05/11/2026] GARDE de « les regles d emballage d un client (palette, type, etiquetage,
// cerclage, notes) se modifient au bureau, dans Donnees > Clients (modifier, creer, regle propre, supprimer), et s enregistrent pour tous
// les postes par _l486Publish — jamais par une autre ecriture ; un echec remet la memoire dans l etat d avant ; une regle neuve qui
// rattraperait d AUTRES clients est annoncee et confirmee avant ». Fonctions pures executees, editeur / enregistrement / suppression
// executes sur un DOM factice, cablage lu dans le source. Durci apres la contre-lecture du lot (46 mutations jouees). Ne couvre pas le
// rendu navigateur (scene « donnees-emballage » de tests/shot.mjs).
const fs=require('fs'), path=require('path');
const ROOT=path.join(__dirname,'..');
const src=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const shot=fs.readFileSync(path.join(__dirname,'shot.mjs'),'utf8');
const bat=fs.readFileSync(path.join(__dirname,'battery.sh'),'utf8');
let ci=''; try{ ci=fs.readFileSync(path.join(ROOT,'.github','workflows','static.yml'),'utf8'); }catch(e){}
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(!d)return src.slice(i,j+1);}}throw new Error('non fermee '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c===true?'✅ ':'❌ ')+m); if(c!==true)fail++; };
const T=f=>{ try{ return f(); }catch(e){ console.log('   (exception : '+(e&&e.message||e)+')'); return false; } };
const TA=async f=>{ try{ return await f(); }catch(e){ console.log('   (exception : '+(e&&e.message||e)+')'); return false; } };
const F=n=>{ try{ return fnOf(n); }catch(e){ return ''; } };
function load(n){ try{ global[n]=eval('('+fnOf(n)+')'); return true; }catch(e){ global[n]=function(){ throw new Error('fonction absente : '+n); }; return false; } }
global.window=global; global._L561_CHAMPS=['palette','type','etiquetage','cerclage','notes'];
{ const m=/^const nrm=(.*?);[ \t]*(?:\/\/.*)?$/m.exec(src); global.nrm=m?eval('('+m[1]+')'):(v=>String(v==null?'':v).trim().toLowerCase()); }   /* la VRAIE normalisation des noms (pas une version plus tolerante) */
global.esc=v=>String(v==null?'':v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
global._l486Esc=v=>esc(String(v==null?'':v));
const LOT=['_l561PkgNorm','_l561PkgErreur','_l561PkgEgal','_l561PkgCle','_l561PkgPartage','_l561PkgEffet','_l561PkgListe','_l561PkgBloc','_l561PkgOrphelines','_l561PkgLu','_l561PkgEditer','_l561PkgEnregistrer','_l561PkgSupprimer'];
LOT.concat(['_l410PkgResolve']).forEach(load);
let toasts, compte, peutEditer, pubRep, pubHook, confRep, byId, editeurOuvert;
const DEF={palette:'80×120',type:'Caisse',etiquetage:'Standard',cerclage:'Standard (≤39mm + tous KX)',notes:'Règles par défaut.'};
const PUB=async(btn,sil)=>{ compte.pub.push({sil:sil,photo:JSON.parse(JSON.stringify(PKG_CLIENTS))}); if(pubHook) pubHook(); return pubRep; };
function monde(){ toasts=[]; compte={pub:[],audit:[],rendu:0,warn:0,conf:[]}; peutEditer=true; pubRep=true; pubHook=null; confRep=true; editeurOuvert=null;
  global.PKG_DEFAULT=DEF; global._l486EnVol=0; global._l486Publish=PUB;
  global.PKG_CLIENTS={ 'LEGRAND':{palette:'80×120',type:'Carton',etiquetage:'Standard',cerclage:'Standard (≤39mm + tous KX)',notes:'Mandrin selon la laize.  ',autre:'gardé'}, 'VEKA':{palette:'80×120',type:'Palette nue + réhausses',etiquetage:'Standard',cerclage:'Par piles cerclées (ratio fourni)',notes:'NE PAS filmer.'}, 'ANCIEN NOM SARL':{palette:'100×120',type:'Vrac',etiquetage:'',cerclage:'Aucun',notes:''}, 'R4':{palette:'80×120',type:'',etiquetage:'',cerclage:'',notes:''}, 'R5':{palette:'80×120',type:'',etiquetage:'',cerclage:'',notes:''}, 'R6':{palette:'80×120',type:'',etiquetage:'',cerclage:'',notes:''} };
  global.CLIENT_DATA={ 'LEGRAND FRANCE':[], 'LEGRAND ITALIE':[], 'VEKA':[], 'PRIMA':[], 'DUPONT':[], 'DUPONT BELGIQUE':[] };
  const opts=v=>({options:v.map(x=>({value:x}))});
  byId={ planPalette:opts(['','80×120','100×120','1/2 palette']), planType:opts(['','Caisse','Pyramide','Carton','Palette nue + réhausses','Vrac']), planEtiquetage:opts(['','Standard','Spécifique']), planCerclage:opts(['','Standard (≤39mm + tous KX)','Aucun','Élargi (≤40mm)','Par piles cerclées (ratio fourni)']) }; }
global.document={ getElementById:id=>byId[id]||null, querySelector:sel=>(sel==='.l561-edit'?editeurOuvert:null), createElement:()=>{ const d={className:'',dataset:{},style:{},innerHTML:'',_f:{},remove(){ if(editeurOuvert===d) editeurOuvert=null; d._retire=true; },querySelector(c){ return d._f[c]||(d._f[c]={value:'',focus(){}}); }}; return d; } };
global.showToast=(m,k)=>{ toasts.push(String(k||'')+'|'+String(m)); };
global._l486CanEdit=()=>peutEditer;
global.confirmDlg=async(m,o)=>{ compte.conf.push(String(m)); return confRep; };
global.logAudit=function(){ compte.audit.push(Array.prototype.slice.call(arguments)); return Promise.resolve(); };
global.renderClients=()=>{ compte.rendu++; }; global._l505Warn=()=>{ compte.warn++; };
const der=()=>toasts[toasts.length-1]||'';
const NOMS=['LEGRAND FRANCE','LEGRAND ITALIE','VEKA','PRIMA'];
const hoteDe=()=>({after(d){ editeurOuvert=d; }});
const ouvrir=(nom,cle)=>{ const h=hoteDe(); _l561PkgEditer(nom,{closest:c=>(c==='.l561-pkg'?h:null)},cle); return editeurOuvert; };
/* editeur factice pret a enregistrer : memes classes que le vrai */
function ed(cle,val,avant){ const f={}; const d={dataset:{cle:cle,avant:JSON.stringify(avant===undefined?(PKG_CLIENTS[cle]?_l561PkgNorm(PKG_CLIENTS[cle]):null):avant)},querySelector:c=>f[c]||null,remove(){ d._retire=true; }}; ['palette','type','etiquetage','cerclage','notes'].forEach(k=>{ f['.l561-'+k]={value:val[k]==null?'':val[k]}; }); return {closest:c=>(c==='.l561-edit'?d:null),disabled:false,_d:d}; }

(async()=>{
console.log('── A. fonctions PURES ──');
monde();
ok(T(()=>{ const r=_l561PkgNorm({palette:' 80×120 ',type:null,cerclage:'Aucun',notes:'a  \r\nb\r\n\r\n\r\n\r\nc  \n'}); return r.palette==='80×120'&&r.type===''&&r.etiquetage===''&&r.cerclage==='Aucun'&&r.notes==='a\nb\n\nc'; }),'_l561PkgNorm : 5 champs en texte, espaces retires, fins de ligne unifiees, lignes vides en trop reduites');
ok(T(()=>{ const r=_l561PkgNorm(null); return r.palette===''&&r.notes===''&&Object.keys(r).join()==='palette,type,etiquetage,cerclage,notes'; }),'_l561PkgNorm(null) : regle vide, jamais d exception');
ok(T(()=>_l561PkgErreur(_l561PkgNorm({}))!==''&&_l561PkgErreur(_l561PkgNorm({cerclage:'Aucun'}))===''&&_l561PkgErreur(_l561PkgNorm({notes:'x'}))===''),'regle entierement vide refusee ; un seul champ rempli suffit');
ok(T(()=>/2000/.test(_l561PkgErreur(_l561PkgNorm({notes:'x'.repeat(2001)})))&&_l561PkgErreur(_l561PkgNorm({notes:'x'.repeat(2000)}))===''),'notes : 2000 caracteres au plus (refus explique)');
ok(T(()=>_l561PkgErreur(_l561PkgNorm({cerclage:'y'.repeat(81)}))!==''&&_l561PkgErreur(null)!==''),'choix demesure ou regle illisible : refuse');
ok(T(()=>_l561PkgEgal(_l561PkgNorm(DEF),_l561PkgNorm(Object.assign({},DEF,{notes:'Règles par défaut.  \n'})))===true&&_l561PkgEgal(_l561PkgNorm(DEF),_l561PkgNorm(Object.assign({},DEF,{cerclage:'Aucun'})))===false&&_l561PkgEgal(null,_l561PkgNorm(DEF))===false),'_l561PkgEgal : compare les 5 champs normalises');
ok(T(()=>_l561PkgCle('VEKA')==='VEKA'&&_l561PkgCle('LEGRAND FRANCE')==='LEGRAND'&&_l561PkgCle('LEGRAND ITALIE')==='LEGRAND'&&_l561PkgCle('PRIMA')===null),'_l561PkgCle : nom exact, sinon la regle que le Plan trouverait (LEGRAND FRANCE → regle « LEGRAND ») ; aucune regle → null');
ok(T(()=>PKG_CLIENTS[_l561PkgCle('LEGRAND FRANCE')]===_l410PkgResolve('LEGRAND FRANCE')),'la cle rendue designe EXACTEMENT l objet que le Plan applique (meme resolution, jamais une deuxieme regle)');
ok(T(()=>_l561PkgPartage('LEGRAND',NOMS).join()==='LEGRAND FRANCE,LEGRAND ITALIE'&&_l561PkgPartage('VEKA',NOMS).join()==='VEKA'),'_l561PkgPartage : les clients de la liste auxquels la regle s applique');
ok(T(()=>{ const h=_l561PkgListe('planCerclage','Aucun'); return (h.match(/<option/g)||[]).length===5&&/<option value="Aucun" selected>Aucun<\/option>/.test(h)&&/<option value="">—<\/option>/.test(h); }),'liste de choix = celle de la carte Emballage du Plan (source unique), valeur courante selectionnee');
ok(T(()=>{ const h=_l561PkgListe('planCerclage','Ancien <b>choix</b>'); return (h.match(/<option/g)||[]).length===6&&/Ancien &lt;b&gt;choix&lt;\/b&gt;" selected/.test(h)&&h.indexOf('<b>')<0; }),'une valeur ancienne hors liste est CONSERVEE (et echappee), pas remplacee en silence');
/* effet d une creation sur les AUTRES clients */
ok(T(()=>{ const t=PKG_CLIENTS; const r=_l561PkgEffet('DUPONT BELGIQUE',Object.keys(CLIENT_DATA)); return PKG_CLIENTS===t&&JSON.stringify(r)==='[{"nom":"DUPONT","avant":null}]'&&!Object.prototype.hasOwnProperty.call(t,'DUPONT BELGIQUE'); }),'creer « DUPONT BELGIQUE » rattraperait AUSSI le client « DUPONT » (son nom commence pareil) : l effet est calcule a blanc, la vraie table est intacte');
ok(T(()=>{ PKG_CLIENTS['ABC SUD']={palette:'80×120',type:'',etiquetage:'',cerclage:'',notes:''}; const r=_l561PkgEffet('ABC NORD EST',['ABC','VEKA']); delete PKG_CLIENTS['ABC SUD']; return JSON.stringify(r)==='[{"nom":"ABC","avant":"ABC SUD"}]'; }),'une regle neuve au nom plus long DETOURNE un client d une autre regle : dit avec l ancienne regle (« ABC » quitterait « ABC SUD »)');
ok(T(()=>JSON.stringify(_l561PkgEffet('LEGRAND ITALIE',Object.keys(CLIENT_DATA)))==='[]'&&JSON.stringify(_l561PkgEffet('VEKA',Object.keys(CLIENT_DATA)))==='[]'&&JSON.stringify(_l561PkgEffet('PRIMA',Object.keys(CLIENT_DATA)))==='[]'),'regle propre a un client, regle existante, client isole : aucun autre client touche');
ok(T(()=>{ const t=PKG_CLIENTS; const sv=global._l410PkgResolve; let n=0; global._l410PkgResolve=function(x){ n++; if(n>6) throw new Error('boum'); return sv(x); }; const r=_l561PkgEffet('DUPONT BELGIQUE',Object.keys(CLIENT_DATA)); global._l410PkgResolve=sv; return PKG_CLIENTS===t&&(r===null||Array.isArray(r)); }),'calcul a blanc en erreur : la vraie table est remise dans tous les cas');

console.log('── B. affichage dans la liste des clients ──');
monde();
ok(T(()=>{ const h=_l561PkgBloc('VEKA',NOMS); return /✏️ Modifier l’emballage/.test(h)&&/80×120 · Palette nue \+ réhausses · étiquetage Standard · cerclage Par piles cerclées/.test(h)&&/NE PAS filmer\./.test(h)&&/data-cli="VEKA" data-cle=""/.test(h)&&h.indexOf('l561-propre')<0; }),'client avec SA regle : resume lisible + notes + bouton « Modifier l emballage » (la cle est recalculee a l appui, pas figee au rendu)');
ok(T(()=>{ const h=_l561PkgBloc('LEGRAND FRANCE',NOMS); return /Règle « LEGRAND »/.test(h)&&/s’applique aussi à : LEGRAND ITALIE\./.test(h)&&/class="btn btn-sm l561-propre" data-cli="LEGRAND FRANCE" data-cle="LEGRAND FRANCE"/.test(h)&&/➕ Règle propre à ce client/.test(h); }),'regle PARTAGEE : le bloc dit quelle regle s applique, a quels autres clients, et propose « Regle propre a ce client »');
ok(T(()=>{ const h=_l561PkgBloc('PRIMA',NOMS); return /➕ Créer une règle d’emballage/.test(h)&&/règles par défaut s’appliquent/.test(h)&&h.indexOf('l561-propre')<0; }),'client sans regle : « regles par defaut » + bouton « Creer une regle »');
ok(T(()=>{ PKG_CLIENTS['VEKA'].notes='<img src=x onerror=alert(1)> & "x"'; const h=_l561PkgBloc('VEKA',NOMS); return h.indexOf('<img')<0&&/&lt;img src=x onerror=alert\(1\)&gt; &amp; &quot;x&quot;/.test(h); }),'les notes sont ECHAPPEES a l affichage (aucune balise injectee)');
monde();
ok(T(()=>{ const h=_l561PkgOrphelines(NOMS); return /4 règle\(s\) d’emballage sans client dans la liste/.test(h)&&/Emballage — ANCIEN NOM SARL/.test(h)&&/data-cli="" data-cle="ANCIEN NOM SARL"/.test(h)&&h.indexOf('data-cle="VEKA"')<0; }),'une regle dont le nom ne rattrape aucun client reste VISIBLE, modifiable et supprimable (rien n est cache)');
ok(T(()=>_l561PkgOrphelines(NOMS.concat(['ANCIEN NOM SARL','R4','R5','R6']))===''),'aucune regle orpheline : pas de bloc');
console.log('── B2. echappement HTML : noms, cles, valeurs et notes HOSTILES ──');
monde();
{ const E=_l486Esc, HN='A"><img src=x onerror=1>', HK='L\'USINE & "FILS" <b>', HP='ACME <b>"x"', N1=HP+' FRANCE', N2=HP+' <img src=x onerror=1>', NOTE='</textarea><img src=x onerror=1>';
  const brut=h=>h.indexOf('<img')>=0||h.indexOf('<b>')>=0||h.indexOf('<u>')>=0;   /* une de ces balises a l etat brut = injection */
  PKG_CLIENTS[HK]={palette:'"><u>',type:'<img src=x onerror=1>',etiquetage:'<b>',cerclage:'"<b>"',notes:NOTE};
  PKG_CLIENTS[HP]={palette:'80×120',type:'Caisse',etiquetage:'',cerclage:'',notes:''};
  ok(T(()=>{ const h=_l561PkgBloc(HN,[HN]); return !!h&&!brut(h)&&h.indexOf('data-cli="'+E(HN)+'" data-cle=""')>=0; }),'client sans regle au nom hostile : data-cli echappe');
  ok(T(()=>{ const h=_l561PkgBloc(HK,[HK]); return !!h&&!brut(h)&&h.indexOf('data-cli="'+E(HK)+'"')>=0&&h.indexOf('>'+E('"><u>')+' · '+E('<img src=x onerror=1>')+' · '+E('étiquetage <b>')+' · '+E('cerclage "<b>"')+'</div>')>=0&&h.indexOf('>'+E(NOTE)+'</div>')>=0; }),'regle a la cle et aux valeurs hostiles : resume (palette · type · etiquetage · cerclage) et notes echappes');
  ok(T(()=>{ const h=_l561PkgOrphelines(NOMS); return !brut(h)&&h.indexOf('Emballage — '+E(HK)+'</b>')>=0&&h.indexOf('data-cli="" data-cle="'+E(HK)+'"')>=0; }),'regles sans client aux cles hostiles : titre du bloc et data-cle echappes');
  ok(T(()=>{ const h=_l561PkgBloc(N1,[N1,N2]); return _l561PkgCle(N1)===HP&&_l561PkgCle(N2)===HP&&!!h&&!brut(h)&&h.indexOf('Règle « '+E(HP)+' » : elle s’applique')>=0&&h.indexOf('s’applique aussi à : '+E(N2)+'.</div>')>=0&&h.indexOf('l561-propre" data-cli="'+E(N1)+'" data-cle="'+E(N1)+'"')>=0; }),'regle partagee a la cle hostile, clients aux noms hostiles : « Regle « cle » », « s applique aussi a » et le bouton « regle propre » echappes');
  ok(T(()=>{ const d=ouvrir('',HK), h=d?d.innerHTML:''; return !!d&&d.dataset.cle===HK&&!brut(h)&&h.indexOf('Règle d’emballage « '+E(HK)+' »')>=0&&h.indexOf('line-height:1.4">'+E(NOTE)+'</textarea>')>=0&&h.indexOf('<option value="'+E('<img src=x onerror=1>')+'" selected>'+E('<img src=x onerror=1>')+'</option>')>=0; }),'editeur d une regle hostile : titre, textarea (un </textarea> dans les notes ne ferme rien) et choix hors liste echappes ; la cle est relue a l identique');
  editeurOuvert=null;
  ok(T(()=>{ const d=ouvrir(HN,''), h=d?d.innerHTML:''; return !!d&&d.dataset.cle===HN&&d.dataset.avant==='null'&&!brut(h)&&h.indexOf('Nouvelle règle d’emballage pour « '+E(HN)+' »')>=0; }),'editeur d une regle NEUVE pour un client au nom hostile : titre echappe, regle creee au nom EXACT');
}

console.log('── C. editeur ──');
monde();
ok(T(()=>{ const d=ouvrir('LEGRAND FRANCE',''); return !!d&&d.className==='l561-edit'&&d.dataset.cle==='LEGRAND'&&d.dataset.cli==='LEGRAND FRANCE'&&JSON.parse(d.dataset.avant).type==='Carton'&&/Règle d’emballage « LEGRAND »/.test(d.innerHTML)&&/<option value="Carton" selected>/.test(d.innerHTML)&&/Mandrin selon la laize\.<\/textarea>/.test(d.innerHTML)&&/_l561PkgEnregistrer\(this\)/.test(d.innerHTML)&&/l561-suppr/.test(d.innerHTML)&&d.innerHTML.indexOf('l561-effet')<0&&!!d.dataset.init; }),'« Modifier » ouvre l editeur de la regle QUI S APPLIQUE (cle recalculee a l appui), pre-rempli, avec son empreinte d ouverture et le bouton Supprimer');
ok(T(()=>{ const premier=editeurOuvert; const d=ouvrir('PRIMA',''); return premier._retire===true&&d.dataset.cle==='PRIMA'&&d.dataset.avant==='null'&&/Nouvelle règle d’emballage pour « PRIMA » \(pré-remplie avec les règles par défaut\)/.test(d.innerHTML)&&/<option value="Caisse" selected>/.test(d.innerHTML)&&/Règles par défaut\.<\/textarea>/.test(d.innerHTML)&&d.innerHTML.indexOf('l561-suppr')<0; }),'client sans regle : nouvelle regle au NOM EXACT du client, pre-remplie avec les regles par defaut, sans bouton Supprimer ; un editeur NON modifie est remplace');
ok(T(()=>{ editeurOuvert.querySelector('.l561-notes').value='saisie en cours'; const avant=editeurOuvert; const n=toasts.length; ouvrir('VEKA',''); return editeurOuvert===avant&&avant._retire!==true&&toasts.length===n+1&&/Une saisie d’emballage est en cours pour « PRIMA »/.test(der()); }),'un editeur dont la saisie a ETE MODIFIEE n est jamais jete par l ouverture d un autre : refus explique');
monde();
ok(T(()=>{ const d=ouvrir('LEGRAND ITALIE','LEGRAND ITALIE'); return !!d&&d.dataset.cle==='LEGRAND ITALIE'&&d.dataset.avant==='null'&&/pré-remplie avec la règle « LEGRAND », qui reste inchangée pour les autres clients/.test(d.innerHTML)&&/<option value="Carton" selected>/.test(d.innerHTML)&&/Mandrin selon la laize\.<\/textarea>/.test(d.innerHTML)&&d.innerHTML.indexOf('l561-effet')<0; }),'« Regle propre a ce client » : regle neuve au nom exact, pre-remplie avec la regle partagee qui s appliquait ; aucun autre client touche');
monde();
ok(T(()=>{ const d=ouvrir('DUPONT BELGIQUE',''); return !!d&&d.dataset.cle==='DUPONT BELGIQUE'&&/class="l561-effet"/.test(d.innerHTML)&&/Cette règle s’appliquera AUSSI à : DUPONT — leur nom commence pareil/.test(d.innerHTML); }),'regle neuve qui rattraperait un AUTRE client : annonce en orange DANS l editeur, avant toute saisie');
monde();
ok(T(()=>{ const d=ouvrir('','ANCIEN NOM SARL'); return !!d&&d.dataset.cle==='ANCIEN NOM SARL'&&JSON.parse(d.dataset.avant).type==='Vrac'&&/Règle d’emballage « ANCIEN NOM SARL »/.test(d.innerHTML); }),'regle SANS client (nom vide + cle directe) : l editeur s ouvre sur CETTE regle');
monde(); peutEditer=false;
ok(T(()=>{ ouvrir('VEKA',''); return editeurOuvert===null&&/Réservé/.test(der()); }),'editeur refuse hors administration / pilotage');

console.log('── D. enregistrement (par _l486Publish, jamais autrement) ──');
monde();
ok(await TA(async()=>{ const b=ed('LEGRAND',{palette:'80×120',type:'Carton',etiquetage:'Standard',cerclage:'Standard (≤39mm + tous KX)',notes:'Mandrin selon la laize.\nDQ1042 : cerclage sur la laize 49'}); const r=await _l561PkgEnregistrer(b); const p=compte.pub[0]; return r===true&&compte.pub.length===1&&p.sil===true&&p.photo['LEGRAND'].notes==='Mandrin selon la laize.\nDQ1042 : cerclage sur la laize 49'&&PKG_CLIENTS['LEGRAND'].notes===p.photo['LEGRAND'].notes&&PKG_CLIENTS['LEGRAND'].autre==='gardé'&&compte.rendu===1&&b._d._retire===true&&/^ok\|/.test(der())&&/enregistré pour tous les postes/.test(der())&&compte.conf.length===0; }),'cas reel : la consigne « DQ1042 : cerclage sur la laize 49 » ajoutee aux notes de la regle LEGRAND est PUBLIEE (publication silencieuse), l editeur se ferme, la liste est re-rendue, les autres champs de la regle sont conserves');
ok(T(()=>compte.audit.length===1&&compte.audit[0][0]==='edit'&&compte.audit[0][1]==='config'&&/Règle d’emballage « LEGRAND » modifiée : notes — règle remplacée : \{"palette":"80×120","type":"Carton","etiquetage":"Standard","cerclage":"Standard \(≤39mm \+ tous KX\)","notes":"Mandrin selon la laize\."\}$/.test(compte.audit[0][3])),'une ligne au journal : quelle regle, quels champs, et l ANCIENNE regle en entier (une consigne ecrasee par erreur se retrouve)');
monde();
ok(await TA(async()=>{ const b=ed('LEGRAND',{palette:'80×120',type:'Carton',etiquetage:'Standard',cerclage:'Aucun',notes:'Mandrin selon la laize.'}); const r=await _l561PkgEnregistrer(b); return r===true&&PKG_CLIENTS['LEGRAND'].cerclage==='Aucun'&&PKG_CLIENTS['LEGRAND'].notes==='Mandrin selon la laize.  '&&/modifiée : cerclage —/.test(compte.audit[0][3]); }),'seuls les champs REELLEMENT changes sont reecrits : les notes d origine restent au caractere pres quand on ne change que le cerclage');
monde();
ok(await TA(async()=>{ const b=ed('PRIMA',{palette:'80×120',type:'Caisse',etiquetage:'Standard',cerclage:'Aucun',notes:''},null); const r=await _l561PkgEnregistrer(b); return r===true&&PKG_CLIENTS['PRIMA'].cerclage==='Aucun'&&compte.pub[0].photo['PRIMA'].cerclage==='Aucun'&&/créée : palette, type, etiquetage, cerclage, notes$/.test(compte.audit[0][3])&&compte.conf.length===0; }),'creation d une regle pour un client isole : pas de question, journal « creee »');
monde(); confRep=false;
ok(await TA(async()=>{ const avant=JSON.stringify(PKG_CLIENTS); const b=ed('DUPONT BELGIQUE',{palette:'100×120',type:'Vrac',etiquetage:'',cerclage:'',notes:''},null); const r=await _l561PkgEnregistrer(b); return r===false&&compte.conf.length===1&&/Elle s’appliquera AUSSI à 1 autre\(s\) client\(s\)/.test(compte.conf[0])&&/· DUPONT — aujourd’hui : règles par défaut/.test(compte.conf[0])&&compte.pub.length===0&&JSON.stringify(PKG_CLIENTS)===avant; }),'creation qui rattraperait un AUTRE client : la question est posee AVANT, avec le nom du client touche ; refusee → rien n est ecrit ni publie');
monde(); confRep=true;
ok(await TA(async()=>{ const b=ed('DUPONT BELGIQUE',{palette:'100×120',type:'Vrac',etiquetage:'',cerclage:'',notes:''},null); const r=await _l561PkgEnregistrer(b); return r===true&&compte.conf.length===1&&compte.pub.length===1&&_l561PkgCle('DUPONT')==='DUPONT BELGIQUE'; }),'la meme creation, CONFIRMEE : publiee, et le client rattrape suit bien la nouvelle regle');
monde(); pubRep=false;
ok(await TA(async()=>{ const avant=JSON.stringify(PKG_CLIENTS); const b=ed('VEKA',{palette:'100×120',type:'Vrac',etiquetage:'',cerclage:'Aucun',notes:'x'}); const r=await _l561PkgEnregistrer(b); return r===false&&compte.pub.length===1&&compte.pub[0].photo['VEKA'].palette==='100×120'&&JSON.stringify(PKG_CLIENTS)===avant&&compte.rendu===0&&compte.audit.length===0&&b._d._retire!==true&&!/^ok\|/.test(der()); }),'ECHEC de la publication : la memoire revient EXACTEMENT a l etat d avant, pas de message vert, pas de journal, l editeur reste ouvert');
monde(); pubRep=false;
ok(await TA(async()=>{ const b=ed('PRIMA',{palette:'80×120',type:'Caisse',etiquetage:'',cerclage:'Aucun',notes:''},null); const r=await _l561PkgEnregistrer(b); return r===false&&!Object.prototype.hasOwnProperty.call(PKG_CLIENTS,'PRIMA'); }),'echec a la CREATION : la regle neuve est retiree de la memoire (pas de regle fantome)');
monde(); pubRep=false;
ok(await TA(async()=>{ const serveur={ 'VEKA':{palette:'1/2 palette',type:'Vrac',etiquetage:'',cerclage:'',notes:'venue du serveur'} }; pubHook=()=>{ global.PKG_CLIENTS=serveur; }; const b=ed('VEKA',{palette:'100×120',type:'Vrac',etiquetage:'',cerclage:'Aucun',notes:'x'}); const r=await _l561PkgEnregistrer(b); return r===false&&PKG_CLIENTS===serveur&&PKG_CLIENTS['VEKA'].notes==='venue du serveur'; }),'echec ALORS QUE le serveur vient de remplacer la table en memoire : on ne reecrit pas l ancienne valeur par-dessus la version du serveur');
monde();
ok(await TA(async()=>{ const b=ed('VEKA',{palette:'100×120',type:'Vrac',etiquetage:'',cerclage:'Aucun',notes:'x'},{palette:'autre',type:'',etiquetage:'',cerclage:'',notes:''}); const avant=JSON.stringify(PKG_CLIENTS); const r=await _l561PkgEnregistrer(b); return r===false&&compte.pub.length===0&&JSON.stringify(PKG_CLIENTS)===avant&&compte.rendu===1&&b._d._retire!==true&&/modifiée sur un autre poste/.test(der())&&/ta saisie reste à l’écran/.test(der()); }),'la regle a change sur un autre poste depuis l ouverture de l editeur : refuse, rien n est publie, la liste est rechargee et la SAISIE RESTE a l ecran');
monde();
ok(await TA(async()=>{ const r0=PKG_CLIENTS['VEKA']; const b=ed('VEKA',{palette:r0.palette,type:r0.type,etiquetage:r0.etiquetage,cerclage:r0.cerclage,notes:r0.notes+'  \n'}); const r=await _l561PkgEnregistrer(b); return r===false&&compte.pub.length===0&&/identique/.test(der()); }),'aucun changement reel : rien n est publie');
monde();
ok(await TA(async()=>{ const avant=JSON.stringify(PKG_CLIENTS); const b=ed('VEKA',{palette:'',type:'',etiquetage:'',cerclage:'',notes:'   '}); const r=await _l561PkgEnregistrer(b); return r===false&&compte.pub.length===0&&JSON.stringify(PKG_CLIENTS)===avant&&/^err\|/.test(der()); }),'regle entierement videe : refusee avant toute publication');
monde(); peutEditer=false;
ok(await TA(async()=>{ const avant=JSON.stringify(PKG_CLIENTS); const b=ed('VEKA',{palette:'100×120',type:'Vrac',etiquetage:'',cerclage:'Aucun',notes:'x'}); const r=await _l561PkgEnregistrer(b); return r===false&&compte.pub.length===0&&JSON.stringify(PKG_CLIENTS)===avant&&/Réservé/.test(der()); }),'enregistrement refuse hors administration / pilotage');
monde(); global._l486EnVol=1;
ok(await TA(async()=>{ const avant=JSON.stringify(PKG_CLIENTS); const b=ed('VEKA',{palette:'100×120',type:'Vrac',etiquetage:'',cerclage:'Aucun',notes:'x'}); const r=await _l561PkgEnregistrer(b); return r===false&&compte.pub.length===0&&JSON.stringify(PKG_CLIENTS)===avant&&/Un autre enregistrement de cet onglet est encore en cours/.test(der()); }),'une autre publication de l onglet est EN VOL sur ce poste : refuse avant toute pose en memoire (jamais de publication croisee)');
monde();
ok(await TA(async()=>{ global._l486Publish=async()=>{ throw new Error('boum'); }; const avant=JSON.stringify(PKG_CLIENTS); const b=ed('VEKA',{palette:'100×120',type:'Vrac',etiquetage:'',cerclage:'Aucun',notes:'x'}); const r=await _l561PkgEnregistrer(b); global._l486Publish=PUB; return r===false&&JSON.stringify(PKG_CLIENTS)===avant&&compte.warn===1&&/^err\|/.test(der()); }),'publication qui leve une exception : memoire retablie, panne tracee et dite');
monde();
ok(await TA(async()=>{ const K='Legrand France Test'; PKG_CLIENTS[K]={palette:'80×120',type:'Caisse',etiquetage:'',cerclage:'Aucun',notes:'avant'}; const cles=Object.keys(PKG_CLIENTS).join('|'); const d=ouvrir(K,K); if(!d) return false; ['palette','type','etiquetage','cerclage'].forEach(k=>{ d.querySelector('.l561-'+k).value=PKG_CLIENTS[K][k]; }); d.querySelector('.l561-notes').value='apres'; const r=await _l561PkgEnregistrer({closest:c=>(c==='.l561-edit'?d:null),disabled:false}); return r===true&&compte.pub.length===1&&Object.keys(compte.pub[0].photo).join('|')===cles&&Object.keys(PKG_CLIENTS).join('|')===cles&&PKG_CLIENTS[K].notes==='apres'; }),'chaine REELLE Editer puis Enregistrer sur une cle a casse mixte : la cle traverse intacte (aucune cle creee, la bonne regle modifiee et publiee)');

console.log('── D2. suppression d une regle ──');
monde();
ok(await TA(async()=>{ const b=ed('ANCIEN NOM SARL',{}); const t=PKG_CLIENTS; const r=await _l561PkgSupprimer(b); return r===true&&compte.conf.length===1&&/Supprimer la règle d’emballage « ANCIEN NOM SARL » \?/.test(compte.conf[0])&&/Aucun client de la liste ne l’utilise/.test(compte.conf[0])&&compte.pub.length===1&&!Object.prototype.hasOwnProperty.call(compte.pub[0].photo,'ANCIEN NOM SARL')&&!Object.prototype.hasOwnProperty.call(PKG_CLIENTS,'ANCIEN NOM SARL')&&Object.keys(PKG_CLIENTS).length===5&&Object.keys(t).length===6&&/supprimée pour tous les postes/.test(der())&&/supprimée — règle supprimée : \{"palette":"100×120"/.test(compte.audit[0][3])&&b._d._retire===true&&compte.rendu===1; }),'suppression confirmee : la table SANS la regle est publiee, l ancienne table n est pas abimee, le journal garde la regle supprimee');
monde();
ok(await TA(async()=>{ const b=ed('LEGRAND',{}); const r=await _l561PkgSupprimer(b); return r===true&&/Elle s’applique aujourd’hui à : LEGRAND FRANCE, LEGRAND ITALIE\./.test(compte.conf[0])&&/elle s’appliquait à : LEGRAND FRANCE, LEGRAND ITALIE/.test(compte.audit[0][3])&&_l561PkgCle('LEGRAND FRANCE')===null; }),'la question de suppression NOMME les clients qui repasseront aux regles par defaut');
monde(); confRep=false;
ok(await TA(async()=>{ const avant=JSON.stringify(PKG_CLIENTS); const b=ed('VEKA',{}); const r=await _l561PkgSupprimer(b); return r===false&&compte.pub.length===0&&JSON.stringify(PKG_CLIENTS)===avant; }),'suppression NON confirmee : rien ne change');
monde(); pubRep=false;
ok(await TA(async()=>{ const t=PKG_CLIENTS; const avant=JSON.stringify(t); const b=ed('VEKA',{}); const r=await _l561PkgSupprimer(b); return r===false&&PKG_CLIENTS===t&&JSON.stringify(PKG_CLIENTS)===avant&&compte.audit.length===0&&b._d._retire!==true; }),'ECHEC de la publication d une suppression : la table d avant revient, pas de journal');
monde(); delete PKG_CLIENTS['R6'];
ok(await TA(async()=>{ const avant=JSON.stringify(PKG_CLIENTS); const b=ed('VEKA',{}); const r=await _l561PkgSupprimer(b); return r===false&&compte.conf.length===0&&compte.pub.length===0&&JSON.stringify(PKG_CLIENTS)===avant&&/il doit rester au moins 5 règles/.test(der()); }),'suppression refusee quand il ne resterait pas 5 regles (seuil de _l486Publish), dit AVANT la question');
monde();
ok(await TA(async()=>{ const avant=JSON.stringify(PKG_CLIENTS); const b=ed('VEKA',{},{palette:'autre',type:'',etiquetage:'',cerclage:'',notes:''}); const r=await _l561PkgSupprimer(b); return r===false&&compte.conf.length===0&&compte.pub.length===0&&JSON.stringify(PKG_CLIENTS)===avant&&/modifiée sur un autre poste/.test(der()); }),'la regle a change ailleurs depuis l ouverture : suppression refusee');
monde(); global._l486EnVol=1;
ok(await TA(async()=>{ const avant=JSON.stringify(PKG_CLIENTS); const b=ed('VEKA',{}); const r=await _l561PkgSupprimer(b); return r===false&&compte.pub.length===0&&JSON.stringify(PKG_CLIENTS)===avant&&/encore en cours/.test(der()); }),'suppression refusee pendant une autre publication en vol');
monde(); peutEditer=false;
ok(await TA(async()=>{ const b=ed('VEKA',{}); const r=await _l561PkgSupprimer(b); return r===false&&compte.conf.length===0&&compte.pub.length===0&&/Réservé/.test(der()); }),'suppression refusee hors administration / pilotage');

console.log('── E. cablage (source) ──');
{ const e=F('_l561PkgEnregistrer'), s2=F('_l561PkgSupprimer'), rc=F('renderClients'), pb=F('_l486Publish'), ce=F('cliEdit'), tout=LOT.map(F).join('\n');
  ok(!!e&&/ok=await _l486Publish\(btn,true\);/.test(e)&&e.indexOf('table[cle]=pose;')>0&&e.indexOf('table[cle]=pose;')<e.indexOf('_l486Publish(btn,true)')&&/ok=await _l486Publish\(btn,true\);/.test(s2),'enregistrement ET suppression passent par _l486Publish (transaction, refus de concurrence, gardes « table appauvrie »), apres avoir pose l etat en memoire');
  ok(LOT.every(n=>F(n).length>0)&&!/\.collection\(|\.doc\(|\.set\(|\.update\(|runTransaction|localStorage|\[['"](?:set|update|doc|collection)['"]\]/.test(tout),'aucune ecriture directe (Firestore, cache local, y compris a crochets) dans les 13 fonctions du lot : tout passe par _l486Publish');
  ok((tout.match(/_l486Publish\(/g)||[]).length===2&&(F('_l561PkgEnregistrer').match(/_l486Publish\(/g)||[]).length===1&&(F('_l561PkgSupprimer').match(/_l486Publish\(/g)||[]).length===1,'exactement DEUX appels a _l486Publish dans le lot (un pour enregistrer, un pour supprimer)');
  ok(/if\(PKG_CLIENTS===table\)\{ if\(brut===undefined\) delete table\[cle\]; else table\[cle\]=brut; \}/.test(e)&&/if\(!ok\)\{ if\(PKG_CLIENTS===sans\) PKG_CLIENTS=table; return false; \}/.test(s2),'retour arriere en cas d echec : seulement si la table en memoire est encore celle qu on a modifiee');
  ok(e.indexOf('await confirmDlg(')>0&&e.indexOf('await confirmDlg(')<e.indexOf('table[cle]=pose;')&&e.indexOf('_l486EnVol>0')<e.indexOf('table[cle]=pose;')&&e.indexOf('_l486EnVol>0')>0,'la question (creation qui rattrape d autres clients) et le refus « publication en vol » precedent toute pose en memoire');
  ok(/^var _l486Loaded=false, _l486SeenAt, _l486Unsub=null, _l486Retries=0, _l486EnVol=0;/m.test(src)&&/btn\.disabled=true;\n  _l486EnVol\+\+;/.test(pb)&&/finally\{ _l486EnVol--; if\(btn\) btn\.disabled=false; \}/.test(pb)&&(pb.match(/_l486EnVol/g)||[]).length===2,'_l486Publish compte les publications en vol : +1 avant la transaction, -1 dans le finally (toutes les sorties)');
  ok(/^const _L561_CHAMPS=\['palette','type','etiquetage','cerclage','notes'\];/m.test(src),'les 5 champs d une regle, en un seul endroit');
  ok(/const pkg=_l561PkgCle\(n\);/.test(rc)&&/\+_l561PkgBloc\(n,noms\)/.test(rc)&&/\+_l561PkgOrphelines\(noms\)/.test(rc),'la liste des clients affiche l emballage de chaque client et les regles sans client');
  ok(rc.indexOf("const _l561Ed=c.querySelector?c.querySelector('.l561-edit'):null;")>0&&rc.indexOf("const _l561Ed=")<rc.indexOf('c.innerHTML=')&&rc.indexOf('h.after(_l561Ed);')>rc.lastIndexOf('c.innerHTML='),'renderClients met l editeur ouvert de cote AVANT de reecrire la liste et le re-pose APRES : la saisie en cours survit au re-rendu');
  ok(/if\(p\)\{ c\.palette=p\.palette\|\|''; c\.typeCond=p\.type\|\|''; c\.etiquetage=p\.etiquetage\|\|''; c\.cerclage=p\.cerclage\|\|''; c\.notes=p\.notes\|\|''; renderCliPanel\(\); \}/.test(ce)&&!/c\.cerclage=p\.cerclage\|\|c\.cerclage/.test(ce),'client B/C/D d une commande : la regle trouvee pose ses 5 valeurs telles quelles (un champ vide ou des notes vides ne gardent plus rien du client precedent)');
  ok(!/console Firestore, document config\/clients/.test(src)&&/se modifient ici, client par client/.test(rc)&&!/Une commande déjà ouverte garde ses valeurs/.test(src)&&/tant qu’on n’y rechoisit ni le client ni la référence/.test(F('_l561PkgEditer')),'textes : le renvoi vers la console est remplace par le mode d emploi ; la promesse sur une commande deja a l ecran est exacte');
  ok((function(){ const m=/const APP_VERSION='[0-9.]+-L(\d+)';/.exec(src); return !!m&&(+m[1])>=561; })(),'version L561 ou suivante');
  const boucle=function(t){ const m=/for s in ([a-z0-9 -]+); do/.exec(t); return m?m[1].trim().split(/ +/):[]; };
  ok(/'donnees-emballage': `/.test(shot)&&/'donnees-emballage': "/.test(shot)&&boucle(bat).indexOf('donnees-emballage')>=0&&boucle(ci).indexOf('donnees-emballage')>=0&&boucle(bat).join(' ')===boucle(ci).join(' ')&&boucle(bat).slice(-2).join(' ')==='donnees analyse','scene « donnees-emballage » dans shot.mjs, dans la boucle de la batterie ET de la CI (memes listes), placee avant « donnees analyse » (les tests L554 a L558 exigent cette fin de boucle)');
  ok((function(){ const m=/Smokes \((\d+) scenes/.exec(ci); return !!m&&(+m[1])===boucle(ci).length&&boucle(ci).length>=14; })(),'la CI annonce le VRAI nombre de scenes de sa boucle');
}
console.log(fail?('\n💥 '+fail+'/'+total+' ECHEC(S) EMBALLAGE L561'):('\n🏆 EMBALLAGE L561 OK : '+total+' verifications'));
process.exit(fail?1:0);
})();
