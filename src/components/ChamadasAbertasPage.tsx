import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchChamadas } from '../lib/library/api';

// Inline fallback icons to avoid resolution issues
const ArrowRight = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
);
const Calendar = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const FileText = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
);
const Send = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
);
const X = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const ArrowLeft = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><line x1="19" y1="12" x2="5" y2="12"/></svg>
);
const BookOpen = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z"/></svg>
);
const Clock = ({ size = 24, className = "" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);

const CALLS_DATA = [
  {
    id: 1,
    title: "Educação no Século XXI",
    subtitle: "Volume 42 - Perspectivas Tecnológicas",
    deadline: "15 DEZ 2024",
    status: "Aberto",
    color: "#ff5f1f", // Laranja
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200",
    description: "Esta chamada busca artigos que explorem a integração de IA Generativa em ambientes de ensino fundamental e médio.",
    areas: ["Tecnologia Educacional", "IA na Educação", "Metodologias Ativas"],
    organizers: "Dra. Ana Silva, Dr. Roberto Bento"
  },
  {
    id: 2,
    title: "Saúde & Prevenção",
    subtitle: "Edição Especial: Epidemiologia Urbana",
    deadline: "20 JAN 2025",
    status: "Urgente",
    color: "#2563eb", // Azul
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=1200",
    description: "Foco em políticas públicas de saúde voltadas para grandes centros urbanos e controle de doenças sazonais.",
    areas: ["Saúde Pública", "Gestão Hospitalar", "Epidemiologia"],
    organizers: "Dra. Carla Mendes"
  },
  {
    id: 3,
    title: "Engenharia de Produção",
    subtitle: "Sustentabilidade e Indústria 4.0",
    deadline: "05 MAR 2025",
    status: "Aberto",
    color: "#ff5f1f",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1200",
    description: "Otimização de processos produtivos com foco na redução de resíduos e eficiência energética.",
    areas: ["Logística", "Produção Limpa", "Indústria 4.0"],
    organizers: "Dr. Marcos Paulo"
  },
  {
    id: 4,
    title: "Gestão & Negócios",
    subtitle: "Liderança em Tempos de Crise",
    deadline: "12 FEV 2025",
    status: "Aberto",
    color: "#2563eb",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200",
    description: "Análise de modelos de gestão resilientes e o papel da inteligência emocional na liderança corporativa.",
    areas: ["Administração", "Marketing Digital", "RH"],
    organizers: "Msc. Patrícia Lima"
  },
  {
    id: 5,
    title: "Meio Ambiente",
    subtitle: "Biodiversidade e Conservação",
    deadline: "30 MAR 2025",
    status: "Aberto",
    color: "#ff5f1f",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1200",
    description: "Estudos de caso sobre preservação de biomas brasileiros e recuperação de áreas degradadas.",
    areas: ["Ecologia", "Botânica", "Direito Ambiental"],
    organizers: "Dra. Helena Souza"
  },
  {
    id: 6,
    title: "Ciências Sociais",
    subtitle: "Cidadania e Direitos Humanos",
    deadline: "18 ABR 2025",
    status: "Aberto",
    color: "#2563eb",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=1200",
    description: "Investigação sobre movimentos sociais contemporâneos e o impacto das redes sociais na democracia.",
    areas: ["Sociologia", "Antropologia", "Ciência Política"],
    organizers: "Dr. Jorge Amado Filho"
  },
  {
    id: 7,
    title: "Tecnologia da Informação",
    subtitle: "Cybersegurança e Ética de Dados",
    deadline: "02 MAI 2025",
    status: "Aberto",
    color: "#ff5f1f",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200",
    description: "Desafios da proteção de dados pessoais e a implementação da LGPD em instituições de ensino.",
    areas: ["Computação", "Segurança", "Ética Digital"],
    organizers: "Msc. Ricardo Tech"
  },
  {
    id: 8,
    title: "Arquitetura & Urbanismo",
    subtitle: "Cidades Inteligentes e Inclusivas",
    deadline: "15 JUN 2025",
    status: "Aberto",
    color: "#2563eb",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1200",
    description: "Projetos de infraestrutura urbana que visam a acessibilidade universal e mobilidade sustentável.",
    areas: ["Urbanismo", "Design de Interiores", "Planejamento"],
    organizers: "Dra. Beatriz Arq"
  },
  {
    id: 9,
    title: "Direito Contemporâneo",
    subtitle: "Novas Fronteiras Jurídicas",
    deadline: "22 JUL 2025",
    status: "Aberto",
    color: "#ff5f1f",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200",
    description: "Análise jurídica sobre crimes digitais, direito do consumidor no e-commerce e novas leis trabalhistas.",
    areas: ["Direito Civil", "Direito Digital", "Trabalho"],
    organizers: "Dr. Cláudio Juiz"
  },
  {
    id: 10,
    title: "Psicologia & Sociedade",
    subtitle: "Saúde Mental no Trabalho Remoto",
    deadline: "10 SET 2025",
    status: "Aberto",
    color: "#2563eb",
    image: "https://images.unsplash.com/photo-1527137342181-19aab11a8ee1?auto=format&fit=crop&q=80&w=1200",
    description: "Os impactos psicológicos da transição para o home office e estratégias de bem-estar organizacional.",
    areas: ["Psicologia", "RH", "Comportamento"],
    organizers: "Dra. Simone Freud"
  }
];

export default function ChamadasAbertasPage() {
  const [calls, setCalls] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string | number>("");
  const [isHovered, setIsHovered] = useState<any>(null);

  useEffect(() => {
    fetchChamadas().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((c: any, index: number) => {
          // Keep the HTML formatting for synchronized ERP descriptions
          const richDesc = c.descricao
            ? c.descricao.replace(/&nbsp;/g, ' ').trim()
            : "<p>Participe desta chamada enviando seu manuscrito para avaliação científica.</p>";

          let deadlineStr = "Fluxo Contínuo";
          if (c.prazo) {
            try {
              const d = new Date(c.prazo);
              if (!isNaN(d.getTime())) {
                deadlineStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
              }
            } catch { /**/ }
          }

          let dataPubStr = "";
          if (c.data_publicacao) {
            try {
              const d = new Date(c.data_publicacao);
              if (!isNaN(d.getTime())) {
                dataPubStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
              }
            } catch { /**/ }
          }

          let taxaVal = c.taxa_publicacao != null ? parseFloat(c.taxa_publicacao) : null;
          // Defensively check for historically corrupted database entries (e.g. 320.00 stripped to 32000)
          if (taxaVal != null && taxaVal >= 10000) {
            taxaVal = taxaVal / 100;
          }
          const taxaStr = taxaVal != null
            ? `R$ ${taxaVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
            : "";

          return {
            id: c.id,
            title: c.titulo ?? "Chamada Aberta",
            subtitle: c.isbn ? `ISBN: ${c.isbn}` : "Coletânea Científica",
            deadline: deadlineStr,
            data_publicacao: dataPubStr,
            taxa_publicacao: taxaStr,
            link_submissao: c.link_submissao || 'https://individual.poisson.com.br/submissions',
            status: "Aberto",
            color: index % 2 === 0 ? "#ff5f1f" : "#2563eb",
            image: c.capa || "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200",
            description: richDesc,
            organizers: c.organizador || "Editora Poisson",
          };
        });
        const sortedMapped = [...mapped].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
        setCalls(sortedMapped);
        if (sortedMapped.length > 0) {
          setSelectedId(sortedMapped[0].id);
        }
      } else {
        const sortedFallback = [...CALLS_DATA].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
        setCalls(sortedFallback);
        if (sortedFallback.length > 0) {
          setSelectedId(sortedFallback[0].id);
        }
      }
    }).catch(() => {
      const sortedFallback = [...CALLS_DATA].sort((a, b) => a.title.localeCompare(b.title, 'pt-BR'));
      setCalls(sortedFallback);
      if (sortedFallback.length > 0) {
        setSelectedId(sortedFallback[0].id);
      }
    });
  }, []);

  const activeCall = useMemo(() => 
    calls.find(c => c.id === selectedId), [calls, selectedId]
  );

  if (calls.length === 0 || !activeCall) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono text-[10px] tracking-[0.3em] uppercase">
        <div className="flex flex-col items-center gap-4">
          <div className="size-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <span>Carregando Oportunidades...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#ff5f1f] overflow-hidden">
      
      {/* Background Parallax Texture */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#2563eb_0%,transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,#ff5f1f_0%,transparent_50%)]" />
      </div>

      {/* Hero Section - Dark Background with Ambient Animation */}
      <div className="relative bg-[#050505] text-white w-full overflow-hidden">
        {/* Breathing ambient glowing orbs */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              x: [0, 40, 0],
              y: [0, -30, 0] 
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute -top-40 -left-40 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle_at_center,#ff5f1f_0%,transparent_70%)] blur-[80px]"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.12, 1],
              x: [0, -30, 0],
              y: [0, 40, 0] 
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 3
            }}
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle_at_center,#2563eb_0%,transparent_70%)] blur-[90px]"
          />
        </div>

        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative pt-32 pb-16 px-6 max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-8 z-10"
        >
          <div className="flex-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="mb-4 overflow-hidden"
            >
              <span className="text-[#ff5f1f] text-xs font-black uppercase tracking-[0.4em] bg-[#ff5f1f]/10 px-3.5 py-1 rounded-full border border-[#ff5f1f]/20">
                OPORTUNIDADES
              </span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-white text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[0.95] mb-5"
            >
              Faça parte da <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff5f1f] via-orange-400 to-[#2563eb] animate-gradient-x">
                próxima publicação
              </span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-neutral-400 max-w-md text-sm md:text-base font-medium leading-relaxed"
            >
              Selecione um livro abaixo, assista ao nosso tutorial de submissão e compartilhe sua pesquisa com a comunidade científica internacional.
            </motion.p>
          </div>
          
          {/* Submission Tutorial Video Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="w-full md:w-[380px] lg:w-[460px] flex-shrink-0"
          >
            <div className="relative group overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3.5 shadow-[0_25px_60px_rgba(0,0,0,0.5)] transition-all duration-500 hover:border-[#ff5f1f]/30 hover:shadow-[0_30px_70px_rgba(255,95,31,0.15)]">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-[10px] font-black text-[#ff5f1f] uppercase tracking-[0.15em] flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff5f1f]"></span>
                  </span>
                  Como Submeter?
                </span>
                <span className="text-[9px] text-neutral-400 font-mono tracking-wider">Tutorial de Submissão</span>
              </div>
              
              <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-950 shadow-inner group-hover:scale-[1.01] transition-transform duration-500">
                <video 
                  src="/assets/videos/Processo-de-Submissao-cartoon-v1.mp4" 
                  controls 
                  preload="metadata"
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </motion.section>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row max-w-6xl mx-auto border border-neutral-200/50 rounded-[2rem] overflow-hidden bg-white shadow-xl" style={{ height: '780px', maxHeight: '85vh' }}>
        
        {/* Sidebar */}
        <aside className="w-full lg:w-[400px] bg-neutral-50 border-r border-neutral-200 overflow-y-auto custom-scrollbar pt-10 pb-10 px-6 text-black h-full">
          <div className="mb-12">
             <span className="text-[10px] font-black tracking-[0.4em] text-[#ff5f1f] uppercase block mb-2">Oportunidades Poisson</span>
             <h2 className="text-3xl font-black tracking-tighter">CHAMADAS <br/> <span className="text-transparent" style={{ WebkitTextStroke: '1px black' }}>ABERTAS</span></h2>
          </div>

          <div className="space-y-4">
            {calls.map((call) => (
              <motion.div
                key={call.id}
                onClick={() => setSelectedId(call.id)}
                onMouseEnter={() => setIsHovered(call.id)}
                onMouseLeave={() => setIsHovered(null)}
                whileHover={{ scale: 1.015, x: 2 }}
                whileTap={{ scale: 0.995 }}
                className={`group relative p-6 rounded-xl cursor-pointer transition-all duration-300 overflow-hidden border border-transparent ${
                  selectedId === call.id 
                    ? 'bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] border-neutral-200/60' 
                    : 'hover:bg-neutral-100/80 hover:border-neutral-200/30'
                }`}
              >
                {/* Active Indicator Line */}
                {selectedId === call.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff5f1f]"
                  />
                )}

                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-neutral-500">{String(call.id).padStart(2, '0')}</span>
                  <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[#ff5f1f]">
                    <Clock size={10} className="text-[#ff5f1f]" />
                    {call.deadline}
                  </div>
                </div>

                <h3 className={`text-lg font-bold leading-tight transition-colors duration-300 ${
                  selectedId === call.id ? 'text-black' : 'text-neutral-600 group-hover:text-black'
                }`}>
                  {call.title}
                </h3>
                <p className="text-[10px] text-neutral-500 font-medium truncate mt-1">
                  {call.subtitle}
                </p>
              </motion.div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative bg-white text-black rounded-tl-[60px] lg:rounded-tl-[120px] transition-all duration-700 h-full overflow-y-auto custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCall.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="min-h-full flex flex-col p-8 lg:p-16"
            >
              {/* Title Above */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-3">
                   <span className="px-4 py-1.5 rounded-full bg-black text-white text-[9px] font-black uppercase tracking-widest">
                     {activeCall.status}
                   </span>
                   <div className="h-px flex-1 bg-neutral-200" />
                </div>

                <h1 className="text-xl lg:text-2xl font-black tracking-tight leading-snug mb-2">
                  {activeCall.title}
                </h1>
                <p className="text-sm font-semibold text-neutral-500">
                  {activeCall.subtitle}
                </p>
              </div>

              {/* Cover and Details Side by Side */}
              <div className="flex flex-col lg:flex-row gap-12 items-start">
                {/* Left Column: Cover & Details Block */}
                <div className="w-full lg:w-1/3 flex flex-col gap-6">
                  <div className="relative group perspective-1000">
                     <motion.div 
                       initial={{ rotateY: 0, opacity: 0, scale: 0.95 }}
                       animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                       whileHover={{ 
                         scale: 1.05, 
                         y: -10,
                         transition: { duration: 0.3, ease: "easeOut" }
                       }}
                       transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                       className="relative aspect-[3/4] shadow-[15px_15px_30px_rgba(0,0,0,0.12)] rounded-md overflow-hidden bg-neutral-100 transition-shadow duration-500 hover:shadow-[30px_30px_60px_rgba(0,0,0,0.28)] border border-neutral-200/50"
                     >
                        <img 
                          src={activeCall.image} 
                          alt={activeCall.title}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        />
                        {/* Elegant glass highlight reflection overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                     </motion.div>
                     
                     {/* Decorative Badge */}
                     <motion.div 
                       initial={{ scale: 0, rotate: -15 }}
                       animate={{ scale: 1, rotate: 0 }}
                       transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.4 }}
                       className="absolute -top-4 -right-4 w-20 h-20 bg-white rounded-full flex items-center justify-center text-center p-2 border border-dashed border-[#ff5f1f]/30 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500"
                     >
                       <span className="text-[8px] font-black leading-none uppercase text-black">Editora Poisson<br/><span className="text-[#ff5f1f]">2026</span></span>
                     </motion.div>
                  </div>

                  {/* Details Block (Below Cover) */}
                  <div className="bg-neutral-50/60 p-6 rounded-2xl border border-neutral-200/50 shadow-sm space-y-4">
                    <div className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                      <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block mb-1">Organização</span>
                      <p className="text-sm font-semibold text-black leading-snug">{activeCall.organizers}</p>
                    </div>
                    <div className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                      <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block mb-1">Submissão até</span>
                      <p className="text-base font-black text-[#ff5f1f]">{activeCall.deadline}</p>
                    </div>
                    {activeCall.data_publicacao && (
                      <div className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                        <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block mb-1">Data de Publicação</span>
                        <p className="text-sm font-semibold text-black">{activeCall.data_publicacao}</p>
                      </div>
                    )}
                    {activeCall.taxa_publicacao && (
                      <div className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                        <span className="text-[10px] font-bold uppercase text-neutral-400 tracking-wider block mb-1">Taxa de Publicação</span>
                        <p className="text-base font-black text-[#ff5f1f]">{activeCall.taxa_publicacao}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Description & Submeter Button */}
                <div className="flex-1 flex flex-col justify-between gap-8 self-stretch">
                  <div>
                    {/* Section Header */}
                    <div className="mb-4">
                      <span className="text-[10px] font-black uppercase text-neutral-400 tracking-widest block">Sobre esta obra</span>
                    </div>

                    {/* Synchronized ERP Rich Text Description */}
                    <div 
                      className="call-description text-neutral-600 leading-relaxed text-sm"
                      dangerouslySetInnerHTML={{ __html: activeCall.description }}
                    />
                  </div>

                  <div className="mt-auto pt-6">
                    <a
                      href={activeCall.link_submissao || 'https://individual.poisson.com.br/submissions'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative overflow-hidden w-full bg-gradient-to-r from-neutral-950 to-neutral-900 text-white py-4 px-6 rounded-xl font-black uppercase tracking-[0.2em] text-[11px] flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group"
                    >
                      {/* Premium animated gradient hover background overlay */}
                      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#ff5f1f] to-[#2563eb] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out -z-10" />
                      
                      <span className="relative z-10">Submeter Manuscrito</span>
                      <Send size={14} className="relative z-10 group-hover:translate-x-1.5 group-hover:-translate-y-1.5 transition-transform duration-300" />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
        </main>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8f9fa;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        
        /* synchronized ERP Rich Text format overrides */
        .call-description {
          font-size: 0.925rem;
          line-height: 1.6;
          color: #4b5563; /* neutral-600 */
          white-space: normal !important;
        }
        .call-description p {
          margin-bottom: 0.85rem;
        }
        .call-description ul, .call-description ol {
          margin-top: 0.5rem;
          margin-bottom: 1rem;
          padding-left: 1.5rem;
        }
        .call-description ul {
          list-style-type: disc !important;
        }
        .call-description ol {
          list-style-type: decimal !important;
        }
        .call-description li {
          margin-bottom: 0.4rem;
          padding-left: 0.25rem;
        }
        .call-description strong {
          color: #0f172a; /* slate-900 */
          font-weight: 700;
        }
        .call-description a {
          color: #ff5f1f;
          text-decoration: underline;
          transition: color 0.2s;
        }
        .call-description a:hover {
          color: #2563eb;
        }

        /* Animated gradient background keyframes */
        @keyframes gradient-x {
          0%, 100% {
            background-size: 200% 200%;
            background-position: left center;
          }
          50% {
            background-size: 200% 200%;
            background-position: right center;
          }
        }
        .animate-gradient-x {
          animation: gradient-x 8s ease infinite;
        }
      `}</style>
    </div>
  );
}
