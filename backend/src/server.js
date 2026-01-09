// SERVER.JS COMPLETAMENTE CORREGIDO Y SIMPLIFICADO
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// CONFIGURACIÓN BÁSICA
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));
app.use(express.json());

// Permitir CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// DATOS
const grupos = [
    { id: 1, nombre: 'Grupo 1: Lácteos' },
    { id: 2, nombre: 'Grupo 2: Proteínas' },
    { id: 3, nombre: 'Grupo 3: Frutas' },
    { id: 4, nombre: 'Grupo 4: Cereales' },
    { id: 5, nombre: 'Grupo 5: Verduras' },
    { id: 6, nombre: 'Grupo 6: Grasas' }
];

const tiempos = [
    { id: 1, nombre: 'Desayuno' },
    { id: 2, nombre: 'Almuerzo' },
    { id: 3, nombre: 'Cena' }
];

const porcionesTiempo = {
    1: [ // Desayuno
        { grupo_id: 1, porciones: 1 },
        { grupo_id: 2, porciones: 1 },
        { grupo_id: 3, porciones: 1 },
        { grupo_id: 4, porciones: 2 },
        { grupo_id: 5, porciones: 1 },
        { grupo_id: 6, porciones: 1 }
    ],
    2: [ // Almuerzo
        { grupo_id: 2, porciones: 2 },
        { grupo_id: 3, porciones: 1 },
        { grupo_id: 4, porciones: 3 },
        { grupo_id: 5, porciones: 1 },
        { grupo_id: 6, porciones: 1 }
    ],
    3: [ // Cena
        { grupo_id: 2, porciones: 1 },
        { grupo_id: 3, porciones: 1 },
        { grupo_id: 4, porciones: 2 },
        { grupo_id: 5, porciones: 1 },
        { grupo_id: 6, porciones: 1 }
    ]
};

const comidas = {
    1: [ // Lácteos
        'una taza de leche descremada',
        'un vasito de yogurt Light',
        'media taza de leche evaporada',
        'cucharada y media de leche en polvo'
    ],
    2: [ // Proteínas
        'una onza de carne de res con grasa',
        'dos onzas de carne de res magra',
        'dos onzas de carne de pollo sin piel'
    ],
    3: [ // Frutas
        'una manzana mediana',
        'una naranja mediana',
        'una mandarina mediana'
    ],
    4: [ // Cereales
        'una rebanada de pan de caja',
        'una tortilla pequeña',
        'un pan francés pequeño'
    ],
    5: [ // Verduras
        '½ taza de zanahoria',
        '½ taza de brócoli',
        '½ taza de tomates'
    ],
    6: [ // Grasas
        'una cucharadita de aceite',
        'una cucharadita de mantequilla',
        'una cucharadita de aceite de oliva'
    ]
};

// FUNCIÓN PARA ALEATORIO
function getRandomFood(grupoId) {
    const foods = comidas[grupoId];
    return foods[Math.floor(Math.random() * foods.length)];
}

// RUTAS API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/tiempos', (req, res) => {
    res.json(tiempos);
});

app.get('/api/plato/generar', (req, res) => {
    const tiempoId = parseInt(req.query.tiempo) || 1;
    
    if (tiempoId < 1 || tiempoId > 3) {
        return res.status(400).json({ error: 'Tiempo inválido' });
    }
    
    const tiempo = tiempos.find(t => t.id === tiempoId);
    const porciones = porcionesTiempo[tiempoId];
    const plato = [];
    
    porciones.forEach(p => {
        if (p.grupo_id === 1) {
            // Sustitución para lácteos
            plato.push({
                grupo: 'Grupo 2: Proteínas',
                alimento: getRandomFood(2),
                porcion: '1 porción',
                es_sustitucion: true
            });
            plato.push({
                grupo: 'Grupo 3: Frutas',
                alimento: getRandomFood(3),
                porcion: '1 porción',
                es_sustitucion: true
            });
        } else {
            plato.push({
                grupo: grupos.find(g => g.id === p.grupo_id).nombre,
                alimento: getRandomFood(p.grupo_id),
                porcion: p.porciones + ' porción(es)',
                es_sustitucion: false
            });
        }
    });
    
    res.json({
        tiempo_comida: tiempo.nombre,
        plato: plato,
        total_alimentos: plato.length
    });
});

app.get('/api/estadisticas', (req, res) => {
    const total = Object.values(comidas).reduce((sum, arr) => sum + arr.length, 0);
    res.json({
        total_comidas: total,
        total_grupos: grupos.length,
        total_tiempos: tiempos.length
    });
});

// RUTA PRINCIPAL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'index.html'));
});

// MANEJO DE RUTAS NO ENCONTRADAS - VERSIÓN SEGURA
app.use((req, res) => {
    res.status(404).send('Ruta no encontrada');
});

// INICIAR SERVIDOR
app.listen(PORT, '0.0.0.0', () => {
    console.log('=========================================');
    console.log('✅ SERVIDOR INICIADO CORRECTAMENTE!');
    console.log('=========================================');
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`🌐 También: http://127.0.0.1:${PORT}`);
    console.log('=========================================');
    console.log('Presiona Ctrl+C para detener');
    console.log('=========================================');
});

// Manejar cierre
process.on('SIGINT', () => {
    console.log('\n🔴 Servidor detenido');
    process.exit(0);
});