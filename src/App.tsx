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

type Tab = 'conditions' | 'splits'

function toEnv(v: EnvValues, tempUnit: TempUnit, altUnit: AltUnit): Env {
  return {
    tempC: tempUnit === 'F' ? fToC(v.temp) : v.temp,
    humidity: v.humidity,
    altM: altUnit === 'ft' ? ftToM(v.alt) : v.alt,
  }
}

function readParams() {
  const p = new URLSearchParams(window.location.search)
  const num = (key: string, fallback: number) => {
    const raw = p.get(key)
    if (raw === null) return fallback
    const v = Number(raw)
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

export default function App() {
  const [tab, setTab] = useState<Tab>('conditions')
  const [showAcc, setShowAcc] = useState(false)

  const [paceUnit, setPaceUnit] = useState<PaceUnit>('mile')
  const [tempUnit, setTempUnit] = useState<TempUnit>('F')
  const [altUnit, setAltUnit] = useState<AltUnit>('ft')

  // Lazy initialisers so readParams() runs inside the component, avoiding
  // stale module-level state during HMR.
  const [paceInput, setPaceInput] = useState(() => readParams().pace)
  const [raceEnv, setRaceEnv] = useState<EnvValues>(() => readParams().race)
  const [accEnv, setAccEnv] = useState<EnvValues>(() => readParams().acc)

  const basePaceSec = parseClock(paceInput)
  const paceValid = basePaceSec !== null && basePaceSec > 0

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
    const factor = next === 'km' ? 1000 / 1609.344 : 1609.344 / 1000
    setPaceInput(formatPace(basePaceSec * factor))
    setPaceUnit(next)
  }

  const results = useMemo(() => {
    if (basePaceSec === null) return null
    const race = toEnv(raceEnv, tempUnit, altUnit)
    const acc = toEnv(accEnv, tempUnit, altUnit)
    return {
      simple: adjustPace(basePaceSec, race),
      acclimated: adjustPace(basePaceSec, race, acc),
    }
  }, [basePaceSec, raceEnv, accEnv, tempUnit, altUnit])

  const activeResult = results ? (showAcc ? results.acclimated : results.simple) : null
  const splitsPaceSec = activeResult?.adjustedPaceSec ?? basePaceSec ?? 0

  return (
    <div className="app">
      <header className="hero">
        <h1 className="hero__title">
          <span className="hero__mark">🏃</span> Pace Forecast
        </h1>
        <p className="hero__sub">
          Adjust your pace for heat, humidity &amp; altitude.
        </p>
      </header>

      <main className="card">
        {/* Goal pace + units */}
        <section className="panel">
          <div className="paceinput-row">
            <label className="field field--inline">
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
                  { value: 'ft', label: 'ft' },
                  { value: 'm', label: 'm' },
                ]}
                value={altUnit}
                onChange={switchAltUnit}
              />
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="tabs">
          <Segmented
            ariaLabel="Section"
            options={[
              { value: 'conditions', label: 'Current conditions' },
              { value: 'splits', label: 'Splits' },
            ]}
            value={tab}
            onChange={(t) => setTab(t as Tab)}
          />
        </nav>

        {tab === 'conditions' && (
          <section className="tabpanel">
            <EnvironmentForm
              values={raceEnv}
              onChange={setRaceEnv}
              tempUnit={tempUnit}
              altUnit={altUnit}
            />

            {/* Training climate toggle */}
            <button
              className={'acc-toggle-btn' + (showAcc ? ' is-open' : '')}
              onClick={() => setShowAcc((v) => !v)}
              aria-expanded={showAcc}
            >
              <span>
                {showAcc ? '▾' : '▸'}&nbsp; My training climate
                <span className="acc-toggle-badge">optional</span>
              </span>
              <span className="acc-toggle-hint">
                {showAcc ? 'Hide' : 'Add for a better estimate'}
              </span>
            </button>

            {showAcc && (
              <div className="acc-panel">
                <p className="acc-panel__lead">
                  Set the conditions you normally train in. A runner adapted to 45 °F
                  will feel 60 °F harder than one adapted to 55 °F — this accounts for
                  that gap.
                </p>
                <EnvironmentForm
                  values={accEnv}
                  onChange={setAccEnv}
                  tempUnit={tempUnit}
                  altUnit={altUnit}
                />
              </div>
            )}

            {paceValid && activeResult && (
              <ResultDisplay
                title={showAcc ? 'Adjusted for your training climate' : 'Adjusted pace'}
                basePaceSec={basePaceSec}
                result={activeResult}
                paceUnit={paceUnit}
                isAcclimatized={showAcc}
              />
            )}
          </section>
        )}

        {tab === 'splits' && (
          <section className="tabpanel">
            <p className="tabpanel__lead">
              {showAcc
                ? 'Splits at your training-climate-adjusted pace.'
                : 'Splits at your adjusted pace. Enable "My training climate" above for a more personalised estimate.'}
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
          Estimates are a planning aid — individual response varies. On hot or
          high-altitude days, run by effort first.
        </p>
      </footer>
    </div>
  )
}
