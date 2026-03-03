// js/controllers/agenda-controller.js

/**
 * Controlador de agenda
 * Maneja las citas del día y la agenda global de supervisores
 */

import { showAlert } from '../ui/alerts.js';
import { getTipoServicioNombre, getEstadoIcon } from '../ui/render-helpers.js';
import { filtrarDiagnosticosGlobal, eliminarDiagnostico } from '../services/diagnostico-service.js';
import { obtenerTodosUsuarios } from '../services/role-service.js';
import { ESTADOS_PROCESO } from '../config/constants.js';

// ============================================
// INICIALIZACIÓN
// ============================================
export function initAgendaController() {
    console.log('📅 Inicializando controlador de agenda...');
    
    document.addEventListener('diagnosticos-updated', () => {
        if (document.getElementById('panel-agenda').classList.contains('active')) {
            const { getRolActual } = require('./main-controller.js');
            const rolActual = getRolActual();
            
            if (rolActual === 'coordinador' || rolActual === 'director') {
                document.getElementById('agendaTabs').style.display = 'block';
            } else {
                document.getElementById('agendaTabs').style.display = 'none';
            }
            
            renderCitasHoy();
        }
    });
}

// ============================================
// RENDERIZADO DE CITAS DE HOY
// ============================================
export function renderCitasHoy() {
    const { getDiagnosticos, getCurrentUser, getEmpresas } = require('./main-controller.js');
    const diagnosticos = getDiagnosticos();
    const currentUser = getCurrentUser();
    const empresas = getEmpresas();
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('fechaHoy').textContent = hoy.toLocaleDateString('es-ES', opciones);
    
    // Filtrar citas del usuario
    const citasHoy = diagnosticos.filter(cita => {
        if (!cita.fechaAgendada) return false;
        if (!cita.creadoPor || cita.creadoPor.uid !== currentUser.uid) return false;
        
        const fechaCita = new Date(cita.fechaAgendada + 'T00:00:00');
        fechaCita.setHours(0, 0, 0, 0);
        
        const esHoy = fechaCita.getTime() === hoy.getTime();
        const esAtrasada = fechaCita.getTime() < hoy.getTime();
        
        const estaReagendada = cita.motivoReagendamiento && 
                              !cita.reagendamientoAprobado && 
                              !cita.reagendamientoRechazado;
        
        const estaFinalizada = cita.estado === ESTADOS_PROCESO.CASO_FINALIZADO;
        
        return esHoy || (esAtrasada && !estaReagendada && !estaFinalizada) || (estaFinalizada && !estaReagendada);
    });
    
    // Ordenar
    citasHoy.sort((a, b) => {
        const fechaA = new Date(a.fechaAgendada + 'T00:00:00');
        const fechaB = new Date(b.fechaAgendada + 'T00:00:00');
        
        const aEsFinalizada = a.estado === ESTADOS_PROCESO.CASO_FINALIZADO;
        const bEsFinalizada = b.estado === ESTADOS_PROCESO.CASO_FINALIZADO;
        
        if (aEsFinalizada && !bEsFinalizada) return 1;
        if (!aEsFinalizada && bEsFinalizada) return -1;
        
        return fechaA.getTime() - fechaB.getTime();
    });
    
    const container = document.getElementById('citasHoyList');
    
    if (citasHoy.length === 0) {
        container.innerHTML = '<div class="empty-state"><div class="empty-icon">📅</div><h3>No tienes citas programadas para hoy</h3><p>Tus citas agendadas aparecerán aquí</p></div>';
        return;
    }
    
    container.innerHTML = citasHoy.map(cita => {
        const empresa = empresas.find(e => e.id === cita.empresaId);
        
        const esEnProgreso = cita.estado === 'en-proceso' && cita.resultado && cita.resultado.enProgreso;
        const puedeRealizarDiagnostico = cita.estado === 'agendado' && cita.tipoServicio === 'diagnostico';
        const puedeContinuarDiagnostico = esEnProgreso && cita.tipoServicio === 'diagnostico';
        const esEntregaResultados = cita.tipoServicio === 'entrega-resultados';
        const tieneInformeCompleto = cita.resultado && cita.resultado.enProgreso === false;
        const esEntregaAgendadaHoy = cita.estado === ESTADOS_PROCESO.ENTREGA_AGENDADA && esEntregaResultados;
        
        let botonesAccion = [];
        
        if (puedeRealizarDiagnostico) {
            botonesAccion.push(`<button class="btn btn-primary btn-sm" onclick="window.abrirFormularioDiagnostico('${cita.id}')">📝 Realizar Diagnóstico</button>`);
        }
        
        if (puedeContinuarDiagnostico) {
            botonesAccion.push(`<button class="btn btn-success btn-sm" onclick="window.abrirFormularioDiagnostico('${cita.id}')">▶️ Continuar Diagnóstico (${cita.resultado.preguntasRespondidas}/${cita.resultado.totalPreguntas})</button>`);
        }
        
        if (esEntregaAgendadaHoy) {
            botonesAccion.push(`<button class="btn btn-success btn-sm" onclick="window.finalizarCaso('${cita.id}')" style="background: linear-gradient(135deg, #11998e, #38ef7d);">✅ Finalizar Caso (Entrega Realizada)</button>`);
        }
        
        if (cita.estado === 'agendado' || cita.estado === 'en-proceso' || cita.estado === ESTADOS_PROCESO.CASO_FINALIZADO) {
            botonesAccion.push(`<button class="btn btn-warning btn-sm" onclick="window.reagendarCita('${cita.id}')">🔄 Reagendar</button>`);
        }
        
        if (tieneInformeCompleto && cita.tipoServicio === 'diagnostico') {
            botonesAccion.push(`<button class="btn btn-success btn-sm" onclick="window.verInformeDiagnostico('${cita.id}')">📄 Ver Informe</button>`);
        }
        
        if (esEntregaResultados && cita.diagnosticoOriginalId) {
            botonesAccion.push(`<button class="btn btn-primary btn-sm" onclick="window.verInformeDiagnostico('${cita.diagnosticoOriginalId}')">📊 Ver Diagnóstico</button>`);
        }
        
        // Determinar tipo de cita
        const ahora = new Date();
        const fechaHoraCita = new Date(cita.fechaAgendada + 'T00:00:00');
        const [horaInicio] = cita.horaAgendada.split(' - ');
        const [hora, minuto] = horaInicio.split(':');
        const ampm = horaInicio.split(' ')[1];
        
        let horaNum = parseInt(hora);
        if (ampm === 'PM' && horaNum !== 12) horaNum += 12;
        if (ampm === 'AM' && horaNum === 12) horaNum = 0;
        
        fechaHoraCita.setHours(horaNum, parseInt(minuto), 0, 0);
        
        const estaAtrasada = fechaHoraCita < ahora && 
                            cita.estado !== ESTADOS_PROCESO.CASO_FINALIZADO &&
                            (cita.estado === 'agendado' || cita.estado === 'en-proceso');
        
        const estaFinalizada = cita.estado === ESTADOS_PROCESO.CASO_FINALIZADO;
        const esRechazada = cita.reagendamientoRechazado === true;
        
        let estiloCard = '';
        let mensaje = '';
        
        if (estaAtrasada) {
            estiloCard = 'background: #fee2e2; border: 3px solid #ef4444; animation: pulse 2s infinite;';
            mensaje = '<div style="background: #ef4444; color: white; padding: 12px; border-radius: 10px; margin-bottom: 15px; font-weight: 700; text-align: center; animation: shake 0.5s;">🚨 CITA ATRASADA - URGENTE REAGENDAR 🚨</div>';
        } else if (estaFinalizada) {
            estiloCard = 'background: #fff7ed; border: 3px solid #f97316;';
            mensaje = '<div style="background: #f97316; color: white; padding: 12px; border-radius: 10px; margin-bottom: 15px; font-weight: 700; text-align: center;">🟠 CASO FINALIZADO - PENDIENTE CERRAR</div>';
        } else if (esRechazada) {
            estiloCard = 'background: #ffe4e6; border: 3px solid #f43f5e;';
            mensaje = `
                <div style="background: #f43f5e; color: white; padding: 15px; border-radius: 10px; margin-bottom: 15px; font-weight: 700;">
                    <div style="text-align: center; font-size: 16px; margin-bottom: 10px;">❌ REAGENDAMIENTO RECHAZADO</div>
                    <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; font-weight: 400; font-size: 13px;">
                        <strong>Motivo del rechazo:</strong><br>
                        ${cita.motivoRechazo || 'No se especificó motivo'}
                    </div>
                    <div style="text-align: center; margin-top: 10px; font-size: 13px; font-weight: 400;">
                        ⚠️ Debe mantener la cita en la fecha programada originalmente
                    </div>
                </div>
            `;
        }
        
        const colorTexto = estaAtrasada ? '#991b1b' : estaFinalizada ? '#9a3412' : esRechazada ? '#be123c' : '#2c3e50';
        
        return `<div class="cita-card" style="${estiloCard}">
            <div style="display: flex; justify-content: space-between; align-items: start; gap: 20px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                    ${mensaje}
                    <h3 style="font-size: 20px; margin-bottom: 10px; color: ${colorTexto};">${cita.titulo}</h3>
                    <p style="color: #7f8c8d; margin-bottom: 8px;">🏢 ${empresa ? empresa.nombre : 'Empresa no encontrada'}</p>
                    <p style="color: #7f8c8d; margin-bottom: 8px;">🕐 ${cita.horaAgendada}</p>
                    <p style="color: #7f8c8d; margin-bottom: 8px;">📋 ${getTipoServicioNombre(cita.tipoServicio)}</p>
                    <span class="badge-status badge-${cita.estado}">${cita.estado.replace('-', ' ')}</span>
                    ${cita.datosDiagnostico ? '<p style="margin-top: 10px; font-size: 14px; color: #64748b;">📊 Tipo: ' + cita.datosDiagnostico.tipoDiagnostico.toUpperCase() + '</p>' : ''}
                    ${tieneInformeCompleto ? '<p style="margin-top: 10px; font-size: 14px; color: #10b981; font-weight: 600;">✅ Informe Disponible</p>' : ''}
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px; min-width: 200px;">
                    ${botonesAccion.join('')}
                </div>
            </div>
        </div>`;
    }).join('');
}

