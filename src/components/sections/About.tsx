import logo from "@/assets/softgenix-logo.jpeg";

const About = () => {
  return (
    <section id="about" className="relative py-28 md:py-36">
      <div className="container grid lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5 relative reveal">
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-brand opacity-25 blur-3xl animate-pulse-glow" />
            <div className="relative h-full w-full rounded-[2rem] glass-strong overflow-hidden p-8 grid place-items-center">
              <img src={logo} alt="Softgenix Infotech mark" className="h-full w-full object-contain" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/65 to-transparent pointer-events-none" />
            </div>
            <div className="absolute -top-4 -left-4 px-3 py-1.5 rounded-lg glass-strong text-xs animate-float-slow">
              <span className="text-foreground">?</span> Since 2018
            </div>
            <div
              className="absolute -bottom-4 -right-4 px-3 py-1.5 rounded-lg glass-strong text-xs animate-float-slow"
              style={{ animationDelay: "-3s" }}
            >
              <span className="text-foreground">?</span> Global Clients
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 reveal" data-delay="120">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/80 shadow-glow-cyan" /> About Softgenix
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold leading-[1.1]">
            We are a <span className="text-foreground">small studio</span> with a
            disproportionately large impact.
          </h2>
          <p className="mt-6 text-secondary-foreground text-lg leading-relaxed">
            Softgenix Infotech is a multidisciplinary technology and growth studio. We pair seasoned
            engineers, designers and marketers to ship products that move the needle fast.
          </p>
          <p className="mt-4 text-secondary-foreground leading-relaxed">
            Our process is honest, our pricing is transparent and our timelines are realistic. The
            result is long-term partners, not one-off projects.
          </p>

          <ul className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              "Senior team with no junior handoff",
              "Fixed-scope sprints with weekly demos",
              "Performance-first engineering",
              "Direct WhatsApp line with founders",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-foreground shadow-glow shrink-0" />
                <span className="text-sm text-foreground/85">{line}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default About;