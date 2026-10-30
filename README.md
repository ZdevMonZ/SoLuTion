# SoLuTion — web

The desktop counterpart of the 더마체크 Android app: a visitor takes a skin reading
from their webcam, reads it in plain language, and compares the Seoul clinics that
treat what it found.

React + TypeScript + Vite. No backend.

```
npm install
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint
```

## Where things are

```
src/
  analysis/     the reading — ported from the Android app's data/analysis/
                skinPixelAnalysis (pure measurement) · skinScoring (0..100 + levels)
                capture (crop, grab, decode) · faceDetector (MediaPipe)
                faceGateRules + blinkRules (pure decisions) · ranking
  data/         catalog.ts (treatments, products, clinics, posts, rewards — English,
                and the only place ids, prices and ordering live)
                strings.ts (every sentence derived from a reading, in four languages)
                languages.ts (the picker's list)
  i18n/         index.tsx (LangProvider, useLang, useCopy) · one table per screen
                catalog.ts (useCatalog: catalog.ko/ja/zh.ts laid over data/catalog.ts
                by id) · josa.ts (Korean particles after names picked at runtime)
                health.ts + healthCare.ts (the health-checkup mode's words and guides)
  health/       the health-checkup mode: items (ranges, conditions, report) ·
                parse (sheet text → numbers, pure) · ocr (Tesseract, in the page) ·
                hospitals (sample listings)
  state/        store.tsx — the whole funnel, the web's DermaViewModel
                health.tsx — the health-checkup mode, beside it
  components/   Icons · primitives · layout (phone switch) · TopNav · Modals · QrCode
                BodyCloud (the turning point-cloud figure on the health result)
  screens/      one file per screen, numbered as in the design; health/ H1–H7
  theme.ts      every colour and gradient, transcribed from the design
public/
  mediapipe/    wasm runtime, served from this origin
  models/       face_landmarker.task
  ocr/          Tesseract worker, wasm core and the Korean + English models
  map-blue.html the clinic map (Leaflet + OpenStreetMap), one iframe per district;
                `pins=` overrides the pins (the health hospital list uses it)
```

The design source is `../web_design/Solution.dc.html`. Colours, spacing and copy
come from there rather than from an approximation of it; `theme.ts` is the single
place any of them are written down.

## Two boundaries worth keeping

**Pure decisions stay pure.** `skinPixelAnalysis`, `skinScoring`, `faceGateRules`
and `blinkRules` know nothing about the browser, exactly as their Kotlin originals
knew nothing about Android. `capture` and `faceDetector` are the only files that
touch a camera or a canvas. It is what let the Android build carry 81 tests without
a phone, and it is why a rule change here is testable without one either.

**The reading carries numbers, never prose.** Every sentence on the result screen
is rendered from those numbers by `data/strings.ts` at display time, so a report
stored last week can be re-read today without freezing the wording it was taken
with.

## Nothing leaves the browser

The frame is read in the page. The MediaPipe runtime and model are served from
this origin, so detection makes no third-party request, and the only network calls
the site makes are the map tiles (OpenStreetMap) and the web fonts. The reading is
kept in `localStorage`, as is the language choice; the frame itself is an object URL
that dies with the tab.

The health-checkup photo is read the same way: Tesseract runs in a worker from
`public/ocr/`, and nothing about a checkup — photo, numbers, history — is stored at
all. It is gone when the tab closes.

The page opens in **English** for everyone. The browser's language is not
consulted; a visitor's own pick from the language picker is kept.

## The health-checkup mode

The switch beside the wordmark changes between the skin check and the health
checkup. The checkup runs H1 form (age, gender, family history, medical history,
district) → H2 scan the result sheet → H3 read it → H5 body map → H6 care guide for
one area → H7 hospitals for that area's department.

