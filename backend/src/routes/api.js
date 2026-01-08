const express = require('express');
const PlatoController = require('../controllers/platoController');

const router = express.Router();

// Rutas de API
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'API funcionando correctamente',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Rutas para tiempos
router.get('/tiempos', PlatoController.getTiempos);

// Rutas para grupos
router.get('/grupos', PlatoController.getGrupos);
router.get('/grupos/:id/comidas', PlatoController.getComidasPorGrupo);

// Rutas para platos
router.get('/plato/generar', PlatoController.generarPlato);
router.get('/plato/aleatorio', PlatoController.generarPlatoAleatorio);

// Rutas para sustituciones
router.get('/sustituciones/grupo1', PlatoController.getSustitucionesGrupo1);

// Rutas para administración
router.post('/comidas', PlatoController.agregarComida);
router.get('/estadisticas', PlatoController.getEstadisticas);

module.exports = router;