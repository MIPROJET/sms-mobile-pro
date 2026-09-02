const ADMIN_EMAIL = "admin@smsmobilepro.com";

export type EmailResult = { sent: boolean; reason?: string };

/**
 * Envoie l'email de notification admin pour un nouveau dossier d'inscription.
 * Tant qu'aucune clé API email n'est configurée, l'envoi est ignoré (statut `skipped`).
 */
export async function sendAdminSignupEmail(body: string, clientEmail: string): Promise<EmailResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) return { sent: false, reason: "RESEND_API_KEY non configurée" };

  const from = process.env["EMAIL_FROM"] ?? "SMS Mobile Pro <noreply@smsmobilepro.com>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [ADMIN_EMAIL],
      reply_to: clientEmail,
      subject: "Nouveau dossier d'inscription à traiter",
      text: body,
    }),
  });

  if (!response.ok) {
    throw new Error(`Email admin non envoyé (${response.status})`);
  }
  return { sent: true };
}
