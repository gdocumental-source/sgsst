// js/services/empresa-service.js

/**
 * Servicios para gestión de empresas
 */

import { 
    db,
    crearEmpresa as firebaseCrearEmpresa,
    obtenerEmpresas as firebaseObtenerEmpresas,
    actualizarEmpresa as firebaseActualizarEmpresa,
    escucharEmpresas as firebaseEscucharEmpresas,
    buscarEmpresaPorNitONombre as firebaseBuscarEmpresa
} from '../config/firebase-config.js';

import { collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { showAlert } from '../ui/alerts.js';
import { validarEmail, noVacio, validarNit } from '../utils/validators.js';

// Re-exportar funciones de Firebase
export const crearEmpresa = firebaseCrearEmpresa;
export const obtenerEmpresas = firebaseObtenerEmpresas;
export const actualizarEmpresa = firebaseActualizarEmpresa;
export const escucharEmpresas = firebaseEscucharEmpresas;
export const buscarEmpresaPorNitONombre = firebaseBuscarEmpresa;

/**
 * Procesa el string de emails múltiples
 * @param {string} emailsInput - String con emails separados por comas
 * @returns {Object} - { emailsArray, error }
 */
export function procesarEmails(emailsInput) {
    let emailsArray = [];
    
    if (emailsInput && emailsInput.trim() !== '') {
        emailsArray = emailsInput
            .split(',')
            .map(email => email.trim())
            .filter(email => email !== '');
        
        // Validar cada email
        for (const email of emailsArray) {
            if (!validarEmail(email)) {
                return { 
                    emailsArray: [], 
                    error: `El email "${email}" no es válido` 
                };
            }
        }
    }
    
    return { emailsArray, error: null };
}

/**
 * Prepara los datos de empresa para guardar
 * @param {Object} formData - Datos del formulario
 * @returns {Object} - Datos procesados
 */
export function prepararDatosEmpresa(formData) {
    const { emailsArray, error } = procesarEmails(formData.emailsInput);
    
    if (error) {
        return { success: false, error };
    }
    
    return {
        success: true,
        data: {
            nombre: formData.nombre.trim(),
            nit: formData.nit.trim(),
            trabajadores: parseInt(formData.trabajadores),
            responsable: formData.responsable?.trim() || '',
            telefono: formData.telefono?.trim() || '',
            emails: emailsArray,
            email: emailsArray.length > 0 ? emailsArray[0] : ''
        }
    };
}

/**
 * Valida los datos básicos de una empresa
 * @param {Object} data 
 * @returns {Object} - { isValid, error }
 */
export function validarDatosEmpresa(data) {
    if (!noVacio(data.nombre)) {
        return { isValid: false, error: 'El nombre de la empresa es requerido' };
    }
    
    if (!noVacio(data.nit)) {
        return { isValid: false, error: 'El NIT es requerido' };
    }
    
    if (!validarNit(data.nit)) {
        return { isValid: false, error: 'El NIT no tiene un formato válido' };
    }
    
    if (!data.trabajadores || data.trabajadores < 1) {
        return { isValid: false, error: 'El número de trabajadores debe ser mayor a 0' };
    }
    
    return { isValid: true, error: null };
}