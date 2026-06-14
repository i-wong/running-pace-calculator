// Parsing and formatting of pace / time strings.

/**
 * Parse a pace or time string into total seconds.
 * Accepts "m:ss", "mm:ss", "h:mm:ss" and plain seconds ("90").
 * Returns null when the input can't be understood.
 */
export function parseClock(input: string): number | null {
  const trimmed = input.trim()
  if (trimmed === '') return null

  const parts = trimmed.split(':')
  if (parts.length === 1) {
    const n = Number(parts[0])
    return Number.isFinite(n) && n >= 0 ? n : null
  }

  // Validate every segment is numeric.
  const nums = parts.map((p) => Number(p))
  if (nums.some((n) => !Number.isFinite(n) || n < 0)) return null

  // Seconds (and minutes, for h:mm:ss) should be < 60.
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] >= 60) return null
  }

  if (parts.length === 2) {
    const [m, s] = nums
    return m * 60 + s
  }
  if (parts.length === 3) {
    const [h, m, s] = nums
    return h * 3600 + m * 60 + s
  }
  return null
}

/** Format seconds as a pace string, e.g. 450 -> "7:30". */
export function formatPace(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '—'
  const rounded = Math.round(totalSeconds)
  const m = Math.floor(rounded / 60)
  const s = rounded % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

/**
 * Format seconds as an elapsed time. Sub-minute values keep a decimal so short
 * splits (e.g. a 100 m) stay meaningful: 14.2 -> "14.2s", 95 -> "1:35".
 */
export function formatDuration(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '—'

  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(1)}s`
  }

  const rounded = Math.round(totalSeconds)
  const h = Math.floor(rounded / 3600)
  const m = Math.floor((rounded % 3600) / 60)
  const s = rounded % 60

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

/** Signed seconds delta, e.g. +18 -> "+18s/…", -5 -> "-5s/…". */
export function formatSignedSeconds(delta: number): string {
  const sign = delta >= 0 ? '+' : '−'
  const abs = Math.abs(delta)
  if (abs < 60) return `${sign}${Math.round(abs)}s`
  const m = Math.floor(abs / 60)
  const s = Math.round(abs % 60)
  return `${sign}${m}:${s.toString().padStart(2, '0')}`
}
