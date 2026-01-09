const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'dieta.db');

// Eliminar base de datos existente
if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log('Base de datos anterior eliminada');
}

const db = new sqlite3.Database(dbPath);

// Crear tablas
db.serialize(() => {
    console.log('Creando base de datos...');
    
    // Tabla grupos
    db.run(`CREATE TABLE grupos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
    )`);
    
    // Tabla tiempos
    db.run(`CREATE TABLE tiempos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL
    )`);
    
    // Tabla comidas
    db.run(`CREATE TABLE comidas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        grupo_id INTEGER,
        FOREIGN KEY (grupo_id) REFERENCES grupos(id)
    )`);
    
    // Tabla reglas_sustitucion
    db.run(`CREATE TABLE reglas_sustitucion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        grupo_origen_id INTEGER NOT NULL,
        descripcion TEXT NOT NULL,
        FOREIGN KEY (grupo_origen_id) REFERENCES grupos(id)
    )`);
    
    // Tabla sustituciones_detalle
    db.run(`CREATE TABLE sustituciones_detalle (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        regla_id INTEGER NOT NULL,
        grupo_sustituto_id INTEGER NOT NULL,
        porciones INTEGER DEFAULT 1,
        FOREIGN KEY (regla_id) REFERENCES reglas_sustitucion(id),
        FOREIGN KEY (grupo_sustituto_id) REFERENCES grupos(id),
        UNIQUE(regla_id, grupo_sustituto_id)
    )`);
    
    // Tabla porciones_tiempo
    db.run(`CREATE TABLE porciones_tiempo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tiempo_id INTEGER NOT NULL,
        grupo_id INTEGER NOT NULL,
        porciones INTEGER DEFAULT 1,
        FOREIGN KEY (tiempo_id) REFERENCES tiempos(id),
        FOREIGN KEY (grupo_id) REFERENCES grupos(id),
        UNIQUE(tiempo_id, grupo_id)
    )`);
    
    console.log('Tablas creadas...');
    
    // Insertar datos
    const insertData = () => {
        // Insertar grupos
        const grupos = [
            ['Grupo 1'],
            ['Grupo 2'],
            ['Grupo 3'],
            ['Grupo 4'],
            ['Grupo 5'],
            ['Grupo 6']
        ];
        
        const insertGrupo = db.prepare('INSERT INTO grupos (nombre) VALUES (?)');
        grupos.forEach(grupo => {
            insertGrupo.run(grupo);
        });
        insertGrupo.finalize();
        
        // Insertar tiempos
        const tiempos = [
            ['Desayuno'],
            ['Almuerzo'],
            ['Cena']
        ];
        
        const insertTiempo = db.prepare('INSERT INTO tiempos (nombre) VALUES (?)');
        tiempos.forEach(tiempo => {
            insertTiempo.run(tiempo);
        });
        insertTiempo.finalize();
        
        // Insertar porciones por tiempo (Dieta 1500 calorías)
        const porciones = [
            // Desayuno
            [1, 1, 1], [1, 2, 1], [1, 3, 1], [1, 4, 2], [1, 5, 1], [1, 6, 1],
            // Almuerzo
            [2, 2, 2], [2, 3, 1], [2, 4, 3], [2, 5, 1], [2, 6, 1],
            // Cena
            [3, 2, 1], [3, 3, 1], [3, 4, 2], [3, 5, 1], [3, 6, 1]
        ];
        
        const insertPorcion = db.prepare('INSERT INTO porciones_tiempo (tiempo_id, grupo_id, porciones) VALUES (?, ?, ?)');
        porciones.forEach(porcion => {
            insertPorcion.run(porcion);
        });
        insertPorcion.finalize();
        
        // Insertar sustituciones del Grupo 1
        db.run("INSERT INTO reglas_sustitucion (grupo_origen_id, descripcion) VALUES (1, 'Sustitución por Grupo 2 + Grupo 3')");
        db.run("INSERT INTO reglas_sustitucion (grupo_origen_id, descripcion) VALUES (1, 'Sustitución por Grupo 2 + Grupo 4')");
        
        // Obtener IDs de las reglas recién insertadas
        db.get("SELECT last_insert_rowid() as id", (err, row) => {
            const regla1Id = row.id - 1;
            const regla2Id = row.id;
            
            // Detalles de sustituciones
            db.run(`INSERT INTO sustituciones_detalle (regla_id, grupo_sustituto_id, porciones) VALUES (${regla1Id}, 2, 1)`);
            db.run(`INSERT INTO sustituciones_detalle (regla_id, grupo_sustituto_id, porciones) VALUES (${regla1Id}, 3, 1)`);
            db.run(`INSERT INTO sustituciones_detalle (regla_id, grupo_sustituto_id, porciones) VALUES (${regla2Id}, 2, 1)`);
            db.run(`INSERT INTO sustituciones_detalle (regla_id, grupo_sustituto_id, porciones) VALUES (${regla2Id}, 4, 1)`);
        });
        
        console.log('Datos básicos insertados...');
        console.log('¡Base de datos inicializada correctamente!');
    };
    
    // Pequeño delay para asegurar que las tablas se crearon
    setTimeout(insertData, 100);
});

db.close();