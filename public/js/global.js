/* =========================================
   GLOBAL JS — Nova Sophia
   Cursor customizado e interações de nav
   ========================================= */

function initGlobalInteractions() {
    const cursor = document.getElementById('custom-cursor');

    // Cursor customizado segue o mouse
    document.addEventListener('mousemove', (e) => {
        if (cursor && typeof gsap !== 'undefined') {
            gsap.to(cursor, { 
                x: e.clientX, 
                y: e.clientY, 
                duration: 0.08,
                overwrite: "auto"
            });
        }
    });

    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuSpans = menuToggle?.querySelectorAll('span');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            
            // Hamburger animation
            if (mobileMenu.classList.contains('active') && menuSpans) {
                gsap.to(menuSpans[0], { rotate: 45, y: 8, duration: 0.3 });
                gsap.to(menuSpans[1], { opacity: 0, duration: 0.3 });
                gsap.to(menuSpans[2], { rotate: -45, y: -8, duration: 0.3 });
            } else if (menuSpans) {
                gsap.to(menuSpans[0], { rotate: 0, y: 0, duration: 0.3 });
                gsap.to(menuSpans[1], { opacity: 1, duration: 0.3 });
                gsap.to(menuSpans[2], { rotate: 0, y: 0, duration: 0.3 });
            }
        });

        // Close menu on link click
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                if (menuSpans) {
                    gsap.to(menuSpans[0], { rotate: 0, y: 0, duration: 0.3 });
                    gsap.to(menuSpans[1], { opacity: 1, duration: 0.3 });
                    gsap.to(menuSpans[2], { rotate: 0, y: 0, duration: 0.3 });
                }
            });
        });
    }

    // Hover scale em links e botões usando Delegação de Eventos (suporta elementos dinâmicos do React!)
    if (window.matchMedia("(hover: hover)").matches) {
        document.addEventListener('mouseover', (e) => {
            const interactive = e.target.closest('a, button, .group, [role="button"], select, label[for], [data-cursor="hover"]');
            if (interactive && cursor && typeof gsap !== 'undefined') {
                gsap.to(cursor, { scale: 3, opacity: 0.4, duration: 0.2 });
            }
        });

        document.addEventListener('mouseout', (e) => {
            const interactive = e.target.closest('a, button, .group, [role="button"], select, label[for], [data-cursor="hover"]');
            if (interactive && cursor && typeof gsap !== 'undefined') {
                const related = e.relatedTarget ? e.relatedTarget.closest('a, button, .group, [role="button"], select, label[for], [data-cursor="hover"]') : null;
                if (related !== interactive) {
                    gsap.to(cursor, { scale: 1, opacity: 1, duration: 0.2 });
                }
            }
        });
    }
}

// Inicialização segura
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalInteractions);
} else {
    initGlobalInteractions();
}

