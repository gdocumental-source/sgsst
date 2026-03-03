/**
 * FUNCIONES AUXILIARES PARA RENDERIZADO
 */

import { ICONOS_ESTADO, NOMBRES_TIPO_SERVICIO } from '../config/constants.js';

// ============================================
// FUNCIONES DE ESTADO
// ============================================

/**
 * Obtiene el ícono para un estado
 * @param {string} estado 
 * @returns {string}
 */
export function getEstadoIcon(estado) {
    return ICONOS_ESTADO[estado] || '📋';
}

/**
 * Obtiene el nombre legible de un tipo de servicio
 * @param {string} tipo 
 * @returns {string}
 */
export function getTipoServicioNombre(tipo) {
    return NOMBRES_TIPO_SERVICIO[tipo] || tipo;
}

/**
 * Obtiene la clase CSS para un badge de estado
 * @param {string} estado 
 * @returns {string}
 */
export function getBadgeClass(estado) {
    const clases = {
        'agendado': 'badge-agendado',
        'en-proceso': 'badge-en-proceso',
        'completado': 'badge-completado',
        'entrega-agendada': 'badge-entrega-agendada',
        'entrega-realizada': 'badge-entrega-realizada',
        'finalizado': 'badge-finalizado',
        'enviado': 'badge-enviado'
    };
    return clases[estado] || 'badge-agendado';
}

/**
 * Obtiene el color de fondo para el estado
 * @param {string} estado 
 * @returns {string}
 */
export function getEstadoBackgroundColor(estado) {
    const colores = {
        'agendado': '#dbeafe',
        'en-proceso': '#fef3c7',
        'completado': '#d1fae5',
        'entrega-agendada': '#dbeafe',
        'entrega-realizada': '#d1fae5',
        'finalizado': '#e9d5ff',
        'enviado': '#e9d5ff'
    };
    return colores[estado] || '#f8f9fa';
}

/**
 * Obtiene el color de texto para el estado
 * @param {string} estado 
 * @returns {string}
 */
export function getEstadoTextColor(estado) {
    const colores = {
        'agendado': '#1e40af',
        'en-proceso': '#92400e',
        'completado': '#065f46',
        'entrega-agendada': '#1e40af',
        'entrega-realizada': '#065f46',
        'finalizado': '#6b21a8',
        'enviado': '#6b21a8'
    };
    return colores[estado] || '#2c3e50';
}

// ============================================
// FUNCIÓN NUEVA: getNivelCumplimiento
// ============================================

/**
 * Determina el nivel de cumplimiento según porcentaje
 * @param {number} porcentaje 
 * @returns {Object} - { nivel, color, gradiente }
 */
export function getNivelCumplimiento(porcentaje) {
    if (porcentaje < 60) {
        return {
            nivel: 'CRÍTICO',
            color: '#eb3349',
            gradiente: 'linear-gradient(135deg, #eb3349, #f45c43)'
        };
    } else if (porcentaje >= 61 && porcentaje <= 80) {
        return {
            nivel: 'MODERADAMENTE ACEPTABLE',
            color: '#f39c12',
            gradiente: 'linear-gradient(135deg, #f39c12, #f1c40f)'
        };
    } else {
        return {
            nivel: 'ACEPTABLE',
            color: '#11998e',
            gradiente: 'linear-gradient(135deg, #11998e, #38ef7d)'
        };
    }
}

// ============================================
// FUNCIONES DE FORMATEO ADICIONALES
// ============================================

/**
 * Formatea una fecha a string local
 * @param {Date|string} fecha 
 * @returns {string}
 */
export function formatFecha(fecha) {
    if (!fecha) return 'No especificada';
    try {
        const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
        if (isNaN(fechaObj.getTime())) return 'Fecha inválida';
        return fechaObj.toLocaleDateString('es-ES', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    } catch (error) {
        return 'Fecha inválida';
    }
}

/**
 * Formatea un número como porcentaje
 * @param {number} valor 
 * @returns {string}
 */
export function formatPorcentaje(valor) {
    return `${Math.round(valor)}%`;
}