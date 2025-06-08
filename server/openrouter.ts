import { Context } from "hono";

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export async function handleLLMRequest(c: Context) {
  try {
    const body = await c.req.json();
    const { messages, model, stream = false } = body as {
      messages: OpenRouterMessage[];
      model: string;
      stream?: boolean;
    };

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key not configured");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "T3 Chat Clone",
      },
      body: JSON.stringify({
        model,
        messages,
        stream,
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    if (stream) {
      // Handle streaming response
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    } else {
      // Handle non-streaming response
      const data = await response.json() as OpenRouterResponse;
      return c.json(data);
    }
  } catch (error) {
    console.error("LLM request error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
}

export async function handleImageGeneration(c: Context) {
  try {
    const body = await c.req.json();
    const { prompt, model = "openai/dall-e-3" } = body as {
      prompt: string;
      model?: string;
    };

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OpenRouter API key not configured");
    }

    const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "T3 Chat Clone",
      },
      body: JSON.stringify({
        model,
        prompt,
        n: 1,
        size: "1024x1024",
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenRouter API error: ${error}`);
    }

    const data = await response.json() as any;
    return c.json(data);
  } catch (error) {
    console.error("Image generation error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
}

// Available models for the UI
export const AVAILABLE_MODELS = [
  { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
  { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
  { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
  { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google" },
  { id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 3.1 405B", provider: "Meta" },
  { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral AI" },
];

export const IMAGE_MODELS = [
  { id: "openai/dall-e-3", name: "DALL-E 3", provider: "OpenAI" },
  { id: "stability-ai/stable-diffusion-xl", name: "Stable Diffusion XL", provider: "Stability AI" },
];