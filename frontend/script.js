// Variables globales
let platoActual = null;
let tiempoActual = 1;
let alimentosPorGrupo = {};
let alimentoSeleccionado = null;
let grupoSeleccionado = null;
let alimentoAReemplazar = null;
let indiceAReemplazar = null;

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🍽️ Inicializando aplicación...');
    inicializarApp();
    setupEventListeners();
});

function inicializarApp() {
    // Mostrar información de grupos
    mostrarGrupos();
    
    // Cargar datos iniciales
    cargarDatosIniciales();
    
    // Verificar servidor
    verificarServidor();
}

function verificarServidor() {
    const statusElement = document.getElementById('serverStatus');
    statusElement.innerHTML = '<i class="fas fa-circle"></i> Conectando al servidor...';
    
    fetch('/api/health')
        .then(response => {
            if (!response.ok) {
                throw new Error('Servidor no responde');
            }
            return response.json();
        })
        .then(data => {
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #27ae60;"></i> Servidor conectado';
            console.log('✅ Servidor conectado:', data);
            
            // Mostrar mensaje de bienvenida
            mostrarMensaje('success', 'Servidor conectado correctamente');
        })
        .catch(error => {
            console.error('❌ Error conectando al servidor:', error);
            statusElement.innerHTML = '<i class="fas fa-circle" style="color: #e74c3c;"></i> Servidor desconectado';
            
            // Mostrar mensaje amigable
            setTimeout(() => {
                const emptyState = document.querySelector('.empty-state');
                if (emptyState) {
                    emptyState.innerHTML = `
                        <i class="fas fa-exclamation-triangle" style="color: #e74c3c; font-size: 4rem; margin-bottom: 20px;"></i>
                        <h3>Servidor no disponible</h3>
                        <p>El servidor no está respondiendo. Asegúrate de que:</p>
                        <ol style="text-align: left; margin-top: 10px; padding-left: 20px;">
                            <li>El servidor esté ejecutándose en segundo plano</li>
                            <li>La URL sea <strong>http://localhost:3000</strong></li>
                            <li>No haya conflictos de puerto (cierra otros programas usando puerto 3000)</li>
                        </ol>
                        <button class="btn btn-primary" onclick="location.reload()" style="margin-top: 20px;">
                            <i class="fas fa-sync-alt"></i> Reintentar conexión
                        </button>
                    `;
                }
            }, 1000);
        });
}

