import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { PLANS, type PlanKey } from "@/lib/stripe";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert web developer and designer. The user will describe what website they want, and you will generate a complete, beautiful, responsive HTML page.

Rules:
- Always output a complete HTML document starting with <!DOCTYPE html>
- Use modern CSS (flexbox, grid, gradients, shadows) for beautiful design
- Make the page fully responsive (mobile-first approach)
- Use a cohesive color scheme and professional typography
- Include meta viewport tag for mobile support
- Use inline CSS in a <style> tag (no external CSS files)
- You can use Google Fonts via CDN link
- Make the design modern, clean, and visually appealing
- If the user provides modifications to an existing page, apply the changes to the current HTML
- Wrap the HTML output in \`\`\`html code blocks
- Keep explanations brief, focus on delivering the HTML code
- If the user asks for changes, modify the provided current HTML accordingly`;

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, currentHtml, history } = body;

  // Determine user's plan and model
  let modelId = PLANS.free.model;

  if (process.env.DATABASE_URL) {
    try {
      const { auth0 } = await import("@/lib/auth0");
      const session = await auth0.getSession();
      if (session?.user) {
        const { db } = await import("@/lib/db");
        const { users } = await import("@/lib/schema");
        const { eq } = await import("drizzle-orm");

        const auth0Id = session.user.sub as string;
        const [dbUser] = await db
          .select()
          .from(users)
          .where(eq(users.auth0Id, auth0Id))
          .limit(1);
        if (dbUser) {
          const plan = (dbUser.plan || "free") as PlanKey;
          modelId =
            dbUser.preferredModel || PLANS[plan]?.model || PLANS.free.model;
        }
      }
    } catch {
      // Anonymous or DB unavailable - use free model
    }
  }

  const messages: { role: "system" | "user" | "assistant"; content: string }[] =
    [{ role: "system", content: SYSTEM_PROMPT }];

  // Add chat history for context
  if (history?.length) {
    for (const msg of history) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }
  }

  // Build user message
  let userContent = prompt;
  if (currentHtml) {
    userContent = `Current HTML:\n\`\`\`html\n${currentHtml}\n\`\`\`\n\nUser request: ${prompt}`;
  }
  messages.push({ role: "user", content: userContent });

  const result = streamText({
    model: openrouter(modelId),
    messages,
  });

  return result.toTextStreamResponse();
}
