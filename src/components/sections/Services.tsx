import { Bot, Code2, LineChart, Megaphone, Palette, Smartphone } from "lucide-react";

const services = [
  {
    icon: Code2,
    title: "Web Development",
    desc: "Lightning-fast websites and web apps engineered with modern stacks for scale, SEO and conversions.",
    tags: ["React", "Next.js", "Node", "Headless CMS"],
  },
  {
    icon: Smartphone,
    title: "Mobile Apps",
    desc: "Native-grade iOS and Android experiences built with React Native and Flutter, beautiful and reliable.",
    tags: ["iOS", "Android", "React Native", "Flutter"],
  },
  {
    icon: Bot,
    title: "AI Chatbots",
    desc: "Custom GPT-powered assistants that automate support, qualify leads and unlock 24/7 conversations.",
    tags: ["OpenAI", "RAG", "WhatsApp", "Web"],
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    desc: "Performance-driven campaigns across Google, Meta and LinkedIn, built around measurable ROI.",
    tags: ["SEO", "Meta Ads", "Google Ads", "Email"],
  },
  {
    icon: Palette,
    title: "Brand & UI/UX",
    desc: "Identity systems, product UX and design systems that make your brand instantly recognizable.",
    tags: ["Figma", "Design System", "Logo", "Web UX"],
  },
  {
    icon: LineChart,
    title: "Analytics & Growth",
    desc: "Tracking, dashboards and CRO experiments that turn user data into compounding revenue.",
    tags: ["GA4", "GTM", "A/B", "Funnels"],
  },
];

const Services = () => {
  return (
    <section id="services" className="relative py-28 md:py-36">
      <div className="container">
        <div className="max-w-3xl reveal">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass text-[11px] tracking-[0.3em] uppercase text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/80 shadow-glow" /> Services
          </span>
          <h2 className="mt-6 font-display text-4xl md:text-6xl font-bold leading-[1.05]">
            A complete digital studio,
            <br />
            <span className="text-foreground">under one roof.</span>
          </h2>
          <p className="mt-6 text-secondary-foreground text-lg max-w-2xl">
            From the first line of code to the final campaign, we ship products that are cinematic,
            readable, and conversion-focused.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, i) => (
            <article
              key={service.title}
              className="reveal group relative p-7 rounded-2xl glass magnetic-glow overflow-hidden hover:-translate-y-1 transition-transform duration-500"
              data-delay={(i * 80).toString()}
            >
              <div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(360px circle at var(--mx,50%) var(--my,0%), hsl(0 0% 100% / 0.13), transparent 44%)",
                }}
              />
              <div className="relative">
                <div className="h-12 w-12 rounded-xl grid place-items-center bg-foreground text-background shadow-elevated">
                  <service.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-6 font-display text-xl font-semibold">{service.title}</h3>
                <p className="mt-3 text-sm text-secondary-foreground leading-relaxed">{service.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {service.tags.map((tag) => (
                    <span key={tag} className="text-[10px] tracking-wider uppercase px-2.5 py-1 rounded-md border border-border/70 text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;