// ===== P2.3 Push, pop-up and SMS preview gallery with length check (all 104 catalogue texts) =====
let S = {};
const LONG = { seller_name: "Toshkent Ulgurji Tekstil Savdo", store: "Toshkent Ulgurji Tekstil Savdo", sender_name: "Abdurakhmonova Gulnoza Shavkat", buyer_name: "Abdurakhmonova Gulnoza Shavkat", user_name: "Abdurakhmonova Gulnoza Shavkat", product_name: "Ткань хлопок 100% 150 см плотн", courier_name: "Abdurakhmonov Shavkatjon Akmal",
  reason: "Товар не соответствует описанию: другой цвет и состав ткани", address: "Ташкент, Мирзо-Улугбекский р-н, ул. Буюк Ипак Йули, д. 154", problem: "Получатель не отвечает на звонки, повторная попытка завтра", amount: "999 999 999", order_no: "1234567", message_preview: "Здравствуйте! Подскажите, пожалуйста, есть ли эта ткань в синем цвете и можно ли заказать 300 метров с доставкой", next_step: "Отправьте товар продавцу в течение 3 дней", error: "Операция отклонена банком-эмитентом карты" };
const CUT = { seller_name: 30, store: 30, sender_name: 30, buyer_name: 30, user_name: 30, product_name: 30, courier_name: 30, reason: 60, address: 60, problem: 60, next_step: 60, error: 60, message_preview: 100 };
function vars() { if (S.vals !== "long") return {}; const o = {}; for (const k in LONG) o[k] = LONG[k].length > (CUT[k] || 999) ? LONG[k].slice(0, CUT[k] - 1) + "…" : LONG[k]; return o; }
const isPush = c => /Push/.test(c.pp) && /Mobile/.test(c.ch);
const isWeb = c => /Web/.test(c.ch) && /Push/.test(c.pp);
function ids(f) { return Object.keys(CAT).filter(id => f(id, CAT[id]) && (S.view === "sms" || S.view === "len" || !/^SMS:/.test(CAT[id].en))); }
function reset(over) { S = Object.assign({ view: "ios", filter: () => true, vals: "sample", onlyBad: false, title: "" }, over || {}); render(); }
function langs() { return S.all ? ["ru", "uz", "en"] : [LANG]; }
function ios(id, l) { const m = msg(id, vars(), l); return `<div class="pushb" style="position:relative;top:0;left:0;right:0;margin:0 0 10px;animation:none;cursor:default"><div class="ph"><i></i>${/^(SOR|RET-0[23]|YG-S|CAT|FIN|ACC-0[4-6]|ACC-09)/.test(id) ? "OPTOM BIZNES" : "OPTOM"} · сейчас <span class="mono" style="margin-left:auto;color:#999">${id} ${S.all ? l.toUpperCase() : ""}</span></div><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.title)}</b><span style="display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden">${esc(m.text)}</span></div>`; }
function andr(id, l) { const m = msg(id, vars(), l); return `<div style="background:#fff;border-radius:16px;padding:10px 14px;margin:0 0 8px"><div class="small" style="color:#00a028">● Optom · сейчас <span class="mono" style="float:right;color:#999">${id} ${S.all ? l.toUpperCase() : ""}</span></div><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.title)}</b><span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#444">${esc(m.text)}</span></div>`; }
function web(id, l) { const m = msg(id, vars(), l); const [cls, ic] = grpIcon(id); const b = firstBtn(id); return `<div class="card" style="display:flex;gap:12px;width:360px;padding:14px 16px;box-shadow:0 8px 24px rgba(16,24,40,.12)"><span class="gi ${cls}" style="width:40px;height:40px;border-radius:50%;display:grid;place-items:center;flex:none">${ic.replace("<svg", '<svg width="20" height="20" fill="none" stroke-width="1.7"')}</span><div style="min-width:0;flex:1"><b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(m.title)}</b><div style="color:var(--ink-2);display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">${esc(m.text)}</div>${b ? `<span class="btn sm soft mt8">${esc(b)}</span>` : ""}<div class="mono" style="color:#a0a6ae;margin-top:4px">${id} ${S.all ? l.toUpperCase() : ""}</div></div></div>`; }
const GSM = /^[A-Za-z0-9 @£$¥èéùìòÇØøÅå_\^{}\\\[~\]|€ÆæßÉ!"#¤%&'()*+,\-.\/:;<=>?¡ÄÖÑÜ§¿äöñüà\n]*$/;
function sms(id, l) { const m = msg(id, vars(), l); const txt = m.sms ? m.text : (m.title + ". " + m.text); const cyr = /[А-Яа-яЁё]/.test(txt); const lim = cyr ? (id === "ACC-09" ? 134 : 70) : 160; const gsm = cyr || GSM.test(txt); const ok = txt.length <= lim && gsm; return `<div style="max-width:300px"><div class="mono muted">${id} · ${l.toUpperCase()} · ${txt.length}/${lim} ${cyr ? "(Cyrillic, UCS-2)" : "(GSM-7)"} ${ok ? "<span class='pill g'>ok</span>" : `<span class='pill r'>${gsm ? "too long" : "non-GSM character"}</span>`}${m.sms ? "" : " <span class='pill a'>push text reused, SMS wording not defined</span>"}</div><div style="background:#e9e9eb;border-radius:18px;padding:10px 14px;margin-top:4px;white-space:pre-wrap">${esc(txt)}</div></div>`; }
function lenRows() {
  const rows = [];
  for (const id of ids(S.filter)) for (const l of ["ru", "uz", "en"]) {
    const m = msg(id, vars(), l); if (m.sms) continue;
    const tl = m.title.length, xl = m.text.length, bad = tl > 40 || xl > 130;
    if (S.onlyBad && !bad) continue;
    rows.push(`<tr ${bad ? 'style="background:var(--red-50)"' : ""}><td class="mono">${id}</td><td>${CAT[id].r}</td><td>${l.toUpperCase()}</td><td>${esc(m.title)}</td><td style="text-align:right" class="${tl > 40 ? "err-t" : ""}">${tl}</td><td style="max-width:420px">${esc(m.text)}</td><td style="text-align:right" class="${xl > 130 ? "err-t" : ""}">${xl}</td><td>${bad ? "<span class='pill r'>over</span>" : "<span class='pill g'>ok</span>"}</td></tr>`);
  }
  return rows;
}
function render() {
  const list = ids(S.filter);
  const ctl = `<div class="pctl"><b>Prototype controls</b><span>Values:</span><span class="btn ${S.vals === "sample" ? "pri" : "out"}" data-v="sample">Typical</span><span class="btn ${S.vals === "long" ? "pri" : "out"}" data-v="long">Longest allowed (cut per PRD 4.4)</span><span>Languages:</span><span class="btn ${S.all ? "pri" : "out"}" id="alll">All three</span>${S.view === "len" ? `<label class="chk" style="margin:0"><input type="checkbox" id="bad" ${S.onlyBad ? "checked" : ""}>Only texts over the limit</label>` : ""}<span class="sp" style="flex:1"></span>${S.all ? "" : langBox()}</div>`;
  let body;
  if (S.view === "ios") body = `<div class="phonewrap" style="padding:0"><div class="phone" style="height:auto;min-height:780px"><div class="scr" style="background:linear-gradient(160deg,#2b5876,#4e4376);padding:44px 10px 20px;height:auto"><div style="color:#fff;text-align:center;font-size:56px;font-weight:300;margin:4px 0 12px">09:41</div>${list.map(id => langs().map(l => ios(id, l)).join("")).join("")}</div></div></div>`;
  else if (S.view === "and") body = `<div class="phonewrap" style="padding:0"><div class="phone" style="height:auto;min-height:780px;border-radius:30px"><div class="scr" style="background:#dfe3e8;padding:44px 10px 20px;height:auto;border-radius:22px">${list.map(id => langs().map(l => andr(id, l)).join("")).join("")}</div></div></div>`;
  else if (S.view === "web") body = `<div style="display:flex;flex-wrap:wrap;gap:16px">${list.map(id => langs().map(l => web(id, l)).join("")).join("")}</div>`;
  else if (S.view === "sms") body = `<div style="display:flex;flex-wrap:wrap;gap:20px">${list.map(id => ["ru", "uz", "en"].map(l => sms(id, l)).join("")).join("")}</div>`;
  else { const r = lenRows(); body = `<div class="card" style="padding:0"><table class="t"><tr><th>ID</th><th>Release</th><th>Lang</th><th>Title</th><th>≤40</th><th>Text</th><th>≤130</th><th></th></tr>${r.join("")}</table>${r.length ? "" : `<div class="empty">No text is over the limit with these values.</div>`}</div>`; }
  $("#app").innerHTML = `<div style="padding:16px 24px 40px"><div class="h1" style="font-size:22px">${esc(S.title)} <span class="pill n">${list.length} notifications</span></div>${ctl}${body}</div>`;
  document.querySelectorAll("[data-v]").forEach(e => e.onclick = () => { S.vals = e.dataset.v; render(); });
  const a = $("#alll"); if (a) a.onclick = () => { S.all = !S.all; render(); };
  const b = $("#bad"); if (b) b.onchange = () => { S.onlyBad = b.checked; render(); };
  bindLang(render);
}
const MVP = (id, c) => c.r === "MVP";
const SC = [
  { label: "iPhone lock screen · all MVP push notifications", apply: () => reset({ view: "ios", filter: (i, c) => MVP(i, c) && isPush(c), title: "iPhone · MVP push" },),
    notes: ["Every MVP notification that goes to the apps as push, in the app's language (switch RU / UZ / EN or \"All three\").", "iOS shows the title on one line and up to 4 lines of text on the lock screen.", "\"OPTOM BIZNES\" = seller app, \"OPTOM\" = buyer app (two Firebase projects).", "Use \"Longest allowed\" to see the worst case with names cut to 30 and reasons / addresses to 60 characters (PRD 4.4)."], src: "US-BF-8.3-03 AC1, AC2 · PRD v1.4 NR-11, 4.4" },
  { label: "Android notification shade · all MVP push notifications", apply: () => reset({ view: "and", filter: (i, c) => MVP(i, c) && isPush(c), title: "Android · MVP push (collapsed)" }),
    notes: ["Collapsed Android notifications show one line of title and one line of text; the rest appears when expanded.", "This is why the first words of the text must carry the meaning (PRD 4.4)."], src: "PRD v1.4 4.4" },
  { label: "Web pop-ups · all MVP web notifications", apply: () => reset({ view: "web", filter: (i, c) => MVP(i, c) && isWeb(c), title: "Web pop-up · MVP" }),
    notes: ["Pop-up on the buyer website, seller cabinet and admin panel: title on one line, text up to 3 lines, the first button from the catalogue.", "Shown for 5 seconds top right while the page is open (US-BF-8.3-03 AC3)."], src: "US-BF-8.3-03 AC3" },
  { label: "SMS · every SMS text with character set and length", apply: () => reset({ view: "sms", filter: (i, c) => i !== "YG-B1" && (/SMS/.test(c.oc || "") || /^SMS/.test(c.en)), title: "SMS" }),
    notes: ["Latin texts (Uzbek, English) must use GSM-7 only, so one SMS holds 160 characters; Uzbek uses the plain apostrophe (o', g').", "Cyrillic SMS: ACC-01 ≤ 70, ACC-09 ≤ 134 characters (PRD 4.4).", "Items that are push with an extra SMS (DLV-04, ACC-07, ACC-08) are shown as one-line SMS of title + text; their SMS wording is to be confirmed."], src: "US-BF-8.3-03 AC7, AC8 · PRD v1.4 4.4" },
  { label: "Length check · all 104 notifications in 3 languages", apply: () => reset({ view: "len", vals: "long", title: "Length check · title ≤ 40, text ≤ 130 after variables" }),
    notes: ["Every push / list text in Russian, Uzbek and English, filled with the longest allowed values.", "Red rows break the limit. Tick \"Only texts over the limit\" for the list to fix.", "Switch to \"Typical\" values to see normal lengths."], src: "US-BF-8.3-02 AC9 · PRD v1.4 NR-11, 4.4" },
  { label: "Buyer orders and delivery (ORD, DLV)", apply: () => reset({ view: "ios", filter: i => /^(ORD|DLV-0[1-2]|DLV-0[4-8])/.test(i), title: "Buyer · orders and delivery" }),
    notes: ["MVP: ORD-01, ORD-05 – ORD-09, DLV-01, DLV-02. With pickup: DLV-04 – DLV-08. Later: ORD-10 (refund, N10), ORD-11, ORD-12 (confirm receipt, N5), ORD-13, ORD-14.", "ORD-02, ORD-03, ORD-04 are removed: an order exists only after successful payment, so nothing is sent before it."], src: "US-BF-8.1-01, US-BF-8.1-02" },
  { label: "Seller orders (SOR, DLV-03, DLV-07)", apply: () => reset({ view: "ios", filter: i => /^(SOR|DLV-03|DLV-07)/.test(i), title: "Seller · orders" }),
    notes: ["MVP: SOR-01 – SOR-06 and DLV-03. Later: SOR-07 (N5) and SOR-08 – SOR-10 (stock, N13)."], src: "US-SF-10.1-01" },
  { label: "Account, chat and moderation (ACC, MSG, CAT)", apply: () => reset({ view: "ios", filter: i => /^(ACC|MSG|CAT)/.test(i), title: "Account, chat, moderation" }),
    notes: ["ACC-01 and ACC-09 are SMS only and are not shown here (see the SMS scenario).", "MVP: ACC-02, ACC-04 – ACC-06 (ACC-05, ACC-06 also by e-mail, N7), MSG-01, CAT-01, CAT-02; ACC-09, ACC-10 with seller roles (not in the MVP)."], src: "US-BF-8.3-05" },
  { label: "Returns (RET) · later", apply: () => reset({ view: "ios", filter: i => /^RET/.test(i), title: "Returns" }),
    notes: ["All later: return and dispute notifications are out of the MVP (N1, N2). RET-05 is removed: no automatic approval (N1)."], src: "US-BF-8.2-01, US-SF-10.2-01" },
  { label: "Admin inbox (ADM) · web pop-ups", apply: () => reset({ view: "web", filter: i => /^ADM/.test(i), title: "Admin inbox" }),
    notes: ["MVP: ADM-01, ADM-02, to every admin (N15); ADM-07 with Yandex Go; ADM-08 later (N10); the rest later."], src: "US-AF-5.11-01" },
  { label: "Yandex Go (YG)", apply: () => reset({ view: "ios", filter: i => /^YG/.test(i), title: "Yandex Go" }),
    notes: ["Ship with Yandex Go (US-YG-1.11), except YG-B6 (refund), which is later (N10). Texts here are the catalogue versions of PRD v1.4; US-YG-1.11 is to be pointed at these IDs (plan P3.6)."], src: "US-YG-1.11" },
  { label: "Later items (preview only)", apply: () => reset({ view: "ios", filter: (i, c) => c.r === "Later", title: "Later" }),
    notes: ["Returns, refunds, confirm receipt, marketing, reviews, stock, finance and other later items — shown for proofreading only."], src: "PRD v1.4 section 12" },
];
harness({ title: "P2.3 Push, pop-up and SMS gallery", stories: "Epic US-BF-8.0", version: "1.1" }, SC);
