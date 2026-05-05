import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle, Vec2 } from "ogl";

const vertexShader = `
  attribute vec2 uv;
  attribute vec2 position;

  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uPointer;
  uniform float uEnergy;
  uniform vec2 uShockOrigin;
  uniform float uShockTime;

  varying vec2 vUv;

  mat2 rotate2d(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat2(c, -s, s, c);
  }

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 345.45));
    p += dot(p, p + 34.345);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);

    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    vec2 u = f * f * (3.0 - 2.0 * f);

    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rotate2d(0.55) * p * 2.03 + vec2(11.4, 7.8);
      amplitude *= 0.52;
    }

    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec2 centered = uv - 0.5;
    centered.x *= uResolution.x / max(uResolution.y, 1.0);

    vec2 pointer = (uPointer - 0.5) * vec2(1.2, -0.9);
    float time = uTime * 0.08;
    vec2 shockOrigin = uShockOrigin;

    vec2 flow = centered * 1.55;
    flow += pointer * 0.22;

    float dist = distance(centered, shockOrigin);
    float shock = sin(dist * 40.0 - uShockTime * 6.0);
    shock *= exp(-dist * 6.0);
    shock = max(shock, 0.0);
    flow += shock * 0.15;

    float primaryField = fbm(flow * 1.7 + vec2(time, -time * 0.7));
    float secondaryField = fbm(flow * 2.6 - vec2(time * 0.45, time * 0.9));
    float bg = fbm(flow * 0.5 + vec2(uTime * 0.2));

    vec2 warped = flow;
    warped += 0.22 * vec2(
      fbm(flow * 1.9 + vec2(0.0, time * 1.1)),
      fbm(flow * 1.9 + vec2(time * 1.2, 0.0))
    );

    float filaments = fbm(warped * 3.7 + vec2(primaryField - time, secondaryField + time));
    float ribbons = 1.0 - abs(primaryField - secondaryField);
    ribbons = smoothstep(0.18, 0.88, ribbons);
    filaments = smoothstep(0.42, 0.92, filaments);

    float energyField = ribbons * 0.62 + filaments * 0.26;
    float halo = smoothstep(1.05, 0.14, length(centered + pointer * 0.08));
    float coreDist = length(centered + pointer * 0.2);
    float core = smoothstep(0.25, 0.0, coreDist);
    float pulse = uEnergy * 0.16 * halo;
    float glow = smoothstep(0.5, 0.0, coreDist);
    float grain = (hash(gl_FragCoord.xy + uTime) - 0.5) * 0.035;

    vec3 base = vec3(0.002, 0.004, 0.02);
    vec3 bgColor = vec3(0.002, 0.006, 0.02);
    vec3 deepBlue = vec3(0.02, 0.09, 0.18);
    vec3 sky = vec3(0.22, 0.74, 0.97);
    vec3 cyan = vec3(0.13, 0.83, 0.93);
    vec3 coreColor = vec3(0.2, 0.8, 1.0);

    vec3 color = base;
    color = mix(bgColor, color, 0.75 + bg * 0.25);
    color += deepBlue * (0.35 + primaryField * 0.18) * halo;
    color += sky * energyField * halo * 0.42;
    color += cyan * pow(max(energyField + pulse, 0.0), 2.2) * 0.24;
    color += coreColor * pow(core, 3.0) * 0.8;
    color += coreColor * glow * 0.3;
    color += sky * core * 0.65;
    color += cyan * pow(core, 2.5) * 0.4;
    color += vec3(shock) * 0.1;
    color += grain;

    float vignette = smoothstep(1.28, 0.22, length(centered));
    color *= vignette;
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const CTAFluidBackground = () => {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const target = new Vec2(0.5, 0.5);
    const pointer = new Vec2(0.5, 0.5);
    const shockOrigin = new Vec2(0, 0);
    const resolution = new Vec2(1, 1);
    const overlayTarget = host.parentElement ?? host;

    let frameId = 0;
    let visible = true;
    let disposed = false;
    let energy = 0;
    let shockStartTime = -1;
    let renderer: Renderer | null = null;
    let mesh: Mesh | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;

    try {
      renderer = new Renderer({
        alpha: true,
        antialias: false,
        dpr,
        powerPreference: "high-performance",
      });
    } catch (error) {
      console.warn("CTA fluid background initialization failed:", error);
      return;
    }

    const gl = renderer.gl;
    gl.canvas.className = "absolute inset-0 h-full w-full";
    gl.canvas.setAttribute("aria-hidden", "true");
    gl.clearColor(0.008, 0.016, 0.05, 1);
    host.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: resolution },
        uPointer: { value: pointer },
        uEnergy: { value: 0 },
        uShockOrigin: { value: shockOrigin },
        uShockTime: { value: 1000 },
      },
    });

    mesh = new Mesh(gl, { geometry, program });

    const renderFrame = (time: number) => {
      frameId = 0;

      if (disposed || !renderer || !mesh) {
        return;
      }

      pointer.x += (target.x - pointer.x) * 0.06;
      pointer.y += (target.y - pointer.y) * 0.06;
      energy += (0 - energy) * 0.04;

      const currentTime = time * 0.001;
      program.uniforms.uTime.value = currentTime;
      program.uniforms.uEnergy.value = energy;
      program.uniforms.uShockTime.value =
        shockStartTime >= 0 ? currentTime - shockStartTime : 1000;

      renderer.render({ scene: mesh });

      if (visible && !prefersReducedMotion) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const queueFrame = () => {
      if (!frameId) {
        frameId = window.requestAnimationFrame(renderFrame);
      }
    };

    const resize = () => {
      if (!renderer || disposed) {
        return;
      }

      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height);
      resolution.set(gl.canvas.width, gl.canvas.height);
      program.uniforms.uResolution.value = resolution;
      queueFrame();
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = overlayTarget.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        return;
      }

      const nextX = (event.clientX - rect.left) / rect.width;
      const nextY = (event.clientY - rect.top) / rect.height;
      const clampedX = Math.min(Math.max(nextX, 0), 1);
      const clampedY = Math.min(Math.max(nextY, 0), 1);

      energy = Math.min(1, energy + 0.18);
      target.set(clampedX, clampedY);
      shockOrigin.set(clampedX - 0.5, 0.5 - clampedY);
      shockStartTime = performance.now() * 0.001;
      program.uniforms.uShockOrigin.value = shockOrigin;
      program.uniforms.uShockTime.value = 0;
      queueFrame();
    };

    const resetPointer = () => {
      target.set(0.5, 0.5);
      queueFrame();
    };

    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);

        if (visible) {
          queueFrame();
          return;
        }

        if (frameId) {
          window.cancelAnimationFrame(frameId);
          frameId = 0;
        }
      },
      { threshold: 0.08 }
    );
    intersectionObserver.observe(host);

    overlayTarget.addEventListener("pointermove", updatePointer, { passive: true });
    overlayTarget.addEventListener("pointerleave", resetPointer, { passive: true });

    resize();
    queueFrame();

    return () => {
      disposed = true;

      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      overlayTarget.removeEventListener("pointermove", updatePointer);
      overlayTarget.removeEventListener("pointerleave", resetPointer);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();

      geometry.remove();
      program.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      gl.canvas.remove();
    };
  }, []);

  return <div ref={hostRef} className="pointer-events-none absolute inset-0 z-0" aria-hidden="true" />;
};

export default CTAFluidBackground;
