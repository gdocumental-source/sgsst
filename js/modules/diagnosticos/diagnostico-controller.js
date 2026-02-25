/**
 * Controlador del módulo Diagnósticos
 * Gestiona creación, edición y visualización de diagnósticos
 */

import { alertService } from '../../ui/alerts.js';
import { modalManager } from '../../ui/modal-manager.js';
import { DiagnosticoService } from '../../services/diagnostico-service.js';
import { EmpresaService } from '../../services/empresa-service.js';
import { PDFService } from '../../services/pdf-service.js';
import { EmailService } from '../../services/email-service.js';
import { DiagnosticosView } from './diagnosticos-view.js';
import { Formulario7S } from './formularios/formulario-7s.js';
import { Formulario21S } from './formularios/formulario-21s.js';
import { Formulario60S } from './formularios/formulario-60s.js';

export class DiagnosticosController {
    constructor(firebaseAuth) {
        this.auth = firebaseAuth;
        this.diagnosticoService = new DiagnosticoService(firebaseAuth);
        this.empresaService = new EmpresaService(firebaseAuth);
        this.pdfService = new PDFService(firebaseAuth);
        this.emailService = new EmailService();
        this.view = new DiagnosticosView();
        this.diagnosticos = [];
        this.empresas = [];
        this.diagnosticoActual = null;
        this.formularioActual = null;
        this.setupEventListeners();
    }

    /**
     * Inicializar el módulo
     */
    async init() {
        await this.cargarDatos();
        this.view.renderListaDiagnosticos(this.diagnosticos);
    }

