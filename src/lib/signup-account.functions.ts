import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { assertPasswordAllowed } from "./password.server";

/**
 * Crée le compte client côté serveur SANS confirmer l'email : la propriété de
 * l'adresse doit être prouvée par un code à usage unique envoyé par email
 * (voir /inscription -> verifyOtp). Aucune session n'est délivrée ici, donc
 * personne ne peut squatter l'adresse email d'un tiers.
 * Si l'email existe déjà, on renvoie `exists` et le client se connecte.
 */
export const createSignupAccount = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        email: z.string().trim().email().max(320),
        password: z.string().min(10).max(200),
        full_name: z.string().trim().max(240).optional(),
        phone: z.string().trim().max(30).optional(),
      })
      .parse(data),
  )
  .handler(async ({ data }) => {
    const policyError = await assertPasswordAllowed(data.password);
    if (policyError) return { ok: false as const, error: policyError };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const email = data.email.toLowerCase();

    const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: false,
      user_metadata: {
        full_name: data.full_name ?? "",
        phone: data.phone ?? "",
        gdpr_consent_at: new Date().toISOString(),
      },
    });

    if (error) {
      const message = error.message.toLowerCase();
      if (message.includes("already") || message.includes("exists") || message.includes("registered")) {
        return { ok: true as const, exists: true as const, requires_verification: true as const };
      }
      return { ok: false as const, error: error.message };
    }

    return {
      ok: true as const,
      exists: false as const,
      requires_verification: true as const,
      user_id: created.user?.id ?? null,
    };
  });

