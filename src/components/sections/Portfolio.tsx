import { ArrowUpRight } from "lucide-react";

const projects = [
  {
    title: "Lumen Finance",
    cat: "Web Platform",
    desc: "A wealth-tech dashboard with realtime portfolio analytics and AI insights.",
  },
  {
    title: "Nova Retail",
    cat: "E-commerce",
    desc: "Headless commerce with 1.2s LCP and 4.7x return on ad spend in 90 days.",
  },
  {
    title: "Pulse Health",
    cat: "Mobile App",
    desc: "Cross-platform health companion with on-device AI triage and chat support.",
  },
  {
    title: "Atlas Logistics",
    cat: "AI Chatbot",
    desc: "WhatsApp assistant handling 70% of inbound queries with zero human handoff.",
  },
];

const Portfolio = () => {
  return (
    <section id="work" className="relative py-28 md:py-36">
      <div className="container">
        <div className="flex items-end justify-between gap-8 flex-wrap reveal">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-foreground/80" /> Selected Work
            </span>
            <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
              Recent stories
              <br />
              <span className="text-foreground">we helped write.</span>
            </h2>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {projects.map((project, i) => (
            <article
              key={project.title}
              className="reveal group relative rounded-3xl overflow-hidden glass-strong hover:-translate-y-1 transition-transform duration-500"
              data-delay={(i * 90).toString()}
            >
              <div className="relative aspect-[16/10] bg-[linear-gradient(160deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02),rgba(255,255,255,0.06))]">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.22),transparent_65%)]" />
                <div
                  className="absolute inset-0 opacity-35"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                <div className="absolute inset-x-10 bottom-10 space-y-2">
                  <div className="h-2 w-3/4 rounded-full bg-foreground/22" />
                  <div className="h-2 w-1/2 rounded-full bg-foreground/16" />
                  <div className="h-2 w-2/3 rounded-full bg-foreground/12" />
                </div>
                <div className="absolute top-5 left-5 right-5 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" />
                    <span className="h-2.5 w-2.5 rounded-full bg-foreground/30" />
                  </div>
                  <div className="text-[10px] tracking-widest uppercase text-foreground/65">{project.cat}</div>
                </div>
              </div>

              <div className="p-7 flex items-start justify-between gap-6">
                <div>
                  <h3 className="font-display text-2xl font-semibold">{project.title}</h3>
                  <p className="mt-2 text-sm text-secondary-foreground leading-relaxed max-w-md">{project.desc}</p>
                </div>
                <div className="h-11 w-11 rounded-full grid place-items-center bg-foreground/6 border border-border group-hover:bg-foreground group-hover:text-background group-hover:border-transparent transition-all duration-500">
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