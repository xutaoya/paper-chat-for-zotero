function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readFiniteNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function readReasoningTokensFromDetails(details: unknown): number | undefined {
  if (!isPlainObject(details)) {
    return undefined;
  }
  const reasoning = readFiniteNumber(details.reasoning_tokens);
  if (reasoning !== undefined) {
    return reasoning;
  }
  return readFiniteNumber(details.thinking_tokens);
}

/**
 * Extract provider-reported reasoning / thinking token usage when present.
 */
export function extractReasoningTokensFromUsage(usage: unknown): number | undefined {
  if (!isPlainObject(usage)) {
    return undefined;
  }

  const direct = readFiniteNumber(usage.reasoning_tokens);
  if (direct !== undefined) {
    return direct;
  }

  const fromCompletionDetails = readReasoningTokensFromDetails(
    usage.completion_tokens_details,
  );
  if (fromCompletionDetails !== undefined) {
    return fromCompletionDetails;
  }

  const fromOutputDetails = readReasoningTokensFromDetails(
    usage.output_tokens_details,
  );
  if (fromOutputDetails !== undefined) {
    return fromOutputDetails;
  }

  return undefined;
}