- **A scan goes straight to the body map** (the user's call, 2026-10-30), with a
  line saying how many of the 15 items were read. H4, the editable check of the
  numbers, is reached from the body map's "Edit numbers", or from "Type the numbers
  in" when there is no photo. A scan that read nothing stops on H3 with retake /
  type-in, because an empty body map would claim everything is in range.
- **Misreads reach the body map unchecked.** Measured on test sheets: a clean,
  flat scan reads 13 of 15 values; a tilted, small, slightly blurred webcam-style
  frame 8–9 of 15, with one wrong (γ-GTP 52 read as 163, shown as needing
  attention). "Edit numbers" is where that gets fixed.
- **What the measurements decided** (`health/ocr.ts`): automatic page layout
  (Tesseract.js's default single-block mode read 0 of 15 off a bordered table);
  local adaptive thresholding (a sheet surrounded by desk read 0 of 15 with a
  global cut-off); two passes at long sides of 1600 and 2400 px, merged (text read
  well only in a narrow band of sizes — the same sheet enlarged 1.7× read none).
- **Ranges** are the Korean national health screening sheet's normal / borderline /
  suspected lines (`health/items.ts`); BMI uses the Korean 23 / 25 cut-offs. The
  result says it is not a diagnosis.
- **The body** is drawn, not loaded: ellipsoids and tubes sampled into ~6,500
  points with a fixed seed, projected on a 2D canvas. No 3D library, no model file.
- **Hospitals are sample listings**, four per district, invented like the
  dermatology clinics, and the screen says so.

## Where this departs from the design, and why

- **The webcam screen is real.** The design draws a placeholder viewfinder; this
  runs the camera, the blink check and the capture gate. The shutter fires on a
  blink and the frame is grabbed on that frame — no confirmation beat, which is
  what silently discarded captures on Android. After 12 s without a readable
  blink the button arms anyway: a detector that cannot read someone must not lock
  them out of their own reading. Permission-denied is the real browser state, so
  the design's "show denied state" toggle is gone, and its "Upload a photo
  instead" button now actually decodes a file.
- **Seven readings, not five.** Redness and balance were added to the analysis
  after the design was drawn, and the result screen renders whatever the reading
  contains.
- **Nineteen treatments, in ladders.** The design draws four and the Android
  catalogue has six. Thirteen more (October 2026) give every reading area a run
  from gentle to strong — brightening care, toning, then fractional pico for
  pigmentation; Shurink, Thermage, then Ulthera for laxity; and so on. Which
  treatments exist, typical courses, downtime and cautions were checked against a
  published Gangnam clinic menu (31 treatment pages); every sentence and every
  price here is our own, and no clinic's copy is reproduced.
- **The match follows the level, not just the area.** Each treatment names the
  reading levels it is meant for, per area (`suits`). Inside an area, the matched
  list puts the ones that fit the reading's level first (`levelDistance` in
  `analysis/ranking.ts`), so "Steady" pigmentation leads with brightening care and
  "Focus first" with toning. The detail page says whether a treatment fits *your*
  reading, and adds the course, downtime, results and a "suits you if" list.
- **Price ranges come from the clinics.** The design's fixed ranges were the
  Myeongdong clinics' spread, and read wrong for anyone staying in Hongdae or
  Gangnam. `priceRangeIn` derives the range from the chosen district's clinics,
  so Myeongdong still shows the design's numbers — except acne care, which reads
  ₩88,000 rather than ₩85,000 because no clinic row ever went that low.
- **Four languages: English, Korean, Japanese and Simplified Chinese.** The picker
  in the top bar switches every screen, the catalogue, the tab title and the map's
  buttons. The choice is kept in `localStorage` (`solution.lang.v1`); a first visit
  follows the browser's language when it is one of the four, and English otherwise.
  Most of the copy comes from the Android app's tables and was then checked line
  by line against the English. Where the Android text had drifted from the English,
  the web follows the English — the Korean cautions, for one, said 혈액응고제 (a
  clotting agent) for "blood thinners". CJK pages use system fonts, Korean keeps
  words whole when wrapping, and letter-spacing tightens.
- **Buttons with nothing behind them say so.** Sign-up creates no account, the
  product page has no checkout, and the QR code is drawn rather than issued. Each
  says that where it is, rather than appearing to work.
- **"Save as PDF" opens the browser's print dialog**, which is a real way to save
  one.
- **Phones get one column.** The design is drawn for a laptop only. Below 760 px
  (`components/layout.ts`) every two-column screen stacks, the gutter drops to
  16 px, headlines scale to about three quarters, the nav tabs take a second header
  row, and the prototype jump rail is hidden — on a phone it covered a third of the
  screen, and the nav and the funnel's own buttons reach every screen without it.
  Copy that names the laptop says "phone camera" there. The camera viewfinder
  keeps its 16:10 shape on purpose: the guide oval and the analysed crop are one
  geometry (`analysis/capture.ts`), so a portrait viewfinder means re-deriving that
  geometry, not restyling a box.
- **The score dials draw their ring.** The design masks them with
  `radial-gradient(circle, …)`, which measures to the box's corner and leaves no
  ring visible; `closest-side` is what it meant. Keep it across design syncs.
- **Prices, clinics and posts are sample data**, labelled on every screen that
  shows them — as they were on Android.

## Verified

`npm run build` is clean and `npm run lint` reports no errors (four advisory
warnings: three about fast refresh, one about an effect that starts the camera).
The funnel was driven end to end in
headless Chrome with a fake camera: every screen renders with no console errors,
the capture gate turns down a frame with no face and offers a retake, a bookmarked
treatment reaches My List, a published post appears in the feed, and a reading
survives a reload. Every screen and the three overlays were also driven at a 390 px phone
viewport — none scrolls sideways — and re-checked at 820 and 1024 px. The
matched-list order was checked against synthetic readings for every area and
level, and the detail page's fit sentence against the reference reading.

Not verified: a real face through a real webcam — the blink path and a scored
photograph need a person in front of the camera.
