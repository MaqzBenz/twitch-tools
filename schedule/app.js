// ============================================================================
// 0. UTILITAIRES GÉNÉRAUX
// ============================================================================

/**
 * Fusion profonde (deep merge) de deux objets.
 * Corrige le bug du shallow spread qui écrase les sous-objets entiers.
 */
function deepMerge(defaults, saved) {
    const result = { ...defaults };
    for (const key in saved) {
        if (
            saved[key] !== null &&
            typeof saved[key] === 'object' &&
            !Array.isArray(saved[key])
        ) {
            result[key] = deepMerge(defaults[key] || {}, saved[key]);
        } else {
            result[key] = saved[key];
        }
    }
    return result;
}

/**
 * Système de toasts — remplace tous les alert() natifs
 */
function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toastContainer');
    const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration);
}

// ============================================================================
// 1. ÉTAT GLOBAL
// ============================================================================
const defaultState = {
    theme: {
        backgroundColor: "#09090b",
        backgroundImageUrl: null,
        textColor: "#ffffff",
        accentColor: "#9146FF",
        fontFamily: "Inter",
        style: "classic"
    },
    layout: { format: "landscape", imageLayout: "standard" },
    weekOffset: 0, // 0 = semaine actuelle, -1 = précédente, +1 = suivante
    socials: [
        { network: "\uf099", handle: "@Pseudo" },
        { network: "\uf167", handle: "Chaîne YT" }
    ],
    twitchData: { username: "MonPseudoTwitch", schedule: {} },
    twitchAuthToken: null
};

let appState = defaultState;
const savedLocalState = localStorage.getItem('schedulerProV4');
if (savedLocalState) {
    try {
        appState = deepMerge(defaultState, JSON.parse(savedLocalState));
    } catch (e) {
        console.warn('Impossible de charger l\'état sauvegardé :', e);
    }
}

function saveLocal() {
    localStorage.setItem('schedulerProV4', JSON.stringify(appState));
    loadBackgroundImageAndRender();
}

// ============================================================================
// 2. INITIALISATION UI & LISTENERS
// ============================================================================
window.addEventListener('DOMContentLoaded', () => {
    // Restaurer les champs
    document.getElementById('twitchUsername').value = appState.twitchData.username || "";
    document.getElementById('colorAccent').value    = appState.theme.accentColor;
    document.getElementById('colorText').value      = appState.theme.textColor;
    document.getElementById('fontFamily').value     = appState.theme.fontFamily;
    document.getElementById('themeStyle').value     = appState.theme.style;
    if (document.getElementById('imageLayout')) {
        document.getElementById('imageLayout').value = appState.layout.imageLayout || "standard";
    }
    updateFormatButtons(appState.layout.format);
    updateWeekLabel();
    renderSocialsList();

    // Garantir que les polices sont chargées avant le 1er rendu
    document.fonts.ready.then(() => { loadBackgroundImageAndRender(); });
});

// Listeners apparence
document.getElementById('colorAccent').addEventListener('input', (e) => { appState.theme.accentColor = e.target.value; saveLocal(); });
document.getElementById('colorText').addEventListener('input', (e) => { appState.theme.textColor = e.target.value; saveLocal(); });
document.getElementById('twitchUsername').addEventListener('input', (e) => { appState.twitchData.username = e.target.value; saveLocal(); });
document.getElementById('themeStyle').addEventListener('change', (e) => { appState.theme.style = e.target.value; saveLocal(); });
document.getElementById('fontFamily').addEventListener('input', (e) => { appState.theme.fontFamily = e.target.value; saveLocal(); });
if (document.getElementById('imageLayout')) {
    document.getElementById('imageLayout').addEventListener('change', (e) => {
        appState.layout.imageLayout = e.target.value;
        saveLocal();
    });
}

// Format
document.getElementById('btnFormatLandscape').addEventListener('click', () => { appState.layout.format = "landscape"; updateFormatButtons("landscape"); saveLocal(); });
document.getElementById('btnFormatPortrait').addEventListener('click', ()  => { appState.layout.format = "portrait";  updateFormatButtons("portrait");  saveLocal(); });
function updateFormatButtons(active) {
    document.getElementById('btnFormatLandscape').classList.toggle("active", active === "landscape");
    document.getElementById('btnFormatPortrait').classList.toggle("active",  active === "portrait");
}

// Fond d'écran
let bgImageObj = null;
const imageCache = {};
document.getElementById('bgUploader').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => { appState.theme.backgroundImageUrl = ev.target.result; saveLocal(); showToast('Image de fond appliquée', 'success'); };
    if (e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
});
document.getElementById('btnClearBg').addEventListener('click', () => {
    appState.theme.backgroundImageUrl = null;
    saveLocal();
    showToast('Fond supprimé', 'info');
});

// Export / Import JSON
document.getElementById('btnExportConfig').addEventListener('click', () => {
    const json = JSON.stringify(appState, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `scheduler_config_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    showToast('Configuration exportée !', 'success');
});
document.getElementById('importConfig').addEventListener('change', (e) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const imported = JSON.parse(ev.target.result);
            appState = deepMerge(defaultState, imported);
            // Restaurer les champs UI
            document.getElementById('twitchUsername').value = appState.twitchData.username || "";
            document.getElementById('colorAccent').value    = appState.theme.accentColor;
            document.getElementById('colorText').value      = appState.theme.textColor;
            document.getElementById('fontFamily').value     = appState.theme.fontFamily;
            document.getElementById('themeStyle').value     = appState.theme.style;
            if (document.getElementById('imageLayout')) {
                document.getElementById('imageLayout').value = appState.layout.imageLayout || "standard";
            }
            updateFormatButtons(appState.layout.format);
            updateWeekLabel();
            renderSocialsList();
            saveLocal();
            showToast('Configuration importée avec succès !', 'success');
        } catch (err) {
            showToast('Fichier JSON invalide.', 'error');
        }
    };
    if (e.target.files[0]) reader.readAsText(e.target.files[0]);
    e.target.value = '';
});

// ============================================================================
// 2.5 NAVIGATION ENTRE SEMAINES
// ============================================================================
function updateWeekLabel() {
    const monday = getMondayByOffset(appState.weekOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const fmt = (d) => d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const label = appState.weekOffset === 0
        ? `Cette semaine (${fmt(monday)})`
        : `${fmt(monday)} → ${fmt(sunday)}`;
    document.getElementById('weekLabel').textContent = label;
}

document.getElementById('btnPrevWeek').addEventListener('click', () => {
    appState.weekOffset -= 1;
    updateWeekLabel();
    saveLocal();
});
document.getElementById('btnNextWeek').addEventListener('click', () => {
    appState.weekOffset += 1;
    updateWeekLabel();
    saveLocal();
});
document.getElementById('btnResetWeek').addEventListener('click', () => {
    appState.weekOffset = 0;
    updateWeekLabel();
    saveLocal();
    showToast('Retour à la semaine actuelle', 'info');
});

// ============================================================================
// 2.6 GESTION DES RÉSEAUX SOCIAUX DYNAMIQUES
// ============================================================================
const networkOptions = [
    { name: "Twitter/X", val: "\uf099" },
    { name: "Twitch",    val: "\uf1e8" },
    { name: "YouTube",   val: "\uf167" },
    { name: "TikTok",    val: "\ue07b" },
    { name: "Instagram", val: "\uf16d" },
    { name: "Discord",   val: "\uf392" },
    { name: "Kick",      val: "\uf0e7" },
    { name: "BlueSky",   val: "\uf2a0" }
];

function renderSocialsList() {
    const container = document.getElementById('socialsContainer');
    container.innerHTML = '';
    appState.socials.forEach((soc, index) => {
        const div = document.createElement('div');
        div.className = "social-row";

        let selHTML = `<select class="soc-net soc-net-label" data-idx="${index}">`;
        networkOptions.forEach(opt => {
            const isSelected = soc.network === opt.val ? "selected" : "";
            selHTML += `<option value="${opt.val}" ${isSelected}>${opt.name}</option>`;
        });
        selHTML += `</select>`;

        div.innerHTML = `
            ${selHTML}
            <input type="text" class="input-text soc-handle" data-idx="${index}" placeholder="@pseudo..." value="${soc.handle}">
            <button class="btn-remove" data-idx="${index}" title="Supprimer"><i class="fas fa-times"></i></button>
        `;
        container.appendChild(div);
    });

    document.querySelectorAll('.soc-net').forEach(el => el.addEventListener('change', updateSocialState));
    document.querySelectorAll('.soc-handle').forEach(el => el.addEventListener('input', updateSocialState));
    document.querySelectorAll('.btn-remove').forEach(el => el.addEventListener('click', (e) => {
        const idx = e.currentTarget.dataset.idx;
        appState.socials.splice(idx, 1);
        renderSocialsList();
        saveLocal();
    }));
}

function updateSocialState(e) {
    const idx = e.target.dataset.idx;
    if (e.target.classList.contains('soc-net'))    appState.socials[idx].network = e.target.value;
    if (e.target.classList.contains('soc-handle')) appState.socials[idx].handle  = e.target.value;
    saveLocal();
}

document.getElementById('btnAddSocial').addEventListener('click', () => {
    if (appState.socials.length >= 5) { showToast('Maximum 5 réseaux sociaux !', 'warning'); return; }
    appState.socials.push({ network: "\uf1e8", handle: "" });
    renderSocialsList();
});

// ============================================================================
// 3. API TWITCH (Implicit Grant Flow)
// ============================================================================

// Le Client ID est lu depuis le localStorage (configuré via la modale Paramètres)
// Plus besoin de modifier le code source !
let TWITCH_CLIENT_ID = localStorage.getItem('twitchClientId') || '';

const REDIRECT_URI = window.location.href.split('#')[0].split('?')[0];

document.getElementById('btnFetchTwitch').addEventListener('click', () => {
    if (!TWITCH_CLIENT_ID) {
        showToast('Configurez d\'abord votre Client ID Twitch dans les Paramètres (⚙️) !', 'error', 5000);
        document.getElementById('settingsModal').classList.remove('hidden');
        return;
    }
    const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token`;
    window.location.href = authUrl;
});

// Interception du token au retour
window.addEventListener('DOMContentLoaded', () => {
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
        const token = new URLSearchParams(hash.substring(1)).get('access_token');
        if (token) {
            window.history.replaceState({}, document.title, window.location.pathname);
            appState.twitchAuthToken = token;
            showToast('Connecté à Twitch ! Récupération du planning...', 'info');
            fetchTwitchSchedule(token);
        }
    }
});

