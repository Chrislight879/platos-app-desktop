const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Configurar middleware para logs
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// IMPORTANTE: Servir archivos estáticos PRIMERO
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Configurar middleware para JSON
app.use(express.json());

// Configurar CORS para permitir todas las solicitudes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Datos de la base de datos integrados en el código
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

// Porciones por tiempo (dieta 1500 calorías)
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

// Alimentos por grupo
const comidas = {
    1: [ // Grupo 1 - Lácteos
        'una taza de leche descremada',
        'un vasito de yogurt Light',
        'media taza de leche evaporada',
        'cucharada y media de leche en polvo'
    ],
    2: [ // Grupo 2 - Proteínas
        'una onza de carne de res con grasa',
        'dos onzas de carne de res magra',
        'dos onzas de carne de pollo sin piel',
        'una onza de pato sin piel',
        'dos onzas de pavo sin piel',
        'una onza de cerdo con grasa',
        'dos onzas de cerdo sin grasa',
        'una onza de ternera',
        'dos rebanadas pequeñas de jamón',
        'una onza de lengua',
        'media salchicha mediana',
        'dos onzas de pescado',
        'dos camarones medianos',
        'dos onzas de langosta',
        'un cuarto de lata de atún en agua',
        'media taza de carne de cangrejo',
        'dos sardinas grandes',
        'cinco ostras',
        'cinco conchas',
        'una onza de queso fresco',
        'dos cucharadas de requesón',
        'una y media rebanada de queso Kraft',
        'una onza de queso parmesano',
        'una onza de queso mozzarella',
        'dos cucharadas de queso cottage',
        'una onza de queso capa roja',
        'una onza de queso roquefort',
        'una onza de queso suizo',
        'dos claras de huevo'
    ],
    3: [ // Grupo 3 - Frutas
        'una manzana mediana',
        'una naranja mediana',
        'una mandarina mediana',
        'media toronja mediana',
        'un mango pequeño',
        'una jícama pequeña',
        'una lima',
        'una pera pequeña',
        'un higo fresco grande',
        'dos guayabas',
        'medio guineo de 15 cm',
        'un cuarto de zapote',
        'diez cerezas',
        'una taza de fresas',
        'dos ciruelas frescas',
        'quince uvas pequeñas',
        'doce uvas grandes',
        'una rebanada de sandía',
        'una rebanada de piña',
        'una rebanada de melón',
        'tres jocotes',
        'un marañón mediano',
        'tres marañones japoneses pequeños',
        '40 nances',
        'un durazno grande',
        'un melocotón pequeño',
        'un kivi',
        '¼ anona',
        '2 higos frescos pequeños',
        'dos ciruelas pasas',
        '¼ de mamey mediano',
        '12 manrones (talpajocotes)',
        '1/3 rebanada de papaya',
        'media taza pequeña de jugo de naranja, piña, manzana, uvas o toronja',
        'una taza de jugo de tomate'
    ],
    4: [ // Grupo 4 - Cereales
        'una rebanada de pan de caja',
        'una tortilla pequeña',
        'un pan francés pequeño',
        'una rebanada de pan integral',
        'medio pan pita (pizza)',
        'tres cucharadas de arroz',
        'un pancake mediano',
        'dos cucharadas de frijoles',
        'una papa mediana',
        'tres cucharadas de puré de papas',
        'tres cuarto de taza de Corn Flakes u otro cereal sin azúcar',
        'tres cucharadas de avena cocida',
        'tres cucharadas de garbanzos',
        'cuatro galletas de soda',
        '½ taza de yuca',
        '½ taza de camote',
        'media taza de fideos cocidos',
        'dos cucharadas de harina',
        'dos cucharadas de maicena',
        'una taza de lorocos',
        'una taza de arverjas',
        'una taza de frijol de soya',
        'un chile verde mediano'
    ],
    5: [ // Grupo 5 - Verduras
        '1/4 de remolacha pequeña',
        '1/3 de plátano',
        '½ taza de zanahoria',
        '½ taza de col de bruselas',
        '½ taza de ejotes',
        '½ taza de cebolla',
        '½ taza de nabos',
        '½ taza de brócoli',
        '½ taza de tomates',
        '½ taza de puerros',
        '½ taza de maíz dulce',
        'una taza de chilacayote',
        'una taza de acelga',
        'una taza de apio',
        'una taza de berenjena',
        'una taza de berro',
        'una taza de coliflor',
        'una taza de guizayote',
        'una taza de guisquil',
        'una taza de espinaca',
        'una taza de espárragos',
        'una taza de hongos',
        'una taza de lechuga',
        'una taza de pepino',
        'una taza de rábano',
        'una taza de verdolaga',
        'una taza de flor de isote'
    ],
    6: [ // Grupo 6 - Grasas
        'una cucharadita de aceite',
        'una cucharadita de crema',
        'una cucharadita de mantequilla',
        'una cucharadita de manteca',
        'una cucharadita de margarina',
        'una cucharadita de mayonesa',
        'una cucharadita de queso de mantequilla',
        'una cucharadita de aderezo de ensalada',
        'una cucharadita de aceite de oliva',
        'un cuarto de aguacate pequeño',
        'una tira de tocino',
        'seis aceitunas verdes medianas'
    ]
};

