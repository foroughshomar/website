#!/usr/bin/env python3
# سازنده‌ی صفحه‌های ایستای /shop/ ، /refund/ و /complaints/ از روی article-template.html
# اجرا: python3 automation/shop-pages.py  (از ریشه‌ی مخزن)
import re, os
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
T = open(os.path.join(ROOT, 'automation/article-template.html'), encoding='utf-8').read()
UPDATED = '۵ آبان ۱۴۰۵'
MAIL = 'info@foroughshomar.ir'
NOTE = '<p class="fs-langnote muted" dir="auto">این صفحه فعلاً فقط به فارسی است.</p>'

def fa(n):
    s = f'{n:,}'.replace(',', '٬')
    return s.translate(str.maketrans('0123456789', '۰۱۲۳۴۵۶۷۸۹'))

def page(url, seotitle, title, desc, body, og=None):
    s = T
    # active state of «مقالات» must not show on these pages
    s = s.replace(' text-gold" href="/articles/" data-status="active" aria-current="page"', '" href="/articles/"')
    s = s.replace(' active" href="/articles/" data-status="active" aria-current="page"', '" href="/articles/"')
    for m in ('articles-DkMq6UUC', 'articles._slug-DJ5MMQNh'):
        s = re.sub(r'<link rel="modulepreload" href="/assets/' + re.escape(m) + r'\.js"/>', '', s)
    s = s.replace('<link rel="preload" as="image" href="{{IMG}}"/>', '')
    s = s.replace('<meta property="og:title" content="فروغ‌شمار سیمرغ">', '<meta property="og:title" content="' + (og or title) + '">')
    s = s.replace('<title>{{SEOTITLE}}</title>', '<title>{{SEOTITLE}}</title><link rel="canonical" href="https://foroughshomar.ir{{URL}}"/><link rel="stylesheet" href="/shop.css"/><script src="/shop.js" defer></script>')
    a = s.index('<article class="mx-auto max-w-3xl px-4 py-16 md:px-6">'); b = s.index('</article>', a)
    s = s[:a] + '<article class="fs-shop mx-auto max-w-3xl px-4 py-14 md:px-6" dir="rtl" lang="fa">' + NOTE + body + '</article>' + s[b + len('</article>'):]
    for k, v in (('{{SEOTITLE}}', seotitle), ('{{TITLE}}', title), ('{{DESC}}', desc), ('{{URL}}', url)):
        s = s.replace(k, v)
    s = s.replace(f'href="{url}">', f'href="{url}" aria-current="page">')
    assert '{{' not in s, re.findall(r'\{\{\w+\}\}', s)
    d = os.path.join(ROOT, url.strip('/'))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(s)
    print('wrote', url)

PK = [('p10', 10, 209000, ''), ('p30', 30, 539000, ''), ('p100', 100, 1529000, 'به‌صرفه‌ترین')]
cards = ''
for k, f, p, badge in PK:
    vat = round(p * 0.10)
    cards += (f'<label class="fs-pkg"><input type="radio" name="package" value="{k}"{" checked" if k == "p30" else ""}/>'
              + (f'<span class="b">{badge}</span>' if badge else '')
              + f'<span class="t">بسته‌ی {fa(f)} پر</span><span class="f">{fa(f)} پر</span>'
              + f'<span class="p">{fa(p)} تومان</span><span class="u">هر پر {fa(round(p / f))} تومان · با مالیات {fa(p + vat)} تومان</span></label>')

TRACK = '''<section aria-labelledby="trk-h" class="fs-card"><h2 id="trk-h" style="margin-top:0">پیگیری سفارش، شکایت و موجودی پر</h2>
<p class="muted">شماره پیگیری (P… برای سفارش، S… برای شکایت) و همان ایمیلی را که هنگام ثبت نوشتید وارد کنید.</p>
<form id="fs-track-form" class="fs-form" novalidate>
<div class="fs-field"><label class="fl" for="t-trk">شماره پیگیری</label><input id="t-trk" name="tracking" type="text" inputmode="latin" autocomplete="off" dir="ltr" placeholder="P12345678"/></div>
<div class="fs-field"><label class="fl" for="t-mail">ایمیل</label><input id="t-mail" name="email" type="email" autocomplete="email" dir="ltr" placeholder="name@gmail.com"/></div>
<div><button type="submit" class="fs-btn">پیگیری</button></div></form><div id="fs-track-out" aria-live="polite"></div></section>'''

