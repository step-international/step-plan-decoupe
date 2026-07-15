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

// [L144 · audit #18 · choix Esteban] SDK Firebase ÉPINGLÉ (URLs versionnées 10.12.2 = immuables). Sans eux,
// un démarrage à FROID hors-ligne échoue (`firebase` undefined → écran « Hors-ligne, recharge ») malgré la
// persistance Firestore offline. On les précache dans le MÊME cache que index.html (best-effort : un échec
// réseau ne bloque pas l'install ; réessayé à l'activate ; complété à la demande par le fetch cache-first).
const FIREBASE_URLS=[
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-storage-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-check-compat.js'
];
function _isFirebaseSdk(url){ return url.origin==='https://www.gstatic.com' && url.pathname.indexOf('/firebasejs/')===0; }
// cross-origin → réponse OPAQUE : cache.add() la rejetterait (ok=false), donc fetch no-cors + put.
async function _precacheFirebase(c){
  for(var i=0;i<FIREBASE_URLS.length;i++){ var u=FIREBASE_URLS[i];
    try{ if(!(await c.match(u))){ var r=await fetch(u,{mode:'no-cors'}); if(r) await c.put(u,r); } }catch(err){}
  }
}
// [L149 · revue #14] purge les SDK Firebase d'une ANCIENNE version (URLs versionnées) : sans ça, chaque bump
// accumulerait ~2 Mo de scripts orphelins → cache gonflé → risque accru d'éviction iOS de l'index.html ÉPINGLÉ
// (fragilise le gel de version). On garde index.html + les FIREBASE_URLS courants ; on supprime le reste /firebasejs/.
async function _purgeOldFirebase(c){
  try{ var keys=await c.keys();
    for(var i=0;i<keys.length;i++){ var u=(keys[i]&&keys[i].url)||'';
      if(u.indexOf('/firebasejs/')>=0 && FIREBASE_URLS.indexOf(u)<0){ try{ await c.delete(keys[i]); }catch(err){} }
    }
  }catch(err){}
}

self.addEventListener('install',function(e){
  e.waitUntil(
    caches.open(CACHE).then(async function(c){
      // On n'épingle que si rien n'est encore épinglé (1re installation) :
      // jamais d'écrasement silencieux d'une version en cours d'utilisation.
      const cur=await c.match('index.html');
      if(!cur){ try{ await c.add(new Request('index.html',{cache:'no-store'})); }catch(err){} }
      await _precacheFirebase(c);   // [L144] scripts Firebase pour le cold start hors-ligne
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate',function(e){
  e.waitUntil(Promise.all([
    self.clients.claim(),
    // [L94 · vérif #1] RÉPARATION : si le cache est vide (install pendant panne réseau,
    // éviction iOS sous pression de stockage), on ré-épingle — sinon le gel mourait en
    // silence et la mise à jour subie redevenait possible (incident Prima/Deceuninck).
    caches.open(CACHE).then(async function(c){
      var cur=await c.match('index.html');
      if(!cur){ try{ await c.add(new Request('index.html',{cache:'no-store'})); }catch(err){} }
      await _precacheFirebase(c);   // [L144] réessai du précache Firebase (réparation)
      // [L149 · revue L148 #5] NE PAS purger les anciens SDK à l'activate : l'index.html GELÉ (encore en version
      // précédente) peut ENCORE les référencer → purger casserait son cold start. La purge se fait à REFRESH_INDEX
      // (l'app passe alors à la version fraîche, dont les SDK courants sont précachés → les anciens sont sûrs).
    })
  ]));
});

self.addEventListener('message',function(e){
  if(e.data&&e.data.type==='REFRESH_INDEX'){
    e.waitUntil(
      caches.open(CACHE).then(function(c){
        return fetch(new Request('index.html',{cache:'no-store'})).then(function(r){
          if(r&&r.ok) return c.put('index.html',r).then(function(){
            // [L149 · revue L148 #5] l'index passe à la version fraîche → précacher ses SDK courants PUIS purger
            // les anciens (plus aucun index gelé n'en dépend). Ordre important : précache avant purge.
            return _precacheFirebase(c).then(function(){ return _purgeOldFirebase(c); });
          });
        });
      }).then(function(){
        if(e.source) e.source.postMessage({type:'INDEX_REFRESHED'});
      }).catch(function(){
        if(e.source) e.source.postMessage({type:'INDEX_REFRESH_FAILED'});   // [L96 · vérif #9] échec réseau EXPLICITE : la page prévient au lieu de recharger l'ancienne version en silence
      })
    );
  }
  // [L149 · revue L148 #3] AUTO-GUÉRISON : l'app détecte `firebase` indéfini EN LIGNE (cache Firebase empoisonné
  // — portail captif au 1er précache) → elle demande la purge des SDK pour re-télécharger propre au reload.
  else if(e.data&&e.data.type==='PURGE_FIREBASE'){
    e.waitUntil(caches.open(CACHE).then(function(c){ return c.keys().then(function(keys){
      return Promise.all(keys.map(function(k){ return (k&&k.url&&k.url.indexOf('/firebasejs/')>=0)?c.delete(k):null; }));
    }); }).then(function(){ if(e.source) e.source.postMessage({type:'FIREBASE_PURGED'}); }).catch(function(){}));
  }
});

self.addEventListener('fetch',function(e){
  const req=e.request;
  const url=new URL(req.url);
  if(req.cache==='no-store'||url.searchParams.has('vchk')) return;   // vérification de version : NE PAS intercepter (double marqueur — request.cache absent sur vieux iOS)
  // [L144 · audit #18] scripts Firebase (versionnés = IMMUABLES) : CACHE-FIRST → un cold start hors-ligne aboutit
  // au login/aux données offline. [L149 · revue L148 #3] cache-first (pas network-first) : ces URLs ne changent
  // JAMAIS pour une version donnée → aucune staleness possible, et network-first casserait chaque cold start EN
  // LIGNE sur une coupure transitoire (corps tronqué / 5xx opaque) alors qu'une copie SAINE dort en cache.
  // Le risque « cache empoisonné » (portail captif au 1er précache) est traité par l'AUTO-GUÉRISON côté app
  // (si `firebase` indéfini EN LIGNE → message PURGE_FIREBASE + reload). [#4] on clone AVANT la frontière async.
  if(_isFirebaseSdk(url)){
    e.respondWith(
      caches.open(CACHE).then(function(c){
        return c.match(url.href).then(function(r){
          if(r) return r;
          return fetch(req).then(function(nr){ if(nr){ var copy=nr.clone(); try{ c.put(url.href,copy); }catch(err){} } return nr; });
        });
      }).catch(function(){ return fetch(req); })
    );
    return;
  }
  const isIndex=req.mode==='navigate'||(url.origin===self.location.origin&&/\/(index\.html)?$/.test(url.pathname));
  if(!isIndex) return;                                      // autres gstatic/photos : réseau normal
  e.respondWith(
    caches.open(CACHE).then(function(c){
      return c.match('index.html').then(function(r){
        if(r) return r;
        // [L94 · vérif #1] cache vide → on sert le réseau ET on ré-épingle au passage
        return fetch(req).then(function(nr){
          if(nr&&nr.ok){ try{ c.put('index.html',nr.clone()).catch(function(){}); }catch(err){} }
          return nr;
        });
      });
    })
  );
});
