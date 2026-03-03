// js/data/preguntas-7s.js

/**
 * Preguntas para diagnóstico de 7 Estándares
 */

export const preguntas7s = [
  {
    id: 'rit_existe',
    tema: 'Reglamento interno de trabajo',
    titulo: '¿Cuenta con el reglamento interno de trabajo?',
    opciones: [
      { 
        texto: 'Sí', 
        puntos: 3, 
        recomendacion: 'Se recomienda que la organización elabore un reglamento interno de trabajo, especialmente si cuenta con más de 5 empleados en actividades comerciales, más de 10 en industriales o más de 20 en agrícolas, según el artículo 105 del Código Sustantivo del Trabajo (CST) de Colombia. Aunque no sea obligatorio para todas, su implementación ayuda a regular la relación laboral y mantener el orden interno. El reglamento debe incluir aspectos mínimos establecidos en el artículo 108 del CST, como condiciones de trabajo, jornada laboral, descansos, salarios, sanciones y procedimientos disciplinarios. Esto proporciona claridad, facilita la disciplina y protege tanto a la empresa como a los trabajadores.'
      },
      { 
        texto: 'No', 
        puntos: 1, 
        recomendacion: 'Se recomienda que la organización elabore un reglamento interno de trabajo, especialmente si cuenta con más de 5 empleados en actividades comerciales, más de 10 en industriales o más de 20 en agrícolas, según el artículo 105 del Código Sustantivo del Trabajo (CST) de Colombia. Aunque no sea obligatorio para todas, su implementación ayuda a regular la relación laboral y mantener el orden interno. El reglamento debe incluir aspectos mínimos establecidos en el artículo 108 del CST, como condiciones de trabajo, jornada laboral, descansos, salarios, sanciones y procedimientos disciplinarios. Esto proporciona claridad, facilita la disciplina y protege tanto a la empresa como a los trabajadores.'
      },
      { 
        texto: 'No aplica', 
        puntos: 3, 
        recomendacion: 'Aunque la empresa no está obligada a contar con un reglamento interno de trabajo, se recomienda considerarlo como una buena práctica para regular las relaciones laborales y prevenir conflictos.'
      }
    ],
    condicional: {
      'No': {
        ocultar: ['rit_fecha', 'rit_igualdad', 'rit_jornada', 'rit_modalidad_no_presencial', 'rit_teletrabajo', 'rit_clasificacion_arl', 'rit_horario_flexible', 'rit_actualizado_salud', 'rit_implem_sgsst', 'rit_auditoria_externa', 'rit_permisos_remunerados', 'rit_citas_medicas', 'rit_formulario_citas_medicas'],
        scoreOcultas: 0
      },
      'No aplica': {
        ocultar: ['rit_fecha', 'rit_igualdad', 'rit_jornada', 'rit_modalidad_no_presencial', 'rit_teletrabajo', 'rit_clasificacion_arl', 'rit_horario_flexible', 'rit_actualizado_salud', 'rit_implem_sgsst', 'rit_auditoria_externa', 'rit_permisos_remunerados', 'rit_citas_medicas', 'rit_formulario_citas_medicas'],
        scoreOcultas: 100
      }
    }
  },
  // ... CONTINÚA CON TODAS LAS DEMÁS PREGUNTAS DE 7s ...
  // Debes copiar el array completo del código original
];

console.log(`📊 preguntas7s cargadas: ${preguntas7s.length}`);