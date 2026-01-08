#!/usr/bin/env node

const { PlatosDatabase } = require('./src/database');
const path = require('path');
const fs = require('fs');

console.log('================================');
console.log('   INICIALIZADOR DE BASE DE DATOS');
console.log('   Generador de Platos Saludables');
console.log('================================\n');

try {
    // Crear instancia de la base de datos (esto inicializa todo)
    const db = new PlatosDatabase();
    
    console.log('✅ Base de datos inicializada correctamente\n');
    
    // Mostrar información detallada
    console.log('📊 INFORMACIÓN DE LA BASE DE DATOS:');
    console.log('====================================');
    
    // Obtener estadísticas
    const stats = db.obtenerEstadisticas();
    console.log(`   Total grupos: ${stats.total_grupos}`);
    console.log(`   Total comidas: ${stats.total_comidas}`);
    console.log(`   Total tiempos: ${stats.total_tiempos}`);
    console.log(`   Total reglas de sustitución: ${stats.total_sustituciones}\n`);
    
    // Mostrar grupos
    console.log('📋 GRUPOS ALIMENTICIOS:');
    console.log('========================');
    const grupos = db.getGrupos();
    grupos.forEach(grupo => {
        const comidas = db.getComidasPorGrupo(grupo.id);
        console.log(`   ${grupo.nombre}: ${comidas.length} alimentos`);
    });
    
    console.log('\n⏰ TIEMPOS DE COMIDA:');
    console.log('=====================');
    const tiempos = db.getTiempos();
    tiempos.forEach(tiempo => {
        const porciones = db.getPorcionesTiempo(tiempo.id);
        console.log(`   ${tiempo.nombre}: ${porciones.length} grupos con porciones definidas`);
    });
    
    console.log('\n🔄 SUSTITUCIONES DEL GRUPO 1:');
    console.log('=============================');
    const sustituciones = db.getSustitucionesGrupo1();
    sustituciones.forEach(regla => {
        console.log(`   ${regla.descripcion}: ${regla.sustitucion}`);
    });
    
    console.log('\n📍 UBICACIÓN DE LA BASE DE DATOS:');
    console.log('=================================');
    const dbPath = path.join(process.env.APPDATA || 
                            path.join(process.env.HOME, '.platos-app'), 
                            'platos.db');
    console.log(`   ${dbPath}`);
    console.log(`   Existe: ${fs.existsSync(dbPath) ? '✅ Sí' : '❌ No'}`);
    
    // Probar generación de platos
    console.log('\n🍽️  PRUEBA DE GENERACIÓN DE PLATOS:');
    console.log('==================================');
    
    for (let i = 1; i <= 3; i++) {
        const tiempo = tiempos.find(t => t.id === i);
        console.log(`\n   ${tiempo.nombre}:`);
        const plato = db.generarPlato(i, true);
        plato.plato.forEach((item, index) => {
            const tipo = item.es_sustitucion ? ' (Sustitución)' : 
                        item.es_complementario ? ' (Complementario)' : '';
            console.log(`     ${index + 1}. ${item.grupo}: ${item.alimento}${tipo}`);
        });
    }
    
    db.close();
    
    console.log('\n✅ Inicialización completada exitosamente');
    console.log('\n📝 Para usar la aplicación:');
    console.log('   1. Ejecuta: node src/server.js');
    console.log('   2. Abre: http://localhost:3000');
    console.log('   3. ¡Comienza a generar platos!');
    
} catch (error) {
    console.error('❌ Error durante la inicialización:', error.message);
    process.exit(1);
}