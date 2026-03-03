// js/services/role-service.js

/**
 * Servicios de gestión de roles
 */

import { 
    obtenerRolUsuario as firebaseObtenerRol,
    obtenerTodosUsuarios as firebaseObtenerTodos,
    sincronizarRolesDeTodosLosUsuarios as firebaseSincronizarTodos
} from '../config/firebase-config.js';

// Re-exportar funciones de Firebase
export const obtenerRolUsuario = firebaseObtenerRol;
export const obtenerTodosUsuarios = firebaseObtenerTodos;
export const sincronizarRolesDeTodosLosUsuarios = firebaseSincronizarTodos;

/**
 * Determina el rol según el email (lógica local)
 * @param {string} email 
 * @returns {string} - 'director', 'coordinador', o 'gestor'
 */
export function determinarRolPorEmail(email) {
    if (!email) return 'gestor';
    
    const emailLower = email.toLowerCase().trim();
    
    // ⚠️ Lista de emails con rol de director
    const directores = [
        'gdocumental@centrojuridicointernacional.com',
        'talento@centrojuridicointernacional.com',
        'cjinegocios@centrojuridicointernacional.com',
        'cjinegocios@hotmail.com'
    ];
    
    // ⚠️ Lista de emails con rol de coordinador
    const coordinadores = [
        'talento@centrojuridicointernacional.com',
        'gdocumental@centrojuridicointernacional.com'
    ];
    
    if (directores.some(e => e.toLowerCase() === emailLower)) {
        return 'director';
    }
    
    if (coordinadores.some(e => e.toLowerCase() === emailLower)) {
        return 'coordinador';
    }
    
    return 'gestor';
}

/**
 * Verifica si el usuario tiene permisos de supervisor
 * @param {string} rol 
 * @returns {boolean}
 */
export function esSupervisor(rol) {
    return rol === 'coordinador' || rol === 'director';
}

/**
 * Verifica si el usuario tiene permisos de administrador
 * @param {string} rol 
 * @returns {boolean}
 */
export function esAdministrador(rol) {
    return rol === 'director';
}