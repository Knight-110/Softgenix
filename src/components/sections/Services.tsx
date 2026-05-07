import { useEffect, useRef, useState } from "react";
import type {
  CSSProperties,
  ComponentType,
  MouseEvent as ReactMouseEvent,
  RefObject,
} from "react";
import type { IconType } from "react-icons";

import {
  Aperture,
  ArrowRight,
  Blocks,
  Braces,
  Brush,
  Cloud,
  Code2,
  Megaphone,
  Network,
  PenTool,
  Rocket,
  SearchCheck,
  ShieldCheck,
  Smartphone,
  Workflow,
} from "lucide-react";
import {
  SiBootstrap,
  SiCss,
  SiDocker,
  SiExpress,
  SiFigma,
  SiFirebase,
  SiFlutter,
  SiGit,
  SiGooglecloud,
  SiGraphql,
  SiHtml5,
  SiJavascript,
  SiKotlin,
  SiKubernetes,
  SiLaravel,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNodedotjs,
  SiPhp,
  SiPostgresql,
  SiPython,
  SiReact,
  SiReactquery,
  SiRedis,
  SiShopify,
  SiStripe,
  SiSwift,
  SiTailwindcss,
  SiTwilio,
  SiTypescript,
  SiVuedotjs,
  SiWordpress,
} from "react-icons/si";

import { openWhatsApp } from "@/lib/whatsapp";

type Service = {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  tags: string[];
  video: string;
  poster?: string;
  mediaFit?: "cover" | "contain";
};

type ProcessStep = {
  step: string;
  title: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
};

type TechItem = {
  name: string;
  category: string;
  icon: IconType | ComponentType<{ className?: string }>;
  iconClassName: string;
};

type ActiveTechCursor = Pick<TechItem, "name" | "icon" | "iconClassName"> | null;

const heroPills = ["Strategy", "Design", "Development", "Growth"];

const services: Service[] = [
  {
    icon: Code2,
    title: "Web Development",
    desc: "Lightning-fast websites and web apps engineered for scale, SEO, performance, and conversions.",
    tags: ["React", "Next.js", "Node.js", "Laravel", "WordPress", "Shopify"],
    video: "/services/web-development.mp4",
    poster: "/images/services-web-development.jpg",
    mediaFit: "cover",
  },
  {
    icon: Smartphone,
    title: "Mobile App Development",
    desc: "Native-grade iOS and Android apps built with Flutter and React Native, with smooth UI, push notifications, and offline support.",
    tags: ["Flutter", "React Native", "iOS & Android", "Push Notifications", "Offline Support"],
    video: "/services/mobile-app.mp4",
    poster: "/images/services-mobile-app-development.jpg",
    mediaFit: "cover",
  },
  {
    icon: Brush,
    title: "UI/UX Design",
    desc: "User-centered design that converts visitors into customers, from wireframes to polished accessible interfaces.",
    tags: ["User Research", "Wireframing", "Prototyping", "Design Systems", "Accessibility"],
    video: "/services/ui-ux.mp4",
    mediaFit: "cover",
  },
  {
    icon: Megaphone,
    title: "Digital Marketing",
    desc: "Data-driven campaigns that grow your brand through SEO, paid ads, social media, content, and analytics.",
    tags: ["SEO & SEM", "Social Media", "Content Marketing", "Email Campaigns", "Analytics"],
    video: "/services/digital-marketing.mp4",
    mediaFit: "cover",
  },
  {
    icon: Workflow,
    title: "IT Consulting",
    desc: "Strategic technology guidance to modernize infrastructure, optimize workflows, and scale confidently.",
    tags: ["Tech Strategy", "Cloud Migration", "System Architecture", "Security Audits", "Digital Transformation"],
    video: "/services/it-consulting.mp4",
    mediaFit: "cover",
  },
  {
    icon: Aperture,
    title: "Photography & Media",
    desc: "Professional photography and videography services to elevate your brand's visual identity across platforms.",
    tags: ["Product Photography", "Brand Videos", "Social Content", "Event Coverage", "Post-Production"],
    video: "/services/photography-media.mp4",
    mediaFit: "cover",
  },
];

