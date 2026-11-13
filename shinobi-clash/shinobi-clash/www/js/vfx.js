'use strict';
const VFX = (() => {
  const V = { parts: [], texts: [], shake: 0, sx: 0, sy: 0, hitstop: 0, flash: 0, flashCol: '#fff' };
  V.reset = () => { V.parts.length = 0; V.texts.length = 0; V.shake = 0; V.hitstop = 0; V.flash = 0; };
  V.add = o => { V.parts.push(Object.assign({ x: 0, y: 0, vx: 0, vy: 0, g: 0, life: 0.5, t: 0, size: 4, grow: 0, col: '#fff', shape: 'spark', add: true, drag: 0 }, o)); };
  V.burst = (x, y, n, col, spd, size, life, g) => {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.283, s = spd * (0.3 + Math.random() * 0.7);
      V.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: g || 0, life: life * (0.6 + Math.random() * 0.6), size: size * (0.5 + Math.random()), col, drag: 2 });
    }
  };
  V.dust = (x, y, n, dir) => {
    for (let i = 0; i < n; i++) V.add({ x: x + (Math.random() - 0.5) * 30, y: y - 2, vx: (Math.random() - 0.5) * 120 + (dir || 0) * 90, vy: -Math.random() * 60, life: 0.5 + Math.random() * 0.3, size: 6 + Math.random() * 8, grow: 30, col: 'rgba(205,175,135,', shape: 'dust', add: false, drag: 3 });
  };
  V.ring = (x, y, col, max, life) => { life = life || 0.4; V.add({ x, y, life, size: 5, grow: max / life, col, shape: 'ring' }); };
  V.text = (x, y, s, col, big) => V.texts.push({ x, y, s, col, t: 0, big });
  V.doShake = (m, dx, dy) => { V.shake = Math.max(V.shake, m); V.sx = dx || 0; V.sy = dy || 0; };
  V.update = (dt, real) => {
    const P = V.parts;
    for (let i = P.length - 1; i >= 0; i--) {
      const p = P[i]; p.t += dt;
      if (p.t >= p.life) { P.splice(i, 1); continue; }
      p.vx *= Math.exp(-p.drag * dt); p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.size += p.grow * dt;
    }
    for (let i = V.texts.length - 1; i >= 0; i--) { const t = V.texts[i]; t.t += dt; t.y -= 45 * dt; if (t.t > 0.9) V.texts.splice(i, 1); }
    V.shake *= Math.pow(0.002, real); if (V.shake < 0.2) V.shake = 0;
    V.flash = Math.max(0, V.flash - real * 2.5);
  };
  V.draw = c => {
    c.save();
    for (const p of V.parts) {
      const a = 1 - p.t / p.life;
      c.globalCompositeOperation = p.add ? 'lighter' : 'source-over';
      if (p.shape === 'spark') {
        c.globalAlpha = a; c.strokeStyle = p.col; c.lineWidth = Math.max(1, p.size); c.lineCap = 'round';
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.04, p.y - p.vy * 0.04); c.stroke();
      } else if (p.shape === 'ring') {
        c.globalAlpha = a; c.strokeStyle = p.col; c.lineWidth = 4 * a + 1;
        c.beginPath(); c.ellipse(p.x, p.y, p.size, p.size * 0.35, 0, 0, 6.283); c.stroke();
      } else {
        c.globalAlpha = 1; c.fillStyle = p.col + (a * 0.5).toFixed(2) + ')';
        c.beginPath(); c.arc(p.x, p.y, p.size, 0, 6.283); c.fill();
      }
    }
    c.restore();
    c.save(); c.textAlign = 'center';
    for (const t of V.texts) {
      const a = 1 - t.t / 0.9, k = t.t < 0.12 ? 1 + (0.12 - t.t) * 5 : 1;
      c.globalAlpha = a; c.font = `italic 900 ${(t.big ? 34 : 24) * k}px Impact,Arial Black,sans-serif`;
      c.lineWidth = 5; c.strokeStyle = '#1a0a00'; c.strokeText(t.s, t.x, t.y); c.fillStyle = t.col; c.fillText(t.s, t.x, t.y);
    }
    c.restore();
  };
  V.rasengan = (c, x, y, r, t) => {
    c.save(); c.globalCompositeOperation = 'lighter';
    let g = c.createRadialGradient(x, y, 0, x, y, r * 2.6);
    g.addColorStop(0, 'rgba(120,220,255,.55)'); g.addColorStop(1, 'rgba(40,120,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 2.6, 0, 7); c.fill();
    g = c.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, '#fff'); g.addColorStop(0.45, '#9ff0ff'); g.addColorStop(1, '#2a8cff');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill();
    c.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const a = t * 9 + i * 0.9, rr = r * (0.45 + (i % 3) * 0.22);
      c.strokeStyle = i % 2 ? 'rgba(255,255,255,.9)' : 'rgba(120,230,255,.8)'; c.lineWidth = 2.2;
      c.beginPath(); c.ellipse(x, y, rr, rr * (0.35 + 0.3 * Math.sin(i)), a, 0, 4.2); c.stroke();
    }
    for (let i = 0; i < 3; i++) {
      const a = -t * 6 + i * 2.09; c.strokeStyle = 'rgba(200,245,255,.55)'; c.lineWidth = 3;
      c.beginPath(); c.arc(x, y, r * 1.5, a, a + 1.2); c.stroke();
    }
    c.restore();
  };
  V.chidori = (c, x, y, r, t) => {
    c.save(); c.globalCompositeOperation = 'lighter';
    const g = c.createRadialGradient(x, y, 0, x, y, r * 2.4);
    g.addColorStop(0, 'rgba(230,210,255,.6)'); g.addColorStop(1, 'rgba(120,60,255,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r * 2.4, 0, 7); c.fill();
    c.lineCap = 'round'; c.lineJoin = 'round';
    for (let i = 0; i < 10; i++) {
      const a = Math.random() * 6.283, len = r * (1.1 + Math.random() * 1.6);
      const pts = [[x, y]];
      for (let k = 1; k <= 5; k++) pts.push([x + Math.cos(a) * len * k / 5 + (Math.random() - 0.5) * 12, y + Math.sin(a) * len * k / 5 + (Math.random() - 0.5) * 12]);
      [['rgba(150,90,255,.85)', 4], ['#fff', 1.5]].forEach(s => {
        c.strokeStyle = s[0]; c.lineWidth = s[1]; c.beginPath(); pts.forEach((p, j) => j ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke();
      });
    }
    c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, r * 0.4, 0, 7); c.fill();
    c.restore();
  };
  return V;
})();
