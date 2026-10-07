'use strict';
// Česká klávesnice (QWERTZ / QWERTY), přiřazení prstů a převod znaku na posloupnost úhozů.
const Layout = (() => {
  const FINGER_NAMES = {
    LP: 'levý malíček', LR: 'levý prsteníček', LM: 'levý prostředníček', LI: 'levý ukazováček',
    TH: 'palec',
    RI: 'pravý ukazováček', RM: 'pravý prostředníček', RR: 'pravý prsteníček', RP: 'pravý malíček',
  };

  // Mrtvé klávesy: nejdřív se stiskne znaménko, potom písmeno.
  const DEAD = {
    '´': { a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú', y: 'ý', A: 'Á', E: 'É', I: 'Í', O: 'Ó', U: 'Ú', Y: 'Ý' },
    'ˇ': { c: 'č', d: 'ď', e: 'ě', n: 'ň', r: 'ř', s: 'š', t: 'ť', z: 'ž', C: 'Č', D: 'Ď', E: 'Ě', N: 'Ň', R: 'Ř', S: 'Š', T: 'Ť', Z: 'Ž' },
    '°': { u: 'ů', U: 'Ů' },
    '¨': { a: 'ä', o: 'ö', u: 'ü', e: 'ë', A: 'Ä', O: 'Ö', U: 'Ü' },
  };

  // Znaky dostupné přes pravý Alt (AltGr) na české klávesnici ve Windows.
  const ALTGR = {
    KeyQ: '\\', KeyW: '|', KeyE: '€', KeyF: '[', KeyG: ']', KeyV: '@', KeyB: '{', KeyN: '}',
    KeyX: '#', KeyC: '&', Semicolon: '$', Comma: '<', Period: '>', Slash: '*', Digit3: '^', Digit7: '`', Digit1: '~',
  };

  function k(code, base, shift, finger, w, label) {
    return { code, base, shift, finger, w: w || 1, label };
  }

  function buildRows(variant) {
    const qwerty = variant === 'qwerty';
    const kY = qwerty ? ['y', 'Y'] : ['z', 'Z'];
    const kZ = qwerty ? ['z', 'Z'] : ['y', 'Y'];
    return [
      [
        k('Backquote', ';', '°', 'LP'), k('Digit1', '+', '1', 'LP'), k('Digit2', 'ě', '2', 'LR'),
        k('Digit3', 'š', '3', 'LM'), k('Digit4', 'č', '4', 'LI'), k('Digit5', 'ř', '5', 'LI'),
        k('Digit6', 'ž', '6', 'RI'), k('Digit7', 'ý', '7', 'RI'), k('Digit8', 'á', '8', 'RM'),
        k('Digit9', 'í', '9', 'RR'), k('Digit0', 'é', '0', 'RP'), k('Minus', '=', '%', 'RP'),
        k('Equal', '´', 'ˇ', 'RP'), k('Backspace', null, null, 'RP', 2, '⌫'),
      ],
      [
        k('Tab', null, null, 'LP', 1.5, 'Tab ⇥'), k('KeyQ', 'q', 'Q', 'LP'), k('KeyW', 'w', 'W', 'LR'),
        k('KeyE', 'e', 'E', 'LM'), k('KeyR', 'r', 'R', 'LI'), k('KeyT', 't', 'T', 'LI'),
        k('KeyY', kY[0], kY[1], 'RI'), k('KeyU', 'u', 'U', 'RI'), k('KeyI', 'i', 'I', 'RM'),
        k('KeyO', 'o', 'O', 'RR'), k('KeyP', 'p', 'P', 'RP'), k('BracketLeft', 'ú', '/', 'RP'),
        k('BracketRight', ')', '(', 'RP'), k('Enter', null, null, 'RP', 1.5, 'Enter ↵'),
      ],
      [
        k('CapsLock', null, null, 'LP', 1.75, 'Caps'), k('KeyA', 'a', 'A', 'LP'), k('KeyS', 's', 'S', 'LR'),
        k('KeyD', 'd', 'D', 'LM'), k('KeyF', 'f', 'F', 'LI'), k('KeyG', 'g', 'G', 'LI'),
        k('KeyH', 'h', 'H', 'RI'), k('KeyJ', 'j', 'J', 'RI'), k('KeyK', 'k', 'K', 'RM'),
        k('KeyL', 'l', 'L', 'RR'), k('Semicolon', 'ů', '"', 'RP'), k('Quote', '§', '!', 'RP'),
        k('Backslash', '¨', "'", 'RP'), k('Enter', null, null, 'RP', 1.25, ''),
      ],
      [
        k('ShiftLeft', null, null, 'LP', 1.25, 'Shift ⇧'), k('IntlBackslash', '\\', '|', 'LP'),
        k('KeyZ', kZ[0], kZ[1], 'LP'), k('KeyX', 'x', 'X', 'LR'), k('KeyC', 'c', 'C', 'LM'),
        k('KeyV', 'v', 'V', 'LI'), k('KeyB', 'b', 'B', 'LI'), k('KeyN', 'n', 'N', 'RI'),
        k('KeyM', 'm', 'M', 'RI'), k('Comma', ',', '?', 'RM'), k('Period', '.', ':', 'RR'),
        k('Slash', '-', '_', 'RP'), k('ShiftRight', null, null, 'RP', 2.75, 'Shift ⇧'),
      ],
      [
        k('ControlLeft', null, null, 'LP', 1.25, 'Ctrl'), k('MetaLeft', null, null, 'LP', 1.25, '⊞'),
        k('AltLeft', null, null, 'TH', 1.25, 'Alt'), k('Space', ' ', null, 'TH', 6.25, ''),
        k('AltRight', null, null, 'TH', 1.25, 'AltGr'), k('MetaRight', null, null, 'RP', 1.25, '⊞'),
        k('ContextMenu', null, null, 'RP', 1.25, '☰'), k('ControlRight', null, null, 'RP', 1.25, 'Ctrl'),
      ],
    ];
  }

  let variant = 'qwertz';
  let rows = buildRows(variant);
  let byCode = {};
  let charMap = {};

  function shiftFor(code) {
    const f = byCode[code] ? byCode[code].finger : 'RP';
    return f[0] === 'L' ? 'ShiftRight' : 'ShiftLeft';
  }

  function rebuild() {
    byCode = {};
    charMap = {};
    for (const row of rows) for (const key of row) if (!byCode[key.code]) byCode[key.code] = key;
    for (const row of rows) {
      for (const key of row) {
        if (key.code === 'IntlBackslash') continue; // na notebookách chybí – \ a | učíme přes AltGr
        if (key.base && !DEAD[key.base] && !charMap[key.base]) charMap[key.base] = [{ code: key.code }];
        if (key.shift && !DEAD[key.shift] && !charMap[key.shift]) charMap[key.shift] = [{ code: key.code, shift: shiftFor(key.code) }];
      }
    }
    charMap['\n'] = [{ code: 'Enter' }];
    for (const [code, ch] of Object.entries(ALTGR)) {
      if (!charMap[ch]) charMap[ch] = [{ code, altgr: true }];
    }
    const deadStep = {};
    for (const row of rows) {
      for (const key of row) {
        if (DEAD[key.base]) deadStep[key.base] = { code: key.code };
        if (DEAD[key.shift]) deadStep[key.shift] = { code: key.code, shift: shiftFor(key.code) };
      }
    }
    for (const [dead, table] of Object.entries(DEAD)) {
      for (const [src, out] of Object.entries(table)) {
        if (!charMap[out] && charMap[src] && deadStep[dead]) charMap[out] = [deadStep[dead], ...charMap[src]];
      }
    }
  }
  rebuild();

  function setVariant(v) {
    variant = v === 'qwerty' ? 'qwerty' : 'qwertz';
    rows = buildRows(variant);
    rebuild();
  }

  function sequence(ch) { return charMap[ch] || null; }
  function canType(ch) { return !!charMap[ch]; }
  function keystrokes(ch) {
    const seq = charMap[ch];
    if (!seq) return 1;
    return seq.reduce((n, s) => n + 1 + (s.shift ? 1 : 0) + (s.altgr ? 1 : 0), 0);
  }
  function finger(code) {
    if (code === 'ShiftLeft') return 'LP';
    if (code === 'ShiftRight') return 'RP';
    if (code === 'AltRight') return 'TH';
    return byCode[code] ? byCode[code].finger : null;
  }
  function fingerOfChar(ch) {
    const seq = charMap[ch];
    return seq ? finger(seq[seq.length - 1].code) : null;
  }

  // Emulace: znak z fyzické klávesy podle zvoleného rozložení (nezávisle na nastavení Windows).
  function charFromCode(code, shift, altgr) {
    if (code === 'Space') return ' ';
    if (code === 'Enter' || code === 'NumpadEnter') return '\n';
    if (altgr) return ALTGR[code] || null;
    const key = byCode[code];
    if (!key) return null;
    let ch = shift ? key.shift : key.base;
    if (!ch) return null;
    return ch;
  }
  function isDead(ch) { return !!DEAD[ch]; }
  function compose(dead, ch) { return (DEAD[dead] && DEAD[dead][ch]) || null; }

  return {
    FINGER_NAMES, get rows() { return rows; }, get variant() { return variant; },
    setVariant, sequence, canType, keystrokes, finger, fingerOfChar, charFromCode, isDead, compose,
  };
})();
