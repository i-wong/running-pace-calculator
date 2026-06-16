import { INTENSITIES, INTENSITY_INFO, type Intensity } from '../lib/paceModel'

interface IntensityPickerProps {
  value: Intensity
  onChange: (v: Intensity) => void
  paceLabel?: string
}

export function IntensityPicker({ value, onChange, paceLabel }: IntensityPickerProps) {
  const info = INTENSITY_INFO[value]
  return (
    <div className="intensity-picker">
      <span className="field__label">
        {paceLabel ? `What does ${paceLabel} represent?` : 'What intensity is your pace?'}
      </span>
      <div className="intensity-pills">
        {INTENSITIES.map((i) => (
          <button
            key={i}
            className={'intensity-pill' + (value === i ? ' is-active' : '')}
            onClick={() => onChange(i)}
            type="button"
          >
            {INTENSITY_INFO[i].abbr}
          </button>
        ))}
      </div>
      <p className="intensity-desc">
        <strong>{info.label}</strong> — {info.description}
      </p>
    </div>
  )
}
