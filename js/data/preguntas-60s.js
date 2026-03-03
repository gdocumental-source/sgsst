// js/data/preguntas-60s.js

/**
 * Preguntas para diagnóstico de 60 Estándares
 * Incluye todas las preguntas de 21s más las adicionales de 60s
 */

import { preguntas21s } from './preguntas-21s.js';

export const preguntas60s = [
    ...preguntas21s,
    {
        id: 'sgsst_indicadores_ajustados',
        tema: 'Sistema de Gestión SG-SST',
        titulo: '¿Los indicadores de estructura, proceso y resultado del SG-SST se ajustan de conformidad con las condiciones específicas de la empresa?',
        opciones: [
            { 
                texto: 'La empresa ajustó los indicadores de estructura, proceso y resultado del SG-SST de conformidad con las necesidades de la compañía.', 
                puntos: 3, 
                recomendacion: 'Se evidencia que la empresa adapta la medición a la realidad organizacional, garantizando indicadores medibles y comparables que permiten un control efectivo del desempeño y una toma de decisiones informada, fortaleciendo la mejora continua del SG-SST.'
            },
            { 
                texto: 'La empresa tuvo en cuenta algunos de los indicadores de estructura, proceso y resultado del SG-SST conforme a las necesidades de la compañía, pero no adoptó todos los indicadores necesarios.', 
                puntos: 2, 
                recomendacion: 'Se evidencia un incumplimiento parcial del estándar 2.6.6 de la Resolución 0312 de 2019, afectando la calificación general del sistema e impidiendo evidenciar la eficacia real de las acciones preventivas y de control. Se recomienda completar la definición y aplicación de todos los indicadores requeridos.'
            },
            { 
                texto: 'La empresa no ajustó los indicadores de estructura, proceso y resultado del SG-SST conforme a las necesidades de la compañía o no tiene implementados los indicadores del sistema.', 
                puntos: 1, 
                recomendacion: 'La empresa debe diseñar e implementar la matriz de indicadores del SG-SST, incluyendo indicadores de estructura, proceso y resultado, alineándolos con el plan anual de trabajo y los objetivos del sistema. Se recomienda realizar seguimiento trimestral y ejecutar esta acción correctiva en un plazo no mayor a 60 días calendario.'
            }
        ]
    },
    // ... CONTINÚA CON TODAS LAS DEMÁS PREGUNTAS DE 60s ...
];

console.log(`📊 preguntas60s cargadas: ${preguntas60s.length}`);