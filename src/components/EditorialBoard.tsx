import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, MapPin, Award } from "lucide-react";

interface BoardMember {
  id: number;
  name: string;
  title: string;
  institution: string;
  field: string;

  lattes: string;
  avatar: string; // fallback color palette
}

const MEMBERS: BoardMember[] = [
  {
    id: 1,
    name: "Dr. Darly Fernando Andrade",
    title: "Editor Chefe / Doutor em Engenharia",
    institution: "Editora Poisson",
    field: "Conselho Editorial",
    lattes: "http://lattes.cnpq.br/8035982389373871",
    avatar: "from-orange-500/20 to-red-500/20"
  },
  {
    id: 2,
    name: "Dr. Anderson Lincoln Vital",
    title: "Doutor em Educação",
    institution: "Membro Editorial",
    field: "Ciências Humanas",
    lattes: "http://lattes.cnpq.br/5760086972865304",
    avatar: "from-cyan-500/20 to-blue-500/20"
  },
  {
    id: 3,
    name: "Dr. Antônio Arthur de Souza",
    title: "Doutor em Administração",
    institution: "Universidade Federal de Minas Gerais",
    field: "Ciências Sociais",
    lattes: "http://lattes.cnpq.br/0597505816212353",
    avatar: "from-purple-500/20 to-indigo-500/20"
  },
  {
    id: 4,
    name: "Dr. Arthur Antonio Silva Rosa",
    title: "Doutor em Tecnologia",
    institution: "Membro Editorial",
    field: "Engenharia & Tecnologia",
    lattes: "http://lattes.cnpq.br/5368256568718222",
    avatar: "from-emerald-500/20 to-teal-500/20"
  },
  {
    id: 5,
    name: "MSc. Davilson Eduardo Andrade",
    title: "Mestre em Engenharia",
    institution: "Membro Editorial",
    field: "Engenharia & Tecnologia",
    lattes: "",
    avatar: "from-amber-500/20 to-orange-500/20"
  },
  {
    id: 6,
    name: "Dra. Elizângela de Jesus Oliveira",
    title: "Doutora em Ciências",
    institution: "Universidade Federal do Amazonas",
    field: "Ciências Biológicas & Terra",
    lattes: "http://lattes.cnpq.br/2150219079758899",
    avatar: "from-teal-500/20 to-green-500/20"
  },
  {
    id: 7,
    name: "MSc. Fabiane dos Santos",
    title: "Mestra em Educação",
    institution: "Membro Editorial",
    field: "Ciências Humanas",
    lattes: "",
    avatar: "from-pink-500/20 to-rose-500/20"
  },
  {
    id: 8,
    name: "Dr. Flávio Nogueira da Costa",
    title: "Doutor em Ciências",
    institution: "Membro Editorial",
    field: "Ciências Biológicas & Terra",
    lattes: "http://lattes.cnpq.br/7995454920844844",
    avatar: "from-blue-500/20 to-cyan-500/20"
  },
  {
    id: 9,
    name: "Dr. José Eduardo Ferreira Lopes",
    title: "Doutor em Economia",
    institution: "Universidade Federal de Uberlândia",
    field: "Ciências Sociais",
    lattes: "http://lattes.cnpq.br/1181111177305483",
    avatar: "from-violet-500/20 to-indigo-500/20"
  },
  {
    id: 10,
    name: "Dr. Luiz Cláudio de Lima",
    title: "Doutor em Engenharia",
    institution: "Universidade FUMEC",
    field: "Engenharia & Tecnologia",
    lattes: "http://lattes.cnpq.br/8912531572033360",
    avatar: "from-indigo-500/20 to-purple-500/20"
  },
  {
    id: 11,
    name: "Dra. Margaret Vetis Zaganelli",
    title: "Doutora em Direito",
    institution: "Membro Editorial",
    field: "Ciências Sociais",
    lattes: "http://lattes.cnpq.br/3009983939185029",
    avatar: "from-rose-500/20 to-pink-500/20"
  },
  {
    id: 12,
    name: "MSc. Maria Regina Campaner Locatelli",
    title: "Mestra em Letras e Estudos Linguísticos",
    institution: "Membro Editorial",
    field: "Ciências Humanas",
    lattes: "",
    avatar: "from-teal-500/20 to-emerald-500/20"
  },
  {
    id: 13,
    name: "Dra. Maria Célia da Silva Gonçalves",
    title: "Doutora em Letras",
    institution: "Membro Editorial",
    field: "Ciências Humanas",
    lattes: "http://lattes.cnpq.br/9176266551850173",
    avatar: "from-amber-500/20 to-yellow-500/20"
  },
  {
    id: 14,
    name: "MSc. Moisés Israel Belchior Andrade Coelho",
    title: "Mestre em Ciências Florestais",
    institution: "Universidade Federal do Amazonas",
    field: "Ciências Biológicas & Terra",
    lattes: "http://lattes.cnpq.br/0786485335337879",
    avatar: "from-green-500/20 to-teal-500/20"
  },
  {
    id: 15,
    name: "Dr. Nelson Ferreira Filho",
    title: "Doutor em Engenharia",
    institution: "Faculdades Kennedy",
    field: "Engenharia & Tecnologia",
    lattes: "http://lattes.cnpq.br/1527384914713614",
    avatar: "from-slate-500/20 to-gray-500/20"
  },
  {
    id: 16,
    name: "MSc. Osvaldo Sena Guimarães",
    title: "Mestre em Gestão",
    institution: "Membro Editorial",
    field: "Ciências Sociais",
    lattes: "http://lattes.cnpq.br/1131731161944013",
    avatar: "from-blue-500/20 to-indigo-500/20"
  },
  {
    id: 17,
    name: "Dr. Otaviano Francisco Neves",
    title: "Doutor em Administração",
    institution: "Pontifícia Universidade Católica de Minas Gerais",
    field: "Ciências Sociais",
    lattes: "http://buscatextual.cnpq.br/buscatextual/visualizacv.do?id=K8155766Z6",
    avatar: "from-orange-500/20 to-amber-500/20"
  },
  {
    id: 18,
    name: "Dr. Rafael Alves Pedrosa",
    title: "Doutor em Educação",
    institution: "Membro Editorial",
    field: "Ciências Humanas",
    lattes: "http://buscatextual.cnpq.br/buscatextual/visualizacv.do?id=K8155766Z6",
    avatar: "from-cyan-500/20 to-blue-500/20"
  },
  {
    id: 19,
    name: "Dra. Rute Holanda Lopes",
    title: "Doutora em Ciências",
    institution: "Universidade Federal do Amazonas",
    field: "Ciências Biológicas & Terra",
    lattes: "http://lattes.cnpq.br/3678444694216259",
    avatar: "from-emerald-500/20 to-green-500/20"
  },
  {
    id: 20,
    name: "Dra. Silvia Bernardo da Silva",
    title: "Doutora em Botânica",
    institution: "Universidade Federal do Amazonas",
    field: "Ciências Biológicas & Terra",
    lattes: "http://lattes.cnpq.br/8764591921929329",
    avatar: "from-teal-500/20 to-emerald-500/20"
  },
  {
    id: 21,
    name: "Dra. Suelânia Cristina Gonzaga de Figueiredo",
    title: "Doutora em Enfermagem",
    institution: "Membro Editorial",
    field: "Ciências da Saúde",
    lattes: "http://lattes.cnpq.br/1306989016980637",
    avatar: "from-red-500/20 to-rose-500/20"
  },
  {
    id: 22,
    name: "MSc. Valdiney Alves de Oliveira",
    title: "Mestre em Computação",
    institution: "Universidade Federal de Uberlândia",
    field: "Engenharia & Tecnologia",
    lattes: "http://lattes.cnpq.br/1043938883826139",
    avatar: "from-indigo-500/20 to-blue-500/20"
  },
  {
    id: 23,
    name: "Dr. Vandermi João da Silva",
    title: "Doutor em Ciências",
    institution: "Universidade Federal do Amazonas",
    field: "Ciências Biológicas & Terra",
    lattes: "http://lattes.cnpq.br/1231884642541177",
    avatar: "from-teal-500/20 to-green-500/20"
  },
  {
    id: 24,
    name: "Dr. Wanderson da Silva Damião",
    title: "Doutor em Ciências Sociais",
    institution: "Instituto FATEM",
    field: "Ciências Sociais",
    lattes: "http://lattes.cnpq.br/7755389525918024",
    avatar: "from-amber-500/20 to-orange-500/20"
  }
];


