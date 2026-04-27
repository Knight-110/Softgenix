import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { cn } from "@/lib/utils";

interface FluidParticleSceneProps {
  className?: string;
}

const IDLE_POINTER = new THREE.Vector2(2.8, -2.8);

const POINTS_VERTEX_SHADER = `
  precision highp float;

  attribute float aPhase;
  attribute float aSeed;
  attribute float aShape;
  attribute float aLift;

  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec2 uPrevPointer;
  uniform vec2 uPointerVelocity;
  uniform vec2 uViewport;

  varying float vShape;
  varying float vAlpha;
  varying float vHighlight;

  void main() {
    vec3 pos = position;
    float t = uTime;

    float ambientA = sin((pos.x * 3.1) + (pos.y * 1.3) + t * 0.55 + aPhase) * 0.028;
    float ambientB = cos((pos.y * 4.2) - t * 0.38 + aSeed * 6.2831) * 0.022;
    float ambientC = sin((pos.x * 2.4 - pos.y * 3.6) + t * 0.46 + aSeed * 9.0) * 0.016;

    vec2 pointerTrail = mix(uPointer, uPrevPointer, 0.45);
    vec2 pointerToPoint = pos.xy - pointerTrail;
    float pointerDistance = length(pointerToPoint) + 0.0001;
    float pointerInfluence = exp(-pointerDistance * 3.9);
    float velocityStrength = clamp(length(uPointerVelocity), 0.0, 1.9);

    vec2 pointerDir = normalize(pointerToPoint);
    float ripple = sin(pointerDistance * 17.0 - t * (4.3 + velocityStrength * 1.7));
    float swirl = sin((pointerToPoint.x * 9.0) + (pointerToPoint.y * 7.0) - t * 1.7 + aPhase);

    vec2 displacement = pointerDir * ripple * pointerInfluence * (0.065 + velocityStrength * 0.05);
    displacement += vec2(-pointerDir.y, pointerDir.x) * swirl * pointerInfluence * (0.022 + velocityStrength * 0.016);

    float thermalLift = pow(aLift, 1.45) * (0.028 + 0.018 * aSeed);

    pos.x += ambientB * 0.55 + ambientC + displacement.x;
    pos.y += ambientA + displacement.y + thermalLift;
    pos.z += (ambientA + ambientB + ambientC) * 0.75 + pointerInfluence * ripple * 0.05;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    float densityFade = mix(0.36, 1.0, pow(aLift, 1.2));
    float pulse = 0.82 + 0.18 * sin(t * 0.72 + aPhase * 2.3);
    float interactionBoost = 1.0 + pointerInfluence * 1.4;
    float pixelRatioScale = clamp(uViewport.y / 900.0, 0.72, 1.36);
    float baseSize = mix(1.1, 2.8, aSeed) * densityFade * pulse * interactionBoost * pixelRatioScale;

    gl_PointSize = baseSize * (1.75 / max(0.55, -mvPosition.z));

    vShape = aShape;
    vAlpha = densityFade * (0.22 + 0.64 * pulse) * (0.66 + pointerInfluence * 0.5);
    vHighlight = pointerInfluence;
  }
`;

const POINTS_FRAGMENT_SHADER = `
  precision highp float;

  varying float vShape;
  varying float vAlpha;
  varying float vHighlight;

  void main() {
    vec2 p = gl_PointCoord * 2.0 - 1.0;

    float dotMask = 1.0 - smoothstep(0.42, 0.94, length(p));
    float squareMask = 1.0 - smoothstep(0.72, 1.0, max(abs(p.x), abs(p.y)));

    float barX = 1.0 - smoothstep(0.08, 0.24, abs(p.x));
    float barY = 1.0 - smoothstep(0.08, 0.24, abs(p.y));
    float crossMask = max(
      barX * (1.0 - smoothstep(0.38, 0.92, abs(p.y))),
      barY * (1.0 - smoothstep(0.38, 0.92, abs(p.x)))
    );

    vec2 q = vec2(p.x, p.y + 0.16);
    float triangleDistance = max(abs(q.x) * 0.866025 + q.y * 0.5, -q.y);
    float triangleMask = 1.0 - smoothstep(0.36, 0.62, triangleDistance);

    float selector = fract(vShape * 13.17);
    float glyph = dotMask;

    if (selector > 0.26 && selector <= 0.56) {
      glyph = squareMask;
    } else if (selector > 0.56 && selector <= 0.84) {
      glyph = crossMask;
    } else if (selector > 0.84) {
      glyph = triangleMask;
    }

    float alpha = glyph * vAlpha;
    if (alpha < 0.01) {
      discard;
    }

    vec3 color = mix(vec3(1.0), vec3(0.73, 0.92, 1.0), smoothstep(0.0, 1.0, vHighlight));
    gl_FragColor = vec4(color, alpha);
  }
`;

