import logo from "@/assets/softgenix-logo.jpeg";

const About = () => {
  return (
    <section id="about" className="relative py-28 md:py-36">
      <div className="container grid lg:grid-cols-12 gap-16 items-center">
        {/* Visual */}
        <div className="lg:col-span-5 relative reveal">
          <div className="relative aspect-square max-w-md mx-auto">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-brand opacity-30 blur-3xl animate-pulse-glow" />
            <div className="relative h-full w-full rounded-[2rem] glass-strong overflow-hidden p-8 grid place-items-center">
              <img
                src={logo}
                alt="Softgenix Infotech mark"
                className="h-full w-full object-contain"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
            </div>
            {/* floating chips */}
            <div className="absolute -top-4 -left-4 px-3 py-1.5 rounded-lg glass-strong text-xs animate-float-slow">
              <span className="text-primary">●</span> Since 2018
            </div>
            <div
              className="absolute -bottom-4 -right-4 px-3 py-1.5 rounded-lg glass-strong text-xs animate-float-slow"
              style={{ animationDelay: "-3s" }}
            >
              <span className="text-cyan">●</span> Global Clients
            </div>
          </div>
        </div>

        {/* Copy */}
        <div className="lg:col-span-7 reveal" data-delay="120">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-glow-cyan" /> About Softgenix
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-5xl font-bold leading-[1.1]">
            We're a <span className="text-gradient-brand">small studio</span> with a
            disproportionately large impact.
          </h2>
          <p className="mt-6 text-muted-foreground text-lg leading-relaxed">
            Softgenix Infotech is a multidisciplinary technology and growth studio. We pair seasoned
            engineers, designers and marketers to ship products that move the needle — fast.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Our process is honest, our pricing is transparent and our timelines are realistic. The
            result: long-term partners, not one-off projects.
          </p>

          <ul className="mt-10 grid sm:grid-cols-2 gap-4">
            {[
              "Senior team — no juniors fronting projects",
              "Fixed-scope sprints with weekly demos",
              "Performance-first engineering",
              "Direct WhatsApp line with founders",
            ].map((line) => (
              <li key={line} className="flex items-start gap-3">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shadow-glow shrink-0" />
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
