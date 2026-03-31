export type SearchResult = {
  title: string;
  link: string;
  snippet: string;
};

export type SearchResponse = {
  query: string;
  results: SearchResult[];
};

/**
 * Search the web using Serper API (Google results).
 * Free tier: 2,500 queries/month.
 * Get API key at https://serper.dev
 */
export async function webSearch(
  query: string,
  numResults = 5
): Promise<SearchResponse> {
  const apiKey = process.env.SERPER_API_KEY;
  if (!apiKey) {
    throw new Error("SERPER_API_KEY not configured");
  }

  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: query,
      num: numResults,
    }),
  });

  if (!res.ok) {
    throw new Error(`Search failed: ${res.status}`);
  }

  const data = await res.json();

  const results: SearchResult[] = (data.organic || [])
    .slice(0, numResults)
    .map((item: { title: string; link: string; snippet: string }) => ({
      title: item.title,
      link: item.link,
      snippet: item.snippet,
    }));

  // Include knowledge graph if available
  if (data.knowledgeGraph) {
    const kg = data.knowledgeGraph;
    results.unshift({
      title: kg.title || "",
      link: kg.website || "",
      snippet: kg.description || "",
    });
  }

  return { query, results };
}

/**
 * Extract a search query from the user prompt if it references specific
 * brands, companies, products, or asks for current/real information.
 * Returns null if the prompt is purely creative/generic.
 */
export function extractSearchQuery(prompt: string): string | null {
  const lower = prompt.toLowerCase();

  // Skip generic/creative prompts
  const genericPatterns = /^(make|create|build|generate|design)\s+(me\s+)?(a\s+)?(simple|basic|beautiful|modern|cool)/i;
  if (genericPatterns.test(prompt.trim())) return null;

  // Detect brand/company/product names — prompt mentions a proper noun
  const hasProperNoun = /\b[A-Z][a-z]{2,}\b/.test(prompt) && !/^(Make|Create|Build|Generate|Design|Add|Change|Update|Fix|Remove)\b/.test(prompt.trim());

  // Detect requests for real/current info
  const infoPatterns = /\b(official|real|actual|current|latest|about|for the company|for the brand|landing page for|website for)\b/i;

  if (hasProperNoun || infoPatterns.test(lower)) {
    // Extract the core subject — take the first 80 chars as search query
    const cleaned = prompt
      .replace(/^(create|build|make|generate|design)\s+(me\s+)?(a\s+)?/i, "")
      .replace(/\s+(website|site|page|landing page)\b.*/i, "")
      .trim();
    return cleaned.slice(0, 80) || null;
  }

  return null;
}

/**
 * Format search results as context for the AI prompt.
 */
export function formatSearchContext(search: SearchResponse): string {
  if (search.results.length === 0) {
    return `[Web search for "${search.query}" returned no results]`;
  }

  const items = search.results
    .map((r, i) => `${i + 1}. **${r.title}**\n   ${r.snippet}\n   Source: ${r.link}`)
    .join("\n\n");

  return `## Web Search Results for "${search.query}"\n\n${items}\n\nUse the above information to make the website content accurate and up-to-date. Cite sources where appropriate.`;
}
