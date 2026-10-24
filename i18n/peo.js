/* Persian (fa) -> Old Persian cuneiform (U+103A0-103DF), deterministic transliteration.
   Source of truth: /workspace/company-site-edited/scripts/peo-translit.js
   Deployed copy: public_html/i18n/peo.js (run: node build-peo.mjs). */
(function (G) {
  var S = function (c) { return String.fromCodePoint(c); };
  var A = S(0x103A0), I = S(0x103A1), U = S(0x103A2), DIV = S(0x103D0);
  // consonant -> [a-sign, i-sign or null, u-sign or null]
  var C = {};
  function c(chars, a, i, u) { chars.split('').forEach(function (ch) { C[ch] = [S(a), i ? S(i) : null, u ? S(u) : null]; }); }
  c('ب', 0x103B2); c('پ', 0x103B1); c('تطة', 0x103AB, 0, 0x103AC); c('ث', 0x103B0);
  c('جژ', 0x103A9, 0x103AA); c('چ', 0x103A8); c('حه', 0x103C3); c('خ', 0x103A7);
  c('د', 0x103AD, 0x103AE, 0x103AF); c('ر', 0x103BC, 0, 0x103BD); c('زذضظ', 0x103C0);
  c('سص', 0x103BF); c('ش', 0x103C1); c('غگ', 0x103A5, 0, 0x103A6); c('ف', 0x103B3);
  c('قک', 0x103A3, 0, 0x103A4); c('ل', 0x103BE); c('م', 0x103B6, 0x103B7, 0x103B8);
  c('ن', 0x103B4, 0, 0x103B5); c('و', 0x103BA, 0x103BB); c('ی', 0x103B9);
  // genuine Old Persian words (logograms or attested spellings)
  var W = { 'شاه': S(0x103CB), 'پادشاه': S(0x103CB), 'شهریار': S(0x103CB), 'کشور': S(0x103CC), 'سرزمین': S(0x103CC),
    'کشورها': S(0x103CD), 'زمین': S(0x103CF), 'خدا': S(0x103CE), 'اهورامزدا': S(0x103C8),
    'پارس': '𐎱𐎠𐎼𐎿', 'فارسی': '𐎱𐎠𐎼𐎿', 'خانه': '𐎻𐎰', 'بزرگ': '𐎺𐏀𐎼𐎣', 'نام': '𐎴𐎠𐎶', 'روز': '𐎼𐎢𐎨',
    'ماه': '𐎶𐎠𐏃', 'سال': '𐎰𐎼𐎭', 'مرد': '𐎶𐎼𐎫𐎡𐎹', 'فرمان': '𐎳𐎼𐎶𐎠𐎴𐎠', 'دوست': '𐎭𐎢𐏁𐎫', 'نیک': '𐎴𐎡𐎲',
    'خوب': '𐎴𐎡𐎲', 'سپاه': '𐎣𐎠𐎼', 'دروغ': '𐎭𐎼𐎢𐎥', 'دست': '𐎭𐎿𐎫', 'پدر': '𐎱𐎡𐎫𐎠', 'کمک': '𐎢𐎱𐎿𐎫𐎠𐎶', 'یاری': '𐎢𐎱𐎿𐎫𐎠𐎶' };
  var VOW = { 'ا': 1, 'آ': 1, 'و': 1, 'ی': 1, 'ع': 1, 'ء': 1, 'أ': 1, 'ئ': 1, 'ؤ': 1, 'إ': 1 };
  function norm(s) { return s.replace(/ي/g, 'ی').replace(/ك/g, 'ک').replace(/[\u064B-\u0652\u0670]/g, '').replace(/ـ/g, ''); }
  function word(w) {
    w = w.replace(/\u200c/g, ''); if (W[w]) return W[w];
    var out = '', n = w.length, i = 0;
    while (i < n) {
      var ch = w[i], nx = w[i + 1], first = i === 0;
      if (ch === 'آ' || ch === 'ا' || ch === 'ع' || ch === 'ء' || ch === 'أ' || ch === 'إ' || ch === 'ئ' || ch === 'ؤ') {
        if (first || ch === 'آ' || ch === 'ع') {
          if (nx === 'ی' && ch !== 'آ') { out += I; i += 2; continue; }
          if (nx === 'و' && ch !== 'آ') { out += U; i += 2; continue; }
        }
        out += A; i++; continue;
      }
      // و / ی as vowels after a consonant
      if ((ch === 'و' || ch === 'ی') && !first && !VOW[w[i - 1]]) { out += ch === 'و' ? U : I; i++; continue; }
      if (ch === 'ه' && i === n - 1 && !first && !VOW[w[i - 1]]) { i++; continue; } // silent final -e
      var k = C[ch];
      if (!k) { out += ch; i++; continue; }
      if (nx === 'ا' || nx === 'آ') { out += k[0] + A; i += 2; continue; }
      if ((nx === 'ی' || nx === 'و') && i + 1 !== n - 1 || (nx === 'ی' || nx === 'و') && i + 1 === n - 1) {
        var v = nx === 'ی' ? 1 : 2, nn = w[i + 2];
        if (!(nn && VOW[nn])) { out += k[v] ? k[v] : k[0] + (v === 1 ? I : U); i += 2; continue; }
      }
      out += k[0]; i++;
    }
    return out;
  }
  var PUN = { '،': ',', '؛': ';', '؟': '?', '«': '"', '»': '"', '٪': '%' };
  function peo(s) {
    s = norm(s).replace(/[۰-۹]/g, function (d) { return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d); }).replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); });
    s = s.replace(/[،؛؟«»٪]/g, function (p) { return PUN[p]; });
    var parts = s.split(/([\u0621-\u063A\u0641-\u064A\u067E\u0686\u0698\u06A9\u06AF\u06CC\u200c]+)/), r = '', prevWord = false;
    for (var j = 0; j < parts.length; j++) {
      var p = parts[j]; if (!p) continue;
      if (j % 2 === 1) { r += word(p); prevWord = true; }
      else { if (prevWord && /^\s+$/.test(p) && parts[j + 1]) r += ' ' + DIV + ' '; else r += p; prevWord = false; }
    }
    return r;
  }
  G.__PEO = peo;
  if (typeof module !== 'undefined') module.exports = peo;
})(typeof window !== 'undefined' ? window : globalThis);
