import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { resolveLoginIdentifier } from "@/lib/auth.functions";
import { toast } from "sonner";

const searchSchema = z.object({
  redirect: z.string().optional(),
  mode: z.enum(["login", "signup"]).optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Connexion — SMS Pro Mobile" },
      { name: "description", content: "Connectez-vous à votre compte SMS Pro Mobile ou créez-en un." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthPage() {
  const { redirect, mode: initialMode } = useSearch({ from: "/auth" });
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">(initialMode ?? "login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [loading, setLoading] = useState(false);

  const targetPath = sanitizeRedirect(redirect);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate({ to: targetPath as any, replace: true });
      }
    });
  }, [navigate, targetPath]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "signup" && !gdpr) {
      toast.error("Vous devez accepter la politique de confidentialité pour créer un compte.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: identifier.trim().toLowerCase(),
          password,
          options: {
            emailRedirectTo: window.location.origin + "/auth/callback?redirect=" + encodeURIComponent(targetPath),
            data: {
              full_name: fullName,
              phone,
              company,
              gdpr_consent_at: new Date().toISOString(),
              marketing_consent: marketing,
            },
          },
        });
        if (error) throw error;
        try {
          const { recordConsent } = await import("@/lib/account.functions");
          await recordConsent({ data: { marketing } });
        } catch { /* profile trigger may not be ready yet; ignore */ }
        toast.success("Compte créé. Vous êtes connecté.");
      } else {
        const resolved = await resolveLoginIdentifier({ data: { identifier } });
        if (!resolved.email) throw new Error("Identifiant introuvable. Utilisez votre email ou votre nom d'utilisateur.");
        const { error } = await supabase.auth.signInWithPassword({ email: resolved.email, password });
        if (error) throw error;
        toast.success("Connexion réussie.");
      }
      navigate({ to: targetPath as any, replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Erreur d'authentification");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgot() {
    if (!identifier) return toast.error("Entrez votre email d'abord.");
    setLoading(true);
    try {
      const resolved = await resolveLoginIdentifier({ data: { identifier } });
      if (!resolved.email) throw new Error("Identifiant introuvable.");
      const { error } = await supabase.auth.resetPasswordForEmail(resolved.email, {
        redirectTo: window.location.origin + "/reset-password",
      });
      if (error) throw error;
      toast.success("Email de récupération envoyé. Vérifiez votre boîte.");
    } catch (err: any) {
      toast.error(err.message ?? "Erreur");
    } finally {
      setLoading(false);
    }
  }


  async function handleGoogle() {
    setLoading(true);
    try {
      sessionStorage.setItem("smspro_auth_redirect", targetPath);
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: buildOAuthRedirectUri(targetPath),
        extraParams: { prompt: "select_account" },
      });
      if (result.error) {
        toast.error("Erreur Google: " + (result.error as any).message);
        setLoading(false);
        return;
      }
      if (result.redirected) return;
      navigate({ to: targetPath as any, replace: true });
    } catch (err: any) {
      toast.error(err.message ?? "Erreur Google");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 sm:px-8 py-4">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-display font-black text-primary tracking-tighter text-lg">SMS PRO</span>
            <span className="text-[10px] font-mono tracking-widest text-foreground/50 uppercase">Mobile CI</span>
          </Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">
            {mode === "login" ? "Connexion" : "Créer un compte"}
          </div>
          <h1 className="font-display text-3xl font-extrabold mb-2">
            {mode === "login" ? "Accédez à votre espace" : "Rejoignez SMS Pro Mobile"}
          </h1>
          <p className="text-sm text-foreground/60 mb-6">
            {mode === "login"
              ? "Connectez-vous avec votre email ou l'identifiant super admin smsmobilepro."
              : "Créez votre compte client, puis gérez vos campagnes depuis le tableau de bord."}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full mb-4 py-3 border border-border rounded-sm font-semibold text-sm hover:bg-muted transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.2 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.3-.1-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.2 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.3 26.7 36 24 36c-5.2 0-9.6-3.1-11.2-7.5l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.4-4.2 5.8l6.2 5.2C41 34.9 44 30 44 24c0-1.3-.1-2.3-.4-3.5z"/>
            </svg>
            Continuer avec Google
          </button>

          <div className="flex items-center gap-3 my-4 text-[10px] font-mono uppercase tracking-widest text-foreground/40">
            <div className="flex-1 h-px bg-border" /> ou <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "signup" && (
              <>
                <input required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nom complet" className="w-full px-4 py-3 border border-border rounded-sm text-sm bg-background" />
                <input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Entreprise (optionnel)" className="w-full px-4 py-3 border border-border rounded-sm text-sm bg-background" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone (optionnel)" className="w-full px-4 py-3 border border-border rounded-sm text-sm bg-background" />
              </>
            )}
            <input required type={mode === "signup" ? "email" : "text"} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={mode === "signup" ? "Email" : "Email ou identifiant"} autoComplete="username" className="w-full px-4 py-3 border border-border rounded-sm text-sm bg-background" />
            <input required type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe (min. 6)" className="w-full px-4 py-3 border border-border rounded-sm text-sm bg-background" />

            {mode === "signup" && (
              <div className="space-y-2 pt-1">
                <label className="flex items-start gap-2 text-xs text-foreground/70">
                  <input type="checkbox" checked={gdpr} onChange={(e) => setGdpr(e.target.checked)} className="mt-0.5 accent-primary" />
                  <span>
                    J'accepte la{" "}
                    <Link to="/confidentialite" className="text-primary underline">politique de confidentialité</Link>
                    {" "}et les{" "}
                    <Link to="/conditions" className="text-primary underline">conditions d'utilisation</Link>.
                    <span className="text-primary"> *</span>
                  </span>
                </label>
                <label className="flex items-start gap-2 text-xs text-foreground/60">
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 accent-primary" />
                  <span>J'accepte de recevoir des offres et actualités par email (optionnel).</span>
                </label>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground rounded-sm font-semibold text-sm hover:bg-primary-dark transition-colors disabled:opacity-50">
              {loading ? "…" : mode === "login" ? "Se connecter" : "Créer mon compte"}
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-3 text-right">
              <button type="button" onClick={handleForgot} className="text-xs text-foreground/60 hover:text-primary hover:underline">
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <div className="mt-6 text-sm text-foreground/60 text-center">
            {mode === "login" ? (
              <>Pas encore de compte ?{" "}
                <button className="text-primary font-semibold hover:underline" onClick={() => setMode("signup")}>Créer un compte</button>
              </>
            ) : (
              <>Déjà un compte ?{" "}
                <button className="text-primary font-semibold hover:underline" onClick={() => setMode("login")}>Se connecter</button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function sanitizeRedirect(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

function buildOAuthRedirectUri(targetPath: string) {
  const hostedOrigin = "https://smsmobilepro.lovable.app";
  const current = new URL(window.location.href);
  const hosted = current.hostname.endsWith(".lovable.app") || current.hostname.endsWith(".lovable.dev");
  const origin = hosted ? current.origin : hostedOrigin;
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("redirect", targetPath);
  return callback.toString();
}
