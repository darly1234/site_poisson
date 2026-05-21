import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, animate } from 'framer-motion';
import { BookOpen, Share2, Award, Zap, Compass, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';
import { BookshelfScene } from './BookshelfScene';

const VALORES = [
  {
    icon: <BookOpen className="text-[#ff5f1f]" size={24} />,
    n: '01',
    titulo: 'Acesso Aberto & Conhecimento Livre',
    texto: 'Acreditamos que o conhecimento científico não deve ser trancado sob barreiras de assinatura. Toda nossa produção é disponibilizada de forma 100% gratuita para leitura, download e difusão imediata.',
  },
  {
    icon: <Share2 className="text-[#2563eb]" size={24} />,
    n: '02',
    titulo: 'Creative Commons (CC-BY 4.0)',
    texto: 'Adotamos a licença internacional padrão ouro CC-BY. O autor retém os direitos autorais de sua obra, permitindo que a pesquisa seja amplamente distribuída, citada, traduzida e compartilhada pelo mundo todo.',
  },
  {
    icon: <Award className="text-[#ff5f1f]" size={24} />,
    n: '03',
    titulo: 'Rigor e Avaliação por Pares',
    texto: 'Todas as submissões passam por uma rigorosa avaliação por especialistas de universidades nacionais e internacionais, garantindo mérito científico de excelência.',
  },
  {
    icon: <Zap className="text-[#2563eb]" size={24} />,
    n: '04',
    titulo: 'Indexação Direta & DOI Permanente',
    texto: 'Cada capítulo e livro recebe um registro de DOI (CrossRef) permanente e indexadores mundiais ativos, permitindo o rastreamento, cálculo de impacto no Google Acadêmico e importação direta para o Currículo Lattes.',
  },
];

const METRICAS = [
  { valor: 1200, suffix: '+', label: 'Títulos Publicados' },
  { valor: 30000, suffix: '+', label: 'Autores Científicos' },
  { valor: 23, suffix: '+', label: 'Países Alcançados' },
  { valor: 450000, suffix: '+', label: 'Downloads Efetuados' },
];

interface StatCounterProps {
  target: number;
  suffix: string;
}

function StatCounter({ target, suffix }: StatCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!inView) return;

    const node = ref.current;
    if (!node) return;

    const controls = animate(0, target, {
      duration: 2.0,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate(value) {
        node.textContent = Math.floor(value).toLocaleString('pt-BR') + suffix;
      }
    });

    return () => controls.stop();
  }, [inView, target, suffix]);

  return <span ref={ref}>{target.toLocaleString('pt-BR') + suffix}</span>;
}

const COLETIVOS = [
  { 
    nome: 'Conselho Editorial Científico', 
    cargo: 'Comitê de Avaliação por Pares', 
    area: 'Mais de 40 doutores pareceristas vinculados a universidades de liderança no Brasil, América Latina e Europa, assegurando imparcialidade e rigor técnico.' 
  },
  { 
    nome: 'Corpo Técnico-Editorial', 
    cargo: 'Produção & Indexação Digital', 
    area: 'Equipe especializada em diagramação ABNT/APA, conversão XML, atribuição de metadados, registro CrossRef (DOI) e submissão a indexadores internacionais.' 
  },
];

