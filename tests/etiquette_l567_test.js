// etiquette_l567_test.js — [L567] l'ETIQUETTE SOLDE (printEtiquette) tient sur UNE SEULE page A4 paysage, matiere comprise.
// Signalement d'un operateur le 20/11/2026 : depuis les lignes matiere (L290) l'etiquette mesurait ~213 mm pour ~198 mm utiles
// et prenait DEUX pages. Lot de MISE EN PAGE SEULE (accord de la responsable qualite le 23/11/2026, regle 2 du depot) :
// aucune information ajoutee ni retiree, calculs intacts.
// Ce test extrait la VRAIE fonction printEtiquette du source (pas une copie), lui donne 10 jeux de donnees (sans matiere, avec matiere,
// reference de 80 caracteres, fin de phase, n° de reference rempli / vide, solde a 4 chiffres, sans bobine mere, caracteres speciaux,
// pire cas), imprime chaque etiquette en PDF avec un VRAI Chrome sans ecran (CDP, port aleatoire, Page.printToPDF preferCSSPageSize)
// et exige EXACTEMENT 1 page A4 paysage partout. Il verifie aussi que toutes les informations d'origine sont dans le HTML, que tout
// texte saisi passe par esc(), et que l'apercu a l'ecran garde sa barre d'outils utilisable (1280x740, comme dans l'iframe de l'app).
// L567_HTML : rejouer le test sur un autre index.html (preuve « rouge avant » sur la base L564).
// Chrome : CHROME_BIN, sinon chemins usuels. Chrome ABSENT = ECHEC explicite (jamais de faux vert). Le Chrome lance est TOUJOURS tue
// (taskkill /T /F sous Windows) et son dossier temporaire supprime.
const fs=require('fs'), path=require('path'), os=require('os'), cp=require('child_process');
const src=fs.readFileSync(process.env.L567_HTML||path.join(__dirname,'..','index.html'),'utf8');
let fail=0; const ok=(c,m)=>{ console.log((c?'✅ ':'❌ ')+m); if(!c) fail++; };
function fnOf(n){ const i=src.indexOf('function '+n+'('); if(i<0) throw new Error('introuvable '+n); let k=src.indexOf('{',i),d=0; for(;k<src.length;k++){ if(src[k]==='{')d++; else if(src[k]==='}'){ d--; if(!d)break; } } return src.slice(i,k+1); }

// ── la VRAIE printEtiquette, avec le VRAI esc() et le VRAI fmt() du source (esc espionne : on garde ce qu'il a traite)
global._ESC_MAP=eval('('+src.match(/^const _ESC_MAP=(\{[^\n]*\});/m)[1]+')');
const escReal=eval('('+fnOf('esc')+')'), fmtReal=eval('('+fnOf('fmt')+')');
let escCalls=0;
global.esc=v=>{ escCalls++; return escReal(v); };
global.fmt=fmtReal;
global.refDispCtx=r=>r;                         // nom d'affichage : sans objet pour la mise en page (depend de l'etat de l'app)
let captured=''; global.openPrintWindow=h=>{ captured=h; };
const printEtiquette=eval('('+fnOf('printEtiquette')+')');
const gen=d=>{ captured=''; escCalls=0; printEtiquette(d); return captured; };

