const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

class PlatosDatabase {
    constructor() {
        // Usar SQLite que es portable y no requiere instalación
        const dbPath = path.join(process.env.APPDATA || 
                                path.join(process.env.HOME, '.platos-app'), 
                                'platos.db');
        
        // Crear directorio si no existe
        const dbDir = path.dirname(dbPath);
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
        }
        
        this.db = new Database(dbPath);
        this.initDatabase();
    }

    initDatabase() {
        // Crear tablas según el nuevo script
        this.db.exec(`
            -- ============================================
            -- CREACIÓN DE TABLAS PRINCIPALES
            -- ============================================

            CREATE TABLE IF NOT EXISTS grupos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS tiempos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS comidas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nombre TEXT NOT NULL,
                grupo_id INTEGER,
                FOREIGN KEY (grupo_id) REFERENCES grupos(id)
            );

            -- ============================================
            -- TABLA PARA SUSTITUCIONES DEL GRUPO 1
            -- ============================================

            CREATE TABLE IF NOT EXISTS reglas_sustitucion (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                grupo_origen_id INTEGER NOT NULL,
                descripcion TEXT NOT NULL,
                FOREIGN KEY (grupo_origen_id) REFERENCES grupos(id)
            );

            CREATE TABLE IF NOT EXISTS sustituciones_detalle (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                regla_id INTEGER NOT NULL,
                grupo_sustituto_id INTEGER NOT NULL,
                porciones INTEGER DEFAULT 1,
                FOREIGN KEY (regla_id) REFERENCES reglas_sustitucion(id),
                FOREIGN KEY (grupo_sustituto_id) REFERENCES grupos(id),
                UNIQUE(regla_id, grupo_sustituto_id)
            );

            -- ============================================
            -- TABLA PARA PORCIONES POR TIEMPO (CORREGIDA)
            -- ============================================

            CREATE TABLE IF NOT EXISTS porciones_tiempo (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tiempo_id INTEGER NOT NULL,
                grupo_id INTEGER NOT NULL,
                porciones INTEGER DEFAULT 1,
                FOREIGN KEY (tiempo_id) REFERENCES tiempos(id),
                FOREIGN KEY (grupo_id) REFERENCES grupos(id),
                UNIQUE(tiempo_id, grupo_id)
            );

            -- ============================================
            -- ÍNDICES PARA MEJOR PERFORMANCE
            -- ============================================

            CREATE INDEX IF NOT EXISTS idx_comidas_grupo ON comidas(grupo_id);
            CREATE INDEX IF NOT EXISTS idx_porciones_tiempo_grupo ON porciones_tiempo(tiempo_id, grupo_id);
            CREATE INDEX IF NOT EXISTS idx_sustituciones_regla ON sustituciones_detalle(regla_id);
            CREATE INDEX IF NOT EXISTS idx_sustituciones_grupo ON sustituciones_detalle(grupo_sustituto_id);
        `);

        // Insertar datos iniciales si las tablas están vacías
        this.insertInitialData();
    }

    insertInitialData() {
        // Verificar si ya hay datos
        const gruposCount = this.db.prepare('SELECT COUNT(*) as count FROM grupos').get();
        
        if (gruposCount.count === 0) {
            console.log('Insertando datos iniciales...');
            
            // Insertar grupos
            const grupos = [
                'Grupo 1',
                'Grupo 2', 
                'Grupo 3',
                'Grupo 4',
                'Grupo 5',
                'Grupo 6'
            ];

            const insertGrupo = this.db.prepare('INSERT INTO grupos (nombre) VALUES (?)');
            grupos.forEach(grupo => insertGrupo.run(grupo));

            // Insertar tiempos
            const tiempos = ['Desayuno', 'Almuerzo', 'Cena'];
            const insertTiempo = this.db.prepare('INSERT INTO tiempos (nombre) VALUES (?)');
            tiempos.forEach(tiempo => insertTiempo.run(tiempo));

            // Insertar porciones por tiempo (Dieta 1500 calorías)
            const porciones = [
                // Desayuno
                [1, 1, 1], [1, 2, 1], [1, 3, 1], [1, 4, 2], [1, 5, 1], [1, 6, 1],
                // Almuerzo
                [2, 2, 2], [2, 3, 1], [2, 4, 3], [2, 5, 1], [2, 6, 1],
                // Cena
                [3, 2, 1], [3, 3, 1], [3, 4, 2], [3, 5, 1], [3, 6, 1]
            ];

            const insertPorcion = this.db.prepare(
                'INSERT INTO porciones_tiempo (tiempo_id, grupo_id, porciones) VALUES (?, ?, ?)'
            );
            porciones.forEach(p => insertPorcion.run(p[0], p[1], p[2]));

            // Insertar sustituciones del Grupo 1
            const insertRegla = this.db.prepare(
                'INSERT INTO reglas_sustitucion (grupo_origen_id, descripcion) VALUES (?, ?)'
            );
            
            const regla1 = insertRegla.run(1, 'Sustitución por Grupo 2 + Grupo 3');
            const regla2 = insertRegla.run(1, 'Sustitución por Grupo 2 + Grupo 4');

            const insertDetalle = this.db.prepare(
                'INSERT INTO sustituciones_detalle (regla_id, grupo_sustituto_id, porciones) VALUES (?, ?, ?)'
            );
            
            // Detalles de la primera regla (Grupo 2 + Grupo 3)
            insertDetalle.run(1, 2, 1);
            insertDetalle.run(1, 3, 1);
            
            // Detalles de la segunda regla (Grupo 2 + Grupo 4)
            insertDetalle.run(2, 2, 1);
            insertDetalle.run(2, 4, 1);

            // Insertar comidas (alimentos)
            const comidas = this.getComidasData();
            const insertComida = this.db.prepare(
                'INSERT INTO comidas (nombre, grupo_id) VALUES (?, ?)'
            );
            
            comidas.forEach(comida => {
                if (comida.grupo_id >= 1 && comida.grupo_id <= 6) {
                    insertComida.run(comida.nombre, comida.grupo_id);
                }
            });

            console.log('Datos iniciales insertados correctamente');
        }
    }

    getComidasData() {
        return [
            // Grupo 1
            {nombre: 'una taza de leche descremada', grupo_id: 1},
            {nombre: 'un vasito de yogurt Light', grupo_id: 1},
            {nombre: 'media taza de leche evaporada', grupo_id: 1},
            {nombre: 'cucharada y media de leche en polvo', grupo_id: 1},
            
            // Grupo 2
            {nombre: 'una onza de carne de res con grasa', grupo_id: 2},
            {nombre: 'dos onzas de carne de res magra', grupo_id: 2},
            {nombre: 'dos onzas de carne de pollo sin piel', grupo_id: 2},
            {nombre: 'una onza de pato sin piel', grupo_id: 2},
            {nombre: 'dos onzas de pavo sin piel', grupo_id: 2},
            {nombre: 'una onza de cerdo con grasa', grupo_id: 2},
            {nombre: 'dos onzas de cerdo sin grasa', grupo_id: 2},
            {nombre: 'una onza de ternera', grupo_id: 2},
            {nombre: 'dos rebanadas pequeñas de jamón', grupo_id: 2},
            {nombre: 'una onza de lengua', grupo_id: 2},
            {nombre: 'media salchicha mediana', grupo_id: 2},
            {nombre: 'dos onzas de pescado', grupo_id: 2},
            {nombre: 'dos camarones medianos', grupo_id: 2},
            {nombre: 'dos onzas de langosta', grupo_id: 2},
            {nombre: 'un cuarto de lata de atún en agua', grupo_id: 2},
            {nombre: 'media taza de carne de cangrejo', grupo_id: 2},
            {nombre: 'dos sardinas grandes', grupo_id: 2},
            {nombre: 'cinco ostras', grupo_id: 2},
            {nombre: 'cinco conchas', grupo_id: 2},
            {nombre: 'una onza de queso fresco', grupo_id: 2},
            {nombre: 'dos cucharadas de requesón', grupo_id: 2},
            {nombre: 'una y media rebanada de queso Kraft', grupo_id: 2},
            {nombre: 'una onza de queso parmesano', grupo_id: 2},
            {nombre: 'una onza de queso mozzarella', grupo_id: 2},
            {nombre: 'dos cucharadas de queso cottage', grupo_id: 2},
            {nombre: 'una onza de queso capa roja', grupo_id: 2},
            {nombre: 'una onza de queso roquefort', grupo_id: 2},
            {nombre: 'una onza de queso suizo', grupo_id: 2},
            {nombre: 'dos claras de huevo', grupo_id: 2},
            
            // Grupo 3
            {nombre: 'una manzana mediana', grupo_id: 3},
            {nombre: 'una naranja mediana', grupo_id: 3},
            {nombre: 'una mandarina mediana', grupo_id: 3},
            {nombre: 'media toronja mediana', grupo_id: 3},
            {nombre: 'un mango pequeño', grupo_id: 3},
            {nombre: 'una jícama pequeña', grupo_id: 3},
            {nombre: 'una lima', grupo_id: 3},
            {nombre: 'una pera pequeña', grupo_id: 3},
            {nombre: 'un higo fresco grande', grupo_id: 3},
            {nombre: 'dos guayabas', grupo_id: 3},
            {nombre: 'medio guineo de 15 cm', grupo_id: 3},
            {nombre: 'un cuarto de zapote', grupo_id: 3},
            {nombre: 'diez cerezas', grupo_id: 3},
            {nombre: 'una taza de fresas', grupo_id: 3},
            {nombre: 'dos ciruelas frescas', grupo_id: 3},
            {nombre: 'quince uvas pequeñas', grupo_id: 3},
            {nombre: 'doce uvas grandes', grupo_id: 3},
            {nombre: 'una rebanada de sandía', grupo_id: 3},
            {nombre: 'una rebanada de piña', grupo_id: 3},
            {nombre: 'una rebanada de melón', grupo_id: 3},
            {nombre: 'tres jocotes', grupo_id: 3},
            {nombre: 'un marañón mediano', grupo_id: 3},
            {nombre: 'tres marañones japoneses pequeños', grupo_id: 3},
            {nombre: '40 nances', grupo_id: 3},
            {nombre: 'un durazno grande', grupo_id: 3},
            {nombre: 'un melocotón pequeño', grupo_id: 3},
            {nombre: 'un kivi', grupo_id: 3},
            {nombre: '¼ anona', grupo_id: 3},
            {nombre: '2 higos frescos pequeños', grupo_id: 3},
            {nombre: 'dos ciruelas pasas', grupo_id: 3},
            {nombre: '¼ de mamey mediano', grupo_id: 3},
            {nombre: '12 manrones (talpajocotes)', grupo_id: 3},
            {nombre: '1/3 rebanada de papaya', grupo_id: 3},
            {nombre: 'media taza pequeña de jugo de naranja, piña, manzana, uvas o toronja', grupo_id: 3},
            {nombre: 'una taza de jugo de tomate', grupo_id: 3},
            
            // Grupo 4
            {nombre: 'una rebanada de pan de caja', grupo_id: 4},
            {nombre: 'una tortilla pequeña', grupo_id: 4},
            {nombre: 'un pan francés pequeño', grupo_id: 4},
            {nombre: 'una rebanada de pan integral', grupo_id: 4},
            {nombre: 'medio pan pita (pizza)', grupo_id: 4},
            {nombre: 'tres cucharadas de arroz', grupo_id: 4},
            {nombre: 'un pancake mediano', grupo_id: 4},
            {nombre: 'dos cucharadas de frijoles', grupo_id: 4},
            {nombre: 'una papa mediana', grupo_id: 4},
            {nombre: 'tres cucharadas de puré de papas', grupo_id: 4},
            {nombre: 'tres cuarto de taza de Corn Flakes u otro cereal sin azúcar', grupo_id: 4},
            {nombre: 'tres cucharadas de avena cocida', grupo_id: 4},
            {nombre: 'tres cucharadas de garbanzos', grupo_id: 4},
            {nombre: 'cuatro galletas de soda', grupo_id: 4},
            {nombre: '½ taza de yuca', grupo_id: 4},
            {nombre: '½ taza de camote', grupo_id: 4},
            {nombre: 'media taza de fideos cocidos', grupo_id: 4},
            {nombre: 'dos cucharadas de harina', grupo_id: 4},
            {nombre: 'dos cucharadas de maicena', grupo_id: 4},
            {nombre: 'una taza de lorocos', grupo_id: 4},
            {nombre: 'una taza de arverjas', grupo_id: 4},
            {nombre: 'una taza de frijol de soya', grupo_id: 4},
            {nombre: 'un chile verde mediano', grupo_id: 4},
            
            // Grupo 5
            {nombre: '1/4 de remolacha pequeña', grupo_id: 5},
            {nombre: '1/3 de plátano', grupo_id: 5},
            {nombre: '½ taza de zanahoria', grupo_id: 5},
            {nombre: '½ taza de col de bruselas', grupo_id: 5},
            {nombre: '½ taza de ejotes', grupo_id: 5},
            {nombre: '½ taza de cebolla', grupo_id: 5},
            {nombre: '½ taza de nabos', grupo_id: 5},
            {nombre: '½ taza de brócoli', grupo_id: 5},
            {nombre: '½ taza de tomates', grupo_id: 5},
            {nombre: '½ taza de puerros', grupo_id: 5},
            {nombre: '½ taza de maíz dulce', grupo_id: 5},
            {nombre: 'una taza de chilacayote', grupo_id: 5},
            {nombre: 'una taza de acelga', grupo_id: 5},
            {nombre: 'una taza de apio', grupo_id: 5},
            {nombre: 'una taza de berenjena', grupo_id: 5},
            {nombre: 'una taza de berro', grupo_id: 5},
            {nombre: 'una taza de coliflor', grupo_id: 5},
            {nombre: 'una taza de guizayote', grupo_id: 5},
            {nombre: 'una taza de guisquil', grupo_id: 5},
            {nombre: 'una taza de espinaca', grupo_id: 5},
            {nombre: 'una taza de espárragos', grupo_id: 5},
            {nombre: 'una taza de hongos', grupo_id: 5},
            {nombre: 'una taza de lechuga', grupo_id: 5},
            {nombre: 'una taza de pepino', grupo_id: 5},
            {nombre: 'una taza de rábano', grupo_id: 5},
            {nombre: 'una taza de verdolaga', grupo_id: 5},
            {nombre: 'una taza de flor de isote', grupo_id: 5},
            
            // Grupo 6
            {nombre: 'una cucharadita de aceite', grupo_id: 6},
            {nombre: 'una cucharadita de crema', grupo_id: 6},
            {nombre: 'una cucharadita de mantequilla', grupo_id: 6},
            {nombre: 'una cucharadita de manteca', grupo_id: 6},
            {nombre: 'una cucharadita de margarina', grupo_id: 6},
            {nombre: 'una cucharadita de mayonesa', grupo_id: 6},
            {nombre: 'una cucharadita de queso de mantequilla', grupo_id: 6},
            {nombre: 'una cucharadita de aderezo de ensalada', grupo_id: 6},
            {nombre: 'una cucharadita de aceite de oliva', grupo_id: 6},
            {nombre: 'un cuarto de aguacate pequeño', grupo_id: 6},
            {nombre: 'una tira de tocino', grupo_id: 6},
            {nombre: 'seis aceitunas verdes medianas', grupo_id: 6}
        ];
    }

    // Métodos para obtener datos
    getTiempos() {
        return this.db.prepare('SELECT * FROM tiempos ORDER BY id').all();
    }

    getGrupos() {
        return this.db.prepare('SELECT * FROM grupos ORDER BY id').all();
    }

    getComidasPorGrupo(grupoId) {
        return this.db.prepare('SELECT * FROM comidas WHERE grupo_id = ? ORDER BY nombre').all(grupoId);
    }

    getPorcionesTiempo(tiempoId) {
        return this.db.prepare(`
            SELECT g.id as grupo_id, g.nombre as grupo_nombre, pt.porciones
            FROM porciones_tiempo pt
            JOIN grupos g ON pt.grupo_id = g.id
            WHERE pt.tiempo_id = ? AND pt.porciones > 0
            ORDER BY g.id
        `).all(tiempoId);
    }

    getComidaAleatoria(grupoId) {
        const comidas = this.db.prepare('SELECT * FROM comidas WHERE grupo_id = ?').all(grupoId);
        if (comidas.length === 0) return null;
        return comidas[Math.floor(Math.random() * comidas.length)];
    }

    getTiempoById(tiempoId) {
        return this.db.prepare('SELECT * FROM tiempos WHERE id = ?').get(tiempoId);
    }

    getSustitucionesGrupo1() {
        return this.db.prepare(`
            SELECT 
                r.id as regla_id,
                r.descripcion,
                GROUP_CONCAT(g.nombre || ' (' || sd.porciones || ' porción)', ' + ') as sustitucion
            FROM reglas_sustitucion r
            JOIN sustituciones_detalle sd ON r.id = sd.regla_id
            JOIN grupos g ON sd.grupo_sustituto_id = g.id
            WHERE r.grupo_origen_id = 1
            GROUP BY r.id, r.descripcion
        `).all();
    }

    aplicarSustitucionGrupo1(grupoId) {
        // Obtener una regla de sustitución aleatoria para el Grupo 1
        const reglas = this.db.prepare(`
            SELECT sd.grupo_sustituto_id, sd.porciones
            FROM reglas_sustitucion r
            JOIN sustituciones_detalle sd ON r.id = sd.regla_id
            WHERE r.grupo_origen_id = ?
        `).all(grupoId);
        
        return reglas;
    }

    // Método para generar plato con sustituciones
    generarPlato(tiempoId, aplicarSustituciones = true) {
        const tiempo = this.getTiempoById(tiempoId);
        if (!tiempo) {
            throw new Error('Tiempo no encontrado');
        }

        const porciones = this.getPorcionesTiempo(tiempoId);
        const plato = [];
        const gruposUsados = new Set();

        for (const porcion of porciones) {
            // Verificar si es Grupo 1 y si debemos aplicar sustitución
            if (porcion.grupo_id === 1 && aplicarSustituciones) {
                const sustituciones = this.aplicarSustitucionGrupo1(1);
                
                for (const sustitucion of sustituciones) {
                    const comida = this.getComidaAleatoria(sustitucion.grupo_sustituto_id);
                    if (comida) {
                        const grupo = this.db.prepare(
                            'SELECT nombre FROM grupos WHERE id = ?'
                        ).get(sustitucion.grupo_sustituto_id);
                        
                        plato.push({
                            grupo: grupo.nombre,
                            alimento: comida.nombre,
                            porcion: `Sustitución (${sustitucion.porciones} porción)`,
                            es_sustitucion: true,
                            grupo_original: 'Grupo 1'
                        });
                        gruposUsados.add(sustitucion.grupo_sustituto_id);
                    }
                }
            } else {
                const comida = this.getComidaAleatoria(porcion.grupo_id);
                if (comida) {
                    plato.push({
                        grupo: porcion.grupo_nombre,
                        alimento: comida.nombre,
                        porcion: porcion.porciones === 1 ? '1 porción' : 
                                 porcion.porciones === 2 ? '2 porciones' : 
                                 porcion.porciones === 3 ? '3 porciones' : 'Porción',
                        es_sustitucion: false
                    });
                    gruposUsados.add(porcion.grupo_id);
                }
            }
        }

        // Verificar que todos los grupos necesarios estén incluidos
        const gruposRequeridos = porciones.map(p => p.grupo_id);
        for (const grupoId of gruposRequeridos) {
            if (!gruposUsados.has(grupoId) && grupoId !== 1) {
                const comidaExtra = this.getComidaAleatoria(grupoId);
                if (comidaExtra) {
                    const grupo = this.db.prepare(
                        'SELECT nombre FROM grupos WHERE id = ?'
                    ).get(grupoId);
                    
                    plato.push({
                        grupo: grupo.nombre,
                        alimento: comidaExtra.nombre,
                        porcion: 'Porción adicional',
                        es_complementario: true
                    });
                }
            }
        }

        return {
            tiempo_comida: tiempo.nombre,
            plato: plato,
            total_porciones: plato.length,
            mensaje: plato.length >= 4 ? 'Plato generado exitosamente' : 
                     'Plato generado con los alimentos disponibles'
        };
    }

    // Métodos para administración
    agregarComida(nombre, grupoId) {
        const stmt = this.db.prepare('INSERT INTO comidas (nombre, grupo_id) VALUES (?, ?)');
        const result = stmt.run(nombre, grupoId);
        return result.lastInsertRowid;
    }

    obtenerEstadisticas() {
        const stats = this.db.prepare(`
            SELECT 
                (SELECT COUNT(*) FROM comidas) as total_comidas,
                (SELECT COUNT(*) FROM grupos) as total_grupos,
                (SELECT COUNT(*) FROM tiempos) as total_tiempos,
                (SELECT COUNT(*) FROM reglas_sustitucion) as total_sustituciones
        `).get();
        return stats;
    }

    close() {
        this.db.close();
    }
}

// Singleton para la base de datos
let databaseInstance = null;

function getDatabase() {
    if (!databaseInstance) {
        databaseInstance = new PlatosDatabase();
    }
    return databaseInstance;
}

module.exports = { PlatosDatabase, getDatabase };