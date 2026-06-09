/**
 * Rate limiting that survives serverless.
 *
 * Uses Upstash Redis via REST (no SDK dependency) when
 * UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set.
 * Falls back to a per-instance in-memory bucket otherwise (fine for
 * local dev; NOT a real limit on Vercel — configure Upstash in prod).
 */

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitRecord>();

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]?.trim() || "unknown";

  return request.headers.get("x-real-ip") ?? "unknown";
}

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  resetAt: number;
};

export async function rateLimit({
  key,
  limit,
  windowMs
}: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult> {
  if (upstashUrl && upstashToken) {
    const distributed = await upstashRateLimit({ key, limit, windowMs });
    if (distributed) return distributed;
    // Upstash unreachable: fail open via the local bucket rather than
    // blocking legitimate emergency requests.
  }

  return memoryRateLimit({ key, limit, windowMs });
}

async function upstashRateLimit({
  key,
  limit,
  windowMs
}: {
  key: string;
  limit: number;
  windowMs: number;
}): Promise<RateLimitResult | null> {
  try {
    // Fixed-window counter: INCR, set expiry on first hit, read TTL.
    const response = await fetch(`${upstashUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${upstashToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        ["INCR", `rl:${key}`],
        ["PEXPIRE", `rl:${key}`, windowMs.toString(), "NX"],
        ["PTTL", `rl:${key}`]
      ]),
      signal: AbortSignal.timeout(2000)
    });

    if (!response.ok) return null;

    const results = (await response.json()) as { result: number }[];
    const count = Number(results[0]?.result ?? 0);
    const ttl = Number(results[2]?.result ?? windowMs);
    const resetAt = Date.now() + (ttl > 0 ? ttl : windowMs);

    if (count > limit) {
      return { ok: false, remaining: 0, resetAt };
    }

    return { ok: true, remaining: Math.max(0, limit - count), resetAt };
  } catch {
    return null;
  }
}

function memoryRateLimit({
  key,
  limit,
  windowMs
}: {
  key: string;
  limit: number;
  windowMs: number;
}): RateLimitResult {
  const now = Date.now();
  const current = buckets.get(key);

  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (current.count >= limit) {
    return { ok: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  buckets.set(key, current);

  return { ok: true, remaining: limit - current.count, resetAt: current.resetAt };
}
