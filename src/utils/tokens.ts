/**
 * Rough token estimate for UI display (not billing-accurate).
 */
export function estimateTextTokens(text: string): number {
  if (!text) {
    return 0;
  }
  const cjkCount = (
    text.match(/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/g) || []
  ).length;
  const otherCount = text.length - cjkCount;
  return Math.ceil(cjkCount / 1.5 + otherCount / 4);
}
