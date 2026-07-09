// ============================================================
// STEP Plan de Découpe — Service Worker « GEL DE VERSION » [L89]
// ------------------------------------------------------------
// Rôle UNIQUE : épingler la version de l'app en cours d'utilisation.
// - index.html est servi depuis le cache : une mise à jour déployée sur
//   GitHub Pages ne remplace JAMAIS l'app en cours — même si l'opérateur
//   ferme et rouvre la PWA en pleine découpe (incident Prima/Deceuninck
//   09/07/2026 : déploiement subi en plein milieu de commande).
// - La page détecte elle-même la nouvelle version (fetch no-store, laissé
//   passer ci-dessous) et affiche la bannière « Recharger / ✕ Plus tard ».
// - « Recharger » → message REFRESH_INDEX → on remplace le cache par la
//   version fraîche → INDEX_REFRESHED → la page se recharge dessus.
// Ce fichier n'a PAS besoin d'être modifié à chaque déploiement.
// ============================================================
const CACHE='step-pin-v1';

self.addEventListener('install',function(e){
  e.waitUntil(
    caches.open(CACHE).then(async function(c){
      // On n'épingle que si rien n'est encore épinglé (1re installation) :
      // jamais d'écrasement silencieux d'une version en cours d'utilisation.
      const cur=await c.match('index.html');
      if(!cur){ try{ await c.add(new Request('index.html',{cache:'no-store'})); }catch(err){} }
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate',function(e){
  e.waitUntil(self.clients.claim());
});

self.addEventListener('message',function(e){
  if(e.data&&e.data.type==='REFRESH_INDEX'){
    e.waitUntil(
      caches.open(CACHE).then(function(c){
        return fetch(new Request('index.html',{cache:'no-store'})).then(function(r){
          if(r&&r.ok) return c.put('index.html',r);
        });
      }).then(function(){
        if(e.source) e.source.postMessage({type:'INDEX_REFRESHED'});
      }).catch(function(){
        if(e.source) e.source.postMessage({type:'INDEX_REFRESHED'});   // repli : la page recharge (réseau direct)
      })
    );
  }
});

self.addEventListener('fetch',function(e){
  const req=e.request;
  const url=new URL(req.url);
  if(req.cache==='no-store'||url.searchParams.has('vchk')) return;   // vérification de version : NE PAS intercepter (double marqueur — request.cache absent sur vieux iOS)
  const isIndex=req.mode==='navigate'||(url.origin===self.location.origin&&/\/(index\.html)?$/.test(url.pathname));
  if(!isIndex) return;                                      // Firebase/gstatic/photos : réseau normal
  e.respondWith(
    caches.open(CACHE).then(function(c){ return c.match('index.html'); })
      .then(function(r){ return r||fetch(req); })
  );
});
