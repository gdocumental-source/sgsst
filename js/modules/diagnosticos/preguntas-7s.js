/**
 * Preguntas para diagnóstico de 7 estándares
 * Separado del código principal para mejor mantenimiento
 */

export const PREGUNTAS_7S = [
    {
        id: 'rit_existe',
        tema: 'Reglamento interno de trabajo',
        titulo: '¿Cuenta con reglamento interno del trabajo?',
        tipo: 'radio',
        opciones: [
            { 
                texto: 'Sí', 
                puntos: 3, 
                recomendacion: 'Mantenerlo actualizado anualmente' 
            },
            { 
                texto: 'No', 
                puntos: 1, 
                recomendacion: 'Es obligatorio contar con un RIT...' 
            }
        ]
    },
    // ... más preguntas
];

export const PREGUNTAS_21S = [
    ...PREGUNTAS_7S,
    // ... preguntas adicionales
];

export const PREGUNTAS_60S = [
    ...PREGUNTAS_21S,
    // ... más preguntas
];