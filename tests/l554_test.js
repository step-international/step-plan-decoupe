// l554_test.js — [L554 · 22/10/2026, signalement MR du 21/10 (fiche, MAVEG, commande p26/01129)]
// « j ai mis 4 en dechet et ca ne s est pas rajoute sur la suivante automatiquement ».
// Les bobineaux mis au 🗑 Dechet ne comptent PAS comme livres (B54/L419) : le reste a produire augmente de
// leur nombre. Le seul chemin qui les remet sur les bobines suivantes est la banniere rouge « ⚠ Le plan a
// change → 🔄 Appliquer les changements », que _fichePlanDriftCheck fait apparaitre. Or les DEUX gestes qui
// changent ce compte — le bouton 🗑 Dechet / ✂ Chutes (toggleAction) et le chiffrage de la NC
// (updateNC : quantite, laize, lots) — ne replanifiaient PAS le detecteur : la banniere n arrivait qu au geste
// SUIVANT (✂ coupee, edition de config, ✕ retirer, retour sur l onglet Fiche). Jumeau exact du correctif L375
// sur ✕ RETIRER. Non destructif : la banniere ne lance jamais le recalcul, elle l OFFRE en un tap.
// Donnees FICTIVES, aucun appel reseau.
const fs=require('fs'),path=require('path');
const src=fs.readFileSync(path.join(__dirname,'..','index.html'),'utf8');
function fnOf(n){const re=new RegExp('^[ \\t]*(?:async\\s+)?function\\s+'+n+'\\s*\\(','m');const m=src.match(re);if(!m)throw new Error('introuvable '+n);let i=m.index+m[0].length-m[0].trimStart().length;let k=src.indexOf('{',i),d=0;for(let j=k;j<src.length;j++){const c=src[j];if(c==='{')d++;else if(c==='}'){d--;if(d===0)return src.slice(i,j+1);}}throw new Error('accolades '+n);}
let fail=0,total=0; const ok=(c,m)=>{ total++; console.log((c?'✅ ':'❌ ')+m); if(!c)fail++; };
const withCtx=(fnSrc,ctx)=>new Function('ctx','with(ctx){ return ('+fnSrc+'); }')(ctx);

ok(/const APP_VERSION='\d{4}\.\d\d\.\d\d-L(55[4-9]|5[6-9]\d|[6-9]\d\d|\d{4,})';/.test(src),'APP_VERSION >= L554');

// ── faux element DOM (juste ce que les deux fonctions touchent) ──
function El(o){
  const self=this;
  this.className=''; this.textContent=''; this.value=''; this.placeholder=''; this.style={}; this.dataset={}; this._input=null;
  Object.assign(this,o||{});
  this.classList={
    contains:function(c){ return String(self.className).split(/\s+/).indexOf(c)>=0; },
    toggle:function(c,on){ const s=String(self.className).split(/\s+/).filter(Boolean); const i=s.indexOf(c); const want=(on===undefined)?(i<0):!!on; if(want&&i<0)s.push(c); if(!want&&i>=0)s.splice(i,1); self.className=s.join(' '); }
  };
  this.querySelector=function(){ return self._input; };
}
function mkCtx(els,bulk){
  const n={cumuls:0,drift:0,coupee:0,repub:0};
  return {ctx:{
    document:{getElementById:function(k){ return els[k]||null; }},
    _bulkRestore:!!bulk,
    updateAllCumuls:function(){ n.cumuls++; },
    updateCoupeeStatus:function(){ n.coupee++; },
    _l426ShareRepub:function(){ n.repub++; },
    _scheduleDriftCheck:function(){ n.drift++; },
    _ncActionCue:function(){},
    streakReset:function(){},
    syncFlMore:function(){},
    parseNum:function(v){ return parseFloat(String(v==null?'':v).replace(',','.'))||0; },
    String:String, Array:Array, Number:Number
  },n:n};
}

