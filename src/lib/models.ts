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
  {
    id: "nvidia/nemotron-3-super-120b-a12b:free",
    name: "Nemotron 3 Super",
    tier: "free",
    description: "NVIDIA's 120B MoE model with 12B active parameters. Large context window.",
    context: "262K",
    strength: "Good general-purpose coding. Handles large projects well.",
  },
  {
    id: "nousresearch/hermes-3-llama-3.1-405b:free",
    name: "Hermes 3 405B",
    tier: "free",
    description: "Nous Research fine-tune of Llama 3.1 405B. The largest free model available.",
    context: "131K",
    strength: "Highest quality among free models. Best for complex multi-page sites.",
  },
  {
    id: "zhipuai/glm-4.7-flash",
    name: "GLM-4.7 Flash",
    tier: "free",
    description: "ZhipuAI's fast model. Direct API access, not routed through OpenRouter.",
    context: "128K",
    strength: "Always available. Good fallback when OpenRouter models are rate-limited.",
  },
  {
    id: "cerebras/qwen-3-235b",
    name: "Qwen 3 235B (Cerebras)",
    tier: "free",
    description: "Qwen 3 235B running on Cerebras hardware. Ultra-fast inference.",
    context: "128K",
    strength: "Fastest inference speed. Great for code generation and complex tasks.",
  },
  {
    id: "cerebras/llama3.1-8b",
    name: "Llama 3.1 8B (Cerebras)",
    tier: "free",
    description: "Llama 3.1 8B on Cerebras. Lightning fast for simple tasks.",
    context: "128K",
    strength: "Instant responses. Good for quick edits and simple sites.",
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
