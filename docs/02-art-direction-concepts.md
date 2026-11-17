# Stage 2 — Three Art-Direction Concepts

All three keep the brand's flower mark, orange family and the **VISIBLE / INVISIBLE** idea; they differ in how that idea is staged. Copy is unchanged in all three (content lock). Real photography is used in all; 3D/scientific visuals are labelled *illustrative* until official assets/CAD arrive.

## A — "Spectrum" (Swiss editorial × light physics)
- **Idea**: The page is a calibrated strip of the electromagnetic spectrum. Scrolling moves from *visible* (warm white, photography) into *near‑infrared* (deep navy, line‑art of the device and tissue layers). A thin vertical "wavelength rule" is the navigation device.
- **Look**: `#F8F8F5` canvas, `#151B26` navy, brand orange `#FF6B50` used only for the single focal element per screen. Large Geist/Inter‑class display type, tight 12‑col grid, hairline rules, small tabular labels.
- **Signature moves**: A) hero with device close‑up that "wipes" from photo to wireframe; B) Imaging Explorer as four stacked layers of the *same capture* with a draggable reveal; C) tissue‑layer diagram as restrained 2.5D line illustration (no depth claims).
- **Pros**: clinical credibility, fastest to load (mostly SVG/CSS), easiest to make accessible, strongest tie to the tagline. **Risk**: can feel austere; relies on good photography.

## B — "Quiet Hardware" (Oura × Apple product theatre)
- **Idea**: The device is the hero. Dark, cinematic product film‑style sections; macro shots of the sensor ring; the clinician and patient appear in warm lifestyle frames between hardware chapters.
- **Look**: near‑black navy stage, soft rim lighting, orange glow limited to the sensor ring, generous negative space, serif accent (ivypresto‑style, already in MIMOSA's CSS) for chapter numerals only.
- **Signature moves**: scroll‑linked camera orbit of a 3D MIMOSA Pro (Three.js, lazy‑loaded, with static poster fallback); exploded view of *documented* parts only; 4‑step workflow as pinned chapters.
- **Pros**: most premium, memorable, strongest product comprehension. **Risk**: needs accurate CAD/reference photos (not public); heaviest build; must guard against decorative 3D and scroll‑jacking.

## C — "Clinical Atlas" (Siemens Healthineers × Butterfly)
- **Idea**: An information‑design site: every page is a navigable atlas — modality, application, care setting, evidence — with strong filters, comparison tables and a persistent "Schedule a Demo" rail. Visible/invisible is shown as paired panels (what the eye sees ↔ what the capture adds).
- **Look**: white surfaces, `#E0E6E8` rules, navy type, orange used for actions only, dense but calm tabular typography, photography in tidy cropped frames.
- **Signature moves**: audience switcher (Clinician / Administrator / Procurement / Researcher / Partner) reordering sections without changing copy; searchable Evidence Explorer; accordion spec sheets; comparison view for care settings.
- **Pros**: best for B2B evaluation and procurement, lowest risk, cheapest to maintain. **Risk**: least emotional; the invisible/visible idea is more diagrammatic.

## Recommendation
**A "Spectrum" as the base system, borrowing C's audience switcher + Evidence Explorer, and adding B's 3D hero only if MIMOSA can supply CAD or reference renders** (otherwise a photographic hero with a clearly‑labelled conceptual device illustration). It best serves the content lock, accessibility, performance targets and the tagline.

## What I need from MIMOSA regardless of choice
1. Official clinical imaging examples (oximetry, temperature, wound measurement, HDR) approved for web use.
2. Device CAD or high‑res product photography; sensor/wavelength documentation (for any "Beneath the Surface" diagram).
3. HubSpot form access / endpoint to make the demo form real (no faked submissions).
4. Confirmation of official brand fonts/colour specs and RA/QA review of flagged claims.
