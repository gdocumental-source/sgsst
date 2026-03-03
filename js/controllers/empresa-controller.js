/**
 * CONTROLADOR DE EMPRESAS
 * Maneja la UI de listado, búsqueda y creación de empresas
 */

import { showAlert } from '../ui/alerts.js';
import { getEstadoIcon, getTipoServicioNombre } from '../ui/render-helpers.js';
import { ESTADOS_PROCESO } from '../config/constants.js';
import { 
    crearEmpresa, 
    actualizarEmpresa,
    buscarEmpresaPorNitONombre,
    prepararDatosEmpresa,
    validarDatosEmpresa
} from '../services/empresa-service.js';

// ============================================
// VARIABLES DE ESTADO (desde window)
// ============================================
let currentUser = null;
let empresas = [];
let diagnosticos = [];
let expandedEmpresas = {};

// ============================================
// FUNCIONES PARA OBTENER DATOS GLOBALES
// ============================================

function actualizarDatosGlobales() {
    // Obtener datos de window (donde main-controller los guarda)
    currentUser = window.currentUser || null;
    empresas = window.empresas || [];
    diagnosticos = window.diagnosticos || [];
    
    // También intentar desde el objeto global si existe
    if (window.appState) {
        currentUser = window.appState.currentUser || currentUser;
        empresas = window.appState.empresas || empresas;
        diagnosticos = window.appState.diagnosticos || diagnosticos;
    }
}

// Escuchar eventos de actualización
document.addEventListener('user-authenticated', (e) => {
    currentUser = e.detail.user;
    actualizarDatosGlobales();
});

document.addEventListener('empresas-updated', () => {
    actualizarDatosGlobales();
    if (document.getElementById('panel-empresas')?.classList.contains('active')) {
        renderEstadisticasUsuario();
    }
});

