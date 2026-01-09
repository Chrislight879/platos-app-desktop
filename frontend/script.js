// Variables globales
let platoActual = null;
let tiempoActual = 1;
let alimentosPorGrupo = {};
let alimentoSeleccionado = null;
let grupoSeleccionado = null;

// Inicialización cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    inicializarApp();
    verificarServidor();
    cargarDatosIniciales();
    setupEventListeners();
});

function inicializarApp() {
    console.log('🍽️ Inicializando aplicación...');
    
    // Mostrar información de grupos
    mostrarGrupos();
    
    // Cargar estadísticas
    cargarEstadisticas();
}

function verificarServidor() {
    fetch('/api/health')
        .then(response => response.json())
        .then(data => {
            const statusElement = document.getElementById('serverStatus');
            statusElement.innerHTML = '<i class="fas fa-circle online"></i> Servidor conectado';
            statusElement.classList.add('online');
            console.log('✅ Servidor conectado:', data);
        })
        .catch(error => {
            const statusElement = document.getElementById('serverStatus');
            statusElement.innerHTML = '<i class="fas fa-circle offline"></i> Servidor desconectado';
            statusElement.classList.add('offline');
            console.error('❌ Error conectando al servidor:', error);
        });
}

function cargarDatosIniciales() {
    // Cargar tiempos de comida
    fetch('/api/tiempos')
        .then(response => response.json())
        .then(tiempos => {
            console.log('⏰ Tiempos cargados:', tiempos);
        })
        .catch(error => {
            console.error('Error cargando tiempos:', error);
        });
    
    // Cargar sustituciónes
    mostrarSustituciones();
}

