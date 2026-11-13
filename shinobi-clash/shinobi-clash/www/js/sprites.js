'use strict';
const Sprites = (() => {
  const W = 960, H = 540;
  const rnd = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  let sky = null, fg = null;
  const lerp = (a, b, t) => a + (b - a) * t;

  function statue(c, x, y, d, kind) {
    c.save(); c.translate(x, y); c.scale(d, 1);
    const g = c.createLinearGradient(-70, 0, 70, 0);
    g.addColorStop(0, '#b4bac5'); g.addColorStop(0.6, '#8b919d'); g.addColorStop(1, '#646a77');
    c.fillStyle = g; c.strokeStyle = '#4b505c'; c.lineWidth = 2; c.lineCap = 'round'; c.lineJoin = 'round';
    c.beginPath(); c.moveTo(-64, 0); c.lineTo(-48, -120); c.lineTo(48, -120); c.lineTo(68, 0); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(-52, -118); c.lineTo(-66, -215); c.lineTo(-30, -234); c.lineTo(30, -234); c.lineTo(60, -215); c.lineTo(50, -118); c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#5a606c'; c.lineWidth = 3;
    for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(-44, -130 - i * 22); c.lineTo(46, -130 - i * 22); c.stroke(); }
    c.lineWidth = 26; c.strokeStyle = '#8b919d'; c.beginPath(); c.moveTo(52, -205); c.lineTo(94, -222); c.lineTo(82, -284); c.stroke();
    c.fillStyle = '#9aa0ac'; c.fillRect(68, -322, 28, 44);
    c.strokeStyle = '#5a606c'; c.lineWidth = 2; c.strokeRect(68, -322, 28, 44);
    c.fillStyle = g; c.beginPath(); c.arc(0, -260, 27, 0, 7); c.fill(); c.stroke();
    c.fillStyle = kind ? '#595f6c' : '#6c727f'; c.beginPath();
    if (kind) { c.moveTo(-30, -255); c.lineTo(-36, -300); c.lineTo(-6, -290); c.lineTo(0, -314); c.lineTo(10, -288); c.lineTo(38, -296); c.lineTo(30, -250); c.lineTo(20, -272); c.lineTo(-18, -272); }
    else { c.moveTo(-30, -250); c.lineTo(-46, -200); c.lineTo(-30, -150); c.lineTo(-24, -240); c.lineTo(-20, -285); c.lineTo(10, -294); c.lineTo(34, -270); c.lineTo(26, -250); c.lineTo(10, -268); c.lineTo(-14, -266); }
    c.closePath(); c.fill(); c.stroke();
    c.strokeStyle = '#555b67'; c.lineWidth = 2; c.beginPath(); c.moveTo(8, -258); c.lineTo(20, -258); c.moveTo(4, -246); c.lineTo(18, -246); c.stroke();
    c.restore();
  }
  function cliff(c, x0, x1, top, flip) {
    const g = c.createLinearGradient(0, top, 0, 430); g.addColorStop(0, '#6d717e'); g.addColorStop(1, '#383b46');
    c.fillStyle = g; c.beginPath(); c.moveTo(x0, top);
    const n = 6; for (let i = 0; i <= n; i++) { const t = i / n; c.lineTo(lerp(x0, x1, flip ? 1 - t : t), top + (i === n ? 0 : rnd(i + x0) * 14)); }
    c.lineTo(x1, 440); c.lineTo(x0, 440); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(15,16,22,.45)'; c.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const rx = lerp(x0, x1, rnd(i + x0 * .1)), ry = top + 10 + rnd(i * 3 + x1) * 90; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + (rnd(i + 4) - .5) * 30, ry + 20 + rnd(i + 8) * 40); c.stroke(); }
    c.fillStyle = '#7f8460'; c.fillRect(Math.min(x0, x1), top - 4, Math.abs(x1 - x0), 8);
  }
  function build() {
    sky = document.createElement('canvas'); sky.width = W; sky.height = H;
    let c = sky.getContext('2d');
    let g = c.createLinearGradient(0, 0, 0, 420); g.addColorStop(0, '#2f86d8'); g.addColorStop(0.6, '#7cc0f0'); g.addColorStop(1, '#d6efff');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    g = c.createRadialGradient(W / 2, 120, 0, W / 2, 120, 380); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    fg = document.createElement('canvas'); fg.width = W; fg.height = H; c = fg.getContext('2d');
    [['#86aacb', 300, 60], ['#6990b3', 345, 50]].forEach((l, k) => {
      c.fillStyle = l[0]; c.beginPath(); c.moveTo(0, 440);
      for (let x = 0; x <= W; x += 30) c.lineTo(x, l[1] - rnd(x * (k + 1)) * l[2] - Math.sin(x * .012 + k) * 22);
      c.lineTo(W, 440); c.closePath(); c.fill();
    });
    g = c.createLinearGradient(0, 390, 0, 440); g.addColorStop(0, '#4f97d6'); g.addColorStop(1, '#2a5f98');
    c.fillStyle = g; c.fillRect(230, 395, 500, 50);
    [[232, 292], [668, 728]].forEach(w => {
      const wg = c.createLinearGradient(0, 250, 0, 440); wg.addColorStop(0, '#3a3e4a'); wg.addColorStop(1, '#262932');
      c.fillStyle = wg; c.fillRect(w[0] - 6, 250, w[1] - w[0] + 12, 190);
      const f = c.createLinearGradient(w[0], 0, w[1], 0); f.addColorStop(0, '#9fd0f5'); f.addColorStop(.5, '#eaf7ff'); f.addColorStop(1, '#9fd0f5');
      c.fillStyle = f; c.fillRect(w[0], 258, w[1] - w[0], 182);
    });
    cliff(c, 0, 232, 335, false); cliff(c, 728, 960, 335, true);
    statue(c, 118, 338, 1, 0); statue(c, 842, 338, -1, 1);
    g = c.createLinearGradient(0, 425, 0, H); g.addColorStop(0, '#8a6a48'); g.addColorStop(.35, '#6b4f36'); g.addColorStop(1, '#3d2a1d');
    c.fillStyle = g; c.fillRect(0, 425, W, H - 425);
    c.fillStyle = 'rgba(255,230,170,.18)'; c.fillRect(0, 425, W, 4);
    c.lineCap = 'round';
    for (let i = 0; i < 30; i++) {
      let x = rnd(i * 2.1) * W, y = 436 + rnd(i * 3.7) * 100, a = rnd(i) * 6.28;
      const seg = []; seg.push([x, y]);
      for (let k = 0; k < 5; k++) { a += (rnd(i * 9 + k) - .5) * 1.6; x += Math.cos(a) * (14 + rnd(k + i) * 22); y += Math.sin(a) * 6 * (1 + (y - 425) / 120); seg.push([x, y]); }
      [['rgba(150,120,85,.5)', 1, 1.5], ['#2a1a10', 2.4, 0]].forEach(s => { c.strokeStyle = s[0]; c.lineWidth = s[1]; c.beginPath(); seg.forEach((p, j) => j ? c.lineTo(p[0], p[1] + s[2]) : c.moveTo(p[0], p[1] + s[2])); c.stroke(); });
    }
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(${40 + rnd(i) * 50 | 0},${30 + rnd(i) * 30 | 0},25,.6)`; c.beginPath(); c.ellipse(rnd(i * 5) * W, 440 + rnd(i * 7) * 95, 2 + rnd(i) * 6, 1 + rnd(i) * 2.5, 0, 0, 7); c.fill(); }
  }
  function background(c, t) {
    if (!sky) build();
    c.drawImage(sky, 0, 0);
    c.fillStyle = 'rgba(255,255,255,.85)';
    for (let i = 0; i < 7; i++) {
      const x = ((rnd(i) * W * 1.4) + t * (6 + rnd(i + 5) * 8)) % (W + 400) - 200, y = 40 + rnd(i + 2) * 140, s = 0.7 + rnd(i + 9) * .8;
      c.beginPath(); for (let k = 0; k < 5; k++) c.ellipse(x + k * 34 * s, y + Math.sin(k * 1.7) * 8 * s, 40 * s, 18 * s, 0, 0, 7); c.fill();
    }
    c.drawImage(fg, 0, 0);
    [[232, 292], [668, 728]].forEach((w, wi) => {
      c.save(); c.beginPath(); c.rect(w[0], 258, w[1] - w[0], 182); c.clip();
      for (let i = 0; i < 16; i++) {
        const x = w[0] + rnd(i + wi * 20) * (w[1] - w[0]), sp = 330 * (0.7 + rnd(i + 9) * .6), len = 40 + rnd(i + 3) * 50;
        const y = 258 + ((t * sp + rnd(i + 3) * 400) % 260) - 60;
        c.strokeStyle = `rgba(255,255,255,${.4 + rnd(i) * .4})`; c.lineWidth = 2 + rnd(i + 1) * 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + len); c.stroke();
      }
      c.restore();
      for (let i = 0; i < 9; i++) { const mx = (w[0] + w[1]) / 2 + Math.sin(t * .8 + i) * 50, my = 430 - rnd(i) * 22 - Math.abs(Math.sin(t * 1.3 + i)) * 8; c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.arc(mx, my, 18 + rnd(i + 4) * 16, 0, 7); c.fill(); }
    });
    c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5;
    for (let i = 0; i < 12; i++) { const x = 300 + rnd(i) * 360, y = 402 + (i % 4) * 9, o = Math.sin(t * 2 + i) * 6; c.beginPath(); c.moveTo(x + o, y); c.lineTo(x + 24 + o, y); c.stroke(); }
    for (let i = 0; i < 9; i++) {
      const x = ((rnd(i + 30) * (W + 300)) + t * (10 + rnd(i) * 14)) % (W + 300) - 150, y = 405 + rnd(i + 6) * 40;
      c.fillStyle = 'rgba(255,255,255,.1)'; c.beginPath(); c.ellipse(x, y, 110, 22, 0, 0, 7); c.fill();
    }
  }

  function head(c, who, r, front, shar) {
    const N = who === 'naruto';
    const hair = N ? '#ffd530' : '#17171f', skin = N ? '#f6c8a0' : '#f3cfb0';
    const pts = N ? [[-1.1, .1], [-1.5, -.45], [-.95, -.5], [-1.15, -1.15], [-.5, -.9], [-.4, -1.6], [0, -1], [.45, -1.5], [.6, -.9], [1.1, -1.0], [.98, -.4], [1.1, .1]]
                  : [[-1.1, .2], [-1.6, -.3], [-1.0, -.45], [-1.4, -1.0], [-.65, -.85], [-.7, -1.5], [-.1, -1], [.35, -1.45], [.5, -.9], [1.0, -1.0], [.95, -.3], [1.08, .1]];
    c.fillStyle = hair; c.strokeStyle = N ? '#b88a10' : '#000'; c.lineWidth = 1.2; c.beginPath();
    pts.forEach((p, i) => i ? c.lineTo(p[0] * r, p[1] * r) : c.moveTo(p[0] * r, p[1] * r)); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = skin; c.beginPath(); c.arc(0, 0, r * .95, 0, 7); c.fill(); c.stroke();
    c.save(); c.beginPath(); c.arc(0, 0, r * .95, 0, 7); c.clip();
    if (N) {
      c.fillStyle = '#2d4fa8'; c.fillRect(-r, -r * .66, r * 2, r * .36);
      c.fillStyle = '#c9d2e4'; c.fillRect(-r * .38, -r * .66, r * .76, r * .36);
      c.strokeStyle = '#555'; c.lineWidth = 1; c.strokeRect(-r * .38, -r * .66, r * .76, r * .36);
      c.fillStyle = hair; c.beginPath(); c.moveTo(-r, -r * .66); c.lineTo(-r * .6, -r * .95); c.lineTo(-r * .3, -r * .66); c.lineTo(r * .3, -r * .66); c.lineTo(r * .6, -r * .95); c.lineTo(r, -r * .66); c.lineTo(r, -r * 1.2); c.lineTo(-r, -r * 1.2); c.fill();
    } else {
      c.fillStyle = hair; c.beginPath();
      [[-.98, 0], [-.95, -.95], [-.4, -.75], [-.3, -.1], [.1, -.55], [.45, -.85], [.7, -.4], [.98, -.1], [.98, -1], [-.98, -1]].forEach((p, i) => i ? c.lineTo(p[0] * r, p[1] * r) : c.moveTo(p[0] * r, p[1] * r)); c.fill();
    }
    c.restore();
    const xs = front ? [-.42, .42] : [.1, .6];
    xs.forEach(ex => {
      const x = ex * r, y = r * .08;
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x, y, r * .17, r * .2, 0, 0, 7); c.fill();
      c.fillStyle = shar ? '#d00' : (N ? '#2a8aff' : '#222'); c.beginPath(); c.arc(x + (front ? 0 : r * .04), y, r * .12, 0, 7); c.fill();
      if (shar) { c.fillStyle = '#000'; c.beginPath(); c.arc(x, y, r * .035, 0, 7); c.fill(); for (let k = 0; k < 3; k++) { c.beginPath(); c.arc(x + Math.cos(k * 2.09) * r * .08, y + Math.sin(k * 2.09) * r * .08, r * .025, 0, 7); c.fill(); } }
      else { c.fillStyle = '#000'; c.beginPath(); c.arc(x, y, r * .05, 0, 7); c.fill(); }
      c.strokeStyle = '#222'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x - r * .2, y - r * .22); c.lineTo(x + r * .2, y - r * .18); c.stroke();
      if (N) { c.strokeStyle = '#9a5e34'; c.lineWidth = 1.1; for (let k = 0; k < 3; k++) { const yy = y + r * (.2 + k * .1); c.beginPath(); c.moveTo(x - r * .2, yy); c.lineTo(x + r * .2, yy + (k - 1) * r * .03); c.stroke(); } }
    });
    c.strokeStyle = '#7a3b2a'; c.lineWidth = 1.5; c.beginPath(); const mx = front ? 0 : r * .4; c.moveTo(mx - r * .18, r * .55); c.quadraticCurveTo(mx, r * (N ? .72 : .6), mx + r * .18, r * .55); c.stroke();
  }
  function portrait(c, who, x, y, w, h, shar) {
    const N = who === 'naruto';
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    const g = c.createLinearGradient(x, y, x, y + h); g.addColorStop(0, N ? '#ffd57a' : '#8a7bea'); g.addColorStop(1, N ? '#ff7a1a' : '#241a52');
    c.fillStyle = g; c.fillRect(x, y, w, h);
    c.fillStyle = 'rgba(255,255,255,.16)';
    for (let i = 0; i < 8; i++) { const a = i * .785; c.beginPath(); c.moveTo(x + w / 2, y + h * .55); c.lineTo(x + w / 2 + Math.cos(a) * 200, y + h * .55 + Math.sin(a) * 200); c.lineTo(x + w / 2 + Math.cos(a + .2) * 200, y + h * .55 + Math.sin(a + .2) * 200); c.fill(); }
    const r = h * .33; c.translate(x + w / 2, y + h * .5);
    c.fillStyle = N ? '#ff8a1c' : '#2e438f'; c.beginPath(); c.ellipse(0, r * 1.9, r * 1.7, r, 0, 0, 7); c.fill();
    if (N) { c.fillStyle = '#1c1c28'; c.fillRect(-r * .25, r * .9, r * .5, r * 1.2); c.fillRect(-r * 1.6, r * 1.45, r * .7, r * .3); c.fillRect(r * .9, r * 1.45, r * .7, r * .3); }
    else { c.fillStyle = '#1f2d6a'; c.beginPath(); c.moveTo(-r * 1.2, r * 1.5); c.lineTo(-r * 1.05, r * .2); c.lineTo(-r * .5, r * .9); c.lineTo(-r * .4, r * 1.5); c.fill(); c.beginPath(); c.moveTo(r * 1.2, r * 1.5); c.lineTo(r * 1.05, r * .2); c.lineTo(r * .5, r * .9); c.lineTo(r * .4, r * 1.5); c.fill(); }
    c.fillStyle = N ? '#f6c8a0' : '#f3cfb0'; c.fillRect(-r * .3, r * .6, r * .6, r * .6);
    head(c, who, r, true, shar); c.restore();
  }
  function kunai(c, x, y, rot, s) {
    c.save(); c.translate(x, y); c.rotate(rot); c.scale(s, s);
    c.fillStyle = '#d8dfec'; c.strokeStyle = '#222'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(14, 0); c.lineTo(2, -4); c.lineTo(-4, 0); c.lineTo(2, 4); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#333'; c.fillRect(-10, -1.8, 6, 3.6); c.strokeStyle = '#bbb'; c.lineWidth = 1.8; c.beginPath(); c.arc(-13, 0, 3, 0, 7); c.stroke(); c.restore();
  }
  function limb(c, x, y, a, b, l1, l2, w, col) {
    const x1 = x + Math.sin(a) * l1, y1 = y + Math.cos(a) * l1, x2 = x1 + Math.sin(b) * l2, y2 = y1 + Math.cos(b) * l2;
    c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = w;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x1, y1); c.lineTo(x2, y2); c.stroke(); return [x1, y1, x2, y2];
  }
  function pose(f, t) {
    const P = { fa: [.4, 1.7], ba: [.1, 1.3], fl: [.35, .05], bl: [-.35, -.15], lean: .08, bob: Math.sin(t * 3.2) * 1.5, crouch: 0, item: false, hr: 0 };
    const ft = f.t, e1 = k => Math.sin(Math.min(1, k) * Math.PI);
    switch (f.st) {
      case 'run': { const s = Math.sin(t * 16), q = Math.sin(t * 16 + 1.6); P.fl = [s, s - .8]; P.bl = [-s, -s - .8]; P.fa = [-s * .9, -s * .9 + 1.3]; P.ba = [s * .9, s * .9 + 1.3]; P.lean = .25; P.bob = Math.abs(q) * -3; break; }
      case 'jump': P.fl = [.9, .2]; P.bl = [-.2, -.9]; P.fa = [2.5, 2.9]; P.ba = [-1.8, -2.3]; P.lean = f.vy < 0 ? .12 : .02; P.bob = 0; break;
      case 'dash': P.lean = .6; P.fa = [-1.2, -1.4]; P.ba = [-1, -1.3]; P.fl = [1, .9]; P.bl = [-1.3, -1.5]; P.bob = 0; break;
      case 'atk': {
        const p = ft / (f.chain === 3 ? .46 : .32), e = e1(p);
        if (f.chain === 1) { P.fa = [lerp(.4, 1.5, e), lerp(1.7, 1.57, e)]; P.lean = .1 + .25 * e; }
        else if (f.chain === 2) { P.ba = [lerp(.1, 1.5, e), lerp(1.3, 1.57, e)]; P.lean = .15 + .25 * e; P.fa = [-.3, .9]; }
        else { P.fl = [lerp(.35, 1.6, e), lerp(.05, 1.5, e)]; P.lean = -.2 * e; P.fa = [-.8, -.2]; P.ba = [-1, -.5]; }
        P.bob = 0; break; }
      case 'kunai': { const p = Math.min(1, ft / .35); P.fa = [lerp(2.7, 1.4, p), lerp(3.0, 1.6, p)]; P.lean = lerp(-.1, .2, p); P.item = p < .45; P.bob = 0; break; }
      case 'hit': P.lean = -.45; P.fa = [-.9, -1.2]; P.ba = [-.6, -.9]; P.fl = [.3, .5]; P.bl = [-.4, -.1]; P.hr = -.4; P.bob = 0; break;
      case 'ult': if (ft < .55) { P.fa = [1.2, 1.55]; P.ba = [-.5, -.8]; P.lean = .1; P.fl = [.7, .2]; P.bl = [-.7, -.2]; P.crouch = 4; } else { P.lean = .65; P.fa = [1.3, 1.55]; P.ba = [-1.1, -1.3]; const s = Math.sin(t * 24); P.fl = [s * 1.1 + .4, s * 1.1 - .4]; P.bl = [-s * 1.1 - .4, -s * 1.1 - 1]; } P.bob = 0; break;
      case 'dead': P.fa = [.5, .3]; P.ba = [-.4, -.2]; P.lean = 0; P.bob = 0; break;
      default: if (f.guard) { P.crouch = 7; P.fa = [.6, 2.7]; P.ba = [.9, 2.5]; P.fl = [.6, .2]; P.bl = [-.5, -.3]; P.lean = .05; }
    }
    return P;
  }
  function fighter(c, f, t, alpha) {
    const N = f.who === 'naruto';
    const K = N ? { skin: '#f6c8a0', top: '#ff8a1c', trim: '#1c1c28', pant: '#ff7b12', pantB: '#d9680c', slB: '#d6700f', shoe: '#26305a', guard: '#2d4fa8' }
                : { skin: '#f3cfb0', top: '#2e438f', trim: '#1f2d6a', pant: '#f4f4f8', pantB: '#cfcfd8', slB: '#243676', shoe: '#2a2a3a', guard: '#e8e8f0' };
    const P = pose(f, t);
    c.save(); c.globalAlpha = alpha == null ? 1 : alpha; c.translate(f.x, f.y); c.scale(f.face * 1.1, 1.1);
    if (f.st === 'dead') { c.rotate(-1.4); c.translate(0, -8); }
    const hy = -48 + P.crouch, L = P.lean;
    const sx = Math.sin(L) * 32, sy = hy - Math.cos(L) * 32 + P.bob;
    const hdx = sx + Math.sin(L) * 17, hdy = sy - Math.cos(L) * 17;
    const arm = (a, col, front) => {
      const r = limb(c, sx, sy, a[0], a[1], 17, 17, 8.5, col);
      if (!N && front !== null) { const gx = r[0] + (r[2] - r[0]) * .45, gy = r[1] + (r[3] - r[1]) * .45; c.strokeStyle = K.guard; c.lineWidth = 9.5; c.beginPath(); c.moveTo(gx, gy); c.lineTo(r[2], r[3]); c.stroke(); }
      c.fillStyle = K.skin; c.beginPath(); c.arc(r[2], r[3], 5, 0, 7); c.fill(); c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1; c.stroke();
      return r;
    };
    const leg = (a, col) => { const r = limb(c, 0, hy, a[0], a[1], 26, 26, 11, col); c.fillStyle = K.shoe; c.beginPath(); c.ellipse(r[2] + 4, r[3] + 1, 9, 5, 0, 0, 7); c.fill(); };
    arm(P.ba, K.slB, 0); leg(P.bl, K.pantB);
    c.strokeStyle = K.pant; c.lineWidth = 25; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, hy); c.lineTo(0, hy + 8); c.stroke();
    c.strokeStyle = K.top; c.lineWidth = 25; c.beginPath(); c.moveTo(Math.sin(L) * 6, hy - Math.cos(L) * 6); c.lineTo(sx, sy); c.stroke();
    if (N) { c.strokeStyle = K.trim; c.lineWidth = 25; c.beginPath(); c.moveTo(sx - Math.sin(L) * 6, sy + Math.cos(L) * 6); c.lineTo(sx, sy); c.stroke(); c.lineWidth = 2; c.beginPath(); c.moveTo(sx + 3, sy + 4); c.lineTo(Math.sin(L) * 8 + 3, hy - 6); c.stroke(); }
    else { c.strokeStyle = '#7a4fd0'; c.lineWidth = 6; c.beginPath(); c.moveTo(-12, hy - 3); c.lineTo(12, hy - 3); c.stroke(); c.fillStyle = '#7a4fd0'; c.beginPath(); c.arc(-12, hy, 5, 0, 7); c.fill(); c.fillStyle = K.trim; c.fillRect(sx - 6, sy - 4, 12, 9); }
    c.save(); c.translate(hdx, hdy); c.rotate(L * .6 + P.hr); head(c, f.who, 15, false, f.who === 'sasuke' && (f.st === 'ult' || f.st === 'hit' && false)); c.restore();
    leg(P.fl, K.pant);
    const hand = arm(P.fa, K.top, 1);
    if (P.item) kunai(c, hand[2], hand[3], -.3, 1.1);
    c.restore();
  }
  return { background, fighter, portrait, kunai, head };
})();
