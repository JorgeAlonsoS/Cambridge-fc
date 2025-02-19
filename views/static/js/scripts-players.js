document.addEventListener('DOMContentLoaded', async () => {
    const playersList = document.getElementById('players-list');

    try {
        const response = await fetch('/api/players');
        const players = await response.json();

        playersList.innerHTML = players.map(player => `
        <div class="bg-green-700 p-4 rounded-lg hover-scale">
        <img src="uploads/${player.photo}" alt="${player.name}" class="w-full h-48 object-cover rounded-t-lg">
        <div class="p-4">
            <h3 class="text-xl font-bold">${player.name}</h3>
            <p>Número: ${player.number}</p>
            <p>Edad: ${player.age}</p>
            <p>Categoría: ${player.category}</p>
        </div>
        </div>
    `).join('');
    } catch (err) {
        console.error('Error:', err);
        playersList.innerHTML = '<p class="text-red-500">Hubo un error al cargar los jugadores.</p>';
    }
});