// ============================================
// AGENDA GLOBAL (SUPERVISORES)
// ============================================
window.cambiarTabAgenda = async function(tipo) {
    if (tipo === 'propia') {
        document.getElementById('tabMiAgenda').style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        document.getElementById('tabMiAgenda').style.color = 'white';
        document.getElementById('tabAgendaGlobal').style.background = '#f8f9fa';
        document.getElementById('tabAgendaGlobal').style.color = '#7f8c8d';
        
        document.getElementById('tabContentMiAgenda').style.display = 'block';
        document.getElementById('tabContentAgendaGlobal').style.display = 'none';
        
        renderCitasHoy();
    } else {
        document.getElementById('tabMiAgenda').style.background = '#f8f9fa';
        document.getElementById('tabMiAgenda').style.color = '#7f8c8d';
        document.getElementById('tabAgendaGlobal').style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
        document.getElementById('tabAgendaGlobal').style.color = 'white';
        
        document.getElementById('tabContentMiAgenda').style.display = 'none';
        document.getElementById('tabContentAgendaGlobal').style.display = 'block';
        
        await cargarAgendaGlobal();
    }
};

async function cargarAgendaGlobal() {
    const { getDiagnosticos } = require('./main-controller.js');
    const diagnosticos = getDiagnosticos();
    
    const usuarios = await obtenerTodosUsuarios();
    
    const selectGestor = document.getElementById('filtroGestorAgenda');
    if (selectGestor) {
        selectGestor.innerHTML = '<option value="">Todos los gestores</option>';
        
        const gestores = usuarios.filter(u => u.rol === 'gestor');
        gestores.forEach(usuario => {
            const option = document.createElement('option');
            option.value = usuario.id;
            option.textContent = usuario.nombre || usuario.email;
            selectGestor.appendChild(option);
        });
    }
    
    await renderAgendaGlobal();
}

