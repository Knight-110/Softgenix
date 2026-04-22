import { Button } from "@/components/ui/button";
import { openWhatsApp } from "@/lib/whatsapp";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <section className="relative py-28 md:py-36">
      <div className="container">
        <div className="reveal relative overflow-hidden rounded-[2rem] glass-strong p-10 text-center md:p-20">
          <div className="absolute inset-0 -z-0 bg-aurora opacity-55" />
          <div
            className="absolute inset-0 -z-0 opacity-45"
            style={{
              backgroundImage:
                "linear-gradient(hsl(0 0% 100% / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.08) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage:
                "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
              WebkitMaskImage:
                "radial-gradient(ellipse at center, #000 30%, transparent 75%)",
            }}
          />

          <div className="relative">
            <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground shadow-glow" />
              Let's build
            </span>

            <h2 className="mt-6 font-display text-4xl font-bold leading-[1.0] md:text-7xl">
              Ready to make
              <br />
              <span className="text-foreground">
                something extraordinary?
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-secondary-foreground">
              Tell us about your idea on WhatsApp. We usually reply within an
              hour during business hours.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                variant="hero"
                size="xl"
                data-cursor-ignore
                onClick={() =>
                  openWhatsApp(
                    "Hi Softgenix, I'd like to discuss a new project. "
                  )
                }
              >
                Chat on WhatsApp
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outlineGlow"
                size="xl"
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                Send a brief
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
