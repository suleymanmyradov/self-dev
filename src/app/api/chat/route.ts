import { openai } from "@ai-sdk/openai";
import { frontendTools } from "@assistant-ui/react-ai-sdk";
import { convertToModelMessages, streamText } from "ai";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { z } from "zod";

const AUTH_COOKIE_NAME = "auth-token";

export const maxDuration = 30;

const ChatRequestSchema = z.object({
  messages: z.array(z.unknown()).min(1).max(50),
  system: z.string().max(5000).optional(),
  tools: z.record(z.unknown()).optional(),
});

// JWT config (server-side env vars — never exposed to the browser)
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER || "growth-auth";
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || "growth-api";

/** Read the access token from the httpOnly session cookie. */
async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value ?? null;
}

/**
 * Validate the access token locally using the same JWT secret as the backend.
 */
async function validateToken(token: string | null): Promise<boolean> {
  if (!token || token.length < 10) {
    return false;
  }

  if (!JWT_SECRET) {
    // No secret configured — fail closed rather than trusting any string.
    console.warn("[chat] JWT_SECRET is not set; rejecting request.");
    return false;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      clockTolerance: 60,
    });

    // Ensure this is an access token, not a refresh token
    return payload.typ === "access";
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
  // 1. Auth check (token comes from the httpOnly session cookie)
  const sessionToken = await getSessionToken();
  if (!(await validateToken(sessionToken))) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401, headers: { "WWW-Authenticate": "Bearer" } }
    );
  }

  // 2. Rate limiting (by IP + token fragment as client ID)
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  const clientId = `${ip}-${(sessionToken ?? "").slice(0, 13)}`;
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
      messages: convertToModelMessages(body.messages as Parameters<typeof convertToModelMessages>[0]),
      system: body.system,
      tools: {
        ...(body.tools ? frontendTools(body.tools as Parameters<typeof frontendTools>[0]) : {}),
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
