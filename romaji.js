// Romaji → kana for the Practice chat. lowercase → hiragana, CAPITALS → katakana.
const romajiToKana = (() => {
  const BASE = {
    a: 'あ', i: 'い', u: 'う', e: 'え', o: 'お',
    ka: 'か', ki: 'き', ku: 'く', ke: 'け', ko: 'こ',
    ga: 'が', gi: 'ぎ', gu: 'ぐ', ge: 'げ', go: 'ご',
    sa: 'さ', shi: 'し', si: 'し', su: 'す', se: 'せ', so: 'そ',
    za: 'ざ', ji: 'じ', zi: 'じ', zu: 'ず', ze: 'ぜ', zo: 'ぞ',
    ta: 'た', chi: 'ち', ti: 'ち', tsu: 'つ', tu: 'つ', te: 'て', to: 'と',
    da: 'だ', di: 'ぢ', du: 'づ', de: 'で', do: 'ど',
    na: 'な', ni: 'に', nu: 'ぬ', ne: 'ね', no: 'の',
    ha: 'は', hi: 'ひ', fu: 'ふ', hu: 'ふ', he: 'へ', ho: 'ほ',
    ba: 'ば', bi: 'び', bu: 'ぶ', be: 'べ', bo: 'ぼ',
    pa: 'ぱ', pi: 'ぴ', pu: 'ぷ', pe: 'ぺ', po: 'ぽ',
    ma: 'ま', mi: 'み', mu: 'む', me: 'め', mo: 'も',
    ya: 'や', yu: 'ゆ', yo: 'よ',
    ra: 'ら', ri: 'り', ru: 'る', re: 'れ', ro: 'ろ',
    wa: 'わ', wo: 'を',
    fa: 'ふぁ', fi: 'ふぃ', fe: 'ふぇ', fo: 'ふぉ',
    she: 'しぇ', che: 'ちぇ', je: 'じぇ', vu: 'ゔ',
    xa: 'ぁ', xi: 'ぃ', xu: 'ぅ', xe: 'ぇ', xo: 'ぉ',
    xya: 'ゃ', xyu: 'ゅ', xyo: 'ょ', xtsu: 'っ', xtu: 'っ',
  };
  const Y_ROWS = {
    ky: 'き', gy: 'ぎ', ny: 'に', hy: 'ひ', by: 'び', py: 'ぴ', my: 'み', ry: 'り',
    sh: 'し', sy: 'し', ch: 'ち', ty: 'ち', cy: 'ち', j: 'じ', jy: 'じ', zy: 'じ', dy: 'ぢ',
  };
  const SMALL = { a: 'ゃ', u: 'ゅ', o: 'ょ' };
  const TABLE = { ...BASE };
  Object.entries(Y_ROWS).forEach(([start, kana]) => {
    Object.entries(SMALL).forEach(([vowel, small]) => { TABLE[start + vowel] = kana + small; });
  });
  const PUNCT = { ',': '、', '.': '。', '?': '？', '!': '！', '-': 'ー', '~': '〜' };
  const VOWEL_OR_Y = 'aiueoy';

  const toKata = s => s.replace(/[ぁ-ゖ]/g, c => String.fromCharCode(c.charCodeAt(0) + 0x60));
  const isUpper = s => /[A-Z]/.test(s) && s === s.toUpperCase();

  return function romajiToKana(input) {
    let out = '';
    let i = 0;
    while (i < input.length) {
      const ch = input[i];
      const lower = ch.toLowerCase();
      const next = (input[i + 1] || '').toLowerCase();

      if (ch === ' ') { i++; continue; }
      if (PUNCT[ch]) { out += PUNCT[ch]; i++; continue; }
      if (ch === "'") { i++; continue; }
      if (!/[a-z]/i.test(ch)) { out += ch; i++; continue; }

      const upper = isUpper(ch);

      // ん: n before a consonant, apostrophe, space or the end. "nn" at a word end also gives ん.
      if (lower === 'n' && !VOWEL_OR_Y.includes(next || '_')) {
        const after = (input[i + 2] || '').toLowerCase();
        const consumeBoth = next === "'" || (next === 'n' && !VOWEL_OR_Y.includes(after || '_'));
        out += upper ? 'ン' : 'ん';
        i += consumeBoth ? 2 : 1;
        continue;
      }

      // Doubled consonant → small っ (kippu, matcha via "tch").
      const doubled = lower === next && !'aiueon'.includes(lower);
      const tch = lower === 't' && next === 'c' && (input[i + 2] || '').toLowerCase() === 'h';
      if (doubled || tch) {
        out += upper ? 'ッ' : 'っ';
        i++;
        continue;
      }

      let matched = false;
      for (const len of [4, 3, 2, 1]) {
        const chunk = input.slice(i, i + len);
        const kana = TABLE[chunk.toLowerCase()];
        if (kana) {
          out += isUpper(chunk) ? toKata(kana) : kana;
          i += len;
          matched = true;
          break;
        }
      }
      if (!matched) { out += ch; i++; }
    }
    return out;
  };
})();
