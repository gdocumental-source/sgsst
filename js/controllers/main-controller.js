// js/controllers/main-controller.js

/**
 * Controlador principal
 * Maneja la navegación entre paneles y el estado global de la aplicación
 */

import { obtenerRolUsuario } from '../services/role-service.js';
import { showAlert } from '../ui/alerts.js';

// ============================================
// VARIABLES GLOBALES
// ============================================
export let rolUsuarioActual = 'gestor';
export let empresas = [];
export let diagnosticos = [];
export let todosLosUsuarios = [];

// ============================================
// INICIALIZACIÓN
// ============================================
export function initMainController() {
    console.log('🎮 Inicializando controlador principal...');
    
    // Escuchar evento de autenticación
    document.addEventListener('user-authenticated', async (event) => {
        await verificarYMostrarPanelSupervision(event.detail.user);
    });
}

// ============================================
// NAVEGACIÓN
// ============================================
window.showPanel = function(panelName) {
    document.getElementById('menuView').style.display = 'none';
    document.querySelectorAll('.panel-view').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById('panel-' + panelName).classList.add('active');
    
    // Disparar evento para que el controlador específico cargue sus datos
    document.dispatchEvent(new CustomEvent('panel-changed', { detail: { panel: panelName } }));
};

window.backToMenu = function() {
    document.querySelectorAll('.panel-view').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById('menuView').style.display = 'grid';
};

// ============================================
// GESTIÓN DE ROLES Y SUPERVISIÓN
// ============================================
export async function verificarYMostrarPanelSupervision(user) {
    if (!user) return;
    
    try {
        rolUsuarioActual = await obtenerRolUsuario(user.uid);
        console.log('👤 Rol del usuario:', rolUsuarioActual);
        
        const menuSupervision = document.getElementById('menuSupervision');
        
        if (rolUsuarioActual === 'coordinador' || rolUsuarioActual === 'director') {
            if (menuSupervision) {
                menuSupervision.style.display = 'block';
                console.log('✅ Panel de supervisión habilitado');
            }
        } else {
            if (menuSupervision) {
                menuSupervision.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('❌ Error verificando rol:', error);
    }
}

// ============================================
// CARGA DE DATOS GLOBAL
// ============================================
export async function cargarDatosGlobales() {
    const { obtenerEmpresas } = await import('../services/empresa-service.js');
    const { obtenerDiagnosticosDelUsuario, escucharDiagnosticosDelUsuario } = await import('../services/diagnostico-service.js');
    const { escucharEmpresas } = await import('../services/empresa-service.js');
    
    empresas = await obtenerEmpresas();
    diagnosticos = await obtenerDiagnosticosDelUsuario();
    
    // Escuchar cambios en tiempo real
    escucharEmpresas((empresasActualizadas) => {
        empresas = empresasActualizadas;
        document.dispatchEvent(new CustomEvent('empresas-updated'));
    });

    escucharDiagnosticosDelUsuario((diagnosticosActualizados) => {
        diagnosticos = diagnosticosActualizados;
        document.dispatchEvent(new CustomEvent('diagnosticos-updated'));
    });
}

// ============================================
// GETTERS PARA OTROS CONTROLADORES
// ============================================
export function getEmpresas() {
    return empresas;
}

export function getDiagnosticos() {
    return diagnosticos;
}

export function getRolActual() {
    return rolUsuarioActual;
}

export function getCurrentUser() {
    return window.currentUser;
}