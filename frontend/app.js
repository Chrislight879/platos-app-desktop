class GeneradorPlatos {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000';
        this.currentTime = 1;
        this.currentPlato = null;
        this.timeNames = {1: 'Desayuno', 2: 'Almuerzo', 3: 'Cena'};
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkServerStatus();
        this.loadStats();
        this.selectTime(1); // Desayuno por defecto
    }

    bindEvents() {
        // Botones de tiempo
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const timeId = parseInt(e.currentTarget.dataset.time);
                this.selectTime(timeId);
            });
        });

        // Botón generar plato
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generatePlato();
        });

        // Botón tiempo aleatorio
        document.getElementById('randomBtn').addEventListener('click', () => {
            const randomTime = Math.floor(Math.random() * 3) + 1;
            this.selectTime(randomTime);
            this.generatePlato();
        });

        // Botón nuevo plato (mismo tiempo)
        document.getElementById('newPlateBtn').addEventListener('click', () => {
            this.generatePlato();
        });

        // Botón copiar plato
        document.getElementById('copyBtn').addEventListener('click', () => {
            this.copyPlato();
        });

        // Botón imprimir
        document.getElementById('printBtn').addEventListener('click', () => {
            this.printPlato();
        });

        // Botón actualizar estadísticas
        document.getElementById('refreshStats').addEventListener('click', () => {
            this.loadStats();
        });
    }

    async checkServerStatus() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/health`);
            if (response.ok) {
                const data = await response.json();
                document.getElementById('serverStatus').textContent = 'Conectado ✅';
                document.getElementById('serverStatus').style.color = '#4CAF50';
                console.log('✅ Servidor conectado:', data.message);
            }
        } catch (error) {
            document.getElementById('serverStatus').textContent = 'Desconectado ❌';
            document.getElementById('serverStatus').style.color = '#f44336';
            console.error('❌ Error de conexión:', error);
            this.showNotification('No se puede conectar al servidor. Verifica que esté corriendo.', 'error');
        }
    }

    selectTime(timeId) {
        // Actualizar botones de tiempo
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.time) === timeId) {
                btn.classList.add('active');
            }
        });

        this.currentTime = timeId;
        const tiempoElement = document.getElementById('currentTime');
        tiempoElement.querySelector('span').textContent = this.timeNames[timeId];
        
        // Cambiar color según el tiempo
        if (timeId === 1) tiempoElement.style.background = '#4CAF50'; // Desayuno - verde
        else if (timeId === 2) tiempoElement.style.background = '#FF9800'; // Almuerzo - naranja
        else tiempoElement.style.background = '#2196F3'; // Cena - azul
        
        console.log(`⏰ Tiempo seleccionado: ${this.timeNames[timeId]}`);
    }

    async generatePlato() {
        const generateBtn = document.getElementById('generateBtn');
        const originalText = generateBtn.innerHTML;
        
        try {
            // Mostrar loading
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
            generateBtn.disabled = true;
            
            console.log(`🔄 Solicitando plato para tiempo ${this.currentTime}...`);

            // Obtener plato del servidor
            const response = await fetch(`${this.apiBaseUrl}/api/plato/generar?tiempo=${this.currentTime}`);
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const plato = await response.json();
            this.currentPlato = plato;
            
            console.log(`✅ Plato recibido: ${plato.plato.length} alimentos`);
            
            // Mostrar el plato
            this.displayPlato(plato);
            
            // Habilitar botones de acción
            document.getElementById('copyBtn').disabled = false;
            document.getElementById('printBtn').disabled = false;
            
            this.showNotification(`¡Plato de ${plato.tiempo_comida} generado exitosamente!`, 'success');
            
        } catch (error) {
            console.error('❌ Error al generar plato:', error);
            this.showNotification('Error al conectar con el servidor. Usando datos de ejemplo.', 'warning');
            
            // Mostrar plato de ejemplo si hay error
            this.showSamplePlato();
            
        } finally {
            // Restaurar botón
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> Generar Plato';
            generateBtn.disabled = false;
        }
    }

    displayPlato(platoData) {
        const placeholder = document.getElementById('platoPlaceholder');
        const content = document.getElementById('platoContent');
        const itemsContainer = document.getElementById('platoItems');
        
        console.log(`📋 Mostrando plato con ${platoData.plato.length} alimentos`);
        
        // Ocultar placeholder y mostrar contenido
        placeholder.style.display = 'none';
        content.style.display = 'block';
        
        // Limpiar items anteriores
        itemsContainer.innerHTML = '';
        
        // Mostrar cada alimento del plato
        platoData.plato.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = `plato-item ${item.es_sustitucion ? 'sustitucion' : ''}`;
            
            let sustituyeHtml = '';
            if (item.es_sustitucion && item.sustituye_a) {
                sustituyeHtml = `<div class="sustitucion-info"><i class="fas fa-exchange-alt"></i> Sustituye a ${item.sustituye_a}</div>`;
            }
            
            itemElement.innerHTML = `
                <div class="plato-item-header">
                    <div class="grupo-badge">${item.grupo}</div>
                    <div class="porcion-badge">${item.porcion}</div>
                </div>
                <div class="alimento-text">${item.alimento}</div>
                ${sustituyeHtml}
            `;
            
            itemsContainer.appendChild(itemElement);
        });
        
        // Actualizar contador
        document.getElementById('totalItems').textContent = platoData.plato.length;
        
        // Mostrar en consola para debug
        console.log('🍽️  Plato generado:', platoData.plato.map((item, i) => `${i+1}. ${item.grupo}: ${item.alimento}`));
    }

    showSamplePlato() {
        console.log('🔄 Mostrando plato de ejemplo...');
        
        // Datos de ejemplo si el servidor no responde
        const alimentosEjemplo = {
            1: [
                {grupo: 'Grupo 2', alimento: 'dos onzas de carne de pollo sin piel', porcion: '1 porción', es_sustitucion: false},
                {grupo: 'Grupo 3', alimento: 'una manzana mediana', porcion: '1 porción', es_sustitucion: false},
                {grupo: 'Grupo 4', alimento: 'una rebanada de pan de caja', porcion: '2 porciones', es_sustitucion: false},
                {grupo: 'Grupo 5', alimento: 'una taza de espinaca', porcion: '1 porción', es_sustitucion: false},
                {grupo: 'Grupo 6', alimento: 'una cucharadita de aceite de oliva', porcion: '1 porción', es_sustitucion: false}
            ],
            2: [
                {grupo: 'Grupo 2', alimento: 'una onza de queso fresco', porcion: '2 porciones', es_sustitucion: false},
                {grupo: 'Grupo 3', alimento: 'una naranja mediana', porcion: '1 porción', es_sustitucion: false},
                {grupo: 'Grupo 4', alimento: 'tres cucharadas de arroz', porcion: '3 porciones', es_sustitucion: false},
                {grupo: 'Grupo 5', alimento: '½ taza de zanahoria', porcion: '1 porción', es_sustitucion: false},
                {grupo: 'Grupo 6', alimento: 'un cuarto de aguacate pequeño', porcion: '1 porción', es_sustitucion: false}
            ],
            3: [
                {grupo: 'Grupo 2', alimento: 'dos claras de huevo', porcion: '1 porción', es_sustitucion: false},
                {grupo: 'Grupo 3', alimento: 'una pera pequeña', porcion: '1 porción', es_sustitucion: false},
                {grupo: 'Grupo 4', alimento: 'una tortilla pequeña', porcion: '2 porciones', es_sustitucion: false},
                {grupo: 'Grupo 5', alimento: 'una taza de brócoli', porcion: '1 porción', es_sustitucion: false},
                {grupo: 'Grupo 6', alimento: 'seis aceitunas verdes medianas', porcion: '1 porción', es_sustitucion: false}
            ]
        };
        
        const platoEjemplo = {
            tiempo_comida: this.timeNames[this.currentTime],
            plato: alimentosEjemplo[this.currentTime] || alimentosEjemplo[1],
            total_alimentos: 5
        };
        
        this.currentPlato = platoEjemplo;
        this.displayPlato(platoEjemplo);
        
        // Habilitar botones de acción
        document.getElementById('copyBtn').disabled = false;
        document.getElementById('printBtn').disabled = false;
        
        console.log('✅ Plato de ejemplo mostrado');
    }

    async copyPlato() {
        if (!this.currentPlato) return;
        
        const plato = this.currentPlato;
        const text = `🍽️ Plato de ${plato.tiempo_comida} - Dieta 1500 Calorías\n\n` +
                    plato.plato.map((item, index) => 
                        `${index + 1}. ${item.grupo}: ${item.alimento} (${item.porcion})`
                    ).join('\n') + 
                    `\n\nTotal: ${plato.plato.length} alimentos`;
        
        try {
            await navigator.clipboard.writeText(text);
            console.log('📋 Plato copiado al portapapeles');
            this.showNotification('¡Plato copiado al portapapeles!', 'success');
        } catch (error) {
            console.log('📋 Usando fallback para copiar texto');
            // Fallback para navegadores antiguos
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification('¡Plato copiado al portapapeles!', 'success');
        }
    }

    printPlato() {
        if (!this.currentPlato) return;
        
        console.log('🖨️ Preparando para imprimir plato...');
        
        const printWindow = window.open('', '_blank');
        const plato = this.currentPlato;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Plato de ${plato.tiempo_comida}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4CAF50; padding-bottom: 20px; }
                    h1 { color: #2E7D32; }
                    h3 { color: #666; }
                    .plato-item { margin: 15px 0; padding: 12px; border-left: 3px solid #4CAF50; background: #f9f9f9; }
                    .grupo { font-weight: bold; color: #2E7D32; }
                    .porcion { color: #666; font-size: 0.9em; }
                    .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
                    @media print {
                        body { font-size: 12pt; }
                        .plato-item { break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🍽️ Plato de ${plato.tiempo_comida}</h1>
                    <h3>Dieta Balanceada de 1500 Calorías</h3>
                    <p>Generado el ${new Date().toLocaleDateString()} a las ${new Date().toLocaleTimeString()}</p>
                </div>
                
                <h2>Alimentos del Plato:</h2>
                ${plato.plato.map((item, index) => `
                    <div class="plato-item">
                        <strong>${index + 1}.</strong> 
                        <span class="grupo">${item.grupo}:</span> 
                        ${item.alimento} <span class="porcion">(${item.porcion})</span>
                    </div>
                `).join('')}
                
                <div class="footer">
                    <p><strong>Total:</strong> ${plato.plato.length} alimentos balanceados</p>
                    <p>Generado con Generador de Platos - Dieta 1500 Calorías</p>
                </div>
                
                <script>
                    window.onload = function() {
                        window.print();
                        setTimeout(function() {
                            window.close();
                        }, 500);
                    }
                </script>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        console.log('✅ Ventana de impresión abierta');
    }

    async loadStats() {
        try {
            console.log('📊 Solicitando estadísticas...');
            const response = await fetch(`${this.apiBaseUrl}/api/estadisticas`);
            if (response.ok) {
                const stats = await response.json();
                
                document.getElementById('stats').innerHTML = `
                    <div class="stat-item">Comidas: <span class="stat-value">${stats.total_comidas}</span></div>
                    <div class="stat-item">Grupos: <span class="stat-value">${stats.total_grupos}</span></div>
                    <div class="stat-item">Tiempos: <span class="stat-value">${stats.total_tiempos}</span></div>
                    <div class="stat-item">Sustituciones: <span class="stat-value">${stats.total_sustituciones}</span></div>
                `;
                
                console.log('✅ Estadísticas cargadas:', stats);
            }
        } catch (error) {
            console.warn('⚠️ No se pudieron cargar estadísticas, usando valores por defecto');
            document.getElementById('stats').innerHTML = `
                <div class="stat-item">Comidas: <span class="stat-value">133</span></div>
                <div class="stat-item">Grupos: <span class="stat-value">6</span></div>
                <div class="stat-item">Tiempos: <span class="stat-value">3</span></div>
                <div class="stat-item">Sustituciones: <span class="stat-value">2</span></div>
            `;
        }
    }

    showNotification(message, type = 'info') {
        // Eliminar notificaciones anteriores
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Forzar reflow para la animación
        notification.offsetHeight;
        
        // Mostrar notificación
        notification.classList.add('show');
        
        // Ocultar después de 3 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        console.log(`📢 Notificación: ${message}`);
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando Generador de Platos...');
    const app = new GeneradorPlatos();
    window.generadorPlatos = app;
    
    // Generar un plato inicial después de 1 segundo
    setTimeout(() => {
        console.log('🔄 Generando plato inicial...');
        app.generatePlato();
    }, 1000);
});

// Agregar estilos para las notificaciones
const style = document.createElement('style');
style.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 10000;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 400px;
        min-width: 300px;
    }
    
    .notification.show {
        transform: translateX(0);
    }
    
    .notification.success {
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
        border-left: 4px solid #1B5E20;
    }
    
    .notification.error {
        background: linear-gradient(135deg, #f44336, #d32f2f);
        border-left: 4px solid #b71c1c;
    }
    
    .notification.warning {
        background: linear-gradient(135deg, #FF9800, #F57C00);
        border-left: 4px solid #E65100;
    }
    
    .notification.info {
        background: linear-gradient(135deg, #2196F3, #1976D2);
        border-left: 4px solid #0D47A1;
    }
    
    .notification i {
        font-size: 1.2em;
    }
    
    .notification span {
        flex: 1;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .fa-spin {
        animation: spin 1s linear infinite;
    }
`;
document.head.appendChild(style);