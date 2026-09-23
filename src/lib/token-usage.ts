import { createClient } from "@/utils/supabase/server";

/** Weekly token quota: 7,000,000 tokens per user, reset every Monday 00:00 UTC. */
export const TOKEN_QUOTA_LIMIT = 7_000_000;

function weekStartUTC(now = new Date()): Date {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  // getUTCDay: 0=Sun..6=Sat → days since Monday
  const sinceMonday = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - sinceMonday);
  return d;
}

export function quotaPeriodUTC(now = new Date()) {
  const start = weekStartUTC(now);
  const reset = new Date(start.getTime() + 7 * 24 * 3600 * 1000);
  return { week_start: start.toISOString(), resets_at: reset.toISOString() };
}

export async function getAdminClient(): Promise<any | null> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceKey) return null;
    const { createClient: createAdmin } = await import("@supabase/supabase-js");
    return createAdmin(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  } catch {
    return null;
  }
}

/** Tokens consumed in the current week. Null = unknown (DB unreachable). */
export async function getWeeklyUsage(userId: string): Promise<number | null> {
  if (!userId) return 0;
  try {
    const supabase = await createClient().catch(() => null);
    if (supabase) {
      const { data, error } = await supabase.rpc("weekly_token_usage", { p_user_id: userId });
      if (!error && data !== null && data !== undefined) return Number(data) || 0;
    }
  } catch {}
  try {
    const admin = await getAdminClient();
    if (admin) {
      const { data, error } = await admin.rpc("weekly_token_usage", { p_user_id: userId });
      if (!error && data !== null && data !== undefined) return Number(data) || 0;
      // Fallback: sum directly (service role bypasses RLS).
      const { week_start } = quotaPeriodUTC();
      const { data: rows, error: e2 } = await admin
        .from("token_usage")
        .select("total_tokens")
        .eq("user_id", userId)
        .gte("created_at", week_start);
      if (!e2 && Array.isArray(rows)) {
        return rows.reduce((s: number, r: any) => s + (Number(r.total_tokens) || 0), 0);
      }
    }
  } catch {}
  return null;
}

export type QuotaStatus = {
  total_quota: number;
  used_tokens: number | null;
  remaining_tokens: number | null;
  used_percent: number | null;
  remaining_percent: number | null;
  is_exceeded: boolean;
  unknown: boolean;
  week_start: string;
  resets_at: string;
};

export async function getQuota(userId: string): Promise<QuotaStatus> {
  const { week_start, resets_at } = quotaPeriodUTC();
  const used = await getWeeklyUsage(userId);
  if (used === null) {
    // Fail closed: unverifiable usage blocks new work.
    return {
      total_quota: TOKEN_QUOTA_LIMIT,
      used_tokens: null,
      remaining_tokens: null,
      used_percent: null,
      remaining_percent: null,
      is_exceeded: true,
      unknown: true,
      week_start,
      resets_at,
    };
  }
  const remaining = Math.max(0, TOKEN_QUOTA_LIMIT - used);
  const usedPct = Math.min(100, Math.round((used / TOKEN_QUOTA_LIMIT) * 100 * 100) / 100);
  return {
    total_quota: TOKEN_QUOTA_LIMIT,
    used_tokens: used,
    remaining_tokens: remaining,
    used_percent: usedPct,
    remaining_percent: Math.max(0, Math.round((100 - usedPct) * 100) / 100),
    is_exceeded: used >= TOKEN_QUOTA_LIMIT,
    unknown: false,
    week_start,
    resets_at,
  };
}

export type ExtractedUsage = {
  prompt: number;
  completion: number;
  estimated: boolean;
};