function mostrarGrupos() {
    const grupos = [
        { id: 1, nombre: 'Grupo 1: Lácteos', color: '#3498db' },
        { id: 2, nombre: 'Grupo 2: Proteínas', color: '#e74c3c' },
        { id: 3, nombre: 'Grupo 3: Frutas', color: '#2ecc71' },
        { id: 4, nombre: 'Grupo 4: Cereales', color: '#f39c12' },
        { id: 5, nombre: 'Grupo 5: Verduras', color: '#9b59b6' },
        { id: 6, nombre: 'Grupo 6: Grasas', color: '#e67e22' }
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
            <strong>${grupo.nombre.split(':')[0]}</strong><br>
            <small>${grupo.nombre.split(':')[1]}</small>
        `;
        grupoItem.style.borderLeft = `3px solid ${grupo.color}`;
        gruposInfo.appendChild(grupoItem);
        
        // Para selector de reemplazo
        const grupoBtn = document.createElement('button');
        grupoBtn.className = 'btn btn-secondary btn-sm';
        grupoBtn.innerHTML = `${grupo.id}`;
        grupoBtn.title = grupo.nombre;
        grupoBtn.onclick = () => cargarAlimentosGrupo(grupo.id, grupo.nombre);
        gruposSelector.appendChild(grupoBtn);
    });
}

function mostrarSustituciones() {
    const sustitucionesList = document.getElementById('sustitucionesList');
    sustitucionesList.innerHTML = `
        <li><i class="fas fa-exchange-alt"></i> 1 porción de Grupo 2 + 1 porción de Grupo 3</li>
        <li><i class="fas fa-exchange-alt"></i> 1 porción de Grupo 2 + 1 porción de Grupo 4</li>
    `;
}

function cargarEstadisticas() {
    fetch('/api/estadisticas')
        .then(response => response.json())
        .then(stats => {
            const statsGrid = document.getElementById('statsGrid');
            statsGrid.innerHTML = `
                <div class="stat-card">
                    <i class="fas fa-apple-alt"></i>
                    <div class="stat-value">${stats.total_comidas}</div>
                    <div class="stat-label">Alimentos Disponibles</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-layer-group"></i>
                    <div class="stat-value">${stats.total_grupos}</div>
                    <div class="stat-label">Grupos Alimenticios</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-clock"></i>
                    <div class="stat-value">${stats.total_tiempos}</div>
                    <div class="stat-label">Tiempos de Comida</div>
                </div>
                <div class="stat-card">
                    <i class="fas fa-exchange-alt"></i>
                    <div class="stat-value">${stats.total_sustituciones}</div>
                    <div class="stat-label">Sustituciones</div>
                </div>
            `;
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
    document.getElementById('btnReemplazar').addEventListener('click', mostrarPanelReemplazo);
    
    // Botón Cancelar Reemplazo
    document.getElementById('btnCancelarReemplazo').addEventListener('click', ocultarPanelReemplazo);
    
    // Botón Seleccionar Alimento
    document.getElementById('btnSeleccionarAlimento').addEventListener('click', seleccionarAlimento);
    
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
    
    fetch(`/api/plato/generar?tiempo=${tiempoActual}`)
        .then(response => response.json())
        .then(data => {
            platoActual = data;
            mostrarPlato(data);
        })
        .catch(error => {
            console.error('Error generando plato:', error);
            alert('Error al generar el plato. Por favor, intenta de nuevo.');
        });
}

function generarPlatoAleatorio() {
    console.log('🎲 Generando plato con tiempo aleatorio');
    
    fetch('/api/plato/aleatorio')
        .then(response => response.json())
        .then(data => {
            platoActual = data;
            tiempoActual = data.tiempo_id;
            document.getElementById('tiempoComida').value = tiempoActual;
            mostrarPlato(data);
        })
        .catch(error => {
            console.error('Error generando plato aleatorio:', error);
            alert('Error al generar el plato aleatorio.');
        });
}

function mostrarPlato(platoData) {
    const platoContainer = document.getElementById('platoContainer');
    const tiempoInfo = document.getElementById('tiempoInfo');
    
    // Actualizar información del tiempo
    tiempoInfo.innerHTML = `<h3>${platoData.tiempo_comida}</h3>`;
    
    // Mostrar alimentos del plato
    platoContainer.innerHTML = '';
    
    platoData.plato.forEach((alimento, index) => {
        const alimentoCard = document.createElement('div');
        alimentoCard.className = `alimento-card ${alimento.es_sustitucion ? 'sustitucion' : ''}`;
        
        let sustituyeInfo = '';
        if (alimento.es_sustitucion) {
            sustituyeInfo = `<div class="sustitucion-badge">Sustituye a ${alimento.sustituye_a}</div>`;
        }
        
        alimentoCard.innerHTML = `
            <div class="alimento-info">
                <h4>${alimento.alimento}</h4>
                <p class="alimento-desc">${alimento.porcion}</p>
            </div>
            <div class="alimento-meta">
                <span class="alimento-grupo">${alimento.grupo}</span>
                <span class="alimento-porcion">${alimento.porcion}</span>
                ${sustituyeInfo}
            </div>
        `;
        
        // Agregar evento de clic para ver detalles
        alimentoCard.addEventListener('click', () => mostrarDetalleAlimento(alimento, index));
        
        platoContainer.appendChild(alimentoCard);
    });
    
    // Agregar contador
    const contador = document.createElement('div');
    contador.className = 'plato-contador';
    contador.innerHTML = `<p><strong>Total:</strong> ${platoData.total_alimentos} alimentos en este plato</p>`;
    platoContainer.appendChild(contador);
}

function mostrarDetalleAlimento(alimento, index) {
    const modal = document.getElementById('alimentoModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    let sustituyeInfo = '';
    if (alimento.es_sustitucion) {
        sustituyeInfo = `<p><strong><i class="fas fa-exchange-alt"></i> Sustituye a:</strong> ${alimento.sustituye_a}</p>`;
    }
    
    modalTitle.textContent = alimento.alimento;
    modalBody.innerHTML = `
        <div class="detalle-alimento">
            <p><strong><i class="fas fa-layer-group"></i> Grupo:</strong> ${alimento.grupo}</p>
            <p><strong><i class="fas fa-balance-scale"></i> Porción:</strong> ${alimento.porcion}</p>
            ${sustituyeInfo}
            <p><strong><i class="fas fa-info-circle"></i> Información:</strong> Este alimento es parte de una dieta balanceada de 1500 calorías.</p>
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
    alert(`Has seleccionado: ${platoActual.plato[index].alimento}`);
    cerrarModal();
}

function mostrarPanelReemplazo() {
    if (!platoActual) {
        alert('Primero genera un plato para poder reemplazar alimentos.');
        return;
    }
    
    document.getElementById('reemplazoPanel').style.display = 'block';
    document.getElementById('platoContainer').style.display = 'none';
}

function ocultarPanelReemplazo() {
    document.getElementById('reemplazoPanel').style.display = 'none';
    document.getElementById('platoContainer').style.display = 'block';
}

function cargarAlimentosGrupo(grupoId, grupoNombre) {
    grupoSeleccionado = grupoId;
    
    fetch(`/api/grupos/${grupoId}/comidas`)
        .then(response => response.json())
        .then(alimentos => {
            alimentosPorGrupo[grupoId] = alimentos;
            mostrarAlimentosGrupo(alimentos, grupoNombre);
        })
        .catch(error => {
            console.error('Error cargando alimentos del grupo:', error);
            alert('Error al cargar los alimentos del grupo.');
        });
}

function mostrarAlimentosGrupo(alimentos, grupoNombre) {
    const alimentosList = document.getElementById('alimentosList');
    alimentosList.innerHTML = '';
    
    // Título
    const titulo = document.createElement('div');
    titulo.className = 'alimento-item titulo';
    titulo.innerHTML = `<strong>${grupoNombre} - ${alimentos.length} alimentos disponibles</strong>`;
    alimentosList.appendChild(titulo);
    
    // Lista de alimentos
    alimentos.forEach((alimento, index) => {
        const alimentoItem = document.createElement('div');
        alimentoItem.className = 'alimento-item';
        alimentoItem.textContent = alimento;
        alimentoItem.dataset.index = index;
        
        alimentoItem.addEventListener('click', function() {
            // Remover selección previa
            document.querySelectorAll('.alimento-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Seleccionar este
            this.classList.add('selected');
            alimentoSeleccionado = alimento;
        });
        
        alimentosList.appendChild(alimentoItem);
    });
}

function seleccionarAlimento() {
    if (!alimentoSeleccionado) {
        alert('Por favor, selecciona un alimento de la lista.');
        return;
    }
    
    if (!grupoSeleccionado) {
        alert('Por favor, selecciona un grupo primero.');
        return;
    }
    
    // Aquí implementarías la lógica para reemplazar el alimento en el plato actual
    alert(`Has seleccionado: ${alimentoSeleccionado}\n\nEsta funcionalidad completa requeriría modificar el plato actual en el servidor.`);
    
    // Ocultar panel de reemplazo
    ocultarPanelReemplazo();
}

function seleccionarAlimentoAleatorio() {
    if (!grupoSeleccionado || !alimentosPorGrupo[grupoSeleccionado]) {
        alert('Por favor, selecciona un grupo primero.');
        return;
    }
    
    const alimentos = alimentosPorGrupo[grupoSeleccionado];
    const alimentoAleatorio = alimentos[Math.floor(Math.random() * alimentos.length)];
    
    // Seleccionar aleatoriamente
    document.querySelectorAll('.alimento-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // Encontrar y seleccionar el elemento correspondiente
    const items = document.querySelectorAll('.alimento-item');
    for (let item of items) {
        if (item.textContent === alimentoAleatorio) {
            item.classList.add('selected');
            break;
        }
    }
    
    alimentoSeleccionado = alimentoAleatorio;
    alert(`Seleccionado aleatoriamente: ${alimentoAleatorio}`);
}