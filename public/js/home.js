/* =========================================
   HOME PAGE JS
   Animações GSAP, ScrollTrigger, Orbital
   ========================================= */

gsap.registerPlugin(ScrollTrigger);

// --- FUNÇÃO DE CONTAGEM PROGRESSIVA ---
function animateCounter(element) {
    const targetText = element.getAttribute("data-target");
    const hasPlus = targetText.includes('+');
    const targetNum = parseInt(targetText.replace(/\D/g, ''), 10);

    const counter = { val: 0 };
    
    gsap.to(counter, {
        val: targetNum,
        duration: 2,
        ease: "power3.out",
        onUpdate: function() {
            let currentVal = Math.floor(counter.val);
            let formatted = currentVal.toLocaleString('pt-BR');
            if (hasPlus) formatted += '+';
            element.innerText = formatted;
        }
    });
}

function splitTextIntoChars() {
    const elements = document.querySelectorAll('.kinetic-text');
    elements.forEach(el => {
        const text = el.innerText;
        el.innerHTML = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.innerText = char === ' ' ? '\u00A0' : char;
            span.className = 'char';
            el.appendChild(span);
        });
    });
}

window.addEventListener('load', () => {
    splitTextIntoChars();

    const tl = gsap.timeline();

    tl.fromTo(".char", 
        { y: "150%", rotationZ: 15, scale: 1.3, opacity: 0, filter: "blur(15px)" },
        { y: "0%", rotationZ: 0, scale: 1, opacity: 1, filter: "blur(0px)", duration: 1.6, stagger: 0.05, ease: "expo.out", delay: 0.2 }
    )
    .fromTo(".hero-text",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, stagger: 0.1, ease: "power3.out" },
        "-=1.2" 
    )
    .fromTo(".line-anim", 
        { scaleY: 0 }, 
        { scaleY: 1, duration: 1, ease: "expo.inOut" }, 
        "-=1"
    )
    .fromTo(".hero-ui", 
        { opacity: 0 }, 
        { opacity: 1, duration: 1.5, ease: "power2.out" }, 
        "-=1"
    )
    .to("#horizontal-vine-svg", { opacity: 1, duration: 1.5, ease: "power2.inOut" }, "-=1");


    // Stable direction tracker helper functions
    let lastHProgress = 0;
    let stableHDirection = 1;
    let hDirectionHistory = [];

    function getStableHorizontalDirection(currentProgress) {
        if (currentProgress === lastHProgress) {
            return stableHDirection;
        }
        const diff = currentProgress - lastHProgress;
        if (Math.abs(diff) > 0.0005) {
            const instantDir = diff > 0 ? 1 : -1;
            hDirectionHistory.push(instantDir);
            if (hDirectionHistory.length > 5) {
                hDirectionHistory.shift();
            }
            const recent = hDirectionHistory.slice(-3);
            if (recent.length >= 3 && recent.every(d => d === recent[0])) {
                stableHDirection = recent[0];
            }
        }
        lastHProgress = currentProgress;
        return stableHDirection;
    }

    function forceHorizontalDirection(dir) {
        stableHDirection = dir;
        hDirectionHistory = [dir, dir, dir];
    }

    let lastVProgress = 0;
    let stableVDirection = 1;
    let vDirectionHistory = [];

    function getStableVerticalDirection(currentProgress) {
        if (currentProgress === lastVProgress) {
            return stableVDirection;
        }
        const diff = currentProgress - lastVProgress;
        if (Math.abs(diff) > 0.0005) {
            const instantDir = diff > 0 ? 1 : -1;
            vDirectionHistory.push(instantDir);
            if (vDirectionHistory.length > 5) {
                vDirectionHistory.shift();
            }
            const recent = vDirectionHistory.slice(-3);
            if (recent.length >= 3 && recent.every(d => d === recent[0])) {
                stableVDirection = recent[0];
            }
        }
        lastVProgress = currentProgress;
        return stableVDirection;
    }

    const hContainer = document.getElementById('master-scroll');
    const hVine = document.getElementById('h-vine');
    const hVineReverse = document.getElementById('h-vine-reverse');
    const hPathLength = hVine.getTotalLength();
    
    gsap.set(hVine, { 
        strokeDasharray: hPathLength, 
        strokeDashoffset: hPathLength,
        visibility: "visible" 
    });

    const hNodes = document.querySelectorAll('#horizontal-vine-svg .node');

    let scrollTween = gsap.to(hContainer, {
        x: () => -(hContainer.scrollWidth - window.innerWidth),
        ease: "none",
        scrollTrigger: {
            trigger: ".horizontal-wrapper",
            pin: true,
            scrub: true,
            anticipatePin: 1,
            end: () => "+=" + hContainer.scrollWidth,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const hCurrentLen = hPathLength * self.progress;
                const dir = getStableHorizontalDirection(self.progress);

                if (self.progress <= 0.002) {
                    hVine.style.visibility = 'hidden';
                    if (hVineReverse) hVineReverse.style.display = 'none';
                } else if (dir === -1) {
                    // VOLTA: esconde fio da ida, mostra fio reverso
                    hVine.style.visibility = 'hidden';
                    if (hVineReverse) {
                        hVineReverse.style.display = 'block';
                        const dashLen = hPathLength - hCurrentLen;
                        hVineReverse.style.strokeDasharray = `${dashLen} ${Math.max(hCurrentLen, 0.001)}`;
                        hVineReverse.style.strokeDashoffset = `${dashLen}`;
                    }
                } else {
                    // IDA: fio normal
                    hVine.style.visibility = 'visible';
                    hVine.style.strokeDashoffset = hPathLength * (1 - self.progress);
                    if (hVineReverse) hVineReverse.style.display = 'none';
                }

                // Posiciona a seta na ponta atual do fio
                const hArrowTip = document.getElementById('h-arrow-tip');
                const hArrowPath = document.getElementById('h-arrow-path');
                if (hArrowTip) {
                    if (hCurrentLen > 5) {
                        const p  = hVine.getPointAtLength(hCurrentLen);
                        const p0 = hVine.getPointAtLength(Math.max(0, hCurrentLen - 8));

                        const svgEl = document.getElementById('horizontal-vine-svg');
                        const rect = svgEl ? svgEl.getBoundingClientRect() : { width: hContainer.scrollWidth, height: window.innerHeight };

                        const screenX = (p.x / 4800) * rect.width;
                        const screenY = (p.y / 1000) * rect.height;
                        const screenX0 = (p0.x / 4800) * rect.width;
                        const screenY0 = (p0.y / 1000) * rect.height;
                        let angle = Math.atan2(screenY - screenY0, screenX - screenX0) * 180 / Math.PI;
                        if (dir === -1) angle += 180;

                        hArrowTip.setAttribute('transform', `translate(${screenX},${screenY}) rotate(${angle})`);
                        hArrowTip.style.display = '';

                        if (self.progress < 0.05) {
                            hArrowTip.style.opacity = self.progress / 0.05;
                        } else {
                            hArrowTip.style.opacity = '1';
                        }
                    } else {
                        hArrowTip.style.display = 'none';
                    }
                }

                const hArrow = hArrowPath;
                if (self.progress >= 0.77) {
                    hVine.style.stroke = '#ffffff';
                    hVine.style.filter = 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.9))';
                    if (hVineReverse) {
                        hVineReverse.style.stroke = '#ffffff';
                        hVineReverse.style.filter = 'drop-shadow(0 0 15px rgba(255, 255, 255, 0.9))';
                    }
                    if (hArrow) hArrow.setAttribute('stroke', '#ffffff');
                    hNodes.forEach(n => {
                        n.style.fill = '#ffffff';
                        n.style.filter = 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8))';
                    });
                } else {
                    hVine.style.stroke = '';
                    hVine.style.filter = '';
                    if (hVineReverse) {
                        hVineReverse.style.stroke = '';
                        hVineReverse.style.filter = '';
                    }
                    if (hArrow) hArrow.setAttribute('stroke', '#ff3c00');
                    hNodes.forEach(n => {
                        n.style.fill = '';
                        n.style.filter = '';
                    });
                }
            }
        }
    });

    // --- ANIMAÇÃO DO PAINEL 03 (ÁREAS + ESTATÍSTICAS) ---
    const areasTl = gsap.timeline({
        scrollTrigger: {
            trigger: "#panel-areas",
            containerAnimation: scrollTween, 
            start: "left 75%", 
            toggleActions: "play none none reverse" 
        }
    });

    areasTl.fromTo(".area-title-line",
        { y: 80, opacity: 0, rotationZ: 2 },
        { y: 0, opacity: 1, rotationZ: 0, duration: 1.2, stagger: 0.1, ease: "power3.out" }
    )
    .to(".area-neon",
        { opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.8"
    );

    document.querySelectorAll(".stats-reveal").forEach((el, index) => {
        areasTl.fromTo(el,
            { y: 30, opacity: 0 },
            { 
                y: 0, 
                opacity: 1, 
                duration: 0.8, 
                ease: "power2.out",
                onStart: () => {
                    const target = el.querySelector('.count-number');
                    if (target) animateCounter(target);
                }
            },
            index === 0 ? "-=0.6" : "-=0.65"
        );
    });

    gsap.to(".area-neon", {
        y: () => document.getElementById('areas-list').offsetHeight - 64, 
        ease: "none",
        scrollTrigger: {
            trigger: "#panel-areas",
            containerAnimation: scrollTween,
            start: "left 60%", 
            end: "right 60%", 
            scrub: true,
            invalidateOnRefresh: true
        }
    });

    ScrollTrigger.create({
        trigger: "#areas-list",
        containerAnimation: scrollTween,
        start: "left 85%", 
        toggleClass: "visible"
    });

    const vVine = document.getElementById('v-vine');
    const vVineReverse = document.getElementById('v-vine-reverse');
    const vContent = document.querySelector('.vertical-content');

    function updateVerticalVine() {
        if (!vVine || !vContent) return;

        const vHeight = vContent.offsetHeight;
        const winW = window.innerWidth;
        const startX = winW * 0.5;

        // Tenta terminar no centro do wrapper do CTA (onde está o alvo)
        const wrapper = document.getElementById('cta-wrapper');
        let endX = startX;
        let endY = vHeight - 40;
        if (wrapper) {
            const rect = wrapper.getBoundingClientRect();
            const contentRect = vContent.getBoundingClientRect();
            endX = rect.left - contentRect.left + rect.width / 2;
            endY = rect.top  - contentRect.top  + rect.height / 2;
        }

        // Trajetória original: curva suave e simples
        const vPathData = `M ${startX},0
                           C ${startX},${endY * 0.15} ${winW * 0.2},${endY * 0.25} ${startX},${endY * 0.5}
                           S ${winW * 0.8},${endY * 0.8} ${endX},${endY}`;
        vVine.setAttribute('d', vPathData);
        if (vVineReverse) vVineReverse.setAttribute('d', vPathData);

        // Esconde a bolinha de transição vertical
        const vNode = document.getElementById('v-transition-node');
        if (vNode) {
            vNode.style.display = 'none';
        }

        const vPathLength = vVine.getTotalLength();
        vVine.style.strokeDasharray = vPathLength;
        const st = ScrollTrigger.getById('vVineTrigger');
        if (st) {
            vVine.style.strokeDashoffset = vPathLength * (1 - st.progress);
        } else {
            vVine.style.strokeDashoffset = vPathLength;
        }
    }

    updateVerticalVine();
    window.addEventListener('resize', updateVerticalVine);

    let ctaTouched = false;

    gsap.to(vVine, {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: {
            id: 'vVineTrigger',
            trigger: ".vertical-content",
            start: "top 98%",
            end: "bottom 100%",
            scrub: true,
            onUpdate: (self) => {
                const vArrowTip = document.getElementById('v-arrow-tip');
                const hArrowTip = document.getElementById('h-arrow-tip');
                const totalLen = vVine.getTotalLength();
                const currentLen = totalLen * self.progress;
                const dir = getStableVerticalDirection(self.progress);

                // Sincroniza o estado do fio horizontal baseado no sentido do scroll vertical
                if (dir === -1) {
                    if (hVine) hVine.style.visibility = 'hidden';
                    if (hVineReverse) {
                        hVineReverse.style.display = 'block';
                        hVineReverse.style.strokeDasharray = `0 ${hPathLength}`;
                        hVineReverse.style.strokeDashoffset = `0`;
                    }
                    if (hArrowTip) hArrowTip.style.display = 'none';
                    forceHorizontalDirection(-1);
                } else {
                    if (hVine) {
                        hVine.style.visibility = 'visible';
                        hVine.style.strokeDashoffset = '0';
                    }
                    if (hVineReverse) hVineReverse.style.display = 'none';
                    forceHorizontalDirection(1);
                }

                if (dir === -1) {
                    // VOLTA: esconder vVine; mostrar vVineReverse
                    gsap.killTweensOf(vVine, 'opacity');
                    gsap.set(vVine, { opacity: 0 });
                    if (vVineReverse) {
                        vVineReverse.style.display = 'block';
                        vVineReverse.style.opacity = '1';
                        const dashLen = totalLen - currentLen;
                        vVineReverse.style.strokeDasharray = `${dashLen} ${Math.max(currentLen, 0.001)}`;
                        vVineReverse.style.strokeDashoffset = `${dashLen}`;
                    }
                } else {
                    // IDA: fio sempre visível — some junto com a seta nos últimos 5%
                    vVine.style.strokeDasharray = `${totalLen} ${totalLen}`;
                    vVine.style.strokeDashoffset = totalLen * (1 - self.progress);
                    if (vVineReverse) vVineReverse.style.display = 'none';

                    if (self.progress > 0.95) {
                        // Fade out sincronizado com a seta
                        const fadeRatio = (1 - self.progress) / 0.05;
                        gsap.killTweensOf(vVine, 'opacity');
                        gsap.set(vVine, { opacity: fadeRatio });
                    } else {
                        gsap.killTweensOf(vVine, 'opacity');
                        gsap.set(vVine, { opacity: 1 });
                    }
                }

                if (vArrowTip && self.progress > 0.001) {
                    const p  = vVine.getPointAtLength(currentLen);
                    const p0 = vVine.getPointAtLength(Math.max(0, currentLen - 4));
                    
                    let angle = Math.atan2(p.y - p0.y, p.x - p0.x) * 180 / Math.PI;
                    if (dir === -1) angle += 180;

                    vArrowTip.setAttribute('transform', `translate(${p.x},${p.y}) rotate(${angle})`);
                    vArrowTip.style.display = '';

                    // Fade out nos últimos 5% (ao chegar no alvo) — sincronizado com o fio
                    if (self.progress > 0.95) {
                        vArrowTip.style.opacity = (1 - self.progress) / 0.05;
                    } else {
                        vArrowTip.style.opacity = '1';
                    }
                    
                    // Detecção de colisão exata com o texto "O conhecimento"
                    const footerTitle = document.getElementById('footer-title');
                    const title1 = document.getElementById('footer-title-1');
                    if (footerTitle && title1) {
                        const rect = footerTitle.getBoundingClientRect();
                        const contentRect = vContent.getBoundingClientRect();
                        const titleY = rect.top - contentRect.top;
                        
                        if (p.y >= titleY - 30) {
                            gsap.to(title1, { x: -80, duration: 0.2, overwrite: "auto" });
                        } else {
                            gsap.to(title1, { x: 0, duration: 0.2, overwrite: "auto" });
                        }
                    }
                    
                    // Sincroniza a cor da seta com o degradê inicial (Branco -> Laranja)
                    const arrow = document.getElementById('vine-arrow-path');
                    if (arrow && self.progress < 0.25) {
                        if (self.progress < 0.05) {
                            arrow.setAttribute('stroke', '#ffffff');
                        } else {
                            const ratio = (self.progress - 0.05) / 0.20;
                            const r = 255;
                            const g = Math.round(255 - 195 * ratio);
                            const b = Math.round(255 - 255 * ratio);
                            arrow.setAttribute('stroke', `rgb(${r},${g},${b})`);
                        }
                    }
                    
                    // Passagem de bastão: some a seta horizontal
                    if (hArrowTip) hArrowTip.style.display = 'none';
                } else if (vArrowTip && self.progress <= 0.001) {
                    vArrowTip.style.display = 'none';
                }

                // Quando o fio completa (progress >= 0.99), toca o alvo e faz o botão surgir
                if (self.progress >= 0.99 && !ctaTouched) {
                    ctaTouched = true;
                    
                    // Encolhe e some o alvo concêntrico calmamente
                    gsap.to("#cta-target", {
                        scale: 0.3,
                        opacity: 0,
                        duration: 0.5,
                        ease: "power2.out"
                    });
                    
                    // Surge o botão — zoom muito suave a partir de escala próxima do final
                    gsap.fromTo("#cta-submeter",
                        { scale: 0.6, opacity: 0 },
                        {
                            scale: 1,
                            opacity: 1,
                            backgroundColor: "#ff3c00",
                            color: "#ffffff",
                            borderColor: "#ff3c00",
                            boxShadow: "0 0 50px rgba(255, 60, 0, 0.8)",
                            duration: 2.8,
                            ease: "sine.out",
                            delay: 0.3,
                            pointerEvents: "auto"
                        }
                    );
                } else if (self.progress < 0.99 && ctaTouched) {
                    ctaTouched = false;
                    
                    // Restaura o alvo
                    gsap.to("#cta-target", {
                        scale: 1,
                        opacity: 1,
                        duration: 0.4,
                        ease: "power2.out"
                    });
                    
                    // Desaparece com fade suave — sem zoom inverso
                    gsap.to("#cta-submeter", {
                        opacity: 0,
                        y: 8,
                        backgroundColor: "#ffffff",
                        color: "#000000",
                        borderColor: "#e4e4e7",
                        boxShadow: "none",
                        duration: 0.35,
                        ease: "power2.in",
                        pointerEvents: "none",
                        onComplete: () => {
                            // Reseta o y e scale para o estado original após sumir
                            gsap.set("#cta-submeter", { scale: 0, y: 0 });
                        }
                    });
                }
            }
        }
    });

    gsap.to("#transition-circle", {
        scale: 60,
        scrollTrigger: {
            trigger: ".horizontal-wrapper",
            containerAnimation: scrollTween,
            start: "95% center",
            scrub: true
        }
    });

    // --- INTERAÇÕES DE TEXTO (REÚNEM) ---
    gsap.to("#text-reunem", {
        color: "#ff3c00",
        scrollTrigger: {
            trigger: "#text-reunem",
            containerAnimation: scrollTween,
            start: "left 50%",
            toggleActions: "play none none reverse"
        }
    });

    // --- INTERAÇÕES DE TEXTO (TODAS AS GRANDES) ---
    gsap.to("#text-todas-grandes", {
        color: "#ff3c00",
        duration: 0.2,
        scrollTrigger: {
            trigger: "#text-todas-grandes",
            containerAnimation: scrollTween,
            start: "left 50%",
            toggleActions: "play none none reverse"
        }
    });

    // --- EFEITO PARTICLE ASSEMBLE (CANVAS) ---
    const canvas = document.getElementById("particleCanvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        const W = canvas.width = 700;
        const H = canvas.height = 400;

        const SUBTITLE = "MERGULHO PROFUNDO";
        const LINE_1 = "O que nos";
        const LINE_2 = "move.";
        const LEFT_PADDING = 0; // Mais para o início
        const PARTICLE_GAP = 3;
        const ANIM_SPEED = 0.012;
        const CROSSFADE_START = 0.80;
        const SCATTER_DISTANCE = 300;

        let particles = [];
        let progress = 0;
        let textFade = 0;
        let rafId = null;
        let initialized = false;

        function initParticles() {
            if (initialized) return;
            initialized = true;

            const offscreen = document.createElement("canvas");
            offscreen.width = W;
            offscreen.height = H;
            const offCtx = offscreen.getContext("2d");

            // Subtítulo
            offCtx.fillStyle = "#ff3c00";
            offCtx.font = "700 20px 'Plus Jakarta Sans', sans-serif";
            offCtx.textAlign = "left";
            offCtx.fillText(SUBTITLE, LEFT_PADDING, H / 2 - 120);

            // Título principal
            offCtx.fillStyle = "#ffffff";
            offCtx.font = "italic 700 96px 'Playfair Display', serif";
            offCtx.textAlign = "left";
            offCtx.fillText(LINE_1, LEFT_PADDING, H / 2 - 20);
            offCtx.fillText(LINE_2, LEFT_PADDING, H / 2 + 75);

            const imageData = offCtx.getImageData(0, 0, W, H);
            particles = [];

            for (let y = 0; y < H; y += PARTICLE_GAP) {
                for (let x = 0; x < W; x += PARTICLE_GAP) {
                    const i = (y * W + x) * 4;
                    const r = imageData.data[i];
                    const g = imageData.data[i + 1];
                    const b = imageData.data[i + 2];
                    const a = imageData.data[i + 3];

                    if (a > 128) {
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 200 + Math.random() * SCATTER_DISTANCE;

                        particles.push({
                            tx: x,
                            ty: y,
                            x: W / 2 + Math.cos(angle) * dist,
                            y: H / 2 + Math.sin(angle) * dist,
                            r: r,
                            g: g,
                            b: b,
                            size: 1.2 + Math.random() * 1.5,
                        });
                    }
                }
            }
        }

        function drawFinalText() {
            ctx.fillStyle = "#ff3c00";
            ctx.font = "700 20px 'Plus Jakarta Sans', sans-serif";
            ctx.textAlign = "left";
            ctx.fillText(SUBTITLE, LEFT_PADDING, H / 2 - 120);

            ctx.fillStyle = "#ffffff";
            ctx.font = "italic 700 96px 'Playfair Display', serif";
            ctx.fillText(LINE_1, LEFT_PADDING, H / 2 - 20);
            ctx.fillText(LINE_2, LEFT_PADDING, H / 2 + 75);

            // Linha decorativa
            ctx.fillStyle = "#ff3c00";
            ctx.fillRect(LEFT_PADDING, H / 2 + 110, 60, 3);
        }

        function animate() {
            // Limpa com transparência
            ctx.clearRect(0, 0, W, H);

            progress = Math.min(progress + ANIM_SPEED, 1);
            const eased = 1 - Math.pow(1 - progress, 3);

            const particleAlpha = progress > 0.85
                ? Math.max(0, 1 - (progress - 0.85) / 0.15)
                : 1;

            for (const p of particles) {
                const px = p.x + (p.tx - p.x) * eased;
                const py = p.y + (p.ty - p.y) * eased;

                ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
                ctx.globalAlpha = eased * particleAlpha;
                ctx.beginPath();
                ctx.arc(px, py, p.size * (0.5 + eased * 0.5), 0, Math.PI * 2);
                ctx.fill();
            }

            if (progress > CROSSFADE_START) {
                textFade = Math.min(1, (progress - CROSSFADE_START) / (1 - CROSSFADE_START));
                ctx.globalAlpha = textFade;
                drawFinalText();
            }

            ctx.globalAlpha = 1;

            if (progress < 1) {
                rafId = requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, W, H);
                ctx.globalAlpha = 1;
                drawFinalText();
                rafId = null;
            }
        }

        function startAnimation() {
            initParticles();
            progress = 0;
            textFade = 0;
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(animate);
        }

        function resetAnimation() {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
            progress = 0;
            textFade = 0;
            ctx.fillStyle = "rgba(10, 10, 10, 1)";
            ctx.fillRect(0, 0, W, H);
        }

        function startExplode() {
            let explodeProgress = 0;
            const explodeSpeed = 0.015; // Um pouco mais lento para ver o efeito
            
            // Atribui direção aleatória para cada partícula
            for (const p of particles) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 4;
                p.vx = Math.cos(angle) * speed;
                p.vy = Math.sin(angle) * speed;
            }
            
            function explodeLoop() {
                ctx.clearRect(0, 0, W, H);
                explodeProgress = Math.min(explodeProgress + explodeSpeed, 1);
                const eased = 1 - Math.pow(1 - explodeProgress, 3); // Ease out
                
                for (const p of particles) {
                    // Move para fora com base na velocidade
                    const px = p.tx + p.vx * eased * 50;
                    const py = p.ty + p.vy * eased * 50;
                    
                    ctx.fillStyle = `rgb(${p.r}, ${p.g}, ${p.b})`;
                    ctx.globalAlpha = 1 - eased; // Some gradualmente
                    ctx.beginPath();
                    // Diminui o tamanho até sumir
                    const size = p.size * (1 - eased);
                    ctx.arc(px, py, size, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                if (explodeProgress < 1) {
                    requestAnimationFrame(explodeLoop);
                } else {
                    ctx.clearRect(0, 0, W, H);
                }
            }
            requestAnimationFrame(explodeLoop);
        }

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    startAnimation();
                } else {
                    resetAnimation();
                }
            });
        }, {
            threshold: 0.3
        });

        observer.observe(canvas);

        // Expondo a função para o escopo do arquivo para o ScrollTrigger usar
        window.canvasExplode = startExplode;
    }

    // --- PINNING DO CANVAS (DNA DA EDITORA) ---
    const canvasContainer = document.getElementById("sticky-canvas-container");
    ScrollTrigger.create({
        trigger: "#sticky-canvas-container",
        start: "top 80px",
        endTrigger: "#block-mercado",
        end: () => `bottom ${80 + (canvasContainer ? canvasContainer.offsetHeight : 400)}px`,
        pin: true,
        pinSpacing: false,
        invalidateOnRefresh: true
    });

    // --- ANIMAÇÃO DA SEÇÃO DE IA (VOLTA AO ANTERIOR - AGORA FIXO BRANCO) ---
    // --- ANIMAÇÃO DA SEÇÃO DE IA (VOLTA AO ANTERIOR - AGORA FIXO BRANCO) ---
    // Restaurando as animações de transição de cor para o fundo "ficar" branco no scroll
    
    gsap.to("#section-ai-search", {
        backgroundColor: "#ffffff",
        scrollTrigger: {
            trigger: "#section-ai-search",
            start: "top 80%",
            end: "top 5%",
            scrub: 2
        }
    });

    gsap.to("#section-ai-search h2, #section-ai-search h3", {
        color: "#0a0a0a",
        scrollTrigger: {
            trigger: "#section-ai-search",
            start: "top 80%",
            end: "top 5%",
            scrub: 2
        }
    });

    // Subtítulo muda de branco para roxo (fromTo para controle total)
    gsap.fromTo("#ai-subtitle",
        { color: "#ffffff" },
        {
            color: "#7c3aed",
            scrollTrigger: {
                trigger: "#section-ai-search",
                start: "top 80%",
                end: "top 5%",
                scrub: 2
            }
        }
    );

    gsap.to("#section-ai-search p, #section-ai-search span:not(#ai-subtitle):not(#ai-highlight-1)", {
        color: "#4a5568",
        scrollTrigger: {
            trigger: "#section-ai-search",
            start: "top 80%",
            end: "top 5%",
            scrub: 2
        }
    });

    // Fio de ouro muda de laranja para roxo na seção de IA
    // Animamos os stops do gradiente SVG diretamente (o stroke usa url(#v-vine-grad))
    const vineStops = ["#vine-stop-3", "#vine-stop-4"];
    vineStops.forEach(id => {
        const el = document.querySelector(id);
        if (el) {
            ScrollTrigger.create({
                trigger: "#section-ai-search",
                start: "top 80%",
                end: "top 5%",
                scrub: 2,
                onUpdate: (self) => {
                    const progress = self.progress;
                    // Interpola de #ff3c00 para #7c3aed
                    const r = Math.round(255 + (124 - 255) * progress);
                    const g = Math.round(60 + (58 - 60) * progress);
                    const b = Math.round(0 + (237 - 0) * progress);
                    const color = `rgb(${r},${g},${b})`;
                    el.setAttribute("stop-color", color);
                    // Sincroniza seta vertical com a cor da ponta do fio
                    if (id === "#vine-stop-4") {
                        const arrow = document.getElementById('vine-arrow-path');
                        if (arrow) arrow.setAttribute('stroke', color);
                    }
                }
            });
        }
    });

    // Brilho do fio também muda (via CSS var override)
    gsap.to("#v-vine", {
        filter: "drop-shadow(0 0 15px rgba(124,58,237,0.9))",
        scrollTrigger: {
            trigger: "#section-ai-search",
            start: "top 80%",
            end: "top 5%",
            scrub: 2
        }
    });

    gsap.to("#section-ai-search strong:not(#ai-highlight-2)", {
        color: "#ff3c00",
        scrollTrigger: {
            trigger: "#section-ai-search",
            start: "top 80%",
            end: "top 5%",
            scrub: 2
        }
    });
    
    // --- ANIMAÇÃO DA LUPA INVESTIGATIVA ---
    // Faz a lupa e a máscara (clip-path) se moverem juntas sobre o texto
    
    const magnifierTl = gsap.timeline({ repeat: -1, yoyo: true });
    
    // Lupa restrita ao lado esquerdo (máx 45%) para não cruzar o fio
    magnifierTl.to("#magnifier-lens", { clipPath: "circle(54px at 25% 30%)", duration: 5, ease: "sine.inOut" })
               .to("#magnifier-lens", { clipPath: "circle(54px at 45% 65%)", duration: 5, ease: "sine.inOut" })
               .to("#magnifier-lens", { clipPath: "circle(54px at 40% 25%)", duration: 5, ease: "sine.inOut" })
               .to("#magnifier-lens", { clipPath: "circle(54px at 30% 55%)", duration: 5, ease: "sine.inOut" });

    const glassTl = gsap.timeline({ repeat: -1, yoyo: true });
    
    glassTl.to("#magnifier-glass", { left: "25%", top: "30%", duration: 5, ease: "sine.inOut" })
           .to("#magnifier-glass", { left: "45%", top: "65%", duration: 5, ease: "sine.inOut" })
           .to("#magnifier-glass", { left: "40%", top: "25%", duration: 5, ease: "sine.inOut" })
           .to("#magnifier-glass", { left: "30%", top: "55%", duration: 5, ease: "sine.inOut" });

    document.querySelectorAll('.dna-block').forEach((block, index) => {
        gsap.to(block, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
                trigger: block,
                start: "top 80%",
                toggleActions: "play none none reverse"
            }
        });
    });

    // --- ANIMAÇÃO DAS ETAPAS DE SUBMISSÃO ---
    document.querySelectorAll('.submission-step').forEach((step, index) => {
        gsap.to(step, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
                trigger: step,
                start: "top 85%",
                toggleActions: "play none none reverse"
            },
            delay: index * 0.1
        });
    });

    // --- SCRAMBLE DECODE NOS TÍTULOS DAS ETAPAS ---
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';

    function scrambleDecode(el) {
        const target = el.dataset.text;
        const len = target.length;
        let frame = 0;
        const totalFrames = 28;
        let raf;

        function tick() {
            let output = '';
            for (let i = 0; i < len; i++) {
                if (target[i] === ' ' || target[i] === '&') {
                    output += target[i];
                } else if (frame > (i / len) * totalFrames + 6) {
                    output += target[i];
                } else {
                    output += CHARS[Math.floor(Math.random() * CHARS.length)];
                }
            }
            el.textContent = output;
            frame++;
            if (frame <= totalFrames + 8) {
                raf = requestAnimationFrame(tick);
            } else {
                el.textContent = target;
            }
        }

        cancelAnimationFrame(raf);
        frame = 0;
        tick();
    }

    document.querySelectorAll('.scramble-title').forEach(el => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 82%',
            onEnter: () => scrambleDecode(el),
            onEnterBack: () => scrambleDecode(el)
        });
    });

    // --- FIO FICA VERMELHO NA SEÇÃO DE SUBMISSÃO ---
    const vineStopsSubmission = ["#vine-stop-3", "#vine-stop-4"];
    vineStopsSubmission.forEach(id => {
        const el = document.querySelector(id);
        if (el) {
            ScrollTrigger.create({
                trigger: "#section-submission",
                start: "top 80%",
                end: "top 10%",
                scrub: 1.5,
                onUpdate: (self) => {
                    const progress = self.progress;
                    // Interpola de #ff3c00 (laranja) para #dc2626 (vermelho)
                    const r = Math.round(255 + (220 - 255) * progress);
                    const g = Math.round(60 + (38 - 60) * progress);
                    const b = Math.round(0 + (38 - 0) * progress);
                    const color = `rgb(${r},${g},${b})`;
                    el.setAttribute("stop-color", color);
                    // Sincroniza seta vertical
                    if (id === "#vine-stop-4") {
                        const arrow = document.getElementById('vine-arrow-path');
                        if (arrow) arrow.setAttribute('stroke', color);
                    }
                },
                onLeaveBack: () => {
                    el.setAttribute("stop-color", "#ff3c00");
                    if (id === "#vine-stop-4") {
                        const arrow = document.getElementById('vine-arrow-path');
                        if (arrow) arrow.setAttribute('stroke', '#ff3c00');
                    }
                }
            });
        }
    });

    // Glow do fio também fica mais vermelho
    gsap.to("#v-vine", {
        filter: "drop-shadow(0 0 18px rgba(220,38,38,0.95))",
        scrollTrigger: {
            trigger: "#section-submission",
            start: "top 80%",
            end: "top 10%",
            scrub: 1.5,
            toggleActions: "play none none reverse"
        }
    });

    // --- PALAVRA "PUBLICAR" FICA VERMELHA QUANDO O FIO A TOCA ---
    ScrollTrigger.create({
        trigger: "#word-publicar",
        start: "top 55%",   // quando o fio desce até a palavra
        end: "top 45%",
        scrub: false,
        onEnter: () => {
            gsap.to("#word-publicar", {
                color: "#facc15",
                duration: 0.5,
                ease: "power2.out"
            });
        },
        onLeaveBack: () => {
            gsap.to("#word-publicar", {
                color: "inherit",
                duration: 0.4,
                ease: "power2.in"
            });
        }
    });

    gsap.to(".nosso-text", {
        color: "#000000",
        duration: 0.4,
        stagger: 0.05,
        scrollTrigger: {
            trigger: "#panel-transition",
            containerAnimation: scrollTween,
            start: "left 40%",
            toggleActions: "play none none reverse"
        }
    });

    // --- ONDULAÇÃO DA FRASE (WAVE TEXT) ---
    const waveElement = document.querySelector('.wave-text');
    if (waveElement) {
        const text = waveElement.innerText;
        waveElement.innerHTML = '';
        text.split('').forEach(char => {
            const span = document.createElement('span');
            span.innerText = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            waveElement.appendChild(span);
        });

        gsap.to(waveElement.querySelectorAll('span'), {
            y: -20,
            duration: 0.5,
            stagger: {
                each: 0.03,
                repeat: 1,
                yoyo: true
            },
            ease: "sine.inOut",
            scrollTrigger: {
                trigger: ".wave-text",
                containerAnimation: scrollTween,
                start: "left 45%",
                toggleActions: "play none none reverse"
            }
        });
    }

    gsap.to(".dna-text", {
        color: "#00b0ff", // Azul vibrante conforme imagem
        duration: 0.4,
        stagger: 0.05,
        scrollTrigger: {
            trigger: "#panel-transition",
            containerAnimation: scrollTween,
            start: "left 40%",
            toggleActions: "play none none reverse"
        }
    });

    // --- SUPORTE A SWIPE HORIZONTAL NO CELULAR ---
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (hasTouch) {
        let touchStartX = 0;
        let touchStartY = 0;
        let initialScrollY = 0;
        let isHorizontalSwipe = false;

        const horizWrapper = document.querySelector('.horizontal-wrapper');
        if (horizWrapper) {
            horizWrapper.addEventListener('touchstart', (e) => {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                initialScrollY = window.scrollY;
                isHorizontalSwipe = false;
            }, { passive: true });

            horizWrapper.addEventListener('touchmove', (e) => {
                const touchX = e.touches[0].clientX;
                const touchY = e.touches[0].clientY;
                const deltaX = touchStartX - touchX;
                const deltaY = touchStartY - touchY;

                // Determina se o gesto principal é horizontal
                if (!isHorizontalSwipe && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
                    isHorizontalSwipe = true;
                }

                if (isHorizontalSwipe) {
                    if (e.cancelable) e.preventDefault();
                    // Multiplicador 1.35x para dar sensação de resposta rápida e natural
                    window.scrollTo(0, initialScrollY + deltaX * 1.35);
                }
            }, { passive: false });
        }
    }

    /* 
    // --- ORBITAL CAROUSEL (DESATIVADO - SUBSTITUÍDO POR REACT) ---
    const orbitalBooks = [
        ...
    ];
    ...
    */
});
