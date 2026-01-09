GENERADOR DE PLATOS SALUDABLES
===============================

Aplicación web para generar platos de comida aleatorios según tiempo de comida
y grupos alimenticios, con opciones de sustitución.

🎯 CARACTERÍSTICAS
- Genera platos balanceados para desayuno, almuerzo y cena
- Sustituciones automáticas del grupo lácteos
- Sistema de reemplazo de alimentos
- Interfaz web moderna y responsive
- Logs detallados del servidor

📁 ESTRUCTURA DE CARPETAS
platos-app-desktop/
├── backend/
│   ├── src/
│   │   └── server.js      (servidor Node.js)
│   └── package.json       (dependencias)
├── frontend/
│   ├── index.html         (página principal)
│   ├── style.css          (estilos)
│   └── script.js          (lógica del frontend)
├── run-server.bat         (iniciar servidor)
├── install.bat            (solo instalación)
└── README.txt             (este archivo)

🚀 INSTRUCCIONES DE USO

1. PRIMERA EJECUCIÓN:
   - Ejecuta 'run-server.bat' (hace todo automáticamente)
   - O si prefieres solo instalar: 'install.bat'

2. EL SCRIPT 'run-server.bat' HACE:
   - Verifica Node.js y npm
   - Instala dependencias automáticamente
   - Verifica archivos necesarios
   - Inicia el servidor en puerto 3000
   - Muestra logs en tiempo real

3. ACCEDER A LA APLICACIÓN:
   - Abre tu navegador
   - Ve a: http://localhost:3000
   - ¡Comienza a generar platos!

🛠️ REQUISITOS PREVIOS
- Windows 7/8/10/11
- Node.js 14 o superior (se descarga automáticamente si falta)
- Conexión a internet (para instalar dependencias)

📊 LOGS DEL SERVIDOR
El archivo run-server.bat muestra:
- Estado de la instalación
- Peticiones HTTP recibidas
- Errores y advertencias
- Tiempos de respuesta
- Recursos servidos

🔧 COMANDOS MANUALES (opcional)

Si prefieres hacerlo manualmente:
cd backend
npm install
node src/server.js

❌ SOLUCIÓN DE PROBLEMAS

1. Puerto 3000 en uso:
   - Cambia el puerto en server.js y reinicia

2. Error de dependencias:
   - Borra la carpeta backend/node_modules
   - Ejecuta run-server.bat nuevamente

3. Archivos faltantes:
   - Asegúrate de tener todos los archivos del frontend

📞 SOPORTE
Si encuentras problemas:
1. Revisa los logs en la consola
2. Verifica que todos los archivos estén presentes
3. Asegúrate de tener Node.js instalado

¡Disfruta de tu generador de platos saludables!