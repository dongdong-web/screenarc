import { describe, expect, test, vi } from 'vitest'
import {
  type RecordingVideoEncoder,
  SOFTWARE_H264_ENCODER,
  WINDOWS_HARDWARE_H264_ENCODERS,
  selectWindowsRecordingEncoder,
} from './recording-video-encoder'

describe('selectWindowsRecordingEncoder', () => {
  test('uses the first encoder that passes a runtime probe', async () => {
    const probe = vi.fn(async (candidate: RecordingVideoEncoder) => candidate.id === 'h264_amf')

    await expect(selectWindowsRecordingEncoder(probe)).resolves.toBe(WINDOWS_HARDWARE_H264_ENCODERS[2])
    expect(probe).toHaveBeenCalledTimes(3)
  })

  test('falls back to CPU encoding when no hardware encoder is usable', async () => {
    const probe = vi.fn(async (_candidate: RecordingVideoEncoder) => false)

    await expect(selectWindowsRecordingEncoder(probe)).resolves.toBe(SOFTWARE_H264_ENCODER)
    expect(probe).toHaveBeenCalledTimes(WINDOWS_HARDWARE_H264_ENCODERS.length)
  })

  test('continues after a hardware probe throws', async () => {
    let attempt = 0
    const probe = vi.fn(async (_candidate: RecordingVideoEncoder) => {
      attempt += 1
      if (attempt === 1) throw new Error('driver unavailable')
      return true
    })

    await expect(selectWindowsRecordingEncoder(probe)).resolves.toBe(WINDOWS_HARDWARE_H264_ENCODERS[1])
  })
})
