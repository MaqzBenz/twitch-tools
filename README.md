# 🛠️ Twitch Tools

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?logo=github&style=flat-square)](https://pages.github.com/)
[![Tech Stack](https://img.shields.io/badge/Tech-Vanilla%20JS%20%7C%20SVG%20%7C%20Canvas-F7DF1E?logo=javascript&logoColor=black&style=flat-square)](#-stack-technique)
[![Serverless](https://img.shields.io/badge/Architecture-100%25%20Serverless-success?style=flat-square)](#)
[![Twitch API](https://img.shields.io/badge/Twitch%20API-Helix%20Compatible-9146FF?logo=twitch&logoColor=white&style=flat-square)](https://dev.twitch.tv/docs/api/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Une suite d'outils gratuits, modernes, open-source et **100% serverless** (fonctionnant intégralement dans le navigateur) conçue pour accompagner les streameurs et créateurs de contenu Twitch au quotidien.

Aucun compte à créer, aucun serveur en arrière-plan, aucune donnée envoyée à un tiers : tout s'exécute localement dans votre navigateur.

---

## 🧭 Sommaire

- [Les Outils](#-les-outils)
  - [1. Créateur de Mascotte, Emotes & Profil](#-1-créateur-de-mascotte-emotes--photo-de-profil-mascot)
  - [2. Générateur de Planning HD](#-2-générateur-de-planning-hd-schedule)
- [Architecture & Structure du Projet](#-structure-du-projet)
- [Prise en Main & Déploiement](#-prise-en-main--déploiement)
- [Configuration de l'API Twitch (Planning)](#-configuration-de-lapi-twitch)
- [Comment Contribuer](#-contribuer-au-projet)
- [Stack Technique](#-stack-technique)
- [Licence](#-licence)

---

## 🧰 Les Outils

### 🎨 1. Créateur de Mascotte, Emotes & Photo de Profil (`/mascot`)

Un studio complet de création de mascottes vectorielles en calques SVG, pensé pour concevoir facilement son identité visuelle, ses emotes Twitch ou son avatar de chaîne.

- **Morphologie & Personnalisation complète** :
  - **12 formes de têtes** : ronde, large, allongée, carrée, poire, cœur, patate, chat, ours, lapin, robot, alien.
  - **Couleurs de peau libres** : teintes naturelles ou couleurs fantaisie (vert alien, violet cyberpunk, rose bonbon, bleu cyan, etc.) + sélecteur hexadécimal libre.
  - **19 coiffures** : rasé, court, hérissé, mohawk, cheveux longs, carré, queue de cheval, couettes, macarons, afro, bouclé, frange côté, ébouriffé, banane, chignon, tresse, mulet, mèche emo.
  - **10 designs d'yeux** : ronds, ovales, points, grands yeux, cils, regard félin, fatigué, perles, manga animé, pixels.
  - **18 chapeaux & coiffes** : casquette, casquette de côté, bonnet, haut-de-forme, chapeau de cowboy, couronne royale, chapeau de fête, chapeau de sorcier, casque gamer avec micro, oreilles de chat, oreilles de lapin, bonnet de Noël, toque de chef, bandana pirate, casque viking, auréole d'ange, cornes de démon, casquette à hélice, couronne de fleurs.
  - **13 lunettes** : rondes, rectangulaires, solaires, *Deal with it*, aviateur doré, cœurs, étoiles, lunettes 3D bicolores, monocle dandy, cache-œil pirate, casque VR futuriste, lunettes steampunk, binoclard.
  - **17 accessoires & détails** : moustache, barbe complète, bouc, nœud papillon, écharpe d'hiver, chaîne en or bling-bling, taches de rousseur, masque de protection, pansement, cicatrice de combat, crocs de vampire, sucette, moustaches de chat, nez de clown, joues rouges, boucles d'oreilles, casque audio autour du cou.
  - **15 t-shirts & tenues** : t-shirt col rond classique, col en V, hoodie streetwear, marinière rayée, polo avec boutons, chemise hawaïenne estivale, maillot de sport floqué n°7, costume-cravate chic, col roulé, t-shirt floqué "GG", t-shirt cœur, salopette denim, pull torsadé en laine, débardeur fitness, motif pixel art creeper.

- **19 Expressions Faciales Dynamiques** :
  Changez l'expression de votre mascotte en un clic : *Content, Joyeux, Triste, Pleure (torrents de larmes), Amoureux (yeux en cœur), Cri de terreur, Excité (étoiles dans les yeux), En colère (vapeur), Surpris, Clin d'œil taquin, Dodo (Zzz), Cool, Bof, Bisou, MDR (larmes de rire), KO (yeux en croix), Réfléchit (point d'interrogation), Gêné (goutte de sueur), Miaou*.

- **10 Poses de Corps** :
  *Neutre, Salut amical, Victoire (bras en l'air), Cœur avec les mains, Facepalm, Pouce vers le haut, Bras croisés, Haussement d'épaules (shrug), Main au menton, Signe Peace (V)*.

- **6 Styles de Rendu Graphique** :
  1. 🖍️ **Cartoon** : contours épais noirs, ombrages doux.
  2. ✨ **Animé** : traits fins teintés, reflets dans les yeux et ombrage cel-shading.
  3. 🟣 **Flat** : style minimaliste moderne sans aucun contour.
  4. 🏷️ **Sticker** : halo blanc découpé et ombre portée façon autocollant.
  5. 🍬 **Bonbon 3D** : dégradés radiaux brillants et effets de volume.
  6. 👾 **Pixel Art** : rendu basse résolution stylisé rétro.

- **Animation d'Idle en Direct** :
  Visualisation dynamique avec clignement des yeux et léger balancement respiratoire.

- **Formats d'Export Prêts pour Twitch** :
  - **Emotes Twitch** : export direct aux trois tailles officielles Twitch : **112×112 px**, **56×56 px** et **28×28 px** (fond transparent).
  - **ZIP Twitch 1-Clic** : archive ZIP générée localement contenant les trois tailles prêtes à être téléversées sur le tableau de bord des créateurs Twitch.
  - **Export groupé de toutes les expressions** : archive ZIP de l'intégralité des 19 expressions dans les 3 formats.
  - **Planche d'emotes** : image récapitulative haute définition de l'ensemble des expressions.
  - **Photo de profil (Avatar)** : export carré, rond ou aux coins arrondis, avec fond transparent, dégradé ou couleur unie, en résolutions 256, 512 ou 800 px.
  - **Copie presse-papier** : copiez l'image PNG générée d'un clic pour la coller immédiatement sur Discord ou Slack.
  - **Code SVG vectoriel source**.
  - **Partage instantané par lien** : encode la mascotte directement dans le hash de l'URL pour la partager à un ami sans base de données.
  - **Gestion de collection locale** : sauvegardez vos mascottes favorites ou exportez-les en fichier `.mascot.json`.

---

### 📅 2. Générateur de Planning HD (`/schedule`)

Créez des visuels de planning hebdomadaire haute résolution prêts pour les réseaux sociaux et vos bannières Twitch.

- **Synchronisation Twitch API (Helix)** :
  - Connexion sécurisée en 1 clic via le flux *Implicit Grant*.
  - Récupération automatique des streams programmés, horaires et jaquettes officielles des jeux.
  - Saisie du Client ID directement depuis l'interface (stocké localement).
- **Éditeur Manuel Avancé** :
  - Multi-streams par jour, horaires de début et fin personnalisables.
  - Base de données locale intégrée de plus de 50 jeux populaires avec jaquettes officielles instantanées.
  - Téléversement d'images de jaquette personnalisées par stream (stockage Base64 local).
- **9 Styles Visuels Développés** :
  *Classique (Glassmorphism), Minimaliste, Néon (Gaming Glow), Polaroid, Retro Arcade (CRT Scanlines), Pastel Aesthetic, Newspaper Zine, Lo-Fi Chill (grain argentique), Cosmic Space*.
- **5 Dispositions de Jaquette** : vignette normale, plein écran immersif en arrière-plan, grande bannière supérieure, grande jaquette XXL ou masquage pur.
- **Multi-Formats d'Export** :
  - **Paysage 16:9** (1920×1080 px) : idéal pour Twitter/X, Discord, écrans de stream.
  - **Portrait 9:16** (1080×1920 px) : optimisé pour Stories Instagram, TikTok, Shorts.
  - **Format Carré "Tonight" 1:1** (1080×1080 px) : centré sur le prochain live du jour.
  - Exports en PNG HD, JPEG ou WebP, avec copie directe dans le presse-papier.
- **Réseaux Sociaux** : intégration jusqu'à 5 réseaux avec logos officiels vectoriels.

---

## 📁 Structure du Projet

```
twitch-tools/
├── index.html                   # Portail d'accueil & Hub centralisé
├── home.css                     # Feuille de styles du hub (hero, grille, animations)
├── shared/
│   └── site.css                 # Charte graphique partagée, tokens, barre de navigation
├── mascot/                      # Créateur de Mascotte, Emotes & Profil
│   ├── index.html               # Interface utilisateur du studio
│   ├── mascot.css               # Mise en page du studio & composants d'options
│   ├── engine.js                # Moteur modulaire SVG à calques & pipeline de rendu
│   └── app.js                   # Gestion d'état, interactions UI, exports PNG/ZIP/JSON
├── schedule/                    # Générateur de Planning de Stream
│   ├── index.html               # Interface utilisateur du générateur
│   ├── style.css                # Styles de la sidebar, des modales & de la prévisualisation
│   └── app.js                   # Moteur Canvas 2D, synchro Helix Twitch, import/export
└── README.md                    # Documentation complète
```

---

## 🚀 Prise en Main & Déploiement

Le projet est **100% statique**. Vous pouvez l'héberger sans aucun frais sur **GitHub Pages**, **Cloudflare Pages**, **Netlify**, **Vercel** ou l'exécuter localement.

### Option 1 : Utilisation locale
1. Clonez ce dépôt :
   ```bash
   git clone https://github.com/MaqzBenz/twitch-tools.git
   ```
2. Ouvrez le dossier dans votre éditeur ou lancez un serveur HTTP local léger :
   ```bash
   npx serve .
   # ou avec python :
   python -m http.server 8080
   ```
3. Rendez-vous sur `http://localhost:8080`.

---

### Option 2 : Déploiement sur GitHub Pages (Recommandé)
1. Poussez votre code sur votre dépôt GitHub.
2. Allez dans **Settings** > **Pages** de votre dépôt.
3. Sous **Branch**, sélectionnez la branche `main` et le dossier `/ (root)`, puis cliquez sur **Save**.
4. Votre site est immédiatement disponible à l'adresse :
   ```
   https://<votre-pseudo>.github.io/twitch-tools/
   ```

---

## ⚙️ Configuration de l'API Twitch

Pour le générateur de planning, vous pouvez synchroniser automatiquement vos lives Twitch sans toucher au code :

1. Rendez-vous sur la [Twitch Developer Console](https://dev.twitch.tv/console/apps).
2. Cliquez sur **Register Your Application**.
3. Remplissez les champs :
   - **Name** : *Twitch Tools* (ou le nom de votre choix).
   - **OAuth Redirect URLs** : collez l'URL exacte où votre site est hébergé (le bouton de copie dans la fenêtre *Paramètres ⚙️* du planning vous donne l'URL exacte).
   - **Category** : *Website Integration*.
   - **Client Type** : *Public*.
4. Cliquez sur **Create**, copiez votre **Client ID** et collez-le dans la modale **Paramètres (⚙️)** du planning.
5. Cliquez sur **Enregistrer** : la synchronisation Twitch API est active !

---

## 🤝 Contribuer au Projet

Le projet est open-source et conçu pour être facilement étendu par la communauté !

### Ajouter de nouveaux accessoires ou pièces de mascotte
Chaque pièce du studio de mascotte est une fonction autonome dans [`mascot/engine.js`](mascot/engine.js) :
- `HEADS` : nouvelles formes de têtes.
- `HAIRS` : nouvelles coupes de cheveux.
- `HATS` : chapeaux, casques ou coiffes.
- `GLASSES` : lunettes ou visières.
- `ACCS` : barbes, bijoux, tatouages, cicatrices.
- `SHIRTS` : vêtements, t-shirts à motifs ou vestes.
- `EXPRS` / `POSES` : expressions faciales ou postures des bras.

Ouvrez une Pull Request pour proposer vos créations !

---

## 🛠️ Stack Technique

- **Langages** : HTML5 sémantique, CSS3 moderne (CSS custom properties, glassmorphism, flexbox/grid), JavaScript Vanilla moderne (ES2022+).
- **Graphisme & Rendu** : SVG vectoriel modulaire (mascotte), Canvas 2D haute définition (planning et export raster).
- **APIs Web exploitées** :
  - *Canvas 2D API* & *Offscreen Canvas*
  - *Clipboard API* (copie d'images directement dans le presse-papier)
  - *LocalStorage API* (persistance 100% locale sans cookies tiers)
  - *Fetch API* (Twitch Helix)
  - *FileReader API* / *Blob API* (génération d'archives ZIP en mémoire et export d'images sans serveur)
- **Ressources externes** :
  - [Google Fonts](https://fonts.google.com/) : *Outfit*, *Inter*, *Montserrat*, *Poppins*, *Bebas Neue*, *Oswald*, *Nunito*, *Playfair Display*, *Caveat*, *Press Start 2P*.
  - [FontAwesome 6](https://fontawesome.com/) : icônes vectorielles.
  - [Twitch Helix API](https://dev.twitch.tv/docs/api/) (flux Implicit Grant).

---

## 📄 Licence

Ce projet est distribué sous licence open-source **MIT**. Vous êtes libre de l'utiliser, de l'héberger et de le modifier pour vos propres streams ou votre communauté.
