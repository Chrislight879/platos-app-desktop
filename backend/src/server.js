const app = require('./app');
require('./database'); // Inicializar conexión a DB

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📋 Accede a la aplicación en tu navegador`);
    console.log(`🕒 Para detener el servidor, presiona Ctrl+C`);
});