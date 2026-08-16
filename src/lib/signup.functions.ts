import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertAdminRole } from "./server-function-helpers";

export const submitSignupApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({
    email: z.string().trim().email().max(320),
    mobile: z.string().trim().min(6).max(30),
    civility: z.string().trim().max(20).optional().nullable(),
    last_name: z.string().trim().min(1).max(120),
    first_name: z.string().trim().min(1).max(120),
    country: z.string().trim().min(1).max(80),
    city: z.string().trim().max(120).optional().nullable(),
    job_title: z.string().trim().max(120).optional().nullable(),
    structure: z.string().trim().max(200).optional().nullable(),
    client_type: z.string().trim().min(1).max(120),
    client_type_other: z.string().trim().max(200).optional().nullable(),
    website: z.union([z.literal(""), z.string().url().max(300)]).optional().nullable(),
    sender_id: z.string().trim().regex(/^[A-Za-z0-9 _-]{3,11}$/),
    sample_message: z.string().trim().max(1000).optional().nullable(),
    package_slug: z.string().trim().max(60).optional().nullable(),
    id_document_type: z.enum(["CNI", "Passeport", "Permis de conduire"]),
    is_legal_representative: z.boolean(),
    representative: z.record(z.string(), z.string().max(320)).default({}),
    certified: z.literal(true),
    gdpr_consent: z.literal(true),
    documents: z.array(z.object({
      key: z.string().regex(/^[a-z0-9_]{1,60}$/),
      label: z.string().trim().min(1).max(160),
      path: z.string().trim().min(1).max(500),
      name: z.string().trim().min(1).max(255),
      size: z.number().int().positive().max(8 * 1024 * 1024),
      mime_type: z.enum(["application/pdf", "image/jpeg", "image/png"]),
    })).min(1).max(20),
  }).parse(data))
  .handler(async ({ data, context }) => {
    const { validateKycDocuments } = await import("./signup-validation.server");
    await validateKycDocuments(context.supabase, context.userId, data.documents);
    const { certified, gdpr_consent, ...application } = data;
    const now = new Date().toISOString();
    const { error } = await context.supabase.from("signup_applications").insert({
      ...application,
      user_id: context.userId,
      status: "pending",
      gdpr_consent_at: now,
      certified_at: now,
      documents_validation_status: "pending",
    } as never);
    if (error) throw new Error(error.message);

    await context.supabase
      .from("profiles")
      .update({
        full_name: `${data.first_name} ${data.last_name}`.trim(),
        phone: data.mobile,
        company: data.structure ?? null,
        gdpr_consent_at: now,
      })
      .eq("id", context.userId);

    return { ok: true };
  });

export const getMySignupApplication = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase
      .from("signup_applications")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    return data ?? null;
  });

export const listSignupApplications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminRole(context);
    const { data, error } = await context.supabase
      .from("signup_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const reviewSignupApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pending", "approved", "rejected"]),
        documents_validation_status: z.enum(["pending", "valid", "rejected"]),
        admin_notes: z.string().max(2000).optional().nullable(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdminRole(context);
    const now = new Date().toISOString();
    const { error } = await context.supabase
      .from("signup_applications")
      .update({
        status: data.status,
        documents_validation_status: data.documents_validation_status,
        documents_checked_at: data.documents_validation_status === "pending" ? null : now,
        admin_notes: data.admin_notes ?? null,
        reviewed_at: now,
        reviewed_by: context.userId,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteSignupApplication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdminRole(context);
    const { error } = await context.supabase.from("signup_applications").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
