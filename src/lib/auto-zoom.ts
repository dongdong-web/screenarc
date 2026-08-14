import type { MetaDataItem, RecordingGeometry, VideoDimensions, ZoomRegion } from '../types'

export interface AutoZoomOptions {
  preClickOffset: number
  postClickPadding: number
  minDuration: number
  interactionWindow: number
  spatialThreshold: number
  minGap: number
  maxRegions: number
  zoomLevel: number
  easing: string
  transitionDuration: number
}

type ZoomCandidate = Omit<ZoomRegion, 'id' | 'type' | 'zIndex'> & {
  clickCount: number
}

function distanceBetween(a: MetaDataItem, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Converts clicks into a small set of deliberate camera moments. A new group
 * must be both separated in time and visually distant from the previous one;
 * repeated clicks on the same control become one zoom rather than a stack of
 * overlapping regions.
 */
function buildCandidates(
  clicks: MetaDataItem[],
  geometry: RecordingGeometry | VideoDimensions,
  options: AutoZoomOptions,
): ZoomCandidate[] {
  const groups: MetaDataItem[][] = []

  for (const click of clicks) {
    const currentGroup = groups[groups.length - 1]
    if (!currentGroup) {
      groups.push([click])
      continue
    }

    const lastClick = currentGroup[currentGroup.length - 1]
    const center = currentGroup.reduce(
      (result, item) => ({ x: result.x + item.x / currentGroup.length, y: result.y + item.y / currentGroup.length }),
      { x: 0, y: 0 },
    )
    const closeInTime = click.timestamp - lastClick.timestamp <= options.interactionWindow
    const closeInSpace = distanceBetween(click, center) <= options.spatialThreshold

    if (closeInTime && closeInSpace) {
      currentGroup.push(click)
    } else {
      groups.push([click])
    }
  }

  return groups.map((group) => {
    const firstClick = group[0]
    const lastClick = group[group.length - 1]
    const center = group.reduce(
      (result, item) => ({ x: result.x + item.x / group.length, y: result.y + item.y / group.length }),
      { x: 0, y: 0 },
    )
    const startTime = Math.max(0, firstClick.timestamp - options.preClickOffset)
    const duration = Math.max(options.minDuration, lastClick.timestamp + options.postClickPadding - startTime)

    return {
      startTime,
      duration,
      zoomLevel: options.zoomLevel,
      easing: options.easing,
      transitionDuration: options.transitionDuration,
      targetX: clamp(center.x / geometry.width - 0.5, -0.5, 0.5),
      targetY: clamp(center.y / geometry.height - 0.5, -0.5, 0.5),
      // Automatic regions should feel like intentional camera cuts. Keeping
      // the focus fixed prevents the constantly drifting pan of the old mode.
      mode: 'fixed',
      clickCount: group.length,
    }
  })
}

/**
 * Generates a restrained set of non-overlapping automatic zoom regions.
 * Denser click bursts are preferred, and the final regions remain ordered on
 * the timeline for predictable editing.
 */
export function generateAutoZoomRegions(
  metadata: MetaDataItem[],
  recordingGeometry: RecordingGeometry | null,
  videoDimensions: VideoDimensions,
  options: AutoZoomOptions,
): Record<string, ZoomRegion> {
  const geometry = recordingGeometry || videoDimensions
  if (geometry.width <= 0 || geometry.height <= 0) return {}

  const clicks = metadata.filter((item) => item.type === 'click' && item.pressed)
  if (clicks.length === 0) return {}

  const candidates = buildCandidates(clicks, geometry, options)
  const selected: ZoomCandidate[] = []

  // Prefer click clusters over isolated clicks. This turns a short sequence
  // of deliberate actions into a useful zoom while suppressing noise.
  const ranked = candidates.slice().sort((a, b) => b.clickCount - a.clickCount || a.startTime - b.startTime)
  for (const candidate of ranked) {
    if (selected.length === options.maxRegions) break

    const candidateEnd = candidate.startTime + candidate.duration
    const overlapsExistingRegion = selected.some((region) => {
      const regionEnd = region.startTime + region.duration
      return candidate.startTime < regionEnd + options.minGap && candidateEnd + options.minGap > region.startTime
    })

    if (!overlapsExistingRegion) selected.push(candidate)
  }

  return selected
    .sort((a, b) => a.startTime - b.startTime)
    .reduce((regions, candidate, index) => {
      const id = `auto-zoom-${index}`
      regions[id] = { ...candidate, id, type: 'zoom', zIndex: 0 }
      return regions
    }, {} as Record<string, ZoomRegion>)
}
