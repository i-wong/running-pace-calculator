/**
 * Programmatic SEO landing page generator.
 *
 * Writes one static HTML file per entry into public/, then generates
 * public/sitemap.xml covering the main URL + all landing pages.
 *
 * Run: node scripts/generate-pages.mjs
 * Auto-run: wired into the build script in package.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = path.join(ROOT, 'public')
const BASE_URL = 'https://paceforecast.com'

// ---------------------------------------------------------------------------
// Page data — each entry becomes one indexable landing page
// ---------------------------------------------------------------------------

const pages = [
  {
    slug: 'boston-marathon-pace-heat',
    title: 'Boston Marathon Pace Adjustment for Heat & Humidity | Pace Forecast',
    h1: 'Boston Marathon Pace Calculator — Warm Weather Adjustment',
    metaDesc: 'Running Boston on a warm day? Use this calculator to adjust your goal pace for race-day heat and humidity. See your adjusted pace and mile splits instantly.',
    conditions: { temp: 72, humidity: 75, alt: 100 },
    defaultPace: '8:00',
    intro: `The Boston Marathon course from Hopkinton to Boylston Street is one of the most storied in the world — but April weather is notoriously unpredictable. When temperatures climb above 60 °F (15 °C), even well-trained runners need to ease their goal pace to run a smart, negative-split race.`,
    facts: [
      'Race-day temps above 65 °F (18 °C) can slow recreational runners by 4–8% and elites by 2–4%.',
      'The Boston Athletic Association officially recommends slowing your start pace when temps exceed 55 °F.',
      'The net downhill profile of Boston means many runners go out too fast — heat amplifies the risk of a second-half blow-up.',
      'High humidity matters as much as temperature. At 75% humidity and 72 °F the effective heat stress exceeds 80 °F dry-bulb.',
    ],
    tips: [
      'Seed yourself one corral back and run the first 5 miles 15–20 seconds per mile slower than goal.',
      'Pre-cool with ice in the 30 minutes before the gun — it buys measurable time in warm races.',
      'Focus on effort on Heartbreak Hill rather than pace; your GPS split will be slower regardless.',
    ],
    faq: [
      {
        q: 'How much slower should I run Boston in the heat?',
        a: 'A rough rule: add 20–30 seconds per mile for every 10 °F above 55 °F (13 °C). For a 72 °F day with 75% humidity that can be 40–60 seconds per mile. Use the calculator above for a precise estimate based on your goal pace.',
      },
      {
        q: 'Does the Boston course elevation affect pace?',
        a: 'The net drop of ~450 feet is mostly in the first half. The altitude is near sea level throughout, so the main environmental variable on race day is heat and humidity rather than altitude.',
      },
    ],
  },
  {
    slug: 'chicago-marathon-pace-calculator',
    title: 'Chicago Marathon Pace Calculator — Heat & Humidity | Pace Forecast',
    h1: 'Chicago Marathon Pace Adjustment for Fall Race Conditions',
    metaDesc: 'Plan your Chicago Marathon pace with this environmental calculator. Adjust for race-day temperature and humidity — get splits from 5K to finish.',
    conditions: { temp: 65, humidity: 65, alt: 600 },
    defaultPace: '8:30',
    intro: `The Chicago Marathon in October can range from brisk and perfect to unseasonably warm. The flat course rewards good pacing — but even mild heat and humidity on an exposed urban course can cost you minutes at the finish. Use this calculator to dial in your race-day targets before you pin on your bib.`,
    facts: [
      'Chicago sits at ~600 ft elevation — essentially no altitude penalty, making heat the dominant variable.',
      'The 2007 Chicago Marathon was cancelled mid-race due to heat; temps were just 88 °F — a reminder that warm October days are real.',
      'The flat course means there is nowhere to "bank" time early; bad pacing shows up ruthlessly.',
      'Humidity in Chicago in October typically runs 60–75%, enough to meaningfully amplify even moderate heat.',
    ],
    tips: [
      'Treat miles 1–6 as a warm-up regardless of crowd energy. The real race starts at mile 20.',
      'Plan your fueling around sweat rate — even at 65 °F you can lose 1–1.5L per hour.',
      'Watch the wet-bulb globe temperature forecast, not just the dry-bulb temp.',
    ],
    faq: [
      {
        q: 'What is a good target pace for Chicago Marathon?',
        a: 'That depends on your fitness and the conditions. Enter your goal pace and the forecast conditions in the calculator above to get a weather-adjusted target. On a cool (<55 °F) day you can run close to your training pace; at 65 °F with humidity add 3–5%.',
      },
      {
        q: 'Does Chicago Marathon have shade?',
        a: 'The course through the Loop and lakefront has some shade from buildings and trees, but large stretches are exposed. Wind off Lake Michigan can help or hurt depending on direction.',
      },
    ],
  },
  {
    slug: 'denver-altitude-running-pace',
    title: 'Denver Altitude Running Pace Calculator — Mile High Adjustment | Pace Forecast',
    h1: 'Running Pace at Altitude — Denver & Mile High Adjustment',
    metaDesc: 'Calculate how much slower you will run at Denver\'s 5,280 ft elevation. Get your altitude-adjusted pace and race splits for the Mile High City.',
    conditions: { temp: 60, humidity: 30, alt: 5280 },
    defaultPace: '8:00',
    intro: `Denver sits at exactly 5,280 feet (1,609 m) above sea level — the "Mile High City." At that altitude, the air contains roughly 17% less oxygen than at sea level. Runners who live and train near sea level typically run 3–5% slower at Denver's elevation, with the effect most pronounced in longer aerobic efforts like half marathons and marathons.`,
    facts: [
      'At 5,280 ft there is about 17% less oxygen per breath than at sea level.',
      'VO2max drops roughly 1.5–3% per 1,000 feet above ~3,000 ft.',
      'Altitude effects are most pronounced in paces that rely heavily on aerobic capacity (half marathon, marathon) and least in short sprint efforts.',
      'Acclimatization begins within 24–48 hours but full aerobic adaptation takes 2–4 weeks.',
      'Dehydration risk is higher at altitude — dry Colorado air increases respiratory moisture loss.',
    ],
    tips: [
      'Arrive at least 3 days before your race OR arrive within 24 hours and race before full altitude effects set in (the first ~12 hours you still have your sea-level blood composition).',
      'Slow your easy and long runs by 30–60 seconds per mile during the first week at altitude.',
      'Drink an extra 500–750 ml of water per day to compensate for increased respiratory fluid loss.',
    ],
    faq: [
      {
        q: 'How much slower will I run in Denver vs sea level?',
        a: 'A sea-level runner typically runs 3–5% slower at 5,280 ft for distances of 5K and longer. For an 8:00/mi runner that is roughly 15–25 seconds per mile. Use the calculator above with altitude 5280 ft and your goal pace for a precise estimate.',
      },
      {
        q: 'Does altitude affect shorter races like 5K?',
        a: 'Yes, but less than longer races. The aerobic cost is the same; it just matters more when you\'re racing for 30+ minutes. A 5K racer might lose 2–3%; a marathoner might lose 4–6% or more if not acclimatized.',
      },
      {
        q: 'Should I adjust my marathon pace for the Colfax or Revel Canyon City race?',
        a: 'Yes — both are run at or above Denver\'s elevation. Use this calculator with the race altitude and forecast temperature to get a realistic goal pace before race day.',
      },
    ],
  },
  {
    slug: 'miami-running-pace-heat-humidity',
    title: 'Miami Running Pace Calculator — Heat & Humidity Adjustment | Pace Forecast',
    h1: 'Miami Marathon & Running Pace Adjustment — Heat & Humidity',
    metaDesc: 'Calculate your adjusted running pace for Miami\'s heat and humidity. Whether you\'re racing the Miami Marathon or training in South Florida, get a realistic pace target.',
    conditions: { temp: 82, humidity: 85, alt: 10 },
    defaultPace: '9:00',
    intro: `Miami is one of the toughest environments for distance running on the planet. Year-round heat and oppressive humidity mean that nearly any race pace you've set in cooler conditions will need to be relaxed. The Miami Marathon in late January or February is the "cool season" — and it still regularly sees race-day temps above 75 °F with 80%+ humidity.`,
    facts: [
      'Miami\'s average high in January (marathon month) is 77 °F (25 °C); humidity regularly exceeds 80%.',
      'At 82 °F and 85% humidity, the heat index approaches 90 °F — serious stress for runners running for 2+ hours.',
      'The city is essentially at sea level, so altitude is not a factor; heat and humidity are the entire story.',
      'Sweat evaporation — the body\'s primary cooling mechanism — is severely impaired when humidity is above 75%.',
    ],
    tips: [
      'Start at least 60–90 seconds per mile slower than your goal pace and reassess at mile 6.',
      'Wear light, moisture-wicking clothing; avoid cotton entirely.',
      'Use every water stop. Pouring water on your head and wrists provides meaningful cooling.',
      'If the heat index exceeds 90 °F, treat any finish as a success and do not chase a time goal.',
    ],
    faq: [
      {
        q: 'How much slower should I run in Miami vs a cooler city?',
        a: 'A runner trained in 55 °F / 60% humidity racing in 82 °F / 85% humidity can expect a 10–15% slower pace — that\'s 1–2 minutes per mile for a recreational runner. Enter your goal pace in the calculator above with the Miami preset for a precise estimate.',
      },
      {
        q: 'Is the Miami Marathon a good race for a PR?',
        a: 'Rarely. The heat and humidity almost always make Miami significantly slower than races in cooler climates. It\'s a great experience race but most runners plan their PR attempts for fall or spring races in cooler regions.',
      },
    ],
  },
  {
    slug: 'new-york-city-marathon-pace-calculator',
    title: 'NYC Marathon Pace Calculator — November Race Conditions | Pace Forecast',
    h1: 'New York City Marathon Pace Calculator',
    metaDesc: 'Plan your NYC Marathon pace with this environmental calculator. Adjust for race-day temperature, humidity, and the 5-borough course profile. Get split targets from 5K to finish.',
    conditions: { temp: 52, humidity: 65, alt: 40 },
    defaultPace: '9:00',
    intro: `The TCS New York City Marathon in early November typically offers near-ideal racing weather — temperatures in the 40s to low 50s °F — but the five-borough course adds bridges and rolling terrain that the pace calculator doesn't capture. On a normal year NYC conditions are close to optimal; this calculator helps you plan for the occasional warm or humid year.`,
    facts: [
      'Average race-day high in early November in NYC is 52–58 °F (11–14 °C) — close to ideal racing conditions.',
      'The five major bridges (Verrazzano, Queensboro, etc.) add significant elevation gain versus a flat course; plan for effort not pace on bridges.',
      'NYC sits at near sea level; altitude is essentially zero.',
      'A warm NYC year (65 °F+) is unusual but has occurred — the calculator helps you plan for it.',
    ],
    tips: [
      'On a typical cool NYC day you can race close to your time-trial pace; use the calculator to check warm-year scenarios.',
      'Walk the water stops — NYC\'s aid stations are busy and cramped; walking 10 seconds saves more time than fumbling while running.',
      'Break the race into sections by borough, not miles. Each transition marks a psychological milestone.',
    ],
    faq: [
      {
        q: 'What is a realistic pace for the NYC Marathon?',
        a: 'In ideal (cool, low-humidity) conditions you can target close to your training pace. In warmer years (above 62 °F) plan to slow 2–5%. The bridges add ~45–90 seconds of cumulative effort over the race. Enter your goal pace and the forecast above for a specific estimate.',
      },
    ],
  },
  {
    slug: 'hot-weather-race-pace-adjustment',
    title: 'Hot Weather Running Pace Calculator — Heat Adjustment | Pace Forecast',
    h1: 'How Much Slower Do You Run in Hot Weather?',
    metaDesc: 'Calculate exactly how much heat slows your running pace. Enter temperature, humidity, and your goal pace to get a heat-adjusted target with splits.',
    conditions: { temp: 85, humidity: 75, alt: 0 },
    defaultPace: '8:00',
    intro: `Heat is the single biggest external variable in distance running performance. Even well-trained runners slow meaningfully in warm conditions — not because of fitness but because the body redirects blood to the skin for cooling, increasing cardiovascular strain at every pace. The good news: the adjustment is predictable and this calculator quantifies it so you can set realistic race-day expectations.`,
    facts: [
      'At 80 °F (27 °C) most runners are 3–6% slower than at 55 °F (13 °C).',
      'At 90 °F (32 °C) the slowdown is typically 8–12% — about 1–2 minutes per mile for a 9:00 runner.',
      'Humidity matters as much as air temperature. 80% humidity at 80 °F impairs sweat evaporation almost completely.',
      'Acclimatization (10–14 days of heat exposure) can recover 50–75% of the heat penalty over time.',
      'Body weight has a disproportionate effect on heat tolerance — a lower surface-area-to-mass ratio means slower cooling.',
    ],
    tips: [
      'Dial back your pace in the first mile; perceived effort lags behind heat stress by 10–15 minutes.',
      'Start hydrating the day before — arriving at the start line fully hydrated is more effective than drinking during the race.',
      'Pick shaded or tree-lined routes for hot training days to keep skin temperature lower.',
    ],
    faq: [
      {
        q: 'How do I calculate my pace in the heat?',
        a: 'Enter your goal pace (min/mile or min/km), the expected temperature and humidity in the calculator above. It applies a physiologically-grounded heat penalty and shows you the adjusted pace with full splits.',
      },
      {
        q: 'What temperature is too hot to race?',
        a: 'Most race medical guidelines suggest serious caution above 82 °F (28 °C) wet-bulb globe temperature. Healthy runners can race at higher temps but should treat it as a training run, not a PR attempt.',
      },
      {
        q: 'Should I adjust my training paces in summer too?',
        a: 'Absolutely. Running easy paces in summer that feel like tempo pace in winter leads to overtraining. Slow all your easy runs by the heat-adjusted amount and train by effort, not GPS pace.',
      },
    ],
  },
  {
    slug: 'summer-running-pace-calculator',
    title: 'Summer Running Pace Calculator — Adjust for Heat & Humidity | Pace Forecast',
    h1: 'Summer Running Pace Calculator — How to Adjust Your Training Pace',
    metaDesc: 'Stop running your winter paces in summer heat. Use this calculator to get a realistic summer training pace based on temperature and humidity — with splits for every distance.',
    conditions: { temp: 78, humidity: 70, alt: 0 },
    defaultPace: '9:00',
    intro: `Every summer, thousands of runners make the same mistake: they chase their winter paces in summer heat, feel terrible, and either overtrain or lose confidence. Summer running requires intentional pace adjustment — not because you got slower, but because the thermal environment creates physiological load your fitness numbers don't capture.`,
    facts: [
      'Training at summer temperatures of 78 °F and 70% humidity adds roughly 6–9% to your cardiovascular load at any given pace.',
      'Heart rate at the same pace is typically 10–15 bpm higher in heat — a sign your body is working harder even at "easy" efforts.',
      'Running by effort (heart rate or RPE) in summer rather than GPS pace is the most effective strategy.',
      'Consistent summer training — even at slower paces — builds a fitness base that translates well to fall racing.',
    ],
    tips: [
      'Use this calculator to set a summer-adjusted training pace for your easy runs. Match effort, not the number.',
      'Run early morning (before 7 am) or evening (after 7 pm) to avoid peak solar radiation.',
      'Accept that your training log will show slower paces all summer. That\'s correct — it does not mean you\'re losing fitness.',
    ],
    faq: [
      {
        q: 'Why is running in summer so much harder?',
        a: 'Your body must do two jobs simultaneously in heat: power your muscles and cool your core. The cooling effort redirects blood to your skin, meaning your muscles get less oxygen at the same pace — it genuinely is physiologically harder work.',
      },
      {
        q: 'How do I maintain fitness through summer?',
        a: 'Slow your easy runs to the heat-adjusted pace, keep your workout efforts based on feel not pace, and prioritize consistency over hitting numbers. The aerobic adaptations from consistent summer running pay dividends in fall racing season.',
      },
    ],
  },
  {
    slug: 'altitude-running-pace-calculator',
    title: 'Altitude Running Pace Calculator — High Elevation Adjustment | Pace Forecast',
    h1: 'Altitude Running Pace Calculator — How Elevation Affects Your Pace',
    metaDesc: 'Calculate your running pace at any altitude. See how much elevation slows you down and get adjusted target times for races from 5K to marathon.',
    conditions: { temp: 55, humidity: 35, alt: 8000 },
    defaultPace: '8:00',
    intro: `Whether you're racing in Albuquerque, running trails in Breckenridge, or traveling to a mountain destination race, altitude has a predictable and quantifiable effect on running performance. This calculator applies the aerobic cost of thinner air to your goal pace so you can set realistic expectations and avoid the rookie mistake of blowing up in the first mile because the effort felt deceptively easy.`,
    facts: [
      'At 8,000 ft (2,440 m) there is roughly 25% less oxygen per breath than at sea level.',
      'Running pace slows approximately 2–3% per 1,000 ft above 3,000 ft for unacclimatized runners.',
      'Elites acclimatize at altitude specifically to increase red blood cell mass — the same reason it hurts recreational runners in the short term.',
      'Above 10,000 ft (3,050 m), even walking feels significantly harder for sea-level visitors.',
      'The penalty for short sprints is less than for long aerobic efforts; a 100 m sprinter is less affected than a marathoner.',
    ],
    tips: [
      'For a race above 5,000 ft: arrive within 24 hours and race before altitude effects fully set in, OR arrive 2–3 weeks early for proper acclimatization.',
      'Iron stores and hydration are more important at altitude. Low iron blunts red blood cell adaptation.',
      'Use the "Acclimatized to" tab in the calculator if you already live at moderate elevation — you already carry some adaptation credit.',
    ],
    faq: [
      {
        q: 'How much slower will I run at altitude?',
        a: 'Roughly 1% slower per 1,000 ft above 3,000 ft for a sea-level runner — so at 8,000 ft expect 4–5% slower. At 14,000 ft (mountain peaks) the adjustment can exceed 20%. Use the calculator above with your target elevation for a precise estimate.',
      },
      {
        q: 'What is altitude acclimatization?',
        a: 'Acclimatization is the body\'s physiological adaptation to lower oxygen: increased breathing rate, elevated red blood cell production, and cellular changes in muscle tissue. Full acclimatization at a given altitude takes 2–4 weeks.',
      },
      {
        q: 'Do I need to adjust my training runs at altitude?',
        a: 'Yes. Apply the same altitude penalty to training runs. Running your sea-level easy pace at 8,000 ft is equivalent to a moderately hard effort. Slow down and let your body adapt rather than fighting the environment.',
      },
    ],
  },
  {
    slug: 'hawaii-marathon-pace-calculator',
    title: 'Honolulu Marathon Pace Calculator — Hawaii Heat & Humidity | Pace Forecast',
    h1: 'Hawaii / Honolulu Marathon Pace Adjustment — Heat & Humidity',
    metaDesc: 'Running the Honolulu Marathon or a Hawaii race? Get your heat-and-humidity-adjusted pace for Hawaii\'s warm, tropical conditions with full mile splits.',
    conditions: { temp: 80, humidity: 80, alt: 10 },
    defaultPace: '9:30',
    intro: `The Honolulu Marathon in December is one of the world's largest marathons — and one of the toughest environmentally. Even in "winter," Honolulu sees race-day conditions around 78–82 °F with 75–85% humidity. If you've trained in a cooler climate, your pace will need significant adjustment. Most first-time Honolulu runners are surprised by how much the heat and humidity slow them down versus their mainland training.`,
    facts: [
      'Honolulu\'s December marathon-day average high: 80 °F (27 °C), humidity ~78%.',
      'The sea-level elevation is a slight advantage vs altitude races, but is overwhelmed by the heat load.',
      'Combined heat and humidity at Honolulu levels can slow recreational runners by 10–15% compared to optimal conditions.',
      'The Diamond Head climb at mile 2 in the dark adds a psychological and physiological challenge early in the race.',
    ],
    tips: [
      'Use the "Acclimatized to" tab if you train in a warm climate — your adaptation offsets some of the penalty.',
      'Arrive 3–5 days early and do at least two short runs in the heat to prime your sweat response.',
      'Ice in a buff or hat is a legal and effective cooling strategy for this race.',
    ],
    faq: [
      {
        q: 'Is the Honolulu Marathon a good race for a PR?',
        a: 'Almost never for non-tropical runners. Most runners should treat Honolulu as a bucket-list experience and plan their PR attempt for a cooler race. Enter your goal pace and Honolulu conditions in the calculator to see exactly how much slower to expect.',
      },
    ],
  },
  {
    slug: 'trail-running-altitude-pace',
    title: 'Trail Running Pace Calculator — Altitude & Elevation | Pace Forecast',
    h1: 'Trail Running Pace at Altitude — Elevation Adjustment Calculator',
    metaDesc: 'Calculate your trail running pace adjustment for altitude and mountain conditions. Plan your effort for high-elevation trail runs, ultras, and skyrunning races.',
    conditions: { temp: 50, humidity: 40, alt: 9000 },
    defaultPace: '11:00',
    intro: `Trail running at altitude is a different physiological challenge than road racing. Paces are inherently variable due to terrain, but the environmental adjustment for altitude and temperature applies equally. Use this calculator to understand your aerobic cost at elevation so you can pace your effort — and aid station targets — more accurately.`,
    facts: [
      'At 9,000 ft (2,740 m) a runner draws roughly 28% less oxygen per breath than at sea level.',
      'Trail pace is typically quoted in min/mile but effort is managed by heart rate or perceived exertion rather than GPS speed.',
      'Temperature drops roughly 3.5 °F per 1,000 ft of elevation gain — what starts warm at the trailhead is often cold at the summit.',
      'Mountain weather changes rapidly; the calculator can help you plan for different temperature scenarios.',
    ],
    tips: [
      'For trail ultras at altitude, ignore GPS pace and run by feel or heart rate. The terrain matters more than the altitude penalty alone.',
      'If you\'re acclimatized to moderate elevation (e.g. 4,000 ft), use the "Acclimatized to" tab to get a more accurate adjustment for your race at 9,000 ft.',
      'Allow 30–50% more time for the climb vs the descent — aid station planning should reflect this asymmetry.',
    ],
    faq: [
      {
        q: 'How do I pace a trail race at altitude?',
        a: 'Start with the altitude adjustment from this calculator as a reference for flats and runnable sections. On steep climbs, switch to power hiking — it\'s often faster than running uphill at altitude and saves glycogen. Use heart rate zones to manage effort across variable terrain.',
      },
    ],
  },
  {
    slug: 'las-vegas-marathon-pace-calculator',
    title: 'Las Vegas Marathon Pace Calculator — Night Race Conditions | Pace Forecast',
    h1: 'Rock \'n\' Roll Las Vegas Marathon Pace Adjustment',
    metaDesc: 'Plan your Las Vegas Marathon or half marathon pace. The night race runs in desert conditions — use this calculator for temperature and elevation adjustment with full splits.',
    conditions: { temp: 58, humidity: 25, alt: 2000 },
    defaultPace: '9:00',
    intro: `The Rock 'n' Roll Las Vegas Marathon and Half Marathon runs at night down the Strip — one of the most unique race experiences in the world. November night conditions are generally favorable (50–62 °F), but the 2,000 ft elevation and desert-dry air require some adjustment. The low humidity is actually a performance advantage: sweat evaporates efficiently, keeping you cooler than the raw temperature suggests.`,
    facts: [
      'Las Vegas sits at ~2,000 ft elevation — a mild but non-trivial altitude adjustment for sea-level runners.',
      'November night-race temperatures typically range from 48–62 °F — near ideal racing weather.',
      'Desert humidity of 15–30% means sweat evaporates very efficiently, partially offsetting the altitude cost.',
      'The race starts and finishes on the Las Vegas Strip with minimal elevation change.',
    ],
    tips: [
      'The low humidity at Las Vegas means dehydration risk is higher than the temperature suggests — drink on schedule.',
      'Night races make pre-race warm-up more important; your body temperature is lower than in a morning race.',
      'The Strip surface is asphalt and can be uneven between road sections — wear well-cushioned shoes.',
    ],
    faq: [
      {
        q: 'Is Las Vegas good for a marathon PR?',
        a: 'The conditions are generally favorable in November. The 2,000 ft elevation adds a small penalty (~1%) but low humidity and cool night temps help. Many runners run near their goal pace. Use the calculator with 2,000 ft altitude and the forecast temperature for a precise estimate.',
      },
    ],
  },
  {
    slug: 'london-marathon-pace-calculator',
    title: 'London Marathon Pace Calculator — Spring Race Conditions | Pace Forecast',
    h1: 'London Marathon Pace Adjustment — April Weather Planning',
    metaDesc: 'Plan your London Marathon pace for typical April conditions. Get a weather-adjusted pace and mile splits for race day in London.',
    conditions: { temp: 58, humidity: 72, alt: 40 },
    defaultPace: '8:30',
    intro: `The London Marathon in late April typically offers good racing conditions — temperatures in the mid-50s °F (13 °C) and near sea level. But London can occasionally deliver warm surprises: the 2018 race saw temperatures hit 73 °F (23 °C) and became the hottest London Marathon on record, with thousands of runners pulling out. This calculator helps you plan for both typical and atypical London days.`,
    facts: [
      'Typical London Marathon day: 55–62 °F (13–17 °C), 65–75% humidity — close to ideal racing conditions.',
      'Hot London days (above 68 °F) are unusual but have occurred — 2018 saw mass withdrawals and slower times across the field.',
      'London is essentially at sea level; altitude is not a factor.',
      'The course is point-to-point with a net elevation drop of ~75 ft — mild net downhill.',
    ],
    tips: [
      'On a typical London day you can race at or close to your goal pace. The calculator confirms this.',
      'Prepare a warm-day contingency plan regardless: check the forecast 72 hours out and be ready to dial back.',
      'The crowd support on the London course is among the best in the world — use it in the final 6 miles.',
    ],
    faq: [
      {
        q: 'Is London Marathon a good course for a PB?',
        a: 'In normal conditions, yes — cool temperatures, sea level, and net downhill make London one of the faster major marathon courses. Use this calculator with the forecast temperature on race morning to confirm your pace is appropriate.',
      },
    ],
  },
]

// ---------------------------------------------------------------------------
// HTML template
// ---------------------------------------------------------------------------

function buildPage(page) {
  const calcUrl = `https://paceforecast.com/?pace=${encodeURIComponent(page.defaultPace)}&temp=${page.conditions.temp}&humidity=${page.conditions.humidity}&alt=${page.conditions.alt}`

  const factsHtml = page.facts.map((f) => `<li>${f}</li>`).join('\n        ')
  const tipsHtml = page.tips.map((t) => `<li>${t}</li>`).join('\n        ')
  const faqHtml = page.faq
    .map(
      ({ q, a }) => `
      <div class="faq-item">
        <h3>${q}</h3>
        <p>${a}</p>
      </div>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${page.title}</title>
  <meta name="description" content="${page.metaDesc}" />
  <link rel="canonical" href="${BASE_URL}/${page.slug}" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${BASE_URL}/${page.slug}" />
  <meta property="og:title" content="${page.title}" />
  <meta property="og:description" content="${page.metaDesc}" />
  <meta property="og:image" content="${BASE_URL}/og.svg" />
  <meta property="og:site_name" content="Pace Forecast" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${page.title}" />
  <meta name="twitter:description" content="${page.metaDesc}" />
  <meta name="twitter:image" content="${BASE_URL}/og.svg" />

  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8701757095230799"
       crossorigin="anonymous"></script>

  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "${page.h1}",
    "description": "${page.metaDesc}",
    "url": "${BASE_URL}/${page.slug}",
    "publisher": {
      "@type": "Organization",
      "name": "Pace Forecast",
      "url": "${BASE_URL}"
    }
  }
  </script>

  <style>
    *, *::before, *::after { box-sizing: border-box; }
    :root {
      --bg: #0b1120; --card: #131c2e; --border: #25334d;
      --text: #e8eef7; --muted: #93a3bd; --accent: #2dd4bf;
      color-scheme: dark;
    }
    body {
      margin: 0; padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg); color: var(--text);
      line-height: 1.6; -webkit-font-smoothing: antialiased;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .site-header {
      background: #0f172a; border-bottom: 1px solid var(--border);
      padding: 14px 24px; display: flex; align-items: center; gap: 10px;
    }
    .site-header a { color: var(--text); font-weight: 800; font-size: 18px; }

    .wrap { max-width: 720px; margin: 0 auto; padding: 40px 20px 64px; }

    h1 { font-size: clamp(24px, 4vw, 36px); font-weight: 800; margin: 0 0 20px; letter-spacing: -0.02em; }
    h2 { font-size: 20px; font-weight: 700; margin: 40px 0 12px; color: var(--accent); }
    h3 { font-size: 16px; font-weight: 700; margin: 0 0 6px; }
    p { margin: 0 0 16px; color: var(--muted); font-size: 15px; }

    .intro { font-size: 16px; color: var(--text); border-left: 3px solid var(--accent); padding-left: 16px; margin-bottom: 32px; }

    .conditions-box {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 12px; padding: 20px 24px; margin-bottom: 32px;
      display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; text-align: center;
    }
    .cond-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
    .cond-value { font-size: 28px; font-weight: 800; font-family: ui-monospace, monospace; color: var(--text); }
    .cond-unit { font-size: 13px; color: var(--muted); }

    .cta-block { text-align: center; margin: 32px 0 40px; }
    .cta-btn {
      display: inline-block;
      background: linear-gradient(180deg, #2dd4bf, #14b8a6);
      color: #06231f; font-weight: 800; font-size: 16px;
      padding: 14px 32px; border-radius: 10px; text-decoration: none;
      transition: opacity .15s;
    }
    .cta-btn:hover { opacity: .9; text-decoration: none; }
    .cta-sub { margin-top: 10px; font-size: 13px; color: var(--muted); }

    ul { padding-left: 20px; color: var(--muted); font-size: 15px; }
    ul li { margin-bottom: 8px; }

    .faq-item { border-top: 1px solid var(--border); padding-top: 20px; margin-top: 20px; }
    .faq-item h3 { color: var(--text); }

    .site-footer {
      border-top: 1px solid var(--border); padding: 24px; text-align: center;
      font-size: 12px; color: var(--muted);
    }

    @media (max-width: 480px) {
      .conditions-box { grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .cond-value { font-size: 22px; }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <span>🏃</span>
    <a href="${BASE_URL}">Pace Forecast</a>
  </header>

  <div class="wrap">
    <h1>${page.h1}</h1>

    <p class="intro">${page.intro}</p>

    <div class="conditions-box">
      <div>
        <div class="cond-label">Temperature</div>
        <div class="cond-value">${page.conditions.temp}°</div>
        <div class="cond-unit">Fahrenheit</div>
      </div>
      <div>
        <div class="cond-label">Humidity</div>
        <div class="cond-value">${page.conditions.humidity}%</div>
        <div class="cond-unit">relative</div>
      </div>
      <div>
        <div class="cond-label">Altitude</div>
        <div class="cond-value">${page.conditions.alt.toLocaleString()}</div>
        <div class="cond-unit">feet</div>
      </div>
    </div>

    <div class="cta-block">
      <a class="cta-btn" href="${calcUrl}">Calculate My Adjusted Pace →</a>
      <p class="cta-sub">Pre-filled with the conditions above. Change any value to match your race forecast.</p>
    </div>

    <h2>Key Facts</h2>
    <ul>
        ${factsHtml}
    </ul>

    <h2>Race Day Tips</h2>
    <ul>
        ${tipsHtml}
    </ul>

    <h2>Frequently Asked Questions</h2>
    ${faqHtml}

    <div class="cta-block" style="margin-top:48px">
      <a class="cta-btn" href="${calcUrl}">Open the Calculator →</a>
    </div>
  </div>

  <footer class="site-footer">
    <p>
      <a href="${BASE_URL}">Pace Forecast</a> — Environmental Running Pace Calculator
      &nbsp;·&nbsp; Estimates are a planning aid; individual results vary.
    </p>
  </footer>
</body>
</html>`
}

// ---------------------------------------------------------------------------
// Sitemap builder
// ---------------------------------------------------------------------------

function buildSitemap(slugs) {
  const today = new Date().toISOString().split('T')[0]
  const urls = [
    `  <url><loc>${BASE_URL}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>`,
    ...slugs.map(
      (s) =>
        `  <url><loc>${BASE_URL}/${s}</loc><lastmod>${today}</lastmod><priority>0.8</priority></url>`,
    ),
  ].join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
}

// ---------------------------------------------------------------------------
// Write everything
// ---------------------------------------------------------------------------

let written = 0

for (const page of pages) {
  const html = buildPage(page)
  const dest = path.join(PUBLIC, `${page.slug}.html`)
  fs.writeFileSync(dest, html, 'utf8')
  console.log(`✓ ${page.slug}.html`)
  written++
}

const sitemap = buildSitemap(pages.map((p) => p.slug))
fs.writeFileSync(path.join(PUBLIC, 'sitemap.xml'), sitemap, 'utf8')
console.log('✓ sitemap.xml')

console.log(`\nDone — ${written} landing pages + sitemap written to public/`)
