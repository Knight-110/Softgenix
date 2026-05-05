import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import CTAFluidBackground from "@/components/effects/CTAFluidBackground";
import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";

gsap.registerPlugin(ScrollTrigger);

const CTA_PIN_OFFSET = 112;

const CTASection = () => {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const fillRef = useRef<HTMLSpanElement | null>(null);

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
      <div
        ref={stageRef}
        className="flex min-h-[calc(100svh-112px)] items-center"
      >
        <div className="container">
          <div ref={contentRef} className="flex flex-col items-center">
            <div className="reveal flex w-full flex-col items-center">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-secondary-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground shadow-glow" />
                Let's build
              </span>

              <div className="relative w-full overflow-hidden rounded-[2rem] glass-strong">
                <div className="absolute inset-0 z-0 bg-[#020617]" />
                <CTAFluidBackground />
                <div className="absolute inset-0 z-[1] bg-gradient-to-br from-black/44 via-slate-950/26 to-black/58" />

                <div className="relative z-10 p-10 text-center md:p-20">
                  <h2 className="relative mx-auto mt-6 inline-block text-center font-display text-4xl font-bold leading-[1.02] md:text-7xl">
                    <span className="block pb-[0.08em] text-white">
                      <span className="block">Ready to make</span>
                      <span className="block">something extraordinary?</span>
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
                        className="block pb-[0.08em] text-transparent"
                        style={{
                          backgroundImage:
                            "linear-gradient(90deg, #d8f3ff 0%, #a5f3fc 18%, #67e8f9 42%, #38bdf8 64%, #f0fdff 82%, #7dd3fc 100%)",
                          backgroundSize: "220% 100%",
                          backgroundClip: "text",
                          WebkitBackgroundClip: "text",
                          textShadow: "0 0 18px rgba(103, 232, 249, 0.18)",
                        }}
                      >
                        <span className="block">Ready to make</span>
                        <span className="block">something extraordinary?</span>
                      </span>
                    </span>
                  </h2>

                  <p className="mx-auto mt-6 max-w-2xl text-lg text-secondary-foreground">
                    Tell us about your idea on WhatsApp. We usually reply within an hour during
                    business hours.
                  </p>

                  <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Button
                      variant="hero"
                      size="xl"
                      data-cursor-ignore
                      onClick={() => openWhatsApp("Hi Softgenix, I'd like to discuss a new project. ")}
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
