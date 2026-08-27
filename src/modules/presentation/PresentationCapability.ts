import type { ToolDefinition } from "../../types/tool";

export function isPathInsidePresentationRoot(
  filePath: string,
  rootPath: string,
): boolean {
  const normalizedFile = filePath.replace(/\\/g, "/");
  const normalizedRoot = rootPath.replace(/\\/g, "/").replace(/\/+$/u, "");
  return (
    normalizedFile === normalizedRoot ||
    normalizedFile.startsWith(`${normalizedRoot}/`)
  );
}

export function isTrustedPresentationPreviewPath(_filePath: string): boolean {
  return false;
}

export function createPresentationToolDefinition(): ToolDefinition {
  return {
    type: "function",
    function: {
      name: "presentation",
      description: "Disabled in PaperMind fork.",
      parameters: { type: "object", properties: {} },
    },
  };
}

export function createPresentationLaunchToolDefinition(): ToolDefinition {
  return {
    type: "function",
    function: {
      name: "request_presentation",
      description: "Disabled in PaperMind fork.",
      parameters: { type: "object", properties: {} },
    },
  };
}

export async function executePresentationCapability(): Promise<string> {
  return "PPT generation is not available.";
}
