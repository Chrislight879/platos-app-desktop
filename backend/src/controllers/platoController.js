const { getDatabase } = require('../database');

class PlatoController {
    // Obtener todos los tiempos de comida
    static getTiempos(req, res) {
        try {
            const db = getDatabase();
            const tiempos = db.getTiempos();
            res.json(tiempos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Obtener todos los grupos
    static getGrupos(req, res) {
        try {
            const db = getDatabase();
            const grupos = db.getGrupos();
            res.json(grupos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Obtener comidas por grupo
    static getComidasPorGrupo(req, res) {
        try {
            const grupoId = parseInt(req.params.id);
            if (isNaN(grupoId) || grupoId < 1 || grupoId > 6) {
                return res.status(400).json({ error: 'ID de grupo inválido' });
            }

            const db = getDatabase();
            const comidas = db.getComidasPorGrupo(grupoId);
            res.json(comidas);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Generar plato
    static generarPlato(req, res) {
        try {
            const tiempoId = parseInt(req.query.tiempo) || 1;
            const aplicarSustituciones = req.query.sustituciones !== 'false';
            
            if (tiempoId < 1 || tiempoId > 3) {
                return res.status(400).json({ error: 'Tiempo debe ser 1, 2 o 3' });
            }

            const db = getDatabase();
            const plato = db.generarPlato(tiempoId, aplicarSustituciones);
            
            // Agregar información nutricional estimada
            const infoNutricional = PlatoController.calcularInfoNutricional(plato);
            plato.info_nutricional = infoNutricional;
            
            res.json(plato);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Generar plato aleatorio
    static generarPlatoAleatorio(req, res) {
        try {
            const tiempoId = Math.floor(Math.random() * 3) + 1;
            const aplicarSustituciones = Math.random() > 0.5;
            
            const db = getDatabase();
            const plato = db.generarPlato(tiempoId, aplicarSustituciones);
            
            // Agregar información nutricional estimada
            const infoNutricional = PlatoController.calcularInfoNutricional(plato);
            plato.info_nutricional = infoNutricional;
            
            res.json(plato);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Obtener sustituciones del Grupo 1
    static getSustitucionesGrupo1(req, res) {
        try {
            const db = getDatabase();
            const sustituciones = db.getSustitucionesGrupo1();
            res.json(sustituciones);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Agregar nueva comida
    static agregarComida(req, res) {
        try {
            const { nombre, grupo_id } = req.body;
            
            if (!nombre || !grupo_id) {
                return res.status(400).json({ 
                    error: 'Nombre y grupo_id son requeridos' 
                });
            }

            if (grupo_id < 1 || grupo_id > 6) {
                return res.status(400).json({ 
                    error: 'grupo_id debe estar entre 1 y 6' 
                });
            }

            const db = getDatabase();
            const id = db.agregarComida(nombre, grupo_id);
            
            res.json({ 
                id, 
                nombre, 
                grupo_id, 
                message: 'Comida agregada correctamente' 
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Obtener estadísticas
    static getEstadisticas(req, res) {
        try {
            const db = getDatabase();
            const stats = db.obtenerEstadisticas();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Calcular información nutricional estimada
    static calcularInfoNutricional(plato) {
        // Valores nutricionales estimados por grupo
        const valoresPorGrupo = {
            1: { calorias: 80, proteinas: 8, carbohidratos: 12, grasas: 0 }, // Lácteos
            2: { calorias: 70, proteinas: 7, carbohidratos: 0, grasas: 5 },   // Proteínas
            3: { calorias: 60, proteinas: 1, carbohidratos: 15, grasas: 0 },  // Frutas
            4: { calorias: 70, proteinas: 2, carbohidratos: 15, grasas: 0 },  // Cereales
            5: { calorias: 25, proteinas: 2, carbohidratos: 5, grasas: 0 },   // Verduras
            6: { calorias: 45, proteinas: 0, carbohidratos: 0, grasas: 5 }    // Grasas
        };

        let total = { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };
        
        // Contar ocurrencias de cada grupo en el plato
        const conteoGrupos = {};
        plato.plato.forEach(item => {
            // Determinar grupo basado en el nombre del grupo
            const grupoMatch = item.grupo.match(/Grupo (\d)/);
            if (grupoMatch) {
                const grupoId = parseInt(grupoMatch[1]);
                conteoGrupos[grupoId] = (conteoGrupos[grupoId] || 0) + 1;
            }
        });

        // Sumar valores nutricionales
        for (const [grupoId, cantidad] of Object.entries(conteoGrupos)) {
            if (valoresPorGrupo[grupoId]) {
                total.calorias += valoresPorGrupo[grupoId].calorias * cantidad;
                total.proteinas += valoresPorGrupo[grupoId].proteinas * cantidad;
                total.carbohidratos += valoresPorGrupo[grupoId].carbohidratos * cantidad;
                total.grasas += valoresPorGrupo[grupoId].grasas * cantidad;
            }
        }

        return total;
    }
}

module.exports = PlatoController;