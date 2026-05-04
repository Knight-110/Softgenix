import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";
import "./GradientBlinds.css";

const MAX_COLORS = 8;

type GradientBlindsProps = {
  className?: string;
  dpr?: number;
  paused?: boolean;
  gradientColors?: string[];
  angle?: number;
  noise?: number;
  blindCount?: number;
  blindMinWidth?: number;
  mouseDampening?: number;
  mirrorGradient?: boolean;
  spotlightRadius?: number;
  spotlightSoftness?: number;
  spotlightOpacity?: number;
  distortAmount?: number;
  shineDirection?: "left" | "right";
  mixBlendMode?: React.CSSProperties["mixBlendMode"];
};

type OglUniformValue = number | number[];
type OglUniform = { value: OglUniformValue };
type UniformMap = Record<string, OglUniform>;

const hexToRgb = (hex: string) => {
  const color = hex.replace("#", "").padEnd(6, "0");

  return [
    parseInt(color.slice(0, 2), 16) / 255,
    parseInt(color.slice(2, 4), 16) / 255,
    parseInt(color.slice(4, 6), 16) / 255,
  ];
};

const prepareStops = (stops?: string[]) => {
  const baseStops = (stops?.length ? stops : ["#FF9FFC", "#5227FF"]).slice(
    0,
    MAX_COLORS
  );

  if (baseStops.length === 1) {
    baseStops.push(baseStops[0]);
  }

  while (baseStops.length < MAX_COLORS) {
    baseStops.push(baseStops[baseStops.length - 1]);
  }

  return {
    colors: baseStops.map(hexToRgb),
    count: Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2)),
  };
};

const callIfFn = <T extends object>(value: T | null, key: keyof T) => {
  if (value && typeof value[key] === "function") {
    (value[key] as () => void).call(value);
  }
};

