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

const Process = () => {
  return (
    <section id="process" className="relative py-28 md:py-36">
      <div className="container">
        <div className="max-w-3xl reveal">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/80" /> Process
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
            A calm, <span className="text-foreground">repeatable</span> way to ship great work.
          </h2>
        </div>

        <div className="relative mt-20">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-foreground/35 to-transparent" />
          <div className="space-y-14">
            {steps.map((step, i) => (
              <div
                key={step.n}
                className={`reveal relative grid md:grid-cols-2 gap-8 items-center ${i % 2 === 0 ? "" : "md:[&>*:first-child]:order-2"}`}
                data-delay={(i * 100).toString()}
              >
                <div className={`md:px-12 ${i % 2 === 0 ? "md:text-right" : ""}`}>
                  <div className="font-display text-6xl md:text-7xl font-bold text-gradient leading-none">{step.n}</div>
                  <h3 className="mt-3 font-display text-2xl md:text-3xl font-semibold">{step.title}</h3>
                </div>
                <div className="md:px-12">
                  <div className="glass rounded-2xl p-6 magnetic-glow">
                    <p className="text-secondary-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>

                <span className="hidden md:block absolute left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-foreground shadow-glow ring-4 ring-background" />
                <span className="md:hidden absolute left-6 -translate-x-1/2 h-3 w-3 rounded-full bg-foreground shadow-glow ring-4 ring-background" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Process;