"use client";
import Image from "next/image";
import { useId, useRef, useState } from "react";

export type Mode = { id: string; label: string; crop?: { x: number; y: number; z: number }; official: boolean; alt: string };

/** Interactive explorer for the original "4 INSIGHTS in 1 CAPTURE" block.
 *  Imagery: the official MIMOSA portal composite only. Modes with no official example in the public site assets
 *  are shown as such — nothing is fabricated or simulated. */
export function ImagingExplorer({ src, w, h, heading, sentence, modes, intro }: {
  src: string; w: number; h: number; heading: string; sentence: string; intro: string; modes: Mode[];
}) {
  const [i, setI] = useState(0);
  const base = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const m = modes[i];
  const onKey = (e: React.KeyboardEvent) => {
    let n = i;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (i + 1) % modes.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (i - 1 + modes.length) % modes.length;
    else if (e.key === "Home") n = 0; else if (e.key === "End") n = modes.length - 1; else return;
    e.preventDefault(); setI(n); refs.current[n]?.focus();
  };
  const c = m.crop ?? { x: 50, y: 50, z: 1 };
  return (
    <div className="grid12 items-start">
      <div className="col-span-4 sm:col-span-6 lg:col-span-5">
        <p className="t-label text-accentink">{heading}</p>
        <h2 className="t-h2 mt-4">{heading}</h2>
        <p className="measure mt-6 text-ink2">{sentence}</p>
        <div role="tablist" aria-label={heading} onKeyDown={onKey} className="mt-10 grid grid-cols-2 gap-2">
          {modes.map((x, n) => (
            <button key={x.id} ref={(el) => { refs.current[n] = el; }} role="tab" id={`${base}-t${n}`} aria-selected={n === i} aria-controls={`${base}-p`} tabIndex={n === i ? 0 : -1}
              onClick={() => setI(n)}
              className={`min-h-14 rounded-md border px-4 py-3 text-left text-[15px] font-medium transition-colors ${n === i ? "border-navy bg-navy text-white" : "border-line bg-surface hover:border-ink"}`}>
              <span className="t-label block opacity-60">0{n + 1}</span>{x.label}
            </button>
          ))}
        </div>
        <p className="mt-8 text-ink2">{intro}</p>
      </div>

      <div className="col-span-4 sm:col-span-6 lg:col-span-7" id={`${base}-p`} role="tabpanel" aria-labelledby={`${base}-t${i}`}>
        <div className="relative aspect-[1920/1198] overflow-hidden rounded-md border border-line bg-white">
          <Image src={src} alt={m.alt} width={w} height={h} sizes="1920px" quality={90}
            className="absolute inset-0 h-full w-full object-contain transition-transform duration-700 ease-out motion-reduce:transition-none"
            style={{ transform: `scale(${c.z}) translate(${50 - c.x}%, ${50 - c.y}%)` }} />
        </div>
        <p className="t-label mt-3 text-ink2" role="status">
          {m.official ? "Official MIMOSA Pro web-portal image · magnified detail" : "Official example image for this mode to be supplied by MIMOSA · full portal view shown"}
        </p>
      </div>
    </div>
  );
}
