/**
 * Controlador del módulo Empresas
 * Gestiona CRUD de empresas
 */

import { alertService } from '../../ui/alerts.js';
import { modalManager } from '../../ui/modal-manager.js';
import { EmpresaService } from '../../services/empresa-service.js';
import { EmpresasView } from './empresas-view.js';

export class EmpresasController {
    constructor(firebaseAuth) {
        this.auth = firebaseAuth;
        this.empresaService = new EmpresaService(firebaseAuth);
        this.view = new EmpresasView();
        this.empresas = [];
        this.empresaSeleccionada = null;
        this.setupEventListeners();
    }

    /**
     * Inicializar el módulo
     */
    async init() {
        await this.cargarEmpresas();
        this.view.renderEmpresas(this.empresas);
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'btnNuevaEmpresa') {
                this.abrirFormularioNueva();
            }
            if (e.target.classList.contains('btnEditarEmpresa')) {
                const empresaId = e.target.dataset.empresaId;
                await this.abrirFormularioEditar(empresaId);
            }
            if (e.target.classList.contains('btnEliminarEmpresa')) {
                const empresaId = e.target.dataset.empresaId;
                await this.confirmarEliminar(empresaId);
            }
            if (e.target.classList.contains('btnVerDetalles')) {
                const empresaId = e.target.dataset.empresaId;
                this.verDetalles(empresaId);
            }
            if (e.target.id === 'btnGuardarEmpresa') {
                await this.guardarEmpresa();
            }
            if (e.target.id === 'btnCancelarEmpresa') {
                modalManager.close('modalEmpresa');
            }
        });
    }

    /**
     * Cargar todas las empresas
     */
    async cargarEmpresas() {
        try {
            const resultado = await this.empresaService.obtenerEmpresas();
            if (resultado.success) {
                this.empresas = resultado.empresas;
            }
        } catch (error) {
            console.error('Error cargando empresas:', error);
            alertService.error('Error al cargar empresas');
        }
    }

    /**
     * Abrir formulario para nueva empresa
     */
    abrirFormularioNueva() {
        this.empresaSeleccionada = null;
        const contenido = this.view.renderFormularioEmpresa(null);
        
        modalManager.open('modalEmpresa', 'Nueva Empresa', contenido, {
            size: 'large',
            closable: true
        });
    }

    /**
     * Abrir formulario para editar empresa
     */
    async abrirFormularioEditar(empresaId) {
        try {
            const resultado = await this.empresaService.obtenerEmpresaPorId(empresaId);
            if (resultado.success) {
                this.empresaSeleccionada = resultado.empresa;
                const contenido = this.view.renderFormularioEmpresa(resultado.empresa);
                
                modalManager.open('modalEmpresa', 'Editar Empresa', contenido, {
                    size: 'large',
                    closable: true
                });
            }
        } catch (error) {
            alertService.error('Error al cargar empresa');
        }
    }

    /**
     * Guardar empresa (nueva o editar)
     */
    async guardarEmpresa() {
        const formData = this.view.obtenerDatosFormulario();

        if (!formData.valido) {
            alertService.error(formData.error);
            return;
        }

        try {
            let resultado;

            if (this.empresaSeleccionada) {
                resultado = await this.empresaService.actualizarEmpresa(
                    this.empresaSeleccionada.id,
                    formData.datos
                );
            } else {
                resultado = await this.empresaService.crearEmpresa(formData.datos);
            }

            if (resultado.success) {
                modalManager.close('modalEmpresa');
                await this.cargarEmpresas();
                this.view.renderEmpresas(this.empresas);
                this.empresaSeleccionada = null;
            }
        } catch (error) {
            alertService.error('Error al guardar empresa');
            console.error(error);
        }
    }

    /**
     * Confirmar eliminación
     */
    async confirmarEliminar(empresaId) {
        const empresa = this.empresas.find(e => e.id === empresaId);
        
        modalManager.open('modalConfirmacion', 'Confirmar Eliminación', 
            `¿Estás seguro de que deseas eliminar la empresa "${empresa.nombre}"? Esta acción no se puede deshacer.`,
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
                            await this.eliminarEmpresa(empresaId);
                            modalManager.close('modalConfirmacion');
                        }
                    }
                ]
            }
        );
    }

    /**
     * Eliminar empresa
     */
    async eliminarEmpresa(empresaId) {
        try {
            const resultado = await this.empresaService.eliminarEmpresa(empresaId);
            if (resultado.success) {
                await this.cargarEmpresas();
                this.view.renderEmpresas(this.empresas);
            }
        } catch (error) {
            alertService.error('Error al eliminar empresa');
        }
    }

    /**
     * Ver detalles de empresa
     */
    async verDetalles(empresaId) {
        try {
            const empresa = this.empresas.find(e => e.id === empresaId);
            const resultado = await this.empresaService.obtenerEstadisticas(empresaId);

            if (resultado.success) {
                const contenido = this.view.renderDetalles(empresa, resultado.estadisticas);
                modalManager.open('modalDetalles', `Detalles - ${empresa.nombre}`, contenido, {
                    size: 'large',
                    closable: true
                });
            }
        } catch (error) {
            alertService.error('Error al cargar detalles');
        }
    }
}

export default EmpresasController;