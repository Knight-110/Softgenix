import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type PointerState = {
  x: number;
  y: number;
  active: boolean;
};

interface ParticleCanvasProps {
  pointer: PointerState;
  reduced?: boolean;
  className?: string;
}

type ShapeType = "circle" | "triangle" | "square" | "diamond";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  depth: number;
  seed: number;
  drift: number;
  shape: ShapeType;
  rotation: number;
  rotationSpeed: number;
};

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const fract = (v: number) => v - Math.floor(v);
const smoothstep = (t: number) => t * t * (3 - 2 * t);

const hash = (x: number, y: number) => fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);

const noise2D = (x: number, y: number) => {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;

  const a = hash(ix, iy);
  const b = hash(ix + 1, iy);
  const c = hash(ix, iy + 1);
  const d = hash(ix + 1, iy + 1);

  const ux = smoothstep(fx);
  const uy = smoothstep(fy);

  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
};

const fbm = (x: number, y: number) => {
  let value = 0;
  let amp = 0.5;
  let freq = 1;

  for (let i = 0; i < 4; i += 1) {
    value += noise2D(x * freq, y * freq) * amp;
    freq *= 2;
    amp *= 0.5;
  }

  return value;
};

const pickShape = (): ShapeType => {
  const r = Math.random();
  if (r < 0.45) return "circle";
  if (r < 0.68) return "triangle";
  if (r < 0.86) return "square";
  return "diamond";
};

