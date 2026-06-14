import { useMemo, useState } from 'react'
import { Segmented } from './components/Segmented'
import { EnvironmentForm, type EnvValues } from './components/EnvironmentForm'
import { ResultDisplay } from './components/ResultDisplay'
import { SplitsTable } from './components/SplitsTable'
import { adjustPace, type Env } from './lib/paceModel'
import { parseClock, formatPace } from './lib/format'
import {
  cToF,
  fToC,
  ftToM,
  mToFt,
  type AltUnit,
  type PaceUnit,
  type TempUnit,
} from './lib/units'

type Tab = 'race' | 'acclimated' | 'splits'

/** Convert display-unit env values to the metric Env the model expects. */
function toEnv(v: EnvValues, tempUnit: TempUnit, altUnit: AltUnit): Env {
  return {
    tempC: tempUnit === 'F' ? fToC(v.temp) : v.temp,
    humidity: v.humidity,
    altM: altUnit === 'ft' ? ftToM(v.alt) : v.alt,
  }
}

/**
 * Read optional URL search params so landing pages can deep-link into the
 * calculator with conditions pre-filled.
 * e.g. ?pace=8:00&temp=85&humidity=80&alt=0&accTemp=55&accHumidity=65&accAlt=200
 * All values are in imperial units (°F, feet).
 */
function readParams() {
  const p = new URLSearchParams(window.location.search)
  const num = (key: string, fallback: number) => {
    const v = Number(p.get(key))
    return Number.isFinite(v) ? v : fallback
  }
  return {
    pace: p.get('pace') ?? '8:00',
    race: {
      temp: num('temp', 78),
      humidity: num('humidity', 70),
      alt: num('alt', 200),
    } satisfies EnvValues,
    acc: {
      temp: num('accTemp', 50),
      humidity: num('accHumidity', 60),
      alt: num('accAlt', 150),
    } satisfies EnvValues,
  }
}

const INIT = readParams()

