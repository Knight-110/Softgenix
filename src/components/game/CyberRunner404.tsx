import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import softgenixLogo from "@/assets/softgenix-logo.jpeg";

type OrbParticle = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  hue: number;
  vx: number;
  vy: number;
};

type Star = {
  x: number;
  y: number;
  size: number;
  alpha: number;
  speed: number;
  depth: number;
};

type FogBand = {
  x: number;
  y: number;
  width: number;
  height: number;
  alpha: number;
  drift: number;
  hue: "cyan" | "magenta" | "blue";
};

type SpeedLine = {
  x: number;
  y: number;
  length: number;
  alpha: number;
  speed: number;
  width: number;
};

type Obstacle = {
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
  rotation: number;
  spin: number;
  glow: number;
  warning: number;
  trail: number;
  kind: "shard" | "cube" | "fragment";
};

type Player = {
  x: number;
  y: number;
  radius: number;
  vy: number;
  pulse: number;
  dash: number;
  tilt: number;
  breathe: number;
  rotation: number;
  distortion: number;
  squishX: number;
  squishY: number;
};

type GameState = {
  width: number;
  height: number;
  horizonY: number;
  groundY: number;
  intro: number;
  score: number;
  speed: number;
  obstacleTimer: number;
  slowMo: number;
  gameOver: boolean;
  running: boolean;
  shakeUntil: number;
  deathAt: number;
  lastFrame: number;
  lastUiScore: number;
  lastUiPushAt: number;
  player: Player;
  obstacles: Obstacle[];
  starsBack: Star[];
  starsMid: Star[];
  foreground: OrbParticle[];
  trail: OrbParticle[];
  fogBands: FogBand[];
  speedLines: SpeedLine[];
  explosions: OrbParticle[];
};

type PerformanceProfile = {
  dprCap: number;
  starsBack: number;
  starsMid: number;
  fogBands: number;
  trailBurst: number;
  trailMax: number;
  foregroundMax: number;
  foregroundSpawnChance: number;
  speedLineMax: number;
  speedLineSpawnChance: number;
  explosionCount: number;
  obstacleMax: number;
  reducedMotion: boolean;
  mobile: boolean;
};

const BEST_SCORE_KEY = "softgenix-cyber-runner-best-score";
const BASE_HEIGHT = 780;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const easeOut = (t: number) => 1 - (1 - t) * (1 - t);

const makeStars = (width: number, height: number, density: number, topRatio = 0.82): Star[] =>
  Array.from({ length: density }, () => ({
    x: Math.random() * width,
    y: Math.random() * height * topRatio,
    size: Math.random() * 1.8 + 0.5,
    alpha: Math.random() * 0.7 + 0.12,
    speed: Math.random() * 20 + 8,
    depth: Math.random() * 0.8 + 0.3,
  }));

const makeFogBands = (width: number, height: number, count: number): FogBand[] =>
  Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: height * (0.16 + index * 0.11),
    width: width * (0.16 + Math.random() * 0.16),
    height: 36 + Math.random() * 52,
    alpha: 0.025 + Math.random() * 0.03,
    drift: (Math.random() * 16 + 8) * (index % 2 === 0 ? 1 : -1),
    hue: index % 3 === 0 ? "cyan" : index % 3 === 1 ? "blue" : "magenta",
  }));

const makeGameState = (width: number, height: number, profile: PerformanceProfile): GameState => {
  const radius = clamp(width * 0.026, 24, 34);
  const groundY = height * 0.785;
  const horizonY = height * 0.5;

  return {
    width,
    height,
    horizonY,
    groundY,
    intro: 0,
    score: 0,
    speed: Math.max(290, width * 0.23),
    obstacleTimer: 1.8,
    slowMo: 1,
    gameOver: false,
    running: true,
    shakeUntil: 0,
    deathAt: 0,
    lastFrame: 0,
    lastUiScore: 0,
    lastUiPushAt: 0,
    player: {
      x: width * 0.18,
      y: groundY - radius,
      radius,
      vy: 0,
      pulse: 0,
      dash: 0,
      tilt: 0,
      breathe: 0,
      rotation: 0,
      distortion: 0,
      squishX: 1,
      squishY: 1,
    },
    obstacles: [],
    starsBack: makeStars(width, height, profile.starsBack, 0.62),
    starsMid: makeStars(width, height, profile.starsMid, 0.8),
    foreground: [],
    trail: [],
    fogBands: makeFogBands(width, height, profile.fogBands),
    speedLines: [],
    explosions: [],
  };
};

const playTone = (
  audioContextRef: React.MutableRefObject<AudioContext | null>,
  type: OscillatorType,
  frequency: number,
  duration: number,
  volume: number,
  glide?: number,
) => {
  try {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioCtx) {
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }

    const context = audioContextRef.current;

    if (context.state === "suspended") {
      void context.resume();
    }

    const now = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);

    if (glide) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, glide), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + duration + 0.02);
  } catch {
    // Intentionally silent to avoid runtime audio errors.
  }
};

