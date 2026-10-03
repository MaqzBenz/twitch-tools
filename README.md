# 🛠️ Twitch Tools

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-blue?logo=github&style=flat-square)](https://pages.github.com/)
[![Tech Stack](https://img.shields.io/badge/Tech-Vanilla%20JS%20%7C%20SVG%20%7C%20Canvas-F7DF1E?logo=javascript&logoColor=black&style=flat-square)](#-technologies)
[![Serverless](https://img.shields.io/badge/Architecture-100%25%20Serverless-success?style=flat-square)](#)
[![Twitch API](https://img.shields.io/badge/Twitch%20API-Helix%20Compatible-9146FF?logo=twitch&logoColor=white&style=flat-square)](https://dev.twitch.tv/docs/api/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

Une boîte à outils complète, gratuite, moderne et **100% serverless** conçue pour les créateurs de contenu et streameurs Twitch :

1. **[Accueil & Hub](index.html)** : Portail centralisé des outils de la communauté.
2. **[Créateur de mascotte & emotes](mascot/index.html)** : Studio graphique modulaire SVG (12 têtes, 19 coiffures, 18 chapeaux, 13 lunettes, 17 accessoires, 15 t-shirts, 19 expressions, 10 poses, 6 styles visuels) avec export direct en emotes Twitch (112, 56, 28 px), pack ZIP ou photo de profil.
3. **[Générateur de planning HD](schedule/index.html)** : Générateur de plannings hebdomadaires avec synchro Twitch Helix, éditeur manuel, 9 styles et formats variés (16:9, 9:16, 1:1).

---

## 📸 Outils Disponibles

### 🎨 1. Créateur de Mascotte, Emotes & Profil (`/mascot`)
- **Moteur modulaire SVG à calques** : personnalisation infinie de la morphologie, peau (teintes naturelles, vertes, violettes, etc.), yeux, cheveux, tenues et accessoires.
- **Système d'expressions dynamiques** : Content, Joyeux, Triste, Pleure, Amoureux (yeux en cœur), Cri, Excité, En colère, Surpris, Clin d'œil, Bisou, etc.
- **Poses variées** : Neutre, Salut, Victoire, Cœur, Facepalm, Pouce en l'air, Bras croisés, etc.
- **6 Styles de rendu** : Cartoon, Animé, Flat, Sticker (halo blanc), Bonbon 3D et Pixel art.
- **Export polyvalent** :
  - **Emotes Twitch** : export unitaire PNG ou pack ZIP prêt pour Twitch aux résolutions officielles 112×112, 56×56 et 28×28 px, ou planche complète de toutes les expressions.
  - **Photo de profil (Avatar)** : découpes ronde, arrondie ou carrée avec fonds transparents, dégradés ou unis, jusqu'à 800×800 px.
  - **SVG source & Liens de partage** : export vectoriel et liens encodés sans base de données.

### 📅 2. Stream Scheduler Pro (`/schedule`)

### 🔌 Double Acquisition de Données
- **Synchronisation Twitch API (Helix)** :
  - Connexion sécurisée en 1 clic via le flux *Implicit Grant*.
  - Import automatique des diffusions programmées, des horaires et des jaquettes officielles en haute définition.
  - Configuration du Client ID directement depuis l'interface (plus besoin de toucher au code).
- **Éditeur Manuel Avancé** :
  - Prise en charge de plannings complexes : plusieurs streams par jour, horaires de début et fin optionnels.
  - **Autocomplétion hors-ligne** : base de données intégrée de plus de 50 jeux populaires avec jaquettes officielles instantanées.
  - **Upload de jaquette personnalisé** : importez vos propres images par stream (stockage local en Base64).
  - Raccourci clavier `Échap` pour une navigation fluide.

### 🎨 9 Styles Visuels Développés
Basculez d'une ambiance à une autre en un seul clic :

| Style | Ambiance & Caractéristiques |
|---|---|
| **🪟 Classique** | Cartes en verre dépoli (*Glassmorphism*), bordures douces et bandeau d'accentuation. |
| **✏️ Minimaliste** | Lignes sobres et pures, fond épuré, efficacité visuelle maximale. |
| **⚡ Néon** | Lueur gaming cyberpunk (*Gaming Glow*), contrastes vifs et contours lumineux. |
| **📸 Polaroid** | Cartes façon tirages instantanés avec ombres portées élégantes. |
| **🃏 Retro Arcade** | Esthétique 8-bit / borne d'arcade, scanlines CRT et typographie pixel. |
| **🌸 Pastel** | Palette douce *Aesthetic*, angles très arrondis et design relaxant. |
| **📰 Newspaper** | Mise en page éditoriale/Zine vintage, jaquettes en noir & blanc et police à empattements. |
| **🌊 Lo-Fi Chill** | Ambiance cosy, grain argentique, effet vignette et tons chauds terracotta. |
| **🪐 Cosmic** | Espace étoilé, halos nébuleux et dégradés éclatants. |

### 🖼️ 5 Dispositions d'Images de Live
Adaptez la visibilité des jaquettes selon vos préférences :
- **🖼️ Vignette normale** : format classique équilibré.
- **🌌 Plein écran en fond** : jaquette agrandie et intégrée en arrière-plan immersif de la carte.
- **🏷️ Grande bannière** : affichage en bandeau horizontal en tête de carte.
- **🔍 Grande jaquette XXL** : jaquette mise en valeur en grand format.
- **🚫 Masquer les images** : affichage textuel épuré sans jaquette.

### 📐 Multi-Formats & Options d'Export
- **Paysage (1920×1080 - 16:9)** : optimisé pour Twitter/X, Discord, bannières et écrans de veille.
- **Portrait (1080×1920 - 9:16)** : calibré pour les Stories Instagram, TikTok, Facebook et Shorts.
- **Format "Tonight" (1080×1080 - 1:1)** : export carré centré sur le prochain live de la journée.
- **Formats de fichier** :
  - **PNG HD** (qualité maximale sans perte)
  - **JPEG** (fichier compressé, parfait pour Instagram)
  - **WebP** (moderne et ultra-léger)
- **📋 Copier dans le presse-papier** : copiez l'image générée en un clic via la *Clipboard API* pour la coller directement dans Discord, Slack ou vos messages.

### 🧭 Navigation Temporelle Intuitive
- Naviguez facilement de semaine en semaine avec les boutons **Semaine précédente** / **Semaine suivante**.
- Bouton de réinitialisation **Revenir à maintenant** pour revenir instantanément à la semaine actuelle.

### 🔤 Typographie & Réseaux Sociaux
- **9 typographies professionnelles** intégrées via Google Fonts : *Inter*, *Montserrat*, *Poppins*, *Bebas Neue*, *Oswald*, *Nunito*, *Playfair Display*, *Caveat*, *Press Start 2P*.
- **Gestion jusqu'à 5 réseaux sociaux** avec icônes officielles vectorielles (*FontAwesome 6*) : Twitter/X, Twitch, YouTube, TikTok, Instagram, Discord, Kick, BlueSky.

### 💾 Sauvegarde, Confidentialité & Portabilité
- **Persistance locale** : sauvegarde automatique dans le `localStorage` de votre navigateur (aucun cookie publicitaire ni tracking).
- **Import / Export JSON** : sauvegardez vos configurations de styles et vos plannings en fichier `.json` pour les restaurer ou les partager facilement.
- **Toasts UI** : système de notifications élégantes remplaçant les alertes intrusives.

### 🧩 Extension Twitch Dédiée (Panneau de chaîne)
Une extension panneau Twitch complète est incluse (`stream-scheduler-pro-extension.zip`).
- S'installe en tant que panneau Twitch (largeur standard 320px).
- Restitue votre planning avec les **mêmes 9 styles visuels**.
- Mode d'affichage configurable : planning de la semaine, stream du jour ou prochain stream.
- Synchronisation instantanée via l'import du fichier JSON exporté depuis le générateur.

---

## 🚀 Prise en Main & Déploiement

Le projet est **100% statique**. Vous pouvez l'héberger gratuitement sur **GitHub Pages**, **Cloudflare Pages**, **Netlify**, **Vercel** ou l'utiliser en local.

### Option 1 : Utilisation locale
1. Clonez ou téléchargez le dépôt :
   ```bash
   git clone https://github.com/votre-compte/twitch-schedule-generator.git
   ```
2. Ouvrez simplement `index.html` dans un navigateur ou lancez un serveur local léger (ex: extension VS Code *Live Server* ou `npx serve .`).

---

### Option 2 : Déploiement sur GitHub Pages (Recommandé)
1. Forkez ou poussez ce dépôt sur votre compte GitHub.
2. Rendez-vous dans **Settings** > **Pages** de votre dépôt.
3. Sous **Branch**, sélectionnez `main` et le dossier `/ (root)`, puis cliquez sur **Save**.
4. Votre site sera disponible en ligne sous l'URL :
   ```
   https://<votre-pseudo>.github.io/<votre-depot>/
   ```

---

## ⚙️ Configurer la Synchronisation Twitch

Grâce à la modale de paramètres intégrée, **aucune modification de code source n'est nécessaire** !

```
┌────────────────────────────────────────────────────────┐
│ 1. Créer une application sur la console Twitch Dev    │
│ 2. Copier l'URL de redirection affichée dans l'app    │
│ 3. Coller le Client ID dans l'application (⚙️)         │
└────────────────────────────────────────────────────────┘
```

### 1. Obtenir votre Twitch Client ID
1. Rendez-vous sur la [Twitch Developer Console](https://dev.twitch.tv/console/apps) et connectez-vous avec votre compte Twitch.
2. Cliquez sur **Register Your Application**.
3. Remplissez les champs suivants :
   - **Name** : *Stream Scheduler Pro* (ou le nom de votre choix)
   - **OAuth Redirect URLs** : collez l'URL exacte où votre site est hébergé.
     > 💡 Dans l'application, ouvrez **Paramètres (⚙️)** et cliquez sur l'icône **Copier** à côté de l'URL de redirection détectée.
   - **Category** : *Website Integration*
   - **Client Type** : *Public* (l'application étant 100% côté client, n'utilisez **pas** *Confidential*)
4. Cliquez sur **Create**, puis ouvrez la fiche de l'application pour copier le **Client ID**.

### 2. Enregistrer le Client ID dans l'application
1. Sur votre instance de *Stream Scheduler Pro*, cliquez sur le bouton **⚙️ (Paramètres)** en haut de la barre latérale.
2. Collez votre Client ID dans le champ prévu à cet effet.
3. Cliquez sur **Enregistrer**.
4. Le statut passe au vert : vous pouvez dès à présent cliquer sur **Synchro Twitch API** pour récupérer automatiquement vos streams !

---

## 📁 Structure du Projet

```
twitch-schedule-generator/
├── index.html                           # Interface utilisateur principale et canvas HD
├── style.css                            # Feuilles de styles UI (Dark mode, glassmorphism, flexbox)
├── app.js                               # Moteur complet : gestion d'état, API Twitch, rendu Canvas 2D
└── README.md                            # Documentation générale du projet
```

---

## 🛠️ Stack Technique

- **Langages** : HTML5, CSS3 pur (variables CSS, transitions douces, flexbox/grid), JavaScript moderne (ES6+, Modules & Canvas 2D API).
- **APIs Web exploitées** : Canvas 2D Context, LocalStorage API, Clipboard API, Fetch API, FileReader API.
- **Ressources externes** : [Google Fonts](https://fonts.google.com/), [FontAwesome 6](https://fontawesome.com/).
- **API Tiers** : [Twitch Helix API](https://dev.twitch.tv/docs/api/) (Implicit Grant Flow).

---

## 📄 Licence

Ce projet est distribué sous licence open-source **MIT**. Vous êtes libre de l'utiliser, de le modifier et de l'héberger pour vos propres besoins ou votre communauté.
