import { createRNG } from './random.js'
import { lerpColor } from './color.js'

export function generateGalaxy(options = {}) {
  const {
    particleCount = 10000,
    radius = 15,
    arms = 4,
    spin = 0.5,
    spread = 0.3,
    heightSpread = 0.4,
    concentration = 3,
    innerColor = { r: 1, g: 0.3, b: 0.1 },
    outerColor = { r: 0.1, g: 0.3, b: 1 },
    seed = undefined
  } = options

  if (particleCount < 0) {
    throw new Error('particleCount must be >= 0')
  }
  if (radius <= 0) {
    throw new Error('radius must be > 0')
  }
  if (particleCount === 0) {
    return {
      positions: new Float32Array(0),
      colors: new Float32Array(0)
    }
  }

  const rng = createRNG(seed ?? Date.now())

  const positions = new Float32Array(particleCount * 3)
  const colors = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    const armIndex = i % arms
    const distance = radius * Math.pow(rng.next(), concentration)
    const angle =
      (distance / radius) * 2 * Math.PI * spin +
      (armIndex / arms) * 2 * Math.PI +
      (rng.next() - 0.5) * spread

    const x = Math.cos(angle) * distance
    const y = Math.sin(angle) * distance
    const z =
      (rng.next() - 0.5) * heightSpread * (1 - distance / radius)

    const colorFactor = distance / radius
    const color = lerpColor(innerColor, outerColor, colorFactor)

    const idx3 = i * 3
    positions[idx3] = x
    positions[idx3 + 1] = y
    positions[idx3 + 2] = z
    colors[idx3] = color.r
    colors[idx3 + 1] = color.g
    colors[idx3 + 2] = color.b
  }

  return { positions, colors }
}
