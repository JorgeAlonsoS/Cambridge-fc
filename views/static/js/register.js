// Clase para manejar la validación y el envío del formulario
class PlayerRegistrationForm {
    constructor() {
        this.form = document.getElementById('playerForm');
        this.inputs = this.form.querySelectorAll('input, select');
        this.progressBar = document.querySelector('.progress-bar-fill');
        this.photoPreview = document.createElement('div');
        this.photoPreview.className = 'photo-preview mt-4 hidden';
        
        this.initialize();
    }

    initialize() {
        this.setupInputValidation();
        this.setupPhotoPreview();
        this.setupFormSubmission();
        this.setupInputAnimations();
        this.setupNumberValidation();
    }

    setupInputValidation() {
        this.inputs.forEach(input => {
            // Validación en tiempo real
            input.addEventListener('input', () => {
                this.validateInput(input);
                this.updateProgress();
            });

            // Validación al perder el foco
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
    }

    validateInput(input) {
        const parentGroup = input.closest('.input-group');
        const errorMessage = parentGroup.querySelector('.error-message');
        
        if (errorMessage) {
            errorMessage.remove();
        }

        let isValid = true;
        let message = '';

        switch(input.id) {
            case 'playerName':
                isValid = input.value.length >= 3;
                message = 'El nombre debe tener al menos 3 caracteres';
                break;
            case 'playerAge':
                isValid = input.value >= 5 && input.value <= 18;
                message = 'La edad debe estar entre 5 y 18 años';
                break;
            case 'playerNumber':
                isValid = input.value >= 1 && input.value <= 99;
                message = 'El número debe estar entre 1 y 99';
                break;
            case 'parentPhone':
                isValid = /^\d{10}$/.test(input.value);
                message = 'Ingrese un número de teléfono válido (10 dígitos)';
                break;
            case 'parentEmail':
                isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
                message = 'Ingrese un correo electrónico válido';
                break;
        }

        if (!isValid && input.value) {
            const error = document.createElement('div');
            error.className = 'error-message text-red-500 text-sm mt-1';
            error.textContent = message;
            parentGroup.appendChild(error);
            input.classList.add('border-red-500');
        } else {
            input.classList.remove('border-red-500');
        }

        return isValid;
    }

    setupPhotoPreview() {
        const photoInput = document.getElementById('playerPhoto');
        const photoContainer = photoInput.closest('.input-group');
        photoContainer.appendChild(this.photoPreview);

        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    this.photoPreview.innerHTML = `
                        <div class="relative">
                            <img src="${e.target.result}" alt="Vista previa" 
                                 class="w-32 h-32 object-cover rounded-lg shadow-lg">
                            <button type="button" class="remove-photo absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `;
                    this.photoPreview.classList.remove('hidden');

                    // Botón para eliminar la foto
                    this.photoPreview.querySelector('.remove-photo').addEventListener('click', () => {
                        photoInput.value = '';
                        this.photoPreview.classList.add('hidden');
                        this.updateProgress();
                    });
                };
                reader.readAsDataURL(file);
            }
        });
    }

    updateProgress() {
        const total = this.inputs.length;
        let filled = 0;
        this.inputs.forEach(input => {
            if (input.value && this.validateInput(input)) filled++;
        });
        const progress = (filled / total) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // Actualizar color basado en el progreso
        if (progress < 33) {
            this.progressBar.style.background = 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)';
        } else if (progress < 66) {
            this.progressBar.style.background = 'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)';
        } else {
            this.progressBar.style.background = 'linear-gradient(90deg, #10b981 0%, #34d399 100%)';
        }
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Validar todos los campos antes de enviar
            let isValid = true;
            this.inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                this.showNotification('Por favor, corrija los errores en el formulario', 'error');
                return;
            }

            // Simular envío con animación de carga
            const submitBtn = this.form.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Registrando...';

            try {
                // Obtener los datos del formulario
                const formData = new FormData(this.form);
                const playerData = {};
                formData.forEach((value, key) => {
                    playerData[key] = value;
                });

                // Manejar la foto
                const photoFile = document.getElementById('playerPhoto').files[0];
                if (photoFile) {
                    const reader = new FileReader();
                    reader.readAsDataURL(photoFile);
                    reader.onload = () => {
                        playerData.photo = reader.result;
                        this.savePlayer(playerData);
                    };
                } else {
                    playerData.photo = '/public/img/default-player.jpg'; // Asegúrate de tener una imagen por defecto
                    this.savePlayer(playerData);
                }
            } catch (error) {
                this.showNotification('Error al registrar el jugador', 'error');
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }

    savePlayer(playerData) {
        // Cargar jugadores existentes
        let players = JSON.parse(localStorage.getItem('players') || '[]');
        
        // Agregar el nuevo jugador
        players.push(playerData);
        
        // Guardar en localStorage
        localStorage.setItem('players', JSON.stringify(players));

        // Mostrar animación de éxito
        const successAnimation = document.getElementById('successAnimation');
        successAnimation.style.display = 'flex';

        // Crear confetti
        for (let i = 0; i < 50; i++) {
            this.createConfetti();
        }

        // Redirigir después de 3 segundos
        setTimeout(() => {
            window.location.href = '../players.html';
        }, 3000);
    }

    setupInputAnimations() {
        this.inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.closest('.input-group').classList.add('scale-105');
                input.style.transform = 'translateY(-2px)';
            });

            input.addEventListener('blur', () => {
                input.closest('.input-group').classList.remove('scale-105');
                input.style.transform = 'translateY(0)';
            });
        });
    }

    setupNumberValidation() {
        const numberInput = document.getElementById('playerNumber');
        
        numberInput.addEventListener('input', async () => {
            const number = numberInput.value;
            if (number) {
                // Aquí iría la verificación real con el servidor
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Simulamos que los números 10 y 20 ya están tomados
                if (['10', '20'].includes(number)) {
                    this.showNotification(`El número ${number} ya está en uso`, 'warning');
                    numberInput.classList.add('border-yellow-500');
                } else {
                    numberInput.classList.remove('border-yellow-500');
                }
            }
        });
    }

    createConfetti() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        document.body.appendChild(confetti);

        confetti.addEventListener('animationend', () => {
            confetti.remove();
        });
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-500 translate-x-full z-50 ${
            type === 'error' ? 'bg-red-500' :
            type === 'warning' ? 'bg-yellow-500' :
            'bg-green-500'
        } text-white`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${
                    type === 'error' ? 'fa-times-circle' :
                    type === 'warning' ? 'fa-exclamation-triangle' :
                    'fa-check-circle'
                } mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Animar entrada
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });

        // Eliminar después de 3 segundos
        setTimeout(() => {
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('playerForm');
    const steps = document.querySelectorAll('.form-step');
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const progressBar = document.querySelector('.progress-bar-fill');
    let currentStep = 1;

    // Inicializar los manejadores de eventos
    function init() {
        setupFormValidation();
        setupStepNavigation();
        setupFileUpload();
        updateNavigation(currentStep);
    }

    // Configurar validación del formulario
    function setupFormValidation() {
        const inputs = form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                validateInput(input);
                updateProgress();
            });

            input.addEventListener('blur', () => {
                validateInput(input);
            });
        });
    }

    // Validar un input específico
    function validateInput(input) {
        const parentGroup = input.closest('.input-group');
        removeInputError(parentGroup);

        if (input.hasAttribute('required') && !input.value) {
            showInputError(parentGroup, 'Este campo es requerido');
            return false;
        }

        switch(input.id) {
            case 'firstName':
            case 'lastName':
                if (input.value.length < 2) {
                    showInputError(parentGroup, 'Debe tener al menos 2 caracteres');
                    return false;
                }
                break;
            case 'phone':
                if (!/^\d{10}$/.test(input.value)) {
                    showInputError(parentGroup, 'Ingrese un número válido de 10 dígitos');
                    return false;
                }
                break;
            case 'birthDate':
                const age = calculateAge(new Date(input.value));
                if (age < 5 || age > 80) {
                    showInputError(parentGroup, 'La edad debe estar entre 5 y 80 años');
                    return false;
                }
                break;
            case 'jerseyNumber':
                if (input.value && (input.value < 1 || input.value > 99)) {
                    showInputError(parentGroup, 'El número debe estar entre 1 y 99');
                    return false;
                }
                break;
        }

        return true;
    }

    // Calcular la edad
    function calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Configurar navegación entre pasos
    function setupStepNavigation() {
        nextBtn.addEventListener('click', () => {
            if (validateStep(currentStep)) {
                if (currentStep < steps.length) {
                    updateStep(currentStep + 1);
                } else {
                    submitForm();
                }
            }
        });

        prevBtn.addEventListener('click', () => {
            if (currentStep > 1) {
                updateStep(currentStep - 1);
            }
        });
    }

    // Validar el paso actual
    function validateStep(step) {
        const currentStepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    // Actualizar el paso actual
    function updateStep(newStep) {
        document.querySelector(`.form-step[data-step="${currentStep}"]`).classList.remove('active');
        document.querySelector(`.form-step[data-step="${newStep}"]`).classList.add('active');
        
        currentStep = newStep;
        updateNavigation(currentStep);
        updateButtons();
        updateProgress();
    }

    // Actualizar la barra de progreso
    function updateProgress() {
        const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Actualizar los botones según el paso actual
    function updateButtons() {
        prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
        nextBtn.textContent = currentStep === steps.length ? 'Registrar' : 'Siguiente';
    }

    // Configurar carga de archivos
    function setupFileUpload() {
        const photoInput = document.getElementById('playerPhoto');
        if (photoInput) {
            const photoContainer = photoInput.closest('.file-upload');
            
            photoContainer.addEventListener('click', () => photoInput.click());
            photoContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                photoContainer.classList.add('border-orange-500');
            });
            
            photoContainer.addEventListener('dragleave', () => {
                photoContainer.classList.remove('border-orange-500');
            });
            
            photoContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                photoContainer.classList.remove('border-orange-500');
                
                if (e.dataTransfer.files.length) {
                    photoInput.files = e.dataTransfer.files;
                    showFilePreview(photoInput);
                }
            });
            
            photoInput.addEventListener('change', () => showFilePreview(photoInput));
        }
    }

    // Mostrar vista previa de la foto
    function showFilePreview(input) {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            const preview = input.closest('.file-upload').querySelector('.preview-container');
            
            reader.onload = (e) => {
                preview.innerHTML = `
                    <img src="${e.target.result}" alt="Vista previa" class="w-full h-32 object-cover rounded-lg">
                    <button type="button" class="remove-preview absolute top-2 right-2 bg-red-500 text-white rounded-full p-1">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                
                preview.querySelector('.remove-preview').addEventListener('click', (e) => {
                    e.stopPropagation();
                    input.value = '';
                    preview.innerHTML = '';
                });
            };
            
            reader.readAsDataURL(input.files[0]);
        }
    }

    // Mostrar error en un input
    function showInputError(parentGroup, message) {
        removeInputError(parentGroup);
        const error = document.createElement('div');
        error.className = 'error-message text-red-500 text-sm mt-1';
        error.textContent = message;
        parentGroup.appendChild(error);
        parentGroup.querySelector('input, select').classList.add('border-red-500');
    }

    // Remover error de un input
    function removeInputError(parentGroup) {
        const errorMessage = parentGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
        parentGroup.querySelector('input, select')?.classList.remove('border-red-500');
    }

    // Enviar el formulario
    async function submitForm() {
        const formData = new FormData(form);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            birthDate: formData.get('birthDate'),
            category: formData.get('category'),
            position: formData.get('position'),
            jerseyNumber: formData.get('jerseyNumber'),
            phone: formData.get('phone'),
            emergencyContact: formData.get('emergencyContact')
        };

        try {
            const response = await fetch('/api/players', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showSuccessMessage();
            } else {
                const error = await response.json();
                showErrorMessage(error.message || 'Error al registrar el jugador');
            }
        } catch (error) {
            showErrorMessage('Error de conexión');
        }
    }

    // Mostrar mensaje de éxito
    function showSuccessMessage() {
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg';
        successMessage.textContent = '¡Registro exitoso!';
        document.body.appendChild(successMessage);
        
        setTimeout(() => {
            successMessage.remove();
            window.location.href = '/';
        }, 2000);
    }

    // Mostrar mensaje de error
    function showErrorMessage(message) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg';
        errorMessage.textContent = message;
        document.body.appendChild(errorMessage);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 3000);
    }

    // Inicializar
    init();
});
