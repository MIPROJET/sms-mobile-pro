import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/webhooks/cinetpay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const contentType = request.headers.get("content-type") ?? "";
        let payload: Record<string, any> = {};
        if (contentType.includes("application/json")) {
          payload = await request.json().catch(() => ({}));
        } else {
          const form = await request.formData().catch(() => null);
          if (form) form.forEach((v, k) => (payload[k] = String(v)));
        }

        const transactionId = payload.cpm_trans_id ?? payload.transaction_id;
        if (!transactionId) return new Response("Missing transaction_id", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // Verify with CinetPay API
        const apiKey = process.env.CINETPAY_API_KEY;
        const siteId = process.env.CINETPAY_SITE_ID;
        if (!apiKey || !siteId) return new Response("Not configured", { status: 503 });

        const verifyRes = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ apikey: apiKey, site_id: siteId, transaction_id: transactionId }),
        });
        const verify = (await verifyRes.json().catch(() => ({}))) as any;
        const status = verify?.data?.status;

        const { data: order } = await supabaseAdmin
          .from("orders").select("*").eq("id", transactionId).maybeSingle();
        if (!order) return new Response("Order not found", { status: 404 });

        if (status === "ACCEPTED") {
          await supabaseAdmin.from("orders").update({
            status: "paid",
            provider_transaction_id: transactionId,
            provider_payload: verify,
          }).eq("id", order.id);

          // Credit user
          const { data: prof } = await supabaseAdmin.from("profiles").select("sms_credits").eq("id", order.user_id).single();
          await supabaseAdmin.from("profiles")
            .update({ sms_credits: (prof?.sms_credits ?? 0) + order.sms_volume })
            .eq("id", order.user_id);
        } else if (status && status !== "PENDING") {
          await supabaseAdmin.from("orders").update({
            status: "failed",
            provider_payload: verify,
          }).eq("id", order.id);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