SELLER = f'''<h2>فروشنده و ارائه‌دهنده‌ی خدمت</h2><ul class="list-disc space-y-1 pr-6">
<li>نام: فروغ‌شمار سیمرغ — خدمات حسابداری، مالیاتی و بیمه</li><li>نشانی اینترنتی: <a href="https://foroughshomar.ir/">foroughshomar.ir</a></li>
<li>ایمیل: <a href="mailto:{MAIL}">{MAIL}</a></li><li>دفاتر: تهران (شهر زیبا)، اردبیل (پیرعبدالملک)، مشهد (وکیل‌آباد) — جلسه‌ی حضوری با هماهنگی قبلی؛ <a href="/contact/">صفحه‌ی تماس</a></li></ul>'''

shop_body = f'''<div class="fs-note" role="note"><p><strong>پرداخت آنلاین به‌زودی فعال می‌شود.</strong> درگاه پرداخت پس از دریافت نماد اعتماد الکترونیکی (اینماد) راه می‌افتد. تا آن زمان می‌توانید سفارش خود را ثبت کنید و شماره پیگیری بگیرید؛ <strong>هیچ مبلغی گرفته نمی‌شود.</strong> فعلاً پرسیدن سؤال در «<a href="/faq/#ask">از ما بپرسید</a>» رایگان است.</p></div>
<h2>«پر سیمرغ» چیست؟</h2>
<p>پر سیمرغ اعتبار پرسش در بخش «از ما بپرسید» است. سیمرغ، دستیار هوشمند فروغ‌شمار، به پرسش‌های مالیاتی، بیمه‌ای و حسابداری شما با تکیه بر منابع پاسخ می‌دهد. <strong>هر سؤالی که پاسخ بگیرد، ۱ پر مصرف می‌کند.</strong> اگر به‌خاطر خطای سامانه پاسخی ساخته نشود، پری کم نمی‌شود. پرها تاریخ انقضا ندارند و به ایمیل شما تعلق می‌گیرند.</p>
<p class="muted">پاسخ سیمرغ راهنمایی عمومی است و جای مشاوره‌ی رسمی پرونده‌ی شما را نمی‌گیرد. برای بررسی پرونده، <a href="/contact/">مشاوره رزرو کنید</a>.</p>
<form id="fs-shop-form" class="fs-form" novalidate>
<fieldset class="fs-field"><legend class="fl" style="font-size:1.35rem;font-weight:600;margin:1.2rem 0 .3rem">۱. بسته را انتخاب کنید</legend><p class="muted">قیمت‌ها بدون مالیات بر ارزش افزوده است؛ ۱۰٪ مالیات در پیش‌فاکتور اضافه می‌شود.</p><div class="fs-pkgs">{cards}</div></fieldset>
<h2 style="margin-top:.6rem">۲. پیش‌فاکتور</h2><div id="fs-inv" aria-live="polite"><noscript><p>برای دیدن پیش‌فاکتور، جاوااسکریپت مرورگر را روشن کنید.</p></noscript></div>
<p class="muted">فروشنده: فروغ‌شمار سیمرغ — {MAIL}. تحویل خدمت: بلافاصله پس از پرداخت، پرها به ایمیل شما افزوده می‌شود.</p>
<h2 style="margin-top:.6rem">۳. مشخصات خریدار</h2>
<div class="fs-field"><label class="fl" for="s-name">نام و نام خانوادگی</label><input id="s-name" name="full_name" type="text" autocomplete="name" maxlength="80"/></div>
<div class="fs-field"><label class="fl" for="s-mail">ایمیل</label><input id="s-mail" name="email" type="email" autocomplete="email" dir="ltr" maxlength="120" placeholder="name@gmail.com" aria-describedby="s-mail-h"/><p id="s-mail-h" class="muted">پرها به این ایمیل تعلق می‌گیرد و پیش‌فاکتور به آن فرستاده می‌شود.</p></div>
<div class="fs-hp" aria-hidden="true"><label for="s-web">وب‌سایت</label><input id="s-web" name="website" type="text" tabindex="-1" autocomplete="off"/></div>
<div class="fs-field"><label class="fs-check"><input type="checkbox" name="consent_terms"/><span><a href="/refund/" target="_blank">قوانین خرید و بازگشت وجه</a> را خوانده‌ام و می‌پذیرم.</span></label></div>
<div class="fs-field"><label class="fs-check"><input type="checkbox" name="consent_start"/><span>می‌دانم با ارسال اولین سؤال، خدمت شروع می‌شود و سؤال جواب‌داده‌شده قابل برگشت نیست.</span></label></div>
<div><button type="submit" class="fs-btn">ثبت سفارش</button></div>
<p class="muted">با ثبت سفارش، فقط پیش‌فاکتور و شماره پیگیری صادر می‌شود و وضعیت آن «در انتظار درگاه پرداخت» است.</p>
</form><div id="fs-shop-done" aria-live="polite"></div>
{TRACK}
<p>پرسش یا مشکلی دارید؟ <a href="/complaints/">ثبت شکایت یا درخواست</a> · <a href="/refund/">قوانین خرید و بازگشت وجه</a></p>'''

