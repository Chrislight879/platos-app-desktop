const { query, get } = require('../database');

class PlatoController {
    // Obtener plato aleatorio para un tiempo específico
    static async generarPlato(tiempoId) {
        try {
            // Obtener las porciones requeridas para este tiempo
            const porciones = await query(
                'SELECT g.id as grupo_id, g.nombre as grupo_nombre, pt.porciones ' +
                'FROM porciones_tiempo pt ' +
                'JOIN grupos g ON pt.grupo_id = g.id ' +
                'WHERE pt.tiempo_id = ? ' +
                'ORDER BY g.id',
                [tiempoId]
            );
            
            const plato = {
                tiempo: '',
                alimentos: [],
                totalPorciones: 0
            };
            
            // Obtener nombre del tiempo
            const tiempo = await get('SELECT nombre FROM tiempos WHERE id = ?', [tiempoId]);
            plato.tiempo = tiempo.nombre;
            
            // Para cada grupo, obtener alimentos aleatorios según las porciones requeridas
            for (const porcion of porciones) {
                const grupoId = porcion.grupo_id;
                const cantidad = porcion.porciones;
                
                // Si es Grupo 1, verificar si el usuario quiere sustitución
                if (grupoId === 1) {
                    // 50% de probabilidad de usar sustitución
                    const usarSustitucion = Math.random() > 0.5;
                    
                    if (usarSustitucion) {
                        // Obtener una regla de sustitución aleatoria
                        const sustituciones = await query(
                            'SELECT r.id, r.descripcion ' +
                            'FROM reglas_sustitucion r ' +
                            'WHERE r.grupo_origen_id = ?',
                            [grupoId]
                        );
                        
                        if (sustituciones.length > 0) {
                            const reglaAleatoria = sustituciones[Math.floor(Math.random() * sustituciones.length)];
                            
                            // Obtener los detalles de la sustitución
                            const detalles = await query(
                                'SELECT sd.grupo_sustituto_id, sd.porciones, g.nombre as grupo_nombre ' +
                                'FROM sustituciones_detalle sd ' +
                                'JOIN grupos g ON sd.grupo_sustituto_id = g.id ' +
                                'WHERE sd.regla_id = ?',
                                [reglaAleatoria.id]
                            );
                            
                            // Para cada grupo sustituto, obtener alimentos
                            for (const detalle of detalles) {
                                const alimentos = await this.obtenerAlimentosAleatorios(detalle.grupo_sustituto_id, detalle.porciones);
                                plato.alimentos.push(...alimentos.map(a => ({
                                    ...a,
                                    es_sustitucion: true,
                                    grupo_original: 'Grupo 1',
                                    regla_sustitucion: reglaAleatoria.descripcion
                                })));
                                plato.totalPorciones += detalle.porciones;
                            }
                            continue;
                        }
                    }
                }
                
                // Obtener alimentos normales para este grupo
                const alimentos = await this.obtenerAlimentosAleatorios(grupoId, cantidad);
                plato.alimentos.push(...alimentos);
                plato.totalPorciones += cantidad;
            }
            
            return plato;
            
        } catch (error) {
            console.error('Error en generarPlato:', error);
            throw error;
        }
    }
    
    // Obtener alimentos aleatorios de un grupo específico
    static async obtenerAlimentosAleatorios(grupoId, cantidad) {
        try {
            // Obtener todos los alimentos del grupo
            const alimentos = await query(
                'SELECT id, nombre, grupo_id FROM comidas WHERE grupo_id = ?',
                [grupoId]
            );
            
            // Si hay menos alimentos que la cantidad requerida, seleccionar con repetición
            const seleccionados = [];
            
            for (let i = 0; i < cantidad; i++) {
                if (alimentos.length === 0) {
                    break;
                }
                
                const indiceAleatorio = Math.floor(Math.random() * alimentos.length);
                const alimento = alimentos[indiceAleatorio];
                
                seleccionados.push({
                    id: alimento.id,
                    nombre: alimento.nombre,
                    grupo_id: alimento.grupo_id,
                    es_sustitucion: false
                });
                
                // Si queremos evitar repeticiones, podemos comentar esta línea:
                // alimentos.splice(indiceAleatorio, 1);
            }
            
            return seleccionados;
            
        } catch (error) {
            console.error('Error en obtenerAlimentosAleatorios:', error);
            return [];
        }
    }
    
    // Obtener todos los tiempos disponibles
    static async obtenerTiempos() {
        try {
            return await query('SELECT id, nombre FROM tiempos ORDER BY id');
        } catch (error) {
            console.error('Error en obtenerTiempos:', error);
            return [];
        }
    }
    
    // Obtener estadísticas
    static async obtenerEstadisticas() {
        try {
            const totalAlimentos = await get('SELECT COUNT(*) as total FROM comidas');
            const totalPorGrupo = await query(
                'SELECT g.nombre, COUNT(c.id) as total ' +
                'FROM grupos g LEFT JOIN comidas c ON g.id = c.grupo_id ' +
                'GROUP BY g.id, g.nombre ' +
                'ORDER BY g.id'
            );
            
            return {
                totalAlimentos: totalAlimentos.total,
                porGrupo: totalPorGrupo
            };
        } catch (error) {
            console.error('Error en obtenerEstadisticas:', error);
            return { totalAlimentos: 0, porGrupo: [] };
        }
    }
    
    // Insertar alimentos (para poblar la base de datos)
    static async insertarAlimentos(alimentos) {
        try {
            for (const alimento of alimentos) {
                await query(
                    'INSERT OR IGNORE INTO comidas (nombre, grupo_id) VALUES (?, ?)',
                    [alimento.nombre, alimento.grupo_id]
                );
            }
            return { success: true, message: 'Alimentos insertados correctamente' };
        } catch (error) {
            console.error('Error en insertarAlimentos:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = PlatoController;