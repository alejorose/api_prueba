"use client";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Card } from "@/lib/blocks";

export function ResourceExplorer({ cards, sizes }: { cards: (Card & { w?: number; h?: number })[]; sizes: Record<string, [number, number]> }) {
  const [q, setQ] = useState("");
  const [g, setG] = useState("All");
  const groups = useMemo(() => ["All", ...Array.from(new Set(cards.map((c) => c.group).filter(Boolean)))], [cards]);
  const list = cards.filter((c) => (g === "All" || c.group === g) && c.title.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <div>
      <div className="flex flex-wrap items-end gap-6">
        <div>
          <label htmlFor="rq" className="t-label block text-ink2">Search titles</label>
          <input id="rq" type="search" value={q} onChange={(e) => setQ(e.target.value)} className="mt-2 h-12 w-full min-w-64 rounded-md border border-line bg-surface px-4" />
        </div>
        {groups.length > 2 && (
          <fieldset>
            <legend className="t-label text-ink2">Category</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {groups.map((x) => (
                <button key={x} type="button" aria-pressed={g === x} onClick={() => setG(x)} className={`min-h-11 rounded-full border px-4 text-[15px] ${g === x ? "border-navy bg-navy text-white" : "border-line bg-surface"}`}>{x}</button>
              ))}
            </div>
          </fieldset>
        )}
      </div>
      <p className="t-label mt-6 text-ink2" role="status" aria-live="polite">{list.length} of {cards.length} resources</p>
      {Array.from(new Set(list.map((c) => c.group))).map((grp) => (
        <section key={grp || "_"} className="mt-12" aria-label={grp || undefined}>
          {grp && <h2 className="t-h3 mb-6">{grp}</h2>}
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.filter((c) => c.group === grp).map((c) => {
              const ext = /^https?:/.test(c.href);
              const s = c.img ? sizes[c.img] : undefined;
              return (
                <li key={c.href + c.title} className="flex flex-col overflow-hidden rounded-md border border-line bg-surface">
                  {c.img && s && <Image src={c.img} alt="" width={s[0]} height={s[1]} sizes="(min-width:1024px) 30vw, 90vw" className="aspect-[16/10] w-full border-b border-line object-cover object-top" />}
                  <div className="flex flex-1 flex-col p-6">
                    {c.label && <p className="t-label text-accentink">{c.label}</p>}
                    <h3 className="t-h4 mt-2">{c.title}</h3>
                    {c.extra?.map((x) => <p key={x} className="mt-2 text-[15px] text-ink2">{x}</p>)}
                    {c.cta && (
                      <a href={c.href} {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="mt-auto pt-6 font-semibold underline underline-offset-4">
                        {c.cta}<span className="sr-only">: {c.title}{ext ? " (opens in a new tab)" : ""}</span>
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      {list.length === 0 && <p className="mt-8 text-ink2">No resources match.</p>}
    </div>
  );
}
