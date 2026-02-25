/**
 * Formulario de Diagnóstico 60S (Completo)
 * 60 preguntas exhaustivas sobre SG-SST + RIT + Políticas + PESV + Indicadores
 */

import { alertService } from '../../ui/alerts.js';

export class Formulario60S {
    constructor() {
        this.respuestas = {};
        this.preguntasOcultas = new Set();
        this.init();
    }

    /**
     * Inicializar con las preguntas del 60S
     */
    init() {
        // Las preguntas del 60S se cargarán desde window.preguntas60s
        if (typeof window.preguntas60s !== 'undefined') {
            this.preguntas = window.preguntas60s;
        }
    }

    /**
     * Renderizar formulario
     */
    render() {
        let html = `
            <div style="max-height: 700px; overflow-y: auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0 0 10px 0;">📋 Diagnóstico 60S - Versión Completa</h4>
                    <p style="margin: 5px 0 0 0; font-size: 12px; opacity: 0.9;">Evalúa 60 aspectos exhaustivos del Sistema de Gestión SG-SST, RIT, Políticas, PESV e Indicadores</p>
                </div>

                <div id="formulario60S" style="padding: 10px;">
                    <p style="text-align: center; color: #95a5a6; font-size: 12px; margin-bottom: 20px;">
                        ⚠️ Las preguntas se cargarán desde la base de datos en tiempo real
                    </p>
                </div>

                <div style="background: linear-gradient(135deg, #f39c12, #e67e22); color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0;">Progreso</h4>
                    <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 30px; overflow: hidden;">
                        <div id="barraProgreso" style="background: #2ecc71; height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                            0%
                        </div>
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.9;">
                        <span id="respuestasCount">0</span> de <span id="totalCount">60</span> respondidas
                    </p>
                </div>

                <div style="
                    background: #fff3cd;
                    border: 1px solid #ffc107;
                    padding: 15px;
                    border-radius: 8px;
                    margin-top: 20px;
                    font-size: 12px;
                    color: #856404;
                ">
                    <strong>💡 Tip:</strong> Este es el diagnóstico más exhaustivo. Tómate tu tiempo para responder con precisión todas las preguntas.
                </div>
            </div>
        `;

        // Cargar preguntas después de renderizar
        setTimeout(() => this.cargarPreguntas(), 100);

        return html;
    }

    /**
     * Cargar preguntas desde array global
     */
    cargarPreguntas() {
        if (typeof window.preguntas60s !== 'undefined') {
            this.preguntas = window.preguntas60s;
            this.renderPreguntas();
        } else {
            console.warn('preguntas60s no está disponible');
        }
    }

    /**
     * Renderizar las preguntas agrupadas por tema
     */
    renderPreguntas() {
        const container = document.getElementById('formulario60S');
        if (!container) return;

        // Agrupar por tema
        const temasPreguntados = {};
        this.preguntas.forEach((pregunta, index) => {
            if (this.preguntasOcultas.has(pregunta.id)) return;

            if (!temasPreguntados[pregunta.tema]) {
                temasPreguntados[pregunta.tema] = [];
            }
            temasPreguntados[pregunta.tema].push({ ...pregunta, numero: index + 1 });
        });

        let html = '';
        let numeroGlobal = 1;

        // Renderizar por temas
        Object.keys(temasPreguntados).forEach(tema => {
            html += `
                <div style="
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0 15px 0;
                    font-weight: bold;
                ">
                    ${tema}
                </div>
            `;

            temasPreguntados[tema].forEach((pregunta) => {
                html += this.renderPregunta(pregunta, numeroGlobal);
                numeroGlobal++;
            });
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
                margin-bottom: 15px;
                transition: all 0.3s;
            ">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                    <div style="flex: 1;">
                        <p style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">
                            ${numero}. ${pregunta.titulo}
                        </p>
                    </div>
                    <span id="estado-${pregunta.id}" style="
                        background: #f0f0f0;
                        padding: 5px 10px;
                        border-radius: 20px;
                        font-weight: bold;
                        color: #95a5a6;
                        font-size: 11px;
                        white-space: nowrap;
                        margin-left: 10px;
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
        else if (pregunta.opciones) {
            html += `<div id="opciones-${pregunta.id}" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px;">`;
            pregunta.opciones.forEach(opcion => {
                const puntos = opcion.puntos !== undefined ? opcion.puntos : 0;
                html += `
                    <button class="btn-opcion" data-pregunta="${pregunta.id}" data-valor="${puntos}" 
                        style="
                            padding: 15px;
                            border: 2px solid #e1e8ed;
                            border-radius: 8px;
                            background: white;
                            cursor: pointer;
                            text-align: left;
                            transition: all 0.3s;
                            font-size: 13px;
                        ">
                        <div style="font-weight: bold; color: #667eea; margin-bottom: 5px; font-size: 12px;">
                            ${puntos ? puntos + '/5' : ''}
                        </div>
                        <div>${opcion.texto}</div>
                    </button>
                `;
            });
            html += `</div>`;
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
        const respuestasLimpias = {};
        Object.keys(this.respuestas).forEach(key => {
            if (!this.preguntasOcultas.has(key)) {
                respuestasLimpias[key] = this.respuestas[key];
            }
        });

        return respuestasLimpias;
    }
}

export default Formulario60S;