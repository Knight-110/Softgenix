import type { MouseEvent } from "react";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

type Project = {
  title: string;
  cat: string;
  desc: string;
  url: string;
  preview: string;
  accent: string;
};

const projects: Project[] = [
  {
    title: "Enzo Salons",
    cat: "Salon Website",
    desc: "A brand-forward salon website focused on services, local trust, and appointment-ready browsing.",
    url: "https://www.enzosalons.com/",
    preview: "/portfolio-previews/enzo-salons.png",
    accent: "#f0b46a",
  },
  {
    title: "Touch & Glow Salons",
    cat: "Beauty & Wellness",
    desc: "A polished salon experience designed to showcase treatments, pricing, and a premium in-store feel online.",
    url: "https://www.touchandglowsalons.com/",
    preview: "/portfolio-previews/touch-and-glow.png",
    accent: "#e7d4a8",
  },
  {
    title: "TravelMerge Holidays",
    cat: "Travel Booking",
    desc: "A travel platform built to highlight tour packages, destinations, and fast customer enquiry flows.",
    url: "https://travelmergeholidays.com/",
    preview: "/portfolio-previews/travelmerge-holidays.png",
    accent: "#59b8ff",
  },
  {
    title: "GPC ornaments",
    cat: "Business Website",
    desc: "A product-led company website structured to present offerings clearly and support lead generation.",
    url: "https://gpcornaments.com/",
    preview: "/portfolio-previews/gp-cornaments.png",
    accent: "#caa053",
  },
  {
    title: "TradeX",
    cat: "Trading Platform",
    desc: "A demo trading interface built around market visibility, live decision-making, and dashboard clarity.",
    url: "https://tradex-frontend-37ly.onrender.com/",
    preview: "/portfolio-previews/tradex.png",
    accent: "#88e6d0",
  },
  {
    title: "Jamia Faizul Uloom",
    cat: "Education Website",
    desc: "An institutional website for admissions, donations, and community outreach around Islamic education programs.",
    url: "https://jamiafaizululoom.com/",
    preview: "/portfolio-previews/jamia-faizul-uloom.png",
    accent: "#7dc98f",
  },
];

