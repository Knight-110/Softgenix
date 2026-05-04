import { useEffect, useMemo, useRef } from "react";

type Props = {
  text: string;
  className?: string;
  interval?: number;
};

const AnimatedLoopText = ({ text, className = "", interval = 1000 }: Props) => {
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  const letters = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    const items = letterRefs.current.filter(
      (el): el is HTMLSpanElement => !!el && !!el.dataset.original?.trim()
    );

    const animate = () => {
      const count = Math.max(2, Math.floor(items.length * 0.28));

      const selected = [...items]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      selected.forEach((letter, i) => {
        if (letter.dataset.animating === "true") return;

        letter.dataset.animating = "true";

        const track = letter.querySelector(".loop-letter-track") as HTMLSpanElement;
        if (!track) return;

        const delay = i * 45;

        const start = window.setTimeout(() => {
          track.style.transition = "none";
          track.style.transform = "translate3d(0, 0, 0)";

          requestAnimationFrame(() => {
            track.style.transition =
              "transform 0.82s cubic-bezier(0.16, 1, 0.3, 1)";
             track.style.transform = "translate3d(0, -1.15em, 0)";
          });

          const end = window.setTimeout(() => {
            track.style.transition = "none";
            track.style.transform = "translate3d(0, 0, 0)";
            letter.dataset.animating = "false";
          }, 880);

          timers.current.push(end);
        }, delay);

        timers.current.push(start);
      });
    };

    const loop = window.setInterval(animate, interval);
    const first = window.setTimeout(animate, 500);

    timers.current.push(first);

    return () => {
      window.clearInterval(loop);
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };
  }, [interval]);

  return (
<span className={`animated-loop-text ${className}`} aria-label={text}>
  <span className="animated-loop-underline" aria-hidden="true">
    {letters.map((char, index) => (
      <span
        key={`underline-${char}-${index}`}
        className={`underline-piece ${
          char.toLowerCase() === "g" ? "is-gap" : ""
        }`}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    ))}
  </span>

  {letters.map((char, index) => (
    <span
      key={`${char}-${index}`}
      ref={(el) => {
        letterRefs.current[index] = el;
      }}
      className="animated-loop-letter"
      data-original={char}
      aria-hidden="true"
    >
      {char === " " ? (
        "\u00A0"
      ) : (
        <span className="loop-letter-window">
          <span className="loop-letter-track">
            <span>{char}</span>
            <span>{char}</span>
          </span>
        </span>
      )}
    </span>
  ))}
</span>
  );
};

export default AnimatedLoopText;