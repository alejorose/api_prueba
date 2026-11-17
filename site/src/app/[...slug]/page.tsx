import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pages, titles, localImg, imgSize, isBlank, type Block } from "@/lib/content";
import { pathToKey, parse } from "@/lib/blocks";
import { ResourceExplorer } from "@/components/ResourceExplorer";

type G = Block & { rows?: string[][]; items?: Block[] };
/** Merge consecutive table-row blocks into one table block. */
function group(bs: Block[]): G[] {
  const out: G[] = [];
  for (const b of bs) {
    if (b.t === "row") {
      const last = out[out.length - 1];
      const cells = b.rc?.length ? b.rc : (b.cells ?? []);
      if (last?.t === "table") last.rows!.push(cells); else out.push({ t: "table", x: "", rows: [cells] });
    } else if (b.t === "li") {
      const last = out[out.length - 1];
      if (last?.t === "ul") last.items!.push(b); else out.push({ t: "ul", x: "", items: [b] });
    } else out.push(b);
  }
  return out;
}
const SPECIAL = new Set(["home", "demo", "contact-us"]);
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.keys(pages).filter((k) => !SPECIAL.has(k)).map((k) => ({ slug: k.split("__") }));
}
export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const key = pathToKey(slug);
  const t = titles[key]?.replace(/\s*\|.*$/, "") || pages[key]?.find((b) => b.t === "h1" && b.x)?.x;
  return { title: t || "MIMOSA Diagnostics" };
}

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const key = pathToKey(slug);
  if (!(key in pages) || SPECIAL.has(key)) notFound();
  const { cards, before, after } = parse(key);
  const sizes: Record<string, [number, number]> = {};
  cards.forEach((c) => { if (c.img) { const s = imgSize(c.img); if (s) sizes[c.img] = [s[0], s[1]]; } });

  return (
    <article className="wrap section">
      <div className="spectrum-rule mb-12 w-24" aria-hidden="true" />
      <Prose blocks={before} />
      {cards.length > 0 && <div className="mt-12"><ResourceExplorer cards={cards} sizes={sizes} /></div>}
      <Prose blocks={after} />
    </article>
  );
}

function Prose({ blocks: bl }: { blocks: Block[] }) {
  let lvl = 1; // semantic heading level, never skipping (visual size follows the original level)
  const H = (n: number) => { const l = Math.min(n, lvl + 1); lvl = l; return `h${l}` as "h1"; };
  return (
      <div className="prose-src">
        {group(bl).map((b, i) => {
          if (b.t === "table") {
            return (
              <div key={i} className="my-8 overflow-x-auto">
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <tbody>
                    {b.rows!.map((r, ri) => (
                      <tr key={ri} className={ri === 0 ? "bg-navy text-white" : "border-b border-line"}>
                        {r.map((c, ci) => (ri === 0 ? <th key={ci} scope="col" className="p-4 align-top font-semibold" dangerouslySetInnerHTML={{ __html: c }} /> : <td key={ci} className="p-4 align-top" dangerouslySetInnerHTML={{ __html: c }} />))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }
          if (b.t === "ul") return <ul key={i} className="my-6 max-w-[68ch] list-disc space-y-2 pl-6">{b.items!.map((li, k) => (li.r ? <li key={k} dangerouslySetInnerHTML={{ __html: li.r }} /> : <li key={k}>{li.x}</li>))}</ul>;
          if (b.t === "img") {
            const p = localImg(b.s!); const s = imgSize(p);
            if (!s || s[0] < 120 || /icon|floral|logo|flag/i.test(p)) return null;
            return (
              <figure key={i} className="my-10" style={{ maxWidth: Math.min(s[0], 880) }}>
                <Image src={p} alt={b.x} width={s[0]} height={s[1]} sizes="(min-width:1024px) 50vw, 92vw" priority={i < 4} className="h-auto w-full rounded-md" />
              </figure>
            );
          }
          if (b.t === "wrap" || (isBlank(b.x) && !b.r)) return null;
          const inner = b.r ? { dangerouslySetInnerHTML: { __html: b.r } } : { children: b.x };
          switch (b.t) {
            case "h1": { const C = H(1); return <C key={i} className="t-h1 mt-2 mb-6 max-w-[22ch]" {...inner} />; }
            case "h2": { const C = H(2); return <C key={i} className="t-h2 mt-16 mb-6 max-w-[28ch]" {...inner} />; }
            case "h3": { const C = H(3); return <C key={i} className="t-h3 mt-12 mb-4 max-w-[30ch]" {...inner} />; }
            case "h4": case "h5": case "h6": { const C = H(4); return <C key={i} className="t-h4 mt-8 mb-3" {...inner} />; }
            case "li": return <li key={i} className="ml-6 max-w-[68ch] list-disc" {...inner} />;
            case "blockquote": return <blockquote key={i} className="t-h4 my-8 max-w-[40ch] border-l-4 border-accent pl-6 !font-normal" {...inner} />;
            case "a": {
              const ext = /^https?:/.test(b.h ?? "");
              return <p key={i}><Link href={b.h ?? "#"} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={/demo/i.test(b.x) ? "btn btn-primary no-underline" : "font-semibold"}>{b.x}</Link></p>;
            }
            default: return <p key={i} {...inner} />;
          }
        })}
      </div>
  );
}