const processSteps: ProcessStep[] = [
  {
    step: "01",
    title: "Discovery & Strategy",
    desc: "We analyze your business, goals, and competition to craft a winning digital strategy.",
    icon: SearchCheck,
  },
  {
    step: "02",
    title: "Planning & Architecture",
    desc: "Detailed project roadmap, tech stack selection, and system architecture design.",
    icon: Blocks,
  },
  {
    step: "03",
    title: "UI/UX Design",
    desc: "Wireframes, prototypes, and high-fidelity designs reviewed and approved by you.",
    icon: Brush,
  },
  {
    step: "04",
    title: "Development",
    desc: "Agile development sprints with regular demos and continuous integration.",
    icon: Code2,
  },
  {
    step: "05",
    title: "Testing & QA",
    desc: "Rigorous testing across devices, browsers, and performance benchmarks.",
    icon: ShieldCheck,
  },
  {
    step: "06",
    title: "Launch & Support",
    desc: "Smooth deployment, monitoring, and 6 months of post-launch support.",
    icon: Rocket,
  },
];

const technologies: TechItem[] = [
  { name: "HTML5", category: "Frontend", icon: SiHtml5, iconClassName: "text-[#E34F26]" },
  { name: "CSS3", category: "Frontend", icon: SiCss, iconClassName: "text-[#1572B6]" },
  { name: "JavaScript", category: "Frontend", icon: SiJavascript, iconClassName: "text-[#F7DF1E]" },
  { name: "TypeScript", category: "Frontend", icon: SiTypescript, iconClassName: "text-[#3178C6]" },
  { name: "React.js", category: "Frontend", icon: SiReact, iconClassName: "text-[#61DAFB]" },
  { name: "Vue.js", category: "Frontend", icon: SiVuedotjs, iconClassName: "text-[#42B883]" },
  { name: "Next.js", category: "Frontend", icon: SiNextdotjs, iconClassName: "text-white" },
  { name: "Laravel", category: "Backend", icon: SiLaravel, iconClassName: "text-[#FF2D20]" },
  { name: "Node.js", category: "Backend", icon: SiNodedotjs, iconClassName: "text-[#5FA04E]" },
  { name: "Express.js", category: "Backend", icon: SiExpress, iconClassName: "text-white" },
  { name: "Flutter", category: "Mobile", icon: SiFlutter, iconClassName: "text-[#02569B]" },
  { name: "React Native", category: "Mobile", icon: SiReactquery, iconClassName: "text-[#FF4154]" },
  { name: "Swift", category: "Mobile", icon: SiSwift, iconClassName: "text-[#F05138]" },
  { name: "Kotlin", category: "Mobile", icon: SiKotlin, iconClassName: "text-[#7F52FF]" },
  { name: "Python", category: "Backend", icon: SiPython, iconClassName: "text-[#3776AB]" },
  { name: "PHP", category: "Backend", icon: SiPhp, iconClassName: "text-[#777BB4]" },
  { name: "MySQL", category: "Database", icon: SiMysql, iconClassName: "text-[#4479A1]" },
  { name: "PostgreSQL", category: "Database", icon: SiPostgresql, iconClassName: "text-[#4169E1]" },
  { name: "MongoDB", category: "Database", icon: SiMongodb, iconClassName: "text-[#47A248]" },
  { name: "Redis", category: "Database", icon: SiRedis, iconClassName: "text-[#DC382D]" },
  { name: "Firebase", category: "Cloud", icon: SiFirebase, iconClassName: "text-[#FFCA28]" },
  { name: "AWS", category: "Cloud", icon: Cloud, iconClassName: "text-[#FF9900]" },
  { name: "Google Cloud", category: "Cloud", icon: SiGooglecloud, iconClassName: "text-[#4285F4]" },
  { name: "Docker", category: "Backend", icon: SiDocker, iconClassName: "text-[#2496ED]" },
  { name: "Kubernetes", category: "Cloud", icon: SiKubernetes, iconClassName: "text-[#326CE5]" },
  { name: "Git", category: "Backend", icon: SiGit, iconClassName: "text-[#F05032]" },
  { name: "Figma", category: "Design", icon: SiFigma, iconClassName: "text-[#F24E1E]" },
  { name: "Adobe XD", category: "Design", icon: PenTool, iconClassName: "text-[#FF61F6]" },
  { name: "Tailwind CSS", category: "Frontend", icon: SiTailwindcss, iconClassName: "text-[#06B6D4]" },
  { name: "Bootstrap", category: "Frontend", icon: SiBootstrap, iconClassName: "text-[#7952B3]" },
  { name: "GraphQL", category: "Backend", icon: SiGraphql, iconClassName: "text-[#E10098]" },
  { name: "REST APIs", category: "Backend", icon: Network, iconClassName: "text-cyan-300" },
  { name: "WordPress", category: "Commerce", icon: SiWordpress, iconClassName: "text-[#21759B]" },
  { name: "Shopify", category: "Commerce", icon: SiShopify, iconClassName: "text-[#7AB55C]" },
  { name: "Stripe", category: "Commerce", icon: SiStripe, iconClassName: "text-[#635BFF]" },
  { name: "Twilio", category: "Cloud", icon: SiTwilio, iconClassName: "text-[#F22F46]" },
];

