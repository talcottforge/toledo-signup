import type { APIRoute } from "astro";
import { addSignup } from "../../lib/storage";

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Normalize a US phone number. Accepts any input (digits, parens, dashes,
 * spaces, a leading "+1" or "1"). Returns the canonical "(555) 123-4567"
 * form if there are exactly 10 digits, empty string if empty input, or
 * null if the input doesn't look like a valid US number.
 */
function normalizeUsPhone(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  let digits = trimmed.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.slice(1);
  if (digits.length !== 10) return null;
  // Area code and exchange can't start with 0 or 1 (NANP rules)
  if (/^[01]/.test(digits) || /^\d{3}[01]/.test(digits)) return null;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  let name = "";
  let email = "";
  let phone = "";
  let organization = "";
  let honeypot = "";

  const contentType = request.headers.get("content-type") || "";
  try {
    if (contentType.includes("application/json")) {
      const body = await request.json();
      name = (body.name ?? "").toString();
      email = (body.email ?? "").toString();
      phone = (body.phone ?? "").toString();
      organization = (body.organization ?? "").toString();
      honeypot = (body.website ?? "").toString();
    } else {
      const fd = await request.formData();
      name = (fd.get("name") ?? "").toString();
      email = (fd.get("email") ?? "").toString();
      phone = (fd.get("phone") ?? "").toString();
      organization = (fd.get("organization") ?? "").toString();
      honeypot = (fd.get("website") ?? "").toString();
    }
  } catch {
    return json({ error: "Invalid request body." }, 400);
  }

  name = name.trim();
  email = email.trim().toLowerCase();
  organization = organization.trim();

  if (honeypot) return json({ ok: true }, 200);
  if (!name || name.length > 200) return json({ error: "Please enter your name." }, 400);
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return json({ error: "Please enter a valid email address." }, 400);
  }
  if (organization.length > 200) return json({ error: "Organization too long." }, 400);

  const normalizedPhone = normalizeUsPhone(phone);
  if (normalizedPhone === null) {
    return json({ error: "Please enter a valid US phone number." }, 400);
  }

  try {
    await addSignup({
      name,
      email,
      phone: normalizedPhone,
      organization,
      ip: clientAddress,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });
  } catch (err) {
    console.error("Failed to save signup:", err);
    return json({ error: "Could not save your signup. Please try again." }, 500);
  }

  const accept = request.headers.get("accept") || "";
  if (accept.includes("application/json")) {
    return json({ ok: true }, 200);
  }
  return new Response(null, { status: 303, headers: { Location: "/thank-you" } });
};

function json(data: unknown, status: number) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });
}
