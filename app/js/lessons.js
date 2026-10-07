'use strict';
// Osnova kurzu a generování textu cvičení.
const Lessons = (() => {
  // key: stálý identifikátor lekce (podle něj se ukládá postup – neměnit!)
  // add: nová písmena (malá); caps: 'right' | 'left' | 'dia' přidá velká písmena;
  // type: keys (výchozí) | review | words | sentences | caps | names | numbers | numtext | symbols | symtext | altgrtext
  //       | common | long | syllables | proverbs | twisters | text | exam; blind: skrytá klávesnice
  const DEFS = [
    { key: 'fj', group: 'Základní řada', title: 'F a J', add: 'fj', tip: 'Polož ukazováčky na klávesy F a J – nahmatáš na nich malé výstupky. Ostatní prsty leží vedle nich na A S D a K L Ů, palce na mezerníku. Na klávesnici se nedívej!' },
    { key: 'dk', title: 'D a K', add: 'dk', tip: 'D píše levý prostředníček, K pravý prostředníček. Po každém úhozu se prst vrací na své místo.' },
    { key: 'sl', title: 'S a L', add: 'sl', tip: 'S píše levý prsteníček, L pravý prsteníček.' },
    { key: 'au', title: 'A a Ů', add: 'aů', tip: 'A a Ů píšou malíčky. Teď máš pod prsty celou základní řadu.' },
    { key: 'rev-home', title: 'Opakování základní řady', type: 'review', from: 'fjdksla' },
    { key: 'gh', title: 'G a H', add: 'gh', tip: 'G a H píšou ukazováčky – stačí je posunout o jednu klávesu ke středu a hned se vrátit zpět.' },
    { key: 'words-home', title: 'Slova ze základní řady', type: 'words' },
    { key: 'blind-home', title: 'Naslepo: základní řada', type: 'review', from: 'asdfghjklů', blind: true, tip: 'Klávesnice je teď skrytá. Spolehni se na hmat – výstupky na F a J ti pomohou najít polohu.' },

    { key: 'ei', group: 'Horní řada', title: 'E a I', add: 'ei', tip: 'E píše levý prostředníček, I pravý prostředníček. Prst vyjede nahoru a vrátí se na D/K.' },
    { key: 'ru', title: 'R a U', add: 'ru', tip: 'R a U píšou ukazováčky směrem nahoru (z F na R, z J na U).' },
    { key: 'rev-eiru', title: 'Opakování E I R U', type: 'review', from: 'eiru' },
    { key: 'tz', title: '{T} a {Z}', add: 'tz', tip: '{T} píše levý ukazováček, {Z} pravý ukazováček – jsou nahoře šikmo ke středu.' },
    { key: 'wo', title: 'W a O', add: 'wo', tip: 'W píše levý prsteníček, O pravý prsteníček.' },
    { key: 'qp', title: 'Q a P', add: 'qp', tip: 'Q a P píšou malíčky. Ostatní prsty nech na základní řadě.' },
    { key: 'u-acute', title: 'Ú', add: 'ú', tip: 'Ú píše pravý malíček – klávesa je vpravo vedle P.' },
    { key: 'rev-top', title: 'Opakování horní řady', type: 'review', from: 'tzwoqpú' },
    { key: 'words-top', title: 'Slova – horní a základní řada', type: 'words' },

    { key: 'vm', group: 'Dolní řada', title: 'V a M', add: 'vm', tip: 'V píše levý ukazováček (dolů z F), M pravý ukazováček (dolů z J).' },
    { key: 'c-comma', title: 'C a čárka', add: 'c,', tip: 'C píše levý prostředníček, čárku pravý prostředníček. Za čárkou vždy píšeme mezeru.' },
    { key: 'x-dot', title: 'X a tečka', add: 'x.', tip: 'X píše levý prsteníček, tečku pravý prsteníček.' },
    { key: 'y-dash', title: '{Y} a pomlčka', add: 'y-', tip: '{Y} píše levý malíček, pomlčku pravý malíček.' },
    { key: 'bn', title: 'B a N', add: 'bn', tip: 'B píše levý ukazováček, N pravý ukazováček. Pozor, B je ještě o kus dál ke středu.' },
    { key: 'rev-bottom', title: 'Opakování dolní řady', type: 'review', from: 'vmcxybn' },
    { key: 'words-all', title: 'Slova – celá abeceda', type: 'words' },
    { key: 'sent-lower', title: 'Krátké věty bez háčků', type: 'sentences', lower: true, strip: true },
    { key: 'blind-all', title: 'Naslepo: celá abeceda', type: 'words', blind: true, tip: 'Bez klávesnice na obrazovce. Když nevíš, vrať prsty na základní řadu a zkus to znovu.' },

    { key: 'shift-left', group: 'Velká písmena', title: 'Levý Shift', caps: 'right', type: 'caps', tip: 'Velká písmena pravé ruky píšeme s levým Shiftem (levý malíček). Shift drž, ukonči úhoz a pak ho pusť.' },
    { key: 'shift-right', title: 'Pravý Shift', caps: 'left', type: 'caps', tip: 'Velká písmena levé ruky píšeme s pravým Shiftem (pravý malíček).' },
    { key: 'names', title: 'Jména a města', type: 'names', tip: 'Vlastní jména začínají velkým písmenem. Pamatuj: Shift vždy na opačné straně než písmeno.' },
    { key: 'sent-caps', title: 'Věty s velkými písmeny', type: 'sentences', strip: true },

    { key: 'es', group: 'Háčky a čárky', title: 'Ě a Š', add: 'ěš', tip: 'Háčky a čárky jsou v horní (číselné) řadě. Ě píše levý prsteníček, Š levý prostředníček. Natáhni prst a hned se vrať na základní řadu.' },
    { key: 'cr', title: 'Č a Ř', add: 'čř', tip: 'Č i Ř píše levý ukazováček (z klávesy F nahoru přes R).' },
    { key: 'zy', title: 'Ž a Ý', add: 'žý', tip: 'Ž i Ý píše pravý ukazováček.' },
    { key: 'rev-hacky', title: 'Opakování ě š č ř ž', type: 'review', from: 'ěščřž' },
    { key: 'ai', title: 'Á a Í', add: 'áí', tip: 'Á píše pravý prostředníček, Í pravý prsteníček.' },
    { key: 'e-acute', title: 'É', add: 'é', tip: 'É píše pravý malíček.' },
    { key: 'rev-carky', title: 'Opakování ý á í é', type: 'review', from: 'ýáíé' },
    { key: 'words-uu', title: 'Ú a Ů ve slovech', type: 'words', focus: 'úů', tip: 'Ú píšeme na začátku slova (úkol, úterý), Ů uprostřed a na konci (dům, stůl).' },
    { key: 'words-dia', title: 'Slova s háčky a čárkami', type: 'words', focus: 'ěščřžýáíé' },
    { key: 'dead', title: 'Mrtvé klávesy: ó ď ť ň', add: 'óďťň', tip: 'Některá písmena nemají vlastní klávesu. Nejdřív stiskni čárku ´ nebo háček ˇ (Shift + ´, vpravo nahoře, pravý malíček) a potom písmeno. Na obrazovce se po prvním úhozu ještě nic neobjeví – to je v pořádku.' },
    { key: 'caps-dia', title: 'Velká písmena s diakritikou', caps: 'dia', type: 'caps', tip: 'Velké Č, Ř, Š… píšeme přes háček: ˇ (Shift + ´) a pak Shift + písmeno. Velké Á, É, Í, Ú přes čárku ´ a Shift + písmeno. Ů přes kroužek ° (Shift + ;).' },
    { key: 'sent-dia', title: 'Věty s diakritikou', type: 'sentences' },
    { key: 'text-short', title: 'Krátký text', type: 'text', text: 13 },

    { key: 'num1', group: 'Čísla a znaky', title: 'Čísla 1 2 3 4 5', add: '12345', type: 'numbers', tip: 'Na české klávesnici se čísla píšou se Shiftem. Levá ruka: 1 malíček, 2 prsteníček, 3 prostředníček, 4 a 5 ukazováček.' },
    { key: 'num2', title: 'Čísla 6 7 8 9 0', add: '67890', type: 'numbers', tip: 'Pravá ruka: 6 a 7 ukazováček, 8 prostředníček, 9 prsteníček, 0 malíček. Shift mačká levý malíček.' },
    { key: 'numtext', title: 'Čísla v textu', type: 'numtext' },
    { key: 'sym1', title: 'Otazník, dvojtečka, podtržítko', add: '?:_', type: 'symbols', tip: '? je Shift + čárka, : je Shift + tečka, _ je Shift + pomlčka. Shift mačká levý malíček.' },
    { key: 'sym2', title: 'Vykřičník, uvozovky, apostrof', add: '!"\'', type: 'symbols', tip: '! je Shift + §, " je Shift + ů, apostrof je Shift + ¨ (vedle Enteru). Vše pravý malíček.' },
    { key: 'sym3', title: 'Závorky, lomítko, procenta', add: '()/%', type: 'symbols', tip: ') je vpravo vedle Ú, ( je Shift + ). / je Shift + ú, % je Shift + =.' },
    { key: 'sym4', title: 'Plus, rovná se, středník', add: '+=;', type: 'symbols', tip: '+ je vlevo nahoře (levý malíček), = vpravo nahoře (pravý malíček), středník ; úplně vlevo nahoře.' },
    { key: 'numtext2', title: 'Datum, čas a ceny', type: 'numtext', tip: 'Čas píšeme s dvojtečkou (7:45), datum s tečkami a mezerami (1. 9. 2026).' },
    { key: 'symtext', title: 'Znaky v praxi', type: 'symtext' },

    { key: 'altgr-at', group: 'Speciální znaky (AltGr)', title: 'Zavináč @', add: '@', type: 'symbols', tip: 'Pravý Alt (AltGr) drží pravý palec. @ = AltGr + V. Hodí se pro e-mailové adresy.' },
    { key: 'altgr-1', title: '# & $ *', add: '#&$*', type: 'symbols', tip: '# = AltGr + X, & = AltGr + C, $ = AltGr + Ů, * = AltGr + pomlčka.' },
    { key: 'altgr-2', title: 'Závorky [ ] { } < >', add: '[]{}<>', type: 'symbols', tip: '[ = AltGr + F, ] = AltGr + G, { = AltGr + B, } = AltGr + N, < = AltGr + čárka, > = AltGr + tečka.' },
    { key: 'altgr-3', title: 'Euro, zpětné lomítko, svislítko', add: '€\\|', type: 'symbols', tip: '€ = AltGr + E, \\ = AltGr + Q, | = AltGr + W.' },
    { key: 'altgr-text', title: 'E-maily a speciální znaky', type: 'altgrtext' },

    { key: 'common', group: 'Plynulé psaní', title: 'Nejčastější slova', type: 'common' },
    { key: 'short', title: 'Krátká slova', type: 'short' },
    { key: 'syllables', title: 'Časté slabiky', type: 'syllables', tip: 'Časté skupiny písmen se brzy naučíš psát jedním plynulým pohybem.' },
    { key: 'long', title: 'Dlouhá slova', type: 'long' },
    { key: 'proverbs', title: 'Přísloví', type: 'proverbs' },
    { key: 'twisters', title: 'Jazykolamy', type: 'twisters' },
    { key: 'blind-proverbs', title: 'Naslepo: přísloví', type: 'proverbs', blind: true },
  ];
  DATA.TEXTS.forEach((t, i) => { if (i !== 13) DEFS.push({ key: 'text-' + i, title: (i >= 18 && i % 2 === 0 ? 'Naslepo: ' : 'Text: ') + t.title, type: 'text', text: i, blind: i >= 18 && i % 2 === 0 }); });
  DEFS.push({ key: 'exam', title: 'Závěrečný test', type: 'exam', tip: 'Dlouhý text na závěr. Hlídej si přesnost, rychlost přijde sama.' });

  // Pořadí lekcí ve verzi 2.0 (postup se tehdy ukládal podle čísla lekce).
  const OLD_ORDER = ['fj', 'dk', 'sl', 'au', 'rev-home', 'gh', 'words-home', 'ei', 'ru', 'rev-eiru', 'tz', 'wo', 'qp', 'u-acute', 'words-top',
    'vm', 'c-comma', 'x-dot', 'y-dash', 'bn', 'words-all', 'sent-lower', 'shift-left', 'shift-right', 'sent-caps',
    'es', 'cr', 'zy', 'ai', 'e-acute', 'words-dia', 'dead', 'caps-dia', 'sent-dia', 'text-short',
    'num1', 'num2', 'numtext', 'sym1', 'sym2', 'sym3', 'sym4', 'symtext', 'common', 'long', 'proverbs', 'twisters',
    'text-0', 'text-1', 'text-2', 'text-3', 'text-4', 'text-5', 'text-6', 'text-7', 'text-8', 'text-9', 'text-10', 'text-11', 'text-12', 'exam'];

  const LOWER = 'aábcčdďeéěfghiíjklmnňoópqrřsštťuúůvwxyýzž';
  const DIA = 'áčďéěíňóřšťúůýž';
  const handOf = c => ((Layout.fingerOfChar(c) || 'R')[0] === 'L' ? 'left' : 'right');

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (r, arr) => arr[Math.floor(r() * arr.length)];
  function shuffle(r, arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }
  const strip = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
  const cap = w => w.charAt(0).toUpperCase() + w.slice(1);

  // Písmena z/y se u QWERTY prohazují, aby lekce odpovídaly poloze kláves.
  function swapZY(s) {
    if (Layout.variant !== 'qwerty') return s;
    return s.replace(/[zyZY]/g, c => ({ z: 'y', y: 'z', Z: 'Y', Y: 'Z' })[c]);
  }

  function title(def) {
    return def.title.replace('{T}', 'T').replace('{Z}', Layout.variant === 'qwerty' ? 'Y' : 'Z').replace('{Y}', Layout.variant === 'qwerty' ? 'Z' : 'Y');
  }
  function tip(def) {
    if (!def.tip) return '';
    return def.tip.replace('{T}', 'T').replace('{Z}', Layout.variant === 'qwerty' ? 'Y' : 'Z').replace('{Y}', Layout.variant === 'qwerty' ? 'Z' : 'Y');
  }

  // Seznam lekcí s vypočtenou množinou povolených znaků.
  function list() {
    const allowed = new Set([' ']);
    let group = '';
    return DEFS.map((def, i) => {
      if (def.group) group = def.group;
      const add = swapZY(def.add || '');
      for (const c of add) allowed.add(c);
      if (def.caps === 'right' || def.caps === 'left') {
        for (const c of [...allowed]) if (LOWER.includes(c) && !DIA.includes(c) && handOf(c) === def.caps) allowed.add(c.toUpperCase());
      }
      if (def.caps === 'dia') for (const c of [...allowed]) if (LOWER.includes(c)) allowed.add(c.toUpperCase());
      return {
        id: def.key, num: i + 1, group, def, title: title(def), tip: tip(def),
        add, allowed: new Set(allowed), blind: !!def.blind,
        goal: Math.min(220, 60 + i * 2),
      };
    });
  }

  function fits(text, allowed) {
    for (const c of text) if (!allowed.has(c)) return false;
    return true;
  }

  function wrap(tokens, width) {
    const lines = [];
    let line = '';
    for (const t of tokens) {
      if (!line) line = t;
      else if (line.length + 1 + t.length <= width) line += ' ' + t;
      else { lines.push(line); line = t; }
    }
    if (line) lines.push(line);
    return lines;
  }
  function wrapText(text, width) { return wrap(text.split(/\s+/).filter(Boolean), width); }

  function drillTokens(r, focus, pool, count) {
    const out = [];
    const f = [...focus], p = [...pool];
    for (let i = 0; i < count; i++) {
      const len = 2 + Math.floor(r() * 4);
      let s = '';
      for (let j = 0; j < len; j++) s += r() < 0.55 ? pick(r, f) : pick(r, p);
      if (![...s].some(c => focus.includes(c))) s = pick(r, f) + s.slice(1);
      out.push(s);
    }
    return out;
  }

  function wordPool(allowed, focus) {
    const all = DATA.WORDS.filter(w => fits(w, allowed));
    const withFocus = focus ? all.filter(w => [...focus].some(c => w.includes(c))) : all;
    return { all, withFocus };
  }

  function wordTokens(r, allowed, focus, count) {
    const { all, withFocus } = wordPool(allowed, focus);
    if (all.length < 6) return null;
    const out = [];
    let last = '';
    for (let i = 0; i < count; i++) {
      const src = withFocus.length >= 3 && r() < 0.7 ? withFocus : all;
      let w = pick(r, src);
      if (w === last) w = pick(r, src);
      out.push(w); last = w;
    }
    return out;
  }

  const SIZES = { short: 3, medium: 6, long: 10 };

  function generate(lesson, opts) {
    const r = rng(opts.seed || Date.now());
    const width = opts.width || 52;
    const lines = SIZES[opts.length] || 6;
    const target = lines * width;
    const def = lesson.def;
    const allowed = lesson.allowed;
    const letters = [...allowed].filter(c => c !== ' ' && LOWER.includes(c));
    const tokCount = Math.round(target / 5.5);
    let tokens = [];

    switch (def.type || 'keys') {
      case 'keys': {
        const focus = lesson.add;
        const f = [...focus];
        const intro = [];
        for (const c of f) intro.push(c + c + c);
        for (let i = 0; i < 3; i++) for (const c of f) intro.push(c + c + c);
        if (f.length > 1) for (let i = 0; i < 4; i++) intro.push(pick(r, f) + pick(r, f) + pick(r, f));
        const pool = letters.length > f.length ? letters : f;
        const drill = drillTokens(r, f, pool, Math.round(tokCount * 0.35));
        const words = wordTokens(r, allowed, focus, Math.round(tokCount * 0.45)) || drillTokens(r, f, pool, Math.round(tokCount * 0.45));
        tokens = [...intro, ...drill, ...words];
        break;
      }
      case 'review': {
        const focus = swapZY(def.from);
        const drill = drillTokens(r, [...focus], letters, Math.round(tokCount * 0.4));
        const words = wordTokens(r, allowed, focus, Math.round(tokCount * 0.6)) || drillTokens(r, [...focus], letters, Math.round(tokCount * 0.6));
        tokens = [...drill, ...words];
        break;
      }
      case 'words': {
        tokens = wordTokens(r, allowed, def.focus || '', tokCount) || drillTokens(r, letters, letters, tokCount);
        break;
      }
      case 'names': {
        const names = DATA.NAMES.filter(w => fits(w, allowed));
        const plain = DATA.WORDS.filter(w => fits(w, allowed));
        for (let i = 0; i < tokCount; i++) tokens.push(r() < 0.6 ? pick(r, names) : pick(r, plain));
        break;
      }
      case 'caps': {
        const upper = [...allowed].filter(c => c !== c.toLowerCase());
        const newUpper = def.caps === 'dia' ? upper.filter(c => DIA.includes(c.toLowerCase())) : upper.filter(c => handOf(c.toLowerCase()) === def.caps);
        const intro = shuffle(r, newUpper).slice(0, 10).map(c => c + c.toLowerCase() + c.toLowerCase());
        const words = DATA.WORDS.filter(w => fits(w, allowed) && fits(cap(w), allowed) && newUpper.includes(cap(w)[0]));
        const plain = DATA.WORDS.filter(w => fits(w, allowed));
        const out = [];
        for (let i = 0; i < tokCount - intro.length; i++) {
          out.push(words.length && r() < 0.6 ? cap(pick(r, words)) : pick(r, plain));
        }
        tokens = [...intro, ...out];
        break;
      }
      case 'sentences': {
        let src = DATA.SENTENCES.concat(DATA.PROVERBS).map(s => {
          if (def.strip) s = strip(s);
          if (def.lower) s = s.toLowerCase().replace(/[.!?]$/, '.');
          return s;
        }).filter(s => fits(s, allowed));
        src = shuffle(r, Array.from(new Set(src)));
        let len = 0;
        for (const s of src) { if (len > target) break; tokens.push(...s.split(' ')); len += s.length + 1; }
        break;
      }
      case 'numbers': {
        const digits = [...lesson.add];
        const known = [...allowed].filter(c => /\d/.test(c));
        for (const d of digits) tokens.push(d + d + d);
        const drill = [];
        for (let i = 0; i < tokCount * 0.5; i++) {
          let s = '';
          const len = 1 + Math.floor(r() * 4);
          for (let j = 0; j < len; j++) s += r() < 0.6 ? pick(r, digits) : pick(r, known);
          drill.push(s);
        }
        const words = wordTokens(r, new Set([...allowed].filter(c => !/\d/.test(c))), '', Math.round(tokCount * 0.4));
        for (let i = 0; i < drill.length; i++) { tokens.push(drill[i]); if (words && i % 2) tokens.push(words[i % words.length]); }
        break;
      }
      case 'numtext': {
        const n = (a, b) => String(a + Math.floor(r() * (b - a + 1)));
        const fill = t => t.replace(/\{(\w+)\}/g, (_, k) => ({
          d: n(1, 28), m: n(1, 12), y: n(1950, 2030), h: n(5, 23), mm: n(10, 59), s: n(2, 9), p: n(59, 499),
          t: n(12, 35), k: n(3, 120), n: n(100, 9999), tel: n(600, 799) + ' ' + n(100, 999) + ' ' + n(100, 999), psc: n(100, 799) + ' ' + n(10, 99),
        })[k]);
        let len = 0, tries = 0;
        while (len < target && tries++ < 2000) {
          const s = fill(pick(r, DATA.NUM_TEMPLATES)).replace(/ /g, ' ');
          if (!fits(s, allowed)) continue;
          tokens.push(...s.split(' ')); len += s.length + 1;
        }
        break;
      }
      case 'symbols': {
        const syms = [...lesson.add];
        const plain = DATA.WORDS.filter(w => fits(w, allowed));
        const num = () => String(1 + Math.floor(r() * 99));
        const make = {
          '?': () => pick(r, plain) + '?', ':': () => pick(r, plain) + ':', '_': () => pick(r, plain) + '_' + pick(r, plain),
          '!': () => pick(r, plain) + '!', '"': () => '"' + pick(r, plain) + '"', "'": () => "'" + pick(r, plain) + "'",
          '(': () => '(' + pick(r, plain) + ')', ')': () => '(' + num() + ')', '/': () => pick(r, plain) + '/' + pick(r, plain), '%': () => num() + '%',
          '+': () => num() + '+' + num(), '=': () => num() + '=' + num(), ';': () => pick(r, plain) + ';',
          '@': () => pick(r, plain) + '@' + pick(r, plain) + '.cz', '#': () => '#' + pick(r, plain), '&': () => pick(r, plain) + '&' + pick(r, plain),
          '$': () => num() + '$', '*': () => num() + '*' + num(), '[': () => '[' + pick(r, plain) + ']', ']': () => '[' + num() + ']',
          '{': () => '{' + pick(r, plain) + '}', '}': () => '{' + num() + '}', '<': () => '<' + pick(r, plain) + '>', '>': () => num() + '>' + num(),
          '€': () => num() + '€', '\\': () => pick(r, plain) + '\\' + pick(r, plain), '|': () => pick(r, plain) + '|' + pick(r, plain),
        };
        for (const s of syms) tokens.push(s + s + s);
        for (let i = 0; i < tokCount; i++) tokens.push(r() < 0.65 ? make[pick(r, syms)]() : pick(r, plain));
        break;
      }
      case 'altgrtext': {
        const src = shuffle(r, DATA.ALTGR_LINES.filter(s => fits(s, allowed)));
        let len = 0;
        for (const s of src) { if (len > target) break; tokens.push(...s.split(' ')); len += s.length + 1; }
        break;
      }
      case 'short': {
        const short = DATA.WORDS.concat(DATA.COMMON).filter(w => w.length <= 4);
        for (let i = 0; i < tokCount * 1.3; i++) tokens.push(pick(r, short));
        break;
      }
      case 'syllables': {
        for (let i = 0; i < tokCount * 0.8; i++) {
          const syl = pick(r, DATA.SYLLABLES);
          const ws = DATA.WORDS.filter(w => w.includes(syl));
          tokens.push(syl + syl);
          if (ws.length) tokens.push(pick(r, ws));
        }
        break;
      }
      case 'symtext': {
        const src = shuffle(r, DATA.SENTENCES.filter(s => /[?!:;()"%/]/.test(s) && fits(s, allowed)));
        const rest = shuffle(r, DATA.SENTENCES.filter(s => fits(s, allowed)));
        let len = 0;
        for (const s of src.concat(rest)) { if (len > target) break; tokens.push(...s.split(' ')); len += s.length + 1; }
        break;
      }
      case 'common': {
        for (let i = 0; i < tokCount; i++) tokens.push(pick(r, DATA.COMMON));
        break;
      }
      case 'long': {
        const long = DATA.WORDS.filter(w => w.length >= 8);
        for (let i = 0; i < Math.round(tokCount * 0.6); i++) tokens.push(pick(r, long));
        break;
      }
      case 'proverbs': {
        let len = 0;
        for (const s of shuffle(r, DATA.PROVERBS)) { if (len > target) break; tokens.push(...s.split(' ')); len += s.length + 1; }
        break;
      }
      case 'twisters': {
        const tw = DATA.SENTENCES.filter(s => /Strč|stříka|Žluťoučký|Šel pes|liška/.test(s));
        let len = 0;
        while (len < target) { const s = pick(r, tw); tokens.push(...s.split(' ')); len += s.length + 1; }
        break;
      }
      case 'text': {
        return { lines: wrapText(DATA.TEXTS[def.text].text, width) };
      }
      case 'exam': {
        const two = shuffle(r, DATA.TEXTS).slice(0, 2).map(t => t.text).join(' ');
        return { lines: wrapText(two, width) };
      }
    }
    let out = wrap(tokens, width);
    if (!['sentences', 'symtext', 'altgrtext', 'proverbs', 'twisters', 'numtext'].includes(def.type)) out = out.slice(0, lines);
    return { lines: out.length ? out : ['fff jjj fff jjj'] };
  }

  // Cvičení na nejčastější chyby.
  function weak(chars, opts) {
    const r = rng(opts.seed || Date.now());
    const width = opts.width || 52;
    const lines = SIZES[opts.length] || 6;
    const focusLower = Array.from(new Set(chars.map(c => c.toLowerCase()).filter(c => LOWER.includes(c))));
    const tokens = [];
    for (const c of chars) tokens.push(c + c + c);
    const allowed = new Set(LOWER + ' ');
    const words = DATA.WORDS.filter(w => focusLower.some(c => w.includes(c)));
    const count = Math.round(lines * width / 5.5);
    for (let i = 0; i < count; i++) {
      if (words.length && r() < 0.6) tokens.push(pick(r, words));
      else tokens.push(drillTokens(r, chars, [...allowed].filter(c => c !== ' '), 1)[0]);
    }
    return { lines: wrap(tokens, width).slice(0, lines) };
  }

  // Normalizace vlastního textu na znaky, které jde napsat.
  function normalizeCustom(text, width) {
    const t = text
      .replace(/[„“”«»]/g, '"').replace(/[‚‘’`]/g, "'").replace(/[–—]/g, '-').replace(/…/g, '...')
      .replace(/[ \t]/g, ' ').replace(/\r/g, '');
    let skipped = 0;
    const clean = [...t].filter(c => { if (c === '\n' || Layout.canType(c)) return true; skipped++; return false; }).join('');
    const lines = [];
    for (const para of clean.split(/\n+/)) lines.push(...wrapText(para, width));
    return { lines, skipped };
  }

  return { list, generate, weak, normalizeCustom, LOWER, OLD_ORDER };
})();
