// js/controllers/supervision-controller.js

/**
 * Controlador de supervisión
 * Maneja estadísticas de gestores y aprobación de reagendamientos
 */

import { showAlert } from '../ui/alerts.js';
import { obtenerTodosUsuarios } from '../services/role-service.js';
import { aprobarReagendamiento, rechazarReagendamiento } from '../services/diagnostico-service.js';

// ============================================
// INICIALIZACIÓN
// ============================================
export function initSupervisionController() {
    console.log('👥 Inicializando controlador de supervisión...');
}

// ============================================
// CARGA DEL PANEL
// ============================================
export async function cargarPanelSupervision() {
    console.log('📊 Cargando panel de supervisión...');
    
    const { getDiagnosticos, getEmpresas, getCurrentUser } = require('./main-controller.js');
    const diagnosticos = getDiagnosticos();
    const empresas = getEmpresas();
    
    // Cargar usuarios
    const todosLosUsuarios = await obtenerTodosUsuarios();
    
    // Llenar selector de gestores
    const selectGestor = document.getElementById('filtroGestor');
    if (selectGestor) {
        selectGestor.innerHTML = '<option value="">Todos los gestores</option>';
        
        const gestores = todosLosUsuarios.filter(u => u.rol === 'gestor');
        gestores.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = usuario.nombre || usuario.email;
            selectGestor.appendChild(option);
        });
    }
    
    await renderSupervision(diagnosticos, empresas);
}

