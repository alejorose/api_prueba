"""Download every image referenced by site/src/content/pages.json into site/public/img and write
imgmap.json (CDN url -> local path) and imgdims.json (local path -> [w,h]).
Run from repo root: python3 -I scripts/fetch_assets.py"""
import json, re, os, urllib.request, urllib.parse
from PIL import Image

d = json.load(open('site/src/content/pages.json'))
urls = sorted({b['s'] for bs in d['pages'].values() for b in bs if b['t'] == 'img'} | {x for t, x in d['chrome'] if t == 'img'})
os.makedirs('site/public/img', exist_ok=True)
m, dims = {}, {}
for u in urls:
    name = re.sub(r'[^A-Za-z0-9._-]+', '_', urllib.parse.unquote(u.rsplit('/', 1)[1]))
    p = 'site/public/img/' + name
    try:
        if not os.path.exists(p):
            req = urllib.request.Request(u, headers={'User-Agent': 'Mozilla/5.0'})
            open(p, 'wb').write(urllib.request.urlopen(req, timeout=40).read())
        m[u] = '/img/' + name
        if not name.endswith('.svg'):
            try:
                dims['/img/' + name] = list(Image.open(p).size)
            except Exception:
                pass
    except Exception as e:
        print('skip', u, e)
json.dump(m, open('site/src/content/imgmap.json', 'w'), indent=1)
json.dump(dims, open('site/src/content/imgdims.json', 'w'))
print(len(m), 'images;', len(dims), 'with dimensions')
