import { Context } from "hono";

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  displayUrl: string;
}

export interface WebSearchResponse {
  query: string;
  results: SearchResult[];
  timestamp: number;
}

export async function handleWebSearch(c: Context) {
  try {
    const body = await c.req.json();
    const { query } = body as { query: string };

    if (!query || query.trim().length === 0) {
      return c.json({ error: "Search query is required" }, 400);
    }

    // Try multiple search providers in order of preference
    let searchResults = null;
    
    // Try Bing Search API first
    if (process.env.BING_SEARCH_KEY) {
      searchResults = await performBingSearch(query);
    }
    // Fallback to Brave Search API
    else if (process.env.BRAVE_SEARCH_KEY) {
      searchResults = await performBraveSearch(query);
    }
    // Fallback to SerpAPI
    else if (process.env.SERPAPI_KEY) {
      searchResults = await performSerpApiSearch(query);
    }
    // Use DuckDuckGo as last resort (no API key required)
    else {
      searchResults = await performDuckDuckGoSearch(query);
    }

    const response: WebSearchResponse = {
      query,
      results: searchResults,
      timestamp: Date.now(),
    };

    return c.json(response);
  } catch (error) {
    console.error("Web search error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Search failed" },
      500
    );
  }
}

async function performBingSearch(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10&textFormat=Raw`,
    {
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.BING_SEARCH_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Bing Search API error: ${response.statusText}`);
  }

  const data = await response.json() as any;
  
  return (data.webPages?.value || []).map((item: any): SearchResult => ({
    title: item.name || "",
    url: item.url || "",
    snippet: item.snippet || "",
    displayUrl: item.displayUrl || item.url || "",
  }));
}

async function performBraveSearch(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
    {
      headers: {
        "X-Subscription-Token": process.env.BRAVE_SEARCH_KEY!,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Brave Search API error: ${response.statusText}`);
  }

  const data = await response.json() as any;
  
  return (data.web?.results || []).map((item: any): SearchResult => ({
    title: item.title || "",
    url: item.url || "",
    snippet: item.description || "",
    displayUrl: item.url || "",
  }));
}

async function performSerpApiSearch(query: string): Promise<SearchResult[]> {
  const response = await fetch(
    `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${process.env.SERPAPI_KEY}&num=10`
  );

  if (!response.ok) {
    throw new Error(`SerpAPI error: ${response.statusText}`);
  }

  const data = await response.json() as any;
  
  return (data.organic_results || []).map((item: any): SearchResult => ({
    title: item.title || "",
    url: item.link || "",
    snippet: item.snippet || "",
    displayUrl: item.displayed_link || item.link || "",
  }));
}

async function performDuckDuckGoSearch(query: string): Promise<SearchResult[]> {
  // DuckDuckGo Instant Answer API (limited results)
  // Note: This is a fallback and provides limited results
  const response = await fetch(
    `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
  );

  if (!response.ok) {
    throw new Error(`DuckDuckGo search error: ${response.statusText}`);
  }

  const data = await response.json() as any;
  
  // DuckDuckGo API has limited web results, mainly instant answers
  const results: SearchResult[] = [];
  
  // Add abstract if available
  if (data.Abstract) {
    results.push({
      title: data.Heading || "DuckDuckGo Result",
      url: data.AbstractURL || "",
      snippet: data.Abstract,
      displayUrl: data.AbstractSource || "",
    });
  }

  // Add related topics
  if (data.RelatedTopics) {
    data.RelatedTopics.slice(0, 5).forEach((topic: any) => {
      if (topic.Text && topic.FirstURL) {
        results.push({
          title: topic.Text.split(" - ")[0] || "Related Topic",
          url: topic.FirstURL,
          snippet: topic.Text,
          displayUrl: topic.FirstURL,
        });
      }
    });
  }

  // If no results from DuckDuckGo, return a mock result indicating limited search
  if (results.length === 0) {
    results.push({
      title: "Limited Search Results",
      url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      snippet: `Search results for "${query}" - Please configure a search API for better results`,
      displayUrl: "duckduckgo.com",
    });
  }

  return results;
}

// Utility function to format search results for display
export function formatSearchResults(results: SearchResult[]): string {
  if (results.length === 0) {
    return "No search results found.";
  }

  let formatted = "Web Search Results:\n\n";
  
  results.forEach((result, index) => {
    formatted += `${index + 1}. **${result.title}**\n`;
    formatted += `   ${result.snippet}\n`;
    formatted += `   Source: ${result.displayUrl}\n`;
    formatted += `   Link: ${result.url}\n\n`;
  });

  return formatted;
}