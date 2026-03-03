/**
 * CONSTANTES GLOBALES DE LA APLICACIÓN
 * Contiene estados, horarios, festivos y configuraciones generales
 */

// ============================================
// ESTADOS DEL PROCESO
// ============================================
export const ESTADOS_PROCESO = {
    SIN_AGENDAR: 'sin-agendar',
    DIAGNOSTICO_AGENDADO: 'agendado',
    DIAGNOSTICO_EN_PROCESO: 'en-proceso',
    DIAGNOSTICO_COMPLETADO: 'completado',
    ENTREGA_AGENDADA: 'entrega-agendada',
    ENTREGA_REALIZADA: 'entrega-realizada',
    CASO_FINALIZADO: 'finalizado'
};

// ============================================
// HORARIOS DISPONIBLES PARA CITAS
// ============================================
export const HORARIOS_DISPONIBLES = [
    '08:00 AM - 09:00 AM',
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '11:00 AM - 12:00 PM',
    '02:00 PM - 03:00 PM',
    '03:00 PM - 04:00 PM',
    '04:00 PM - 05:00 PM'
];

// ============================================
// FESTIVOS DE COLOMBIA 2025-2026
// ============================================
export const FESTIVOS_COLOMBIA = [
    // 2025
    '2025-01-01', // Año Nuevo
    '2025-01-06', // Reyes Magos
    '2025-03-24', // San José
    '2025-04-17', // Jueves Santo
    '2025-04-18', // Viernes Santo
    '2025-05-01', // Día del Trabajo
    '2025-05-19', // Ascensión del Señor
    '2025-06-09', // Corpus Christi
    '2025-06-16', // Sagrado Corazón
    '2025-06-23', // San Pedro y San Pablo
    '2025-07-20', // Día de la Independencia
    '2025-08-07', // Batalla de Boyacá
    '2025-08-18', // Asunción de la Virgen
    '2025-10-13', // Día de la Raza
    '2025-11-03', // Todos los Santos
    '2025-11-17', // Independencia de Cartagena
    '2025-12-08', // Inmaculada Concepción
    '2025-12-25', // Navidad
    
    // 2026
    '2026-01-01', // Año Nuevo
    '2026-01-12', // Reyes Magos
    '2026-03-23', // San José
    '2026-04-02', // Jueves Santo
    '2026-04-03', // Viernes Santo
    '2026-05-01', // Día del Trabajo
    '2026-05-18', // Ascensión del Señor
    '2026-06-08', // Corpus Christi
    '2026-06-15', // Sagrado Corazón
    '2026-06-29', // San Pedro y San Pablo
    '2026-07-20', // Día de la Independencia
    '2026-08-07', // Batalla de Boyacá
    '2026-08-17', // Asunción de la Virgen
    '2026-10-12', // Día de la Raza
    '2026-11-02', // Todos los Santos
    '2026-11-16', // Independencia de Cartagena
    '2026-12-08', // Inmaculada Concepción
    '2026-12-25'  // Navidad
];

// ============================================
// TIPOS DE SERVICIO
// ============================================
export const TIPOS_SERVICIO = {
    DIAGNOSTICO: 'diagnostico',
    AUDITORIA_EXTERNA: 'auditoria-externa',
    CAPACITACION: 'capacitacion',
    DESARROLLO_JURIDICO: 'desarrollo-juridico',
    REMISION: 'remision',
    ENTREGA_RESULTADOS: 'entrega-resultados'
};

// ============================================
// CONFIGURACIÓN DE EMAILJS
// ============================================
export const EMAILJS_CONFIG = {
    PUBLIC_KEY: '2p61NjRhHu3CiwopM',
    SERVICE_ID: 'service_djjqpm2',
    TEMPLATE_ID: 'template_504fr7t'
};

// ============================================
// ÍCONOS POR ESTADO
// ============================================
export const ICONOS_ESTADO = {
    'agendado': '📅',
    'en-proceso': '⏳',
    'completado': '✅',
    'entrega-agendada': '📦',
    'entrega-realizada': '🎉',
    'finalizado': '✔️',
    'enviado': '📤'
};

// ============================================
// NOMBRES DE TIPOS DE SERVICIO
// ============================================
export const NOMBRES_TIPO_SERVICIO = {
    'diagnostico': 'Diagnóstico',
    'auditoria-externa': 'Auditoría Externa',
    'capacitacion': 'Capacitación Continuada',
    'desarrollo-juridico': 'Desarrollo Jurídico Legal',
    'remision': 'Remisión a Otras Áreas',
    'entrega-resultados': 'Entrega de Resultados'
};