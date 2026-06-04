export function lerpColor(inner, outer, t) {
  const r = Math.round((inner.r + (outer.r - inner.r) * t) * 10000) / 10000
  const g = Math.round((inner.g + (outer.g - inner.g) * t) * 10000) / 10000
  const b = Math.round((inner.b + (outer.b - inner.b) * t) * 10000) / 10000
  return { r, g, b }
}