console.log('── 1. 🗑 Dechet / ✂ Chutes (toggleAction) ──');
function runToggle(bulk){
  const els={act_dechet_B1:new El(),act_chutes_B1:new El(),act_accept_B1:new El()};
  const {ctx,n}=mkCtx(els,bulk);
  const TA=withCtx(fnOf('toggleAction'),ctx);
  return {TA:TA,els:els,n:n};
}
{ const t=runToggle(false);
  t.TA('B1','dechet');
  ok(t.els.act_dechet_B1.classList.contains('btn-red'),'le bouton 🗑 Dechet passe bien en rouge (comportement inchange)');
  ok(t.n.cumuls===1&&t.n.coupee===1,'les cumuls et le statut sont toujours recomptes');
  ok(t.n.drift===1,'🗑 Dechet COCHE → le detecteur de derive est replanifie (la banniere « ⚠ Le plan a change » arrive seule)');
  t.TA('B1','dechet');
  ok(!t.els.act_dechet_B1.classList.contains('btn-red')&&t.n.drift===2,'🗑 Dechet DECOCHE → replanifie aussi (le reste redevient couvert : la banniere doit pouvoir disparaitre)');
  t.TA('B1','chutes');
  ok(t.n.drift===3,'✂ Chutes → meme chemin (et depuis L554 le detecteur deduit aussi les Chutes chiffrees, comme le recalcul)');
}
{ const t=runToggle(true);
  t.TA('B1','dechet');
  ok(t.n.drift===0&&t.n.cumuls===0,'restauration en masse (miroir partage / brouillon) → aucun recompte ni detecteur par ligne (garde _bulkRestore conservee)');
}

console.log('── 2. chiffrage de la NC (updateNC) ──');
function runNC(bulk){
  const cb=()=>({checked:false});
  const els={};
  els['nc_ras_B1']=new El({_input:cb()});
  ['larg','qty','casse','ang','hum'].forEach(k=>{ els['nc_'+k+'_B1']=new El({_input:cb()}); });
  els['badge_B1']=new El(); els['nc_detail_B1']=new El();
  els['nc_qty_val_B1']=new El({value:'4'}); els['nc_w_val_B1']=new El({value:'20'});
  els['B1']=new El({className:'fiche-line coupee'});
  const {ctx,n}=mkCtx(els,bulk);
  const UN=withCtx(fnOf('updateNC'),ctx);
  return {UN:UN,els:els,n:n};
}
{ const t=runNC(false);
  t.els['nc_qty_B1']._input.checked=true;
  t.UN('B1');
  ok(t.els.badge_B1.textContent==='⚠ NC','le badge de la bobine passe a « ⚠ NC » (comportement inchange)');
  ok(t.n.cumuls===1&&t.n.repub===1,'cumuls recomptes et qualite republiee comme avant');
  ok(t.n.drift===1,'NC « Qte en trop » chiffree 4 × 20 (✂ Chutes automatique) → detecteur replanifie (depuis L554 il deduit aussi les Chutes chiffrees)');
}
{ const t=runNC(true);
  t.UN('B1');
  ok(t.n.drift===0&&t.n.cumuls===0,'restauration en masse → rien par ligne (meme garde que les cumuls)');
}

console.log('── 3. le detecteur compte bien le rebut comme NON livre (raison d etre du correctif) ──');
ok(/const _o54=_l426NcOut\(d\.actDechet,d\.actChutes,_l416NcByWidthFd\(d\)\); const _dl19=_o54\?_l419Delivered\(d\.conf,_o54,d\.origConf\|\|null\):null; if\(d\.actDechet&&!_dl19\) return;/.test(src),'_fichePlanDriftCheck : une bobine 🗑 Dechet ne compte pas comme production engagee (B54/L419), Dechet ou Chutes chiffres deduits (L426) — c est ce qui cree le « manque »');
ok(/msgs\.push\('manque '\+lack\.join\(' \+ '\)\+' mm dans le reste'/.test(src)&&/une bobine retirée volontairement sera recréée/.test(src),'le message « manque N×laize mm dans le reste » existe toujours et avertit qu une bobine retiree volontairement sera recreee (L375→L554)');
ok(/function _scheduleDriftCheck\(\)\{[^]*?_fichePlanDriftCheck\(\);/.test(src),'_scheduleDriftCheck ne fait qu APPELER le detecteur (debounce 300 ms) : aucun recalcul destructif');

console.log(fail?('\n💥 '+fail+'/'+total+' ECHEC(S) L554'):'\n🏆 L554 OK ('+total+' verifications)');
process.exit(fail?1:0);
