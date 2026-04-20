import { useEffect, useRef } from "react";

/**
 * Cinematic background:
 *  - Pure black base
 *  - Slow drifting blue/cyan/violet aurora orbs (parallax on scroll + mouse)
 *  - Animated subtle grid
 *  - Noise overlay for film grain
 * GPU-friendly (transform/opacity only).
 */
const ImmersiveBackground = () => {
  const ref = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let mx = 0;
    let my = 0;
    let sy = 0;

    const onMouse = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    };
    const onScroll = () => {
      sy = window.scrollY;
      schedule();
    };
    const schedule = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(apply);
    };
    const apply = () => {
      const orbs = orbsRef.current;
      if (!orbs) return;
      const children = orbs.children as HTMLCollectionOf<HTMLElement>;
      for (let i = 0; i < children.length; i++) {
        const depth = parseFloat(children[i].dataset.depth || "0.1");
        const x = mx * 30 * depth;
        const y = my * 30 * depth + sy * depth * 0.15;
        children[i].style.transform = `translate3d(${x}px, ${-y}px, 0)`;
      }
    };

    window.addEventListener("mousemove", onMouse, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    apply();
    return () => {
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="fixed inset-0 -z-10 overflow-hidden bg-background">
      {/* Subtle animated grid */}
      <div
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(210 100% 60% / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(210 100% 60% / 0.08) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, #000 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 30%, #000 30%, transparent 75%)",
        }}
      />

      {/* Aurora orbs (parallax) */}
      <div ref={orbsRef} className="absolute inset-0">
        <div
          data-depth="0.4"
          className="absolute -top-40 -left-32 h-[520px] w-[520px] rounded-full blur-3xl animate-float-slow"
          style={{ background: "radial-gradient(circle, hsl(210 100% 55% / 0.45), transparent 65%)" }}
        />
        <div
          data-depth="0.25"
          className="absolute top-[20%] right-[-10%] h-[620px] w-[620px] rounded-full blur-3xl animate-float-slow"
          style={{ background: "radial-gradient(circle, hsl(190 95% 55% / 0.35), transparent 65%)", animationDelay: "-3s" }}
        />
        <div
          data-depth="0.5"
          className="absolute top-[55%] left-[20%] h-[480px] w-[480px] rounded-full blur-3xl animate-float-slow"
          style={{ background: "radial-gradient(circle, hsl(265 85% 60% / 0.3), transparent 65%)", animationDelay: "-5s" }}
        />
        <div
          data-depth="0.15"
          className="absolute bottom-0 right-[15%] h-[540px] w-[540px] rounded-full blur-3xl animate-float-slow"
          style={{ background: "radial-gradient(circle, hsl(175 70% 50% / 0.28), transparent 65%)", animationDelay: "-7s" }}
        />
      </div>

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, hsl(0 0% 0% / 0.85) 100%)",
        }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />
    </div>
  );
};

export default ImmersiveBackground;
