import { useState, useId, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileUp, Eye, Layers, Search, Globe, Clock, CheckCircle2, AlertCircle, Users, ChevronRight, Award, FileText, Barcode, Link2, RefreshCw, X } from "lucide-react";
import * as THREE from "three";

interface JourneyStage {
  id: number;
  title: string;
  shortDesc: string;
  icon: typeof FileUp;
  sla: string;
  participants: string;
  deliverable: string;
  longDesc: string;
  details: string[];
  // Suggestion 8: thematic color per stage
  color: string;       // main accent (hex)
  colorRgb: string;    // rgb triple for rgba()
  label: string;       // short label for the card
}

// Global cache for GeoJSON to prevent fetching on every mount/render
let cachedGeoJSON: any = null;
let geoJSONPromise: Promise<any> | null = null;

async function getGeoJSON() {
  if (cachedGeoJSON) return cachedGeoJSON;
  if (!geoJSONPromise) {
    geoJSONPromise = fetch("https://cdn.jsdelivr.net/gh/nvkelso/natural-earth-vector@master/geojson/ne_50m_admin_0_countries.geojson")
      .then(r => r.json())
      .then(data => {
        cachedGeoJSON = data;
        return data;
      });
  }
  return geoJSONPromise;
}

const PALETTES = {
  vivid: {
    ocean: '#3d92c4',
    border: 'rgba(45,30,20,0.55)',
    countries: [
      '#f3c84a', '#e98b3a', '#d94a4a', '#e85d8a',
      '#6fbf4a', '#7fc8b6', '#b8a050', '#e4b96a',
      '#b96a9b', '#a36c3a', '#dba85a', '#c97c6c',
    ],
  }
};

function hashStr(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function shadeColor(hex: string, percent: number) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substring(0,2), 16);
  const g = parseInt(c.substring(2,4), 16);
  const b = parseInt(c.substring(4,6), 16);
  const t = percent < 0 ? 0 : 255;
  const p = Math.abs(percent) / 100;
  const nr = Math.round((t - r) * p) + r;
  const ng = Math.round((t - g) * p) + g;
  const nb = Math.round((t - b) * p) + b;
  return '#' + [nr, ng, nb].map(v => v.toString(16).padStart(2, '0')).join('');
}

const OCEANS = [
  { name: 'OCEANO PACIFICO',   lon: -150, lat: 25,  size: 56, spacing: 14 },
  { name: 'OCEANO PACIFICO',   lon: -125, lat: -32, size: 46, spacing: 12 },
  { name: 'OCEANO ATLANTICO',  lon: -32,  lat: 32,  size: 42, spacing: 10 },
  { name: 'OCEANO ATLANTICO',  lon: -18,  lat: -28, size: 42, spacing: 10 },
  { name: 'OCEANO INDICO',     lon: 80,   lat: -22, size: 42, spacing: 10 },
  { name: 'OCEANO ARTICO',     lon: 0,    lat: 80,  size: 32, spacing: 8 },
];
const SEAS = [
  { name: 'Mar do Caribe',     lon: -75,  lat: 15,  size: 16 },
  { name: 'Mar Mediterraneo',  lon: 17,   lat: 35,  size: 18 },
  { name: 'Mar do Norte',      lon: 3,    lat: 56,  size: 14 },
  { name: 'Golfo do Mexico',   lon: -90,  lat: 25,  size: 16 },
  { name: 'Mar Arabico',       lon: 63,   lat: 14,  size: 16 },
  { name: 'Baia de Bengala',   lon: 88,   lat: 13,  size: 14 },
  { name: 'Mar do Japao',      lon: 134,  lat: 40,  size: 14 },
  { name: 'Mar de Bering',     lon: -178, lat: 58,  size: 14 },
  { name: 'Mar de Coral',      lon: 156,  lat: -15, size: 14 },
];
const CAPITALS = [
  { name: 'Brasilia',         lon: -47.93, lat: -15.78 },
  { name: 'Washington',       lon: -77.04, lat: 38.91 },
  { name: 'Cidade do Mexico', lon: -99.13, lat: 19.43 },
  { name: 'Ottawa',           lon: -75.70, lat: 45.42 },
  { name: 'Buenos Aires',     lon: -58.38, lat: -34.61 },
  { name: 'Lima',             lon: -77.04, lat: -12.05 },
  { name: 'Bogota',           lon: -74.07, lat: 4.71 },
  { name: 'Santiago',         lon: -70.65, lat: -33.45 },
  { name: 'Caracas',          lon: -66.90, lat: 10.49 },
  { name: 'Londres',          lon: -0.13,  lat: 51.51 },
  { name: 'Paris',            lon: 2.35,   lat: 48.86 },
  { name: 'Madri',            lon: -3.70,  lat: 40.42 },
  { name: 'Roma',             lon: 12.50,  lat: 41.90 },
  { name: 'Berlim',           lon: 13.40,  lat: 52.52 },
  { name: 'Moscou',           lon: 37.62,  lat: 55.75 },
  { name: 'Istambul',         lon: 28.98,  lat: 41.01 },
  { name: 'Cairo',            lon: 31.24,  lat: 30.04 },
  { name: 'Lagos',            lon: 3.39,   lat: 6.52 },
  { name: 'Nairobi',          lon: 36.82,  lat: -1.29 },
  { name: 'Cidade do Cabo',   lon: 18.42,  lat: -33.92 },
  { name: 'Nova Delhi',       lon: 77.21,  lat: 28.61 },
  { name: 'Mumbai',           lon: 72.88,  lat: 19.07 },
  { name: 'Pequim',           lon: 116.40, lat: 39.90 },
  { name: 'Xangai',           lon: 121.47, lat: 31.23 },
  { name: 'Toquio',           lon: 139.65, lat: 35.68 },
  { name: 'Seul',             lon: 126.97, lat: 37.57 },
  { name: 'Jacarta',          lon: 106.83, lat: -6.21 },
  { name: 'Manila',           lon: 120.98, lat: 14.60 },
  { name: 'Bangkok',          lon: 100.50, lat: 13.75 },
  { name: 'Sydney',           lon: 151.21, lat: -33.87 },
  { name: 'Canberra',         lon: 149.13, lat: -35.28 },
  { name: 'Wellington',       lon: 174.78, lat: -41.29 },
];

