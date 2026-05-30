import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText, UIMessage } from "ai";
import { z } from "zod";
import { getAccessToken } from "@/lib/auth-tokens";

export const maxDuration = 30;

const ChatRequestSchema = z.object({
  messages: z.array(z.any()).min(1).max(50),
  system: z.string().max(5000).optional(),
  tools: z.record(z.any()).optional(),
});

/**
 * Validate auth token by calling the backend auth service.
 * Rejects any token that cannot be verified server-side.
 */
async function validateAuth(request: Request): Promise<boolean> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.slice(7);
  if (!token || token.length < 10) {
    return false;
  }

  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";
    const base = apiUrl.startsWith("/")
      ? `${request.headers.get("x-forwarded-proto") || "http"}://${request.headers.get("host") || "localhost"}${apiUrl}`
      : apiUrl;
    const res = await fetch(`${base}/auth/verify`, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Simple in-memory rate limiter.
 * In production, use Redis (e.g., Upstash) or Vercel KV.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // 20 requests per minute

function checkRateLimit(clientId: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(clientId);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(clientId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count += 1;
  return { allowed: true };
}

export async function POST(req: Request) {
  // 1. Auth check
  if (!(await validateAuth(req))) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
    );
  }

  // 2. Rate limiting (by IP + token hash as client ID)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const authHeader = req.headers.get("authorization") || "";
  const clientId = `${ip}-${authHeader.slice(7, 20)}`;
  const rateLimit = checkRateLimit(clientId);

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "Rate limit exceeded. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter ?? 60),
          "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
          "X-RateLimit-Window": String(RATE_LIMIT_WINDOW_MS / 1000),
        },
      }
    );
  }

  // 3. Validate body
  let body: z.infer<typeof ChatRequestSchema>;
  try {
    const raw = await req.json();
    body = ChatRequestSchema.parse(raw);
  } catch (e) {
    const details = e instanceof z.ZodError ? e.errors : undefined;
    return Response.json(
      { error: "Invalid request body", details },
      { status: 400 }
    );
  }

  // 4. Stream with error boundary
  try {
    const result = streamText({
      model: openai("gpt-4o"),
      messages: convertToModelMessages(body.messages),
      system: body.system,
      tools: {
        ...(body.tools ? frontendTools(body.tools) : {}),
      },
    });
    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error("[Chat API] streamText failed:", error);
    return Response.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
