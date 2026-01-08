class PlatoApp {
    constructor() {
        this.apiBaseUrl = 'http://localhost:3000';
        this.currentTime = 1;
        this.currentPlato = null;
        this.timeNames = {1: 'Desayuno', 2: 'Almuerzo', 3: 'Cena'};
        this.gruposInfo = {
            1: 'Lácteos',
            2: 'Proteínas',
            3: 'Frutas',
            4: 'Cereales',
            5: 'Verduras',
            6: 'Grasas'
        };
        this.init();
    }

    async init() {
        this.bindEvents();
        await this.checkConnection();
        this.loadInitialData();
        this.setupModals();
        this.selectTime(1); // Seleccionar Desayuno por defecto
    }

    bindEvents() {
        // Botones de tiempo
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const timeId = parseInt(e.currentTarget.dataset.time);
                this.selectTime(timeId);
                if (document.getElementById('autoGenerate').checked) {
                    this.generatePlato();
                }
            });
        });

        // Botón generar
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generatePlato();
        });

        // Botón aleatorio
        document.getElementById('randomBtn').addEventListener('click', () => {
            const randomTime = Math.floor(Math.random() * 3) + 1;
            this.selectTime(randomTime);
            this.generatePlato();
        });

        // Botones de acción
        document.getElementById('saveBtn').addEventListener('click', () => this.savePlato());
        document.getElementById('printBtn').addEventListener('click', () => this.printPlato());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportPlato());
        document.getElementById('shareBtn').addEventListener('click', () => this.sharePlato());

        // Botones de información
        document.getElementById('aboutBtn').addEventListener('click', () => this.showAbout());
        document.getElementById('helpBtn').addEventListener('click', () => this.showHelp());
        document.getElementById('statsBtn').addEventListener('click', () => this.showStats());
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/health`);
            if (response.ok) {
                document.getElementById('status').innerHTML = 
                    '<i class="fas fa-circle"></i> Conectado';
                document.getElementById('status').className = 'status-connected';
                return true;
            }
        } catch (error) {
            document.getElementById('status').innerHTML = 
                '<i class="fas fa-circle"></i> Offline';
            document.getElementById('status').className = 'status-offline';
            console.warn('Modo offline:', error);
            return false;
        }
    }

    selectTime(timeId) {
        // Actualizar botones
        document.querySelectorAll('.time-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.time) === timeId) {
                btn.classList.add('active');
            }
        });

        this.currentTime = timeId;
        document.getElementById('currentTime').textContent = this.timeNames[timeId];
    }

    async generatePlato() {
        const generateBtn = document.getElementById('generateBtn');
        const originalText = generateBtn.innerHTML;
        
        try {
            // Mostrar loading
            generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
            generateBtn.disabled = true;

            // Determinar si aplicar sustituciones
            const aplicarSustituciones = document.getElementById('includeExtras')?.checked !== false;
            
            // Obtener plato del backend
            const response = await fetch(
                `${this.apiBaseUrl}/api/plato/generar?tiempo=${this.currentTime}&sustituciones=${aplicarSustituciones}`
            );
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();

            this.currentPlato = data;
            this.displayPlato(data);
            this.updateNutritionInfo(data);
            this.enableActionButtons();

            this.showNotification('Plato generado exitosamente', 'success');

        } catch (error) {
            console.error('Error al generar plato:', error);
            this.showSamplePlato();
            this.showNotification('Usando datos de ejemplo (modo offline)', 'warning');
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

        // Ocultar placeholder y mostrar contenido
        placeholder.style.display = 'none';
        content.style.display = 'block';

        // Actualizar título
        document.getElementById('platoTitle').textContent = 
            `Plato de ${platoData.tiempo_comida} - Dieta 1500 Calorías`;

        // Actualizar meta información
        const metaContainer = document.getElementById('platoMeta');
        metaContainer.innerHTML = `
            <span><i class="fas fa-leaf"></i> Balanceado</span>
            <span><i class="fas fa-fire"></i> ${platoData.info_nutricional?.calorias || '--'} kcal</span>
            <span><i class="fas fa-drumstick-bite"></i> ${platoData.total_porciones || platoData.plato.length} alimentos</span>
        `;

        // Limpiar items
        itemsContainer.innerHTML = '';

        // Mostrar items del plato
        platoData.plato.forEach((item, index) => {
            const itemElement = document.createElement('div');
            
            // Determinar clases CSS según el tipo de alimento
            let itemClass = 'plato-item';
            if (item.es_sustitucion) itemClass += ' sustitucion';
            if (item.es_complementario) itemClass += ' complementario';
            
            // Crear texto de información adicional
            let infoExtra = '';
            if (item.es_sustitucion && item.grupo_original) {
                infoExtra = `<small style="display: block; margin-top: 5px; color: #FF9800; font-style: italic;">
                    Sustituye a: ${item.grupo_original}
                </small>`;
            }
            
            itemElement.className = itemClass;
            itemElement.innerHTML = `
                <div class="item-number">${index + 1}</div>
                <div class="item-content">
                    <div class="item-header">
                        <span class="item-group">${item.grupo}</span>
                        <span class="item-portion ${this.getPortionClass(item.porcion)}">
                            ${item.porcion}
                        </span>
                    </div>
                    <h4 class="item-name">${item.alimento}</h4>
                    <p class="item-desc">${this.getFoodDescription(item.grupo, item.alimento)}</p>
                    ${infoExtra}
                </div>
            `;
            itemsContainer.appendChild(itemElement);
        });

        // Actualizar resumen
        const summary = document.getElementById('platoSummary');
        const tieneSustituciones = platoData.plato.some(item => item.es_sustitucion);
        const sustitucionInfo = tieneSustituciones ? 
            '<p><i class="fas fa-exchange-alt"></i> Se aplicaron sustituciones del Grupo 1</p>' : '';
        
        summary.innerHTML = `
            <h3><i class="fas fa-clipboard-check"></i> Resumen del Plato</h3>
            <p><strong>${platoData.mensaje}</strong></p>
            <p>Este plato está diseñado para ${platoData.tiempo_comida.toLowerCase()} 
            en una dieta de 1500 calorías e incluye alimentos de diferentes grupos.</p>
            ${sustitucionInfo}
            <small>Información nutricional es estimada basada en porciones estándar</small>
        `;
    }

    getPortionClass(porcion) {
        if (porcion.includes('2 porciones')) return 'portion-double';
        if (porcion.includes('3 porciones')) return 'portion-triple';
        if (porcion.includes('Sustitución')) return 'portion-extra';
        if (porcion.includes('adicional')) return 'portion-extra';
        return 'portion-normal';
    }

    getFoodDescription(grupo, alimento) {
        const descripciones = {
            'Grupo 1': 'Productos lácteos bajos en grasa',
            'Grupo 2': 'Fuente de proteínas para músculos',
            'Grupo 3': 'Frutas naturales con vitaminas',
            'Grupo 4': 'Carbohidratos complejos para energía',
            'Grupo 5': 'Verduras ricas en fibra y minerales',
            'Grupo 6': 'Grasas saludables en porción controlada'
        };
        
        return descripciones[grupo] || 'Alimento balanceado y nutritivo';
    }

    updateNutritionInfo(platoData) {
        const info = platoData.info_nutricional || { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };
        
        // Actualizar UI
        document.getElementById('calories').textContent = info.calorias || '--';
        document.getElementById('protein').textContent = info.proteinas ? `${info.proteinas}g` : '--';
        document.getElementById('carbs').textContent = info.carbohidratos ? `${info.carbohidratos}g` : '--';
        document.getElementById('fat').textContent = info.grasas ? `${info.grasas}g` : '--';
    }

    enableActionButtons() {
        const buttons = ['saveBtn', 'printBtn', 'exportBtn', 'shareBtn'];
        buttons.forEach(id => {
            document.getElementById(id).disabled = false;
        });
    }

    savePlato() {
        if (!this.currentPlato) return;
        
        try {
            // Guardar en localStorage
            const platosGuardados = JSON.parse(localStorage.getItem('platosGuardados') || '[]');
            const platoGuardar = {
                ...this.currentPlato,
                fecha: new Date().toISOString(),
                tiempo_id: this.currentTime
            };
            
            platosGuardados.push(platoGuardar);
            localStorage.setItem('platosGuardados', JSON.stringify(platosGuardados));
            
            this.showNotification('Plato guardado en historial', 'success');
        } catch (error) {
            this.showNotification('Error al guardar plato', 'error');
        }
    }

    printPlato() {
        const printWindow = window.open('', '_blank');
        const plato = this.currentPlato;
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Plato de ${plato.tiempo_comida}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .plato-item { margin: 15px 0; padding: 10px; border-left: 3px solid #4CAF50; }
                    .grupo { font-weight: bold; color: #2E7D32; }
                    .nutricion { background: #f5f5f5; padding: 15px; margin-top: 20px; }
                    .footer { margin-top: 30px; text-align: center; font-size: 0.9em; color: #666; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Plato de ${plato.tiempo_comida}</h1>
                    <p>Generado el ${new Date().toLocaleDateString()}</p>
                    <p>Dieta de 1500 Calorías</p>
                </div>
                
                <h2>Alimentos:</h2>
                ${plato.plato.map((item, index) => `
                    <div class="plato-item">
                        <strong>${index + 1}.</strong> 
                        <span class="grupo">${item.grupo}:</span> 
                        ${item.alimento} (${item.porcion})
                    </div>
                `).join('')}
                
                <div class="nutricion">
                    <h3>Información Nutricional Estimada:</h3>
                    <p>Calorías: ${plato.info_nutricional?.calorias || '--'}</p>
                    <p>Proteínas: ${plato.info_nutricional?.proteinas || '--'}g</p>
                    <p>Carbohidratos: ${plato.info_nutricional?.carbohidratos || '--'}g</p>
                    <p>Grasas: ${plato.info_nutricional?.grasas || '--'}g</p>
                </div>
                
                <div class="footer">
                    <p>Generado con Generador de Platos Saludables</p>
                    <p>Dieta balanceada de 1500 calorías</p>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.print();
    }

    exportPlato() {
        if (!this.currentPlato) return;
        
        try {
            const dataStr = JSON.stringify(this.currentPlato, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `plato_${this.currentPlato.tiempo_comida}_${Date.now()}.json`;
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
            
            this.showNotification('Plato exportado como JSON', 'success');
        } catch (error) {
            this.showNotification('Error al exportar plato', 'error');
        }
    }

    sharePlato() {
        if (!this.currentPlato) return;
        
        const plato = this.currentPlato;
        const text = `🍽️ Plato de ${plato.tiempo_comida} - Dieta 1500 Calorías\n\n` +
                    plato.plato.map((item, index) => 
                        `${index + 1}. ${item.alimento} (${item.grupo})`
                    ).join('\n') + 
                    `\n\nCalorías estimadas: ${plato.info_nutricional?.calorias || '--'}` +
                    `\nGenerado con Generador de Platos Saludables`;
        
        if (navigator.share) {
            navigator.share({
                title: `Plato de ${plato.tiempo_comida}`,
                text: text,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(text).then(() => {
                this.showNotification('Plato copiado al portapapeles', 'info');
            }).catch(() => {
                // Fallback para navegadores antiguos
                const textArea = document.createElement('textarea');
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                this.showNotification('Plato copiado al portapapeles', 'info');
            });
        }
    }

    async loadInitialData() {
        try {
            // Cargar información de grupos
            const response = await fetch(`${this.apiBaseUrl}/api/grupos`);
            if (response.ok) {
                const grupos = await response.json();
                console.log('Grupos cargados:', grupos);
            }
        } catch (error) {
            console.log('Modo offline, usando datos locales');
        }
    }

    setupModals() {
        // Modal Acerca De
        const aboutModal = document.getElementById('aboutModal');
        const closeButtons = document.querySelectorAll('.modal-close');
        
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                aboutModal.style.display = 'none';
            });
        });

        window.addEventListener('click', (event) => {
            if (event.target === aboutModal) {
                aboutModal.style.display = 'none';
            }
        });
    }

    showAbout() {
        const modal = document.getElementById('aboutModal');
        modal.style.display = 'flex';
    }

    showHelp() {
        alert('AYUDA - GENERADOR DE PLATOS\n\n' +
              '📋 CÓMO USAR:\n' +
              '1. Selecciona un tiempo de comida (Desayuno, Almuerzo, Cena)\n' +
              '2. Haz clic en "Generar Plato" para crear un plato balanceado\n' +
              '3. Puedes usar "Aleatorio" para sorprenderte\n\n' +
              '🍽️ DIETA DE 1500 CALORÍAS:\n' +
              '• El sistema usa porciones específicas para cada tiempo\n' +
              '• Se aplican sustituciones automáticas del Grupo 1\n' +
              '• Información nutricional es estimada\n\n' +
              '💾 FUNCIONES:\n' +
              '• Guardar platos en el navegador\n' +
              '• Imprimir o exportar platos\n' +
              '• Compartir platos generados\n\n' +
              '🔄 SUSTITUCIONES:\n' +
              'El Grupo 1 (Lácteos) puede sustituirse por:\n' +
              '• Grupo 2 + Grupo 3\n' +
              '• Grupo 2 + Grupo 4');
    }

    async showStats() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/api/estadisticas`);
            const stats = await response.json();
            
            alert(`📊 ESTADÍSTICAS DEL SISTEMA\n\n` +
                  `Total alimentos: ${stats.total_comidas}\n` +
                  `Grupos alimenticios: ${stats.total_grupos}\n` +
                  `Tiempos de comida: ${stats.total_tiempos}\n` +
                  `Reglas de sustitución: ${stats.total_sustituciones}\n\n` +
                  `💡 Sistema de dieta de 1500 calorías\n` +
                  `🍎 Base de datos completa cargada`);
        } catch (error) {
            alert('Estadísticas no disponibles en modo offline\n\n' +
                  'Datos de ejemplo cargados:\n' +
                  '• 6 grupos alimenticios\n' +
                  '• 133 alimentos diferentes\n' +
                  '• Sistema de sustituciones activo');
        }
    }

    showSamplePlato() {
        const alimentosMuestra = {
            1: [
                {grupo: 'Grupo 1', alimento: 'una taza de leche descremada', porcion: '1 porción'},
                {grupo: 'Grupo 2', alimento: 'dos onzas de carne de pollo sin piel', porcion: '1 porción'},
                {grupo: 'Grupo 3', alimento: 'una manzana mediana', porcion: '1 porción'},
                {grupo: 'Grupo 4', alimento: 'una rebanada de pan de caja', porcion: '2 porciones'},
                {grupo: 'Grupo 5', alimento: 'una taza de espinaca', porcion: '1 porción'},
                {grupo: 'Grupo 6', alimento: 'una cucharadita de aceite de oliva', porcion: '1 porción'}
            ],
            2: [
                {grupo: 'Grupo 2', alimento: 'una onza de queso fresco', porcion: '2 porciones'},
                {grupo: 'Grupo 3', alimento: 'una naranja mediana', porcion: '1 porción'},
                {grupo: 'Grupo 4', alimento: 'tres cucharadas de arroz', porcion: '3 porciones'},
                {grupo: 'Grupo 5', alimento: '½ taza de zanahoria', porcion: '1 porción'},
                {grupo: 'Grupo 6', alimento: 'un cuarto de aguacate pequeño', porcion: '1 porción'}
            ],
            3: [
                {grupo: 'Grupo 2', alimento: 'dos claras de huevo', porcion: '1 porción'},
                {grupo: 'Grupo 3', alimento: 'una pera pequeña', porcion: '1 porción'},
                {grupo: 'Grupo 4', alimento: 'una tortilla pequeña', porcion: '2 porciones'},
                {grupo: 'Grupo 5', alimento: 'una taza de brócoli', porcion: '1 porción'},
                {grupo: 'Grupo 6', alimento: 'seis aceitunas verdes medianas', porcion: '1 porción'}
            ]
        };

        const platoMuestra = {
            tiempo_comida: this.timeNames[this.currentTime],
            plato: alimentosMuestra[this.currentTime] || alimentosMuestra[1],
            info_nutricional: {
                calorias: this.currentTime === 1 ? 450 : this.currentTime === 2 ? 550 : 400,
                proteinas: this.currentTime === 1 ? 25 : this.currentTime === 2 ? 30 : 20,
                carbohidratos: this.currentTime === 1 ? 60 : this.currentTime === 2 ? 70 : 50,
                grasas: this.currentTime === 1 ? 10 : this.currentTime === 2 ? 15 : 8
            },
            total_porciones: 6,
            mensaje: 'Plato generado con datos de ejemplo (modo offline)'
        };
        
        this.currentPlato = platoMuestra;
        this.displayPlato(platoMuestra);
        this.updateNutritionInfo(platoMuestra);
        this.enableActionButtons();
    }

    showNotification(message, type = 'info') {
        // Eliminar notificaciones anteriores
        document.querySelectorAll('.notification').forEach(n => n.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 
                              type === 'error' ? 'exclamation-circle' : 
                              type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        // Forzar reflow para la animación
        notification.offsetHeight;
        
        // Animación de entrada
        notification.classList.add('show');
        
        // Remover después de 4 segundos
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 4000);
    }
}

// Añadir estilos para notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: var(--border-radius);
        color: white;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        transform: translateX(150%);
        transition: transform 0.3s ease;
        box-shadow: var(--box-shadow-hover);
        min-width: 300px;
        max-width: 400px;
    }
    .notification.show {
        transform: translateX(0);
    }
    .notification-success {
        background: linear-gradient(to right, var(--color-success), #66BB6A);
        border-left: 4px solid var(--color-primary-dark);
    }
    .notification-error {
        background: linear-gradient(to right, var(--color-error), #EF5350);
        border-left: 4px solid #C62828;
    }
    .notification-warning {
        background: linear-gradient(to right, var(--color-warning), #FFB74D);
        border-left: 4px solid var(--color-accent-dark);
    }
    .notification-info {
        background: linear-gradient(to right, var(--color-info), #42A5F5);
        border-left: 4px solid var(--color-secondary-dark);
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
document.head.appendChild(notificationStyles);

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    // Crear instancia de la aplicación
    window.app = new PlatoApp();
    
    // Auto-generar primer plato después de 1 segundo
    setTimeout(() => {
        if (document.getElementById('autoGenerate').checked) {
            window.app.generatePlato();
        }
    }, 1000);
});