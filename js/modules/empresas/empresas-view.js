/**
 * Vista del módulo Empresas
 * Maneja la presentación de empresas
 */

export class EmpresasView {
    constructor() {
        this.container = document.getElementById('empresasPanel');
    }

    /**
     * Renderizar lista de empresas
     */
    renderEmpresas(empresas) {
        if (!this.container) return;

        if (empresas.length === 0) {
            this.container.innerHTML = `
                <div class="panel-header">
                    <h2 class="panel-title">📊 Gestión de Empresas</h2>
                    <button id="btnNuevaEmpresa" class="btn btn-primary">
                        ➕ Nueva Empresa
                    </button>
                </div>

                <div style="margin-top: 20px;">
                    <div class="empty-state">
                        <div class="empty-icon">📁</div>
                        <h3>No hay empresas registradas</h3>
                        <p>Comienza registrando tu primera empresa</p>
                        <button id="btnNuevaEmpresa" class="btn btn-primary btn-lg" style="margin-top: 20px;">
                            ➕ Crear Primera Empresa
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        let tablHTML = `
            <div class="panel-header">
                <h2 class="panel-title">📊 Gestión de Empresas</h2>
                <button id="btnNuevaEmpresa" class="btn btn-primary">
                    ➕ Nueva Empresa
                </button>
            </div>

            <div class="panel-content" style="margin-top: 20px;">
                <div style="overflow-x: auto;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background: linear-gradient(135deg, #667eea, #764ba2); color: white;">
                                <th style="padding: 15px; text-align: left; font-weight: bold;">Empresa</th>
                                <th style="padding: 15px; text-align: left; font-weight: bold;">NIT</th>
                                <th style="padding: 15px; text-align: left; font-weight: bold;">Ciudad</th>
                                <th style="padding: 15px; text-align: left; font-weight: bold;">Teléfono</th>
                                <th style="padding: 15px; text-align: center; font-weight: bold;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        empresas.forEach(empresa => {
            tablHTML += `
                <tr style="border-bottom: 1px solid #eee; hover-background: #f9f9f9;">
                    <td style="padding: 15px;">
                        <strong>${empresa.nombre}</strong>
                        <br>
                        <small style="color: #95a5a6;">${empresa.razonSocial}</small>
                    </td>
                    <td style="padding: 15px;">${empresa.nit}</td>
                    <td style="padding: 15px;">${empresa.ciudad}</td>
                    <td style="padding: 15px;">${empresa.telefono}</td>
                    <td style="padding: 15px; text-align: center;">
                        <button class="btnVerDetalles btn btn-info btn-sm" data-empresa-id="${empresa.id}" style="margin: 2px;">
                            👁️ Ver
                        </button>
                        <button class="btnEditarEmpresa btn btn-primary btn-sm" data-empresa-id="${empresa.id}" style="margin: 2px;">
                            ✏️ Editar
                        </button>
                        <button class="btnEliminarEmpresa btn btn-danger btn-sm" data-empresa-id="${empresa.id}" style="margin: 2px;">
                            🗑️ Eliminar
                        </button>
                    </td>
                </tr>
            `;
        });

        tablHTML += `
                        </tbody>
                    </table>
                </div>
                <div style="margin-top: 15px; color: #95a5a6; font-size: 12px;">
                    Total de empresas: <strong>${empresas.length}</strong>
                </div>
            </div>
        `;