const radarGroups = ["Frontend", "Backend", "Mobile", "Database", "Cloud", "Design", "Commerce"];

const ServiceVideo = ({
  src,
  poster,
  fit = "cover",
  isActive,
}: {
  src: string;
  poster?: string;
  fit?: "cover" | "contain";
  isActive: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    const setPlaybackRate = () => {
      video.playbackRate = 0.82;
    };

    setPlaybackRate();
    video.addEventListener("loadedmetadata", setPlaybackRate);

    return () => {
      video.removeEventListener("loadedmetadata", setPlaybackRate);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) {
      return;
    }

    if (isActive) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [isActive]);

  return (
    <div className="absolute inset-0 overflow-hidden rounded-[25px] bg-black">
      <div className="h-full w-full bg-black">
        <video
          ref={videoRef}
          className={`pointer-events-none h-full w-full ${fit === "contain" ? "object-contain bg-black p-2" : "object-cover"}`}
          muted
          loop
          playsInline
          preload="metadata"
          poster={poster}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.52),rgba(0,0,0,0.3)_34%,rgba(0,0,0,0.84)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.4)_38%,rgba(0,0,0,0.3)_72%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
};

const TechLogoCursor = ({
  cursorRef,
  cursorInnerRef,
  activeTech,
  visible,
  enabled,
}: {
  cursorRef: RefObject<HTMLDivElement | null>;
  cursorInnerRef: RefObject<HTMLDivElement | null>;
  activeTech: ActiveTechCursor;
  visible: boolean;
  enabled: boolean;
}) => {
  if (!enabled || !activeTech) {
    return null;
  }

  const Icon = activeTech.icon;

  return (
    <div
      ref={cursorRef}
      className={`pointer-events-none fixed left-0 top-0 z-[120] hidden h-14 w-14 will-change-transform md:block ${visible ? "opacity-100" : "opacity-0"}`}
      style={{ transition: "opacity 220ms ease" }}
    >
      <div
        ref={cursorInnerRef}
        className="relative flex h-14 w-14 items-center justify-center will-change-transform"
        style={{ transformOrigin: "50% 50%" }}
      >
        <Icon
          className={`h-8 w-8 ${activeTech.iconClassName}`}
          style={{ filter: "drop-shadow(0 0 3px rgba(255,255,255,0.08))" }}
        />
      </div>
    </div>
  );
};

