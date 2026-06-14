// Unit conversion helpers. Internally the app stores everything in metric
// (°C, meters) and seconds, converting only at the UI edges.

export type PaceUnit = 'km' | 'mile'
export type TempUnit = 'F' | 'C'
export type AltUnit = 'ft' | 'm'

export const METERS_PER_MILE = 1609.344

export function fToC(f: number): number {
  return ((f - 32) * 5) / 9
}

export function cToF(c: number): number {
  return (c * 9) / 5 + 32
}

export function ftToM(ft: number): number {
  return ft * 0.3048
}

export function mToFt(m: number): number {
  return m / 0.3048
}

/** Meters covered by one pace unit (1 km or 1 mile). */
export function paceUnitMeters(unit: PaceUnit): number {
  return unit === 'km' ? 1000 : METERS_PER_MILE
}
