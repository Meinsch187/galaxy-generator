import { describe, it, expect } from 'vitest'
import { createRNG } from '../random.js'
import { generateGalaxy } from '../logic.js'
import { lerpColor } from '../color.js'

describe('createRNG', () => {
  it('determinism — same seed produces same sequence', () => {
    const a = createRNG(42)
    const b = createRNG(42)
    const seqA = Array.from({ length: 10 }, () => a.next())
    const seqB = Array.from({ length: 10 }, () => b.next())
    expect(seqA).toEqual(seqB)
  })

  it('different seeds produce different sequences', () => {
    const a = createRNG(42)
    const b = createRNG(99)
    const seqA = Array.from({ length: 5 }, () => a.next())
    const seqB = Array.from({ length: 5 }, () => b.next())
    expect(seqA).not.toEqual(seqB)
  })

  it('range — all values are in [0, 1)', () => {
    const rng = createRNG(12345)
    for (let i = 0; i < 100; i++) {
      const v = rng.next()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })

  it('reproducibility after partial consumption', () => {
    const a = createRNG(7)
    for (let i = 0; i < 5; i++) a.next()
    const consumed = Array.from({ length: 5 }, () => a.next())

    const b = createRNG(7)
    const fresh = Array.from({ length: 10 }, () => b.next())
    const afterFive = fresh.slice(5)

    expect(consumed).toEqual(afterFive)
  })
})

describe('generateGalaxy', () => {
  it('lengths', () => {
    const result = generateGalaxy({ particleCount: 100, seed: 42 })
    expect(result.positions.length).toBe(300)
    expect(result.colors.length).toBe(300)
  })

  it('zero particles', () => {
    const result = generateGalaxy({ particleCount: 0 })
    expect(result.positions.length).toBe(0)
    expect(result.colors.length).toBe(0)
  })

  it('within radius', () => {
    const result = generateGalaxy({ particleCount: 50, seed: 42, radius: 15 })
    const radius = 15
    for (let i = 0; i < 50; i++) {
      const x = result.positions[i * 3]
      const y = result.positions[i * 3 + 1]
      const z = result.positions[i * 3 + 2]
      const dist = Math.sqrt(x * x + y * y + z * z)
      expect(dist).toBeLessThanOrEqual(radius + 0.5)
    }
  })

  it('determinism', () => {
    const a = generateGalaxy({ particleCount: 50, seed: 42 })
    const b = generateGalaxy({ particleCount: 50, seed: 42 })
    expect(a.positions).toEqual(b.positions)
    expect(a.colors).toEqual(b.colors)
  })

  it('different seeds', () => {
    const a = generateGalaxy({ particleCount: 50, seed: 42 })
    const b = generateGalaxy({ particleCount: 50, seed: 99 })
    expect(a.positions).not.toEqual(b.positions)
  })

  it('one arm', () => {
    const result = generateGalaxy({ particleCount: 50, arms: 1, seed: 42 })
    expect(result.positions.length).toBe(150)
    expect(result.colors.length).toBe(150)
  })

  it('invalid input', () => {
    expect(() => generateGalaxy({ radius: 0 })).toThrow()
    expect(() => generateGalaxy({ radius: -5 })).toThrow()
    expect(() => generateGalaxy({ particleCount: -10 })).toThrow()
  })
})

describe('lerpColor', () => {
  it('interpolates correctly', () => {
    const inner = { r: 1, g: 0.3, b: 0.1 }
    const outer = { r: 0.1, g: 0.3, b: 1 }
    expect(lerpColor(inner, outer, 0)).toEqual({ r: 1, g: 0.3, b: 0.1 })
    expect(lerpColor(inner, outer, 1)).toEqual({ r: 0.1, g: 0.3, b: 1 })
    expect(lerpColor(inner, outer, 0.5)).toEqual({ r: 0.55, g: 0.3, b: 0.55 })
  })
})
