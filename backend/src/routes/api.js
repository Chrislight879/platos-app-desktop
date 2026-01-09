const express = require('express');
const router = express.Router();
const PlatoController = require('../controllers/platoController');

// Ruta para generar un plato aleatorio
router.get('/generar-plato/:tiempoId', async (req, res) => {
    try {
        const tiempoId = parseInt(req.params.tiempoId);
        
        if (isNaN(tiempoId) || tiempoId < 1 || tiempoId > 3) {
            return res.status(400).json({ 
                success: false, 
                message: 'ID de tiempo inválido. Use 1=Desayuno, 2=Almuerzo, 3=Cena' 
            });
        }
        
        const plato = await PlatoController.generarPlato(tiempoId);
        res.json({ success: true, plato });
        
    } catch (error) {
        console.error('Error en /generar-plato:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Ruta para obtener todos los tiempos
router.get('/tiempos', async (req, res) => {
    try {
        const tiempos = await PlatoController.obtenerTiempos();
        res.json({ success: true, tiempos });
    } catch (error) {
        console.error('Error en /tiempos:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Ruta para obtener estadísticas
router.get('/estadisticas', async (req, res) => {
    try {
        const estadisticas = await PlatoController.obtenerEstadisticas();
        res.json({ success: true, estadisticas });
    } catch (error) {
        console.error('Error en /estadisticas:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

// Ruta para poblar la base de datos con alimentos (ejecutar una sola vez)
router.post('/poblar-alimentos', async (req, res) => {
    try {
        // Aquí irían todos los alimentos de las imágenes
        // Por simplicidad, solo incluyo algunos ejemplos
        const alimentos = [
            // Grupo 1
            { nombre: 'una taza de leche descremada', grupo_id: 1 },
            { nombre: 'un vasito de yogurt Light', grupo_id: 1 },
            { nombre: 'media taza de leche evaporada', grupo_id: 1 },
            
            // Grupo 2
            { nombre: 'una onza de carne de res con grasa', grupo_id: 2 },
            { nombre: 'dos onzas de carne de pollo sin piel', grupo_id: 2 },
            { nombre: 'dos claras de huevo', grupo_id: 2 },
            
            // Grupo 3
            { nombre: 'una manzana mediana', grupo_id: 3 },
            { nombre: 'una naranja mediana', grupo_id: 3 },
            { nombre: 'una taza de fresas', grupo_id: 3 },
            
            // Grupo 4
            { nombre: 'una tortilla pequeña', grupo_id: 4 },
            { nombre: 'tres cucharadas de arroz', grupo_id: 4 },
            { nombre: 'un pan francés pequeño', grupo_id: 4 },
            
            // Grupo 5
            { nombre: '½ taza de brócoli', grupo_id: 5 },
            { nombre: '½ taza de zanahoria', grupo_id: 5 },
            { nombre: 'una taza de espinaca', grupo_id: 5 },
            
            // Grupo 6
            { nombre: 'una cucharadita de aceite', grupo_id: 6 },
            { nombre: 'un cuarto de aguacate pequeño', grupo_id: 6 },
            { nombre: 'una cucharadita de mantequilla', grupo_id: 6 }
        ];
        
        const resultado = await PlatoController.insertarAlimentos(alimentos);
        res.json(resultado);
        
    } catch (error) {
        console.error('Error en /poblar-alimentos:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
});

module.exports = router;