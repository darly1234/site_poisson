import React, { useState, useEffect, useMemo, forwardRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

const Mail = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8 5.33a2 2 0 0 1-2 0L2 7"/></svg>
);
const Instagram = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const X = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

const API_BASE = 'https://individual.poisson.com.br/api/public';

type Post = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string;
  category: string;
  status: string;
  published_at: string;
  color?: string;
};

const COLORS = ['#ff5f1f', '#2563eb', '#10b981', '#8b5cf6', '#f59e0b'];

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const update = (e: MouseEvent) => setMousePosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', update);
    return () => window.removeEventListener('mousemove', update);
  }, []);
  return mousePosition;
};

const PostCard = forwardRef<HTMLDivElement, { post: Post; index: number; onHover: (v: boolean) => void; onClick: () => void }>(
  ({ post, index, onHover, onClick }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const color = post.color || COLORS[index % COLORS.length];

    const formattedDate = post.published_at
      ? new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()
      : '';

    return (
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
        onMouseEnter={() => { setIsHovered(true); onHover(true); }}
        onMouseLeave={() => { setIsHovered(false); onHover(false); }}
        onClick={onClick}
        className="group relative cursor-none"
      >
        <div className="overflow-hidden aspect-[16/9] relative bg-neutral-900 rounded-sm">
          {post.cover_image ? (
            <motion.img
              animate={{ scale: isHovered ? 1.1 : 1 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              src={post.cover_image.startsWith('/') ? `https://individual.poisson.com.br${post.cover_image}` : post.cover_image}
              alt={post.title}
              className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 opacity-60 group-hover:opacity-100"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: `${color}22` }}>
              <span className="text-4xl font-black text-white/20">{post.title[0]}</span>
            </div>
          )}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none"
            style={{ backgroundColor: color }}
          />
          <div className="absolute top-8 left-8 overflow-hidden">
            <motion.span
              initial={{ y: '100%' }}
              animate={{ y: isHovered ? 0 : '100%' }}
              className="block px-4 py-1.5 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em]"
            >
              {post.category}
            </motion.span>
          </div>
        </div>

        <div className="mt-10 space-y-4">
          <div className="flex items-center gap-4 text-[10px] text-neutral-400 font-bold uppercase tracking-[0.3em]">
            <span>{formattedDate}</span>
            <div className="h-[1px] flex-1 bg-neutral-100 group-hover:bg-neutral-300 transition-colors" />
          </div>
          <h3 className="text-3xl md:text-4xl font-black leading-[1.05] tracking-tighter text-neutral-900 group-hover:text-black transition-colors">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2">{post.excerpt}</p>
          )}
          <motion.div
            className="w-full h-1 origin-left"
            animate={{ scaleX: isHovered ? 1 : 0, backgroundColor: isHovered ? color : '#000' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </motion.div>
    );
  }
);
PostCard.displayName = 'PostCard';

function PostModal({ post, onClose }: { post: Post; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);

  const color = post.color || COLORS[0];
  const formattedDate = post.published_at
    ? new Date(post.published_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9000] flex items-start justify-center bg-black/80 backdrop-blur-sm overflow-y-auto p-4 md:p-10"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative bg-white w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl my-auto"
      >
        {/* Top accent */}
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${color}, transparent)` }} />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-black/10 hover:bg-black/20 transition-colors text-neutral-600"
        >
          <X size={18} />
        </button>

        {/* Cover */}
        {post.cover_image && (
          <img src={post.cover_image.startsWith('/') ? `https://individual.poisson.com.br${post.cover_image}` : post.cover_image} alt={post.title} className="w-full h-56 md:h-72 object-cover" />
        )}

        {/* Content */}
        <div className="px-8 md:px-12 py-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded-full text-white" style={{ backgroundColor: color }}>
              {post.category}
            </span>
            {formattedDate && (
              <span className="text-[11px] text-neutral-400 font-bold uppercase tracking-widest">{formattedDate}</span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tighter leading-tight text-neutral-900 mb-6">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-neutral-500 leading-relaxed mb-8 border-l-4 pl-4" style={{ borderColor: color }}>
              {post.excerpt}
            </p>
          )}

          <div
            className="prose prose-neutral max-w-none text-neutral-700 leading-relaxed text-justify [&_h2]:font-black [&_h2]:tracking-tighter [&_h2]:text-left [&_h3]:font-bold [&_h3]:text-left [&_a]:text-orange-500 [&_img]:rounded-xl [&_img]:my-6"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [isHoveringCard, setIsHoveringCard] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const mouse = useMousePosition();
  const { scrollYProgress } = useScroll();
  const yParallax = useTransform(scrollYProgress, [0, 0.3], [0, -150]);
  const opacityFade = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    fetch(`${API_BASE}/blog`)
      .then(r => r.json())
      .then((data: Post[]) => {
        const withColors = data.map((p, i) => ({ ...p, color: COLORS[i % COLORS.length] }));
        setPosts(withColors);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const cats = ['Todos', ...Array.from(new Set(posts.map(p => p.category).filter(Boolean)))];
    return cats;
  }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'Todos') return posts;
    return posts.filter(p => p.category === selectedCategory);
  }, [posts, selectedCategory]);

  return (
    <div className="bg-[#050505] min-h-screen font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#ff5f1f] selection:text-white overflow-x-hidden">

      {/* Custom Cursor */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full mix-blend-difference pointer-events-none z-[9999] flex items-center justify-center overflow-hidden"
        animate={{
          x: mouse.x - (isHoveringCard ? 45 : 8),
          y: mouse.y - (isHoveringCard ? 45 : 8),
          scale: isHoveringCard ? 6 : 1,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 250, mass: 0.5 }}
      >
        {isHoveringCard && (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[2px] font-black uppercase tracking-tighter text-black">
            LER POST
          </motion.span>
        )}
      </motion.div>

      {/* Hero Section */}
      <section className="relative flex flex-col justify-center pt-40 pb-20 px-6">
        <motion.div style={{ y: yParallax, opacity: opacityFade }} className="z-10 max-w-6xl mx-auto w-full">
          <div className="mb-6 overflow-hidden">
            <motion.span initial={{ y: 50 }} animate={{ y: 0 }} className="block text-[#ff5f1f] text-xs font-black uppercase tracking-[0.5em]">
              Diálogo Editorial
            </motion.span>
          </div>
          <motion.h1
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-white text-7xl md:text-[clamp(3rem,10vw,6.5rem)] font-black tracking-tighter leading-[0.8] mb-8"
          >
            PENSAMENTO<br />
            <span className="text-transparent stroke-text" style={{ WebkitTextStroke: '2px white' } as React.CSSProperties}>EM</span><br />
            <span className="text-[#2563eb]">MOVIMENTO.</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="flex flex-col md:flex-row md:items-end gap-12"
          >
            <p className="text-neutral-500 max-w-sm text-sm font-medium leading-relaxed">
              Reflexões sobre a produção do conhecimento, inovação acadêmica e o impacto da ciência na sociedade moderna.
            </p>
          </motion.div>
        </motion.div>
        <div className="absolute top-1/2 right-[-10%] -translate-y-1/2 w-[60vw] h-[60vw] bg-blue-600/10 blur-[150px] rounded-full" />
      </section>

      {/* Main Content */}
      <main className="relative bg-white rounded-t-[60px] md:rounded-t-[120px] pt-32 pb-48 px-6 -mt-20">
        <div className="max-w-6xl mx-auto">

          {/* Title & Filters */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-32 gap-12">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5f1f] mb-4 block">
                Publicações Recentes
              </span>
              <h2 className="text-6xl md:text-8xl font-black text-black tracking-tighter leading-none">
                Artigos em Destaque
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Categorias removidas a pedido */}
            </div>
          </div>

          {/* Posts Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-2 border-neutral-300 border-t-black rounded-full animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-24 text-neutral-400">
              <p className="text-lg font-bold">Nenhum post encontrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
              <AnimatePresence mode="popLayout">
                {filteredPosts.map((post, idx) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    index={idx}
                    onHover={setIsHoveringCard}
                    onClick={() => setActivePost(post)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Bottom */}
          {filteredPosts.length > 0 && (
            <div className="mt-48 flex flex-col items-center">
              <div className="w-px h-32 bg-neutral-200 mb-12" />
              <div className="text-neutral-400 text-xs font-bold uppercase tracking-[0.5em] text-center">
                {filteredPosts.length} post{filteredPosts.length !== 1 ? 's' : ''} encontrado{filteredPosts.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </div>
      </main>



      {/* Footer */}
      <footer className="bg-[#050505] pt-32 pb-12 px-6 md:px-20 lg:px-32 text-white">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-32">
          <div className="lg:col-span-2">
            <h4 className="text-4xl font-black tracking-tighter mb-8">EDITORA<br />POISSON</h4>
            <p className="text-neutral-500 max-w-xs text-sm">
              Publicações científicas de qualidade, impulsionando o avanço do conhecimento acadêmico no Brasil e no mundo.
            </p>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-8 block">Navegação</span>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li><a href="/" className="hover:text-[#ff5f1f] transition-colors">Início</a></li>
              <li><a href="/biblioteca" className="hover:text-[#ff5f1f] transition-colors">Biblioteca</a></li>
              <li><a href="/blog" className="hover:text-[#ff5f1f] transition-colors">Blog</a></li>
              <li><a href="/chamadas-abertas" className="hover:text-[#ff5f1f] transition-colors">Chamadas</a></li>
            </ul>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-8 block">Contato</span>
            <ul className="space-y-4 text-xs font-bold uppercase tracking-widest">
              <li className="flex items-center gap-2"><Instagram size={14} /> <a href="https://instagram.com/editorapoisson" className="hover:text-[#2563eb] transition-colors">Instagram</a></li>
              <li className="flex items-center gap-2"><Mail size={14} /> <a href="mailto:contato@editorapoisson.com.br" className="hover:text-[#2563eb] transition-colors">E-mail</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-12 border-t border-neutral-900 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">
          <div>© {new Date().getFullYear()} Editora Poisson — Todos os Direitos Reservados</div>
        </div>
      </footer>

      {/* Post Modal */}
      <AnimatePresence>
        {activePost && <PostModal post={activePost} onClose={() => setActivePost(null)} />}
      </AnimatePresence>

      <style>{`.stroke-text { -webkit-text-stroke: 2px white; color: transparent; }`}</style>
    </div>
  );
}
