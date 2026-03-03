// js/controllers/diagnostico-controller.js

/**
 * Controlador de diagnósticos
 * Maneja el formulario de preguntas, respuestas y cálculo de resultados
 */

import { guardarRespuestasDiagnostico, actualizarEstadoDiagnostico, crearCitaEntregaResultados } from '../services/diagnostico-service.js';
import { showAlert } from '../ui/alerts.js';
import { preguntas7s } from '../data/preguntas-7s.js';
import { preguntas21s } from '../data/preguntas-21s.js';
import { preguntas60s } from '../data/preguntas-60s.js';
import { ESTADOS_PROCESO } from '../config/constants.js';

// ============================================
// VARIABLES DE ESTADO
// ============================================
let diagnosticoActual = null;
let respuestasDiagnostico = {};

// ============================================
// INICIALIZACIÓN
// ============================================
export function initDiagnosticoController() {
    console.log('📝 Inicializando controlador de diagnósticos...');
}

// ============================================
// APERTURA DEL FORMULARIO
// ============================================
window.abrirFormularioDiagnostico = function(diagnosticoId) {
    const { getDiagnosticos } = require('./main-controller.js');
    const diagnosticos = getDiagnosticos();
    
    diagnosticoActual = diagnosticos.find(d => d.id === diagnosticoId);
    if (!diagnosticoActual || !diagnosticoActual.datosDiagnostico) {
        showAlert('Error: No se encontró el diagnóstico', 'danger');
        return;
    }
    
    const tipoDiag = diagnosticoActual.datosDiagnostico.tipoDiagnostico;
    
    if (tipoDiag !== '7s' && tipoDiag !== '21s' && tipoDiag !== '60s') {
        showAlert('Formulario para ' + tipoDiag.toUpperCase() + ' en desarrollo', 'info');
        return;
    }
    
    // Cargar progreso si existe
    if (diagnosticoActual.resultado && diagnosticoActual.resultado.enProgreso) {
        respuestasDiagnostico = diagnosticoActual.resultado.respuestas || {};
        const preguntasRespondidas = Object.keys(respuestasDiagnostico).length;
        showAlert(`📋 Continuando diagnóstico: ${preguntasRespondidas} preguntas ya respondidas`, 'info');
    } else {
        respuestasDiagnostico = {};
    }
    
    document.querySelectorAll('.panel-view').forEach(panel => panel.classList.remove('active'));
    document.getElementById('panel-formulario').classList.add('active');
    document.getElementById('formularioTitulo').textContent = 'Diagnóstico ' + tipoDiag.toUpperCase() + ' - ' + diagnosticoActual.empresaNombre;
    
    renderFormularioDiagnostico(tipoDiag);
};

window.cerrarFormularioDiagnostico = function() {
    document.getElementById('panel-formulario').classList.remove('active');
    window.showPanel('agenda');
};

