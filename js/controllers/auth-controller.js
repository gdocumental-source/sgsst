// js/controllers/auth-controller.js

/**
 * Controlador de autenticación
 * Maneja login, registro y navegación entre pantallas
 */

import { 
    loginConGoogle, 
    manejarRedirectGoogle,
    loginUsuario,
    registrarUsuario,
    observarEstadoAuth,
    getCurrentUser
} from '../services/auth-service.js';
import { showAlert } from '../ui/alerts.js';

// ============================================
// VARIABLES GLOBALES DE ESTADO
// ============================================
window.currentUser = null;

// ============================================
// INICIALIZACIÓN
// ============================================
export function initAuth() {
    console.log('🔐 Inicializando controlador de autenticación...');
    
    // Configurar event listeners
    document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPantallaRegistro();
    });

    document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        mostrarPantallaLogin();
    });

    document.getElementById('loginForm')?.addEventListener('submit', handleLoginSubmit);
    document.getElementById('registerForm')?.addEventListener('submit', handleRegisterSubmit);
    document.getElementById('googleLoginBtn')?.addEventListener('click', handleGoogleLogin);

    // Manejar redirect de Google
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

    // Observar estado de autenticación
    observarEstadoAuth((user) => {
        if (user) {
            window.currentUser = user;
            mostrarAppPrincipal(user);
            // Disparar evento para que otros controladores sepan que el usuario está listo
            document.dispatchEvent(new CustomEvent('user-authenticated', { detail: { user } }));
        } else {
            window.currentUser = null;
            mostrarPantallaLogin();
        }
    });
}

// ============================================
// MANEJADORES DE EVENTOS
// ============================================
async function handleGoogleLogin() {
    const btn = document.getElementById('googleLoginBtn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span>Conectando con Google...</span>';
    btn.disabled = true;
    
    console.log('🔐 Iniciando login con Google...');
    const resultado = await loginConGoogle();
    
    if (resultado.redirecting) {
        console.log('🔄 Redirigiendo a Google...');
        return;
    }
    
    btn.innerHTML = originalText;
    btn.disabled = false;
    
    if (resultado.success) {
        console.log('✅ Login exitoso');
        showAlert('¡Bienvenido ' + resultado.user.displayName + '!', 'success');
    } else {
        console.error('❌ Error:', resultado.error);
        showAlert(resultado.error, 'danger');
    }
}

async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const resultado = await loginUsuario(email, password);
    if (resultado.success) {
        showAlert('¡Bienvenido!', 'success');
    } else {
        showAlert('Error: ' + resultado.error, 'danger');
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const nombre = document.getElementById('registerNombre').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const resultado = await registrarUsuario(email, password, nombre);
    if (resultado.success) {
        showAlert('Cuenta creada exitosamente. ¡Bienvenido!', 'success');
        mostrarPantallaLogin();
    } else {
        showAlert('Error: ' + resultado.error, 'danger');
    }
}

// ============================================
// FUNCIONES DE UI
// ============================================
function mostrarPantallaLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('mainApp').classList.remove('active');
}

function mostrarPantallaRegistro() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'flex';
    document.getElementById('mainApp').classList.remove('active');
}

function mostrarAppPrincipal(user) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('registerScreen').style.display = 'none';
    document.getElementById('mainApp').classList.add('active');
    
    const nombreUsuario = user.displayName || user.email.split('@')[0];
    document.getElementById('userName').textContent = nombreUsuario;
    document.getElementById('userEmail').textContent = user.email;
    
    if (user.photoURL) {
        document.getElementById('userPhoto').src = user.photoURL;
        document.getElementById('userPhoto').style.display = 'block';
        document.getElementById('userPhotoPlaceholder').style.display = 'none';
    } else {
        const initials = nombreUsuario.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        document.getElementById('userPhotoPlaceholder').textContent = initials;
        document.getElementById('userPhoto').style.display = 'none';
        document.getElementById('userPhotoPlaceholder').style.display = 'flex';
    }
}

// ============================================
// FUNCIÓN DE LOGOUT (GLOBAL)
// ============================================
window.handleLogout = async function() {
    const { cerrarSesion } = await import('../services/auth-service.js');
    const resultado = await cerrarSesion();
    if (resultado.success) {
        showAlert('Sesión cerrada exitosamente', 'success');
    }
};