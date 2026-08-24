# Comptes, sécurité et exploitation

Ce que le logiciel utilise en coulisses, et ce qu'il faut savoir en gérer.

---

## Le socle : Firebase

Le logiciel s'appuie sur **Firebase**, un service de Google, projet `plan-de-decoupe`.

**Situation administrative — vérifiée en août 2026 :**

| | |
|---|---|
| Propriétaire du projet | **Compte STEP International** |
| Formule | **Payante, au nom de l'entreprise** |
| Accès à la console | **Esteban et Christian Rozier**, y compris après le départ d'Esteban |

✅ **Rien à transférer, rien d'urgent de ce côté.** C'est le bon montage : le projet
appartient à l'entreprise, il est payé par elle, et deux personnes y ont accès —
il n'y a pas de point de défaillance unique.

Firebase fournit quatre choses :

| Service | Rôle |
|---|---|
| **Authentication** | Les comptes et mots de passe |
| **Firestore** | La base de données (fiches, plans, stock, temps…) |
| **Storage** | Les photos d'étiquettes et les captures d'écran des signalements |
| **App Check** | Empêche toute application autre que la vôtre d'interroger la base |

---

## Les couches de sécurité en place

1. **Authentification obligatoire** — email + mot de passe, aucun accès anonyme.
2. **Liste blanche d'identifiants** — un compte créé dans Firebase mais absent de
   la liste autorisée est déconnecté automatiquement.
3. **Règles de sécurité serveur** — chaque type de donnée a ses droits précis.
   Exemples : le journal d'**audit** ne peut être ni modifié ni supprimé ; les
   **mouvements de stock** ne peuvent pas être effacés (on écrit un mouvement
   inverse) ; les fiches ne peuvent pas être créées déjà validées.
4. **App Check** — une requête venant d'ailleurs que de l'application est rejetée.
5. **Contrôles de taille** sur les champs texte, contre les envois aberrants.
6. **Publication restreinte** (depuis le 24/08/2026) — le site public ne diffuse que
   les 3 fichiers du logiciel. Les règles de sécurité, le code serveur et les
   documents internes ne sont plus accessibles depuis Internet.

---

## La bulle 💬 et son assistant

En bas de l'écran, une bulle permet à l'opérateur de **signaler un problème**.
Elle fait deux choses :

1. **Elle envoie un mail** aux destinataires configurés, avec les captures d'écran
   du plan et de la fiche. C'est le canal principal, et il fonctionne toujours.
2. **Elle ouvre une discussion d'aide** avec une IA, qui lit le contexte de l'écran
   et guide l'opérateur (elle explique quels boutons utiliser — **elle ne modifie
   jamais rien** et ne contourne jamais une règle qualité).

### Ce qui fait vivre cette IA

La partie discussion passe par un petit programme hébergé chez Firebase
(`assistReply`), qui interroge Claude. Pour cela il utilise une **clé d'accès**
au service Anthropic, rangée dans les secrets Firebase sous le nom
`ANTHROPIC_API_KEY`. Elle n'apparaît nulle part dans le code — c'est vérifié.

**À savoir :** cette clé est rattachée à un compte Anthropic qui est facturé à
l'usage. Si ce compte est fermé, arrive à court de crédit, ou si la clé est
révoquée, **seule la partie discussion s'arrête**. Les mails de signalement,
eux, continuent de partir normalement. Ce n'est donc jamais bloquant pour l'atelier.

✅ **Vérifié en août 2026 : la clé est rattachée au compte Anthropic de
l'entreprise.** Rien à transférer, rien à surveiller côté propriété.

- [ ] Seul point restant : un interrupteur permet de désactiver l'IA sans toucher
      au code (document `config/assistant` dans Firestore). Qui sait s'en servir ?

---

## Ajouter ou retirer une personne

C'est l'opération la plus délicate du logiciel, et elle demande **deux étapes**.

**Étape 1 — créer le compte** dans la console Firebase
(Authentication → Users → Add user). Cela génère un identifiant unique, appelé **UID**.

**Étape 2 — autoriser cet UID** dans le fichier `firestore.rules`, puis **publier
les règles depuis la console Firebase**.

Sans l'étape 2, la personne pourra se connecter mais sera immédiatement déconnectée.

👉 Ces deux étapes passent par la console Firebase, donc par **Esteban ou Christian**.
C'est une opération à demander, pas à faire soi-même.

---

## Les comptes existants

Six comptes nominatifs (2 administrateurs, 1 pilote, 3 opérateurs) et
**3 comptes machine partagés** — un par tablette : `feba@`, `maveg@`,
`cevenini@step-international.com`.

> 🔒 La liste détaillée des emails et des identifiants UID se trouve dans
> `claude index\firestore.rules` et dans `data\Code.docx`.
> **Ne pas recopier ces identifiants dans un document qui circule.**

---

## 🔴 Sauvegarde des données : pourquoi c'est nécessaire

**Question légitime : Firebase est un service Google, il ne va pas perdre les données.
Alors pourquoi sauvegarder ?**

Parce qu'une sauvegarde ne protège pas contre une panne de Google — elle protège
contre **nous-mêmes**. Google garantit que la base ne disparaîtra pas ; il ne
garantit pas que son contenu sera correct.

Trois scénarios réels, aucun improbable :

**1. Une suppression en masse.** Un administrateur ou un pilote a le droit de
supprimer des fiches. Un clic de trop, un filtre mal réglé, et des dizaines
d'enregistrements partent. Google exécutera l'ordre sans broncher.

**2. Une publication de règles ratée.** Les règles de sécurité s'écrivent à la main
et se publient depuis la console. Une erreur ouvre temporairement des droits
d'écriture ou d'effacement plus larges que prévu.

**3. Une modification du logiciel qui écrit de travers.** Un lot mal testé qui
écrase un champ sur toutes les fiches d'un client. Le logiciel fait ce qu'on lui
a dit de faire — mais on lui a mal dit.

Dans les trois cas, **sans sauvegarde, c'est définitif**. Firestore ne propose pas
de corbeille globale : la corbeille du logiciel ne couvre que ce que le logiciel
a lui-même marqué comme supprimé.

### Ce que ça met en jeu

Les fiches de découpe sont des **enregistrements qualité ISO 9001**. Elles
prouvent, pour chaque commande livrée, quelle bobine mère a été utilisée, avec
quelle lame, sur quelle machine, avec quels contrôles effectués et quelles
non-conformités relevées.

Perdre cette base, ce n'est pas perdre un outil — c'est perdre la **preuve** de la
traçabilité, y compris sur les mois déjà écoulés. C'est exactement ce qu'un
auditeur qualité demande à voir.

### Ce qu'il y a à faire

👉 **La marche à suivre complète est dans le document 05 —
`05-SAUVEGARDE-DES-DONNEES.md`.** Environ 20 minutes, une seule fois,
et il faut un accès à la console Firebase (Esteban ou Christian).

> C'est le point le plus important à traiter après la passation.
