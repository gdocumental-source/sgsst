// js/services/diagnostico-service.js

/**
 * Servicios para gestión de diagnósticos
 */

import { 
    db,
    crearDiagnostico as firebaseCrearDiagnostico,
    obtenerDiagnosticosDelUsuario as firebaseObtenerDiagnosticos,
    obtenerCitasHoyDelUsuario as firebaseObtenerCitasHoy,
    actualizarEstadoDiagnostico as firebaseActualizarEstado,
    guardarRespuestasDiagnostico as firebaseGuardarRespuestas,
    escucharDiagnosticosDelUsuario as firebaseEscucharDiagnosticos,
    obtenerDiagnosticosActivosPorEmpresa as firebaseObtenerActivos,
    reagendarDiagnostico as firebaseReagendar,
    aprobarReagendamiento as firebaseAprobar,
    rechazarReagendamiento as firebaseRechazar
} from '../config/firebase-config.js';

import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { ESTADOS_PROCESO } from '../config/constants.js';
import { showAlert } from '../ui/alerts.js';

// Re-exportar funciones de Firebase
export const crearDiagnostico = firebaseCrearDiagnostico;
export const obtenerDiagnosticosDelUsuario = firebaseObtenerDiagnosticos;
export const obtenerCitasHoyDelUsuario = firebaseObtenerCitasHoy;
export const actualizarEstadoDiagnostico = firebaseActualizarEstado;
export const guardarRespuestasDiagnostico = firebaseGuardarRespuestas;
export const escucharDiagnosticosDelUsuario = firebaseEscucharDiagnosticos;
export const obtenerDiagnosticosActivosPorEmpresa = firebaseObtenerActivos;
export const reagendarDiagnostico = firebaseReagendar;
export const aprobarReagendamiento = firebaseAprobar;
export const rechazarReagendamiento = firebaseRechazar;

/**
 * Crea una cita de entrega de resultados
 * @param {string} diagnosticoOriginalId - ID del diagnóstico completado
 * @param {string} nuevaFecha - Fecha de entrega
 * @param {string} nuevaHora - Hora de entrega
 * @returns {Promise}
 */
export async function crearCitaEntregaResultados(diagnosticoOriginalId, nuevaFecha, nuevaHora, empresas, diagnosticos) {
    const diagnosticoOriginal = diagnosticos.find(d => d.id === diagnosticoOriginalId);
    if (!diagnosticoOriginal) {
        return { success: false, error: 'Diagnóstico original no encontrado' };
    }

    const empresaData = empresas.find(e => e.id === diagnosticoOriginal.empresaId);
    
    const citaEntrega = {
        empresaId: diagnosticoOriginal.empresaId,
        empresaNombre: diagnosticoOriginal.empresaNombre,
        ordenServicio: 'ENTREGA-' + diagnosticoOriginal.ordenServicio,
        titulo: '📦 Entrega de Resultados - ' + diagnosticoOriginal.ordenServicio,
        fechaAgendada: nuevaFecha,
        horaAgendada: nuevaHora,
        tipoServicio: 'entrega-resultados',
        diagnosticoOriginalId: diagnosticoOriginalId,
        notas: 'Cita para entrega de resultados del diagnóstico realizado el ' + diagnosticoOriginal.fechaAgendada,
        estado: ESTADOS_PROCESO.ENTREGA_AGENDADA
    };

    const resultado = await firebaseCrearDiagnostico(citaEntrega);
    
    if (resultado.success) {
        // Actualizar el diagnóstico original
        await firebaseActualizarEstado(diagnosticoOriginalId, ESTADOS_PROCESO.ENTREGA_AGENDADA);
    }
    
    return resultado;
}

/**
 * Elimina un diagnóstico (solo para supervisores)
 * @param {string} diagnosticoId 
 * @returns {Promise}
 */
export async function eliminarDiagnostico(diagnosticoId) {
    try {
        await deleteDoc(doc(db, 'diagnosticos', diagnosticoId));
        return { success: true };
    } catch (error) {
        console.error('Error eliminando diagnóstico:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Obtiene diagnósticos para la agenda global con filtros
 * @param {Array} diagnosticos - Todos los diagnósticos
 * @param {Object} filtros - { gestorId, periodo, estado }
 * @returns {Array} - Diagnósticos filtrados
 */
export function filtrarDiagnosticosGlobal(diagnosticos, filtros) {
    let filtrados = [...diagnosticos];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Filtrar por gestor
    if (filtros.gestorId) {
        filtrados = filtrados.filter(d => 
            d.creadoPor && d.creadoPor.uid === filtros.gestorId
        );
    }
    
    // Filtrar por período
    if (filtros.periodo === 'hoy') {
        filtrados = filtrados.filter(d => {
            if (!d.fechaAgendada) return false;
            const fechaCita = new Date(d.fechaAgendada + 'T00:00:00');
            fechaCita.setHours(0, 0, 0, 0);
            return fechaCita.getTime() === hoy.getTime();
        });
    } else if (filtros.periodo === 'semana') {
        const finSemana = new Date(hoy);
        finSemana.setDate(finSemana.getDate() + 7);
        filtrados = filtrados.filter(d => {
            if (!d.fechaAgendada) return false;
            const fechaCita = new Date(d.fechaAgendada + 'T00:00:00');
            return fechaCita >= hoy && fechaCita <= finSemana;
        });
    } else if (filtros.periodo === 'mes') {
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        filtrados = filtrados.filter(d => {
            if (!d.fechaAgendada) return false;
            const fechaCita = new Date(d.fechaAgendada + 'T00:00:00');
            return fechaCita >= primerDiaMes && fechaCita <= ultimoDiaMes;
        });
    }
    
    // Filtrar por estado
    if (filtros.estado) {
        filtrados = filtrados.filter(d => d.estado === filtros.estado);
    }
    
    return filtrados;
}