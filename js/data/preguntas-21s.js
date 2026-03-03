// js/data/preguntas-21s.js

/**
 * Preguntas para diagnóstico de 21 Estándares
 * Incluye todas las preguntas de 7s más las adicionales de 21s
 */

import { preguntas7s } from './preguntas-7s.js';

export const preguntas21s = [
    ...preguntas7s,
    
    // Página 1: Responsable SG-SST
    {
        id: 'sgsst21_responsable',
        tema: 'Sistema de Gestión de Seguridad y Salud en el Trabajo SG-SST',
        titulo: '¿La empresa cuenta con un responsable del Sistema de Gestión de Seguridad y Salud en el Trabajo (SG-SST)?',
        opciones: [
            { 
                texto: 'Sí', 
                puntos: 3, 
                recomendacion: 'Mantener definido y formalizado el responsable del SG-SST, garantizando que cumpla con los requisitos legales, cuente con licencia vigente y disponga de los recursos necesarios para la adecuada implementación del sistema.'
            },
            { 
                texto: 'No', 
                puntos: 1, 
                recomendacion: 'Designar inmediatamente un responsable interno o contratar uno externo que cumpla con licencia vigente en Seguridad y Salud en el Trabajo, conforme al Decreto 1072 de 2015 y la Resolución 0312 de 2019. La ausencia de responsable invalida la implementación del sistema, genera incumplimiento legal y expone a la empresa a sanciones del Ministerio del Trabajo, además de aumentar el riesgo de accidentes por falta de gestión técnica especializada.'
            }
        ],
        condicional: {
            'No': {
                scoreOcultas: 0
            }
        }
    },
    // ... CONTINÚA CON TODAS LAS DEMÁS PREGUNTAS DE 21s ...
];

console.log(`📊 preguntas21s cargadas: ${preguntas21s.length}`);