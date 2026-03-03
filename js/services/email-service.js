// js/services/email-service.js

/**
 * Servicios de envío de email
 */

import { EMAILJS_CONFIG } from '../config/constants.js';
import { generarPDFBlob } from './pdf-service.js';
import { actualizarEstadoDiagnostico } from './diagnostico-service.js';
import { showAlert } from '../ui/alerts.js';
import { ref, uploadBytes, getDownloadURL, storage } from '../config/firebase-config.js';

// Inicializar EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

/**
 * Sube un PDF a Firebase Storage
 * @param {Blob} pdfBlob 
 * @param {string} nombreArchivo 
 * @param {string} usuarioId 
 * @returns {Promise<string>} - URL de descarga
 */
async function subirPDFaStorage(pdfBlob, nombreArchivo, usuarioId) {
    try {
        console.log('📤 Subiendo PDF a Firebase Storage...');
        
        const timestamp = Date.now();
        const nombreLimpio = nombreArchivo.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storageRef = ref(storage, `informes/${usuarioId}/${timestamp}_${nombreLimpio}`);
        
        await uploadBytes(storageRef, pdfBlob);
        console.log('✅ PDF subido a Storage');
        
        const downloadURL = await getDownloadURL(storageRef);
        console.log('✅ URL de descarga obtenida');
        
        return downloadURL;
    } catch (error) {
        console.error('❌ Error subiendo PDF a Storage:', error);
        throw error;
    }
}

/**
 * Envía un informe por correo
 * @param {Object} options - Opciones de envío
 * @param {Object} options.empresa - Empresa destino
 * @param {Object} options.diagnostico - Diagnóstico a enviar
 * @param {string} options.emailDestinatario - Email del destinatario
 * @param {string} options.asunto - Asunto del correo
 * @param {string} options.mensaje - Mensaje del correo
 * @param {Object} options.currentUser - Usuario que envía
 * @param {Array} options.diagnosticos - Lista de diagnósticos (para generar PDF)
 * @param {Array} options.empresas - Lista de empresas (para generar PDF)
 * @returns {Promise<boolean>}
 */
export async function enviarInformePorCorreo({
    empresa,
    diagnostico,
    emailDestinatario,
    asunto,
    mensaje,
    currentUser,
    diagnosticos,
    empresas
}) {
    try {
        showAlert('📤 Generando PDF...', 'info');
        
        const tipoDiag = diagnostico.datosDiagnostico?.tipoDiagnostico || '7s';
        const nombreArchivo = `Informe_SG-SST_${tipoDiag}_${empresa.nombre.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Generar PDF
        const pdfBlob = await generarPDFBlob(diagnostico.id, diagnosticos, empresas, currentUser);
        
        if (!pdfBlob) {
            throw new Error('Error al generar el PDF');
        }
        
        console.log('✅ PDF generado, tamaño:', pdfBlob.size, 'bytes');
        
        // Subir PDF a Storage
        showAlert('📤 Subiendo PDF a la nube...', 'info');
        const pdfUrl = await subirPDFaStorage(pdfBlob, nombreArchivo, currentUser.uid);
        
        // Mensaje con enlace de descarga
        const mensajeConEnlace = `${mensaje}

---

📎 **DESCARGAR INFORME COMPLETO**
Puede descargar el informe de diagnóstico desde el siguiente enlace:
${pdfUrl}

---
*Este enlace de descarga estará disponible permanentemente.*`;

        // Template para EmailJS
        const templateParams = {
            to_email: emailDestinatario,
            to_name: empresa.responsable || 'Cliente',
            from_name: currentUser?.displayName || currentUser?.email || 'Sistema SG-SST',
            subject: asunto,
            message: mensajeConEnlace,
            empresa_nombre: empresa.nombre,
            empresa_nit: empresa.nit,
            diagnostico_tipo: tipoDiag.toUpperCase(),
            diagnostico_fecha: new Date(diagnostico.fechaAgendada).toLocaleDateString('es-ES'),
            diagnostico_resultado: diagnostico.resultado?.porcentaje + '%' || 'N/A',
            link_descarga: pdfUrl
        };
        
        console.log('📧 Enviando email con EmailJS...');
        
        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams
        );
        
        console.log('✅ Email enviado:', response);
        
        // Actualizar estado del diagnóstico
        if (diagnostico.id) {
            await actualizarEstadoDiagnostico(diagnostico.id, 'enviado');
        }
        
        return true;
        
    } catch (error) {
        console.error('❌ Error enviando email:', error);
        throw error;
    }
}

/**
 * Guarda un envío en el historial local
 * @param {Object} envio - Datos del envío
 * @param {string} usuarioId - ID del usuario
 */
export function guardarEnHistorial(envio, usuarioId) {
    try {
        const historialKey = `historialEnvios_${usuarioId}`;
        const historialGuardado = localStorage.getItem(historialKey);
        let historial = historialGuardado ? JSON.parse(historialGuardado) : [];
        
        historial.unshift(envio);
        
        // Mantener solo los últimos 10
        if (historial.length > 10) {
            historial = historial.slice(0, 10);
        }
        
        localStorage.setItem(historialKey, JSON.stringify(historial));
    } catch (error) {
        console.warn('Error guardando historial:', error);
    }
}

/**
 * Obtiene el historial de envíos
 * @param {string} usuarioId 
 * @returns {Array}
 */
export function obtenerHistorialEnvios(usuarioId) {
    try {
        const historialKey = `historialEnvios_${usuarioId}`;
        const historialGuardado = localStorage.getItem(historialKey);
        return historialGuardado ? JSON.parse(historialGuardado) : [];
    } catch (error) {
        console.warn('Error cargando historial:', error);
        return [];
    }
}