import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GENERIC_LOGIN_ERROR = "Identifiant ou mot de passe incorrect.";

async function resolveEmail(identifier: string): Promise<string | null> {
  const value = identifier.trim().toLowerCase();
  if (value.includes("@")) return value;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("email")
    .ilike("username", value)
    .maybeSingle();

  return profile?.email ?? null;
}

/**
 * Sign in with an email OR username. Resolution happens entirely server-side so
 * anonymous callers can never map a username to an account's email address.
 * Failures always return the same generic message (no account enumeration).
 */
export const loginWithIdentifier = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        identifier: z.string().trim().min(1).max(160),
        password: z.string().min(1).max(200),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const email = await resolveEmail(data.identifier);
    if (!email) return { ok: false as const, error: GENERIC_LOGIN_ERROR };

    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY;
    if (!url || !key) throw new Error("Service d'authentification indisponible.");

    const client = createClient(url, key, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { data: result, error } = await client.auth.signInWithPassword({
      email,
      password: data.password,
    });
    if (error || !result.session) return { ok: false as const, error: GENERIC_LOGIN_ERROR };

    return {
      ok: true as const,
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
    };
  });

/**
 * Sends a password-recovery email for an email or username. Always returns the
 * same response so callers cannot learn whether an account exists.
 */
export const requestPasswordReset = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        identifier: z.string().trim().min(1).max(160),
        redirectTo: z.string().url().max(500),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    try {
      const email = await resolveEmail(data.identifier);
      if (email) {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.auth.resetPasswordForEmail(email, { redirectTo: data.redirectTo });
      }
    } catch (err) {
      console.error("[auth] password reset failed", err);
    }
    return { ok: true };
  });
