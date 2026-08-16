import { createServerFn } from "@tanstack/react-start";
import { createPublicDataClient } from "./public-data-client";

export const listPricingTiers = createServerFn({ method: "GET" }).handler(async () => {
  const sb = createPublicDataClient();
  const { data, error } = await sb
    .from("pricing_tiers")
    .select("id, min_sms, max_sms, unit_price_fcfa, label, sort_order")
    .eq("active", true)
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
});
