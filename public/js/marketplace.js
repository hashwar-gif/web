// Script específico para marketplace - Migrado de v3.2
document.addEventListener('DOMContentLoaded', function() {
    const marketplaceSection = document.getElementById('marketplace');
    if (!marketplaceSection) return;

    const tabBtns = marketplaceSection.querySelectorAll('.tab-btn');
    const tabContents = marketplaceSection.querySelectorAll('.tab-content');

    if (tabBtns.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Quitar active de todos
                tabBtns.forEach(b => b.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));

                // Activar este botón
                this.classList.add('active');

                // Mostrar contenido correspondiente
                const tabId = this.getAttribute('data-tab');
                const target = document.getElementById(tabId + '-tab');
                if (target) {
                    target.classList.add('active');
                    // Scroll suave hacia arriba de la sección al cambiar (opcional)
                    // marketplaceSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }
});
