import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Server-side leaked-password check (Have I Been Pwned k-anonymity API).
 * Only the first 5 hex chars of the SHA-1 hash leave the server; the password
 * itself is never transmitted or logged.
 */
export const checkPasswordCompromised = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ password: z.string().min(1).max(200) }).parse(data))
  .handler(async ({ data }) => {
    try {
      const bytes = new TextEncoder().encode(data.password);
      const digest = await crypto.subtle.digest("SHA-1", bytes);
      const hash = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase();
      const prefix = hash.slice(0, 5);
      const suffix = hash.slice(5);

      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
        headers: { "Add-Padding": "true" },
      });
      if (!response.ok) return { compromised: false, checked: false };

      const body = await response.text();
      const compromised = body
        .split("\n")
        .some((line) => {
          const [hashSuffix, count] = line.trim().split(":");
          return hashSuffix === suffix && Number(count ?? 0) > 0;
        });

      return { compromised, checked: true };
    } catch {
      return { compromised: false, checked: false };
    }
  });
