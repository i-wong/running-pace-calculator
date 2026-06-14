// -----------------------------------------------------------------------------
// Environmental pace-adjustment model
// -----------------------------------------------------------------------------
//
// The model expresses how much *slower* a runner gets under a given set of
// conditions as a fractional "performance cost" relative to ideal racing
// weather (cool, dry, sea level). A cost of 0.06 means ~6% slower.
//
// adjusted_pace = base_pace * (1 + cost(race_env)) / (1 + cost(acclimated_env))
//
// The acclimated environment matters because a goal pace is something you can
// actually hit in *your* normal training conditions — not in a physiology lab.
// If you train in warm, humid, or high-altitude conditions you carry a built-in
// adaptation, so we divide it back out before applying the race-day cost.
//
// These coefficients are practitioner estimates synthesised from commonly cited
// heat/altitude running guidance (Daniels' tables, runner heat-slowdown charts).
// They are a planning aid, not a physiological guarantee — individuals vary.

export interface Env {
  /** Temperature in degrees Celsius. */
  tempC: number
  /** Relative humidity, 0–100 (%). */
  humidity: number
  /** Altitude in meters above sea level. */
  altM: number
}

export interface CostBreakdown {
  heat: number
  altitude: number
  total: number
}

/** Conditions considered "ideal" for racing — the zero-cost reference point. */
export const IDEAL: Env = { tempC: 10, humidity: 45, altM: 0 }

// --- Tunable coefficients ----------------------------------------------------
const HEAT_THRESHOLD_C = 10 // No heat penalty at or below this temperature.
const HEAT_QUADRATIC = 0.0003 // cost grows with the square of degrees above threshold.
const HUMIDITY_PIVOT = 50 // Humidity above this amplifies the heat penalty.
const HUMIDITY_GAIN = 0.4 // Max extra heat penalty fraction at 100% humidity.
const ALT_THRESHOLD_M = 300 // Altitude below this is effectively sea level.
const ALT_PER_METER = 0.0000235 // ~0.235% slower per 100 m above threshold.

/** Heat (temperature + humidity) cost as a fraction of pace. */
export function heatCost(tempC: number, humidity: number): number {
  const excess = Math.max(0, tempC - HEAT_THRESHOLD_C)
  if (excess === 0) return 0
  const base = HEAT_QUADRATIC * excess * excess
  const humidityFactor =
    1 + (Math.max(0, humidity - HUMIDITY_PIVOT) / (100 - HUMIDITY_PIVOT)) * HUMIDITY_GAIN
  return base * humidityFactor
}

/** Altitude cost as a fraction of pace. */
export function altitudeCost(altM: number): number {
  const excess = Math.max(0, altM - ALT_THRESHOLD_M)
  return excess * ALT_PER_METER
}

export function envCost(env: Env): CostBreakdown {
  const heat = heatCost(env.tempC, env.humidity)
  const altitude = altitudeCost(env.altM)
  return { heat, altitude, total: heat + altitude }
}

export interface AdjustResult {
  /** Adjusted pace, in the same time unit as basePaceSec. */
  adjustedPaceSec: number
  /** Multiplier applied to the base pace (e.g. 1.06 = 6% slower). */
  factor: number
  /** Per-pace-unit slowdown in seconds (can be negative if conditions improve). */
  deltaSec: number
  raceCost: CostBreakdown
  acclimatedCost: CostBreakdown
}

/**
 * Adjust a base pace for race-day conditions, optionally crediting the runner's
 * acclimatization. When `acclimated` is omitted the runner is assumed to be
 * adapted to ideal conditions.
 *
 * @param basePaceSec  goal pace in seconds per distance unit (km or mile)
 */
export function adjustPace(
  basePaceSec: number,
  race: Env,
  acclimated: Env = IDEAL,
): AdjustResult {
  const raceCost = envCost(race)
  const acclimatedCost = envCost(acclimated)
  const factor = (1 + raceCost.total) / (1 + acclimatedCost.total)
  const adjustedPaceSec = basePaceSec * factor
  return {
    adjustedPaceSec,
    factor,
    deltaSec: adjustedPaceSec - basePaceSec,
    raceCost,
    acclimatedCost,
  }
}
