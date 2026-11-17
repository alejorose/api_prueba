# MIMOSA Diagnostics — Stage 1: Research & Audit

Source: live crawl of https://www.mimosadiagnostics.com (2026-11-17). Verbatim page text is stored in `content/source/*.txt` and is the **content-lock source of truth** (59 files: 33 pages/sections + 26 posts; index in `_index.json`).

## 1. Platform & brand facts (observed)
- Built on **Webflow**; demo form posts to HubSpot (via `hubspotonwebflow.com`), Cloudflare Turnstile on native forms.
- **Logo**: 12‑petal flower mark (translucent orange layers, ~#FFA330 → #FF4500) + black geometric‑sans wordmark "MIMOSA". Primary and white variants exist on the CDN. **Must be preserved.**
- **CSS palette (most used)**: `#fff`, `#e0e6e8` (border grey), `#151b26` (near-black navy), `#ff6b50` (coral/orange accent), `#482168` (purple), `#edf1f2`, `#3e3b44`.
  → The provisional brief palette (`#E56B45` warm, `#101E2C` navy, `#E2E7E8` border) is **very close to the real brand**; recommend adopting the real `#FF6B50`, `#151B26`, `#E0E6E8`, plus the logo orange gradient. Purple `#482168` appears only sparingly.
- **Fonts in CSS**: Poppins, Montserrat, ivypresto-display (serif display), Font Awesome. Wordmark looks like a Poppins/Inter‑class geometric sans.
- **Real imagery available (public)**: 2 clinical lifestyle photos (clinician + patient, handheld device; 3744×5616 and 5616×3744), 3 workflow step photos (1067×1600, device visible), logo, icon, ISO/SOC badges, USA/Canada flags, a recap graphic, KOL portraits.
- **Device (observed in `Step 2` photo)**: black handheld, phone-sized, back shows a circular ring of emitters around a central lens; colored LED-like indicators on the side. **No clean product render/spec sheet is public** → any 3D model is *conceptual* until MIMOSA supplies CAD or reference photography.
- **No clinical imaging examples (oximetry/temperature/wound map/HDR) are on the public pages** → the Imaging Explorer needs official assets from MIMOSA or labelled illustrative placeholders.

## 2. Sitemap (all reachable pages)
| Group | Pages |
|---|---|
| Home | `/` |
| Product | `/mimosa-pro` |
| Uses | `/uses/wound-care`, `/uses/post-op`, `/uses/peripheral-vascular-disease`, `/uses/burns`, `/uses/paediatrics`, `/uses/much-more` |
| Care settings | `/care-settings/group-practices-clinics`, `/hospitals`, `/home-care`, `/in-the-field` |
| Reimbursement | `/reimbursement`, `/resources/reimbursement` |
| Resources | `/resources/ask-the-experts`, `/case-studies`, `/e-books`, `/in-the-press`, `/learning-plus`, `/posters`, `/publications`, `/video-audio-media`, `/blog` (+ 26 `/post/*`) |
| Company | `/about-us`, `/meet-the-team`, `/careers`, `/for-investors`, `/contact-us`, `/privacy-policy` |
| Conversion | `/demo` (HubSpot form) |
| External | `portal.mimosadiagnostics.com` (US portal), `can.mimosadiagnostics.com` (CA), `app.vtail.co` (MIMOSA University), LinkedIn, Facebook, ISO 13485, AICPA SOC 4, 4 publication links (LWW ASWC, HMP ×2, ScienceDirect) |
| Broken | `/access-learning-plus` → **404** |

## 3. Key content blocks (verbatim must survive)
Home hero ("Making the invisible visible / Tissue imaging insights in the palm of your hand!…"), MIMOSA Pro intro, 5+1 applications, 4 testimonials (Regulski, Harding, Rave, Armstrong), 4‑step workflow, 4 care settings, resource hub, "Ask an Expert" (Armstrong, Cross). Product page: **"US FDA 510(k) cleared and Health Canada Approved"**, "4 INSIGHTS in 1 CAPTURE", AI‑Driven Insights, Melanin algorithms, Reimbursable, Ease of Use, Reflectance‑Based Technology, "12 ft. tall machine…" story, Secure Solution Architecture, Customer Success.

## 4. Issues flagged for MIMOSA review (NOT changed — content lock)
1. **Placeholder copy live**: "Case Study 1 — Lorem ipsum…" (home), "Success Story 1–3 — Lorem ipsum / Duis cursus / Aenean faucibus" (product page + mega‑menu on every page).
2. **Template blog posts** unrelated to MIMOSA still published: "7 of the Best Examples of Beautiful Blog Design", "20 Myths About Web Design", "7 Things About Web Design Your Boss Wants to Know", "Why We Love Webflow…".
3. Footer **"© 1990 MIMOSA Diagnostics"** (dynamic year rendered as 1990 — and company is far younger).
4. Stray label **"Precios"** (Spanish) in the footer/contact block on every page.
5. Contact Us description duplicates the Investors text ("Learn more about MIMOSA, our growth, and our future!").
6. Typos: "be apart of changing the game", "point-of -care", "diagnosis these conditions", "Pediatrics" vs "paediatrics" URL, mixed US/UK spelling ("Specialised"/"standardized").
7. Regulatory/claim wording to be verified by RA/QA before reuse: "AI‑Driven Insights", "saving more limbs and more lives", "detect subsurface tissue damage before it is visible", "tissue oxygen saturation" vs "tissue oximetry" used interchangeably. Also a note that FDA 510(k) clearance wording is on `/mimosa-pro` but not the home page.
8. Duplicate resource pages: `/reimbursement` and `/resources/reimbursement`.
9. The ~2,000‑word mega‑menu/footer block (Features, Uses, Care Settings, Resources, Ask‑an‑Expert, Contact form) is **repeated in full on every page** → heavy, noisy to screen readers.
10. Demo form: two HubSpot/Webflow forms on one page; free-text "I am a:" field (placeholder "Physician, Wound Care Specialist, Health Care Admin…") — a select would reduce friction without changing wording.

## 5. UX findings
- Strong, clear core idea ("Making the invisible visible") but expressed with generic stock-style layout and only **one product photo type**; the device itself is rarely the hero.
- The most differentiating asset (4 insights per capture) is plain text; there is no visual explanation of what each modality shows.
- Clinical credibility (FDA/Health Canada, ISO 13485, SOC 4, peer‑reviewed papers) is dispersed; evidence is a short list of 4 links on home.
- Two logins (USA/CA), "Schedule a Demo" repeated well; however the demo CTA competes with "Let's Chat!" and a nav form.
- Audience paths (clinician / admin / procurement / researcher / partner) are implicit in menus (Uses, Care Settings, Reimbursement, Resources, Investors) but not surfaced as journeys.
- Mobile weight: large JPGs (3.9 MB and 2.3 MB) served in page.

## 6. Research gaps (honest limits)
- Benchmark sites (Butterfly, Oura, Apple Vision Pro, Siemens Healthineers) were **not yet browsed**; principles in the concepts are from general knowledge and will be verified in a browser pass before the design system is finalised. No conversion‑rate claims are made.
- Resource sub‑pages (publications, posters, e‑books, press, learning+) are CMS lists; their full item metadata is in `content/source` and will be modelled as structured data in implementation.
- Unknown: backend for demo form (HubSpot form GUID exists), whether product CAD is available, which clinical images are approved for reuse.
