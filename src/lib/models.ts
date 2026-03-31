export type ModelInfo = {
  id: string;
  name: string;
  tier: "free" | "pro" | "unlimited";
};

export const MODELS: ModelInfo[] = [
  // Free tier
  { id: "openrouter/auto", name: "Auto (Free)", tier: "free" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash", tier: "free" },
  { id: "meta-llama/llama-4-scout", name: "Llama 4 Scout", tier: "free" },
  // Pro tier
  { id: "anthropic/claude-sonnet-4", name: "Claude Sonnet 4", tier: "pro" },
  { id: "google/gemini-2.5-pro-preview", name: "Gemini 2.5 Pro", tier: "pro" },
  { id: "openai/gpt-4o", name: "GPT-4o", tier: "pro" },
  // Unlimited tier
  { id: "anthropic/claude-opus-4", name: "Claude Opus 4", tier: "unlimited" },
  { id: "openai/o3", name: "OpenAI o3", tier: "unlimited" },
];

const TIER_LEVEL = { free: 0, pro: 1, unlimited: 2 } as const;

export function getAvailableModels(plan: string): ModelInfo[] {
  const level = TIER_LEVEL[plan as keyof typeof TIER_LEVEL] ?? 0;
  return MODELS.filter((m) => TIER_LEVEL[m.tier] <= level);
}