document.addEventListener('diagnosticos-updated', () => {
    actualizarDatosGlobales();
    if (document.getElementById('panel-empresas')?.classList.contains('active')) {
        renderEstadisticasUsuario();
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================

export function initEmpresaController() {
    console.log('🏢 Inicializando controlador de empresas...');
    
    actualizarDatosGlobales();
    
    const empresaForm = document.getElementById('empresaForm');
    if (empresaForm) {
        empresaForm.addEventListener('submit', handleEmpresaSubmit);
    }
    
    const empresaModal = document.getElementById('empresaModal');
    if (empresaModal) {
        empresaModal.addEventListener('click', function(e) {
            if (e.target === this) closeEmpresaModal();
        });
    }
}

// ============================================
// RENDERIZADO DE ESTADÍSTICAS
// ============================================

export function renderEstadisticasUsuario() {
    actualizarDatosGlobales();
    
    const container = document.getElementById('estadisticasUsuario');
    if (!container) return;
    
    if (!currentUser) {
        container.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Cargando...</p>';
        return;
    }
    
    // Filtrar solo las empresas creadas por el usuario actual
    const empresasDelUsuario = empresas.filter(emp => 
        emp.creadoPor && emp.creadoPor.uid === currentUser.uid
    );
    
    // Filtrar diagnósticos del usuario
    const diagnosticosDelUsuario = diagnosticos.filter(diag => 
        diag.creadoPor && diag.creadoPor.uid === currentUser.uid
    );
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
    
    // Estadísticas del DÍA
    const agendadasHoy = diagnosticosDelUsuario.filter(diag => {
        const fechaDiag = new Date(diag.fechaAgendada + 'T00:00:00');
        fechaDiag.setHours(0, 0, 0, 0);
        return fechaDiag.getTime() === hoy.getTime() && diag.estado === 'agendado';
    }).length;
    
    const reagendadasHoy = diagnosticosDelUsuario.filter(diag => {
        if (!diag.fechaReagendamiento) return false;
        const fechaReagendar = diag.fechaReagendamiento.toDate ? 
            diag.fechaReagendamiento.toDate() : new Date(diag.fechaReagendamiento);
        fechaReagendar.setHours(0, 0, 0, 0);
        return fechaReagendar.getTime() === hoy.getTime();
    }).length;
    
    const empresasCreadasHoy = empresasDelUsuario.filter(emp => {
        if (!emp.fechaCreacion) return false;
        const fechaCreacion = emp.fechaCreacion.toDate ? 
            emp.fechaCreacion.toDate() : new Date(emp.fechaCreacion);
        fechaCreacion.setHours(0, 0, 0, 0);
        return fechaCreacion.getTime() === hoy.getTime();
    }).length;
    
    // Estadísticas del MES
    const agendadasMes = diagnosticosDelUsuario.filter(diag => {
        if (!diag.fechaCreacion) return false;
        const fechaCreacion = diag.fechaCreacion.toDate ? 
            diag.fechaCreacion.toDate() : new Date(diag.fechaCreacion);
        return fechaCreacion >= primerDiaMes && diag.estado === 'agendado';
    }).length;
    
    const reagendadasMes = diagnosticosDelUsuario.filter(diag => {
        if (!diag.fechaReagendamiento) return false;
        const fechaReagendar = diag.fechaReagendamiento.toDate ? 
            diag.fechaReagendamiento.toDate() : new Date(diag.fechaReagendamiento);
        return fechaReagendar >= primerDiaMes;
    }).length;
    
    const empresasCreadasMes = empresasDelUsuario.filter(emp => {
        if (!emp.fechaCreacion) return false;
        const fechaCreacion = emp.fechaCreacion.toDate ? 
            emp.fechaCreacion.toDate() : new Date(emp.fechaCreacion);
        return fechaCreacion >= primerDiaMes;
    }).length;
    
    container.innerHTML = `
        <div style="background: white; border-radius: 15px; padding: 30px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
            <h3 style="font-size: 22px; margin-bottom: 25px; color: #2c3e50; text-align: center;">
                📊 Estadísticas de Gestión
            </h3>
            
            <!-- Estadísticas del DÍA -->
            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                <h4 style="font-size: 18px; margin-bottom: 15px; text-align: center; opacity: 0.95;">
                    📅 Hoy - ${hoy.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700;">${empresasCreadasHoy}</div>
                        <div style="font-size: 13px; opacity: 0.9; margin-top: 5px;">Empresas Creadas</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700;">${agendadasHoy}</div>
                        <div style="font-size: 13px; opacity: 0.9; margin-top: 5px;">Citas Agendadas</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700;">${reagendadasHoy}</div>
                        <div style="font-size: 13px; opacity: 0.9; margin-top: 5px;">Citas Reagendadas</div>
                    </div>
                </div>
            </div>
            
            <!-- Estadísticas del MES -->
            <div style="background: linear-gradient(135deg, #11998e, #38ef7d); color: white; padding: 20px; border-radius: 12px;">
                <h4 style="font-size: 18px; margin-bottom: 15px; text-align: center; opacity: 0.95;">
                    📆 Este Mes - ${hoy.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700;">${empresasCreadasMes}</div>
                        <div style="font-size: 13px; opacity: 0.9; margin-top: 5px;">Empresas Creadas</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700;">${agendadasMes}</div>
                        <div style="font-size: 13px; opacity: 0.9; margin-top: 5px;">Citas Agendadas</div>
                    </div>
                    <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 10px; text-align: center;">
                        <div style="font-size: 32px; font-weight: 700;">${reagendadasMes}</div>
                        <div style="font-size: 13px; opacity: 0.9; margin-top: 5px;">Citas Reagendadas</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// BÚSQUEDA DE EMPRESAS
// ============================================

window.buscarEmpresaExacta = async function() {
    actualizarDatosGlobales();
    
    const searchTerm = document.getElementById('searchEmpresas')?.value.trim();
    
    if (!searchTerm) {
        showAlert('Por favor ingrese un nombre o NIT para buscar', 'warning');
        return;
    }
    
    const container = document.getElementById('empresasList');
    if (!container) return;
    
    container.innerHTML = '<div style="text-align: center; padding: 40px;"><p style="font-size: 18px; color: #7f8c8d;">🔍 Buscando...</p></div>';
    
    // Buscar coincidencias exactas
    const empresasEncontradas = empresas.filter(emp => 
        emp.nombre?.toLowerCase().trim() === searchTerm.toLowerCase() || 
        emp.nit?.trim() === searchTerm.trim()
    );
    
    if (empresasEncontradas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔍</div>
                <h3>No se encontró ninguna empresa</h3>
                <p>No existe una empresa con el nombre o NIT: "<strong>${searchTerm}</strong>"</p>
                <button onclick="window.openEmpresaModal()" class="btn btn-success" style="margin-top: 20px;">
                    Crear Nueva Empresa
                </button>
            </div>
        `;
        return;
    }
    
    await renderEmpresaEncontrada(empresasEncontradas[0]);
};

// ============================================
// RENDERIZAR EMPRESA ENCONTRADA
// ============================================

async function renderEmpresaEncontrada(empresa) {
    actualizarDatosGlobales();
    
    const container = document.getElementById('empresasList');
    if (!container) return;
    
    const diagnosticosEmpresa = diagnosticos.filter(d => d.empresaId === empresa.id);
    
    const diagnosticosActivosTodos = diagnosticosEmpresa.filter(d => 
        d.estado === ESTADOS_PROCESO.DIAGNOSTICO_AGENDADO ||
        d.estado === ESTADOS_PROCESO.DIAGNOSTICO_EN_PROCESO ||
        d.estado === ESTADOS_PROCESO.DIAGNOSTICO_COMPLETADO ||
        d.estado === ESTADOS_PROCESO.ENTREGA_AGENDADA
    );
    
    let warningHTML = '';
    let puedeAgendar = true;
    let diagnosticoActivoPropio = null;
    let diagnosticoActivoDeOtro = null;
    
    if (diagnosticosActivosTodos.length > 0 && currentUser) {
        diagnosticoActivoPropio = diagnosticosActivosTodos.find(d => d.creadoPor?.uid === currentUser.uid);
        diagnosticoActivoDeOtro = diagnosticosActivosTodos.find(d => d.creadoPor?.uid !== currentUser.uid);
        
        if (diagnosticoActivoDeOtro) {
            puedeAgendar = false;
            const estadoTexto = diagnosticoActivoDeOtro.estado?.replace(/-/g, ' ').toUpperCase() || '';
            warningHTML = `
                <div class="warning-box">
                    <h4>⚠️ Empresa en proceso con otro consultor</h4>
                    <p><strong>Estado:</strong> ${estadoTexto}</p>
                    <p><strong>A cargo de:</strong> ${diagnosticoActivoDeOtro.creadoPor?.nombre || 'N/A'} (${diagnosticoActivoDeOtro.creadoPor?.email || 'N/A'})</p>
                    <p><strong>Fecha agendada:</strong> ${diagnosticoActivoDeOtro.fechaAgendada || 'N/A'} a las ${diagnosticoActivoDeOtro.horaAgendada || 'N/A'}</p>
                </div>
            `;
        } else if (diagnosticoActivoPropio) {
            puedeAgendar = false;
            const estadoTexto = diagnosticoActivoPropio.estado?.replace(/-/g, ' ').toUpperCase() || '';
            
            let mensajeEstado = '';
            if (diagnosticoActivoPropio.estado === ESTADOS_PROCESO.DIAGNOSTICO_COMPLETADO) {
                mensajeEstado = '✅ Diagnóstico completado - Pendiente agendar entrega de resultados';
            } else if (diagnosticoActivoPropio.estado === ESTADOS_PROCESO.ENTREGA_AGENDADA) {
                mensajeEstado = '📦 Entrega de resultados agendada - Pendiente realizar entrega';
            } else {
                mensajeEstado = 'Proceso en curso';
            }
            
            warningHTML = `
                <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
                    <h4 style="color: #856404; margin-bottom: 10px; font-size: 18px;">📋 ${mensajeEstado}</h4>
                    <p style="color: #856404; margin-bottom: 8px;"><strong>Estado:</strong> ${estadoTexto}</p>
                    <p style="color: #856404; margin-bottom: 8px;"><strong>Orden de Servicio:</strong> ${diagnosticoActivoPropio.ordenServicio || 'N/A'}</p>
                    <p style="color: #856404; margin-bottom: 8px;"><strong>Fecha agendada:</strong> ${diagnosticoActivoPropio.fechaAgendada || 'N/A'} a las ${diagnosticoActivoPropio.horaAgendada || 'N/A'}</p>
                    <p style="color: #856404;"><strong>Tipo:</strong> ${getTipoServicioNombre(diagnosticoActivoPropio.tipoServicio)}</p>
                </div>
            `;
        }
    }
    
    let diagnosticosHTML = '';
    if (diagnosticosEmpresa.length === 0) {
        diagnosticosHTML = '<p style="text-align: center; color: #95a5a6; padding: 40px; font-size: 16px;">No hay diagnósticos registrados</p>';
    } else {
        diagnosticosHTML = '<div>' + diagnosticosEmpresa.map(diag => {
            const creadoPor = diag.creadoPor ? diag.creadoPor.nombre : 'Sistema';
            const esPropio = currentUser && diag.creadoPor && diag.creadoPor.uid === currentUser.uid;
            
            return `<div class="diagnostico-item">
                <div class="diagnostico-info">
                    <div class="diagnostico-status-icon status-${diag.estado}">${getEstadoIcon(diag.estado)}</div>
                    <div class="diagnostico-details">
                        <h4>${diag.titulo || 'Sin título'}</h4>
                        <p>📅 ${diag.fechaAgendada || 'N/A'} a las ${diag.horaAgendada || 'N/A'}</p>
                        <span class="user-badge">Por: ${creadoPor} ${esPropio ? '(Tú)' : ''}</span>
                    </div>
                </div>
                <div class="diagnostico-actions">
                    <span class="badge-status badge-${diag.estado}">${diag.estado?.replace('-', ' ') || 'N/A'}</span>
                </div>
            </div>`;
        }).join('') + '</div>';
    }

    const creadoPor = empresa.creadoPor ? empresa.creadoPor.nombre : 'Sistema';
    const empresaClass = diagnosticoActivoDeOtro ? 'empresa-card ocupada' : 'empresa-card';
    
    container.innerHTML = `<div class="${empresaClass}">
        <div class="empresa-header">
            <div class="empresa-info">
                <div class="empresa-icon">${diagnosticoActivoDeOtro ? '🔒' : diagnosticoActivoPropio ? '📅' : '🏢'}</div>
                <div class="empresa-details">
                    <h3>${empresa.nombre || 'Sin nombre'}</h3>
                    <p>NIT: ${empresa.nit || 'N/A'} | ${empresa.trabajadores || 0} trabajadores</p>
                    <span class="user-badge">Creado por: ${creadoPor}</span>
                </div>
            </div>
            <div class="empresa-actions">
                ${diagnosticoActivoDeOtro ? '<span class="badge badge-ocupado">Ocupada</span>' : 
                  diagnosticoActivoPropio ? '<span class="badge" style="background: #f39c12;">Cita Activa</span>' : 
                  '<span class="badge">' + diagnosticosEmpresa.length + ' diagnósticos</span>'}
                <button class="icon-btn" onclick="window.editarEmpresa('${empresa.id}')">✏️</button>
            </div>
        </div>
        <div class="empresa-content show">
            ${warningHTML}
            <div class="empresa-grid">
                <div class="empresa-field"><strong>Responsable</strong>${empresa.responsable || 'No asignado'}</div>
                <div class="empresa-field"><strong>Teléfono</strong>${empresa.telefono || 'No registrado'}</div>
                <div class="empresa-field">
                    <strong>Emails de Contacto</strong>
                    ${empresa.emails && empresa.emails.length > 0 ? 
                        '<div style="display: flex; flex-direction: column; gap: 3px;">' +
                        empresa.emails.map(email => 
                            `<span style="color: #667eea; font-size: 13px;">📧 ${email}</span>`
                        ).join('') +
                        '</div>' :
                        (empresa.email ? 
                            `<span style="color: #667eea; font-size: 13px;">📧 ${empresa.email}</span>` :
                            '<span style="color: #e74c3c; font-weight: 600;">⚠️ Sin emails - No se enviarán notificaciones</span>')
                    }
                </div>
                <div class="empresa-field"><strong>Creado por</strong>${creadoPor}</div>
            </div>
            <div class="diagnosticos-section">
                <div class="diagnosticos-header">
                    <h4>📋 Historial de Diagnósticos</h4>
                    ${diagnosticoActivoPropio ? 
                        '<button class="btn btn-warning btn-sm" onclick="window.reagendarCita(\'' + diagnosticoActivoPropio.id + '\')">🔄 Reagendar Cita</button>' :
                        puedeAgendar ? 
                        '<button class="btn btn-success btn-sm" onclick="window.abrirAgendarModal(\'' + empresa.id + '\')">+ Agendar Servicio</button>' : 
                        '<button class="btn btn-warning btn-sm" disabled title="Empresa ocupada">⚠️ No Disponible</button>'}
                </div>
                ${diagnosticosHTML}
            </div>
        </div>
    </div>`;
}

// ============================================
// MODAL DE EMPRESA
// ============================================

window.openEmpresaModal = function() {
    document.getElementById('empresaModalTitle').textContent = 'Nueva Empresa';
    document.getElementById('empresaForm')?.reset();
    document.getElementById('empresaModal')?.classList.add('show');
};

window.closeEmpresaModal = function() {
    document.getElementById('empresaModal')?.classList.remove('show');
};

window.editarEmpresa = function(empresaId) {
    actualizarDatosGlobales();
    
    const empresaEditando = empresas.find(e => e.id === empresaId);
    if (!empresaEditando) return;
    
    document.getElementById('empresaModalTitle').textContent = 'Editar Empresa';
    document.getElementById('empresaNombre').value = empresaEditando.nombre || '';
    document.getElementById('empresaNit').value = empresaEditando.nit || '';
    document.getElementById('empresaTrabajadores').value = empresaEditando.trabajadores || '';
    document.getElementById('empresaResponsable').value = empresaEditando.responsable || '';
    document.getElementById('empresaTelefono').value = empresaEditando.telefono || '';
    
    const emailsString = empresaEditando.emails && empresaEditando.emails.length > 0 
        ? empresaEditando.emails.join(', ') 
        : (empresaEditando.email || '');
    
    document.getElementById('empresaEmails').value = emailsString;
    document.getElementById('empresaModal').classList.add('show');
    
    // Guardar ID en dataset del formulario
    const form = document.getElementById('empresaForm');
    if (form) {
        form.dataset.editandoId = empresaId;
    } else {
        // Fallback a variable global
        window.empresaEditandoId = empresaId;
    }
};

// ============================================
// MANEJADOR DEL FORMULARIO
// ============================================

async function handleEmpresaSubmit(e) {
    e.preventDefault();
    
    actualizarDatosGlobales();
    
    if (!currentUser) {
        showAlert('❌ Debe iniciar sesión', 'danger');
        return;
    }
    
    const empresaData = {
        nombre: document.getElementById('empresaNombre')?.value.trim() || '',
        nit: document.getElementById('empresaNit')?.value.trim() || '',
        trabajadores: parseInt(document.getElementById('empresaTrabajadores')?.value) || 0,
        responsable: document.getElementById('empresaResponsable')?.value.trim() || '',
        telefono: document.getElementById('empresaTelefono')?.value.trim() || '',
        emailsInput: document.getElementById('empresaEmails')?.value.trim() || ''
    };
    
    // Validar datos
    const validacion = validarDatosEmpresa(empresaData);
    if (!validacion.isValid) {
        showAlert(validacion.error, 'danger');
        return;
    }
    
    // Procesar emails
    const procesado = prepararDatosEmpresa(empresaData);
    if (!procesado.success) {
        showAlert(procesado.error, 'danger');
        return;
    }
    
    // Obtener ID de empresa si es edición
    const form = e.target;
    const empresaEditandoId = form.dataset.editandoId || window.empresaEditandoId;
    
    let resultado;
    if (empresaEditandoId) {
        resultado = await actualizarEmpresa(empresaEditandoId, procesado.data);
        if (resultado.success) {
            showAlert('Empresa actualizada exitosamente', 'success');
            // Limpiar ID
            delete form.dataset.editandoId;
            delete window.empresaEditandoId;
        }
    } else {
        const empresaExistente = await buscarEmpresaPorNitONombre(procesado.data.nit, procesado.data.nombre);
        
        if (empresaExistente.existe) {
            showAlert(`⚠️ Ya existe una empresa registrada con el mismo ${empresaExistente.campo}: "${empresaExistente.empresa?.nombre || ''}"`, 'warning');
            return;
        }
        
        resultado = await crearEmpresa(procesado.data);
        if (resultado.success) {
            showAlert('Empresa creada exitosamente', 'success');
        }
    }
    
    if (!resultado?.success && resultado?.error) {
        showAlert('Error: ' + resultado.error, 'danger');
    } else {
        window.closeEmpresaModal();
        // Recargar vista si es necesario
        if (document.getElementById('panel-empresas')?.classList.contains('active')) {
            renderEstadisticasUsuario();
        }
    }
}