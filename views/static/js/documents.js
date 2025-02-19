class DocumentManager {
    constructor() {
        this.documents = this.loadDocuments();
        this.setupEventListeners();
        this.renderDocuments();
    }

    loadDocuments() {
        return JSON.parse(localStorage.getItem('playerDocuments') || '{}');
    }

    saveDocuments() {
        localStorage.setItem('playerDocuments', JSON.stringify(this.documents));
    }

    setupEventListeners() {
        // Manejar el arrastrar y soltar documentos
        const dropZone = document.getElementById('document-drop-zone');
        if (dropZone) {
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            dropZone.addEventListener('dragenter', () => dropZone.classList.add('border-blue-500'));
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('border-blue-500'));
            dropZone.addEventListener('drop', (e) => {
                dropZone.classList.remove('border-blue-500');
                const files = e.dataTransfer.files;
                this.handleFiles(files);
            });
        }

        // Manejar la selección de archivos
        const fileInput = document.getElementById('document-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFiles(e.target.files);
            });
        }

        // Manejar el formulario de documentos
        const form = document.getElementById('document-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const playerId = document.getElementById('playerId').value;
                const documentType = document.getElementById('documentType').value;
                const description = document.getElementById('documentDescription').value;
                const files = document.getElementById('document-input').files;

                if (files.length > 0) {
                    this.addDocument(playerId, documentType, description, files[0]);
                }
            });
        }
    }

    async handleFiles(files) {
        for (let file of files) {
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const preview = document.getElementById('document-preview');
                    if (preview) {
                        if (file.type.startsWith('image/')) {
                            preview.innerHTML = `
                                <img src="${e.target.result}" 
                                     class="max-w-full h-auto rounded-lg shadow-lg" 
                                     alt="Vista previa">
                            `;
                        } else {
                            preview.innerHTML = `
                                <div class="p-4 bg-gray-100 rounded-lg text-center">
                                    <i class="fas fa-file-pdf text-4xl text-red-500"></i>
                                    <p class="mt-2">${file.name}</p>
                                </div>
                            `;
                        }
                    }
                };
                reader.readAsDataURL(file);
            } else {
                this.showNotification('Solo se permiten imágenes y PDFs', 'error');
            }
        }
    }

    addDocument(playerId, type, description, file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (!this.documents[playerId]) {
                this.documents[playerId] = [];
            }

            this.documents[playerId].push({
                id: Date.now(),
                type: type,
                description: description,
                fileName: file.name,
                fileType: file.type,
                data: e.target.result,
                uploadDate: new Date().toISOString()
            });

            this.saveDocuments();
            this.renderDocuments();
            this.showNotification('Documento agregado correctamente', 'success');

            // Limpiar el formulario
            document.getElementById('document-form').reset();
            document.getElementById('document-preview').innerHTML = '';
        };
        reader.readAsDataURL(file);
    }

    renderDocuments() {
        const container = document.getElementById('documents-container');
        if (!container) return;

        const playerId = document.getElementById('playerId')?.value;
        if (!playerId || !this.documents[playerId]) {
            container.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-folder-open text-4xl text-gray-400"></i>
                    <p class="mt-2 text-gray-500">No hay documentos registrados</p>
                </div>
            `;
            return;
        }

        const docs = this.documents[playerId];
        container.innerHTML = docs.map(doc => this.createDocumentCard(doc)).join('');

        // Agregar event listeners para eliminar documentos
        docs.forEach(doc => {
            const deleteBtn = document.getElementById(`delete-doc-${doc.id}`);
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deleteDocument(playerId, doc.id));
            }
        });
    }

    createDocumentCard(doc) {
        return `
            <div class="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center mb-2">
                            <i class="${doc.fileType.startsWith('image/') ? 'fas fa-image text-blue-500' : 'fas fa-file-pdf text-red-500'} text-2xl mr-3"></i>
                            <div>
                                <h3 class="font-semibold text-gray-800">${doc.fileName}</h3>
                                <p class="text-sm text-gray-500">${doc.type}</p>
                            </div>
                        </div>
                        <p class="text-gray-600 text-sm mb-2">${doc.description}</p>
                        <p class="text-xs text-gray-400">
                            Subido el ${new Date(doc.uploadDate).toLocaleDateString()}
                        </p>
                    </div>
                    <div class="flex space-x-2">
                        <button onclick="window.open('${doc.data}', '_blank')"
                                class="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button id="delete-doc-${doc.id}"
                                class="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    deleteDocument(playerId, docId) {
        if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
            this.documents[playerId] = this.documents[playerId].filter(doc => doc.id !== docId);
            this.saveDocuments();
            this.renderDocuments();
            this.showNotification('Documento eliminado correctamente', 'success');
        }
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
    new DocumentManager();
});
