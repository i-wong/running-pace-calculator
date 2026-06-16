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
}: EnvironmentFormProps) {
  const show = (f: 'temp' | 'humidity' | 'altitude') => fields.includes(f)
  const set = (patch: Partial<EnvValues>) => onChange({ ...values, ...patch })

  const tempRange =
    tempUnit === 'F'
      ? { min: 20, max: 110, step: 1 }
      : { min: -7, max: 43, step: 0.5 }

  const altRange =
    altUnit === 'ft'
      ? { min: 0, max: 13000, step: 100 }
      : { min: 0, max: 4000, step: 25 }

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
      )}
      {show('altitude') && (
        <ControlRow
          icon="⛰️"
          label="Altitude"
          unit={altUnit}
          value={values.alt}
          {...altRange}
          onChange={(alt) => set({ alt })}
          hint={altHint(values.alt, altUnit)}
        />
      )}
    </div>
  )
}
