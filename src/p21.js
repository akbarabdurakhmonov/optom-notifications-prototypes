// ===== P2.1 Notification centre: buyer website, seller cabinet, buyer and seller apps =====
let S = {};
let KEY = 0;
const I = (id, min, read, to, v) => ({ key: ++KEY, id, min, read: !!read, to: to || { k: "order" }, v: Object.assign(to && to.no ? { order_no: to.no } : {}, v || {}) });
const ORD = (no, st) => ({ k: "order", no: no || "345934", st: st || "confirmed" });
const ST = { confirmed: ["Подтверждён", "g"], paid: ["Оплачен, ждёт подтверждения", "b"], delivery: ["В доставке", "v"], delivered: ["Доставлен", "g"], cancelled: ["Отменён", "r"], refunded: ["Возврат выполнен", "n"], ready: ["Готов к выдаче", "g"], new: ["Новый · подтвердите до 14:00 завтра", "a"] };

function reset(over) {
  S = Object.assign({ surface: "bweb", page: "home", dd: false, tab: "new", items: [], role: "owner", err: false, sim: null, phonePage: "list", openChat: null, clock: null }, over || {});
  render();
}
const unread = () => S.items.filter(i => !i.read).length;
function bellHTML() {
  const n = unread();
  return `<div class="bellwrap"><span class="bell" id="bell">${ICON.bell}${n ? `<span class="badge">${n > 99 ? "99+" : n}</span>` : ""}</span>${S.dd ? ddHTML() : ""}</div>`;
}
function ddHTML() {
  const list = [...S.items].sort((a, b) => a.min - b.min).slice(0, 5);
  return `<div class="dd" id="dd"><div class="hd"><b>${t("title")}</b>${unread() ? `<span class="btn link sm" id="markall">${t("all")}</span>` : ""}</div>
   ${list.length ? list.map(i => itemHTML(i)).join("") : `<div class="empty">${t("empty")}</div>`}
   <div class="ft"><span class="btn link" id="seeall">${t("seeall")} →</span></div></div>`;
}
function listHTML(opts = {}) {
  if (S.err) return `<div class="empty"><div class="alert e" style="text-align:left;max-width:520px;margin:0 auto"><span class="ic">!</span><div><b>${t("err")}</b><span class="btn sm out mt8" id="retry">${t("retry")}</span></div></div></div>`;
  const nw = S.items.filter(i => !i.read).sort((a, b) => a.min - b.min), rd = S.items.filter(i => i.read).sort((a, b) => a.min - b.min);
  const cur = S.tab === "new" ? nw : rd;
  return `<div class="row" style="justify-content:space-between"><div class="tabs" style="flex:1"><span class="tab ${S.tab === "new" ? "on" : ""}" data-tab="new">${t("nw")}${nw.length ? `<span class="c">${nw.length}</span>` : ""}</span><span class="tab ${S.tab === "read" ? "on" : ""}" data-tab="read">${t("rd")}</span></div>
   ${nw.length ? `<span class="btn link sm" id="markall">${t("all")}</span>` : ""}</div>
   <div>${cur.length ? cur.map(i => itemHTML(i, { buttons: opts.buttons })).join("") : `<div class="empty"><div class="eic">${ICON.bell}</div>${t("empty")}</div>`}</div>`;
}
// ---------- target screens ----------
function targetHTML(to, seller) {
  const back = `<span class="btn link" id="back">← ${t("title")}</span>`;
  if (to.k === "deny") return `${back}<div class="card mt12"><div class="alert e"><span class="ic">!</span><div><b>${t("noacc")}</b><span class="muted">The item stays in the list; the user is not taken to the page (US-BF-8.4-01 AC6).</span></div></div></div>`;
  if (to.k === "chat") return `${back}<div class="card mt12"><h3>Чат · ${esc(SAMPLE.sender_name)}</h3><p class="sub">Заказ №345934</p><div class="mt16" style="display:flex;flex-direction:column;gap:8px"><div style="align-self:flex-start;background:#f1f2f4;border-radius:12px;padding:8px 12px;max-width:60%">${esc(SAMPLE.message_preview)}</div>${(S.chatMsgs || []).map(m => `<div style="align-self:flex-start;background:#f1f2f4;border-radius:12px;padding:8px 12px;max-width:60%">${esc(m)}</div>`).join("")}</div><div class="row mt16"><input class="inp" placeholder="Сообщение"><span class="btn pri">Отправить</span></div></div>`;
  if (to.k === "product") return `${back}<div class="card mt12"><h3>Изменить товар</h3><p class="sub">${esc(SAMPLE.product_name)}</p><div class="alert e mt12"><span class="ic">!</span><div><b>Отклонён модератором</b>Причина: ${esc(SAMPLE.reason)}</div></div><div class="mt12 muted">Product editor (existing screen, 5 steps).</div></div>`;
  if (to.k === "store") return `${back}<div class="card mt12"><h3>Добавить товар</h3><p class="sub">Магазин ${esc(SAMPLE.store)} подтверждён. Existing screen "Добавить товар", step 1.</p></div>`;
  if (to.k === "return") return `${back}<div class="card mt12"><h3>Заявка на возврат ${esc(SAMPLE.return_no)}</h3><p class="sub">Заказ №345934 · ${esc(SAMPLE.reason)}</p><div class="mt12"><span class="pill ${to.st === "approved" ? "g" : to.st === "declined" ? "r" : "a"}">${to.st === "approved" ? "Одобрена" : to.st === "declined" ? "Отклонена" : "Ждёт решения продавца · до 23.10 14:00"}</span></div>${seller && !to.st ? `<div class="row mt16"><span class="btn pri" id="decide">Одобрить</span><span class="btn out">Отклонить</span></div>` : ""}</div>`;
  const [stt, cls] = ST[to.st] || ST.confirmed;
  return `${back}<div class="card mt12"><div class="row" style="justify-content:space-between"><h3>Заказ №${esc(to.no)}</h3><span class="pill ${cls}">${stt}</span></div>
   <p class="sub">Textile Plus · филиал Чиланзар · 12 товаров · 1 250 000 сум</p>
   ${to.st === "paid" && !seller ? `<div class="alert i mt12"><span class="ic">i</span><div><b>Оплата получена</b>The order is already paid, so the old "Finish your payment" item opens the order in its current state and no payment dialog is shown (NR-3).</div></div>` : ""}
   ${seller && to.st === "new" ? `<div class="row mt16"><span class="btn pri" id="confirm">Подтвердить заказ</span><span class="btn out">Отклонить</span></div>` : ""}
   <table class="t mt16"><tr><th>Товар</th><th>Кол-во</th><th>Сумма</th></tr><tr><td>${esc(SAMPLE.product_name)}</td><td>12 м</td><td>1 250 000 сум</td></tr></table></div>`;
}
// ---------- shells ----------
function bweb(content) {
  return `<div class="bweb"><div class="bhead">${LOGO}<span class="bcat">☰ Каталог</span><div class="bsearch">🔍 Поиск товаров и поставщиков</div><span class="sp" style="flex:1"></span>
   <span class="hic">${ICON.user}<span>Профиль</span></span><span class="hic">${ICON.box}<span>Заказы</span></span><span class="hic">${ICON.msg}<span>Чаты</span></span>${bellHTML()}</div><div class="bbody">${content}</div></div>`;
}
function sweb(active, crumbs, content) {
  const nav = (k, ic, tx) => `<div class="nav ${active === k ? "on" : ""}">${ICON[ic]}${tx}</div>`;
  const who = { owner: ["НА", "Николаев А. Д.", "Владелец"], manager: ["ДК", "Дилноза К.", "Менеджер магазина"], sales: ["СР", "Сардор Р.", "Менеджер по продажам"], wh: ["ЖТ", "Жасур Т.", "Кладовщик"] }[S.role] || ["НА", "Николаев А. Д.", "Владелец"];
  return `<div class="shell"><aside class="side">${LOGO}
    <div class="grp">Основное</div>${nav("an", "chart", "Аналитика")}${nav("pr", "box", "Товары")}${nav("or", "list", "Заказы")}${nav("ch", "chat", "Чаты")}
    <div class="grp">Организация</div>${nav("em", "users", "Сотрудники")}${nav("br", "store", "Филиалы")}
    <div class="grp">Система</div>${nav("se", "gear", "Настройки")}${nav("ta", "spark", "Тарифы")}
    <div class="me"><span class="ava">${who[0]}</span><div><b style="font-weight:600">${who[1]}</b><small>${who[2]}</small></div></div></aside>
    <main class="main"><div class="top"><span class="iconbtn">${ICON.side.replace("<svg", '<svg width="18" height="18" fill="none" stroke="#38383b"')}</span><div class="crumbs">${crumbs}</div><span class="sp"></span>${bellHTML()}<span class="lang">${{ ru: "Русский", uz: "O‘zbekcha", en: "English" }[LANG]} ▾</span></div>${content}</main></div>`;
}
function phone(title, body, tabOn) {
  const tab = (k, ic, tx) => `<div class="${tabOn === k ? "on" : ""}">${ICON[ic]}${tx}</div>`;
  const tabs = S.surface === "sapp" ? tab("h", "chart", "Главная") + tab("o", "list", "Заказы") + tab("c", "chat", "Чаты") + tab("n", "bell", "Уведомл.") + tab("p", "user", "Профиль")
    : tab("h", "store", "Главная") + tab("c", "list", "Каталог") + tab("k", "box", "Корзина") + tab("n", "bell", "Уведомл.") + tab("p", "user", "Профиль");
  return `<div class="phone"><div class="scr"><div class="sbar"><span>09:41</span><span>●●● ▮</span></div>${S.push ? `<div class="pushb" id="pushb"><div class="ph"><i></i>${S.surface === "sapp" ? "OPTOM BIZNES" : "OPTOM"} · сейчас</div><b>${esc(msg(S.push).title)}</b><span>${esc(msg(S.push).text)}</span></div>` : ""}
   <div class="mhead"><b>${title}</b></div><div class="mbody">${body}</div><div class="mtabbar">${tabs}</div></div></div>`;
}
function ctl(html) { return `<div class="pctl"><b>Prototype controls</b>${html}<span class="sp" style="flex:1"></span><span class="muted">Language of the texts:</span>${langBox()}</div>`; }

