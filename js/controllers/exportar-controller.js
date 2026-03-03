// js/controllers/exportar-controller.js

/**
 * Controlador de exportación
 * Maneja la generación y envío de informes PDF
 */

import { showAlert, showLoadingAlert, hideAlert } from '../ui/alerts.js';
import { getNivelCumplimiento } from '../ui/render-helpers.js';
import { ESTADOS_PROCESO, EMAILJS_CONFIG } from '../config/constants.js';
import { generarPDFBlob } from '../services/pdf-service.js';
import { actualizarEstadoDiagnostico } from '../services/diagnostico-service.js';

let historialEnvios = [];

export function initExportarController() {
    console.log('📤 Inicializando controlador de exportación...');
}

export function renderPanelEnvioInformes() {
    const { getDiagnosticos, getCurrentUser, getEmpresas } = require('./main-controller.js');
    const diagnosticos = getDiagnosticos();
    const currentUser = getCurrentUser();
    const empresas = getEmpresas();
    
    cargarHistorialEnvios(currentUser.uid);
    
    const container = document.getElementById('exportarPanelContent');
    if (!container) return;
    
    const diagnosticosUsuario = diagnosticos.filter(d => 
        d.creadoPor?.uid === currentUser.uid &&
        d.resultado &&
        d.resultado.enProgreso === false
    );
    
    const empresasConDiagnosticos = empresas.filter(emp => 
        diagnosticosUsuario.some(d => d.empresaId === emp.id)
    );
    
    // Renderizar HTML (similar al código original pero adaptado)
    // ... (el HTML que ya tienes en el código original para el panel de exportar)
    
    renderHistorialEnvios();
}

function cargarHistorialEnvios(usuarioId) {
    try {
        const historial = localStorage.getItem(`historialEnvios_${usuarioId}`);
        historialEnvios = historial ? JSON.parse(historial) : [];
    } catch (error) {
        console.warn('Error cargando historial:', error);
        historialEnvios = [];
    }
}

function guardarHistorialEnvios(usuarioId) {
    try {
        localStorage.setItem(`historialEnvios_${usuarioId}`, JSON.stringify(historialEnvios));
    } catch (error) {
        console.warn('Error guardando historial:', error);
    }
}

function renderHistorialEnvios() {
    const container = document.getElementById('historialEnvios');
    if (!container) return;
    
    if (historialEnvios.length === 0) {
        container.innerHTML = '<div class="empty-state">📭 Sin envíos recientes</div>';
        return;
    }
    
    container.innerHTML = historialEnvios.map((envio, index) => `
        <div class="historial-item">
            <div>
                <strong>${envio.empresa}</strong><br>
                <small>📧 ${envio.email}</small><br>
                <small>📊 ${envio.tipoDiagnostico} - ${envio.resultado}%</small>
            </div>
            <span class="badge-success">✓ Enviado</span>
        </div>
    `).join('');
}

window.seleccionarEmpresaEnvio = function(empresaId) {
    const { getEmpresas, getDiagnosticos, getCurrentUser } = require('./main-controller.js');
    const empresas = getEmpresas();
    const diagnosticos = getDiagnosticos();
    const currentUser = getCurrentUser();
    
    const empresa = empresas.find(e => e.id === empresaId);
    if (!empresa) return;
    
    if (!empresa.emails?.length && !empresa.email) {
        showAlert('⚠️ Esta empresa no tiene emails registrados', 'warning');
        return;
    }
    
    window.empresaParaEnvio = empresa;
    
    // ... resto de la lógica de selección
};

window.enviarInformePorCorreo = async function() {
    // ... lógica de envío (del código original)
};

window.deseleccionarEmpresa = function() {
    window.empresaParaEnvio = null;
    window.diagnosticoParaEnvio = null;
    // ... resto de la lógica
};