export default function Sobre() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const lineH = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={containerRef} className="bg-[#050505] text-white min-h-screen font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#ff5f1f] selection:text-white overflow-x-hidden">
      
      {/* Hero Section */}
      <section className="relative min-h-[75vh] flex flex-col px-6 pt-32 pb-24 overflow-hidden">

        {/* Nuvem 3D de livros */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100vh', pointerEvents: 'none', zIndex: 0 }}>
          <BookshelfScene />
        </div>

        {/* Breathing animated meshes */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, -30, 0] 
            }}
            transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-10 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,#ff5f1f_0%,transparent_70%)] blur-[90px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              x: [0, -40, 0],
              y: [0, 40, 0] 
            }}
            transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute bottom-20 right-10 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle_at_center,#2563eb_0%,transparent_70%)] blur-[100px]"
          />
        </div>

        {/* Main content — flex-1 centers it vertically in the remaining space */}
        <div className="max-w-6xl mx-auto w-full relative z-10 flex-1 flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="inline-block text-[#ff5f1f] text-xs font-black uppercase tracking-[0.4em] bg-[#ff5f1f]/10 px-4 py-1.5 rounded-full border border-[#ff5f1f]/20">
              CONHECIMENTO EM MOVIMENTO · DESDE 2017
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.5rem,8vw,6.5rem)] font-black tracking-tighter leading-[0.98] mb-10"
          >
            CONHECIMENTO<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400 tracking-normal" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}>LIVRE </span><span className="text-[#2563eb]">E</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-100 via-neutral-300 to-neutral-400 tracking-normal" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}> EM</span><br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f1f] via-orange-400 to-[#2563eb] animate-gradient-x">MOVIMENTO.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-neutral-400 text-lg md:text-xl max-w-2xl leading-relaxed font-medium"
          >
            Acreditamos que a ciência só cumpre seu papel quando circula livremente. A Editora Poisson nasceu 
            para quebrar barreiras financeiras e geográficas, levando a produção científica brasileira 
            com qualidade e impacto para o mundo de forma transparente e 100% livre.
          </motion.p>
        </div>

        {/* Scroll Indicator — positioned absolutely at the bottom center, never overlaps content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-30 pointer-events-none"
        >
          <span className="text-[9px] uppercase tracking-[0.4em] text-neutral-500 font-bold">Role para Baixo</span>
          <div className="w-px h-10 bg-gradient-to-b from-neutral-500 to-transparent" />
        </motion.div>
      </section>

      {/* Nossa História & Propósito */}
      <section className="bg-white text-[#050505] px-6 py-32 rounded-t-[60px] md:rounded-t-[100px] -mt-10 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.15)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-16 lg:gap-32 items-start">
            
            {/* Left Content Column */}
            <div className="flex-1">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5f1f] block mb-4">
                Nossa Essência
              </span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] mb-10">
                Democratizando a<br />
                <span className="text-[#2563eb]">difusão científica.</span>
              </h2>

              <div className="space-y-6 text-neutral-600 text-base md:text-lg leading-relaxed max-w-xl">
                <p>
                  A Editora Poisson foi instituída com um objetivo claro: simplificar e democratizar a publicação 
                  de alto impacto científico no país. Adotamos o modelo de **Acesso Aberto (Open Access)**, 
                  garantindo que cada livro e artigo seja disponibilizado gratuitamente para estudantes, acadêmicos e pesquisadores de todo o mundo.
                </p>
                <p>
                  Apoiamos o ecossistema científico open-source, utilizando formatos modernos de intercâmbio de dados 
                  e garantindo que todo o conhecimento produzido esteja integrado a indexadores globais reconhecidos.
                </p>
                <p>
                  Em vez de burocracias, focamos em rigor metodológico através de avaliadores qualificados e agilidade 
                  tecnológica, permitindo que as pesquisas mais recentes alcancem a sociedade o mais rápido possível.
                </p>
              </div>
            </div>

            {/* Right Metrics Grid */}
            <div className="w-full lg:w-[420px] shrink-0">
              <div className="bg-neutral-50 p-4 rounded-3xl border border-neutral-200/60 shadow-[0_15px_40px_rgba(0,0,0,0.02)]">
                <div className="grid grid-cols-2 gap-3">
                  {METRICAS.map((m, idx) => (
                    <div key={m.label} className="bg-white p-6 rounded-2xl border border-neutral-200/50 flex flex-col justify-between shadow-sm min-h-36">
                      <span className="text-3xl font-black tracking-tighter text-[#050505] leading-none block">
                        <StatCounter target={m.valor} suffix={m.suffix} />
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 mt-6 leading-tight">{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Os Pilares da Editora (Creative Commons, Open Access, Indexação) */}
      <section className="bg-[#050505] px-6 py-32 relative z-10 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="mb-20 text-center lg:text-left">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5f1f] block mb-4">
              Modelo Editorial
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white leading-[0.95]">
              Como construímos o<br className="hidden md:inline" /> conhecimento livre.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VALORES.map((v) => (
              <motion.div
                key={v.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.6 }}
                className="relative bg-neutral-950/80 border border-neutral-900 rounded-3xl p-8 hover:border-neutral-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_30px_rgba(255,95,31,0.05)] group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 group-hover:bg-neutral-800/80 transition-colors">
                      {v.icon}
                    </div>
                    <span className="text-[11px] font-black text-neutral-700 group-hover:text-[#ff5f1f] transition-colors uppercase tracking-[0.3em]">{v.n}</span>
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tight mb-4 group-hover:text-[#ff5f1f] transition-colors">{v.titulo}</h3>
                  <p className="text-neutral-500 text-sm leading-relaxed font-medium">{v.texto}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Creative Commons Interactive Educational Board */}
      <section className="bg-neutral-950 px-6 py-28 border-t border-neutral-900">
        <div className="max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/5 rounded-[2.5rem] p-8 md:p-16 flex flex-col lg:flex-row gap-12 items-center relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#2563eb]/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex-1 space-y-6">
              <div className="inline-flex px-3 py-1 bg-[#2563eb]/10 border border-[#2563eb]/20 text-[#2563eb] text-[10px] font-black uppercase tracking-widest rounded-lg">
                Licenciamento Global
              </div>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
                A Revolução da Licença CC-BY 4.0
              </h3>
              <p className="text-neutral-400 text-sm md:text-base leading-relaxed">
                Diferente do copyright tradicional restritivo ("Todos os direitos reservados"), a licença **Creative Commons Atribuição (CC-BY)** confere liberdade total à comunidade acadêmica para baixar, ler, imprimir, traduzir e reutilizar a pesquisa para qualquer fim (mesmo comercial), desde que seja dada a devida atribuição de autoria original.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="flex gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Retenção de Direitos</h4>
                    <p className="text-xs text-neutral-500 mt-1">Os autores originais permanecem como donos legais de seus manuscritos.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-1" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Difusão Sem Fronteiras</h4>
                    <p className="text-xs text-neutral-500 mt-1">Sua pesquisa pode ser indexada, compartilhada e citada universalmente sem cobranças.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="w-full lg:w-[400px] shrink-0 bg-neutral-950/80 border border-neutral-800 p-8 rounded-3xl space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ff5f1f]">CC BY 4.0 Graphic</span>
                <ShieldCheck size={18} className="text-[#ff5f1f]" />
              </div>
              
              <div className="flex justify-center py-4">
                <div className="flex gap-2">
                  <div className="w-12 h-12 rounded-full border-2 border-neutral-700 flex items-center justify-center font-black text-sm text-neutral-400">CC</div>
                  <div className="w-12 h-12 rounded-full border-2 border-neutral-700 flex items-center justify-center font-black text-sm text-neutral-400">BY</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/50">
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-[#ff5f1f] mt-1.5" />
                    <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
                      <strong>Você é livre para:</strong> Compartilhar, copiar, distribuir, mixar, adaptar e criar a partir da pesquisa publicada.
                    </p>
                  </div>
                </div>
                <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/50">
                  <div className="flex gap-3 items-start">
                    <div className="w-2 h-2 rounded-full bg-[#2563eb] mt-1.5" />
                    <p className="text-[11px] text-neutral-400 font-medium leading-relaxed">
                      <strong>Sob os termos de:</strong> Atribuição — você deve conceder o crédito apropriado de forma ética, fornecendo o DOI e o link para a licença.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Áreas Editorial */}
      <section className="bg-white text-[#050505] px-6 py-32 rounded-b-[60px] md:rounded-b-[100px] relative z-20">
        <div className="max-w-6xl mx-auto">
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5f1f] block mb-4">
            Áreas de Difusão
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] mb-16">
            A Poisson abrange todas<br className="hidden md:inline" /> as esferas acadêmicas.
          </h2>

          <div className="flex flex-wrap gap-2.5 max-w-4xl">
            {[
              'Ciências Exatas e da Terra', 'Ciências Biológicas', 'Engenharias',
              'Ciências da Saúde', 'Ciências Agrárias', 'Ciências Sociais Aplicadas',
              'Ciências Humanas', 'Linguística, Letras e Artes', 'Multidisciplinar'
            ].map((area) => (
              <span
                key={area}
                className="px-5 py-3 border border-neutral-200 text-[10px] font-black uppercase tracking-[0.15em] text-neutral-600 rounded-full hover:border-[#ff5f1f] hover:text-[#ff5f1f] transition-all cursor-default"
              >
                {area}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Corpo Editorial / Equipe */}
      <section className="bg-[#050505] px-6 py-32 border-t border-neutral-900 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-6">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#ff5f1f] block mb-4">
                Governança Editorial
              </span>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white leading-[0.95]">
                O corpo por trás<br />da nossa excelência.
              </h2>
            </div>
            <div>
              <a
                href="/conselho"
                className="inline-flex items-center gap-2.5 px-6 py-3 border border-neutral-800 hover:border-neutral-700 bg-neutral-950/60 text-neutral-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                Conselho Científico Completo →
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COLETIVOS.map((c, idx) => (
              <div key={c.nome} className="bg-neutral-950/40 border border-neutral-900 rounded-3xl p-8 hover:border-neutral-800 transition-colors flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ff5f1f] to-[#2563eb] flex items-center justify-center font-black text-lg text-white mb-6">
                    {idx === 0 ? <Compass size={20} /> : <ShieldCheck size={20} />}
                  </div>
                  <h3 className="text-xl font-black text-white mb-1.5">{c.nome}</h3>
                  <p className="text-[10px] font-black text-[#ff5f1f] uppercase tracking-wider mb-4">{c.cargo}</p>
                  <p className="text-sm text-neutral-500 leading-relaxed font-medium">{c.area}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-[#ff5f1f] via-orange-500 to-[#2563eb] px-6 py-28 relative z-20 overflow-hidden">
        {/* Decorative glowing overlay */}
        <div className="absolute inset-0 bg-[#050505]/10 backdrop-blur-[1px]" />
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
          <div className="text-center lg:text-left space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter leading-[0.95]">
              Leve sua pesquisa<br />para o mundo inteiro.
            </h2>
            <p className="text-white/80 text-sm md:text-base max-w-lg leading-relaxed font-medium">
              Publique com indexação imediata, DOI digital perpétuo e a prestigiada licença Creative Commons.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
            <a
              href="https://individual.poisson.com.br"
              className="px-8 py-4 bg-white text-black font-black uppercase tracking-[0.25em] text-[11px] rounded-xl hover:bg-black hover:text-white transition-all text-center shadow-lg hover:scale-[1.03] active:scale-[0.97]"
            >
              Login / Submissão
            </a>
            <a
              href="https://wa.me/553182185531?text=Olá%2C%20gostaria%20de%20informações%20sobre%20publicação%20na%20Editora%20Poisson."
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-black uppercase tracking-[0.25em] text-[11px] rounded-xl hover:bg-white hover:text-neutral-900 transition-all text-center hover:scale-[1.03] active:scale-[0.97]"
            >
              Falar via WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
