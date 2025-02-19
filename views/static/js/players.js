class PlayersManager {
    constructor() {
        this.players = this.loadPlayers();
        this.renderPlayers();
    }

    loadPlayers() {
        const players = localStorage.getItem('players');
        return players ? JSON.parse(players) : [];
    }

    renderPlayers() {
        const container = document.getElementById('players-container');
        if (!container) return;

        if (this.players.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <i class="fas fa-users text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-500">No hay jugadores registrados aún.</p>
                    <a href="/views/templates/register.html" 
                       class="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg 
                              hover:bg-blue-700 transition-all transform hover:scale-105">
                        <i class="fas fa-plus mr-2"></i>Agregar Jugador
                    </a>
                </div>
            `;
            return;
        }

        container.innerHTML = this.players.map(player => this.createPlayerCard(player)).join('');
        
        // Agregar eventos para los botones de acción
        this.players.forEach((player, index) => {
            const card = document.getElementById(`player-${index}`);
            if (card) {
                const deleteBtn = card.querySelector('.delete-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.deletePlayer(index);
                    });
                }
            }
        });
    }

    createPlayerCard(player) {
        return `
            <div class="player-card bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                 id="player-${this.players.indexOf(player)}">
                <div class="relative">
                    <img src="${player.photo}" alt="${player.playerName}" 
                         class="w-full h-64 object-cover">
                    <div class="absolute top-0 right-0 m-4 bg-blue-600 text-white px-3 py-1 rounded-full">
                        #${player.playerNumber}
                    </div>
                </div>
                <div class="p-6">
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">${player.playerName}</h3>
                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <p class="text-sm text-gray-500">Edad</p>
                            <p class="font-semibold">${player.playerAge} años</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-500">Posición</p>
                            <p class="font-semibold">${this.formatPosition(player.playerPosition)}</p>
                        </div>
                    </div>
                    
                    <div class="border-t pt-4 mt-4">
                        <h4 class="text-lg font-semibold text-gray-700 mb-2">Información de Contacto</h4>
                        <div class="space-y-2">
                            <p class="flex items-center text-gray-600">
                                <i class="fas fa-user mr-2"></i>
                                ${player.parentName} (${this.formatRelationship(player.relationship)})
                            </p>
                            <p class="flex items-center text-gray-600">
                                <i class="fas fa-phone mr-2"></i>
                                ${this.formatPhone(player.parentPhone)}
                            </p>
                            <p class="flex items-center text-gray-600">
                                <i class="fas fa-envelope mr-2"></i>
                                ${player.parentEmail}
                            </p>
                        </div>
                    </div>

                    <div class="flex justify-end mt-6 space-x-2">
                        <button onclick="openDocumentsModal('${this.players.indexOf(player)}', '${player.playerName}')"
                                class="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all">
                            <i class="fas fa-folder mr-1"></i>Documentos
                        </button>
                        <button class="edit-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all">
                            <i class="fas fa-edit mr-1"></i>Editar
                        </button>
                        <button class="delete-btn px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all">
                            <i class="fas fa-trash-alt mr-1"></i>Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    formatPosition(position) {
        const positions = {
            'portero': 'Portero',
            'defensa': 'Defensa',
            'mediocampista': 'Mediocampista',
            'delantero': 'Delantero'
        };
        return positions[position] || position;
    }

    formatRelationship(relationship) {
        const relationships = {
            'padre': 'Padre',
            'madre': 'Madre',
            'tutor': 'Tutor Legal'
        };
        return relationships[relationship] || relationship;
    }

    formatPhone(phone) {
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }

    deletePlayer(index) {
        if (confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
            this.players.splice(index, 1);
            localStorage.setItem('players', JSON.stringify(this.players));
            this.renderPlayers();
            
            // Mostrar notificación
            this.showNotification('Jugador eliminado correctamente', 'success');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg transform transition-all duration-500 z-50 ${
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
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new PlayersManager();
});
