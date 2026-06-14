# 🏃 Pace Forecast — Environmental Pace Calculator

A modern, mobile-first React web app that converts a goal running pace into a
realistic race-day pace based on **temperature, humidity, and altitude** — and
credits the conditions you're acclimatized to.

> _Example:_ a runner adapted to ~50 °F Pacific-Northwest spring training, racing
> a half marathon in warm, humid summer weather, can see exactly how much to ease
> their goal pace.

## Features

- **Intuitive controls** — sliders + number inputs for every factor, with plain-
  language hints ("Humid — sweat evaporates slowly").
- **Goal pace entry** in min/mile or min/km, with live unit conversion.
- **Race conditions tab** — adjusts your pace vs. ideal racing weather.
- **"Acclimatized to" tab** — enter the conditions you train in; the app credits
  your adaptation for a more accurate race-day estimate.
- **Splits tab** — your adjusted pace broken into 100 m / 200 m / 400 m / 800 m /
  1 km / mile / 5K / 10K / half / marathon target times.
- Works offline once loaded; no backend, no tracking.

## The model

Pace is adjusted by a fractional "performance cost":

```
adjusted_pace = goal_pace × (1 + cost(race_env)) / (1 + cost(acclimated_env))
```

- **Heat** grows with the square of degrees above ~10 °C (50 °F), amplified by
  humidity above 50%.
- **Altitude** adds a roughly linear aerobic cost above ~300 m.
- Training in tough conditions divides part of the penalty back out — that's the
  acclimatization credit.

Coefficients live in [`src/lib/paceModel.ts`](src/lib/paceModel.ts) and are easy
to tune. They're practitioner estimates synthesised from common heat/altitude
running guidance — a planning aid, not a physiological guarantee.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build to dist/
npm run preview  # serve the production build locally
```

## Deploy to Vercel

This is a standard Vite SPA — zero config needed.

```bash
npm i -g vercel
vercel            # follow prompts; framework auto-detected as "Vite"
```

Or push to GitHub and "Import Project" in the Vercel dashboard. Build command
`npm run build`, output directory `dist`. (`vercel.json` is already included.)
Works equally well on Netlify, Cloudflare Pages, or GitHub Pages.

## Turn it into an iOS / Android app

The build is a self-contained static bundle (`base: './'` in
[`vite.config.ts`](vite.config.ts) keeps asset paths relative), so
[Capacitor](https://capacitorjs.com/) wraps it directly:

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Pace Forecast" com.paceforecast.app --web-dir=dist
npm run build
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
npx cap sync
npx cap open ios       # opens Xcode
npx cap open android   # opens Android Studio
```

After future web changes: `npm run build && npx cap sync`.

## Project layout

```
src/
  lib/
    paceModel.ts   environmental cost model + pace adjustment
    splits.ts      distance → time split table
    format.ts      pace/time parsing & formatting
    units.ts       °F/°C, ft/m, km/mile conversions
  components/
    Segmented.tsx      pill toggle (units + tabs)
    ControlRow.tsx     slider + number input
    EnvironmentForm.tsx  temp / humidity / altitude
    ResultDisplay.tsx    adjusted pace + cost breakdown
    SplitsTable.tsx      splits table
  App.tsx          state, tabs, unit handling
```
