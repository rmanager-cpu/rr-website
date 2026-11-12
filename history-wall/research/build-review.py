"""Build the portable editorial review from catalog.json and the real Wall photos."""
import base64
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = json.loads((ROOT / 'catalog.json').read_text())
CONTEXT = json.loads((ROOT / 'context.json').read_text())
ESC = html.escape
LABELS = {
    'documented': 'Documented detail',
    'partially_documented': 'Partial history',
    'needs_local_history': 'Needs local story',
}


def paras(text):
    if isinstance(text, list):
        return ''.join(paras(part) for part in text)
    return ''.join(f'<p>{ESC(part)}</p>' for part in text.split('\n\n') if part.strip())


def bullets(items):
    return '<ul>' + ''.join(f'<li>{ESC(item)}</li>' for item in items) + '</ul>'


def links(items):
    out = []
    for item in items:
        if isinstance(item, str):
            url, label = item, item
        else:
            url = item.get('url', item.get('path', ''))
            label = item.get('title', item.get('label', url))
        if url.startswith(('https://', 'http://')):
            out.append(f'<li><a href="{ESC(url, quote=True)}" target="_blank" rel="noreferrer">{ESC(label)}</a></li>')
        elif label:
            out.append(f'<li>{ESC(label)}</li>')
    return '<ul class="sources">' + ''.join(out) + '</ul>' if out else ''


cards = []
for frame in DATA['frames']:
    photo = ROOT.parent / 'public' / 'frames' / (frame['id'] + '.webp')
    image = base64.b64encode(photo.read_bytes()).decode()
    label = f"No. {frame['tag']}" if frame.get('tag') else 'Unnumbered frame'
    status = frame['identification_status']
    searchable = json.dumps(frame, ensure_ascii=False).lower()
    date = frame.get('known_date') or 'Date not established'
    if isinstance(date, dict):
        date = json.dumps(date, ensure_ascii=False)
    cards.append(f'''<article id="{ESC(frame['id'])}" data-status="{ESC(status)}" data-search="{ESC(searchable, quote=True)}">
      <figure><img src="data:image/webp;base64,{image}" alt="{ESC(frame['title'], quote=True)}" loading="lazy"></figure>
      <div class="card-body"><div class="overline">{ESC(label)} <span class="badge {ESC(status)}">{LABELS[status]}</span></div>
      <h2>{ESC(frame['title'])}</h2><p class="date">{ESC(str(date))}</p>
      <details {'open' if status != 'needs_local_history' else ''}><summary>Draft story and evidence</summary>
      <div class="story">{paras(frame['draft_history'])}</div>
      <h3>What the photograph establishes</h3>{bullets(frame['visible_evidence'])}
      <h3>Still to establish</h3>{bullets(frame['open_questions'])}
      <h3>Sources</h3><p class="muted">The photographed frame is the primary visual source. Source image references are retained in catalog.json.</p>{links(frame.get('sources', []))}
      <p class="muted">Record: {ESC(frame['id'])}</p></details></div>
    </article>''')

