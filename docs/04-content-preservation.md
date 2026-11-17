# Content Preservation Matrix

**Method.** `scripts/extract_content.py` parses the crawled original (`content/source-html/`, text copies in `content/source/`) into every visible string per page (hidden Webflow elements excluded). `scripts/verify_content.py <url>` then fetches each redesigned page and checks every original string is present (whitespace/case‑insensitive). Full row‑level result: `docs/content-matrix.csv` (9,241 rows).

**Build‑time content lock.** Hand‑composed sections (home) obtain copy through `T()`/`S()`/`SC()` in `site/src/lib/content.ts`, which **fails the build** if a string is not verbatim source copy. This already caught three of my own errors (a capitalised "Visible", a wrong page variant of the Pediatrics text, a split heading).

## Result (58 original pages, final build)
| Status | Strings | Meaning |
|---|---|---|
| on equivalent page | 4,465 | found on the same page |
| re‑homed | 4,402 | shared mega‑menu/footer copy (identical on all 58 original pages) now appears once on the home page, in the nav or in the footer |
| withheld (flagged) | 374 rows / 14 unique | see below |
| **missing** | **0** | |

Limits of the check: it proves each string exists on the page, **not its order or that no text was altered inside a string you haven't looked at**; it does not diff images/PDF content or downloads. Human review of clinical/regulatory pages is still required.

## Withheld on purpose — for MIMOSA review (nothing was reworded)
| Item | Why not rendered |
|---|---|
| "Case Study 1 / Lorem ipsum… / Read the research", "Success Story 1–3 / Lorem ipsum, Duis cursus, Aenean faucibus" | placeholder text live on the original home, product page and mega‑menu |
| "This is some text inside of a div block." / "Heading" | empty CMS template card on Posters/Blog |
| "Precios" | stray Spanish label in original footer |
| "1990" / "©" | footer year rendered as 1990 in the static HTML; redesign prints the current year (the original's script most likely does the same — **confirm**) |

## Other flags from the audit (content left exactly as is)
Unrelated Webflow template blog posts still published ("7 of the Best Examples of Beautiful Blog Design", "20 Myths About Web Design", "7 Things About Web Design Your Boss Wants to Know", "Why We Love Webflow…"); typos ("be apart of", "point‑of ‑care", "diagnosis these conditions"); mixed US/UK spelling; duplicate `/reimbursement` and `/resources/reimbursement`; duplicate "Contact Us" description copied from Investors; `/access-learning-plus` returns 404; three claims for RA/QA wording review ("AI‑Driven Insights", "saving more limbs and more lives", "detect subsurface tissue damage before it is visible"); FDA/Health Canada statement appears on `/mimosa-pro` but not on the home page.

## Structural changes (words unchanged)
Mega‑menu copy (use‑case blurbs, care settings, resources, experts, about hub) moved from a hover menu repeated on every page into home sections; the home page uses the **mega‑menu variants** of text that also exist in longer form on inner pages (`SC()`), matching what the original home showed. Hero tagline split visually ("Making the invisible" / "visible") exactly as in the source.
