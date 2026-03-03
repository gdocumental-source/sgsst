// js/controllers/informes-controller.js

/**
 * Controlador de informes
 * Maneja la visualización de informes completados
 */

import { showAlert } from '../ui/alerts.js';
import { getEstadoIcon, getTipoServicioNombre, getNivelCumplimiento } from '../ui/render-helpers.js';
import { ESTADOS_PROCESO } from '../config/constants.js';

export function initInformesController() {
    console.log('📊 Inicializando controlador de informes...');
}

export function renderInformes() {
    const { getDiagnosticos, getCurrentUser, getEmpresas } = require('./main-controller.js');
    const diagnosticos = getDiagnosticos();
    const currentUser = getCurrentUser();
    const empresas = getEmpresas();
    
    const container = document.getElementById('informesList');
    if (!container) return;
    
    const searchTerm = document.getElementById('searchInformes')?.value.toLowerCase().trim() || '';
    
    const diagnosticosUsuario = diagnosticos.filter(d => 
        d.creadoPor && 
        d.creadoPor.uid === currentUser.uid && 
        d.resultado &&
        d.resultado.enProgreso === false &&
        (d.estado === 'completado' || d.estado === 'enviado' || d.estado === ESTADOS_PROCESO.CASO_FINALIZADO)
    );
    
    const empresasConDiagnosticos = empresas.filter(emp => {
        const diagsEmpresa = diagnosticosUsuario.filter(d => d.empresaId === emp.id);
        if (diagsEmpresa.length === 0) return false;
        
        if (searchTerm) {
            return emp.nombre.toLowerCase().includes(searchTerm) || 
                   emp.nit.toLowerCase().includes(searchTerm);
        }
        return true;
    }).sort((a, b) => a.nombre.localeCompare(b.nombre));
    
    if (empresasConDiagnosticos.length === 0) {
        container.innerHTML = searchTerm ? 
            `<div class="empty-state">🔍 No hay resultados para "${searchTerm}"</div>` :
            `<div class="empty-state">📊 No hay diagnósticos completados</div>`;
        return;
    }
    
    let html = '';
    
    if (searchTerm) {
        html += `<div class="search-results-header">🔍 Resultados para "${searchTerm}"</div>`;
    }
    
    empresasConDiagnosticos.forEach(empresa => {
        const diagnosticosCompletados = diagnosticosUsuario.filter(d => d.empresaId === empresa.id);
        const isExpanded = window.expandedInformes?.[empresa.id] || false;
        
        html += `
            <div class="empresa-card">
                <div class="empresa-header" onclick="window.toggleInforme('${empresa.id}')">
                    <div class="empresa-info">
                        <span class="chevron ${isExpanded ? 'rotate' : ''}">▶</span>
                        <div class="empresa-icon">📊</div>
                        <div class="empresa-details">
                            <h3>${empresa.nombre}</h3>
                            <p>NIT: ${empresa.nit} | ${diagnosticosCompletados.length} diagnóstico(s)</p>
                        </div>
                    </div>
                    <span class="badge">${diagnosticosCompletados.length} informe(s)</span>
                </div>
                <div class="empresa-content ${isExpanded ? 'show' : ''}">
                    ${diagnosticosCompletados.map(diag => {
                        const tipo = diag.datosDiagnostico?.tipoDiagnostico || 'N/A';
                        const nivel = getNivelCumplimiento(diag.resultado.porcentaje);
                        
                        return `
                            <div class="diagnostico-item">
                                <div class="diagnostico-info">
                                    <div style="width:60px;height:60px;border-radius:50%;background:${nivel.color};display:flex;align-items:center;justify-content:center;">
                                        <span style="color:white;font-weight:bold;">${diag.resultado.porcentaje}%</span>
                                    </div>
                                    <div>
                                        <h4>${diag.titulo}</h4>
                                        <p>📅 ${diag.fechaAgendada} | 📋 ${tipo.toUpperCase()}</p>
                                    </div>
                                </div>
                                <div class="diagnostico-actions">
                                    <button class="btn btn-primary btn-sm" onclick="window.verInformeDiagnostico('${diag.id}')">📄 Ver</button>
                                    <button class="btn btn-success btn-sm" onclick="window.generarInformePDFCompleto('${diag.id}')">📥 PDF</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

window.filtrarInformes = function() {
    renderInformes();
};

window.toggleInforme = function(empresaId) {
    if (!window.expandedInformes) window.expandedInformes = {};
    window.expandedInformes[empresaId] = !window.expandedInformes[empresaId];
    renderInformes();
};