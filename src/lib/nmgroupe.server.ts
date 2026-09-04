// NM Groupe SMS Gateway integration
// Env vars (add via add_secret when API keys are provided):
//   NMGROUPE_API_URL        e.g. https://api.nmgroupe.com/v1/sms/send
//   NMGROUPE_API_KEY        API key
//   NMGROUPE_ACCOUNT_ID     optional account identifier
//   NMGROUPE_WEBHOOK_SECRET shared secret for delivery webhook signature
//
// This module is server-only.

import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendSms } from "./sms-providers.server";

export async function sendCampaignViaNMGroupe(campaignId: string, userId: string) {
  const { data: camp, error } = await supabaseAdmin
    .from("campaigns").select("*").eq("id", campaignId).single();
  if (error || !camp) throw new Error("Campagne introuvable");

  const recipients = (camp.recipients as string[]) ?? [];
  let sent = 0;
  let failed = 0;

  if (recipients.length === 0) {
    await supabaseAdmin.from("campaigns").update({ status: "sent", sent_count: 0, failed_count: 0 }).eq("id", campaignId);
    return { sent: 0, failed: 0, total: 0 };
  }

  // Réservation ATOMIQUE des crédits : une seule requête conditionnelle en base,
  // ce qui empêche deux envois simultanés de passer le même contrôle de solde.
  const { data: remaining, error: reserveError } = await supabaseAdmin.rpc("reserve_sms_credits", {
    _user_id: userId,
    _amount: recipients.length,
  });
  if (reserveError) throw new Error(reserveError.message);
  if (remaining === null || remaining === undefined) {
    await supabaseAdmin.from("campaigns").update({ status: "draft" }).eq("id", campaignId);
    throw new Error("Crédits SMS insuffisants pour cet envoi.");
  }

  await supabaseAdmin.from("campaigns").update({ status: "sending" }).eq("id", campaignId);

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
    const res = await sendSms({ to: phone, from: camp.sender_id, message: camp.message });
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
