import { pages, isBlank, localImg, type Block } from "./content";

export const keyToPath = (k: string) => "/" + k.replace(/__/g, "/");
export const pathToKey = (p: string[]) => p.join("__");
const PLACEHOLDER_TEXT = new Set(["This is some text inside of a div block.", "Heading"]);

export type Card = { href: string; img?: string; label?: string; title: string; cta?: string; group: string; extra?: string[] };

/** Split a page into leading prose blocks and CMS-style cards (Webflow collection items). */
export function parse(key: string) {
  const bs = (pages[key] ?? []).filter((b) => !(b.t === "img" && b.s?.includes("placeholder.")) && !PLACEHOLDER_TEXT.has(b.x));
  const cardMode = bs.filter((b) => b.t === "wrap" && !(b.h ?? "#").startsWith("#") && !(b.h ?? "").includes("cdn.prod.website-files")).length >= 3;
  const cards: Card[] = [];
  const rest: Block[] = [];
  let firstCardAt = -1;
  let group = "";
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i];
    if (cardMode && b.t === "wrap" && !(b.h ?? "#").startsWith("#")) {
      const c: Card = { href: b.h || "#", title: "", group };
      let j = i + 1;
      for (; j < bs.length && bs[j].t !== "wrap" && !/^h[13]$/.test(bs[j].t); j++) {
        const x = bs[j];
        if (x.t === "img" && !c.img) c.img = localImg(x.s!);
        else if (x.t === "p" && !c.label && !c.title) c.label = x.x;
        else if (/^h[2-6]$/.test(x.t) && !c.title) c.title = x.x;
        else if (x.t === "p" && c.title && !c.cta) c.cta = x.x;
        else if (x.t === "p" && c.title && c.cta) break;
        else if (x.x) (c.extra ??= []).push(x.x);
      }
      if (c.title) { if (firstCardAt < 0) firstCardAt = rest.length; cards.push(c); i = j - 1; continue; }
    }
    if (b.t === "h3" && !isBlank(b.x)) group = b.x;
    // the lone "Read the article" is the empty CMS-template CTA (flagged in review notes)
    if (cardMode && b.t === "p" && /^read the article$/i.test(b.x)) continue;
    rest.push(b);
  }
  // group headings that own cards are rendered by the explorer, not as loose prose
  const used = new Set(cards.map((c) => c.group).filter(Boolean));
  const at0 = firstCardAt < 0 ? rest.length : firstCardAt;
  const keep = (b: Block) => !(b.t === "h3" && used.has(b.x));
  const before = rest.slice(0, at0).filter(keep);
  const after = rest.slice(at0).filter(keep);
  return { cards, before, after, rest };
}
