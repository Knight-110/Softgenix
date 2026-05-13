import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CTAFluidBackground from "@/components/effects/CTAFluidBackground";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

const CTA_PIN_OFFSET = 112;

type CTAVariant = "home" | "services" | "portfolio" | "about" | "contact";

type CTASectionProps = {
  variant?: CTAVariant;
};

type CTAVariantCopy = {
  badge: string;
  headlineLine1: string;
  headlineLine2: string;
  description: string;
  overlayClass: string;
  fillClass: string;
};

const CTA_COPY: Record<CTAVariant, CTAVariantCopy> = {
  home: {
    badge: "Let's build",
    headlineLine1: "Ready to build something",
    headlineLine2: "extraordinary?",
    description: "From idea to launch, we build digital experiences people remember.",
    overlayClass: "from-cyan-500/20 via-sky-500/12 to-blue-600/24",
    fillClass: "cta-fill-home",
  },
  services: {
    badge: "Let's engineer",
    headlineLine1: "Ready to build your digital",
    headlineLine2: "powerhouse?",
    description: "Web, apps, AI, automation, and marketing working together as one growth engine.",
    overlayClass: "from-emerald-500/20 via-teal-500/12 to-cyan-500/22",
    fillClass: "cta-fill-services",
  },
  portfolio: {
    badge: "Let's showcase",
    headlineLine1: "Ready to create something",
    headlineLine2: "unforgettable?",
    description: "Let's create a digital experience with clarity, emotion, and performance.",
    overlayClass: "from-violet-500/22 via-fuchsia-500/14 to-pink-500/22",
    fillClass: "cta-fill-portfolio",
  },
  about: {
    badge: "Let's create",
    headlineLine1: "Ready to build with",
    headlineLine2: "purpose?",
    description: "We combine strategy, design, and technology to create experiences that feel alive.",
    overlayClass: "from-blue-200/14 via-sky-300/10 to-white/12",
    fillClass: "cta-fill-about",
  },
  contact: {
    badge: "Let's talk",
    headlineLine1: "Ready to create something",
    headlineLine2: "extraordinary?",
    description:
      "Tell us about your idea on WhatsApp. We usually reply within an hour during business hours.",
    overlayClass: "from-violet-500/22 via-fuchsia-500/16 to-pink-500/24",
    fillClass: "cta-fill-contact",
  },
};

const CTASection = ({ variant = "home" }: CTASectionProps) => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);
  const copy = CTA_COPY[variant];

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (!sectionRef.current || !stageRef.current || !contentRef.current || !fillRef.current) {
        return;
      }

      gsap.set(fillRef.current, {
        clipPath: "inset(0 100% 0 0)",
        webkitClipPath: "inset(0 100% 0 0)",
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: contentRef.current,
          start: "bottom bottom-=24",
          end: () => `+=${Math.round((window.innerHeight - CTA_PIN_OFFSET) * 0.95)}`,
          scrub: true,
          pin: contentRef.current,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline.to(fillRef.current, {
        clipPath: "inset(0 0% 0 0)",
        webkitClipPath: "inset(0 0% 0 0)",
        ease: "none",
      });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-20 md:py-24">
      <div ref={stageRef} className="flex min-h-[calc(100svh-112px)] items-center">
        <div className="container">
          <div ref={contentRef} className="flex flex-col items-center">
            <div className="reveal flex w-full flex-col items-center">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-secondary-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground shadow-glow" />
                {copy.badge}
              </span>

              <div className="relative w-full overflow-hidden rounded-[2rem] glass-strong">
                <div className="absolute inset-0 z-0 bg-[#020617]" />

                <CTAFluidBackground variant={variant} />

                <div
                  className={cn(
                    "absolute inset-0 z-[1] bg-gradient-to-br",
                    copy.overlayClass
                  )}
                />

                <div className="absolute inset-0 z-[1] bg-gradient-to-br from-black/38 via-slate-950/20 to-black/52" />

                <div className="relative z-10 p-10 text-center md:p-20">
                  <h2 className="relative mx-auto mt-6 inline-block text-center font-display text-4xl font-bold leading-[1.02] md:text-7xl">
                    <span className="block pb-[0.08em] text-white">
                      <span className="block">{copy.headlineLine1}</span>
                      <span className="block">{copy.headlineLine2}</span>
                    </span>

                    <span
                      ref={fillRef}
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 block overflow-hidden [will-change:clip-path]"
                      style={{
                        clipPath: "inset(0 100% 0 0)",
                        WebkitClipPath: "inset(0 100% 0 0)",
                      }}
                    >
                      <span
                        className={cn(
                          "cta-fill-text block pb-[0.08em] text-transparent",
                          copy.fillClass
                        )}
                      >
                        <span className="block">{copy.headlineLine1}</span>
                        <span className="block">{copy.headlineLine2}</span>
                      </span>
                    </span>
                  </h2>

                  <p className="mx-auto mt-6 max-w-2xl text-lg text-secondary-foreground">
                    {copy.description}
                  </p>

                  <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                      variant="hero"
                      size="xl"
                      data-cursor-ignore
                      onClick={() =>
                        openWhatsApp("Hi Softgenix, I'd like to discuss a new project. ")
                      }
                    >
                      Chat on WhatsApp
                      <ArrowRight className="h-4 w-4" />
                    </Button>

                    <Button variant="outlineGlow" size="xl" onClick={() => navigate("/lets-talk")}>
                      Send a brief
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;  