const FIELD_VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FIELD_FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform vec2 uPointer;
  uniform vec2 uPointerVelocity;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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

  void main() {
    vec2 uv = vUv;
    vec2 p = uv * 2.0 - 1.0;
    p.x *= 1.15;

    float t = uTime * 0.18;

    float driftA = sin((p.x * 4.8 + p.y * 1.9) + t * 4.0);
    float driftB = cos((p.y * 5.5 - p.x * 2.0) - t * 3.4);
    float n = noise(p * 3.2 + vec2(t * 0.65, -t * 0.35));
    float n2 = noise(p * 5.6 - vec2(t * 0.8, t * 0.2));
    float flow = driftA * 0.18 + driftB * 0.14 + (n - 0.5) * 0.4 + (n2 - 0.5) * 0.2;

    vec2 pointer = uPointer * vec2(0.75, 0.62);
    float d = length(p - pointer);
    float pointerRing = sin(d * 20.0 - uTime * 4.7) * exp(-d * 3.4);

    float velocityBoost = clamp(length(uPointerVelocity), 0.0, 1.2);
    float disturbance = pointerRing * (0.22 + velocityBoost * 0.34);

    float floorWeight = smoothstep(1.1, -0.55, p.y);
    float topFade = 1.0 - smoothstep(0.05, 0.95, uv.y);

    float luminance = (0.18 + flow * 0.5 + disturbance) * floorWeight * 0.8;

    vec3 deep = vec3(0.01, 0.05, 0.14);
    vec3 accent = vec3(0.06, 0.24, 0.44);
    vec3 color = mix(deep, accent, clamp(luminance + 0.28, 0.0, 1.0));

    float alpha = (0.24 + luminance * 0.55) * (0.35 + topFade * 0.65);
    gl_FragColor = vec4(color, clamp(alpha, 0.0, 0.55));
  }
