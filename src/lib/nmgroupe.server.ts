// NM Groupe SMS Gateway integration
// Env vars (add via add_secret when API keys are provided):
//   NMGROUPE_API_URL        e.g. https://api.nmgroupe.com/v1/sms/send
//   NMGROUPE_API_KEY        API key
//   NMGROUPE_ACCOUNT_ID     optional account identifier
//   NMGROUPE_WEBHOOK_SECRET shared secret for delivery webhook signature
//
// This module is server-only.

import { supabaseAdmin } from "@/integrations/supabase/client.server";

type SendResult = {
  status: "sent" | "queued" | "failed";
  provider_message_id?: string;
  error?: string;
};

async function sendSingleSms(params: {
  to: string;
  from: string;
  message: string;
}): Promise<SendResult> {
  const apiUrl = process.env.NMGROUPE_API_URL;
  const apiKey = process.env.NMGROUPE_API_KEY;
  if (!apiUrl || !apiKey) {
    return { status: "failed", error: "NM Groupe non configuré (clés API manquantes)" };
  }

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        ...(process.env.NMGROUPE_ACCOUNT_ID ? { "X-Account-Id": process.env.NMGROUPE_ACCOUNT_ID } : {}),
      },
      body: JSON.stringify({
        to: params.to,
        from: params.from,
        message: params.message,
      }),
    });
    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      return { status: "failed", error: String(body?.message ?? `HTTP ${res.status}`) };
    }
    return {
      status: "queued",
      provider_message_id: String(body?.id ?? body?.message_id ?? ""),
    };
  } catch (err) {
    return { status: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}

export async function sendCampaignViaNMGroupe(campaignId: string, userId: string) {
  const { data: camp, error } = await supabaseAdmin
    .from("campaigns").select("*").eq("id", campaignId).single();
  if (error || !camp) throw new Error("Campagne introuvable");

  await supabaseAdmin.from("campaigns").update({ status: "sending" }).eq("id", campaignId);

  const recipients = (camp.recipients as string[]) ?? [];
  let sent = 0;
  let failed = 0;

  // Bulk insert placeholder sms_messages
  const rows = recipients.map((phone) => ({
    campaign_id: campaignId,
    user_id: userId,
    phone,
    message: camp.message,
    sender_id: camp.sender_id,
    status: "pending" as const,
  }));
  if (rows.length) await supabaseAdmin.from("sms_messages").insert(rows);

  // Send one by one (real prod would batch/parallelize with rate limits)
  for (const phone of recipients) {
    const res = await sendSingleSms({ to: phone, from: camp.sender_id, message: camp.message });
    if (res.status === "failed") {
      failed++;
      await supabaseAdmin.from("sms_messages")
        .update({ status: "failed", error: res.error ?? null })
        .eq("campaign_id", campaignId).eq("phone", phone).eq("status", "pending");
    } else {
      sent++;
      await supabaseAdmin.from("sms_messages")
        .update({
          status: "sent",
          provider_message_id: res.provider_message_id ?? null,
          sent_at: new Date().toISOString(),
        })
        .eq("campaign_id", campaignId).eq("phone", phone).eq("status", "pending");
    }
  }

  // Decrement credits by sent count
  if (sent > 0) {
    const { data: prof } = await supabaseAdmin.from("profiles").select("sms_credits").eq("id", userId).single();
    const newCredits = Math.max(0, (prof?.sms_credits ?? 0) - sent);
    await supabaseAdmin.from("profiles").update({ sms_credits: newCredits }).eq("id", userId);
  }

  await supabaseAdmin.from("campaigns").update({
    status: failed === recipients.length ? "failed" : "sent",
    sent_count: sent,
    failed_count: failed,
  }).eq("id", campaignId);

  return { sent, failed, total: recipients.length };
}
