// js/services/calendar-service.js

/**
 * Servicios para gestión de calendario y disponibilidad
 */

import { verificarDisponibilidad as firebaseVerificarDisponibilidad } from '../config/firebase-config.js';
import { HORARIOS_DISPONIBLES, FESTIVOS_COLOMBIA } from '../config/constants.js';
import { esDomingo, esFestivo, formatFechaISO, getNombreMes } from '../utils/formatters.js';

// Re-exportar
export const verificarDisponibilidad = firebaseVerificarDisponibilidad;
export const horariosDisponibles = HORARIOS_DISPONIBLES;

/**
 * Obtiene los días de un mes para renderizar calendario
 * @param {Date} fecha - Fecha del mes a calcular
 * @returns {Object} - Información del mes
 */
export function obtenerDiasMes(fecha) {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasMesAnterior = new Date(año, mes, 0).getDate();
    
    const dias = [];
    
    // Días del mes anterior
    for (let i = primerDia.getDay() - 1; i >= 0; i--) {
        dias.push({
            dia: diasMesAnterior - i,
            fecha: new Date(año, mes - 1, diasMesAnterior - i),
            esOtroMes: true
        });
    }
    
    // Días del mes actual
    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
        dias.push({
            dia: dia,
            fecha: new Date(año, mes, dia),
            esOtroMes: false
        });
    }
    
    // Completar para tener 42 días (6 semanas)
    const diasRestantes = 42 - dias.length;
    for (let dia = 1; dia <= diasRestantes; dia++) {
        dias.push({
            dia: dia,
            fecha: new Date(año, mes + 1, dia),
            esOtroMes: true
        });
    }
    
    return {
        dias,
        nombreMes: getNombreMes(mes),
        año,
        mes
    };
}

/**
 * Verifica si una fecha está disponible para agendar
 * @param {Date} fecha 
 * @param {Array} diagnosticos - Lista de diagnósticos existentes
 * @param {string} usuarioId - ID del usuario actual
 * @param {string} [excluirId] - ID de diagnóstico a excluir (para reagendar)
 * @returns {boolean}
 */
export function fechaDisponible(fecha, diagnosticos, usuarioId, excluirId = null) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaStr = formatFechaISO(fecha);
    
    // No permitir fechas pasadas
    if (fecha.getTime() < hoy.getTime()) {
        return false;
    }
    
    // No permitir domingos
    if (esDomingo(fecha)) {
        return false;
    }
    
    // No permitir festivos
    if (esFestivo(fecha, FESTIVOS_COLOMBIA)) {
        return false;
    }
    
    return true;
}

/**
 * Obtiene horarios disponibles para una fecha
 * @param {Date} fecha 
 * @param {Array} diagnosticos - Lista de diagnósticos
 * @param {string} usuarioId - ID del usuario actual
 * @param {string} [excluirId] - ID a excluir
 * @returns {Array} - Horarios con información de disponibilidad
 */
export function obtenerHorariosDisponibles(fecha, diagnosticos, usuarioId, excluirId = null) {
    const fechaStr = formatFechaISO(fecha);
    const ahora = new Date();
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const esHoy = fecha.getTime() === hoy.getTime();
    
    // Obtener horarios ocupados por el usuario actual (excluyendo el diagnóstico actual si se especifica)
    const horariosOcupados = diagnosticos
        .filter(d => 
            d.fechaAgendada === fechaStr && 
            d.creadoPor && 
            d.creadoPor.uid === usuarioId &&
            d.id !== excluirId
        )
        .map(d => d.horaAgendada);
    
    return HORARIOS_DISPONIBLES.map(horario => {
        // Verificar si el horario ya pasó (solo para hoy)
        let horarioPasado = false;
        if (esHoy) {
            const [horaInicio] = horario.split(' - ');
            const [hora, minuto] = horaInicio.split(':');
            const ampm = horaInicio.split(' ')[1];
            
            let horaNum = parseInt(hora);
            if (ampm === 'PM' && horaNum !== 12) horaNum += 12;
            if (ampm === 'AM' && horaNum === 12) horaNum = 0;
            
            const horarioCita = new Date();
            horarioCita.setHours(horaNum, parseInt(minuto), 0, 0);
            
            horarioPasado = horarioCita < ahora;
        }
        
        const ocupado = horariosOcupados.includes(horario);
        
        return {
            horario,
            disponible: !ocupado && !horarioPasado,
            ocupado,
            pasado: horarioPasado
        };
    });
}