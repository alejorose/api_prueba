"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { NAV, LOGINS, UNIVERSITY } from "@/lib/nav";

export function Header() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    document.documentElement.classList.add("js");
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(null); setMobile(false); } };
    const onClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, []);

  const close = () => { setOpen(null); setMobile(false); };

  return (
    <header ref={ref} className="sticky top-0 z-50 border-b border-line bg-canvas/95 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-6 lg:h-[72px]">
        <Link href="/" aria-label="MIMOSA Diagnostics — home" onClick={close}>
          <Image src="/img/69653073b8f03c9e10569388_01_mimosa-logo_primary.png" alt="MIMOSA Diagnostics" width={2000} height={659} priority className="h-8 w-auto lg:h-9" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {NAV.map((g) =>
            g.items ? (
              <div key={g.label} className="relative">
                <button
                  className="flex min-h-11 items-center gap-1 rounded px-3 text-[15px] font-medium hover:text-accentink"
                  aria-expanded={open === g.label}
                  aria-controls={`m-${g.label}`}
                  onClick={() => setOpen(open === g.label ? null : g.label)}
                >
                  {g.label}
                  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={open === g.label ? "rotate-180" : ""}><path d="M1 3l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" /></svg>
                </button>
                {open === g.label && (
                  <ul id={`m-${g.label}`} className="absolute left-0 top-full mt-2 min-w-64 rounded-md border border-line bg-surface p-2 shadow-xl">
                    {g.items.map((i) => (
                      <li key={i.href}><Link href={i.href} onClick={close} className="block rounded px-3 py-2 text-[15px] hover:bg-canvas">{i.label}</Link></li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <Link key={g.label} href={g.href!} className="flex min-h-11 items-center rounded px-3 text-[15px] font-medium hover:text-accentink">{g.label}</Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <details className="relative hidden xl:block">
            <summary className="flex min-h-11 cursor-pointer list-none items-center rounded px-2 text-[15px] font-medium">Log in</summary>
            <ul className="absolute right-0 mt-2 w-44 rounded-md border border-line bg-surface p-2 shadow-xl">
              {LOGINS.map((l) => (<li key={l.label}><a className="block rounded px-3 py-2 hover:bg-canvas" href={l.href}>{l.label} Log In</a></li>))}
              <li><a className="block rounded px-3 py-2 hover:bg-canvas" href={UNIVERSITY}>MIMOSA University</a></li>
            </ul>
          </details>
          <Link href="/demo" className="btn btn-primary hidden sm:inline-flex" onClick={close}>Schedule a Demo</Link>
          <button className="flex h-11 w-11 items-center justify-center rounded border border-line lg:hidden" aria-expanded={mobile} aria-controls="mobile-nav" aria-label={mobile ? "Close menu" : "Open menu"} onClick={() => setMobile(!mobile)}>
            <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d={mobile ? "M4 4l12 12M16 4L4 16" : "M3 6h14M3 10h14M3 14h14"} stroke="currentColor" strokeWidth="1.6" fill="none" /></svg>
          </button>
        </div>
      </div>

      {mobile && (
        <nav id="mobile-nav" aria-label="Mobile" className="max-h-[calc(100dvh-4rem)] overflow-y-auto border-t border-line bg-canvas lg:hidden">
          <div className="wrap py-4">
            {NAV.map((g) => (
              <div key={g.label} className="border-b border-line py-3">
                {g.items ? (
                  <details>
                    <summary className="flex min-h-11 cursor-pointer items-center text-lg font-medium">{g.label}</summary>
                    <ul className="pb-2 pl-3">{g.items.map((i) => (<li key={i.href}><Link href={i.href} onClick={close} className="block py-2.5">{i.label}</Link></li>))}</ul>
                  </details>
                ) : (<Link href={g.href!} onClick={close} className="flex min-h-11 items-center text-lg font-medium">{g.label}</Link>)}
              </div>
            ))}
            <div className="flex flex-wrap gap-4 py-4 text-[15px]">
              {LOGINS.map((l) => (<a key={l.label} href={l.href} className="underline underline-offset-4">{l.label} Log In</a>))}
              <a href={UNIVERSITY} className="underline underline-offset-4">MIMOSA University</a>
            </div>
            <Link href="/demo" onClick={close} className="btn btn-primary w-full justify-center">Schedule a Demo</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
