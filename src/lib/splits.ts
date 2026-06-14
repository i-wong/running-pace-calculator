import { METERS_PER_MILE, type PaceUnit, paceUnitMeters } from './units'

export interface SplitRow {
  label: string
  meters: number
  /** Time to cover this distance at the given pace, in seconds. */
  seconds: number
}

/** Distances to show in the splits tab. */
const SPLIT_DISTANCES: { label: string; meters: number }[] = [
  { label: '100 m', meters: 100 },
  { label: '200 m', meters: 200 },
  { label: '400 m', meters: 400 },
  { label: '800 m', meters: 800 },
  { label: '1 km', meters: 1000 },
  { label: '1 mile', meters: METERS_PER_MILE },
  { label: '5 km', meters: 5000 },
  { label: '10 km', meters: 10000 },
  { label: 'Half marathon', meters: 21097.5 },
  { label: 'Marathon', meters: 42195 },
]

/**
 * Build split rows for a pace expressed in seconds per pace unit (km or mile).
 */
export function buildSplits(paceSecPerUnit: number, unit: PaceUnit): SplitRow[] {
  const secPerMeter = paceSecPerUnit / paceUnitMeters(unit)
  return SPLIT_DISTANCES.map((d) => ({
    label: d.label,
    meters: d.meters,
    seconds: secPerMeter * d.meters,
  }))
}