function mostrarMensaje(tipo, texto) {
    // Crear mensaje temporal
    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = `mensaje-flotante ${tipo}`;
    mensajeDiv.innerHTML = `
        <i class="fas fa-${tipo === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        ${texto}
    `;
    
    // Estilos para el mensaje
    mensajeDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${tipo === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `;
    
    // Agregar al documento
    document.body.appendChild(mensajeDiv);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        mensajeDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(mensajeDiv);
        }, 300);
    }, 3000);
}

// Agregar estilos CSS para animaciones
if (!document.querySelector('#estilos-mensajes')) {
    const style = document.createElement('style');
    style.id = 'estilos-mensajes';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

function cargarDatosIniciales() {
    // Cargar estadísticas
    cargarEstadisticas();
    
    // Mostrar sustituciones
    mostrarSustituciones();
}

function mostrarGrupos() {
    const grupos = [
        { id: 1, nombre: 'Grupo 1: Lácteos', color: '#3498db', icon: 'fa-cheese' },
        { id: 2, nombre: 'Grupo 2: Proteínas', color: '#e74c3c', icon: 'fa-drumstick-bite' },
        { id: 3, nombre: 'Grupo 3: Frutas', color: '#2ecc71', icon: 'fa-apple-alt' },
        { id: 4, nombre: 'Grupo 4: Cereales', color: '#f39c12', icon: 'fa-bread-slice' },
        { id: 5, nombre: 'Grupo 5: Verduras', color: '#9b59b6', icon: 'fa-carrot' },
        { id: 6, nombre: 'Grupo 6: Grasas', color: '#e67e22', icon: 'fa-oil-can' }
    ];
    
    const gruposInfo = document.getElementById('gruposInfo');
    const gruposSelector = document.getElementById('gruposSelector');
    
    gruposInfo.innerHTML = '';
    gruposSelector.innerHTML = '';
    
    grupos.forEach(grupo => {
        // Para panel de información
        const grupoItem = document.createElement('div');
        grupoItem.className = 'grupo-item';
        grupoItem.innerHTML = `
            <i class="fas ${grupo.icon}" style="color: ${grupo.color}; font-size: 1.2rem;"></i>
            <div>
                <strong>${grupo.nombre.split(':')[0]}</strong><br>
                <small>${grupo.nombre.split(':')[1]}</small>
            </div>
        `;
        grupoItem.style.borderLeft = `3px solid ${grupo.color}`;
        gruposInfo.appendChild(grupoItem);
        
        // Para selector de reemplazo
        const grupoBtn = document.createElement('button');
        grupoBtn.className = 'grupo-selector-btn';
        grupoBtn.innerHTML = `
            <i class="fas ${grupo.icon}"></i>
            <span>${grupo.id}</span>
        `;
        grupoBtn.title = grupo.nombre;
        grupoBtn.onclick = () => cargarAlimentosGrupo(grupo.id, grupo.nombre);
        gruposSelector.appendChild(grupoBtn);
    });
}

function mostrarSustituciones() {
    const sustitucionesList = document.getElementById('sustitucionesList');
    sustitucionesList.innerHTML = `
        <li><i class="fas fa-exchange-alt" style="color: #2ecc71;"></i> 1 porción de <strong>Grupo 2: Proteínas</strong> + 1 porción de <strong>Grupo 3: Frutas</strong></li>
        <li><i class="fas fa-exchange-alt" style="color: #f39c12;"></i> 1 porción de <strong>Grupo 2: Proteínas</strong> + 1 porción de <strong>Grupo 4: Cereales</strong></li>
    `;
}

function cargarEstadisticas() {
    fetch('/api/estadisticas')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar estadísticas');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                const statsGrid = document.getElementById('statsGrid');
                statsGrid.innerHTML = `
                    <div class="stat-card">
                        <i class="fas fa-apple-alt"></i>
                        <div class="stat-value">${data.total_comidas}</div>
                        <div class="stat-label">Alimentos Disponibles</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-layer-group"></i>
                        <div class="stat-value">${data.total_grupos}</div>
                        <div class="stat-label">Grupos Alimenticios</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-clock"></i>
                        <div class="stat-value">${data.total_tiempos}</div>
                        <div class="stat-label">Tiempos de Comida</div>
                    </div>
                    <div class="stat-card">
                        <i class="fas fa-exchange-alt"></i>
                        <div class="stat-value">${data.total_sustituciones}</div>
                        <div class="stat-label">Sustituciones</div>
                    </div>
                `;
            }
        })
        .catch(error => {
            console.error('Error cargando estadísticas:', error);
        });
}

function setupEventListeners() {
    // Botón Generar Plato
    document.getElementById('btnGenerar').addEventListener('click', generarPlato);
    
    // Botón Tiempo Aleatorio
    document.getElementById('btnAleatorio').addEventListener('click', generarPlatoAleatorio);
    
    // Botón Reemplazar Alimentos
    document.getElementById('btnReemplazar').addEventListener('click', function() {
        if (!platoActual) {
            mostrarMensaje('error', 'Primero genera un plato para poder reemplazar alimentos.');
            return;
        }
        
        // Crear lista de alimentos para reemplazar
        const alimentosList = document.getElementById('alimentosList');
        alimentosList.innerHTML = '<div class="seleccionar-alimento">Selecciona un alimento del plato para reemplazar:</div>';
        
        platoActual.plato.forEach((alimento, index) => {
            const item = document.createElement('div');
            item.className = 'alimento-seleccionable';
            item.innerHTML = `
                <strong>${alimento.alimento}</strong><br>
                <small>${alimento.grupo} - ${alimento.porcion}</small>
                ${alimento.es_sustitucion ? '<br><small style="color: #e67e22;"><i class="fas fa-exchange-alt"></i> Sustitución</small>' : ''}
            `;
            item.onclick = () => mostrarPanelReemplazoMejorado(index);
            alimentosList.appendChild(item);
        });
        
        document.getElementById('reemplazoPanel').style.display = 'block';
        document.getElementById('platoContainer').style.opacity = '0.5';
        document.getElementById('btnReemplazar').disabled = true;
    });
    
    // Botón Cancelar Reemplazo
    document.getElementById('btnCancelarReemplazo').addEventListener('click', ocultarPanelReemplazoMejorado);
    
    // Botón Seleccionar Alimento
    document.getElementById('btnSeleccionarAlimento').addEventListener('click', seleccionarAlimentoMejorado);
    
    // Botón Aleatorio del Grupo
    document.getElementById('btnAleatorioGrupo').addEventListener('click', seleccionarAlimentoAleatorio);
    
    // Modal
    document.querySelector('.close-modal').addEventListener('click', cerrarModal);
    document.getElementById('btnCerrarModal').addEventListener('click', cerrarModal);
    document.getElementById('btnUsarEste').addEventListener('click', usarAlimentoModal);
    
    // Cerrar modal al hacer clic fuera
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('alimentoModal');
        if (event.target === modal) {
            cerrarModal();
        }
    });
}

function generarPlato() {
    tiempoActual = document.getElementById('tiempoComida').value;
    
    console.log(`🍽️ Generando plato para tiempo: ${tiempoActual}`);
    mostrarMensaje('success', `Generando plato para ${tiempoActual == 1 ? 'Desayuno' : tiempoActual == 2 ? 'Almuerzo' : 'Cena'}...`);
    
    fetch(`/api/plato/generar?tiempo=${tiempoActual}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                platoActual = data;
                mostrarPlato(data);
                mostrarMensaje('success', `¡Plato generado exitosamente! ${data.total_alimentos} alimentos`);
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
        })
        .catch(error => {
            console.error('Error generando plato:', error);
            mostrarMensaje('error', `Error: ${error.message}`);
        });
}

