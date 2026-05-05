import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const PROCESS_PIN_OFFSET = 104;
const STEP_THRESHOLDS = [0, 0.3, 0.6, 0.9];

const steps = [
  {
    n: "01",
    title: "Discover",
    desc: "We dig into your business, audience and goals. A clear brief beats a thousand revisions.",
  },
  {
    n: "02",
    title: "Design",
    desc: "We craft the experience in Figma with motion-aware structure and conversion-focused hierarchy.",
  },
  {
    n: "03",
    title: "Build",
    desc: "Senior engineers ship in two-week sprints with weekly demos and a live staging URL.",
  },
  {
    n: "04",
    title: "Launch & Grow",
    desc: "We deploy, instrument analytics, run growth experiments and iterate each month.",
  },
];

const inactiveNumberGradient =
  "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.72) 100%)";
const activeNumberGradient =
  "linear-gradient(135deg, #7dd3fc 0%, #a78bfa 52%, #ec4899 100%)";

const Process = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const lineFillRef = useRef<HTMLSpanElement | null>(null);
  const orbRef = useRef<HTMLSpanElement | null>(null);

  const stepRefs = useRef<Array<HTMLDivElement | null>>([]);
  const numberRefs = useRef<Array<HTMLDivElement | null>>([]);
  const titleRefs = useRef<Array<HTMLHeadingElement | null>>([]);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const stepEls = stepRefs.current.filter(Boolean) as HTMLDivElement[];
      const numberEls = numberRefs.current.filter(Boolean) as HTMLDivElement[];
      const titleEls = titleRefs.current.filter(Boolean) as HTMLHeadingElement[];
      const cardEls = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      const dotEls = dotRefs.current.filter(Boolean) as HTMLSpanElement[];

      if (
        !stageRef.current ||
        !lineFillRef.current ||
        !orbRef.current ||
        stepEls.length !== steps.length
      ) {
        return;
      }

      const unlocked = new Set<number>([0]);
      let activeIndex = -1;

      const pulseDot = (index: number) => {
        const dot = dotEls[index];

        if (!dot) {
          return;
        }

        gsap.fromTo(
          dot,
          {
            scale: 1,
            boxShadow: "0 0 0 rgba(56,189,248,0)",
          },
          {
            scale: 1.7,
            boxShadow: "0 0 24px rgba(56,189,248,0.75), 0 0 48px rgba(168,85,247,0.45)",
            duration: 0.28,
            repeat: 1,
            yoyo: true,
            ease: "power2.out",
            overwrite: true,
          }
        );
      };

      const setOrbProgress = (progress: number) => {
        const lineHeight = stageRef.current?.offsetHeight ?? 0;

        gsap.set(lineFillRef.current, {
          scaleY: progress,
          transformOrigin: "top center",
        });

        gsap.set(orbRef.current, {
          y: lineHeight * progress,
        });
      };

      const updateStepVisual = (index: number, isActive: boolean, isUnlocked: boolean) => {
        const step = stepEls[index];
        const number = numberEls[index];
        const title = titleEls[index];
        const card = cardEls[index];
        const dot = dotEls[index];

        if (!step || !number || !title || !card || !dot) {
          return;
        }

        gsap.to(step, {
          opacity: isActive ? 1 : isUnlocked ? 0.46 : 0.38,
          y: isUnlocked ? 0 : 30,
          duration: 0.55,
          ease: "power3.out",
          overwrite: true,
        });

        gsap.to(number, {
          backgroundImage: isActive ? activeNumberGradient : inactiveNumberGradient,
          textShadow: isActive
            ? "0 0 20px rgba(56,189,248,0.32), 0 0 40px rgba(168,85,247,0.22)"
            : "0 0 0 rgba(0,0,0,0)",
          duration: 0.45,
          ease: "power2.out",
          overwrite: true,
        });

        gsap.to(title, {
          color: isActive ? "rgba(255,255,255,1)" : isUnlocked ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.68)",
          textShadow: isActive ? "0 0 24px rgba(56,189,248,0.18)" : "0 0 0 rgba(0,0,0,0)",
          duration: 0.45,
          ease: "power2.out",
          overwrite: true,
        });

        gsap.to(card, {
          borderColor: isActive ? "rgba(125,211,252,0.42)" : "rgba(255,255,255,0.14)",
          boxShadow: isActive
            ? "0 0 0 1px rgba(56,189,248,0.28) inset, 0 0 28px rgba(56,189,248,0.18), 0 0 56px rgba(168,85,247,0.14)"
            : isUnlocked
              ? "0 1px 0 rgba(255,255,255,0.08) inset, 0 10px 26px -24px rgba(56,189,248,0.15)"
              : "0 1px 0 rgba(255,255,255,0.08) inset",
          opacity: isActive ? 1 : isUnlocked ? 0.92 : 0.72,
          x: isUnlocked ? 0 : 18,
          duration: 0.6,
          ease: "power3.out",
          overwrite: true,
        });

        gsap.to(dot, {
          backgroundColor: isActive ? "#7dd3fc" : "rgba(255,255,255,0.92)",
          scale: isActive ? 1.18 : isUnlocked ? 1 : 0.92,
          boxShadow: isActive
            ? "0 0 18px rgba(56,189,248,0.75), 0 0 32px rgba(168,85,247,0.4)"
            : isUnlocked
              ? "0 0 12px rgba(56,189,248,0.2)"
              : "0 0 0 rgba(0,0,0,0)",
          duration: 0.45,
          ease: "power2.out",
          overwrite: true,
        });
      };

      const applyProgress = (progress: number, direction: number) => {
        const nextActiveIndex = STEP_THRESHOLDS.reduce((current, threshold, index) => {
          return progress >= threshold ? index : current;
        }, 0);

        for (let i = 0; i <= nextActiveIndex; i += 1) {
          unlocked.add(i);
        }

        if (nextActiveIndex !== activeIndex) {
          pulseDot(nextActiveIndex);
          activeIndex = nextActiveIndex;
        }

        stepEls.forEach((_, index) => {
          if (direction < 0 && index > nextActiveIndex) {
            unlocked.delete(index);
          }

          updateStepVisual(index, index === activeIndex, unlocked.has(index));
        });
      };

      gsap.set(lineFillRef.current, {
        scaleY: 0,
        transformOrigin: "top center",
      });

      gsap.set(orbRef.current, {
        y: 0,
        xPercent: -50,
        yPercent: -50,
      });

      stepEls.forEach((_, index) => updateStepVisual(index, index === 0, index === 0));
      setOrbProgress(0);
      applyProgress(0, 1);

      if (reduceMotion) {
        stepEls.forEach((_, index) => updateStepVisual(index, index === 0, true));
        gsap.set(lineFillRef.current, { scaleY: 1 });
        gsap.set(orbRef.current, { y: 0 });
        return;
      }

      ScrollTrigger.create({
        trigger: stageRef.current,
        start: `top top+=${PROCESS_PIN_OFFSET}`,
        end: () => `+=${Math.round(window.innerHeight * 2.4)}`,
        scrub: 1,
        pin: stageRef.current,
        pinSpacing: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setOrbProgress(self.progress);
          applyProgress(self.progress, self.direction);
        },
      });

      ScrollTrigger.refresh();
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="process" className="relative py-28 md:py-36">
      <div className="container">
        <div className="max-w-3xl reveal">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/80" /> Process
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
            A calm, <span className="text-foreground">repeatable</span> way to ship great work.
          </h2>
        </div>

        <div ref={stageRef} className="relative mt-20">
          <div className="pointer-events-none absolute inset-y-0 left-6 md:left-1/2 md:-translate-x-1/2">
            <span className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-white/18 to-transparent" />
            <span
              ref={lineFillRef}
              className="process-energy-line absolute inset-y-0 left-0 w-px origin-top"
              aria-hidden="true"
            />
            <span
              ref={orbRef}
              className="process-energy-orb absolute left-0 top-0"
              aria-hidden="true"
            />
          </div>

          <div className="space-y-14">
            {steps.map((step, i) => (
              <div
                key={step.n}
                ref={(el) => {
                  stepRefs.current[i] = el;
                }}
                className={`relative grid md:grid-cols-2 gap-8 items-center ${
                  i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"
                }`}
              >
                <div className={`md:px-12 ${i % 2 === 0 ? "md:text-right" : ""}`}>
                  <div
                    ref={(el) => {
                      numberRefs.current[i] = el;
                    }}
                    className="process-step-number font-display text-6xl md:text-7xl font-bold leading-none"
                  >
                    {step.n}
                  </div>
                  <h3
                    ref={(el) => {
                      titleRefs.current[i] = el;
                    }}
                    className="process-step-title mt-3 font-display text-2xl md:text-3xl font-semibold"
                  >
                    {step.title}
                  </h3>
                </div>

                <div className="md:px-12">
                  <div
                    ref={(el) => {
                      cardRefs.current[i] = el;
                    }}
                    className="process-step-card glass magnetic-glow rounded-2xl p-6"
                  >
                    <p className="text-secondary-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                <span
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  className="absolute left-6 h-3 w-3 -translate-x-1/2 rounded-full ring-4 ring-background md:left-1/2 md:block"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;
