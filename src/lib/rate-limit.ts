/**
 * Rate-limit em memória (sliding window simples).
 *
 * Importante: em serverless (Vercel), cada instância tem seu próprio Map.
 * Isso significa que um atacante com sorte pode escapar do limite caindo
 * em instâncias diferentes — mas como tráfego real divide carga entre as
 * mesmas instâncias frias, na prática isso ainda derruba flood básico.
 *
 * Para proteção mais forte, trocar este Map por Vercel KV / Upstash.
 */

type RateLimitOptions = {
  /** Janela em milissegundos. */
  windowMs: number;
  /** Máximo de requests permitidas dentro da janela. */
  max: number;
};

type BucketEntry = {
  /** Timestamps das requests dentro da janela atual. */
  hits: number[];
};

const buckets = new Map<string, BucketEntry>();

export type RateLimitResult = {
  allowed: boolean;
  /** Quantas requests restam na janela. */
  remaining: number;
  /** Timestamp (ms) em que a próxima request seria permitida se bloqueada. */
  retryAfterMs: number;
};

export function rateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const windowStart = now - options.windowMs;

  const bucket = buckets.get(key) ?? { hits: [] };
  // Descarta hits fora da janela.
  bucket.hits = bucket.hits.filter((ts) => ts > windowStart);

  if (bucket.hits.length >= options.max) {
    const oldest = bucket.hits[0];
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + options.windowMs - now),
    };
  }

  bucket.hits.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: options.max - bucket.hits.length,
    retryAfterMs: 0,
  };
}
