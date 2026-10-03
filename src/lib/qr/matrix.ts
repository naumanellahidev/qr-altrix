import QRCodeLib from 'qrcode';
import type { ErrorCorrectionLevel } from './types';

export interface QrMatrix {
  size: number;
  /** True when the module is dark. */
  get(x: number, y: number): boolean;
  /** True when the module belongs to one of the three finder patterns (the "eyes"). */
  isEye(x: number, y: number): boolean;
}

/**
 * Builds the raw module matrix. Only the matrix comes from the `qrcode` package —
 * every visual decision below this layer is QR ALTRIX's own renderer.
 */
export function buildMatrix(data: string, errorCorrection: ErrorCorrectionLevel = 'M'): QrMatrix {
  const payload = data.length > 0 ? data : ' ';
  const qr = QRCodeLib.create(payload, { errorCorrectionLevel: errorCorrection });
  const size = qr.modules.size;
  const bits = qr.modules.data;

  const eyeOrigins: Array<[number, number]> = [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ];

  return {
    size,
    get(x: number, y: number) {
      if (x < 0 || y < 0 || x >= size || y >= size) return false;
      return Boolean(bits[y * size + x]);
    },
    isEye(x: number, y: number) {
      return eyeOrigins.some(([ox, oy]) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7);
    },
  };
}

export const EYE_ORIGINS = (size: number): Array<[number, number]> => [
  [0, 0],
  [size - 7, 0],
  [0, size - 7],
];

/** Rough capacity guide shown in the builder so long payloads can be flagged early. */
export function estimateDensity(data: string, errorCorrection: ErrorCorrectionLevel = 'M'): {
  modules: number;
  version: number;
  crowded: boolean;
} {
  const matrix = buildMatrix(data, errorCorrection);
  const version = (matrix.size - 17) / 4;
  return { modules: matrix.size, version, crowded: matrix.size >= 57 };
}
