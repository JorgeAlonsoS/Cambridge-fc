const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Registro de usuario
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = new User({ username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Usuario registrado correctamente.' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Inicio de sesión
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Usuario no encontrado.' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Contraseña incorrecta.' });

        res.json({ message: 'Inicio de sesión exitoso.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;