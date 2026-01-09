# Generador de Platos de Dieta - Web App

Aplicación web para generar platos de comida aleatorios según la dieta de 1500 calorías, basada en 6 grupos alimenticios.

## Características

- **Generación aleatoria**: Platos únicos para desayuno, almuerzo y cena
- **6 grupos alimenticios**: Organizados según la dieta de 1500 calorías
- **Sustituciones inteligentes**: Opciones para sustituir alimentos del Grupo 1
- **Interfaz moderna**: Diseño responsive y fácil de usar
- **Estadísticas**: Muestra información sobre los alimentos disponibles

## Grupos Alimenticios

1. **Grupo 1**: Lácteos descremados
2. **Grupo 2**: Proteínas (carnes, pescados, huevos, quesos)
3. **Grupo 3**: Frutas
4. **Grupo 4**: Carbohidratos (pan, cereales, granos)
5. **Grupo 5**: Vegetales
6. **Grupo 6**: Grasas (aceites, aguacate)

## Instalación

### Requisitos previos
- Node.js 14 o superior
- Navegador web moderno

### Método 1: Usando start.bat (Windows)
1. Descarga o clona este repositorio
2. Haz doble clic en `start.bat`
3. La aplicación se abrirá automáticamente

### Método 2: Instalación manual
```bash
# 1. Navegar al directorio backend
cd backend

# 2. Instalar dependencias
npm install

# 3. Inicializar base de datos
npm run init-db

# 4. Iniciar servidor
npm start

# 5. Abrir en navegador: http://localhost:3000