export default function App() {
  const [tab, setTab] = useState<Tab>('race')

  // Units — always start in imperial; landing pages supply °F / feet
  const [paceUnit, setPaceUnit] = useState<PaceUnit>('mile')
  const [tempUnit, setTempUnit] = useState<TempUnit>('F')
  const [altUnit, setAltUnit] = useState<AltUnit>('ft')

  // Goal pace (string so the field can be edited freely)
  const [paceInput, setPaceInput] = useState(INIT.pace)

  // Environments, stored in the active display units.
  const [raceEnv, setRaceEnv] = useState<EnvValues>(INIT.race)
  const [accEnv, setAccEnv] = useState<EnvValues>(INIT.acc)

  const basePaceSec = parseClock(paceInput)
  const paceValid = basePaceSec !== null && basePaceSec > 0

  // --- Unit toggles convert existing values so physical meaning is preserved ---
  const switchTempUnit = (next: TempUnit) => {
    if (next === tempUnit) return
    const conv = (t: number) => (next === 'C' ? fToC(t) : cToF(t))
    setRaceEnv((e) => ({ ...e, temp: Math.round(conv(e.temp) * 10) / 10 }))
    setAccEnv((e) => ({ ...e, temp: Math.round(conv(e.temp) * 10) / 10 }))
    setTempUnit(next)
  }

  const switchAltUnit = (next: AltUnit) => {
    if (next === altUnit) return
    const conv = (a: number) => (next === 'm' ? ftToM(a) : mToFt(a))
    setRaceEnv((e) => ({ ...e, alt: Math.round(conv(e.alt)) }))
    setAccEnv((e) => ({ ...e, alt: Math.round(conv(e.alt)) }))
    setAltUnit(next)
  }

  const switchPaceUnit = (next: PaceUnit) => {
    if (next === paceUnit || basePaceSec === null) return
    // Rescale the pace number so the implied speed stays the same.
    const factor = next === 'km' ? 1000 / 1609.344 : 1609.344 / 1000
    setPaceInput(formatPace(basePaceSec * factor))
    setPaceUnit(next)
  }

  // --- Results ---------------------------------------------------------------
  const results = useMemo(() => {
    if (basePaceSec === null) return null
    const race = toEnv(raceEnv, tempUnit, altUnit)
    const acc = toEnv(accEnv, tempUnit, altUnit)
    return {
      simple: adjustPace(basePaceSec, race), // baseline = ideal conditions
      acclimated: adjustPace(basePaceSec, race, acc), // baseline = your home conditions
    }
  }, [basePaceSec, raceEnv, accEnv, tempUnit, altUnit])

  const splitsPaceSec = results
    ? results.acclimated.adjustedPaceSec
    : basePaceSec ?? 0

  return (
    <div className="app">
      <header className="hero">
        <h1 className="hero__title">
          <span className="hero__mark">🏃</span> Pace Forecast
        </h1>
        <p className="hero__sub">
          Adjust your goal pace for heat, humidity &amp; altitude — then plan your splits.
        </p>
      </header>

      <main className="card">
        {/* Goal pace + units (shared across all tabs) */}
        <section className="panel">
          <div className="panel__row">
            <label className="field">
              <span className="field__label">Goal pace</span>
              <div className="paceinput">
                <input
                  className={'paceinput__field mono' + (paceValid ? '' : ' is-invalid')}
                  type="text"
                  inputMode="numeric"
                  placeholder="8:00"
                  value={paceInput}
                  onChange={(e) => setPaceInput(e.target.value)}
                  aria-label="Goal pace, minutes per distance unit"
                />
                <Segmented
                  ariaLabel="Pace unit"
                  options={[
                    { value: 'mile', label: '/mi' },
                    { value: 'km', label: '/km' },
                  ]}
                  value={paceUnit}
                  onChange={switchPaceUnit}
                />
              </div>
              {!paceValid && (
                <span className="field__error">Enter pace as m:ss, e.g. 8:00</span>
              )}
            </label>
          </div>

          <div className="unitbar">
            <Segmented
              ariaLabel="Temperature unit"
              options={[
                { value: 'F', label: '°F' },
                { value: 'C', label: '°C' },
              ]}
              value={tempUnit}
              onChange={switchTempUnit}
            />
            <Segmented
              ariaLabel="Altitude unit"
              options={[
                { value: 'ft', label: 'feet' },
                { value: 'm', label: 'meters' },
              ]}
              value={altUnit}
              onChange={switchAltUnit}
            />
          </div>
        </section>

        {/* Tabs */}
        <nav className="tabs">
          <Segmented
            ariaLabel="Calculator section"
            options={[
              { value: 'race', label: 'Race conditions' },
              { value: 'acclimated', label: 'Acclimatized to' },
              { value: 'splits', label: 'Splits' },
            ]}
            value={tab}
            onChange={(t) => setTab(t as Tab)}
          />
        </nav>

        {/* Tab content */}
        {tab === 'race' && (
          <section className="tabpanel">
            <p className="tabpanel__lead">
              Set the conditions you&apos;ll actually be racing in. We compare them to
              ideal racing weather (cool &amp; dry, sea level).
            </p>
            <EnvironmentForm
              values={raceEnv}
              onChange={setRaceEnv}
              tempUnit={tempUnit}
              altUnit={altUnit}
            />
            {paceValid && results && (
              <ResultDisplay
                title="Race-day pace"
                basePaceSec={basePaceSec}
                result={results.simple}
                paceUnit={paceUnit}
              />
            )}
          </section>
        )}

        {tab === 'acclimated' && (
          <section className="tabpanel">
            <p className="tabpanel__lead">
              Now tell us the conditions you train in and are <strong>most
              acclimatized to</strong>. If your goal pace is realistic for{' '}
              <em>your</em> home weather, we credit that adaptation back — so the
              race-day estimate is more accurate than the simple version.
            </p>
            <EnvironmentForm
              values={accEnv}
              onChange={setAccEnv}
              tempUnit={tempUnit}
              altUnit={altUnit}
            />
            {paceValid && results && (
              <ResultDisplay
                title="Acclimatization-adjusted race pace"
                basePaceSec={basePaceSec}
                result={results.acclimated}
                paceUnit={paceUnit}
                showBaseline
              />
            )}
          </section>
        )}

        {tab === 'splits' && (
          <section className="tabpanel">
            <p className="tabpanel__lead">
              Splits for your acclimatization-adjusted race pace. Switch the goal
              pace or conditions on the other tabs to update these instantly.
            </p>
            {paceValid ? (
              <SplitsTable paceSec={splitsPaceSec} paceUnit={paceUnit} />
            ) : (
              <p className="empty">Enter a valid goal pace to see splits.</p>
            )}
          </section>
        )}
      </main>

      <footer className="foot">
        <p>
          Estimates are a planning aid based on common heat &amp; altitude running
          guidance — individual response varies. On hot or high-altitude days, run
          by effort first.
        </p>
      </footer>
    </div>
  )
}
