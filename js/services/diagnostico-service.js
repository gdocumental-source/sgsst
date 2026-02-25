/**
 * Servicio de Diagnósticos
 * Maneja creación, actualización y cálculo de resultados de diagnósticos
 */

import { alertService } from '../ui/alerts.js';
import { TIPOS_DIAGNOSTICO, ESTADOS_PROCESO } from '../config/constants.js';

export class DiagnosticoService {
    constructor(firebaseAuth) {
        this.auth = firebaseAuth;
        this.db = firebase.firestore();
    }

    /**
     * Crear nuevo diagnóstico
     */
    async crearDiagnostico(diagnosticoData) {
        try {
            const userId = this.auth.currentUser.uid;

            const diagnostico = {
                empresaId: diagnosticoData.empresaId,
                tipo: diagnosticoData.tipo, // '7s', '21s', '60s'
                estado: ESTADOS_PROCESO.SIN_AGENDAR,
                respuestas: diagnosticoData.respuestas || {},
                puntuacion: 0,
                porcentajeAvance: 0,
                resultado: null, // Se calcula al completar
                createdBy: userId,
                createdAt: new Date(),
                updatedAt: new Date(),
                completadoEn: null,
                fechaAgendada: null,
                horaAgendada: null,
                notasObservaciones: ''
            };

            const docRef = await this.db.collection('diagnosticos').add(diagnostico);
            
            alertService.success('Diagnóstico creado exitosamente');
            return { success: true, id: docRef.id, diagnostico };

        } catch (error) {
            alertService.error(`Error al crear diagnóstico: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener diagnóstico por ID
     */
    async obtenerDiagnosticoPorId(diagnosticoId) {
        try {
            const doc = await this.db.collection('diagnosticos').doc(diagnosticoId).get();

            if (!doc.exists()) {
                throw new Error('Diagnóstico no encontrado');
            }

            return { success: true, diagnostico: { id: doc.id, ...doc.data() } };

        } catch (error) {
            console.error('Error al obtener diagnóstico:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Obtener todos los diagnósticos de una empresa
     */
    async obtenerDiagnosticosPorEmpresa(empresaId) {
        try {
            const snapshot = await this.db.collection('diagnosticos')
                .where('empresaId', '==', empresaId)
                .orderBy('createdAt', 'desc')
                .get();

            const diagnosticos = [];
            snapshot.forEach(doc => {
                diagnosticos.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, diagnosticos };

        } catch (error) {
            console.error('Error al obtener diagnósticos:', error);
            return { success: false, error: error.message, diagnosticos: [] };
        }
    }

    /**
     * Actualizar respuestas del diagnóstico
     */
    async actualizarRespuestas(diagnosticoId, respuestas) {
        try {
            const diagnosticoRef = this.db.collection('diagnosticos').doc(diagnosticoId);
            
            // Calcular porcentaje de avance
            const totalPreguntas = Object.keys(respuestas).length;
            const respondidas = Object.values(respuestas).filter(r => r !== null && r !== undefined).length;
            const porcentaje = totalPreguntas > 0 ? Math.round((respondidas / totalPreguntas) * 100) : 0;

            await diagnosticoRef.update({
                respuestas: respuestas,
                porcentajeAvance: porcentaje,
                updatedAt: new Date()
            });

            return { success: true, porcentajeAvance: porcentaje };

        } catch (error) {
            alertService.error(`Error al actualizar respuestas: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Agendar diagnóstico
     */
    async agendarDiagnostico(diagnosticoId, fecha, hora) {
        try {
            await this.db.collection('diagnosticos').doc(diagnosticoId).update({
                estado: ESTADOS_PROCESO.DIAGNOSTICO_AGENDADO,
                fechaAgendada: fecha,
                horaAgendada: hora,
                updatedAt: new Date()
            });

            alertService.success('Diagnóstico agendado exitosamente');
            return { success: true };

        } catch (error) {
            alertService.error(`Error al agendar diagnóstico: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Completar diagnóstico y calcular resultado
     */
    async completarDiagnostico(diagnosticoId, respuestasFinales) {
        try {
            // Obtener el diagnóstico
            const diagDoc = await this.db.collection('diagnosticos').doc(diagnosticoId).get();
            if (!diagDoc.exists()) {
                throw new Error('Diagnóstico no encontrado');
            }

            const diagnostico = diagDoc.data();
            const tipo = diagnostico.tipo;

            // Calcular resultado según el tipo
            const resultado = this.calcularResultado(tipo, respuestasFinales);

            await this.db.collection('diagnosticos').doc(diagnosticoId).update({
                estado: ESTADOS_PROCESO.DIAGNOSTICO_COMPLETADO,
                respuestas: respuestasFinales,
                resultado: resultado,
                puntuacion: resultado.puntuacion,
                completadoEn: new Date(),
                updatedAt: new Date(),
                porcentajeAvance: 100
            });

            alertService.success('Diagnóstico completado exitosamente');
            return { success: true, resultado };

        } catch (error) {
            alertService.error(`Error al completar diagnóstico: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calcular resultado del diagnóstico según su tipo
     */
    calcularResultado(tipo, respuestas) {
        const valores = Object.values(respuestas).filter(v => v !== null && v !== undefined);
        
        if (valores.length === 0) {
            return {
                puntuacion: 0,
                estado: 'Sin respuestas',
                recomendaciones: []
            };
        }

        let puntuacion = 0;
        
        // Sumar todos los valores
        valores.forEach(valor => {
            puntuacion += parseInt(valor) || 0;
        });

        // Calcular promedio
        const promedio = valores.length > 0 ? puntuacion / valores.length : 0;

        // Determinar estado y recomendaciones según tipo y puntuación
        let resultado;

        switch (tipo) {
            case TIPOS_DIAGNOSTICO.SIETE: // 7S
                resultado = this.evaluarDiagnostico7S(promedio);
                break;
            case TIPOS_DIAGNOSTICO.VEINTIUNO: // 21S
                resultado = this.evaluarDiagnostico21S(promedio);
                break;
            case TIPOS_DIAGNOSTICO.SESENTA: // 60S
                resultado = this.evaluarDiagnostico60S(promedio);
                break;
            default:
                resultado = {
                    puntuacion: Math.round(promedio),
                    estado: 'Por evaluar',
                    recomendaciones: []
                };
        }

        return {
            ...resultado,
            totalRespuestas: valores.length,
            promedioRespuestas: Math.round(promedio * 100) / 100
        };
    }

    /**
     * Evaluar diagnóstico 7S (Simplificado)
     */
    evaluarDiagnostico7S(puntuacion) {
        let estado, recomendaciones;

        if (puntuacion >= 3.5) {
            estado = 'CUMPLIMIENTO TOTAL';
            recomendaciones = [
                'Mantener el nivel de cumplimiento actual',
                'Realizar auditorías periódicas',
                'Continuar con la sensibilización al personal'
            ];
        } else if (puntuacion >= 2.5) {
            estado = 'CUMPLIMIENTO SIGNIFICATIVO';
            recomendaciones = [
                'Fortalecer programas de capacitación',
                'Implementar controles adicionales',
                'Documentar procedimientos faltantes'
            ];
        } else if (puntuacion >= 1.5) {
            estado = 'CUMPLIMIENTO PARCIAL';
            recomendaciones = [
                'Crear plan de mejora inmediato',
                'Aumentar inspecciones y evaluaciones',
                'Asignar recursos para mejora continua'
            ];
        } else {
            estado = 'CUMPLIMIENTO INSUFICIENTE';
            recomendaciones = [
                'Intervención inmediata requerida',
                'Revisar política de SG-SST',
                'Establecer plan correctivo con seguimiento semanal'
            ];
        }

        return {
            puntuacion: Math.round(puntuacion * 100) / 100,
            estado,
            recomendaciones
        };
    }

    /**
     * Evaluar diagnóstico 21S
     */
    evaluarDiagnostico21S(puntuacion) {
        let estado, recomendaciones;

        if (puntuacion >= 4.2) {
            estado = 'EXCELENCIA';
            recomendaciones = [
                'Consolidar buenas prácticas',
                'Considerarse como empresa modelo',
                'Compartir experiencias con otras empresas'
            ];
        } else if (puntuacion >= 3.4) {
            estado = 'CONFORME';
            recomendaciones = [
                'Optimizar procesos existentes',
                'Identificar oportunidades de mejora',
                'Profundizar en temas críticos'
            ];
        } else if (puntuacion >= 2.4) {
            estado = 'EN MEJORA';
            recomendaciones = [
                'Implementar acciones correctivas',
                'Aumentar frecuencia de capacitaciones',
                'Verificar cumplimiento de requisitos'
            ];
        } else {
            estado = 'CRÍTICO';
            recomendaciones = [
                'Acción correctiva inmediata',
                'Auditoría interna exhaustiva',
                'Seguimiento mensual de mejoras'
            ];
        }

        return {
            puntuacion: Math.round(puntuacion * 100) / 100,
            estado,
            recomendaciones
        };
    }

    /**
     * Evaluar diagnóstico 60S
     */
    evaluarDiagnostico60S(puntuacion) {
        let estado, recomendaciones;

        if (puntuacion >= 4.5) {
            estado = 'SISTEMA CERTIFICABLE';
            recomendaciones = [
                'Sistema listo para certificación',
                'Mantener auditorías internas',
                'Actualizar documentación anualmente'
            ];
        } else if (puntuacion >= 3.5) {
            estado = 'SISTEMA MADURO';
            recomendaciones = [
                'Completar brechas documentales',
                'Profundizar evaluaciones de riesgos',
                'Mejorar indicadores de gestión'
            ];
        } else if (puntuacion >= 2.5) {
            estado = 'SISTEMA EN DESARROLLO';
            recomendaciones = [
                'Implementar procedimientos faltantes',
                'Fortalecer evaluaciones de riesgos',
                'Crear plan de contingencia'
            ];
        } else {
            estado = 'SISTEMA INCIPIENTE';
            recomendaciones = [
                'Desarrollar política de SG-SST',
                'Crear estructura de comités',
                'Iniciar programa de capacitación'
            ];
        }

        return {
            puntuacion: Math.round(puntuacion * 100) / 100,
            estado,
            recomendaciones
        };
    }

    /**
     * Obtener diagnósticos activos del usuario
     */
    async obtenerDiagnosticosActivos() {
        try {
            const userId = this.auth.currentUser.uid;
            const snapshot = await this.db.collection('diagnosticos')
                .where('createdBy', '==', userId)
                .where('estado', 'in', [
                    ESTADOS_PROCESO.SIN_AGENDAR,
                    ESTADOS_PROCESO.DIAGNOSTICO_AGENDADO,
                    ESTADOS_PROCESO.DIAGNOSTICO_EN_PROCESO
                ])
                .orderBy('createdAt', 'desc')
                .get();

            const diagnosticos = [];
            snapshot.forEach(doc => {
                diagnosticos.push({ id: doc.id, ...doc.data() });
            });

            return { success: true, diagnosticos };

        } catch (error) {
            console.error('Error al obtener diagnósticos activos:', error);
            return { success: false, error: error.message, diagnosticos: [] };
        }
    }

    /**
     * Eliminar diagnóstico
     */
    async eliminarDiagnostico(diagnosticoId) {
        try {
            await this.db.collection('diagnosticos').doc(diagnosticoId).delete();
            alertService.success('Diagnóstico eliminado correctamente');
            return { success: true };

        } catch (error) {
            alertService.error(`Error al eliminar diagnóstico: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

export default DiagnosticoService;