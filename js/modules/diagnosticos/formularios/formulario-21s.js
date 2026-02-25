/**
 * Formulario de Diagnóstico 21S (Intermedio)
 * 21 preguntas detalladas sobre SG-SST + RIT + Políticas
 */

import { alertService } from '../../ui/alerts.js';

export class Formulario21S {
    constructor() {
        this.respuestas = {};
        this.preguntasOcultas = new Set();
        this.init();
    }

    /**
     * Inicializar con las preguntas del 21S
     */
    init() {
        // Aquí irán todas las preguntas del 21S
        // Incluye las 7S + preguntas adicionales
    }

    /**
     * Renderizar formulario
     */
    render() {
        let html = `
            <div style="max-height: 700px; overflow-y: auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0;">📋 Diagnóstico 21S - Versión Intermedia</h4>
                    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Evalúa 21 aspectos clave del Sistema de Gestión en SG-SST, RIT y Políticas</p>
                </div>

                <div id="formulario21S" style="padding: 10px;">
                    <p style="text-align: center; color: #95a5a6; font-size: 12px; margin-bottom: 20px;">
                        ⚠️ Las preguntas se cargarán desde la base de datos en tiempo real
                    </p>
                </div>

                <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0;">Progreso</h4>
                    <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 30px; overflow: hidden;">
                        <div id="barraProgreso" style="background: #2ecc71; height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                            0%
                        </div>
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.9;">
                        <span id="respuestasCount">0</span> de <span id="totalCount">21</span> respondidas
                    </p>
                </div>
            </div>
        `;

        return html;
    }

    /**
     * Cargar preguntas desde array global
     */
    cargarPreguntas() {
        if (typeof window.preguntas21s !== 'undefined') {
            this.preguntas = window.preguntas21s;
            this.renderPreguntas();
        }
    }

    /**
     * Renderizar las preguntas
     */
    renderPreguntas() {
        const container = document.getElementById('formulario21S');
        if (!container) return;

        let html = '';
        let contador = 1;

        this.preguntas.forEach((pregunta, index) => {
            if (this.preguntasOcultas.has(pregunta.id)) {
                return;
            }

            html += this.renderPregunta(pregunta, contador);
            contador++;
        });

        container.innerHTML = html;
        this.setupEventListeners();
    }

