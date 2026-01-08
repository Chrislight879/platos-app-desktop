const app = require('./app');
const { getDatabase } = require('./database');

const PORT = process.env.PORT || 3000;

// Inicializar base de datos
try {
    const db = getDatabase();
    console.log('✅ Base de datos inicializada correctamente');
    
    // Mostrar estadísticas iniciales
    const stats = db.obtenerEstadisticas();
    console.log('📊 Estadísticas iniciales:');
    console.log(`   Total comidas: ${stats.total_comidas}`);
    console.log(`   Total grupos: ${stats.total_grupos}`);
    console.log(`   Total tiempos: ${stats.total_tiempos}`);
    console.log(`   Total sustituciones: ${stats.total_sustituciones}`);
    
} catch (error) {
    console.error('❌ Error al inicializar base de datos:', error);
    process.exit(1);
}

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`);
    console.log(`🌐 Frontend disponible en: http://localhost:${PORT}`);
    console.log(`📡 API disponible en: http://localhost:${PORT}/api`);
    console.log(`📁 Base de datos: ${process.env.APPDATA || process.env.HOME}/.platos-app/platos.db`);
    console.log('\n📋 Endpoints disponibles:');
    console.log('   GET  /api/health');
    console.log('   GET  /api/tiempos');
    console.log('   GET  /api/grupos');
    console.log('   GET  /api/grupos/:id/comidas');
    console.log('   GET  /api/plato/generar?tiempo=1&sustituciones=true');
    console.log('   GET  /api/plato/aleatorio');
    console.log('   GET  /api/sustituciones/grupo1');
    console.log('   POST /api/comidas');
    console.log('   GET  /api/estadisticas');
});

// Manejar cierre elegante
process.on('SIGINT', () => {
    console.log('\n🔴 Recibida señal SIGINT. Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('\n🔴 Recibida señal SIGTERM. Cerrando servidor...');
    server.close(() => {
        console.log('✅ Servidor cerrado correctamente');
        process.exit(0);
    });
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
    console.error('❌ Error no capturado:', error);
    server.close(() => {
        process.exit(1);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promesa rechazada no manejada:', reason);
});