export default function EditorialBoard() {

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight text-balance">
          Colegiado de <span className="serif text-orange-500 italic">Mestres</span> <span className="serif text-black italic">e</span> <span className="serif text-orange-500 italic">Doutores</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground text-pretty">
          Nossa comissão científica é constituída por mestres e doutores vinculados às mais renomadas instituições de ensino superior do país.
        </p>
      </div>

      {/* BOARD CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {MEMBERS.map((member) => (
          <ParallaxCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

// 3D Parallax Tilt card subcomponent
function ParallaxCard({ member }: { member: BoardMember }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, scale: 1 });
  const [glow, setGlow] = useState({ x: 0, y: 0, opacity: 0 });

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const r = card.getBoundingClientRect();
    
    // Position of cursor relative to card's center
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;

    // Convert to tilt rotation degrees (limit to 12 degrees max rotation)
    const rotateX = (y / (r.height / 2)) * -10;
    const rotateY = (x / (r.width / 2)) * 10;

    setTilt({ rotateX, rotateY, scale: 1.03 });
    
    // Glowing Neon cursor reflection light tracking
    setGlow({
      x: e.clientX - r.left,
      y: e.clientY - r.top,
      opacity: 0.15
    });
  };

  const handlePointerLeave = () => {
    // Reset back smoothly to natural state
    setTilt({ rotateX: 0, rotateY: 0, scale: 1 });
    setGlow(prev => ({ ...prev, opacity: 0 }));
  };

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className="rounded-3xl border border-white/5 glass p-6 relative overflow-hidden shadow-2xl transition-all duration-500 cursor-pointer flex flex-col justify-between"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) scale(${tilt.scale})`,
        transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
        minHeight: "330px"
      }}
    >
      {/* 3D PARALLAX INTERNAL NEON REFLECTION GLOW */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          background: `radial-gradient(circle 120px at ${glow.x}px ${glow.y}px, rgba(249, 115, 22, ${glow.opacity}), transparent)`,
          mixBlendMode: "screen"
        }}
      />

      <div style={{ transform: "translateZ(30px)" }} className="transition-transform duration-500">
        {/* Top Info */}
        <div className="flex items-center gap-4">
          {/* Avatar Abstract */}
          <div className={`size-14 rounded-2xl bg-gradient-to-tr ${member.avatar} flex items-center justify-center shrink-0 border border-white/5`}>
            <GraduationCap className="size-6 text-orange-500" />
          </div>
          
          <div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-orange-500">
              {member.field}
            </span>
            <h3 className="font-display text-lg font-bold leading-tight text-foreground mt-0.5">
              {member.name}
            </h3>
          </div>
        </div>

        {/* Institution / Role */}
        <div className="mt-6 space-y-3">
          <div className="flex gap-2.5 items-start text-xs text-muted-foreground">
            <Award className="size-4 text-cyan-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{member.title}</span>
          </div>
          <div className="flex gap-2.5 items-start text-xs text-muted-foreground">
            <MapPin className="size-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{member.institution}</span>
          </div>
        </div>
      </div>

      {/* Footer / Lattes badge centralizado */}
      <div style={{ transform: "translateZ(15px)" }} className="mt-8 pt-4 border-t border-white/5 flex items-center justify-center transition-transform duration-500">
        {member.lattes ? (
          <a
            href={member.lattes}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[9px] uppercase tracking-widest text-orange-500 hover:text-white transition-colors bg-orange-500/10 hover:bg-orange-500/20 px-4 py-1.5 rounded-full border border-orange-500/20 hover:border-orange-500/40"
          >
            Currículo Lattes
          </a>
        ) : (
          <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/40 bg-white/5 px-4 py-1.5 rounded-full border border-white/5 cursor-not-allowed">
            Sem Lattes
          </span>
        )}
      </div>
    </div>
  );
}
