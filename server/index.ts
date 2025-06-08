import "dotenv/config";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { handle } from "hono/vercel";
import { cors } from "hono/cors";
import { handleLogin } from "./login";
import { handlePush } from "./push";
import { validateAndDecodeAuthData } from "../shared/auth";
import { must } from "../shared/must";
import { handleLLMRequest, handleImageGeneration } from "./openrouter";
import { handleSimpleUpload } from "./upload";
import { handleWebSearch } from "./websearch";

export const app = new Hono().basePath("/api");

const secretKey = new TextEncoder().encode(
  must(process.env.ZERO_AUTH_SECRET, "required env var ZERO_AUTH_SECRET")
);

// Add CORS middleware
app.use("/*", cors({
  origin: ["http://localhost:3000", "http://localhost:5173"],
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  credentials: true,
}));

// Auth middleware
const authMiddleware = validator("header", (v) => {
  const auth = v["authorization"];
  if (!auth) {
    return undefined;
  }
  const parts = /^Bearer (.+)$/.exec(auth);
  if (!parts) {
    throw new Error(
      "Invalid Authorization header - should start with 'Bearer '"
    );
  }
  const [, jwt] = parts;
  return validateAndDecodeAuthData(jwt, secretKey);
});

// Existing endpoints
app.get("/login", (c) => handleLogin(c, secretKey));
app.post("/push", authMiddleware, async (c) => {
  return await c.json(await handlePush(c.req.valid("header"), c.req.raw));
});

// LLM Integration endpoints
app.post("/llm", async (c) => {
  return await handleLLMRequest(c);
});

app.post("/llm/stream", async (c) => {
  // Handle streaming LLM requests by modifying the body to include stream: true
  const body = await c.req.json();
  const streamingBody = { ...body, stream: true };
  
  // Create a new request with streaming enabled
  const newRequest = new Request(c.req.url, {
    method: "POST",
    headers: c.req.raw.headers,
    body: JSON.stringify(streamingBody),
  });
  
  // Create a new context with the modified request
  const newContext = { ...c, req: { ...c.req, raw: newRequest } };
  return await handleLLMRequest(newContext as any);
});

app.post("/image/generate", async (c) => {
  return await handleImageGeneration(c);
});

// File upload endpoints
app.post("/upload", async (c) => {
  return await handleSimpleUpload(c);
});

// Web search endpoint
app.post("/search", async (c) => {
  return await handleWebSearch(c);
});

// Share endpoints
app.post("/share", async (c) => {
  try {
    const body = await c.req.json();
    const { chatId, isPublic = true, allowCollaboration = false } = body;
    
    const shareId = `share_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    // In a real implementation, save this to the database
    const shareLink = {
      id: shareId,
      chatId,
      isPublic,
      allowCollaboration,
      createdAt: Date.now(),
      url: `${process.env.SITE_URL || 'http://localhost:3000'}/share/${shareId}`,
    };
    
    return c.json(shareLink);
  } catch (error) {
    console.error("Share creation error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Share creation failed" },
      500
    );
  }
});

app.get("/share/:shareId", async (c) => {
  try {
    const shareId = c.req.param("shareId");
    
    // In a real implementation, fetch this from the database
    // For now, return a mock response
    const shareData = {
      id: shareId,
      chatId: "mock_chat_id",
      isPublic: true,
      allowCollaboration: false,
      createdAt: Date.now(),
    };
    
    return c.json(shareData);
  } catch (error) {
    console.error("Share fetch error:", error);
    return c.json(
      { error: error instanceof Error ? error.message : "Share not found" },
      404
    );
  }
});

// Model information endpoint
app.get("/models", (c) => {
  const models = [
    { id: "openai/gpt-4o", name: "GPT-4o", provider: "OpenAI" },
    { id: "openai/gpt-4o-mini", name: "GPT-4o Mini", provider: "OpenAI" },
    { id: "anthropic/claude-3.5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
    { id: "anthropic/claude-3-haiku", name: "Claude 3 Haiku", provider: "Anthropic" },
    { id: "google/gemini-pro-1.5", name: "Gemini Pro 1.5", provider: "Google" },
    { id: "meta-llama/llama-3.1-405b-instruct", name: "Llama 3.1 405B", provider: "Meta" },
    { id: "mistralai/mistral-large", name: "Mistral Large", provider: "Mistral AI" },
  ];
  
  return c.json({ models });
});

// Image models endpoint
app.get("/models/image", (c) => {
  const imageModels = [
    { id: "openai/dall-e-3", name: "DALL-E 3", provider: "OpenAI" },
    { id: "stability-ai/stable-diffusion-xl", name: "Stable Diffusion XL", provider: "Stability AI" },
  ];
  
  return c.json({ models: imageModels });
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    features: [
      "llm-chat",
      "image-generation", 
      "file-upload",
      "web-search",
      "chat-sharing",
      "real-time-sync"
    ]
  });
});

export default handle(app);
