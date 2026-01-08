# Generador de Platos Saludables - Dieta 1500 Calorías

Aplicación completa para generar platos de comida balanceados basados en una dieta de 1500 calorías con sistema de sustituciones automáticas.

## Características Principales

### 🍽️ Sistema de Dieta 1500 Calorías
- Porciones específicas por tiempo de comida
- 6 grupos alimenticios organizados
- 133 alimentos diferentes preconfigurados
- Sistema automático de sustituciones

### 🔄 Sustituciones Inteligentes
- **Grupo 1 (Lácteos)** puede sustituirse por:
  - Grupo 2 + Grupo 3 (Proteínas + Frutas)
  - Grupo 2 + Grupo 4 (Proteínas + Cereales)
- Sustituciones automáticas y manuales
- Sistema balanceado de porciones

### 📊 Grupos Alimenticios
1. **Grupo 1**: Lácteos (4 alimentos)
2. **Grupo 2**: Proteínas (31 alimentos)
3. **Grupo 3**: Frutas (36 alimentos)
4. **Grupo 4**: Cereales (23 alimentos)
5. **Grupo 5**: Verduras (27 alimentos)
6. **Grupo 6**: Grasas (12 alimentos)

### ⏰ Tiempos de Comida
- **Desayuno**: Balance energético matutino
- **Almuerzo**: Comida principal del día
- **Cena**: Alimentación ligera nocturna

## Instalación

### Método 1: Instalador Automático (Recomendado)
1. Descarga `setup.bat`
2. Haz doble clic para ejecutar (Administrador)
3. Sigue las instrucciones en pantalla
4. ¡Listo! La aplicación se instalará automáticamente

### Método 2: Instalación Manual
```bash
# 1. Instalar Node.js desde nodejs.org
# 2. Descargar y extraer la aplicación
# 3. Ejecutar en una terminal:
cd backend
npm install
node init-db.js
node src/server.js
# 4. Abrir http://localhost:3000