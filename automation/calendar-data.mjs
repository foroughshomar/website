// Builds /calendar/deadlines.json (used by the panel's reminder cron). Dates follow the calendar page: typical legal deadlines, the official announcement of each year rules.
import fs from 'node:fs'; import path from 'node:path'; import { gregFromFa } from './article-i18n.mjs';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const M = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
const fa = n => String(n).replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[d]);
const last = (y, m) => m <= 6 ? 31 : m <= 11 ? 30 : 29;
const iso = (y, m, d) => gregFromFa(`${d}-${m}-${y}`).toISOString().slice(0, 10);
const nx = (y, m) => m === 12 ? [y + 1, 1] : [y, m + 1];
const out = []; const add = (y, m, d, o) => out.push({ date: iso(y, m, d), date_fa: `${fa(d)} ${M[m - 1]} ${fa(y)}`, ...o });
for (const y of [1405, 1406]) {
  for (let m = 1; m <= 12; m++) { const [ny, nm] = nx(y, m);
    add(ny, nm, last(ny, nm), { id: `payroll-${y}-${m}`, category: 'بیمه و حقوق', title: `لیست بیمه و مالیات حقوق ${M[m - 1]} ${fa(y)}`, action: 'لیست بیمه را در سامانه تأمین اجتماعی و لیست و مالیات حقوق را در درگاه مالیاتی ارسال و پرداخت کنید.' }); }
  const seasons = [['بهار', [y, 4, 15], [y, 5, 15]], ['تابستان', [y, 7, 15], [y, 8, 15]], ['پاییز', [y, 10, 15], [y, 11, 15]], ['زمستان', [y + 1, 1, 15], [y + 1, 2, 15]]];
  seasons.forEach(([s, v, t], i) => {
    add(...v, { id: `vat-${y}-${i + 1}`, category: 'ارزش افزوده', title: `اظهارنامه ارزش افزوده ${s} ${fa(y)}`, action: 'خرید و فروش فصل را با صورتحساب‌های سامانه مؤدیان تطبیق دهید و اظهارنامه را ارسال کنید.' });
    add(...t, { id: `s169-${y}-${i + 1}`, category: 'معاملات فصلی', title: `گزارش معاملات فصلی (ماده ۱۶۹) ${s} ${fa(y)} — حدودی`, action: 'مهلت دقیق این دوره را در اطلاعیه سازمان امور مالیاتی ببینید و گزارش را با دفاتر تطبیق دهید.' }); });
  add(y, 3, 31, { id: `ind-${y}`, category: 'اظهارنامه عملکرد', title: `اظهارنامه عملکرد اشخاص حقیقی (صاحبان مشاغل) سال ${fa(y - 1)}`, action: 'درآمد و هزینه سال را جمع‌بندی کنید؛ مشمولان تبصره ۱۰۰ هم در همین بازه اقدام کنند.' });
  add(y, 4, 31, { id: `corp-${y}`, category: 'اظهارنامه عملکرد', title: `اظهارنامه عملکرد اشخاص حقوقی (سال مالی منتهی به اسفند ${fa(y - 1)})`, action: 'صورت‌های مالی و دفاتر را ببندید و اظهارنامه و صورت‌ها را ارسال کنید.' });
}
out.sort((a, b) => a.date.localeCompare(b.date));
const data = { note: 'تاریخ‌ها بر اساس مهلت‌های معمول قانونی است؛ مهلت دقیق هر دوره را اطلاعیه رسمی همان سال تعیین می‌کند.', updated: new Date().toISOString().slice(0, 10), deadlines: out };
fs.writeFileSync(path.join(ROOT, 'calendar/deadlines.json'), JSON.stringify(data, null, 1));
console.log('deadlines', out.length, out[0].date, out.at(-1).date);
