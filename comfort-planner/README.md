# Comfort Planner

Single-file (no build, no dependencies) pre-Manual J estimator for live consults.
Open `index.html` in a browser. Jobs auto-save in the browser (localStorage); use Equipment > Save or load this job to move them.

- Room-by-room heat loss/gain (U-value x area x delta-T, air leakage, solar by sun side), calibrated to a real CoolCalc MJ8 report
  (system totals within ~0.5% heating and ~1% cooling; individual rooms within about +/-6%).
- Equipment fit at the design temperature, using a cold-weather capacity derate, plus a balance-point chart.
- What-if upgrades, auto layout suggestion, price breakdown, copy-able client summary.
- Equipment catalog is editable in the app. Cold-weather capacity (% of nameplate at 5F), Gree MUL30 max indoor units, and 18k/24k indoor sizes are
  placeholders marked "assumed" until filled from manufacturer data.
- Preliminary estimate for planning, not a substitute for Manual J / S / D.
