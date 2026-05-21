import React, { useState, useEffect, useRef } from 'react';

const API_BASE = 'https://individual.poisson.com.br/api/public';

export type Book = {
  id: string;
  title: string;
  author: string;
  cover: string;
  excerpt: string;
  href: string;
};

interface OrbitalCarouselProps {
  books?: Book[];
}

function parseAutores(raw: string | null | undefined): string {
  if (!raw) return 'Editora Poisson';
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr) && arr.length > 0) {
      const first = arr[0];
      const name = typeof first === 'string' ? first : (first?.nome ?? first?.name ?? first?.autor ?? String(first));
      return arr.length === 1 ? name : `${name} et al.`;
    }
  } catch { /* not JSON */ }
  return String(raw).split(',')[0].trim();
}

export const OrbitalCarousel: React.FC<OrbitalCarouselProps> = ({ books: propBooks }) => {
  const [books, setBooks] = useState<Book[]>(propBooks ?? []);
  const [angle, setAngle] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (propBooks && propBooks.length > 0) return;
    fetch(`${API_BASE}/livros/all`)
      .then(r => r.json())
      .then((data: Array<{ id: string; titulo: string | null; autores: string | null; capa: string | null; resumo: string | null }>) => {
        const latest = data
          .filter(b => b.capa)
          .slice(0, 9)
          .map(b => ({
            id: b.id,
            title: b.titulo ?? 'Sem título',
            author: parseAutores(b.autores),
            cover: b.capa!,
            excerpt: (b.resumo ?? '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 200),
            href: `https://editorapoisson.com.br/biblioteca/?id=${encodeURIComponent(b.id)}`,
          }));
        setBooks(latest);
      })
      .catch(() => { /* silently fail, keeps propBooks or empty */ });
  }, []);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined && !paused) {
      const deltaTime = time - lastTimeRef.current;
      setAngle((prevAngle) => (prevAngle + deltaTime / 40) % 360);
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [paused]);

  const handleBookClick = (index: number, z: number) => {
    if (z > 150) {
      setPaused(true);
      setSelected(index);
    }
  };

  const handleClose = () => {
    setSelected(null);
    setPaused(false);
  };

  return (
    <div 
      className="relative w-full flex flex-col items-center justify-center overflow-visible select-none"
      style={{ 
        ['--background' as any]: 'var(--background, #0d0d0d)',
        ['--foreground' as any]: 'var(--foreground, #ffffff)',
        ['--muted-foreground' as any]: 'var(--muted-foreground, #a1a1aa)',
        ['--neon' as any]: 'var(--neon, #ff3c00)',
      } as React.CSSProperties}
    >
      <div 
        className="relative w-full h-[300px] md:h-[400px] flex items-center justify-center"
        style={{ perspective: '1000px' }}
      >
        {books.map((book, i) => {
          const a = angle + (i / books.length) * 360;
          const rad = (a * Math.PI) / 180;
          
          const radiusX = windowWidth < 768 ? windowWidth / 2 - 20 : 300;
          const radiusZ = windowWidth < 768 ? radiusX * 0.5 : 220;
          
          const x = Math.sin(rad) * radiusX;
          const z = Math.cos(rad) * radiusZ;
          const scale = 0.45 + (z + 220) / 650;
          const opacity = Math.max(0.1, (z + 220) / 440);
          const blur = z < -60 ? Math.min(4, (-z - 60) / 40) : 0;
          const zIndex = Math.round(z + 220);

          const isFront = z > 150;
          const isSelected = selected === i;
          const dimOthers = selected !== null && !isSelected;

          return (
            <div
              key={book.id}
              role="button"
              tabIndex={isFront ? 0 : -1}
              onClick={() => handleBookClick(i, z)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleBookClick(i, z)}
              className={`absolute transition-all duration-300 ease-out rounded-md overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.45)]
                ${isFront ? 'cursor-pointer' : 'cursor-default'}
                ${dimOthers ? 'opacity-[0.15] blur-[3px]' : ''}
              `}
              style={{
                width: windowWidth < 768 ? '100px' : '180px',
                height: windowWidth < 768 ? '150px' : '260px',
                transform: `translateX(${x}px) scale(${scale})`,
                filter: `blur(${blur}px)`,
                opacity: dimOthers ? 0.15 : opacity,
                zIndex: zIndex,
                display: isSelected ? 'none' : 'block',
                backgroundSize: 'cover',
                backgroundImage: `url(${book.cover})`,
                backgroundPosition: 'center'
              }}
              aria-label={book.title}
            >
              {isFront && (
                <div className="absolute inset-0 bg-white/5 hover:bg-transparent transition-colors" />
              )}
            </div>
          );
        })}

        {selected !== null && (
          <div className="absolute inset-0 z-[1000] flex items-center justify-center animate-in fade-in duration-300">
            <FlipCard 
              book={books[selected]} 
              onClose={handleClose} 
            />
          </div>
        )}
      </div>

      <div className="mt-12 h-10 flex items-center">
        {selected === null ? (
          <p className="text-[9px] font-mono uppercase tracking-[0.25em] text-muted-foreground animate-pulse text-center px-4">
            Clique na capa frontal para ver detalhes
          </p>
        ) : (
          <button
            onClick={handleClose}
            className="flex items-center space-x-2 px-6 py-2 rounded-full border border-white/10 bg-white/5 text-foreground hover:bg-white/10 transition-all text-[10px] font-mono uppercase tracking-[0.15em]"
          >
            <span>← Voltar ao carrossel</span>
          </button>
        )}
      </div>
    </div>
  );
};

