import Link from "next/link";
import Image from "next/image";
import { NAV } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="on-dark bg-navy text-white">
      <div className="spectrum-rule" aria-hidden="true" />
      <div className="wrap section !pb-10">
        <div className="grid12">
          <div className="col-span-4 sm:col-span-6 lg:col-span-4">
            <Image src="/img/69653088114f6ba6b53447d3_01_mimosa-logo_primary_white_.png" alt="MIMOSA Diagnostics" width={2000} height={659} className="h-10 w-auto" />
            <p className="mt-6 text-white/80">Making the Invisible... Visible</p>
            <Link href="/demo" className="btn btn-primary mt-8">Schedule a Demo</Link>
          </div>
          <nav aria-label="Footer" className="col-span-4 grid grid-cols-2 gap-8 sm:col-span-6 lg:col-span-8 lg:grid-cols-3">
            {NAV.filter((g) => g.items).map((g) => (
              <div key={g.label}>
                <h2 className="t-label text-white/60">{g.label}</h2>
                <ul className="mt-4">
                  {g.items!.map((i) => (<li key={i.href}><Link className="flex min-h-11 items-center text-white/90 hover:text-white hover:underline" href={i.href}>{i.label}</Link></li>))}
                </ul>
              </div>
            ))}
            <div>
              <h2 className="t-label text-white/60">Reimbursement Info</h2>
              <ul className="mt-4"><li><Link className="flex min-h-11 items-center hover:underline" href="/reimbursement">Reimbursement Info</Link></li></ul>
            </div>
          </nav>
        </div>
        <div className="mt-16 flex flex-wrap items-center justify-between gap-4 border-t border-white/15 pt-6 text-sm text-white/70">
          <p>© {new Date().getFullYear()} MIMOSA Diagnostics. All rights reserved. <Link href="/privacy-policy" className="underline underline-offset-4">Privacy Policy.</Link></p>
          <p className="flex gap-5">
            <a className="underline underline-offset-4" href="https://www.linkedin.com/company/mimosadiagnostics/">LinkedIn</a>
            <a className="underline underline-offset-4" href="https://www.facebook.com/mimosadiagnostics">Facebook</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