function drawSpacedText(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, spacing: number) {
  const chars = [...text];
  const widths = chars.map(c => ctx.measureText(c).width);
  let total = 0;
  for (const w of widths) total += w + spacing;
  total -= spacing;
  let x = cx - total / 2;
  ctx.textAlign = 'left';
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i], x, cy);
    x += widths[i] + spacing;
  }
}

function drawPoliticalMap(geo: any) {
  const W = 4096, H = 2048;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, W, H);

  // ---------- 1. Ocean ----------
  const oceanGrad = ctx.createLinearGradient(0, 0, 0, H);
  const ocean = PALETTES.vivid.ocean;
  oceanGrad.addColorStop(0, shadeColor(ocean, -10));
  oceanGrad.addColorStop(0.5, ocean);
  oceanGrad.addColorStop(1, shadeColor(ocean, -12));
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, 0, W, H);

  function project(lon: number, lat: number) {
    return [(lon + 180) / 360 * W, (90 - lat) / 180 * H];
  }

  const features = geo.features;
  const colors = PALETTES.vivid.countries;

  // ---------- 2. Country fills ----------
  for (const f of features) {
    const name = (f.properties && (f.properties.ADMIN || f.properties.NAME)) || 'x';
    const idx = hashStr(name) % colors.length;
    ctx.fillStyle = colors[idx];
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) {
      ctx.beginPath();
      for (const ring of poly) {
        for (let i = 0; i < ring.length; i++) {
          const [x, y] = project(ring[i][0], ring[i][1]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
      }
      ctx.fill('evenodd');
    }
  }

  // ---------- 3. Country borders ----------
  ctx.strokeStyle = PALETTES.vivid.border;
  ctx.lineWidth = 1.4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  for (const f of features) {
    const g = f.geometry;
    if (!g) continue;
    const polys = g.type === 'Polygon' ? [g.coordinates] : g.coordinates;
    for (const poly of polys) {
      for (const ring of poly) {
        ctx.beginPath();
        for (let i = 0; i < ring.length; i++) {
          const [x, y] = project(ring[i][0], ring[i][1]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }
  }

  // ---------- 4. Meridian / parallel grid ----------
  ctx.strokeStyle = 'rgba(40,30,20,0.20)';
  ctx.lineWidth = 1;
  for (let lon = -180; lon <= 180; lon += 15) {
    const x = (lon + 180) / 360 * W;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let lat = -75; lat <= 75; lat += 15) {
    const y = (90 - lat) / 180 * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(40,30,20,0.32)';
  ctx.lineWidth = 1.6;
  for (let lon = -180; lon <= 180; lon += 30) {
    const x = (lon + 180) / 360 * W;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let lat = -60; lat <= 60; lat += 30) {
    const y = (90 - lat) / 180 * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // Equator (red)
  ctx.strokeStyle = 'rgba(180,40,40,0.7)';
  ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

  // Tropics (dashed)
  ctx.strokeStyle = 'rgba(40,30,20,0.55)';
  ctx.lineWidth = 1.6;
  ctx.setLineDash([14, 8]);
  for (const lat of [23.5, -23.5]) {
    const y = (90 - lat) / 180 * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.setLineDash([6, 8]);
  for (const lat of [66.5, -66.5]) {
    const y = (90 - lat) / 180 * H;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
  ctx.setLineDash([]);

  // Lat/lon callout labels
  ctx.fillStyle = 'rgba(40,30,20,0.7)';
  ctx.font = '600 18px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  const callX = (180 - 165) / 360 * W;
  for (let lat = -60; lat <= 60; lat += 30) {
    if (lat === 0) continue;
    const y = (90 - lat) / 180 * H;
    const lbl = Math.abs(lat) + '°' + (lat > 0 ? ' N' : ' S');
    const pad = 6;
    const w = ctx.measureText(lbl).width + pad * 2;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillRect(callX - w/2, y - 12, w, 22);
    ctx.fillStyle = 'rgba(40,30,20,0.85)';
    ctx.fillText(lbl, callX, y);
  }
  // Equator label
  {
    const lbl = 'EQUADOR  ·  0°';
    ctx.font = '700 18px sans-serif';
    const pad = 8;
    const w = ctx.measureText(lbl).width + pad * 2;
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.fillRect(callX - w/2, H/2 - 13, w, 24);
    ctx.fillStyle = 'rgba(180,40,40,0.95)';
    ctx.fillText(lbl, callX, H/2);
  }

  // ---------- 5. Country labels ----------
  for (const f of features) {
    const p = f.properties || {};
    const name = p.NAME || p.NAME_LONG || p.ADMIN;
    if (!name) continue;

    const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
    let minLon = 180, maxLon = -180, minLat = 90, maxLat = -90;
    let largest = polys[0]; let largestPts = 0;
    for (const poly of polys) {
      if (poly[0].length > largestPts) { largest = poly; largestPts = poly[0].length; }
      for (const ring of poly) {
        for (const pt of ring) {
          if (pt[0] < minLon) minLon = pt[0];
          if (pt[0] > maxLon) maxLon = pt[0];
          if (pt[1] < minLat) minLat = pt[1];
          if (pt[1] > maxLat) maxLat = pt[1];
        }
      }
    }
    const widthDeg = Math.max(0.5, maxLon - minLon);
    const heightDeg = Math.max(0.5, maxLat - minLat);

    let lon, lat;
    if (typeof p.LABEL_X === 'number' && typeof p.LABEL_Y === 'number') {
      lon = p.LABEL_X; lat = p.LABEL_Y;
    } else {
      let sx = 0, sy = 0; const ring = largest[0];
      for (const pt of ring) { sx += pt[0]; sy += pt[1]; }
      lon = sx / ring.length; lat = sy / ring.length;
    }
    if (Math.abs(lat) > 72) continue;

    const upper = name.toUpperCase();
    const targetPxWidth = (widthDeg / 360) * W * 0.85;
    const baseFont = 24;
    ctx.font = `700 ${baseFont}px sans-serif`;
    const baseW = ctx.measureText(upper).width;
    let fontSize = (targetPxWidth / Math.max(1, baseW)) * baseFont;
    const maxByHeight = (heightDeg / 180) * H * 0.55;
    fontSize = Math.min(fontSize, maxByHeight);
    fontSize = Math.max(10, Math.min(34, fontSize));
    if (fontSize < 11) continue;

    const [x, y] = project(lon, lat);
    ctx.font = `700 ${fontSize}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = Math.max(2, fontSize * 0.22);
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.strokeText(upper, x, y);
    ctx.fillStyle = 'rgba(30,22,15,0.95)';
    ctx.fillText(upper, x, y);
  }

  // ---------- 6. Capitals ----------
  for (const c of CAPITALS) {
    const [x, y] = project(c.lon, c.lat);
    ctx.fillStyle = 'rgba(20,15,10,0.95)';
    ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.font = '600 17px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.strokeText(c.name, x + 10, y);
    ctx.fillStyle = 'rgba(25,18,12,0.95)';
    ctx.fillText(c.name, x + 10, y);
  }

  // ---------- 7. Ocean & sea labels ----------
  ctx.fillStyle = 'rgba(255,255,255,0.55)';
  for (const o of OCEANS) {
    const [x, y] = project(o.lon, o.lat);
    ctx.font = `italic 700 ${o.size}px sans-serif`;
    drawSpacedText(ctx, o.name, x, y, o.spacing);
  }
  for (const s of SEAS) {
    const [x, y] = project(s.lon, s.lat);
    ctx.font = `italic 500 ${s.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillText(s.name, x, y);
  }

  return canvas;
}

const ThreeGlobe = ({ isSpinning = true, color = "#3b82f6" }: { isSpinning?: boolean, color?: string }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let geoJSON: any = null;
    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    const initGlobe = async () => {
      try {
        geoJSON = await getGeoJSON();
        if (!active) return;
        setLoading(false);
      } catch (err) {
        console.error("Failed to load geojson for 3D globe:", err);
        return;
      }

      if (!mountRef.current) return;

      const width = 168;
      const height = 168;

      // 1. Scene
      const scene = new THREE.Scene();

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
      camera.position.set(0, 0, 3.5);

      // 3. Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.max(3, window.devicePixelRatio));
      renderer.setSize(width, height);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setClearColor(0x000000, 0);
      mountRef.current.appendChild(renderer.domElement);

      // 4. Lighting
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
      keyLight.position.set(-3, 4, 4);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.6);
      fillLight.position.set(3, 2, -2);
      scene.add(fillLight);

      // 5. Texture
      const textureCanvas = drawPoliticalMap(geoJSON);
      if (!textureCanvas) return;
      const politicalTexture = new THREE.CanvasTexture(textureCanvas);
      politicalTexture.colorSpace = THREE.SRGBColorSpace;
      politicalTexture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;

      // 6. Globe Mesh
      const earthMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: politicalTexture,
        roughness: 0.6,
        metalness: 0.05,
      });

      const earthMesh = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 128), earthMat);
      earthMesh.rotation.z = 0.4;
      scene.add(earthMesh);

      // 7. Touch/Mouse rotation
      let isDragging = false;
      let previousMousePosition = { x: 0, y: 0 };

      const onMouseDown = (e: MouseEvent) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseMove = (e: MouseEvent) => {
        if (!isDragging) return;
        const deltaMove = {
          x: e.clientX - previousMousePosition.x,
          y: e.clientY - previousMousePosition.y
        };

        earthMesh.rotation.y += deltaMove.x * 0.005;
        earthMesh.rotation.x += deltaMove.y * 0.005;

        previousMousePosition = { x: e.clientX, y: e.clientY };
      };

      const onMouseUp = () => {
        isDragging = false;
      };

      const onTouchStart = (e: TouchEvent) => {
        isDragging = true;
        if (e.touches.length > 0) {
          previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
      };

      const onTouchMove = (e: TouchEvent) => {
        if (!isDragging || e.touches.length === 0) return;
        const deltaMove = {
          x: e.touches[0].clientX - previousMousePosition.x,
          y: e.touches[0].clientY - previousMousePosition.y
        };

        earthMesh.rotation.y += deltaMove.x * 0.005;
        earthMesh.rotation.x += deltaMove.y * 0.005;

        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      };

      const domElement = renderer.domElement;
      domElement.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      domElement.addEventListener('touchstart', onTouchStart);
      window.addEventListener('touchmove', onTouchMove);
      window.addEventListener('touchend', onMouseUp);

      // 8. Animation loop
      const animate = () => {
        if (!active) return;
        animationFrameId = requestAnimationFrame(animate);

        if (!isDragging && isSpinning) {
          earthMesh.rotation.y += 0.0035;
        }

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        active = false;
        cancelAnimationFrame(animationFrameId);
        if (domElement) {
          domElement.removeEventListener('mousedown', onMouseDown);
          domElement.removeEventListener('touchstart', onTouchStart);
        }
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onMouseUp);

        if (renderer) {
          renderer.dispose();
          if (mountRef.current && domElement.parentNode === mountRef.current) {
            mountRef.current.removeChild(domElement);
          }
        }
        politicalTexture.dispose();
        earthMat.dispose();
        earthMesh.geometry.dispose();
      };
    };

    let cleanupFn: (() => void) | undefined;
    initGlobe().then(cleanup => {
      cleanupFn = cleanup;
    });

    return () => {
      active = false;
      if (cleanupFn) cleanupFn();
    };
  }, [isSpinning]);

  return (
    <div style={{ width: 168, height: 168, position: 'relative', pointerEvents: 'auto' }}>
      {/* Dynamic pulsing ring matching active stage color */}
      {isSpinning && (
        <>
          <div style={{
            position: 'absolute',
            inset: -16,
            borderRadius: '50%',
            border: `1.5px solid ${color}`,
            pointerEvents: 'none',
            animation: 'three-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
          }} />
          <style>{`
            @keyframes three-ping {
              0% { transform: scale(0.9); opacity: 0.8; }
              100% { transform: scale(1.15); opacity: 0; }
            }
          `}</style>
        </>
      )}
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0f19',
          borderRadius: '50%',
        }}>
          <div style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTopColor: '#f97316',
            animation: 'three-spin 1s linear infinite',
          }} />
          <style>{`
            @keyframes three-spin { to { transform: rotate(360deg); } }
          `}</style>
        </div>
      )}
      <div 
        ref={mountRef} 
        style={{ 
          width: 168, 
          height: 168, 
          cursor: 'grab',
          borderRadius: '50%',
          overflow: 'hidden',
          filter: isSpinning ? "none" : "grayscale(1) opacity(0.35)",
          transition: "filter 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }} 
      />
    </div>
  );
};

