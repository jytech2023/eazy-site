export type ModelInfo = {
  id: string;
  name: string;
  tier: "free" | "pro" | "unlimited";
  description: string;
  context: string;
  strength: string;
};

export const AUTO_MODEL_ID = "auto";

export const MODELS: ModelInfo[] = [
  // Auto — smart model selection
  {
    id: AUTO_MODEL_ID,
    name: "Auto",
    tier: "free",
    description: "Automatically picks the best available model for your plan. Handles rate limits by switching models.",
    context: "—",
    strength: "Recommended for most users. No need to think about model selection.",
  },
  // Free tier — best free models for code generation
  {
    id: "qwen/qwen3-coder:free",
    name: "Qwen3 Coder",
    tier: "free",
    description: "Purpose-built coding model by Alibaba. 480B MoE architecture with 35B active parameters.",
    context: "262K",
    strength: "Best free model for code generation. Excellent at structured multi-file output.",
  },
  {
    id: "qwen/qwen3.6-plus-preview:free",
    name: "Qwen 3.6 Plus",
    tier: "free",
    description: "Latest general-purpose model from Alibaba with massive context window.",
    context: "1M",
    strength: "Strong at both creative design and code. Great for complex multi-page sites.",
  },
  {
    id: "google/gemma-3-27b-it:free",
    name: "Gemma 3 27B",
    tier: "free",
    description: "Google's open-weight model, 27B parameters. Reliable and consistent.",
    context: "131K",
    strength: "Consistent structured output. Good at following format instructions.",
  },
  {
    id: "meta-llama/llama-3.3-70b-instruct:free",
    name: "Llama 3.3 70B",
    tier: "free",
    description: "Meta's 70B parameter model. Strong general-purpose capabilities.",
    context: "65K",
    strength: "Well-rounded. Good at responsive design and modern CSS.",
  },
  // Pro tier
  {
    id: "anthropic/claude-sonnet-4",
    name: "Claude Sonnet 4",
    tier: "pro",
    description: "Anthropic's balanced model. Excellent reasoning with fast response times.",
    context: "200K",
    strength: "Best balance of speed and quality. Exceptional at clean, semantic HTML and accessibility.",
  },
  {
    id: "google/gemini-2.5-pro-preview",
    name: "Gemini 2.5 Pro",
    tier: "pro",
    description: "Google's most capable model with massive context and multimodal abilities.",
    context: "1M",
    strength: "Excels at complex layouts, animations, and multi-page sites.",
  },
  {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    tier: "pro",
    description: "OpenAI's flagship multimodal model. Fast and versatile.",
    context: "128K",
    strength: "Great at creative design and modern UI patterns. Strong JavaScript generation.",
  },
  // Unlimited tier
  {
    id: "anthropic/claude-opus-4",
    name: "Claude Opus 4",
    tier: "unlimited",
    description: "Anthropic's most powerful model. Top-tier reasoning and code generation.",
    context: "200K",
    strength: "Highest quality output. Best for production sites with complex interactions.",
  },
  {
    id: "openai/o3",
    name: "OpenAI o3",
    tier: "unlimited",
    description: "OpenAI's advanced reasoning model with deep chain-of-thought capabilities.",
    context: "200K",
    strength: "Deep reasoning for complex architectures. Excellent problem-solving.",
  },
];

const TIER_LEVEL = { free: 0, pro: 1, unlimited: 2 } as const;

export function getAvailableModels(plan: string): ModelInfo[] {
  const level = TIER_LEVEL[plan as keyof typeof TIER_LEVEL] ?? 0;
  return MODELS.filter((m) => TIER_LEVEL[m.tier] <= level);
}
