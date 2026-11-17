import data from "@/content/pages.json";
import imgmap from "@/content/imgmap.json";
import dims from "@/content/imgdims.json";

export type Block = { t: string; x: string; r?: string; h?: string; s?: string; cells?: string[]; rc?: string[] };
export const pages = data.pages as Record<string, Block[]>;
export const titles = data.titles as Record<string, string>;
const chrome = data.chrome as [string, string][];

const norm = (s: string) => s.replace(/\s+/g, " ").trim();
/** Every string that exists in the original site (body + chrome). */
const SOURCE = new Set<string>();
Object.values(pages).forEach((bs) => bs.forEach((b) => b.x && SOURCE.add(norm(b.x))));
chrome.forEach(([, x]) => SOURCE.add(norm(x.split("|")[0])));
(data as unknown as { strings: string[] }).strings.forEach((x) => SOURCE.add(x));
/** Same as S() but restricted to the original mega-menu (chrome) copy — the text shown on the original home page. */
export function SC(prefix: string): string {
  const hit = chrome.map(([, x]) => norm(x.split("|")[0])).find((x) => x.startsWith(norm(prefix)));
  if (!hit) throw new Error(`Content-lock: no chrome string starts with "${prefix}"`);
  return hit;
}
/** Look up a full source string by its opening words. */
export function S(prefix: string): string {
  const hit = [...SOURCE].find((x) => x.startsWith(norm(prefix)));
  if (!hit) throw new Error(`Content-lock: no source string starts with "${prefix}"`);
  return hit;
}

/** Content lock: returns the string unchanged, and fails the build if it is not verbatim source copy. */
export function T(s: string): string {
  if (!SOURCE.has(norm(s))) throw new Error(`Content-lock violation, not in source: "${s}"`);
  return s;
}
export const localImg = (u: string) => (imgmap as Record<string, string>)[u] ?? u;
export const imgSize = (p: string) => (dims as Record<string, number[]>)[p];
/** Find a local image path by a substring of its original filename. */
export function asset(part: string): string {
  const hit = Object.values(imgmap as Record<string, string>).find((p) => p.includes(part));
  if (!hit) throw new Error(`asset not found: ${part}`);
  return hit;
}
export const slugOf = (p: string) => p.replace(/^\//, "").replace(/\//g, "__") || "home";
export const hasPage = (slug: string) => slug in pages;
export const isBlank = (s: string) => !s.replace(/[​‍‌\s]/g, "");
