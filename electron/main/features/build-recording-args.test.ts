import { describe, expect, test } from 'vitest'
import { buildFfmpegArgs } from './build-recording-args'

describe('buildFfmpegArgs', () => {
  test('overwrites stale recording outputs without prompting', () => {
    const args = buildFfmpegArgs(
      ['-f', 'gdigrab', '-i', 'desktop'],
      false,
      false,
      'ScreenArc-recording-screen.mp4',
    )

    expect(args[0]).toBe('-y')
    expect(args).toContain('ScreenArc-recording-screen.mp4')
  })

  test('uses the selected encoder for the primary screen video', () => {
    const args = buildFfmpegArgs(
      ['-f', 'gdigrab', '-i', 'desktop'],
      false,
      false,
      'ScreenArc-recording-screen.mp4',
      undefined,
      ['-c:v', 'h264_amf', '-quality', 'speed', '-pix_fmt', 'yuv420p'],
    )

    expect(args).toEqual(
      expect.arrayContaining(['-c:v', 'h264_amf', '-quality', 'speed', '-pix_fmt', 'yuv420p']),
    )
    expect(args).not.toContain('libx264')
  })
})