// Sustituciones para Grupo 1
const sustituciones = [
    {
        descripcion: 'Sustitución por Grupo 2 + Grupo 3',
        grupos: [2, 3],
        porciones: [1, 1]
    },
    {
        descripcion: 'Sustitución por Grupo 2 + Grupo 4',
        grupos: [2, 4],
        porciones: [1, 1]
    }
];

// Función para obtener alimento aleatorio de un grupo
function getAlimentoAleatorio(grupoId) {
    const alimentos = comidas[grupoId];
    if (!alimentos || alimentos.length === 0) {
        console.log(`❌ No hay alimentos para el grupo ${grupoId}`);
        return null;
    }
    const alimento = alimentos[Math.floor(Math.random() * alimentos.length)];
    return alimento;
}

// Función mejorada para obtener alimento aleatorio
function getRandomFood(grupoId) {
    const alimentos = comidas[grupoId];
    if (!alimentos || alimentos.length === 0) {
        // Si no hay alimentos, devolver uno por defecto
        const defaults = {
            1: 'una taza de leche descremada',
            2: 'dos onzas de carne de pollo sin piel',
            3: 'una manzana mediana',
            4: 'una rebanada de pan de caja',
            5: '½ taza de zanahoria',
            6: 'una cucharadita de aceite'
        };
        return defaults[grupoId] || 'Alimento no disponible';
    }
    return alimentos[Math.floor(Math.random() * alimentos.length)];
}
// Función para generar plato - VERSIÓN CORREGIDA
function generarPlato(tiempoId) {
    const tiempo = tiempos.find(t => t.id === tiempoId);
    const porciones = porcionesTiempo[tiempoId];
    const plato = [];
    
    for (const porcion of porciones) {
        if (porcion.grupo_id === 1) {
            // 50% probabilidad de usar lácteos, 50% de sustituir
            const usarLacteos = Math.random() > 0.5;
            
            if (usarLacteos) {
                // Usar un alimento del Grupo 1 (Lácteos)
                const alimento = getRandomFood(1);
                plato.push({
                    grupo: 'Grupo 1: Lácteos',
                    alimento: alimento,
                    porcion: '1 porción',
                    es_sustitucion: false,
                    notas: 'Lácteo directo'
                });
            } else {
                // Sustituir - elegir aleatoriamente entre las 2 opciones
                const opcionSustitucion = Math.random() > 0.5 ? 0 : 1;
                const sustituciones = [
                    { grupos: [2, 3], nombres: ['Proteínas', 'Frutas'] },
                    { grupos: [2, 4], nombres: ['Proteínas', 'Cereales'] }
                ];
                
                const sustitucion = sustituciones[opcionSustitucion];
                
                // Agregar ambos alimentos de la sustitución
                sustitucion.grupos.forEach((grupoId, index) => {
                    const alimento = getRandomFood(grupoId);
                    plato.push({
                        grupo: `Grupo ${grupoId}: ${sustitucion.nombres[index]}`,
                        alimento: alimento,
                        porcion: '1 porción',
                        es_sustitucion: true,
                        sustituye_a: 'Grupo 1: Lácteos',
                        tipo_sustitucion: sustitucion.grupos.join('+')
                    });
                });
            }
        } else {
            // Para otros grupos, usar alimento normal
            const alimento = getRandomFood(porcion.grupo_id);
            const grupoNombre = grupos.find(g => g.id === porcion.grupo_id).nombre;
            
            // Manejar múltiples porciones
            for (let i = 0; i < porcion.porciones; i++) {
                plato.push({
                    grupo: grupoNombre,
                    alimento: alimento,
                    porcion: '1 porción',
                    es_sustitucion: false,
                    indice_porcion: i + 1
                });
            }
        }
    }
    
    return {
        tiempo_comida: tiempo.nombre,
        plato: plato,
        total_alimentos: plato.length,
        tiempo_id: tiempoId
    };
}
// Rutas API
app.get('/api/tiempos', (req, res) => {
    console.log(`[API] GET /api/tiempos`);
    res.json(tiempos);
});

