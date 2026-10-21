// ---- Notification catalogue helpers (texts from Notifications PRD v1.4, section 5) ----
// CAT is injected by the build: { "ORD-01": {g: settings group, r: release, cta, ch: web/mobile, pp: push/pull, en, uz, ru}, ... }
let LANG = "ru";
const SAMPLE = {
  order_no: "345934", amount: "1 250 000", seller_name: "Textile Plus", store: "Textile Plus", items: "12", hours_left: "12", time: "09:00",
  date: "26.10.2026", address: "Ташкент, ул. Бунёдкор, 12", reason: "Нет в наличии нужного размера", card_last4: "4417", minutes: "2", code: "482913",
  sender_name: "Азиз Каримов", buyer_name: "Азиз Каримов", message_preview: "Здравствуйте! Есть ли эта ткань в синем цвете?", product_name: "Ткань хлопок 150 см, синий",
  days: "3", hours: "24", return_no: "R-10482", next_step: "Отправьте товар продавцу в течение 3 дней.", problem: "Получатель не отвечает", provider: "Fargo",
  error: "Карта заблокирована", count: "3", role: "Менеджер по продажам", branch_name: "Чиланзар", device: "iPhone 15, Ташкент", qty: "5", unit: "шт.",
  title: "Проверьте заказ", message: "Покупатель просит связаться перед отправкой.", text: "Покупатель просит связаться перед отправкой.", user_name: "Азиз Каримов",
  method: "Fargo", eta: "14:30", courier_name: "Бахтиёр", car: "Chevrolet Damas, 01 A 123 BC", fee: "15 000", price: "48 000", old_price: "52 000", discount: "8",
  promo_code: "OPTOM10", rating: "5", review_preview: "Отличное качество, всё пришло вовремя.", period: "7 дней", plan: "Бизнес", balance: "120 000", campaign_name: "Осенняя распродажа",
  clicks: "340", impressions: "12 400", offer: "52 000", paid: "48 000", from_branch: "Юнусабад", target: "Все покупатели", errors: "2", ok: "148",
};
const NC = {
  title: { ru: "Уведомления", uz: "Bildirishnomalar", en: "Notifications" },
  nw: { ru: "Новые", uz: "Yangi", en: "New" }, rd: { ru: "Прочитанные", uz: "O‘qilgan", en: "Read" },
  all: { ru: "Отметить все как прочитанные", uz: "Barchasini o‘qilgan deb belgilash", en: "Mark all as read" },
  empty: { ru: "Уведомлений пока нет", uz: "Hozircha bildirishnomalar yo‘q", en: "No notifications yet" },
  seeall: { ru: "Все уведомления", uz: "Barcha bildirishnomalar", en: "All notifications" },
  err: { ru: "Не удалось загрузить уведомления. Попробуйте ещё раз.", uz: "Bildirishnomalarni yuklab bo‘lmadi. Qayta urinib ko‘ring.", en: "Couldn't load notifications. Try again." },
  retry: { ru: "Повторить", uz: "Qayta urinish", en: "Try again" },
  noacc: { ru: "У вас нет доступа к этой странице.", uz: "Bu sahifaga kirish huquqingiz yo‘q.", en: "You don't have access to this page." },
  now: { ru: "только что", uz: "hozirgina", en: "just now" }, ago: { ru: "мин назад", uz: "daqiqa oldin", en: "min ago" },
};
const t = k => NC[k][LANG];
const SAMPLE_L = {
  uz: { address: "Toshkent, Bunyodkor ko‘chasi, 12", reason: "Mahsulot qolmagan", role: "Savdo menejeri", next_step: "Mahsulotni 3 kun ichida sotuvchiga yuboring.", problem: "Qabul qiluvchi javob bermayapti", product_name: "Paxta mato 150 sm, ko‘k", message_preview: "Assalomu alaykum! Bu mato ko‘k rangda bormi?", error: "Karta bloklangan", device: "iPhone 15, Toshkent", unit: "dona", sender_name: "Aziz Karimov", buyer_name: "Aziz Karimov", user_name: "Aziz Karimov", period: "7 kun", target: "Barcha xaridorlar", branch_name: "Chilonzor" },
  en: { address: "Tashkent, Bunyodkor street, 12", reason: "Out of stock", role: "Sales manager", next_step: "Send the item to the seller within 3 days.", problem: "The recipient does not answer", product_name: "Cotton fabric 150 cm, blue", message_preview: "Hello! Do you have this fabric in blue?", error: "Card blocked", device: "iPhone 15, Tashkent", unit: "pcs", sender_name: "Aziz Karimov", buyer_name: "Aziz Karimov", user_name: "Aziz Karimov", period: "7 days", target: "All buyers", branch_name: "Chilanzar" },
};
const SAMPLE_ID = { "ACC-07": { ru: { reason: "Нарушение правил площадки" }, uz: { reason: "Platforma qoidalari buzilgan" }, en: { reason: "Breach of the platform rules" } } };
function val(k, v, lang, id) { if (v && v[k] != null) return v[k]; const si = SAMPLE_ID[id] && SAMPLE_ID[id][lang]; if (si && si[k] != null) return si[k]; const sl = SAMPLE_L[lang]; if (sl && sl[k] != null) return sl[k]; return SAMPLE[k]; }
function fillStr(s, v, lang, id) {
  s = s.replace(/\[if \{(\w+)\} > 0:\]\s*([^.]*\.)\s?/g, (m, k, sent) => { const x = parseFloat(String(val(k, v, lang, id) || "0").replace(/\s/g, "")); return x > 0 ? sent + " " : ""; });
  return s.replace(/\{(\w+)\}/g, (m, k) => { const x = val(k, v, lang, id); return x != null ? x : m; }).replace(/\s+$/, "");
}
function msg(id, v, lang) {
  const c = CAT[id]; if (!c) return { title: id, text: "" };
  const raw = fillStr(c[lang || LANG], v, lang || LANG, id);
  if (/^SMS:/.test(raw)) return { sms: true, title: "SMS", text: raw.replace(/^SMS:\s*/, "") };
  const i = raw.indexOf("\n");
  return i < 0 ? { title: raw, text: "" } : { title: raw.slice(0, i), text: raw.slice(i + 1) };
}
function grpIcon(id) {
  const g = (CAT[id] && CAT[id].g) || "";
  if (/^ADM/.test(id)) return ["a", ICON.bell];
  if (/reject|problem|fail|expired|blocked/i.test((CAT[id] || {}).trig || "")) return ["w", ICON.box];
  if (/message/i.test(g)) return ["m", ICON.msg];
  if (/Order/.test(g)) return ["o", ICON.box];
  return ["s", ICON.bell];
}
function relTime(min) { if (min < 1) return t("now"); if (min < 60) return min + " " + t("ago"); if (min < 60 * 24) { const d = new Date(Date.now() - min * 60000); return d.toTimeString().slice(0, 5); } const d = new Date(Date.now() - min * 60000); return d.toLocaleDateString("ru-RU"); }
// item: {id, v, min, read, key}
function itemHTML(it, opts = {}) {
  const m = msg(it.id, it.v); const [cls, ic] = grpIcon(it.id);
  const btns = opts.buttons && CAT[it.id] && /Button/.test(CAT[it.id].cta) ? `<div class="acts">${(CAT[it.id].cta.match(/"([^"]+)"/g) || []).slice(0, 2).map((b, i) => `<span class="btn sm ${i ? "out" : "soft"}">${esc(btnLabel(b.replace(/"/g, "")))}</span>`).join("")}</div>` : "";
  return `<div class="ni ${it.read ? "" : "unread"}" data-key="${it.key}"><span class="gi ${cls}">${ic}</span><div class="bd"><div class="tt">${esc(m.title)}</div><div class="tx">${esc(m.text)}</div>${btns}<div class="tm">${relTime(it.min)}</div></div>${it.read ? "" : '<span class="ud"></span>'}<span class="cid">${it.id}</span></div>`;
}
const BTN = { "Open order": { ru: "Открыть заказ", uz: "Buyurtmani ochish" }, "Pay now": { ru: "Оплатить", uz: "To‘lash" }, "Reply": { ru: "Ответить", uz: "Javob berish" }, "Confirm receipt": { ru: "Подтвердить получение", uz: "Qabul qilishni tasdiqlash" }, "Try again": { ru: "Повторить", uz: "Qayta urinish" }, "Contact support": { ru: "Написать в поддержку", uz: "Qo‘llab-quvvatlashga yozish" }, "Show QR code": { ru: "Показать QR-код", uz: "QR-kodni ko‘rsatish" }, "Route": { ru: "Маршрут", uz: "Yo‘nalish" }, "Open request": { ru: "Открыть заявку", uz: "Arizani ochish" }, "Add product": { ru: "Добавить товар", uz: "Mahsulot qo‘shish" }, "Edit application": { ru: "Изменить заявку", uz: "Arizani tahrirlash" }, "Edit product": { ru: "Изменить товар", uz: "Mahsulotni tahrirlash" }, "Appeal": { ru: "Обжаловать", uz: "Shikoyat qilish" },
  "Open product": { ru: "Открыть товар", uz: "Mahsulotni ochish" }, "Re-book": { ru: "Заказать снова", uz: "Qayta buyurtma" }, "Report a problem": { ru: "Сообщить о проблеме", uz: "Muammo haqida xabar berish" }, "Add stock": { ru: "Пополнить остаток", uz: "Qoldiqni to‘ldirish" }, "Track": { ru: "Отследить", uz: "Kuzatish" }, "Track order": { ru: "Отследить заказ", uz: "Buyurtmani kuzatish" }, "Delivery settings": { ru: "Настройки доставки", uz: "Yetkazib berish sozlamalari" }, "Add to cart": { ru: "В корзину", uz: "Savatga" }, "Top up": { ru: "Пополнить", uz: "To‘ldirish" }, "Renew": { ru: "Продлить", uz: "Uzaytirish" }, "Change password": { ru: "Сменить пароль", uz: "Parolni o‘zgartirish" }, "Read the offer": { ru: "Читать оферту", uz: "Ofertani o‘qish" }, "Order again": { ru: "Заказать снова", uz: "Yana buyurtma berish" }, "Find similar": { ru: "Похожие товары", uz: "O‘xshash mahsulotlar" }, "Leave a review": { ru: "Оставить отзыв", uz: "Sharh qoldirish" }, "Open receipt": { ru: "Открыть чек", uz: "Chekni ochish" }, "Decide": { ru: "Принять решение", uz: "Qaror qabul qilish" }, "Open chat": { ru: "Открыть чат", uz: "Chatni ochish" }, "View result": { ru: "Смотреть результат", uz: "Natijani ko‘rish" }, "Edit": { ru: "Изменить", uz: "Tahrirlash" }, "Statistics": { ru: "Статистика", uz: "Statistika" }, "Go to cart": { ru: "Перейти в корзину", uz: "Savatga o‘tish" }, "Shop now": { ru: "За покупками", uz: "Xarid qilish" } };
function btnLabel(en) { return LANG === "en" ? en : (BTN[en] && BTN[en][LANG]) || en; }
function firstBtn(id) { const c = CAT[id]; const m = c && c.cta.match(/"([^"]+)"/); return m ? btnLabel(m[1]) : ""; }
let popT;
function popup(id, v, onOpen) {
  const old = $(".npop"); if (old) old.remove();
  const m = msg(id, v); const [cls, ic] = grpIcon(id); const b = firstBtn(id);
  const el = document.createElement("div"); el.className = "npop";
  el.innerHTML = `<span class="gi ${cls}" style="width:40px;height:40px;border-radius:50%;display:grid;place-items:center;flex:none">${ic.replace("<svg", '<svg width="20" height="20" fill="none" stroke-width="1.7" stroke="currentColor"')}</span><div style="flex:1;min-width:0;padding-right:10px"><b style="display:block">${esc(m.title)}</b><div style="color:var(--ink-2);margin-top:2px">${esc(m.text)}</div>${b ? `<span class="btn sm soft mt8">${esc(b)}</span>` : ""}</div><span class="x">×</span><span class="bar"></span>`;
  document.body.append(el);
  el.querySelector(".x").onclick = e => { e.stopPropagation(); el.remove(); };
  el.onclick = () => { el.remove(); onOpen && onOpen(); };
  clearTimeout(popT); popT = setTimeout(() => el.remove(), 5000);
}
const langBox = () => `<div class="lbox">${["ru", "uz", "en"].map(l => `<span data-lang="${l}" class="${LANG === l ? "on" : ""}">${l.toUpperCase()}</span>`).join("")}</div>`;
function bindLang(rerender) { document.querySelectorAll("[data-lang]").forEach(e => e.onclick = () => { LANG = e.dataset.lang; rerender(); }); }
