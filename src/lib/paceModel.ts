// -----------------------------------------------------------------------------
// Environmental pace-adjustment model
// -----------------------------------------------------------------------------
//
// Without acclimatization data, the model applies the raw cost of racing
// in a given environment vs ideal conditions (cool, dry, sea level).
//
// When training conditions are provided the model uses a DELTA approach:
// what matters is the JUMP from training conditions to race conditions.
//
//   - Race warmer/higher than training → pay the cost of that delta
//   - Race cooler/lower than training  → partial credit for heat/alt adaptation
//
// This correctly models, e.g., a runner trained in 45 °F slowing MORE in a
// 60 °F race than a runner trained in 55 °F — because the jump is larger even
// though neither training temp incurs an absolute heat penalty vs ideal.
//
// Coefficients are practitioner estimates from commonly cited heat/altitude
// running guidance (Daniels' tables, heat-slowdown charts).
// Planning aid only — individual response varies.

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
  adjustedPaceSec: number
  factor: number
  deltaSec: number
  raceCost: CostBreakdown
  acclimatedCost: CostBreakdown
  /** Net heat adjustment after accounting for training climate (can be negative = benefit). */
  netHeatCost: number
  /** Net altitude adjustment after accounting for training altitude. */
  netAltCost: number
}

/**
 * Adjust a base pace for current conditions, optionally crediting the runner's
 * training climate. When `acclimated` is omitted the runner is assumed to be
 * adapted to ideal conditions (equivalent to the simple case).
 */
export function adjustPace(
  basePaceSec: number,
  race: Env,
  acclimated: Env = IDEAL,
): AdjustResult {
  const raceCost = envCost(race)
  const acclimatedCost = envCost(acclimated)

  // Heat: base the cost on the TEMPERATURE JUMP from training to race.
  // A runner trained at 45°F jumping to 60°F suffers more than one trained
  // at 55°F, even though 45°F has zero absolute heat cost vs ideal.
  const tempDeltaC = race.tempC - acclimated.tempC
  let netHeatCost: number
  if (tempDeltaC >= 0) {
    // Racing warmer than training: pay cost of that delta above ideal threshold.
    netHeatCost = heatCost(IDEAL.tempC + tempDeltaC, race.humidity)
  } else {
    // Racing cooler than training: get 50% credit for heat adaptation.
    netHeatCost = raceCost.heat - acclimatedCost.heat * 0.5
    netHeatCost = Math.max(-0.04, netHeatCost) // cap benefit at 4%
  }

  // Altitude: same delta logic.
  const altDeltaM = race.altM - acclimated.altM
  let netAltCost: number
  if (altDeltaM >= 0) {
    netAltCost = altitudeCost(altDeltaM)
  } else {
    netAltCost = Math.max(-0.04, -altitudeCost(Math.abs(altDeltaM)) * 0.5)
  }

  const factor = 1 + netHeatCost + netAltCost
  const adjustedPaceSec = basePaceSec * factor

  return {
    adjustedPaceSec,
    factor,
    deltaSec: adjustedPaceSec - basePaceSec,
    raceCost,
    acclimatedCost,
    netHeatCost,
    netAltCost,
  }
}
