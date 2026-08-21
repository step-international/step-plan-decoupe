// [L380] Assistant IA de la bulle 💬 — Cloud Function Firebase (2e gén.)
// Déclenchée à chaque écriture d'un doc `assist/{id}` dont status === "pending" et dont le
// dernier message vient de l'opérateur : appelle Claude avec le contexte scanné par l'app
// (plan, fiche, erreurs) et écrit la réponse dans le doc. L'app l'affiche en direct (onSnapshot).
// La clé API vit dans un secret Firebase (jamais dans l'app) : voir GUIDE-ASSISTANT-IA-console.md.
"use strict";

const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { defineSecret } = require("firebase-functions/params");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const Anthropic = require("@anthropic-ai/sdk");

initializeApp();
const ANTHROPIC_API_KEY = defineSecret("ANTHROPIC_API_KEY");

// Connaissance de l'app pour guider SANS inventer : boutons réels, règles réelles, limites réelles.
const SYSTEM = `Tu es l'assistant intégré de l'application « Plan de découpe » de STEP International
(atelier ISO 9001 de découpe de bobines de films adhésifs ; 3 machines : FEBA, MAVEG, CEVENINI ;
3 tablettes iPad, une par machine, comptes « Poste FEBA/MAVEG/CEVENINI »). Tu parles à un OPÉRATEUR
ganté, pressé, sur tablette. Tu reçois : son message, et un CONTEXTE scanné automatiquement
(page active, plan, fiche, erreurs). Réponds en FRANÇAIS, en 1 à 4 phrases courtes, tutoiement,
sans jargon. Donne le geste EXACT avec le nom EXACT du bouton. N'invente jamais un bouton ou un menu.

L'app : page PLAN (saisie : client, référence, n° commande, laizes = quantité×largeur, bobine mère,
bords, bouton COMMENCER À COUPER, ⚙ OUTILS au-dessus de chaque référence, ✂ BOBINEAUX EN STOCK,
♻ CHUTE) → page FICHE DE DÉCOUPE (chrono à gauche avec ▶ DÉMARRER/PAUSE/RESET — le 1er ✂ démarre
le chrono tout seul ; en multi-référence il faut d'abord VALIDER LA BOBINE MÈRE de chaque référence
— gros bouton bleu — sinon le ✂ refuse ; chaque bobine = 1 tap sur « ✂ COUPÉE — TEST OK » ;
⚠ DÉFAUT ouvre les motifs de non-conformité (Angle, Casse, Larg., Qté) + action CHUTES ou DÉCHET ;
✎ MODIFIER permet de corriger une config puis devient ♻ RECALCULER — obligatoire avant de couper ;
si une bannière ROUGE « Le plan a changé » est affichée, LE SEUL bouton à utiliser est son gros
bouton « Appliquer le changement de plan » ; VOIR LES COUPÉES, ⚙ OUTILS, 🔧 CHANGEMENTS
(lame·machine·2ᵉ opérateur), ÉTIQUETTE SOLDE en bas du rail ; barre du bas : 📷, 🖨 IMPRIMER,
✓ CONFIRMER LA COMMANDE avec RESTE n) → page DONNÉES (Fiches, Planning, Plans, Brouillons — les
brouillons sont colorés par machine, reprendre celui d'une autre tablette = passation).

Règles à respecter dans tes conseils :
- Si une laize dépasse la largeur utile, la fiche ne se génère pas : corriger le plan (largeurs ou mère).
- Retirer une bobine (✕) est toujours temporaire : tout recalcul la re-crée depuis la commande.
- Jamais suggérer de contourner une confirmation, une validation de bobine mère ou une règle qualité (ISO).
- « Missing or insufficient permissions » = problème de droits du compte : dire de prévenir Esteban (l'admin), rien à faire côté opérateur.
- Si le problème ressemble à un BUG du logiciel (affichage cassé, calcul faux, bouton mort) : dis-le
  simplement, indique un contournement s'il en existe un, et précise que l'équipe est déjà prévenue
  par mail automatique. Ne promets pas de correctif.
- Si tu n'es pas sûr, dis-le et propose le geste le plus sûr (rien d'irréversible).`;

