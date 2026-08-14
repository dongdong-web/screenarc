import { describe, expect, test } from 'vitest'
import type { MetaDataItem } from '../types'
import { generateAutoZoomRegions, type AutoZoomOptions } from './auto-zoom'

const options: AutoZoomOptions = {
  preClickOffset: 0.4,
  postClickPadding: 0.6,
  minDuration: 2.5,
  interactionWindow: 2.5,
  spatialThreshold: 420,
  minGap: 1.25,
  maxRegions: 4,
  zoomLevel: 1.5,
  easing: 'Balanced',
  transitionDuration: 1,
}
const geometry = { x: 0, y: 0, width: 1920, height: 1080 }
const click = (timestamp: number, x: number, y: number): MetaDataItem => ({
  timestamp,
  x,
  y,
  type: 'click',
  pressed: true,
})

describe('generateAutoZoomRegions', () => {
  test('creates a fixed camera moment at a single meaningful click', () => {
    const regions = Object.values(generateAutoZoomRegions([click(3, 960, 540)], geometry, geometry, options))

    expect(regions).toHaveLength(1)
    expect(regions[0]).toMatchObject({
      startTime: 2.6,
      duration: 2.5,
      targetX: 0,
      targetY: 0,
      mode: 'fixed',
    })
  })

  test('merges nearby repeated clicks into one stable focus point', () => {
    const regions = Object.values(
      generateAutoZoomRegions([click(3, 900, 500), click(4, 1020, 580)], geometry, geometry, options),
    )

    expect(regions).toHaveLength(1)
    expect(regions[0]).toMatchObject({ targetX: 0, targetY: 0, mode: 'fixed' })
    expect(regions[0].duration).toBeGreaterThanOrEqual(2.5)
  })

  test('does not merge distant controls into the same zoom', () => {
    const regions = Object.values(
      generateAutoZoomRegions([click(2, 120, 120), click(3, 1800, 960)], geometry, geometry, options),
    )

    expect(regions).toHaveLength(1)
    expect(regions[0].targetX).toBeCloseTo(120 / 1920 - 0.5)
    expect(regions[0].targetY).toBeCloseTo(120 / 1080 - 0.5)
  })

  test('caps noisy click streams at four non-overlapping regions', () => {
    const regions = Object.values(
      generateAutoZoomRegions(
        [click(1, 100, 100), click(5, 600, 100), click(9, 1100, 100), click(13, 1600, 100), click(17, 300, 800)],
        geometry,
        geometry,
        options,
      ),
    )

    expect(regions).toHaveLength(4)
    for (let index = 1; index < regions.length; index += 1) {
      expect(regions[index].startTime).toBeGreaterThanOrEqual(
        regions[index - 1].startTime + regions[index - 1].duration + options.minGap,
      )
    }
  })
})
