# Solution — web

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
  data/         catalog.ts (treatments, products, clinics, posts, rewards)
                strings.ts (every sentence derived from a reading)
                languages.ts
  state/        store.tsx — the whole funnel, the web's DermaViewModel
  components/   Icons · primitives · TopNav · Modals · QrCode
  screens/      one file per screen, numbered as in the design
  theme.ts      every colour and gradient, transcribed from the design
public/
  mediapipe/    wasm runtime, served from this origin
  models/       face_landmarker.task
  map-blue.html the clinic map (Leaflet + OpenStreetMap), one iframe per district
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
kept in `localStorage`; the frame itself is an object URL that dies with the tab.

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
- **The language picker offers English only.** The other three are listed in the
  design's own disabled style and do nothing, because there is no translated copy
  behind them. Add a strings table and flip `available` in `data/languages.ts`.
- **Buttons with nothing behind them say so.** Sign-up creates no account, the
  product page has no checkout, and the QR code is drawn rather than issued. Each
  says that where it is, rather than appearing to work.
- **"Save as PDF" opens the browser's print dialog**, which is a real way to save
  one.
- **Prices, clinics and posts are sample data**, labelled on every screen that
  shows them — as they were on Android.

## Verified

`npm run build` is clean and `npm run lint` reports no errors (four advisory
warnings: three about fast refresh, one about an effect that starts the camera).
The funnel was driven end to end in
headless Chrome with a fake camera: every screen renders with no console errors,
the capture gate turns down a frame with no face and offers a retake, a bookmarked
treatment reaches My List, a published post appears in the feed, and a reading
survives a reload.

Not verified: a real face through a real webcam — the blink path and a scored
photograph need a person in front of the camera.
