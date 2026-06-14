import type { AdjustResult } from '../lib/paceModel'
import type { PaceUnit } from '../lib/units'
import { formatPace, formatSignedSeconds } from '../lib/format'

interface ResultDisplayProps {
  basePaceSec: number
  result: AdjustResult
  paceUnit: PaceUnit
  /** Heading above the big number, e.g. "Race-day pace". */
  title: string
  /** Whether to show the acclimatization baseline row. */
  showBaseline?: boolean
}

export function ResultDisplay({
  basePaceSec,
  result,
  paceUnit,
  title,
  showBaseline = false,
}: ResultDisplayProps) {
  const slowerPct = (result.factor - 1) * 100
  const isSlower = result.deltaSec >= 0.5
  const isFaster = result.deltaSec <= -0.5
  const unitLabel = `/${paceUnit}`

  return (
    <div className="result">
      <div className="result__title">{title}</div>
      <div className="result__big">
        {formatPace(result.adjustedPaceSec)}
        <span className="result__unit">{unitLabel}</span>
      </div>

      <div
        className={
          'result__delta ' +
          (isSlower ? 'is-slower' : isFaster ? 'is-faster' : 'is-even')
        }
      >
        {isSlower && `${formatSignedSeconds(result.deltaSec)}${unitLabel} slower`}
        {isFaster && `${formatSignedSeconds(result.deltaSec)}${unitLabel} faster`}
        {!isSlower && !isFaster && 'Essentially unchanged'}
        <span className="result__pct">
          {slowerPct >= 0 ? '+' : ''}
          {slowerPct.toFixed(1)}%
        </span>
      </div>

      <div className="result__rows">
        <div className="result__row">
          <span>Your goal pace</span>
          <span className="mono">
            {formatPace(basePaceSec)}
            {unitLabel}
          </span>
        </div>
        <div className="result__row">
          <span>Heat cost (temp + humidity)</span>
          <span className="mono">+{(result.raceCost.heat * 100).toFixed(1)}%</span>
        </div>
        <div className="result__row">
          <span>Altitude cost</span>
          <span className="mono">+{(result.raceCost.altitude * 100).toFixed(1)}%</span>
        </div>
        {showBaseline && (
          <div className="result__row result__row--credit">
            <span>Acclimatization credit</span>
            <span className="mono">−{(result.acclimatedCost.total * 100).toFixed(1)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