async function fetchTwitchSchedule(token) {
    try {
        const headers = { 'Authorization': `Bearer ${token}`, 'Client-Id': TWITCH_CLIENT_ID };

        const userRes = await fetch('https://api.twitch.tv/helix/users', { headers });
        if (!userRes.ok) throw new Error(`Erreur utilisateur : ${userRes.status}`);
        const userData = await userRes.json();
        const userId = userData.data[0].id;

        appState.twitchData.username = userData.data[0].display_name;
        document.getElementById('twitchUsername').value = appState.twitchData.username;

        const schedRes = await fetch(`https://api.twitch.tv/helix/schedule?broadcaster_id=${userId}`, { headers });
        if (schedRes.status === 404) {
            showToast('Aucun planning Twitch configuré pour ce compte.', 'warning');
            return;
        }
        if (!schedRes.ok) throw new Error(`Erreur planning : ${schedRes.status}`);
        const schedData = await schedRes.json();
        let streams = schedData.data && schedData.data.segments ? schedData.data.segments : [];

        // Extraction des category_id uniques pour requête groupée
        const categoryIds = [...new Set(streams.filter(s => s.category?.id).map(s => s.category.id))];

        let boxArts = {};
        if (categoryIds.length > 0) {
            const gamesRes = await fetch(`https://api.twitch.tv/helix/games?id=${categoryIds.join('&id=')}`, { headers });
            const gamesData = await gamesRes.json();
            if (gamesData.data) {
                gamesData.data.forEach(g => {
                    boxArts[g.id] = g.box_art_url.replace('{width}', '188').replace('{height}', '250');
                });
            }
        }

        appState.twitchData.schedule = {};
        streams.forEach(s => {
            if (s.is_canceled) return;
            const dateKey = s.start_time.split('T')[0];
            if (!appState.twitchData.schedule[dateKey]) appState.twitchData.schedule[dateKey] = [];
            const timeStart = new Date(s.start_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const timeEnd   = s.end_time ? new Date(s.end_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : "";
            appState.twitchData.schedule[dateKey].push({
                timeStart,
                timeEnd,
                categoryName: s.category ? s.category.name : "Just Chatting",
                title: s.title || "",
                boxArtUrl: (s.category && boxArts[s.category.id]) ? boxArts[s.category.id] : null
            });
        });

        saveLocal();
        showToast(`Planning Twitch synchronisé ! ${streams.length} stream(s) trouvé(s).`, 'success');
    } catch (e) {
        console.error("Erreur Sync Twitch :", e);
        showToast(`Erreur de synchronisation. Voir la console (F12).`, 'error');
    }
}

// ============================================================================
// 4. ÉDITEUR MANUEL DE SEMAINE
// ============================================================================
const daysOfWeekFull = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

document.getElementById('btnOpenEditor').addEventListener('click', () => {
    const list = document.getElementById('daysList');
    list.innerHTML = '';
    const startOfWeek = getMondayByOffset(appState.weekOffset);

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateKey = d.toISOString().split('T')[0];
        const dayStreams = appState.twitchData.schedule[dateKey] || [];

        const block = document.createElement('div');
        block.className = 'day-block';
        block.dataset.date = dateKey;
        block.innerHTML = `
            <div class="day-header">
                <h4>${daysOfWeekFull[i]} ${d.getDate()} ${d.toLocaleDateString('fr-FR', { month: 'long' })}</h4>
                <button class="btn-add-stream" onclick="addStreamRow(this)">+ Ajouter un live</button>
            </div>
            <div class="streams-container"></div>
        `;

        const container = block.querySelector('.streams-container');
        if (dayStreams.length === 0) {
            container.innerHTML = `<p style="color:var(--text-dim);font-size:13px;font-style:italic;padding:8px 0;">Jour de repos (OFF)</p>`;
        } else {
            dayStreams.forEach(stream => container.appendChild(createStreamRowHTML(stream)));
        }
        list.appendChild(block);
    }
    document.getElementById('weekEditorModal').classList.remove('hidden');
});

// Fermeture modal
document.getElementById('btnCloseWeek').addEventListener('click', () => document.getElementById('weekEditorModal').classList.add('hidden'));
document.getElementById('btnCloseWeekBottom').addEventListener('click', () => document.getElementById('weekEditorModal').classList.add('hidden'));

// Fermer avec Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') document.getElementById('weekEditorModal').classList.add('hidden');
});