const base={ mn:'MAVEG', date:'23/11/2026', solde:'1178', numBob:'BOB-010', refNum:'' };
const MAT={ film:'PP noir blanc', veka:'VEKA', longueur:'1500', mother:'2100' };
const REF80='41312809 - TacFlex® KX1045-1 noir blanc LEGRAND etiquetage standard serie 2026 ab';   // 80 caracteres
const JEUX={
  'sans matiere':            { ...base, ref:'KX1045-1', film:'', veka:'', longueur:'', mother:'' },
  'avec matiere':            { ...base, ref:'41312809 - TacFlex® KX1045-1 noir blanc', ...MAT },
  'reference de 80 car.':    { ...base, ref:REF80, ...MAT, refNum:'' },
  'fin de phase':            { ...base, ref:'41312809 - TacFlex® KX1045-1 noir blanc ⟲ fin de phase', ...MAT, longueur:'250', mother:'2110' },
  'n° de reference rempli':  { ...base, ref:'KX1045-1', ...MAT, refNum:'123456789' },
  'n° de reference vide':    { ...base, ref:'KX1045-1', ...MAT, refNum:'' },
  'solde a 4 chiffres':      { ...base, ref:'DQ1002 transp imprime LEGRAND', ...MAT, solde:'2095', mother:'2110' },
  'sans bobine mere':        { ...base, ref:'KX1045-1', ...MAT, numBob:'' },
  'caracteres speciaux':     { ...base, ref:'A&B <i>"x"</i> \'y\'', film:'PP <b>"mat"</b> & co', veka:'Profilé "L" <>', longueur:'1500', mother:'2100', numBob:'B&<1>', mn:'MA<V>EG', refNum:'N°<1>&"2"' },
  'pire cas (tout long)':    { ...base, ref:REF80+' ⟲ fin de phase', film:'Polypropylene transparent imprime recto verso 80 microns', veka:'Profilé VEKA special', longueur:'1500', mother:'2110', solde:'2095', numBob:'BOB-0101-ABC-9999', refNum:'123456789012' },
};

