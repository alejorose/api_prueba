# QA results, UX plan, asset plan, limitations

## Test results (production build, local server, Chromium via Playwright; 2026‑11‑17)
| Check | Result |
|---|---|
| Pages built | 63 static routes (home, 57 original pages incl. 26 posts, demo, contact, 404) |
| Internal links (58 unique, crawled from 32 rendered pages) | 0 broken |
| Console errors / uncaught exceptions | 0 on 32 pages |
| Broken images | 0 |
| axe‑core 4.10 (WCAG 2.0/2.1/2.2 A+AA tags) | **0 violations** on 32 pages (all non‑post pages + 2 posts). Automated tools cover ~⅓ of WCAG; no manual screen‑reader pass done |
| Keyboard | Imaging Explorer tabs verified (arrows); nav disclosure/Esc by design; not exhaustively tested on every page |
| Horizontal overflow | none at 390, 820, 1440 px on tested pages |
| Content preservation | 0 missing strings (see `04-content-preservation.md`) |
| **Demo form** | Native validation blocks invalid submit. **No backend configured → shows the original error text + "no form backend connected yet"** (HTTP 501), never a fake success. With `FORM_ENDPOINT_DEMO` set to a local mock, payload was delivered and the original success text appeared. Real HubSpot not tested |
| Lighthouse 12 (mobile emulation, simulated slow‑4G, local prod server — **lab data, not field data**) | Home: Perf 94 / A11y 100 / BP 100 · `/mimosa-pro`: Perf 93 / A11y 100 (after fixing heading order) · Publications: Perf 94 / A11y 100 |
| Core Web Vitals (lab) | **CLS 0 ✔ · TBT 40–120 ms ✔ · LCP 3.0–3.2 s ✘ (target ≤ 2.5 s)**. LCP is the 1920px hero/portal image under throttling; INP not measurable in lab. Next steps: ship smaller hero derivative, CDN with AVIF, preload. |
| SEO score 54–63 | intentional: proposal build sets `noindex` |

Not done: real‑device testing, Safari/Firefox, tablet‑specific layout review beyond screenshots, field Core Web Vitals, full Lighthouse on all pages.

## What is implemented vs the brief
**Built**: design tokens/system, responsive header/footer, new home (hero → problem → intro/uses → Imaging Explorer → science/features → clinical photography → testimonials → 4‑step workflow → care settings → evidence/resources/experts → CTA → about hub), every original page re‑rendered in the system (uses, care settings, reimbursement with CPT table, resources, posts, about, team, careers, investors, privacy), Evidence Explorer (search + categories) on every resource list, working demo/contact forms with honest backend handling, content‑lock tooling and verifier.

**Not built / partial (be explicit)**
1. **3D product hero, "Beneath the Surface" 3D, exploded view** — *not built.* No CAD or product spec is public; the hero uses MIMOSA's own cut‑out product photo. Any 3D must wait for CAD/reference renders and, for tissue/light diagrams, scientific review and device documentation (no depth claims).
2. **Imaging Explorer** — modes *Tissue oximetry* and *Temperature* show a magnified detail of MIMOSA's **official** portal screenshot (labels "Oximetry Image"/"Thermal Image" are part of that image). *Wound measurement* and *HDR digital image* show the full official composite plus the line "Official example image for this mode to be supplied by MIMOSA". No clinical image or value was generated.
3. **Dedicated `/mimosa-pro` layout** — currently the generic page renderer (content complete, design basic). Next priority.
4. **Audience switcher (clinician/admin/procurement/researcher/partner)**, comparison view, accordions/tabs library — designed, not built.
5. Learning+, Press, Blog index use the generic list/Evidence Explorer; no bespoke design.
6. Videos/podcast embeds and PDF downloads link to their original destinations; not re‑hosted or tested individually.
7. Brand font unconfirmed (Geist used).

## Outstanding dependencies (need MIMOSA)
Approved clinical examples for all four imaging modes; device CAD / high‑res product photography and optical documentation; HubSpot (or other) form endpoint → set `FORM_ENDPOINT_DEMO` / `FORM_ENDPOINT_CONTACT` (original posts to HubSpot form `ebb552d3-…` with Turnstile); RA/QA review of flagged claims and of the withheld placeholders; confirmation of image reuse rights; official brand font/colour spec; decision on the template blog posts.

## Journeys (implemented as navigation paths; copy unchanged)
Clinician → home → Imaging Explorer / Uses / Evidence → Demo. Administrator → Care Settings → Reimbursement → Demo. Procurement → `/mimosa-pro` (FDA/Health Canada, secure architecture) → Reimbursement (CPT table) → Demo. Researcher → Publications/Posters Evidence Explorer (no gate). Partner/investor → About → For Investors → Contact. Technical information is never gated.

## Measurement plan (to be instrumented; no uplift is claimed)
Events: `demo_cta_click` (location), `demo_form_start/submit/success/error` (+ field of abandonment), `product_page_scroll_75`, `imaging_explorer_mode_change` (mode), `resource_search/filter` and `resource_open/download` (type), `use_case_open`, `care_setting_open`, mobile vs desktop split of each funnel step. Test design: A/B of hero CTA placement and form length (role as select vs free text) only after ≥ pre‑registered sample size; privacy‑respecting analytics, no PHI.

## Asset generation plan
Allowed: abstract non‑clinical spectrum textures, wavelength‑rule graphics, tissue‑layer line illustrations (labelled *illustrative*), product compositions from official photography. Forbidden: any generated oximetry/thermal/wound map or patient scene. Every conceptual 3D/diagram carries a caption "Illustrative — not a diagnostic image". No generated assets were produced in this phase.

## Reproduce
```
python3 -I scripts/extract_content.py   # source HTML → site/src/content/pages.json
python3 -I scripts/fetch_assets.py      # downloads official images into site/public/img (gitignored, ~130 MB)
cd site && npm i && npm run build && npx next start -p 3100
python3 -I scripts/verify_content.py http://localhost:3100
```
Environment note: to crawl the live site the session's network allow‑list was extended with `mimosadiagnostics.com`, `cdn.prod.website-files.com` and the four benchmark hosts. The benchmark sites were **not** browsed; their principles in the concept doc come from general knowledge and still need verifying.