const STAGES: JourneyStage[] = [
  {
    id: 1,
    title: "1. Submissão",
    label: "Submissão",
    shortDesc: "O autor escolhe uma chamada aberta e envia seu manuscrito pelo canal de preferência.",
    icon: FileUp,
    color: "#f97316",
    colorRgb: "249,115,22",
    sla: "1 dia",
    participants: "Autor e Comitê Científico Interno",
    deliverable: "Manuscrito validado para avaliação de pares",
    longDesc: "O autor realiza a submissão do seu trabalho escolhendo uma das chamadas abertas disponíveis. O envio pode ser feito pelo sistema próprio do site, pelo e-mail contato@poisson.com.br ou via WhatsApp no número +55 (31) 8218-5531.",
    details: [
      "Verificação de aderência à temática da chamada",
      "Formatação básica segundo as normas da ABNT/APA"
    ]
  },
  {
    id: 2,
    title: "2. Avaliação por Pares",
    label: "Peer Review",
    shortDesc: "Revisão rigorosa feita por dois pareceristas doutores independentes.",
    icon: Eye,
    color: "#06b6d4",
    colorRgb: "6,182,212",
    sla: "5 dias",
    participants: "Revisores Doutores Ad-Hoc",
    deliverable: "Pareceres técnicos qualitativos internos sobre o conteúdo",
    longDesc: "O manuscrito é encaminhado para avaliação científica por pareceristas especializados na área temática do trabalho. Após análise criteriosa do conteúdo, metodologia e relevância acadêmica, é emitida a decisão editorial.",
    details: [
      "Análise de relevância científica e rigor metodológico",
      "Sugestões de ajustes e aprimoramento teórico",
      "Decisão: Aceitar, Aceitar com Modificações, ou Rejeitar",
      "Em caso de divergência, um terceiro parecerista é acionado"
    ]
  },
  {
    id: 3,
    title: "3. Copidesque e Diagramação",
    label: "Diagramação",
    shortDesc: "Normalização textual e design editorial profissional OpenXML.",
    icon: Layers,
    color: "#a855f7",
    colorRgb: "168,85,247",
    sla: "10 dias",
    participants: "Tradutores, Revisores de Texto e Designers",
    deliverable: "Arquivo PDF do capítulo totalmente diagramado",
    longDesc: "Nossa equipe de designers realiza a diagramação avançada, convertendo o texto para o padrão OpenXML e gerando PDFs otimizados para leitura.",
    details: [
      "Revisão gramatical e adequação ao acordo ortográfico",
      "Geração de abstract e palavras-chave bilíngues",
      "Diagramação padronizada com cabeçalhos e rodapés institucionais",
      "Conversão para formatos acessíveis de leitura digital"
    ]
  },
  {
    id: 4,
    title: "4. Atribuição de DOI e Metadados",
    label: "DOI & Metadados",
    shortDesc: "Registro do DOI e indexação em bases de dados nacionais e globais.",
    icon: Search,
    color: "#10b981",
    colorRgb: "16,185,129",
    sla: "3 a 5 dias",
    participants: "Coordenador de Indexação e CrossRef",
    deliverable: "Link de DOI ativo e metadados indexados",
    longDesc: "Geramos e registramos o DOI (Digital Object Identifier) individual do capítulo junto à agência internacional CrossRef. Isso garante que o trabalho tenha um link permanente e rastreável. Paralelamente, estruturamos os metadados para indexadores.",
    details: [
      "Depósito do XML de metadados na base da CrossRef",
      "Ativação do link permanente de DOI (ex: 10.36229/...)",
      "Estruturação de metadados OAI-PMH para fácil colheita",
      "Envio de dados para indexadores (Google Scholar, Latindex, etc.)"
    ]
  },
  {
    id: 5,
    title: "5. Publicação e Difusão Global",
    label: "Publicação",
    shortDesc: "Disponibilização sob licença Creative Commons sem barreiras.",
    icon: Globe,
    color: "#3b82f6",
    colorRgb: "59,130,246",
    sla: "Data prevista na chamada aberta",
    participants: "Toda a comunidade científica internacional",
    deliverable: "Disseminação em rede, citações e download livre",
    longDesc: "O livro completo e seus capítulos individuais são disponibilizados gratuitamente em nosso portal de acesso aberto, sob uma licença Creative Commons CC BY. Qualquer pessoa no mundo pode ler, baixar, imprimir e citar a pesquisa de forma irrestrita. O lançamento é também divulgado em nossas redes sociais, ampliando o alcance da pesquisa publicada.",
    details: [
      "Disponibilização do e-book completo em PDF para download gratuito",
      "Liberação da página individual do artigo com contador de leituras",
      "Divulgação nas redes científicas e e-mail marketing acadêmico",
      "Envio de cópias de depósito legal e registros institucionais"
    ]
  }
];