/** Best-effort extraction of token usage from a gateway response body. */
export function extractGatewayUsage(
  bodyText: string,
  contentType: string,
  requestBodyText = ""
): ExtractedUsage {
  const empty = { prompt: 0, completion: 0, estimated: false };
  if (!bodyText) return empty;
  const num = (v: any) => (typeof v === "number" && v >= 0 ? Math.floor(v) : 0);
  // 1) Plain JSON completion object.
  if ((contentType || "").includes("json") || bodyText.trim().startsWith("{")) {
    try {
      const data = JSON.parse(bodyText);
      const u = data?.usage;
      if (u) return { prompt: num(u.prompt_tokens), completion: num(u.completion_tokens), estimated: false };
    } catch {}
  }
  // 2) SSE stream: look for an inline usage block first (exact when present).
  let streamedChars = 0;
  for (const rawLine of bodyText.split("\n")) {
    const line = rawLine.trim();
    if (!line.startsWith("data:")) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") continue;
    try {
      const chunk = JSON.parse(payload);
      if (chunk?.usage) {
        const u = chunk.usage;
        return { prompt: num(u.prompt_tokens), completion: num(u.completion_tokens), estimated: false };
      }
      const choice = chunk?.choices?.[0];
      const delta = choice?.delta || {};
      const t = delta.content || delta.text || delta.reasoning_content || choice?.message?.content || "";
      if (typeof t === "string") streamedChars += t.length;
    } catch {}
  }
  if (streamedChars > 0 || bodyText.includes("data:")) {
    // 3) SSE without a usage block: estimate (~4 chars/token) so streamed
    // calls can never ride for free.
    let promptChars = 0;
    try {
      const req = JSON.parse(requestBodyText || "{}");
      const msgs = Array.isArray(req?.messages) ? req.messages : [];
      for (const m of msgs) {
        const c = m?.content;
        if (typeof c === "string") promptChars += c.length;
        else if (Array.isArray(c)) {
          for (const p of c) {
            if (typeof p?.text === "string") promptChars += p.text.length;
          }
        }
      }
    } catch {}
    return {
      prompt: Math.ceil(promptChars / 4),
      completion: Math.max(1, Math.ceil(streamedChars / 4)),
      estimated: true,
    };
  }
  return empty;
}

/** Persist one completion. Best-effort — never throws. */
export async function recordTokenUsage(
  userId: string,
  usage: { model?: string; prompt?: number; completion?: number; estimated?: boolean }
): Promise<void> {
  if (!userId) return;
  const model = (usage.model || "").slice(0, 120);
  const prompt = Math.max(0, Math.floor(usage.prompt || 0));
  const completion = Math.max(0, Math.floor(usage.completion || 0));
  const estimated = !!usage.estimated;
  try {
    const supabase = await createClient().catch(() => null);
    if (supabase) {
      const { error } = await supabase.rpc("record_token_usage", {
        p_user_id: userId,
        p_model: model,
        p_prompt: prompt,
        p_completion: completion,
        p_estimated: estimated,
      });
      if (!error) return;
    }
  } catch {}
  try {
    const admin = await getAdminClient();
    if (admin) {
      const { error } = await admin.rpc("record_token_usage", {
        p_user_id: userId,
        p_model: model,
        p_prompt: prompt,
        p_completion: completion,
        p_estimated: estimated,
      });
      if (!error) return;
      await admin.from("token_usage").insert({
        user_id: userId,
        model,
        prompt_tokens: prompt,
        completion_tokens: completion,
        estimated,
      });
    }
  } catch (e: any) {
    console.warn("[quota] record failed:", e?.message || e);
  }
}

/** True if the engine owner is a real Supabase login. Null = unverifiable. */
export async function isRealUser(userId: string): Promise<boolean | null> {
  // Malformed ids can never be real logins — reject without a DB roundtrip.
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId || '')) {
    return false;
  }
  // 1) Anon RPC (SECURITY DEFINER — works WITHOUT a service-role key).
  try {
    const supabase = await createClient().catch(() => null);
    if (supabase) {
      const { data, error } = await supabase.rpc("user_exists", { p_uid: userId });
      if (!error && typeof data === "boolean") return data;
    }
  } catch {}
  // 2) Admin fallback (service-role key configured).
  try {
    const admin = await getAdminClient();
    if (admin) {
      const { data, error } = await admin.rpc("user_exists", { p_uid: userId });
      if (!error && typeof data === "boolean") return data;
    }
  } catch {}
  return null;
}

/** True if this owner already migrated a desktop total once. */
export async function hasTokenMigration(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient().catch(() => null);
    if (supabase) {
      const { data } = await supabase.rpc("has_token_migration", { p_user_id: userId });
      if (typeof data === "boolean") return data;
    }
    const admin = await getAdminClient();
    if (admin) {
      const { data } = await admin.rpc("has_token_migration", { p_user_id: userId });
      if (typeof data === "boolean") return data;
    }
  } catch {}
  return false;
}