const ParticleCanvas = ({ pointer, reduced = false, className }: ParticleCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const pointerRef = useRef(pointer);

  useEffect(() => {
    pointerRef.current = pointer;
  }, [pointer]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const coarseMedia = window.matchMedia("(pointer: coarse)");
    const isReduced = () => reduced || coarseMedia.matches;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];

    let fluidTop = 0;
    let fluidHeight = 0;
    let fluidBottom = 0;

    const smoothPointer = {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      energy: 0,
      ready: false,
    };

    const createParticle = (): Particle => {
      const depth = Math.random();

      return {
        x: Math.random() * width,
        y: fluidTop + Math.random() * fluidHeight,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        size: 1.8 + depth * 2.8 + Math.random() * 1.6,
        alpha: 0.52 + depth * 0.28 + Math.random() * 0.12,
        depth,
        seed: Math.random() * 1000,
        drift: (Math.random() - 0.5) * 2,
        shape: pickShape(),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
      };
    };

    const resetParticle = (p: Particle) => {
      const next = createParticle();
      p.x = next.x;
      p.y = next.y;
      p.vx = next.vx;
      p.vy = next.vy;
      p.size = next.size;
      p.alpha = next.alpha;
      p.depth = next.depth;
      p.seed = next.seed;
      p.drift = next.drift;
      p.shape = next.shape;
      p.rotation = next.rotation;
      p.rotationSpeed = next.rotationSpeed;
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      fluidTop = height * 0.46;
      fluidHeight = height * 0.44;
      fluidBottom = fluidTop + fluidHeight;

      const densityBase = isReduced() ? 180 : Math.floor((width * fluidHeight) / 1700);
      const count = clamp(densityBase, 220, 900);

      particles = Array.from({ length: count }, () => createParticle());
      smoothPointer.ready = false;
    };

    const updatePointer = () => {
      const p = pointerRef.current;
      const active = p.active && !isReduced();
      const targetEnergy = active ? 1 : 0;

      if (!smoothPointer.ready) {
        smoothPointer.x = p.x || width * 0.5;
        smoothPointer.y = p.y || height * 0.5;
        smoothPointer.vx = 0;
        smoothPointer.vy = 0;
        smoothPointer.energy = targetEnergy;
        smoothPointer.ready = true;
        return;
      }

      const nx = lerp(smoothPointer.x, p.x || smoothPointer.x, 0.16);
      const ny = lerp(smoothPointer.y, p.y || smoothPointer.y, 0.16);

      smoothPointer.vx = nx - smoothPointer.x;
      smoothPointer.vy = ny - smoothPointer.y;
      smoothPointer.x = nx;
      smoothPointer.y = ny;
      smoothPointer.energy = lerp(smoothPointer.energy, targetEnergy, 0.08);
    };

    const drawShape = (p: Particle, alpha: number) => {
      const size = p.size;
      const darkerFill = `rgba(210,225,240,${alpha * 0.9})`;
      const brightFill = `rgba(255,255,255,${alpha})`;

      // tighter glow so particles stay visible, not ghost-like
      const glowRadius = size * 1.15;
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
      grad.addColorStop(0, `rgba(255,255,255,${alpha * 0.16})`);
      grad.addColorStop(0.55, `rgba(180,210,235,${alpha * 0.08})`);
      grad.addColorStop(1, "rgba(180,210,235,0)");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      // dark base / bold body
      ctx.fillStyle = darkerFill;
      ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.65})`;
      ctx.lineWidth = Math.max(0.8, size * 0.16);

      if (p.shape === "circle") {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = brightFill;
        ctx.beginPath();
        ctx.arc(-size * 0.18, -size * 0.18, Math.max(0.5, size * 0.38), 0, Math.PI * 2);
        ctx.fill();
      }

      if (p.shape === "triangle") {
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.1);
        ctx.lineTo(size * 0.95, size * 0.85);
        ctx.lineTo(-size * 0.95, size * 0.85);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = brightFill;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.55);
        ctx.lineTo(size * 0.42, size * 0.25);
        ctx.lineTo(-size * 0.42, size * 0.25);
        ctx.closePath();
        ctx.fill();
      }

      if (p.shape === "square") {
        const side = size * 1.85;
        ctx.beginPath();
        ctx.rect(-side / 2, -side / 2, side, side);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = brightFill;
        const inner = side * 0.45;
        ctx.beginPath();
        ctx.rect(-inner / 2, -inner / 2, inner, inner);
        ctx.fill();
      }

      if (p.shape === "diamond") {
        ctx.beginPath();
        ctx.moveTo(0, -size * 1.15);
        ctx.lineTo(size * 0.95, 0);
        ctx.lineTo(0, size * 1.15);
        ctx.lineTo(-size * 0.95, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = brightFill;
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.52);
        ctx.lineTo(size * 0.42, 0);
        ctx.lineTo(0, size * 0.52);
        ctx.lineTo(-size * 0.42, 0);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    };

    const drawParticle = (p: Particle, t: number) => {
      const zoneT = clamp((p.y - fluidTop) / Math.max(1, fluidHeight), 0, 1);

      // much less fade so particles don't disappear like ghosts
      const zoneFade = 0.72 + smoothstep(zoneT) * 0.28;
      const flicker = 0.96 + Math.sin(t * 1.0 + p.seed * 0.3) * 0.04;
      const alpha = clamp(p.alpha * flicker * zoneFade, 0, 1);

      drawShape(p, alpha);
    };

    const render = (ms: number) => {
      const t = ms * 0.001;
      updatePointer();

      ctx.clearRect(0, 0, width, height);

      const bg = ctx.createRadialGradient(
        width * 0.5,
        height * 0.58,
        0,
        width * 0.5,
        height * 0.58,
        Math.max(width, height) * 0.72
      );
      bg.addColorStop(0, "rgba(90,160,220,0.025)");
      bg.addColorStop(0.45, "rgba(50,110,180,0.012)");
      bg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, width, height);

      const waterBand = ctx.createLinearGradient(0, fluidTop, 0, fluidBottom);
      waterBand.addColorStop(0, "rgba(100,160,220,0)");
      waterBand.addColorStop(0.25, "rgba(70,120,190,0.02)");
      waterBand.addColorStop(0.8, "rgba(40,80,150,0.035)");
      waterBand.addColorStop(1, "rgba(20,50,120,0.025)");
      ctx.fillStyle = waterBand;
      ctx.fillRect(0, fluidTop, width, fluidHeight);

      const pointerSpeed = Math.hypot(smoothPointer.vx, smoothPointer.vy);
      const radius = 290;
      const pointerForce = smoothPointer.energy * clamp(0.6 + pointerSpeed * 0.24, 0.6, 2.5);

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i];

        const nx = p.x * 0.0018 + p.seed * 0.0007;
        const ny = p.y * 0.0015 - t * 0.04;

        const n1 = fbm(nx + t * 0.02, ny - t * 0.015);
        const n2 = fbm(nx - t * 0.015, ny + t * 0.012);
        const angle = (n1 * 0.6 + n2 * 0.4) * Math.PI * 3.4;

        const flowX = Math.cos(angle) * (0.0025 + p.depth * 0.004)
        const flowY = Math.sin(angle) * (0.0025 + p.depth * 0.004)

        p.vx += flowX;
        p.vy += flowY;

        p.vx += Math.sin(t * 0.5 + p.seed) * 0.0013;
        p.vy += Math.cos(t * 0.4 + p.seed) * 0.001;
        p.vx += p.drift * 0.00045;

        const topPushZone = fluidTop + fluidHeight * 0.12;
        const bottomPushZone = fluidBottom - fluidHeight * 0.08;

        if (p.y < topPushZone) {
          const d = (topPushZone - p.y) / Math.max(1, fluidHeight * 0.12);
          p.vy += 0.018 * d;
        }

        if (p.y > bottomPushZone) {
          const d = (p.y - bottomPushZone) / Math.max(1, fluidHeight * 0.08);
          p.vy -= 0.018 * d;
        }

        if (pointerForce > 0.01) {
          const dx = p.x - smoothPointer.x;
          const dy = p.y - smoothPointer.y;
          const dist = Math.hypot(dx, dy);

          if (dist < radius) {
            const nd = dist / radius;
            const falloff = (1 - nd) * (1 - nd);

            const advectX = smoothPointer.vx * 0.36 * falloff;
            const advectY = smoothPointer.vy * 0.36 * falloff;

            const tx = -dy / (dist + 0.0001);
            const ty = dx / (dist + 0.0001);

            const swirlX = tx * 0.055 * falloff;
            const swirlY = ty * 0.055 * falloff;

            p.vx += advectX + swirlX;
            p.vy += advectY + swirlY;
          }
        }

        p.vx *= 0.976;
        p.vy *= 0.976;

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationSpeed * (0.6 + p.depth * 0.8);

        if (p.x < -60) p.x = width + 30;
        if (p.x > width + 60) p.x = -30;

        if (p.y < fluidTop - 45 || p.y > fluidBottom + 45) {
          resetParticle(p);
          continue;
        }

        drawParticle(p, t);
      }

      rafRef.current = window.requestAnimationFrame(render);
    };

    resize();
    rafRef.current = window.requestAnimationFrame(render);

    window.addEventListener("resize", resize, { passive: true });
    coarseMedia.addEventListener("change", resize);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      coarseMedia.removeEventListener("change", resize);
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className={cn("h-full w-full", className)} aria-hidden="true" />;
};

export default ParticleCanvas;