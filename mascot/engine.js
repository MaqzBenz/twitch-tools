/* ═══════════════════════════════════════════════════════════
   MASCOT ENGINE — pièces SVG en couches
   Chaque pièce est une fonction qui renvoie du SVG. Pour ajouter
   une pièce : ajouter une entrée dans l'objet correspondant
   (HEADS, HAIRS, HATS, GLASSES, ACCS, SHIRTS, EYES…).
═══════════════════════════════════════════════════════════ */
const MQ = (() => {

/* ─── Couleurs ─── */
const hex2rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgb2hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mixTo = (h, t, k) => { const a = hex2rgb(h); return rgb2hex(a.map((v, i) => v + (t[i] - v) * k)); };
const shade = (h, k) => k < 0 ? mixTo(h, [0, 0, 0], -k) : mixTo(h, [255, 255, 255], k);

const PALETTES = {
    skin: ['#ffdbc0', '#f5c6a0', '#e0a97c', '#c68642', '#8d5524', '#5c3a21', '#8be28b', '#b57bff', '#6ec6ff', '#ff8fc7', '#ffd23f', '#ff9a4d', '#ff6b6b', '#2fe3d0', '#e9e9f2', '#9aa5b1'],
    hair: ['#1b1020', '#3b2a20', '#7a4a2a', '#c9893b', '#f2d680', '#e8e8f0', '#ff5fa2', '#9146ff', '#2fb8ff', '#2fe38b', '#ff4d4d', '#ff9a2f'],
    any: ['#9146ff', '#ff5fa2', '#2fe3d0', '#ffd23f', '#ff9a2f', '#ff4d4d', '#2fb8ff', '#22c58b', '#ffffff', '#c9c9d6', '#4a4a5a', '#1b1030', '#7a4a2a', '#f2d680', '#3b82f6', '#0f766e'],
};

/* ─── Styles de rendu ─── */
const STYLES = {
    cartoon: { name: 'Cartoon',   emoji: '🖍️', ol: 7,   line: '#1b1030', fw: 7,   shade: 'soft' },
    anime:   { name: 'Animé',     emoji: '✨', ol: 3.5, lineMode: 'fill', fw: 4.5, shade: 'cel', shine: true },
    flat:    { name: 'Flat',      emoji: '🟣', ol: 0,   fw: 6,   shade: 'none' },
    sticker: { name: 'Sticker',   emoji: '🏷️', ol: 4.5, line: '#1b1030', fw: 6.5, shade: 'soft', halo: true },
    gloss:   { name: 'Bonbon 3D', emoji: '🍬', ol: 2.5, lineMode: 'fill', fw: 5,   shade: 'gloss', shine: true },
    pixel:   { name: 'Pixel',     emoji: '👾', ol: 7,   line: '#1b1030', fw: 8,   shade: 'none', pixel: true, px: 64 },
};

let uidN = 0;
const lineOf = (c, fill) => c.st.lineMode === 'fill' ? shade(fill, -.6) : (c.st.line || '#1b1030');
/** attributs de remplissage + contour */
const S = (c, fill, w = 1) => { const o = (c.st.ol || 0) * w; return o > 0 ? `fill="${fill}" stroke="${lineOf(c, fill)}" stroke-width="${o}" stroke-linejoin="round" stroke-linecap="round"` : `fill="${fill}"`; };
/** attributs de trait (traits du visage) */
const L = (c, w = 1, col) => `fill="none" stroke="${col || c.feat}" stroke-width="${c.st.fw * w}" stroke-linecap="round" stroke-linejoin="round"`;

const P = d => a => `<path d="${d}" ${a}/>`;
const E = (cx, cy, rx, ry, rot) => a => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" ${rot ? `transform="rotate(${rot} ${cx} ${cy})"` : ''} ${a}/>`;
const C = (cx, cy, r) => a => `<circle cx="${cx}" cy="${cy}" r="${r}" ${a}/>`;
const R = (x, y, w, h, r = 0, rot) => a => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${rot ? `transform="rotate(${rot} ${x + w / 2} ${y + h / 2})"` : ''} ${a}/>`;

/** union de formes avec un seul contour extérieur */
function union(c, fill, items) {
    let out = '';
    const ol = c.st.ol || 0;
    if (ol > 0) { const a = `fill="${fill}" stroke="${lineOf(c, fill)}" stroke-width="${ol * 2}" stroke-linejoin="round"`; out += items.map(f => f(a)).join(''); }
    return out + items.map(f => f(`fill="${fill}"`)).join('');
}
const shp = (c, f, fill, w = 1) => f(S(c, fill, w));

const heart = (cx, cy, s) => `M${cx} ${cy + s * .95} C${cx - s * 1.7} ${cy - s * .1} ${cx - s * .9} ${cy - s * 1.15} ${cx} ${cy - s * .35} C${cx + s * .9} ${cy - s * 1.15} ${cx + s * 1.7} ${cy - s * .1} ${cx} ${cy + s * .95}Z`;
const star = (cx, cy, R_, r, n = 5) => { let p = []; for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n, rr = i % 2 ? r : R_; p.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1)); } return p.join(' '); };
const sparkle = (x, y, s) => `M${x} ${y - s} Q${x} ${y} ${x + s} ${y} Q${x} ${y} ${x} ${y + s} Q${x} ${y} ${x - s} ${y} Q${x} ${y} ${x} ${y - s}Z`;
const drop = (x, y, s) => `M${x} ${y - s * 1.5} C${x + s} ${y - s * .3} ${x + s} ${y + s} ${x} ${y + s} C${x - s} ${y + s} ${x - s} ${y - s * .3} ${x} ${y - s * 1.5}Z`;
const mirror = (fn) => fn(false) + fn(true);

/* ═══ OVERLAYS DE SHADING ═══ */
function shadeOver(c, key, shapeFn, base, box, noHi) {
    const k = c.st.shade; if (!k || k === 'none') return '';
    const [x, y, w, h] = box, cid = c.id + key;
    let inner = '';
    if (k === 'soft') inner = `<linearGradient id="${cid}l" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient><rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" fill="url(#${cid}l)"/>` + (noHi ? '' : `<ellipse cx="${x + w * .3}" cy="${y + h * .26}" rx="${w * .15}" ry="${h * .08}" fill="#fff" opacity=".24" transform="rotate(-28 ${x + w * .3} ${y + h * .26})"/>`);
    else if (k === 'cel') inner = `<rect x="${x - 20}" y="${y - 20}" width="${w + 40}" height="${h + 40}" fill="${shade(base, -.17)}"/>` + shapeFn(`fill="${base}" transform="translate(-9 -11)"`) + `<ellipse cx="${x + w * .3}" cy="${y + h * .22}" rx="${w * .12}" ry="${h * .06}" fill="#fff" opacity=".35" transform="rotate(-25 ${x + w * .3} ${y + h * .22})"/>`;
    else if (k === 'gloss') inner = `<radialGradient id="${cid}g" cx=".32" cy=".26" r=".85"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".3"/></radialGradient><rect x="${x - 10}" y="${y - 10}" width="${w + 20}" height="${h + 20}" fill="url(#${cid}g)"/><ellipse cx="${x + w * .28}" cy="${y + h * .2}" rx="${w * .14}" ry="${h * .07}" fill="#fff" opacity=".7" transform="rotate(-28 ${x + w * .28} ${y + h * .2})"/>`;
    return `<clipPath id="${cid}">${shapeFn('')}</clipPath><g clip-path="url(#${cid})">${inner}</g>`;
}

/* ═══════════════════════ TÊTES ═══════════════════════ */
const earsSVG = (c, ex) => {
    const sk = c.s.skin, inn = shade(sk, -.12);
    return [-1, 1].map(s => E(200 + s * ex, 188, 15, 22)(S(c, sk)) + E(200 + s * (ex + 1), 190, 6, 11)(`fill="${inn}"`)).join('');
};
const pinkIn = '#ff9ab8';
const HEADS = {
    round:  { name: 'Rond',     ex: 108, box: [90, 73, 220, 204], shape: E(200, 175, 110, 102) },
    wide:   { name: 'Large',    ex: 122, box: [76, 92, 248, 180], shape: E(200, 182, 124, 90) },
    tall:   { name: 'Allongé',  ex: 94,  box: [104, 56, 192, 228], shape: E(200, 170, 96, 114) },
    square: { name: 'Carré',    ex: 106, box: [92, 80, 216, 198], shape: R(92, 80, 216, 198, 64) },
    pear:   { name: 'Poire',    ex: 100, box: [100, 78, 200, 200], shape: P('M200 78 C250 78 280 108 284 150 C292 215 306 278 200 278 C94 278 108 215 116 150 C120 108 150 78 200 78Z') },
    heart:  { name: 'Cœur',     ex: 99,  box: [92, 70, 216, 214], shape: P('M200 104 C228 62 308 78 305 150 C302 212 250 262 200 284 C150 262 98 212 95 150 C92 78 172 62 200 104Z') },
    potato: { name: 'Patate',   ex: 100, box: [98, 74, 204, 206], shape: P('M105 150 C100 100 150 72 205 76 C262 80 304 110 298 170 C294 232 262 280 195 278 C130 276 108 215 105 150Z') },
    cat:    { name: 'Chat',     noEars: true, box: [88, 84, 224, 196], shape: E(200, 182, 112, 96),
              back: c => mirror(m => { const s = m ? -1 : 1, X = x => 200 + s * (x - 200); return P(`M${X(98)} 140 L${X(104)} 52 L${X(176)} 100Z`)(S(c, c.s.skin)) + P(`M${X(116)} 124 L${X(118)} 80 L${X(152)} 104Z`)(`fill="${pinkIn}"`); }) },
    bear:   { name: 'Ours',     noEars: true, box: [88, 82, 224, 198], shape: E(200, 181, 112, 98),
              back: c => [118, 282].map(x => C(x, 100, 38)(S(c, c.s.skin)) + C(x, 100, 20)(`fill="${pinkIn}"`)).join('') },
    bunny:  { name: 'Lapin',    noEars: true, box: [92, 82, 216, 198], shape: E(200, 182, 108, 98),
              back: c => [[150, -12], [250, 12]].map(([x, r]) => E(x, 70, 28, 64, r)(S(c, c.s.skin)) + E(x, 74, 13, 42, r)(`fill="${pinkIn}"`)).join('') },
    robot:  { name: 'Robot',    noEars: true, box: [90, 86, 220, 190], shape: R(90, 86, 220, 190, 34),
              back: c => `<path d="M200 90 L200 52" ${L(c, 1.2, lineOf(c, c.s.skin))}/>` + C(200, 44, 13)(S(c, '#ff4d6d')) + [-1, 1].map(s => R(s < 0 ? 70 : 308, 150, 22, 56, 7)(S(c, shade(c.s.skin, -.2)))).join(''),
              front: c => [[108, 104], [292, 104], [108, 258], [292, 258]].map(([x, y]) => C(x, y, 5)(`fill="${shade(c.s.skin, -.3)}"`)).join('') },
    alien:  { name: 'Alien',    noEars: true, box: [96, 66, 208, 218], shape: P('M200 68 C292 68 314 150 282 215 C264 250 230 284 200 284 C170 284 136 250 118 215 C86 150 108 68 200 68Z'),
              back: c => mirror(m => { const s = m ? -1 : 1, X = x => 200 + s * (x - 200); return `<path d="M${X(160)} 80 Q${X(150)} 40 ${X(126)} 28" ${L(c, 1, lineOf(c, c.s.skin))}/>` + C(X(124), 26, 11)(S(c, c.s.skin)); }) },
};

/* ═══════════════════════ YEUX (design) ═══════════════════════ */
const pupil = (c, x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${c.s.eyeC}"/><circle cx="${x}" cy="${y}" r="${r * .52}" fill="#14091f"/><circle cx="${x - r * .35}" cy="${y - r * .38}" r="${r * .3}" fill="#fff"/>` + (c.st.shine ? `<circle cx="${x + r * .38}" cy="${y + r * .4}" r="${r * .16}" fill="#fff" opacity=".9"/>` : '');
const sclera = (c, shape) => shape(S(c, '#ffffff', .65));
const EYES = {
    round: { name: 'Ronds',    draw: (c, x, y) => sclera(c, C(x, y, 20)) + pupil(c, x, y + 1, 11) },
    oval:  { name: 'Ovales',   draw: (c, x, y) => sclera(c, E(x, y, 16, 23)) + pupil(c, x, y + 2, 11) },
    dot:   { name: 'Points',   draw: (c, x, y) => `<ellipse cx="${x}" cy="${y}" rx="9" ry="12" fill="${c.s.eyeC}"/><ellipse cx="${x}" cy="${y}" rx="7" ry="9.5" fill="#14091f"/><circle cx="${x - 2.5}" cy="${y - 4}" r="3.2" fill="#fff"/>` },
    big:   { name: 'Gros',     draw: (c, x, y) => sclera(c, C(x, y, 27)) + pupil(c, x, y + 2, 15) },
    lash:  { name: 'Cils',     draw: (c, x, y, side) => sclera(c, C(x, y, 19)) + pupil(c, x, y + 1, 11) + [0, 1, 2].map(i => `<path d="M${x + side * 17} ${y - 8 + i * 0} L${x + side * (29 + i * 1)} ${y - 18 + i * 9}" ${L(c, .55)}/>`).join('') },
    cat:   { name: 'Chat',     draw: (c, x, y) => sclera(c, E(x, y, 17, 22)) + `<ellipse cx="${x}" cy="${y}" rx="10" ry="21" fill="${c.s.eyeC}"/><ellipse cx="${x}" cy="${y}" rx="3.5" ry="19" fill="#14091f"/><circle cx="${x - 4}" cy="${y - 8}" r="3" fill="#fff"/>` },
    sleepy:{ name: 'Fatigués', draw: (c, x, y) => sclera(c, C(x, y, 19)) + pupil(c, x, y + 4, 10) + `<path d="M${x - 21} ${y - 1} A21 21 0 0 1 ${x + 21} ${y - 1} Z" ${S(c, c.s.skin, .5)}/><path d="M${x - 21} ${y - 1} L${x + 21} ${y - 1}" ${L(c, .6)}/>` },
    beads: { name: 'Perles',   draw: (c, x, y) => `<circle cx="${x}" cy="${y}" r="7.5" fill="#14091f"/><circle cx="${x - 2}" cy="${y - 2.5}" r="2.4" fill="#fff"/>` },
    anime: { name: 'Manga',    draw: (c, x, y, side) => `<ellipse cx="${x}" cy="${y}" rx="22" ry="29" fill="#fff" ${c.st.ol ? `stroke="${lineOf(c, '#fff')}" stroke-width="${c.st.ol * .8}"` : ''}/><ellipse cx="${x}" cy="${y + 3}" rx="17" ry="24" fill="${c.s.eyeC}"/><ellipse cx="${x}" cy="${y + 12}" rx="14" ry="11" fill="${shade(c.s.eyeC, .35)}" opacity=".7"/><ellipse cx="${x}" cy="${y + 2}" rx="8" ry="13" fill="#14091f"/><ellipse cx="${x - 7}" cy="${y - 9}" rx="6.5" ry="8" fill="#fff"/><circle cx="${x + 7}" cy="${y + 13}" r="3.4" fill="#fff"/><path d="M${x - 24} ${y - 12} Q${x} ${y - 36} ${x + 24} ${y - 12}" ${L(c, .75)}/>` },
    square:{ name: 'Pixels',   draw: (c, x, y) => R(x - 18, y - 18, 36, 36, 6)(S(c, '#fff', .65)) + R(x - 9, y - 9, 18, 18, 3)(`fill="${c.s.eyeC}"`) + R(x - 6, y - 12, 8, 8, 1)('fill="#fff"') },
};
const EYE_X = [158, 242], EYE_Y = 172;

function eyesSVG(c, type) {
    const d = EYES[c.s.eyes] || EYES.round, [lx, rx] = EYE_X, y = EYE_Y;
    const happy = x => `<path d="M${x - 19} ${y + 8} Q${x} ${y - 24} ${x + 19} ${y + 8}" ${L(c, 1.1)}/>`;
    const closed = x => `<path d="M${x - 19} ${y - 4} Q${x} ${y + 18} ${x + 19} ${y - 4}" ${L(c, 1.1)}/>`;
    const flat = x => `<path d="M${x - 17} ${y + 2} L${x + 17} ${y + 2}" ${L(c, 1.1)}/>`;
    const heartE = x => `<path d="${heart(x, y - 2, 17)}" ${S(c, '#ff3b6b', .7)}/><ellipse cx="${x - 8}" cy="${y - 10}" rx="4" ry="2.6" fill="#fff" opacity=".8" transform="rotate(-30 ${x - 8} ${y - 10})"/>`;
    const starE = x => `<polygon points="${star(x, y, 27, 12)}" ${S(c, '#ffd23f', .7)}/>`;
    const wide = x => C(x, y, 27)(S(c, '#fff', .7)) + `<circle cx="${x}" cy="${y}" r="5.5" fill="#14091f"/>`;
    const xE = x => `<path d="M${x - 14} ${y - 14} L${x + 14} ${y + 14} M${x + 14} ${y - 14} L${x - 14} ${y + 14}" ${L(c, 1.2)}/>`;
    const half = x => C(x, y, 20)(S(c, '#fff', .65)) + `<circle cx="${x}" cy="${y + 6}" r="9" fill="${c.s.eyeC}"/><circle cx="${x}" cy="${y + 6}" r="4.5" fill="#14091f"/>` + `<path d="M${x - 22} ${y + 1} A22 22 0 0 1 ${x + 22} ${y + 1} Z" ${S(c, c.s.skin, .5)}/><path d="M${x - 22} ${y + 1} L${x + 22} ${y + 1}" ${L(c, .8)}/>`;
    const open = (x, s) => d.draw(c, x, y, s);
    const map = {
        open: [open(lx, -1), open(rx, 1)], happy: [happy(lx), happy(rx)], closed: [closed(lx), closed(rx)],
        heart: [heartE(lx), heartE(rx)], star: [starE(lx), starE(rx)], wide: [wide(lx), wide(rx)], x: [xE(lx), xE(rx)],
        wink: [open(lx, -1), happy(rx)], sleepy: [flat(lx), flat(rx)], half: [half(lx), half(rx)],
    };
    const e = map[type] || map.open;
    return `<g class="mq-eyes">${e[0]}${e[1]}</g>`;
}

/* ═══════════════════════ BOUCHES ═══════════════════════ */
const MOUTH_IN = '#4a1228', TONGUE = '#ff7a9c';
function openMouth(c, d, o = {}) {
    const id = c.id + 'mc';
    return `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${MOUTH_IN}"/>` +
        `<g clip-path="url(#${id})">${o.tongue ? `<ellipse cx="200" cy="${o.ty || 272}" rx="${o.tr || 26}" ry="${o.tv || 20}" fill="${TONGUE}"/>` : ''}${o.teeth ? `<rect x="130" y="${o.tyy || 205}" width="140" height="${o.th || 20}" fill="#fff"/>` : ''}</g>` +
        `<path d="${d}" ${L(c, .85)}/>`;
}
const MOUTHS = {
    smile:  c => `<path d="M163 220 Q200 262 237 220" ${L(c)}/>`,
    grin:   c => openMouth(c, 'M158 216 Q200 226 242 216 Q238 272 200 272 Q162 272 158 216Z', { teeth: true, tongue: true }),
    laugh:  c => openMouth(c, 'M148 210 Q200 224 252 210 Q252 290 200 290 Q148 290 148 210Z', { teeth: true, tongue: true, ty: 290, tr: 34, tv: 26, th: 24 }),
    sad:    c => `<path d="M166 252 Q200 214 234 252" ${L(c)}/>`,
    scream: c => openMouth(c, 'M164 248 A36 44 0 1 0 236 248 A36 44 0 1 0 164 248Z', { teeth: true, tongue: true, tyy: 200, th: 22, ty: 292, tr: 30, tv: 24 }),
    o:      c => openMouth(c, 'M186 244 A14 18 0 1 0 214 244 A14 18 0 1 0 186 244Z'),
    flat:   c => `<path d="M175 242 L225 242" ${L(c)}/>`,
    smirk:  c => `<path d="M168 240 Q206 248 236 220" ${L(c)}/>`,
    tongue: c => `<path d="M186 242 L186 262 Q200 284 216 262 L216 240Z" ${S(c, TONGUE, .6)}/><path d="M201 250 L201 268" ${L(c, .4, shade(TONGUE, -.4))}/><path d="M163 220 Q200 262 237 220" ${L(c)}/>`,
    kiss:   c => `<ellipse cx="200" cy="242" rx="13" ry="10" ${S(c, '#ff5a7a', .6)}/><path d="M190 242 Q200 238 210 242" ${L(c, .35, '#8a1130')}/>`,
    wavy:   c => `<path d="M162 242 q9 -13 19 0 t19 0 t19 0 t19 0" ${L(c)}/>`,
    gritted:c => `<rect x="168" y="222" width="64" height="32" rx="9" ${S(c, '#fff', .8)}/><path d="M184 222 V254 M200 222 V254 M216 222 V254 M168 238 H232" ${L(c, .3)}/>`,
    cat:    c => `<path d="M164 226 Q182 254 200 230 Q218 254 236 226" ${L(c)}/>`,
};

/* ═══════════════════════ SOURCILS ═══════════════════════ */
const BROWS = {
    normal: ['M135 140 Q158 130 182 140', 'M218 140 Q242 130 265 140'],
    angry:  ['M130 124 L184 150', 'M270 124 L216 150'],
    sad:    ['M134 152 L184 132', 'M266 152 L216 132'],
    raised: ['M138 126 Q160 108 182 124', 'M218 124 Q240 108 262 126'],
    one:    ['M136 142 L182 142', 'M218 126 Q240 104 264 124'],
    flat:   ['M138 140 L182 140', 'M218 140 L262 140'],
};

/* ═══════════════════════ EXPRESSIONS ═══════════════════════ */
const EXPRS = {
    content:  { name: 'Content',      emoji: '🙂', eyes: 'open',   mouth: 'smile',  brows: 'normal' },
    joy:      { name: 'Joyeux',       emoji: '😄', eyes: 'happy',  mouth: 'grin',   brows: 'none',   fx: ['blush'] },
    sad:      { name: 'Triste',       emoji: '😢', eyes: 'open',   mouth: 'sad',    brows: 'sad',    fx: ['tear'] },
    cry:      { name: 'Pleure',       emoji: '😭', eyes: 'closed', mouth: 'scream', brows: 'sad',    fx: ['streams'] },
    love:     { name: 'Amoureux',     emoji: '😍', eyes: 'heart',  mouth: 'smile',  brows: 'none',   fx: ['blush', 'hearts'] },
    scream:   { name: 'Cri',          emoji: '😱', eyes: 'wide',   mouth: 'scream', brows: 'raised', fx: ['shock'] },
    excited:  { name: 'Excité',       emoji: '🤩', eyes: 'star',   mouth: 'laugh',  brows: 'none',   fx: ['sparkles'] },
    angry:    { name: 'En colère',    emoji: '😠', eyes: 'open',   mouth: 'gritted',brows: 'angry',  fx: ['steam'] },
    surprised:{ name: 'Surpris',      emoji: '😮', eyes: 'wide',   mouth: 'o',      brows: 'raised' },
    wink:     { name: 'Clin d\'œil',  emoji: '😜', eyes: 'wink',   mouth: 'tongue', brows: 'normal' },
    sleep:    { name: 'Dodo',         emoji: '😴', eyes: 'closed', mouth: 'o',      brows: 'flat',   fx: ['zzz'] },
    cool:     { name: 'Cool',         emoji: '😎', eyes: 'half',   mouth: 'smirk',  brows: 'normal' },
    meh:      { name: 'Bof',          emoji: '😑', eyes: 'half',   mouth: 'flat',   brows: 'flat' },
    kiss:     { name: 'Bisou',        emoji: '😘', eyes: 'closed', mouth: 'kiss',   brows: 'none',   fx: ['blush', 'hearts'] },
    lol:      { name: 'MDR',          emoji: '😂', eyes: 'happy',  mouth: 'laugh',  brows: 'none',   fx: ['joytears'] },
    dead:     { name: 'KO',           emoji: '😵', eyes: 'x',      mouth: 'wavy',   brows: 'none' },
    think:    { name: 'Réfléchit',    emoji: '🤔', eyes: 'open',   mouth: 'flat',   brows: 'one',    fx: ['question'] },
    shy:      { name: 'Gêné',         emoji: '😅', eyes: 'open',   mouth: 'wavy',   brows: 'sad',    fx: ['blushBig', 'sweat'] },
    cat:      { name: 'Miaou',        emoji: '😺', eyes: 'happy',  mouth: 'cat',    brows: 'none',   fx: ['blush'] },
};

const FX = {
    blush:    c => `<ellipse cx="128" cy="210" rx="21" ry="11" fill="#ff6b8e" opacity=".5"/><ellipse cx="272" cy="210" rx="21" ry="11" fill="#ff6b8e" opacity=".5"/>`,
    blushBig: c => `<ellipse cx="128" cy="210" rx="24" ry="14" fill="#ff3b6b" opacity=".6"/><ellipse cx="272" cy="210" rx="24" ry="14" fill="#ff3b6b" opacity=".6"/>`,
    tear:     c => `<path d="${drop(136, 214, 11)}" ${S(c, '#8fdcff', .6)}/>`,
    streams:  c => [-1, 1].map(s => `<path d="M${200 + s * 54} 192 Q${200 + s * 68} 232 ${200 + s * 52} 268" fill="none" stroke="#8fdcff" stroke-width="15" stroke-linecap="round"/><path d="M${200 + s * 54} 192 Q${200 + s * 68} 232 ${200 + s * 52} 268" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="4" stroke-linecap="round"/>`).join('') + `<path d="${drop(96, 168, 10)}" ${S(c, '#8fdcff', .6)}/><path d="${drop(306, 150, 9)}" ${S(c, '#8fdcff', .6)}/>`,
    joytears: c => [[96, 170, 11], [304, 168, 11], [84, 140, 8], [318, 136, 8]].map(([x, y, s]) => `<path d="${drop(x, y, s)}" ${S(c, '#8fdcff', .6)}/>`).join(''),
    sweat:    c => `<path d="${drop(296, 112, 13)}" ${S(c, '#9ee3ff', .6)}/>`,
    steam:    c => union(c, '#f2f2fa', [C(52, 160, 15), C(40, 134, 11), C(56, 112, 8), C(348, 160, 15), C(360, 134, 11), C(344, 112, 8)]) + `<path d="M262 96 q8 4 10 14 M262 96 q-8 4 -10 14 M262 124 q8 -4 10 -14 M262 124 q-8 -4 -10 -14" ${L(c, .6, '#ff3b3b')}/>`,
    zzz:      c => [['Z', 296, 78, 46], ['Z', 334, 46, 32], ['Z', 362, 22, 22]].map(([t, x, y, s]) => `<text x="${x}" y="${y}" font-family="Arial Black,Impact,sans-serif" font-size="${s}" fill="#8fb4ff" stroke="${c.st.ol ? '#1b1030' : 'none'}" stroke-width="${c.st.ol ? 3 : 0}" paint-order="stroke">${t}</text>`).join(''),
    sparkles: c => [[52, 104, 20], [350, 92, 24], [336, 214, 16], [66, 220, 14], [200, 24, 12]].map(([x, y, s]) => `<path d="${sparkle(x, y, s)}" ${S(c, '#ffe066', .5)}/>`).join(''),
    hearts:   c => [[56, 98, 12], [346, 86, 16], [338, 178, 9]].map(([x, y, s]) => `<path d="${heart(x, y, s)}" ${S(c, '#ff4d86', .6)}/>`).join(''),
    shock:    c => `<path d="M62 150 L34 138 M60 188 L30 190 M66 120 L46 100 M338 150 L366 138 M340 188 L370 190 M334 120 L354 100" ${L(c, .7)}/>`,
    question: c => `<text x="298" y="86" font-family="Arial Black,Impact,sans-serif" font-size="64" fill="#ffd23f" stroke="${c.st.ol ? '#1b1030' : 'none'}" stroke-width="${c.st.ol ? 4 : 0}" paint-order="stroke">?</text>`,
};

/* ═══════════════════════ CHEVEUX ═══════════════════════ */
const FRINGE = 'M100 165 C90 90 140 56 200 56 C262 56 312 90 300 165 C285 120 240 100 200 100 C160 100 115 120 100 165Z';
const CAP    = 'M100 160 C88 90 140 58 200 58 C262 58 312 90 300 160 C292 130 275 112 250 106 C225 128 160 128 130 106 C115 118 104 135 100 160Z';
const HAIRS = {
    none:   { name: 'Chauve' },
    buzz:   { name: 'Rasé',        front: c => shp(c, P('M104 150 C100 95 150 72 200 72 C250 72 300 95 296 150 C285 120 250 108 200 108 C150 108 115 120 104 150Z'), c.s.hairC, .6) },
    short:  { name: 'Court',       front: c => shp(c, P(CAP), c.s.hairC) },
    spiky:  { name: 'Hérissé',     front: c => shp(c, P('M100 160 L90 96 L130 112 L138 52 L172 100 L200 40 L228 100 L262 52 L270 112 L310 96 L300 160 C285 130 250 118 200 118 C150 118 115 130 100 160Z'), c.s.hairC) },
    mohawk: { name: 'Mohawk',      front: c => shp(c, P('M160 116 L156 66 L178 80 L186 28 L206 60 L228 24 L236 76 L248 62 L242 116 C222 100 180 100 160 116Z'), c.s.hairC) },
    long:   { name: 'Long',        back: c => shp(c, P('M92 150 C76 250 86 340 130 348 L270 348 C314 340 324 250 308 150 Z'), c.s.hairC), front: c => shp(c, P(FRINGE), c.s.hairC) },
    bob:    { name: 'Carré',       back: c => shp(c, P('M86 150 C76 232 82 266 100 276 L300 276 C318 266 324 232 314 150 Z'), c.s.hairC), front: c => shp(c, P('M96 176 C86 85 140 54 200 54 C262 54 314 85 304 176 L292 144 Q250 134 200 138 Q150 134 108 144 Z'), c.s.hairC) },
    ponytail:{ name: 'Queue',      back: c => shp(c, P('M285 104 C360 84 372 176 344 252 C332 214 322 180 296 152Z'), c.s.hairC) + C(292, 120, 9)(S(c, '#ff5fa2', .6)), front: c => shp(c, P(CAP), c.s.hairC) },
    pigtails:{ name: 'Couettes',   back: c => [64, 336].map(x => E(x, 196, 26, 60, x < 200 ? 10 : -10)(S(c, c.s.hairC))).join('') + [98, 302].map(x => C(x, 138, 9)(S(c, '#ff5fa2', .6))).join(''), front: c => shp(c, P(FRINGE), c.s.hairC) },
    buns:   { name: 'Macarons',    front: c => union(c, c.s.hairC, [C(124, 66, 32), C(276, 66, 32)]) + shp(c, P(CAP), c.s.hairC) },
    afro:   { name: 'Afro',        back: c => union(c, c.s.hairC, [C(200, 118, 128), C(110, 150, 52), C(290, 150, 52)]), front: c => shp(c, P('M112 152 C120 98 280 98 288 152 C262 120 138 120 112 152Z'), c.s.hairC, .6) },
    curly:  { name: 'Bouclé',      front: c => union(c, c.s.hairC, [C(118, 112, 30), C(158, 84, 32), C(204, 74, 34), C(250, 84, 32), C(288, 112, 30), C(104, 158, 22), C(296, 158, 22)]) },
    swept:  { name: 'Frange côté', front: c => shp(c, P('M98 176 C86 85 140 54 205 56 C270 58 312 95 302 168 C285 125 250 100 205 100 C200 130 140 150 98 176Z'), c.s.hairC) },
    messy:  { name: 'Ébouriffé',   front: c => shp(c, P('M96 165 C80 120 98 85 122 80 C118 52 165 50 180 66 C195 40 245 46 252 70 C285 58 312 100 300 130 C312 150 300 165 298 168 C280 125 235 112 200 112 C160 112 120 125 96 165Z'), c.s.hairC) },
    pompa:  { name: 'Banane',      front: c => shp(c, P('M100 155 C76 66 130 14 200 22 C270 14 324 66 300 155 C285 112 255 100 200 100 C145 100 115 112 100 155Z'), c.s.hairC) },
    topknot:{ name: 'Chignon',     front: c => union(c, c.s.hairC, [C(200, 52, 34)]) + shp(c, P(CAP), c.s.hairC) },
    braid:  { name: 'Tresse',      back: c => union(c, c.s.hairC, [E(310, 200, 16, 22), E(318, 240, 16, 22), E(312, 282, 16, 22), E(318, 322, 16, 22)]) + C(318, 346, 8)(S(c, '#ff5fa2', .6)), front: c => shp(c, P(CAP), c.s.hairC) },
    mullet: { name: 'Mulet',       back: c => shp(c, P('M95 160 C70 240 88 306 122 300 L130 252 L270 252 L278 300 C312 306 330 240 305 160 Z'), c.s.hairC), front: c => shp(c, P(CAP), c.s.hairC) },
    emo:    { name: 'Mèche',       front: c => shp(c, P('M98 192 C84 85 140 54 205 56 C270 58 312 95 304 180 C285 118 250 102 215 100 C205 150 170 195 150 215 C130 200 110 195 98 192Z'), c.s.hairC) },
};

/* ═══════════════════════ CHAPEAUX ═══════════════════════ */
const band = (c, x, y, w, h, col) => R(x, y, w, h, 14)(S(c, col, .8));
const HATS = {
    none:    { name: 'Aucun' },
    cap:     { name: 'Casquette', front: c => { const h = c.s.hatC; return shp(c, P('M104 128 C100 40 300 40 296 128Z'), h) + shp(c, P('M92 128 C150 156 250 156 308 128 C300 108 100 108 92 128Z'), shade(h, -.18)) + C(200, 48, 7)(`fill="${shade(h, -.3)}"`); } },
    capside: { name: 'Casq. biais', front: c => { const h = c.s.hatC; return shp(c, P('M104 128 C100 40 300 40 296 128Z'), h) + shp(c, P('M108 118 L26 136 C24 150 36 154 60 150 L116 140Z'), shade(h, -.18)) + `<path d="M200 46 V128" ${L(c, .4, shade(h, -.35))}/>`; } },
    beanie:  { name: 'Bonnet', front: c => { const h = c.s.hatC; return shp(c, P('M98 132 C94 30 306 30 302 132Z'), h) + [150, 180, 220, 250].map(x => `<path d="M${x} 56 V112" ${L(c, .3, shade(h, -.25))}/>`).join('') + band(c, 92, 104, 216, 38, shade(h, .12)) + C(200, 34, 22)(S(c, shade(h, .3), .8)); } },
    tophat:  { name: 'Haut-de-forme', front: c => { const h = c.s.hatC; return R(138, 4, 124, 96, 8)(S(c, h)) + R(138, 70, 124, 22, 0)(`fill="#ff5fa2"`) + E(200, 100, 108, 18)(S(c, h)); } },
    cowboy:  { name: 'Cowboy', front: c => { const h = c.s.hatC; return shp(c, P('M128 104 C122 44 150 40 172 58 C186 48 214 48 228 58 C250 40 278 44 272 104Z'), h) + shp(c, P('M50 96 C60 124 150 124 200 112 C250 124 340 124 350 96 C330 90 300 108 200 106 C100 108 70 90 50 96Z'), shade(h, -.12)) + `<path d="M130 94 Q200 110 270 94" ${L(c, .5, '#ffd23f')}/>`; } },
    crown:   { name: 'Couronne', front: c => { const h = c.s.hatC; return shp(c, P('M118 108 L108 36 L156 70 L200 26 L244 70 L292 36 L282 108Z'), h) + C(200, 82, 8)(`fill="#ff4d6d"`) + C(150, 90, 6)(`fill="#2fb8ff"`) + C(250, 90, 6)(`fill="#2fb8ff"`); } },
    party:   { name: 'Fête', front: c => { const h = c.s.hatC; return shp(c, P('M200 8 L262 104 L138 104Z'), h) + [[190, 60], [218, 76], [172, 88], [236, 94]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#ffd23f"/>`).join('') + C(200, 10, 14)(S(c, '#ffd23f', .7)); } },
    wizard:  { name: 'Sorcier', front: c => { const h = c.s.hatC; return shp(c, P('M136 100 C148 64 186 32 238 8 C226 40 250 70 264 100Z'), h) + shp(c, P('M80 100 C130 122 270 122 320 100 C290 80 110 80 80 100Z'), shade(h, -.15)) + `<polygon points="${star(200, 74, 14, 6)}" fill="#ffd23f"/>`; } },
    headset: { name: 'Casque gamer', front: c => { const h = c.s.hatC; return `<path d="M106 176 C98 22 302 22 294 176" fill="none" stroke="${lineOf(c, h)}" stroke-width="${16 + (c.st.ol || 0) * 2}" stroke-linecap="round"/><path d="M106 176 C98 22 302 22 294 176" fill="none" stroke="${h}" stroke-width="16" stroke-linecap="round"/>` + [-1, 1].map(s => R(s < 0 ? 78 : 286, 150, 36, 78, 16)(S(c, h))).join('') + [-1, 1].map(s => R(s < 0 ? 86 : 294, 164, 20, 50, 9)(`fill="${shade(h, .25)}"`)).join('') + `<path d="M90 224 Q94 276 156 268" ${L(c, .8, lineOf(c, h))}/><path d="M90 224 Q94 276 156 268" fill="none" stroke="${h}" stroke-width="5" stroke-linecap="round"/>` + E(162, 268, 15, 11)(S(c, shade(h, -.15))); } },
    catears: { name: 'Oreilles chat', front: c => { const h = c.s.hatC; return mirror(m => { const s = m ? -1 : 1, X = x => 200 + s * (x - 200); return P(`M${X(112)} 100 L${X(112)} 22 L${X(172)} 72Z`)(S(c, h)) + P(`M${X(124)} 86 L${X(124)} 50 L${X(152)} 74Z`)(`fill="${pinkIn}"`); }) + `<path d="M104 112 C130 62 270 62 296 112" ${L(c, .9, lineOf(c, h))}/><path d="M104 112 C130 62 270 62 296 112" fill="none" stroke="${h}" stroke-width="11" stroke-linecap="round"/>`; } },
    bunny:   { name: 'Oreilles lapin', front: c => { const h = c.s.hatC; return [[146, -10], [254, 10]].map(([x, r]) => E(x, 40, 24, 62, r)(S(c, h)) + E(x, 44, 11, 40, r)(`fill="${pinkIn}"`)).join('') + `<path d="M104 112 C130 62 270 62 296 112" fill="none" stroke="${lineOf(c, h)}" stroke-width="${12 + (c.st.ol || 0) * 2}" stroke-linecap="round"/><path d="M104 112 C130 62 270 62 296 112" fill="none" stroke="${h}" stroke-width="12" stroke-linecap="round"/>`; } },
    santa:   { name: 'Père Noël', front: c => { const h = c.s.hatC; return shp(c, P('M102 118 C102 38 238 22 300 104 L310 128Z'), h) + R(92, 98, 216, 38, 19)(S(c, '#fff', .9)) + C(304, 108, 19)(S(c, '#fff', .9)); } },
    chef:    { name: 'Toque', front: c => union(c, '#ffffff', [C(150, 58, 40), C(200, 40, 42), C(250, 58, 40), R(142, 60, 116, 56, 6)]) + band(c, 136, 98, 128, 30, '#f1efff') },
    bandana: { name: 'Bandana pirate', front: c => { const h = c.s.hatC; return shp(c, P('M98 130 C98 56 302 56 302 130 Q200 106 98 130Z'), h) + [[150, 82], [200, 74], [250, 82], [174, 100], [228, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#fff"/>`).join('') + shp(c, P('M298 118 L338 98 L332 140Z'), h) + shp(c, P('M298 124 L344 134 L316 154Z'), shade(h, -.12)); } },
    viking:  { name: 'Viking', back: c => '', front: c => { const h = c.s.hatC; return mirror(m => { const s = m ? -1 : 1, X = x => 200 + s * (x - 200); return P(`M${X(112)} 96 C${X(50)} 100 ${X(44)} 44 ${X(60)} 22 C${X(80)} 54 ${X(104)} 66 ${X(130)} 70Z`)(S(c, '#f4ead2')); }) + shp(c, P('M100 124 C100 40 300 40 300 124Z'), h) + band(c, 94, 100, 212, 28, shade(h, -.2)); } },
    halo:    { name: 'Auréole', front: c => `<ellipse cx="200" cy="40" rx="62" ry="15" fill="none" stroke="${lineOf(c, '#ffd23f')}" stroke-width="${14 + (c.st.ol || 0) * 2}"/><ellipse cx="200" cy="40" rx="62" ry="15" fill="none" stroke="${c.s.hatC}" stroke-width="14"/>` },
    devil:   { name: 'Cornes', front: c => mirror(m => { const s = m ? -1 : 1, X = x => 200 + s * (x - 200); return P(`M${X(128)} 94 C${X(100)} 76 ${X(102)} 40 ${X(130)} 24 C${X(132)} 48 ${X(150)} 62 ${X(168)} 76Z`)(S(c, c.s.hatC)); }) },
    propeller:{ name: 'Hélice', front: c => { const h = c.s.hatC; return shp(c, P('M98 132 C94 44 306 44 302 132Z'), h) + `<path d="M150 66 Q200 110 200 134 M250 66 Q200 110 200 134" ${L(c, .3, '#ffffff')}/>` + shp(c, P('M200 60 L200 46'), h) + E(166, 42, 34, 10, -8)(S(c, '#ffd23f', .8)) + E(234, 42, 34, 10, 8)(S(c, '#2fe3d0', .8)) + C(200, 44, 8)(S(c, '#ff4d4d', .7)); } },
    flowers: { name: 'Couronne fleurs', front: c => { const cols = [c.s.hatC, '#ffd23f', '#ffffff', c.s.hatC, '#ffd23f', '#ffffff', c.s.hatC]; let o = `<path d="M100 150 C100 60 300 60 300 150" ${L(c, .8, '#2f9e5f')}/>`; cols.forEach((col, i) => { const a = Math.PI + (i + .5) * Math.PI / 7, x = 200 + Math.cos(a) * 100 * 1.0, y = 148 + Math.sin(a) * 86; o += union(c, col, [C(x - 8, y, 10), C(x + 8, y, 10), C(x, y - 8, 10), C(x, y + 8, 10)]) + C(x, y, 5)('fill="#ff9a2f"'); }); return o; } },
};

/* ═══════════════════════ LUNETTES ═══════════════════════ */
const lensFill = '#bfe9ff';
const GLASSES = {
    none:   { name: 'Aucune' },
    round:  { name: 'Rondes',    front: c => mirror(m => { const x = m ? 242 : 158; return `<circle cx="${x}" cy="172" r="31" fill="${lensFill}" fill-opacity=".3" stroke="${c.s.glassesC}" stroke-width="${c.st.fw * .8}"/>`; }) + `<path d="M188 168 Q200 160 212 168" ${L(c, .7, c.s.glassesC)}/><path d="M127 168 L100 160 M273 168 L300 160" ${L(c, .7, c.s.glassesC)}/>` },
    square: { name: 'Carrées',   front: c => mirror(m => { const x = m ? 242 : 158; return `<rect x="${x - 31}" y="148" width="62" height="50" rx="9" fill="${lensFill}" fill-opacity=".3" stroke="${c.s.glassesC}" stroke-width="${c.st.fw * .8}"/>`; }) + `<path d="M189 166 H211 M127 164 L100 158 M273 164 L300 158" ${L(c, .7, c.s.glassesC)}/>` },
    sun:    { name: 'Soleil',    front: c => mirror(m => { const x = m ? 242 : 158; return P(`M${x - 34} 152 H${x + 34} V178 Q${x + 34} 202 ${x} 202 Q${x - 34} 202 ${x - 34} 178Z`)(S(c, c.s.glassesC, .7)) + `<path d="M${x - 22} 162 L${x - 8} 162 M${x - 22} 172 L${x - 14} 172" ${L(c, .3, '#ffffff')} opacity=".6"/>`; }) + `<path d="M190 158 H210 M124 156 L100 150 M276 156 L300 150" ${L(c, .7, c.s.glassesC)}/>` },
    deal:   { name: 'Deal with it', front: c => `<path d="M118 150 H282 V168 H266 V186 Q266 196 252 196 H232 Q218 196 218 186 V168 H182 V186 Q182 196 168 196 H148 Q134 196 134 186 V168 H118Z" ${S(c, c.s.glassesC, .8)}/><rect x="124" y="156" width="40" height="5" fill="#fff" opacity=".35"/><rect x="224" y="156" width="40" height="5" fill="#fff" opacity=".35"/>` },
    aviator:{ name: 'Aviateur',  front: c => mirror(m => { const s = m ? -1 : 1, X = x => 200 + s * (x - 200); return P(`M${X(124)} 152 H${X(190)} Q${X(194)} 200 ${X(160)} 206 Q${X(126)} 208 ${X(122)} 170Z`)(`fill="${c.s.glassesC}" fill-opacity=".72" stroke="#d9a520" stroke-width="${c.st.fw * .7}" stroke-linejoin="round"`); }) + `<path d="M190 158 H210" ${L(c, .6, '#d9a520')}/>` },
    heart:  { name: 'Cœurs',     front: c => mirror(m => { const x = m ? 242 : 158; return `<path d="${heart(x, 176, 32)}" fill="${c.s.glassesC}" fill-opacity=".85" stroke="${shade(c.s.glassesC, -.4)}" stroke-width="${c.st.fw * .6}" stroke-linejoin="round"/>`; }) },
    star:   { name: 'Étoiles',   front: c => mirror(m => { const x = m ? 242 : 158; return `<polygon points="${star(x, 174, 38, 18)}" fill="${c.s.glassesC}" fill-opacity=".85" stroke="${shade(c.s.glassesC, -.4)}" stroke-width="${c.st.fw * .6}" stroke-linejoin="round"/>`; }) },
    d3:     { name: '3D',        front: c => R(124, 152, 66, 46, 8)(`fill="#ff4d4d" fill-opacity=".8" stroke="${c.s.glassesC}" stroke-width="${c.st.fw * .9}"`) + R(210, 152, 66, 46, 8)(`fill="#2fe3d0" fill-opacity=".8" stroke="${c.s.glassesC}" stroke-width="${c.st.fw * .9}"`) + `<path d="M190 170 H210 M124 166 L100 160 M276 166 L300 160" ${L(c, .8, c.s.glassesC)}/>` },
    monocle:{ name: 'Monocle',   front: c => `<circle cx="242" cy="172" r="32" fill="${lensFill}" fill-opacity=".25" stroke="#d9a520" stroke-width="${c.st.fw * .8}"/><path d="M262 198 Q282 260 262 330" ${L(c, .35, '#d9a520')}/>` },
    patch:  { name: 'Cache-œil', front: c => `<path d="M100 130 L300 200" ${L(c, .45, '#2a2038')}/>` + E(158, 174, 32, 30, -10)(S(c, c.s.glassesC, .8)) },
    vr:     { name: 'Casque VR', front: c => `<path d="M112 164 L92 156 M288 164 L308 156" ${L(c, 1.3, shade(c.s.glassesC, .25))}/>` + R(108, 138, 184, 74, 26)(S(c, c.s.glassesC, .9)) + R(122, 150, 156, 50, 18)(`fill="#101020" opacity=".8"`) + `<path d="M130 160 H190" ${L(c, .3, '#ffffff')} opacity=".35"/>` },
    goggles:{ name: 'Steampunk', front: c => `<path d="M100 150 H300" ${L(c, 1.3, '#6b3d1f')}/>` + mirror(m => { const x = m ? 242 : 158; return `<circle cx="${x}" cy="172" r="33" fill="#8fe8ff" fill-opacity=".45" stroke="#b8731f" stroke-width="${c.st.fw * 1.4}"/><circle cx="${x}" cy="172" r="33" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2" stroke-dasharray="6 220" />`; }) },
    nerd:   { name: 'Binoclard', front: c => mirror(m => { const x = m ? 242 : 158; return `<circle cx="${x}" cy="172" r="31" fill="${lensFill}" fill-opacity=".3" stroke="${c.s.glassesC}" stroke-width="${c.st.fw * 1.1}"/>`; }) + `<path d="M188 168 Q200 160 212 168" ${L(c, .8, c.s.glassesC)}/><rect x="190" y="156" width="20" height="22" rx="3" fill="#fff" stroke="#1b1030" stroke-width="2.5" transform="rotate(-8 200 167)"/><path d="M193 167 H207 M200 160 V174" stroke="#9aa5b1" stroke-width="2.5" transform="rotate(-8 200 167)"/>` },
};

/* ═══════════════════════ ACCESSOIRES ═══════════════════════ */
const ACCS = {
    none:    { name: 'Aucun' },
    mustache:{ name: 'Moustache', over: c => P('M146 214 C160 190 194 202 200 212 C206 202 240 190 254 214 C240 226 212 216 200 214 C188 216 160 226 146 214Z')(S(c, c.s.accC)) },
    beard:   { name: 'Barbe', under: c => P('M98 196 C94 292 150 316 200 316 C250 316 306 292 302 196 C288 236 250 212 200 212 C150 212 112 236 98 196Z')(S(c, c.s.accC)) },
    goatee:  { name: 'Bouc', under: c => P('M166 256 Q200 322 234 256 Q200 276 166 256Z')(S(c, c.s.accC)) },
    bowtie:  { name: 'Nœud pap\'', over: c => P('M200 306 L152 284 L152 330Z')(S(c, c.s.accC)) + P('M200 306 L248 284 L248 330Z')(S(c, c.s.accC)) + R(190, 294, 20, 24, 6)(S(c, shade(c.s.accC, -.2))) },
    scarf:   { name: 'Écharpe', over: c => P('M112 288 Q200 326 288 288 L296 322 Q200 358 104 322Z')(S(c, c.s.accC)) + P('M226 332 L254 400 L216 404 L204 340Z')(S(c, shade(c.s.accC, -.15))) + `<path d="M222 372 L246 366 M219 388 L249 382" ${L(c, .3, shade(c.s.accC, -.45))}/>` },
    chain:   { name: 'Chaîne en or', over: c => `<path d="M132 304 Q200 384 268 304" fill="none" stroke="${lineOf(c, '#d9a520')}" stroke-width="${8 + (c.st.ol || 0) * 1.5}" stroke-linecap="round"/><path d="M132 304 Q200 384 268 304" fill="none" stroke="${c.s.accC}" stroke-width="8" stroke-linecap="round" stroke-dasharray="1 9"/>` + C(200, 358, 17)(S(c, c.s.accC, .8)) + `<path d="M200 349 V367 M193 355 H207" ${L(c, .3, shade(c.s.accC, -.5))}/>` },
    freckles:{ name: 'Taches de rousseur', over: c => { const d = shade(c.s.skin, -.28); return [[128, 204], [140, 214], [152, 206], [248, 206], [260, 214], [272, 204], [138, 198], [262, 198]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="${d}"/>`).join(''); } },
    mask:    { name: 'Masque', over: c => P('M112 204 Q200 216 288 204 L282 262 Q200 296 118 262Z')(S(c, c.s.accC, .8)) + `<path d="M130 224 Q200 236 270 224 M128 240 Q200 254 272 240" ${L(c, .25, shade(c.s.accC, -.25))}/><path d="M112 206 Q96 196 94 184 M288 206 Q304 196 306 184" ${L(c, .3, shade(c.s.accC, -.3))}/>` },
    bandaid: { name: 'Pansement', over: c => R(112, 196, 56, 24, 8, -24)(S(c, '#ffc9a0', .7)) + `<circle cx="140" cy="208" r="1.5" fill="#d99a70"/><circle cx="132" cy="212" r="1.5" fill="#d99a70"/>` },
    scar:    { name: 'Cicatrice', over: c => `<path d="M266 128 L236 214" ${L(c, .5, '#b83a4b')}/><path d="M258 150 L274 156 M252 170 L268 176 M246 190 L262 196" ${L(c, .3, '#b83a4b')}/>` },
    fangs:   { name: 'Crocs', over: c => P('M176 224 L184 246 L192 228Z')(S(c, '#fff', .5)) + P('M224 224 L216 246 L208 228Z')(S(c, '#fff', .5)) },
    lolly:   { name: 'Sucette', over: c => `<path d="M234 238 L304 306" ${L(c, .8, '#f1efff')}/>` + C(310, 312, 26)(S(c, c.s.accC, .8)) + `<path d="M310 312 m0 -2 a4 4 0 1 1 -2 6 a10 10 0 1 1 10 -14 a16 16 0 1 1 -20 20" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85"/>` },
    whisk:   { name: 'Moustaches chat', over: c => `<path d="M138 208 L84 196 M138 220 L80 224 M138 232 L88 250 M262 208 L316 196 M262 220 L320 224 M262 232 L312 250" ${L(c, .35)}/>` },
    clown:   { name: 'Nez de clown', over: c => C(200, 206, 17)(S(c, c.s.accC, .8)) + `<ellipse cx="194" cy="200" rx="5" ry="3.5" fill="#fff" opacity=".7"/>` },
    rosy:    { name: 'Grosses joues', over: c => `<circle cx="126" cy="212" r="22" fill="${c.s.accC}" opacity=".6"/><circle cx="274" cy="212" r="22" fill="${c.s.accC}" opacity=".6"/>` },
    ring:    { name: 'Boucles d\'oreille', over: c => { const ex = (HEADS[c.s.head] || HEADS.round).ex || 100; return [-1, 1].map(s => `<circle cx="${200 + s * (ex + 2)}" cy="222" r="13" fill="none" stroke="${lineOf(c, c.s.accC)}" stroke-width="${7 + (c.st.ol || 0)}"/><circle cx="${200 + s * (ex + 2)}" cy="222" r="13" fill="none" stroke="${c.s.accC}" stroke-width="6"/>`).join(''); } },
    phones:  { name: 'Casque autour du cou', over: c => `<path d="M122 280 Q200 346 278 280" fill="none" stroke="${lineOf(c, c.s.accC)}" stroke-width="${16 + (c.st.ol || 0) * 2}" stroke-linecap="round"/><path d="M122 280 Q200 346 278 280" fill="none" stroke="${c.s.accC}" stroke-width="16" stroke-linecap="round"/>` + [-1, 1].map(s => R(200 + s * 74 - 20, 296, 40, 54, 16)(S(c, shade(c.s.accC, -.1))) + R(200 + s * 74 - 11, 306, 22, 34, 9)(`fill="${shade(c.s.accC, .25)}"`)).join('') },
};

/* ═══════════════════════ T-SHIRTS ═══════════════════════ */
const TORSO = 'M100 408 L100 338 C100 302 142 286 200 286 C258 286 300 302 300 338 L300 408 Z';
const neckHole = (c, d) => P(d)(S(c, c.s.skin, .7));
const SHIRTS = {
    tee:    { name: 'T-shirt', body: c => neckHole(c, 'M160 288 Q200 328 240 288Z') },
    vneck:  { name: 'Col V', body: c => neckHole(c, 'M156 288 L200 340 L244 288Z') },
    hoodie: { name: 'Hoodie', body: c => P('M124 296 C130 250 270 250 276 296 C250 316 150 316 124 296Z')(S(c, shade(c.s.shirtC, -.22), .8)) + neckHole(c, 'M164 294 Q200 322 236 294Z') + `<path d="M178 312 V352 M222 312 V352" ${L(c, .4, '#f1efff')}/><circle cx="178" cy="356" r="5" fill="#f1efff"/><circle cx="222" cy="356" r="5" fill="#f1efff"/>` + P('M138 376 L262 376 L278 408 L122 408Z')(S(c, shade(c.s.shirtC, -.12), .7)) },
    stripes:{ name: 'Marinière', body: c => { let o = ''; for (let y = 300; y < 410; y += 26) o += `<rect x="90" y="${y}" width="220" height="12" fill="#f4f4fb"/>`; return o + neckHole(c, 'M160 288 Q200 326 240 288Z'); } },
    polo:   { name: 'Polo', body: c => neckHole(c, 'M164 288 L200 316 L236 288Z') + P('M156 286 L200 322 L170 336 L140 300Z')(S(c, shade(c.s.shirtC, .35), .7)) + P('M244 286 L200 322 L230 336 L260 300Z')(S(c, shade(c.s.shirtC, .35), .7)) + `<path d="M200 322 V372" ${L(c, .3, shade(c.s.shirtC, -.3))}/><circle cx="200" cy="340" r="3.5" fill="#fff"/><circle cx="200" cy="358" r="3.5" fill="#fff"/>` },
    hawaii: { name: 'Hawaïenne', body: c => [[130, 330, '#ff5fa2'], [260, 340, '#ffd23f'], [160, 380, '#ffd23f'], [236, 384, '#ff5fa2'], [200, 400, '#ffffff'], [124, 392, '#ffffff'], [280, 392, '#ffffff'], [150, 310, '#ffffff']].map(([x, y, col]) => [0, 72, 144, 216, 288].map(a => `<ellipse cx="${x}" cy="${y - 10}" rx="5" ry="9" fill="${col}" transform="rotate(${a} ${x} ${y})"/>`).join('') + `<circle cx="${x}" cy="${y}" r="3.5" fill="#ff9a2f"/>`).join('') + neckHole(c, 'M160 288 L200 342 L240 288Z') + P('M156 286 L200 346 L162 340 L140 304Z')(S(c, shade(c.s.shirtC, .3), .7)) + P('M244 286 L200 346 L238 340 L260 304Z')(S(c, shade(c.s.shirtC, .3), .7)) },
    jersey: { name: 'Maillot n°7', body: c => `<rect x="100" y="296" width="14" height="112" fill="#fff" opacity=".85"/><rect x="286" y="296" width="14" height="112" fill="#fff" opacity=".85"/>` + neckHole(c, 'M158 288 L200 330 L242 288Z') + `<text x="200" y="388" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-size="68" fill="#fff" stroke="${shade(c.s.shirtC, -.4)}" stroke-width="3">7</text>` },
    suit:   { name: 'Costume', sleeve: 'shirt', body: c => P('M162 288 L200 408 L238 288Z')(`fill="#ffffff"`) + P('M200 304 L190 322 L200 404 L210 322Z')(S(c, '#e63950', .6)) + P('M190 300 L210 300 L206 316 L194 316Z')(S(c, '#c42c40', .6)) + P('M162 286 L200 372 L146 350Z')(S(c, shade(c.s.shirtC, -.2), .7)) + P('M238 286 L200 372 L254 350Z')(S(c, shade(c.s.shirtC, -.2), .7)) },
    turtle: { name: 'Col roulé', body: c => '', over: c => R(158, 262, 84, 44, 18)(S(c, shade(c.s.shirtC, .12), .8)) + `<path d="M170 276 V298 M188 276 V298 M206 276 V298 M224 276 V298" ${L(c, .25, shade(c.s.shirtC, -.25))}/>` },
    gg:     { name: 'T-shirt GG', body: c => neckHole(c, 'M160 288 Q200 328 240 288Z') + `<text x="200" y="378" text-anchor="middle" font-family="Arial Black,Impact,sans-serif" font-size="58" fill="#fff" stroke="${shade(c.s.shirtC, -.45)}" stroke-width="3" letter-spacing="2">GG</text>` },
    heart:  { name: 'T-shirt cœur', body: c => neckHole(c, 'M160 288 Q200 328 240 288Z') + P(heart(200, 356, 28))(S(c, '#ff4d6d', .7)) },
    overall:{ name: 'Salopette', undershirt: '#f1efff', sleeve: '#f1efff', body: c => { const d = c.s.shirtC; return neckHole(c, 'M160 288 Q200 322 240 288Z') + R(94, 362, 212, 50, 0)(`fill="${d}"`) + P('M146 408 V340 Q146 330 156 330 H244 Q254 330 254 340 V408Z')(S(c, d, .8)) + `<path d="M154 336 L128 296 M246 336 L272 296" fill="none" stroke="${lineOf(c, d)}" stroke-width="${22 + (c.st.ol || 0) * 2}" stroke-linecap="round"/><path d="M154 336 L128 296 M246 336 L272 296" fill="none" stroke="${d}" stroke-width="22" stroke-linecap="round"/><circle cx="154" cy="338" r="6" fill="#ffd23f"/><circle cx="246" cy="338" r="6" fill="#ffd23f"/><rect x="178" y="356" width="44" height="28" rx="5" fill="${shade(d, -.18)}"/>`; } },
    sweater:{ name: 'Pull torsadé', body: c => { let o = ''; for (let y = 318; y < 410; y += 26) o += `<path d="M100 ${y} ${Array.from({ length: 11 }, (_, i) => `L${100 + (i + 1) * 20} ${y + (i % 2 ? 0 : 10)}`).join(' ')}" ${L(c, .3, shade(c.s.shirtC, -.22))}/>`; return o + neckHole(c, 'M160 288 Q200 322 240 288Z'); } },
    tank:   { name: 'Débardeur', sleeve: 'skin', base: 'skin', body: c => P('M132 408 L132 336 C136 308 156 292 170 288 C178 326 222 326 230 288 C244 292 264 308 268 336 L268 408Z')(S(c, c.s.shirtC, .8)) },
    creeper:{ name: 'Pixel', body: c => { const d = shade(c.s.shirtC, -.5); return neckHole(c, 'M160 288 Q200 322 240 288Z') + [[158, 330], [210, 330], [184, 354], [166, 366], [218, 366]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="${i > 1 ? 18 : 30}" height="${i > 1 ? 22 : 30}" fill="${d}"/>`).join('') + `<rect x="184" y="354" width="32" height="22" fill="${d}"/>`; } },
};

/* ═══════════════════════ POSES ═══════════════════════ */
const limb = (c, d, col, w = 46) => ((c.st.ol || 0) > 0 ? `<path d="${d}" fill="none" stroke="${lineOf(c, col)}" stroke-width="${w + c.st.ol * 2}" stroke-linecap="round" stroke-linejoin="round"/>` : '') + `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const hand = (c, x, y, r = 25) => C(x, y, r)(S(c, c.s.skin, .85));
const armL = c => limb(c, 'M122 338 Q92 374 100 414', c.sleeve) + hand(c, 100, 406);
const armR = c => limb(c, 'M278 338 Q308 374 300 414', c.sleeve) + hand(c, 300, 406);
const fingers = (c, list) => list.map(([x, y, rx, ry, r]) => E(x, y, rx, ry, r)(S(c, c.s.skin, .7))).join('');
const POSES = {
    neutral: { name: 'Neutre',   under: c => armL(c) + armR(c) },
    wave:    { name: 'Salut',    under: c => armL(c) + limb(c, 'M280 338 Q348 334 340 254', c.sleeve) + hand(c, 340, 228, 27) + `<path d="M366 198 Q384 228 366 258 M376 188 Q398 228 376 268" ${L(c, .55)}/>` },
    cheer:   { name: 'Victoire', under: c => limb(c, 'M122 338 Q48 322 56 234', c.sleeve) + hand(c, 56, 208, 27) + limb(c, 'M278 338 Q352 322 344 234', c.sleeve) + hand(c, 344, 208, 27) },
    hearts:  { name: 'Cœur',     under: c => limb(c, 'M122 340 Q116 396 176 384', c.sleeve) + limb(c, 'M278 340 Q284 396 224 384', c.sleeve) + hand(c, 178, 378, 22) + hand(c, 222, 378, 22), over: c => P(heart(200, 346, 26))(S(c, '#ff4d86', .8)) },
    facepalm:{ name: 'Facepalm', under: c => armL(c) + limb(c, 'M280 338 Q338 336 296 240', c.sleeve), over: c => fingers(c, [[218, 150, 9, 24, -14], [238, 142, 9, 26, -4], [258, 142, 9, 26, 6], [276, 152, 9, 24, 16]]) + C(250, 192, 36)(S(c, c.s.skin, .85)) },
    thumbs:  { name: 'Pouce',    under: c => armL(c) + limb(c, 'M280 338 Q340 356 324 306', c.sleeve) + E(324, 258, 11, 22, 8)(S(c, c.s.skin, .7)) + C(324, 292, 27)(S(c, c.s.skin, .85)) + `<path d="M308 298 H340 M308 310 H338" ${L(c, .25, shade(c.s.skin, -.3))}/>` },
    crossed: { name: 'Bras croisés', under: c => limb(c, 'M122 340 Q134 396 262 368', c.sleeve) + limb(c, 'M278 340 Q266 400 138 384', c.sleeve) + hand(c, 262, 368, 22) + hand(c, 138, 384, 22) },
    shrug:   { name: 'Bof',      under: c => limb(c, 'M122 338 Q64 356 50 298', c.sleeve) + hand(c, 48, 272, 26) + limb(c, 'M278 338 Q336 356 350 298', c.sleeve) + hand(c, 352, 272, 26) },
    chin:    { name: 'Réfléchit',under: c => armL(c) + limb(c, 'M280 338 Q316 310 262 282', c.sleeve), over: c => E(228, 252, 8, 18, -10)(S(c, c.s.skin, .7)) + C(240, 276, 24)(S(c, c.s.skin, .85)) },
    peace:   { name: 'Peace',    under: c => armL(c) + limb(c, 'M280 338 Q338 338 322 284', c.sleeve) + fingers(c, [[312, 226, 8, 24, -12], [336, 228, 8, 24, 12]]) + hand(c, 322, 266, 27) },
};

/* ═══════════════════════ ASSEMBLAGE ═══════════════════════ */
const VIEWS = { bust: [0, 0, 400, 400], head: [62, 4, 276, 276] };

const DEFAULT = { head: 'round', skin: '#ffdbc0', hair: 'short', hairC: '#3b2a20', eyes: 'round', eyeC: '#3b82f6', hat: 'none', hatC: '#9146ff', glasses: 'none', glassesC: '#1b1030', acc: 'none', accC: '#3b2a20', shirt: 'tee', shirtC: '#9146ff', expr: 'content', pose: 'neutral', style: 'cartoon' };

function normalize(s) {
    const o = { ...DEFAULT, ...s };
    if (!HEADS[o.head]) o.head = 'round';
    if (!HAIRS[o.hair]) o.hair = 'none';
    if (!EYES[o.eyes]) o.eyes = 'round';
    if (!HATS[o.hat]) o.hat = 'none';
    if (!GLASSES[o.glasses]) o.glasses = 'none';
    if (!ACCS[o.acc]) o.acc = 'none';
    if (!SHIRTS[o.shirt]) o.shirt = 'tee';
    if (!EXPRS[o.expr]) o.expr = 'content';
    if (!POSES[o.pose]) o.pose = 'neutral';
    if (!STYLES[o.style]) o.style = 'cartoon';
    return o;
}

/**
 * Construit le SVG complet.
 * opts: view ('bust'|'head'), uid, size, bg {mode:'none'|'solid'|'gradient', c1, c2, shape:'square'|'circle'|'rounded'}
 */
function buildSVG(state, opts = {}) {
    const s = normalize(state);
    const st = STYLES[s.style];
    const uid = opts.uid || ('q' + (++uidN) + '_');
    const c = { s, st, id: uid, feat: st.feat || '#1b1030' };
    const sh = SHIRTS[s.shirt], head = HEADS[s.head], hair = HAIRS[s.hair], hat = HATS[s.hat], gl = GLASSES[s.glasses], ac = ACCS[s.acc];
    c.sleeve = sh.sleeve === 'skin' ? s.skin : (sh.sleeve && sh.sleeve !== 'shirt' ? sh.sleeve : s.shirtC);
    const ex = EXPRS[s.expr], pose = POSES[s.pose];
    const view = VIEWS[opts.view || 'bust'];
    const g = fn => (fn ? fn(c) : '');

    let body = '';
    body += g(hair.back) + g(head.back);
    // cou + torse
    body += R(176, 244, 48, 66, 6)(S(c, s.skin, .8)) + R(176, 244, 48, 18, 0)(`fill="${shade(s.skin, -.14)}" opacity=".0"`);
    const torsoBase = sh.base === 'skin' ? s.skin : (sh.undershirt || s.shirtC);
    body += P(TORSO)(S(c, torsoBase));
    body += `<clipPath id="${uid}t"><path d="${TORSO}"/></clipPath><g clip-path="url(#${uid}t)">${g(sh.body)}</g>`;
    body += shadeOver(c, 'ts', P(TORSO), torsoBase, [100, 286, 200, 122], true);
    body += g(sh.over);
    body += g(pose.under);
    // tête
    if (!head.noEars) body += earsSVG(c, head.ex);
    body += head.shape(S(c, s.skin));
    body += shadeOver(c, 'hs', a => head.shape(a), s.skin, head.box);
    body += g(head.front);
    body += g(ac.under);
    // visage
    const bw = BROWS[ex.brows];
    body += `<g class="mq-face">${ex.fx && ex.fx.includes('blush') ? FX.blush(c) : ''}${ex.fx && ex.fx.includes('blushBig') ? FX.blushBig(c) : ''}${eyesSVG(c, ex.eyes)}${MOUTHS[ex.mouth](c)}${bw ? bw.map(d => `<path d="${d}" ${L(c, .9)}/>`).join('') : ''}</g>`;
    body += g(ac.over);
    body += g(gl.front);
    body += g(hair.front);
    body += g(hat.front);
    body += g(pose.over);
    if (ex.fx) body += ex.fx.filter(f => f !== 'blush' && f !== 'blushBig').map(f => FX[f](c)).join('');

    // fond
    const bg = opts.bg || { mode: 'none' };
    const [vx, vy, vw, vh] = view;
    let bgSVG = '', clip = '';
    if (bg.mode === 'solid') bgSVG = `<rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="${bg.c1}"/>`;
    if (bg.mode === 'gradient') bgSVG = `<linearGradient id="${uid}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg.c1}"/><stop offset="1" stop-color="${bg.c2}"/></linearGradient><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" fill="url(#${uid}bg)"/>`;
    if (bg.shape === 'circle') clip = `<clipPath id="${uid}bc"><circle cx="${vx + vw / 2}" cy="${vy + vh / 2}" r="${vw / 2}"/></clipPath>`;
    else if (bg.shape === 'rounded') clip = `<clipPath id="${uid}bc"><rect x="${vx}" y="${vy}" width="${vw}" height="${vh}" rx="${vw * .2}"/></clipPath>`;

    const filt = st.halo ? `<filter id="${uid}f" x="-15%" y="-15%" width="130%" height="130%"><feMorphology in="SourceAlpha" operator="dilate" radius="10" result="d"/><feGaussianBlur in="d" stdDeviation="6" result="sb"/><feOffset in="sb" dy="6" result="so"/><feFlood flood-color="#000" flood-opacity=".28"/><feComposite in2="so" operator="in" result="shadow"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="w"/><feMerge><feMergeNode in="shadow"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : '';
    const size = opts.size ? ` width="${opts.size}" height="${opts.size}"` : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view.join(' ')}"${size}><defs>${filt}${clip}</defs><g ${clip ? `clip-path="url(#${uid}bc)"` : ''}>${bgSVG}<g class="mq-all" ${st.halo ? `filter="url(#${uid}f)"` : ''}>${body}</g></g></svg>`;
}

const svgURL = svg => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
const svgToImage = svg => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = svgURL(svg); });

/** Rend le SVG dans un canvas carré (gère le style Pixel : basse définition + palette réduite) */
async function renderCanvas(state, size, opts = {}) {
    const st = STYLES[normalize(state).style];
    const svg = buildSVG(state, { ...opts, size });
    const img = await svgToImage(svg);
    const cv = document.createElement('canvas'); cv.width = cv.height = size;
    const ctx = cv.getContext('2d');
    if (st.pixel) {
        const res = Math.min(size, st.px || 64);
        const sm = document.createElement('canvas'); sm.width = sm.height = res;
        const sx = sm.getContext('2d'); sx.drawImage(img, 0, 0, res, res);
        const id = sx.getImageData(0, 0, res, res), d = id.data;
        for (let i = 0; i < d.length; i += 4) { d[i] = Math.round(d[i] / 51) * 51; d[i + 1] = Math.round(d[i + 1] / 51) * 51; d[i + 2] = Math.round(d[i + 2] / 51) * 51; d[i + 3] = d[i + 3] > 110 ? 255 : 0; }
        sx.putImageData(id, 0, 0);
        ctx.imageSmoothingEnabled = false; ctx.drawImage(sm, 0, 0, size, size);
    } else ctx.drawImage(img, 0, 0, size, size);
    return cv;
}

/* ─── Aléatoire ─── */
const pick = a => a[Math.floor(Math.random() * a.length)];
const keys = o => Object.keys(o);
function randomState(base = {}) {
    return normalize({
        ...base,
        head: pick(keys(HEADS)), skin: Math.random() < .55 ? pick(PALETTES.skin.slice(0, 6)) : pick(PALETTES.skin),
        hair: pick(keys(HAIRS)), hairC: pick(PALETTES.hair), eyes: pick(keys(EYES)), eyeC: pick(PALETTES.any),
        hat: Math.random() < .45 ? pick(keys(HATS)) : 'none', hatC: pick(PALETTES.any),
        glasses: Math.random() < .35 ? pick(keys(GLASSES)) : 'none', glassesC: pick(['#1b1030', '#ff5fa2', '#ffd23f', '#2fb8ff', '#ffffff']),
        acc: Math.random() < .45 ? pick(keys(ACCS)) : 'none', accC: pick(PALETTES.any),
        shirt: pick(keys(SHIRTS)), shirtC: pick(PALETTES.any),
    });
}

/* ─── Catégories pour l'UI ─── */
const CATS = [
    { key: 'head',    label: 'Tête',       icon: 'fa-face-smile',    items: HEADS,   color: 'skin',     palette: 'skin', view: 'head' },
    { key: 'hair',    label: 'Cheveux',    icon: 'fa-scissors',      items: HAIRS,   color: 'hairC',    palette: 'hair', view: 'head' },
    { key: 'eyes',    label: 'Yeux',       icon: 'fa-eye',           items: EYES,    color: 'eyeC',     palette: 'any',  view: 'head' },
    { key: 'hat',     label: 'Chapeaux',   icon: 'fa-hat-wizard',    items: HATS,    color: 'hatC',     palette: 'any',  view: 'head' },
    { key: 'glasses', label: 'Lunettes',   icon: 'fa-glasses',       items: GLASSES, color: 'glassesC', palette: 'any',  view: 'head' },
    { key: 'acc',     label: 'Accessoires',icon: 'fa-gem',           items: ACCS,    color: 'accC',     palette: 'any',  view: 'bust' },
    { key: 'shirt',   label: 'T-shirts',   icon: 'fa-shirt',         items: SHIRTS,  color: 'shirtC',   palette: 'any',  view: 'bust' },
];

return { buildSVG, renderCanvas, svgToImage, svgURL, normalize, randomState, shade, DEFAULT, STYLES, EXPRS, POSES, PALETTES, CATS, HEADS, HAIRS, EYES, HATS, GLASSES, ACCS, SHIRTS };
})();