        this.container.innerHTML = tablHTML;
    }

    /**
     * Renderizar formulario de empresa
     */
    renderFormularioEmpresa(empresa) {
        const datos = empresa || {};

        return `
            <form id="formularioEmpresa">
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
                    <div class="form-group">
                        <label>Nombre de la Empresa *</label>
                        <input type="text" id="nombreEmpresa" value="${datos.nombre || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>NIT *</label>
                        <input type="text" id="nitEmpresa" value="${datos.nit || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Razón Social *</label>
                        <input type="text" id="razonSocialEmpresa" value="${datos.razonSocial || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Ciudad *</label>
                        <input type="text" id="ciudadEmpresa" value="${datos.ciudad || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Dirección *</label>
                        <input type="text" id="direccionEmpresa" value="${datos.direccion || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Teléfono *</label>
                        <input type="tel" id="telefonoEmpresa" value="${datos.telefono || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Email *</label>
                        <input type="email" id="emailEmpresa" value="${datos.email || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Número de Trabajadores *</label>
                        <input type="number" id="numeroTrabajadoresEmpresa" value="${datos.numeroTrabajadores || ''}" required min="1">
                    </div>

                    <div class="form-group">
                        <label>Actividad Económica *</label>
                        <input type="text" id="actividadEconomicaEmpresa" value="${datos.actividadEconomica || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Riesgo Principal *</label>
                        <input type="text" id="riesgoPrincipalEmpresa" value="${datos.riesgoPrincipal || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Afiliado a ARP *</label>
                        <input type="text" id="afiliadoARPEmpresa" value="${datos.afiliadoARP || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Representante Legal *</label>
                        <input type="text" id="representanteLegalEmpresa" value="${datos.representanteLegal || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Cédula del Representante *</label>
                        <input type="text" id="cedulaRepresentanteEmpresa" value="${datos.cedulaRepresentante || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Responsable de SST *</label>
                        <input type="text" id="responsableSSTEmpresa" value="${datos.responsableSST || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Teléfono Responsable *</label>
                        <input type="tel" id="telefonoResponsableEmpresa" value="${datos.telefonoResponsable || ''}" required>
                    </div>

                    <div class="form-group">
                        <label>Email Responsable *</label>
                        <input type="email" id="emailResponsableEmpresa" value="${datos.emailResponsable || ''}" required>
                    </div>
                </div>

                <div style="border-top: 1px solid #eee; padding-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">
                    <button type="button" id="btnCancelarEmpresa" class="btn btn-secondary">
                        Cancelar
                    </button>
                    <button type="button" id="btnGuardarEmpresa" class="btn btn-primary">
                        💾 Guardar
                    </button>
                </div>
            </form>
        `;
    }

    /**
     * Renderizar detalles de empresa
     */
    renderDetalles(empresa, estadisticas) {
        return `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                <div>
                    <h3>Información Comercial</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                        <p><strong>Nombre:</strong> ${empresa.nombre}</p>
                        <p><strong>NIT:</strong> ${empresa.nit}</p>
                        <p><strong>Razón Social:</strong> ${empresa.razonSocial}</p>
                        <p><strong>Ciudad:</strong> ${empresa.ciudad}</p>
                        <p><strong>Dirección:</strong> ${empresa.direccion}</p>
                        <p><strong>Teléfono:</strong> ${empresa.telefono}</p>
                        <p><strong>Email:</strong> ${empresa.email}</p>
                        <p><strong>Trabajadores:</strong> ${empresa.numeroTrabajadores}</p>
                    </div>
                </div>

                <div>
                    <h3>Información de SG-SST</h3>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 8px;">
                        <p><strong>Actividad Económica:</strong> ${empresa.actividadEconomica}</p>
                        <p><strong>Riesgo Principal:</strong> ${empresa.riesgoPrincipal}</p>
                        <p><strong>Afiliado ARP:</strong> ${empresa.afiliadoARP}</p>
                        <p><strong>Responsable SST:</strong> ${empresa.responsableSST}</p>
                        <p><strong>Tel. Responsable:</strong> ${empresa.telefonoResponsable}</p>
                        <p><strong>Email Responsable:</strong> ${empresa.emailResponsable}</p>
                    </div>
                </div>

                <div style="grid-column: 1 / -1;">
                    <h3>Estadísticas de Diagnósticos</h3>
                    <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px;">
                        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold;">${estadisticas.totalDiagnosticos}</div>
                            <div style="font-size: 12px; margin-top: 5px;">Total</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold;">${estadisticas.agendados}</div>
                            <div style="font-size: 12px; margin-top: 5px;">Agendados</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold;">${estadisticas.enProceso}</div>
                            <div style="font-size: 12px; margin-top: 5px;">En Proceso</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #2ecc71, #27ae60); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold;">${estadisticas.completados}</div>
                            <div style="font-size: 12px; margin-top: 5px;">Completados</div>
                        </div>
                        <div style="background: linear-gradient(135deg, #9b59b6, #8e44ad); color: white; padding: 20px; border-radius: 8px; text-align: center;">
                            <div style="font-size: 32px; font-weight: bold;">${estadisticas.enviados}</div>
                            <div style="font-size: 12px; margin-top: 5px;">Enviados</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtener datos del formulario
     */
    obtenerDatosFormulario() {
        const campos = [
            'nombreEmpresa',
            'nitEmpresa',
            'razonSocialEmpresa',
            'ciudadEmpresa',
            'direccionEmpresa',
            'telefonoEmpresa',
            'emailEmpresa',
            'numeroTrabajadoresEmpresa',
            'actividadEconomicaEmpresa',
            'riesgoPrincipalEmpresa',
            'afiliadoARPEmpresa',
            'representanteLegalEmpresa',
            'cedulaRepresentanteEmpresa',
            'responsableSSTEmpresa',
            'telefonoResponsableEmpresa',
            'emailResponsableEmpresa'
        ];

        const datos = {};
        for (const campo of campos) {
            const elemento = document.getElementById(campo);
            if (!elemento || !elemento.value.trim()) {
                return {
                    valido: false,
                    error: `Campo ${campo} es requerido`
                };
            }
            
            // Mapear ID a nombre de propiedad
            const nombrePropiedad = this.mapearNombreCampo(campo);
            datos[nombrePropiedad] = elemento.value;
        }

        return { valido: true, datos };
    }

    /**
     * Mapear nombre de campo HTML a propiedad de datos
     */
    mapearNombreCampo(idHtml) {
        const mapa = {
            'nombreEmpresa': 'nombre',
            'nitEmpresa': 'nit',
            'razonSocialEmpresa': 'razonSocial',
            'ciudadEmpresa': 'ciudad',
            'direccionEmpresa': 'direccion',
            'telefonoEmpresa': 'telefono',
            'emailEmpresa': 'email',
            'numeroTrabajadoresEmpresa': 'numeroTrabajadores',
            'actividadEconomicaEmpresa': 'actividadEconomica',
            'riesgoPrincipalEmpresa': 'riesgoPrincipal',
            'afiliadoARPEmpresa': 'afiliadoARP',
            'representanteLegalEmpresa': 'representanteLegal',
            'cedulaRepresentanteEmpresa': 'cedulaRepresentante',
            'responsableSSTEmpresa': 'responsableSST',
            'telefonoResponsableEmpresa': 'telefonoResponsable',
            'emailResponsableEmpresa': 'emailResponsable'
        };

        return mapa[idHtml] || idHtml;
    }
}

export default EmpresasView;