page('/shop/', 'خرید پر سیمرغ | فروغ‌شمار سیمرغ', 'خرید پر سیمرغ',
     'بسته‌های پر سیمرغ برای پرسش از دستیار هوشمند فروغ‌شمار؛ هر سؤال پاسخ‌داده‌شده ۱ پر. پیش‌فاکتور با ۱۰٪ مالیات بر ارزش افزوده.', shop_body)

refund_body = f'''<p class="muted">آخرین به‌روزرسانی: {UPDATED}</p>
<p>این قوانین برای خرید «پر سیمرغ» (اعتبار پرسش از دستیار هوشمند فروغ‌شمار در بخش «از ما بپرسید») است. پیش از خرید آن را بخوانید؛ در صفحه‌ی <a href="/shop/">خرید پر سیمرغ</a> باید پذیرش آن را تأیید کنید.</p>
<h2>خدمت چیست و چگونه تحویل می‌شود؟</h2>
<ul class="list-disc space-y-1 pr-6"><li>هر سؤالی که سیمرغ به آن پاسخ دهد، ۱ پر مصرف می‌کند.</li>
<li>بسته‌ها: ۱۰ پر {fa(209000)} تومان، ۳۰ پر {fa(539000)} تومان، ۱۰۰ پر {fa(1529000)} تومان. این قیمت‌ها بدون مالیات است و ۱۰٪ مالیات بر ارزش افزوده در پیش‌فاکتور اضافه می‌شود.</li>
<li>پس از پرداخت، پرها بلافاصله به ایمیل خریدار افزوده می‌شود. پرها تاریخ انقضا ندارند.</li>
<li>پاسخ سیمرغ راهنمایی عمومی و مبتنی بر منابع است و جای مشاوره‌ی رسمی پرونده را نمی‌گیرد.</li>
<li><strong>پرداخت آنلاین هنوز فعال نیست</strong>؛ اکنون فقط سفارش و پیش‌فاکتور ثبت می‌شود و مبلغی گرفته نمی‌شود.</li></ul>
<h2>قوانین بازگشت وجه</h2>
<ol class="fs-rules">
<li><strong>انصراف در ۷ روز کاری:</strong> تا ۷ روز کاری پس از خرید، پرهای مصرف‌نشده را بدون نیاز به ذکر دلیل پس می‌گیریم و مبلغ آن را کامل برمی‌گردانیم.</li>
<li><strong>پس از ۷ روز:</strong> پرهای مانده از بین نمی‌رود و تاریخ انقضا ندارد. اگر پس از این مدت بازگشت پول بخواهید، درخواست شما بررسی می‌شود.</li>
<li><strong>شروع خدمت با رضایت شما:</strong> هنگام خرید تأیید می‌کنید که «می‌دانم با ارسال اولین سؤال، خدمت شروع می‌شود و سؤال جواب‌داده‌شده قابل برگشت نیست». یعنی پر سؤال‌هایی که پاسخ گرفته‌اند برنمی‌گردد، ولی پرهای مصرف‌نشده طبق بند ۱ و ۲ قابل بازگشت است.</li>
<li><strong>خطای سامانه بدون پاسخ:</strong> اگر به‌خاطر خطای سامانه پاسخی ساخته نشود، هیچ پری کم نمی‌شود.</li>
<li><strong>پاسخ نامربوط به‌خاطر خطای سامانه:</strong> اگر پاسخ به‌خاطر خطای فنی ربطی به سؤال نداشت، تا ۷۲ ساعت شکایت ثبت کنید تا پر آن سؤال برگردد.</li>
<li><strong>نارضایتی از محتوای پاسخ:</strong> نارضایتی از محتوا دلیل بازگشت پول نیست، اما یک سؤال تکمیلی رایگان درباره‌ی همان موضوع به شما می‌دهیم.</li>
<li><strong>پرداخت دوباره یا ناموفق:</strong> اگر مبلغ دو بار کسر شد، یا پول کسر شد و پرها افزوده نشد، کل مبلغ اضافه برمی‌گردد.</li>
<li><strong>روش و زمان بازگشت:</strong> مبلغ ظرف ۳ تا ۷ روز کاری به کارت یا شماره شبای به نام خود خریدار برمی‌گردد؛ سهم مالیات بر ارزش افزوده‌ی همان مبلغ هم برگردانده می‌شود.</li>
<li><strong>راه درخواست:</strong> درخواست را از <a href="/complaints/">فرم ثبت شکایت</a> یا با ایمیل به <a href="mailto:{MAIL}">{MAIL}</a> همراه با شماره سفارش (P…) بفرستید. حداکثر تا ۴۸ ساعت پاسخ می‌دهیم.</li></ol>
<h2>مبلغ بازگشتی چگونه حساب می‌شود؟</h2>
<p>مبلغ بازگشتی = تعداد پرهای مصرف‌نشده × قیمت هر پر در همان بسته، به‌اضافه‌ی ۱۰٪ مالیات همان مبلغ. نمونه: از بسته‌ی ۳۰ پری ({fa(539000)} تومان، هر پر {fa(17967)} تومان) ۱۰ پر مصرف شده و ۲۰ پر مانده است؛ مبلغ بازگشتی حدود {fa(359333)} تومان به‌اضافه‌ی {fa(35933)} تومان مالیات است.</p>
<h2>مبنای قانونی</h2>
<ul class="list-disc space-y-1 pr-6"><li>ماده‌ی ۳۷ قانون تجارت الکترونیکی: حق انصراف مصرف‌کننده تا ۷ روز کاری.</li>
<li>ماده‌ی ۳۸ همان قانون: در خدمات، این مهلت از روز انعقاد قرارداد و پس از ارائه‌ی اطلاعات لازم شروع می‌شود و در صورت انصراف، مبلغ باید بی‌درنگ برگردانده شود.</li>
<li>بند «الف» ماده‌ی ۱ آیین‌نامه‌ی اجرایی مواد ۳۸ و ۴۲: حق انصراف برای خدمتی که با رضایت مصرف‌کننده پیش از پایان ۷ روز شروع شده، وجود ندارد. به همین دلیل پر سؤال‌های پاسخ‌داده‌شده برنمی‌گردد، اما پرهای مصرف‌نشده برمی‌گردد.</li></ul>
{SELLER}
<p><a href="/shop/">خرید پر سیمرغ</a> · <a href="/complaints/">ثبت شکایت</a> · <a href="/terms/">شرایط استفاده</a> · <a href="/privacy/">حریم خصوصی</a></p>'''