// ============================================
// RENDERIZADO DEL FORMULARIO
// ============================================
function renderFormularioDiagnostico(tipo) {
    const container = document.getElementById('formularioContent');
    let preguntasAUsar = [];
    let nombreDiagnostico = '';
    
    // Asignar preguntas según tipo
    if (tipo === '7s') {
        preguntasAUsar = preguntas7s;
        nombreDiagnostico = '7 Estándares';
    } else if (tipo === '21s') {
        preguntasAUsar = preguntas21s;
        nombreDiagnostico = '21 Estándares';
    } else if (tipo === '60s') {
        preguntasAUsar = preguntas60s;
        nombreDiagnostico = '60 Estándares';
    }
    
    if (!preguntasAUsar || preguntasAUsar.length === 0) {
        showAlert('❌ Error: No hay preguntas disponibles', 'danger');
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⚠️</div>
                <h3>Error al cargar preguntas</h3>
                <p>No se encontraron las preguntas. Por favor, recarga la página.</p>
                <button onclick="location.reload()" class="btn btn-primary" style="margin-top: 20px;">
                    🔄 Recargar Página
                </button>
            </div>
        `;
        return;
    }
    
    // Aplicar condicionales
    const preguntasOcultas = new Set();
    
    Object.entries(respuestasDiagnostico).forEach(([idRespuesta, respuesta]) => {
        const preguntaRespuesta = preguntasAUsar.find(p => p.id === idRespuesta);
        
        if (preguntaRespuesta?.condicional && respuesta.texto) {
            console.log(`🔍 Evaluando condicional de ${idRespuesta}:`, respuesta.texto);
            
            const condicional = preguntaRespuesta.condicional[respuesta.texto];
            
            if (condicional?.ocultar) {
                console.log(`   ➡️ Ocultando preguntas:`, condicional.ocultar);
                condicional.ocultar.forEach(pregId => {
                    preguntasOcultas.add(pregId);
                });
            }
        }
    });
    
    // Filtrar preguntas visibles
    const preguntasVisibles = preguntasAUsar.filter(pregunta => 
        !preguntasOcultas.has(pregunta.id)
    );
    
    console.log('✅ Preguntas visibles:', preguntasVisibles.length);
    
    // Generar HTML
    let html = `
        <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px;">
            <h3 style="font-size: 24px; margin-bottom: 10px;">📋 Formulario de Diagnóstico ${nombreDiagnostico}</h3>
            <p style="opacity: 0.9;">Empresa: ${diagnosticoActual.empresaNombre}</p>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin-top: 15px;">
                <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; text-align: center;">
                    <strong>Total:</strong> ${preguntasAUsar.length}
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; text-align: center;">
                    <strong>Visibles:</strong> ${preguntasVisibles.length}
                </div>
                <div style="background: rgba(255,255,255,0.2); padding: 10px; border-radius: 8px; text-align: center;">
                    <strong>Ocultas:</strong> ${preguntasAUsar.length - preguntasVisibles.length}
                </div>
            </div>
        </div>
    `;
    
    // Agrupar por tema
    const temas = {};
    preguntasVisibles.forEach(pregunta => {
        if (!pregunta.tema || !pregunta.titulo) return;
        
        if (!temas[pregunta.tema]) {
            temas[pregunta.tema] = [];
        }
        temas[pregunta.tema].push(pregunta);
    });
    
    let preguntaNumero = 1;
    
    // Renderizar cada tema
    Object.keys(temas).forEach(tema => {
        temas[tema].forEach((pregunta) => {
            // Pregunta de opción simple
            if (pregunta.opciones && Array.isArray(pregunta.opciones) && pregunta.opciones.length > 0 && 
                pregunta.tipo !== 'checkbox' && pregunta.tipo !== 'multiple' && !pregunta.multipleSeleccion) {
                html += `
                    <div class="pregunta-card">
                        <div class="pregunta-titulo">
                            <strong>${preguntaNumero}.</strong> ${pregunta.titulo}
                        </div>
                        <div class="opciones-grupo" id="pregunta-${pregunta.id}">
                            ${pregunta.opciones.map((opcion) => {
                                const yaRespondida = respuestasDiagnostico[pregunta.id];
                                const estaSeleccionada = yaRespondida && yaRespondida.texto === opcion.texto;
                                
                                const recomendacionEscapada = opcion.recomendacion 
                                    ? opcion.recomendacion.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n')
                                    : '';
                                
                                return `
                                <label class="opcion-radio ${estaSeleccionada ? 'selected' : ''}" 
                                       onclick="window.seleccionarRespuesta('${pregunta.id}', ${opcion.puntos}, '${recomendacionEscapada}', this)">
                                    <input type="radio" name="${pregunta.id}" value="${opcion.puntos}" ${estaSeleccionada ? 'checked' : ''}>
                                    <span>${opcion.texto}</span>
                                </label>
                            `}).join('')}
                        </div>
                    </div>
                `;
                preguntaNumero++;
            }
            // Pregunta abierta
            else if (pregunta.tipo === 'abierta') {
                const valorActual = respuestasDiagnostico[pregunta.id] ? respuestasDiagnostico[pregunta.id].valor : '';
                html += `
                    <div class="pregunta-card">
                        <div class="pregunta-titulo">
                            <strong>${preguntaNumero}.</strong> ${pregunta.titulo}
                        </div>
                        <div class="opciones-grupo">
                            <input 
                                type="text" 
                                id="pregunta-${pregunta.id}" 
                                value="${valorActual}"
                                placeholder="${pregunta.placeholder || 'Ingrese su respuesta'}"
                                onchange="window.guardarRespuestaAbierta('${pregunta.id}', this.value, '${pregunta.recomendacion || ''}')"
                                style="width: 100%; padding: 12px; border: 2px solid #e1e8ed; border-radius: 8px; font-size: 14px;"
                            >
                        </div>
                    </div>
                `;
                preguntaNumero++;
            }
            // Pregunta múltiple
            else if (pregunta.tipo === 'checkbox' || pregunta.tipo === 'multiple' || pregunta.multipleSeleccion === true) {
                const valoresSeleccionados = respuestasDiagnostico[pregunta.id] ? (respuestasDiagnostico[pregunta.id].valores || []) : [];
                html += `
                    <div class="pregunta-card">
                        <div class="pregunta-titulo">
                            <strong>${preguntaNumero}.</strong> ${pregunta.titulo}
                        </div>
                        <div class="opciones-grupo" id="pregunta-${pregunta.id}">
                            ${pregunta.opciones.map((opcion) => {
                                const estaSeleccionada = valoresSeleccionados.includes(opcion.valor);
                                return `
                                <label class="opcion-radio ${estaSeleccionada ? 'selected' : ''}" 
                                       onclick="window.toggleRespuestaMultiple('${pregunta.id}', '${opcion.valor}', this, '${pregunta.recomendacion || ''}')">
                                    <input type="checkbox" name="${pregunta.id}[]" value="${opcion.valor}" ${estaSeleccionada ? 'checked' : ''}>
                                    <span>${opcion.texto}</span>
                                </label>
                            `}).join('')}
                        </div>
                    </div>
                `;
                preguntaNumero++;
            }
        });
    });
    
    // Botones de acción
    html += `
        <div style="display: flex; justify-content: center; gap: 15px; margin-top: 30px; flex-wrap: wrap;">
            <button class="btn btn-secondary" onclick="window.cerrarFormularioDiagnostico()">
                ❌ Cancelar
            </button>
            <button class="btn btn-warning" onclick="window.guardarProgresoYReagendar()">
                💾 Guardar Progreso y Reagendar
            </button>
            <button class="btn btn-success" onclick="window.calcularResultadoDiagnostico()">
                📊 Calcular Resultado
            </button>
        </div>
        <div id="resultadoContainer"></div>
    `;
    
    container.innerHTML = html;
}

// ============================================
// MANEJO DE RESPUESTAS
// ============================================
window.seleccionarRespuesta = function(preguntaId, puntos, recomendacion, elemento) {
    const textoSeleccionado = elemento.querySelector('span').textContent;
    
    console.log('📝 Respuesta seleccionada:', { preguntaId, puntos, texto: textoSeleccionado });
    
    respuestasDiagnostico[preguntaId] = {
        puntos: puntos,
        recomendacion: recomendacion,
        texto: textoSeleccionado
    };
    
    // Actualizar UI
    const contenedor = elemento.parentElement;
    contenedor.querySelectorAll('.opcion-radio').forEach(opt => {
        opt.classList.remove('selected');
    });
    elemento.classList.add('selected');
    
    // Re-renderizar para aplicar condicionales
    const tipoDiag = diagnosticoActual.datosDiagnostico.tipoDiagnostico;
    renderFormularioDiagnostico(tipoDiag);
};

window.guardarRespuestaAbierta = function(preguntaId, valor, recomendacion) {
    respuestasDiagnostico[preguntaId] = {
        tipo: 'abierta',
        valor: valor || '',
        recomendacion: recomendacion || '',
        puntos: 0
    };
    console.log('✅ Respuesta abierta guardada:', preguntaId, valor);
};

window.toggleRespuestaMultiple = function(preguntaId, valorOpcion, elemento, recomendacion) {
    if (!respuestasDiagnostico[preguntaId]) {
        respuestasDiagnostico[preguntaId] = {
            tipo: 'multiple',
            valores: [],
            recomendacion: recomendacion || '',
            puntos: 0
        };
    }
    
    const checkbox = elemento.querySelector('input[type="checkbox"]');
    const valores = respuestasDiagnostico[preguntaId].valores;
    
    if (checkbox.checked) {
        if (!valores.includes(valorOpcion)) {
            valores.push(valorOpcion);
        }
        elemento.classList.add('selected');
    } else {
        const index = valores.indexOf(valorOpcion);
        if (index > -1) {
            valores.splice(index, 1);
        }
        elemento.classList.remove('selected');
    }
    
    respuestasDiagnostico[preguntaId].puntos = 0;
    console.log('✅ Respuesta múltiple actualizada:', preguntaId, valores);
};

// ============================================
// GUARDADO DE PROGRESO
// ============================================
window.guardarProgresoYReagendar = async function() {
    if (Object.keys(respuestasDiagnostico).length === 0) {
        showAlert('⚠️ Debes responder al menos una pregunta antes de guardar el progreso', 'warning');
        return;
    }
    
    const tipoDiag = diagnosticoActual.datosDiagnostico.tipoDiagnostico;
    let preguntasAUsar = [];
    
    if (tipoDiag === '7s') preguntasAUsar = preguntas7s;
    else if (tipoDiag === '21s') preguntasAUsar = preguntas21s;
    else if (tipoDiag === '60s') preguntasAUsar = preguntas60s;
    
    const preguntasRespondidas = Object.keys(respuestasDiagnostico).length;
    const totalPreguntas = preguntasAUsar.length;
    
    if (!confirm(`¿Guardar progreso?\n\nHas respondido ${preguntasRespondidas} de ${totalPreguntas} preguntas.`)) {
        return;
    }
    
    const progresoData = {
        respuestas: respuestasDiagnostico,
        preguntasRespondidas: preguntasRespondidas,
        totalPreguntas: totalPreguntas,
        porcentajeCompletado: Math.round((preguntasRespondidas / totalPreguntas) * 100),
        fechaUltimaActualizacion: new Date().toISOString(),
        tipoDiagnostico: tipoDiag,
        enProgreso: true
    };
    
    const resultado = await guardarRespuestasDiagnostico(diagnosticoActual.id, progresoData);
    
    if (resultado.success) {
        await actualizarEstadoDiagnostico(diagnosticoActual.id, 'en-proceso');
        showAlert(`✅ Progreso guardado (${preguntasRespondidas}/${totalPreguntas} preguntas)`, 'success');
        
        window.cerrarFormularioDiagnostico();
        
        setTimeout(() => {
            window.reagendarCita(diagnosticoActual.id);
        }, 500);
    } else {
        showAlert('❌ Error al guardar progreso: ' + resultado.error, 'danger');
    }
};

// ============================================
// CÁLCULO DE RESULTADOS
// ============================================
window.calcularResultadoDiagnostico = function() {
    const tipoDiag = diagnosticoActual.datosDiagnostico.tipoDiagnostico;
    let preguntasAUsar = [];
    
    if (tipoDiag === '7s') preguntasAUsar = preguntas7s;
    else if (tipoDiag === '21s') preguntasAUsar = preguntas21s;
    else if (tipoDiag === '60s') preguntasAUsar = preguntas60s;
    
    if (!preguntasAUsar || preguntasAUsar.length === 0) {
        showAlert('❌ Error: No se encontraron las preguntas', 'danger');
        return;
    }
    
    const preguntasRespondidas = Object.keys(respuestasDiagnostico).length;
    const preguntasFaltantes = preguntasAUsar.length - preguntasRespondidas;
    
    if (preguntasFaltantes > 0) {
        showAlert(
            `⚠️ Por favor responda todas las preguntas. Te faltan ${preguntasFaltantes} pregunta${preguntasFaltantes > 1 ? 's' : ''}.`, 
            'warning'
        );
        return;
    }
    
    // Limpiar respuestas
    Object.keys(respuestasDiagnostico).forEach(preguntaId => {
        const respuesta = respuestasDiagnostico[preguntaId];
        
        if (respuesta.puntos === undefined || respuesta.puntos === null) {
            respuesta.puntos = 0;
        }
        
        if (!respuesta.recomendacion) {
            respuesta.recomendacion = '';
        }
    });
    
    // Calcular puntaje
    let puntosObtenidos = 0;
    let puntosMaximos = 0;
    
    preguntasAUsar.forEach(pregunta => {
        if (!pregunta.opciones || pregunta.opciones.length === 0) {
            if (pregunta.tipo === 'abierta' || pregunta.tipo === 'multiple' || pregunta.tipo === 'checkbox') {
                return;
            }
            return;
        }
        
        const respuesta = respuestasDiagnostico[pregunta.id];
        
        if (respuesta && respuesta.puntos !== undefined && respuesta.puntos !== null) {
            puntosObtenidos += respuesta.puntos;
        }
        
        const maxPuntosPregunta = Math.max(...pregunta.opciones.map(o => o.puntos || 0));
        puntosMaximos += maxPuntosPregunta;
    });
    
    const porcentaje = puntosMaximos > 0 ? Math.round((puntosObtenidos / puntosMaximos) * 100) : 0;
    
    // Determinar nivel de cumplimiento
    let nivelCumplimiento = '';
    let colorGradiente = '';
    
    if (porcentaje < 60) {
        nivelCumplimiento = 'CRÍTICO';
        colorGradiente = 'linear-gradient(135deg, #eb3349, #f45c43)';
    } else if (porcentaje >= 61 && porcentaje <= 80) {
        nivelCumplimiento = 'MODERADAMENTE ACEPTABLE';
        colorGradiente = 'linear-gradient(135deg, #f39c12, #f1c40f)';
    } else {
        nivelCumplimiento = 'ACEPTABLE';
        colorGradiente = 'linear-gradient(135deg, #11998e, #38ef7d)';
    }
    
    // Mostrar resultado
    const resultadoHTML = `
        <div class="resultado-card" style="background: ${colorGradiente};">
            <h3 style="font-size: 28px; margin-bottom: 10px;">Resultado del Diagnóstico</h3>
            <div class="resultado-porcentaje">${porcentaje}%</div>
            <div class="resultado-detalle">
                <p style="font-size: 20px; margin-bottom: 15px;">Nivel de Cumplimiento: <strong>${nivelCumplimiento}</strong></p>
                <p>Puntaje obtenido: ${puntosObtenidos} de ${puntosMaximos} puntos</p>
                <p style="margin-top: 10px;">Preguntas respondidas: ${preguntasRespondidas} de ${preguntasAUsar.length}</p>
            </div>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 20px; flex-wrap: wrap;">
                <button class="btn btn-secondary" onclick="window.cerrarFormularioDiagnostico()" style="background: rgba(255,255,255,0.3); color: white; border: 2px solid white;">
                    ❌ Cancelar
                </button>
                <button class="btn btn-success" onclick="window.guardarYAgendarEntrega(${porcentaje}, ${puntosObtenidos}, ${puntosMaximos})" style="background: white; color: #2c3e50;">
                    💾 Guardar y Agendar Entrega de Resultados
                </button>
            </div>
        </div>
    `;
    
    document.getElementById('resultadoContainer').innerHTML = resultadoHTML;
    document.getElementById('resultadoContainer').scrollIntoView({ behavior: 'smooth' });
};

// ============================================
// GUARDAR Y AGENDAR ENTREGA
// ============================================
window.guardarYAgendarEntrega = async function(porcentaje, puntosObtenidos, puntosMaximos) {
    const tipoDiag = diagnosticoActual.datosDiagnostico.tipoDiagnostico;
    let preguntasAUsar = [];
    
    if (tipoDiag === '7s') preguntasAUsar = preguntas7s;
    else if (tipoDiag === '21s') preguntasAUsar = preguntas21s;
    else if (tipoDiag === '60s') preguntasAUsar = preguntas60s;
    
    // Limpiar respuestas
    const respuestasLimpias = {};
    Object.keys(respuestasDiagnostico).forEach(preguntaId => {
        const respuesta = { ...respuestasDiagnostico[preguntaId] };
        
        if (respuesta.puntos === undefined || respuesta.puntos === null) {
            respuesta.puntos = 0;
        }
        
        if (!respuesta.recomendacion) {
            respuesta.recomendacion = '';
        }
        
        if (respuesta.tipo === 'abierta' && !respuesta.valor) {
            respuesta.valor = '';
        }
        
        if (respuesta.tipo === 'multiple' && !respuesta.valores) {
            respuesta.valores = [];
        }
        
        respuestasLimpias[preguntaId] = respuesta;
    });
    
    const recomendaciones = [];
    
    preguntasAUsar.forEach(pregunta => {
        const respuesta = respuestasLimpias[pregunta.id];
        if (respuesta && respuesta.recomendacion && respuesta.recomendacion.trim() !== '') {
            recomendaciones.push({
                pregunta: pregunta.titulo,
                tema: pregunta.tema,
                recomendacion: respuesta.recomendacion,
                puntos: respuesta.puntos || 0
            });
        }
    });
    
    const resultadoData = {
        respuestas: respuestasLimpias,
        porcentaje: porcentaje,
        puntosObtenidos: puntosObtenidos,
        puntosMaximos: puntosMaximos,
        recomendaciones: recomendaciones,
        fechaRealizacion: new Date().toISOString(),
        tipoDiagnostico: tipoDiag,
        enProgreso: false
    };
    
    const resultado = await guardarRespuestasDiagnostico(diagnosticoActual.id, resultadoData);
    
    if (resultado.success) {
        await actualizarEstadoDiagnostico(diagnosticoActual.id, ESTADOS_PROCESO.DIAGNOSTICO_COMPLETADO);
        showAlert('✅ Diagnóstico completado. Ahora agenda la entrega de resultados.', 'success');
        
        window.cerrarFormularioDiagnostico();
        
        setTimeout(() => {
            window.abrirModalEntregaResultados(diagnosticoActual.id);
        }, 500);
    } else {
        showAlert('❌ Error al guardar: ' + resultado.error, 'danger');
    }
};