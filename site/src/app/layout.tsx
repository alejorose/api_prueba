import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "MIMOSA Diagnostics | Making the Invisible Visible", template: "%s | MIMOSA Diagnostics" },
  description: "Design proposal — redesigned experience for MIMOSA Diagnostics. All clinical copy is verbatim from the original site.",
  robots: { index: false, follow: false }, // proposal build: do not index
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
