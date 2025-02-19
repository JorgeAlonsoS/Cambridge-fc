class DocumentUploadManager {
    constructor() {
        this.documents = {};
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Configurar todos los contenedores de documentos
        document.querySelectorAll('.document-upload-container').forEach(container => {
            const input = container.querySelector('.document-input');
            const dropZone = container.querySelector('.border-dashed');
            const preview = container.querySelector('.document-preview');
            const type = container.dataset.type;

            // Eventos de arrastrar y soltar
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            dropZone.addEventListener('dragenter', () => {
                dropZone.classList.add('border-blue-500', 'bg-blue-50');
            });

            dropZone.addEventListener('dragleave', () => {
                dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            });

            dropZone.addEventListener('drop', (e) => {
                dropZone.classList.remove('border-blue-500', 'bg-blue-50');
                const files = e.dataTransfer.files;
                this.handleFiles(files, type, preview, input);
            });

            // Evento de selección de archivo
            input.addEventListener('change', () => {
                this.handleFiles(input.files, type, preview, input);
            });
        });
    }

    handleFiles(files, type, preview, input) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
        
        Array.from(files).forEach(file => {
            if (file.size > maxSize) {
                this.showNotification('El archivo es demasiado grande. Máximo 5MB.', 'error');
                return;
            }

            if (!validTypes.includes(file.type)) {
                this.showNotification('Tipo de archivo no válido. Solo se permiten imágenes y PDF.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                // Guardar el documento
                if (!this.documents[type]) {
                    this.documents[type] = [];
                }
                this.documents[type].push({
                    name: file.name,
                    type: file.type,
                    data: e.target.result
                });

                // Mostrar vista previa
                this.showPreview(file, preview);
                
                // Actualizar el estado del formulario
                this.updateFormProgress();
            };
            reader.readAsDataURL(file);
        });
    }

    showPreview(file, previewElement) {
        previewElement.classList.remove('hidden');
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.innerHTML = `
                    <div class="relative group">
                        <img src="${e.target.result}" 
                             class="max-h-32 rounded border shadow" 
                             alt="Vista previa">
                        <button onclick="removeDocument(this)" 
                                class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <p class="text-sm text-gray-500 mt-2">${file.name}</p>
                `;
            };
            reader.readAsDataURL(file);
        } else {
            previewElement.innerHTML = `
                <div class="relative group bg-gray-100 p-4 rounded">
                    <i class="fas fa-file-pdf text-red-500 text-2xl"></i>
                    <p class="text-sm text-gray-700 mt-2">${file.name}</p>
                    <button onclick="removeDocument(this)" 
                            class="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
    }

    updateFormProgress() {
        const requiredTypes = ['dni', 'medical', 'authorization'];
        const progress = requiredTypes.filter(type => 
            this.documents[type] && this.documents[type].length > 0
        ).length;

        const progressBar = document.querySelector('.progress-bar');
        if (progressBar) {
            const percentage = (progress / requiredTypes.length) * 100;
            progressBar.style.width = `${percentage}%`;
            
            // Actualizar color según el progreso
            if (percentage === 100) {
                progressBar.classList.remove('bg-blue-500', 'bg-yellow-500');
                progressBar.classList.add('bg-green-500');
            } else if (percentage > 50) {
                progressBar.classList.remove('bg-blue-500', 'bg-green-500');
                progressBar.classList.add('bg-yellow-500');
            }
        }
    }

    removeDocument(type, index) {
        if (this.documents[type]) {
            this.documents[type].splice(index, 1);
            this.updateFormProgress();
            
            // Limpiar la vista previa
            const container = document.querySelector(`[data-type="${type}"]`);
            if (container) {
                const preview = container.querySelector('.document-preview');
                const input = container.querySelector('.document-input');
                preview.classList.add('hidden');
                preview.innerHTML = '';
                input.value = '';
            }
        }
    }

    getDocuments() {
        return this.documents;
    }

    validateDocuments() {
        const requiredTypes = ['dni', 'medical', 'authorization'];
        const missingDocs = requiredTypes.filter(type => 
            !this.documents[type] || this.documents[type].length === 0
        );

        if (missingDocs.length > 0) {
            const docNames = {
                dni: 'DNI o Partida de Nacimiento',
                medical: 'Certificado Médico',
                authorization: 'Autorización de Padres'
            };
            const missingNames = missingDocs.map(type => docNames[type]).join(', ');
            this.showNotification(`Faltan documentos requeridos: ${missingNames}`, 'error');
            return false;
        }

        return true;
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-500 z-50 ${
            type === 'error' ? 'bg-red-500' : 'bg-green-500'
        } text-white`;
        
        notification.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'error' ? 'fa-times-circle' : 'fa-check-circle'} mr-2"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.documentUpload = new DocumentUploadManager();
});

// Función global para remover documentos
window.removeDocument = function(button) {
    const container = button.closest('.document-upload-container');
    const type = container.dataset.type;
    window.documentUpload.removeDocument(type, 0);
};
