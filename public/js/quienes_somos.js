// Funciones para el modal de cheque AWS
function openCheckModal() {
    const modal = document.getElementById('checkModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeCheckModal() {
    const modal = document.getElementById('checkModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Funciones para el modal de certificados
function openModal(imageSrc) {
    const modal = document.getElementById('certificateModal');
    const modalImg = document.getElementById('modalImage');
    if (modal && modalImg) {
        modal.style.display = 'flex';
        modalImg.src = imageSrc;
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('certificateModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Solo ejecutar si la sección de reconocimientos existe
    const recognitionSection = document.getElementById('reconocimientos');
    if (!recognitionSection) return;

    // Asignar eventos a los botones de cierre
    const closeCheck = document.querySelector('.close-check-modal');
    if(closeCheck) closeCheck.onclick = closeCheckModal;

    const closeCert = document.querySelector('.close-modal');
    if(closeCert) closeCert.onclick = closeModal;

    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const checkModal = document.getElementById('checkModal');
        const certModal = document.getElementById('certificateModal');
        
        if (event.target == checkModal) {
            closeCheckModal();
        }
        if (event.target == certModal) {
            closeModal();
        }
    });

    // Asignar eventos a los elementos que abren los modales
    const zoomBtn = document.querySelector('.zoom-btn');
    if(zoomBtn) zoomBtn.onclick = openCheckModal;

    const checkCta = document.querySelector('.aws-cta .btn-primary');
    if(checkCta) checkCta.onclick = openCheckModal;

    const certItems = recognitionSection.querySelectorAll('.certificate-item');
    certItems.forEach(item => {
        const onclickAttr = item.querySelector('.certificate-img').getAttribute('onclick');
        if (onclickAttr) {
            if (onclickAttr.includes('openCheckModal')) {
                item.onclick = openCheckModal;
            } else {
                const imgSrc = onclickAttr.replace("openModal('", "").replace("')", "");
                item.onclick = () => openModal(imgSrc);
            }
        }
    });
});
