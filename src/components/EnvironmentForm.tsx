import { ControlRow } from './ControlRow'
import type { AltUnit, TempUnit } from '../lib/units'

export interface EnvValues {
  /** Temperature in the active temp unit. */
  temp: number
  /** Relative humidity %. */
  humidity: number
  /** Altitude in the active altitude unit. */
  alt: number
}

interface EnvironmentFormProps {
  values: EnvValues
  onChange: (next: EnvValues) => void
  tempUnit: TempUnit
  altUnit: AltUnit
  fields?: ('temp' | 'humidity' | 'altitude')[]
  /** Render these fields as dropdowns instead of sliders. */
  dropdownFields?: ('humidity' | 'altitude')[]
}

const HUMIDITY_OPTIONS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
const ALT_OPTIONS_FT = [0, 500, 1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 10000, 12000]
const ALT_OPTIONS_M  = [0, 150, 300,  600,  900, 1200, 1500, 1800, 2100, 2400, 3000,  3600]

function snap(value: number, options: number[]): number {
  return options.reduce((a, b) => Math.abs(b - value) < Math.abs(a - value) ? b : a)
}

function SelectRow({ icon, label, unit, value, options, onChange, hint }: {
  icon: string
  label: string
  unit: string
  value: number
  options: number[]
  onChange: (v: number) => void
  hint?: string
}) {
  const snapped = snap(value, options)
  return (
    <div className="control">
      <div className="control__head">
        <span className="control__label">
          <span className="control__icon" aria-hidden="true">{icon}</span>
          {label}
        </span>
        <span className="control__valuebox">
          <select
            className="env-select mono"
            value={snapped}
            onChange={(e) => onChange(Number(e.target.value))}
          >
            {options.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
          <span className="control__unit">{unit}</span>
        </span>
      </div>
      {hint && <p className="control__hint">{hint}</p>}
    </div>
  )
}

function tempHint(temp: number, unit: TempUnit): string {
  const c = unit === 'F' ? ((temp - 32) * 5) / 9 : temp
  if (c <= 5) return 'Cold — near-ideal or slightly stiff'
  if (c <= 12) return 'Cool — ideal racing weather'
  if (c <= 18) return 'Mild — minor heat cost'
  if (c <= 24) return 'Warm — noticeable slowdown'
  if (c <= 30) return 'Hot — significant slowdown'
  return 'Very hot — run by effort, not pace'
}

function humidityHint(h: number): string {
  if (h < 40) return 'Dry'
  if (h < 60) return 'Comfortable'
  if (h < 80) return 'Humid — sweat evaporates slowly'
  return 'Oppressive — major cooling penalty'
}

function altHint(alt: number, unit: AltUnit): string {
  const m = unit === 'ft' ? alt * 0.3048 : alt
  if (m < 300) return 'Effectively sea level'
  if (m < 1200) return 'Low elevation — slight effect'
  if (m < 2400) return 'Moderate altitude — thinner air'
  return 'High altitude — meaningful aerobic cost'
}

export function EnvironmentForm({
  values,
  onChange,
  tempUnit,
  altUnit,
  fields = ['temp', 'humidity', 'altitude'],
  dropdownFields = [],
}: EnvironmentFormProps) {
  const show = (f: 'temp' | 'humidity' | 'altitude') => fields.includes(f)
  const asDropdown = (f: 'humidity' | 'altitude') => dropdownFields.includes(f)
  const set = (patch: Partial<EnvValues>) => onChange({ ...values, ...patch })

  const tempRange =
    tempUnit === 'F'
      ? { min: 20, max: 110, step: 1 }
      : { min: -7, max: 43, step: 0.5 }

  const altRange =
    altUnit === 'ft'
      ? { min: 0, max: 13000, step: 100 }
      : { min: 0, max: 4000, step: 25 }

  const altOptions = altUnit === 'ft' ? ALT_OPTIONS_FT : ALT_OPTIONS_M

  return (
    <div className="envform">
      {show('temp') && (
        <ControlRow
          icon="🌡️"
          label="Temperature"
          unit={`°${tempUnit}`}
          value={values.temp}
          {...tempRange}
          onChange={(temp) => set({ temp })}
          hint={tempHint(values.temp, tempUnit)}
        />
      )}
      {show('humidity') && (
        asDropdown('humidity') ? (
          <SelectRow
            icon="💧"
            label="Humidity"
            unit="%"
            value={values.humidity}
            options={HUMIDITY_OPTIONS}
            onChange={(humidity) => set({ humidity })}
            hint={humidityHint(snap(values.humidity, HUMIDITY_OPTIONS))}
          />
        ) : (
          <ControlRow
            icon="💧"
            label="Humidity"
            unit="%"
            value={values.humidity}
            min={0}
            max={100}
            step={1}
            onChange={(humidity) => set({ humidity })}
            hint={humidityHint(values.humidity)}
          />
        )
      )}
      {show('altitude') && (
        asDropdown('altitude') ? (
          <SelectRow
            icon="⛰️"
            label="Altitude"
            unit={altUnit}
            value={values.alt}
            options={altOptions}
            onChange={(alt) => set({ alt })}
            hint={altHint(snap(values.alt, altOptions), altUnit)}
          />
        ) : (
          <ControlRow
            icon="⛰️"
            label="Altitude"
            unit={altUnit}
            value={values.alt}
            {...altRange}
            onChange={(alt) => set({ alt })}
            hint={altHint(values.alt, altUnit)}
          />
        )
      )}
    </div>
  )
}
