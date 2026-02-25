/**
 * Servicio de Gestión de Empresas
 * Maneja CRUD y validaciones de empresas
 */

import { alertService } from '../ui/alerts.js';
import { VALIDACION } from '../config/constants.js';

export class EmpresaService {
    constructor(firebaseAuth) {
        this.auth = firebaseAuth;
        this.db = firebase.firestore();
    }

    /**
     * Crear nueva empresa
     * @param {Object} empresaData - Datos de la empresa
     */
    async crearEmpresa(empresaData) {
        try {
            // Validar datos
            const validacion = this.validarDatosEmpresa(empresaData);
            if (!validacion.valido) {
                throw new Error(validacion.error);
            }

            const userId = this.auth.currentUser.uid;

            const empresa = {
                nombre: empresaData.nombre.trim(),
                nit: empresaData.nit.trim(),
                razonSocial: empresaData.razonSocial.trim(),
                ciudad: empresaData.ciudad.trim(),
                direccion: empresaData.direccion.trim(),
                telefono: empresaData.telefono.trim(),
                email: empresaData.email.trim(),
                representanteLegal: empresaData.representanteLegal.trim(),
                cedulaRepresentante: empresaData.cedulaRepresentante.trim(),
                numeroTrabajadores: parseInt(empresaData.numeroTrabajadores),
                actividadEconomica: empresaData.actividadEconomica.trim(),
                riesgoPrincipal: empresaData.riesgoPrincipal.trim(),
                afiliadoARP: empresaData.afiliadoARP.trim(),
                responsableSST: empresaData.responsableSST.trim(),
                telefonoResponsable: empresaData.telefonoResponsable.trim(),
                emailResponsable: empresaData.emailResponsable.trim(),
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                estado: 'activa',
                servicios: []
            };

            const docRef = await this.db.collection('empresas').add(empresa);
            
            alertService.success('Empresa registrada exitosamente');
            return { success: true, id: docRef.id, empresa };

        } catch (error) {
            alertService.error(`Error al crear empresa: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Actualizar empresa existente
     */
    async actualizarEmpresa(empresaId, empresaData) {
        try {
            const validacion = this.validarDatosEmpresa(empresaData);
            if (!validacion.valido) {
                throw new Error(validacion.error);
            }

            const empresaUpdate = {
                nombre: empresaData.nombre.trim(),
                nit: empresaData.nit.trim(),
                razonSocial: empresaData.razonSocial.trim(),
                ciudad: empresaData.ciudad.trim(),
                direccion: empresaData.direccion.trim(),
                telefono: empresaData.telefono.trim(),
                email: empresaData.email.trim(),
                representanteLegal: empresaData.representanteLegal.trim(),
                cedulaRepresentante: empresaData.cedulaRepresentante.trim(),
                numeroTrabajadores: parseInt(empresaData.numeroTrabajadores),
                actividadEconomica: empresaData.actividadEconomica.trim(),
                riesgoPrincipal: empresaData.riesgoPrincipal.trim(),
                afiliadoARP: empresaData.afiliadoARP.trim(),
                responsableSST: empresaData.responsableSST.trim(),
                telefonoResponsable: empresaData.telefonoResponsable.trim(),
                emailResponsable: empresaData.emailResponsable.trim(),
                updatedAt: new Date()
            };

            await this.db.collection('empresas').doc(empresaId).update(empresaUpdate);
            
            alertService.success('Empresa actualizada correctamente');
            return { success: true, empresa: empresaUpdate };

        } catch (error) {
            alertService.error(`Error al actualizar empresa: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener todas las empresas del usuario
     */
    async obtenerEmpresas() {
        try {
            const userId = this.auth.currentUser.uid;
            const snapshot = await this.db.collection('empresas')
                .where('createdBy', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            const empresas = [];
            snapshot.forEach(doc => {
                empresas.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, empresas };

        } catch (error) {
            console.error('Error al obtener empresas:', error);
            return { success: false, error: error.message, empresas: [] };
        }
    }

    /**
     * Obtener empresa por ID
     */
    async obtenerEmpresaPorId(empresaId) {
        try {
            const doc = await this.db.collection('empresas').doc(empresaId).get();

            if (!doc.exists) {
                throw new Error('Empresa no encontrada');
            }

            return { success: true, empresa: { id: doc.id, ...doc.data() } };

        } catch (error) {
            console.error('Error al obtener empresa:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Eliminar empresa
     */
    async eliminarEmpresa(empresaId) {
        try {
            await this.db.collection('empresas').doc(empresaId).delete();
            alertService.success('Empresa eliminada correctamente');
            return { success: true };

        } catch (error) {
            alertService.error(`Error al eliminar empresa: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validar datos de la empresa
     */
    validarDatosEmpresa(data) {
        // Nombre
        if (!data.nombre || data.nombre.trim().length < VALIDACION.MIN_NOMBRE_EMPRESA) {
            return { 
                valido: false, 
                error: `Nombre debe tener al menos ${VALIDACION.MIN_NOMBRE_EMPRESA} caracteres` 
            };
        }

        // NIT
        if (!data.nit || data.nit.trim().length < VALIDACION.MIN_NIT) {
            return { 
                valido: false, 
                error: `NIT debe tener al menos ${VALIDACION.MIN_NIT} caracteres` 
            };
        }

        if (!VALIDACION.REGEX_NIT.test(data.nit)) {
            return { 
                valido: false, 
                error: 'NIT debe contener solo números, puntos y guiones' 
            };
        }

        // Email
        if (!data.email || !VALIDACION.REGEX_EMAIL.test(data.email)) {
            return { 
                valido: false, 
                error: 'Email inválido' 
            };
        }

        // Trabajadores
        if (!data.numeroTrabajadores || parseInt(data.numeroTrabajadores) < VALIDACION.MIN_TRABAJADORES) {
            return { 
                valido: false, 
                error: `Número de trabajadores debe ser mínimo ${VALIDACION.MIN_TRABAJADORES}` 
            };
        }

        // Teléfono
        if (data.telefono && !VALIDACION.REGEX_TELEFONO.test(data.telefono)) {
            return { 
                valido: false, 
                error: 'Formato de teléfono inválido' 
            };
        }

        return { valido: true };
    }

    /**
     * Agregar servicio a la empresa
     */
    async agregarServicio(empresaId, servicio) {
        try {
            await this.db.collection('empresas').doc(empresaId).update({
                servicios: firebase.firestore.FieldValue.arrayUnion(servicio),
                updatedAt: new Date()
            });

            return { success: true };

        } catch (error) {
            alertService.error(`Error al agregar servicio: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener estadísticas de empresa
     */
    async obtenerEstadisticas(empresaId) {
        try {
            const empresaDoc = await this.db.collection('empresas').doc(empresaId).get();
            
            if (!empresaDoc.exists) {
                throw new Error('Empresa no encontrada');
            }

            const empresa = empresaDoc.data();

            // Contar diagnósticos
            const diagnosticos = await this.db.collection('diagnosticos')
                .where('empresaId', '==', empresaId)
                .get();

            const diagnosticosPorEstado = {
                agendados: 0,
                enProceso: 0,
                completados: 0,
                enviados: 0
            };

            diagnosticos.forEach(doc => {
                const estado = doc.data().estado;
                if (estado === 'agendado') diagnosticosPorEstado.agendados++;
                else if (estado === 'en-proceso') diagnosticosPorEstado.enProceso++;
                else if (estado === 'completado') diagnosticosPorEstado.completados++;
                else if (estado === 'enviado') diagnosticosPorEstado.enviados++;
            });

            return {
                success: true,
                estadisticas: {
                    nombre: empresa.nombre,
                    totalDiagnosticos: diagnosticos.size,
                    ...diagnosticosPorEstado
                }
            };

        } catch (error) {
            console.error('Error al obtener estadísticas:', error);
            return { 
                success: false, 
                error: error.message,
                estadisticas: null 
            };
        }
    }
}

export default EmpresaService;