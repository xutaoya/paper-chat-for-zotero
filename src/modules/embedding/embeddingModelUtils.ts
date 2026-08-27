export function isEmbeddingModel(modelName: string): boolean {
  const lowerName = modelName.toLowerCase();
  return lowerName.includes("embedding") || lowerName.includes("text-embed");
}
