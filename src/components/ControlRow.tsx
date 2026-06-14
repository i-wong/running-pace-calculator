interface ControlRowProps {
  icon: string
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (value: number) => void
  /** Optional human hint shown under the label, e.g. "feels balmy". */
  hint?: string
}

/** A labelled slider paired with a numeric input, kept in sync. */
export function ControlRow({
  icon,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  hint,
}: ControlRowProps) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n))
  const pct = ((clamp(value) - min) / (max - min)) * 100

  return (
    <div className="control">
      <div className="control__head">
        <span className="control__label">
          <span className="control__icon" aria-hidden="true">
            {icon}
          </span>
          {label}
        </span>
        <span className="control__valuebox">
          <input
            className="control__number"
            type="number"
            inputMode="decimal"
            value={Number.isFinite(value) ? value : ''}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (Number.isFinite(n)) onChange(n)
            }}
            onBlur={(e) => {
              const n = Number(e.target.value)
              onChange(clamp(Number.isFinite(n) ? n : min))
            }}
          />
          <span className="control__unit">{unit}</span>
        </span>
      </div>
      <input
        className="control__slider"
        type="range"
        min={min}
        max={max}
        step={step}
        value={clamp(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--fill': `${pct}%` } as React.CSSProperties}
      />
      {hint && <p className="control__hint">{hint}</p>}
    </div>
  )
}