async function renderAgendaGlobal() {
    const container = document.getElementById('agendaGlobalList');
    if (!container) return;
    
    const { getDiagnosticos, getEmpresas } = require('./main-controller.js');
    const diagnosticos = getDiagnosticos();
    const empresas = getEmpresas();
    
    const gestorSeleccionado = document.getElementById('filtroGestorAgenda')?.value || '';
    const periodo = document.getElementById('filtroPeriodoAgenda')?.value || 'todo';
    const estadoFiltro = document.getElementById('filtroEstadoAgenda')?.value || '';
    
    const citasFiltradas = filtrarDiagnosticosGlobal(diagnosticos, {
        gestorId: gestorSeleccionado,
        periodo,
        estado: estadoFiltro
    });
    
    if (citasFiltradas.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <h3>No hay citas para mostrar</h3>
                <p>Ajusta los filtros para ver más resultados</p>
            </div>
        `;
        return;
    }
    
    // Agrupar por gestor
    const citasPorGestor = {};
    citasFiltradas.forEach(cita => {
        if (!cita.creadoPor) return;
        const uid = cita.creadoPor.uid;
        if (!citasPorGestor[uid]) {
            citasPorGestor[uid] = {
                nombre: cita.creadoPor.nombre || cita.creadoPor.email,
                email: cita.creadoPor.email,
                citas: []
            };
        }
        citasPorGestor[uid].citas.push(cita);
    });
    
    let html = '';
    
    Object.entries(citasPorGestor).forEach(([uid, gestor]) => {
        html += `
            <div style="background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 25px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e1e8ed;">
                    <div>
                        <h4 style="margin: 0 0 5px 0; color: #2c3e50; font-size: 18px;">
                            👤 ${gestor.nombre}
                        </h4>
                        <p style="margin: 0; color: #7f8c8d; font-size: 14px;">${gestor.email}</p>
                    </div>
                    <span class="rol-badge gestor">
                        ${gestor.citas.length} cita(s)
                    </span>
                </div>
                
                <div style="display: grid; gap: 15px;">
        `;
        
        gestor.citas.forEach(cita => {
            const empresa = empresas.find(e => e.id === cita.empresaId);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);
            const fechaCita = new Date(cita.fechaAgendada + 'T00:00:00');
            const esHoy = fechaCita.getTime() === hoy.getTime();
            const esPasada = fechaCita.getTime() < hoy.getTime();
            
            let estadoColor = '#dbeafe';
            let estadoTextoColor = '#1e40af';
            
            if (cita.estado === 'en-proceso') {
                estadoColor = '#fef3c7';
                estadoTextoColor = '#92400e';
            } else if (cita.estado === 'completado') {
                estadoColor = '#d1fae5';
                estadoTextoColor = '#065f46';
            }
            
            html += `
                <div style="background: ${esHoy ? '#fff3cd' : esPasada ? '#fee2e2' : '#f8f9fa'}; border: 2px solid ${esHoy ? '#ffc107' : esPasada ? '#ef4444' : '#e1e8ed'}; border-radius: 12px; padding: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; gap: 15px; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 250px;">
                            ${esHoy ? '<div style="background: #ffc107; color: white; padding: 5px 10px; border-radius: 5px; display: inline-block; margin-bottom: 10px; font-size: 12px; font-weight: 700;">🔥 HOY</div>' : ''}
                            ${esPasada && cita.estado !== 'completado' ? '<div style="background: #ef4444; color: white; padding: 5px 10px; border-radius: 5px; display: inline-block; margin-bottom: 10px; font-size: 12px; font-weight: 700;">⚠️ ATRASADA</div>' : ''}
                            
                            <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 6px 12px; border-radius: 8px; display: inline-block; margin-bottom: 12px; font-size: 11px; font-weight: 700;">
                                👤 RESPONSABLE: ${gestor.nombre}
                            </div>
                            
                            <h5 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 16px;">
                                ${cita.titulo}
                            </h5>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 14px;">
                                🏢 ${empresa ? empresa.nombre : 'Empresa no encontrada'}
                            </p>
                            <p style="margin: 0 0 5px 0; color: #7f8c8d; font-size: 14px;">
                                📅 ${cita.fechaAgendada} - ${cita.horaAgendada}
                            </p>
                            <p style="margin: 0; color: #7f8c8d; font-size: 13px;">
                                📋 ${getTipoServicioNombre(cita.tipoServicio)}
                            </p>
                            <div style="margin-top: 10px;">
                                <span style="background: ${estadoColor}; color: ${estadoTextoColor}; padding: 5px 12px; border-radius: 15px; font-size: 12px; font-weight: 600;">
                                    ${cita.estado.toUpperCase().replace('-', ' ')}
                                </span>
                            </div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            <button onclick="window.verDetallesCita('${cita.id}')" class="btn btn-primary btn-sm">
                                👁️ Ver Detalles
                            </button>
                            <button onclick="window.confirmarEliminarCitaSupervisor('${cita.id}', '${gestor.nombre}', '${empresa ? empresa.nombre : 'Empresa'}')" class="btn btn-danger btn-sm">
                                🗑️ Eliminar Cita
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
    });
    
    container.innerHTML = html;
}

