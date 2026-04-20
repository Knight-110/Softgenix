import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null);

  // Soft parallax on hero copy
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (!ref.current) return;
        const y = window.scrollY;
        ref.current.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
        ref.current.style.opacity = `${Math.max(0, 1 - y / 600)}`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center pt-32 pb-24 overflow-hidden">
      {/* Floating abstract shapes */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute top-[18%] left-[8%] h-2 w-2 rounded-full bg-primary shadow-glow animate-pulse-glow" />
        <div className="absolute top-[30%] right-[12%] h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-[22%] left-[20%] h-2 w-2 rounded-full bg-violet animate-pulse-glow" style={{ animationDelay: "2s" }} />
        <svg className="absolute right-[6%] top-[22%] h-40 w-40 opacity-30 animate-drift" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" stroke="hsl(var(--primary))" strokeWidth="0.5" />
          <circle cx="50" cy="50" r="32" stroke="hsl(var(--primary))" strokeWidth="0.3" />
        </svg>
        <svg className="absolute left-[4%] bottom-[16%] h-32 w-32 opacity-25 animate-drift" style={{ animationDelay: "-6s" }} viewBox="0 0 100 100" fill="none">
          <rect x="2" y="2" width="96" height="96" stroke="hsl(var(--cyan))" strokeWidth="0.4" />
          <rect x="20" y="20" width="60" height="60" stroke="hsl(var(--cyan))" strokeWidth="0.3" />
        </svg>
      </div>

      <div ref={ref} className="container relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs tracking-wider uppercase text-muted-foreground animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Engineering ambitious digital products</span>
          </div>

          <h1 className="mt-8 font-display font-bold leading-[0.95] text-[clamp(2.75rem,8vw,7rem)] animate-fade-in-up">
            <span className="block text-foreground">We build the</span>
            <span className="block text-gradient-brand">future of business,</span>
            <span className="block text-foreground/90">pixel by pixel.</span>
          </h1>

          <p
            className="mt-8 mx-auto max-w-2xl text-base md:text-lg text-muted-foreground leading-relaxed animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            Softgenix Infotech crafts cinematic web experiences, mobile apps, AI chatbots
            and growth-driven digital marketing — for brands that refuse to be ordinary.
          </p>

          <div
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <Button
              variant="hero"
              size="xl"
              onClick={() => openWhatsApp("Hi Softgenix, I'd like to start a project. My name is ")}
            >
              Chat on WhatsApp
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="glass"
              size="xl"
              onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
            >
              Explore Services
            </Button>
          </div>

          {/* Stat strip */}
          <div
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px overflow-hidden rounded-2xl glass animate-fade-in-up"
            style={{ animationDelay: "450ms" }}
          >
            {[
              { v: "120+", l: "Projects Shipped" },
              { v: "45+", l: "Happy Clients" },
              { v: "8 yrs", l: "Industry Craft" },
              { v: "24/7", l: "Support" },
            ].map((s) => (
              <div key={s.l} className="bg-background/40 px-6 py-6">
                <div className="font-display text-2xl md:text-3xl font-semibold text-gradient">{s.v}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/70 animate-fade-in" style={{ animationDelay: "1s" }}>
        <span className="text-[10px] uppercase tracking-[0.4em]">Scroll</span>
        <span className="block h-10 w-px bg-gradient-to-b from-primary/60 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;
