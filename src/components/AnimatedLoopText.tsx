import { useEffect, useMemo, useRef } from "react";

type Props = {
  text: string;
  className?: string;
  interval?: number;
};

const AnimatedLoopText = ({ text, className = "", interval = 1800 }: Props) => {
  const rootRef = useRef<HTMLSpanElement | null>(null);
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const timers = useRef<number[]>([]);

  const letters = useMemo(() => text.split(""), [text]);

  useEffect(() => {
    const items = letterRefs.current.filter(
      (el): el is HTMLSpanElement => !!el && !!el.dataset.original?.trim()
    );

    if (!items.length) return;

    const clearTimers = () => {
      timers.current.forEach(window.clearTimeout);
      timers.current = [];
    };

    const animate = () => {
      const root = rootRef.current;

      if (root) {
        root.classList.remove("underline-active");
        void root.offsetWidth;
        root.classList.add("underline-active");

        const underlineEnd = window.setTimeout(() => {
          root.classList.remove("underline-active");
        }, 1320);

        timers.current.push(underlineEnd);
      }

      const count = Math.max(2, Math.floor(items.length * 0.3));

      const selected = [...items]
        .map((el, index) => ({ el, index, score: Math.random() }))
        .sort((a, b) => a.score - b.score)
        .slice(0, count)
        .sort((a, b) => a.index - b.index);

      selected.forEach(({ el: letter }, i) => {
        if (letter.dataset.animating === "true") return;

        const track = letter.querySelector(
          ".loop-letter-track"
        ) as HTMLSpanElement | null;

        if (!track) return;

        letter.dataset.animating = "true";

        const delay = i * 70;

        const start = window.setTimeout(() => {
          track.style.transition = "none";
          track.style.transform = "translate3d(0, 0, 0)";

          requestAnimationFrame(() => {
            track.style.transition =
              "transform 0.86s cubic-bezier(0.22, 1, 0.36, 1)";
            track.style.transform = "translate3d(0, -1.12em, 0)";
          });

          const settle = window.setTimeout(() => {
            track.style.transition =
              "transform 0.34s cubic-bezier(0.16, 1, 0.3, 1)";
            track.style.transform = "translate3d(0, -1.05em, 0)";
          }, 580);

          const end = window.setTimeout(() => {
            track.style.transition = "none";
            track.style.transform = "translate3d(0, 0, 0)";
            letter.dataset.animating = "false";
          }, 1220);

          timers.current.push(settle, end);
        }, delay);

        timers.current.push(start);
      });
    };

    const first = window.setTimeout(animate, 500);
    const loop = window.setInterval(animate, interval);

    timers.current.push(first);

    return () => {
      window.clearInterval(loop);
      clearTimers();
    };
  }, [interval]);

  return (
    <span
      ref={rootRef}
      className={`animated-loop-text ${className}`}
      aria-label={text}
    >
      <span className="animated-loop-underline" aria-hidden="true">
        {letters.map((char, index) => (
          <span
            key={`underline-${char}-${index}`}
            className={`underline-piece ${
              "gjpqy".includes(char.toLowerCase()) ? "is-gap" : ""
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