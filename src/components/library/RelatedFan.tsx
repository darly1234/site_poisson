import { useEffect, useRef, useState } from "react";
import { enrichBook, type LibraryBook } from "@/lib/library/data";

interface RelatedFanProps {
  books: LibraryBook[];
  onSelectBook?: (b: LibraryBook) => void;
}

/**
 * Stack → Fan → Selection
 * - Inicia empilhado, abre em leque com transição CSS suave (cubic-bezier).
 * - Ao clicar: capa selecionada centraliza-se à esquerda; metadados surgem à direita.
 */
export function RelatedFan({ books, onSelectBook }: RelatedFanProps) {
  const [fanned, setFanned] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [returning, setReturning] = useState<number | null>(null);
  const [returnPhase, setReturnPhase] = useState<"lift" | "drop" | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const total = books.length;
  const mid = (total - 1) / 2;

  // Open the fan when the section scrolls into view
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    // Find the nearest scrollable ancestor (the modal body) so the IO
    // computes intersections relative to it instead of the viewport.
    let root: Element | null = el.parentElement;
    while (root && root !== document.body) {
      const style = getComputedStyle(root);
      if (/(auto|scroll|overlay)/.test(style.overflowY)) break;
      root = root.parentElement;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.15) {
            setFanned(true);
          }
        }
      },
      { root: root && root !== document.body ? root : null, threshold: [0, 0.15, 0.4] },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (total === 0) return null;

  const hasSelection = selected !== null;
  const selectedBook = hasSelection ? enrichBook(books[selected]) : null;

  const handleDeselect = () => {
    if (selected === null) return;
    const idx = selected;
    setReturning(idx);
    setReturnPhase("lift");
    // Phase 1: card lifts up & rotates above the fan (clears the other covers)
    // Phase 2: card drops into its slot
    window.setTimeout(() => {
      setSelected(null);
      setReturnPhase("drop");
    }, 380);
    window.setTimeout(() => {
      setReturning(null);
      setReturnPhase(null);
    }, 380 + 600);
  };

  return (
    <div className="flex w-full flex-col items-center">
      {/* Stage com leque */}
      <div
        ref={stageRef}
        className="relative flex w-full items-center justify-center"
        style={{ height: 380, perspective: "1400px" }}
      >
        {books.map((book, i) => {
          const offset = i - mid;
          const isSelected = selected === i;

          // Fase: empilhado
          const stackX = i * 3;
          const stackY = i * -2;
          const stackRot = i * 0.5;

          // Fase: leque aberto
          const fanX = offset * 78;
          const fanY = Math.abs(offset) * 9;
          const fanRot = offset * 4;

          // Fase: encolhido (quando outra está selecionada)
          const colX = offset * 30;
          const colScale = 0.5;

          let transform: string;
          let opacity = 1;
          let filter = "blur(0px)";
          let zIndex = total - Math.abs(Math.round(offset));

          const naturalZ = total - Math.abs(Math.round(offset));
          if (!fanned) {
            transform = `translateX(${stackX}px) translateY(${stackY}px) rotate(${stackRot}deg) scale(0.96)`;
            zIndex = total - i;
          } else if (!hasSelection) {
            transform = `translateX(${fanX}px) translateY(${fanY}px) rotate(${fanRot}deg) scale(1)`;
            // While dropping into the slot, keep the card's NATURAL z-index so
            // it tucks behind front-most siblings as it descends — like placing
            // a physical card back into a fan. No ghosting through covers.
            zIndex = naturalZ;
          } else if (isSelected) {
            if (returnPhase === "lift") {
              // Lift the card up to ABOVE its own slot (already aligned in X
              // and rotation), so the drop is purely vertical into place.
              transform = `translateX(${fanX}px) translateY(${fanY - 180}px) rotate(${fanRot}deg) scale(1.06)`;
            } else {
              transform = `translateX(-180px) translateY(0px) rotate(0deg) scale(1.05)`;
            }
            zIndex = 100;
          } else {
            transform = `translateX(${colX}px) translateY(40px) rotate(0deg) scale(${colScale})`;
            opacity = 0.18;
            filter = "blur(4px)";
          }

          return (
            <div
              key={book.id}
              className="absolute"
              style={{
                transformOrigin: "bottom center",
                transform,
                opacity,
                filter,
                zIndex,
                transition:
                  "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease, filter 0.35s ease",
                transitionDelay:
                  !fanned
                    ? "0ms"
                    : hasSelection
                      ? "0ms"
                      : returning !== null
                        ? "0ms"
                        : `${i * 25}ms`,
                cursor: fanned && !hasSelection ? "pointer" : "default",
                willChange: "transform, opacity, filter",
              }}
              onClick={() => {
                if (fanned && !hasSelection) setSelected(i);
              }}
            >
              <div
                style={{
                  width: 170,
                  height: 250,
                  background: `linear-gradient(135deg, ${book.palette[0]} 0%, ${book.palette[1]} 100%)`,
                  boxShadow: fanned
                    ? "0 16px 44px rgba(0,0,0,0.5)"
                    : "0 2px 10px rgba(0,0,0,0.3)",
                }}
                className="relative overflow-hidden rounded-md ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-2 hover:rotate-3"
              >
                {book.cover && (
                  <img
                    src={book.cover}
                    alt={book.title}
                    draggable={false}
                    decoding="async"
                    loading="eager"
                    className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                  />
                )}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 55%)",
                  }}
                />
              </div>
            </div>
          );
        })}

        {/* Backdrop para fechar ao clicar fora */}
        {hasSelection && (
          <div 
            className="absolute inset-0 z-[50] cursor-pointer" 
            onClick={handleDeselect}
          />
        )}

        {/* Painel lateral de metadados — renderizado fora do mapa para garantir visibilidade */}
        {hasSelection && selectedBook && (
          <div
            className="pointer-events-auto absolute"
            style={{
              left: "50%",
              top: "50%",
              transform: "translate(20px, -50%)",
              zIndex: 110,
              maxWidth: 320,
              animation: "fade-in 0.5s ease-out 0.25s both",
            }}
          >
            <div className="flex flex-col">
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[var(--neon)]">
                {selectedBook.spine} · {selectedBook.year}
              </span>
              <h4 className="mt-3 font-display text-2xl leading-tight tracking-tight text-foreground text-balance">
                {selectedBook.title}
              </h4>
              <p className="mt-3 font-mono text-[11px] tracking-[0.22em] uppercase text-muted-foreground">
                {selectedBook.author}
              </p>

              <div
                className="mt-5 h-[2px] w-12 rounded-sm"
                style={{
                  background:
                    "linear-gradient(90deg, color-mix(in oklab, var(--neon) 80%, black 20%), var(--neon))",
                }}
              />

              <dl className="mt-5 space-y-3">
                <div>
                  <dt className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground/80">
                    ISBN
                  </dt>
                  <dd className="mt-1 font-mono text-xs tracking-wide text-foreground/90 break-all">
                    {selectedBook.isbn}
                  </dd>
                </div>
                <div>
                  <dt className="font-mono text-[9px] tracking-[0.3em] uppercase text-muted-foreground/80">
                    DOI
                  </dt>
                  <dd className="mt-1 font-mono text-xs tracking-wide break-all">
                    <a
                      href={`https://doi.org/${selectedBook.doi}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-foreground/90 transition hover:text-[var(--neon)] hover:underline"
                    >
                      {selectedBook.doi}
                    </a>
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => onSelectBook?.(books[selected!])}
                className="mt-6 self-start rounded-full px-5 py-2.5 text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-white transition hover:brightness-110 cursor-pointer"
                style={{
                  background:
                    "linear-gradient(90deg, color-mix(in oklab, var(--neon) 70%, black 30%), var(--neon))",
                }}
              >
                Veja mais detalhes
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Controle */}
      <div className="mt-4 flex items-center gap-3">
        {!hasSelection ? (
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
            Clique em uma capa para abrir
          </p>
        ) : (
          <button
            type="button"
            onClick={handleDeselect}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground"
          >
            ← Voltar ao leque
          </button>
        )}
      </div>
    </div>
  );
}