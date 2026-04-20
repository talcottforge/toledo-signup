import type { APIRoute } from "astro";
import { requireBasicAuth } from "../../lib/auth";
import { listSignups } from "../../lib/storage";

export const prerender = false;

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes("\"") || value.includes("\n") || value.includes("\r")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export const GET: APIRoute = async ({ request }) => {
  const authFail = requireBasicAuth(request);
  if (authFail) return authFail;

  const signups = await listSignups();

  const header = ["Name", "Email", "Organization", "Signed up (UTC)", "IP", "User agent"];
  const rows = signups.map((s) => [
    s.name,
    s.email,
    s.organization,
    s.createdAt,
    s.ip || "",
    s.userAgent || "",
  ]);

  const csv =
    "\uFEFF" +
    [header, ...rows].map((row) => row.map((c) => csvEscape(String(c ?? ""))).join(",")).join("\r\n") +
    "\r\n";

  const filename = `toledo-signups-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
};
