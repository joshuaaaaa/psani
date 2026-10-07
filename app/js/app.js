'use strict';
// Hlavní logika aplikace: obrazovky, psaní, ukládání postupu.
(() => {
  const STORE_KEY = 'psani10:v1';
  const IDLE_CAP = 8000; // pauza delší než 8 s se nezapočítá do času
  const DEFAULT_SETTINGS = {
    layout: 'qwertz', input: 'system', onError: 'stop', length: 'medium', maxErr: 3,
    sound: true, colorKeys: true, showHands: true, theme: 'auto',
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const view = $('#view');
  const modal = $('#modal');

  // ---------- Ukládání ----------
  function newProfile() { return { done: {}, history: [], keys: {} }; }
  function load() {
    let data = null;
    try { data = JSON.parse(localStorage.getItem(STORE_KEY)); } catch (e) { data = null; }
    if (!data || typeof data !== 'object') data = {};
    data.settings = Object.assign({}, DEFAULT_SETTINGS, data.settings || {});
    if (!data.profiles || !Object.keys(data.profiles).length) data.profiles = { 'Já': newProfile() };
    for (const p of Object.values(data.profiles)) { p.done = p.done || {}; p.history = p.history || []; p.keys = p.keys || {}; }
    if (!data.profiles[data.current]) data.current = Object.keys(data.profiles)[0];
    return data;
  }
  let store = load();
  function save() { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (e) { /* plné úložiště */ } }
  const settings = () => store.settings;
  const profile = () => store.profiles[store.current];

  Layout.setVariant(settings().layout);
  let LESSONS = Lessons.list();

  // ---------- Vzhled ----------
  const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
  function applyTheme() {
    const t = settings().theme;
    const dark = t === 'dark' || (t === 'auto' && darkQuery.matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
  darkQuery.addEventListener('change', applyTheme);
  applyTheme();

  // ---------- Zvuk ----------
  let audio = null;
  function beep() {
    if (!settings().sound) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.type = 'square'; o.frequency.value = 180;
      g.gain.setValueAtTime(0.06, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.09);
      o.connect(g); g.connect(audio.destination);
      o.start(); o.stop(audio.currentTime + 0.1);
    } catch (e) { /* bez zvuku */ }
  }

  // ---------- Pomocné ----------
  function starsHtml(n) {
    let s = '';
    for (let i = 0; i < 3; i++) s += i < n ? '★' : '<span class="off">★</span>';
    return `<span class="stars">${s}</span>`;
  }
  function keyLabel(ch) {
    if (ch === ' ') return 'mezera';
    if (ch === '\n') return 'Enter';
    return ch;
  }
  function fmtTime(ms) {
    const s = Math.round(ms / 1000);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }
  function fmtPct(x) { return (Math.round(x * 10) / 10).toLocaleString('cs-CZ') + ' %'; }
  function nextLesson() {
    const done = profile().done;
    return LESSONS.find(l => !(done[l.id] && done[l.id].stars > 0)) || LESSONS[LESSONS.length - 1];
  }

  // ---------- Klávesnice a ruce ----------
  function keyboardHtml(opts = {}) {
    const rows = Layout.rows.map(row => {
      const keys = row.map(k => {
        const special = !k.base && k.code !== 'Space';
        const letter = k.base && k.shift && k.base.toUpperCase() === k.shift && k.base !== k.shift;
        let inner = '';
        if (special) inner = esc(k.label || '');
        else if (k.code === 'Space') inner = '';
        else if (letter) inner = esc(k.shift);
        else inner = `<span class="sh">${esc(k.shift || '')}</span><span class="bs">${esc(k.base)}</span>`;
        const cls = ['key'];
        if (special) cls.push('special');
        if (k.code === 'KeyF' || k.code === 'KeyJ') cls.push('bump');
        const style = [`--w:${k.w}`];
        if (opts.heat) {
          const v = opts.heat(k);
          if (v != null) style.push(`background:color-mix(in srgb, var(--bad) ${Math.round(v * 100)}%, var(--key))`);
        } else if (!special || /Shift/.test(k.code)) style.push(`--fc:var(--f-${k.finger})`);
        const dataF = opts.heat || (special && !/Shift/.test(k.code)) ? '' : ` data-f="${k.finger}"`;
        return `<div class="${cls.join(' ')}" data-code="${k.code}"${dataF} style="${style.join(';')}">${inner}</div>`;
      }).join('');
      return `<div class="kb-row">${keys}</div>`;
    }).join('');
    const colored = !opts.heat && settings().colorKeys ? ' colored' : '';
    return `<div class="keyboard${colored}">${rows}</div>`;
  }

  function handsHtml() {
    const fingers = [
      ['LP', 22, 46, 30], ['LR', 58, 22, 32], ['LM', 96, 10, 32], ['LI', 134, 24, 32],
    ];
    let s = '';
    for (const [f, x, top, w] of fingers) {
      s += `<rect class="finger" data-finger="${f}" x="${x}" y="${top}" width="${w}" height="${100 - top}" rx="15"/>`;
      const rf = 'R' + f[1];
      s += `<rect class="finger" data-finger="${rf}" x="${460 - x - w}" y="${top}" width="${w}" height="${100 - top}" rx="15"/>`;
    }
    s += '<rect class="finger" data-finger="TH" x="138" y="100" width="66" height="28" rx="14" transform="rotate(-30 138 114)"/>';
    s += '<rect class="finger" data-finger="TH" x="256" y="100" width="66" height="28" rx="14" transform="rotate(30 322 114)"/>';
    s += '<rect class="palm" x="18" y="80" width="152" height="70" rx="28"/>';
    s += '<rect class="palm" x="290" y="80" width="152" height="70" rx="28"/>';
    return `<svg class="hands" viewBox="0 0 460 156" width="360" height="122" aria-hidden="true">${s}</svg>`;
  }

  // ---------- Navigace ----------
  let current = 'home';
  function go(name, arg) {
    if (current === 'typing' && name !== 'typing') S = null;
    current = name;
    $$('.nav button').forEach(b => b.classList.toggle('active', b.dataset.view === name || (name === 'typing' && b.dataset.view === 'home')));
    closeModal();
    ({ home: renderHome, typing: renderTyping, custom: renderCustom, weak: renderWeak, stats: renderStats, settings: renderSettings, help: renderHelp })[name](arg);
    view.scrollTop = 0;
  }
  $$('.nav button').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));

  function renderProfiles() {
    const sel = $('#profileSelect');
    sel.innerHTML = Object.keys(store.profiles).map(n => `<option ${n === store.current ? 'selected' : ''}>${esc(n)}</option>`).join('')
      + '<option value="__new">➕ Nový uživatel…</option>';
  }
  $('#profileSelect').addEventListener('change', async e => {
    if (e.target.value === '__new') {
      const name = await promptModal('Nový uživatel', 'Jméno:');
      if (name && !store.profiles[name]) { store.profiles[name] = newProfile(); store.current = name; save(); }
    } else {
      store.current = e.target.value; save();
    }
    renderProfiles();
    go('home');
  });

  // ---------- Modální okna ----------
  let modalKeys = null;
  function openModal(html, onKey) {
    modal.innerHTML = `<div class="modal-card">${html}</div>`;
    modal.classList.remove('hidden');
    modalKeys = onKey || null;
  }
  function closeModal() { modal.classList.add('hidden'); modal.innerHTML = ''; modalKeys = null; }
  function promptModal(title, label, value = '') {
    return new Promise(resolve => {
      openModal(`<h2>${esc(title)}</h2><p><label>${esc(label)}<br><input type="text" id="mInput" style="width:100%" maxlength="30" value="${esc(value)}"></label></p>
        <div class="modal-actions"><button class="btn" id="mNo">Zrušit</button><button class="btn primary" id="mYes">OK</button></div>`);
      const inp = $('#mInput');
      inp.focus(); inp.select();
      const done = v => { closeModal(); resolve(v); };
      $('#mNo').onclick = () => done(null);
      $('#mYes').onclick = () => done(inp.value.trim() || null);
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') done(inp.value.trim() || null); if (e.key === 'Escape') done(null); });
    });
  }
  function confirmModal(title, text, yes = 'Ano') {
    return new Promise(resolve => {
      openModal(`<h2>${esc(title)}</h2><p>${esc(text)}</p>
        <div class="modal-actions"><button class="btn" id="mNo">Zrušit</button><button class="btn primary danger" id="mYes">${esc(yes)}</button></div>`);
      $('#mNo').onclick = () => { closeModal(); resolve(false); };
      $('#mYes').onclick = () => { closeModal(); resolve(true); };
    });
  }

  // ---------- Domů: seznam lekcí ----------
  function renderHome() {
    const done = profile().done;
    const doneCount = LESSONS.filter(l => done[l.id] && done[l.id].stars > 0).length;
    const next = nextLesson();
    let html = `<div class="hero">
      <div>
        <h1>Ahoj, ${esc(store.current)}!</h1>
        <div style="opacity:.9;margin-bottom:10px">Hotovo ${doneCount} z ${LESSONS.length} lekcí</div>
        <div class="progress-outer"><div class="progress-inner" style="width:${doneCount / LESSONS.length * 100}%"></div></div>
      </div>
      <button class="btn" id="continueBtn">▶ ${doneCount ? 'Pokračovat' : 'Začít'}: lekce ${next.id} – ${esc(next.title)}</button>
    </div>`;
    let group = null;
    for (const l of LESSONS) {
      if (l.group !== group) {
        if (group !== null) html += '</div>';
        group = l.group;
        const inGroup = LESSONS.filter(x => x.group === group);
        const g = inGroup.filter(x => done[x.id] && done[x.id].stars > 0).length;
        html += `<h2 class="group-title">${esc(group)} <small>${g}/${inGroup.length}</small></h2><div class="lessons">`;
      }
      const d = done[l.id];
      const cls = ['lesson'];
      if (d && d.stars > 0) cls.push('done');
      if (l === next) cls.push('next');
      const sub = d ? `${starsHtml(d.stars)} · ${d.best} úh/min` : (l.add ? 'Nové: ' + esc([...l.add].join(' ')) : '&nbsp;');
      html += `<button class="${cls.join(' ')}" data-lesson="${l.id}"><span class="num">${l.id}</span><span class="t">${esc(l.title)}</span><span class="s">${sub}</span></button>`;
    }
    html += '</div>';
    view.innerHTML = html;
    $('#continueBtn').onclick = () => startLesson(next.id);
    $$('[data-lesson]').forEach(b => b.onclick = () => startLesson(+b.dataset.lesson));
  }

  // ---------- Psaní ----------
  let S = null; // aktuální cvičení

  function startLesson(id, keepText) {
    const lesson = LESSONS.find(l => l.id === id);
    const lines = keepText || Lessons.generate(lesson, { length: settings().length }).lines;
    beginSession({ kind: 'lesson', id, lesson, title: `Lekce ${id}: ${lesson.title}`, crumb: lesson.group, tip: lesson.tip, add: lesson.add, goal: lesson.goal, lines });
  }

  function beginSession(cfg) {
    S = Object.assign(cfg, {
      text: cfg.lines.join('\n'), pos: 0, step: 0, errors: 0, keystrokes: 0, errAt: new Set(), missed: {},
      elapsed: 0, last: null, started: false, paused: false, done: false, dead: null, deadCode: null, layoutWarn: 0,
    });
    go('typing');
  }

  function renderTyping() {
    if (!S) return go('home');
    const newKeys = S.add ? `<span class="newkeys">${[...S.add].map(c => `<span class="kcap">${esc(c.toUpperCase() === c ? c : c.toUpperCase())}</span>`).join('')}</span>` : '';
    const fingerInfo = S.add ? [...S.add].map(c => `${esc(c)} = ${esc(Layout.FINGER_NAMES[Layout.fingerOfChar(c)] || '')}`).join(', ') : '';
    view.innerHTML = `
      <div class="typing-head">
        <div><div class="crumb">${esc(S.crumb || '')}</div><h1>${esc(S.title)}</h1></div>
        <div class="row">
          <button class="btn small" id="restartBtn" title="Esc">↺ Znovu (Esc)</button>
          ${S.kind === 'lesson' ? '<button class="btn small" id="newTextBtn">⟳ Nový text</button>' : ''}
          <button class="btn small" id="backBtn">✕ Zavřít</button>
        </div>
      </div>
      ${S.tip || newKeys ? `<div class="tip">${newKeys}${esc(S.tip || '')}${fingerInfo && !S.tip ? ' ' + fingerInfo : ''}</div>` : ''}
      <div class="stats-bar">
        <div class="stat"><div class="v" id="stSpeed">0</div><div class="l">úhozů za minutu${S.goal ? ' · cíl ' + S.goal : ''}</div></div>
        <div class="stat" id="stErrBox"><div class="v" id="stErr">0</div><div class="l">chyb (max ${settings().maxErr} %)</div></div>
        <div class="stat"><div class="v" id="stTime">0:00</div><div class="l">čas</div></div>
        <div class="stat"><div class="v" id="stProg">0 %</div><div class="l">hotovo</div></div>
      </div>
      <div class="textbox" id="textbox"></div>
      <div class="hint" id="hint"></div>
      <div class="kb-wrap">${keyboardHtml()}${settings().showHands ? handsHtml() : ''}</div>`;
    $('#restartBtn').onclick = () => restart(false);
    if ($('#newTextBtn')) $('#newTextBtn').onclick = () => restart(true);
    $('#backBtn').onclick = () => go(S && S.kind === 'lesson' ? 'home' : S && S.kind === 'weak' ? 'weak' : S && S.kind === 'custom' ? 'custom' : 'home');
    renderText();
    updateCursor();
    updateStats();
  }

  function restart(newText) {
    if (!S) return;
    if (S.kind === 'lesson') return startLesson(S.id, newText ? null : S.lines);
    if (S.kind === 'weak' && newText) return startWeak();
    beginSession(Object.assign({}, S, { lines: S.lines }));
  }

  function renderText() {
    const box = $('#textbox');
    let html = '', idx = 0;
    S.lines.forEach((line, li) => {
      html += `<div class="ln" data-line="${li}">`;
      for (const c of line) { html += `<span class="c" data-i="${idx}">${c === ' ' ? ' ' : esc(c)}</span>`; idx++; }
      if (li < S.lines.length - 1) { html += `<span class="c eol" data-i="${idx}">↵</span>`; idx++; }
      html += '</div>';
    });
    box.innerHTML = `<div class="tb-view">${html}</div>`;
    S.spans = $$('.c', box);
    S.lineEls = $$('.ln', box);
    // okno přesně na 5 řádků, aby se při posunu nic neusekávalo
    const pitch = S.lineEls.length > 1 ? S.lineEls[1].offsetTop - S.lineEls[0].offsetTop : S.lineEls[0].offsetHeight;
    $('.tb-view', box).style.maxHeight = pitch * 5 + 'px';
  }

  function lineIndexOf(pos) {
    let n = 0;
    for (let i = 0; i < S.lines.length; i++) { n += S.lines[i].length + 1; if (pos < n) return i; }
    return S.lines.length - 1;
  }

  function updateCursor() {
    if (!S || !S.spans) return;
    $$('.c.cur', $('#textbox')).forEach(e => e.classList.remove('cur', 'miss'));
    const span = S.spans[S.pos];
    if (span) span.classList.add('cur');
    const li = lineIndexOf(S.pos);
    S.lineEls.forEach((el, i) => el.classList.toggle('past', i < li));
    $('.tb-view').scrollTop = li > 0 ? S.lineEls[li - 1].offsetTop - S.lineEls[0].offsetTop : 0;
    updateHint();
  }

  function updateHint() {
    $$('.key.next').forEach(k => k.classList.remove('next'));
    $$('.hands .finger.on').forEach(f => { f.classList.remove('on'); f.style.fill = ''; });
    if (!S || S.done) return;
    const ch = S.text[S.pos];
    const seq = Layout.sequence(ch);
    const hint = $('#hint');
    if (!seq) { hint.innerHTML = `Další znak: <b>${esc(keyLabel(ch))}</b>`; return; }
    const step = seq[Math.min(S.step, seq.length - 1)];
    const lightFinger = f => $$(`.hands .finger[data-finger="${f}"]`).forEach(el => { el.classList.add('on'); el.style.fill = `var(--f-${f})`; });
    $$(`.key[data-code="${step.code}"]`).forEach(k => k.classList.add('next'));
    lightFinger(Layout.finger(step.code));
    if (step.shift) { $$(`.key[data-code="${step.shift}"]`).forEach(k => k.classList.add('next')); lightFinger(Layout.finger(step.shift)); }
    if (step.altgr) { $$('.key[data-code="AltRight"]').forEach(k => k.classList.add('next')); lightFinger('TH'); }

    if (S.layoutWarn >= 2 && settings().input === 'system') {
      hint.innerHTML = `⚠️ Zdá se, že ve Windows nemáš zapnutou <b>českou klávesnici</b>. Přepni ji (Win + mezerník), nebo
        <button class="btn small primary" id="emuBtn">zapni emulaci české klávesnice</button>`;
      $('#emuBtn').onclick = () => { settings().input = 'emulate'; save(); S.layoutWarn = 0; updateHint(); };
      return;
    }
    const parts = seq.map((s, i) => {
      const key = Layout.rows.flat().find(k => k.code === s.code);
      let name = s.code === 'Space' ? 'mezerník' : s.code === 'Enter' ? 'Enter' : (key && (key.base || '').length === 1 ? key.base.toUpperCase() : s.code);
      if (key && key.base === '´') name = s.shift ? 'ˇ (háček)' : '´ (čárka)';
      if (key && key.code === 'Backquote' && s.shift) name = '° (kroužek)';
      let txt = (s.shift ? 'Shift + ' : '') + (s.altgr ? 'AltGr + ' : '') + name;
      txt += ` <span class="muted">(${Layout.FINGER_NAMES[Layout.finger(s.code)]})</span>`;
      return i === S.step ? `<b>${txt}</b>` : txt;
    });
    hint.innerHTML = `Další: <span class="kcap">${esc(keyLabel(ch))}</span> &nbsp; ${parts.join(' &nbsp;→&nbsp; ')}`;
  }

  function liveElapsed() {
    if (!S) return 0;
    let t = S.elapsed;
    if (S.last != null && !S.done && !S.paused) t += Math.min(performance.now() - S.last, IDLE_CAP);
    return t;
  }
  function speedOf(keystrokes, ms) { return ms < 1500 ? 0 : Math.round(keystrokes / (ms / 60000)); }

  function updateStats() {
    if (!S || current !== 'typing' || !$('#stSpeed')) return;
    const t = liveElapsed();
    $('#stSpeed').textContent = speedOf(S.keystrokes, t);
    $('#stErr').textContent = S.errors;
    const pct = S.errors / S.text.length * 100;
    $('#stErrBox').classList.toggle('bad', pct > settings().maxErr);
    $('#stTime').textContent = fmtTime(t);
    $('#stProg').textContent = Math.floor(S.pos / S.text.length * 100) + ' %';
  }
  setInterval(updateStats, 250);

  function flashKey(code, cls = 'pressed') {
    $$(`.key[data-code="${code}"]`).forEach(k => {
      k.classList.add(cls);
      setTimeout(() => k.classList.remove(cls), cls === 'wrong' ? 250 : 110);
    });
  }

  function keyStat(ch) {
    const keys = profile().keys;
    return keys[ch] || (keys[ch] = { hit: 0, miss: 0 });
  }

  function typeChar(ch, code) {
    if (!S || S.done) return;
    const now = performance.now();
    if (S.paused) { S.paused = false; $('#textbox').classList.remove('paused'); }
    if (S.last != null) S.elapsed += Math.min(now - S.last, IDLE_CAP);
    S.last = now;
    S.started = true;
    const exp = S.text[S.pos];
    const ks = keyStat(exp);
    if (ch === exp) {
      ks.hit++;
      S.keystrokes += Layout.keystrokes(exp);
      S.spans[S.pos].classList.add(S.errAt.has(S.pos) ? 'err' : 'ok');
      S.pos++;
      S.step = 0;
      if (S.pos >= S.text.length) return finish();
      updateCursor();
    } else {
      S.errors++;
      ks.miss++;
      S.errAt.add(S.pos);
      S.missed[exp] = (S.missed[exp] || 0) + 1;
      if (settings().input === 'system' && code && Layout.charFromCode(code, false, false) !== null) {
        const want = Layout.sequence(exp);
        if (want && want[want.length - 1].code === code && /[\p{L}\d]/u.test(ch)) S.layoutWarn++;
      }
      beep();
      if (code) flashKey(code, 'wrong');
      S.step = 0;
      if (settings().onError === 'continue') {
        S.spans[S.pos].classList.add('err');
        S.pos++;
        if (S.pos >= S.text.length) return finish();
        updateCursor();
      } else {
        const span = S.spans[S.pos];
        span.classList.remove('miss'); void span.offsetWidth; span.classList.add('miss');
        updateHint();
      }
    }
    updateStats();
  }

  function advanceDead(code) {
    const seq = Layout.sequence(S.text[S.pos]);
    if (seq && seq.length > 1 && seq[0].code === code) { S.step = 1; updateHint(); }
    flashKey(code);
  }

  const MODIFIERS = ['Shift', 'Control', 'Alt', 'AltGraph', 'CapsLock', 'Meta', 'OS', 'Fn'];
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('hidden')) {
      if (modalKeys) modalKeys(e);
      return;
    }
    if (current !== 'typing' || !S || S.done) return;
    if (e.key === 'Escape') { e.preventDefault(); restart(false); return; }
    if (e.metaKey || (e.ctrlKey && !e.altKey)) return;
    if (MODIFIERS.includes(e.key)) { flashKey(e.code); return; }
    if (e.key === 'Tab' || e.key === 'Backspace') { e.preventDefault(); return; }
    const altgr = (e.getModifierState && e.getModifierState('AltGraph')) || (e.ctrlKey && e.altKey);
    let ch = null;
    if (settings().input === 'emulate') {
      ch = Layout.charFromCode(e.code, e.shiftKey, altgr);
      if (ch && Layout.isDead(ch)) { e.preventDefault(); S.dead = ch; advanceDead(e.code); return; }
      if (ch && S.dead) { ch = Layout.compose(S.dead, ch) || ch; S.dead = null; }
    } else {
      if (e.key === 'Dead') { S.deadCode = { code: e.code, shift: e.shiftKey }; advanceDead(e.code); return; }
      if (e.key === 'Enter') ch = '\n';
      else if (e.key.length === 1) ch = e.key;
      if (ch && S.deadCode) {
        const d = Layout.charFromCode(S.deadCode.code, S.deadCode.shift, false);
        if (d && Layout.isDead(d)) ch = Layout.compose(d, ch) || ch;
        S.deadCode = null;
      }
    }
    if (!ch) return;
    e.preventDefault();
    flashKey(e.code);
    typeChar(ch, e.code);
  });

  window.addEventListener('blur', () => {
    if (!S || !S.started || S.done || S.paused) return;
    if (S.last != null) S.elapsed += Math.min(performance.now() - S.last, IDLE_CAP);
    S.last = null;
    S.paused = true;
    const box = $('#textbox');
    if (box) box.classList.add('paused');
  });

  function finish() {
    S.done = true;
    updateHint();
    const time = Math.max(S.elapsed, 1000);
    const speed = speedOf(S.keystrokes, time);
    const errPct = S.errors / S.text.length * 100;
    const maxErr = settings().maxErr;
    const passed = errPct <= maxErr;
    const stars = passed ? 1 + (S.goal && speed >= S.goal ? 1 : 0) + (errPct <= maxErr / 3 ? 1 : 0) : 0;
    const p = profile();
    p.history.push({ t: Date.now(), kind: S.kind, id: S.id || null, title: S.title, speed, err: Math.round(errPct * 10) / 10, time: Math.round(time), chars: S.text.length });
    if (p.history.length > 1000) p.history.splice(0, p.history.length - 1000);
    let improved = false;
    if (S.kind === 'lesson') {
      const d = p.done[S.id] || { stars: 0, best: 0, err: null, tries: 0 };
      d.tries++;
      if (stars > d.stars) { d.stars = stars; improved = true; }
      if (passed && speed > d.best) d.best = speed;
      if (d.err == null || errPct < d.err) d.err = Math.round(errPct * 10) / 10;
      p.done[S.id] = d;
    }
    save();

    const missed = Object.entries(S.missed).sort((a, b) => b[1] - a[1]).slice(0, 8);
    let msg;
    if (!passed) msg = `Příliš mnoho chyb (víc než ${maxErr} %). Zkus to znovu – pomaleji a přesněji.`;
    else if (stars === 3) msg = 'Výborně! Perfektní výkon.';
    else if (stars === 2) msg = 'Skvělé! Lekce splněna.';
    else msg = S.goal ? `Splněno! Pro další hvězdu zkus dosáhnout ${S.goal} úhozů za minutu.` : 'Splněno!';
    const isLesson = S.kind === 'lesson';
    const nextL = isLesson ? LESSONS.find(l => l.id === S.id + 1) : null;
    const primary = passed && nextL ? 'next' : 'again';
    openModal(`
      ${isLesson ? `<div class="result-stars">${starsHtml(stars).replace('class="stars"', '')}</div>` : ''}
      <div class="result-msg ${passed ? 'ok' : 'bad'}">${esc(msg)}</div>
      <div class="result-grid">
        <div class="stat"><div class="v">${speed}</div><div class="l">úhozů / min</div></div>
        <div class="stat ${passed ? '' : 'bad'}"><div class="v">${fmtPct(errPct)}</div><div class="l">chybovost (${S.errors} chyb)</div></div>
        <div class="stat"><div class="v">${fmtTime(time)}</div><div class="l">čas</div></div>
      </div>
      ${missed.length ? `<div class="mistakes">Nejvíc chyb: ${missed.map(([c, n]) => `<span class="kcap">${esc(keyLabel(c))}</span>×${n}`).join(' ')}</div>` : '<div class="mistakes muted">Bez jediné chyby! 👏</div>'}
      ${improved && isLesson ? '<p class="muted" style="text-align:center">Nový osobní rekord v této lekci.</p>' : ''}
      <div class="modal-actions">
        <button class="btn" id="rBack">Seznam lekcí</button>
        <button class="btn ${primary === 'again' ? 'primary' : ''}" id="rAgain">↺ Znovu</button>
        ${nextL ? `<button class="btn ${primary === 'next' ? 'primary' : ''}" id="rNext">Další lekce ▶</button>` : ''}
      </div>
      <p class="muted" style="text-align:right;font-size:12px;margin:8px 0 0">Enter = zvýrazněné tlačítko</p>`,
    e => {
      if (e.key === 'Enter') { e.preventDefault(); if (performance.now() - openedAt > 400) (primary === 'next' ? doNext : doAgain)(); }
      if (e.key === 'Escape') { e.preventDefault(); doBack(); }
    });
    const openedAt = performance.now();
    const doBack = () => go(isLesson ? 'home' : S.kind === 'weak' ? 'weak' : S.kind === 'custom' ? 'custom' : 'home');
    const doAgain = () => { closeModal(); restart(isLesson || S.kind === 'weak'); };
    const doNext = () => { closeModal(); startLesson(nextL.id); };
    $('#rBack').onclick = doBack;
    $('#rAgain').onclick = doAgain;
    if (nextL) $('#rNext').onclick = doNext;
  }

  // ---------- Vlastní text ----------
  function renderCustom() {
    view.innerHTML = `<h1>Vlastní text</h1>
      <p class="muted">Vlož libovolný text (třeba z knihy nebo článku) a procvič si ho. Typografické uvozovky a pomlčky se automaticky převedou na znaky z klávesnice.</p>
      <div class="row" style="margin-bottom:10px">
        <select id="sample"><option value="">— vložit ukázkový text —</option>${DATA.TEXTS.map((t, i) => `<option value="${i}">${esc(t.title)}</option>`).join('')}</select>
      </div>
      <textarea id="customText" placeholder="Sem vlož nebo napiš text…">${esc(store.customText || '')}</textarea>
      <div class="row" style="margin-top:12px"><button class="btn primary" id="customGo">▶ Začít psát</button><span class="muted" id="customNote"></span></div>`;
    $('#sample').onchange = e => { if (e.target.value !== '') $('#customText').value = DATA.TEXTS[+e.target.value].text; };
    $('#customGo').onclick = () => {
      const raw = $('#customText').value;
      store.customText = raw; save();
      const { lines, skipped } = Lessons.normalizeCustom(raw, 52);
      if (!lines.length) { $('#customNote').textContent = 'Nejdřív vlož nějaký text.'; return; }
      beginSession({ kind: 'custom', title: 'Vlastní text', crumb: skipped ? `Vynecháno ${skipped} znaků, které nejdou napsat.` : '', lines });
    };
  }

  // ---------- Slabá místa ----------
  function weakKeys() {
    return Object.entries(profile().keys)
      .filter(([c, s]) => c !== '\n' && s.hit + s.miss >= 8 && s.miss > 0)
      .map(([c, s]) => ({ c, rate: s.miss / (s.hit + s.miss), n: s.hit + s.miss }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 6);
  }
  function startWeak() {
    const w = weakKeys().map(x => x.c === ' ' ? null : x.c).filter(Boolean);
    if (!w.length) return go('weak');
    const lines = Lessons.weak(w, { length: settings().length }).lines;
    beginSession({ kind: 'weak', title: 'Trénink slabých míst', crumb: 'Cvičení na míru', tip: 'Cvičení obsahuje znaky, ve kterých nejčastěji chybuješ.', lines });
  }
  function renderWeak() {
    const w = weakKeys();
    view.innerHTML = `<h1>Slabá místa</h1>
      <p class="muted">Program si pamatuje, ve kterých znacích chybuješ, a sestaví ti z nich cvičení na míru.</p>
      ${w.length ? `<div class="weak-keys">${w.map(x => `<div class="weak-key"><span class="kcap">${esc(keyLabel(x.c))}</span><div>${fmtPct(x.rate * 100)} chyb</div></div>`).join('')}</div>
        <button class="btn primary" id="weakGo">🎯 Procvičit slabá místa</button>`
      : '<div class="card">Zatím nemám dost dat. Projdi pár lekcí a pak se sem vrať.</div>'}
      <h2 style="margin-top:28px">Chybovost podle kláves</h2>
      <p class="muted">Čím červenější klávesa, tím častěji na ní chybuješ.</p>
      <div class="kb-wrap">${keyboardHtml({ heat: heatOf })}</div>`;
    if ($('#weakGo')) $('#weakGo').onclick = startWeak;
  }
  function heatOf(k) {
    const keys = profile().keys;
    let hit = 0, miss = 0;
    for (const ch of [k.base, k.shift, k.code === 'Enter' ? '\n' : null]) {
      if (ch && keys[ch]) { hit += keys[ch].hit; miss += keys[ch].miss; }
    }
    if (hit + miss < 5) return null;
    return Math.min(1, (miss / (hit + miss)) * 6);
  }

  // ---------- Statistiky ----------
  function renderStats() {
    const p = profile();
    const h = p.history;
    const totalTime = h.reduce((a, x) => a + x.time, 0);
    const last10 = h.slice(-10);
    const avg = last10.length ? Math.round(last10.reduce((a, x) => a + x.speed, 0) / last10.length) : 0;
    const avgErr = last10.length ? last10.reduce((a, x) => a + x.err, 0) / last10.length : 0;
    const best = h.reduce((a, x) => Math.max(a, x.err <= settings().maxErr ? x.speed : 0), 0);
    const doneCount = Object.values(p.done).filter(d => d.stars > 0).length;
    const starsTotal = Object.values(p.done).reduce((a, d) => a + d.stars, 0);
    view.innerHTML = `<h1>Statistiky – ${esc(store.current)}</h1>
      <div class="tiles">
        <div class="card tile"><div class="v">${doneCount}/${LESSONS.length}</div><div class="l">splněných lekcí</div></div>
        <div class="card tile"><div class="v">${starsTotal} ★</div><div class="l">získaných hvězd</div></div>
        <div class="card tile"><div class="v">${avg}</div><div class="l">průměr posledních 10 (úh/min)</div></div>
        <div class="card tile"><div class="v">${fmtPct(avgErr)}</div><div class="l">průměrná chybovost (10)</div></div>
        <div class="card tile"><div class="v">${best}</div><div class="l">nejlepší rychlost</div></div>
        <div class="card tile"><div class="v">${Math.round(totalTime / 60000)} min</div><div class="l">celkem procvičováno (${h.length}×)</div></div>
      </div>
      <div class="card" style="margin-bottom:18px">
        <h2>Vývoj rychlosti</h2>
        <div class="legend"><span><i style="background:var(--accent)"></i>úhozy za minutu</span><span><i style="background:var(--bad)"></i>chybovost %</span></div>
        ${chartSvg(h.slice(-50))}
      </div>
      <div class="card">
        <h2>Poslední cvičení</h2>
        ${h.length ? `<table><thead><tr><th>Datum</th><th>Cvičení</th><th>Rychlost</th><th>Chyby</th><th>Čas</th></tr></thead><tbody>
          ${h.slice(-25).reverse().map(x => `<tr><td>${new Date(x.t).toLocaleString('cs-CZ', { day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' })}</td><td>${esc(x.title)}</td><td>${x.speed}</td><td>${fmtPct(x.err)}</td><td>${fmtTime(x.time)}</td></tr>`).join('')}
        </tbody></table>` : '<p class="muted">Zatím žádná cvičení.</p>'}
      </div>`;
  }
  function chartSvg(h) {
    const W = 800, H = 220, L = 40, R = 40, T = 12, B = 26;
    if (h.length < 2) return '<p class="muted">Graf se zobrazí po dvou a více cvičeních.</p>';
    const maxS = Math.max(100, Math.ceil(Math.max(...h.map(x => x.speed)) / 50) * 50);
    const maxE = Math.max(5, Math.ceil(Math.max(...h.map(x => x.err))));
    const x = i => L + (W - L - R) * (i / (h.length - 1));
    const yS = v => T + (H - T - B) * (1 - v / maxS);
    const yE = v => T + (H - T - B) * (1 - Math.min(v, maxE) / maxE);
    let g = '';
    for (let i = 0; i <= 4; i++) {
      const v = maxS * i / 4, y = yS(v);
      g += `<line class="grid" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text class="axis" x="${L - 6}" y="${y + 4}" text-anchor="end">${Math.round(v)}</text>`;
      g += `<text class="axis" x="${W - R + 6}" y="${y + 4}">${Math.round(maxE * i / 4)} %</text>`;
    }
    const ps = h.map((p, i) => `${x(i).toFixed(1)},${yS(p.speed).toFixed(1)}`).join(' ');
    const pe = h.map((p, i) => `${x(i).toFixed(1)},${yE(p.err).toFixed(1)}`).join(' ');
    const dots = h.map((p, i) => `<circle class="dot" cx="${x(i).toFixed(1)}" cy="${yS(p.speed).toFixed(1)}" r="3"><title>${esc(p.title)}: ${p.speed} úh/min, ${p.err} %</title></circle>`).join('');
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Graf rychlosti">${g}<polyline class="line-err" points="${pe}"/><polyline class="line-speed" points="${ps}"/>${dots}</svg>`;
  }

  // ---------- Nastavení ----------
  function seg(name, options) {
    const v = settings()[name];
    return `<div class="seg" data-setting="${name}">${options.map(([val, label]) => `<button data-v="${val}" class="${String(v) === String(val) ? 'on' : ''}">${esc(label)}</button>`).join('')}</div>`;
  }
  function renderSettings() {
    view.innerHTML = `<h1>Nastavení</h1>
      <div class="settings">
        <div class="card">
          <h2>Klávesnice</h2>
          <div class="setting"><div><b>Rozložení</b><div class="d">Česká klávesnice QWERTZ (výchozí ve Windows) nebo QWERTY (Y a Z prohozené).</div></div>${seg('layout', [['qwertz', 'QWERTZ'], ['qwerty', 'QWERTY']])}</div>
          <div class="setting"><div><b>Zadávání znaků</b><div class="d">„Systémová“ používá klávesnici nastavenou ve Windows (musí být česká). „Emulace“ převádí klávesy na české znaky sama – funguje i s anglickou klávesnicí.</div></div>${seg('input', [['system', 'Systémová'], ['emulate', 'Emulace']])}</div>
          <div class="setting"><div><b>Barevné klávesy podle prstů</b><div class="d">Každý prst má svou barvu.</div></div>${seg('colorKeys', [[true, 'Ano'], [false, 'Ne']])}</div>
          <div class="setting"><div><b>Zobrazit ruce</b></div>${seg('showHands', [[true, 'Ano'], [false, 'Ne']])}</div>
        </div>
        <div class="card">
          <h2>Cvičení</h2>
          <div class="setting"><div><b>Při chybě</b><div class="d">Zastavit = musíš napsat správný znak. Pokračovat = chyba se označí a jde se dál.</div></div>${seg('onError', [['stop', 'Zastavit'], ['continue', 'Pokračovat']])}</div>
          <div class="setting"><div><b>Délka cvičení</b></div>${seg('length', [['short', 'Krátká'], ['medium', 'Střední'], ['long', 'Dlouhá']])}</div>
          <div class="setting"><div><b>Maximální chybovost pro splnění</b></div>${seg('maxErr', [[1, '1 %'], [2, '2 %'], [3, '3 %'], [5, '5 %'], [10, '10 %']])}</div>
          <div class="setting"><div><b>Zvuk při chybě</b></div>${seg('sound', [[true, 'Ano'], [false, 'Ne']])}</div>
        </div>
        <div class="card">
          <h2>Vzhled</h2>
          <div class="setting"><div><b>Motiv</b></div>${seg('theme', [['auto', 'Podle systému'], ['light', 'Světlý'], ['dark', 'Tmavý']])}</div>
        </div>
        <div class="card">
          <h2>Uživatel „${esc(store.current)}“</h2>
          <div class="row">
            <button class="btn" id="renameBtn">Přejmenovat</button>
            <button class="btn" id="exportBtn">Uložit zálohu…</button>
            <button class="btn" id="importBtn">Načíst zálohu…</button>
            <button class="btn danger" id="resetBtn">Smazat postup</button>
            ${Object.keys(store.profiles).length > 1 ? '<button class="btn danger" id="deleteBtn">Smazat uživatele</button>' : ''}
          </div>
          <input type="file" id="importFile" accept=".json,application/json" class="hidden">
        </div>
      </div>`;
    $$('.seg').forEach(sg => sg.addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      const name = sg.dataset.setting;
      const old = settings()[name];
      let v = b.dataset.v;
      if (typeof old === 'boolean') v = v === 'true';
      else if (typeof old === 'number') v = Number(v);
      settings()[name] = v;
      save();
      if (name === 'layout') { Layout.setVariant(v); LESSONS = Lessons.list(); }
      if (name === 'theme') applyTheme();
      $$('button', sg).forEach(x => x.classList.toggle('on', x === b));
    }));
    $('#renameBtn').onclick = async () => {
      const name = await promptModal('Přejmenovat uživatele', 'Nové jméno:', store.current);
      if (name && !store.profiles[name]) {
        store.profiles[name] = store.profiles[store.current];
        delete store.profiles[store.current];
        store.current = name; save(); renderProfiles();
      }
      renderSettings();
    };
    $('#resetBtn').onclick = async () => {
      if (await confirmModal('Smazat postup', `Opravdu smazat všechny výsledky uživatele „${store.current}“?`, 'Smazat')) {
        store.profiles[store.current] = newProfile(); save();
      }
      renderSettings();
    };
    if ($('#deleteBtn')) $('#deleteBtn').onclick = async () => {
      if (await confirmModal('Smazat uživatele', `Opravdu smazat uživatele „${store.current}“ i s výsledky?`, 'Smazat')) {
        delete store.profiles[store.current];
        store.current = Object.keys(store.profiles)[0];
        save(); renderProfiles();
      }
      renderSettings();
    };
    $('#exportBtn').onclick = () => {
      const blob = new Blob([JSON.stringify(store, null, 1)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'psani-vsemi-deseti-zaloha.json';
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    };
    $('#importBtn').onclick = () => $('#importFile').click();
    $('#importFile').onchange = e => {
      const f = e.target.files[0];
      if (!f) return;
      f.text().then(t => {
        const d = JSON.parse(t);
        if (!d || !d.profiles) throw new Error('bad');
        localStorage.setItem(STORE_KEY, JSON.stringify(d));
        store = load();
        Layout.setVariant(settings().layout); LESSONS = Lessons.list(); applyTheme(); renderProfiles(); renderSettings();
      }).catch(() => confirmModal('Chyba', 'Soubor se nepodařilo načíst.', 'OK'));
    };
  }

  // ---------- Nápověda ----------
  function renderHelp() {
    view.innerHTML = `<div class="help">
      <h1>Jak se naučit psát všemi deseti</h1>
      <p>Psaní všemi deseti (hmatová metoda) znamená, že píšeš všemi prsty a <b>nedíváš se na klávesnici</b>. Každý prst má na starosti jen několik kláves. Kurz tě provede od základní řady přes horní a dolní řadu, velká písmena, háčky a čárky až po čísla, znaky a souvislé texty.</p>
      <h2>Základní poloha</h2>
      <ul>
        <li>Levá ruka: malíček na <span class="kcap">A</span>, prsteníček <span class="kcap">S</span>, prostředníček <span class="kcap">D</span>, ukazováček <span class="kcap">F</span>.</li>
        <li>Pravá ruka: ukazováček na <span class="kcap">J</span>, prostředníček <span class="kcap">K</span>, prsteníček <span class="kcap">L</span>, malíček <span class="kcap">Ů</span>.</li>
        <li>Palce leží na mezerníku. Na klávesách F a J nahmatáš malé výstupky.</li>
        <li>Po každém úhozu se prst vrací zpět na základní řadu.</li>
      </ul>
      <h2>Správné sezení</h2>
      <ul>
        <li>Seď rovně, chodidla celou plochou na zemi, lokty volně u těla ve výšce stolu.</li>
        <li>Zápěstí drž rovně a neopírej je o hranu klávesnice. Prsty jsou lehce zahnuté.</li>
        <li>Monitor měj ve vzdálenosti paže, horní okraj přibližně ve výšce očí.</li>
      </ul>
      <h2>Jak cvičit</h2>
      <ul>
        <li><b>Přesnost před rychlostí.</b> Lekce je splněná, když nepřekročíš povolenou chybovost (výchozí 3 %). Rychlost přijde sama.</li>
        <li>Cvič raději každý den 10–20 minut než jednou týdně dlouho.</li>
        <li>Hvězdy: ★ splněno, ★★ navíc dosažena cílová rychlost, ★★★ navíc téměř bez chyb.</li>
        <li>Rychlost se měří v <b>úhozech za minutu</b> – velké písmeno se Shiftem jsou dva úhozy, písmeno přes mrtvou klávesu (ó, ď…) také dva.</li>
        <li>Zvýrazněná klávesa a prst na obrázku ukazují, čím máš psát. Zkus se ale co nejdřív dívat jen na text.</li>
        <li><span class="kcap">Esc</span> spustí cvičení znovu. Když přepneš do jiného okna, čas se zastaví.</li>
      </ul>
      <h2>Česká klávesnice ve Windows</h2>
      <p>Pro správné psaní háčků a čárek musí být ve Windows zapnutá česká klávesnice: <i>Nastavení → Čas a jazyk → Jazyk a oblast → Čeština → Možnosti → Přidat klávesnici → Česká</i>. Mezi klávesnicemi se přepíná zkratkou <span class="kcap">Win</span> + <span class="kcap">mezerník</span> nebo <span class="kcap">Alt</span> + <span class="kcap">Shift</span>.</p>
      <p>Pokud českou klávesnici nastavit nemůžeš, zapni v <b>Nastavení</b> volbu <b>Zadávání znaků → Emulace</b>. Program pak sám převádí stisknuté klávesy na české znaky.</p>
      <h2>Přiřazení prstů</h2>
      <div class="kb-wrap">${keyboardHtml()}</div>
    </div>`;
    $$('.help .keyboard').forEach(k => k.classList.add('colored'));
  }

  renderProfiles();
  go('home');
})();
