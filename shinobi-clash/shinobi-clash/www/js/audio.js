'use strict';
const GameAudio = (() => {
  let ctx = null, master = null, nb = null;
  function init() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ctx.createGain(); master.gain.value = 0.7; master.connect(ctx.destination);
    nb = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = nb.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  function noise(dur, type, f1, f2, vol, q, delay) {
    const t = ctx.currentTime + (delay || 0);
    const s = ctx.createBufferSource(); s.buffer = nb; s.loop = true;
    const f = ctx.createBiquadFilter(); f.type = type; f.Q.value = q || 1;
    f.frequency.setValueAtTime(f1, t); f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(master); s.start(t); s.stop(t + dur + 0.05);
  }
  function tone(type, f1, f2, dur, vol, delay) {
    const t = ctx.currentTime + (delay || 0);
    const o = ctx.createOscillator(); o.type = type;
    o.frequency.setValueAtTime(f1, t); o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    const g = ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.05);
  }
  const S = {
    punch() { noise(0.12, 'lowpass', 2500, 200, 0.9); tone('sine', 160, 45, 0.15, 0.9); },
    heavy() { noise(0.3, 'lowpass', 3000, 100, 1); tone('sine', 110, 30, 0.35, 1); tone('square', 90, 40, 0.2, 0.2); },
    whoosh() { noise(0.22, 'bandpass', 500, 2600, 0.45, 2); },
    clang() { [1200, 1810, 2650].forEach((f, i) => tone('triangle', f, f * 0.98, 0.35, 0.25 / (i + 1))); noise(0.05, 'highpass', 4000, 6000, 0.3); },
    kunai() { noise(0.18, 'bandpass', 1500, 4000, 0.4, 3); tone('triangle', 900, 1400, 0.1, 0.15); },
    rasengan() { tone('sawtooth', 120, 520, 0.6, 0.16); tone('sine', 240, 900, 0.6, 0.2); noise(0.6, 'bandpass', 300, 2000, 0.4, 4); },
    chidori() { for (let i = 0; i < 14; i++) noise(0.06, 'highpass', 3000 + Math.random() * 3000, 8000, 0.28, 1, i * 0.04); tone('sawtooth', 1800, 900, 0.6, 0.06); },
    land() { tone('sine', 90, 40, 0.12, 0.5); noise(0.1, 'lowpass', 800, 200, 0.3); },
    fight() { tone('square', 440, 660, 0.18, 0.15); tone('square', 660, 880, 0.3, 0.15, 0.15); },
    ko() { noise(0.5, 'lowpass', 2000, 80, 0.9); tone('sine', 140, 30, 0.6, 1); [523, 659, 784, 1046].forEach((f, i) => tone('triangle', f, f, 0.45, 0.22, 0.7 + i * 0.16)); }
  };
  function play(n) { if (!ctx || ctx.state !== 'running') return; try { S[n] && S[n](); } catch (e) {} }
  ['pointerdown', 'touchstart', 'keydown', 'mousedown'].forEach(ev => window.addEventListener(ev, init, { passive: true }));
  return { init, play };
})();
