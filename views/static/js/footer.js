// Footer Dinámico e Interactivo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar componentes
    initScrollToTop();
    initWelcomeMessage();
    initNewsletterForm();
    initParticles();
    initMobileCollapse();
    initScrollAnimation();
});

// Botón Volver Arriba
function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.remove('opacity-0', '-bottom-20');
            scrollBtn.classList.add('opacity-100', 'bottom-8');
        } else {
            scrollBtn.classList.add('opacity-0', '-bottom-20');
            scrollBtn.classList.remove('opacity-100', 'bottom-8');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Mensaje de Bienvenida Dinámico
function initWelcomeMessage() {
    const welcomeMsg = document.getElementById('welcome-message');
    const hour = new Date().getHours();
    let message = '';

    if (hour >= 5 && hour < 12) {
        message = '¡Buenos días! Gracias por visitarnos 🌅';
    } else if (hour >= 12 && hour < 18) {
        message = '¡Buenas tardes! Gracias por tu visita ☀️';
    } else {
        message = '¡Buenas noches! Gracias por estar aquí 🌙';
    }

    if (welcomeMsg) {
        welcomeMsg.textContent = message;
        welcomeMsg.classList.remove('opacity-0');
    }
}

// Formulario Newsletter
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const input = document.getElementById('newsletter-email');
    const submitBtn = document.getElementById('newsletter-submit');
    const message = document.getElementById('newsletter-message');

    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = input.value;

        if (!isValidEmail(email)) {
            showMessage('Por favor, ingresa un email válido', 'error');
            return;
        }

        // Simular envío
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

        await new Promise(resolve => setTimeout(resolve, 1000));

        showMessage('¡Gracias por suscribirte! 🎉', 'success');
        input.value = '';
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Suscribirse';
    });

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showMessage(text, type) {
        message.textContent = text;
        message.className = `text-sm mt-2 ${type === 'error' ? 'text-red-500' : 'text-green-500'}`;
    }
}

// Efecto de Partículas
function initParticles() {
    const canvas = document.getElementById('footer-particles');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const particles = [];
    
    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
            if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 107, 43, ${this.opacity})`;
            ctx.fill();
        }
    }

    function init() {
        resize();
        for (let i = 0; i < 50; i++) {
            particles.push(new Particle());
        }
        animate();
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    init();
}

// Colapsar Footer en Móvil
function initMobileCollapse() {
    const toggles = document.querySelectorAll('.footer-collapse-toggle');
    
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const content = toggle.nextElementSibling;
            const icon = toggle.querySelector('i');
            
            content.classList.toggle('hidden');
            icon.classList.toggle('rotate-180');
        });
    });
}

// Animación al Hacer Scroll
function initScrollAnimation() {
    const footer = document.querySelector('.footer-modern');
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('footer-visible');
                }
            });
        },
        { threshold: 0.1 }
    );

    if (footer) {
        observer.observe(footer);
    }
}
