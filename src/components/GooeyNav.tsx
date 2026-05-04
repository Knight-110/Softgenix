import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./GooeyNav.css";

type GooeyNavItem = {
  label: string;
  href: string;
};

type GooeyNavProps = {
  items: GooeyNavItem[];
  animationTime?: number;
  particleCount?: number;
  particleDistances?: [number, number];
  particleR?: number;
  timeVariance?: number;
  colors?: number[];
  initialActiveIndex?: number;
};

type Particle = {
  start: [number, number];
  end: [number, number];
  time: number;
  scale: number;
  color: number;
  rotate: number;
};

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 10,
  particleDistances = [90, 10],
  particleR = 500,
  timeVariance = 1000,
  colors = [1],
  initialActiveIndex = 0,
}: GooeyNavProps) => {
  const navigate = useNavigate();

  const containerRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLUListElement>(null);
  const filterRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);

  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (
    distance: number,
    pointIndex: number,
    totalPoints: number
  ): [number, number] => {
    const angle =
      ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);

    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (
    i: number,
    t: number,
    d: [number, number],
    r: number
  ): Particle => {
    const rotate = noise(r / 10);

    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)] ?? 1,
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10,
    };
  };

  const updateEffectPosition = (element: HTMLLIElement) => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();

    const styles = {
      left: `${itemRect.left - containerRect.left}px`,
      top: `${itemRect.top - containerRect.top}px`,
      width: `${itemRect.width}px`,
      height: `${itemRect.height}px`,
    };

    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);

    textRef.current.textContent = element.innerText;
  };

  const clearParticles = () => {
    filterRef.current?.querySelectorAll(".particle").forEach((particle) => {
      particle.remove();
    });
  };

  const makeParticles = (element: HTMLSpanElement) => {
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty("--time", `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i += 1) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const particleMeta = createParticle(i, t, particleDistances, particleR);

      const particle = document.createElement("span");
      const point = document.createElement("span");

      particle.classList.add("particle");
      particle.style.setProperty("--start-x", `${particleMeta.start[0]}px`);
      particle.style.setProperty("--start-y", `${particleMeta.start[1]}px`);
      particle.style.setProperty("--end-x", `${particleMeta.end[0]}px`);
      particle.style.setProperty("--end-y", `${particleMeta.end[1]}px`);
      particle.style.setProperty("--time", `${particleMeta.time}ms`);
      particle.style.setProperty("--scale", `${particleMeta.scale}`);
      particle.style.setProperty(
        "--color",
        `var(--color-${particleMeta.color}, #ffffff)`
      );
      particle.style.setProperty("--rotate", `${particleMeta.rotate}deg`);

      point.classList.add("point");
      particle.appendChild(point);
      element.appendChild(particle);
    }
  };

  const runEffect = (index: number, liEl: HTMLLIElement | null) => {
    if (!liEl || !filterRef.current || !textRef.current) return;

    setActiveIndex(index);
    updateEffectPosition(liEl);
    clearParticles();

    filterRef.current.classList.remove("active");
    textRef.current.classList.remove("active");

    void filterRef.current.offsetWidth;

    requestAnimationFrame(() => {
      if (!filterRef.current || !textRef.current) return;

      filterRef.current.classList.add("active");
      textRef.current.classList.add("active");
      makeParticles(filterRef.current);
    });
  };

  const handleNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    index: number,
    href: string
  ) => {
    event.preventDefault();

    const liEl = event.currentTarget.closest("li");
    runEffect(index, liEl);

    requestAnimationFrame(() => {
      navigate(href);
    });
  };

  useEffect(() => {
    setActiveIndex(initialActiveIndex);

    requestAnimationFrame(() => {
      const activeLi = navRef.current?.querySelectorAll("li")[initialActiveIndex];

      if (activeLi) {
        updateEffectPosition(activeLi);
      }

      textRef.current?.classList.add("active");
      filterRef.current?.classList.add("active");
    });
  }, [initialActiveIndex]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll("li")[activeIndex];

      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [activeIndex]);

  useEffect(() => {
    return () => {
      clearParticles();
    };
  }, []);

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav aria-label="Primary navigation">
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li
              key={item.href}
              className={activeIndex === index ? "active" : ""}
            >
              <a
                href={item.href}
                aria-current={activeIndex === index ? "page" : undefined}
                onClick={(event) => handleNavigate(event, index, item.href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();

                    const liEl = event.currentTarget.closest("li");

                    runEffect(index, liEl);

                    requestAnimationFrame(() => {
                      navigate(item.href);
                    });
                  }
                }}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <span className="effect filter" ref={filterRef} aria-hidden="true" />
      <span className="effect text" ref={textRef} aria-hidden="true" />
    </div>
  );
};

export default GooeyNav;
