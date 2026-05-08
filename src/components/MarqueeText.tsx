import { motion } from "framer-motion";

type MarqueeDirection = "left" | "right";
type MarqueeVariant = "fill" | "outline";

type MarqueeTokenProps = {
  text: string;
  variant: MarqueeVariant;
};

type MarqueeRowProps = {
  text: string;
  direction: MarqueeDirection;
  firstVariant: MarqueeVariant;
};

const typographyStyle = {
  fontFamily: '"Arial Black", Impact, "Anton", "Archivo Black", sans-serif',
  fontSize: "clamp(3.15rem, 7.4vw, 7.9rem)",
  fontWeight: 900,
  lineHeight: 0.86,
  letterSpacing: "-0.045em",
  textTransform: "uppercase" as const,
  whiteSpace: "nowrap" as const,
  textRendering: "geometricPrecision" as const,
  WebkitFontSmoothing: "antialiased" as const,
  MozOsxFontSmoothing: "grayscale" as const,
};

const fillStyle = {
  ...typographyStyle,
  color: "#ffffff",
};

const outlineStyle = {
  ...typographyStyle,
  color: "transparent",
  WebkitTextStroke: "1.35px rgba(255,255,255,0.95)",
};

const MarqueeToken = ({ text, variant }: MarqueeTokenProps) => {
  return (
    <span
      className="block shrink-0"
      style={{
        ...(variant === "fill" ? fillStyle : outlineStyle),
        marginRight: "0.08em",
      }}
    >
      {text}
    </span>
  );
};

const MarqueeRow = ({
  text,
  direction,
  firstVariant,
}: MarqueeRowProps) => {
  const secondVariant = firstVariant === "fill" ? "outline" : "fill";

  const rowSet = (
    <div className="flex shrink-0 items-center">
      <MarqueeToken text={text} variant={firstVariant} />
      <MarqueeToken text={text} variant={secondVariant} />
    </div>
  );

  return (
    <div className="overflow-hidden">
      <motion.div
        className="flex w-max will-change-transform"
        style={{ transform: "translate3d(0,0,0)" }}
        animate={{
          x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
        }}
        transition={{
          duration: 24,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {rowSet}
        {rowSet}
      </motion.div>
    </div>
  );
};

const MarqueeText = () => {
  return (
    <section
      aria-label="Typography marquee"
      className="relative z-[5] w-screen overflow-hidden bg-transparent"
      style={{
        marginLeft: "calc(50% - 50vw)",
        height: "clamp(242px, 33.5vh, 382px)",
      }}
    >
      <div className="flex h-full flex-col justify-center gap-[0.18em] overflow-hidden pt-[0.7em] pb-[1.05em]">
        <div>
          <MarqueeRow
            text="SOFTGENIXDIGITALPOWER"
            direction="left"
            firstVariant="fill"
          />
        </div>

        <MarqueeRow
          text="EXPERIENCEBEYONDINTERFACE"
          direction="right"
          firstVariant="outline"
        />
      </div>
    </section>
  );
};

export default MarqueeText;
