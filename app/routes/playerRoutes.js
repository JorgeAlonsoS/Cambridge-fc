const express = require('express');
const multer = require('multer');
const Player = require('../models/Player');
const router = express.Router();

// Configuración de Multer para subir imágenes
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    },
});

const upload = multer({ storage });

// Agregar un nuevo jugador
router.post('/', upload.single('photo'), async (req, res) => {
    const { name, number, age } = req.body;
    const photo = req.file ? req.file.filename : '';

    // Calcular categoría
    let category;
    if (age < 10) category = 'Sub 10';
    else if (age < 12) category = 'Sub 12';
    else if (age < 14) category = 'Sub 14';
    else category = 'Mayores';

    const player = new Player({ name, number, age, category, photo });

    try {
        await player.save();
        res.status(201).json(player);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Obtener todos los jugadores
router.get('/', async (req, res) => {
    try {
        const players = await Player.find();
        res.json(players);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;