const GradientBlinds = ({
  className,
  dpr,
  paused = false,
  gradientColors,
  angle = 0,
  noise = 0.3,
  blindCount = 16,
  blindMinWidth = 60,
  mouseDampening = 0.15,
  mirrorGradient = false,
  spotlightRadius = 0.5,
  spotlightSoftness = 1,
  spotlightOpacity = 1,
  distortAmount = 0,
  shineDirection = "left",
  mixBlendMode = "lighten",
}: GradientBlindsProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const programRef = useRef<Program | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const geometryRef = useRef<Triangle | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const mouseTargetRef = useRef<[number, number]>([0, 0]);
  const lastTimeRef = useRef(0);
  const firstResizeRef = useRef(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({
      dpr:
        dpr ??
        (typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
      alpha: true,
      antialias: true,
    });

    rendererRef.current = renderer;

    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    canvas.style.pointerEvents = "auto";

    container.appendChild(canvas);

    const vertex = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

    const fragment = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3  iResolution;
uniform vec2  iMouse;
uniform float iTime;

uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3  uColor0;
uniform vec3  uColor1;
uniform vec3  uColor2;
uniform vec3  uColor3;
uniform vec3  uColor4;
uniform vec3  uColor5;
uniform vec3  uColor6;
uniform vec3  uColor7;
uniform int   uColorCount;

varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;

  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);

  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);

  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;

  return uColor1;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv0 = fragCoord.xy / iResolution.xy;

  float aspect = iResolution.x / iResolution.y;

  vec2 p = uv0 * 2.0 - 1.0;
  p.x *= aspect;

  vec2 pr = rotate2D(p, uAngle);
  pr.x /= aspect;

  vec2 uv = pr * 0.5 + 0.5;

  vec2 uvMod = uv;

  if (uDistort > 0.0) {
    float a = uvMod.y * 6.0;
    float b = uvMod.x * 6.0;
    float w = 0.01 * uDistort;

    uvMod.x += sin(a) * w;
    uvMod.y += cos(b) * w;
  }

  float t = uvMod.x;

  if (uMirror > 0.5) {
    t = 1.0 - abs(1.0 - 2.0 * fract(t));
  }

  vec3 base = getGradientColor(t);

  vec2 offset = vec2(iMouse.x / iResolution.x, iMouse.y / iResolution.y);
  float d = length(uv0 - offset);

  float r = max(uSpotlightRadius, 0.0001);
  float dn = d / r;

  float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
  vec3 cir = vec3(spot);

  float stripe = fract(uvMod.x * max(uBlindCount, 1.0));

  if (uShineFlip > 0.5) {
    stripe = 1.0 - stripe;
  }

  vec3 ran = vec3(stripe);
  vec3 col = cir + base - ran;

  col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

    const { colors, count } = prepareStops(gradientColors);

    const uniforms: UniformMap = {
      iResolution: {
        value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1],
      },
      iMouse: {
        value: [0, 0],
      },
      iTime: {
        value: 0,
      },
      uAngle: {
        value: (angle * Math.PI) / 180,
      },
      uNoise: {
        value: noise,
      },
      uBlindCount: {
        value: Math.max(1, blindCount),
      },
      uSpotlightRadius: {
        value: spotlightRadius,
      },
      uSpotlightSoftness: {
        value: spotlightSoftness,
      },
      uSpotlightOpacity: {
        value: spotlightOpacity,
      },
      uMirror: {
        value: mirrorGradient ? 1 : 0,
      },
      uDistort: {
        value: distortAmount,
      },
      uShineFlip: {
        value: shineDirection === "right" ? 1 : 0,
      },
      uColor0: { value: colors[0] },
      uColor1: { value: colors[1] },
      uColor2: { value: colors[2] },
      uColor3: { value: colors[3] },
      uColor4: { value: colors[4] },
      uColor5: { value: colors[5] },
      uColor6: { value: colors[6] },
      uColor7: { value: colors[7] },
      uColorCount: {
        value: count,
      },
    };

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms,
    });

    programRef.current = program;

    const geometry = new Triangle(gl);
    geometryRef.current = geometry;

    const mesh = new Mesh(gl, {
      geometry,
      program,
    });

    meshRef.current = mesh;

    const resize = () => {
      const rect = container.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      renderer.setSize(rect.width, rect.height);

      uniforms.iResolution.value = [
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
        1,
      ];

      if (blindMinWidth > 0) {
        const maxByMinWidth = Math.max(
          1,
          Math.floor(rect.width / blindMinWidth)
        );

        uniforms.uBlindCount.value = Math.max(
          1,
          Math.min(blindCount, maxByMinWidth)
        );
      } else {
        uniforms.uBlindCount.value = Math.max(1, blindCount);
      }

      if (firstResizeRef.current) {
        firstResizeRef.current = false;

        const centerX = gl.drawingBufferWidth / 2;
        const centerY = gl.drawingBufferHeight / 2;

        uniforms.iMouse.value = [centerX, centerY];
        mouseTargetRef.current = [centerX, centerY];
      }
    };

    resize();

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();

      if (!rect.width || !rect.height) return;

      const scaleX = gl.drawingBufferWidth / rect.width;
      const scaleY = gl.drawingBufferHeight / rect.height;

      const nextX = (event.clientX - rect.left) * scaleX;
      const nextY = (rect.height - (event.clientY - rect.top)) * scaleY;

      mouseTargetRef.current = [nextX, nextY];

      if (mouseDampening <= 0) {
        uniforms.iMouse.value = [nextX, nextY];
      }
    };

    window.addEventListener("pointermove", onPointerMove, {
      passive: true,
    });

    const loop = (time: number) => {
      rafRef.current = window.requestAnimationFrame(loop);
      uniforms.iTime.value = time * 0.001;

      if (mouseDampening > 0) {
        if (!lastTimeRef.current) {
          lastTimeRef.current = time;
        }

        const dt = (time - lastTimeRef.current) / 1000;
        lastTimeRef.current = time;

        const factor = Math.min(
          1,
          1 - Math.exp(-dt / Math.max(0.0001, mouseDampening))
        );

        const [targetX, targetY] = mouseTargetRef.current;
        const current = uniforms.iMouse.value as number[];

        current[0] += (targetX - current[0]) * factor;
        current[1] += (targetY - current[1]) * factor;
      } else {
        lastTimeRef.current = time;
      }

      if (!paused && meshRef.current) {
        renderer.render({
          scene: meshRef.current,
        });
      }
    };

    rafRef.current = window.requestAnimationFrame(loop);

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }

      window.removeEventListener("pointermove", onPointerMove);
      resizeObserver.disconnect();

      if (canvas.parentElement === container) {
        container.removeChild(canvas);
      }

      callIfFn(programRef.current, "remove");
      callIfFn(geometryRef.current, "remove");
      callIfFn(meshRef.current, "remove");
      callIfFn(rendererRef.current, "destroy");

      programRef.current = null;
      geometryRef.current = null;
      meshRef.current = null;
      rendererRef.current = null;
      rafRef.current = null;
      lastTimeRef.current = 0;
      firstResizeRef.current = true;
    };
  }, [
    angle,
    blindCount,
    blindMinWidth,
    distortAmount,
    dpr,
    gradientColors,
    mirrorGradient,
    mouseDampening,
    noise,
    paused,
    shineDirection,
    spotlightOpacity,
    spotlightRadius,
    spotlightSoftness,
  ]);

  return (
    <div
      ref={containerRef}
      className={`gradient-blinds-container ${className ?? ""}`.trim()}
      style={mixBlendMode ? { mixBlendMode } : undefined}
    />
  );
};

export default GradientBlinds;