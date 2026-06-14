import type { AdjustResult } from '../lib/paceModel'
import type { PaceUnit } from '../lib/units'
import { formatPace, formatSignedSeconds } from '../lib/format'

interface ResultDisplayProps {
  basePaceSec: number
  result: AdjustResult
  paceUnit: PaceUnit
  title: string
  /** When true, show net (delta-based) breakdown instead of raw race cost. */
  isAcclimatized?: boolean
}

export function ResultDisplay({
  basePaceSec,
  result,
  paceUnit,
  title,
  isAcclimatized = false,
}: ResultDisplayProps) {
  const slowerPct = (result.factor - 1) * 100
  const isSlower = result.deltaSec >= 0.5
  const isFaster = result.deltaSec <= -0.5
  const unitLabel = `/${paceUnit}`

  const heatVal = isAcclimatized ? result.netHeatCost : result.raceCost.heat
  const altVal = isAcclimatized ? result.netAltCost : result.raceCost.altitude
  const heatLabel = isAcclimatized ? 'Heat shock (vs training climate)' : 'Heat cost (temp + humidity)'
  const altLabel = isAcclimatized ? 'Altitude gain (vs training)' : 'Altitude cost'

  const fmtPct = (v: number) => `${v >= 0 ? '+' : ''}${(v * 100).toFixed(1)}%`

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
          <span className="mono">{formatPace(basePaceSec)}{unitLabel}</span>
        </div>
        <div className={`result__row${heatVal < 0 ? ' result__row--credit' : ''}`}>
          <span>{heatLabel}</span>
          <span className="mono">{fmtPct(heatVal)}</span>
        </div>
        <div className={`result__row${altVal < 0 ? ' result__row--credit' : ''}`}>
          <span>{altLabel}</span>
          <span className="mono">{fmtPct(altVal)}</span>
        </div>
      </div>
    </div>
  )
}
