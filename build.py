import json, os
SRC = "/home/claude/nt-proto/src/"
cat = json.load(open("/home/claude/nt-proto/src/cat.json"))
CAT = {k: {"g": v["Settings group"], "r": v["Release"], "cta": v["CTA / link"], "ch": v["Web / Mobile"], "pp": v["Push / Pull"], "oc": v["Other channel"], "trig": v["Trigger"], "en": v["EN"], "uz": v["UZ"], "ru": v["RU"]} for k, v in cat.items()}
css = open(SRC + "base.css").read() + open(SRC + "notif.css").read()
harness = open(SRC + "harness.js").read()
notif = open(SRC + "notif.js").read()
FOOT = '<p style="text-align:center;color:#8b9189;font-size:11.5px;margin:18px 0 28px">Optom.uz · clickable prototype for the Notifications user stories (epic US-BF-8.0) · texts from Notifications PRD v1.4 · example data only. Where a prototype differs from the acceptance criteria in Confluence, the acceptance criteria win.</p>'
PAGES = [
    ("p2-1-notification-centre.html", "P2.1 Notification centre", "p21.js"),
    ("p2-2-admin-inbox.html", "P2.2 Admin notifications", "p22.js"),
    ("p2-3-push-gallery.html", "P2.3 Push, pop-up and SMS gallery", "p23.js"),
]
for fn, title, js in PAGES:
    html = f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{css}</style></head><body>
<div id="app"></div>{FOOT}
<script>{harness}
const CAT = {json.dumps(CAT, ensure_ascii=False)};
{notif}
{open(SRC + js).read()}
</script></body></html>'''
    open("/home/claude/nt-proto/" + fn, "w").write(html)
open("/home/claude/nt-proto/index.html", "w").write('''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Optom.uz notification prototypes</title>
<style>body{font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:760px;margin:40px auto;padding:0 16px;color:#1b1c1f}a{color:#00a028}li{margin:8px 0}</style></head><body>
<h1>Optom.uz · Notification prototypes</h1><p>Clickable HTML prototypes for the Notifications user stories (epic US-BF-8.0). Texts come from Notifications PRD v1.4. Example data only. The acceptance criteria in Confluence are the source of truth.</p>
<ul><li><a href="p2-1-notification-centre.html">P2.1 Notification centre: buyer website, seller cabinet, buyer and seller apps</a> (16 scenarios)</li>
<li><a href="p2-2-admin-inbox.html">P2.2 Admin panel: notification inbox and "Send notification" on an order</a> (6 scenarios)</li>
<li><a href="p2-3-push-gallery.html">P2.3 Push, pop-up and SMS gallery with length check</a> (12 scenarios)</li></ul>
<p>Open a specific scenario with <code>?s=N</code> (N starts at 0).</p></body></html>''')
open("/home/claude/nt-proto/README.md", "w").write("# Optom.uz notification prototypes\n\nClickable HTML prototypes P2.1–P2.3 for the Notifications user stories (epic US-BF-8.0), published with GitHub Pages and embedded in the Confluence user story pages.\n\nTexts: Notifications PRD v1.4. Source of truth for requirements: the Confluence story pages. Example data only, no real customer data.\n\nBuilt from `src/` with `build.py`.\n")
open("/home/claude/nt-proto/robots.txt", "w").write("User-agent: *\nDisallow: /\n")
open("/home/claude/nt-proto/.nojekyll", "w").write("")
print("built", [p[0] for p in PAGES])