`;

function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

function useIsMobileBreakpoint() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 768px)").matches;
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    setIsMobile(media.matches);
    media.addEventListener("change", onChange);

    return () => {
      media.removeEventListener("change", onChange);
    };
  }, []);

  return isMobile;
}

function ParticleField({ isMobile }: { isMobile: boolean }) {
  const pointsMaterialRef = useRef<THREE.ShaderMaterial | null>(null);
  const fieldMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  const pointerState = useRef({
    active: false,
    seeded: false,
    lastMove: 0,
    lastX: 0,
    lastY: 0,
    target: IDLE_POINTER.clone(),
    current: IDLE_POINTER.clone(),
    previous: IDLE_POINTER.clone(),
    velocityTarget: new THREE.Vector2(0, 0),
    velocity: new THREE.Vector2(0, 0),
  });

  useEffect(() => {
    const state = pointerState.current;

    const handlePointerMove = (event: PointerEvent) => {
      const nx = (event.clientX / window.innerWidth) * 2 - 1;
      const ny = -((event.clientY / window.innerHeight) * 2 - 1);

      const now = performance.now();
      if (!state.seeded) {
        state.lastX = nx;
        state.lastY = ny;
        state.lastMove = now;
        state.seeded = true;
      }

      const dt = Math.max((now - state.lastMove) / 1000, 1 / 120);
      const vx = (nx - state.lastX) / dt;
      const vy = (ny - state.lastY) / dt;

      state.target.set(nx * 1.04, ny * 0.98);
      state.velocityTarget.set(
        THREE.MathUtils.clamp(vx * 0.05, -2.5, 2.5),
        THREE.MathUtils.clamp(vy * 0.05, -2.5, 2.5),
      );

      state.lastX = nx;
      state.lastY = ny;
      state.lastMove = now;
      state.active = true;
    };

    const resetPointer = () => {
      state.active = false;
      state.velocityTarget.set(0, 0);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("pointerleave", resetPointer);
    window.addEventListener("blur", resetPointer);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerleave", resetPointer);
      window.removeEventListener("blur", resetPointer);
    };
  }, []);

  const particleGeometry = useMemo(() => {
    const columns = isMobile ? 90 : 140;
    const rows = isMobile ? 52 : 86;

    const spacingX = 2.42 / Math.max(1, columns - 1);
    const spacingY = 2.08 / Math.max(1, rows - 1);

    const positions: number[] = [];
    const phase: number[] = [];
    const seed: number[] = [];
    const shape: number[] = [];
    const lift: number[] = [];

    for (let row = 0; row < rows; row += 1) {
      const yNorm = row / Math.max(1, rows - 1);
      const density = THREE.MathUtils.lerp(0.92, 0.34, yNorm);

      for (let col = 0; col < columns; col += 1) {
        if (Math.random() > density) continue;

        const xNorm = col / Math.max(1, columns - 1);
        const jitterX = (Math.random() - 0.5) * spacingX * 0.38;
        const jitterY = (Math.random() - 0.5) * spacingY * 0.48;

        const x = (xNorm - 0.5) * 2.42 + jitterX;
        const y = (yNorm - 0.5) * 2.08 + jitterY - 0.08;

        positions.push(x, y, (Math.random() - 0.5) * 0.06);
        phase.push(Math.random() * Math.PI * 2);
        seed.push(Math.random());
        shape.push(Math.random());
        lift.push(1 - yNorm);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("aPhase", new THREE.Float32BufferAttribute(phase, 1));
    geometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
    geometry.setAttribute("aShape", new THREE.Float32BufferAttribute(shape, 1));
    geometry.setAttribute("aLift", new THREE.Float32BufferAttribute(lift, 1));
    geometry.computeBoundingSphere();

    return geometry;
  }, [isMobile]);

  useEffect(() => {
    return () => {
      particleGeometry.dispose();
    };
  }, [particleGeometry]);

  const pointsUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: IDLE_POINTER.clone() },
      uPrevPointer: { value: IDLE_POINTER.clone() },
      uPointerVelocity: { value: new THREE.Vector2(0, 0) },
      uViewport: { value: new THREE.Vector2(1, 1) },
    }),
    [],
  );

  const fieldUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: IDLE_POINTER.clone() },
      uPointerVelocity: { value: new THREE.Vector2(0, 0) },
    }),
    [],
  );

  useFrame((state, delta) => {
    const pointer = pointerState.current;
    const pointerTarget = pointer.active ? pointer.target : IDLE_POINTER;

    const pointerFollow = 1 - Math.exp(-delta * (pointer.active ? 8 : 2.6));
    const velocityFollow = 1 - Math.exp(-delta * 9);

    pointer.current.lerp(pointerTarget, pointerFollow);
    pointer.velocity.lerp(pointer.velocityTarget, velocityFollow);
    pointer.velocityTarget.multiplyScalar(pointer.active ? 0.92 : 0.84);

    if (pointsMaterialRef.current) {
      const uniforms = pointsMaterialRef.current.uniforms;
      uniforms.uTime.value += delta;
      uniforms.uPrevPointer.value.copy(pointer.previous);
      uniforms.uPointer.value.copy(pointer.current);
      uniforms.uPointerVelocity.value.copy(pointer.velocity);
      uniforms.uViewport.value.set(state.size.width, state.size.height);
    }

    if (fieldMaterialRef.current) {
      const uniforms = fieldMaterialRef.current.uniforms;
      uniforms.uTime.value += delta;
      uniforms.uPointer.value.copy(pointer.current);
      uniforms.uPointerVelocity.value.copy(pointer.velocity);
    }

    pointer.previous.copy(pointer.current);
  });

  return (
    <>
      <mesh position={[0, 0, -0.65]} scale={[4.6, 3.6, 1]} renderOrder={0}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <shaderMaterial
          ref={fieldMaterialRef}
          uniforms={fieldUniforms}
          vertexShader={FIELD_VERTEX_SHADER}
          fragmentShader={FIELD_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.NormalBlending}
        />
      </mesh>

      <points geometry={particleGeometry} frustumCulled={false} renderOrder={1}>
        <shaderMaterial
          ref={pointsMaterialRef}
          uniforms={pointsUniforms}
          vertexShader={POINTS_VERTEX_SHADER}
          fragmentShader={POINTS_FRAGMENT_SHADER}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={THREE.NormalBlending}
        />
      </points>
    </>
  );
}

const FluidParticleScene = ({ className }: FluidParticleSceneProps) => {
  const [webglReady, setWebglReady] = useState(true);
  const isMobile = useIsMobileBreakpoint();

  useEffect(() => {
    setWebglReady(supportsWebGL());
  }, []);

  if (!webglReady) {
    return (
      <div
        className={cn(
          "absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(84,174,255,0.22),transparent_42%),radial-gradient(circle_at_50%_78%,rgba(84,174,255,0.14),transparent_52%),linear-gradient(180deg,#020614_0%,#020915_52%,#01040d_100%)]",
          className,
        )}
        aria-hidden="true"
      />
    );
  }

  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)} aria-hidden="true">
      <Canvas
        dpr={isMobile ? [1, 1.35] : [1, 1.8]}
        camera={{ fov: 48, near: 0.1, far: 10, position: [0, 0, 2.45] }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#020614"), 0);
        }}
      >
        <ParticleField isMobile={isMobile} />
      </Canvas>
    </div>
  );
};

export default FluidParticleScene;
