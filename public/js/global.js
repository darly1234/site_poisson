/* =========================================
   GLOBAL JS — Nova Sophia
   Cursor customizado e interações de nav
   ========================================= */

function initGlobalInteractions() {
    // Mobile Menu Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuSpans = menuToggle?.querySelectorAll('span');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            const isOpen = mobileMenu.classList.contains('active');
            menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            menuToggle.setAttribute('aria-label', isOpen ? 'Fechar menu de navegação' : 'Abrir menu de navegação');

            // Hamburger animation
            if (isOpen && menuSpans) {
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

}

// Inicialização segura
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGlobalInteractions);
} else {
    initGlobalInteractions();
}

