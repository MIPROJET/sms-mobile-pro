import agricapital from "@/assets/partners/agricapital.png";
import scoly from "@/assets/partners/scoly.png";
import ivoirlex from "@/assets/partners/ivoirlex.png";
import envleStore from "@/assets/partners/envle-store.png";
import envleSpace from "@/assets/partners/envle-space.png";
import miprojet from "@/assets/partners/miprojet.png";
import munaf from "@/assets/partners/munaf.png";

const PARTNERS = [
  { src: agricapital, name: "AgriCapital" },
  { src: scoly, name: "Scoly" },
  { src: ivoirlex, name: "IvoirLex" },
  { src: envleStore, name: "E'nvlé Store" },
  { src: envleSpace, name: "E'nvlé Space" },
  { src: miprojet, name: "MiPROJET" },
  { src: munaf, name: "MuNAF" },
] as const;

/** Bandeau défilant des entreprises clientes. */
export function TrustCarousel() {
  const loop = [...PARTNERS, ...PARTNERS];
  return (
    <section className="px-4 py-16 sm:px-8 sm:py-20 bg-background border-t border-border overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-3">Références</div>
        <h2 className="font-display text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
          Ils nous font confiance
        </h2>
        <p className="text-foreground/70 max-w-2xl text-pretty mb-10">
          Des entreprises et organisations d'Afrique de l'Ouest utilisent SMS Pro Mobile pour leurs
          campagnes, alertes et notifications automatisées.
        </p>
      </div>

      <div className="relative mx-auto max-w-6xl">
        <div className="flex w-max items-center gap-12 animate-marquee hover:[animation-play-state:paused]">
          {loop.map((p, i) => (
            <img
              key={`${p.name}-${i}`}
              src={p.src}
              alt={p.name}
              loading="lazy"
              className="h-16 sm:h-20 w-auto max-w-[220px] object-contain grayscale hover:grayscale-0 opacity-80 hover:opacity-100 transition"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