findings = ''.join(f'<section><h3>{ESC(item["title"])}</h3>{paras(item["text"])}{links(item["sources"])}</section>' for item in CONTEXT['findings'])
page = '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Wall — history drafts</title><style>
:root{color-scheme:light;--ink:#28291f;--green:#244b3d;--muted:#636758;--paper:#f6f3eb;--line:#d9d6ca}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.65 system-ui,sans-serif}header,main,.controls{max-width:1200px;margin:auto;padding:28px}header{padding-top:55px}h1{font:clamp(38px,6vw,66px)/1.08 Georgia,serif;margin:10px 0 22px}h2{font:28px/1.2 Georgia,serif;margin:12px 0}h3{font-size:16px;margin-top:24px}.eyebrow,.overline{text-transform:uppercase;letter-spacing:.09em;font-size:12px;font-weight:700}.lead{max-width:780px;font-size:18px}.muted,.date{color:var(--muted);font-size:14px}.date{margin:8px 0}a{color:var(--green);text-underline-offset:3px;overflow-wrap:anywhere}.intro{border:1px solid var(--line);background:#fffdf7;padding:18px 22px;border-radius:12px}.intro summary{font-weight:650}.controls{position:sticky;top:0;z-index:1;background:var(--paper);border-bottom:1px solid var(--line);display:flex;gap:12px;align-items:end;flex-wrap:wrap;padding-top:14px;padding-bottom:14px}label{font-size:13px;display:flex;flex-direction:column;gap:4px}input,select,button{font:inherit;min-height:44px;border:1px solid #a2a896;border-radius:6px;background:white;color:var(--ink);padding:8px 12px}input{width:min(390px,75vw)}button,summary{cursor:pointer}button:hover{background:#e4e9df}:focus-visible{outline:3px solid #ca7a20;outline-offset:3px}#count{margin-left:auto;font-size:14px}main{padding-top:20px}article{display:grid;grid-template-columns:280px 1fr;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fffdf7;margin-bottom:24px;scroll-margin-top:180px}article[hidden]{display:none}figure{margin:0;background:#23231e;padding:16px;display:flex;align-items:flex-start;justify-content:center}figure img{width:100%;height:auto;max-height:350px;object-fit:contain;position:sticky;top:140px}.card-body{padding:26px}.badge{display:inline-block;letter-spacing:0;text-transform:none;margin-left:8px;border-radius:4px;background:#eee8dc;padding:3px 7px}.badge.documented{background:#d9eadb}.badge.partially_documented{background:#f1e1ba}.story{border-top:1px solid var(--line);margin-top:16px}.sources{font-size:13px}li{margin-bottom:7px}details>summary{padding:8px 0;color:var(--green)}footer{max-width:1200px;margin:auto;padding:28px;color:var(--muted)}@media(max-width:680px){header,main,.controls{padding-left:16px;padding-right:16px}article{grid-template-columns:1fr}figure img{max-height:260px;position:static}.card-body{padding:20px}.controls{position:static}#count{margin-left:0}input{width:100%}}@media print{.controls,button{display:none}header{padding-top:10px}article{break-inside:avoid;grid-template-columns:180px 1fr}figure img{position:static}body{background:white}a{color:inherit}}
</style></head><body><header><div class="eyebrow">River Ranch · Editorial review · November 12, 2026</div><h1>The stories behind the Wall</h1><p class="lead">A draft record for every active frame. Readable captions and dated documents establish some stories; the unnamed people and occasions still need local knowledge.</p><p>These drafts have not been added to the public site. “Documented detail” means a specific detail is sourced, not that the whole story is complete.</p><details class="intro"><summary>Research findings and dates to reconcile</summary>''' + findings + '<h3>Open research issues</h3>' + bullets(CONTEXT['unresolved_context']) + '''</details></header>
<div class="controls"><label>Find a frame<input id="search" type="search" placeholder="Photo number, name, place or object"></label><label>Research status<select id="status"><option value="all">All frames</option><option value="documented">Documented detail</option><option value="partially_documented">Partial history</option><option value="needs_local_history">Needs local story</option></select></label><button id="expand" type="button">Expand all stories</button><span id="count" role="status" aria-live="polite"></span></div>
<main>''' + ''.join(cards) + '''</main><footer>Scope: the 63 active frames on the main Wall. The archived corner and poster walls are outside this pass. Photographs are unchanged; this review embeds their existing web close-ups for offline use.</footer>
<script>const cards=[...document.querySelectorAll('article')],search=document.querySelector('#search'),status=document.querySelector('#status'),count=document.querySelector('#count');function filter(){const q=search.value.trim().toLowerCase();let shown=0;for(const c of cards){c.hidden=!(c.dataset.search.includes(q)&&(status.value==='all'||c.dataset.status===status.value));if(!c.hidden)shown++}count.textContent=shown+' of '+cards.length+' frames'}search.addEventListener('input',filter);status.addEventListener('change',filter);document.querySelector('#expand').addEventListener('click',e=>{const expand=e.target.textContent.startsWith('Expand');for(const c of cards)if(!c.hidden)c.querySelector('details').open=expand;e.target.textContent=expand?'Collapse all stories':'Expand all stories'});window.addEventListener('beforeprint',()=>{document.querySelectorAll('details').forEach(d=>d.open=true)});filter();</script></body></html>'''
(ROOT / 'index.html').write_text(page)
print(f"Wrote {len(cards)} frame records to {ROOT / 'index.html'}")
