/* ═══ Créateur de mascotte — logique UI ═══ */
(() => {
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const LS_CUR = 'tt_mascot_current', LS_SAVED = 'tt_mascot_saved';

let state = MQ.normalize({});
let name = '';
let tab = 'head';
let animOn = true;
const exp = { mode: 'emote', emoteCrop: 'head', avShape: 'circle', avCrop: 'head', avBg: 'gradient', avSize: 512 };

/* ─── utilitaires ─── */
const toast = (msg, err) => { const t = document.createElement('div'); t.className = 'toast' + (err ? ' err' : ''); t.textContent = msg; $('#toasts').appendChild(t); setTimeout(() => t.remove(), 2600); };
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
const slug = s => (s || 'mascotte').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'mascotte';
const toBlob = (cv, type = 'image/png') => new Promise(r => cv.toBlob(r, type));
function download(blob, filename) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

/* ─── ZIP (sans compression) ─── */
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = d => { let c = 0xFFFFFFFF; for (let i = 0; i < d.length; i++) c = CRC[(c ^ d[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function makeZip(files) {
    const enc = new TextEncoder(), parts = [], central = []; let offset = 0;
    for (const f of files) {
        const nm = enc.encode(f.name), crc = crc32(f.data), n = f.data.length;
        const lh = new DataView(new ArrayBuffer(30));
        lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(12, 33, true);
        lh.setUint32(14, crc, true); lh.setUint32(18, n, true); lh.setUint32(22, n, true); lh.setUint16(26, nm.length, true);
        parts.push(lh, nm, f.data);
        const cd = new DataView(new ArrayBuffer(46));
        cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(8, 0x0800, true); cd.setUint16(14, 33, true);
        cd.setUint32(16, crc, true); cd.setUint32(20, n, true); cd.setUint32(24, n, true); cd.setUint16(28, nm.length, true); cd.setUint32(42, offset, true);
        central.push(cd, nm);
        offset += 30 + nm.length + n;
    }
    const csize = central.reduce((s, p) => s + p.byteLength, 0);
    const end = new DataView(new ArrayBuffer(22));
    end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true); end.setUint32(12, csize, true); end.setUint32(16, offset, true);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
const blobBytes = async b => new Uint8Array(await b.arrayBuffer());

/* ─── persistance ─── */
const persist = debounce(() => localStorage.setItem(LS_CUR, JSON.stringify({ state, name })), 250);
const getSaved = () => { try { return JSON.parse(localStorage.getItem(LS_SAVED)) || []; } catch { return []; } };
const setSaved = a => localStorage.setItem(LS_SAVED, JSON.stringify(a));

/* ─── thumbnails ─── */
const thumb = (st, view) => MQ.svgURL(MQ.buildSVG(st, { view, uid: 't' + Math.random().toString(36).slice(2, 7) + '_' }));
function thumbState(catKey, id) {
    const s = { ...state, [catKey]: id };
    if (catKey === 'head' || catKey === 'hair') s.hat = 'none';
    if (catKey === 'eyes') { s.glasses = 'none'; s.hat = 'none'; s.expr = 'content'; }
    if (catKey === 'glasses') s.expr = 'content';
    if (catKey !== 'pose') s.pose = 'neutral';
    if (catKey === 'shirt') s.pose = 'neutral';
    return s;
}
const styleThumbState = id => ({ ...state, style: id });

/* ─── rendu principal ─── */
function renderPreview() {
    const prev = $('#preview');
    const isPixel = MQ.STYLES[state.style].pixel;
    prev.classList.toggle('anim', animOn && !isPixel);
    if (isPixel) {
        MQ.renderCanvas(state, 512, { view: 'bust' }).then(cv => { prev.replaceChildren(cv); });
    } else {
        prev.innerHTML = MQ.buildSVG(state, { view: 'bust', uid: 'main_' });
    }
    $('#previewLabel').textContent = MQ.EXPRS[state.expr].emoji + ' ' + MQ.EXPRS[state.expr].name + ' · ' + MQ.POSES[state.pose].name;
}

function renderTabs() {
    const box = $('#tabs');
    const tabs = [...MQ.CATS.map(c => ({ key: c.key, label: c.label, icon: c.icon })), { key: 'style', label: 'Style', icon: 'fa-palette' }];
    box.innerHTML = tabs.map(t => `<button class="tab ${t.key === tab ? 'active' : ''}" role="tab" data-tab="${t.key}"><i class="fa-solid ${t.icon}"></i>${t.label}</button>`).join('');
}

function renderPanel() {
    const cat = MQ.CATS.find(c => c.key === tab);
    const title = $('#panelTitle'), colorBlock = $('#colorBlock'), grid = $('#optionGrid');
    $('#btnDiceCat').style.display = '';
    if (tab === 'style') {
        title.textContent = 'Style de rendu';
        colorBlock.style.display = 'none';
        grid.innerHTML = Object.entries(MQ.STYLES).map(([id, s]) => `<button class="opt style-opt ${state.style === id ? 'active' : ''}" data-style="${id}"><img alt="" src="${thumb(styleThumbState(id), 'head')}"><span>${s.emoji} ${s.name}</span></button>`).join('');
        $('#btnDiceCat').style.display = 'none';
        return;
    }
    title.textContent = cat.label;
    colorBlock.style.display = '';
    const cur = state[cat.color], pal = MQ.PALETTES[cat.palette];
    const colorLabel = { head: 'Couleur de peau', hair: 'Couleur des cheveux', eyes: 'Couleur des yeux', hat: 'Couleur du chapeau', glasses: 'Couleur des lunettes', acc: 'Couleur de l\'accessoire', shirt: 'Couleur du t-shirt' }[cat.key];
    colorBlock.innerHTML = `<span class="lbl">${colorLabel}</span><div class="swatches">${pal.map(c => `<button class="swatch ${c.toLowerCase() === cur.toLowerCase() ? 'active' : ''}" style="background:${c}" data-color="${c}" aria-label="${c}"></button>`).join('')}<label class="custom-color" title="Couleur personnalisée" style="background:conic-gradient(#f55,#fd3,#4e8,#3bf,#a5f,#f5a,#f55)"><input type="color" id="customColor" value="${cur}"></label></div>`;
    grid.innerHTML = Object.entries(cat.items).map(([id, it]) => {
        const noneOpt = id === 'none';
        const img = noneOpt ? '<div style="flex:1;display:grid;place-items:center;font-size:1.8rem;color:var(--dim)">∅</div>' : `<img alt="" loading="lazy" src="${thumb(thumbState(cat.key, id), cat.view)}">`;
        return `<button class="opt ${state[cat.key] === id ? 'active' : ''}" data-opt="${id}" title="${it.name}">${img}<span>${it.name}</span></button>`;
    }).join('');
}

function renderStrips() {
    $('#exprStrip').innerHTML = Object.entries(MQ.EXPRS).map(([id, e]) => `<button class="opt ${state.expr === id ? 'active' : ''}" data-expr="${id}" title="${e.name}"><img alt="" src="${thumb({ ...state, expr: id, pose: 'neutral' }, 'head')}"><span>${e.name}</span></button>`).join('');
    $('#poseStrip').innerHTML = Object.entries(MQ.POSES).map(([id, p]) => `<button class="opt ${state.pose === id ? 'active' : ''}" data-pose="${id}" title="${p.name}"><img alt="" src="${thumb({ ...state, pose: id }, 'bust')}"><span>${p.name}</span></button>`).join('');
}

/* aperçus d'export */
const bgFor = (shape) => ({ mode: exp.avBg, c1: $('#avC1').value, c2: $('#avC2').value, shape });
async function renderExportPreview() {
    if (exp.mode === 'emote') {
        const box = $('#emoteSizes'); box.innerHTML = '';
        for (const s of [112, 56, 28]) {
            const cv = await MQ.renderCanvas(state, s, { view: exp.emoteCrop });
            const w = document.createElement('div'); w.className = 'sz'; w.appendChild(cv); w.append(s + 'px'); box.appendChild(w);
        }
    } else {
        const cv = await MQ.renderCanvas(state, 160, { view: exp.avCrop, bg: bgFor(exp.avShape === 'square' ? '' : exp.avShape) });
        const t = $('#avatarPreview'), x = t.getContext('2d'); x.clearRect(0, 0, 160, 160); x.drawImage(cv, 0, 0);
        t.style.borderRadius = exp.avShape === 'circle' ? '50%' : exp.avShape === 'rounded' ? '24%' : '6px';
    }
}
const renderExportPreviewD = debounce(renderExportPreview, 120);

const renderThumbsD = debounce(() => { renderPanel(); renderStrips(); }, 40);

function renderAll(opts = {}) {
    renderPreview();
    if (opts.full) { renderTabs(); renderPanel(); renderStrips(); }
    else renderThumbsD();
    renderExportPreviewD();
    persist();
}

function set(patch, o) { state = MQ.normalize({ ...state, ...patch }); renderAll(o); }

/* ─── Export ─── */
const mName = () => slug(name);
async function emoteCanvas(size, st = state) { return MQ.renderCanvas(st, size, { view: exp.emoteCrop }); }
async function avatarCanvas() { return MQ.renderCanvas(state, exp.avSize, { view: exp.avCrop, bg: bgFor(exp.avShape === 'square' ? '' : exp.avShape) }); }
async function copyCanvas(cv) {
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': toBlob(cv) })]); toast('📋 Image copiée !'); }
    catch { download(await toBlob(cv), mName() + '.png'); toast('Copie impossible ici — image téléchargée à la place', true); }
}
const busy = async (btn, fn) => { btn.disabled = true; try { await fn(); } catch (e) { console.error(e); toast('Erreur pendant l\'export', true); } finally { btn.disabled = false; } };

function bind() {
    // onglets
    $('#tabs').addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (!b) return; tab = b.dataset.tab; renderTabs(); renderPanel(); });
    // panneau
    $('#panel').addEventListener('click', e => {
        const o = e.target.closest('[data-opt]'), sw = e.target.closest('[data-color]'), st = e.target.closest('[data-style]');
        const cat = MQ.CATS.find(c => c.key === tab);
        if (o) set({ [cat.key]: o.dataset.opt });
        else if (sw) set({ [cat.color]: sw.dataset.color });
        else if (st) set({ style: st.dataset.style }, { full: false });
    });
    $('#panel').addEventListener('input', e => { if (e.target.id === 'customColor') { const cat = MQ.CATS.find(c => c.key === tab); state = MQ.normalize({ ...state, [cat.color]: e.target.value }); renderPreview(); renderStrips(); renderExportPreviewD(); persist(); } });
    $('#panel').addEventListener('change', e => { if (e.target.id === 'customColor') renderPanel(); });
    // dé par catégorie
    $('#btnDiceCat').addEventListener('click', () => {
        const cat = MQ.CATS.find(c => c.key === tab); if (!cat) return;
        const ids = Object.keys(cat.items), pal = MQ.PALETTES[cat.palette];
        set({ [cat.key]: ids[Math.floor(Math.random() * ids.length)], [cat.color]: pal[Math.floor(Math.random() * pal.length)] });
    });
    // strips
    $('#exprStrip').addEventListener('click', e => { const b = e.target.closest('[data-expr]'); if (b) set({ expr: b.dataset.expr }); });
    $('#poseStrip').addEventListener('click', e => { const b = e.target.closest('[data-pose]'); if (b) set({ pose: b.dataset.pose }); });
    // preview click → expression aléatoire
    $('#preview').addEventListener('click', () => {
        const ids = Object.keys(MQ.EXPRS).filter(i => i !== state.expr);
        set({ expr: ids[Math.floor(Math.random() * ids.length)] });
        const p = $('#preview'); p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');
    });
    // toolbar
    $('#btnRandom').addEventListener('click', () => { state = MQ.randomState({ expr: state.expr, pose: state.pose, style: state.style }); renderAll({ full: true }); });
    $('#btnReset').addEventListener('click', () => { if (confirm('Réinitialiser la mascotte ?')) { state = MQ.normalize({}); name = ''; $('#mascotName').value = ''; renderAll({ full: true }); } });
    $('#btnAnim').addEventListener('click', e => { animOn = !animOn; e.currentTarget.classList.toggle('on', animOn); renderPreview(); });
    $('#mascotName').addEventListener('input', e => { name = e.target.value; persist(); });

    // export : modes & segments
    $('#exportMode').addEventListener('click', e => { const b = e.target.closest('[data-mode]'); if (!b) return; exp.mode = b.dataset.mode; $$('#exportMode .seg-btn').forEach(x => x.classList.toggle('active', x === b)); $('#emoteOpts').classList.toggle('hidden', exp.mode !== 'emote'); $('#avatarOpts').classList.toggle('hidden', exp.mode !== 'avatar'); renderExportPreview(); });
    const seg = (id, key, num) => $(id).addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; exp[key] = num ? +b.dataset.v : b.dataset.v; $$('.seg-btn', $(id)).forEach(x => x.classList.toggle('active', x === b)); renderExportPreview(); });
    seg('#emoteCrop', 'emoteCrop'); seg('#avShape', 'avShape'); seg('#avCrop', 'avCrop'); seg('#avBg', 'avBg'); seg('#avSize', 'avSize', true);
    ['#avC1', '#avC2'].forEach(i => $(i).addEventListener('input', renderExportPreviewD));

    // export : actions emote
    $('#btnZipTwitch').addEventListener('click', e => busy(e.currentTarget, async () => {
        const files = [];
        for (const s of [112, 56, 28]) files.push({ name: `${mName()}_${s}.png`, data: await blobBytes(await toBlob(await emoteCanvas(s))) });
        download(makeZip(files), `${mName()}_${state.expr}_twitch.zip`); toast('📦 ZIP Twitch prêt (28/56/112)');
    }));
    $('#btnEmotePng').addEventListener('click', e => busy(e.currentTarget, async () => { download(await toBlob(await emoteCanvas(112)), `${mName()}_${state.expr}_112.png`); }));
    $('#btnEmoteCopy').addEventListener('click', e => busy(e.currentTarget, async () => copyCanvas(await emoteCanvas(112))));
    $('#btnAllZip').addEventListener('click', e => busy(e.currentTarget, async () => {
        const files = [];
        for (const id of Object.keys(MQ.EXPRS)) for (const s of [112, 56, 28]) files.push({ name: `${s}/${mName()}_${id}_${s}.png`, data: await blobBytes(await toBlob(await emoteCanvas(s, { ...state, expr: id }))) });
        download(makeZip(files), `${mName()}_toutes_expressions.zip`); toast(`📦 ${Object.keys(MQ.EXPRS).length} expressions exportées`);
    }));
    $('#btnSheet').addEventListener('click', e => busy(e.currentTarget, async () => {
        const ids = Object.keys(MQ.EXPRS), cols = 6, cell = 192, rows = Math.ceil(ids.length / cols);
        const cv = document.createElement('canvas'); cv.width = cols * cell; cv.height = rows * cell; const x = cv.getContext('2d');
        for (let i = 0; i < ids.length; i++) x.drawImage(await emoteCanvas(cell, { ...state, expr: ids[i] }), (i % cols) * cell, Math.floor(i / cols) * cell);
        download(await toBlob(cv), `${mName()}_planche.png`); toast('🖼️ Planche exportée');
    }));
    // avatar
    $('#btnAvDl').addEventListener('click', e => busy(e.currentTarget, async () => { download(await toBlob(await avatarCanvas()), `${mName()}_pdp_${exp.avSize}.png`); }));
    $('#btnAvCopy').addEventListener('click', e => busy(e.currentTarget, async () => copyCanvas(await avatarCanvas())));
    // svg & partage
    $('#btnSvg').addEventListener('click', () => { download(new Blob([MQ.buildSVG(state, { view: exp.mode === 'avatar' ? exp.avCrop : exp.emoteCrop, size: 1024 })], { type: 'image/svg+xml' }), `${mName()}_${state.expr}.svg`); });
    $('#btnShare').addEventListener('click', async () => {
        const url = location.origin + location.pathname + '#m=' + btoa(unescape(encodeURIComponent(JSON.stringify({ s: state, n: name }))));
        try { await navigator.clipboard.writeText(url); toast('🔗 Lien copié dans le presse-papier'); } catch { prompt('Copie ce lien :', url); }
    });

    // sauvegardes
    $('#btnSave').addEventListener('click', async () => {
        const list = getSaved(); list.unshift({ id: Date.now(), name: name || 'Sans nom', state: { ...state } }); setSaved(list.slice(0, 30)); renderSaved(); toast('💾 Mascotte sauvegardée');
    });
    $('#savedList').addEventListener('click', e => {
        const d = e.target.closest('[data-del]'), l = e.target.closest('[data-load]');
        if (d) { setSaved(getSaved().filter(x => x.id != d.dataset.del)); renderSaved(); return; }
        if (l) { const m = getSaved().find(x => x.id == l.dataset.load); if (m) { state = MQ.normalize(m.state); name = m.name === 'Sans nom' ? '' : m.name; $('#mascotName').value = name; renderAll({ full: true }); } }
    });
    $('#btnExportJson').addEventListener('click', () => download(new Blob([JSON.stringify({ name, state }, null, 2)], { type: 'application/json' }), `${mName()}.mascot.json`));
    $('#btnImportJson').addEventListener('click', () => $('#importJson').click());
    $('#importJson').addEventListener('change', async e => {
        const f = e.target.files[0]; if (!f) return;
        try { const j = JSON.parse(await f.text()); state = MQ.normalize(j.state || j); name = j.name || ''; $('#mascotName').value = name; renderAll({ full: true }); toast('✅ Mascotte importée'); } catch { toast('Fichier invalide', true); }
        e.target.value = '';
    });
}

function renderSaved() {
    const list = getSaved();
    $('#savedList').innerHTML = list.length ? list.map(m => `<div class="saved-item"><button data-load="${m.id}" style="width:100%"><img alt="" src="${thumb({ ...MQ.normalize(m.state), pose: 'neutral' }, 'head')}"><span>${m.name.replace(/</g, '&lt;')}</span></button><button class="del" data-del="${m.id}" title="Supprimer"><i class="fa-solid fa-xmark"></i></button></div>`).join('') : '<p class="hint" style="grid-column:1/-1">Aucune mascotte sauvegardée pour l\'instant.</p>';
}

/* ─── init ─── */
function init() {
    try {
        const m = location.hash.match(/#m=(.+)/);
        if (m) { const j = JSON.parse(decodeURIComponent(escape(atob(m[1])))); state = MQ.normalize(j.s); name = j.n || ''; history.replaceState(null, '', location.pathname); }
        else { const cur = JSON.parse(localStorage.getItem(LS_CUR)); if (cur) { state = MQ.normalize(cur.state); name = cur.name || ''; } else state = MQ.randomState({ expr: 'joy' }); }
    } catch { state = MQ.randomState({ expr: 'joy' }); }
    $('#mascotName').value = name;
    $('#btnAnim').classList.add('on');
    bind();
    renderSaved();
    renderAll({ full: true });
}
init();
})();
