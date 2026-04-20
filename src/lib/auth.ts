const ENCODER = new TextEncoder();

function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = ENCODER.encode(a);
  const bBytes = ENCODER.encode(b);
  if (aBytes.length !== bBytes.length) return false;
  let diff = 0;
  for (let i = 0; i < aBytes.length; i++) diff |= aBytes[i] ^ bBytes[i];
  return diff === 0;
}

export function requireBasicAuth(request: Request): Response | null {
  const expectedUser = import.meta.env.ADMIN_USER || process.env.ADMIN_USER || "admin";
  const expectedPass = import.meta.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD;

  if (!expectedPass) {
    return new Response("Admin access is not configured. Set ADMIN_PASSWORD.", {
      status: 503,
      headers: { "content-type": "text/plain" },
    });
  }

  const header = request.headers.get("authorization") || "";
  if (!header.startsWith("Basic ")) return unauthorized();

  let decoded = "";
  try {
    decoded = atob(header.slice(6));
  } catch {
    return unauthorized();
  }
  const idx = decoded.indexOf(":");
  if (idx < 0) return unauthorized();
  const user = decoded.slice(0, idx);
  const pass = decoded.slice(idx + 1);

  const userOk = timingSafeEqual(user, expectedUser);
  const passOk = timingSafeEqual(pass, expectedPass);
  if (!(userOk && passOk)) return unauthorized();

  return null;
}

function unauthorized(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "www-authenticate": 'Basic realm="Toledo Signup Admin", charset="UTF-8"',
      "content-type": "text/plain",
    },
  });
}