// ---------- render ----------
function render() {
  let h = "";
  const pg = S.page;
  if (S.surface === "bweb") {
    let c;
    if (pg === "home") c = `<div class="h1" style="font-size:22px">Популярные товары</div><div class="prodgrid">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => `<div class="pcard"><div class="pimg"></div><div class="pi"><div class="pp">${(42000 + n * 3500).toLocaleString("ru-RU")} сум</div><div class="small muted">Ткань, опт от 10 м</div></div></div>`).join("")}</div>`;
    else if (pg === "list") c = `<div class="prof"><div class="pside"><div class="nav">${ICON.user}Мой профиль</div><div class="nav">${ICON.box}Мои заказы</div><div class="nav">${ICON.pin}Адреса</div><div class="nav on">${ICON.bell}${t("title")}</div></div><div class="card"><h3 style="margin-bottom:10px">${t("title")}</h3>${listHTML({ buttons: true })}</div></div>`;
    else c = targetHTML(S.target, false);
    h = bweb((S.sim ? ctl(S.sim) : ctl("")) + c);
  } else if (S.surface === "sweb") {
    let c;
    if (pg === "home") c = `<div class="h1">Заказы</div><div class="card" style="padding:0"><table class="t"><tr><th>№</th><th>Покупатель</th><th>Сумма</th><th>Статус</th><th>Филиал</th></tr>${(S.newOrder ? `<tr style="background:var(--green-50)"><td><b>345934</b></td><td>Азиз Каримов</td><td>1 250 000 сум</td><td><span class="pill a">Новый</span></td><td>Чиланзар</td></tr>` : "")}<tr><td>345901</td><td>Мадина Юсупова</td><td>640 000 сум</td><td><span class="pill v">В доставке</span></td><td>Чиланзар</td></tr><tr><td>345877</td><td>ООО «Строймаркет»</td><td>4 120 000 сум</td><td><span class="pill g">Доставлен</span></td><td>Юнусабад</td></tr></table></div>`;
    else if (pg === "list") c = `<div class="h1">${t("title")} <span class="pill v" style="font-size:12px">proposal · not in design</span></div><div class="card">${listHTML({ buttons: true })}</div>`;
    else if (pg === "ladder") c = ladderHTML();
    else c = targetHTML(S.target, true);
    h = sweb(pg === "home" ? "or" : "", `Главная › <b>${pg === "list" ? t("title") : "Заказы"}</b>`, (S.sim ? ctl(S.sim) : ctl("")) + c);
  } else {
    const inner = S.phonePage === "list" ? `<div style="padding:0 16px">${listHTML()}</div>` : `<div style="padding:0 16px">${targetHTML(S.target, S.surface === "sapp").replace('class="card mt12"', 'class="card mt12" style="padding:14px"')}</div>`;
    h = `<div style="padding:16px 24px 0">${ctl(S.sim || "")}</div><div class="phonewrap">${phone(S.phonePage === "list" ? t("title") : "", inner, "n")}<div style="max-width:380px" class="card"><h3>${S.surface === "sapp" ? "Seller app" : "Buyer app"}</h3><p class="sub mt8">The list follows the existing mobile design "Уведомления" (New / Read tabs). New in this proposal: tap opens the target, the push carries the target, texts in the app language.</p><p class="sub mt8">Tap the push banner or a list item.</p></div></div>`;
  }
  $("#app").innerHTML = h;
  bind();
}
function openItem(key) {
  const it = S.items.find(i => i.key === key); if (!it) return;
  it.read = true; S.dd = false;
  if (S.surface === "bapp" || S.surface === "sapp") { S.phonePage = "target"; S.target = it.to; S.push = null; }
  else { S.page = "target"; S.target = it.to; }
  render();
}
function bind() {
  const b = $("#bell"); if (b) b.onclick = e => { e.stopPropagation(); S.dd = !S.dd; render(); };
  document.querySelectorAll(".ni").forEach(e => e.onclick = () => openItem(+e.dataset.key));
  document.querySelectorAll("[data-tab]").forEach(e => e.onclick = () => { S.tab = e.dataset.tab; render(); });
  const ma = $("#markall"); if (ma) ma.onclick = e => { e.stopPropagation(); S.items.forEach(i => i.read = true); render(); };
  const sa = $("#seeall"); if (sa) sa.onclick = () => { S.dd = false; S.page = "list"; S.tab = "new"; render(); };
  const bk = $("#back"); if (bk) bk.onclick = () => { if (S.surface.endsWith("app")) S.phonePage = "list"; else S.page = "list"; render(); };
  const rt = $("#retry"); if (rt) rt.onclick = () => { S.err = false; render(); };
  const pb = $("#pushb"); if (pb) pb.onclick = () => { const id = S.push; const it = S.items.find(i => i.id === id && !i.read); if (it) openItem(it.key); };
  document.querySelectorAll("[data-sim]").forEach(e => e.onclick = () => SIM[e.dataset.sim](e.dataset.arg));
  const cf = $("#confirm"); if (cf) cf.onclick = () => { if (S.clock) { S.clock.confirmedAt = S.clock.now; } toast("Заказ подтверждён"); S.target = Object.assign({}, S.target, { st: "confirmed" }); render(); };
  bindLang(render);
  document.onclick = e => { if (S.dd && !e.target.closest(".bellwrap")) { S.dd = false; render(); } };
}
// live event: new item + counter + pop-up (web) or push banner (app)
function arrive(id, to, v) {
  if (S.openChat && id === "MSG-01" && S.page === "target" && S.target.k === "chat") { S.chatMsgs = (S.chatMsgs || []).concat("Можно забрать завтра утром?"); render(); toast("Chat is open: the message appears in the chat, no pop-up (US-BF-8.3-05 AC7)"); return; }
  const it = I(id, 0, false, to, v); S.items.push(it);
  if (S.surface.endsWith("app")) { S.push = id; render(); return; }
  render(); popup(id, v, () => openItem(it.key));
}
const SIM = {
  ev: a => { const [id, k, st] = a.split("|"); arrive(id, k === "chat" ? { k: "chat" } : k === "product" ? { k: "product" } : k === "store" ? { k: "store" } : k === "return" ? { k: "return", st } : ORD("345934", st || "confirmed")); },
  err: () => { S.err = !S.err; S.page = "list"; render(); },
  empty: () => { S.items = []; S.page = "list"; render(); },
  role: r => { S.role = r; applyRole(); },
  chat: () => { S.openChat = true; S.page = "target"; S.target = { k: "chat" }; render(); },
  clock: a => ladderStep(a),
  pay: a => { ladderInit(+a); },
};

