import { describe, it, expect } from 'vitest'
import { createRNG } from '../random.js'

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