// ── 1. le HTML garde TOUTES les informations d'origine
const texte=h=>h.replace(/<style[\s\S]*?<\/style>/g,' ').replace(/<!--[\s\S]*?-->/g,' ').replace(/<[^>]+>/g,' ').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ');
{
  const d=JEUX['fin de phase'], h=gen({ ...d, refNum:'987654321' }), t=texte(h);
  ['ÉTIQUETTE SOLDE — STEP','1178 mm','Bobine mère n° : BOB-010','Réf : 41312809 - TacFlex® KX1045-1 noir blanc ⟲ fin de phase','Machine : MAVEG','Date : 23/11/2026',
   'Film : PP noir blanc','Type : VEKA','Longueur : 250 ml','Laize mère : 2110 mm','N° de référence : 987654321','Revenir à la fiche','Imprimer'
  ].forEach(x=>ok(t.includes(x),'information d’origine présente : « '+x+' »'));
  ok(/class="back"/.test(h)&&/class="prn"/.test(h)&&/window\.print\(\)/.test(h)&&/printOverlayClose/.test(h),'les deux boutons (Revenir à la fiche / Imprimer) et leurs gestes sont intacts');
  ok(/@page\{size:A4 landscape;margin:6mm\}/.test(h),'@page A4 paysage, marge 6 mm inchangé');
  const s=texte(gen(JEUX['sans matiere']));
  ok(!/Film :|Type :|Longueur :|Laize mère :/.test(s),'sans matière : aucune ligne matière imprimée (comportement d’origine)');
  ok(/N° de référence :/.test(s)&&/class="vide"/.test(gen(JEUX['sans matiere'])),'sans n° de référence : la case vide reste à compléter au feutre');
  ok(!/Bobine mère n°/.test(texte(gen(JEUX['sans bobine mere']))),'sans bobine mère : la ligne n’est pas imprimée (comportement d’origine)');
  ok(/class="val">123456789</.test(gen(JEUX['n° de reference rempli']))&&!/class="vide"/.test(gen(JEUX['n° de reference rempli'])),'n° de référence rempli : imprimé, plus de case vide');
}
// ── 2. TOUT texte saisi passe par esc() : une charge « HTML » dans chaque champ ressort inerte
{
  const P=k=>'<u id="f_'+k+'">&"\'';
  const d={ mn:P('mn'), date:P('date'), solde:P('solde'), numBob:P('numBob'), ref:P('ref'), refNum:P('refNum'), film:P('film'), veka:P('veka'), longueur:P('longueur'), mother:'2100' };
  const h=gen(d), n=escCalls;
  ['mn','date','solde','numBob','ref','refNum','film','veka','longueur'].forEach(k=>{
    ok(!h.includes('<u id="f_'+k+'"'),'champ '+k+' : la charge HTML ne ressort PAS en balise (esc)');
    ok(h.includes('&lt;u id=&quot;f_'+k+'&quot;&gt;&amp;&quot;&#39;'),'champ '+k+' : la charge ressort échappée');
  });
  ok(n>=10,'esc() appelé pour chacun des 10 champs saisis ('+n+' appels)');
  const f=fnOf('printEtiquette'), sansEsc=f.replace(/esc\(String\(d\.\w+\)\)|esc\(refDispCtx\(String\(d\.ref\)\.replace\([^\n]*?\)\)\)|esc\(String\(fmt\(d\.mother\)\)\)/g,'');
  ok(!/\$\{[^}?]*d\.(solde|numBob|ref|mn|date|film|veka|longueur|mother|refNum)\b[^}?]*\}/.test(sansEsc.replace(/\$\{\(?d\.[^}`]*\?`/g,'')),'aucune interpolation ${…d.champ…} hors esc() dans le source de printEtiquette');
}
// ── 3. CSS rendu : pas de hauteur minimale a l'impression, etiquette insecable, tailles reduites
{
  const h=gen(JEUX['avec matiere']);
  const pm=(h.match(/@media print\{[^\n]*\}/)||[''])[0];
  ok(pm&&!/min-height:(?!auto)/.test(pm)&&/\.sheet\{min-height:auto/.test(pm),'@media print : aucun min-height (sauf auto) — plus de calc(100vh) qui force une 2e page');
  ok(/\.etiq\{[^}]*break-inside:avoid;page-break-inside:avoid\}/.test(h),'.etiq : break-inside:avoid + page-break-inside:avoid');
  const px=(re)=>{ const m=h.match(re); return m?Number(m[1]):NaN; };
  ok(px(/\.solde\{[^}]*font-size:(\d+)px/)<=150,'solde ≤ 150 px (210 px avant)');
  ok(px(/\.grid\{[^}]*font-size:(\d+)px/)<=28,'grille ≤ 28 px (36 px avant)');
  ok(px(/\.etiq h2\{font-size:(\d+)px/)<=32,'titre ≤ 32 px (44 px avant)');
}

// ── 3bis. HAUTEUR ESTIMEE depuis le CSS du source (vaut aussi en CI sans Chrome) : somme des hauteurs DECLAREES au pire cas de lignes, <= 198 mm utiles
{
  const h=gen(JEUX['pire cas (tout long)']), css=h.match(/<style>([\s\S]*?)<\/style>/)[1], MM=96/25.4;
  const rule=sel=>{ const m=css.match(new RegExp('(?:^|[\\s}])'+sel.replace(/[.]/g,'\\.')+'\\{([^}]*)\\}')); return m?m[1]:''; };
  const f=(r,p)=>{ const m=r.match(new RegExp('(?:^|;)'+p+':([^;]*)')); return m?m[1].trim():''; };
  const px=v=>{ const m=String(v).match(/(-?[\d.]+)(px|mm)/); return m?Number(m[1])*(m[2]==='mm'?MM:1):NaN; };
  const n=v=>Number(String(v).replace('px',''));
  const pr=css.match(/@media print\{([^\n]*)\}/)[1], bordP=Number((pr.match(/\.etiq\{border-width:(\d+)px/)||[])[1]);
  const etiq=rule('.etiq'), h2=rule('.etiq h2'), sol=rule('.solde'), g=rule('.grid'), rn=rule('.refnum'), val=rule('.refnum .val'), vide=rule('.refnum .vide');
  const pad=px(f(etiq,'padding').split(/\s+/)[0]);
  const h2h=n(f(h2,'font-size'))*1.15+px(f(h2,'margin').split(/\s+/)[2])+px(f(h2,'padding-bottom'))+px(f(h2,'border-bottom').split(/\s+/)[0]);
  const solh=n(f(sol,'font-size'))*Number(f(sol,'line-height'))+2*px(f(sol,'margin').split(/\s+/)[0]);
  const ligne=n(f(g,'font-size'))*Number(f(g,'line-height'));
  const L1=4, L2=3;   // pire cas de lignes : 4 lignes d identite (bobine / reference sur 2 lignes / machine + date), 3 lignes de matiere
  const im=/class=.grid. style=.margin-top:(\d+)px;padding-top:(\d+)px;border-top:(\d+)px/.exec(h), mat=im?Number(im[1])+Number(im[2])+Number(im[3]):NaN;   // bloc matiere : styles en ligne lus dans le HTML
  const total=2*bordP+2*pad+h2h+solh+(px(f(g,'margin-top'))+L1*ligne)+(mat+L2*ligne)+(px(f(rn,'margin-top'))+Math.max(n(f(val,'font-size'))*1.15,px(f(vide,'height'))));
  const mm=total/MM;
  ok(Number.isFinite(mm),'hauteur estimée : toutes les valeurs du CSS sont lisibles (aucune valeur manquante)');
  ok(mm<=198,'hauteur estimée depuis le CSS (titre + solde + 4 lignes + 3 lignes matière + n° de référence + marges et bordures d’impression) = '+Math.round(mm)+' mm ≤ 198 mm utiles');
}

// ── 4. Chrome sans ecran : COMBIEN DE PAGES ?
const CANDIDATS=process.env.CHROME_BIN?[process.env.CHROME_BIN]:['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser','/opt/google/chrome/chrome','/snap/bin/chromium','/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
const CHROME=CANDIDATS.find(p=>{ try{ return fs.existsSync(p); }catch(e){ return false; } });
let chrome=null, udd=null, tue=false, nonJoue=false;
const EN_CI=!!(process.env.CI||process.env.GITHUB_ACTIONS);   // CI sans Chrome : tout ce qui n en demande pas est joue, le compte de pages est SIGNALE non joue (la batterie locale l impose)
function tuer(){ if(tue) return; tue=true; try{ if(chrome&&chrome.pid){ if(process.platform==='win32') cp.spawnSync('taskkill',['/T','/F','/PID',String(chrome.pid)],{stdio:'ignore'}); else chrome.kill('SIGKILL'); } }catch(e){}
  if(udd){ for(let i=0;i<40;i++){ try{ fs.rmSync(udd,{recursive:true,force:true}); }catch(e){} if(!fs.existsSync(udd)) break; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)),0,0,250); } } }   // le dossier du profil reste verrouille quelques instants apres la mort de Chrome : on reessaie (10 s max)
