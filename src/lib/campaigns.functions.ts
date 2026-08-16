import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

/* --------- LIST --------- */

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getCampaign = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: camp, error } = await context.supabase
      .from("campaigns").select("*").eq("id", data.id).single();
    if (error) throw error;
    return camp;
  });

export const listExecutions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d: { campaign_id?: string } = {}) => d)
  .handler(async ({ data, context }) => {
    let q = context.supabase
      .from("campaign_executions")
      .select("*, campaigns(name)")
      .order("run_at", { ascending: false })
      .limit(200);
    if (data.campaign_id) q = q.eq("campaign_id", data.campaign_id);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const listCampaignMessages = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ campaign_id: z.string().uuid(), limit: z.number().int().min(1).max(500).default(200) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: messages, error } = await context.supabase
      .from("sms_messages")
      .select("id, phone, status, error, sent_at, delivered_at, created_at")
      .eq("campaign_id", data.campaign_id)
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(data.limit);
    if (error) throw error;
    return messages ?? [];
  });

/* --------- CREATE / UPDATE --------- */

export const upsertCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(1).max(200),
    sender_id: z.string().min(1).max(11),
    message: z.string().min(1).max(1000),
    recipients: z.array(z.string().min(6).max(20)).min(1).max(100000),
    scheduled_at: z.string().optional().nullable(),
    recurrence: z.enum(["daily", "weekly", "monthly"]).optional().nullable(),
    recurrence_end: z.string().optional().nullable(),
    save_as_draft: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const status = data.save_as_draft ? "draft" : data.recurrence ? "recurring" : data.scheduled_at ? "scheduled" : "draft";
    const next_run_at = data.scheduled_at ?? null;

    const payload = {
      user_id: context.userId,
      name: data.name,
      sender_id: data.sender_id,
      message: data.message,
      recipients: data.recipients,
      status,
      scheduled_at: data.scheduled_at ?? null,
      recurrence: data.recurrence ?? null,
      recurrence_end: data.recurrence_end ?? null,
      next_run_at,
    };

    if (data.id) {
      const { data: camp, error } = await context.supabase
        .from("campaigns")
        .update(payload)
        .eq("id", data.id)
        .eq("user_id", context.userId)
        .select()
        .single();
      if (error) throw error;
      return camp;
    }
    const { data: camp, error } = await context.supabase
      .from("campaigns")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return camp;
  });

// Legacy alias for callers still using createCampaign
export const createCampaign = upsertCampaign;

export const deleteCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("campaigns").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });

export const duplicateCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: src, error } = await context.supabase
      .from("campaigns").select("*").eq("id", data.id).single();
    if (error || !src) throw new Error("Campagne introuvable");
    const { data: copy, error: e2 } = await context.supabase
      .from("campaigns")
      .insert({
        user_id: context.userId,
        name: `${src.name} (copie)`,
        sender_id: src.sender_id,
        message: src.message,
        recipients: src.recipients,
        status: "draft",
      })
      .select().single();
    if (e2) throw e2;
    return copy;
  });

/* --------- SEND (immediate) --------- */

export const sendCampaign = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    const { data: camp, error } = await context.supabase
      .from("campaigns").select("*").eq("id", data.id).eq("user_id", context.userId).single();
    if (error || !camp) throw new Error("Campagne introuvable");
    if (camp.status === "sending") throw new Error("Envoi déjà en cours");

    const { data: profile } = await context.supabase
      .from("profiles").select("sms_credits").eq("id", context.userId).maybeSingle();
    const credits = profile?.sms_credits ?? 0;
    const list = (camp.recipients as string[]) ?? [];
    if (credits < list.length) throw new Error(`Crédits insuffisants (${credits}/${list.length}).`);

    const { sendCampaignViaNMGroupe } = await import("./nmgroupe.server");
    const result = await sendCampaignViaNMGroupe(camp.id, context.userId);
    return result;
  });
