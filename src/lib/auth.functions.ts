import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const resolveLoginIdentifier = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ identifier: z.string().min(1).max(160) }).parse(data),
  )
  .handler(async ({ data }) => {
    const identifier = data.identifier.trim().toLowerCase();
    if (identifier.includes("@")) return { email: identifier };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .select("email")
      .ilike("username", identifier)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return { email: profile?.email ?? null };
  });