process.on('exit',tuer); process.on('SIGINT',()=>{ tuer(); process.exit(130); });
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const pagesOf=b64=>{ const s=Buffer.from(b64,'base64').toString('latin1'); const m=s.match(/\/Type\s*\/Page[^s]/g); const c=s.match(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/)||s.match(/\/Count\s+(\d+)[^>]*?\/Type\s*\/Pages/);
  const mb=s.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/); return { n:m?m.length:0, count:c?Number(c[1]):null, w:mb?Number(mb[1]):0, h:mb?Number(mb[2]):0 }; };

// Client WebSocket minimal (texte seulement) : Node 20 (job « verifier » de la CI) n'a PAS de WebSocket global, Node 22+ oui ; un seul chemin de code, partout.
function wsConnect(urlStr){ return new Promise((resolve,reject)=>{
  const net=require('net'), crypto=require('crypto'), u=new URL(urlStr), sock=net.connect(Number(u.port),u.hostname), key=crypto.randomBytes(16).toString('base64');
  let buf=Buffer.alloc(0), up=false, frag=[]; const api={ onmessage:null,
    send(txt){ const p=Buffer.from(txt,'utf8'), n=p.length, mk=crypto.randomBytes(4); let h;
      if(n<126) h=Buffer.from([0x81,0x80|n]); else if(n<65536){ h=Buffer.alloc(4); h[0]=0x81; h[1]=0x80|126; h.writeUInt16BE(n,2); } else { h=Buffer.alloc(10); h[0]=0x81; h[1]=0x80|127; h.writeBigUInt64BE(BigInt(n),2); }
      const m=Buffer.alloc(n); for(let i=0;i<n;i++) m[i]=p[i]^mk[i&3]; sock.write(Buffer.concat([h,mk,m])); },
    close(){ try{ sock.destroy(); }catch(e){} } };
  sock.on('error',reject);
  sock.on('connect',()=>sock.write('GET '+u.pathname+' HTTP/1.1\r\nHost: '+u.host+'\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: '+key+'\r\nSec-WebSocket-Version: 13\r\n\r\n'));
  sock.on('data',d=>{ buf=Buffer.concat([buf,d]);
    if(!up){ const i=buf.indexOf('\r\n\r\n'); if(i<0) return; if(!/^HTTP\/1\.1 101/.test(buf.toString('latin1',0,i))) return reject(new Error('handshake CDP refuse')); up=true; buf=buf.slice(i+4); resolve(api); }
    for(;;){ if(buf.length<2) return; const op=buf[0]&15, fin=(buf[0]&128)!==0; let n=buf[1]&127, o=2;
      if(n===126){ if(buf.length<4) return; n=buf.readUInt16BE(2); o=4; } else if(n===127){ if(buf.length<10) return; n=Number(buf.readBigUInt64BE(2)); o=10; }
      if(buf.length<o+n) return; const pl=buf.slice(o,o+n); buf=buf.slice(o+n);
      if(op===1||op===0){ frag.push(pl); if(fin){ const t=Buffer.concat(frag).toString('utf8'); frag=[]; if(api.onmessage) api.onmessage({data:t}); } } } });
}); }
async function chromePart(){
  if(!CHROME){
    if(EN_CI){ nonJoue=true; console.log('⚠ COMPTE DE PAGES NON JOUÉ en CI : pas de Chrome dans le job verifier — la batterie locale (tests/battery.sh) le joue obligatoirement'); return; }
    ok(false,'Chrome INTROUVABLE (CHROME_BIN ou chemin usuel) — impossible de compter les pages : échec explicite, pas de faux vert (hors CI)'); return; }
  udd=fs.mkdtempSync(path.join(os.tmpdir(),'stepetiq567-'));
  const PORT=20000+Math.floor(Math.random()*20000);
  chrome=cp.spawn(CHROME,['--headless=new','--remote-debugging-port='+PORT,'--user-data-dir='+udd,'--no-first-run','--no-default-browser-check','--disable-gpu','--disable-dev-shm-usage','--hide-scrollbars','--force-device-scale-factor=1']
    .concat((typeof process.getuid==='function'&&process.getuid()===0)?['--no-sandbox']:[]).concat(['about:blank']),{stdio:'ignore'});
  let up=null; for(let i=0;i<300&&!up;i++){ try{ const r=await fetch('http://127.0.0.1:'+PORT+'/json/version'); if(r.ok) up=await r.json(); }catch(e){} if(!up) await sleep(100); }
  if(!up){ ok(false,'Chrome lancé mais le port CDP '+PORT+' ne répond pas (30 s) — CHROME_BIN='+CHROME); return; }
  const ws=await wsConnect(up.webSocketDebuggerUrl);
  let id=0; const pend=new Map(); ws.onmessage=ev=>{ const m=JSON.parse(ev.data); if(m.id&&pend.has(m.id)){ pend.get(m.id)(m); pend.delete(m.id); } };
  const send=(method,params={},sessionId)=>new Promise((res,rej)=>{ const i=++id; const t=setTimeout(()=>rej(new Error('délai CDP : '+method)),30000); pend.set(i,m=>{ clearTimeout(t); res(m); }); ws.send(JSON.stringify({id:i,method,params,sessionId})); });
  const { result:{ targetId } }=await send('Target.createTarget',{ url:'about:blank' });
  const { result:{ sessionId } }=await send('Target.attachToTarget',{ targetId, flatten:true });
  const S=(m,p)=>send(m,p,sessionId); await S('Page.enable');
  const ev=async expr=>{ const r=await S('Runtime.evaluate',{ expression:expr, returnByValue:true }); if(r.error||!r.result||r.result.exceptionDetails) throw new Error('evaluate : '+JSON.stringify(r.error||r.result.exceptionDetails)); return r.result.result.value; };
  const charger=async (nom,html)=>{ const f=path.join(udd,'e'+(++charger.n)+'.html'); fs.writeFileSync(f,html,'utf8'); await S('Page.navigate',{ url:'file:///'+f.replace(/\\/g,'/') });
    for(let i=0;i<100;i++){ await sleep(50); try{ if(await ev('document.readyState')==='complete'&&await ev('!!document.querySelector(".etiq")')) break; }catch(e){} } await sleep(150); }; charger.n=0;
  const mesures={};
  // 4a. pages en A4 paysage (taille CSS de la page, comme l'impression reelle)
  for(const [nom,d] of Object.entries(JEUX)){
    await charger(nom,gen(d));
    const r=await S('Page.printToPDF',{ preferCSSPageSize:true, printBackground:true });
    const p=pagesOf(r.result.data);
    ok(p.n===1&&(p.count===null||p.count===1),'« '+nom+' » : EXACTEMENT 1 page imprimée (pages='+p.n+', /Count='+p.count+')');
    ok(Math.abs(p.w-841.9)<3&&Math.abs(p.h-595.3)<3,'« '+nom+' » : la page est un A4 PAYSAGE ('+Math.round(p.w)+' x '+Math.round(p.h)+' pt)');
  }
  // 4b. hauteur telle qu'imprimee (zone utile A4 paysage 285 x 198 mm = 1077 x 748 px) : marge de securite
  await S('Emulation.setDeviceMetricsOverride',{ width:1077, height:748, deviceScaleFactor:1, mobile:false });
  await S('Emulation.setEmulatedMedia',{ media:'print' });
  for(const [nom,d] of Object.entries(JEUX)){
    await charger(nom,gen(d));
    const m=JSON.parse(await ev('(function(){ const e=document.querySelector(".etiq").getBoundingClientRect(); return JSON.stringify({h:Math.round(e.height),b:Math.round(e.bottom),sh:document.documentElement.scrollHeight,sw:document.documentElement.scrollWidth,tb:getComputedStyle(document.querySelector(".toolbar")).display}); })()'));
    mesures[nom]=m;
    ok(m.b<=748&&m.sh<=748&&m.sw<=1077&&m.tb==='none','« '+nom+' » : imprimée, l’étiquette mesure '+Math.round(m.h*25.4/96)+' mm de haut (≤ 198 mm utiles), sans débordement, barre d’outils masquée');
  }
  // 4c. apercu a l'ecran (iframe de l'app : 1280 x ~740) : barre d'outils utilisable, etiquette lisible
  await S('Emulation.setEmulatedMedia',{ media:'screen' });
  await S('Emulation.setDeviceMetricsOverride',{ width:1280, height:740, deviceScaleFactor:1, mobile:false });
  for(const nom of ['avec matiere','pire cas (tout long)']){
    await charger(nom,gen(JEUX[nom]));
    const m=JSON.parse(await ev('(function(){ const q=s=>document.querySelector(s), r=e=>{ const b=e.getBoundingClientRect(); return {l:b.left,t:b.top,r:b.right,b:b.bottom,w:b.width,h:b.height}; };'+
      'const bk=q(".back"), pr=q(".prn"), E=q(".etiq"); const cx=e=>{ const b=e.getBoundingClientRect(); const x=document.elementFromPoint(b.left+b.width/2,b.top+b.height/2); return !!x&&(x===e||e.contains(x)); };'+
      'return JSON.stringify({back:r(bk),prn:r(pr),backOk:cx(bk),prnOk:cx(pr),etiq:r(E),sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,sh:document.documentElement.scrollHeight,'+
      'solde:parseFloat(getComputedStyle(q(".solde")).fontSize),grid:parseFloat(getComputedStyle(q(".grid")).fontSize),bkTxt:bk.textContent,prTxt:pr.textContent}); })()'));
    ok(m.back.t>=0&&m.back.b<=740&&m.back.l>=0&&m.back.r<=1280&&m.prn.t>=0&&m.prn.b<=740&&m.prn.r<=1280&&m.backOk&&m.prnOk,'aperçu 1280x740 « '+nom+' » : « Revenir à la fiche » et « Imprimer » visibles et cliquables (rien ne les recouvre)');
    ok(m.sw<=m.cw&&m.etiq.l>=0&&m.etiq.r<=1280,'aperçu 1280x740 « '+nom+' » : pas de défilement horizontal, l’étiquette tient en largeur');
    ok(m.solde>=100&&m.grid>=24,'aperçu 1280x740 « '+nom+' » : étiquette lisible (solde '+m.solde+' px, informations '+m.grid+' px)');
    console.log('   ↳ hauteur de la page à l’écran '+m.sh+' px (étiquette '+Math.round(m.etiq.h)+' px)');
  }
  try{ ws.close(); }catch(e){}
}
(async()=>{
  const garde=setTimeout(()=>{ console.log('❌ délai global de 150 s dépassé (Chrome bloqué ?)'); tuer(); process.exit(1); },150000); garde.unref();
  try{ await chromePart(); }catch(e){ ok(false,'Chrome : '+(e&&e.message||e)); }
  finally{ tuer(); }
  console.log(fail?('\n💥 '+fail+' propriété(s) VIOLÉE(S) — étiquette solde L567'):'\n🏆 ÉTIQUETTE SOLDE L567 : '+(nonJoue?'informations intactes, esc() partout, CSS et hauteur estimée dans les 198 mm (COMPTE DE PAGES NON JOUÉ en CI : pas de Chrome)':'UNE page A4 paysage sur les '+Object.keys(JEUX).length+' jeux (matière, fin de phase, 80 car., caractères spéciaux…), informations intactes, esc() partout, aperçu écran utilisable (Chrome : '+CHROME+')'));
  if(!fail&&!process.env.L567_META){   // mecanisme CI / hors CI, rejoue dans deux processus fils (qui ne se rejouent pas eux-memes)
    const run=ci=>{ const env=Object.assign({},process.env,{L567_META:'1',CHROME_BIN:'C:/chemin-faux/chrome.exe'}); delete env.CI; delete env.GITHUB_ACTIONS; if(ci) env.CI='1'; return cp.spawnSync(process.execPath,[__filename],{env,encoding:'utf8'}); };
    const a=run(true), b=run(false);
    ok(a.status===0&&/COMPTE DE PAGES NON JOUÉ en CI/.test(a.stdout)&&/🏆/.test(a.stdout),'CI=1 + Chrome absent : code 0, message « COMPTE DE PAGES NON JOUÉ en CI » et trophée');
    ok(b.status===1&&/Chrome INTROUVABLE/.test(b.stdout)&&!/🏆/.test(b.stdout),'hors CI + Chrome absent : ÉCHEC explicite (code 1, pas de trophée)');
  }
  if(nonJoue&&!fail) console.log('   (compte de pages non joué : seules les propriétés sans Chrome ont été vérifiées)');
  process.exit(fail?1:0);
})();