// ---------- reminder ladder (US-BF-8.3-04) ----------
const OPEN = 9, CLOSE = 18;
function fmt(h) { const d = Math.floor(h / 24), hh = ((h % 24) + 24) % 24; return (d ? "завтра " : "сегодня ") + String(Math.floor(hh)).padStart(2, "0") + ":" + String(Math.round((hh % 1) * 60)).padStart(2, "0"); }
function inHours(h) { const x = ((h % 24) + 24) % 24; return x >= OPEN && x < CLOSE; }
function nextOpen(h) { let x = Math.ceil(h); while (!inHours(x)) x++; return x; }
function ladderInit(paidAt) {
  const dl = paidAt + 24;
  const steps = [12, 20, 23].map(n => {
    const due = paidAt + n; let at = due, state = "due", why = "";
    if (n < 23 && !inHours(due)) { const o = nextOpen(due); if (o >= dl) { state = "skip"; why = `outside working hours ${OPEN}:00–${CLOSE}:00; next opening ${fmt(o)} is not before the deadline`; } else { at = o; why = `moved from ${fmt(due)}: outside working hours ${OPEN}:00–${CLOSE}:00`; } }
    if (n === 23 && !inHours(due)) why = "last reminder: sent at once even outside working hours (NR-7)";
    return { n, due, at, state, why, to: "Seller account (no seller roles in the MVP, N6)" };
  });
  S.clock = { paidAt, now: paidAt, dl, steps, confirmedAt: null };
  S.page = "ladder"; S.items = [I("SOR-01", 0, false, ORD("345934", "new"))]; render();
}
function ladderStep() {
  const c = S.clock; if (c.confirmedAt != null) return;
  const nx = c.steps.filter(s => s.state === "due").sort((a, b) => a.at - b.at)[0];
  if (!nx) { c.now = c.dl; render(); toast("24 h passed: the order is cancelled automatically (SOR-03 to the seller, ORD-07 to the buyer)"); return; }
  c.now = nx.at; nx.state = "sent";
  const it = I("SOR-02", 0, false, ORD("345934", "new"), { hours_left: String(24 - nx.n), time: fmt(c.dl).replace("завтра ", "").replace("сегодня ", "") });
  S.items.push(it); render(); popup("SOR-02", it.v, () => { S.page = "target"; S.target = ORD("345934", "new"); it.read = true; render(); });
}
function ladderHTML() {
  const c = S.clock; const done = c.confirmedAt != null;
  if (done) c.steps.forEach(s => { if (s.state === "due") { s.state = "cxl"; s.why = "cancelled: the order was confirmed"; } });
  const row = s => `<div class="ev ${s.state === "sent" ? "sent" : s.state === "due" ? "due" : "cxl"}"><b>SOR-02 · ${s.n} h reminder</b> — ${s.state === "skip" ? "<span class='pill n'>skipped</span>" : s.state === "cxl" ? "<span class='pill n'>cancelled</span>" : s.state === "sent" ? "<span class='pill g'>sent " + fmt(s.at) + "</span>" : "<span class='pill a'>scheduled " + fmt(s.at) + "</span>"}<div class="small muted">${esc(s.to)}${s.why ? " · " + esc(s.why) : ""}</div></div>`;
  return `<div class="h1">Заказ №345934</div><div class="grid2"><div class="card"><h3>Scheduled reminders</h3><p class="sub">Paid ${fmt(c.paidAt)} · deadline ${fmt(c.dl)} · branch Чиланзар works ${OPEN}:00–${CLOSE}:00 · clock: <b>${fmt(c.now)}</b></p>
    <div class="tl mt12"><div class="ev sent"><b>SOR-01 · new paid order</b> <span class="pill g">sent ${fmt(c.paidAt)}</span><div class="small muted">Seller account</div></div>${c.steps.map(row).join("")}</div>
    <div class="row mt16"><span class="btn pri ${done ? "" : ""}" data-sim="clock" ${done ? "disabled" : ""}>Advance clock to next reminder ▶</span><span class="btn out" id="confirm">Подтвердить заказ</span></div></div>
    <div class="card"><h3>Who gets the reminders</h3><table class="t mt8"><tr><th>Recipient</th><th>12 h</th><th>20 h</th><th>23 h</th></tr><tr><td>Seller account (MVP)</td><td>✓</td><td>✓</td><td>✓</td></tr></table><p class="small muted mt8">Times decided 21.10.2026 (N4). There are no seller roles in the MVP (N6), so every reminder goes to the seller account. Once roles exist, PRD table 4.3 applies (the 23-h reminder also escalates to the owner).</p></div></div>`;
}
// ---------- role switch (seller cabinet) ----------
const ROLEITEMS = {
  owner: ["SOR-01", "SOR-04", "MSG-01", "CAT-02", "ACC-05", "DLV-03"],
  manager: ["SOR-01", "SOR-04", "MSG-01", "CAT-02", "DLV-03"],
  sales: ["SOR-01", "SOR-04", "MSG-01", "DLV-03"],
  wh: ["SOR-01", "SOR-04", "DLV-03", "CAT-02"],
};
function applyRole() {
  const tos = { "SOR-01": ORD("345934", "new"), "SOR-04": ORD("345901", "cancelled"), "MSG-01": { k: "chat" }, "CAT-02": S.role === "wh" ? { k: "deny" } : { k: "product" }, "ACC-05": { k: "store" }, "DLV-03": ORD("345877", "delivery") };
  const vs = { "DLV-03": { reason: "Получатель не отвечает на звонки" } };
  S.items = ROLEITEMS[S.role].map((id, n) => I(id, [3, 25, 70, 200, 1500, 2900][n], n > 2, tos[id], vs[id]));
  S.page = "list"; S.tab = "new"; S.items.forEach(i => i.read = false); render();
}

