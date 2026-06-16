import { useMemo, useRef, useState } from 'react'
import { Segmented } from './components/Segmented'
import { EnvironmentForm, type EnvValues } from './components/EnvironmentForm'
import { ResultDisplay } from './components/ResultDisplay'
import { SplitsTable } from './components/SplitsTable'
import { IntensityPicker } from './components/IntensityPicker'
import { adjustPace, IDEAL, type Env, type Intensity } from './lib/paceModel'
import { parseClock } from './lib/format'
import {
  cToF,
  fToC,
  ftToM,
  mToFt,
  type AltUnit,
  type PaceUnit,
  type TempUnit,
} from './lib/units'

type Tab = 'simple' | 'advanced' | 'splits'

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
      alt: num('alt', 0),
    } satisfies EnvValues,
    acc: {
      temp: num('accTemp', 50),
      humidity: num('accHumidity', 60),
      alt: num('accAlt', 0),
    } satisfies EnvValues,
  }
}

export default function App() {
  const [tab, setTab] = useState<Tab>('simple')
  const [showAcc, setShowAcc] = useState(false)
  const [intensity, setIntensity] = useState<Intensity>('marathon')

  const [paceUnit, setPaceUnit] = useState<PaceUnit>('mile')
  const [tempUnit, setTempUnit] = useState<TempUnit>('F')
  const [altUnit, setAltUnit] = useState<AltUnit>('ft')

  const minRef = useRef<HTMLInputElement>(null)
  const secRef = useRef<HTMLInputElement>(null)

  const [paceMin, setPaceMin] = useState<string>(() => {
    const s = parseClock(readParams().pace)
    return s !== null ? String(Math.floor(s / 60)) : '8'
  })
  const [paceSec, setPaceSec] = useState<string>(() => {
    const s = parseClock(readParams().pace)
    return s !== null ? String(Math.round(s % 60)).padStart(2, '0') : '00'
  })
  const [raceEnv, setRaceEnv] = useState<EnvValues>(() => readParams().race)
  const [accEnv, setAccEnv] = useState<EnvValues>(() => readParams().acc)

  const minNum = Number(paceMin)
  const secNum = Number(paceSec)
  const paceValid =
    paceMin !== '' && paceSec !== '' &&
    minNum >= 1 && minNum <= 59 &&
    secNum >= 0 && secNum <= 59
  const basePaceSec: number | null = paceValid ? minNum * 60 + secNum : null

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
    const newSec = Math.round(basePaceSec * factor)
    setPaceMin(String(Math.floor(newSec / 60)))
    setPaceSec(String(newSec % 60).padStart(2, '0'))
    setPaceUnit(next)
  }

  // Simple: temperature only, fixed humidity + sea level, no intensity scaling
  const simpleResult = useMemo(() => {
    if (basePaceSec === null) return null
    const tempC = tempUnit === 'F' ? fToC(raceEnv.temp) : raceEnv.temp
    return adjustPace(basePaceSec, { tempC, humidity: 60, altM: 0 })
  }, [basePaceSec, raceEnv.temp, tempUnit])

  // Advanced: full environment + acclimatization + intensity
  const advancedResults = useMemo(() => {
    if (basePaceSec === null) return null
    const race = toEnv(raceEnv, tempUnit, altUnit)
    const acc = toEnv(accEnv, tempUnit, altUnit)
    return {
      base: adjustPace(basePaceSec, race, IDEAL, intensity),
      acclimated: adjustPace(basePaceSec, race, acc, intensity),
    }
  }, [basePaceSec, raceEnv, accEnv, tempUnit, altUnit, intensity])

  const advancedResult = advancedResults
    ? (showAcc ? advancedResults.acclimated : advancedResults.base)
    : null

  // Splits use the most detailed result available
  const splitsPaceSec =
    (advancedResult ?? simpleResult)?.adjustedPaceSec ?? basePaceSec ?? 0

  const paceLabel = paceValid ? `${paceMin}:${paceSec}` : 'your pace'

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
        {/* Goal pace + units — shared across all tabs */}
        <section className="panel">
          <div className="paceinput-row">
            <label className="field field--inline">
              <span className="field__label">Goal pace</span>
              <div className="paceinput">
                <input
                  ref={minRef}
                  className={'paceinput__seg mono' + (!paceValid && paceMin === '' ? ' is-invalid' : '')}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  placeholder="8"
                  value={paceMin}
                  autoComplete="off"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                    setPaceMin(val)
                    if (val.length === 2) secRef.current?.focus()
                  }}
                  onFocus={(e) => e.target.select()}
                  aria-label="Pace minutes"
                />
                <span className="paceinput__colon mono">:</span>
                <input
                  ref={secRef}
                  className={'paceinput__seg mono' + (!paceValid && paceSec === '' ? ' is-invalid' : '')}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={2}
                  placeholder="00"
                  value={paceSec}
                  autoComplete="off"
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 2)
                    setPaceSec(val)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && paceSec === '') minRef.current?.focus()
                  }}
                  onBlur={() => {
                    if (paceSec.length === 1) setPaceSec(paceSec.padStart(2, '0'))
                  }}
                  onFocus={(e) => e.target.select()}
                  aria-label="Pace seconds"
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
              {tab !== 'simple' && (
                <Segmented
                  ariaLabel="Altitude unit"
                  options={[
                    { value: 'ft', label: 'ft' },
                    { value: 'm', label: 'm' },
                  ]}
                  value={altUnit}
                  onChange={switchAltUnit}
                />
              )}
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="tabs">
          <Segmented
            ariaLabel="Section"
            options={[
              { value: 'simple', label: 'Simple' },
              { value: 'advanced', label: 'Advanced' },
              { value: 'splits', label: 'Splits' },
            ]}
            value={tab}
            onChange={(t) => setTab(t as Tab)}
          />
        </nav>

        {/* ── Simple tab ── */}
        {tab === 'simple' && (
          <section className="tabpanel">
            <EnvironmentForm
              values={raceEnv}
              onChange={setRaceEnv}
              tempUnit={tempUnit}
              altUnit={altUnit}
              fields={['temp']}
            />
            {paceValid && simpleResult && (
              <>
                <ResultDisplay
                  title="Adjusted pace"
                  basePaceSec={basePaceSec!}
                  result={simpleResult}
                  paceUnit={paceUnit}
                  compact
                />
                <p className="simple-nudge">
                  For humidity, altitude &amp; intensity adjustments →{' '}
                  <button className="simple-nudge__link" onClick={() => setTab('advanced')}>
                    Advanced
                  </button>
                </p>
              </>
            )}
          </section>
        )}

        {/* ── Advanced tab ── */}
        {tab === 'advanced' && (
          <section className="tabpanel">
            {/* Intensity first — defines what the pace means */}
            <div className="intensity-section">
              <IntensityPicker
                value={intensity}
                onChange={setIntensity}
                paceLabel={paceLabel}
              />
            </div>

            <EnvironmentForm
              values={raceEnv}
              onChange={setRaceEnv}
              tempUnit={tempUnit}
              altUnit={altUnit}
              dropdownFields={['humidity', 'altitude']}
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
                  dropdownFields={['humidity', 'altitude']}
                />
              </div>
            )}

            {paceValid && advancedResult && (
              <ResultDisplay
                title={showAcc ? 'Adjusted for your training climate' : 'Adjusted pace'}
                basePaceSec={basePaceSec!}
                result={advancedResult}
                paceUnit={paceUnit}
                isAcclimatized={showAcc}
              />
            )}
          </section>
        )}

        {/* ── Splits tab ── */}
        {tab === 'splits' && (
          <section className="tabpanel">
            <p className="tabpanel__lead">
              {advancedResult
                ? showAcc
                  ? 'Splits at your training-climate-adjusted pace.'
                  : 'Splits at your advanced adjusted pace.'
                : 'Splits at your temperature-adjusted pace (Simple estimate).'}
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
