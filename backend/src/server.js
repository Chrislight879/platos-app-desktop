const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Configurar middleware para logs
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
    next();
});

// Datos de la base de datos integrados en el código
const grupos = [
    { id: 1, nombre: 'Grupo 1' },
    { id: 2, nombre: 'Grupo 2' },
    { id: 3, nombre: 'Grupo 3' },
    { id: 4, nombre: 'Grupo 4' },
    { id: 5, nombre: 'Grupo 5' },
    { id: 6, nombre: 'Grupo 6' }
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
    console.log(`  🔍 Grupo ${grupoId}: "${alimento}"`);
    return alimento;
}

// Función para generar plato
function generarPlato(tiempoId) {
    console.log(`\n🍽️  GENERANDO PLATO para ${tiempos.find(t => t.id === tiempoId)?.nombre}`);
    console.log(`📊 Porciones configuradas:`, porcionesTiempo[tiempoId]);
    
    const tiempo = tiempos.find(t => t.id === tiempoId);
    const porciones = porcionesTiempo[tiempoId] || [];
    const plato = [];
    
    console.log(`🔍 Procesando ${porciones.length} grupos...`);
    
    for (const porcion of porciones) {
        // Si es Grupo 1, aplicar sustitución aleatoria
        if (porcion.grupo_id === 1) {
            console.log(`🔄 Aplicando sustitución para Grupo 1`);
            const sustitucion = sustituciones[Math.floor(Math.random() * sustituciones.length)];
            console.log(`   📋 Sustitución: ${sustitucion.descripcion}`);
            
            for (let i = 0; i < sustitucion.grupos.length; i++) {
                const grupoId = sustitucion.grupos[i];
                const alimento = getAlimentoAleatorio(grupoId);
                if (alimento) {
                    const grupo = grupos.find(g => g.id === grupoId);
                    plato.push({
                        grupo: grupo.nombre,
                        alimento: alimento,
                        porcion: `${sustitucion.porciones[i]} porción`,
                        es_sustitucion: true,
                        sustituye_a: 'Grupo 1'
                    });
                    console.log(`   ✅ Sustituido: Grupo ${grupoId} - ${alimento}`);
                }
            }
        } else {
            const alimento = getAlimentoAleatorio(porcion.grupo_id);
            if (alimento) {
                const grupo = grupos.find(g => g.id === porcion.grupo_id);
                const porcionTexto = porcion.porciones === 1 ? '1 porción' : 
                                    porcion.porciones === 2 ? '2 porciones' : 
                                    porcion.porciones === 3 ? '3 porciones' : 'Porción';
                
                plato.push({
                    grupo: grupo.nombre,
                    alimento: alimento,
                    porcion: porcionTexto,
                    es_sustitucion: false
                });
                console.log(`   ✅ Agregado: ${grupo.nombre} - ${alimento} (${porcionTexto})`);
            }
        }
    }
    
    console.log(`✅ Plato generado con ${plato.length} alimentos`);
    console.log(`📋 Alimentos:`, plato.map(p => p.alimento.substring(0, 30) + '...'));
    
    return {
        tiempo_comida: tiempo.nombre,
        plato: plato,
        total_alimentos: plato.length,
        tiempo_id: tiempoId
    };
}

// Configurar Express
app.use(express.json());

// IMPORTANTE: CORREGIR RUTA DE ARCHIVOS ESTÁTICOS
// Para estructura: platos-app-desktop/backend/src/server.js
// frontend está en: platos-app-desktop/frontend/
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

// Configurar CORS para permitir todas las solicitudes
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Rutas
app.get('/api/tiempos', (req, res) => {
    console.log(`📋 GET /api/tiempos - Enviando ${tiempos.length} tiempos`);
    res.json(tiempos);
});

