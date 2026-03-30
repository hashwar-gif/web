document.addEventListener('DOMContentLoaded', function() {
    // --- Funcionalidad del Carrusel ---
    const carousel = document.getElementById('carousel');
    if (carousel) {
        const slides = document.querySelectorAll('.carousel-slide');
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const indicatorsContainer = document.getElementById('indicators');

        if (slides.length > 0 && prevBtn && nextBtn && indicatorsContainer) {
            let currentSlide = 0;
            const totalSlides = slides.length;

            // Crear indicadores
            slides.forEach((_, index) => {
                const indicator = document.createElement('div');
                indicator.classList.add('indicator');
                if (index === 0) indicator.classList.add('active');
                indicator.addEventListener('click', () => goToSlide(index));
                indicatorsContainer.appendChild(indicator);
            });

            const indicators = document.querySelectorAll('.indicator');

            function goToSlide(slideIndex) {
                if (slideIndex < 0) {
                    slideIndex = totalSlides - 1;
                } else if (slideIndex >= totalSlides) {
                    slideIndex = 0;
                }
                currentSlide = slideIndex;
                carousel.style.transform = `translateX(-${currentSlide * 100}%)`;

                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === currentSlide);
                });
            }

            function nextSlide() {
                goToSlide(currentSlide + 1);
            }

            function prevSlide() {
                goToSlide(currentSlide - 1);
            }

            prevBtn.addEventListener('click', prevSlide);
            nextBtn.addEventListener('click', nextSlide);

            let autoSlide = setInterval(nextSlide, 5000);

            carousel.addEventListener('mouseenter', () => clearInterval(autoSlide));
            carousel.addEventListener('mouseleave', () => {
                autoSlide = setInterval(nextSlide, 5000);
            });
        }
    }

    // --- Funcionalidad del Menú Móvil ---
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.addEventListener('click', function() {
            const navUl = document.querySelector('nav ul');
            if (navUl) {
                navUl.classList.toggle('active');
            }
        });
    }

    // --- Smooth scroll para anclas ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Ajuste para el header fijo
                    behavior: 'smooth'
                });
                
                const navUl = document.querySelector('nav ul');
                if (navUl && navUl.classList.contains('active')) {
                    navUl.classList.remove('active');
                }
            }
        });
    });

    // --- Funcionalidad del formulario de contacto (simulado) ---
    const contactForm = document.getElementById('contact-form');
    if(contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('¡Mensaje enviado! Te contactaremos pronto.');
            this.reset();
        });
    }
});