function generarPlatoAleatorio() {
    console.log('🎲 Generando plato con tiempo aleatorio');
    mostrarMensaje('success', 'Generando plato con tiempo aleatorio...');
    
    fetch('/api/plato/aleatorio')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                platoActual = data;
                tiempoActual = data.tiempo_id;
                document.getElementById('tiempoComida').value = tiempoActual;
                mostrarPlato(data);
                mostrarMensaje('success', `¡Plato aleatorio generado! Tiempo: ${data.tiempo_comida}`);
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
        })
        .catch(error => {
            console.error('Error generando plato aleatorio:', error);
            mostrarMensaje('error', `Error: ${error.message}`);
        });
}

function mostrarPlato(platoData) {
    const platoContainer = document.getElementById('platoContainer');
    const tiempoInfo = document.getElementById('tiempoInfo');
    
    // Actualizar información del tiempo
    tiempoInfo.innerHTML = `
        <h3>${platoData.tiempo_comida}</h3>
        <small>Generado: ${new Date(platoData.fecha_generacion || new Date()).toLocaleTimeString()}</small>
    `;
    
    // Mostrar alimentos del plato
    platoContainer.innerHTML = '';
    
    if (!platoData.plato || platoData.plato.length === 0) {
        platoContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle" style="color: #f39c12; font-size: 4rem;"></i>
                <h3>No se generaron alimentos</h3>
                <p>Intenta generar el plato nuevamente</p>
            </div>
        `;
        return;
    }
    
    platoData.plato.forEach((alimento, index) => {
        const alimentoCard = document.createElement('div');
        alimentoCard.className = `alimento-card ${alimento.es_sustitucion ? 'sustitucion' : ''}`;
        
        let sustituyeInfo = '';
        if (alimento.es_sustitucion) {
            sustituyeInfo = `<div class="sustitucion-badge"><i class="fas fa-exchange-alt"></i> Sustituye ${alimento.sustituye_a || 'Lácteos'}</div>`;
        }
        
        let reemplazadoBadge = '';
        if (alimento.reemplazado) {
            reemplazadoBadge = `<span class="reemplazado-badge" title="Reemplazado a las ${alimento.reemplazado_el}"><i class="fas fa-exchange-alt"></i> Cambiado</span>`;
        }
        
        alimentoCard.innerHTML = `
            <div class="alimento-info">
                <h4>${alimento.alimento}</h4>
                <p class="alimento-desc">${alimento.porcion}</p>
            </div>
            <div class="alimento-meta">
                <span class="alimento-grupo">${alimento.grupo}</span>
                ${sustituyeInfo}
                ${reemplazadoBadge}
            </div>
        `;
        
        // Agregar evento de clic para ver detalles
        alimentoCard.addEventListener('click', () => mostrarDetalleAlimento(alimento, index));
        
        // Agregar botón de reemplazo
        const btnReemplazar = document.createElement('button');
        btnReemplazar.className = 'btn-reemplazar-item';
        btnReemplazar.innerHTML = '<i class="fas fa-sync-alt"></i>';
        btnReemplazar.title = 'Reemplazar este alimento';
        btnReemplazar.onclick = (e) => {
            e.stopPropagation();
            mostrarPanelReemplazoMejorado(index);
        };
        
        const metaDiv = alimentoCard.querySelector('.alimento-meta');
        metaDiv.appendChild(btnReemplazar);
        
        platoContainer.appendChild(alimentoCard);
    });
    
    // Agregar contador
    const contador = document.createElement('div');
    contador.className = 'plato-contador';
    
    // Contar estadísticas
    const totalLacteos = platoData.plato.filter(a => a.grupo.includes('Grupo 1:') && !a.es_sustitucion).length;
    const totalSustituciones = platoData.plato.filter(a => a.es_sustitucion).length / 2;
    
    contador.innerHTML = `
        <p><strong>Total:</strong> ${platoData.total_alimentos} alimentos en este plato</p>
        ${totalLacteos > 0 ? `<p><small><i class="fas fa-cheese"></i> Lácteos directos: ${totalLacteos}</small></p>` : ''}
        ${totalSustituciones > 0 ? `<p><small><i class="fas fa-exchange-alt"></i> Sustituciones: ${totalSustituciones}</small></p>` : ''}
    `;
    platoContainer.appendChild(contador);
}

function mostrarDetalleAlimento(alimento, index) {
    const modal = document.getElementById('alimentoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    let sustituyeInfo = '';
    if (alimento.es_sustitucion) {
        sustituyeInfo = `
            <div class="detalle-item">
                <i class="fas fa-exchange-alt" style="color: #e67e22;"></i>
                <div>
                    <strong>Sustituye a:</strong><br>
                    ${alimento.sustituye_a}
                </div>
            </div>
        `;
    }
    
    modalTitle.textContent = alimento.alimento;
    modalBody.innerHTML = `
        <div class="detalle-alimento">
            <div class="detalle-item">
                <i class="fas fa-layer-group" style="color: #3498db;"></i>
                <div>
                    <strong>Grupo:</strong><br>
                    ${alimento.grupo}
                </div>
            </div>
            <div class="detalle-item">
                <i class="fas fa-balance-scale" style="color: #27ae60;"></i>
                <div>
                    <strong>Porción:</strong><br>
                    ${alimento.porcion}
                </div>
            </div>
            ${sustituyeInfo}
            <div class="detalle-item">
                <i class="fas fa-info-circle" style="color: #f39c12;"></i>
                <div>
                    <strong>Nota:</strong><br>
                    Este alimento es parte de una dieta balanceada de 1500 calorías.
                </div>
            </div>
        </div>
    `;
    
    // Configurar botón "Usar este alimento"
    const btnUsarEste = document.getElementById('btnUsarEste');
    btnUsarEste.dataset.index = index;
    
    modal.style.display = 'block';
}

function cerrarModal() {
    document.getElementById('alimentoModal').style.display = 'none';
}

function usarAlimentoModal() {
    const index = document.getElementById('btnUsarEste').dataset.index;
    mostrarMensaje('success', `Seleccionado: ${platoActual.plato[index].alimento}`);
    cerrarModal();
}

// ============================================
// SISTEMA DE REEMPLAZO MEJORADO
// ============================================

function mostrarPanelReemplazoMejorado(alimentoIndex) {
    if (!platoActual) {
        mostrarMensaje('error', 'Primero genera un plato para poder reemplazar alimentos.');
        return;
    }
    
    // Guardar qué alimento vamos a reemplazar
    indiceAReemplazar = alimentoIndex;
    alimentoAReemplazar = platoActual.plato[alimentoIndex];
    
    // Mostrar información del alimento actual
    const alimentoActual = platoActual.plato[alimentoIndex];
    
    // Extraer ID del grupo del alimento actual
    const grupoId = parseInt(alimentoActual.grupo.split(':')[0].replace('Grupo ', ''));
    
    // Cargar alimentos de ese grupo
    cargarAlimentosGrupo(grupoId, alimentoActual.grupo);
    
    // Cambiar interfaz
    document.getElementById('reemplazoPanel').style.display = 'block';
    document.getElementById('platoContainer').style.opacity = '0.5';
    document.getElementById('btnReemplazar').disabled = true;
}

function cargarAlimentosGrupo(grupoId, grupoNombre) {
    grupoSeleccionado = grupoId;
    alimentoSeleccionado = null;
    
    // Limpiar selecciones anteriores
    const items = document.querySelectorAll('.alimento-item');
    items.forEach(item => item.classList.remove('selected'));
    
    fetch(`/api/grupos/${grupoId}/comidas`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alimentosPorGrupo[grupoId] = data.alimentos;
                mostrarAlimentosGrupo(data.alimentos, grupoNombre, alimentoAReemplazar);
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
        })
        .catch(error => {
            console.error('Error cargando alimentos del grupo:', error);
            mostrarMensaje('error', `Error cargando alimentos: ${error.message}`);
        });
}

function mostrarAlimentosGrupo(alimentos, grupoNombre, alimentoActual) {
    const alimentosList = document.getElementById('alimentosList');
    alimentosList.innerHTML = '';
    
    // Título y alimento actual
    const infoDiv = document.createElement('div');
    infoDiv.className = 'alimento-info-actual';
    infoDiv.innerHTML = `
        <div style="background: #e8f4f8; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #17a2b8;">
            <h4 style="margin-top: 0; color: #17a2b8;"><i class="fas fa-info-circle"></i> Reemplazando:</h4>
            <p style="margin: 5px 0;"><strong>${alimentoActual.alimento}</strong></p>
            <p style="margin: 5px 0; font-size: 0.9em; color: #6c757d;">
                ${grupoNombre} - ${alimentoActual.porcion}
            </p>
        </div>
        <div style="text-align: center; margin-bottom: 15px; color: #3498db;">
            <i class="fas fa-arrow-down"></i>
            <strong> Selecciona un nuevo alimento:</strong>
        </div>
    `;
    alimentosList.appendChild(infoDiv);
    
    // Lista de alimentos
    if (!alimentos || alimentos.length === 0) {
        const noAlimentos = document.createElement('div');
        noAlimentos.className = 'alimento-item';
        noAlimentos.innerHTML = '<em>No hay alimentos disponibles para este grupo</em>';
        alimentosList.appendChild(noAlimentos);
        return;
    }
    
    alimentos.forEach((alimento, index) => {
        const alimentoItem = document.createElement('div');
        alimentoItem.className = 'alimento-item';
        alimentoItem.textContent = alimento;
        alimentoItem.dataset.index = index;
        
        // Resaltar si es el alimento actual
        if (alimento === alimentoActual.alimento) {
            alimentoItem.innerHTML = `
                <strong>${alimento}</strong>
                <small style="color: #6c757d; display: block; margin-top: 5px;">
                    <i class="fas fa-check-circle" style="color: #27ae60;"></i> Actualmente seleccionado
                </small>
            `;
            alimentoItem.style.backgroundColor = '#f8f9fa';
            alimentoItem.style.borderLeft = '4px solid #27ae60';
        }
        
        alimentoItem.addEventListener('click', function() {
            // Remover selección previa
            document.querySelectorAll('.alimento-item').forEach(item => {
                item.classList.remove('selected');
                item.style.backgroundColor = '';
                item.style.borderLeft = '';
            });
            
            // Seleccionar este
            this.classList.add('selected');
            alimentoSeleccionado = alimento;
            
            // Resaltar visualmente
            this.style.backgroundColor = '#e3f2fd';
            this.style.borderLeft = '4px solid #3498db';
        });
        
        alimentosList.appendChild(alimentoItem);
    });
}

function seleccionarAlimentoMejorado() {
    if (!alimentoSeleccionado) {
        mostrarMensaje('error', 'Por favor, selecciona un alimento de la lista.');
        return;
    }
    
    if (!grupoSeleccionado) {
        mostrarMensaje('error', 'Por favor, selecciona un grupo primero.');
        return;
    }
    
    if (indiceAReemplazar === null || !alimentoAReemplazar) {
        mostrarMensaje('error', 'Error: No se especificó qué alimento reemplazar.');
        return;
    }
    
    // Verificar si se seleccionó el mismo alimento
    if (alimentoSeleccionado === alimentoAReemplazar.alimento) {
        mostrarMensaje('info', 'Has seleccionado el mismo alimento. No se realizaron cambios.');
        ocultarPanelReemplazoMejorado();
        return;
    }
    
    // Actualizar el plato con el nuevo alimento
    platoActual.plato[indiceAReemplazar].alimento = alimentoSeleccionado;
    platoActual.plato[indiceAReemplazar].reemplazado = true;
    platoActual.plato[indiceAReemplazar].reemplazado_el = new Date().toLocaleTimeString();
    
    // Actualizar la vista
    mostrarPlato(platoActual);
    
    // Mostrar confirmación
    mostrarMensaje('success', `✅ Alimento reemplazado correctamente!\n\nNuevo: ${alimentoSeleccionado}`);
    
    // Ocultar panel de reemplazo
    ocultarPanelReemplazoMejorado();
    
    // Resetear variables
    alimentoAReemplazar = null;
    indiceAReemplazar = null;
}

function seleccionarAlimentoAleatorio() {
    if (!grupoSeleccionado || !alimentosPorGrupo[grupoSeleccionado]) {
        mostrarMensaje('error', 'Por favor, selecciona un grupo primero.');
        return;
    }
    
    const alimentos = alimentosPorGrupo[grupoSeleccionado];
    if (alimentos.length === 0) {
        mostrarMensaje('error', 'No hay alimentos disponibles en este grupo.');
        return;
    }
    
    // Filtrar el alimento actual para no seleccionarlo de nuevo
    const alimentosDisponibles = alimentos.filter(a => a !== alimentoAReemplazar?.alimento);
    
    if (alimentosDisponibles.length === 0) {
        mostrarMensaje('info', 'No hay otros alimentos disponibles en este grupo.');
        return;
    }
    
    const alimentoAleatorio = alimentosDisponibles[Math.floor(Math.random() * alimentosDisponibles.length)];
    
    // Encontrar y seleccionar el elemento correspondiente
    const items = document.querySelectorAll('.alimento-item');
    for (let item of items) {
        if (item.textContent.includes(alimentoAleatorio)) {
            // Remover selección previa
            document.querySelectorAll('.alimento-item').forEach(item => {
                item.classList.remove('selected');
                item.style.backgroundColor = '';
                item.style.borderLeft = '';
            });
            
            // Seleccionar este
            item.classList.add('selected');
            alimentoSeleccionado = alimentoAleatorio;
            
            // Resaltar visualmente
            item.style.backgroundColor = '#e3f2fd';
            item.style.borderLeft = '4px solid #3498db';
            
            // Desplazar a la vista
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
            break;
        }
    }
    
    mostrarMensaje('info', `Seleccionado aleatoriamente: ${alimentoAleatorio}`);
}

function ocultarPanelReemplazoMejorado() {
    document.getElementById('reemplazoPanel').style.display = 'none';
    document.getElementById('platoContainer').style.opacity = '1';
    document.getElementById('btnReemplazar').disabled = false;
    
    // Limpiar selección
    alimentoSeleccionado = null;
    grupoSeleccionado = null;
    alimentoAReemplazar = null;
    indiceAReemplazar = null;
    
    // Limpiar lista
    document.getElementById('alimentosList').innerHTML = '';
}