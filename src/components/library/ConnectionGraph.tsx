import { useEffect, useRef, useState } from "react";
import type { LibraryBook } from "@/lib/library/data";

interface ConnectionGraphProps {
  books: LibraryBook[];
  onSelectBook: (book: LibraryBook) => void;
  searchQuery: string;
  categoryName: string;
}

interface GraphNode {
  id: string;
  type: "center" | "author" | "book";
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  book?: LibraryBook;
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
  pulseOffset: number;
}

export function ConnectionGraph({ books, onSelectBook, searchQuery, categoryName }: ConnectionGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  
  // Keep nodes and links persistent across renders to preserve positions during physics simulation
  const nodesRef = useRef<GraphNode[]>([]);
  const linksRef = useRef<GraphLink[]>([]);
  const hoveredNodeRef = useRef<GraphNode | null>(null);
  const draggedNodeRef = useRef<GraphNode | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, isDown: false });

  // Handle window/container resizing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: Math.max(400, containerRef.current.clientHeight || 550)
        });
      }
    };
    
    updateSize();
    window.addEventListener("resize", updateSize);
    
    const observer = new ResizeObserver(updateSize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      window.removeEventListener("resize", updateSize);
      observer.disconnect();
    };
  }, []);

  // Build or update the graph structure when books, search, or category changes
  useEffect(() => {
    const width = dimensions.width;
    const height = dimensions.height;
    
    const limit = 25; // Limit displayed books to prevent clutter
    const activeBooks = books.slice(0, limit);
    
    const newNodes: GraphNode[] = [];
    const newLinks: GraphLink[] = [];
    
    // 1. Central Node
    const centerLabel = searchQuery ? `"${searchQuery}"` : categoryName.toUpperCase();
    const centerNode: GraphNode = {
      id: "center-node",
      type: "center",
      label: centerLabel,
      x: width / 2,
      y: height / 2,
      vx: 0,
      vy: 0,
      radius: 35,
      color: "#ffc107" // Glowing Gold
    };
    newNodes.push(centerNode);

    // 2. Authors and Books
    const authorMap = new Map<string, GraphNode>();
    
    activeBooks.forEach((book, index) => {
      // Find or create Author node (linked to center)
      const authorName = book.autor?.split(";")[0]?.trim() || "Poisson";
      let authorNode = authorMap.get(authorName);
      
      if (!authorNode) {
        // Place author nodes in an orbit around the center
        const angle = (authorMap.size / 6) * Math.PI * 2;
        const dist = 120 + Math.random() * 30;
        authorNode = {
          id: `author-${authorName}`,
          type: "author",
          label: authorName,
          x: centerNode.x + Math.cos(angle) * dist,
          y: centerNode.y + Math.sin(angle) * dist,
          vx: 0,
          vy: 0,
          radius: 20,
          color: "#06b6d4" // Glowing Cyan
        };
        authorMap.set(authorName, authorNode);
        newNodes.push(authorNode);
        
        newLinks.push({
          source: centerNode,
          target: authorNode,
          pulseOffset: Math.random()
        });
      }

      // Create Book node (linked to author)
      const bookAngle = angle + ((index % 3) - 1) * 0.4;
      const bookDist = 80 + Math.random() * 20;
      const bookNode: GraphNode = {
        id: `book-${book.id}`,
        type: "book",
        label: book.titulo.length > 25 ? book.titulo.substring(0, 25) + "..." : book.titulo,
        x: authorNode.x + Math.cos(bookAngle) * bookDist,
        y: authorNode.y + Math.sin(bookAngle) * bookDist,
        vx: 0,
        vy: 0,
        radius: 14,
        color: "#10b981", // Glowing Emerald
        book
      };
      
      newNodes.push(bookNode);
      newLinks.push({
        source: authorNode,
        target: bookNode,
        pulseOffset: Math.random()
      });
    });

    // Match positions from existing nodes to avoid jarring layout resets
    newNodes.forEach(node => {
      const existing = nodesRef.current.find(n => n.id === node.id);
      if (existing) {
        node.x = existing.x;
        node.y = existing.y;
        node.vx = existing.vx;
        node.vy = existing.vy;
      }
    });

    nodesRef.current = newNodes;
    linksRef.current = newLinks;
  }, [books, searchQuery, categoryName, dimensions]);

  // Main Canvas & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrameId: number;

    const tick = () => {
      const width = dimensions.width;
      const height = dimensions.height;
      const nodes = nodesRef.current;
      const links = linksRef.current;

      // --- PHYSICS FORCES ---
      
      // 1. Charge Force (Mutual Repulsion between all nodes)
      for (let i = 0; i < nodes.length; i++) {
        const nodeA = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nodeB = nodes[j];
          const dx = nodeB.x - nodeA.x;
          const dy = nodeB.y - nodeA.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);
          
          // Repulsion force
          const strength = 1800; // Power of push
          const minDistance = nodeA.radius + nodeB.radius + 40;
          
          if (dist < minDistance) {
            const force = (minDistance - dist) * 0.15;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            if (nodeA !== draggedNodeRef.current) {
              nodeA.vx -= fx;
              nodeA.vy -= fy;
            }
            if (nodeB !== draggedNodeRef.current) {
              nodeB.vx += fx;
              nodeB.vy += fy;
            }
          } else {
            // General background gravity repulsion
            const force = strength / distSq;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            
            if (nodeA !== draggedNodeRef.current) {
              nodeA.vx -= fx;
              nodeA.vy -= fy;
            }
            if (nodeB !== draggedNodeRef.current) {
              nodeB.vx += fx;
              nodeB.vy += fy;
            }
          }
        }
      }

      // 2. Link Force (Spring tension between connected nodes)
      links.forEach(link => {
        const dx = link.target.x - link.source.x;
        const dy = link.target.y - link.source.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        // Target spring length based on connection type
        const targetLen = link.source.type === "center" ? 140 : 80;
        const k = 0.025; // stiffness
        const force = (dist - targetLen) * k;
        
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        
        if (link.source !== draggedNodeRef.current) {
          link.source.vx += fx;
          link.source.vy += fy;
        }
        if (link.target !== draggedNodeRef.current) {
          link.target.vx -= fx;
          link.target.vy -= fy;
        }
        
        // Advance connection light pulse
        link.pulseOffset = (link.pulseOffset + 0.004) % 1;
      });

      // 3. Gravity Force (Pull all nodes toward the canvas center)
      const centerX = width / 2;
      const centerY = height / 2;
      nodes.forEach(node => {
        if (node === draggedNodeRef.current) return;
        
        const dx = centerX - node.x;
        const dy = centerY - node.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const k = node.type === "center" ? 0.08 : 0.002;
        node.vx += dx * k;
        node.vy += dy * k;
      });

      // 4. Update Positions, Friction, and Boundary Collisions
      nodes.forEach(node => {
        if (node === draggedNodeRef.current) {
          // Dragged node follows mouse directly
          node.x = mouseRef.current.x;
          node.y = mouseRef.current.y;
          node.vx = 0;
          node.vy = 0;
          return;
        }

        // Apply friction/damping
        node.vx *= 0.82;
        node.vy *= 0.82;

        // Apply velocities
        node.x += node.vx;
        node.y += node.vy;

        // Contain within canvas boundary margins
        const margin = node.radius + 15;
        if (node.x < margin) { node.x = margin; node.vx *= -0.5; }
        if (node.x > width - margin) { node.x = width - margin; node.vx *= -0.5; }
        if (node.y < margin) { node.y = margin; node.vy *= -0.5; }
        if (node.y > height - margin) { node.y = height - margin; node.vy *= -0.5; }
      });

      // --- RENDERING CANVAS ---
      ctx.clearRect(0, 0, width, height);

      // A. Draw links (glow lines + traveling kinetic light pulses)
      links.forEach(link => {
        const isHighlighted = 
          hoveredNodeRef.current === link.source || 
          hoveredNodeRef.current === link.target;
        
        // Draw base connecting vector line
        ctx.beginPath();
        ctx.moveTo(link.source.x, link.source.y);
        ctx.lineTo(link.target.x, link.target.y);
        ctx.strokeStyle = isHighlighted ? "rgba(255, 255, 255, 0.45)" : "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = isHighlighted ? 2 : 1;
        ctx.setLineDash(link.source.type === "center" ? [6, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw kinetic light pulse (conhecimento em movimento)
        const pulseX = link.source.x + (link.target.x - link.source.x) * link.pulseOffset;
        const pulseY = link.source.y + (link.target.y - link.source.y) * link.pulseOffset;
        
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, isHighlighted ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = link.target.color;
        
        // Outer glow
        ctx.shadowColor = link.target.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
      });

      // B. Draw nodes (glowing planets)
      nodes.forEach(node => {
        const isHovered = hoveredNodeRef.current === node;
        const scale = isHovered ? 1.15 : 1.0;
        const r = node.radius * scale;

        // 1. Draw glowing aura back shadow
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered ? 20 : 10;
        ctx.fillStyle = node.color;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow

        // 2. Draw core gradient overlay
        const grad = ctx.createRadialGradient(node.x - r * 0.3, node.y - r * 0.3, r * 0.1, node.x, node.y, r);
        grad.addColorStop(0, "rgba(255, 255, 255, 0.8)");
        grad.addColorStop(0.3, "rgba(255, 255, 255, 0.1)");
        grad.addColorStop(1, "rgba(0, 0, 0, 0.5)");
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // 3. Draw outer orbital thin ring (like Saturn)
        ctx.beginPath();
        ctx.ellipse(node.x, node.y, r * 1.5, r * 0.4, -0.3, 0, Math.PI * 2);
        ctx.strokeStyle = node.color + "45";
        ctx.lineWidth = 1;
        ctx.stroke();

        // 4. Draw glowing boundary highlights if hovered
        if (isHovered) {
          ctx.beginPath();
          ctx.arc(node.x, node.y, r + 2, 0, Math.PI * 2);
          ctx.strokeStyle = "#ffffff60";
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // 5. Draw text label
        ctx.font = node.type === "center" 
          ? "italic 700 13px 'Playfair Display', serif" 
          : node.type === "author" 
          ? "600 10px var(--font-sans), sans-serif" 
          : "400 9px var(--font-sans), sans-serif";
        
        ctx.fillStyle = node.type === "center" 
          ? "#ffffff" 
          : isHovered 
          ? "#ffffff" 
          : "rgba(255, 255, 255, 0.65)";
        
        ctx.textAlign = "center";
        
        // Exclude drawing labels for very busy graphs unless node is hovered/authors/center
        if (node.type !== "book" || isHovered) {
          const textY = node.y + r + (node.type === "center" ? 16 : 12);
          ctx.fillText(node.label, node.x, textY);
          
          // Draw subtle background rectangle behind active labels for readability
          if (node.type === "book" && isHovered) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = "rgba(0,0,0,0.85)";
            ctx.beginPath();
            const textWidth = ctx.measureText(node.label).width;
            ctx.roundRect(node.x - textWidth / 2 - 6, textY - 10, textWidth + 12, 14, 4);
            ctx.fill();
            ctx.fillStyle = "#ffffff";
            ctx.fillText(node.label, node.x, textY);
          }
        }
      });

      animFrameId = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(animFrameId);
  }, [dimensions]);

  // Pointer Event Listeners
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    mouseRef.current = { x, y, isDown: true };

    // Search for clicked node
    let found: GraphNode | null = null;
    for (const node of nodesRef.current) {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < node.radius + 15) {
        found = node;
        break;
      }
    }

    if (found) {
      draggedNodeRef.current = found;
      // Setup browser pointer capture
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const r = canvas.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;

    mouseRef.current.x = x;
    mouseRef.current.y = y;

    if (draggedNodeRef.current) return;

    // Search for hovered node
    let found: GraphNode | null = null;
    for (const node of nodesRef.current) {
      const dx = node.x - x;
      const dy = node.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < node.radius + 15) {
        found = node;
        break;
      }
    }

    if (hoveredNodeRef.current !== found) {
      hoveredNodeRef.current = found;
      // Update browser cursor class dynamically
      canvas.style.cursor = found ? "pointer" : "default";
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    mouseRef.current.isDown = false;

    if (draggedNodeRef.current) {
      canvas.releasePointerCapture(e.pointerId);
      
      // If dragged Node was barely moved, handle as standard Click event
      const dx = draggedNodeRef.current.x - mouseRef.current.x;
      const dy = draggedNodeRef.current.y - mouseRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 5) {
        if (draggedNodeRef.current.type === "book" && draggedNodeRef.current.book) {
          onSelectBook(draggedNodeRef.current.book);
        }
      }
      draggedNodeRef.current = null;
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full rounded-2xl border border-white/5 glass overflow-hidden shadow-2xl"
      style={{ minHeight: "550px", height: "550px" }}
    >
      {/* Dynamic Background elements */}
      <div className="absolute inset-0 bg-space-noise opacity-[0.03] pointer-events-none" />
      <div 
        className="absolute inset-0 pointer-events-none transition-[background] duration-500 opacity-20"
        style={{
          background: hoveredNodeRef.current 
            ? `radial-gradient(circle 250px at ${hoveredNodeRef.current.x}px ${hoveredNodeRef.current.y}px, ${hoveredNodeRef.current.color}35, transparent)`
            : "none"
        }}
      />
      
      {/* Help tooltip */}
      <div className="absolute top-4 left-6 pointer-events-none select-none font-mono text-[9px] uppercase tracking-[0.25em] text-muted-foreground/60 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
        <span>Pressione, arraste para explorar · Clique para abrir</span>
      </div>

      {/* Nodes Legend */}
      <div className="absolute bottom-4 right-6 pointer-events-none select-none font-mono text-[8px] uppercase tracking-[0.2em] text-muted-foreground/40 flex flex-wrap gap-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
          <span>Tema</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-sm shadow-cyan-500/50" />
          <span>Autor</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          <span>Livro</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="block bg-transparent"
      />
    </div>
  );
}
