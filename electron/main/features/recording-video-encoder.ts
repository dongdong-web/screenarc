export interface RecordingVideoEncoder {
  id: 'libx264' | 'h264_nvenc' | 'h264_qsv' | 'h264_amf'
  label: string
  kind: 'hardware' | 'software'
  ffmpegArgs: readonly string[]
}

export const SOFTWARE_H264_ENCODER: RecordingVideoEncoder = {
  id: 'libx264',
  label: 'CPU (libx264)',
  kind: 'software',
  ffmpegArgs: ['-c:v', 'libx264', '-preset', 'ultrafast', '-pix_fmt', 'yuv420p'],
}

// Each candidate is probed with the bundled FFmpeg before use. FFmpeg may be
// compiled with a hardware encoder even when the current machine has no
// compatible GPU or driver, so static encoder availability is not enough.
export const WINDOWS_HARDWARE_H264_ENCODERS: readonly RecordingVideoEncoder[] = [
  {
    id: 'h264_nvenc',
    label: 'NVIDIA NVENC',
    kind: 'hardware',
    ffmpegArgs: ['-c:v', 'h264_nvenc', '-preset', 'p1', '-tune', 'ull', '-rc', 'vbr', '-cq', '23', '-b:v', '0', '-pix_fmt', 'yuv420p'],
  },
  {
    id: 'h264_qsv',
    label: 'Intel Quick Sync',
    kind: 'hardware',
    ffmpegArgs: ['-c:v', 'h264_qsv', '-pix_fmt', 'yuv420p'],
  },
  {
    id: 'h264_amf',
    label: 'AMD AMF',
    kind: 'hardware',
    ffmpegArgs: [
      '-c:v',
      'h264_amf',
      '-usage',
      'ultralowlatency',
      '-quality',
      'speed',
      '-rc',
      'cqp',
      '-qp_i',
      '23',
      '-qp_p',
      '23',
      '-pix_fmt',
      'yuv420p',
    ],
  },
]

export async function selectWindowsRecordingEncoder(
  probe: (candidate: RecordingVideoEncoder) => Promise<boolean>,
): Promise<RecordingVideoEncoder> {
  for (const candidate of WINDOWS_HARDWARE_H264_ENCODERS) {
    try {
      if (await probe(candidate)) return candidate
    } catch {
      // A broken driver or unsupported encoder must never block recording.
      // Continue through the candidates before using the CPU fallback.
    }
  }

  return SOFTWARE_H264_ENCODER
}