// ============================================================================
// BASE DE JEUX TWITCH POPULAIRES (Autocomplétion instantanée hors-ligne)
// ============================================================================
const POPULAR_TWITCH_GAMES = [
    // --- [ Début de ta liste d'origine ] ---
    { name: "Fortnite", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/33214-188x250.jpg" },
    { name: "Fall Guys", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/512980-188x250.jpg" },
    { name: "FIFA 23", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/1745202732_IGDB-188x250.jpg" },
    { name: "EA Sports FC 24", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/143106037-188x250.jpg" },
    { name: "Final Fantasy XIV Online", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/24241-188x250.jpg" },
    { name: "Final Fantasy VII Rebirth", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/1179679822_IGDB-188x250.jpg" },
    { name: "Forza Horizon 5", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/1831885060_IGDB-188x250.jpg" },
    { name: "F1 24", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/1482813133-188x250.jpg" },
    { name: "Far Cry 6", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/518428_IGDB-188x250.jpg" },
    { name: "FiveM", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/32982_IGDB-188x250.jpg" },
    { name: "Football Manager 2024", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/1446702951_IGDB-188x250.jpg" },
    { name: "Just Chatting", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/509658-188x250.jpg" },
    { name: "Discussion", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/509658-188x250.jpg" },
    { name: "League of Legends", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/21779-188x250.jpg" },
    { name: "Grand Theft Auto V", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/32982_IGDB-188x250.jpg" },
    { name: "Valorant", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/516575-188x250.jpg" },
    { name: "Minecraft", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/27471_IGDB-188x250.jpg" },
    { name: "Counter-Strike 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/32399_IGDB-188x250.jpg" },
    { name: "Apex Legends", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/511224-188x250.jpg" },
    { name: "Call of Duty: Warzone", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/512710-188x250.jpg" },
    { name: "Call of Duty: Modern Warfare III", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/1663454790_IGDB-188x250.jpg" },
    { name: "World of Warcraft", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/18122-188x250.jpg" },
    { name: "Overwatch 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/515025-188x250.jpg" },
    { name: "Rocket League", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/30921-188x250.jpg" },
    { name: "Dead by Daylight", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/491487-188x250.jpg" },
    { name: "Rust", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/263490_IGDB-188x250.jpg" },
    { name: "Tom Clancy's Rainbow Six Siege", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/460630-188x250.jpg" },
    { name: "Elden Ring", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/512953_IGDB-188x250.jpg" },
    { name: "Baldur's Gate 3", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/514785-188x250.jpg" },
    { name: "Genshin Impact", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/513181-188x250.jpg" },
    { name: "Honkai: Star Rail", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/181245_IGDB-188x250.jpg" },
    { name: "Lethal Company", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/2088840003_IGDB-188x250.jpg" },
    { name: "Helldivers 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/2054456578_IGDB-188x250.jpg" },
    { name: "Cyberpunk 2077", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/65876-188x250.jpg" },
    { name: "Teamfight Tactics", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/513143-188x250.jpg" },
    { name: "Palworld", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/143573887-188x250.jpg" },
    { name: "Phasmophobia", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/518184-188x250.jpg" },
    { name: "Escape from Tarkov", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/491931_IGDB-188x250.jpg" },
    { name: "Among Us", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/510218-188x250.jpg" },
    { name: "Sea of Thieves", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/490377-188x250.jpg" },
    { name: "Dota 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/29595-188x250.jpg" },
    { name: "Hearthstone", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/138585-188x250.jpg" },
    { name: "Monster Hunter: World", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/497467-188x250.jpg" },
    { name: "Monster Hunter Wilds", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/711200234_IGDB-188x250.jpg" },
    { name: "Pokémon Community Game", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/1460594348_IGDB-188x250.jpg" },
    { name: "Street Fighter 6", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/55453844_IGDB-188x250.jpg" },
    { name: "Tekken 8", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/368815525_IGDB-188x250.jpg" },
    { name: "Super Smash Bros. Ultimate", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/504461_IGDB-188x250.jpg" },
    { name: "The Legend of Zelda: Tears of the Kingdom", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/512954_IGDB-188x250.jpg" },
    { name: "Roblox", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/20563-188x250.jpg" },
    { name: "Garry's Mod", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/18837-188x250.jpg" },
    { name: "The Witcher 3: Wild Hunt", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/115977_IGDB-188x250.jpg" },
    { name: "Red Dead Redemption 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/493959_IGDB-188x250.jpg" },
    { name: "Dark Souls III", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/490292_IGDB-188x250.jpg" },
    { name: "Diablo IV", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/515024-188x250.jpg" },
    { name: "Destiny 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/497057-188x250.jpg" },
    { name: "Starfield", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/506442-188x250.jpg" },
    { name: "PUBG: BATTLEGROUNDS", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/493057-188x250.jpg" },
    { name: "Ark: Survival Ascended", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/1628103362_IGDB-188x250.jpg" },
    { name: "Path of Exile", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/29307-188x250.jpg" },
    { name: "Special Events", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/509663-188x250.jpg" },
    { name: "Talk Shows & Podcasts", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/417752-188x250.jpg" },
    { name: "Music", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/26936-188x250.jpg" },
    { name: "Art", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/509660-188x250.jpg" },
    { name: "Retro", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/27284-188x250.jpg" },
    { name: "Games + Demos", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/66082-188x250.jpg" },

    // --- [ Début de la suite générée : Jeux de survie, RPG, Indés, etc. ] ---
    { name: "DayZ", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/DayZ-188x250.jpg" },
    { name: "Terraria", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Terraria-188x250.jpg" },
    { name: "Stardew Valley", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Stardew%20Valley-188x250.jpg" },
    { name: "Hollow Knight", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Hollow%20Knight-188x250.jpg" },
    { name: "Celeste", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Celeste-188x250.jpg" },
    { name: "Hades", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Hades-188x250.jpg" },
    { name: "Hades II", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Hades%20II-188x250.jpg" },
    { name: "Dead Cells", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Dead%20Cells-188x250.jpg" },
    { name: "The Binding of Isaac: Repentance", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/The%20Binding%20of%20Isaac%3A%20Repentance-188x250.jpg" },
    { name: "Super Mario 64", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Super%20Mario%2064-188x250.jpg" },
    { name: "Super Mario Maker 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Super%20Mario%20Maker%202-188x250.jpg" },
    { name: "Super Mario Odyssey", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Super%20Mario%20Odyssey-188x250.jpg" },
    { name: "Super Smash Bros. Melee", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Super%20Smash%20Bros.%20Melee-188x250.jpg" },
    { name: "Mario Kart 8 Deluxe", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Mario%20Kart%208%20Deluxe-188x250.jpg" },
    { name: "Animal Crossing: New Horizons", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Animal%20Crossing%3A%20New%20Horizons-188x250.jpg" },
    { name: "Bloodborne", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Bloodborne-188x250.jpg" },
    { name: "Sekiro: Shadows Die Twice", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Sekiro%3A%20Shadows%20Die%20Twice-188x250.jpg" },
    { name: "Demon's Souls", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Demon%27s%20Souls-188x250.jpg" },
    { name: "Dark Souls", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Dark%20Souls-188x250.jpg" },
    { name: "Dark Souls II", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Dark%20Souls%20II-188x250.jpg" },
    { name: "Persona 5 Royal", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Persona%205%20Royal-188x250.jpg" },
    { name: "Persona 3 Reload", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Persona%203%20Reload-188x250.jpg" },
    { name: "Resident Evil 4", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Resident%20Evil%204-188x250.jpg" },
    { name: "Resident Evil Village", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Resident%20Evil%20Village-188x250.jpg" },
    { name: "Resident Evil 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Resident%20Evil%202-188x250.jpg" },
    { name: "Silent Hill 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Silent%20Hill%202-188x250.jpg" },
    { name: "Final Fantasy XVI", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Final%20Fantasy%20XVI-188x250.jpg" },
    { name: "Final Fantasy VII Remake", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Final%20Fantasy%20VII%20Remake-188x250.jpg" },
    { name: "The Elder Scrolls V: Skyrim", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/The%20Elder%20Scrolls%20V%3A%20Skyrim-188x250.jpg" },
    { name: "The Elder Scrolls Online", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/The%20Elder%20Scrolls%20Online-188x250.jpg" },
    { name: "Fallout 4", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Fallout%204-188x250.jpg" },
    { name: "Fallout: New Vegas", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Fallout%3A%20New%20Vegas-188x250.jpg" },
    { name: "Fallout 76", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Fallout%2076-188x250.jpg" },
    { name: "Hunt: Showdown", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Hunt%3A%20Showdown-188x250.jpg" },
    { name: "Dead Space", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Dead%20Space-188x250.jpg" },
    { name: "Left 4 Dead 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Left%204%20Dead%202-188x250.jpg" },
    { name: "Portal 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Portal%202-188x250.jpg" },
    { name: "Half-Life 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Half-Life%202-188x250.jpg" },
    { name: "Smite", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Smite-188x250.jpg" },
    { name: "Paladins", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Paladins-188x250.jpg" },
    { name: "Warframe", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Warframe-188x250.jpg" },
    { name: "RuneScape", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/RuneScape-188x250.jpg" },
    { name: "Old School RuneScape", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Old%20School%20RuneScape-188x250.jpg" },
    { name: "Black Desert", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Black%20Desert-188x250.jpg" },
    { name: "Lost Ark", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Lost%20Ark-188x250.jpg" },
    { name: "New World", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/New%20World-188x250.jpg" },
    { name: "Guild Wars 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Guild%20Wars%202-188x250.jpg" },
    { name: "Albion Online", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Albion%20Online-188x250.jpg" },
    { name: "Star Citizen", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Star%20Citizen-188x250.jpg" },
    { name: "EVE Online", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/EVE%20Online-188x250.jpg" },
    { name: "No Man's Sky", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/No%20Man%27s%20Sky-188x250.jpg" },
    { name: "Elite Dangerous", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Elite%20Dangerous-188x250.jpg" },
    { name: "VRChat", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/VRChat-188x250.jpg" },
    { name: "Beat Saber", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Beat%20Saber-188x250.jpg" },
    { name: "osu!", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/osu!-188x250.jpg" },
    { name: "GeoGuessr", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/GeoGuessr-188x250.jpg" },
    { name: "Slay the Spire", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Slay%20the%20Spire-188x250.jpg" },
    { name: "Balatro", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Balatro-188x250.jpg" },
    { name: "Dark and Darker", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Dark%20and%20Darker-188x250.jpg" },
    { name: "Project Zomboid", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Project%20Zomboid-188x250.jpg" },
    { name: "7 Days to Die", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/7%20Days%20to%20Die-188x250.jpg" },
    { name: "SCUM", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/SCUM-188x250.jpg" },
    { name: "Valheim", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Valheim-188x250.jpg" },
    { name: "Enshrouded", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Enshrouded-188x250.jpg" },
    { name: "Sons of the Forest", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Sons%20of%20the%20Forest-188x250.jpg" },
    { name: "The Forest", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/The%20Forest-188x250.jpg" },
    { name: "Subnautica", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Subnautica-188x250.jpg" },
    { name: "Don't Starve Together", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Don%27t%20Starve%20Together-188x250.jpg" },
    { name: "Satisfactory", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Satisfactory-188x250.jpg" },
    { name: "Factorio", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Factorio-188x250.jpg" },
    { name: "RimWorld", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/RimWorld-188x250.jpg" },
    { name: "Cities: Skylines", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Cities%3A%20Skylines-188x250.jpg" },
    { name: "Cities: Skylines II", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Cities%3A%20Skylines%20II-188x250.jpg" },
    { name: "The Sims 4", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/The%20Sims%204-188x250.jpg" },
    { name: "Kerbal Space Program", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Kerbal%20Space%20Program-188x250.jpg" },
    { name: "Crusader Kings III", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Crusader%20Kings%20III-188x250.jpg" },
    { name: "Hearts of Iron IV", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Hearts%20of%20Iron%20IV-188x250.jpg" },
    { name: "Europa Universalis IV", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Europa%20Universalis%20IV-188x250.jpg" },
    { name: "Sid Meier's Civilization VI", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Sid%20Meier%27s%20Civilization%20VI-188x250.jpg" },
    { name: "Age of Empires II", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Age%20of%20Empires%20II-188x250.jpg" },
    { name: "Age of Empires IV", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Age%20of%20Empires%20IV-188x250.jpg" },
    { name: "StarCraft II", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/StarCraft%20II-188x250.jpg" },
    { name: "Warcraft III", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Warcraft%20III-188x250.jpg" },
    { name: "Age of Mythology: Retold", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Age%20of%20Mythology%3A%20Retold-188x250.jpg" },
    { name: "Company of Heroes 3", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Company%20of%20Heroes%203-188x250.jpg" },
    
    // --- [ Combat, Party Games, Courses ] ---
    { name: "Street Fighter V", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Street%20Fighter%20V-188x250.jpg" },
    { name: "Mortal Kombat 1", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Mortal%20Kombat%201-188x250.jpg" },
    { name: "Guilty Gear -Strive-", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Guilty%20Gear%20-Strive--188x250.jpg" },
    { name: "Dragon Ball FighterZ", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Dragon%20Ball%20FighterZ-188x250.jpg" },
    { name: "Brawlhalla", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Brawlhalla-188x250.jpg" },
    { name: "MultiVersus", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/MultiVersus-188x250.jpg" },
    { name: "Party Animals", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Party%20Animals-188x250.jpg" },
    { name: "Gang Beasts", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Gang%20Beasts-188x250.jpg" },
    { name: "Human: Fall Flat", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Human%3A%20Fall%20Flat-188x250.jpg" },
    { name: "Golf It!", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Golf%20It!-188x250.jpg" },
    { name: "Pummel Party", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Pummel%20Party-188x250.jpg" },
    { name: "Jackbox Games", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Jackbox%20Games-188x250.jpg" },
    { name: "Mario Party Superstars", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Mario%20Party%20Superstars-188x250.jpg" },
    { name: "It Takes Two", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/It%20Takes%20Two-188x250.jpg" },
    { name: "A Way Out", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/A%20Way%20Out-188x250.jpg" },
    { name: "Unravel Two", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Unravel%20Two-188x250.jpg" },
    { name: "Keep Talking and Nobody Explodes", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Keep%20Talking%20and%20Nobody%20Explodes-188x250.jpg" },
    { name: "Overcooked! 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Overcooked!%202-188x250.jpg" },
    { name: "Geometry Dash", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Geometry%20Dash-188x250.jpg" },
    { name: "Trackmania", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Trackmania-188x250.jpg" },
    { name: "Rocket Racing", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Rocket%20Racing-188x250.jpg" },
    { name: "Need for Speed Unbound", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Need%20for%20Speed%20Unbound-188x250.jpg" },
    { name: "The Crew Motorfest", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/The%20Crew%20Motorfest-188x250.jpg" },
    { name: "iRacing", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/iRacing-188x250.jpg" },
    { name: "Assetto Corsa", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Assetto%20Corsa-188x250.jpg" },
    { name: "Assetto Corsa Competizione", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Assetto%20Corsa%20Competizione-188x250.jpg" },
    { name: "Euro Truck Simulator 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Euro%20Truck%20Simulator%202-188x250.jpg" },
    { name: "American Truck Simulator", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/American%20Truck%20Simulator-188x250.jpg" },
    { name: "Farming Simulator 22", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Farming%20Simulator%2022-188x250.jpg" },
    { name: "Microsoft Flight Simulator", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Microsoft%20Flight%20Simulator-188x250.jpg" },

    // --- [ Autres Sports et Baston ] ---
    { name: "NBA 2K24", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/NBA%202K24-188x250.jpg" },
    { name: "Madden NFL 24", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Madden%20NFL%2024-188x250.jpg" },
    { name: "NHL 24", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/NHL%2024-188x250.jpg" },
    { name: "MLB The Show 24", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/MLB%20The%20Show%2024-188x250.jpg" },
    { name: "WWE 2K24", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/WWE%202K24-188x250.jpg" },
    { name: "UFC 5", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/UFC%205-188x250.jpg" },
    { name: "F1 Manager 2023", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/F1%20Manager%202023-188x250.jpg" },
    { name: "BlazBlue: Cross Tag Battle", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/BlazBlue%3A%20Cross%20Tag%20Battle-188x250.jpg" },
    { name: "Granblue Fantasy Versus: Rising", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Granblue%20Fantasy%20Versus%3A%20Rising-188x250.jpg" },
    { name: "The King of Fighters XV", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/The%20King%20of%20Fighters%20XV-188x250.jpg" },
    { name: "UNDER NIGHT IN-BIRTH II Sys:Celes", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/UNDER%20NIGHT%20IN-BIRTH%20II%20Sys%3ACeles-188x250.jpg" },

    // --- [ Blockbusters, Solos & Consoles ] ---
    { name: "Persona 4 Golden", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Persona%204%20Golden-188x250.jpg" },
    { name: "Nier: Automata", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Nier%3A%20Automata-188x250.jpg" },
    { name: "Dragon's Dogma 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Dragon%27s%20Dogma%202-188x250.jpg" },
    { name: "Monster Hunter Rise", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Monster%20Hunter%20Rise-188x250.jpg" },
    { name: "God of War Ragnarök", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/God%20of%20War%20Ragnar%C3%B6k-188x250.jpg" },
    { name: "The Last of Us Part I", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/The%20Last%20of%20Us%20Part%20I-188x250.jpg" },
    { name: "The Last of Us Part II", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/The%20Last%20of%20Us%20Part%20II-188x250.jpg" },
    { name: "Horizon Forbidden West", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Horizon%20Forbidden%20West-188x250.jpg" },
    { name: "Ghost of Tsushima", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Ghost%20of%20Tsushima-188x250.jpg" },
    { name: "Marvel's Spider-Man 2", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Marvel%27s%20Spider-Man%202-188x250.jpg" },
    { name: "Ratchet & Clank: Rift Apart", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Ratchet%20%26%20Clank%3A%20Rift%20Apart-188x250.jpg" },
    { name: "Returnal", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Returnal-188x250.jpg" },
    { name: "Death Stranding", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Death%20Stranding-188x250.jpg" },
    { name: "Control", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Control-188x250.jpg" },
    { name: "Alan Wake II", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Alan%20Wake%20II-188x250.jpg" },
    { name: "BioShock Infinite", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/BioShock%20Infinite-188x250.jpg" },
    { name: "Dishonored", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Dishonored-188x250.jpg" },
    { name: "Prey", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Prey-188x250.jpg" },
    { name: "DOOM Eternal", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/DOOM%20Eternal-188x250.jpg" },
    { name: "Wolfenstein II: The New Colossus", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Wolfenstein%20II%3A%20The%20New%20Colossus-188x250.jpg" },
    { name: "Halo Infinite", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Halo%20Infinite-188x250.jpg" },
    { name: "Halo: The Master Chief Collection", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Halo%3A%20The%20Master%20Chief%20Collection-188x250.jpg" },
    { name: "Gears 5", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Gears%205-188x250.jpg" },
    
    // --- [ JRPGs & Nintendo ] ---
    { name: "Sea of Stars", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Sea%20of%20Stars-188x250.jpg" },
    { name: "Chained Echoes", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Chained%20Echoes-188x250.jpg" },
    { name: "Octopath Traveler II", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Octopath%20Traveler%20II-188x250.jpg" },
    { name: "Dragon Quest XI S", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Dragon%20Quest%20XI%20S-188x250.jpg" },
    { name: "Yakuza: Like a Dragon", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Yakuza%3A%20Like%20a%20Dragon-188x250.jpg" },
    { name: "Like a Dragon: Infinite Wealth", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Like%20a%20Dragon%3A%20Infinite%20Wealth-188x250.jpg" },
    { name: "Judgment", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Judgment-188x250.jpg" },
    { name: "Granblue Fantasy: Relink", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Granblue%20Fantasy%3A%20Relink-188x250.jpg" },
    { name: "Tales of Arise", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Tales%20of%20Arise-188x250.jpg" },
    { name: "Xenoblade Chronicles 3", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Xenoblade%20Chronicles%203-188x250.jpg" },
    { name: "Fire Emblem Engage", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Fire%20Emblem%20Engage-188x250.jpg" },
    { name: "Super Mario RPG", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Super%20Mario%20RPG-188x250.jpg" },
    { name: "Princess Peach: Showtime!", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Princess%20Peach%3A%20Showtime!-188x250.jpg" },
    { name: "Pikmin 4", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Pikmin%204-188x250.jpg" },
    { name: "Splatoon 3", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Splatoon%203-188x250.jpg" },
    { name: "ARMS", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/ARMS-188x250.jpg" },
    { name: "Mario Strikers: Battle League", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Mario%20Strikers%3A%20Battle%20League-188x250.jpg" },
    { name: "Nintendo Switch Sports", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Nintendo%20Switch%20Sports-188x250.jpg" },
    { name: "Ring Fit Adventure", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Ring%20Fit%20Adventure-188x250.jpg" },
    
    // --- [ Rythme & Musique ] ---
    { name: "Just Dance 2024 Edition", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Just%20Dance%202024%20Edition-188x250.jpg" },
    { name: "Guitar Hero III: Legends of Rock", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Guitar%20Hero%20III%3A%20Legends%20of%20Rock-188x250.jpg" },
    { name: "Clone Hero", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Clone%20Hero-188x250.jpg" },
    { name: "Rock Band 4", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Rock%20Band%204-188x250.jpg" },

    // --- [ Autres Catégories Non-Gaming & Divers IRL ] ---
    { name: "Chess", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Chess-188x250.jpg" },
    { name: "Poker", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Poker-188x250.jpg" },
    { name: "Virtual Casino", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Virtual%20Casino-188x250.jpg" },
    { name: "ASMR", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/ASMR-188x250.jpg" },
    { name: "Travel & Outdoors", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Travel%20%26%20Outdoors-188x250.jpg" },
    { name: "I'm Only Sleeping", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/I%27m%20Only%20Sleeping-188x250.jpg" },
    { name: "Animals, Aquariums, and Zoos", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Animals%2C%20Aquariums%2C%20and%20Zoos-188x250.jpg" },
    { name: "Software and Game Development", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Software%20and%20Game%20Development-188x250.jpg" },
    { name: "Science & Technology", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Science%20%26%20Technology-188x250.jpg" },
    { name: "Makers & Crafting", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Makers%20%26%20Crafting-188x250.jpg" },
    { name: "Food & Drink", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Food%20%26%20Drink-188x250.jpg" },
    { name: "Fitness & Health", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Fitness%20%26%20Health-188x250.jpg" },
    { name: "Politics", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Politics-188x250.jpg" },
    { name: "Tabletop RPGs", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Tabletop%20RPGs-188x250.jpg" },
    { name: "Watch Parties", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Watch%20Parties-188x250.jpg" },
    { name: "Pools, Hot Tubs, and Beaches", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Pools%2C%20Hot%20Tubs%2C%20and%20Beaches-188x250.jpg" },
    { name: "Sports", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Sports-188x250.jpg" },
    { name: "Magic: The Gathering", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Magic%3A%20The%20Gathering-188x250.jpg" },
    { name: "Yu-Gi-Oh! Master Duel", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Yu-Gi-Oh!%20Master%20Duel-188x250.jpg" },
    { name: "Marvel Snap", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Marvel%20Snap-188x250.jpg" },
    { name: "Legends of Runeterra", boxArtUrl: "https://static-cdn.jtvnw.net/ttv-boxart/Legends%20of%20Runeterra-188x250.jpg" }
];

// Création d'une ligne d'édition (avec autocomplétion intelligente et upload jaquette)
window.createStreamRowHTML = function(stream = { timeStart: "20:00", timeEnd: "", categoryName: "", title: "", boxArtUrl: "" }) {
    const div = document.createElement('div');
    div.className = 'stream-row';

    const thumbId = 'thumb_' + Math.random().toString(36).slice(2);
    const uploadId = 'upload_' + Math.random().toString(36).slice(2);

    div.innerHTML = `
        <div class="time-col">
            <label>Début</label>
            <input type="time" class="input-text time-start" value="${stream.timeStart}">
        </div>
        <div class="time-col">
            <label>Fin (opt.)</label>
            <input type="time" class="input-text time-end" value="${stream.timeEnd || ''}">
        </div>
        <div class="cat-input-container">
            <input type="text" class="input-text cat-inp" placeholder="Jeu / Catégorie (ex: Fortnite)" value="${stream.categoryName}" autocomplete="off">
            <div class="game-suggestions-dropdown hidden"></div>
        </div>
        <button class="btn-search" onclick="searchGameForEditor(this)" title="Rechercher sur Twitch"><i class="fas fa-search"></i></button>
        <div class="boxart-wrapper">
            <img id="${thumbId}" class="thumb-preview ${stream.boxArtUrl ? 'visible' : ''}" src="${stream.boxArtUrl || ''}" alt="Jaquette">
            <input type="file" id="${uploadId}" accept="image/*" style="display:none;">
            <button class="btn-upload-thumb" onclick="document.getElementById('${uploadId}').click()">📁 Upload</button>
        </div>
        <input type="text" class="input-text title-inp" placeholder="Titre du live" value="${stream.title}">
        <input type="hidden" class="boxart-inp" value="${stream.boxArtUrl || ''}">
        <button class="btn-remove-stream" onclick="this.closest('.stream-row').remove()" title="Supprimer"><i class="fas fa-times"></i></button>
    `;

    const catInp = div.querySelector('.cat-inp');
    const dropdown = div.querySelector('.game-suggestions-dropdown');
    const boxartInp = div.querySelector('.boxart-inp');
    const thumb = div.querySelector(`#${thumbId}`);

    let debounceTimer = null;
    let activeIndex = -1;

    function closeDropdown() {
        dropdown.classList.add('hidden');
        dropdown.innerHTML = '';
        const dayBlock = div.closest('.day-block');
        if (dayBlock) {
            dayBlock.classList.remove('has-open-dropdown');
            dayBlock.style.zIndex = '';
        }
        div.classList.remove('has-open-dropdown');
        div.style.zIndex = '';
    }

    function renderSuggestions(games, query) {
        if (!games || games.length === 0) {
            closeDropdown();
            return;
        }
        dropdown.innerHTML = '';
        games.slice(0, 8).forEach((g, idx) => {
            const item = document.createElement('div');
            item.className = 'game-suggestion-item' + (idx === activeIndex ? ' active' : '');
            
            const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
            const highlightedName = g.name.replace(regex, '<mark>$1</mark>');
            
            item.innerHTML = `
                <img src="${g.boxArtUrl}" class="game-sugg-img" alt="${g.name}" loading="lazy" onerror="this.style.opacity='0.2'">
                <div class="game-sugg-info">
                    <span class="game-sugg-name">${highlightedName}</span>
                    <span class="game-sugg-badge">${g.source || 'Twitch'}</span>
                </div>
            `;
            item.addEventListener('mousedown', (e) => {
                e.preventDefault();
                selectGame(g);
            });
            dropdown.appendChild(item);
        });

        // Détection de l'espace disponible sous le champ : ouvrir vers le haut si peu de place
        const rect = catInp.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        if (spaceBelow < 250) {
            dropdown.style.top = 'auto';
            dropdown.style.bottom = 'calc(100% + 6px)';
        } else {
            dropdown.style.top = 'calc(100% + 6px)';
            dropdown.style.bottom = 'auto';
        }

        // Élever le jour et la ligne au-dessus des autres
        const dayBlock = div.closest('.day-block');
        if (dayBlock) {
            dayBlock.classList.add('has-open-dropdown');
            dayBlock.style.zIndex = '1000';
        }
        div.classList.add('has-open-dropdown');
        div.style.zIndex = '1000';

        dropdown.classList.remove('hidden');
    }

    function selectGame(game) {
        catInp.value = game.name;
        boxartInp.value = game.boxArtUrl;
        thumb.src = game.boxArtUrl;
        thumb.classList.add('visible');
        closeDropdown();
        showToast(`🎮 ${game.name} sélectionné !`, 'success', 1800);
    }

    // Écoute de la saisie (autocomplétion en direct)
    catInp.addEventListener('input', () => {
        const q = catInp.value.trim();
        if (!q) {
            closeDropdown();
            return;
        }
        activeIndex = -1;
        const qLower = q.toLowerCase();

        // 1. Recherche instantanée dans la base locale (démarre par... en priorité)
        const starts = POPULAR_TWITCH_GAMES.filter(g => g.name.toLowerCase().startsWith(qLower));
        const contains = POPULAR_TWITCH_GAMES.filter(g => !g.name.toLowerCase().startsWith(qLower) && g.name.toLowerCase().includes(qLower));
        let matches = [...starts, ...contains];
        renderSuggestions(matches, q);

        // 2. Recherche en ligne debouncée via Twitch API si authentifié
        clearTimeout(debounceTimer);
        if (appState.twitchAuthToken) {
            debounceTimer = setTimeout(async () => {
                try {
                    const res = await fetch(`https://api.twitch.tv/helix/search/categories?query=${encodeURIComponent(q)}`, {
                        headers: { 'Authorization': `Bearer ${appState.twitchAuthToken}`, 'Client-Id': TWITCH_CLIENT_ID }
                    });
                    const data = await res.json();
                    if (data.data && data.data.length > 0) {
                        const twitchResults = data.data.map(c => ({
                            name: c.name,
                            boxArtUrl: c.box_art_url.replace('{width}', '188').replace('{height}', '250'),
                            source: 'Twitch API'
                        }));
                        const seen = new Set(twitchResults.map(t => t.name.toLowerCase()));
                        const remainingLocal = matches.filter(l => !seen.has(l.name.toLowerCase()));
                        renderSuggestions([...twitchResults, ...remainingLocal], q);
                    }
                } catch (err) {
                    console.warn('Recherche catégories en direct :', err);
                }
            }, 200);
        }
    });

    // Navigation clavier dans les suggestions
    catInp.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.game-suggestion-item');
        if (!items.length || dropdown.classList.contains('hidden')) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % items.length;
            items.forEach((it, idx) => it.classList.toggle('active', idx === activeIndex));
            items[activeIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + items.length) % items.length;
            items.forEach((it, idx) => it.classList.toggle('active', idx === activeIndex));
            items[activeIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            if (activeIndex >= 0 && activeIndex < items.length) {
                e.preventDefault();
                items[activeIndex].dispatchEvent(new MouseEvent('mousedown'));
            }
        } else if (e.key === 'Escape') {
            closeDropdown();
        }
    });

    catInp.addEventListener('blur', () => {
        setTimeout(() => closeDropdown(), 200);
    });

    catInp.addEventListener('focus', () => {
        if (catInp.value.trim()) {
            catInp.dispatchEvent(new Event('input'));
        }
    });

    // Upload jaquette manuelle → Base64
    div.querySelector(`#${uploadId}`).addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const base64 = ev.target.result;
            div.querySelector('.boxart-inp').value = base64;
            const thumb = div.querySelector(`#${thumbId}`);
            thumb.src = base64;
            thumb.classList.add('visible');
        };
        reader.readAsDataURL(file);
    });

    return div;
};

window.addStreamRow = function(btn) {
    const container = btn.parentElement.nextElementSibling;
    const placeholder = container.querySelector('p');
    if (placeholder) container.innerHTML = '';
    container.appendChild(createStreamRowHTML());
};

window.searchGameForEditor = async function(btn) {
    const row = btn.closest('.stream-row');
    const query = row.querySelector('.cat-inp').value.trim();
    if (!query) return;

    const icon = btn.querySelector('i');
    icon.className = 'fas fa-spinner fa-spin';

    // Si pas de token Twitch, fallback sur base locale instantanée
    if (!appState.twitchAuthToken) {
        const localMatch = POPULAR_TWITCH_GAMES.find(g => g.name.toLowerCase().includes(query.toLowerCase()));
        if (localMatch) {
            row.querySelector('.cat-inp').value = localMatch.name;
            row.querySelector('.boxart-inp').value = localMatch.boxArtUrl;
            const thumb = row.querySelector('.thumb-preview');
            thumb.src = localMatch.boxArtUrl;
            thumb.classList.add('visible');
            icon.className = 'fas fa-check';
            btn.style.background = 'rgba(16,185,129,0.15)';
            btn.style.borderColor = 'rgba(16,185,129,0.4)';
            btn.style.color = '#10b981';
            showToast(`Jaquette trouvée : ${localMatch.name}`, 'success', 2000);
        } else {
            icon.className = 'fas fa-search';
            showToast('Astuce : écrivez le nom du jeu pour voir les suggestions en direct !', 'info', 3000);
        }
        return;
    }

    try {
        const res = await fetch(`https://api.twitch.tv/helix/search/categories?query=${encodeURIComponent(query)}`, {
            headers: { 'Authorization': `Bearer ${appState.twitchAuthToken}`, 'Client-Id': TWITCH_CLIENT_ID }
        });
        const data = await res.json();
        if (data.data && data.data.length > 0) {
            const url = data.data[0].box_art_url.replace('{width}', '188').replace('{height}', '250');
            row.querySelector('.boxart-inp').value = url;
            const thumb = row.querySelector('.thumb-preview');
            thumb.src = url;
            thumb.classList.add('visible');
            icon.className = 'fas fa-check';
            btn.style.background = 'rgba(16,185,129,0.15)';
            btn.style.borderColor = 'rgba(16,185,129,0.4)';
            btn.style.color = '#10b981';
            showToast(`Jaquette trouvée : ${data.data[0].name}`, 'success', 2000);
        } else {
            icon.className = 'fas fa-times';
            btn.style.background = 'rgba(239,68,68,0.15)';
            btn.style.color = '#ef4444';
            showToast('Aucun jeu trouvé avec ce nom.', 'warning');
        }
    } catch (e) {
        icon.className = 'fas fa-exclamation-triangle';
        showToast('Erreur lors de la recherche.', 'error');
    }
};

document.getElementById('btnSaveWeek').addEventListener('click', () => {
    appState.twitchData.schedule = {};
    document.querySelectorAll('.day-block').forEach(block => {
        const dateKey = block.dataset.date;
        const streams = [];
        block.querySelectorAll('.stream-row').forEach(row => {
            streams.push({
                timeStart:    row.querySelector('.time-start').value,
                timeEnd:      row.querySelector('.time-end').value,
                categoryName: row.querySelector('.cat-inp').value,
                title:        row.querySelector('.title-inp').value,
                boxArtUrl:    row.querySelector('.boxart-inp').value
            });
        });
        streams.sort((a, b) => a.timeStart.localeCompare(b.timeStart));
        if (streams.length > 0) appState.twitchData.schedule[dateKey] = streams;
    });
    saveLocal();
    document.getElementById('weekEditorModal').classList.add('hidden');
    showToast('Planning mis à jour !', 'success');
});

// ============================================================================
// 5. EXPORTS IMAGE
// ============================================================================
const canvas = document.getElementById('scheduleCanvas');
const ctx = canvas.getContext('2d');

function downloadCanvas(mimeType, quality, filename) {
    const dataUrl = quality ? canvas.toDataURL(mimeType, quality) : canvas.toDataURL(mimeType);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    showToast(`Image téléchargée en ${filename.split('.').pop().toUpperCase()} !`, 'success');
}

document.getElementById('btnDownloadImage').addEventListener('click', () => {
    downloadCanvas('image/png', null, `planning_${appState.layout.format}_${new Date().toISOString().split('T')[0]}.png`);
});
document.getElementById('btnDownloadJpeg').addEventListener('click', () => {
    downloadCanvas('image/jpeg', 0.92, `planning_${appState.layout.format}.jpg`);
});
document.getElementById('btnDownloadWebp').addEventListener('click', () => {
    downloadCanvas('image/webp', 0.85, `planning_${appState.layout.format}.webp`);
});

// Copier dans le presse-papier
document.getElementById('btnCopyClipboard').addEventListener('click', async () => {
    try {
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        showToast('Image copiée dans le presse-papier !', 'success');
    } catch (e) {
        showToast('Copie impossible (navigateur non supporté).', 'error');
    }
});

// Export "Tonight" — carré 1:1 du prochain stream du jour
document.getElementById('btnDownloadTonight').addEventListener('click', () => {
    const today = new Date().toISOString().split('T')[0];
    const todayStreams = appState.twitchData.schedule[today];
    if (!todayStreams || todayStreams.length === 0) {
        showToast('Aucun stream prévu aujourd\'hui !', 'warning');
        return;
    }
    renderTonightCanvas(todayStreams[0]);
});

function renderTonightCanvas(stream) {
    const tc = document.createElement('canvas');
    tc.width = 1080; tc.height = 1080;
    const tCtx = tc.getContext('2d');

    // Fond gradient
    const grad = tCtx.createLinearGradient(0, 0, 1080, 1080);
    grad.addColorStop(0, '#09090b');
    grad.addColorStop(1, '#1a0a2e');
    tCtx.fillStyle = grad;
    tCtx.fillRect(0, 0, 1080, 1080);

    // Halo accent
    const halo = tCtx.createRadialGradient(540, 540, 100, 540, 540, 600);
    halo.addColorStop(0, appState.theme.accentColor + '33');
    halo.addColorStop(1, 'transparent');
    tCtx.fillStyle = halo;
    tCtx.fillRect(0, 0, 1080, 1080);

    // Jaquette si disponible
    const img = stream.boxArtUrl && imageCache[stream.boxArtUrl];
    if (img) {
        tCtx.save();
        tCtx.globalAlpha = 0.25;
        drawImagePropCtx(tCtx, img, 0, 0, 1080, 1080);
        tCtx.globalAlpha = 1;
        tCtx.fillStyle = 'rgba(0,0,0,0.6)';
        tCtx.fillRect(0, 0, 1080, 1080);
        tCtx.restore();

        // Jaquette centrée
        tCtx.save();
        const iw = 270, ih = 360;
        tCtx.beginPath();
        tCtx.roundRect(540 - iw / 2, 300, iw, ih, 16);
        tCtx.clip();
        tCtx.drawImage(img, 540 - iw / 2, 300, iw, ih);
        tCtx.restore();
    }

    // "CE SOIR"
    tCtx.fillStyle = appState.theme.accentColor;
    tCtx.font = `900 48px "${appState.theme.fontFamily}"`;
    tCtx.textAlign = 'center';
    tCtx.fillText('CE SOIR', 540, 250);

    // Heure
    tCtx.fillStyle = '#ffffff';
    tCtx.font = `900 96px "${appState.theme.fontFamily}"`;
    const timeStr = stream.timeEnd ? `${stream.timeStart} – ${stream.timeEnd}` : stream.timeStart;
    tCtx.fillText(timeStr, 540, img ? 730 : 540);

    // Catégorie
    tCtx.fillStyle = appState.theme.accentColor;
    tCtx.font = `700 36px "${appState.theme.fontFamily}"`;
    tCtx.fillText(stream.categoryName || '', 540, img ? 790 : 620);

    // Titre
    tCtx.fillStyle = '#aaaaaa';
    tCtx.font = `400 28px "${appState.theme.fontFamily}"`;
    wrapText(tCtx, stream.title, 540, img ? 850 : 690, 900, 36, 'center');

    // Pseudo Twitch
    tCtx.fillStyle = appState.theme.accentColor;
    tCtx.font = `700 30px "${appState.theme.fontFamily}"`;
    tCtx.fillText(`twitch.tv/${appState.twitchData.username}`, 540, 1020);

    const link = document.createElement('a');
    link.href = tc.toDataURL('image/png');
    link.download = `tonight_${appState.twitchData.username}.png`;
    link.click();
    showToast('Visuel "Ce soir" exporté !', 'success');
}

// ============================================================================
// 6. MOTEUR DE RENDU CANVAS
// ============================================================================
const daysOfWeekShort = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

function loadBackgroundImageAndRender() {
    if (appState.theme.backgroundImageUrl) {
        bgImageObj = new Image();
        bgImageObj.onload  = () => preloadImagesAndRender();
        bgImageObj.onerror = () => { bgImageObj = null; preloadImagesAndRender(); };
        bgImageObj.src = appState.theme.backgroundImageUrl;
    } else {
        bgImageObj = null;
        preloadImagesAndRender();
    }
}

function preloadImagesAndRender() {
    let toLoad = 0, loaded = 0;
    const check = () => { if (loaded === toLoad) drawWithFonts(); };

    Object.values(appState.twitchData.schedule).forEach(dayStreams => {
        dayStreams.forEach(s => {
            if (s.boxArtUrl && !imageCache[s.boxArtUrl]) {
                toLoad++;
                const img = new Image();
                img.crossOrigin = "Anonymous";
                img.onload  = () => { loaded++; check(); };
                img.onerror = () => { loaded++; check(); };
                img.src = s.boxArtUrl;
                imageCache[s.boxArtUrl] = img;
            }
        });
    });
    if (toLoad === 0) drawWithFonts();
}

function drawWithFonts() {
    document.fonts.ready.then(() => renderCanvas());
}

// ─────────────────────────────────────────
// RENDU PRINCIPAL
// ─────────────────────────────────────────
function renderCanvas() {
    const isLand = appState.layout.format === "landscape";
    const style  = appState.theme.style;
    const accent = appState.theme.accentColor;
    const font   = appState.theme.fontFamily;
    const imgLayout = appState.layout.imageLayout || "standard";

    const startOfWeek = getMondayByOffset(appState.weekOffset);

    // Calcul hauteur Portrait dynamique
    let totalPortraitHeight = 280;
    if (!isLand) {
        for (let i = 0; i < 7; i++) {
            const d = new Date(startOfWeek);
            d.setDate(startOfWeek.getDate() + i);
            const nbStreams = (appState.twitchData.schedule[d.toISOString().split('T')[0]] || []).length;
            totalPortraitHeight += (nbStreams === 0 ? 130 : nbStreams * (imgLayout === 'large' ? 220 : 190) + 70) + 28;
        }
        totalPortraitHeight += 200;
    }

    canvas.width  = isLand ? 1920 : 1080;
    canvas.height = isLand ? 1080 : Math.max(1920, totalPortraitHeight);

    // ── FOND ──
    ctx.fillStyle = appState.theme.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Styles avec fond spécial
    if (style === 'pastel') {
        const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        grad.addColorStop(0, '#e8d5f5');
        grad.addColorStop(0.5, '#fce4ec');
        grad.addColorStop(1, '#e3f2fd');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (style === 'newspaper') {
        ctx.fillStyle = '#f5f0e8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Texture de points
        ctx.fillStyle = 'rgba(0,0,0,0.04)';
        for (let x = 0; x < canvas.width; x += 6) {
            for (let y = 0; y < canvas.height; y += 6) {
                ctx.beginPath();
                ctx.arc(x, y, 0.8, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    } else if (style === 'lofi') {
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        grad.addColorStop(0, '#0d1117');
        grad.addColorStop(1, '#1a1420');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Film grain simulé
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 18;
            data[i]     = Math.min(255, Math.max(0, data[i]     + noise));
            data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
            data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
        }
        ctx.putImageData(imageData, 0, 0);
        // Vignette
        const vignette = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, canvas.height * 0.3, canvas.width / 2, canvas.height / 2, canvas.height * 0.85);
        vignette.addColorStop(0, 'transparent');
        vignette.addColorStop(1, 'rgba(0,0,0,0.65)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (style === 'cosmic') {
        ctx.fillStyle = '#020408';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Étoiles
        for (let i = 0; i < 350; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const r = Math.random() * 1.5;
            const a = Math.random() * 0.8 + 0.2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${a})`;
            ctx.fill();
        }
        // Nébuleuses
        [[0.15, 0.2, '#ff00ff'], [0.8, 0.7, '#00ffff'], [0.5, 0.9, '#9146ff']].forEach(([rx, ry, col]) => {
            const nebula = ctx.createRadialGradient(canvas.width * rx, canvas.height * ry, 0, canvas.width * rx, canvas.height * ry, canvas.width * 0.25);
            nebula.addColorStop(0, col + '22');
            nebula.addColorStop(1, 'transparent');
            ctx.fillStyle = nebula;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
    } else if (style === 'arcade') {
        ctx.fillStyle = '#050510';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Grille CRT
        ctx.strokeStyle = 'rgba(0,255,65,0.07)';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 40) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 40) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
        }
        // Scanlines
        for (let y = 0; y < canvas.height; y += 4) {
            ctx.fillStyle = 'rgba(0,0,0,0.18)';
            ctx.fillRect(0, y, canvas.width, 2);
        }
    }

    if (bgImageObj) {
        drawImagePropCtx(ctx, bgImageObj, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // ── TITRE ──
    ctx.textAlign = "center";
    const titleText = "PLANNING DE LA SEMAINE";
    const titleY = isLand ? 110 : 120;
    const titleSize = isLand ? 68 : 72;

    if (style === 'cosmic') {
        // Titre iridescent
        const iriGrad = ctx.createLinearGradient(canvas.width / 2 - 600, 0, canvas.width / 2 + 600, 0);
        iriGrad.addColorStop(0, '#ff00ff');
        iriGrad.addColorStop(0.33, '#9146ff');
        iriGrad.addColorStop(0.66, '#00ffff');
        iriGrad.addColorStop(1, '#ff00ff');
        ctx.fillStyle = iriGrad;
        ctx.shadowBlur = 30; ctx.shadowColor = '#9146ff';
        ctx.font = `900 ${titleSize}px "${font}"`;
        ctx.fillText(titleText, canvas.width / 2, titleY);
        ctx.shadowBlur = 0;
    } else if (style === 'neon') {
        ctx.shadowBlur = 25; ctx.shadowColor = accent;
        ctx.fillStyle = '#ffffff';
        ctx.font = `900 ${titleSize}px "${font}"`;
        ctx.fillText(titleText, canvas.width / 2, titleY);
        ctx.shadowBlur = 0;
    } else if (style === 'newspaper') {
        ctx.fillStyle = '#1a1a1a';
        ctx.font = `900 ${titleSize}px "Playfair Display"`;
        ctx.fillText(titleText, canvas.width / 2, titleY);
        // Ligne de séparation sous le titre
        ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(canvas.width * 0.1, titleY + 20);
        ctx.lineTo(canvas.width * 0.9, titleY + 20);
        ctx.stroke();
    } else if (style === 'arcade') {
        ctx.fillStyle = '#00ff41';
        ctx.shadowBlur = 20; ctx.shadowColor = '#00ff41';
        ctx.font = `900 ${Math.floor(titleSize * 0.7)}px "Press Start 2P"`;
        ctx.fillText(titleText, canvas.width / 2, titleY);
        ctx.shadowBlur = 0;
    } else if (style === 'lofi') {
        ctx.fillStyle = '#e8c9a0';
        ctx.font = `700 ${titleSize}px "Caveat"`;
        ctx.fillText(titleText, canvas.width / 2, titleY + 20);
    } else if (style === 'pastel') {
        ctx.fillStyle = '#5b21b6';
        ctx.font = `900 ${titleSize}px "Nunito"`;
        ctx.fillText(titleText, canvas.width / 2, titleY);
    } else {
        ctx.fillStyle = appState.theme.textColor;
        ctx.font = `900 ${titleSize}px "${font}"`;
        ctx.fillText(titleText, canvas.width / 2, titleY);
    }

    // Sous-titre : période de la semaine
    const monday = getMondayByOffset(appState.weekOffset);
    const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6);
    const periodStr = `${monday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} – ${sunday.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    const isDarkBg = ['pastel', 'newspaper'].includes(style);
    ctx.fillStyle = isDarkBg ? '#555555' : 'rgba(255,255,255,0.45)';
    ctx.font = `500 ${isLand ? 22 : 26}px "${font}"`;
    ctx.fillText(periodStr, canvas.width / 2, titleY + 45);

    // ── CARTES ──
    const cardW   = isLand ? 240 : 870;
    const gap     = isLand ? 20  : 28;
    const startX  = isLand ? (canvas.width - (cardW * 7 + gap * 6)) / 2 : (canvas.width - cardW) / 2;
    let currentY  = isLand ? 200 : 200;

    for (let i = 0; i < 7; i++) {
        const d = new Date(startOfWeek);
        d.setDate(startOfWeek.getDate() + i);
        const dateKey   = d.toISOString().split('T')[0];
        const dayStreams = appState.twitchData.schedule[dateKey] || [];
        const isOff     = dayStreams.length === 0;
        const cardH     = isLand ? 740 : (isOff ? 130 : dayStreams.length * (imgLayout === 'large' ? 220 : 190) + 70);
        const x = isLand ? startX + i * (cardW + gap) : startX;
        const y = isLand ? 200 : currentY;

        // Rayon des coins de la carte
        let cardRadius = 0;
        if (style === 'classic') cardRadius = 14;
        else if (style === 'pastel') cardRadius = 20;
        else if (style === 'cosmic') cardRadius = 12;
        else if (style === 'neon') cardRadius = 8;
        else if (style === 'lofi') cardRadius = 6;
        else if (style === 'minimal') cardRadius = 4;

        // ── FOND DE CARTE selon style ──
        ctx.save();

        if (style === 'classic') {
            if (bgImageObj) ctx.filter = "blur(14px)";
            ctx.fillStyle = "rgba(20,20,28,0.72)";
            ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 14); ctx.fill(); ctx.stroke();
            ctx.filter = "none";
        } else if (style === 'polaroid') {
            ctx.shadowBlur = 20; ctx.shadowColor = "rgba(0,0,0,0.35)";
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(x, y, cardW, cardH);
            ctx.shadowBlur = 0;
        } else if (style === 'minimal') {
            // Fond léger
            ctx.fillStyle = "rgba(255,255,255,0.03)";
            ctx.fillRect(x, y, cardW, cardH);
            // Barre accent
            ctx.fillStyle = accent;
            if (isLand) ctx.fillRect(x, y, cardW, 5);
            else ctx.fillRect(x, y, 5, cardH);
        } else if (style === 'neon') {
            ctx.fillStyle = "rgba(0,0,0,0.82)";
            ctx.shadowBlur = 18; ctx.shadowColor = accent;
            ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 8); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;
        } else if (style === 'arcade') {
            const accentArcade = '#00ff41';
            ctx.fillStyle = "rgba(0,10,0,0.88)";
            ctx.strokeStyle = accentArcade; ctx.lineWidth = 2;
            ctx.shadowBlur = 12; ctx.shadowColor = accentArcade;
            ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 0); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;
        } else if (style === 'pastel') {
            ctx.fillStyle = "rgba(255,255,255,0.7)";
            ctx.strokeStyle = "rgba(145,70,255,0.15)"; ctx.lineWidth = 1.5;
            ctx.shadowBlur = 20; ctx.shadowColor = "rgba(145,70,255,0.12)";
            ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 20); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;
        } else if (style === 'newspaper') {
            ctx.fillStyle = "#fffef5";
            ctx.strokeStyle = "#1a1a1a"; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 0); ctx.fill(); ctx.stroke();
        } else if (style === 'lofi') {
            ctx.fillStyle = "rgba(30,20,10,0.75)";
            ctx.strokeStyle = "#c8a87a"; ctx.lineWidth = 1;
            ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 6); ctx.fill(); ctx.stroke();
        } else if (style === 'cosmic') {
            const cosGrad = ctx.createLinearGradient(x, y, x + cardW, y + cardH);
            cosGrad.addColorStop(0, "rgba(15,5,30,0.9)");
            cosGrad.addColorStop(1, "rgba(5,10,25,0.9)");
            ctx.fillStyle = cosGrad;
            ctx.strokeStyle = accent + 'aa'; ctx.lineWidth = 1.5;
            ctx.shadowBlur = 20; ctx.shadowColor = accent;
            ctx.beginPath(); ctx.roundRect(x, y, cardW, cardH, 12); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.restore();

        // ── MODE PLEIN ÉCRAN (IMMERSION DU JOUR) ──
        if (!isOff && imgLayout === 'fullscreen') {
            const heroStream = dayStreams.find(s => s.boxArtUrl && imageCache[s.boxArtUrl]);
            if (heroStream) {
                ctx.save();
                ctx.beginPath();
                if (cardRadius > 0) ctx.roundRect(x, y, cardW, cardH, cardRadius);
                else ctx.rect(x, y, cardW, cardH);
                ctx.clip();

                if (style === 'newspaper') ctx.filter = 'grayscale(100%) contrast(1.1)';
                drawImagePropCtx(ctx, imageCache[heroStream.boxArtUrl], x, y, cardW, cardH);
                ctx.filter = 'none';

                // Dégradé sombre pour lisibilité absolue du texte au-dessus
                const darkGrad = ctx.createLinearGradient(x, y, x, y + cardH);
                if (style === 'pastel') {
                    darkGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
                    darkGrad.addColorStop(0.35, 'rgba(255, 255, 255, 0.78)');
                    darkGrad.addColorStop(1, 'rgba(255, 255, 255, 0.94)');
                } else if (style === 'newspaper') {
                    darkGrad.addColorStop(0, 'rgba(255, 254, 245, 0.55)');
                    darkGrad.addColorStop(0.4, 'rgba(255, 254, 245, 0.88)');
                    darkGrad.addColorStop(1, 'rgba(255, 254, 245, 0.96)');
                } else {
                    darkGrad.addColorStop(0, 'rgba(8, 8, 14, 0.52)');
                    darkGrad.addColorStop(0.35, 'rgba(8, 8, 14, 0.76)');
                    darkGrad.addColorStop(1, 'rgba(8, 8, 14, 0.94)');
                }
                ctx.fillStyle = darkGrad;
                ctx.fillRect(x, y, cardW, cardH);
                ctx.restore();
            }
        }

        // Header carte (Classic)
        if (style === 'classic') {
            ctx.save();
            ctx.fillStyle = imgLayout === 'fullscreen' ? accent + 'cc' : accent;
            ctx.beginPath();
            if (isLand) ctx.roundRect(x, y, cardW, 75, [14, 14, 0, 0]);
            else ctx.roundRect(x, y, 12, cardH, [14, 0, 0, 14]);
            ctx.fill();
            ctx.restore();
        }

        // ── TEXTE DATE ──
        const isDarkCard = ['polaroid', 'pastel', 'newspaper'].includes(style);
        const titleColor = isDarkCard ? '#111111' : '#ffffff';

        ctx.fillStyle = titleColor;
        ctx.textAlign = isLand ? "center" : "left";
        const titleX = isLand ? x + cardW / 2 : x + 40;

        const dateText = `${daysOfWeekShort[i]} ${d.getDate()}`;
        const dateFontSize = isLand ? 28 : 34;

        ctx.save();
        if (style === 'neon') { ctx.shadowBlur = 10; ctx.shadowColor = accent; }
        else if (style === 'arcade') { ctx.shadowBlur = 8; ctx.shadowColor = '#00ff41'; }
        ctx.font = `900 ${dateFontSize}px "${style === 'newspaper' ? 'Playfair Display' : style === 'arcade' ? 'Press Start 2P' : style === 'lofi' ? 'Caveat' : style === 'pastel' ? 'Nunito' : font}"`;
        ctx.fillStyle = style === 'arcade' ? '#00ff41' : style === 'lofi' ? '#e8c9a0' : style === 'pastel' ? '#5b21b6' : titleColor;
        ctx.fillText(dateText, titleX, y + (isLand ? 50 : 50));
        ctx.shadowBlur = 0;
        ctx.restore();

        // Soulignement polaroid
        if (style === 'polaroid') {
            ctx.fillStyle = '#000000';
            ctx.fillRect(isLand ? x + 20 : x + 40, y + (isLand ? 62 : 62), isLand ? cardW - 40 : 200, 3);
        }

        // ── CONTENU OFF / STREAMS ──
        if (isOff) {
            ctx.fillStyle = isDarkCard ? '#888' : 'rgba(255,255,255,0.2)';
            ctx.font = `800 ${isLand ? 32 : 40}px "${font}"`;
            ctx.textAlign = isLand ? "center" : "left";
            ctx.fillText("OFF", isLand ? x + cardW / 2 : x + 40, y + (isLand ? 380 : 95));
        } else {
            const slotH = isLand ? (cardH - 90) / dayStreams.length : (imgLayout === 'large' ? 220 : 190);

            dayStreams.forEach((stream, idx) => {
                const slotY = isLand ? y + 85 + idx * slotH : y + 70 + idx * slotH;
                const displayTime = stream.timeEnd ? `${stream.timeStart} – ${stream.timeEnd}` : stream.timeStart;

                if (imgLayout === 'fullscreen') {
                    // 🌟 MODE PLEIN ÉCRAN (L'image est en fond immersif du jour entier, texte élégamment superposé)
                    ctx.fillStyle = style === 'arcade' ? '#00ff41' : style === 'lofi' ? '#c8a87a' : style === 'pastel' ? '#7c3aed' : style === 'newspaper' ? '#1a1a1a' : accent;
                    ctx.font = `800 ${isLand ? 20 : 24}px "${font}"`;
                    ctx.textAlign = isLand ? "center" : "left";
                    const timeY = isLand ? slotY + (slotH * 0.24) : slotY + 28;
                    ctx.fillText(displayTime, titleX, timeY);

                    ctx.fillStyle = isDarkCard ? '#111111' : '#ffffff';
                    ctx.font = `900 ${isLand ? 22 : 26}px "${font}"`;
                    const catY = isLand ? timeY + 36 : slotY + 66;
                    ctx.fillText(stream.categoryName.substring(0, 24), titleX, catY);

                    ctx.save();
                    if (!isDarkCard) {
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = 'rgba(0,0,0,0.95)';
                    }
                    ctx.fillStyle = isDarkCard ? '#444444' : 'rgba(255,255,255,0.9)';
                    ctx.font = `500 ${isLand ? 15 : 18}px "${font}"`;
                    wrapText(ctx, stream.title, titleX, catY + 26, isLand ? cardW - 24 : cardW - 100, 22, isLand ? 'center' : 'left');
                    ctx.restore();

                } else if (imgLayout === 'banner') {
                    // 🏷️ MODE BANNIÈRE (Cover large sur la carte, textes en-dessous)
                    if (isLand) {
                        const bannerH = dayStreams.length > 1 ? 120 : 175;
                        const bannerY = slotY + 6;
                        const bannerW = cardW - 24;
                        const bannerX = x + 12;

                        if (stream.boxArtUrl && imageCache[stream.boxArtUrl]) {
                            ctx.save();
                            if (style === 'newspaper') ctx.filter = 'grayscale(100%) contrast(1.1)';
                            ctx.beginPath();
                            ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 8);
                            ctx.clip();
                            drawImagePropCtx(ctx, imageCache[stream.boxArtUrl], bannerX, bannerY, bannerW, bannerH);
                            const bGrad = ctx.createLinearGradient(bannerX, bannerY + bannerH - 40, bannerX, bannerY + bannerH);
                            bGrad.addColorStop(0, 'transparent');
                            bGrad.addColorStop(1, 'rgba(0,0,0,0.65)');
                            ctx.fillStyle = bGrad;
                            ctx.fillRect(bannerX, bannerY, bannerW, bannerH);
                            ctx.restore();
                        }

                        const textStartY = bannerY + bannerH + 28;
                        ctx.fillStyle = style === 'arcade' ? '#00ff41' : style === 'lofi' ? '#c8a87a' : style === 'pastel' ? '#7c3aed' : style === 'newspaper' ? '#1a1a1a' : accent;
                        ctx.font = `700 18px "${font}"`;
                        ctx.textAlign = "center";
                        ctx.fillText(displayTime, titleX, textStartY);

                        ctx.fillStyle = isDarkCard ? '#222222' : '#ffffff';
                        ctx.font = `700 18px "${font}"`;
                        ctx.fillText(stream.categoryName.substring(0, 20), titleX, textStartY + 28);

                        ctx.fillStyle = isDarkCard ? '#555555' : 'rgba(255,255,255,0.6)';
                        ctx.font = `400 13px "${font}"`;
                        wrapText(ctx, stream.title, titleX, textStartY + 52, cardW - 20, 18, 'center');
                    } else {
                        const imgW = 200;
                        const imgH = 140;
                        const imgX = x + cardW - imgW - 25;
                        const imgY = slotY + 12;
                        if (stream.boxArtUrl && imageCache[stream.boxArtUrl]) {
                            ctx.save();
                            if (style === 'newspaper') ctx.filter = 'grayscale(100%) contrast(1.1)';
                            ctx.beginPath();
                            ctx.roundRect(imgX, imgY, imgW, imgH, 8);
                            ctx.clip();
                            drawImagePropCtx(ctx, imageCache[stream.boxArtUrl], imgX, imgY, imgW, imgH);
                            ctx.restore();
                        }
                        ctx.fillStyle = accent;
                        ctx.font = `700 22px "${font}"`;
                        ctx.textAlign = "left";
                        ctx.fillText(displayTime, titleX, slotY + 28);

                        ctx.fillStyle = isDarkCard ? '#222' : '#fff';
                        ctx.font = `700 22px "${font}"`;
                        ctx.fillText(stream.categoryName.substring(0, 22), titleX, slotY + 62);

                        ctx.fillStyle = isDarkCard ? '#555' : 'rgba(255,255,255,0.6)';
                        ctx.font = `400 16px "${font}"`;
                        wrapText(ctx, stream.title, titleX, slotY + 92, cardW - imgW - 80, 20, 'left');
                    }

                } else if (imgLayout === 'large') {
                    // 🔍 MODE GRANDE JAQUETTE XXL (Jaquette agrandie au centre)
                    const imgW = isLand ? (dayStreams.length > 2 ? 100 : (dayStreams.length > 1 ? 125 : 155)) : 125;
                    const imgH = Math.round(imgW * 1.33);
                    const imgX = isLand ? x + (cardW - imgW) / 2 : x + cardW - imgW - 30;
                    const imgY = isLand ? slotY + 40 : slotY + 10;

                    ctx.fillStyle = style === 'arcade' ? '#00ff41' : style === 'lofi' ? '#c8a87a' : style === 'pastel' ? '#7c3aed' : style === 'newspaper' ? '#1a1a1a' : accent;
                    ctx.font = `700 ${isLand ? 19 : 22}px "${font}"`;
                    ctx.textAlign = isLand ? "center" : "left";
                    ctx.fillText(displayTime, titleX, slotY + 24);

                    if (stream.boxArtUrl && imageCache[stream.boxArtUrl]) {
                        ctx.save();
                        if (style === 'neon' || style === 'cosmic') {
                            ctx.shadowBlur = 15;
                            ctx.shadowColor = accent;
                        }
                        if (style === 'newspaper') ctx.filter = 'grayscale(100%) contrast(1.1)';
                        ctx.beginPath();
                        ctx.roundRect(imgX, imgY, imgW, imgH, style === 'polaroid' ? 0 : 8);
                        ctx.clip();
                        ctx.drawImage(imageCache[stream.boxArtUrl], imgX, imgY, imgW, imgH);
                        ctx.restore();
                    }

                    ctx.fillStyle = isDarkCard ? '#222222' : '#ffffff';
                    ctx.font = `700 ${isLand ? 17 : 22}px "${font}"`;
                    const textY = isLand ? imgY + imgH + 26 : slotY + 58;
                    ctx.fillText(stream.categoryName.substring(0, 20), titleX, textY);

                    ctx.fillStyle = isDarkCard ? '#555555' : 'rgba(255,255,255,0.6)';
                    ctx.font = `400 ${isLand ? 13 : 17}px "${font}"`;
                    wrapText(ctx, stream.title, titleX, textY + 22, isLand ? cardW - 18 : cardW - imgW - 80, 18, isLand ? 'center' : 'left');

                } else if (imgLayout === 'hidden') {
                    // 🚫 MODE SANS IMAGE (Texte aéré)
                    ctx.fillStyle = style === 'arcade' ? '#00ff41' : style === 'lofi' ? '#c8a87a' : style === 'pastel' ? '#7c3aed' : style === 'newspaper' ? '#1a1a1a' : accent;
                    ctx.font = `800 ${isLand ? 22 : 24}px "${font}"`;
                    ctx.textAlign = isLand ? "center" : "left";
                    ctx.fillText(displayTime, titleX, slotY + 36);

                    ctx.fillStyle = isDarkCard ? '#111111' : '#ffffff';
                    ctx.font = `800 ${isLand ? 20 : 24}px "${font}"`;
                    ctx.fillText(stream.categoryName.substring(0, 28), titleX, slotY + 76);

                    ctx.fillStyle = isDarkCard ? '#444444' : 'rgba(255,255,255,0.65)';
                    ctx.font = `400 ${isLand ? 15 : 18}px "${font}"`;
                    wrapText(ctx, stream.title, titleX, slotY + 110, isLand ? cardW - 24 : cardW - 100, 22, isLand ? 'center' : 'left');

                } else {
                    // 🖼️ MODE STANDARD (Vignette normale classique)
                    ctx.fillStyle = style === 'arcade' ? '#00ff41' : style === 'lofi' ? '#c8a87a' : style === 'pastel' ? '#7c3aed' : style === 'newspaper' ? '#1a1a1a' : accent;
                    ctx.font = `700 ${isLand ? 18 : 22}px "${font}"`;
                    ctx.textAlign = isLand ? "center" : "left";
                    ctx.fillText(displayTime, titleX, slotY + 22);

                    const imgW = isLand ? (dayStreams.length > 2 ? 80 : 110) : 95;
                    const imgH = imgW * 1.33;
                    const imgX = isLand ? x + (cardW - imgW) / 2 : x + cardW - imgW - 30;
                    const imgY = isLand ? slotY + 38 : slotY + 8;

                    if (stream.boxArtUrl && imageCache[stream.boxArtUrl]) {
                        ctx.save();
                        if (style === 'newspaper') {
                            ctx.filter = 'grayscale(100%) contrast(1.1)';
                        }
                        ctx.beginPath();
                        ctx.roundRect(imgX, imgY, imgW, imgH, style === 'polaroid' ? 0 : 6);
                        ctx.clip();
                        ctx.drawImage(imageCache[stream.boxArtUrl], imgX, imgY, imgW, imgH);
                        ctx.restore();
                    }

                    ctx.fillStyle = isDarkCard ? '#222222' : '#ffffff';
                    ctx.font = `700 ${isLand ? 16 : 22}px "${font}"`;
                    const textY = isLand ? imgY + imgH + 24 : slotY + 58;
                    ctx.fillText(stream.categoryName.substring(0, 20), titleX, textY);

                    ctx.fillStyle = isDarkCard ? '#555555' : 'rgba(255,255,255,0.55)';
                    ctx.font = `400 ${isLand ? 13 : 17}px "${font}"`;
                    wrapText(ctx, stream.title, titleX, textY + 22, isLand ? cardW - 18 : cardW - 230, 18, isLand ? 'center' : 'left');
                }

                // Séparateur entre streams (paysage)
                if (isLand && idx < dayStreams.length - 1) {
                    ctx.strokeStyle = isDarkCard ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.07)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x + 15, slotY + slotH - 8);
                    ctx.lineTo(x + cardW - 15, slotY + slotH - 8);
                    ctx.stroke();
                }
            });
        }

        currentY += cardH + gap;
    }

    // ── FOOTER ──
    const footerY = canvas.height - 65;
    const isDarkTheme = ['pastel', 'newspaper'].includes(style);

    if (appState.twitchData.username) {
        ctx.textAlign = "center";
        ctx.fillStyle = style === 'arcade' ? '#00ff41' : style === 'lofi' ? '#c8a87a' : style === 'newspaper' ? '#1a1a1a' : accent;
        ctx.font = `900 ${isLand ? 34 : 36}px "${font}"`;
        if (style === 'neon' || style === 'cosmic') { ctx.shadowBlur = 18; ctx.shadowColor = accent; }
        ctx.fillText(`twitch.tv/${appState.twitchData.username}`, canvas.width / 2, footerY - 28);
        ctx.shadowBlur = 0;
    }

    // Réseaux sociaux via FontAwesome
    ctx.fillStyle = isDarkTheme ? '#333333' : 'rgba(255,255,255,0.8)';
    ctx.textAlign = "center";
    const socialParts = appState.socials.filter(s => s.handle.trim() !== '');
    if (socialParts.length > 0) {
        const socialStr = socialParts.map(s => `${s.network}  ${s.handle}`).join('      ');
        ctx.font = `400 ${isLand ? 21 : 24}px 'FontAwesome', "${font}"`;
        ctx.fillText(socialStr, canvas.width / 2, footerY + 20);
    }
}

// ============================================================================
// 2.7 MODALE PARAMÈTRES (Client ID Twitch)
// ============================================================================

function updateClientIdStatus() {
    const statusEl = document.getElementById('clientIdStatus');
    if (!statusEl) return;
    if (TWITCH_CLIENT_ID) {
        // Masque partiellement l'ID pour la sécurité
        const masked = TWITCH_CLIENT_ID.slice(0, 6) + '•'.repeat(Math.max(0, TWITCH_CLIENT_ID.length - 10)) + TWITCH_CLIENT_ID.slice(-4);
        statusEl.className = 'client-id-status status-ok';
        statusEl.innerHTML = `<i class="fas fa-circle-check"></i><span>Client ID configuré : <strong>${masked}</strong></span>`;
    } else {
        statusEl.className = 'client-id-status status-empty';
        statusEl.innerHTML = `<i class="fas fa-circle-xmark"></i><span>Aucun Client ID configuré</span>`;
    }
}

document.getElementById('btnOpenSettings').addEventListener('click', () => {
    document.getElementById('settingsClientId').value = TWITCH_CLIENT_ID;
    updateClientIdStatus();
    document.getElementById('settingsModal').classList.remove('hidden');
});

document.getElementById('btnCloseSettings').addEventListener('click', () => {
    document.getElementById('settingsModal').classList.add('hidden');
});

// Fermer en cliquant sur l'arrière-plan
document.getElementById('settingsModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
});

document.getElementById('btnSaveClientId').addEventListener('click', () => {
    const inputVal = document.getElementById('settingsClientId').value.trim();
    if (!inputVal) {
        showToast('Le champ Client ID est vide.', 'warning');
        return;
    }
    // Validation basique : doit ressembler à un Client ID Twitch (alphanumérique, ~30 caractères)
    if (!/^[a-z0-9]{10,50}$/i.test(inputVal)) {
        showToast('Le format du Client ID semble invalide. Vérifiez votre copie.', 'error');
        return;
    }
    TWITCH_CLIENT_ID = inputVal;
    localStorage.setItem('twitchClientId', TWITCH_CLIENT_ID);
    updateClientIdStatus();
    showToast('Client ID enregistré ! Vous pouvez maintenant synchro Twitch.', 'success');
});

// Initialiser le statut et l'URL de redirect au chargement
window.addEventListener('DOMContentLoaded', () => {
    updateClientIdStatus();

    // Afficher l'URL de redirect dès le chargement (toujours visible dans la modale)
    const urlDisplay = document.getElementById('currentUrlDisplay');
    if (urlDisplay) urlDisplay.textContent = REDIRECT_URI;
});

// Bouton copier l'URL de redirect
document.getElementById('btnCopyRedirectUrl').addEventListener('click', () => {
    navigator.clipboard.writeText(REDIRECT_URI).then(() => {
        const btn = document.getElementById('btnCopyRedirectUrl');
        btn.classList.add('copied');
        btn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 2000);
        showToast('URL de redirect copiée !', 'success', 2000);
    }).catch(() => {
        showToast('Copie impossible, copiez manuellement.', 'warning');
    });
});

// ============================================================================
// 7. UTILITAIRES
// ============================================================================

function getMondayByOffset(offset = 0) {
    const d = new Date();
    const day = d.getDay();
    // Lundi de la semaine courante
    d.setDate(d.getDate() - day + (day === 0 ? -6 : 1));
    // Appliquer l'offset en semaines
    d.setDate(d.getDate() + offset * 7);
    d.setHours(0, 0, 0, 0);
    return d;
}

function wrapText(ctx, text, x, y, maxW, lineH, align) {
    if (!text) return;
    const words = text.split(' ');
    let line = '';
    ctx.textAlign = align;
    for (let n = 0; n < words.length; n++) {
        const test = line + words[n] + ' ';
        if (ctx.measureText(test).width > maxW && n > 0) {
            ctx.fillText(line.trim(), x, y);
            line = words[n] + ' ';
            y += lineH;
        } else {
            line = test;
        }
    }
    ctx.fillText(line.trim(), x, y);
}

function drawImagePropCtx(context, img, x, y, w, h) {
    const iw = img.width, ih = img.height;
    let r = Math.min(w / iw, h / ih);
    let nw = iw * r, nh = ih * r, ar = 1;
    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar; nh *= ar;
    context.drawImage(img, (iw - iw / (nw / w)) / 2, (ih - ih / (nh / h)) / 2, iw / (nw / w), ih / (nh / h), x, y, w, h);
}
// Alias rétrocompatible
function drawImageProp(ctx, img, x, y, w, h) { drawImagePropCtx(ctx, img, x, y, w, h); }