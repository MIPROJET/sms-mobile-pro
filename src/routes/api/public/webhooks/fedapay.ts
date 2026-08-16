import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";

export const Route = createFileRoute("/api/public/webhooks/fedapay")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const bodyText = await request.text();
        const secret = process.env.FEDAPAY_WEBHOOK_SECRET;
        if (!secret) {
          return new Response("Webhook secret not configured", { status: 503 });
        }
        const sig = request.headers.get("x-fedapay-signature") ?? "";
        const expected = createHmac("sha256", secret).update(bodyText).digest("hex");
        const a = Buffer.from(sig);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }
        let payload: any;
        try { payload = JSON.parse(bodyText); } catch { return new Response("Invalid JSON", { status: 400 }); }

        const entity = payload?.entity ?? payload;
        const orderId = entity?.metadata?.order_id;
        const status = entity?.status;
        if (!orderId) return new Response("Missing metadata.order_id", { status: 400 });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", orderId).maybeSingle();
        if (!order) return new Response("Order not found", { status: 404 });

        if (status === "approved" || status === "transferred") {
          await supabaseAdmin.from("orders").update({
            status: "paid",
            provider_transaction_id: String(entity.id ?? ""),
            provider_payload: payload,
          }).eq("id", order.id);
          const { data: prof } = await supabaseAdmin.from("profiles").select("sms_credits").eq("id", order.user_id).single();
          await supabaseAdmin.from("profiles")
            .update({ sms_credits: (prof?.sms_credits ?? 0) + order.sms_volume })
            .eq("id", order.user_id);
        } else if (status === "declined" || status === "canceled" || status === "failed") {
          await supabaseAdmin.from("orders").update({
            status: "failed",
            provider_payload: payload,
          }).eq("id", order.id);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