const ProjectCard = ({ project }: { project: Project }) => {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const currentOffsetRef = useRef(0);
  const targetOffsetRef = useRef(0);
  const [imageLoaded, setImageLoaded] = useState(false);

  const animate = () => {
    const current = currentOffsetRef.current;
    const target = targetOffsetRef.current;
    const next = current + (target - current) * 0.06;

    currentOffsetRef.current = next;

    if (imageRef.current) {
      imageRef.current.style.transform = `translate3d(0, ${-next}px, 0)`;
    }

    if (Math.abs(target - next) > 0.35) {
      frameRef.current = window.requestAnimationFrame(animate);
    } else {
      currentOffsetRef.current = target;
      if (imageRef.current) {
        imageRef.current.style.transform = `translate3d(0, ${-target}px, 0)`;
      }
      frameRef.current = null;
    }
  };

  const startAnimation = () => {
    if (frameRef.current === null) {
      frameRef.current = window.requestAnimationFrame(animate);
    }
  };

  const updateFromPointer = (event: MouseEvent<HTMLAnchorElement>) => {
    const previewEl = previewRef.current;
    const imageEl = imageRef.current;
    if (!previewEl || !imageEl) return;

    const previewRect = previewEl.getBoundingClientRect();
    const imageRect = imageEl.getBoundingClientRect();
    const relativeY = Math.min(Math.max(event.clientY - previewRect.top, 0), previewRect.height);
    const progress = previewRect.height > 0 ? relativeY / previewRect.height : 0;
    const maxScroll = Math.max(imageRect.height - previewRect.height, 0);

    targetOffsetRef.current = maxScroll * progress;
    startAnimation();
  };

  const resetPreview = () => {
    targetOffsetRef.current = 0;
    startAnimation();
  };

  return (
    <a
      href={project.url}
      target="_blank"
      rel="noreferrer"
      onMouseMove={updateFromPointer}
      onMouseLeave={resetPreview}
      className="reveal group relative rounded-3xl overflow-hidden glass-strong hover:-translate-y-1 transition-transform duration-500"
      style={{ "--project-accent": project.accent } as React.CSSProperties}
    >
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
        <div className="absolute -inset-px rounded-[inherit] bg-[radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--project-accent)_34%,transparent),transparent_40%)] blur-2xl" />
        <div className="absolute inset-0 rounded-[inherit] border border-white/12" />
      </div>

      <div className="relative border-b border-white/8 px-5 py-4 md:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-white/35" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/24" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/14" />
          </div>

          <div className="inline-flex items-center rounded-full border border-white/10 bg-white/6 px-3 py-1 text-[10px] tracking-[0.24em] uppercase text-foreground/65">
            {project.cat}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 md:px-5 md:pt-5">
        <div
          ref={previewRef}
          className="relative h-[280px] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,22,33,0.92),rgba(6,8,13,1))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_28px_70px_-46px_rgba(0,0,0,1)] md:h-[380px]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.08),transparent_40%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01)_18%,rgba(0,0,0,0.24)_100%)]" />

          <img
            ref={imageRef}
            src={project.preview}
            alt={`${project.title} website preview`}
            onLoad={() => setImageLoaded(true)}
            className="relative z-[1] block w-full select-none"
            style={{
              transform: "translate3d(0, 0, 0)",
              transition: imageLoaded ? "filter 300ms ease" : undefined,
            }}
            loading="lazy"
            decoding="async"
            draggable={false}
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-20 bg-[linear-gradient(180deg,rgba(6,8,13,0.76),transparent)]" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-24 bg-[linear-gradient(180deg,transparent,rgba(6,8,13,0.9))]" />

          <div className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] border border-white/6" />
        </div>
      </div>

      <div className="p-7 flex items-start justify-between gap-6">
        <div>
          <h3 className="font-display text-2xl font-semibold">{project.title}</h3>
          <p className="mt-2 text-sm text-secondary-foreground leading-relaxed max-w-md">{project.desc}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/55">
              Live Preview
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-[0.22em] text-foreground/55">
              Scroll on Hover
            </span>
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-foreground/68">
            View Live Site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </p>
        </div>

        <div className="h-11 w-11 rounded-full grid place-items-center bg-foreground/6 border border-border group-hover:bg-foreground group-hover:text-background group-hover:border-transparent transition-all duration-500">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
};

const Portfolio = () => {
  return (
    <section id="portfolio" className="relative py-28 md:py-36">
      <div className="container">
        <div className="reveal relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-black shadow-[0_40px_120px_-70px_rgba(0,0,0,1)] md:min-h-[520px] md:rounded-[2.5rem]">
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-55"
            src="/portfolio/portfolio-hero.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.88),rgba(0,0,0,0.56),rgba(0,0,0,0.22))]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.22),transparent_35%),radial-gradient(circle_at_75%_30%,rgba(59,130,246,0.18),transparent_34%)]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.95))]" />

          <div className="relative z-10 flex min-h-[420px] items-end p-7 md:min-h-[520px] md:p-12 lg:p-16">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-secondary-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/80" /> Selected Portfolio
              </span>

              <h2 className="mt-6 font-display text-4xl font-bold leading-[1.02] text-white md:text-6xl lg:text-7xl">
                Recent stories
                <br />
                <span className="text-foreground">we helped write.</span>
              </h2>

              <div className="relative mt-6 max-w-xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/30 px-5 py-5 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.95)] backdrop-blur-sm md:px-6 md:py-6">
                <video
                  className="absolute inset-0 h-full w-full object-cover opacity-40"
                  src="/portfolio/portfolio-hero.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.86),rgba(0,0,0,0.52),rgba(0,0,0,0.34))]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_30%,rgba(34,211,238,0.18),transparent_34%),radial-gradient(circle_at_82%_34%,rgba(59,130,246,0.14),transparent_32%)]" />
                <p className="relative z-10 text-base leading-relaxed text-white/78 md:text-lg">
                  Case studies shaped for growth, performance, and clarity.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