exports.assistReply = onDocumentWritten(
  {
    document: "assist/{id}",
    region: "europe-west1",
    secrets: [ANTHROPIC_API_KEY],
    timeoutSeconds: 120,
    memory: "256MiB",
    maxInstances: 3,
  },
  async (event) => {
    const after = event.data && event.data.after;
    if (!after || !after.exists) return;
    const data = after.data() || {};
    if (data.status !== "pending") return;
    const msgs = Array.isArray(data.messages) ? data.messages : [];
    if (!msgs.length || msgs[msgs.length - 1].role !== "operator") return;
    if (msgs.length > 24) {
      await after.ref.set({ status: "closed" }, { merge: true });
      return;
    }

    // [L381 · fix audit n°3] l'interrupteur config/assistant est appliqué ICI, côté serveur :
    // enabled !== true → aucun appel API, quel que soit l'état des tablettes. Coupe aussi tout abus.
    const db = getFirestore();
    const cfg = await db.doc("config/assistant").get();
    if (!cfg.exists || cfg.data().enabled !== true) return;
    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY.value(), timeout: 90_000, maxRetries: 0 }); // [L381 · n°7 + L383 · audit fusion] 90 s SANS retry SDK (défaut = 2 retries → 90×3 > 120 s : la plateforme tuait la fonction AVANT le catch, doc bloqué « pending » à vie) : le repli d'erreur s'exécute toujours

    // [L381 · fix audit n°1] le CONTEXTE est un tour user SÉPARÉ, toujours en tête : le fil peut
    // commencer par un tour assistant (historique long) et l'API exige un 1er tour user — la fusion
    // des rôles consécutifs absorbe le reste.
    const ctxText =
      "CONTEXTE SCANNÉ (état de l'app au moment du signalement) :\n" +
      String(data.context || "(indisponible)").slice(0, 6000) +
      "\n\nTYPE : " + (data.kind || "bug") +
      "\nPOSTE : " + (data.poste || "?") + " · OPÉRATEUR : " + (data.ini || "?");
    // [L388] captures d'écran (URLs Storage publiques à jeton) → Claude VOIT l'écran Plan / Fiche de l'opérateur.
    const shotBlocks = [];
    const shots = data.shots || {};
    [["plan", "ÉCRAN PLAN"], ["fiche", "ÉCRAN FICHE DE DÉCOUPE"]].forEach(([k, lbl]) => {
      const u = shots[k];
      if (typeof u === "string" && /^https:\/\/firebasestorage\.googleapis\.com\//.test(u)) {
        shotBlocks.push({ type: "text", text: lbl + " (capture au moment du signalement) :" });
        shotBlocks.push({ type: "image", source: { type: "url", url: u } });
      }
    });
    const apiMessages = [
      { role: "user", content: shotBlocks.length ? [...shotBlocks, { type: "text", text: ctxText }] : ctxText },
    ];
    // [L388] la fusion des rôles consécutifs gère AUSSI un content en tableau (le tour de tête avec images)
    const appendTo = (m, text) => {
      if (Array.isArray(m.content)) m.content.push({ type: "text", text });
      else m.content += "\n" + text;
    };
    msgs.forEach((m) => {
      const role = m.role === "assistant" ? "assistant" : "user";
      const text = String(m.text || "").slice(0, 2000);
      const last = apiMessages[apiMessages.length - 1];
      if (last && last.role === role) appendTo(last, text);
      else apiMessages.push({ role, content: text });
    });

    let replyText;
    try {
      const response = await client.messages.create({
        model: "claude-opus-5",
        max_tokens: 3000, // [L381 · n°8] thinking adaptatif compris dans le budget sur claude-opus-5
        system: SYSTEM,
        messages: apiMessages,
      });
      if (response.stop_reason === "refusal") {
        replyText =
          "Je ne peux pas t'aider sur ce point précis — l'équipe a reçu ton signalement par mail et te répondra.";
      } else {
        replyText = response.content
          .filter((b) => b.type === "text")
          .map((b) => b.text)
          .join("\n")
          .trim();
        if (!replyText) replyText = "…(réponse vide — l'équipe est prévenue par mail.)";
        if (response.stop_reason === "max_tokens") replyText += "\n…(réponse tronquée)"; // [L381 · n°8]
      }
    } catch (e) {
      console.error("assistReply:", (e && e.message) || e);
      await after.ref.set(
        {
          status: "error",
          messages: FieldValue.arrayUnion({
            role: "assistant",
            text:
              "⚠ L'assistant est momentanément indisponible — ton signalement est bien parti par mail à l'équipe.",
            at: new Date().toISOString(),
          }),
        },
        { merge: true }
      );
      return;
    }

    await after.ref.set(
      {
        status: "answered",
        answeredAt: new Date().toISOString(),
        messages: FieldValue.arrayUnion({
          role: "assistant",
          text: replyText.slice(0, 4000),
          at: new Date().toISOString(),
        }),
      },
      { merge: true }
    );
  }
);
