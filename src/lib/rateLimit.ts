const requests = new Map<string, { count: number; reset: number }>();

export function rateLimit(request: Request, limit = 8, windowMs = 60_000) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const current = requests.get(ip);
  if (!current || current.reset < now) {
    requests.set(ip, { count: 1, reset: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
