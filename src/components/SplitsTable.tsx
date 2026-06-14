import { buildSplits } from '../lib/splits'
import { formatDuration, formatPace } from '../lib/format'
import type { PaceUnit } from '../lib/units'

interface SplitsTableProps {
  paceSec: number
  paceUnit: PaceUnit
}

export function SplitsTable({ paceSec, paceUnit }: SplitsTableProps) {
  const rows = buildSplits(paceSec, paceUnit)

  return (
    <div className="splits">
      <p className="splits__caption">
        Target times at your adjusted pace of{' '}
        <strong className="mono">
          {formatPace(paceSec)}/{paceUnit}
        </strong>
        .
      </p>
      <table className="splits__table">
        <thead>
          <tr>
            <th>Distance</th>
            <th className="num">Target time</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="num mono">{formatDuration(row.seconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
