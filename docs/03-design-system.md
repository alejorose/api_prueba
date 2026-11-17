# Design System — "Spectrum" (selected direction: A + audience/evidence tools from C)

Source of truth in code: `site/src/app/globals.css` (tokens, type scale, grid, buttons, focus) and `site/src/components/`.

## Identity (preserved)
Logo (12‑petal flower + wordmark, primary & white variants) is used unmodified. Brand colours were read from the live CSS/logo, so the provisional art‑direction palette was **replaced by real brand values** where they differ.

## Tokens
| Token | Value | Use / note |
|---|---|---|
| `--canvas` | `#F8F8F5` | page background |
| `--surface` | `#FFFFFF` | cards, panels |
| `--ink` | `#151B26` | text (brand near‑black, from site CSS) |
| `--ink-2` | `#4F5B66` | secondary text, 7:1 on canvas |
| `--navy` / `--navy-2` | `#151B26` / `#1D2736` | "invisible" (near‑infrared) sections |
| `--line` | `#E0E6E8` | hairlines (brand border grey from site CSS) |
| `--accent` | `#FF6B50` | brand coral — **fills and display only** (2.9:1 on white) |
| `--accent-ink` | `#B8400F` | accent as *text* on light (5.6:1) |
| `--brand-amber` | `#FFA330` | logo petal; spectrum rule |
| `--nir` | `#6AB8C8` | cool UI accent for "invisible" moments. **Never used to encode clinical data** |
| `--focus` | `#1A5FD0` (white on dark) | 3px focus ring, offset 3px |

Clinical colour scales (oximetry/thermal) appear **only inside official MIMOSA images**, with their original labels; the site palette is never applied to them.

## Typography
Geist Sans (UI/body/display) + Geist Mono (labels), self‑hosted via the `geist` package (no third‑party font request). Brand wordmark is a geometric sans; the old site loads Poppins/Montserrat/Ivy Presto — **final brand font to be confirmed by MIMOSA**. Fluid scale: display 44→104px, h1 36→76, h2 30→56, h3 22→36, h4 18→22, body 16→19, label 12px mono uppercase. Measure ≤ 68ch.

## Layout
12 / 6 / 4 column grid (`.grid12`), 1440px max, gutter `clamp(16px,4vw,40px)`, 4/8px spacing, section rhythm `clamp(64px, 9vw, 144px)`.

## Components (implemented)
| Component | File | Variants / states |
|---|---|---|
| Header + mega‑nav + mobile nav | `Header.tsx` | disclosure menus (`aria-expanded`), Esc closes, sticky, login menu |
| Footer | `Footer.tsx` | dark, full sitemap |
| Buttons | `.btn-primary/-dark/-ghost` | hover, focus, `aria-busy`, disabled; ≥48px |
| Imaging Explorer | `ImagingExplorer.tsx` | ARIA tabs (arrow/Home/End), magnified official image, honest "to be supplied" state |
| Workflow | `Workflow.tsx` | 4 steps, alternating layout, no JS required |
| Testimonials | `Testimonials.tsx` | figure/blockquote/figcaption |
| Evidence Explorer | `ResourceExplorer.tsx` | live search, category filter, grouped sections, `aria-live` count, external links announced |
| Forms | `ApiForm.tsx` | labels, required, honeypot, sending / error / success; never fakes success |
| Prose/Table renderer | `[...slug]/page.tsx` | headings (no skipped levels), lists, tables, inline links, images with intrinsic size |
| Spectrum rule | `.spectrum-rule` | decorative, carries no data |

Not built as separate components yet: comparison view, tabs/accordion primitives beyond the above, publication‑card variants per type, loading skeletons.

## Motion
CSS only (`.reveal`, 700ms ease). Zero scroll‑hijacking. `prefers-reduced-motion` disables all animation and transitions. Content is visible without JS.