app.get('/api/plato/generar', (req, res) => {
    const tiempoId = parseInt(req.query.tiempo) || 1;
    console.log(`[API] GET /api/plato/generar?tiempo=${tiempoId}`);
    
    if (tiempoId < 1 || tiempoId > 3) {
        return res.status(400).json({ error: 'Tiempo debe ser 1, 2 o 3' });
    }
    
    const plato = generarPlato(tiempoId);
    res.json(plato);
});

app.get('/api/plato/aleatorio', (req, res) => {
    const tiempoId = Math.floor(Math.random() * 3) + 1;
    console.log(`[API] GET /api/plato/aleatorio - Tiempo aleatorio: ${tiempoId}`);
    const plato = generarPlato(tiempoId);
    res.json(plato);
});

app.get('/api/estadisticas', (req, res) => {
    console.log(`[API] GET /api/estadisticas`);
    const totalComidas = Object.values(comidas).reduce((acc, arr) => acc + arr.length, 0);
    const stats = {
        total_comidas: totalComidas,
        total_grupos: grupos.length,
        total_tiempos: tiempos.length,
        total_sustituciones: sustituciones.length
    };
    res.json(stats);
});

// Ruta para verificar el servidor
app.get('/api/health', (req, res) => {
    console.log(`[API] GET /api/health`);
    res.json({ 
        status: 'ok', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta para ver datos de grupos
app.get('/api/grupos/:id/comidas', (req, res) => {
    const grupoId = parseInt(req.params.id);
    console.log(`[API] GET /api/grupos/${grupoId}/comidas`);
    
    if (grupoId < 1 || grupoId > 6) {
        return res.status(400).json({ error: 'ID de grupo inválido' });
    }
    
    const alimentos = comidas[grupoId] || [];
    res.json(alimentos);
});

// Ruta principal - debe ir DESPUÉS de las rutas API
app.get('/', (req, res) => {
    console.log(`[WEB] GET / - Sirviendo página principal`);
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'index.html'));
});

// Ruta para cualquier otra petición - CORREGIDA
app.get('*', (req, res) => {
    console.log(`[WEB] Ruta no encontrada: ${req.url}`);
    // En lugar de redirigir, envía el index.html para que Vue/React lo maneje
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'index.html'));
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(`❌ ERROR:`, err.message);
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Error interno del servidor',
        message: err.message 
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`✅ SERVIDOR INICIADO CORRECTAMENTE`);
    console.log(`=========================================`);
    console.log(`🌐 URL: http://localhost:${PORT}`);
    console.log(`📊 Puerto: ${PORT}`);
    console.log(`=========================================`);
    console.log(`📦 DATOS CARGADOS:`);
    console.log(`   🍎 Total comidas: ${Object.values(comidas).reduce((acc, arr) => acc + arr.length, 0)}`);
    console.log(`   📋 Grupos alimenticios: ${grupos.length}`);
    console.log(`   ⏰ Tiempos de comida: ${tiempos.length}`);
    console.log(`   🔄 Reglas de sustitución: ${sustituciones.length}`);
    console.log(`=========================================`);
    console.log(`🍽️  ENDPOINTS DISPONIBLES:`);
    console.log(`   GET  /                    → Página principal`);
    console.log(`   GET  /api/health          → Estado del servidor`);
    console.log(`   GET  /api/tiempos         → Lista de tiempos`);
    console.log(`   GET  /api/plato/generar   → Generar plato (tiempo=1,2,3)`);
    console.log(`   GET  /api/plato/aleatorio → Plato con tiempo aleatorio`);
    console.log(`   GET  /api/estadisticas    → Estadísticas del sistema`);
    console.log(`   GET  /api/grupos/:id/comidas → Comidas por grupo`);
    console.log(`=========================================`);
    console.log(`🚀 Para usar:`);
    console.log(`   1. Abre: http://localhost:${PORT}`);
    console.log(`   2. Selecciona un tiempo de comida`);
    console.log(`   3. Haz clic en "Generar Plato"`);
    console.log(`   4. ¡Listo!`);
    console.log(`=========================================\n`);
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
    console.log('\n\n🔴 Recibida señal SIGINT. Cerrando servidor...');
    process.exit(0);
});