// ---------- scenarios ----------
const B0 = () => [I("ORD-05", 2, false, ORD()), I("DLV-01", 40, false, ORD("345901", "delivery")), I("MSG-01", 180, false, { k: "chat" }), I("ORD-01", 1500, true, ORD("345934", "paid")), I("ORD-08", 2900, true, ORD("345811", "cancelled"))];
const SC = [
  { label: "Buyer website · bell with 3 unread, dropdown", apply: () => reset({ surface: "bweb", items: B0(), dd: true }),
    notes: ["Bell in the header with the unread counter; above 99 it shows \"99+\" (US-BF-8.4-01 AC1).", "Dropdown: latest 5 items, newest first, \"Mark all as read\", \"All notifications\" (AC3).", "Click an item: it opens its target and becomes read; the counter drops by 1 (AC4).", "Small grey code bottom-right = catalogue ID (prototype only, not shown in the product).", "Switch the text language RU / UZ / EN in the yellow box: texts come from Notifications PRD v1.4."], src: "US-BF-8.4-01 · PRD v1.4 NC-1 – NC-5, NR-3, NR-12" },
  { label: "Buyer website · live pop-up when the seller confirms", apply: () => { reset({ surface: "bweb", items: B0().slice(3), sim: `<span>Simulate event:</span><span class="btn out" data-sim="ev" data-arg="ORD-05|order|confirmed">Seller confirms (ORD-05)</span><span class="btn out" data-sim="ev" data-arg="DLV-01|order|delivery">In delivery (DLV-01)</span><span class="btn out" data-sim="ev" data-arg="ORD-06|order|cancelled">Seller rejects (ORD-06)</span><span class="btn out" data-sim="ev" data-arg="ORD-09|order|cancelled">Admin cancels (ORD-09)</span>` }); setTimeout(() => arrive("ORD-05", ORD()), 1200); },
    notes: ["A pop-up appears top right for 5 seconds while the website is open; the bell counter rises at the same time (US-BF-8.3-03 AC3).", "Click the pop-up: the order opens and the item is read.", "ORD-05 is sent when the seller confirms, not when the courier is searched (fixes CN-03).", "ORD-06 says the seller rejected the order — never \"cancelled by admin\" (fixes D-03).", "No browser notification when the site is closed: push is sent only to the mobile apps (N8).", "Nothing is ever sent before payment: the order exists only after the payment succeeds (22.10.2026)."], src: "US-BF-8.3-03, US-BF-8.1-01" },
  { label: "Buyer website · Notifications page, New / Read tabs", apply: () => reset({ surface: "bweb", page: "list", items: B0() }),
    notes: ["Profile → Уведомления. Tabs New / Read as in the mobile design (NC-2).", "\"Mark all as read\" moves everything to Read and the counter shows 0; the link disappears when nothing is unread (AC8).", "Items with a button in the catalogue show it under the text (proposal for web; action buttons inside list items are release 2 in the app).", "20 items per page, more on scroll (not simulated)."], src: "US-BF-8.4-01 AC2, AC3, AC8" },
  { label: "Seller cabinet · old reminder opens the order in its current state", apply: () => reset({ surface: "sweb", page: "list", items: [I("SOR-02", 30, false, ORD("345934", "confirmed"), { hours_left: "4", time: "14:00" }), I("SOR-01", 1250, true, ORD("345934", "confirmed"))] }),
    notes: ["The seller confirmed order #345934 after the 20-h reminder SOR-02 was stored.", "Tapping the old reminder opens the order as it is now (Confirmed). No confirm or reject action and no other stale action (NR-3, US-BF-8.4-01 AC5).", "v1.1: this scenario used the unpaid-order reminder ORD-02, which is removed because an order exists only after payment."], src: "US-BF-8.4-01 AC5" },
  { label: "Buyer app · push banner and Notifications screen", apply: () => { reset({ surface: "bapp", items: B0().slice(1) }); setTimeout(() => arrive("ORD-05", ORD()), 900); },
    notes: ["Push in the app's language (today it is always Uzbek, D-06).", "Tap the banner: the order opens (the push now carries the target, US-BF-8.3-03 AC1).", "The list is the existing mobile design; only the tap target is new."], src: "US-BF-8.3-03 AC1, US-BF-8.4-01 AC4, AC7" },
  { label: "Buyer website · empty list and load error", apply: () => reset({ surface: "bweb", page: "list", items: [], sim: `<span class="btn out" data-sim="err">Toggle load error</span>` }),
    notes: ["Empty: \"No notifications yet\" / \"Hozircha bildirishnomalar yo‘q\" / \"Уведомлений пока нет\" (NC-5).", "Load error: message with \"Try again\"; the counter keeps its last value (AC12)."], src: "US-BF-8.4-01 AC9, AC12" },
  { label: "Seller app · new order push and list", apply: () => { reset({ surface: "sapp", items: [I("MSG-01", 50, false, { k: "chat" }), I("SOR-04", 600, true, ORD("345901", "cancelled"))] }); setTimeout(() => arrive("SOR-01", ORD("345934", "new")), 900); },
    notes: ["The seller app gets SOR-01 with sound (US-SF-10.1-01 AC2).", "Push goes through the seller app's Firebase project (US-BF-8.3-03 AC2)."], src: "US-SF-10.1-01" },
  { label: "Seller cabinet · new paid order pops up", apply: () => { reset({ surface: "sweb", items: [I("SOR-04", 300, true, ORD("345901", "cancelled"))] }); setTimeout(() => { S.newOrder = true; arrive("SOR-01", ORD("345934", "new")); }, 1200); },
    notes: ["Today the seller gets no notification for a new paid order (D-02) and the cabinet has no live pop-up (D-13).", "New: pop-up + bell counter + the order row highlighted.", "Recipient: the seller account of the store (no seller roles in the MVP, N6)."], src: "US-SF-10.1-01 AC2; US-BF-8.3-03 AC3" },
  { label: "Seller cabinet · reminders 12 h, 20 h, 23 h after payment", apply: () => { reset({ surface: "sweb", sim: `<span>Paid at:</span><span class="btn out" data-sim="pay" data-arg="14">14:00</span><span class="btn out" data-sim="pay" data-arg="9">09:00</span>` }); ladderInit(14); },
    notes: ["Click \"Advance clock\" to send the next reminder; click \"Подтвердить заказ\" to cancel the remaining ones (US-BF-8.3-04 AC3).", "Paid 14:00: the 12-h reminder (02:00) is outside working hours and moves to 09:00; 20 h (10:00) and 23 h (13:00) go on time.", "Paid 09:00: the 12-h (21:00) and 20-h (05:00) reminders would move to 09:00 next day, which is the deadline itself, so they are skipped; the 23-h reminder goes at 08:00 at once.", "\"Not before the deadline\" (moved time equal to the deadline counts as skipped) is our reading of the AC; to confirm.", "Times decided (N4); branch hours 09:00–18:00 are an example."], src: "US-BF-8.3-04 AC1 – AC3; PRD v1.4 SOR-02" },
  { label: "Seller cabinet · Notifications page (not designed yet)", apply: () => reset({ surface: "sweb", page: "list", items: [I("SOR-01", 2, false, ORD("345934", "new")), I("MSG-01", 15, false, { k: "chat" }), I("SOR-02", 120, false, ORD("345920", "new"), { hours_left: "4" }), I("CAT-01", 400, true, { k: "product" }), I("SOR-04", 1500, true, ORD("345901", "cancelled"))] }),
    notes: ["The seller website design has only a bell icon (PRD design remark). This page reuses the buyer list layout: tabs, mark all as read, empty state.", "Reached from the bell → \"All notifications\" (no new menu item).", "One seller account in the MVP (N6); each employee gets their own list and read state once seller roles exist (US-BF-8.4-01, who can do what)."], src: "US-BF-8.4-01 · P2.1 proposal for the designer" },
  { label: "Seller cabinet · buyer cancels, admin cancels, admin message, delivery problem", apply: () => reset({ surface: "sweb", page: "list", items: [I("SOR-04", 5, false, ORD("345901", "cancelled")), I("SOR-05", 60, false, ORD("345899", "cancelled")), I("SOR-06", 90, false, ORD("345934", "new"), { title: "Проверьте заказ", text: "Покупатель просит связаться перед отправкой." }), I("DLV-03", 240, false, ORD("345877", "delivery"), { reason: "Получатель не отвечает на звонки" })] }),
    notes: ["SOR-04: \"Do not ship or hand over the goods\" when the buyer cancels.", "SOR-05: admin cancellation with the reason.", "SOR-06: the admin's own message about an order (form in prototype P2.2, scenario 5).", "DLV-03: delivery problem with provider and reason (Fargo problem statuses send nothing today, CN-17 – CN-19)."], src: "US-SF-10.1-01 AC6 – AC9, AC11" },
  { label: "Seller cabinet · after seller roles: what each role sees, no-access target", apply: () => { reset({ surface: "sweb", sim: `<span>Role:</span>${[["owner", "Owner"], ["manager", "Store manager"], ["sales", "Sales manager"], ["wh", "Warehouse worker"]].map(([k, l]) => `<span class="btn out" data-sim="role" data-arg="${k}">${l}</span>`).join("")}` }); S.role = "wh"; applyRole(); },
    notes: ["Not in the MVP: there are no seller roles yet (N6), so in the MVP the seller account gets every item. This scenario shows the rule for later (PRD 4.3, DEC-17).", "Switch roles to see which items each one gets.", "Warehouse worker: the product-rejected item was received while the employee was a store manager; after the role change the product editor is not allowed, so a tap shows \"You don't have access to this page.\" (US-BF-8.4-01 AC6).", "Cashier and consultant are not shown: cashier gets no seller notifications, consultant gets chat only."], src: "US-BF-8.4-01 AC6; US-BF-8.3-02 AC3" },
  { label: "Seller cabinet · store approved, product rejected, new chat message", apply: () => { reset({ surface: "sweb", sim: `<span>Simulate:</span><span class="btn out" data-sim="ev" data-arg="ACC-05|store">Store approved (ACC-05)</span><span class="btn out" data-sim="ev" data-arg="CAT-02|product">Product rejected (CAT-02)</span><span class="btn out" data-sim="ev" data-arg="MSG-01|chat">New chat message (MSG-01)</span><span class="btn out" data-sim="chat">Open the chat, then simulate MSG-01</span>`, items: [I("SOR-04", 900, true, ORD("345901", "cancelled"))] }); },
    notes: ["ACC-05 opens \"Добавить товар\"; CAT-02 opens the product editor with the reason; MSG-01 opens the chat with \"Reply\".", "If the chat with that buyer is already open, a new message shows in the chat and no pop-up appears (US-BF-8.3-05 AC7).", "Chat messages within 60 s are grouped into one push (US-BF-8.3-02 AC7, not simulated)."], src: "US-BF-8.3-05" },
  { label: "Buyer website · ready for pickup and storage reminder (with pickup)", apply: () => reset({ surface: "bweb", page: "list", items: [I("DLV-05", 10, false, ORD("345934", "ready"), { days: "2" }), I("DLV-04", 2900, false, ORD("345934", "ready"))] }),
    notes: ["Ships with the pickup feature BF-6.3, not in the MVP.", "DLV-04 also goes by SMS with the pickup code (proposed, like Uzum).", "Storage 3 days, then the order is cancelled (N3). Reminder DLV-05 at 10:00 on day 2 (reminder day assumed, PRD OQ-N17)."], src: "US-BF-8.1-02" },
  { label: "Buyer website · return notifications (later, not in the MVP)", apply: () => reset({ surface: "bweb", page: "list", items: [I("RET-12", 5, false, { k: "return", st: "approved" }), I("RET-04", 1500, false, { k: "return", st: "approved" }), I("RET-01", 4300, true, { k: "return" })] }),
    notes: ["Later: return and dispute notifications are out of the MVP (N1, N2). Shown for when returns are planned.", "RET-01 received → RET-04 approved (or RET-06 declined) → RET-12 refund sent (refund notices are later too, N10). There is no automatic approval (N1).", "RET-06 shows \"Appeal\" only when the appeal form exists (open question in US-BF-8.2-01)."], src: "US-BF-8.2-01" },
  { label: "Seller cabinet · return request and deadline reminders (later, not in the MVP)", apply: () => reset({ surface: "sweb", page: "list", items: [I("RET-03", 3, false, { k: "return" }, { hours_left: "4", time: "14:00" }), I("RET-03", 1200, false, { k: "return" }, { hours_left: "24", time: "14:00" }), I("RET-02", 2600, true, { k: "return" })] }),
    notes: ["Later: out of the MVP (N1, N2).", "RET-02 at once; RET-03 24 h and 4 h before the reply deadline; the 4-h one is sent even at night; both cancelled when the seller decides.", "Recipient: the seller account (N6).", "The deadline value is open; a missed deadline does not approve the return automatically (N1, PRD OQ-N18)."], src: "US-SF-10.2-01" },
];
harness({ title: "P2.1 Notification centre", stories: "Epic US-BF-8.0", version: "1.1" }, SC);