const CopperPulseFlow = ({ setActiveStage }: { setActiveStage: (stage: JourneyStage) => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ── paleta Cobre ──────────────────────────────────────────────
    const CORE = [255, 196, 152];   // brilho central do pulso
    const GLOW = [196, 108,  64];   // halo / linha base
    const rgba = (c: number[], a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    // ── parâmetros ────────────────────────────────────────────────
    const SPEED     = 0.4;     // 0.2 .. 2.4

    let pulses: any[] = [];
    let animationFrameId: number;
    let currentStageIndex = -1;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width  = rect.width  * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width  = rect.width  + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    function renderPulse(w: number, h: number, dt: number) {
      if (!ctx) return;
      const cy = h / 2;
      
      const startX = w * (57.1 / 600);
      const endX = w * (542.9 / 600) - 84;

      ctx.globalCompositeOperation = 'lighter';

      // hairline base — guia fina, fade nas pontas
      const base = ctx.createLinearGradient(startX, 0, endX, 0);
      base.addColorStop(0,   rgba(GLOW, 0));
      base.addColorStop(0.5, rgba(GLOW, 0.22));
      base.addColorStop(1,   rgba(GLOW, 0));
      ctx.strokeStyle = base;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(startX, cy); ctx.lineTo(endX, cy);
      ctx.stroke();

      // spawn único pulso
      if (pulses.length === 0) {
        pulses.push({
          x: startX,
          v: 0.1, // velocidade constante
          len: 120, // tamanho da cauda
          peak: 1.0,
        });
      }

      for (const p of pulses) {
        p.x += p.v * dt * SPEED;
        
        // Loop da bolinha
        if (p.x > endX + 220) {
          p.x = startX;
        }

        const head = p.x;
        const tail = Math.max(startX, p.x - p.len); // não desenhar cauda antes do início

        if (head >= startX && tail <= endX) {
          const drawHead = Math.min(head, endX);

          const body = ctx.createLinearGradient(tail, cy, drawHead, cy);
          body.addColorStop(0,    rgba(GLOW, 0));
          body.addColorStop(0.7,  rgba(GLOW, p.peak * 0.35));
          body.addColorStop(0.95, rgba(CORE, p.peak));
          body.addColorStop(1,    rgba(CORE, 0));
          ctx.strokeStyle = body;
          ctx.lineWidth = 2.4;
          ctx.lineCap = 'round';
          ctx.shadowColor = rgba(GLOW, 0.9);
          ctx.shadowBlur = 22;
          ctx.beginPath();
          ctx.moveTo(tail, cy); ctx.lineTo(drawHead, cy);
          ctx.stroke();

          if (head <= endX + 15) { // esconde a bolinha suavemente ao chegar no final
            const bead = ctx.createRadialGradient(drawHead, cy, 0, drawHead, cy, 26);
            bead.addColorStop(0,   rgba(CORE, p.peak));
            bead.addColorStop(0.5, rgba(GLOW, p.peak * 0.3));
            bead.addColorStop(1,   rgba(GLOW, 0));
            ctx.fillStyle = bead;
            ctx.beginPath();
            ctx.arc(drawHead, cy, 26, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Ativar os cards dinamicamente
        const normX = head / w;
        let newIdx = 0;
        if (normX < 0.297) newIdx = 0;
        else if (normX < 0.500) newIdx = 1;
        else if (normX < 0.702) newIdx = 2;
        else if (normX < 0.904) newIdx = 3;
        else newIdx = 4;

        if (newIdx !== currentStageIndex) {
          currentStageIndex = newIdx;
          setActiveStage(STAGES[newIdx]);
        }
      }
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    }

    let last = performance.now();
    function frame(now: number) {
      if (!ctx || !canvas) return;
      const dt = Math.min(40, now - last);
      last = now;
      const w = canvas.clientWidth, h = canvas.clientHeight;

      // Limpa tudo, deixando transparente para mostrar o fundo da página
      ctx.clearRect(0, 0, w, h);

      // Renderiza apenas os pulsos brilhantes
      renderPulse(w, h, dt);

      animationFrameId = requestAnimationFrame(frame);
    }
    animationFrameId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [setActiveStage]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }} />;
};

export default function ManuscriptJourney() {
  const [activeStage, setActiveStage] = useState<JourneyStage>(STAGES[0]);
  const [mobileModalOpen, setMobileModalOpen] = useState(false);

  return (
    <div className="mx-auto max-w-6xl px-6 pb-24">
      {/* HEADER */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-mono text-xs tracking-[0.35em] uppercase text-orange-500">
          Jornada Editorial do Autor
        </span>
        <h1 className="mt-3 font-display text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] tracking-tight text-balance">
          O Caminho do seu <span className="serif text-orange-500 italic">Manuscrito</span>
        </h1>
        <p className="mt-4 text-base text-muted-foreground text-pretty">
          Conheça o processo científico e o fluxo editorial que garante o rigor acadêmico, a excelência gráfica e a indexação global das obras publicadas pela Editora Poisson.
        </p>
      </div>

      {/* STAGE GRID */}
      <div className="text-center mb-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Clique em cada Etapa
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-24">
        {STAGES.map((stage) => {
          const isActive = activeStage.id === stage.id;
          const Icon = stage.icon;

          return (
            <motion.button
              key={stage.id}
              onClick={() => {
                setActiveStage(stage);
                if (window.innerWidth < 1024) setMobileModalOpen(true);
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className={`p-4 text-left rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[110px] journey-stage-btn ${isActive ? 'journey-stage-btn-active' : 'journey-stage-btn-inactive'}`}
              style={
                isActive
                  ? {
                      background: `rgba(${stage.color === "#f97316" ? "249,115,22" : stage.colorRgb},0.12)`,
                      borderColor: stage.color,
                      boxShadow: `0 0 20px rgba(${stage.colorRgb},0.2)`,
                    }
                  : {
                      background: "var(--inactive-stage-bg)",
                      borderColor: "var(--inactive-stage-border)",
                    }
              }
            >
              <div className="flex items-center justify-between w-full">
                {/* Suggestion 7: animated icon when active */}
                {isActive ? (
                  <motion.div
                    key={`icon-active-${stage.id}`}
                    animate={{
                      scale: [1, 1.18, 1],
                      rotate: [0, -8, 8, 0],
                    }}
                    transition={{
                      duration: 2.4,
                      repeat: Infinity,
                      repeatType: "loop",
                      ease: "easeInOut",
                    }}
                  >
                    <Icon size={20} style={{ color: stage.color }} isSpinning={true} />
                  </motion.div>
                ) : (
                  <Icon size={20} style={{ color: "var(--inactive-stage-icon)" }} isSpinning={false} />
                )}
                <span className="font-mono text-[11px] opacity-30">0{stage.id}</span>
              </div>

              <div className="mt-4">
                <p
                  className="font-sans text-[14px] font-bold tracking-tight leading-tight"
                  style={isActive ? { color: stage.color } : { color: "var(--inactive-stage-text)" }}
                >
                  {stage.label}
                </p>
              </div>

              {/* Thematic active bar */}
              {isActive && (
                <motion.div
                  layoutId="active-bar"
                  className="absolute inset-x-0 bottom-0 h-[3px] rounded-b-2xl"
                  style={{ background: stage.color }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* CONNECTIVE VECTOR FLOW PANEL */}
      <div className="relative mt-16 mb-28 w-full h-32 hidden lg:flex items-center justify-center select-none">
        <CopperPulseFlow setActiveStage={setActiveStage} />

        <svg viewBox="0 0 600 20" className="w-full h-auto overflow-visible pointer-events-none" style={{ zIndex: 10 }}>
          {/* Stepper nodes (stages 1 to 4) */}
          {STAGES.map((stage, idx) => {
            if (idx === 4) return null; // Rendered as an absolute HTML/WebGL sibling below

            const centers = [57.1, 178.55, 300.0, 421.45, 542.9];
            const cx = centers[idx];
            const isCompleted = activeStage.id > idx + 1;
            const isCurrent = activeStage.id === idx + 1;

            return (
              <g key={idx}>
                <circle
                  cx={cx}
                  cy="10"
                  r={isCurrent ? 7 : 5}
                  fill={isCurrent ? stage.color : isCompleted ? "#10b981" : "var(--stepper-node, var(--stepper-node-inactive))"}
                  stroke="var(--bg-color)"
                  strokeWidth="1.5"
                  style={{ transition: "all 0.3s" }}
                />
                {isCurrent && (
                  <circle
                    cx={cx}
                    cy="10"
                    r="14"
                    fill="none"
                    stroke={stage.color}
                    strokeWidth="1"
                    style={{ 
                      animation: "ping 1.5s cubic-bezier(0,0,0.2,1) forwards",
                      transformOrigin: `${cx}px 10px`
                    }}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Absolute high-resolution 3D WebGL Globe, rendered directly in the DOM to bypass SVG foreignObject low-res rasterization bugs */}
        {(() => {
          const stage5 = STAGES[4];
          const isCompleted = activeStage.id > 5;
          const isCurrent = activeStage.id === 5;
          return (
            <div 
              style={{ 
                position: 'absolute',
                left: '90.4833%', // Math: cx (542.9) / total svg width (600)
                top: '50%',
                transform: 'translate(-50%, -50%)',
                width: 168,
                height: 168,
                pointerEvents: 'auto',
                zIndex: 10,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <ThreeGlobe 
                isSpinning={true} 
                color={stage5.color}
              />
              {/* Text label below the globe */}
              <div style={{
                position: 'absolute',
                bottom: -32,
                whiteSpace: 'nowrap',
                fontSize: '11px',
                fontWeight: '600',
                color: isCurrent ? stage5.color : 'var(--text-muted, rgba(255,255,255,0.4))',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                transition: 'color 0.3s'
              }}>
                divulgação para o mundo
              </div>
            </div>
          );
        })()}

        <style>{`
          @keyframes ping {
            75%, 100% { transform: scale(1.8); opacity: 0; }
          }
        `}</style>
      </div>

      {/* DETAIL PANEL */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStage.id}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35 }}
          className="grid grid-cols-1 md:grid-cols-[1fr_minmax(280px,360px)] gap-8 rounded-3xl border p-8 shadow-2xl relative overflow-hidden journey-details-panel"
          style={{
            background: `rgba(${activeStage.colorRgb},0.04)`,
            borderColor: `rgba(${activeStage.colorRgb},0.18)`,
          }}
        >
          {/* Subtle corner glow */}
          <div
            className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl pointer-events-none"
            style={{ background: `rgba(${activeStage.colorRgb},0.08)` }}
          />

          {/* Workflow details */}
          <div className="relative z-10">
            <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest"
              style={{ color: activeStage.color }}>
              <CheckCircle2 className="size-3.5" style={{ color: activeStage.color }} />
              <span>Etapa Científica Ativa</span>
            </div>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">
              {activeStage.title}
            </h2>

            <p className="mt-4 text-base md:text-lg leading-relaxed text-muted-foreground text-pretty">
              {activeStage.longDesc}
            </p>
          </div>

          {/* SLA metadata box */}
          <div
            className="relative z-10 rounded-2xl p-6 border flex flex-col justify-between journey-sla-box"
            style={{
              background: `rgba(${activeStage.colorRgb},0.07)`,
              borderColor: `rgba(${activeStage.colorRgb},0.15)`,
            }}
          >
            <div className="space-y-5">
              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Clock className="size-3.5" style={{ color: activeStage.color }} />
                  <span>Prazo Estimado (SLA)</span>
                </div>
                <p className="mt-1 font-display text-xl font-bold text-foreground">
                  {activeStage.sla}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <Users className="size-3.5" style={{ color: activeStage.color }} />
                  <span>Quem Atua</span>
                </div>
                <p className="mt-1 font-sans text-xs text-foreground/90 font-semibold leading-snug">
                  {activeStage.participants}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  <AlertCircle className="size-3.5" style={{ color: activeStage.color }} />
                  <span>Entregável Final</span>
                </div>
                <p className="mt-1 font-sans text-xs text-foreground/90 font-semibold leading-snug">
                  {activeStage.deliverable}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t" style={{ borderColor: `rgba(${activeStage.colorRgb},0.2)` }}>
              {activeStage.id < 5 ? (
                <button
                  onClick={() => setActiveStage(STAGES[activeStage.id])}
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-mono tracking-widest uppercase transition-all font-semibold"
                  style={{
                    background: `rgba(${activeStage.colorRgb},0.1)`,
                    color: activeStage.color,
                    border: `1px solid rgba(${activeStage.colorRgb},0.2)`,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = `rgba(${activeStage.colorRgb},0.2)`)}
                  onMouseLeave={e => (e.currentTarget.style.background = `rgba(${activeStage.colorRgb},0.1)`)}
                >
                  <span>Avançar Etapa</span>
                  <ChevronRight className="size-3.5" />
                </button>
              ) : (
                <div className="relative w-full">
                  {/* Slow, smooth glowing ripple behind the button */}
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    style={{ background: activeStage.color }}
                    animate={{
                      scale: [1, 1.12, 1.25],
                      opacity: [0.65, 0.3, 0]
                    }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                  />
                  
                  {/* Foreground button with hover micro-interaction */}
                  <motion.a
                    href="/chamadas-abertas"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative z-10 w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-mono tracking-widest uppercase text-white font-bold"
                    style={{ 
                      background: activeStage.color,
                      boxShadow: `0 4px 14px rgba(${activeStage.colorRgb}, 0.35)`
                    }}
                  >
                    <span>Quero Publicar</span>
                    <Globe className="size-3.5" />
                  </motion.a>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* MOBILE MODAL */}
      <AnimatePresence>
        {mobileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-sm flex items-end lg:hidden"
            onClick={(e) => { if (e.target === e.currentTarget) setMobileModalOpen(false); }}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="journey-details-panel w-full max-h-[90vh] rounded-t-3xl flex flex-col border border-white/10"
              style={{ background: 'rgba(11,15,25,0.97)' }}
            >
              {/* Non-scrolling header with X */}
              <div className="flex-shrink-0 flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: activeStage.color }} />
                  <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: activeStage.color }}>
                    Etapa {activeStage.id} · {activeStage.label}
                  </span>
                </div>
                <button
                  onClick={() => setMobileModalOpen(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-black text-white shadow-lg hover:bg-neutral-800 transition-colors border border-white/10"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable content */}
              <div className="overflow-y-auto flex-1 px-5 pb-8 pt-2">
                <h2 className="font-display text-2xl font-bold tracking-tight text-white mb-3">
                  {activeStage.title}
                </h2>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.6)' }}>
                  {activeStage.longDesc}
                </p>

                {/* SLA box */}
                <div
                  className="rounded-2xl p-5 border space-y-4 mb-6"
                  style={{
                    background: `rgba(${activeStage.colorRgb},0.08)`,
                    borderColor: `rgba(${activeStage.colorRgb},0.18)`,
                  }}
                >
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <Clock className="size-3.5" style={{ color: activeStage.color }} />
                      <span>Prazo Estimado (SLA)</span>
                    </div>
                    <p className="font-bold text-lg text-white">{activeStage.sla}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <Users className="size-3.5" style={{ color: activeStage.color }} />
                      <span>Quem Atua</span>
                    </div>
                    <p className="text-xs font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>{activeStage.participants}</p>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                      <AlertCircle className="size-3.5" style={{ color: activeStage.color }} />
                      <span>Entregável Final</span>
                    </div>
                    <p className="text-xs font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.8)' }}>{activeStage.deliverable}</p>
                  </div>
                </div>

                {/* Action button */}
                {activeStage.id < 5 ? (
                  <button
                    onClick={() => { setActiveStage(STAGES[activeStage.id]); setMobileModalOpen(false); }}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-mono tracking-widest uppercase font-semibold"
                    style={{
                      background: `rgba(${activeStage.colorRgb},0.1)`,
                      color: activeStage.color,
                      border: `1px solid rgba(${activeStage.colorRgb},0.25)`,
                    }}
                  >
                    <span>Avançar Etapa</span>
                    <ChevronRight className="size-3.5" />
                  </button>
                ) : (
                  <motion.a
                    href="/chamadas-abertas"
                    whileTap={{ scale: 0.98 }}
                    className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl text-[12px] font-mono tracking-widest uppercase text-white font-bold"
                    style={{
                      background: activeStage.color,
                      boxShadow: `0 4px 14px rgba(${activeStage.colorRgb}, 0.4)`,
                    }}
                  >
                    <span>Quero Publicar</span>
                    <Globe className="size-3.5" />
                  </motion.a>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SEÇÃO DE INDEXAÇÃO E PADRÕES ACADÊMICOS */}
      <div className="mt-24 border-t border-white/10 pt-16 journey-indexation-section">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="font-mono text-xs tracking-[0.35em] uppercase text-orange-500">
            Qualidade & Rastreabilidade Global
          </span>
          <h2 className="mt-3 font-display text-4xl md:text-5xl font-bold tracking-tight">
            Padrões de <span className="serif text-orange-500 italic">Indexação & Impacto</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Adotamos as melhores práticas internacionais para assegurar que suas pesquisas possuam máxima visibilidade,
            interoperabilidade com bibliotecas globais e atualização automática de perfis acadêmicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Ficha Catalográfica",
              subtitle: "Padrão Internacional CIP",
              icon: FileText,
              color: "text-emerald-400",
              border: "hover:border-emerald-500/30",
              bg: "bg-emerald-500/5",
              desc: "Catalogação na Publicação em conformidade com as regras do AACR2 e a Lei do Livro nº 10.753. Organiza dados essenciais como autoria, ISBN e classificação de assuntos, facilitando a divulgação e aquisição por bibliotecas de todo o mundo.",
              source: "Câmara Brasileira do Livro (CBL)"
            },
            {
              title: "Registro ISBN",
              subtitle: "International Book Number",
              icon: Barcode,
              color: "text-cyan-400",
              border: "hover:border-cyan-500/30",
              bg: "bg-cyan-500/5",
              desc: "Padrão de identificação numérica internacional (ISO 2108) que individualiza cada livro por edição e título. Integrado em código de barras para eliminar barreiras idiomáticas e facilitar a circulação comercial mundial das obras.",
              source: "Agência Brasileira do ISBN"
            },
            {
              title: "DOI Permanente",
              subtitle: "Digital Object Identifier",
              icon: Link2,
              color: "text-amber-400",
              border: "hover:border-amber-500/30",
              bg: "bg-amber-500/5",
              desc: "O 'CPF' definitivo da sua obra. Um identificador persistente e único registrado junto à Crossref, que cria links permanentes indestrutíveis. Garante que seu livro seja encontrado e citado de forma exata, sem riscos de links quebrados.",
              source: "Crossref Metadata Search"
            },
            {
              title: "Integração ORCID",
              subtitle: "Auto-Update via Crossref",
              icon: RefreshCw,
              color: "text-orange-400",
              border: "hover:border-orange-500/30",
              bg: "bg-orange-500/5",
              desc: "Sincronização instantânea! Ao registrar o DOI da sua obra, a Crossref atualiza automaticamente seu perfil ORCID em tempo real, sem necessidade de inserção manual. Elimina tarefas administrativas e amplia drasticamente sua visibilidade acadêmica.",
              source: "ORCID & Crossref Systems"
            }
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className={`p-6 rounded-3xl border border-white/5 glass relative overflow-hidden flex flex-col justify-between hover:bg-white/[0.04] transition-all duration-500 group cursor-pointer ${card.border}`}
            >
              <div>
                <div className={`p-3 rounded-2xl w-fit ${card.bg} ${card.color} mb-5 group-hover:scale-110 transition-transform duration-500`}>
                  <card.icon className="size-6" />
                </div>
                <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
                  {card.subtitle}
                </span>
                <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-foreground group-hover:text-orange-400 transition-colors">
                  {card.title}
                </h3>
                <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
                  {card.desc}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[9px] font-mono tracking-wider text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors">
                <span>FONTE OFICIAL:</span>
                <span className="font-semibold text-[#00d3f2]">{card.source}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ORCID / DOI INTERACTION FOOTNOTE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-12 p-6 rounded-3xl border border-white/5 glass bg-gradient-to-r from-orange-500/5 to-transparent flex flex-col md:flex-row items-center gap-6 shadow-xl"
        >
          <div className="p-4 bg-orange-500/10 text-orange-500 rounded-2xl shrink-0">
            <Award className="size-8" />
          </div>
          <div>
            <h4 className="font-display text-lg font-bold text-foreground">Como ativar a atualização automática (Auto-Update) no ORCID?</h4>
            <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
              Para desfrutar do auto-update instantâneo, basta informar o seu <strong>ORCID iD</strong> no formulário de submissão da Editora Poisson. Quando sua publicação for oficializada e o DOI gerado, você receberá uma notificação na sua caixa de entrada do ORCID. Conceda a permissão de atualização uma única vez e todas as suas futuras publicações com a Poisson serão adicionadas automaticamente ao seu currículo ORCID!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
