import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { PLANS, type PlanKey } from "@/lib/stripe";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert web developer and designer. The user will describe what website they want, and you will generate a multi-file static website.

Output format - use labeled code blocks for each file:

\`\`\`html filename=index.html
<!DOCTYPE html>
...
\`\`\`

\`\`\`css filename=style.css
...
\`\`\`

\`\`\`js filename=script.js
...
\`\`\`

Rules:
- Always output at least index.html and style.css as separate files
- The HTML file should link to style.css via <link rel="stylesheet" href="style.css">
- If JavaScript is needed, put it in script.js and link via <script src="script.js"></script>
- Use modern CSS (flexbox, grid, gradients, shadows, custom properties) for beautiful design
- Make the page fully responsive (mobile-first approach)
- Use a cohesive color scheme and professional typography
- Include meta viewport tag for mobile support
- You can use Google Fonts via CDN link in the HTML
- Make the design modern, clean, and visually appealing
- When the user asks for changes, output ALL files (even unchanged ones) so they stay in sync
- Keep explanations brief, focus on delivering the code
- You may add more files if needed (e.g. about.html, contact.html)`;

export async function POST(request: Request) {
  const body = await request.json();
  const { prompt, files, history } = body;

  // Determine user's plan and model
  let modelId = PLANS.free.model;

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

  // Build user message with current files
  let userContent = prompt;
  if (files && Object.keys(files).length > 0) {
    const fileList = Object.entries(files as Record<string, string>)
      .map(([name, content]) => {
        const ext = name.split(".").pop();
        return `\`\`\`${ext} filename=${name}\n${content}\n\`\`\``;
      })
      .join("\n\n");
    userContent = `Current files:\n${fileList}\n\nUser request: ${prompt}`;
  }
  messages.push({ role: "user", content: userContent });

  const result = streamText({
    model: openrouter(modelId),
    messages,
  });

  return result.toTextStreamResponse();
}
