import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZÆÐØΣΔΩ#@%&*+=<>/\\";

interface ScrambleHeadingProps {
  words: string[];
  className?: string;
  baseDelay?: number;
}

/**
 * Editorial display heading: each word "scrambles" into place,
 * letter by letter, with a short kinetic settle. Reduced-motion safe.
 */
export function ScrambleHeading({ words, className, baseDelay = 0.15 }: ScrambleHeadingProps) {
  const italicIndex = words.length - 1;
  return (
    <h1 className={className}>
      {words.map((word, wi) => (
        <span key={word + wi} className="block overflow-hidden pb-1">
          <ScrambleWord word={word} delay={baseDelay + wi * 0.18} italic={wi === italicIndex} />
        </span>
      ))}
    </h1>
  );
}

function ScrambleWord({
  word,
  delay,
  italic,
}: {
  word: string;
  delay: number;
  italic?: boolean;
}) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [text, setText] = useState(word);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || reduced) {
      setText(word);
      return;
    }
    const start = performance.now() + delay * 1000;
    const duration = 850 + word.length * 35;
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.max(0, Math.min(1, (now - start) / duration));
      const revealed = Math.floor(t * word.length);
      let out = "";
      for (let i = 0; i < word.length; i++) {
        if (i < revealed || word[i] === " ") out += word[i];
        else out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setText(out);
      if (t < 1) raf = requestAnimationFrame(tick);
      else setText(word);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [word, delay, reduced, mounted]);

  return (
    <motion.span
      className="inline-block"
      initial={{ y: "110%" }}
      animate={{ y: 0 }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {italic ? <em className="italic">{text}</em> : text}
    </motion.span>
  );
}