"""Extract verbatim, structured content blocks from the crawled MIMOSA pages (content/source-html/*.html).

Output: site/src/content/pages.json with
  pages[key]   -> ordered blocks  {t, x, r?, h?, s?, cells?}
                  t: h1-h6 | p | li | blockquote | a (CTA link) | wrap (card link marker) | img | row (table row)
                  x: plain text, r: sanitized inline HTML (only when it carries links/emphasis/line breaks)
  chrome       -> blocks repeated on >=95% of pages (mega-menu, footer, forms) – separated from page bodies
  pstrings     -> every visible string per page (used by verify_content.py as the preservation oracle)
  strings      -> union of all strings (used by the T()/S() content-lock helpers)
Hidden Webflow elements (w-condition-invisible, w-dyn-hide, display:none) are not visible on the original site and are skipped."""
import re, json, glob, os, collections, html
from bs4 import BeautifulSoup, NavigableString, Tag

SRC = 'content/source-html'
HEAD = {'h1', 'h2', 'h3', 'h4', 'h5', 'h6'}
LEAF = HEAD | {'p', 'li', 'blockquote', 'figcaption', 'dt', 'dd', 'label', 'button', 'td', 'th'}
INLINE = {'span', 'b', 'strong', 'em', 'i', 'u', 'small', 'sup', 'sub', 'br', 'a', 'mark', 'abbr', 'font', 'code'}
HIDDEN = re.compile(r'w-condition-invisible|w-dyn-hide|w-dyn-bind-empty')


def norm(s):
    return re.sub(r'\s+', ' ', html.unescape(s.replace('‍', '').replace('​', ''))).strip()


def has_block(el):
    return any(isinstance(c, Tag) and (c.name not in INLINE or has_block(c)) for c in el.descendants if isinstance(c, Tag)) if isinstance(el, Tag) else False


def rich(el):
    """Sanitized inline HTML: text, <a href>, <strong>, <em>, <br>, <sup>, <sub> only."""
    return re.sub(r'(\s|\u200d|\u200b)+', ' ', _rich(el)).strip()


def _rich(el):
    out = []
    for c in el.children:
        if isinstance(c, NavigableString):
            out.append(html.escape(str(c)))
        elif isinstance(c, Tag):
            if c.name == 'br': out.append('<br>')
            elif c.name == 'a' and c.get('href'): out.append('<a href="%s">%s</a>' % (html.escape(c['href'], quote=True), _rich(c)))
            elif c.name in ('b', 'strong'): out.append('<strong>%s</strong>' % _rich(c))
            elif c.name in ('i', 'em'): out.append('<em>%s</em>' % _rich(c))
            elif c.name in ('sup', 'sub'): out.append('<%s>%s</%s>' % (c.name, _rich(c), c.name))
            elif c.name in ('img', 'svg', 'script', 'style'): continue
            else: out.append(rich(c))
    return re.sub(r'(\s|‍|​)+', ' ', ''.join(out)).strip()


def inline_block(t, el_or_nodes, links=True):
    """Build a block from an element (or list of inline nodes)."""
    if isinstance(el_or_nodes, Tag):
        holder = el_or_nodes
    else:
        holder = BeautifulSoup('<div></div>', 'lxml').div
        for n in el_or_nodes: holder.append(n.__copy__() if hasattr(n, '__copy__') else n)
    x = norm(holder.get_text(' ', strip=False))
    x = re.sub(r'\s+([,.;:!?])', r'\1', x)
    if not x: return None
    b = {'t': t, 'x': x}
    r = rich(holder)
    if re.search(r'<(a|strong|em|br|sup|sub)\b', r): b['r'] = r
    return b


