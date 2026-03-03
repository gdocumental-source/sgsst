// js/utils/formatters.js

/**
 * Utilidades de formateo
 */

/**
 * Formatea una fecha a string local
 * @param {Date|string} fecha - Fecha a formatear
 * @param {Object} opciones - Opciones de formato
 * @returns {string}
 */
export function formatFecha(fecha, opciones = {}) {
    if (!fecha) return 'No especificada';
    
    try {
        const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
        if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
        
        const opcionesDefault = {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            ...opciones
        };
        
        return fechaObj.toLocaleDateString('es-ES', opcionesDefault);
    } catch (error) {
        console.error('Error formateando fecha:', error);
        return 'Error en fecha';
    }
}

/**
 * Formatea una fecha para mostrar en calendario
 * @param {Date} fecha 
 * @returns {string} YYYY-MM-DD
 */
export function formatFechaISO(fecha) {
    if (!fecha) return '';
    return fecha.toISOString().split('T')[0];
}

/**
 * Obtiene el nombre del mes en español
 * @param {number} mes - 0-11
 * @returns {string}
 */
export function getNombreMes(mes) {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return meses[mes];
}

/**
 * Determina si una fecha es domingo
 * @param {Date} fecha 
 * @returns {boolean}
 */
export function esDomingo(fecha) {
    return fecha.getDay() === 0;
}

/**
 * Determina si una fecha es festivo en Colombia
 * @param {Date} fecha 
 * @param {Array} festivos - Lista de festivos en formato YYYY-MM-DD
 * @returns {boolean}
 */
export function esFestivo(fecha, festivos) {
    const fechaStr = formatFechaISO(fecha);
    return festivos.includes(fechaStr);
}

/**
 * Formatea un número como porcentaje
 * @param {number} valor 
 * @returns {string}
 */
export function formatPorcentaje(valor) {
    return `${Math.round(valor)}%`;
}

/**
 * Formatea un número de teléfono colombiano
 * @param {string} telefono 
 * @returns {string}
 */
export function formatTelefono(telefono) {
    if (!telefono) return '';
    // Ejemplo: 3001234567 -> 300 123 4567
    const limpio = telefono.replace(/\s/g, '');
    if (limpio.length === 10) {
        return `${limpio.slice(0,3)} ${limpio.slice(3,6)} ${limpio.slice(6)}`;
    }
    return telefono;
}