// ============================================
// FUNCIONES DE FILTROS
// ============================================
window.aplicarFiltrosAgenda = async function() {
    showAlert('🔍 Buscando citas...', 'info');
    await renderAgendaGlobal();
    showAlert('✅ Filtros aplicados', 'success');
};

window.limpiarFiltrosAgenda = async function() {
    document.getElementById('filtroGestorAgenda').value = '';
    document.getElementById('filtroPeriodoAgenda').value = 'todo';
    document.getElementById('filtroEstadoAgenda').value = '';
    
    showAlert('🗑️ Mostrando todas las agendas...', 'info');
    await renderAgendaGlobal();
    showAlert('✅ Filtros borrados', 'success');
};

// ============================================
// DETALLES Y ELIMINACIÓN
// ============================================
window.verDetallesCita = function(citaId) {
    const { getDiagnosticos, getEmpresas } = require('./main-controller.js');
    const diagnosticos = getDiagnosticos();
    const empresas = getEmpresas();
    
    const cita = diagnosticos.find(d => d.id === citaId);
    if (!cita) {
        showAlert('❌ Cita no encontrada', 'danger');
        return;
    }
    
    const empresa = empresas.find(e => e.id === cita.empresaId);
    
    const detalles = `
        <div style="background: white; padding: 25px; border-radius: 15px;">
            <h4 style="margin-bottom: 20px; color: #2c3e50;">📋 Detalles de la Cita</h4>
            
            <div style="display: grid; gap: 15px;">
                <div><strong>Título:</strong><br>${cita.titulo}</div>
                <div><strong>Empresa:</strong><br>${empresa ? empresa.nombre : 'No encontrada'}</div>
                <div><strong>NIT:</strong><br>${empresa ? empresa.nit : 'N/A'}</div>
                <div><strong>Fecha y Hora:</strong><br>${cita.fechaAgendada} - ${cita.horaAgendada}</div>
                <div><strong>Tipo de Servicio:</strong><br>${getTipoServicioNombre(cita.tipoServicio)}</div>
                <div><strong>Estado:</strong><br>${cita.estado.toUpperCase().replace('-', ' ')}</div>
                <div><strong>Creado por:</strong><br>${cita.creadoPor.nombre} (${cita.creadoPor.email})</div>
                ${cita.notas ? `<div><strong>Notas:</strong><br>${cita.notas}</div>` : ''}
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            ${detalles}
            <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
                <button onclick="this.closest('.modal').remove()" class="btn btn-secondary">
                    Cerrar
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
};

window.confirmarEliminarCitaSupervisor = function(citaId, nombreGestor, nombreEmpresa) {
    if (!confirm(`⚠️ CONFIRMAR ELIMINACIÓN\n\n¿Estás seguro de eliminar esta cita?\n\nGestor: ${nombreGestor}\nEmpresa: ${nombreEmpresa}`)) {
        return;
    }
    
    eliminarCitaSupervisor(citaId);
};

async function eliminarCitaSupervisor(citaId) {
    try {
        showAlert('🗑️ Eliminando cita...', 'info');
        
        const resultado = await eliminarDiagnostico(citaId);
        
        if (resultado.success) {
            showAlert('✅ Cita eliminada exitosamente', 'success');
            await renderAgendaGlobal();
        } else {
            showAlert('❌ Error: ' + resultado.error, 'danger');
        }
    } catch (error) {
        console.error('❌ Error eliminando cita:', error);
        showAlert('❌ Error al eliminar: ' + error.message, 'danger');
    }
}