def walk(el, out):
    if isinstance(el, NavigableString): return
    if not isinstance(el, Tag): return
    if el.name in ('script', 'style', 'noscript', 'svg', 'head'): return
    if HIDDEN.search(' '.join(el.get('class', []))) or re.search(r'display:\s*none', el.get('style', '') or ''): return
    n = el.name
    if n == 'img':
        src = el.get('src') or el.get('data-src')
        if src and not src.startswith('data:'): out.append({'t': 'img', 'x': norm(el.get('alt', '')), 's': src})
        return
    cls = ' '.join(el.get('class', []))
    if 'code-blox' in cls:  # Webflow div-grid table row
        cells = [norm(c.get_text(' ')) for c in el.find_all(recursive=False)]
        cells = [c for c in cells if c]
        if cells:
            r = [rich(c) for c in el.find_all(recursive=False)]
            out.append({'t': 'row', 'x': ' | '.join(cells), 'cells': cells, 'rc': r})
        return
    if n == 'a' and has_block(el):
        if el.get('href'): out.append({'t': 'wrap', 'x': '', 'h': el['href']})
        for c in el.children: walk(c, out)
        return
    if n == 'a':  # CTA link without block children
        b = inline_block('a', el)
        if b:
            if el.get('href'): b['h'] = el['href']
            out.append(b)
        for im in el.find_all('img'): walk(im, out)
        return
    if n in LEAF and not has_block(el):
        b = inline_block(n if n not in ('label', 'button', 'td', 'th', 'dt', 'dd', 'figcaption') else {'td': 'p', 'th': 'p', 'dt': 'h4', 'dd': 'p', 'figcaption': 'p'}.get(n, n), el)
        if b: out.append(b)
        for im in el.find_all('img'): walk(im, out)
        return
    # container: group consecutive inline children into paragraphs, recurse into block children
    buf = []

    def flush():
        nonlocal buf
        if buf:
            b = inline_block('p', buf)
            if b: out.append(b)
            buf = []
    for c in el.children:
        if isinstance(c, NavigableString):
            buf.append(NavigableString(str(c)))
        elif isinstance(c, Tag):
            if HIDDEN.search(' '.join(c.get('class', []))) or re.search(r'display:\s*none', c.get('style', '') or ''): continue
            if c.name in INLINE and c.name != 'a' and not has_block(c) and not c.find('img'):
                buf.append(c)
            else:
                flush(); walk(c, out)
    flush()


def blocks(path):
    soup = BeautifulSoup(open(path, encoding='utf8').read(), 'lxml')
    out = []
    walk(soup.body or soup, out)
    # collapse consecutive duplicates (Webflow desktop/mobile twins)
    res = []
    for b in out:
        if res and res[-1].get('x') == b.get('x') and res[-1]['t'] == b['t'] and b['t'] not in ('img',) and b.get('x'): continue
        res.append(b)
    return res


def strings(path):
    soup = BeautifulSoup(open(path, encoding='utf8').read(), 'lxml')
    for t in soup(['script', 'style', 'noscript', 'svg', 'head']): t.decompose()
    for t in soup.find_all(class_=HIDDEN): t.decompose()
    for t in soup.find_all(style=re.compile(r'display:\s*none')): t.decompose()
    # whole-element text so mixed inline content stays contiguous, plus individual nodes
    s = {norm(x) for x in soup.stripped_strings if norm(x)}
    for el in soup.find_all(['p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'a', 'div', 'label']):
        if not has_block(el):
            x = norm(el.get_text(' '))
            if x: s.add(re.sub(r'\s+([,.;:!?])', r'\1', x))
    return sorted(s)


files = sorted(glob.glob(SRC + '/*.html'))
data = {os.path.basename(f)[:-5]: blocks(f) for f in files}
allstrings = {os.path.basename(f)[:-5]: strings(f) for f in files}


def key(b):
    return (b['t'], (b['x'] if b['t'] != 'img' else b['s']) + ('|' + b.get('h', '') if b['t'] == 'wrap' else ''))


cnt = collections.Counter()
for k, bs in data.items():
    for kk in {key(b) for b in bs}: cnt[kk] += 1
N = len(data)
chrome = {kk for kk, c in cnt.items() if c >= 0.95 * N}
def strip_chrome(bs):
    """Drop chrome blocks. A wrap (card link) whose key is chrome is kept only if the block it wraps is body content."""
    out = []
    for i, b in enumerate(bs):
        if b['t'] == 'wrap':
            nxt = [x for x in bs[i + 1:i + 6] if x['t'] not in ('img', 'wrap')][:1]
            if key(b) in chrome and (not nxt or key(nxt[0]) in chrome): continue
            out.append(b)
        elif key(b) not in chrome: out.append(b)
    return out
pages = {k: strip_chrome(bs) for k, bs in data.items()}
titles = {}
for f in files:
    m = re.search(r'<title>(.*?)</title>', open(f, encoding='utf8').read(), re.S)
    titles[os.path.basename(f)[:-5]] = html.unescape(m.group(1)).strip() if m else ''
json.dump({'pstrings': allstrings, 'strings': sorted({x for v in allstrings.values() for x in v}), 'titles': titles, 'pages': pages,
           'chrome': sorted([list(c) for c in chrome])}, open('site/src/content/pages.json', 'w'), ensure_ascii=False, indent=1)
print(N, 'pages;', len(chrome), 'chrome blocks')
for k in ['home', 'mimosa-pro', 'demo', 'reimbursement', 'about-us']: print(k, len(pages[k]))
