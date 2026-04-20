import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "Lumen Finance",
    cat: "Web Platform",
    desc: "A wealth-tech dashboard with realtime portfolio analytics and AI insights.",
    grad: "from-primary/40 via-cyan/30 to-violet/30",
  },
  {
    title: "Nova Retail",
    cat: "E-commerce",
    desc: "Headless commerce with 1.2s LCP and 4.7× return on ad spend in 90 days.",
    grad: "from-violet/40 via-primary/30 to-cyan/30",
  },
  {
    title: "Pulse Health",
    cat: "Mobile App",
    desc: "Cross-platform health companion with on-device AI triage and chat support.",
    grad: "from-cyan/40 via-primary/30 to-violet/30",
  },
  {
    title: "Atlas Logistics",
    cat: "AI Chatbot",
    desc: "WhatsApp assistant handling 70% of inbound queries with zero human handoff.",
    grad: "from-primary/40 via-violet/30 to-cyan/30",
  },
];

const Portfolio = () => {
  return (
    <section id="work" className="relative py-28 md:py-36">
      <div className="container">
        <div className="flex items-end justify-between gap-8 flex-wrap reveal">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Selected Work
            </span>
            <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Recent stories<br /><span className="text-gradient-brand">we helped write.</span>
            </h2>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {projects.map((p, i) => (
            <article
              key={p.title}
              className="reveal group relative rounded-3xl overflow-hidden glass-strong hover:-translate-y-1 transition-transform duration-500"
              data-delay={(i * 90).toString()}
            >
              {/* Gradient canvas */}
              <div className={`relative aspect-[16/10] bg-gradient-to-br ${p.grad}`}>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,hsl(210_100%_70%/0.35),transparent_60%)]" />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(hsl(0 0% 100% / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.06) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                {/* mock UI bars */}
                <div className="absolute inset-x-10 bottom-10 space-y-2">
                  <div className="h-2 w-3/4 rounded-full bg-foreground/20" />
                  <div className="h-2 w-1/2 rounded-full bg-foreground/15" />
                  <div className="h-2 w-2/3 rounded-full bg-foreground/10" />
                </div>
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" />
                  </div>
                  <div className="text-[10px] tracking-widest uppercase text-foreground/60">{p.cat}</div>
                </div>
              </div>

              <div className="p-7 flex items-start justify-between gap-6">
                <div>
                  <h3 className="font-display text-2xl font-semibold">{p.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed max-w-md">{p.desc}</p>
                </div>
                <div className="h-11 w-11 rounded-full grid place-items-center bg-foreground/5 border border-border group-hover:bg-gradient-brand group-hover:text-primary-foreground group-hover:border-transparent transition-all duration-500">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
