"""Content preservation check: every visible string of every ORIGINAL page must exist in the REDESIGNED site.
 - 'page'     : found on the equivalent redesigned page
 - 'site'     : found elsewhere in the redesigned site (allowed for shared mega-menu/footer copy that was re-homed)
 - 'withheld' : deliberately not rendered (template placeholders / dev junk) -> flagged for MIMOSA review
 - 'MISSING'  : not found anywhere  -> must be zero (or justified)
Usage: python3 -I scripts/verify_content.py http://localhost:3100"""
import sys, json, re, csv, html, urllib.request
from bs4 import BeautifulSoup
BASE = sys.argv[1].rstrip('/')
d = json.load(open('site/src/content/pages.json'))
norm = lambda s: re.sub(r'[\s\u200b\u200d\u00a0]+', '', html.unescape(s)).lower()  # whitespace-insensitive, case-insensitive
CHROME = {norm(x.split('|')[0]) for t, x in d['chrome'] if t != 'img'}
WITHHELD = [r'^lorem ipsum', r'^duis cursus', r'^aenean faucibus', r'^success story \d', r'^case study 1$', r'^this is some text inside of a div block', r'^heading$',
            r'^svg definitions', r'^1990$', r'^©$',
            r'^precios$',  # stray Spanish label in original footer: flagged for review, not rendered
            r'^© mimosa diagnostics$',  # footer fragment: re-composed as "© <year> MIMOSA Diagnostics. All rights reserved."
            r'^read the research$']  # CTA of the Lorem-ipsum "Case Study 1" placeholder
STATE = [r'^thank you! your (demo request|submission) has been received', r'^oops! something went wrong']  # form result states: rendered by ApiForm after submit
SRC = ''.join(open(f, encoding='utf8').read() for f in __import__('glob').glob('site/src/**/*.tsx', recursive=True))
def path(k): return '/' if k == 'home' else '/' + k.replace('__', '/')
def text_of(url):
    try: raw = urllib.request.urlopen(url, timeout=30).read().decode('utf8', 'ignore')
    except Exception: return None
    soup = BeautifulSoup(raw, 'lxml')
    for t in soup(['script', 'style', 'noscript']): t.decompose()
    for t in soup.find_all(attrs={'placeholder': True}): t.append(' ' + t['placeholder'])  # form placeholders count as visible copy
    return norm(soup.get_text(' '))
site, per = [], {}
for k in d['pstrings']:
    per[k] = text_of(BASE + path(k)); site.append(per[k] or '')
ALL = ' '.join(site)
rows, tot = [], {'page': 0, 'site': 0, 'withheld': 0, 'MISSING': 0}
for k, strs in d['pstrings'].items():
    pt = per[k]
    for s in strs:
        n = norm(s)
        if not n or not re.sub(r'[\W_]', '', s): continue  # blank / pure symbol strings
        sp = re.sub(r'\s+', ' ', s).strip().lower()
        if any(re.search(w, sp) for w in WITHHELD): st = 'withheld'
        elif any(re.search(w, sp) for w in STATE) and s in SRC: st = 'page'
        elif pt and n in pt: st = 'page'
        elif n in ALL: st = 'site'
        else: st = 'MISSING'
        tot[st] += 1; rows.append((k, s, st))
with open('docs/content-matrix.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['source_page', 'source_string', 'status']); w.writerows(rows)
print(tot, 'pages without response:', [k for k, v in per.items() if v is None])
miss = [(k, s) for k, s, st in rows if st == 'MISSING']
seen = set()
for k, s in miss:
    if s in seen: continue
    seen.add(s); print('MISSING', k, '|', s[:120])
    if len(seen) > 60: break
