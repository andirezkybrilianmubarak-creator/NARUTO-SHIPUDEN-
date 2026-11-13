'use strict';
(() => {
  const W = 960, H = 540, GY = 455, G = 1900;
  const A = GameAudio, V = VFX, S = Sprites;
  const cv = document.getElementById('c'), ctx = cv.getContext('2d');
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let K = 1;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5), s = Math.min(innerWidth / W, innerHeight / H);
    cv.style.width = W * s + 'px'; cv.style.height = H * s + 'px';
    K = s * dpr; cv.width = Math.round(W * K); cv.height = Math.round(H * K);
  }
  addEventListener('resize', resize); resize();
  try { screen.orientation && screen.orientation.lock && screen.orientation.lock('landscape').catch(() => {}); } catch (e) {}

  /* ---------------- INPUT ---------------- */
  const dpadHeld = { l: 0, r: 0, u: 0, d: 0 }, kb = { l: 0, r: 0, u: 0, d: 0 }, edge = { atk: 0, kun: 0, dash: 0, ult: 0 };
  const dp = document.getElementById('dpad'), ptrs = new Map();
  function dpRecompute() {
    dpadHeld.l = dpadHeld.r = dpadHeld.u = dpadHeld.d = 0;
    ptrs.forEach(p => { for (const k in p) if (p[k]) dpadHeld[k] = 1; });
    dp.querySelectorAll('.dk').forEach(el => { const k = el.dataset.d; el.classList.toggle('on', !!(dpadHeld[k] || kb[k])); });
  }
  function dpPoint(e) {
    const r = dp.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    ptrs.set(e.pointerId, { l: x < -0.14, r: x > 0.14, u: y < -0.14, d: y > 0.14 }); dpRecompute();
  }
  dp.addEventListener('pointerdown', e => { e.preventDefault(); try { dp.setPointerCapture(e.pointerId); } catch (x) {} dpPoint(e); });
  dp.addEventListener('pointermove', e => { if (ptrs.has(e.pointerId)) dpPoint(e); });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => dp.addEventListener(ev, e => { ptrs.delete(e.pointerId); dpRecompute(); }));
  document.querySelectorAll('[data-act]').forEach(b => {
    b.addEventListener('pointerdown', e => { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (x) {} edge[b.dataset.act] = 1; b.classList.add('down'); });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => b.addEventListener(ev, () => b.classList.remove('down')));
  });
  const keyMap = { ArrowLeft: 'l', a: 'l', ArrowRight: 'r', d: 'r', ArrowUp: 'u', w: 'u', ArrowDown: 'd', s: 'd' }, actMap = { j: 'atk', k: 'kun', l: 'dash', u: 'ult' };
  addEventListener('keydown', e => { const k = e.key.length > 1 ? e.key : e.key.toLowerCase(); if (keyMap[k]) { kb[keyMap[k]] = 1; dpRecompute(); } if (actMap[k] && !e.repeat) edge[actMap[k]] = 1; });
  addEventListener('keyup', e => { const k = e.key.length > 1 ? e.key : e.key.toLowerCase(); if (keyMap[k]) { kb[keyMap[k]] = 0; dpRecompute(); } });
  let tapped = false; addEventListener('pointerdown', () => { tapped = true; });
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('touchmove', e => e.preventDefault(), { passive: false });
  function playerInput() {
    const i = { l: dpadHeld.l || kb.l, r: dpadHeld.r || kb.r, u: dpadHeld.u || kb.u, d: dpadHeld.d || kb.d, atk: edge.atk, kun: edge.kun, dash: edge.dash, ult: edge.ult };
    edge.atk = edge.kun = edge.dash = edge.ult = 0; return i;
  }

  /* ---------------- STATE ---------------- */
  const mk = (name, x, face, who) => ({ name, who, x, y: GY, vx: 0, vy: 0, face, hp: 100, trail: 100, ch: who === 'naruto' ? 50 : 30, st: 'idle', t: 0, chain: 0, queued: false, hit: false, guard: false, cnt: 0, cntT: 0, pop: 0, kcd: 0, gt: 0, ai: 0, plan: null, snd: 0, rush: 0, thrown: false });
  let P, E, projs, ghosts, state, stT, koT, winner, zoom = 1, camX = W / 2, camY = H / 2, timeScale = 1, fightPlayed = false;
  function reset() { P = mk('Naruto', 300, 1, 'naruto'); E = mk('Sasuke', 660, -1, 'sasuke'); projs = []; ghosts = []; state = 'intro'; stT = 0; koT = 0; winner = null; timeScale = 1; fightPlayed = false; V.reset(); }
  reset();

  function ghost(f, dt) { f.gt -= dt; if (f.gt <= 0) { f.gt = 0.04; ghosts.push({ f: Object.assign({}, f), a: 0.5 }); } }
  function ko(a, d) {
    d.st = 'dead'; d.hp = 0; d.vy = -420; d.vx = a.face * 300; state = 'ko'; koT = 0; winner = a; timeScale = 0.3;
    A.play('ko'); V.flash = 1; V.flashCol = '#fff'; V.hitstop = 0.35; V.doShake(24, a.face, 0);
  }
  function hurt(a, d, dmg, kb2, heavy, launch) {
    if (d.st === 'dead' || state === 'ko') return;
    const front = (a.x - d.x) * d.face > 0, blk = d.guard && front && !heavy;
    const px = (a.x + d.x) / 2 + a.face * 20, py = d.y - 80;
    if (blk) {
      dmg *= 0.12; kb2 *= 0.35; launch = false; A.play('clang'); V.burst(px, py, 10, '#ffe9a0', 380, 2.5, 0.25); V.text(px, py - 30, 'GUARD', '#9fd4ff'); d.ch = Math.min(100, d.ch + 1);
    } else {
      A.play(heavy ? 'heavy' : 'punch');
      a.cnt += heavy ? 4 : 1; a.cntT = 1.7; a.pop = 1; a.ch = Math.min(100, a.ch + (heavy ? 0 : 5)); d.ch = Math.min(100, d.ch + 3);
      if (d.st !== 'ult') { d.st = 'hit'; d.t = 0; d.chain = 0; d.queued = false; d.hit = false; d.guard = false; } else { dmg *= 0.6; kb2 = 0; launch = false; }
      V.burst(px, py, heavy ? 28 : 12, heavy ? '#aef' : '#fff', heavy ? 700 : 420, heavy ? 4 : 3, 0.35);
      V.ring(px, py, '#fff', heavy ? 130 : 50, 0.25);
      V.hitstop = Math.max(V.hitstop, heavy ? 0.2 : 0.06);
      V.doShake(heavy ? 22 : launch ? 12 : 5, a.face, 0);
      if (heavy) { V.flash = 0.8; V.flashCol = a.who === 'naruto' ? '#bfefff' : '#e6ccff'; }
    }
    d.hp = Math.max(0, d.hp - dmg);
    if (d.st !== 'ult') { d.vx = a.face * kb2; if (launch) d.vy = -430; else if (heavy) d.vy = -300; }
    V.text(d.x + (Math.random() - 0.5) * 30, d.y - 120, '-' + Math.ceil(dmg), blk ? '#9fd4ff' : heavy ? '#ffec6a' : '#ffb347', heavy);
    if (d.hp <= 0) ko(a, d);
  }
  function endUlt(f) { f.st = 'idle'; f.vx = 0; f.rush = 0; f.snd = 0; f.hit = false; f.t = 0; }
  function ult(f, o) {
    const hx = f.x + f.face * 40, hy = f.y - 88, nar = f.who === 'naruto';
    if (f.t < 0.55) {
      f.vx = 0; if (!f.snd) { f.snd = 1; A.play(nar ? 'rasengan' : 'chidori'); }
      const a = Math.random() * 6.283, d = 70;
      V.add({ x: hx + Math.cos(a) * d, y: hy + Math.sin(a) * d, vx: -Math.cos(a) * d / 0.25, vy: -Math.sin(a) * d / 0.25, life: 0.25, size: 2.5, col: nar ? '#8fe8ff' : '#c69bff' });
      if (Math.random() < 0.3) V.dust(f.x, GY, 1, 0);
    } else {
      if (!f.rush) { f.rush = 1; A.play('whoosh'); V.ring(f.x, GY, '#ffffff', 90, 0.4); V.dust(f.x, GY, 12, -f.face); V.doShake(6, f.face, 0); }
      f.vx = f.face * 960; ghost(f, 1 / 60); if (Math.random() < 0.5) V.dust(f.x, GY, 1, -f.face);
      if (!f.hit && o.st !== 'dead' && Math.abs(o.x - f.x) < 78 && Math.abs(o.y - f.y) < 110) {
        f.hit = true; hurt(f, o, nar ? 26 : 22, 820, true, true); V.ring(o.x, GY, nar ? '#8fe8ff' : '#c69bff', 220, 0.5); V.dust(o.x, GY, 14, f.face); endUlt(f); return;
      }
      if (f.t > 1.1) endUlt(f);
    }
  }
  function phys(f, dt) {
    f.vy += G * dt; f.y += f.vy * dt; f.x += f.vx * dt;
    if (f.y >= GY) { if (f.vy > 350) { V.dust(f.x, GY, 7); A.play('land'); } f.y = GY; f.vy = 0; }
    f.x = clamp(f.x, 50, W - 50);
    if (f.st === 'dead') f.vx *= Math.pow(0.02, dt);
  }
  function step(f, o, inp, dt) {
    f.t += dt; f.cntT -= dt; f.pop = Math.max(0, f.pop - dt * 3); f.kcd -= dt;
    if (f.cntT <= 0) f.cnt = 0;
    if (f.st === 'dead') { phys(f, dt); return; }
    f.ch = Math.min(100, f.ch + dt * (f.st === 'idle' || f.st === 'run' ? 5 : 1.5));
    const air = f.y < GY - 1, free = f.st === 'idle' || f.st === 'run' || f.st === 'jump';
    if (free) {
      if (!air && Math.abs(o.x - f.x) > 8) f.face = o.x > f.x ? 1 : -1;
      const dir = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
      f.guard = !air && !!inp.d; f.vx = f.guard ? 0 : dir * (air ? 210 : 240);
      f.st = air ? 'jump' : (dir && !f.guard ? 'run' : 'idle');
      if (!air && inp.u) { f.vy = -760; f.st = 'jump'; V.dust(f.x, GY, 5); A.play('whoosh'); }
      if (inp.dash) {
        if (dir) { f.st = 'dash'; f.t = 0; f.vx = dir * 820; A.play('whoosh'); V.dust(f.x, GY, 8, -dir); }
        else if (!air) { f.vy = -960; f.st = 'jump'; V.dust(f.x, GY, 8); A.play('whoosh'); }
      }
      if (f.st !== 'dash') {
        if (inp.atk && !air) { f.st = 'atk'; f.chain = 1; f.t = 0; f.hit = false; f.queued = false; f.vx = 0; }
        else if (inp.kun && f.kcd <= 0) { f.st = 'kunai'; f.t = 0; f.thrown = false; }
        else if (inp.ult && f.ch >= 50 && !air) { f.st = 'ult'; f.t = 0; f.ch -= 50; f.snd = 0; f.rush = 0; f.hit = false; f.vx = 0; }
      }
    } else {
      f.guard = false;
      switch (f.st) {
        case 'dash': ghost(f, dt); if (Math.random() < 0.4) V.dust(f.x, GY, 1, -Math.sign(f.vx)); if (f.t > 0.22) { f.st = air ? 'jump' : 'idle'; f.vx *= 0.2; } break;
        case 'atk': {
          const d = f.chain === 3 ? 0.46 : 0.32;
          f.vx = f.t < 0.15 ? f.face * 150 : 0;
          if (inp.atk && f.t > 0.08) f.queued = true;
          if (!f.hit && f.t >= (f.chain === 3 ? 0.17 : 0.1)) {
            f.hit = true; A.play('whoosh');
            const dx = (o.x - f.x) * f.face;
            if (o.st !== 'dead' && dx > -15 && dx < (f.chain === 3 ? 105 : 88) && Math.abs(o.y - f.y) < 95) hurt(f, o, [4, 4, 7][f.chain - 1], f.chain === 3 ? 330 : 130, false, f.chain === 3);
          }
          if (f.t >= d) { if (f.queued && f.chain < 3) { f.chain++; f.t = 0; f.hit = false; f.queued = false; } else { f.st = 'idle'; f.chain = 0; f.queued = false; f.vx = 0; } }
          break; }
        case 'kunai':
          f.vx *= 0.9;
          if (!f.thrown && f.t > 0.15) { f.thrown = true; projs.push({ x: f.x + f.face * 38, y: f.y - 86, vx: f.face * 780, own: f, r: 0 }); A.play('kunai'); f.kcd = 0.45; f.ch = Math.max(0, f.ch - 3); }
          if (f.t > 0.36) f.st = air ? 'jump' : 'idle';
          break;
        case 'hit': f.vx *= Math.pow(0.03, dt); if (f.t > 0.34 && !air) { f.st = 'idle'; f.vx = 0; } break;
        case 'ult': ult(f, o); break;
      }
    }
    phys(f, dt);
  }
  function aiInput(f, o, dt) {
    const i = {}; if (f.st === 'dead' || o.st === 'dead') return i;
    f.ai -= dt;
    const dx = o.x - f.x, d = Math.abs(dx), to = dx > 0 ? 'r' : 'l', away = dx > 0 ? 'l' : 'r';
    if (f.ai <= 0) {
      const r = Math.random(), threat = o.st === 'atk' || o.st === 'ult' || o.st === 'kunai'; f.ai = 0.12 + Math.random() * 0.22;
      if (f.ch >= 50 && d > 130 && d < 420 && r < 0.4) f.plan = 'ult';
      else if (f.ch >= 50 && d < 120 && threat && r < 0.5) f.plan = 'ult';
      else if (d > 330) f.plan = r < 0.5 ? 'go' : r < 0.75 ? 'kunai' : r < 0.9 ? 'dash' : 'jump';
      else if (d > 110) f.plan = r < 0.55 ? 'go' : r < 0.7 ? 'kunai' : r < 0.82 ? 'jump' : r < 0.9 ? 'guard' : 'dash';
      else f.plan = threat && r < 0.65 ? 'guard' : r < 0.62 ? 'atk' : r < 0.78 ? 'back' : 'jump';
    }
    switch (f.plan) {
      case 'go': i[to] = 1; break; case 'back': i[away] = 1; break; case 'guard': i.d = 1; break;
      case 'atk': i.atk = 1; if (d > 85) i[to] = 1; break;
      case 'kunai': i.kun = 1; f.plan = null; break;
      case 'jump': i.u = 1; i[to] = 1; f.plan = null; break;
      case 'dash': i[to] = 1; i.dash = 1; f.plan = null; break;
      case 'ult': i.ult = 1; f.plan = null; break;
    }
    return i;
  }

  function update(dt, real) {
    if (dt > 0) {
      const pi = playerInput();
      if (state === 'intro') { stT += real; if (stT > 0.9 && !fightPlayed) { fightPlayed = true; A.play('fight'); } if (stT > 1.7) state = 'play'; }
      if (state === 'ko') { koT += real; timeScale = koT < 1.4 ? 0.3 : 1; if (koT > 1.8 && (tapped || pi.atk || pi.kun || pi.dash || pi.ult)) { reset(); tapped = false; return; } }
      const playing = state === 'play';
      step(P, E, playing ? pi : {}, dt); step(E, P, playing ? aiInput(E, P, dt) : {}, dt);
      const ov = 46 - Math.abs(P.x - E.x);
      if (ov > 0 && P.y >= GY - 1 && E.y >= GY - 1 && P.st !== 'ult' && E.st !== 'ult') { const s = P.x < E.x ? -1 : 1; P.x = clamp(P.x + s * ov / 2, 50, W - 50); E.x = clamp(E.x - s * ov / 2, 50, W - 50); }
      for (const p of projs) {
        p.x += p.vx * dt; p.r += dt * 30; const t = p.own === P ? E : P;
        if (t.st !== 'dead' && Math.abs(p.x - t.x) < 32 && Math.abs(p.y - (t.y - 70)) < 65) { hurt(p.own, t, 3, 170, false, false); p.dead = true; }
        if (p.x < -40 || p.x > W + 40) p.dead = true;
      }
      projs = projs.filter(p => !p.dead);
      for (const g of ghosts) g.a -= dt * 2.5; ghosts = ghosts.filter(g => g.a > 0);
      for (const f of [P, E]) f.trail = f.trail > f.hp ? Math.max(f.hp, f.trail - dt * 25) : f.hp;
      tapped = false;
    }
    const ul = P.st === 'ult' ? P : E.st === 'ult' ? E : null;
    zoom += ((ul ? 1.17 : 1) - zoom) * Math.min(1, real * 8);
    camX += ((ul ? (P.x + E.x) / 2 : W / 2) - camX) * Math.min(1, real * 8);
    camY += ((ul ? GY - 110 : H / 2) - camY) * Math.min(1, real * 8);
    V.update(dt, real);
    const ub = document.getElementById('b-ult'), rdy = P.ch >= 50 && state === 'play';
    if (ub.classList.contains('ready') !== rdy) ub.classList.toggle('ready', rdy);
  }

  /* ---------------- RENDER ---------------- */
  const FONT = 'Impact,"Arial Black",sans-serif';
  function para(x, y, w, h, s) { ctx.beginPath(); ctx.moveTo(x + s, y); ctx.lineTo(x + w + s, y); ctx.lineTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.closePath(); }
  function hudSide(f, left, metal) {
    const sk = left ? 14 : -14, px = left ? 16 : W - 16 - 104, BW = 290, bx = left ? 136 : W - 136 - BW;
    ctx.save(); para(px, 10, 104, 88, sk); ctx.fillStyle = '#10131c'; ctx.fill(); ctx.save(); ctx.clip();
    S.portrait(ctx, f.who, px - 12, 10, 128, 88, f.who === 'sasuke'); ctx.restore();
    ctx.lineWidth = 4; ctx.strokeStyle = metal; para(px, 10, 104, 88, sk); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.font = `italic 900 22px ${FONT}`; ctx.textAlign = left ? 'left' : 'right'; ctx.lineWidth = 4; ctx.strokeStyle = '#000'; ctx.fillStyle = '#fff';
    ctx.strokeText(f.name, left ? bx + 4 : bx + BW - 4, 31); ctx.fillText(f.name, left ? bx + 4 : bx + BW - 4, 31);
    const sk2 = left ? 9 : -9, hp = f.hp / 100, tr = f.trail / 100;
    para(bx, 36, BW, 20, sk2); ctx.fillStyle = '#0b0e14'; ctx.fill(); ctx.save(); ctx.clip();
    const fillRect = (p, col) => { ctx.fillStyle = col; if (left) ctx.fillRect(bx - 12, 36, 12 + BW * p, 20); else ctx.fillRect(bx + BW * (1 - p), 36, BW * p + 12, 20); };
    fillRect(tr, '#e8a02a'); const gr = ctx.createLinearGradient(0, 36, 0, 56); gr.addColorStop(0, '#9dff7a'); gr.addColorStop(.5, '#2ecc40'); gr.addColorStop(1, '#13802a'); fillRect(hp, gr);
    ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.fillRect(bx - 12, 37, BW + 24, 5); ctx.restore();
    ctx.lineWidth = 3; ctx.strokeStyle = metal; para(bx, 36, BW, 20, sk2); ctx.stroke();
    const sw = (BW - 6) / 2;
    [[0, '#1c86ff', '#7fd3ff', Math.min(f.ch, 50) / 50], [1, '#ff8a00', '#ffd34d', Math.max(0, f.ch - 50) / 50]].forEach(s => {
      const sx = left ? bx + s[0] * (sw + 6) : bx + (1 - s[0]) * (sw + 6), cy = 62;
      para(sx, cy, sw, 11, left ? 5 : -5); ctx.fillStyle = '#0b0e14'; ctx.fill(); ctx.save(); ctx.clip();
      const g2 = ctx.createLinearGradient(0, cy, 0, cy + 11); g2.addColorStop(0, s[2]); g2.addColorStop(1, s[1]); ctx.fillStyle = g2;
      if (left) ctx.fillRect(sx - 8, cy, 8 + sw * s[3], 11); else ctx.fillRect(sx + sw * (1 - s[3]), cy, sw * s[3] + 8, 11);
      ctx.restore(); ctx.lineWidth = 2; ctx.strokeStyle = metal; para(sx, cy, sw, 11, left ? 5 : -5); ctx.stroke();
    });
    ctx.restore();
  }
  function comboDraw(f, left) {
    if (f.cnt < 2 || f.cntT <= 0) return;
    const sc = 1 + f.pop * 0.5, a = Math.min(1, f.cntT * 2);
    ctx.save(); ctx.globalAlpha = a; ctx.translate(left ? 28 : W - 28, 190); ctx.rotate(left ? -0.08 : 0.08); ctx.scale(sc, sc);
    ctx.textAlign = left ? 'left' : 'right'; ctx.font = `italic 900 58px ${FONT}`; ctx.lineJoin = 'round';
    const g = ctx.createLinearGradient(0, -50, 0, 6); g.addColorStop(0, '#fff6a8'); g.addColorStop(.5, '#ffc21a'); g.addColorStop(1, '#ff6a00');
    const s = f.cnt + ' HITS!'; ctx.lineWidth = 10; ctx.strokeStyle = '#2a0d00'; ctx.strokeText(s, 0, 0); ctx.fillStyle = g; ctx.fillText(s, 0, 0);
    ctx.font = `italic 900 22px ${FONT}`; ctx.lineWidth = 5; ctx.strokeText('COMBO', 0, 26); ctx.fillStyle = '#fff'; ctx.fillText('COMBO', 0, 26); ctx.restore();
  }
  function banner(txt, size, y, col) {
    ctx.save(); ctx.textAlign = 'center'; ctx.font = `italic 900 ${size}px ${FONT}`; ctx.lineJoin = 'round'; ctx.lineWidth = size / 6; ctx.strokeStyle = '#1a0800';
    ctx.strokeText(txt, W / 2, y); const g = ctx.createLinearGradient(0, y - size, 0, y); g.addColorStop(0, '#fff6a8'); g.addColorStop(1, col || '#ff7a00'); ctx.fillStyle = g; ctx.fillText(txt, W / 2, y); ctx.restore();
  }
  function ultFx(f, t) {
    if (f.st !== 'ult') return;
    const hx = f.x + f.face * (f.t < 0.55 ? 38 : 54), hy = f.y - 88, r = f.t < 0.55 ? 8 + f.t / 0.55 * 26 : 34, nar = f.who === 'naruto';
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    const g = ctx.createRadialGradient(f.x, f.y - 65, 10, f.x, f.y - 65, 110); g.addColorStop(0, nar ? 'rgba(80,200,255,.45)' : 'rgba(170,110,255,.45)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y - 65, 110, 0, 7); ctx.fill(); ctx.restore();
    if (nar) V.rasengan(ctx, hx, hy, r, t); else V.chidori(ctx, hx, hy, r, t);
  }
  function draw(t) {
    ctx.setTransform(K, 0, 0, K, 0, 0); ctx.clearRect(0, 0, W, H);
    const sh = V.shake; ctx.save();
    ctx.translate(W / 2 + (Math.random() - 0.5) * 2 * sh + V.sx * sh * 0.4, H / 2 + (Math.random() - 0.5) * 1.4 * sh);
    ctx.scale(zoom, zoom); ctx.translate(-camX, -camY);
    S.background(ctx, t);
    for (const f of [P, E]) { const h = clamp((GY - f.y) / 260, 0, 1); ctx.fillStyle = `rgba(0,0,0,${0.32 * (1 - h)})`; ctx.beginPath(); ctx.ellipse(f.x, GY + 3, 40 * (1 - h * .4), 8, 0, 0, 7); ctx.fill(); }
    for (const g of ghosts) { ctx.save(); ctx.filter = 'none'; S.fighter(ctx, g.f, t, g.a * 0.6); ctx.restore(); }
    S.fighter(ctx, E, t); S.fighter(ctx, P, t);
    for (const p of projs) S.kunai(ctx, p.x, p.y, p.r * 0.9 + (p.vx < 0 ? 3.14 : 0), 1.5);
    ultFx(P, t); ultFx(E, t); V.draw(ctx);
    ctx.restore();
    if (V.flash > 0) { ctx.globalAlpha = Math.min(1, V.flash) * 0.6; ctx.fillStyle = V.flashCol; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }
    const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.5, W / 2, H / 2, H * 1.05); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    const metal = ctx.createLinearGradient(0, 8, 0, 100); metal.addColorStop(0, '#f2f4fa'); metal.addColorStop(.5, '#868c9e'); metal.addColorStop(1, '#3c4050');
    hudSide(P, true, metal); hudSide(E, false, metal);
    ctx.save(); const eg = ctx.createLinearGradient(0, 8, 0, 80); eg.addColorStop(0, '#fff'); eg.addColorStop(.5, '#8a90a2'); eg.addColorStop(1, '#3a3e4c');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(W / 2, 46, 34, 0, 7); ctx.fill(); ctx.fillStyle = '#12151f'; ctx.beginPath(); ctx.arc(W / 2, 46, 27, 0, 7); ctx.fill();
    ctx.strokeStyle = '#ffb21a'; ctx.lineWidth = 2; ctx.stroke(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 40px ${FONT}`; ctx.fillStyle = '#ffd34d'; ctx.fillText('\u221E', W / 2, 48); ctx.restore();
    comboDraw(P, true); comboDraw(E, false);
    if (state === 'intro') { if (stT < 0.9) banner('READY', 90, 290, '#ffb000'); else { const k = 1 + Math.max(0, 1.1 - stT) * 1.5; ctx.save(); ctx.translate(W / 2, 290); ctx.scale(k, k); ctx.translate(-W / 2, -290); banner('FIGHT!', 110, 290, '#ff3a00'); ctx.restore(); } }
    if (state === 'ko') { banner('K.O.', 140, 280, '#ff2a00'); if (koT > 1) banner(winner.name.toUpperCase() + ' WINS', 56, 350, '#ffb000'); if (koT > 1.8) { ctx.save(); ctx.textAlign = 'center'; ctx.font = `700 22px ${FONT}`; ctx.fillStyle = `rgba(255,255,255,${0.6 + 0.4 * Math.sin(t * 6)})`; ctx.fillText('TAP TO REMATCH', W / 2, 400); ctx.restore(); } }
  }
  let last = performance.now();
  function frame(now) {
    const real = Math.min(0.033, (now - last) / 1000); last = now;
    let dt = real;
    if (V.hitstop > 0) { V.hitstop -= real; dt = 0; } else dt *= timeScale;
    update(dt, real); draw(now / 1000); requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  window.__game = { update, draw, get P() { return P; }, get E() { return E; }, edge };
})();