const FlipCard: React.FC<{ book: Book; onClose: () => void }> = ({ book, onClose }) => {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFlipped(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div 
      className="relative w-[320px] h-[465px]"
      style={{ perspective: '800px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <div 
        className="relative w-full h-full transition-transform duration-700 preserve-3d cursor-pointer"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.55)) drop-shadow(0 0 40px color-mix(in oklab, var(--neon) 40%, transparent))'
        }}
      >
        <div 
          className="absolute inset-0 rounded-lg overflow-hidden backface-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <img 
            src={book.cover} 
            alt={book.title} 
            className="w-full h-full object-cover"
            draggable={false}
          />
        </div>

        <div
          className="absolute inset-0 rounded-lg overflow-hidden flex flex-col justify-between p-5"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(160deg, #1a2845 0%, #0d1b2e 60%, #080f1a 100%)',
            border: '1px solid rgba(255,255,255,0.07)'
          }}
        >
          {/* top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, #ff3c00 40%, #ff3c00 60%, transparent)' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, lineHeight: 1.3, color: '#ffffff', fontFamily: 'Georgia, serif', margin: 0 }}>
              {book.title}
            </h3>
            <p style={{ fontSize: '10px', lineHeight: 1.7, color: '#94a3b8', margin: 0, display: '-webkit-box', WebkitLineClamp: 6, WebkitBoxOrient: 'vertical', overflow: 'hidden' } as React.CSSProperties}>
              {book.excerpt}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '8px', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#475569' }}>
              Org: {book.author}
            </span>
            <a
              href={book.href}
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'block',
                padding: '9px 0',
                textAlign: 'center',
                fontSize: '9px',
                fontFamily: 'monospace',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.18em',
                borderRadius: '4px',
                background: 'linear-gradient(90deg, #c42d00, #ff3c00)',
                color: '#ffffff',
                textDecoration: 'none'
              }}
            >
              Ver mais Detalhes →
            </a>
          </div>
        </div>
      </div>

      <button
        aria-label="Fechar"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute -top-3 -right-3 w-8 h-8 rounded-full border border-white/15 bg-black/90 backdrop-blur flex items-center justify-center z-[1100] hover:scale-110 transition-transform"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
};