const Services = () => {
  const [isDesktopCursor, setIsDesktopCursor] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [activeTech, setActiveTech] = useState<ActiveTechCursor>(null);
  const [activeServiceVideo, setActiveServiceVideo] = useState<string | null>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const cursorTargetRef = useRef({ x: 0, y: 0 });
  const cursorPositionRef = useRef({ x: 0, y: 0 });
  const cursorVelocityRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const updatePointerMode = () => {
      const enabled = mediaQuery.matches;
      setIsDesktopCursor(enabled);

      if (!enabled) {
        setCursorVisible(false);
        setActiveTech(null);
      }
    };

    updatePointerMode();
    mediaQuery.addEventListener("change", updatePointerMode);

    return () => {
      mediaQuery.removeEventListener("change", updatePointerMode);
    };
  }, []);

  useEffect(() => {
    if (!isDesktopCursor) {
      return;
    }

    const updateCursor = () => {
      const nextX =
        cursorPositionRef.current.x +
        (cursorTargetRef.current.x - cursorPositionRef.current.x) * 0.2;
      const nextY =
        cursorPositionRef.current.y +
        (cursorTargetRef.current.y - cursorPositionRef.current.y) * 0.2;

      cursorVelocityRef.current = {
        x: nextX - cursorPositionRef.current.x,
        y: nextY - cursorPositionRef.current.y,
      };
      cursorPositionRef.current = { x: nextX, y: nextY };

      const speed = Math.min(
        Math.hypot(cursorVelocityRef.current.x, cursorVelocityRef.current.y),
        16,
      );
      const rotation = Math.max(-6, Math.min(6, cursorVelocityRef.current.x * 1.1));
      const scale = 1 + speed * 0.003;
      const snappedX = Math.round(nextX);
      const snappedY = Math.round(nextY);

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${snappedX - 28}px, ${snappedY - 28}px, 0)`;
      }

      if (cursorInnerRef.current) {
        cursorInnerRef.current.style.transform = `rotate(${rotation}deg) scale(${scale})`;
      }

      frameRef.current = window.requestAnimationFrame(updateCursor);
    };

    frameRef.current = window.requestAnimationFrame(updateCursor);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isDesktopCursor]);

  const handleTechPointerMove = (
    event: ReactMouseEvent<HTMLElement>,
    tech: TechItem,
  ) => {
    if (!isDesktopCursor) {
      return;
    }

    const { clientX, clientY, currentTarget } = event;
    const bounds = currentTarget.getBoundingClientRect();
    const offsetX = clientX - bounds.left;
    const offsetY = clientY - bounds.top;
    const rotateY = ((offsetX / bounds.width) - 0.5) * 6;
    const rotateX = (0.5 - offsetY / bounds.height) * 6;

    if (!cursorVisible) {
      cursorPositionRef.current = { x: clientX, y: clientY };
    }

    cursorTargetRef.current = { x: clientX, y: clientY };
    currentTarget.style.setProperty("--spot-x", `${offsetX}px`);
    currentTarget.style.setProperty("--spot-y", `${offsetY}px`);
    currentTarget.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translate3d(0,-2px,0)`;

    if (activeTech?.name !== tech.name) {
      setActiveTech({
        name: tech.name,
        icon: tech.icon,
        iconClassName: tech.iconClassName,
      });
    }

    if (!cursorVisible) {
      setCursorVisible(true);
    }
  };

  const handleTechPointerLeave = (event: ReactMouseEvent<HTMLElement>) => {
    event.currentTarget.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translate3d(0,0,0)";
    event.currentTarget.style.setProperty("--spot-x", "50%");
    event.currentTarget.style.setProperty("--spot-y", "50%");
    setCursorVisible(false);
  };

  return (
    <section id="services" className="relative overflow-hidden bg-black py-28 md:py-36">
      <TechLogoCursor
        cursorRef={cursorRef}
        cursorInnerRef={cursorInnerRef}
        activeTech={activeTech}
        visible={cursorVisible}
        enabled={isDesktopCursor}
      />

      <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:56px_56px]" />
      <div className="pointer-events-none absolute left-[8%] top-16 h-56 w-56 rounded-full bg-cyan-300/10 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-20 right-[10%] h-56 w-56 rounded-full bg-cyan-300/8 blur-[130px]" />

      <div className="relative mx-auto w-full max-w-[1280px] px-4 sm:px-6 lg:px-8">
        <div className="reveal max-w-4xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#050505] px-3 py-1 text-[11px] uppercase tracking-[0.32em] text-white/60">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(34,211,238,0.45)]" />
            Services
          </span>

          <h2 className="mt-6 font-display text-4xl font-bold leading-[1.02] text-white md:text-6xl">
            Digital services engineered for launch, scale, and growth.
          </h2>

          <p className="mt-5 max-w-3xl text-base leading-8 text-white/60 md:text-lg">
            Softgenix brings design, development, marketing, consulting, and media production
            under one roof so every product, campaign, and launch feels aligned from strategy to
            execution.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {heroPills.map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-white/10 bg-[#080808] px-4 py-2 text-[11px] uppercase tracking-[0.24em] text-white/70"
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service, i) => (
            <article
              key={service.title}
              className="reveal group relative overflow-hidden rounded-[26px] border border-white/10 bg-[#050505] p-[1px]"
              data-delay={(i * 70).toString()}
              onMouseEnter={() => setActiveServiceVideo(service.title)}
              onMouseLeave={() => setActiveServiceVideo((current) => (current === service.title ? null : current))}
            >
              <div
                className="pointer-events-none absolute inset-0 rounded-[26px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(260px circle at var(--mx,50%) var(--my,0%), rgba(34,211,238,0.12), transparent 52%)",
                }}
              />
              <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent" />

              <div className="relative flex min-h-[240px] flex-col rounded-[25px] bg-[#080808] p-5 md:min-h-[248px] md:p-6">
                <ServiceVideo
                  src={service.video}
                  poster={service.poster}
                  fit={service.mediaFit}
                  isActive={activeServiceVideo === service.title}
                />
                <div className="relative z-10 flex h-full flex-col rounded-[20px] bg-[linear-gradient(180deg,rgba(0,0,0,0.6),rgba(0,0,0,0.3)_30%,rgba(0,0,0,0.64)_72%,rgba(0,0,0,0.84)_100%)] p-4 backdrop-blur-[1px]">
                  <div className="flex items-start justify-between gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-[18px] bg-cyan-300/10 blur-lg" />
                      <div className="relative grid h-13 w-13 place-items-center rounded-[18px] border border-white/10 bg-[#0a0a0a] text-white shadow-[0_0_18px_rgba(34,211,238,0.08)]">
                        <service.icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="text-[11px] uppercase tracking-[0.34em] text-white/35">
                      {String(i + 1).padStart(2, "0")}
                    </div>
                  </div>

                  <div className="mt-5 flex-1">
                    <h3 className="font-display text-[1.35rem] font-semibold leading-tight text-white">
                      {service.title}
                    </h3>
                    <p className="mt-3 max-w-[34ch] text-sm leading-7 text-white/84">{service.desc}</p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {service.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-white/12 bg-black/55 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-white/72 backdrop-blur-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-white/12 pt-4">
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/55">
                      Project inquiry
                    </div>
                    <button
                      type="button"
                      onClick={() => openWhatsApp(`Hi Softgenix, I want a quote for ${service.title}.`)}
                      className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-black/65 px-3.5 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-300 hover:border-cyan-300/30 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                    >
                      Get Quote
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-20">
          <div className="reveal max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#050505] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/60">
              <Blocks className="h-3.5 w-3.5" />
              Process
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-white md:text-3xl">
              A structured workflow that keeps every delivery stage aligned.
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
              Discovery, planning, design, engineering, QA, and launch follow one balanced system
              so progress stays visible and execution stays clean.
            </p>
          </div>

          <div className="relative mt-6">
            <div className="pointer-events-none absolute left-[16.666%] right-[16.666%] top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-cyan-300/25 to-transparent xl:block" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {processSteps.map((step, i) => (
                <article
                  key={step.step}
                  className="reveal group relative overflow-hidden rounded-[22px] border border-white/10 bg-[#050505] p-4 md:p-5"
                  data-delay={(i * 60).toString()}
                >
                  <div className="pointer-events-none absolute -right-2 top-1 font-display text-[3.7rem] leading-none text-white/[0.04]">
                    {step.step}
                  </div>
                  <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />

                  <div className="relative flex min-h-[188px] flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl bg-cyan-300/10 blur-md" />
                        <div className="relative grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-[#0a0a0a] text-white">
                          <step.icon className="h-4.5 w-4.5" />
                        </div>
                      </div>

                      <span className="rounded-full border border-white/10 bg-[#0a0a0a] px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-white/50">
                        {step.step}
                      </span>
                    </div>

                    <h4 className="mt-4 font-display text-base font-semibold text-white">{step.title}</h4>
                    <p className="mt-2 text-sm leading-6 text-white/60">{step.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-16">
          <div className="reveal max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#050505] px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-white/60">
              <Braces className="h-3.5 w-3.5" />
              Technology
            </span>
            <h3 className="mt-5 font-display text-3xl font-semibold leading-tight text-white md:text-4xl">
              A compact technology stack with consistent structure and interaction.
            </h3>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
              Every technology card uses the same footprint, while the floating logo cursor keeps
              the interaction premium and precise on desktop.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {radarGroups.map((group) => (
              <span
                key={group}
                className="rounded-full border border-white/10 bg-[#050505] px-3 py-1.5 text-[10px] uppercase tracking-[0.22em] text-white/55"
              >
                {group}
              </span>
            ))}
          </div>

          <div className="relative mt-6 overflow-hidden rounded-[28px] border border-white/10 bg-[#050505] p-4 sm:p-5">
            <div className="pointer-events-none absolute inset-0 opacity-[0.1] [background-image:linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent" />
            <div className="pointer-events-none absolute inset-x-0 top-10 h-px bg-gradient-to-r from-transparent via-cyan-300/16 to-transparent opacity-60 animate-pulse" />

            <div className="relative grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
              {technologies.map((tech, i) => {
                const Icon = tech.icon;

                return (
                  <article
                    key={tech.name}
                    className={`reveal group relative overflow-hidden rounded-[18px] border border-white/10 bg-[#080808] p-[1px] transition-transform duration-200 ${isDesktopCursor ? "cursor-none select-none" : "select-none"}`}
                    data-delay={((i % 12) * 24).toString()}
                    style={
                      {
                        "--spot-x": "50%",
                        "--spot-y": "50%",
                      } as CSSProperties
                    }
                    onMouseEnter={(event) => handleTechPointerMove(event, tech)}
                    onMouseMove={(event) => handleTechPointerMove(event, tech)}
                    onMouseLeave={handleTechPointerLeave}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 rounded-[18px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(120px circle at var(--spot-x) var(--spot-y), rgba(34,211,238,0.1), transparent 62%)",
                      }}
                    />

                    <div className="relative flex h-[78px] items-center gap-3 rounded-[17px] bg-[#0a0a0a] px-3.5 transition-transform duration-300 group-hover:-translate-y-0.5">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#050505]">
                        <Icon className={`h-6 w-6 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${tech.iconClassName}`} />
                      </div>

                      <div className="min-w-0">
                        <h4 className="truncate text-sm font-medium text-white">{tech.name}</h4>
                        <p className="mt-1 truncate text-[10px] uppercase tracking-[0.2em] text-white/45">
                          {tech.category}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
