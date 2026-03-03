/**
 * SERVICIOS DE AUTENTICACIÓN
 * Maneja login, registro, Google Auth y observación de estado
 */

import { 
    auth,
    loginConGoogle as firebaseLoginGoogle,
    manejarRedirectGoogle as firebaseManejarRedirect,
    loginUsuario as firebaseLogin,
    registrarUsuario as firebaseRegistrar,
    cerrarSesion as firebaseCerrarSesion,
    observarEstadoAuth as firebaseObservarEstado
} from '../config/firebase-config.js';

import { showAlert } from '../ui/alerts.js';

// ============================================
// RE-EXPORTAR FUNCIONES DIRECTAS
// ============================================
export const observarEstadoAuth = firebaseObservarEstado;

// ============================================
// LOGIN CON GOOGLE
// ============================================

/**
 * Inicia sesión con Google (popup)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function loginConGoogle() {
    try {
        console.log('🔐 Iniciando login con Google (popup)...');
        
        // Mostrar indicador visual (opcional)
        const loadingAlert = document.createElement('div');
        loadingAlert.className = 'alert alert-info';
        loadingAlert.innerHTML = '<span>⏳ Conectando con Google...</span>';
        document.getElementById('alertContainer')?.appendChild(loadingAlert);
        
        const resultado = await firebaseLoginGoogle();
        
        // Eliminar indicador
        loadingAlert.remove();
        
        if (resultado.redirecting) {
            console.log('🔄 Redirigiendo a Google...');
            return resultado;
        }
        
        if (resultado.success) {
            console.log('✅ Login con Google exitoso:', resultado.user.email);
            return resultado;
        } else {
            console.error('❌ Error en login con Google:', resultado.error);
            return resultado;
        }
    } catch (error) {
        console.error('Error en loginConGoogle:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Inicia sesión con Google usando redirect
 * @returns {Promise<Object>}
 */
export async function iniciarLoginGoogleRedirect() {
    try {
        console.log('🔐 Iniciando login con Google (redirect)...');
        const { iniciarLoginGoogleRedirect } = await import('../config/firebase-config.js');
        return await iniciarLoginGoogleRedirect();
    } catch (error) {
        console.error('Error en redirect:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Maneja el resultado del redirect de Google
 * @returns {Promise<Object>}
 */
export async function manejarRedirectGoogle() {
    try {
        console.log('🔄 Procesando resultado de redirect...');
        const resultado = await firebaseManejarRedirect();
        
        if (resultado && resultado.success) {
            console.log('✅ Redirect procesado exitosamente:', resultado.user.email);
        } else if (resultado && !resultado.success) {
            console.error('❌ Error en redirect:', resultado.error);
        }
        
        return resultado;
    } catch (error) {
        console.error('Error en manejarRedirectGoogle:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// LOGIN CON EMAIL Y CONTRASEÑA
// ============================================

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise<Object>}
 */
export async function loginUsuario(email, password) {
    try {
        console.log('🔐 Iniciando login con email:', email);
        
        if (!email || !password) {
            return { success: false, error: 'Email y contraseña son requeridos' };
        }
        
        const resultado = await firebaseLogin(email, password);
        
        if (resultado.success) {
            console.log('✅ Login exitoso:', email);
        } else {
            console.error('❌ Error en login:', resultado.error);
        }
        
        return resultado;
    } catch (error) {
        console.error('Error en loginUsuario:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// REGISTRO DE NUEVO USUARIO
// ============================================

/**
 * Registra un nuevo usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {string} nombre - Nombre completo
 * @returns {Promise<Object>}
 */
export async function registrarUsuario(email, password, nombre) {
    try {
        console.log('📝 Registrando nuevo usuario:', email);
        
        if (!email || !password || !nombre) {
            return { success: false, error: 'Todos los campos son requeridos' };
        }
        
        if (password.length < 6) {
            return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
        }
        
        const resultado = await firebaseRegistrar(email, password, nombre);
        
        if (resultado.success) {
            console.log('✅ Registro exitoso:', email);
        } else {
            console.error('❌ Error en registro:', resultado.error);
        }
        
        return resultado;
    } catch (error) {
        console.error('Error en registrarUsuario:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// CIERRE DE SESIÓN
// ============================================

/**
 * Cierra la sesión del usuario actual
 * @returns {Promise<Object>}
 */
export async function cerrarSesion() {
    try {
        console.log('🚪 Cerrando sesión...');
        const resultado = await firebaseCerrarSesion();
        
        if (resultado.success) {
            console.log('✅ Sesión cerrada exitosamente');
            // Limpiar variables globales
            window.currentUser = null;
        }
        
        return resultado;
    } catch (error) {
        console.error('Error en cerrarSesion:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Obtiene el usuario actualmente autenticado
 * @returns {Object|null} Usuario de Firebase o null
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
    return auth.currentUser !== null;
}

/**
 * Obtiene el token de autenticación del usuario actual
 * @returns {Promise<string|null>}
 */
export async function getCurrentUserToken() {
    try {
        const user = auth.currentUser;
        if (!user) return null;
        return await user.getIdToken();
    } catch (error) {
        console.error('Error obteniendo token:', error);
        return null;
    }
}

/**
 * Actualiza el perfil del usuario actual
 * @param {Object} perfil - Datos del perfil a actualizar
 * @returns {Promise<Object>}
 */
export async function actualizarPerfil(perfil) {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'No hay usuario autenticado' };
        }
        
        await user.updateProfile(perfil);
        
        // Actualizar también en Firestore
        const { updateDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js');
        const { db } = await import('../config/firebase-config.js');
        
        await updateDoc(doc(db, 'usuarios', user.uid), {
            ...perfil,
            ultimaActualizacion: new Date()
        });
        
        return { success: true };
    } catch (error) {
        console.error('Error actualizando perfil:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// MANEJADOR GLOBAL DE AUTENTICACIÓN
// ============================================

/**
 * Configura el observador de autenticación y maneja la redirección inicial
 * @returns {Function} Función para desuscribirse
 */
export function setupAuth() {
    // Manejar redirect de Google al inicio
    manejarRedirectGoogle().then(resultado => {
        if (resultado && resultado.success) {
            console.log('✅ Redirect exitoso:', resultado.user.email);
            showAlert('¡Bienvenido ' + resultado.user.displayName + '!', 'success');
        } else if (resultado && !resultado.success) {
            console.error('❌ Error en redirect:', resultado.error);
        }
    }).catch(error => {
        console.error('❌ Error manejando redirect:', error);
    });
    
    // Retornar el observador para posible limpieza
    return observarEstadoAuth((user) => {
        if (user) {
            window.currentUser = user;
            document.dispatchEvent(new CustomEvent('user-authenticated', { 
                detail: { user } 
            }));
        } else {
            window.currentUser = null;
            document.dispatchEvent(new CustomEvent('user-unauthenticated'));
        }
    });
}

// ============================================
// EXPORTACIONES
// ============================================
export default {
    loginConGoogle,
    iniciarLoginGoogleRedirect,
    manejarRedirectGoogle,
    loginUsuario,
    registrarUsuario,
    cerrarSesion,
    getCurrentUser,
    isAuthenticated,
    getCurrentUserToken,
    actualizarPerfil,
    setupAuth,
    observarEstadoAuth
};