app.get('/api/plato/generar', (req, res) => {
    const tiempoId = parseInt(req.query.tiempo) || 1;
    
    console.log(`\n🎲 GET /api/plato/generar?tiempo=${tiempoId}`);
    console.log(`⏰ Tiempo solicitado: ${tiempos.find(t => t.id === tiempoId)?.nombre}`);
    
    if (tiempoId < 1 || tiempoId > 3) {
        console.log(`❌ Error: Tiempo ${tiempoId} inválido`);
        return res.status(400).json({ error: 'Tiempo debe ser 1, 2 o 3' });
    }
    
    const plato = generarPlato(tiempoId);
    console.log(`📤 Enviando plato con ${plato.plato.length} alimentos`);
    res.json(plato);
});

app.get('/api/plato/aleatorio', (req, res) => {
    const tiempoId = Math.floor(Math.random() * 3) + 1;
    console.log(`\n🎲 GET /api/plato/aleatorio - Tiempo aleatorio: ${tiempos.find(t => t.id === tiempoId)?.nombre}`);
    const plato = generarPlato(tiempoId);
    res.json(plato);
});

app.get('/api/estadisticas', (req, res) => {
    console.log(`📊 GET /api/estadisticas`);
    const totalComidas = Object.values(comidas).reduce((acc, arr) => acc + arr.length, 0);
    const stats = {
        total_comidas: totalComidas,
        total_grupos: grupos.length,
        total_tiempos: tiempos.length,
        total_sustituciones: sustituciones.length
    };
    console.log(`📈 Estadísticas:`, stats);
    res.json(stats);
});

// Ruta para verificar el servidor
app.get('/api/health', (req, res) => {
    console.log(`❤️ GET /api/health - Servidor funcionando`);
    res.json({ 
        status: 'ok', 
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// Ruta para ver datos de grupos
app.get('/api/grupos/:id/comidas', (req, res) => {
    const grupoId = parseInt(req.params.id);
    console.log(`🍎 GET /api/grupos/${grupoId}/comidas`);
    
    if (grupoId < 1 || grupoId > 6) {
        return res.status(400).json({ error: 'ID de grupo inválido' });
    }
    
    const alimentos = comidas[grupoId] || [];
    console.log(`📦 Enviando ${alimentos.length} alimentos del grupo ${grupoId}`);
    res.json(alimentos);
});

// Ruta principal - SERVIR index.html DESDE LA UBICACIÓN CORRECTA
app.get('/', (req, res) => {
    console.log(`🏠 GET / - Sirviendo página principal`);
    console.log(`🔍 Buscando index.html en: ${path.join(__dirname, '..', '..', 'frontend', 'index.html')}`);
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'index.html'));
});

// Ruta para cualquier otra petición
app.get('*', (req, res) => {
    console.log(`🔍 GET ${req.url} - Ruta no encontrada, redirigiendo a /`);
    res.redirect('/');
});

// Manejo de errores
app.use((err, req, res, next) => {
    console.error(`❌ ERROR:`, err.stack);
    res.status(500).json({ error: 'Error interno del servidor' });
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
    
    // Mostrar datos de ejemplo
    console.log(`🍎 EJEMPLO DE DATOS CARGADOS:`);
    grupos.forEach(grupo => {
        const count = comidas[grupo.id]?.length || 0;
        console.log(`   ${grupo.nombre}: ${count} alimentos`);
        if (count > 0) {
            console.log(`     Ejemplo: "${comidas[grupo.id][0].substring(0, 40)}..."`);
        }
    });
    console.log(`\n🔄 SUSTITUCIONES:`);
    sustituciones.forEach((s, i) => {
        console.log(`   ${i + 1}. ${s.descripcion}`);
        console.log(`     Grupos: ${s.grupos.join(', ')}`);
        console.log(`     Porciones: ${s.porciones.join(', ')}`);
    });
    console.log(`\n`);
    
    // Información adicional de rutas
    console.log(`📂 CONFIGURACIÓN DE RUTAS:`);
    console.log(`   Ubicación servidor: ${__dirname}`);
    console.log(`   Ruta frontend: ${path.join(__dirname, '..', '..', 'frontend')}`);
    console.log(`   Ruta index.html: ${path.join(__dirname, '..', '..', 'frontend', 'index.html')}`);
    console.log(`=========================================\n`);
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
    console.log('\n\n🔴 Recibida señal SIGINT. Cerrando servidor...');
    process.exit(0);
});