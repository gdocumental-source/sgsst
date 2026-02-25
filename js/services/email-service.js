/**
 * Servicio de Email
 * Envía notificaciones vía EmailJS
 */

import { alertService } from '../ui/alerts.js';
import { EMAILJS_CONFIG } from '../config/constants.js';

export class EmailService {
    constructor() {
        this.initialized = false;
        this.init();
    }

    /**
     * Inicializar EmailJS
     */
    init() {
        try {
            if (typeof emailjs !== 'undefined') {
                emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
                this.initialized = true;
                console.log('✅ EmailJS inicializado');
            } else {
                console.warn('⚠️ EmailJS no disponible');
            }
        } catch (error) {
            console.error('Error inicializando EmailJS:', error);
        }
    }

    /**
     * Enviar email de confirmación de diagnóstico
     */
    async enviarConfirmacionDiagnostico(empresaData, diagnosticoData) {
        try {
            if (!this.initialized) {
                throw new Error('EmailJS no está inicializado');
            }

            const emailParams = {
                to_email: empresaData.email,
                to_name: empresaData.nombre,
                subject: `Confirmación de Diagnóstico SG-SST - ${empresaData.nombre}`,
                empresa_nombre: empresaData.nombre,
                empresa_nit: empresaData.nit,
                diagnostico_tipo: diagnosticoData.tipo,
                fecha_agendar: diagnosticoData.fechaAgendada || 'Por confirmar',
                hora_agendar: diagnosticoData.horaAgendada || 'Por confirmar',
                message: `Se ha registrado exitosamente el diagnóstico SG-SST para su empresa. Por favor confirme la disponibilidad para la fecha y hora agendada.`
            };

            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                emailParams
            );

            console.log('✅ Email de confirmación enviado:', response);
            return { success: true, response };

        } catch (error) {
            console.error('Error enviando email:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enviar email de reagendamiento
     */
    async enviarReagendamiento(empresaData, diagnosticoData, fechaAnterior, horaAnterior) {
        try {
            if (!this.initialized) {
                throw new Error('EmailJS no está inicializado');
            }

            const emailParams = {
                to_email: empresaData.email,
                to_name: empresaData.nombre,
                subject: `Reagendamiento de Cita - ${empresaData.nombre}`,
                empresa_nombre: empresaData.nombre,
                fecha_anterior: fechaAnterior,
                hora_anterior: horaAnterior,
                fecha_nueva: diagnosticoData.fechaAgendada,
                hora_nueva: diagnosticoData.horaAgendada,
                motivo: diagnosticoData.motivoReagendamiento || 'No especificado',
                message: 'La cita ha sido reagendada. Por favor confirme su disponibilidad en la nueva fecha y hora.'
            };

            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                emailParams
            );

            console.log('✅ Email de reagendamiento enviado:', response);
            return { success: true, response };

        } catch (error) {
            console.error('Error enviando email de reagendamiento:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enviar email con resultado de diagnóstico
     */
    async enviarResultadoDiagnostico(empresaData, diagnosticoData, resultado) {
        try {
            if (!this.initialized) {
                throw new Error('EmailJS no está inicializado');
            }

            const recomendacionesTexto = resultado.recomendaciones
                .map((rec, i) => `${i + 1}. ${rec}`)
                .join('\n');

            const emailParams = {
                to_email: empresaData.email,
                to_name: empresaData.nombre,
                subject: `Resultado del Diagnóstico SG-SST - ${empresaData.nombre}`,
                empresa_nombre: empresaData.nombre,
                diagnostico_tipo: diagnosticoData.tipo,
                puntuacion: resultado.puntuacion,
                estado: resultado.estado,
                recomendaciones: recomendacionesTexto,
                message: `Adjunto encontrará el resultado completo de su diagnóstico SG-SST.`
            };

            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                emailParams
            );

            console.log('✅ Email con resultado enviado:', response);
            return { success: true, response };

        } catch (error) {
            console.error('Error enviando email con resultado:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Enviar email genérico
     */
    async enviarEmailGenerico(para, asunto, contenido, variables = {}) {
        try {
            if (!this.initialized) {
                throw new Error('EmailJS no está inicializado');
            }

            const emailParams = {
                to_email: para,
                subject: asunto,
                message: contenido,
                ...variables
            };

            const response = await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                emailParams
            );

            console.log('✅ Email genérico enviado:', response);
            return { success: true, response };

        } catch (error) {
            console.error('Error enviando email genérico:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Verificar si EmailJS está inicializado
     */
    isInitialized() {
        return this.initialized;
    }
}

// Exportar instancia singleton
export const emailService = new EmailService();

export default EmailService;