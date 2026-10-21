// ===== P2.2 Admin panel: notification inbox and "Send notification" on an order =====
let S = {};
let KEY = 0;
const I = (id, min, read, to, v) => ({ key: ++KEY, id, min, read: !!read, to, v: v || {} });
const ROLES = { super: ["СА", "Сардор А.", "Супер-админ"], mod: ["ЛМ", "Лола М.", "Модератор"], sup: ["ОТ", "Отабек Т.", "Поддержка"] };
const VIS = { super: ["ADM-01", "ADM-02", "ADM-08"], mod: ["ADM-01", "ADM-02"], sup: [] };
function base() { return [I("ADM-01", 3, false, { k: "seller" }, { store: "Ipak Yo‘li Textile" }), I("ADM-02", 25, false, { k: "product" }, { store: "Textile Plus" }), I("ADM-08", 70, false, { k: "refund" }, { order_no: "345811", amount: "640 000", error: "Карта заблокирована" }), I("ADM-02", 1500, true, { k: "product" }, { store: "Baraka Mebel", product_name: "Стул офисный, серый" })]; }
function reset(over) { S = Object.assign({ role: "super", page: "home", dd: false, tab: "new", items: [], resolved: false, form: null, sim: "" }, over || {}); S.all = S.items; filt(); render(); }
function filt() { S.items = S.all.filter(i => VIS[S.role].includes(i.id)); }
const unread = () => S.items.filter(i => !i.read).length;
function bellHTML() { const n = unread(); return `<div class="bellwrap"><span class="bell" id="bell">${ICON.bell}${n ? `<span class="badge">${n}</span>` : ""}</span>${S.dd ? `<div class="dd"><div class="hd"><b>${t("title")}</b>${n ? `<span class="btn link sm" id="markall">${t("all")}</span>` : ""}</div>${S.items.length ? [...S.items].sort((a, b) => a.min - b.min).slice(0, 5).map(i => itemHTML(i)).join("") : `<div class="empty">${t("empty")}</div>`}<div class="ft"><span class="btn link" id="seeall">${t("seeall")} →</span></div></div>` : ""}</div>`; }
function shell(active, crumbs, content) {
  const nav = (k, ic, tx) => `<div class="nav ${active === k ? "on" : ""}">${ICON[ic]}${tx}</div>`; const w = ROLES[S.role];
  return `<div class="shell"><aside class="side" style="background:#fff;border-right:1px solid var(--line)">${LOGO}<div class="small muted" style="margin:-16px 8px 10px">Админ-панель</div>
   <div class="grp">Управление</div>${nav("da", "chart", "Дашборд")}${nav("se", "store", "Продавцы")}${nav("pr", "box", "Товары")}${nav("or", "list", "Заказы")}${nav("us", "users", "Пользователи")}${nav("dl", "truck", "Доставка")}
   <div class="grp">Система</div>${nav("no", "bell", "Уведомления")}${nav("st", "gear", "Настройки")}
   <div class="me"><span class="ava">${w[0]}</span><div><b style="font-weight:600">${w[1]}</b><small>${w[2]}</small></div></div></aside>
   <main class="main" style="padding-left:24px"><div class="top"><div class="crumbs">${crumbs}</div><span class="sp"></span>${bellHTML()}<span class="lang">Русский ▾</span></div>
   <div class="pctl"><b>Prototype controls</b>${S.sim}<span class="sp" style="flex:1"></span><span class="muted">Text language:</span>${langBox()}</div>${content}</main></div>`;
}
function listHTML() {
  const nw = S.items.filter(i => !i.read).sort((a, b) => a.min - b.min), rd = S.items.filter(i => i.read).sort((a, b) => a.min - b.min), cur = S.tab === "new" ? nw : rd;
  return `<div class="row" style="justify-content:space-between"><div class="tabs" style="flex:1"><span class="tab ${S.tab === "new" ? "on" : ""}" data-tab="new">${t("nw")}${nw.length ? `<span class="c">${nw.length}</span>` : ""}</span><span class="tab ${S.tab === "read" ? "on" : ""}" data-tab="read">${t("rd")}</span></div>${nw.length ? `<span class="btn link sm" id="markall">${t("all")}</span>` : ""}</div>${cur.length ? cur.map(i => itemHTML(i)).join("") : `<div class="empty"><div class="eic">${ICON.bell}</div>${t("empty")}</div>`}`;
}
function target(to) {
  const back = `<span class="btn link" id="back">← ${t("title")}</span>`;
  if (to.k === "seller") return `${back}<div class="card mt12"><div class="row" style="justify-content:space-between"><h3>Ipak Yo‘li Textile</h3>${S.resolved ? `<span class="pill g">Подтверждён · Лола М., 10:42</span>` : `<span class="pill a">На проверке</span>`}</div><p class="sub">ИНН 309 112 445 · Ташкент · документы: 3 файла</p>${S.resolved ? `<div class="alert i mt12"><span class="ic">i</span><div><b>Another moderator already approved this seller</b>The page opens in its current state; no approve / reject buttons (US-AF-5.11-01 AC5).</div></div>` : `<div class="row mt16"><span class="btn pri">Подтвердить</span><span class="btn dan">Отклонить</span></div>`}</div>`;
  if (to.k === "product") return `${back}<div class="card mt12"><div class="row" style="justify-content:space-between"><h3>Ткань хлопок 150 см, синий</h3><span class="pill a">На модерации</span></div><p class="sub">Textile Plus · новый товар</p><div class="row mt16"><span class="btn pri">Одобрить</span><span class="btn dan">Отклонить</span></div></div>`;
  return `${back}<div class="card mt12"><div class="row" style="justify-content:space-between"><h3>Заказ №345811</h3><span class="pill r">Возврат не выполнен</span></div><p class="sub">Мадина Юсупова · отменён продавцом · 640 000 сум</p><div class="alert e mt12"><span class="ic">!</span><div><b>Возврат на карту •••• 4417 не прошёл</b>Paylov: «Карта заблокирована» · 21.10.2026 11:05</div></div><p class="small muted mt12">Refund block of the order page. What the super admin does next (retry, manual refund) is not part of this story.</p></div>`;
}
function orderPage() {
  const f = S.form;
  const L = { uz: "O‘zbekcha *", ru: "Русский", en: "English" };
  const fl = f ? `<div class="modal-bg" style="position:fixed"><div class="modal"><h3>Отправить уведомление продавцу</h3><p class="sub">Textile Plus · заказ №345934 · получат владелец и сотрудники филиала Чиланзар с ролью для заказов</p>
    <div class="tabs mt12">${Object.keys(L).map(l => `<span class="tab ${f.l === l ? "on" : ""}" data-fl="${l}">${L[l]}${(f.t[l] || f.x[l]) ? " ●" : ""}</span>`).join("")}</div>
    <div class="field mt12"><label>Заголовок</label><input class="inp ${f.err && !f.t.uz && f.l === "uz" ? "err" : ""}" id="ft" maxlength="40" value="${esc(f.t[f.l] || "")}"><span class="hint">${(f.t[f.l] || "").length} / 40</span></div>
    <div class="field"><label>Текст</label><textarea class="inp" id="fx" rows="3" maxlength="130">${esc(f.x[f.l] || "")}</textarea><span class="hint">${(f.x[f.l] || "").length} / 130</span></div>
    ${f.err ? `<div class="err-t">${!f.t.uz ? "Enter the title in Uzbek." : "Enter the text in Uzbek."}</div>` : ""}
    <p class="small muted">Uzbek is required; an empty Russian or English text falls back to Uzbek for that recipient. Seller sees: «Optom.uz: заказ №345934» + your text (SOR-06).</p>
    ${f.ask ? `<div class="alert w mt12"><span class="ic">?</span><div><b>Discard the message?</b><div class="row mt8"><span class="btn sm danfill" id="fdisc">Discard</span><span class="btn sm out" id="fkeep">Keep editing</span></div></div></div>` : ""}
    <div class="acts"><span class="btn out" id="fcan">Отмена</span><span class="btn pri" id="fsend" ${f.t.uz && f.x.uz ? "" : 'aria-disabled="true" style="opacity:.55"'}>Отправить</span></div></div></div>` : "";
  return `<div class="h1">Заказ №345934</div><div class="card"><div class="row" style="justify-content:space-between"><div><b>Textile Plus</b> · филиал Чиланзар<div class="small muted">Покупатель: Азиз Каримов · 1 250 000 сум</div></div><span class="pill a">Ждёт подтверждения продавца</span></div>
   <div class="row mt16"><span class="btn out" id="fopen">${ICON.bell.replace("<svg", '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.7"')} Отправить уведомление</span><span class="btn dan">Отменить заказ</span></div>
   <p class="small muted mt12">Today this button shows a success message without sending anything (Notifications in code today, D-08). In this proposal it opens the form below and calls the existing notify-seller API.</p></div>${fl}`;
}
function render() {
  let c, crumbs = "Главная › <b>Уведомления</b>", act = "no";
  if (S.page === "order") { c = orderPage(); crumbs = "Заказы › <b>№345934</b>"; act = "or"; }
  else if (S.page === "list") c = `<div class="h1">${t("title")}</div><div class="card">${S.role === "sup" ? `<div class="alert i mb0"><span class="ic">i</span><div><b>Support has no MVP admin items outside Yandex Go</b>ADM-07 arrives with Yandex Go (US-YG-1.11); complaints and disputes (ADM-04 – ADM-06) are release 2.</div></div>` : ""}${listHTML()}</div>`;
  else if (S.page === "target") c = target(S.target);
  else { c = `<div class="h1">Дашборд</div><div class="grid2"><div class="card"><h3>Продавцы на проверке</h3><p class="sub">2 заявки</p></div><div class="card"><h3>Товары на модерации</h3><p class="sub">14 товаров</p></div></div>`; act = "da"; crumbs = "<b>Дашборд</b>"; }
  $("#app").innerHTML = shell(act, crumbs, c); bind();
}
function openItem(k) { const it = S.items.find(i => i.key === k); it.read = true; S.dd = false; S.page = "target"; S.target = it.to; render(); }
function bind() {
  const b = $("#bell"); if (b) b.onclick = e => { e.stopPropagation(); S.dd = !S.dd; render(); };
  document.querySelectorAll(".ni").forEach(e => e.onclick = () => openItem(+e.dataset.key));
  document.querySelectorAll("[data-tab]").forEach(e => e.onclick = () => { S.tab = e.dataset.tab; render(); });
  const ma = $("#markall"); if (ma) ma.onclick = e => { e.stopPropagation(); S.items.forEach(i => i.read = true); render(); };
  const sa = $("#seeall"); if (sa) sa.onclick = () => { S.dd = false; S.page = "list"; render(); };
  const bk = $("#back"); if (bk) bk.onclick = () => { S.page = "list"; render(); };
  document.querySelectorAll("[data-role]").forEach(e => e.onclick = () => { S.role = e.dataset.role; filt(); S.page = "list"; render(); });
  bindLang(render);
  const f = S.form;
  const fo = $("#fopen"); if (fo) fo.onclick = () => { S.form = { l: "uz", t: {}, x: {}, err: false }; render(); };
  if (f) {
    const sv = () => { f.t[f.l] = $("#ft").value; f.x[f.l] = $("#fx").value; };
    $("#ft").oninput = () => { sv(); $("#ft").nextElementSibling.textContent = $("#ft").value.length + " / 40"; f.err = false; refreshSend(); };
    $("#fx").oninput = () => { sv(); $("#fx").nextElementSibling.textContent = $("#fx").value.length + " / 130"; f.err = false; refreshSend(); };
    document.querySelectorAll("[data-fl]").forEach(e => e.onclick = () => { sv(); f.l = e.dataset.fl; render(); });
    $("#fsend").onclick = () => { sv(); if (!f.t.uz || !f.x.uz) { f.err = true; f.l = "uz"; render(); return; } S.form = null; render(); toast("Уведомление отправлено"); };
    $("#fcan").onclick = () => { sv(); if (Object.values(f.t).some(Boolean) || Object.values(f.x).some(Boolean)) { f.ask = true; render(); } else { S.form = null; render(); } };
    const d = $("#fdisc"); if (d) d.onclick = () => { S.form = null; render(); };
    const k = $("#fkeep"); if (k) k.onclick = () => { f.ask = false; render(); };
  }
  document.onclick = e => { if (S.dd && !e.target.closest(".bellwrap")) { S.dd = false; render(); } };
}
function refreshSend() { const f = S.form, b = $("#fsend"); const ok = f.t.uz && f.x.uz; b.style.opacity = ok ? "" : ".55"; b.setAttribute("aria-disabled", ok ? "false" : "true"); }
const roleSim = `<span>Signed in as:</span>${[["super", "Super admin"], ["mod", "Moderator"], ["sup", "Support"]].map(([k, l]) => `<span class="btn out" data-role="${k}">${l}</span>`).join("")}`;
const SC = [
  { label: "Super admin · bell with new seller, product to check, failed refund", apply: () => reset({ items: base(), dd: true, sim: roleSim }),
    notes: ["Admin bell in the top bar of the admin panel (old design) with the unread counter.", "MVP admin items: ADM-01 new seller, ADM-02 product to check, ADM-08 refund failed (US-AF-5.11-01).", "Click an item to open its target. Admin items can't be switched off.", "No admin notifications exist in code today."], src: "US-AF-5.11-01 AC1 – AC3, AC6" },
  { label: "Super admin · Notifications page", apply: () => reset({ items: base(), page: "list", sim: roleSim }),
    notes: ["Same behaviour as the buyer and seller centre: tabs, mark all as read, empty state, retention (US-AF-5.11-01 AC7).", "Menu item \"Уведомления\" — placement in the old admin menu is a proposal."], src: "US-AF-5.11-01 AC7" },
  { label: "Super admin · failed refund opens the order", apply: () => { reset({ items: base(), sim: roleSim }); S.page = "target"; S.target = { k: "refund" }; S.items[2].read = true; render(); },
    notes: ["ADM-08 goes to super admins only, with amount and error.", "Click opens the order with its refund block."], src: "US-AF-5.11-01 AC3" },
  { label: "Moderator · only moderation items", apply: () => reset({ items: base(), role: "mod", page: "list", sim: roleSim }),
    notes: ["A moderator gets ADM-01 and ADM-02, never ADM-08 (⚑ OQ-N15).", "A direct API call for another role's item returns HTTP 403 (AC4).", "Switch to Support: no MVP items (ADM-07 comes with Yandex Go)."], src: "US-AF-5.11-01 AC4, who can do what" },
  { label: "Moderator · seller already approved by someone else", apply: () => { reset({ items: base(), role: "mod", resolved: true, sim: roleSim }); S.page = "target"; S.target = { k: "seller" }; S.items[0].read = true; render(); },
    notes: ["Another moderator approved the seller before this one opened the item.", "The page opens as it is now: approved, no action buttons (NR-3, AC5)."], src: "US-AF-5.11-01 AC5" },
  { label: "Order page · \"Send notification\" to the seller (SOR-06)", apply: () => reset({ items: base(), page: "order", sim: `<span>Click \"Отправить уведомление\". Try sending with an empty Uzbek title.</span>` }),
    notes: ["Fixes D-08: the button now opens a form and sends SOR-06.", "Title 1–40 and text 1–130 characters per language, counters shown; Uzbek required; Russian / English fall back to Uzbek.", "\"Отправить\" looks disabled until the Uzbek title and text are filled; clicking anyway shows the Uzbek error.", "Cancel with text entered asks \"Discard the message?\".", "Success: form closes, toast \"Уведомление отправлено\". Recipients: owner + order roles of the order's branch.", "Open question: which admin roles may use this button."], src: "US-SF-10.1-01 AC10 and detailed requirements" },
];
harness({ title: "P2.2 Admin notifications", stories: "US-AF-5.11-01 · SOR-06", version: "1.0" }, SC);
