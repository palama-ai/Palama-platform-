import { createHash, randomBytes } from "crypto";
import { createClient } from "@/utils/supabase/server";

export const KEY_PREFIX = "sk-palama-";

export function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/** Generate a new API key. Only the full key is shown once — store its hash. */
export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const secret = randomBytes(24).toString("base64url");
  const key = `${KEY_PREFIX}${secret}`;
  return { key, hash: sha256Hex(key), prefix: key.slice(0, 14) };
}

export type KeyOwner = { userId: string; keyId: string } | null;

/**
 * Validate a `sk-palama-...` bearer against the api_keys table.
 * Returns the owner on success (and refreshes last_used_at), else null.
 * Uses the service role when available, else falls back to anon RLS read.
 */
export async function validateApiKey(bearer: string): Promise<KeyOwner> {
  if (!bearer || !bearer.startsWith(KEY_PREFIX)) return null;
  const hash = sha256Hex(bearer.trim());

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  try {
    if (supabaseUrl && serviceKey) {
      const { createClient: createAdmin } = await import("@supabase/supabase-js");
      const admin = createAdmin(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error } = await admin
        .from("api_keys")
        .select("id, user_id, revoked")
        .eq("key_hash", hash)
        .maybeSingle();
      if (error || !data || (data as any).revoked) return null;
      await admin
        .from("api_keys")
        .update({ last_used_at: new Date().toISOString() })
        .eq("id", (data as any).id);
      return { userId: (data as any).user_id, keyId: (data as any).id };
    }
  } catch {}

  // Fallback: anon read (works only if an RLS policy permits hash lookup;
  // otherwise keys validate once SUPABASE_SERVICE_ROLE_KEY is configured).
  try {
    if (!supabaseUrl || !anonKey) return null;
    const { createClient: createAnon } = await import("@supabase/supabase-js");
    const anon = createAnon(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    // Preferred: SECURITY DEFINER rpc (no service key needed).
    const { data: rpcUser } = await anon.rpc("validate_api_key", { p_hash: hash });
    if (rpcUser) {
      return { userId: rpcUser as string, keyId: "" };
    }
    return null;
  } catch {
    return null;
  }
}

/** Best-effort usage log row (never throws). Uses the SECURITY DEFINER
 *  function so engine / api-key callers (no cookie session) can write. */
export async function logApiUsage(userId: string, endpoint: string, model = ""): Promise<void> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      const { createClient: createAdmin } = await import("@supabase/supabase-js");
      const admin = createAdmin(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { error } = await admin.from("api_usage").insert({ user_id: userId, endpoint, model });
      if (!error) return;
    }
    const supabase = await createClient();
    const { error } = await supabase.rpc("log_api_usage", {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_model: model,
    });
    if (error) {
      await supabase.from("api_usage").insert({ user_id: userId, endpoint, model });
    }
  } catch (e: any) {
    console.warn("[usage] unexpected:", e?.message || e);
  }
}
