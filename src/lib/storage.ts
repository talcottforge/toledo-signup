import { getStore } from "@netlify/blobs";

export interface Signup {
  id: string;
  name: string;
  email: string;
  phone: string;
  organization: string;
  createdAt: string;
  ip?: string;
  userAgent?: string;
}

const STORE_NAME = "signups";

export function signupsStore() {
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

export async function addSignup(entry: Omit<Signup, "id" | "createdAt"> & { createdAt?: string }): Promise<Signup> {
  const store = signupsStore();
  const id = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}`;
  const createdAt = entry.createdAt ?? new Date().toISOString();
  const signup: Signup = { id, createdAt, ...entry };
  await store.setJSON(id, signup);
  return signup;
}

export async function listSignups(): Promise<Signup[]> {
  const store = signupsStore();
  const { blobs } = await store.list();
  const entries = await Promise.all(
    blobs.map(async (b) => (await store.get(b.key, { type: "json" })) as Signup | null),
  );
  return entries
    .filter((e): e is Signup => e !== null)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