const CyberRunner404 = () => {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const renderRef = useRef<((timestamp: number) => void) | null>(null);
  const hiddenRef = useRef(false);
  const bestScoreRef = useRef(0);
  const scoreRef = useRef(0);
  const gameRef = useRef<GameState | null>(null);
  const pointerLockRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const logoReadyRef = useRef(false);
  const uiTimeoutRef = useRef<number | null>(null);
  const introTimeoutRef = useRef<number | null>(null);

  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [shake, setShake] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [muted, setMuted] = useState(true);

  const profile = useMemo<PerformanceProfile>(
    () => ({
      dprCap: isMobile ? 1 : 1.25,
      starsBack: prefersReducedMotion ? 16 : isMobile ? 18 : 28,
      starsMid: prefersReducedMotion ? 8 : isMobile ? 10 : 14,
      fogBands: prefersReducedMotion ? 3 : isMobile ? 4 : 5,
      trailBurst: prefersReducedMotion ? 4 : isMobile ? 5 : 7,
      trailMax: 40,
      foregroundMax: 30,
      foregroundSpawnChance: prefersReducedMotion ? 0.035 : isMobile ? 0.06 : 0.11,
      speedLineMax: 24,
      speedLineSpawnChance: prefersReducedMotion ? 0 : isMobile ? 0.06 : 0.18,
      explosionCount: prefersReducedMotion ? 12 : isMobile ? 16 : 28,
      obstacleMax: 5,
      reducedMotion: !!prefersReducedMotion,
      mobile: isMobile,
    }),
    [isMobile, prefersReducedMotion],
  );

  const scoreProgress = useMemo(() => Math.min(1, score / 180), [score]);

  const syncScore = useCallback((value: number) => {
    scoreRef.current = value;
    setScore(value);
  }, []);

  const safePlay = useCallback(
    (kind: "jump" | "impact" | "dash" | "ambient") => {
      if (muted || profile.mobile) {
        return;
      }

      if (kind === "jump") {
        playTone(audioContextRef, "triangle", 340, 0.14, 0.015, 560);
      }

      if (kind === "dash") {
        playTone(audioContextRef, "sawtooth", 190, 0.12, 0.012, 460);
      }

      if (kind === "impact") {
        playTone(audioContextRef, "square", 84, 0.26, 0.022, 34);
      }

      if (kind === "ambient") {
        playTone(audioContextRef, "sine", 92, 1.1, 0.0018, 86);
      }
    },
    [muted, profile.mobile],
  );

  const resizeStage = useCallback(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;

    if (!stage || !canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    const width = Math.max(window.innerWidth, stage.clientWidth, 360);
    const height = Math.max(window.innerHeight, stage.clientHeight, BASE_HEIGHT);
    const dpr = clamp(window.devicePixelRatio || 1, 1, profile.dprCap);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    const existing = gameRef.current;

    if (!existing) {
      gameRef.current = makeGameState(width, height, profile);
      return;
    }

    const grounded = existing.player.y >= existing.groundY - existing.player.radius - 2;
    const radius = clamp(width * 0.026, 24, 34);

    existing.width = width;
    existing.height = height;
    existing.groundY = height * 0.785;
    existing.horizonY = height * 0.5;
    existing.player.x = width * 0.18;
    existing.player.radius = radius;
    existing.player.y = grounded ? existing.groundY - radius : Math.min(existing.player.y, existing.groundY - radius);
    existing.starsBack = makeStars(width, height, profile.starsBack, 0.62);
    existing.starsMid = makeStars(width, height, profile.starsMid, 0.8);
    existing.fogBands = makeFogBands(width, height, profile.fogBands);
  }, [profile]);

  const restartGame = useCallback(() => {
    const stage = stageRef.current;

    if (!stage) {
      return;
    }

    const width = Math.max(window.innerWidth, stage.clientWidth, 360);
    const height = Math.max(window.innerHeight, stage.clientHeight, BASE_HEIGHT);

    gameRef.current = makeGameState(width, height, profile);
    if (gameRef.current) {
      gameRef.current.speed = Math.max(290, width * 0.23);
      gameRef.current.obstacleTimer = 1.8;
    }
    syncScore(0);
    setGameOver(false);
    setShake(false);
    setIntroReady(false);

    if (introTimeoutRef.current) {
      window.clearTimeout(introTimeoutRef.current);
    }

    introTimeoutRef.current = window.setTimeout(() => {
      setIntroReady(true);
    }, 1200);
  }, [profile, syncScore]);

  const jump = useCallback(() => {
    const game = gameRef.current;

    if (!game || game.gameOver) {
      return;
    }

    const floorY = game.groundY - game.player.radius;
    const grounded = game.player.y >= floorY - 2 && game.player.vy >= -16;

    if (!grounded) {
      return;
    }

    game.player.vy = -Math.max(700, game.height * 0.94);
    game.player.pulse = 1;
    game.player.tilt = -0.34;
    game.player.distortion = 1;
    game.player.squishX = 1.24;
    game.player.squishY = 0.82;

    for (let index = 0; index < profile.trailBurst; index += 1) {
      if (game.trail.length >= profile.trailMax) {
        break;
      }

      game.trail.push({
        x: game.player.x - game.player.radius * 0.5,
        y: game.player.y + (Math.random() - 0.5) * game.player.radius * 1.4,
        size: Math.random() * 8 + 6,
        alpha: Math.random() * 0.26 + 0.24,
        hue: Math.random() * 180 + (index % 2 === 0 ? 170 : 300),
        vx: -Math.random() * 50,
        vy: (Math.random() - 0.5) * 24,
      });
    }

    safePlay("jump");
  }, [profile.trailBurst, profile.trailMax, safePlay]);

  const dash = useCallback(() => {
    const game = gameRef.current;

    if (!game || game.gameOver) {
      return;
    }

    game.player.dash = 1;
    game.player.distortion = 1;
    game.speed += 26;

    for (let index = 0; index < (profile.mobile ? 6 : 8); index += 1) {
      if (game.speedLines.length >= profile.speedLineMax) {
        break;
      }

      game.speedLines.push({
        x: Math.random() * game.width,
        y: Math.random() * game.height * 0.75,
        length: Math.random() * 120 + 60,
        alpha: Math.random() * 0.18 + 0.12,
        speed: Math.random() * 420 + 420,
        width: Math.random() * 1.2 + 0.8,
      });
    }

    safePlay("dash");
  }, [profile.mobile, profile.speedLineMax, safePlay]);

  useEffect(() => {
    const saved = Number.parseInt(localStorage.getItem(BEST_SCORE_KEY) ?? "0", 10);
    const safe = Number.isFinite(saved) ? saved : 0;

    bestScoreRef.current = safe;
    setBestScore(safe);
    setIntroReady(false);

    introTimeoutRef.current = window.setTimeout(() => {
      setIntroReady(true);
    }, 1200);

    document.title = "404 // Signal Lost | Softgenix InfoTech";

    return () => {
      if (introTimeoutRef.current) {
        window.clearTimeout(introTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const image = new Image();

    image.onload = () => {
      logoImageRef.current = image;
      logoReadyRef.current = true;
    };

    image.onerror = () => {
      logoImageRef.current = null;
      logoReadyRef.current = false;
    };

    image.src = softgenixLogo;
  }, []);

  useEffect(() => {
    resizeStage();
    window.addEventListener("resize", resizeStage);

    return () => {
      window.removeEventListener("resize", resizeStage);
    };
  }, [resizeStage]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "ArrowUp") {
        event.preventDefault();

        if (gameRef.current?.gameOver) {
          restartGame();
          return;
        }

        jump();
      }

      if (event.code === "ShiftLeft" || event.code === "ShiftRight") {
        dash();
      }

      if (event.key.toLowerCase() === "m" && !profile.mobile) {
        setMuted((current) => !current);
      }
    };

    window.addEventListener("keydown", onKeyDown, { passive: false });

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [dash, jump, profile.mobile, restartGame]);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let ambientTick = 0;

    const render = (timestamp: number) => {
      if (hiddenRef.current) {
        return;
      }

      const game = gameRef.current;

      if (!game) {
        frameRef.current = window.requestAnimationFrame(render);
        return;
      }

      if (!game.lastFrame) {
        game.lastFrame = timestamp;
      }

      const rawDelta = Math.min((timestamp - game.lastFrame) / 1000, 0.032);
      game.lastFrame = timestamp;
      const delta = rawDelta * game.slowMo;
      const floorY = game.groundY - game.player.radius;

      game.intro = Math.min(1, game.intro + rawDelta * 0.72);

      if (game.running && !game.gameOver) {
        ambientTick += rawDelta;
        if (ambientTick > 9 && !profile.mobile) {
          ambientTick = 0;
          safePlay("ambient");
        }

        game.score += delta * 18;
        game.speed += delta * (game.score < 180 ? 2.2 : 3);
        game.obstacleTimer -= delta;
        game.player.breathe += rawDelta * 2.4;
        game.player.rotation += rawDelta * (0.8 + game.player.dash * 1.2);

        game.player.vy += game.height * 2.34 * delta;
        game.player.y += game.player.vy * delta;
        game.player.pulse = Math.max(0, game.player.pulse - rawDelta * 2.2);
        game.player.dash = Math.max(0, game.player.dash - rawDelta * 2.7);
        game.player.distortion = Math.max(0, game.player.distortion - rawDelta * 2.5);
        game.player.tilt += (0 - game.player.tilt) * rawDelta * 4.8;
        game.player.squishX += (1 - game.player.squishX) * rawDelta * 7;
        game.player.squishY += (1 - game.player.squishY) * rawDelta * 7;

        if (game.player.y > floorY) {
          if (game.player.vy > 240) {
            game.player.squishX = 0.86;
            game.player.squishY = 1.18;
            game.player.pulse = Math.max(game.player.pulse, 0.35);
          }

          game.player.y = floorY;
          game.player.vy = 0;
        }

        if (game.obstacleTimer <= 0 && game.obstacles.length < profile.obstacleMax) {
          if (game.score < 180 && game.obstacles.length > 0) {
            game.obstacleTimer = 1.2;
          } else {
          const height = Math.random() * 35 + 45;
          const width = Math.random() * 20 + 28;
          const roll = Math.random();

          game.obstacles.push({
            x: game.width + width + 100,
            y: game.groundY - height,
            width,
            height,
            speed: game.speed * (0.94 + Math.random() * 0.18),
            rotation: Math.random() * Math.PI,
            spin: (Math.random() * 1.8 + 0.7) * (Math.random() > 0.5 ? 1 : -1),
            glow: Math.random() * 0.4 + 0.75,
            warning: 1,
            trail: 1,
            kind: roll > 0.66 ? "cube" : roll > 0.33 ? "fragment" : "shard",
          });

          game.obstacleTimer =
            game.score < 180
              ? 1.7 + Math.random() * 0.45
              : Math.max(0.9, 1.55 - game.score * 0.0028 + Math.random() * 0.38);
          }
        }

        for (let index = game.obstacles.length - 1; index >= 0; index -= 1) {
          const obstacle = game.obstacles[index];

          obstacle.x -= obstacle.speed * delta;
          obstacle.rotation += obstacle.spin * delta;
          obstacle.warning = Math.max(0, obstacle.warning - rawDelta * 2.8);
          obstacle.trail = Math.max(0, obstacle.trail - rawDelta * 0.9);

          if (obstacle.x + obstacle.width <= -240) {
            game.obstacles.splice(index, 1);
            continue;
          }

          if (
            !profile.reducedMotion &&
            obstacle.warning > 0.55 &&
            obstacle.x > game.width - 200 &&
            game.speedLines.length < profile.speedLineMax
          ) {
            game.speedLines.push({
              x: obstacle.x + obstacle.width * 0.2,
              y: obstacle.y + obstacle.height * 0.5,
              length: Math.random() * 60 + 30,
              alpha: 0.12,
              speed: game.speed * 0.85,
              width: 1,
            });
          }

          const playerBox = {
            left: game.player.x - game.player.radius * 0.62,
            right: game.player.x + game.player.radius * 0.62,
            top: game.player.y - game.player.radius * 0.62,
            bottom: game.player.y + game.player.radius * 0.62,
          };

          const obstacleBox = {
            left: obstacle.x + obstacle.width * 0.24,
            right: obstacle.x + obstacle.width * 0.76,
            top: obstacle.y + obstacle.height * 0.22,
            bottom: obstacle.y + obstacle.height * 0.82,
          };

          if (
            playerBox.right > obstacleBox.left &&
            playerBox.left < obstacleBox.right &&
            playerBox.bottom > obstacleBox.top &&
            playerBox.top < obstacleBox.bottom
          ) {
            game.gameOver = true;
            game.running = false;
            game.slowMo = 0.26;
            game.shakeUntil = timestamp + 700;
            game.deathAt = timestamp;

            const finalScore = Math.floor(game.score);
            const nextBest = Math.max(bestScoreRef.current, finalScore);

            bestScoreRef.current = nextBest;
            localStorage.setItem(BEST_SCORE_KEY, String(nextBest));
            setBestScore(nextBest);
            syncScore(finalScore);
            setGameOver(true);
            setShake(true);

            for (let burst = 0; burst < profile.explosionCount; burst += 1) {
              game.explosions.push({
                x: game.player.x,
                y: game.player.y,
                size: Math.random() * 12 + 4,
                alpha: Math.random() * 0.32 + 0.28,
                hue: burst % 2 === 0 ? 190 : 320,
                vx: (Math.random() - 0.5) * 280,
                vy: (Math.random() - 0.6) * 240,
              });
            }

            if (uiTimeoutRef.current) {
              window.clearTimeout(uiTimeoutRef.current);
            }

            uiTimeoutRef.current = window.setTimeout(() => {
              setShake(false);
              const currentGame = gameRef.current;
              if (currentGame) {
                currentGame.slowMo = 1;
              }
            }, 700);

            safePlay("impact");
            break;
          }
        }

        if (game.trail.length < profile.trailMax) {
          game.trail.push({
            x: game.player.x - game.player.radius * 0.9,
            y: game.player.y + (Math.random() - 0.5) * game.player.radius * 1.2,
            size: Math.random() * 8 + 7,
            alpha: Math.random() * 0.18 + 0.16,
            hue: Math.random() > 0.5 ? 190 : 320,
            vx: -Math.random() * 60,
            vy: (Math.random() - 0.5) * 12,
          });
        }

        if (game.foreground.length < profile.foregroundMax && Math.random() < profile.foregroundSpawnChance) {
          game.foreground.push({
            x: game.width + Math.random() * 40,
            y: Math.random() * game.height,
            size: Math.random() * 2 + 1,
            alpha: Math.random() * 0.1 + 0.04,
            hue: Math.random() > 0.5 ? 190 : 320,
            vx: -Math.random() * 36 - 18,
            vy: Math.random() * 2 - 1,
          });
        }

        if (
          !profile.reducedMotion &&
          game.speedLines.length < profile.speedLineMax &&
          (game.speed > 430 || game.player.dash > 0.12 || game.score > 60) &&
          Math.random() < profile.speedLineSpawnChance
        ) {
          game.speedLines.push({
            x: game.width + Math.random() * 80,
            y: Math.random() * game.height * 0.76,
            length: Math.random() * 100 + 50,
            alpha: Math.random() * 0.1 + 0.05,
            speed: game.speed * (1.1 + Math.random() * 0.4),
            width: Math.random() * 1.2 + 0.8,
          });
        }

        const wholeScore = Math.floor(game.score);
        if (
          wholeScore !== game.lastUiScore &&
          (timestamp - game.lastUiPushAt > 250 || wholeScore - game.lastUiScore >= 5)
        ) {
          game.lastUiScore = wholeScore;
          game.lastUiPushAt = timestamp;
          syncScore(wholeScore);
        }
      }

      if (game.gameOver && timestamp - game.deathAt > 320) {
        game.slowMo += (1 - game.slowMo) * rawDelta * 2.4;
      }

      for (let index = 0; index < game.starsBack.length; index += 1) {
        const star = game.starsBack[index];
        star.x -= star.speed * rawDelta * star.depth * 0.6;
        if (star.x < -12) {
          star.x = game.width + Math.random() * 50;
          star.y = Math.random() * game.horizonY * 0.85;
        }
      }

      for (let index = 0; index < game.starsMid.length; index += 1) {
        const star = game.starsMid[index];
        star.x -= star.speed * rawDelta * (0.9 + star.depth * 0.3);
        if (star.x < -12) {
          star.x = game.width + Math.random() * 80;
          star.y = Math.random() * game.horizonY + 20;
        }
      }

      for (let index = 0; index < game.fogBands.length; index += 1) {
        const band = game.fogBands[index];
        band.x += band.drift * rawDelta;
        if (band.x > game.width + band.width) {
          band.x = -band.width;
        }
        if (band.x + band.width < 0) {
          band.x = game.width + band.width * 0.3;
        }
      }

      for (let index = game.trail.length - 1; index >= 0; index -= 1) {
        const particle = game.trail[index];
        particle.x += particle.vx * rawDelta - game.speed * delta * 0.18;
        particle.y += particle.vy * rawDelta;
        particle.size *= 1 - rawDelta * 1.35;
        particle.alpha -= rawDelta * 1.12;
        if (particle.alpha <= 0.015 || particle.size <= 1.3) {
          game.trail.splice(index, 1);
        }
      }

      for (let index = game.foreground.length - 1; index >= 0; index -= 1) {
        const particle = game.foreground[index];
        particle.x += particle.vx * rawDelta;
        particle.y += particle.vy * rawDelta;
        particle.alpha -= rawDelta * 0.018;
        if (particle.x <= -20 || particle.alpha <= 0.012) {
          game.foreground.splice(index, 1);
        }
      }

      for (let index = game.explosions.length - 1; index >= 0; index -= 1) {
        const particle = game.explosions[index];
        particle.x += particle.vx * rawDelta;
        particle.y += particle.vy * rawDelta;
        particle.size *= 1 - rawDelta * 0.95;
        particle.alpha -= rawDelta * 1.2;
        particle.vy += 180 * rawDelta;
        if (particle.alpha <= 0.02 || particle.size <= 1.6) {
          game.explosions.splice(index, 1);
        }
      }

      for (let index = game.speedLines.length - 1; index >= 0; index -= 1) {
        const line = game.speedLines[index];
        line.x -= line.speed * rawDelta;
        line.alpha -= rawDelta * 0.44;
        if (line.x + line.length <= -60 || line.alpha <= 0.02) {
          game.speedLines.splice(index, 1);
        }
      }

      const cameraDriftX = profile.reducedMotion ? 0 : Math.sin(timestamp * 0.00017) * game.width * 0.01;
      const cameraDriftY = profile.reducedMotion ? 0 : Math.cos(timestamp * 0.00011) * game.height * 0.008;
      const shakeX = timestamp < game.shakeUntil ? Math.sin(timestamp * 0.17) * 12 : 0;
      const shakeY = timestamp < game.shakeUntil ? Math.cos(timestamp * 0.21) * 7 : 0;
      const introFade = easeOut(game.intro);
      const horizonPulse = (Math.sin(timestamp * 0.0016) * 0.5 + 0.5) * 0.26 + 0.2;
      const playerGlow = 0.65 + Math.sin(game.player.breathe) * 0.1;

      context.clearRect(0, 0, game.width, game.height);
      context.save();
      context.translate(cameraDriftX + shakeX, cameraDriftY + shakeY);

      const baseGradient = context.createLinearGradient(0, 0, 0, game.height);
      baseGradient.addColorStop(0, "#01020a");
      baseGradient.addColorStop(0.32, "#030815");
      baseGradient.addColorStop(0.66, "#0b0419");
      baseGradient.addColorStop(1, "#010106");
      context.globalAlpha = introFade;
      context.fillStyle = baseGradient;
      context.fillRect(0, 0, game.width, game.height);
      context.globalAlpha = 1;

      const beamOne = context.createLinearGradient(0, 0, game.width, game.height);
      beamOne.addColorStop(0, "rgba(34,211,238,0.14)");
      beamOne.addColorStop(0.4, "rgba(34,211,238,0.01)");
      beamOne.addColorStop(1, "rgba(34,211,238,0)");
      context.save();
      context.globalCompositeOperation = "screen";
      context.globalAlpha = 0.65 * introFade;
      context.translate(game.width * 0.08, -game.height * 0.08);
      context.rotate(-0.32);
      context.fillStyle = beamOne;
      context.fillRect(0, 0, game.width * 0.4, game.height * 1.3);
      context.restore();

      const beamTwo = context.createLinearGradient(0, 0, game.width, game.height);
      beamTwo.addColorStop(0, "rgba(244,114,182,0.12)");
      beamTwo.addColorStop(0.55, "rgba(168,85,247,0.04)");
      beamTwo.addColorStop(1, "rgba(244,114,182,0)");
      context.save();
      context.globalCompositeOperation = "screen";
      context.globalAlpha = 0.55 * introFade;
      context.translate(game.width * 0.76, -game.height * 0.05);
      context.rotate(0.44);
      context.fillStyle = beamTwo;
      context.fillRect(0, 0, game.width * 0.36, game.height * 1.2);
      context.restore();

      const topGlow = context.createRadialGradient(game.width * 0.28, game.height * 0.14, 0, game.width * 0.28, game.height * 0.14, game.width * 0.44);
      topGlow.addColorStop(0, "rgba(34,211,238,0.18)");
      topGlow.addColorStop(0.42, "rgba(59,130,246,0.09)");
      topGlow.addColorStop(1, "rgba(34,211,238,0)");
      context.fillStyle = topGlow;
      context.fillRect(0, 0, game.width, game.height);

      const sideGlow = context.createRadialGradient(game.width * 0.84, game.height * 0.2, 0, game.width * 0.84, game.height * 0.2, game.width * 0.42);
      sideGlow.addColorStop(0, "rgba(217,70,239,0.18)");
      sideGlow.addColorStop(0.32, "rgba(168,85,247,0.1)");
      sideGlow.addColorStop(1, "rgba(217,70,239,0)");
      context.fillStyle = sideGlow;
      context.fillRect(0, 0, game.width, game.height);

      for (let index = 0; index < game.starsBack.length; index += 1) {
        const star = game.starsBack[index];
        context.beginPath();
        context.fillStyle = `rgba(191, 219, 254, ${star.alpha * introFade})`;
        context.shadowColor = "rgba(34,211,238,0.16)";
        context.shadowBlur = 4 * star.depth;
        context.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        context.fill();
      }

      for (let index = 0; index < game.starsMid.length; index += 1) {
        const star = game.starsMid[index];
        context.beginPath();
        context.fillStyle = `rgba(240, 249, 255, ${star.alpha * introFade})`;
        context.shadowColor = star.depth > 0.7 ? "rgba(244,114,182,0.16)" : "rgba(34,211,238,0.18)";
        context.shadowBlur = 7 * star.depth;
        context.arc(star.x, star.y, star.size * 1.1, 0, Math.PI * 2);
        context.fill();
      }

      for (let index = 0; index < game.foreground.length; index += 1) {
        const particle = game.foreground[index];
        context.beginPath();
        context.fillStyle = `hsla(${particle.hue} 100% 70% / ${particle.alpha})`;
        context.shadowColor = `hsla(${particle.hue} 100% 70% / ${particle.alpha})`;
        context.shadowBlur = 8;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      for (let index = 0; index < game.speedLines.length; index += 1) {
        const line = game.speedLines[index];
        const lineGradient = context.createLinearGradient(line.x, line.y, line.x + line.length, line.y);
        lineGradient.addColorStop(0, "rgba(34,211,238,0)");
        lineGradient.addColorStop(0.52, `rgba(34,211,238,${line.alpha})`);
        lineGradient.addColorStop(1, "rgba(244,114,182,0)");
        context.strokeStyle = lineGradient;
        context.lineWidth = line.width;
        context.beginPath();
        context.moveTo(line.x, line.y);
        context.lineTo(line.x + line.length, line.y);
        context.stroke();
      }

      for (let index = 0; index < game.fogBands.length; index += 1) {
        const band = game.fogBands[index];
        const color =
          band.hue === "cyan"
            ? "34,211,238"
            : band.hue === "magenta"
              ? "244,114,182"
              : "96,165,250";
        const fogGradient = context.createRadialGradient(band.x, band.y, 0, band.x, band.y, band.width * 0.5);
        fogGradient.addColorStop(0, `rgba(${color}, ${band.alpha})`);
        fogGradient.addColorStop(1, `rgba(${color}, 0)`);
        context.fillStyle = fogGradient;
        context.fillRect(band.x - band.width * 0.5, band.y - band.height * 0.5, band.width, band.height);
      }

      const horizonGlow = context.createLinearGradient(0, game.horizonY - 32, 0, game.horizonY + 54);
      horizonGlow.addColorStop(0, "rgba(56,189,248,0)");
      horizonGlow.addColorStop(0.42, `rgba(56,189,248,${horizonPulse})`);
      horizonGlow.addColorStop(0.72, "rgba(192,132,252,0.16)");
      horizonGlow.addColorStop(1, "rgba(244,114,182,0)");
      context.fillStyle = horizonGlow;
      context.fillRect(0, game.horizonY - 32, game.width, 86);

      context.strokeStyle = "rgba(103,232,249,0.2)";
      context.lineWidth = 1;
      for (let index = 0; index < 16; index += 1) {
        const depth = index / 15;
        const y = game.horizonY + depth * depth * (game.height - game.horizonY);
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(game.width, y);
        context.stroke();
      }

      for (let index = -9; index <= 9; index += 1) {
        const x = game.width * 0.5 + index * game.width * 0.075;
        context.beginPath();
        context.moveTo(game.width * 0.5, game.horizonY);
        context.lineTo(x + Math.sin(timestamp * 0.00065 + index * 0.8) * 24, game.height);
        context.stroke();
      }

      context.fillStyle = "rgba(1, 2, 9, 0.74)";
      context.fillRect(0, game.groundY, game.width, game.height - game.groundY);

      context.save();
      context.globalCompositeOperation = "screen";
      context.shadowColor = "rgba(34,211,238,0.72)";
      context.shadowBlur = 14;
      context.strokeStyle = "rgba(103,232,249,0.66)";
      context.beginPath();
      context.moveTo(0, game.groundY);
      context.lineTo(game.width, game.groundY);
      context.stroke();
      context.restore();

      for (let index = 0; index < game.obstacles.length; index += 1) {
        const obstacle = game.obstacles[index];

        for (let streak = 0; streak < 2; streak += 1) {
          context.beginPath();
          context.strokeStyle = `rgba(244,114,182,${0.06 * (1 - streak * 0.25) * obstacle.trail})`;
          context.lineWidth = 1 + streak * 0.3;
          context.moveTo(obstacle.x + obstacle.width * 0.5 + streak * 5, obstacle.y + 8 + streak * 10);
          context.lineTo(obstacle.x + obstacle.width * 0.5 + obstacle.width + 36 + streak * 10, obstacle.y + obstacle.height * 0.5 + streak * 8);
          context.stroke();
        }

        if (obstacle.warning > 0) {
          const warningGradient = context.createRadialGradient(
            obstacle.x + obstacle.width * 0.5,
            obstacle.y + obstacle.height * 0.5,
            0,
            obstacle.x + obstacle.width * 0.5,
            obstacle.y + obstacle.height * 0.5,
            obstacle.width * 1.6,
          );
          warningGradient.addColorStop(0, `rgba(255,255,255,${obstacle.warning * 0.028})`);
          warningGradient.addColorStop(1, "rgba(255,255,255,0)");
          context.fillStyle = warningGradient;
          context.fillRect(obstacle.x - obstacle.width, obstacle.y - obstacle.height, obstacle.width * 3, obstacle.height * 3);
        }

        context.save();
        context.translate(obstacle.x + obstacle.width * 0.5, obstacle.y + obstacle.height * 0.5);
        context.rotate(obstacle.rotation);

        const obstacleGradient = context.createLinearGradient(
          -obstacle.width * 0.5,
          -obstacle.height * 0.5,
          obstacle.width * 0.5,
          obstacle.height * 0.5,
        );
        obstacleGradient.addColorStop(0, "rgba(34,211,238,0.96)");
        obstacleGradient.addColorStop(0.42, "rgba(96,165,250,0.94)");
        obstacleGradient.addColorStop(1, "rgba(244,114,182,0.88)");

        context.shadowColor = `rgba(168,85,247,${obstacle.glow})`;
        context.shadowBlur = 16;
        context.fillStyle = "rgba(7, 10, 28, 0.94)";

        if (obstacle.kind === "cube") {
          context.fillRect(-obstacle.width * 0.5, -obstacle.height * 0.5, obstacle.width, obstacle.height);
          context.strokeStyle = obstacleGradient;
          context.lineWidth = 2.1;
          context.strokeRect(-obstacle.width * 0.5, -obstacle.height * 0.5, obstacle.width, obstacle.height);
        } else {
          context.beginPath();
          context.moveTo(-obstacle.width * 0.6, obstacle.height * 0.45);
          context.lineTo(-obstacle.width * 0.16, -obstacle.height * 0.56);
          context.lineTo(obstacle.width * 0.56, -obstacle.height * 0.12);
          context.lineTo(obstacle.width * 0.18, obstacle.height * 0.55);
          context.closePath();
          context.fill();
          context.strokeStyle = obstacleGradient;
          context.lineWidth = 2.1;
          context.stroke();
        }

        context.beginPath();
        context.strokeStyle = "rgba(255,255,255,0.22)";
        context.moveTo(-obstacle.width * 0.18, -obstacle.height * 0.22);
        context.lineTo(obstacle.width * 0.18, obstacle.height * 0.2);
        context.moveTo(-obstacle.width * 0.34, obstacle.height * 0.14);
        context.lineTo(obstacle.width * 0.08, -obstacle.height * 0.32);
        context.stroke();
        context.restore();
      }

      for (let index = 0; index < game.trail.length; index += 1) {
        const particle = game.trail[index];
        context.beginPath();
        context.fillStyle = `hsla(${particle.hue} 100% 70% / ${particle.alpha})`;
        context.shadowColor = `hsla(${particle.hue} 100% 70% / ${particle.alpha})`;
        context.shadowBlur = 10;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      const reflectionGradient = context.createRadialGradient(
        game.player.x,
        game.groundY + 12,
        0,
        game.player.x,
        game.groundY + 12,
        game.player.radius * 3.2,
      );
      reflectionGradient.addColorStop(0, `rgba(34,211,238,${0.12 + game.player.dash * 0.06})`);
      reflectionGradient.addColorStop(0.62, "rgba(168,85,247,0.05)");
      reflectionGradient.addColorStop(1, "rgba(168,85,247,0)");
      context.fillStyle = reflectionGradient;
      context.fillRect(game.player.x - game.player.radius * 3.5, game.groundY - 8, game.player.radius * 7, game.player.radius * 2.4);

      context.save();
      context.translate(game.player.x, game.player.y);
      context.rotate(game.player.tilt);

      const breatheScale = 1 + Math.sin(game.player.breathe) * 0.03;
      context.scale(
        game.player.squishX * breatheScale,
        game.player.squishY * (1 + Math.cos(game.player.breathe) * 0.02),
      );

      const aura = context.createRadialGradient(0, 0, 0, 0, 0, game.player.radius * 3.2);
      aura.addColorStop(0, "rgba(255,255,255,0.98)");
      aura.addColorStop(0.14, "rgba(140,240,255,0.96)");
      aura.addColorStop(0.34, "rgba(59,130,246,0.82)");
      aura.addColorStop(0.62, "rgba(168,85,247,0.64)");
      aura.addColorStop(0.84, "rgba(244,114,182,0.32)");
      aura.addColorStop(1, "rgba(244,114,182,0)");
      context.beginPath();
      context.fillStyle = aura;
      context.shadowColor = `rgba(34,211,238,${playerGlow})`;
      context.shadowBlur = 22 + game.player.dash * 14;
      context.arc(0, 0, game.player.radius * 1.95, 0, Math.PI * 2);
      context.fill();

      context.save();
      context.rotate(game.player.rotation);
      context.strokeStyle = "rgba(103,232,249,0.72)";
      context.lineWidth = 2;
      context.beginPath();
      context.arc(0, 0, game.player.radius * 1.18, 0, Math.PI * 2);
      context.stroke();

      context.strokeStyle = "rgba(244,114,182,0.46)";
      context.beginPath();
      context.arc(0, 0, game.player.radius * 1.56, Math.PI * 0.22, Math.PI * 1.84);
      context.stroke();

      context.rotate(-game.player.rotation * 1.8);
      context.strokeStyle = "rgba(96,165,250,0.44)";
      context.beginPath();
      context.arc(0, 0, game.player.radius * 1.32, Math.PI * 0.8, Math.PI * 2.3);
      context.stroke();
      context.restore();

      const coreDark = context.createRadialGradient(0, 0, 0, 0, 0, game.player.radius);
      coreDark.addColorStop(0, "rgba(8,13,28,0.98)");
      coreDark.addColorStop(1, "rgba(2,6,18,0.96)");
      context.fillStyle = coreDark;
      context.beginPath();
      context.arc(0, 0, game.player.radius * 0.92, 0, Math.PI * 2);
      context.fill();

      context.save();
      context.rotate(-game.player.rotation * 1.2);
      const innerCore = context.createRadialGradient(-3, -5, 0, 0, 0, game.player.radius * 0.78);
      innerCore.addColorStop(0, "rgba(255,255,255,0.98)");
      innerCore.addColorStop(0.28, "rgba(103,232,249,0.96)");
      innerCore.addColorStop(0.62, "rgba(96,165,250,0.54)");
      innerCore.addColorStop(1, "rgba(96,165,250,0)");
      context.fillStyle = innerCore;
      context.beginPath();
      context.arc(0, 0, game.player.radius * 0.68, 0, Math.PI * 2);
      context.fill();

      const logoBackGlow = context.createRadialGradient(0, 0, 0, 0, 0, game.player.radius * 0.9);
      logoBackGlow.addColorStop(0, "rgba(103,232,249,0.42)");
      logoBackGlow.addColorStop(0.6, "rgba(244,114,182,0.18)");
      logoBackGlow.addColorStop(1, "rgba(244,114,182,0)");
      context.fillStyle = logoBackGlow;
      context.beginPath();
      context.arc(0, 0, game.player.radius * 0.76, 0, Math.PI * 2);
      context.fill();

      if (logoReadyRef.current && logoImageRef.current) {
        const logoSize = game.player.radius * 1.05;
        context.save();
        context.beginPath();
        context.arc(0, 0, game.player.radius * 0.54, 0, Math.PI * 2);
        context.clip();
        context.drawImage(
          logoImageRef.current,
          -logoSize * 0.5,
          -logoSize * 0.5,
          logoSize,
          logoSize,
        );
        context.restore();

        context.beginPath();
        context.arc(0, 0, game.player.radius * 0.56, 0, Math.PI * 2);
        context.strokeStyle = "rgba(255,255,255,0.32)";
        context.lineWidth = 1.2;
        context.stroke();
      } else {
        context.beginPath();
        context.moveTo(0, -game.player.radius * 0.62);
        context.lineTo(game.player.radius * 0.56, 0);
        context.lineTo(0, game.player.radius * 0.62);
        context.lineTo(-game.player.radius * 0.56, 0);
        context.closePath();
        context.strokeStyle = "rgba(255,79,216,0.98)";
        context.lineWidth = 1.9;
        context.stroke();

        context.beginPath();
        context.moveTo(0, -game.player.radius * 0.28);
        context.lineTo(game.player.radius * 0.28, 0);
        context.lineTo(0, game.player.radius * 0.28);
        context.lineTo(-game.player.radius * 0.28, 0);
        context.closePath();
        context.fillStyle = "rgba(255,255,255,0.9)";
        context.fill();
      }
      context.restore();

      if (game.player.distortion > 0) {
        context.beginPath();
        context.strokeStyle = `rgba(255,255,255,${0.12 * game.player.distortion})`;
        context.lineWidth = 1.2;
        context.arc(0, 0, game.player.radius * (2 + game.player.distortion * 0.8), 0, Math.PI * 2);
        context.stroke();
      }
      context.restore();

      for (let index = 0; index < game.explosions.length; index += 1) {
        const particle = game.explosions[index];
        context.beginPath();
        context.fillStyle = `hsla(${particle.hue} 100% 70% / ${particle.alpha})`;
        context.shadowColor = `hsla(${particle.hue} 100% 70% / ${particle.alpha})`;
        context.shadowBlur = 12;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      const glitchY = (Math.sin(timestamp * 0.0021) * 0.5 + 0.5) * game.height;
      context.fillStyle = "rgba(255,255,255,0.018)";
      context.fillRect(0, glitchY, game.width, 24);
      context.fillStyle = "rgba(34,211,238,0.02)";
      context.fillRect(0, glitchY + 6, game.width, 8);
      context.fillStyle = "rgba(244,114,182,0.016)";
      context.fillRect(0, glitchY + 15, game.width, 4);

      context.restore();
      frameRef.current = window.requestAnimationFrame(render);
    };

    renderRef.current = render;
    frameRef.current = window.requestAnimationFrame(render);

    const handleVisibility = () => {
      hiddenRef.current = document.hidden;

      if (document.hidden) {
        if (frameRef.current) {
          window.cancelAnimationFrame(frameRef.current);
          frameRef.current = null;
        }
        if (gameRef.current) {
          gameRef.current.lastFrame = 0;
        }
        return;
      }

      if (gameRef.current) {
        gameRef.current.lastFrame = 0;
      }

      if (!frameRef.current && renderRef.current) {
        frameRef.current = window.requestAnimationFrame(renderRef.current);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, [profile, resizeStage, safePlay, syncScore]);

  useEffect(() => {
    return () => {
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
      }

      if (uiTimeoutRef.current) {
        window.clearTimeout(uiTimeoutRef.current);
      }

      if (introTimeoutRef.current) {
        window.clearTimeout(introTimeoutRef.current);
      }

      if (audioContextRef.current) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  return (
    <main className="relative -mt-24 min-h-screen overflow-hidden bg-[#01030b] pt-24 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_84%_20%,rgba(217,70,239,0.16),transparent_28%),radial-gradient(circle_at_50%_100%,rgba(59,130,246,0.12),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(1,4,16,0.32)_0%,rgba(1,4,16,0.04)_18%,rgba(1,4,16,0)_32%,rgba(1,4,16,0.26)_100%)]" />

      <section
        ref={stageRef}
        className="relative min-h-screen w-full overflow-hidden"
        onPointerDown={(event) => {
          const target = event.target as HTMLElement;

          if (target.closest("button,a")) {
            return;
          }

          if (pointerLockRef.current) {
            return;
          }

          if (gameRef.current?.gameOver) {
            restartGame();
          } else {
            jump();
          }

          pointerLockRef.current = true;
          window.setTimeout(() => {
            pointerLockRef.current = false;
          }, 120);
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.2)_55%,rgba(0,0,0,0.58)_100%)]" />
        <div className={`pointer-events-none absolute inset-0 mix-blend-screen [background-image:linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:100%_4px,4px_100%] ${profile.mobile ? "opacity-20" : "opacity-32"}`} />
        <div className={`pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0.028)_0px,rgba(255,255,255,0.028)_1px,transparent_1px,transparent_4px)] ${profile.reducedMotion ? "opacity-10" : "opacity-18"}`} />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: introReady ? 1 : 0.2 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="pointer-events-none absolute inset-0"
        >
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: introReady ? 0 : 1 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.16),rgba(34,211,238,0.1),rgba(244,114,182,0.06),transparent_70%)] mix-blend-screen"
          />

          <motion.div
            animate={profile.reducedMotion ? undefined : { x: [0, 18, -14, 0], y: [0, -10, 8, 0] }}
            transition={profile.reducedMotion ? undefined : { duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[10%] top-[16%] h-64 w-64 rounded-full bg-cyan-400/10 blur-3xl md:h-80 md:w-80"
          />
          <motion.div
            animate={profile.reducedMotion ? undefined : { x: [0, -12, 20, 0], y: [0, 8, -12, 0] }}
            transition={profile.reducedMotion ? undefined : { duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[8%] top-[18%] h-56 w-56 rounded-full bg-fuchsia-500/10 blur-3xl md:h-80 md:w-80"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={shake ? { opacity: 1, y: 0, x: [0, -10, 10, -7, 7, -3, 3, 0] } : { opacity: 1, y: 0, x: 0 }}
          transition={{ duration: 0.92, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <div className="pointer-events-none absolute left-0 right-0 top-[11%] z-10 px-5 md:px-10 lg:px-16">
            <div className="max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 1.05 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <motion.div
                  animate={profile.reducedMotion ? undefined : { opacity: [0.16, 0.26, 0.18, 0.22], x: [0, 2, -1, 0] }}
                  transition={profile.reducedMotion ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
                  className="font-display text-[clamp(8rem,24vw,22rem)] font-semibold leading-[0.76] tracking-[-0.1em] text-white/12"
                >
                  404
                </motion.div>
                <motion.div
                  animate={profile.reducedMotion ? undefined : { opacity: [0.06, 0.12, 0.06], x: [0, 3, -3, 0] }}
                  transition={profile.reducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 font-display text-[clamp(8rem,24vw,22rem)] font-semibold leading-[0.76] tracking-[-0.1em] text-cyan-300/10 blur-[1px]"
                >
                  404
                </motion.div>
              </motion.div>

              <div className="relative -mt-4 md:-mt-8">
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    textShadow: [
                      "0 0 16px rgba(103,232,249,0.08)",
                      "0 0 28px rgba(103,232,249,0.18)",
                      "0 0 20px rgba(244,114,182,0.12)",
                    ],
                  }}
                  transition={{
                    duration: 0.95,
                    delay: 0.14,
                    textShadow: profile.reducedMotion ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" },
                  }}
                  className="relative font-display text-[clamp(2.8rem,7vw,7.6rem)] font-semibold leading-[0.9] tracking-[-0.07em] text-white"
                >
                  <motion.span
                    animate={profile.reducedMotion ? undefined : { opacity: [1, 0.92, 1, 0.98, 1], x: [0, 1.5, -1, 0, 0] }}
                    transition={profile.reducedMotion ? undefined : { duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
                    className="relative inline-block"
                  >
                    SIGNAL LOST
                  </motion.span>
                  <motion.span
                    animate={profile.reducedMotion ? undefined : { x: [0, 2, 0], opacity: [0.16, 0.3, 0.16] }}
                    transition={profile.reducedMotion ? undefined : { duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute left-[0.02em] top-0 bg-[linear-gradient(90deg,#67e8f9_0%,#60a5fa_40%,#a855f7_72%,#ff4fd8_100%)] bg-clip-text text-transparent blur-[0.4px]"
                  >
                    SIGNAL LOST
                  </motion.span>
                  <motion.span
                    animate={profile.reducedMotion ? undefined : { x: [0, -2, 0], opacity: [0.08, 0.18, 0.08] }}
                    transition={profile.reducedMotion ? undefined : { duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
                    className="absolute left-[-0.012em] top-0 text-cyan-300/20"
                  >
                    SIGNAL LOST
                  </motion.span>
                </motion.div>

                <motion.div
                  animate={profile.reducedMotion ? undefined : { backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                  transition={profile.reducedMotion ? undefined : { duration: 8, repeat: Infinity, ease: "linear" }}
                  className="mt-5 max-w-2xl bg-[linear-gradient(90deg,rgba(255,255,255,0.92)_0%,rgba(201,247,255,0.88)_28%,rgba(255,255,255,0.92)_56%,rgba(228,240,255,0.88)_100%)] bg-[length:220%_100%] bg-clip-text text-sm leading-7 text-transparent md:text-base"
                >
                  You entered a broken digital dimension. Jump through corrupted code and reconnect to Softgenix.
                </motion.div>
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-24 z-10 flex flex-col items-end gap-3 md:right-8 md:top-28 lg:right-12">
            <motion.div
              initial={{ opacity: 0, x: 18, scale: 0.94 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-none relative h-28 w-28 rounded-full"
            >
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.16),rgba(255,255,255,0.03)_52%,rgba(255,255,255,0.02)_100%)] backdrop-blur-2xl ring-1 ring-white/12" />
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
                <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="url(#scoreRing)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray={302}
                  animate={{ strokeDashoffset: 302 - 302 * scoreProgress }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient id="scoreRing" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#67e8f9" />
                    <stop offset="55%" stopColor="#60a5fa" />
                    <stop offset="100%" stopColor="#ff4fd8" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[9px] uppercase tracking-[0.34em] text-slate-400">Score</div>
                <div className="mt-1 font-display text-3xl text-white">{score}</div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.32 }}
              className="rounded-full bg-white/[0.06] px-4 py-2 text-right shadow-[0_0_42px_rgba(34,211,238,0.08)] backdrop-blur-2xl ring-1 ring-white/10"
            >
              <div className="text-[10px] uppercase tracking-[0.32em] text-slate-500">Best</div>
              <div className="mt-1 font-display text-2xl text-cyan-300">{bestScore}</div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.38 }}
            className="absolute bottom-8 left-4 z-10 max-w-sm md:bottom-10 md:left-8 lg:bottom-12 lg:left-12"
          >
            <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-slate-300">
              {["Controls", "Space", "ArrowUp", "Tap", "Shift   "].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full bg-white/[0.06] px-3 py-1.5 shadow-[0_0_30px_rgba(255,255,255,0.03)] backdrop-blur-xl ring-1 ring-white/10"
                >
                  {chip}
                </span>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="absolute bottom-8 right-4 z-10 flex flex-col gap-3 md:bottom-10 md:right-8 md:flex-row lg:bottom-12 lg:right-12"
          >
            <Button
              variant="hero"
              size="xl"
              className="pointer-events-auto border border-white/14 bg-white text-black shadow-[0_20px_80px_rgba(255,255,255,0.12)]"
              onClick={restartGame}
            >
              <RotateCcw className="h-4 w-4" />
              Restart System
            </Button>
            <Button
              asChild
              variant="glass"
              size="xl"
              className="pointer-events-auto border border-cyan-300/16 bg-white/[0.06] text-white backdrop-blur-xl"
            >
              <Link to="/">
                <ArrowLeft className="h-4 w-4" />
                Return Home
              </Link>
            </Button>
            {!profile.mobile ? (
              <Button
                variant="glass"
                size="icon"
                className="pointer-events-auto border border-white/10 bg-white/[0.05] text-white backdrop-blur-xl"
                onClick={() => setMuted((current) => !current)}
                aria-label={muted ? "Unmute audio" : "Mute audio"}
              >
                {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            ) : null}
          </motion.div>
        </motion.div>

        <AnimatePresence>
          {!introReady ? (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, delay: 0.48, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.22),rgba(2,4,12,0.94)_42%,rgba(1,2,8,1)_72%)]"
            >
              <motion.div
                initial={{ opacity: 0.9, scale: 0.92 }}
                animate={{ opacity: 0, scale: 1.14 }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="font-display text-[clamp(6rem,18vw,15rem)] tracking-[-0.1em] text-white/18">404</div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {gameOver ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 z-30 flex items-center justify-center bg-[radial-gradient(circle_at_center,rgba(6,10,26,0.36),rgba(0,0,0,0.68)_72%)] px-6 backdrop-blur-md"
            >
              <motion.div
                initial={{ opacity: 0, y: 28, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-3xl text-center"
              >
                <motion.div
                  animate={profile.reducedMotion ? undefined : { opacity: [1, 0.86, 1, 0.9, 1], x: [0, 1, -1, 0] }}
                  transition={profile.reducedMotion ? undefined : { duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="font-display text-[clamp(3.2rem,10vw,8rem)] font-semibold leading-[0.88] tracking-[-0.08em] text-white"
                >
                  CONNECTION
                  <span className="block bg-[linear-gradient(90deg,#67e8f9_0%,#60a5fa_34%,#a855f7_72%,#ff4fd8_100%)] bg-clip-text text-transparent">
                    LOST
                  </span>
                </motion.div>
                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-slate-300 md:text-base">
                  Corrupted shards overwhelmed the recovery signal. Reboot the system and re-enter the Softgenix dimension.
                </p>

                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                  <div className="rounded-full bg-white/[0.06] px-4 py-2 backdrop-blur-xl ring-1 ring-white/10">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Final</span>
                    <span className="ml-3 font-display text-2xl text-white">{score}</span>
                  </div>
                  <div className="rounded-full bg-white/[0.06] px-4 py-2 backdrop-blur-xl ring-1 ring-white/10">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-slate-500">Best</span>
                    <span className="ml-3 font-display text-2xl text-cyan-300">{bestScore}</span>
                  </div>
                </div>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Button variant="hero" size="xl" className="pointer-events-auto" onClick={restartGame}>
                    <RotateCcw className="h-4 w-4" />
                    Restart System
                  </Button>
                  <Button asChild variant="glass" size="xl" className="pointer-events-auto border border-cyan-300/16 bg-white/[0.06]">
                    <Link to="/">
                      <ArrowLeft className="h-4 w-4" />
                      Return Home
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </section>
    </main>
  );
};

export default CyberRunner404;
