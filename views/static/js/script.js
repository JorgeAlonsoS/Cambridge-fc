import { gsap } from 'gsap';

// Animación del banner
gsap.from('header', { duration: 1, y: -50, opacity: 0, ease: 'power2.out' });
gsap.from('nav', { duration: 1, y: -50, opacity: 0, ease: 'power2.out', delay: 0.5 });
gsap.from('section', { duration: 1, y: 50, opacity: 0, ease: 'power2.out', delay: 1 });

// Animación del botón de agregar jugador
const addPlayerBtn = document.getElementById('add-player-btn');
addPlayerBtn.addEventListener('mouseenter', () => {
    gsap.to(addPlayerBtn, { duration: 0.3, scale: 1.1, ease: 'power2.out' });
});
addPlayerBtn.addEventListener('mouseleave', () => {
    gsap.to(addPlayerBtn, { duration: 0.3, scale: 1, ease: 'power2.out' });
});

// Mostrar/ocultar el modal
const addPlayerModal = document.getElementById('add-player-modal');
const closeModalBtn = document.getElementById('close-modal');

addPlayerBtn.addEventListener('click', () => {
    addPlayerModal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', () => {
    addPlayerModal.classList.add('hidden');
});

// Manejar el formulario
const playerForm = document.getElementById('player-form');

playerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', document.getElementById('name').value);
    formData.append('number', document.getElementById('number').value);
    formData.append('age', document.getElementById('age').value);
    formData.append('photo', document.getElementById('photo').files[0]);

    try {
        const response = await fetch('/api/players', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            alert('Jugador agregado correctamente.');
            addPlayerModal.classList.add('hidden');
            playerForm.reset();
        } else {
            const error = await response.json();
            alert(`Error: ${error.message}`);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('Hubo un error al agregar el jugador.');
    }
});