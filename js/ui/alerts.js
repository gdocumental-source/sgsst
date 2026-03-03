/**
 * SISTEMA DE NOTIFICACIONES
 */

// ============================================
// ALERTAS TEMPORALES (se auto-eliminan)
// ============================================

/**
 * Muestra una alerta flotante que se auto-elimina después de 5 segundos
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'danger', 'warning', 'info'
 */
export function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        console.warn('Alert container no encontrado');
        return;
    }
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    
    const iconos = {
        success: '✅',
        danger: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    const icon = iconos[type] || 'ℹ️';
    
    alertDiv.innerHTML = `<span style="font-size: 24px;">${icon}</span><span>${message}</span>`;
    alertContainer.appendChild(alertDiv);
    
    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

// ============================================
// ALERTAS DE CARGA (requieren eliminación manual)
// ============================================

/**
 * Muestra una alerta de carga (no se auto-elimina)
 * @param {string} message - Mensaje a mostrar
 * @returns {HTMLElement} - Elemento de la alerta para eliminarlo manualmente con hideAlert()
 */
export function showLoadingAlert(message = 'Procesando...') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return null;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-info';
    alertDiv.innerHTML = `<span style="font-size: 24px;">⏳</span><span>${message}</span>`;
    alertContainer.appendChild(alertDiv);
    
    return alertDiv;
}

/**
 * Elimina una alerta específica (útil para loading alerts)
 * @param {HTMLElement} alertDiv - Elemento de la alerta a eliminar
 */
export function hideAlert(alertDiv) {
    if (alertDiv && alertDiv.parentNode) {
        alertDiv.remove();
    }
}

// ============================================
// ALERTAS DE CONFIRMACIÓN
// ============================================

/**
 * Muestra una alerta de confirmación personalizada
 * @param {string} message - Mensaje de confirmación
 * @param {Function} onConfirm - Función a ejecutar si confirma
 * @param {Function} onCancel - Función a ejecutar si cancela
 */
export function showConfirm(message, onConfirm, onCancel) {
    if (confirm(message)) {
        if (onConfirm) onConfirm();
    } else {
        if (onCancel) onCancel();
    }
}

// ============================================
// LIMPIAR TODAS LAS ALERTAS
// ============================================

/**
 * Elimina todas las alertas del contenedor
 */
export function clearAllAlerts() {
    const alertContainer = document.getElementById('alertContainer');
    if (alertContainer) {
        alertContainer.innerHTML = '';
    }
}