page('/refund/', 'قوانین خرید و بازگشت وجه | فروغ‌شمار سیمرغ', 'قوانین خرید و بازگشت وجه',
     'شرایط خرید «پر سیمرغ»، انصراف ۷ روزه، بازگشت پرهای مصرف‌نشده و روش درخواست بازگشت وجه در فروغ‌شمار سیمرغ.', refund_body)

topics = [('purchase', 'خرید و سفارش'), ('refund', 'بازگشت وجه'), ('answer', 'پاسخ سیمرغ (نامربوط یا خطا)'), ('consult', 'مشاوره و خدمات'), ('other', 'سایر')]
opts = '<option value="">انتخاب کنید…</option>' + ''.join(f'<option value="{k}">{v}</option>' for k, v in topics)
complaint_body = f'''<p>اگر از خرید، بازگشت وجه، پاسخ سیمرغ یا خدمات ما شکایت یا درخواستی دارید، این فرم را پر کنید. پس از ثبت، شماره پیگیری (S…) می‌گیرید و <strong>حداکثر تا ۴۸ ساعت</strong> پاسخ می‌دهیم. می‌توانید به <a href="mailto:{MAIL}">{MAIL}</a> هم ایمیل بزنید.</p>
<div class="fs-note" role="note"><p>برای بازگشت پر سؤالی که به‌خاطر خطای سامانه پاسخ نامربوط گرفته، تا ۷۲ ساعت شکایت ثبت کنید. جزئیات در <a href="/refund/">قوانین خرید و بازگشت وجه</a>.</p></div>
<form id="fs-complaint-form" class="fs-form" novalidate>
<div class="fs-field"><label class="fl" for="c-name">نام و نام خانوادگی</label><input id="c-name" name="full_name" type="text" autocomplete="name" maxlength="80"/></div>
<div class="fs-field"><label class="fl" for="c-mail">ایمیل</label><input id="c-mail" name="email" type="email" autocomplete="email" dir="ltr" maxlength="120" placeholder="name@gmail.com"/></div>
<div class="fs-field"><label class="fl" for="c-topic">موضوع</label><select id="c-topic" name="topic">{opts}</select></div>
<div class="fs-field"><label class="fl" for="c-order">شماره سفارش (اختیاری)</label><input id="c-order" name="order_tracking" type="text" dir="ltr" autocomplete="off" placeholder="P12345678" maxlength="12"/></div>
<div class="fs-field"><label class="fl" for="c-msg">شرح شکایت یا درخواست</label><textarea id="c-msg" name="message" maxlength="3000"></textarea><p class="muted">برای بازگشت وجه، شماره سفارش و تعداد پرهای مانده را بنویسید. شماره کارت یا شبا را اینجا ننویسید؛ پس از بررسی، از راه ایمیل از شما می‌گیریم.</p></div>
<div class="fs-hp" aria-hidden="true"><label for="c-web">وب‌سایت</label><input id="c-web" name="website" type="text" tabindex="-1" autocomplete="off"/></div>
<div><button type="submit" class="fs-btn">ثبت شکایت</button></div></form><div id="fs-complaint-done" aria-live="polite"></div>
{TRACK}
<p><a href="/refund/">قوانین خرید و بازگشت وجه</a> · <a href="/shop/">خرید پر سیمرغ</a> · <a href="/contact/">تماس</a></p>'''

page('/complaints/', 'ثبت شکایت و پیگیری | فروغ‌شمار سیمرغ', 'ثبت شکایت',
     'ثبت شکایت یا درخواست بازگشت وجه با شماره پیگیری و پاسخ حداکثر تا ۴۸ ساعت؛ پیگیری سفارش و موجودی پر سیمرغ.', complaint_body)
