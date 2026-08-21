import type { QuickAction } from "./types";

export const DEFAULT_QUICK_ACTION_PAPER_EXPLAIN_PROMPT = `帮我用中文详细讲解这个论文，越详细越好，最后的输出只需要包含讲解内容，不要有任何客套话，先用一段话总结这个论文的核心内容，如果有公式的话，用 markdown 支持的格式输出，一定要按照原文的内容和结构进行总结，并且在合适的地方加上对图表的引用，对于论文中模型实现方式的描述一定要尽可能详细`;

export function createDefaultQuickActions(): QuickAction[] {
  return [
    {
      id: "paper-explain",
      label: "论文讲解",
      prompt: DEFAULT_QUICK_ACTION_PAPER_EXPLAIN_PROMPT,
    },
  ];
}
