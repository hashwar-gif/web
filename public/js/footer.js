
    document.addEventListener('DOMContentLoaded', function() {
        // --- Funcionalidad del Menú Móvil Global ---
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu) {
            mobileMenu.addEventListener('click', function() {
                const navUl = document.querySelector('nav ul');
                if (navUl) {
                    navUl.classList.toggle('active');
                }
            });
        }

        // --- Smooth scroll para anclas (Global) ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                // Si el ancla está en la misma página
                if (href.startsWith('#')) {
                    const targetElement = document.querySelector(href);
                    if (targetElement) {
                        e.preventDefault();
                        window.scrollTo({
                            top: targetElement.offsetTop - 80,
                            behavior: 'smooth'
                        });
                        
                        const navUl = document.querySelector('nav ul');
                        if (navUl && navUl.classList.contains('active')) {
                            navUl.classList.remove('active');
                        }
                    }
                }
            });
        });

        // ===== SISTEMA DE DONACIONES =====
        const coinBtn = document.getElementById('coinBtn');
        const donationPanel = document.getElementById('donationPanel');
        const panelClose = document.querySelector('.panel-close');
        const quickAmounts = document.querySelectorAll('.quick-amount');
        const customDonationInput = document.getElementById('customDonation');
        const btnContinue = document.getElementById('btnContinue');
        
        const donationModal = document.getElementById('donationModal');
        const modalAmount = document.getElementById('modalAmount');
        const modalClose = document.querySelector('.modal-close');
        const btnCancel = document.querySelector('.btn-cancel');
        const donationForm = document.getElementById('donationForm');
        const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
        const qrCodeContainer = document.getElementById('qrCodeContainer');
        const transferDataContainer = document.getElementById('transferDataContainer');
        const qrCodeImage = document.getElementById('qrCodeImage');
        
        let currentAmount = 1;
        
        // Abrir/cerrar panel de donaciones
        coinBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            donationPanel.classList.toggle('active');
        });
        
        panelClose.addEventListener('click', function() {
            donationPanel.classList.remove('active');
        });
        
        // Cerrar panel al hacer clic fuera
        document.addEventListener('click', function(e) {
            if (!donationPanel.contains(e.target) && !coinBtn.contains(e.target)) {
                donationPanel.classList.remove('active');
            }
        });
        
        // Botones de montos rápidos
        quickAmounts.forEach(btn => {
            btn.addEventListener('click', function() {
                currentAmount = parseInt(this.dataset.amount);
                customDonationInput.value = currentAmount;
                
                // Destacar botón seleccionado
                quickAmounts.forEach(b => {
                    b.style.background = 'rgba(0, 212, 255, 0.05)';
                    b.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                    b.style.color = '#b0d4ff';
                });
                this.style.background = 'rgba(255, 0, 102, 0.1)';
                this.style.borderColor = 'var(--accent)';
                this.style.color = 'var(--accent)';
            });
        });
        
        // Input personalizado
        customDonationInput.addEventListener('input', function() {
            const value = parseInt(this.value) || 0;
            if (value >= 1) {
                currentAmount = value;
                
                // Quitar destacado de botones rápidos
                quickAmounts.forEach(b => {
                    b.style.background = 'rgba(0, 212, 255, 0.05)';
                    b.style.borderColor = 'rgba(0, 212, 255, 0.2)';
                    b.style.color = '#b0d4ff';
                });
            }
        });
        
        // Botón continuar
        btnContinue.addEventListener('click', function() {
            const value = parseInt(customDonationInput.value) || currentAmount;
            if (value >= 1) {
                currentAmount = value;
                openDonationModal(currentAmount);
                donationPanel.classList.remove('active');
            } else {
                customDonationInput.style.borderColor = 'var(--error)';
                customDonationInput.style.boxShadow = '0 0 10px rgba(255, 0, 102, 0.3)';
                setTimeout(() => {
                    customDonationInput.style.borderColor = '';
                    customDonationInput.style.boxShadow = '';
                }, 2000);
            }
        });
        
        // ===== MODAL DE DONACIÓN =====
        function openDonationModal(amount) {
            currentAmount = amount;
            modalAmount.textContent = amount.toLocaleString();
            
            // Actualizar código QR con el monto
            const qrData = `BNB BOLIVIA\nCta: 1234-5678-9012-3456\nMonto: Bs ${amount}\nConcepto: Aporte HASHWAR`;
            qrCodeImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
            
            donationModal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            donationForm.reset();
            document.getElementById('userAlias').focus();
            
            // Resetear selección de método de pago
            paymentMethods[0].checked = true;
            updatePaymentMethodDisplay('qr');
        }
        
        function closeDonationModal() {
            donationModal.style.display = 'none';
            document.body.style.overflow = 'auto';
            customDonationInput.value = '';
        }
        
        modalClose.addEventListener('click', closeDonationModal);
        btnCancel.addEventListener('click', closeDonationModal);
        
        donationModal.addEventListener('click', function(e) {
            if (e.target === donationModal) {
                closeDonationModal();
            }
        });
        
        // Cambiar método de pago
        paymentMethods.forEach(method => {
            method.addEventListener('change', function() {
                updatePaymentMethodDisplay(this.value);
            });
        });
        
        function updatePaymentMethodDisplay(method) {
            if (method === 'qr') {
                qrCodeContainer.style.display = 'block';
                transferDataContainer.style.display = 'none';
            } else if (method === 'transfer') {
                qrCodeContainer.style.display = 'none';
                transferDataContainer.style.display = 'block';
            }
        }
        
        // Envío del formulario de donación
        donationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const alias = document.getElementById('userAlias').value.trim();
            const email = document.getElementById('userEmail').value.trim();
            const message = document.getElementById('donationMessage').value.trim();
            const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
            
            if (!alias) {
                alert('Por favor ingresa tu alias');
                return;
            }
            
            const confirmBtn = document.querySelector('.btn-confirm-donation');
            const originalText = confirmBtn.innerHTML;
            
            confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
            confirmBtn.disabled = true;
            
            // Simular procesamiento
            setTimeout(() => {
                // Datos de la donación
                const donationData = {
                    amount: currentAmount,
                    alias: alias,
                    email: email || 'No especificado',
                    message: message || 'Sin mensaje',
                    paymentMethod: paymentMethod,
                    timestamp: new Date().toISOString(),
                    transactionId: 'TX-' + Date.now()
                };
                
                // Guardar en localStorage (simulación)
                let donations = JSON.parse(localStorage.getItem('hashwar_donations') || '[]');
                donations.push(donationData);
                localStorage.setItem('hashwar_donations', JSON.stringify(donations));
                
                console.log('Donación registrada:', donationData);
                
                // Actualizar UI
                confirmBtn.innerHTML = '<i class="fas fa-check"></i> ¡Aporte registrado!';
                confirmBtn.style.background = 'linear-gradient(135deg, var(--success), #00aa44)';
                
                // Redirigir según método de pago
                setTimeout(() => {
                    if (paymentMethod === 'qr') {
                        // Descargar código QR
                        const link = document.createElement('a');
                        link.href = qrCodeImage.src;
                        link.download = `qr-donacion-${currentAmount}bs.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Abrir enlace del banco en nueva pestaña
                        window.open('https://www.bnb.com.bo/', '_blank');
                        
                    } else if (paymentMethod === 'transfer') {
                        // Abrir portal del banco
                        window.open('https://www.bnb.com.bo/personas/canales-digitales', '_blank');
                    }
                    
                    // Mostrar mensaje de éxito
                    alert(`¡Gracias ${alias}! Tu aporte de ${currentAmount} Bs ha sido registrado. Te redirigimos para completar el pago.`);
                    
                    setTimeout(closeDonationModal, 1000);
                }, 1000);
                
            }, 1500);
        });
        
        // ===== NEWSLETTER =====
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const emailInput = this.querySelector('input[type="email"]');
                const email = emailInput.value.trim();
                
                if (email && validateEmail(email)) {
                    const submitBtn = this.querySelector('button[type="submit"]');
                    const originalText = submitBtn.innerHTML;
                    
                    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Suscribiendo...';
                    submitBtn.disabled = true;
                    
                    // Simular suscripción
                    setTimeout(() => {
                        // Guardar en localStorage
                        let subscribers = JSON.parse(localStorage.getItem('hashwar_newsletter') || '[]');
                        if (!subscribers.includes(email)) {
                            subscribers.push(email);
                            localStorage.setItem('hashwar_newsletter', JSON.stringify(subscribers));
                        }
                        
                        submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Gracias!';
                        submitBtn.style.background = 'linear-gradient(135deg, var(--success), #00aa44)';
                        
                        setTimeout(() => {
                            emailInput.value = '';
                            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Suscrito ✓';
                            
                            setTimeout(() => {
                                submitBtn.innerHTML = originalText;
                                submitBtn.style.background = '';
                                submitBtn.disabled = false;
                            }, 2000);
                        }, 1000);
                    }, 1000);
                } else {
                    emailInput.style.borderColor = 'var(--error)';
                    emailInput.style.boxShadow = '0 0 10px rgba(255, 0, 102, 0.3)';
                    
                    setTimeout(() => {
                        emailInput.style.borderColor = '';
                        emailInput.style.boxShadow = '';
                    }, 3000);
                }
            });
        }
        
        // ===== FUNCIONES AUXILIARES =====
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }
        
        // ===== ANIMACIONES Y EFECTOS =====
        // Efecto hover en botones
        const buttons = document.querySelectorAll('.btn-certificates, .btn-directions-compact, .btn-newsletter');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-3px)';
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });
        });
        
        // Efectos especiales para la moneda
        coinBtn.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1) rotateY(20deg)';
        });
        
        coinBtn.addEventListener('mouseleave', function() {
            if (!donationPanel.classList.contains('active')) {
                this.style.transform = 'scale(1) rotateY(0deg)';
            }
        });
        
        // Efecto de carga para la moneda
        setTimeout(() => {
            coinBtn.style.opacity = '1';
            coinBtn.style.transform = 'scale(1)';
        }, 300);
        
        // ===== INICIALIZACIÓN =====
        // Verificar si hay donaciones previas
        const donations = JSON.parse(localStorage.getItem('hashwar_donations') || '[]');
        if (donations.length > 0) {
            console.log(`Tienes ${donations.length} aportes registrados. ¡Gracias!`);
        }
        
        // Verificar suscriptores
        const subscribers = JSON.parse(localStorage.getItem('hashwar_newsletter') || '[]');
        console.log(`${subscribers.length} personas suscritas al newsletter.`);
    });
