import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { PLANS, type PlanKey } from "@/lib/stripe";
import { getAvailableModels, AUTO_MODEL_ID } from "@/lib/models";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// --- Retry logic inspired by Claude-Code's withRetry pattern ---
const MAX_RETRIES = 2;
const BASE_DELAY_MS = 500;

// Fallback chain: if requested model fails, try a cheaper/more-available model
const MODEL_FALLBACKS: Record<string, string> = {
  "anthropic/claude-opus-4": "anthropic/claude-sonnet-4",
  "openai/o3": "openai/gpt-4o",
  "anthropic/claude-sonnet-4": "google/gemini-2.5-pro-preview",
  "google/gemini-2.5-pro-preview": "qwen/qwen3-coder:free",
  "openai/gpt-4o": "qwen/qwen3-coder:free",
  "qwen/qwen3-coder:free": "qwen/qwen3.6-plus-preview:free",
  "qwen/qwen3.6-plus-preview:free": "google/gemma-3-27b-it:free",
  "google/gemma-3-27b-it:free": "meta-llama/llama-3.3-70b-instruct:free",
};

function getFallbackModel(modelId: string): string | null {
  return MODEL_FALLBACKS[modelId] || null;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- System Prompt: Static (cacheable) section ---
const SYSTEM_PROMPT_STATIC = `You are an expert web developer, UI/UX designer, and creative director. You build polished, production-quality static websites from natural language descriptions.

## Your Workflow

Follow this structured approach for every request:

1. **Understand** — Identify the site's purpose, audience, and tone. Ask clarifying questions ONLY if the request is critically ambiguous (e.g., missing the site topic entirely). Otherwise, make sensible assumptions and proceed.

2. **Plan** — Before writing code, briefly state (in 1-3 sentences) what you will build: layout structure, color palette direction, and key sections. This helps the user course-correct early.

3. **Generate** — Output complete, multi-file static website code using labeled code blocks.

## Output Format

Use labeled code blocks for each file:

\`\`\`html filename=index.html
<!DOCTYPE html>
...
\`\`\`

\`\`\`css filename=style.css
...
\`\`\`

\`\`\`js filename=script.js
// only if interactivity is needed
\`\`\`

## File Rules — CRITICAL
- You MUST ALWAYS output at least TWO separate files: index.html AND style.css. Never combine them into one file.
- NEVER put CSS inside <style> tags in the HTML. ALL styles go in style.css.
- HTML must link to style.css via \`<link rel="stylesheet" href="style.css">\`
- JavaScript goes in script.js linked via \`<script src="script.js"></script>\` — NEVER inline scripts in HTML.
- You may add more files when appropriate (about.html, contact.html, etc.)
- Each file MUST use the exact format: \`\`\`lang filename=filename.ext

## Design Excellence
- **Mobile-first responsive**: Use min-width media queries; test mental model at 320px, 768px, 1024px, 1440px
- **Modern CSS**: Flexbox, CSS Grid, custom properties, clamp() for fluid typography, smooth transitions
- **Color**: Use a cohesive palette (3-5 colors). Define as CSS custom properties for consistency
- **Typography**: Use Google Fonts via CDN. Establish clear hierarchy with font-size, weight, and spacing
- **Spacing**: Use consistent spacing scale (e.g., multiples of 0.5rem)
- **Visual polish**: Subtle shadows, rounded corners, hover states, smooth transitions (200-300ms)
- **Dark/Light awareness**: Use color schemes that work well; consider \`prefers-color-scheme\` when appropriate

## HTML Quality
- Include proper \`<meta>\` tags: viewport, description, charset, Open Graph basics
- Use semantic HTML5 elements: header, nav, main, section, article, footer
- Add meaningful \`alt\` text for images; use placeholder services for demo images (e.g., picsum.photos or placehold.co)
- Ensure proper heading hierarchy (h1 → h2 → h3, no skipping)
- Add \`lang\` attribute to \`<html>\` tag

## Accessibility
- Sufficient color contrast (WCAG AA minimum)
- Focusable interactive elements with visible focus styles
- ARIA labels where semantics alone are insufficient
- Skip-to-content link for navigation-heavy pages

## Performance
- Minimize inline styles; keep CSS in the stylesheet
- Use efficient selectors; avoid deep nesting
- Lazy-load images below the fold with \`loading="lazy"\`
- Prefer CSS animations over JavaScript when possible

## React / Node.js Projects
When the user asks for a React app, Next.js app, or any Node.js project:

- Output a \`package.json\` file with the required dependencies
- Use **Vite + React** as the default React setup (fast, lightweight)
- Include files like: \`package.json\`, \`index.html\`, \`src/App.jsx\`, \`src/main.jsx\`, \`src/style.css\`, \`vite.config.js\`
- The project will run in a WebContainer (in-browser Node.js) — it supports npm install and dev servers
- Do NOT use TypeScript unless explicitly asked — keep it simple with JSX
- Keep dependencies minimal — only what's needed
- The dev server must bind to host 0.0.0.0 for WebContainer compatibility

Example package.json for a Vite React project:
\`\`\`json filename=package.json
{
  "name": "my-app",
  "private": true,
  "scripts": { "dev": "vite --host" },
  "dependencies": { "react": "^19.0.0", "react-dom": "^19.0.0" },
  "devDependencies": { "vite": "^6.0.0", "@vitejs/plugin-react": "^4.0.0" }
}
\`\`\`

Example vite.config.js:
\`\`\`js filename=vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ plugins: [react()] });
\`\`\`

For non-React Node.js projects (Express, etc.), output the appropriate package.json and entry file.
Default to static HTML/CSS/JS unless the user specifically asks for React, Node.js, or a framework.`;

// --- System Prompt: Dynamic section (changes per-request context) ---
function buildDynamicPrompt(isEditing: boolean, isContinuation: boolean): string {
  // Continuation mode: user said "continue" after truncated output
  if (isContinuation) {
    return `
## Continuation Mode
Your previous response was truncated mid-output. The user is asking you to continue.

- Pick up EXACTLY where you left off — do not restart or repeat what was already output.
- Continue outputting the remaining code blocks with the same \`\`\`lang filename=xxx format.
- If you were mid-file, start from where you stopped (don't re-output the beginning of the file).
- After completing the remaining files, briefly confirm what was finished.`;
  }

  if (!isEditing) {
    return `
## Response Workflow
Follow this structured approach:

1. **Plan** (1-3 sentences): State what you'll build — layout, sections, color direction.
2. **Generate**: Output all code files using the labeled format.
3. **Self-Review**: After generating, mentally verify:
   - All \`<link>\` and \`<script>\` tags reference the correct filenames
   - HTML is valid and properly closed
   - CSS covers mobile (320px) through desktop (1440px)
   - Interactive elements have hover/focus states
   - No placeholder text like "Lorem ipsum" unless explicitly asked
   If you spot an issue, fix it in the code before outputting — don't mention the fix.

## Response Style
- Lead with your brief plan, then deliver the code
- Keep explanations concise — the code speaks for itself
- After the code, suggest 1-2 specific improvements the user could ask for next`;
  }

  return `
## Editing Mode — Important Rules
You are modifying an existing site. You receive:
- **Full contents** of the most relevant files (active file, files mentioned in the prompt, core files)
- **Summaries** of other files (filename + size + first line) — if you need to see a file's full content to make changes, tell the user to open that file and ask again, or make your best judgment based on the summary.

- **Only output files that changed**. Do NOT re-output unchanged files — this wastes tokens and bandwidth.
- If a file is unchanged, simply omit it from your response.
- If you need to add a NEW file, output it with its filename.
- If you need to DELETE a file, say so explicitly in your explanation (e.g., "I removed old-page.html").
- Preserve the user's existing design decisions (colors, fonts, layout) unless they explicitly ask to change them.
- When modifying a file you only see in summary, output the COMPLETE new version of that file.

## Response Workflow
1. **Synthesize**: Understand exactly what the user wants changed. Identify which files need modification.
2. **Implement**: Output only the changed/new code blocks.
3. **Self-Review**: Verify your changes don't break existing functionality:
   - Do modified CSS selectors still match HTML elements?
   - Do added scripts reference correct DOM IDs/classes?
   - Is the responsive layout still intact?
   Fix any issues in the code before outputting.

## Response Style
- Start with a brief summary of what you changed (1-2 sentences)
- Then output only the modified/new code blocks
- Suggest 1-2 follow-up improvements`;
}

// Maximum characters per file to include in context (prevents token overflow)
const MAX_FILE_CONTEXT_CHARS = 15000;

// Maximum total context characters for all files combined
const MAX_TOTAL_FILE_CONTEXT = 50000;

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, files, activeFile, history, model: requestedModel } = body;

  // Determine user's plan and validate model selection
  let plan: PlanKey = "free";
  let dbUserId: number | null = null;

  if (process.env.DATABASE_URL) {
    try {
      const { auth0 } = await import("@/lib/auth0");
      const session = await auth0.getSession();
      if (session?.user?.email) {
        const { db } = await import("@/lib/db");
        const { users } = await import("@/lib/schema");
        const { eq } = await import("drizzle-orm");

        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.email, session.user.email as string))
          .limit(1);
        if (dbUser) {
          plan = (dbUser.plan || "free") as PlanKey;
          dbUserId = dbUser.id;
        }
      }
    } catch {
      // Anonymous or DB unavailable - free tier
    }
  }

  // Use requested model if available for user's plan, otherwise default
  const available = getAvailableModels(plan);
  const isAuto = !requestedModel || requestedModel === AUTO_MODEL_ID;
  let modelId: string;

  if (isAuto) {
    // Auto mode: use the best model for the user's plan
    modelId = PLANS[plan]?.model || PLANS.free.model;
  } else if (available.some((m) => m.id === requestedModel)) {
    modelId = requestedModel;
  } else {
    modelId = PLANS[plan]?.model || PLANS.free.model;
  }

  // Log model usage (fire and forget)
  if (process.env.DATABASE_URL) {
    import("@/lib/db").then(({ db }) =>
      import("@/lib/schema").then(({ modelUsage }) => {
        db.insert(modelUsage)
          .values({ model: modelId, userId: dbUserId })
          .catch(() => {});
      })
    ).catch(() => {});
  }

  const isEditing = files && Object.keys(files).length > 0;

  const isContinuation = /^(continue|继续|계속|continuar)\b/i.test(prompt?.trim() || "");
  const systemPrompt = SYSTEM_PROMPT_STATIC + "\n" + buildDynamicPrompt(!!isEditing, isContinuation);

  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [{ role: "system", content: systemPrompt }];

  // Add chat history with smart trimming
  if (history?.length) {
    // Keep recent history but summarize older messages to save tokens
    const maxHistory = 8;
    const recentHistory = history.slice(-maxHistory);

    // If we trimmed history, add a summary note
    if (history.length > maxHistory) {
      messages.push({
        role: "user",
        content: `[Earlier in our conversation, we discussed: ${history
          .slice(0, -maxHistory)
          .filter((m: { role: string }) => m.role === "user")
          .map((m: { content: string }) => m.content.slice(0, 80))
          .join("; ")}]`,
      });
    }

    for (const msg of recentHistory) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }
  }

  // Build user message with smart file context (inspired by Claude-Code's on-demand file reading)
  // Strategy: send full content for relevant files, tree summary for the rest
  let userContent = "";
  if (isEditing) {
    const allFiles = files as Record<string, string>;
    const fileNames = Object.keys(allFiles);
    const promptLower = prompt.toLowerCase();

    // Determine which files to send in full:
    // 1. The file the user is currently viewing
    // 2. Files mentioned in the prompt
    // 3. For small projects (≤5 files), send everything
    const isSmallProject = fileNames.length <= 5;
    const relevantFiles = new Set<string>();

    if (isSmallProject) {
      fileNames.forEach((f) => relevantFiles.add(f));
    } else {
      // Always include the active file
      if (activeFile && allFiles[activeFile]) {
        relevantFiles.add(activeFile);
      }

      // Include files mentioned in the prompt
      for (const name of fileNames) {
        const baseName = name.split("/").pop()!.toLowerCase();
        const nameNoExt = baseName.replace(/\.\w+$/, "");
        if (
          promptLower.includes(baseName) ||
          promptLower.includes(nameNoExt) ||
          promptLower.includes(name.toLowerCase())
        ) {
          relevantFiles.add(name);
        }
      }

      // Always include index.html and style.css (core structural files)
      if (allFiles["index.html"]) relevantFiles.add("index.html");
      if (allFiles["style.css"]) relevantFiles.add("style.css");

      // If prompt is generic (e.g. "change the color"), include main entry files
      if (relevantFiles.size <= 2) {
        if (allFiles["src/App.jsx"]) relevantFiles.add("src/App.jsx");
        if (allFiles["src/App.tsx"]) relevantFiles.add("src/App.tsx");
        if (allFiles["src/main.jsx"]) relevantFiles.add("src/main.jsx");
        if (allFiles["script.js"]) relevantFiles.add("script.js");
      }
    }

    // Build context: full content for relevant files, summary for others
    const fullFileEntries: string[] = [];
    const summaryEntries: string[] = [];
    let totalChars = 0;

    for (const name of fileNames) {
      const content = allFiles[name];
      const ext = name.split(".").pop();

      if (relevantFiles.has(name) && totalChars + content.length <= MAX_TOTAL_FILE_CONTEXT) {
        if (content.length > MAX_FILE_CONTEXT_CHARS) {
          const truncated = content.slice(0, MAX_FILE_CONTEXT_CHARS);
          fullFileEntries.push(
            `\`\`\`${ext} filename=${name}\n${truncated}\n/* ... truncated (${content.length} chars total) */\n\`\`\``
          );
          totalChars += MAX_FILE_CONTEXT_CHARS;
        } else {
          fullFileEntries.push(`\`\`\`${ext} filename=${name}\n${content}\n\`\`\``);
          totalChars += content.length;
        }
      } else {
        // Summary: filename, size, and first meaningful line
        const firstLine = content.split("\n").find((l) => l.trim().length > 0)?.trim().slice(0, 80) || "";
        summaryEntries.push(`- ${name} (${content.length < 1024 ? content.length + "B" : (content.length / 1024).toFixed(1) + "KB"}) — ${firstLine}`);
      }
    }

    const noHistory = !history?.length;
    const sections: string[] = [];

    if (fullFileEntries.length > 0) {
      sections.push(`## Full File Contents (${fullFileEntries.length} files)\n${fullFileEntries.join("\n\n")}`);
    }
    if (summaryEntries.length > 0) {
      sections.push(`## Other Files (summary only — request full content if needed)\n${summaryEntries.join("\n")}`);
    }
    if (noHistory) {
      sections.push("Note: This is an existing site. The user is returning to edit it. Build on top of the current code — do NOT start from scratch.");
    }
    sections.push(`## User Request\n${prompt}`);

    userContent = sections.join("\n\n");
  } else {
    userContent = prompt;
  }

  // Auto web search: detect if the prompt mentions brands, companies, products,
  // or asks for current/real information that benefits from search
  if (process.env.SERPER_API_KEY) {
    const { extractSearchQuery, webSearch, formatSearchContext } = await import("@/lib/web-search");
    const searchQuery = extractSearchQuery(prompt);
    if (searchQuery) {
      try {
        const searchResults = await webSearch(searchQuery, 5);
        if (searchResults.results.length > 0) {
          const searchContext = formatSearchContext(searchResults);
          userContent = `${searchContext}\n\n---\n\n${userContent}`;
        }
      } catch (err) {
        console.error("Web search failed:", err);
      }
    }
  }

  messages.push({ role: "user", content: userContent });

  // Try with fallback chain on rate limit
  let currentModel = modelId;
  const triedModels: string[] = [];

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    triedModels.push(currentModel);

    try {
      // Pre-check: make a quick non-streaming request to detect 429 before streaming
      const checkRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 1,
          stream: false,
        }),
      });

      if (checkRes.status === 429) {
        // Rate limited — try fallback model
        const fallback = getFallbackModel(currentModel);
        if (fallback && !triedModels.includes(fallback)) {
          currentModel = fallback;
          continue;
        }
        // No more fallbacks — return rate limit message to client
        const modelName = currentModel.split("/").pop()?.replace(/:free$/, "") || currentModel;
        return new Response(
          `⚠️ **Rate Limited** — The model \`${modelName}\` is temporarily rate-limited by the provider. Please try a different model from the dropdown, or wait a moment and try again.`,
          {
            status: 200,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          }
        );
      }

      // Model is available — now stream the real request
      const result = streamText({
        model: openrouter(currentModel),
        messages,
        temperature: 0.7,
        maxOutputTokens: 16384,
      });

      const response = result.toTextStreamResponse();
      response.headers.set("X-Model-Used", currentModel);
      return response;
    } catch (error: unknown) {
      const status = (error as { status?: number })?.status;

      if (status === 429 || status === 529) {
        const fallback = getFallbackModel(currentModel);
        if (fallback && !triedModels.includes(fallback)) {
          currentModel = fallback;
          continue;
        }
      }

      // Try fallback on any error
      const fallback = getFallbackModel(currentModel);
      if (fallback && !triedModels.includes(fallback) && attempt < MAX_RETRIES) {
        currentModel = fallback;
        continue;
      }

      const errorMessage = error instanceof Error ? error.message : "Generation failed";
      return new Response(
        `⚠️ **Error** — Failed to generate with \`${currentModel.split("/").pop()}\`: ${errorMessage}. Please try a different model.`,
        {
          status: 200,
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }
      );
    }
  }

  // All retries exhausted
  return new Response(
    `⚠️ **All models unavailable** — Tried: ${triedModels.map((m) => m.split("/").pop()).join(", ")}. All are rate-limited. Please wait a moment and try again.`,
    {
      status: 200,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    }
  );
}
