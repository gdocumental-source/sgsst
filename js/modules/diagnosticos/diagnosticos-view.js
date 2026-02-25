/**
 * Vista del módulo Diagnósticos
 * Maneja la presentación de diagnósticos
 */

export class DiagnosticosView {
    constructor() {
        this.container = document.getElementById('diagnosticosPanel');
    }

    /**
     * Renderizar lista de diagnósticos
     */
    renderListaDiagnosticos(diagnosticos) {
        if (!this.container) return;

        if (diagnosticos.length === 0) {
            this.container.innerHTML = `
                <div class="panel-header">
                    <h2 class="panel-title">📋 Diagnósticos SG-SST</h2>
                    <button id="btnNuevoDiagnostico" class="btn btn-primary">
                        ➕ Nuevo Diagnóstico
                    </button>
                </div>

                <div style="margin-top: 20px;">
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <h3>No hay diagnósticos creados</h3>
                        <p>Comienza creando tu primer diagnóstico</p>
                        <button id="btnNuevoDiagnostico" class="btn btn-primary btn-lg" style="margin-top: 20px;">
                            ➕ Crear Diagnóstico
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        let html = `
            <div class="panel-header">
                <h2 class="panel-title">📋 Diagnósticos SG-SST</h2>
                <button id="btnNuevoDiagnostico" class="btn btn-primary">
                    ➕ Nuevo Diagnóstico
                </button>
            </div>

            <div class="panel-content" style="margin-top: 20px;">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
                                <th style="padding: 15px; text-align: left;">Tipo</th>
                                <th style="padding: 15px; text-align: left;">Empresa</th>
                                <th style="padding: 15px; text-align: left;">Estado</th>
                                <th style="padding: 15px; text-align: center;">Puntuación</th>
                                <th style="padding: 15px; text-align: left;">Resultado</th>
                                <th style="padding: 15px; text-align: center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        diagnosticos.forEach(diag => {
            const estadoBadge = this.getBadgeEstado(diag.estado);
            const resultado = diag.resultado;
            const puntuacion = resultado ? resultado.puntuacion : '-';
            const estado = resultado ? resultado.estado : 'Pendiente';

            html += `
                <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 15px; font-weight: bold;">${diag.tipo.toUpperCase()}</td>
                    <td style="padding: 15px;">
                        ${diag.empresaId ? this.getNombreEmpresa(diag.empresaId) : 'N/A'}
                    </td>
                    <td style="padding: 15px;">${estadoBadge}</td>
                    <td style="padding: 15px; text-align: center;">
                        <strong>${puntuacion}</strong>/5.0
                    </td>
                    <td style="padding: 15px;">
                        <small>${estado}</small>
                    </td>
                    <td style="padding: 15px; text-align: center;">
                        <button class="btnVerDiagnostico btn btn-info btn-sm" data-diag-id="${diag.id}">
                            👁️ Ver
                        </button>
                        <button class="btnEditarDiagnostico btn btn-primary btn-sm" data-diag-id="${diag.id}">
                            ✏️ Editar
                        </button>
                        <button class="btnDescargarPDF btn btn-success btn-sm" data-diag-id="${diag.id}">
                            📄 PDF
                        </button>
                        <button class="btnEliminarDiagnostico btn btn-danger btn-sm" data-diag-id="${diag.id}">
                            🗑️ Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 15px; color: #95a5a6; font-size: 12px;">
                    Total de diagnósticos: <strong>${diagnosticos.length}</strong>
                </div>
            </div>
        `;

        this.container.innerHTML = html;
    }

    /**
     * Renderizar selector de tipo
     */
    renderSelectorTipo() {
        return `
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                <div class="card" style="text-align: center; cursor: pointer; transition: all 0.3s;">
                    <div style="font-size: 48px; margin-bottom: 15px;">7️⃣</div>
                    <h3 style="margin: 10px 0;">Diagnóstico 7S</h3>
                    <p style="color: #95a5a6; margin: 10px 0;">Versión Simplificada</p>
                    <p style="font-size: 12px; color: #95a5a6;">7 preguntas básicas</p>
                    <button class="btnCrearTipo btn btn-primary" data-tipo="7s" style="width: 100%; margin-top: 10px;">
                        Crear
                    </button>
                </div>

                <div class="card" style="text-align: center; cursor: pointer; transition: all 0.3s;">
                    <div style="font-size: 48px; margin-bottom: 15px;">2️⃣1️⃣</div>
                    <h3 style="margin: 10px 0;">Diagnóstico 21S</h3>
                    <p style="color: #95a5a6; margin: 10px 0;">Versión Intermedia</p>
                    <p style="font-size: 12px; color: #95a5a6;">21 preguntas detalladas</p>
                    <button class="btnCrearTipo btn btn-primary" data-tipo="21s" style="width: 100%; margin-top: 10px;">
                        Crear
                    </button>
                </div>

                <div class="card" style="text-align: center; cursor: pointer; transition: all 0.3s;">
                    <div style="font-size: 48px; margin-bottom: 15px;">6️⃣0️⃣</div>
                    <h3 style="margin: 10px 0;">Diagnóstico 60S</h3>
                    <p style="color: #95a5a6; margin: 10px 0;">Versión Completa</p>
                    <p style="font-size: 12px; color: #95a5a6;">60 preguntas exhaustivas</p>
                    <button class="btnCrearTipo btn btn-primary" data-tipo="60s" style="width: 100%; margin-top: 10px;">
                        Crear
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Renderizar selector de empresa
     */
    renderSelectorEmpresa(empresas, tipo) {
        if (empresas.length === 0) {
            return `
                <div class="empty-state">
                    <p>No hay empresas registradas. Crea una empresa primero.</p>
                </div>
            `;
        }

        let html = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
        `;

        empresas.forEach(empresa => {
            html += `
                <div class="card">
                    <h3>${empresa.nombre}</h3>
                    <p><strong>NIT:</strong> ${empresa.nit}</p>
                    <p><strong>Ciudad:</strong> ${empresa.ciudad}</p>
                    <p><strong>Trabajadores:</strong> ${empresa.numeroTrabajadores}</p>
                    <p><strong>Riesgo:</strong> ${empresa.riesgoPrincipal}</p>
                    <button class="btnSeleccionarEmpresa btn btn-primary" style="width: 100%; margin-top: 15px;" data-empresa-id="${empresa.id}">
                        Seleccionar
                    </button>
                </div>
            `;
        });

        html += `</div>`;
        return html;
    }

    /**
     * Renderizar formulario de agendamiento
     */
    renderFormularioAgendamiento(diagnostico) {
        const fechaHoy = new Date().toISOString().split('T')[0];

        return `
            <div class="form-group">
                <label for="fechaAgendamiento">📅 Fecha</label>
                <input type="date" id="fechaAgendamiento" min="${fechaHoy}" required>
            </div>

            <div class="form-group">
                <label for="horaAgendamiento">🕐 Hora</label>
                <select id="horaAgendamiento" required>
                    <option value="">Seleccionar hora...</option>
                    <option value="08:00 AM">08:00 AM</option>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="03:00 PM">03:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                </select>
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="btnCancelarAgendamiento" class="btn btn-secondary">
                    Cancelar
                </button>
                <button id="btnGuardarAgendamiento" class="btn btn-primary">
                    💾 Guardar
                </button>
            </div>
        `;
    }

    /**
     * Renderizar detalles
     */
    renderDetalles(diagnostico, empresa) {
        const resultado = diagnostico.resultado || {};
        const recomendaciones = resultado.recomendaciones || [];

        let html = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                <div>
                    <h3>Información del Diagnóstico</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                        <p><strong>Tipo:</strong> ${diagnostico.tipo.toUpperCase()}</p>
                        <p><strong>Empresa:</strong> ${empresa.nombre}</p>
                        <p><strong>Estado:</strong> ${diagnostico.estado}</p>
                        <p><strong>Fecha Creación:</strong> ${new Date(diagnostico.createdAt.seconds * 1000).toLocaleDateString('es-CO')}</p>
                        ${diagnostico.completadoEn ? `<p><strong>Completado:</strong> ${new Date(diagnostico.completadoEn).toLocaleDateString('es-CO')}</p>` : ''}
                    </div>
                </div>

                <div>
                    <h3>Resultado</h3>
                    <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 8px;">
                        <p style="font-size: 32px; font-weight: bold; margin: 0;">${resultado.puntuacion || 0}/5.0</p>
                        <p style="margin: 10px 0 0 0; font-size: 18px;">${resultado.estado || 'Pendiente'}</p>
                    </div>
                </div>
            </div>

            ${recomendaciones.length > 0 ? `
                <div>
                    <h3>Recomendaciones</h3>
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
                        <ul style="margin: 0; padding-left: 20px;">
                            ${recomendaciones.map(rec => `<li style="margin-bottom: 10px;">${rec}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            ` : ''}
        `;

        return html;
    }

    /**
     * Renderizar formulario de edición
     */
    renderFormularioEdicion(diagnostico, empresa) {
        const resultado = diagnostico.resultado || {};

        return `
            <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3>${diagnostico.tipo.toUpperCase()} - ${empresa.nombre}</h3>
                <p><strong>Puntuación:</strong> ${resultado.puntuacion || 0}/5.0</p>
                <p><strong>Estado:</strong> ${resultado.estado || 'Pendiente'}</p>
                ${resultado.recomendaciones && resultado.recomendaciones.length > 0 ? `
                    <div style="margin-top: 15px;">
                        <p><strong>Recomendaciones:</strong></p>
                        <ul style="padding-left: 20px;">
                            ${resultado.recomendaciones.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>

            <div style="border-top: 1px solid #eee; padding-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                <button id="btnCancelarDiagnostico" class="btn btn-secondary">
                    Cancelar
                </button>
                <button id="btnGuardarDiagnostico" class="btn btn-primary">
                    💾 Guardar Cambios
                </button>
            </div>
        `;
    }

    /**
     * Helper: Obtener badge de estado
     */
    getBadgeEstado(estado) {
        const colores = {
            'sin-agendar': { bg: '#f39c12', text: 'Sin Agendar' },
            'agendado': { bg: '#3498db', text: 'Agendado' },
            'en-proceso': { bg: '#9b59b6', text: 'En Proceso' },
            'completado': { bg: '#2ecc71', text: 'Completado' },
            'enviado': { bg: '#27ae60', text: 'Enviado' }
        };

        const config = colores[estado] || { bg: '#95a5a6', text: 'Desconocido' };

        return `<span class="badge" style="background: ${config.bg}; color: white; padding: 5px 10px; border-radius: 20px; font-size: 12px;">${config.text}</span>`;
    }

    /**
     * Helper: Obtener nombre de empresa
     */
    getNombreEmpresa(empresaId) {
        // Esto será completado por el controlador cuando pase las empresas
        return empresaId;
    }
}

export default DiagnosticosView;