    /**
     * Renderizar una pregunta individual
     */
    renderPregunta(pregunta, numero) {
        let html = `
            <div class="pregunta-container" data-pregunta-id="${pregunta.id}" style="
                background: white;
                border: 1px solid #e1e8ed;
                border-radius: 8px;
                padding: 20px;
                margin-bottom: 20px;
                transition: all 0.3s;
            ">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div>
                        <p style="margin: 0; color: #667eea; font-weight: bold; font-size: 12px; text-transform: uppercase;">
                            ${pregunta.tema}
                        </p>
                        <p style="margin: 8px 0 0 0; font-weight: bold; font-size: 16px;">
                            ${numero}. ${pregunta.titulo}
                        </p>
                    </div>
                    <span id="estado-${pregunta.id}" style="
                        background: #f0f0f0;
                        padding: 5px 10px;
                        border-radius: 20px;
                        font-weight: bold;
                        color: #95a5a6;
                        font-size: 12px;
                    ">
                        Sin responder
                    </span>
                </div>
        `;

        // Si es pregunta abierta
        if (pregunta.tipo === 'abierta') {
            html += `
                <input 
                    type="text" 
                    class="input-abierta" 
                    data-pregunta="${pregunta.id}" 
                    placeholder="${pregunta.placeholder || 'Escribe tu respuesta aquí...'}"
                    style="
                        width: 100%;
                        padding: 12px;
                        border: 2px solid #e1e8ed;
                        border-radius: 8px;
                        font-size: 14px;
                        box-sizing: border-box;
                    "
                />
            `;
        } 
        // Si es checkbox (múltiple selección)
        else if (pregunta.tipo === 'checkbox') {
            html += `<div data-opciones-pregunta="${pregunta.id}" style="display: grid; gap: 10px;">`;
            pregunta.opciones.forEach(opcion => {
                html += `
                    <label style="
                        display: flex;
                        align-items: center;
                        padding: 12px;
                        border: 2px solid #e1e8ed;
                        border-radius: 8px;
                        cursor: pointer;
                        transition: all 0.3s;
                    ">
                        <input 
                            type="checkbox" 
                            class="checkbox-opcion"
                            data-pregunta="${pregunta.id}" 
                            data-valor="${opcion.valor}"
                            style="margin-right: 10px; cursor: pointer;"
                        />
                        <span>${opcion.texto}</span>
                    </label>
                `;
            });
            html += `</div>`;
        } 
        // Opciones normales (radio)
        else {
            html += `<div id="opciones-${pregunta.id}" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">`;
            pregunta.opciones.forEach(opcion => {
                html += `
                    <button class="btn-opcion" data-pregunta="${pregunta.id}" data-valor="${opcion.puntos}" 
                        style="
                            padding: 15px;
                            border: 2px solid #e1e8ed;
                            border-radius: 8px;
                            background: white;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                        ">
                        <div style="font-weight: bold; color: #667eea; margin-bottom: 5px;">
                            ${opcion.puntos ? opcion.puntos + '/5' : 'Opción'}
                        </div>
                        <div style="font-size: 13px;">${opcion.texto}</div>
                    </button>
                `;
            });
            html += `</div>`;
        }

        // Recomendación
        if (pregunta.opciones && pregunta.opciones[0].recomendacion) {
            html += `
                <div id="recomendacion-${pregunta.id}" style="
                    display: none;
                    background: #f0f4ff;
                    padding: 12px;
                    border-left: 4px solid #667eea;
                    border-radius: 4px;
                    margin-top: 15px;
                    font-size: 13px;
                    color: #2c3e50;
                "></div>
            `;
        }

        html += `</div>`;
        return html;
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Opciones normales (radio)
        document.querySelectorAll('.btn-opcion').forEach(boton => {
            boton.addEventListener('click', (e) => {
                const preguntaId = boton.dataset.pregunta;
                const valor = boton.dataset.valor;

                // Desmarcar anterior
                document.querySelectorAll(`[data-pregunta="${preguntaId}"].btn-opcion`).forEach(b => {
                    b.style.background = 'white';
                    b.style.borderColor = '#e1e8ed';
                    b.style.color = 'inherit';
                });

                // Marcar nueva
                boton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                boton.style.color = 'white';
                boton.style.borderColor = '#667eea';

                this.respuestas[preguntaId] = parseInt(valor);
                this.actualizarEstado(preguntaId);
                this.procesarCondicionales(preguntaId);
                this.actualizarProgreso();
            });
        });

        // Inputs abiertos
        document.querySelectorAll('.input-abierta').forEach(input => {
            input.addEventListener('input', (e) => {
                const preguntaId = input.dataset.pregunta;
                this.respuestas[preguntaId] = input.value;
                this.actualizarEstado(preguntaId);
                this.actualizarProgreso();
            });
        });

        // Checkboxes
        document.querySelectorAll('.checkbox-opcion').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const preguntaId = checkbox.dataset.pregunta;
                
                if (!this.respuestas[preguntaId]) {
                    this.respuestas[preguntaId] = [];
                }

                if (checkbox.checked) {
                    if (!this.respuestas[preguntaId].includes(checkbox.dataset.valor)) {
                        this.respuestas[preguntaId].push(checkbox.dataset.valor);
                    }
                } else {
                    this.respuestas[preguntaId] = this.respuestas[preguntaId].filter(v => v !== checkbox.dataset.valor);
                }

                this.actualizarEstado(preguntaId);
                this.actualizarProgreso();
            });
        });
    }

    /**
     * Actualizar estado visual de pregunta
     */
    actualizarEstado(preguntaId) {
        const estado = document.getElementById(`estado-${preguntaId}`);
        const recomendacion = document.getElementById(`recomendacion-${preguntaId}`);
        const respuesta = this.respuestas[preguntaId];

        if (estado) {
            if (respuesta) {
                estado.textContent = '✅ Respondida';
                estado.style.background = '#d1fae5';
                estado.style.color = '#065f46';
            } else {
                estado.textContent = 'Sin responder';
                estado.style.background = '#f0f0f0';
                estado.style.color = '#95a5a6';
            }
        }

        // Mostrar recomendación si existe
        if (recomendacion && respuesta) {
            const pregunta = this.preguntas.find(p => p.id === preguntaId);
            if (pregunta && pregunta.opciones) {
                const opcionSeleccionada = pregunta.opciones.find(o => o.puntos === respuesta || o.texto === respuesta);
                if (opcionSeleccionada && opcionSeleccionada.recomendacion) {
                    recomendacion.textContent = opcionSeleccionada.recomendacion;
                    recomendacion.style.display = 'block';
                }
            }
        }
    }

    /**
     * Procesar preguntas condicionales
     */
    procesarCondicionales(preguntaId) {
        const pregunta = this.preguntas.find(p => p.id === preguntaId);
        if (!pregunta || !pregunta.condicional) return;

        const respuesta = this.respuestas[preguntaId];
        const config = pregunta.condicional[respuesta];

        if (config) {
            if (config.ocultar) {
                config.ocultar.forEach(id => {
                    this.preguntasOcultas.add(id);
                    const elemento = document.querySelector(`[data-pregunta-id="${id}"]`);
                    if (elemento) {
                        elemento.style.display = 'none';
                    }
                });
            }

            if (config.scoreOcultas !== undefined) {
                config.ocultar?.forEach(id => {
                    this.respuestas[id] = config.scoreOcultas;
                });
            }
        } else {
            // Mostrar preguntas ocultas si cambian condiciones
            if (pregunta.condicional) {
                Object.keys(pregunta.condicional).forEach(condicion => {
                    const cfg = pregunta.condicional[condicion];
                    if (cfg.ocultar) {
                        cfg.ocultar.forEach(id => {
                            if (this.preguntasOcultas.has(id)) {
                                const elemento = document.querySelector(`[data-pregunta-id="${id}"]`);
                                if (elemento) {
                                    elemento.style.display = 'block';
                                }
                                this.preguntasOcultas.delete(id);
                            }
                        });
                    }
                });
            }
        }
    }

    /**
     * Actualizar barra de progreso
     */
    actualizarProgreso() {
        const respondidas = Object.keys(this.respuestas).filter(k => this.respuestas[k]).length;
        const total = this.preguntas.length - this.preguntasOcultas.size;
        const porcentaje = total > 0 ? Math.round((respondidas / total) * 100) : 0;

        const barra = document.getElementById('barraProgreso');
        const contador = document.getElementById('respuestasCount');
        const totalCount = document.getElementById('totalCount');

        if (barra) {
            barra.style.width = porcentaje + '%';
            barra.textContent = porcentaje + '%';
        }

        if (contador) {
            contador.textContent = respondidas;
        }

        if (totalCount) {
            totalCount.textContent = total;
        }
    }

    /**
     * Obtener respuestas
     */
    obtenerRespuestas() {
        // Filtrar respuestas de preguntas ocultas
        const respuestasLimpias = {};
        Object.keys(this.respuestas).forEach(key => {
            if (!this.preguntasOcultas.has(key)) {
                respuestasLimpias[key] = this.respuestas[key];
            }
        });

        return respuestasLimpias;
    }
}

export default Formulario21S;