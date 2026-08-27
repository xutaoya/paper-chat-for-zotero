export const DEFAULT_FLOATING_WINDOW_WIDTH = 420;
export const DEFAULT_FLOATING_WINDOW_HEIGHT = 600;
export const MIN_FLOATING_WINDOW_WIDTH = 320;
export const MIN_FLOATING_WINDOW_HEIGHT = 400;
export const MAX_FLOATING_WINDOW_WIDTH = 1200;
export const MAX_FLOATING_WINDOW_HEIGHT = 1000;

function clampDimension(
  value: number,
  min: number,
  max: number,
  fallback: number,
): number {
  if (!Number.isFinite(value) || value <= 0) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function normalizeFloatingWindowSize(
  width: number,
  height: number,
): { width: number; height: number } {
  return {
    width: clampDimension(
      width,
      MIN_FLOATING_WINDOW_WIDTH,
      MAX_FLOATING_WINDOW_WIDTH,
      DEFAULT_FLOATING_WINDOW_WIDTH,
    ),
    height: clampDimension(
      height,
      MIN_FLOATING_WINDOW_HEIGHT,
      MAX_FLOATING_WINDOW_HEIGHT,
      DEFAULT_FLOATING_WINDOW_HEIGHT,
    ),
  };
}

export function resolveFloatingWindowSize(
  savedWidth: number | undefined,
  savedHeight: number | undefined,
): { width: number; height: number } {
  return normalizeFloatingWindowSize(
    savedWidth ?? DEFAULT_FLOATING_WINDOW_WIDTH,
    savedHeight ?? DEFAULT_FLOATING_WINDOW_HEIGHT,
  );
}
