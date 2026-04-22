import { Globe2, Headphones, Rocket, ShieldCheck, Users, Zap } from "lucide-react";

const items = [
  { icon: Zap, title: "Cinematic execution", desc: "Every interaction is hand-tuned. Performance and polish, not templates." },
  { icon: ShieldCheck, title: "Senior accountability", desc: "Your project lead is a founder. No filtered communication." },
  { icon: Users, title: "Cross-functional team", desc: "Design, engineering and marketing in one room with fewer handoffs." },
  { icon: Rocket, title: "Ship in weeks", desc: "Sprint-based delivery with weekly demos and transparent progress." },
  { icon: Globe2, title: "Global standards", desc: "Built to enterprise security, accessibility and SEO baselines." },
  { icon: Headphones, title: "Always on", desc: "Real humans on WhatsApp. Real responses, not ticket queues." },
];

const WhyChooseUs = () => {
  return (
    <section className="relative py-28 md:py-36">
      <div className="container">
        <div className="max-w-3xl reveal">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/80" /> Why Softgenix
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
            Six reasons teams
            <br />
            <span className="text-foreground">stay for years.</span>
          </h2>
        </div>

        <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-px overflow-hidden rounded-3xl glass">
          {items.map((item, i) => (
            <div
              key={item.title}
              className="reveal bg-background p-8 group hover:bg-secondary transition-colors duration-500"
              data-delay={(i * 70).toString()}
            >
              <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl grid place-items-center bg-foreground/6 border border-border/70 group-hover:border-foreground/25 group-hover:shadow-glow transition-all">
                  <item.icon className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
              </div>
              <p className="mt-4 text-sm text-secondary-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
