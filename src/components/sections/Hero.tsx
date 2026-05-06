import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GridScan from "@/components/effects/GridScan";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { openWhatsApp } from "@/lib/whatsapp";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const updateMotionPreference = () => {
      setPrefersReducedMotion(mediaQuery.matches);
    };

    updateMotionPreference();

    mediaQuery.addEventListener("change", updateMotionPreference);

    return () => {
      mediaQuery.removeEventListener(
        "change",
        updateMotionPreference
      );
    };
  }, []);

  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-[#07030d] pt-32 pb-24">

      {/* GRID SCAN */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <GridScan
          className="h-full w-full"

          sensitivity={prefersReducedMotion ? 0.18 : 0.7}

          lineThickness={isMobile ? 1.8 : 2.4}

          linesColor="#06bffd"

          gridScale={isMobile ? 0.13 : 0.1}

          scanColor="#06bffd"

          scanOpacity={
            prefersReducedMotion
              ? 0.35
              : isMobile
              ? 0.75
              : 1.1
          }

          enablePost={!prefersReducedMotion}

          bloomIntensity={
            prefersReducedMotion
              ? 1.1
              : isMobile
              ? 1.0
              : 1.6
          }

          chromaticAberration={
            prefersReducedMotion ? 0 : 0.003
          }

          noiseIntensity={
            prefersReducedMotion ? 0.002 : 0.015
          }

          lineJitter={0}

          scanGlow={1.1}

          scanSoftness={1.3}
        />
      </div>

      {/* DARK OVERLAY */}
      <div className="pointer-events-none absolute inset-0 z-[1] bg-black/25" />

      {/* RADIAL DEPTH */}
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04)_0%,rgba(0,0,0,0.28)_50%,rgba(0,0,0,0.72)_100%)]" />

      {/* TOP FADE */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-36 bg-gradient-to-b from-[#07030d] to-transparent" />

      {/* CONTENT */}
      <div className="container relative z-10 pointer-events-auto">
        <div className="mx-auto max-w-5xl text-center">

          {/* BADGE */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs uppercase tracking-wider text-secondary-foreground glass animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-foreground" />
            <span>Engineering ambitious digital products</span>
          </div>

          {/* TITLE */}
          <h1 className="mt-8 font-display text-[clamp(2.75rem,8vw,7rem)] font-bold leading-[0.95] animate-fade-in-up">
            <span className="block text-foreground">
              We build the
            </span>

            <span className="block text-foreground">
              future of business,
            </span>

            <span className="block text-foreground/90">
              pixel by pixel.
            </span>
          </h1>

          {/* DESCRIPTION */}
          <p
            className="mx-auto mt-8 max-w-2xl text-base leading-relaxed text-secondary-foreground md:text-lg animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            Softgenix Infotech crafts cinematic web experiences,
            mobile apps, AI chatbots and growth-driven digital
            marketing for brands that refuse to be ordinary.
          </p>

          {/* BUTTONS */}
          <div
            className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <Button
              variant="hero"
              size="xl"
              onClick={() =>
                openWhatsApp(
                  "Hi Softgenix, I'd like to start a project. My name is "
                )
              }
            >
              Chat on WhatsApp
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              variant="glass"
              size="xl"
              onClick={() => navigate("/services")}
            >
              Explore Services
            </Button>
          </div>

          {/* STATS */}
          <div className="mt-20 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-black/25 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.95)] backdrop-blur-[2px] md:grid-cols-4">
            {[
              { v: "120+", l: "Projects Shipped" },
              { v: "45+", l: "Happy Clients" },
              { v: "8 yrs", l: "Industry Craft" },
              { v: "24/7", l: "Support" },
            ].map((s) => (
              <div
                key={s.l}
                className="bg-black/45 px-6 py-6"
              >
                <div className="font-display text-2xl font-semibold text-gradient md:text-3xl">
                  {s.v}
                </div>

                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SCROLL INDICATOR */}
      <div className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground/70">
        <span className="text-[10px] uppercase tracking-[0.4em]">
          Scroll
        </span>

        <span className="block h-10 w-px bg-gradient-to-b from-foreground/70 to-transparent" />
      </div>
    </section>
  );
};

export default Hero;