    /**
     * Cargar diagnósticos y empresas
     */
    async cargarDatos() {
        try {
            // Cargar empresas
            const resultEmpresas = await this.empresaService.obtenerEmpresas();
            if (resultEmpresas.success) {
                this.empresas = resultEmpresas.empresas;
            }

            // Cargar diagnósticos activos
            const resultDiagnosticos = await this.diagnosticoService.obtenerDiagnosticosActivos();
            if (resultDiagnosticos.success) {
                this.diagnosticos = resultDiagnosticos.diagnosticos;
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            alertService.error('Error al cargar datos');
        }
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            // Nuevo diagnóstico
            if (e.target.id === 'btnNuevoDiagnostico') {
                this.abrirSelectorTipo();
            }

            // Editar diagnóstico
            if (e.target.classList.contains('btnEditarDiagnostico')) {
                const diagId = e.target.dataset.diagId;
                await this.abrirEdicion(diagId);
            }

            // Ver detalles
            if (e.target.classList.contains('btnVerDiagnostico')) {
                const diagId = e.target.dataset.diagId;
                this.verDetalles(diagId);
            }

            // Eliminar diagnóstico
            if (e.target.classList.contains('btnEliminarDiagnostico')) {
                const diagId = e.target.dataset.diagId;
                await this.confirmarEliminar(diagId);
            }

            // Descargar PDF
            if (e.target.classList.contains('btnDescargarPDF')) {
                const diagId = e.target.dataset.diagId;
                await this.descargarPDF(diagId);
            }

            // Agendar diagnóstico
            if (e.target.classList.contains('btnAgendarDiagnostico')) {
                const diagId = e.target.dataset.diagId;
                this.abrirFormularioAgendamiento(diagId);
            }

            // Guardar agendamiento
            if (e.target.id === 'btnGuardarAgendamiento') {
                await this.guardarAgendamiento();
            }

            // Crear diagnóstico de tipo específico
            if (e.target.classList.contains('btnCrearTipo')) {
                const tipo = e.target.dataset.tipo;
                await this.abrirFormularioDiagnostico(tipo);
            }

            // Guardar diagnóstico
            if (e.target.id === 'btnGuardarDiagnostico') {
                await this.guardarDiagnostico();
            }

            // Cancelar
            if (e.target.id === 'btnCancelarDiagnostico') {
                modalManager.close('modalDiagnostico');
            }
        });
    }

    /**
     * Abrir selector de tipo de diagnóstico
     */
    abrirSelectorTipo() {
        const contenido = this.view.renderSelectorTipo();
        modalManager.open('modalSelectorTipo', 'Seleccionar Tipo de Diagnóstico', contenido, {
            closable: true
        });
    }

    /**
     * Abrir formulario de diagnóstico específico
     */
    async abrirFormularioDiagnostico(tipo) {
        try {
            if (this.empresas.length === 0) {
                alertService.warning('Debe crear al menos una empresa antes de crear un diagnóstico');
                return;
            }

            // Crear nuevo diagnóstico
            const resultado = await this.diagnosticoService.crearDiagnostico({
                empresaId: this.empresas[0].id,
                tipo: tipo,
                respuestas: {}
            });

            if (resultado.success) {
                this.diagnosticoActual = resultado.diagnostico;
                this.diagnosticoActual.id = resultado.id;

                modalManager.close('modalSelectorTipo');

                // Seleccionar empresa
                await this.abrirSelectorEmpresa(tipo);
            }
        } catch (error) {
            alertService.error('Error al crear diagnóstico');
            console.error(error);
        }
    }

    /**
     * Abrir selector de empresa
     */
    async abrirSelectorEmpresa(tipo) {
        const contenido = this.view.renderSelectorEmpresa(this.empresas, tipo);
        modalManager.open('modalSelectorEmpresa', 'Seleccionar Empresa', contenido, {
            closable: true
        });

        // Event listener para seleccionar empresa
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('btnSeleccionarEmpresa')) {
                const empresaId = e.target.dataset.empresaId;
                const empresa = this.empresas.find(e => e.id === empresaId);

                modalManager.close('modalSelectorEmpresa');

                // Abrirformulario del diagnóstico
                await this.abrirFormularioCompleto(tipo, empresaId);
            }
        });
    }

    /**
     * Abrir formulario completo del diagnóstico
     */
    async abrirFormularioCompleto(tipo, empresaId) {
        try {
            const empresa = this.empresas.find(e => e.id === empresaId);
            let formulario;
            let contenido;

            // Crear instancia del formulario según tipo
            switch (tipo) {
                case '7s':
                    formulario = new Formulario7S();
                    contenido = formulario.render();
                    break;
                case '21s':
                    formulario = new Formulario21S();
                    contenido = formulario.render();
                    break;
                case '60s':
                    formulario = new Formulario60S();
                    contenido = formulario.render();
                    break;
                default:
                    throw new Error('Tipo de diagnóstico inválido');
            }

            this.formularioActual = formulario;
            this.diagnosticoActual.empresaId = empresaId;
            this.diagnosticoActual.tipo = tipo;

            modalManager.open('modalDiagnostico', `Diagnóstico ${tipo.toUpperCase()} - ${empresa.nombre}`, contenido, {
                size: 'large',
                closable: true,
                buttons: [
                    {
                        label: 'Cancelar',
                        type: 'secondary',
                        onClick: () => modalManager.close('modalDiagnostico')
                    },
                    {
                        label: '💾 Guardar y Completar',
                        type: 'primary',
                        onClick: async () => await this.guardarDiagnostico()
                    }
                ]
            });

        } catch (error) {
            alertService.error('Error al abrir formulario');
            console.error(error);
        }
    }

    /**
     * Guardar diagnóstico completado
     */
    async guardarDiagnostico() {
        try {
            if (!this.formularioActual) {
                alertService.error('Formulario no disponible');
                return;
            }

            // Obtener respuestas del formulario
            const respuestas = this.formularioActual.obtenerRespuestas();

            if (!respuestas || Object.keys(respuestas).length === 0) {
                alertService.error('Por favor responde al menos una pregunta');
                return;
            }

            // Actualizar respuestas
            await this.diagnosticoService.actualizarRespuestas(
                this.diagnosticoActual.id,
                respuestas
            );

            // Completar diagnóstico
            const resultado = await this.diagnosticoService.completarDiagnostico(
                this.diagnosticoActual.id,
                respuestas
            );

            if (resultado.success) {
                // Enviar email de confirmación
                const empresa = this.empresas.find(e => e.id === this.diagnosticoActual.empresaId);
                await this.emailService.enviarConfirmacionDiagnostico(empresa, this.diagnosticoActual);

                modalManager.close('modalDiagnostico');
                await this.cargarDatos();
                this.view.renderListaDiagnosticos(this.diagnosticos);

                alertService.success('Diagnóstico completado exitosamente');
                
                // Ofrecer descargar PDF
                setTimeout(() => {
                    if (confirm('¿Descargar PDF del diagnóstico?')) {
                        this.descargarPDF(this.diagnosticoActual.id);
                    }
                }, 500);
            }

        } catch (error) {
            alertService.error('Error al guardar diagnóstico');
            console.error(error);
        }
    }

    /**
     * Abrir formulario de agendamiento
     */
    abrirFormularioAgendamiento(diagId) {
        const diagnostico = this.diagnosticos.find(d => d.id === diagId);
        const contenido = this.view.renderFormularioAgendamiento(diagnostico);

        this.diagnosticoActual = diagnostico;

        modalManager.open('modalAgendamiento', 'Agendar Diagnóstico', contenido, {
            closable: true
        });
    }

    /**
     * Guardar agendamiento
     */
    async guardarAgendamiento() {
        const fecha = document.getElementById('fechaAgendamiento')?.value;
        const hora = document.getElementById('horaAgendamiento')?.value;

        if (!fecha || !hora) {
            alertService.error('Por favor selecciona fecha y hora');
            return;
        }

        try {
            const resultado = await this.diagnosticoService.agendarDiagnostico(
                this.diagnosticoActual.id,
                fecha,
                hora
            );

            if (resultado.success) {
                modalManager.close('modalAgendamiento');
                await this.cargarDatos();
                this.view.renderListaDiagnosticos(this.diagnosticos);
            }
        } catch (error) {
            alertService.error('Error al agendar');
            console.error(error);
        }
    }

    /**
     * Ver detalles del diagnóstico
     */
    verDetalles(diagId) {
        const diagnostico = this.diagnosticos.find(d => d.id === diagId);
        const empresa = this.empresas.find(e => e.id === diagnostico.empresaId);
        const contenido = this.view.renderDetalles(diagnostico, empresa);

        modalManager.open('modalDetallesDiag', `Detalles - ${diagnostico.tipo.toUpperCase()}`, contenido, {
            size: 'large',
            closable: true
        });
    }

    /**
     * Descargar PDF del diagnóstico
     */
    async descargarPDF(diagId) {
        try {
            const diagnostico = this.diagnosticos.find(d => d.id === diagId);
            const empresa = this.empresas.find(e => e.id === diagnostico.empresaId);

            if (!diagnostico || !empresa) {
                alertService.error('Datos no encontrados');
                return;
            }

            await this.pdfService.generarPDFDiagnostico(diagId, empresa, diagnostico);
        } catch (error) {
            alertService.error('Error al descargar PDF');
            console.error(error);
        }
    }

    /**
     * Abrir edición de diagnóstico
     */
    async abrirEdicion(diagId) {
        try {
            const resultado = await this.diagnosticoService.obtenerDiagnosticoPorId(diagId);

            if (resultado.success) {
                this.diagnosticoActual = resultado.diagnostico;
                const empresa = this.empresas.find(e => e.id === resultado.diagnostico.empresaId);
                const contenido = this.view.renderFormularioEdicion(resultado.diagnostico, empresa);

                modalManager.open('modalEdicionDiag', `Editar - ${resultado.diagnostico.tipo.toUpperCase()}`, contenido, {
                    size: 'large',
                    closable: true
                });
            }
        } catch (error) {
            alertService.error('Error al abrir edición');
            console.error(error);
        }
    }

    /**
     * Confirmar eliminación
     */
    async confirmarEliminar(diagId) {
        const diagnostico = this.diagnosticos.find(d => d.id === diagId);

        modalManager.open('modalConfirmacion', 'Confirmar Eliminación',
            `¿Eliminar diagnóstico ${diagnostico.tipo.toUpperCase()}?`,
            {
                buttons: [
                    {
                        label: 'Cancelar',
                        type: 'secondary',
                        onClick: () => modalManager.close('modalConfirmacion')
                    },
                    {
                        label: 'Eliminar',
                        type: 'danger',
                        onClick: async () => {
                            await this.eliminarDiagnostico(diagId);
                            modalManager.close('modalConfirmacion');
                        }
                    }
                ]
            }
        );
    }

    /**
     * Eliminar diagnóstico
     */
    async eliminarDiagnostico(diagId) {
        try {
            const resultado = await this.diagnosticoService.eliminarDiagnostico(diagId);

            if (resultado.success) {
                await this.cargarDatos();
                this.view.renderListaDiagnosticos(this.diagnosticos);
            }
        } catch (error) {
            alertService.error('Error al eliminar');
            console.error(error);
        }
    }
}

export default DiagnosticosController;