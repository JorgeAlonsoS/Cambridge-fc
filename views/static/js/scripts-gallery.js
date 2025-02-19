document.addEventListener('DOMContentLoaded', async () => {
    const gallery = document.getElementById('gallery');

    try {
        const response = await fetch('/api/players');
        const players = await response.json();

        gallery.innerHTML = players.map(player => `
        <div class="bg-green-700 p-4 rounded-lg hover-scale">
        <img src="uploads/${player.photo}" alt="${player.name}" class="w-full h-48 object-cover rounded-lg">
        </div>
    `).join('');
    } catch (err) {
        console.error('Error:', err);
        gallery.innerHTML = '<p class="text-red-500">Hubo un error al cargar la galería.</p>';
    }
});