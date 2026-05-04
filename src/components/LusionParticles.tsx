import { useEffect, useRef } from "react";

type Shape = "circle" | "square" | "triangle" | "cross";

type Particle = {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  shape: Shape;
  rotation: number;
  rotationVelocity: number;
  phase: number;
  waveSpeed: number;
  mass: number;
  response: number;
};

const SHAPES: Shape[] = ["circle", "square", "triangle", "cross"];

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const drawParticle = (
  ctx: CanvasRenderingContext2D,
  p: Particle,
  x: number,
  y: number,
) => {
  const half = p.size / 2;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(p.rotation);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = Math.max(1.3, p.size * 0.18);
  ctx.lineCap = "round";

  if (p.shape === "circle") {
    ctx.beginPath();
    ctx.arc(0, 0, half, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.shape === "square") {
    ctx.fillRect(-half, -half, p.size, p.size);
  } else if (p.shape === "triangle") {
    ctx.beginPath();
    ctx.moveTo(0, -half);
    ctx.lineTo(half, half);
    ctx.lineTo(-half, half);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.moveTo(-half, 0);
    ctx.lineTo(half, 0);
    ctx.moveTo(0, -half);
    ctx.lineTo(0, half);
    ctx.stroke();
  }

  ctx.restore();
};

const LusionParticles = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let particles: Particle[] = [];
    let raf = 0;
    let time = 0;

    let mouseX = -9999;
    let mouseY = -9999;
    let prevMouseX = -9999;
    let prevMouseY = -9999;
    let mouseSpeed = 0;
    let lastMove = 0;

    const getCount = () => {
      if (width < 640) return 900;
      if (width < 1024) return 1300;
      return 1900;
    };

    const createParticles = () => {
      const count = getCount();
      const top = height * 0.5;
      const areaH = height * 0.5;

      const cols = Math.ceil(Math.sqrt(count * (width / areaH)));
      const rows = Math.ceil(count / cols);
      const cellW = width / cols;
      const cellH = areaH / rows;

      const arr: Particle[] = [];

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (arr.length >= count) break;

          const rowProgress = r / Math.max(rows - 1, 1);
          const depth = rowProgress;
          const bottomWeight = rowProgress;

          const wave =
            Math.sin((c / cols) * Math.PI * 2.2 + r * 0.28) * 18 +
            Math.sin((c / cols) * Math.PI * 5.2) * 8;

          const baseX =
            c * cellW + cellW * 0.5 + rand(-cellW * 0.25, cellW * 0.25);

          const baseY =
            top +
            depth * areaH +
            wave * (1 - bottomWeight * 0.95) +
            rand(-cellH * 0.08, cellH * 0.08);

          const mass = rand(0.65, 1.7);

          arr.push({
            x: baseX,
            y: clamp(baseY, top, height - 1),
            baseX,
            baseY: clamp(baseY, top, height - 1),
            vx: 0,
            vy: 0,
            size: rand(5.5, 13),
            opacity: rand(0.78, 1),
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            rotation: rand(0, Math.PI * 2),
            rotationVelocity: 0,
            phase: rand(0, Math.PI * 2),
            waveSpeed: rand(0.7, 1.25),
            mass,
            response: clamp(1 / mass, 0.62, 1.45),
          });
        }
      }

      return arr;
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = createParticles();
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (prevMouseX > -9000 && prevMouseY > -9000) {
        const mouseVX = mouseX - prevMouseX;
        const mouseVY = mouseY - prevMouseY;
        mouseSpeed = Math.hypot(mouseVX, mouseVY);
      } else {
        mouseSpeed = 0;
      }

      prevMouseX = mouseX;
      prevMouseY = mouseY;
      lastMove = performance.now();
    };

    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
      prevMouseX = -9999;
      prevMouseY = -9999;
      mouseSpeed = 0;
      lastMove = 0;
    };

    const animate = () => {
      raf = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, width, height);

      const now = performance.now();
      const timeSinceMove = now - lastMove;

      const mouseActive = timeSinceMove < 220;
      const releasePhase = timeSinceMove >= 220 && timeSinceMove < 900;

      time += 0.018;

      const radius = clamp(Math.min(width, height) * 0.095, 72, 96);

      for (const p of particles) {
        const dxBase = p.baseX - p.x;
        const dyBase = p.baseY - p.y;

        if (mouseActive) {
          const dx = p.x - mouseX;
          const dy = p.y - mouseY;
          const dist = Math.hypot(dx, dy) || 0.001;

          if (dist < radius) {
            const force = Math.pow(1 - dist / radius, 2);
            const speedBoost = clamp(mouseSpeed / 22, 0.85, 3.6);

            const nx = dx / dist;
            const ny = dy / dist;

            const swirlX = -ny;
            const swirlY = nx;
            const response = p.response;

            p.vx += nx * force * 6.8 * speedBoost * response;
            p.vy += ny * force * 4.6 * speedBoost * response;

            // Strong small circular curl only.
            p.vx += swirlX * force * 18.5 * speedBoost * response;
            p.vy += swirlY * force * 18.5 * speedBoost * response;

            p.vy -= force * 3.7 * speedBoost * response;

            p.rotationVelocity +=
              force * rand(-0.1, 0.1) * speedBoost * response;
          }

          p.vx += dxBase * 0.0025 * p.response;
          p.vy += dyBase * 0.0025 * p.response;

          p.vx *= 0.968;
          p.vy *= 0.968;
          p.rotationVelocity *= 0.965;
        } else if (releasePhase) {
          const releaseProgress = (timeSinceMove - 220) / 680;
          const spring = 0.003 + releaseProgress * 0.009;
          const damping = 0.975 - releaseProgress * 0.025;

          p.vx += dxBase * spring * p.response;
          p.vy += dyBase * spring * p.response;

          if (p.y < p.baseY) {
            p.vy += 0.008 + releaseProgress * 0.018;
          }

          p.vx *= damping;
          p.vy *= damping;
          p.rotationVelocity *= 0.955;
        } else {
          p.vx += dxBase * 0.017 * p.response;
          p.vy += dyBase * 0.017 * p.response;

          if (p.y < p.baseY) p.vy += 0.026;

          p.vx *= 0.925;
          p.vy *= 0.925;
          p.rotationVelocity *= 0.9;

          if (
            Math.abs(dxBase) < 0.3 &&
            Math.abs(dyBase) < 0.3 &&
            Math.abs(p.vx) < 0.035 &&
            Math.abs(p.vy) < 0.035
          ) {
            p.x = p.baseX;
            p.y = p.baseY;
            p.vx = 0;
            p.vy = 0;
            p.rotationVelocity = 0;
          }
        }

        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotationVelocity;

        if (p.x < -30) {
          p.x = -30;
          p.vx *= -0.22;
        }

        if (p.x > width + 30) {
          p.x = width + 30;
          p.vx *= -0.22;
        }

        if (p.y < -30) {
          p.y = -30;
          p.vy *= -0.18;
        }

        if (p.y > height + 30) {
          p.y = height + 30;
          p.vy *= -0.18;
        }

        const surfacePower = clamp(
          1 - (p.baseY - height * 0.5) / (height * 0.5),
          0,
          1,
        );

        const waveX =
          Math.sin(time * p.waveSpeed + p.phase + p.baseY * 0.006) *
          (1.3 + surfacePower * 1.9);

        const waveY =
          Math.cos(time * p.waveSpeed * 0.9 + p.phase + p.baseX * 0.004) *
          (0.7 + surfacePower * 1.3);

        drawParticle(ctx, p, p.x + waveX, p.y + waveY);
      }
    };

    resize();
    animate();

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden="true"
    />
  );
};

export default LusionParticles;