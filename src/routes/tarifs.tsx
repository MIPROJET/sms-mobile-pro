import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteLayout, PageHero } from "@/components/site-chrome";

export const Route = createFileRoute("/tarifs")({
  component: TarifsPage,
  head: () => ({
    meta: [
      { title: "Tarifs SMS en FCFA — Packages Starter à Enterprise | SMS Pro Mobile" },
      {
        name: "description",
        content:
          "Packages SMS clairs à partir de 7 500 FCFA. Starter, Business, Pro et Enterprise. Paiement Mobile Money (MTN, Orange, Wave). Sans frais cachés.",
      },
      {
        property: "og:title",
        content: "Tarifs SMS en FCFA — Packages transparents à partir de 7 500 FCFA",
      },
      {
        property: "og:description",
        content:
          "Quatre packages SMS pour PME et grands comptes. Paiement Mobile Money instantané, crédit automatique du compte.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/tarifs" },
    ],
    links: [{ rel: "canonical", href: "/tarifs" }],
  }),
});

const packages = [
  { slug: "starter", name: "Starter", price: "7 500", volume: "500 SMS", features: ["Support 24/7", "Dashboard mobile", "Sender ID standard", "Rapports basiques"], featured: false },
  { slug: "business", name: "Business", price: "13 000", volume: "1 000 SMS", features: ["Sender ID personnalisé", "API Gateway inclus", "Groupes de contacts", "Support prioritaire"], featured: true },
  { slug: "pro", name: "Pro", price: "55 000", volume: "5 000 SMS", features: ["Tout Business +", "Rapports avancés", "Webhooks de livraison", "Templates illimités"], featured: false },
  { slug: "enterprise", name: "Enterprise", price: "95 000", volume: "10 000 SMS", features: ["Priorité d'envoi", "Manager de compte dédié", "SLA garanti", "Facturation mensuelle"], featured: false },
];

function TarifsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Tarifs"
        title={
          <>
            Des packages <span className="text-primary">clairs</span>, en FCFA
          </>
        }
        description="Achetez le volume de SMS qu'il vous faut. Paiement Mobile Money instantané, crédit automatique de votre compte, aucun engagement."
      />

      <section className="px-4 sm:px-8 py-14 sm:py-20 bg-foreground text-background">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {packages.map((p) => (
              <div
                key={p.name}
                className={
                  p.featured
                    ? "bg-primary p-6 rounded-sm flex flex-col relative"
                    : "bg-background/5 border border-background/10 p-6 rounded-sm flex flex-col"
                }
              >
                {p.featured && (
                  <span className="absolute -top-2 left-4 bg-background text-primary text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                    Populaire
                  </span>
                )}
                <div
                  className={
                    p.featured
                      ? "text-xs font-mono uppercase tracking-widest text-background/80 mb-2"
                      : "text-xs font-mono uppercase tracking-widest text-background/50 mb-2"
                  }
                >
                  {p.name}
                </div>
                <div className="text-2xl sm:text-3xl font-display font-extrabold mb-1">
                  {p.price}{" "}
                  <span className="text-xs sm:text-sm font-normal opacity-70">FCFA</span>
                </div>
                <div
                  className={
                    p.featured
                      ? "text-sm mb-5 pb-5 border-b border-background/20"
                      : "text-sm mb-5 pb-5 border-b border-background/10"
                  }
                >
                  {p.volume}
                </div>
                <ul className="text-sm space-y-2.5 mb-6 flex-grow">
                  {p.features.map((f) => (
                    <li key={f} className={p.featured ? "" : "opacity-80"}>
                      • {f}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth"
                  search={{ redirect: `/dashboard/checkout/${p.slug}` }}
                  className={
                    p.featured
                      ? "w-full py-3 bg-background text-primary text-center font-bold hover:opacity-90 transition-opacity"
                      : "w-full py-3 border border-background/20 text-center hover:bg-background hover:text-foreground transition-colors font-semibold"
                  }
                >
                  Choisir
                </Link>
              </div>
            ))}
          </div>

          <div className="mt-10 p-6 bg-background/5 border border-background/10 rounded-sm">
            <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">
              Sur mesure
            </div>
            <h3 className="font-display text-xl font-bold mb-2">
              Volume supérieur ou besoin spécifique ?
            </h3>
            <p className="text-background/70 text-sm mb-4">
              Nous proposons des devis personnalisés pour les gros volumes, l'intégration API sur
              mesure et les campagnes multi-pays.
            </p>
            <Link
              to="/auth" search={{ mode: "signup" as const }}
              className="inline-block bg-primary text-primary-foreground py-2.5 px-5 rounded-sm font-semibold text-sm hover:bg-primary-dark transition-colors"
            >
              Demander un devis
            </Link>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-8 py-14 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-8">
            Moyens de paiement
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {["MTN Mobile Money", "Orange Money", "Wave"].map((m) => (
              <div key={m} className="p-5 bg-muted rounded-sm">
                <div className="text-[10px] font-mono uppercase tracking-widest text-foreground/50">
                  Mobile Money
                </div>
                <div className="font-display font-bold text-lg mt-1">{m}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-foreground/60 mt-6">
            Le crédit SMS est automatiquement ajouté à votre compte après confirmation du
            paiement.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
}
