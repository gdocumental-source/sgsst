// js/utils/validators.js

/**
 * Utilidades de validación
 */

/**
 * Valida un formato de email
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
export function validarEmail(email) {
    if (!email || email.trim() === '') return true; // Email vacío es válido (opcional)
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

/**
 * Valida que un string no esté vacío
 * @param {string} str - String a validar
 * @returns {boolean}
 */
export function noVacio(str) {
    return str && str.trim() !== '';
}

/**
 * Valida un NIT (formato básico)
 * @param {string} nit - NIT a validar
 * @returns {boolean}
 */
export function validarNit(nit) {
    if (!nit) return false;
    // Puede incluir números, guiones y dígito de verificación
    const regex = /^[0-9-]+$/;
    return regex.test(nit.trim());
}

/**
 * Valida un número de teléfono colombiano
 * @param {string} telefono 
 * @returns {boolean}
 */
export function validarTelefono(telefono) {
    if (!telefono) return true; // Opcional
    const regex = /^[0-9]{7,10}$/;
    return regex.test(telefono.replace(/\s/g, ''));
}