// ============================================
// RENDERIZADO
// ============================================
export async function renderSupervision(diagnosticos, empresas) {
    const container = document.getElementById('supervisionContent');
    if (!container) return;
    
    const gestorSeleccionado = document.getElementById('filtroGestor')?.value || '';
    const periodo = document.getElementById('filtroPeriodo')?.value || 'todo';
    
    // Filtrar diagnósticos
    let diagnosticosFiltrados = [...diagnosticos];
    
    if (gestorSeleccionado) {
        diagnosticosFiltrados = diagnosticosFiltrados.filter(d => 
            d.creadoPor && d.creadoPor.uid === gestorSeleccionado
        );
    }
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (periodo === 'hoy') {
        diagnosticosFiltrados = diagnosticosFiltrados.filter(d => {
            const fechaDiag = new Date(d.fechaAgendada + 'T00:00:00');
            fechaDiag.setHours(0, 0, 0, 0);
            return fechaDiag.getTime() === hoy.getTime();
        });
    } else if (periodo === 'mes') {
        const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        diagnosticosFiltrados = diagnosticosFiltrados.filter(d => {
            if (!d.fechaCreacion) return false;
            const fechaCreacion = d.fechaCreacion.toDate ? d.fechaCreacion.toDate() : new Date(d.fechaCreacion);
            return fechaCreacion >= primerDiaMes;
        });
    }
    
    // Reagendamientos pendientes
    const reagendamientosRecientes = diagnosticosFiltrados.filter(d => {
        const tieneMotivo = d.motivoReagendamiento && d.motivoReagendamiento.trim() !== '';
        const noAprobado = d.reagendamientoAprobado !== true;
        const noRechazado = d.reagendamientoRechazado !== true;
        
        return tieneMotivo && noAprobado && noRechazado;
    });
    
    // Agrupar por gestor
    const porGestor = {};
    diagnosticosFiltrados.forEach(diag => {
        if (!diag.creadoPor) return;
        const uid = diag.creadoPor.uid;
        if (!porGestor[uid]) {
            porGestor[uid] = {
                nombre: diag.creadoPor.nombre,
                email: diag.creadoPor.email,
                diagnosticos: []
            };
        }
        porGestor[uid].diagnosticos.push(diag);
    });
    
    // Generar HTML
    let html = `
        <!-- Resumen General -->
        <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 30px;">
            <h3 style="font-size: 22px; margin-bottom: 25px; color: #2c3e50; text-align: center;">
                📊 Resumen General
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700;">${Object.keys(porGestor).length}</div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">Gestores Activos</div>
                </div>
                <div style="background: linear-gradient(135deg, #11998e, #38ef7d); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700;">${diagnosticosFiltrados.length}</div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">Total Diagnósticos</div>
                </div>
                <div style="background: linear-gradient(135deg, #f39c12, #f1c40f); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700;">${diagnosticosFiltrados.filter(d => d.estado === 'agendado').length}</div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">Agendados</div>
                </div>
                <div style="background: linear-gradient(135deg, #eb3349, #f45c43); color: white; padding: 20px; border-radius: 12px; text-align: center;">
                    <div style="font-size: 36px; font-weight: 700;">${reagendamientosRecientes.length}</div>
                    <div style="font-size: 14px; opacity: 0.9; margin-top: 8px;">Reagendamientos Pendientes</div>
                </div>
            </div>
        </div>
    `;
    
    // Sección de reagendamientos pendientes
    if (reagendamientosRecientes.length > 0) {
        html += `
            <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 30px;">
                <h3 style="font-size: 20px; margin-bottom: 20px; color: #2c3e50;">
                    🔄 Reagendamientos Pendientes de Aprobación
                </h3>
                <div style="display: grid; gap: 15px;">
        `;
        
        reagendamientosRecientes.forEach(diag => {
            const empresa = empresas.find(e => e.id === diag.empresaId);
            html += `
                <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 12px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 15px;">
                        <div style="flex: 1; min-width: 250px;">
                            <h4 style="color: #856404; margin-bottom: 10px;">
                                ${diag.titulo}
                            </h4>
                            <p style="color: #856404; margin-bottom: 5px;">
                                <strong>Empresa:</strong> ${empresa ? empresa.nombre : 'N/A'}
                            </p>
                            <p style="color: #856404; margin-bottom: 5px;">
                                <strong>Gestor:</strong> ${diag.creadoPor.nombre}
                            </p>
                            <p style="color: #856404; margin-bottom: 5px;">
                                <strong>Nueva fecha:</strong> ${diag.fechaAgendada} - ${diag.horaAgendada}
                            </p>
                            <div style="background: white; padding: 10px; border-radius: 8px; margin-top: 10px;">
                                <strong style="color: #856404;">Motivo:</strong>
                                <p style="color: #856404; margin-top: 5px;">${diag.motivoReagendamiento}</p>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; flex-direction: column;">
                            <button onclick="window.aprobarReagendamiento('${diag.id}')" class="btn btn-success btn-sm">
                                ✅ Aprobar
                            </button>
                            <button onclick="window.abrirModalRechazo('${diag.id}')" class="btn btn-danger btn-sm">
                                ❌ Rechazar
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    } else {
        html += `
            <div style="background: #d1fae5; border: 2px solid #10b981; border-radius: 15px; padding: 30px; margin-bottom: 30px; text-align: center;">
                <h3 style="font-size: 20px; color: #065f46; margin-bottom: 10px;">
                    ✅ No hay reagendamientos pendientes
                </h3>
                <p style="color: #065f46;">
                    Todas las solicitudes de reagendamiento han sido procesadas
                </p>
            </div>
        `;
    }
    
    // Detalle por gestor
    html += `
        <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="font-size: 20px; margin-bottom: 20px; color: #2c3e50;">👥 Detalle por Gestor</h3>
    `;
    
    if (Object.keys(porGestor).length === 0) {
        html += `
            <div class="empty-state">
                <div class="empty-icon">📊</div>
                <h3>No hay datos para mostrar</h3>
                <p>Ajusta los filtros para ver información</p>
            </div>
        `;
    } else {
        Object.entries(porGestor).forEach(([uid, gestor]) => {
            const agendados = gestor.diagnosticos.filter(d => d.estado === 'agendado').length;
            const completados = gestor.diagnosticos.filter(d => d.estado === 'completado').length;
            const enviados = gestor.diagnosticos.filter(d => d.estado === 'enviado').length;
            const enProceso = gestor.diagnosticos.filter(d => d.estado === 'en-proceso').length;
            
            const reagendadosPendientes = gestor.diagnosticos.filter(d => 
                d.motivoReagendamiento && 
                d.reagendamientoAprobado !== true && 
                d.reagendamientoRechazado !== true
            ).length;
            
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            
            const citasAtrasadas = gestor.diagnosticos.filter(d => {
                if (!d.fechaAgendada) return false;
                if (d.estado !== 'agendado' && d.estado !== 'en-proceso') return false;
                
                const fechaCita = new Date(d.fechaAgendada + 'T00:00:00');
                fechaCita.setHours(0, 0, 0, 0);
                
                return fechaCita.getTime() < hoy.getTime();
            }).length;
            
            html += `
                <div style="background: #f8f9fa; border: 2px solid #e1e8ed; border-radius: 15px; padding: 25px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; flex-wrap: wrap; gap: 20px;">
                        <div style="flex: 1; min-width: 250px;">
                            <h4 style="font-size: 18px; margin-bottom: 8px; color: #2c3e50;">
                                👤 ${gestor.nombre}
                            </h4>
                            <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 10px;">${gestor.email}</p>
                            <span class="rol-badge gestor">Gestor</span>
                        </div>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 12px; flex: 2;">
                            <div style="text-align: center; padding: 12px; background: white; border-radius: 10px; border: 1px solid #e1e8ed;">
                                <div style="font-size: 24px; font-weight: 700; color: #2c3e50;">${gestor.diagnosticos.length}</div>
                                <div style="font-size: 11px; color: #7f8c8d; margin-top: 3px;">Total</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: #dbeafe; border-radius: 10px;">
                                <div style="font-size: 24px; font-weight: 700; color: #1e40af;">${agendados}</div>
                                <div style="font-size: 11px; color: #1e40af; margin-top: 3px;">Agendados</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: #fef3c7; border-radius: 10px;">
                                <div style="font-size: 24px; font-weight: 700; color: #92400e;">${enProceso}</div>
                                <div style="font-size: 11px; color: #92400e; margin-top: 3px;">En Proceso</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: #d1fae5; border-radius: 10px;">
                                <div style="font-size: 24px; font-weight: 700; color: #065f46;">${completados}</div>
                                <div style="font-size: 11px; color: #065f46; margin-top: 3px;">Completados</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: #e9d5ff; border-radius: 10px;">
                                <div style="font-size: 24px; font-weight: 700; color: #6b21a8;">${enviados}</div>
                                <div style="font-size: 11px; color: #6b21a8; margin-top: 3px;">Enviados</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: ${citasAtrasadas > 0 ? '#fee2e2' : '#f3f4f6'}; border-radius: 10px;">
                                <div style="font-size: 24px; font-weight: 700; color: ${citasAtrasadas > 0 ? '#991b1b' : '#6b7280'};">${citasAtrasadas}</div>
                                <div style="font-size: 11px; color: ${citasAtrasadas > 0 ? '#991b1b' : '#6b7280'}; margin-top: 3px;">Atrasadas</div>
                            </div>
                            <div style="text-align: center; padding: 12px; background: #fee2e2; border-radius: 10px;">
                                <div style="font-size: 24px; font-weight: 700; color: #991b1b;">${reagendadosPendientes}</div>
                                <div style="font-size: 11px; color: #991b1b; margin-top: 3px;">Reagend. Pendientes</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
    }
    
    html += '</div>';
    
    container.innerHTML = html;
}

// ============================================
// APROBACIÓN Y RECHAZO DE REAGENDAMIENTOS
// ============================================
window.aprobarReagendamiento = async function(diagnosticoId) {
    if (!confirm('¿Aprobar este reagendamiento?')) return;
    
    try {
        const resultado = await aprobarReagendamiento(diagnosticoId);
        
        if (resultado.success) {
            showAlert('✅ Reagendamiento aprobado', 'success');
            
            const { getDiagnosticos, getEmpresas } = require('./main-controller.js');
            const diagnosticos = getDiagnosticos();
            const empresas = getEmpresas();
            
            await renderSupervision(diagnosticos, empresas);
        } else {
            showAlert('❌ Error: ' + resultado.error, 'danger');
        }
    } catch (error) {
        console.error('Error aprobando reagendamiento:', error);
        showAlert('❌ Error al aprobar: ' + error.message, 'danger');
    }
};

window.abrirModalRechazo = function(diagnosticoId) {
    const { getDiagnosticos, getEmpresas } = require('./main-controller.js');
    const diagnosticos = getDiagnosticos();
    const empresas = getEmpresas();
    
    const diagnostico = diagnosticos.find(d => d.id === diagnosticoId);
    if (!diagnostico) return;
    
    const empresa = empresas.find(e => e.id === diagnostico.empresaId);
    
    document.getElementById('rechazarInfo').innerHTML = `
        <strong>Empresa:</strong> ${empresa ? empresa.nombre : 'N/A'}<br>
        <strong>Servicio:</strong> ${diagnostico.titulo}<br>
        <strong>Nueva fecha solicitada:</strong> ${diagnostico.fechaAgendada} - ${diagnostico.horaAgendada}<br>
        <strong>Motivo del gestor:</strong> ${diagnostico.motivoReagendamiento}
    `;
    
    document.getElementById('rechazarModal').classList.add('show');
    
    document.getElementById('rechazarForm').onsubmit = async function(e) {
        e.preventDefault();
        const motivo = document.getElementById('motivoRechazo').value.trim();
        
        if (!motivo) {
            showAlert('❌ Debe ingresar un motivo', 'danger');
            return;
        }
        
        try {
            const resultado = await rechazarReagendamiento(diagnosticoId, motivo);
            
            if (resultado.success) {
                showAlert('✅ Reagendamiento rechazado', 'success');
                closeRechazarModal();
                
                const { getDiagnosticos, getEmpresas } = require('./main-controller.js');
                const diagnosticos = getDiagnosticos();
                const empresas = getEmpresas();
                
                await renderSupervision(diagnosticos, empresas);
            } else {
                showAlert('❌ Error: ' + resultado.error, 'danger');
            }
        } catch (error) {
            console.error('Error rechazando:', error);
            showAlert('❌ Error: ' + error.message, 'danger');
        }
    };
};

window.closeRechazarModal = function() {
    document.getElementById('rechazarModal').classList.remove('show');
};