import { useEffect, useRef } from "react";

type LoaderEnergyCanvasProps = {
  progress: number;
  isExiting: boolean;
};

type ParticleState = "orbit" | "forming" | "locked" | "explode";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  targetX: number;
  targetY: number;
  state: ParticleState;
  orbitAngle: number;
  orbitRadius: number;
  orbitSpeed: number;
  noiseOffset: number;
  size: number;
  alpha: number;
  depth: number;
  color: string;
  explodeVX: number;
  explodeVY: number;
};

const COLORS = ["#22d3ee", "#38bdf8", "#8b5cf6", "#d946ef"];
const DESKTOP_PARTICLES = 112;
const MOBILE_PARTICLES = 56;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const lerp = (from: number, to: number, amount: number) =>
  from + (to - from) * amount;

const smoothstep = (edge0: number, edge1: number, value: number) => {
  const amount = clamp((value - edge0) / (edge1 - edge0 || 1), 0, 1);
  return amount * amount * (3 - 2 * amount);
};

const createTextTargets = (
  width: number,
  height: number,
  count: number,
  isMobile: boolean,
): Array<{ x: number; y: number }> => {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.floor(width));
  canvas.height = Math.max(1, Math.floor(height));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return Array.from({ length: count }, () => ({ x: width / 2, y: height / 2 }));
  }

  const fontSize = Math.min(width * (isMobile ? 0.13 : 0.11), isMobile ? 70 : 122);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${fontSize}px Sora, Manrope, sans-serif`;
  ctx.fillText("SOFTGENIX", width / 2, height / 2);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  const step = isMobile ? 6 : 5;
  const points: Array<{ x: number; y: number }> = [];

  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      const alpha = imageData[(y * canvas.width + x) * 4 + 3];
      if (alpha > 140) {
        points.push({
          x: x + (Math.random() - 0.5) * step * 0.35,
          y: y + (Math.random() - 0.5) * step * 0.35,
        });
      }
    }
  }

  if (!points.length) {
    return Array.from({ length: count }, () => ({ x: width / 2, y: height / 2 }));
  }

  const sampled = Array.from({ length: count }, (_, index) => {
    const sampleIndex = Math.floor((index / count) * points.length);
    return points[sampleIndex];
  });

  return sampled.sort(() => Math.random() - 0.5);
};

const LoaderEnergyCanvas = ({ progress, isExiting }: LoaderEnergyCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const progressRef = useRef(progress);
  const exitRef = useRef(isExiting);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    exitRef.current = isExiting;
  }, [isExiting]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let particles: Particle[] = [];
    let targets: Array<{ x: number; y: number }> = [];
    let rafId = 0;
    let lastTime = performance.now();
    let mouseX = width / 2;
    let mouseY = height / 2;
    let smoothedMouseX = width / 2;
    let smoothedMouseY = height / 2;
    let explosionStarted = false;
    let explosionStartedAt = 0;

    const mobile = () => window.matchMedia("(max-width: 768px)").matches;
    const particleCount = () => (mobile() ? MOBILE_PARTICLES : DESKTOP_PARTICLES);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = particleCount();
      targets = createTextTargets(width, height, count, mobile());
      const centerX = width / 2;
      const centerY = height / 2;

      particles = Array.from({ length: count }, (_, index) => {
        const angle = (index / count) * Math.PI * 2 + Math.random() * 0.45;
        const orbitRadius = Math.min(width, height) * (mobile() ? 0.17 : 0.22) + (Math.random() - 0.5) * 42;

        return {
          x: centerX + Math.cos(angle) * orbitRadius,
          y: centerY + Math.sin(angle * 1.2) * orbitRadius * 0.52,
          vx: 0,
          vy: 0,
          targetX: targets[index]?.x ?? centerX,
          targetY: targets[index]?.y ?? centerY,
          state: "orbit",
          orbitAngle: angle,
          orbitRadius,
          orbitSpeed: 0.004 + Math.random() * 0.006,
          noiseOffset: Math.random() * Math.PI * 2,
          size: (mobile() ? 1.8 : 2.2) + Math.random() * 2.4,
          alpha: 0.42 + Math.random() * 0.42,
          depth: 0.7 + Math.random() * 0.75,
          color: COLORS[index % COLORS.length],
          explodeVX: 0,
          explodeVY: 0,
        };
      });

      smoothedMouseX = centerX;
      smoothedMouseY = centerY;
      explosionStarted = false;
      explosionStartedAt = 0;
    };

    const triggerExplosion = () => {
      if (explosionStarted) {
        return;
      }

      explosionStarted = true;
      explosionStartedAt = performance.now();
      const centerX = width / 2;
      const centerY = height / 2;

      particles.forEach((particle) => {
        particle.state = "explode";
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        const distance = Math.hypot(dx, dy) || 1;
        const multiplier = 2 + Math.random() * 3;
        particle.explodeVX = (dx / distance) * multiplier * 8;
        particle.explodeVY = (dy / distance) * multiplier * 8;
        particle.vx = particle.explodeVX;
        particle.vy = particle.explodeVY;
      });
    };

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      if ("touches" in event) {
        const touch = event.touches[0];
        if (!touch) return;
        mouseX = touch.clientX;
        mouseY = touch.clientY;
        return;
      }

      mouseX = event.clientX;
      mouseY = event.clientY;
    };

    const drawGlowParticle = (
      x: number,
      y: number,
      radius: number,
      color: string,
      alpha: number,
    ) => {
      const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
      glow.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
      glow.addColorStop(1, `${color}00`);
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = (now: number) => {
      rafId = window.requestAnimationFrame(animate);
      const delta = Math.min((now - lastTime) / 16.6667, 1.7);
      lastTime = now;

      const centerX = width / 2;
      const centerY = height / 2;
      const currentProgress = progressRef.current;
      const formProgress = smoothstep(60, 85, currentProgress);
      const lockProgress = smoothstep(85, 100, currentProgress);
      const chaosFade = 1 - lockProgress;
      const backgroundDim = smoothstep(85, 100, currentProgress);

      if (exitRef.current) {
        triggerExplosion();
      }

      smoothedMouseX = lerp(smoothedMouseX, mouseX, 0.045);
      smoothedMouseY = lerp(smoothedMouseY, mouseY, 0.045);

      const mouseOffsetX = (smoothedMouseX - centerX) * 0.06;
      const mouseOffsetY = (smoothedMouseY - centerY) * 0.06;
      const explosionProgress = explosionStarted
        ? clamp((now - explosionStartedAt) / 420, 0, 1)
        : 0;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = `rgba(2, 4, 9, ${0.08 + backgroundDim * 0.22})`;
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";

      particles.forEach((particle) => {
        if (particle.state !== "explode") {
          if (currentProgress < 60) {
            particle.state = "orbit";
          } else if (currentProgress < 85) {
            particle.state = "forming";
          } else {
            particle.state = "locked";
          }
        }

        if (particle.state === "orbit") {
          particle.orbitAngle += particle.orbitSpeed * delta * 10;

          const radiusWave =
            particle.orbitRadius +
            Math.sin(now * 0.0011 + particle.noiseOffset) * 16 +
            Math.cos(now * 0.0015 + particle.noiseOffset * 0.7) * 10;

          const orbitX =
            centerX +
            Math.cos(particle.orbitAngle) * radiusWave +
            mouseOffsetX * particle.depth;
          const orbitY =
            centerY +
            Math.sin(particle.orbitAngle * 1.17 + particle.noiseOffset) * radiusWave * 0.55 +
            mouseOffsetY * particle.depth;

          particle.vx += (orbitX - particle.x) * 0.08;
          particle.vy += (orbitY - particle.y) * 0.08;
          particle.vx *= 0.84;
          particle.vy *= 0.84;
        } else if (particle.state === "forming") {
          particle.orbitAngle += particle.orbitSpeed * delta * 4;

          const orbitRadius = particle.orbitRadius * (1 - formProgress * 0.55);
          const orbitX =
            centerX +
            Math.cos(particle.orbitAngle) * orbitRadius +
            mouseOffsetX * particle.depth * 0.45;
          const orbitY =
            centerY +
            Math.sin(particle.orbitAngle * 1.08 + particle.noiseOffset) * orbitRadius * 0.45 +
            mouseOffsetY * particle.depth * 0.45;

          const mixedTargetX = lerp(orbitX, particle.targetX, formProgress);
          const mixedTargetY = lerp(orbitY, particle.targetY, formProgress);

          particle.vx += (mixedTargetX - particle.x) * 0.08;
          particle.vy += (mixedTargetY - particle.y) * 0.08;
          particle.vx *= 0.86;
          particle.vy *= 0.86;
        } else if (particle.state === "locked") {
          particle.vx += (particle.targetX - particle.x) * 0.08;
          particle.vy += (particle.targetY - particle.y) * 0.08;
          particle.vx *= 0.72;
          particle.vy *= 0.72;
        } else {
          particle.vx *= 0.985;
          particle.vy *= 0.985;
        }

        particle.x += particle.vx * delta;
        particle.y += particle.vy * delta;

        const baseSize = particle.size * particle.depth;
        const finalSize =
          particle.state === "locked"
            ? baseSize * (1.08 + lockProgress * 0.32)
            : particle.state === "explode"
              ? baseSize * (1.1 + explosionProgress * 1.15)
              : baseSize;

        const alpha =
          particle.state === "explode"
            ? particle.alpha * (1 - explosionProgress)
            : particle.alpha * (0.8 + formProgress * 0.12 + lockProgress * 0.22);

        const glowRadius =
          particle.state === "locked"
            ? finalSize * (5.2 + lockProgress * 1.8)
            : particle.state === "explode"
              ? finalSize * (6.8 + explosionProgress * 2.4)
              : finalSize * (4.3 + chaosFade * 0.5);

        drawGlowParticle(
          particle.x,
          particle.y,
          glowRadius,
          particle.color,
          alpha * (particle.state === "locked" ? 0.34 : particle.state === "explode" ? 0.4 : 0.24),
        );

        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, finalSize, 0, Math.PI * 2);
        ctx.fill();
      });

      const coreGlowAlpha = explosionStarted
        ? 0.28 * (1 - explosionProgress)
        : 0.18 + lockProgress * 0.32;
      const coreRadius = explosionStarted
        ? Math.min(width, height) * (0.12 + explosionProgress * 0.16)
        : Math.min(width, height) * (0.11 + lockProgress * 0.04);

      const coreGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
      coreGlow.addColorStop(0, `rgba(255,255,255,${0.55 * coreGlowAlpha})`);
      coreGlow.addColorStop(0.18, `rgba(56,189,248,${0.75 * coreGlowAlpha})`);
      coreGlow.addColorStop(0.52, `rgba(139,92,246,${0.3 * coreGlowAlpha})`);
      coreGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = coreGlow;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
      ctx.fill();

      if (explosionStarted) {
        ctx.fillStyle = `rgba(255,255,255,${0.18 * (1 - explosionProgress)})`;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    };

    resize();
    rafId = window.requestAnimationFrame(animate);

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onPointerMove, { passive: true });
    window.addEventListener("touchmove", onPointerMove, { passive: true });

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("touchmove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0" aria-hidden="true" />;
};

export default LoaderEnergyCanvas;
