import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, useState, useEffect, type CSSProperties } from "react";
import type { LibraryBook } from "@/lib/library/data";
import { usePointerFine } from "@/hooks/use-pointer-fine";

interface BookCoverProps {
  book: LibraryBook;
  index: number;
  onOpen: (book: LibraryBook) => void;
  isFavorited: boolean;
  onToggleFavorite: (id: string | number) => void;
}

const HeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7z"/></svg>
);

const HeartFilledIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.5 4.04 3 5.5l7 7z"/></svg>
);

/**
 * Editorial book card — generated cover (no images), 3D tilt on cursor,
 * neon-rim glow on hover, and a Lusion-style mask reveal on first paint.
 * Added: Skeleton loading and Favorites system.
 */
export function BookCover({ book, index, onOpen, isFavorited, onToggleFavorite }: BookCoverProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const fine = usePointerFine();
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true);
    }
  }, []);

  const px = useMotionValue(0); // -1..1
  const py = useMotionValue(0);

  const rx = useSpring(useTransform(py, [-1, 1], [10, -10]), { stiffness: 180, damping: 20 });
  const ry = useSpring(useTransform(px, [-1, 1], [-12, 12]), { stiffness: 180, damping: 20 });
  const glowX = useTransform(px, [-1, 1], ["20%", "80%"]);
  const glowY = useTransform(py, [-1, 1], ["20%", "80%"]);

  const handleMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!fine || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };
  const reset = () => {
    px.set(0);
    py.set(0);
  };

  const coverStyle: CSSProperties = {
    background: `linear-gradient(135deg, ${book.palette[0]} 0%, ${book.palette[1]} 100%)`,
  };

  return (
    <motion.button
      ref={ref}
      type="button"
      onPointerMove={handleMove}
      onPointerLeave={reset}
      onClick={() => onOpen(book)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.7,
        delay: Math.min(index, 12) * 0.03,
        ease: [0.16, 1, 0.3, 1],
      }}
      style={{
        rotateX: rx,
        rotateY: ry,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
      }}
      className="group relative aspect-[2/3] w-full text-left rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 book-depth-card"
      aria-label={`${book.title} — ${book.author}`}
    >
      {/* glow halo */}
      <motion.span
        aria-hidden
        style={{
          background: `radial-gradient(circle at ${glowX.get()} ${glowY.get()}, oklch(0.85 0.18 200 / 0.55), transparent 60%)`,
        }}
        className="absolute -inset-3 rounded-2xl opacity-0 group-hover:opacity-100 blur-2xl transition-opacity duration-500"
      />

      {/* favorite button */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(book.id);
        }}
        className={`absolute top-2 right-2 z-20 p-1.5 rounded-full glass transition-colors ${
          isFavorited ? "text-orange-500" : "text-white/50 hover:text-white"
        }`}
        role="button"
        aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      >
        {isFavorited ? <HeartFilledIcon /> : <HeartIcon />}
      </div>

      {/* the cover */}
      <div
        style={coverStyle}
        className="absolute inset-0 rounded-md overflow-hidden shadow-deep ring-1 ring-white/10"
      >
        {book.cover && (
          <img
            ref={imgRef}
            src={book.cover}
            alt=""
            loading={index < 6 ? "eager" : "lazy"}
            onLoad={() => setIsLoaded(true)}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 opacity-100`}
          />
        )}
        {/* paper grain */}
        <div
          className="absolute inset-0 opacity-[0.18] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 20%, rgba(255,255,255,0.5) 0, transparent 40%), radial-gradient(circle at 70% 80%, rgba(0,0,0,0.5) 0, transparent 50%)",
          }}
        />
        {/* foil sheen */}
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background:
              "linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
            transform: "translateZ(20px)",
          }}
        />

        {/* gradient legibility scrim when a real cover exists */}
        {book.cover && (
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30 pointer-events-none"
          />
        )}

        {/* spine label */}
        <div className="absolute top-1 left-1 right-1 flex items-center justify-between font-mono text-[5px] tracking-[0.2em] uppercase text-white/80 z-[1]">
          <span className="truncate">{book.spine}</span>
          <span>{book.year}</span>
        </div>

        {/* title block */}
        <div className="absolute inset-x-1 bottom-1 text-white z-[1]">
          <p className="font-display text-[8px] leading-[1.05] text-balance drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] line-clamp-3">
            {book.title}
          </p>
        </div>

        {/* hairline grid overlay */}
        {!book.cover && <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "50% 100%",
            backgroundPosition: "left",
          }}
        />}
      </div>

      {/* meta strip below */}
      <div className="absolute -bottom-4 left-0 right-0 flex items-center justify-center font-mono text-[7px] tracking-[0.2em] uppercase text-muted-foreground opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-500 ease-out-expo">
        <span className="truncate">{book.author}</span>
      </div>
    </motion.button>
  );
}