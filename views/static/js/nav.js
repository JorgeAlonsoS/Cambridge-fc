document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = menuToggle.querySelector('i');
    const navLinks = mobileMenu.querySelectorAll('a');
    
    // GSAP Timeline para animación del menú
    const menuTl = gsap.timeline({ paused: true });
    
    // Configurar animación del menú
    menuTl
        .fromTo(mobileMenu, {
            opacity: 0,
            yPercent: -5
        }, {
            display: 'block',
            opacity: 1,
            yPercent: 0,
            duration: 0.3,
            ease: 'power2.out'
        })
        .fromTo(navLinks, {
            opacity: 0,
            y: -20
        }, {
            opacity: 1,
            y: 0,
            duration: 0.2,
            stagger: 0.05,
            ease: 'power2.out'
        }, '-=0.1');

    // Estado del menú
    let isMenuOpen = false;

    // Función para alternar el menú
    function toggleMenu() {
        isMenuOpen = !isMenuOpen;
        
        // Animar ícono del menú
        gsap.to(menuIcon, {
            rotation: isMenuOpen ? 90 : 0,
            duration: 0.3,
            ease: 'power2.inOut'
        });

        // Reproducir animación del menú
        if (isMenuOpen) {
            menuTl.play();
        } else {
            menuTl.reverse();
        }
    }

    // Event Listeners
    menuToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', function(e) {
        if (isMenuOpen && !mobileMenu.contains(e.target) && e.target !== menuToggle) {
            toggleMenu();
        }
    });

    // Cerrar al hacer click en un enlace con animación
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            if (isMenuOpen) {
                e.preventDefault();
                gsap.to(this, {
                    scale: 0.95,
                    duration: 0.1,
                    onComplete: () => {
                        gsap.to(this, {
                            scale: 1,
                            duration: 0.1,
                            onComplete: () => {
                                toggleMenu();
                                setTimeout(() => {
                                    window.location.href = this.href;
                                }, 300);
                            }
                        });
                    }
                });
            }
        });
    });

    // Cerrar con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isMenuOpen) {
            toggleMenu();
        }
    });

    // Gestos táctiles para móviles
    let touchStartY = 0;
    let touchEndY = 0;

    mobileMenu.addEventListener('touchstart', function(e) {
        touchStartY = e.touches[0].clientY;
    }, false);

    mobileMenu.addEventListener('touchmove', function(e) {
        touchEndY = e.touches[0].clientY;
    }, false);

    mobileMenu.addEventListener('touchend', function() {
        if (touchStartY - touchEndY > 50) { // Deslizar hacia arriba
            toggleMenu();
        }
    }, false);

    // Animación al hacer hover en los enlaces
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            if (!link.classList.contains('nav-link-special')) {
                gsap.to(this, {
                    x: 10,
                    duration: 0.2,
                    ease: 'power1.out'
                });
            }
        });

        link.addEventListener('mouseleave', function() {
            if (!link.classList.contains('nav-link-special')) {
                gsap.to(this, {
                    x: 0,
                    duration: 0.2,
                    ease: 'power1.out'
                });
            }
        });
    });
});
