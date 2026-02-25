/**
 * Formulario de Diagnóstico 7S (Simplificado)
 * 7 preguntas básicas sobre SG-SST
 */

export class Formulario7S {
    constructor() {
        this.preguntas = [
            {
                id: 'p1',
                categoria: 'Existencia',
                pregunta: '¿Existe una Política de SG-SST en la empresa?',
                opciones: [
                    { valor: 1, label: 'No existe' },
                    { valor: 2, label: 'Existe pero no está implementada' },
                    { valor: 3, label: 'Existe e implementación parcial' },
                    { valor: 4, label: 'Existe e implementada' },
                    { valor: 5, label: 'Existe, implementada y mejorada' }
                ]
            },
            {
                id: 'p2',
                categoria: 'Asignación de Recursos',
                pregunta: '¿Se asignan recursos para el SG-SST?',
                opciones: [
                    { valor: 1, label: 'No se asignan' },
                    { valor: 2, label: 'Asignación mínima' },
                    { valor: 3, label: 'Asignación suficiente pero limitada' },
                    { valor: 4, label: 'Asignación apropiada' },
                    { valor: 5, label: 'Asignación óptima y continua' }
                ]
            },
            {
                id: 'p3',
                categoria: 'Competencia del Personal',
                pregunta: '¿El personal tiene competencia en SG-SST?',
                opciones: [
                    { valor: 1, label: 'Sin capacitación' },
                    { valor: 2, label: 'Capacitación inicial' },
                    { valor: 3, label: 'Capacitación regular' },
                    { valor: 4, label: 'Capacitación completa' },
                    { valor: 5, label: 'Capacitación avanzada y actualización' }
                ]
            },
            {
                id: 'p4',
                categoria: 'Responsabilidades Definidas',
                pregunta: '¿Hay responsabilidades claras en SG-SST?',
                opciones: [
                    { valor: 1, label: 'No definidas' },
                    { valor: 2, label: 'Parcialmente definidas' },
                    { valor: 3, label: 'Definidas pero no claras' },
                    { valor: 4, label: 'Claras y asignadas' },
                    { valor: 5, label: 'Claras, asignadas y monitoreadas' }
                ]
            },
            {
                id: 'p5',
                categoria: 'Identificación de Peligros',
                pregunta: '¿Se identifican y evalúan los peligros?',
                opciones: [
                    { valor: 1, label: 'No se identifican' },
                    { valor: 2, label: 'Identificación parcial' },
                    { valor: 3, label: 'Identificación regular' },
                    { valor: 4, label: 'Identificación completa' },
                    { valor: 5, label: 'Identificación completa y evaluada' }
                ]
            },
            {
                id: 'p6',
                categoria: 'Comunicación',
                pregunta: '¿Existe comunicación efectiva en SG-SST?',
                opciones: [
                    { valor: 1, label: 'No existe' },
                    { valor: 2, label: 'Comunicación deficiente' },
                    { valor: 3, label: 'Comunicación regular' },
                    { valor: 4, label: 'Comunicación efectiva' },
                    { valor: 5, label: 'Comunicación efectiva bidireccional' }
                ]
            },
            {
                id: 'p7',
                categoria: 'Mejora Continua',
                pregunta: '¿Hay mejora continua del SG-SST?',
                opciones: [
                    { valor: 1, label: 'No hay mejora' },
                    { valor: 2, label: 'Mejora ocasional' },
                    { valor: 3, label: 'Mejora periódica' },
                    { valor: 4, label: 'Mejora continua' },
                    { valor: 5, label: 'Mejora continua documentada' }
                ]
            }
        ];

        this.respuestas = {};
    }

    /**
     * Renderizar formulario
     */
    render() {
        let html = `
            <div style="max-height: 600px; overflow-y: auto; padding: 20px;">
                <div style="background: #f0f4ff; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <h4 style="margin: 0; color: #667eea;">📋 Diagnóstico 7S - Versión Simplificada</h4>
                    <p style="margin: 5px 0 0 0; color: #95a5a6; font-size: 12px;">Evalúa 7 aspectos básicos del Sistema de Gestión en SG-SST</p>
                </div>

                <div id="formulario7S">
        `;

        this.preguntas.forEach((pregunta, index) => {
            html += `
                <div style="background: white; border: 1px solid #e1e8ed; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                        <div>
                            <p style="margin: 0; color: #667eea; font-weight: bold; font-size: 12px; text-transform: uppercase;">
                                ${pregunta.categoria}
                            </p>
                            <p style="margin: 8px 0 0 0; font-weight: bold; font-size: 16px;">
                                ${index + 1}. ${pregunta.pregunta}
                            </p>
                        </div>
                        <span id="respuesta-${pregunta.id}" style="background: #f0f0f0; padding: 5px 10px; border-radius: 20px; font-weight: bold; color: #95a5a6; font-size: 12px;">
                            Sin responder
                        </span>
                    </div>

                    <div id="opciones-${pregunta.id}" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                        ${pregunta.opciones.map(opcion => `
                            <button class="btn-opcion" data-pregunta="${pregunta.id}" data-valor="${opcion.valor}" 
                                style="padding: 15px; border: 2px solid #e1e8ed; border-radius: 8px; background: white; cursor: pointer; text-align: left; transition: all 0.3s;">
                                <div style="font-weight: bold; color: #667eea; margin-bottom: 5px;">${opcion.valor}/5</div>
                                <div style="font-size: 13px;">${opcion.label}</div>
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        });

        html += `
                </div>

                <div style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                    <h4 style="margin: 0 0 10px 0;">Progreso</h4>
                    <div style="background: rgba(255,255,255,0.2); border-radius: 10px; height: 30px; overflow: hidden;">
                        <div id="barraProgreso" style="background: #2ecc71; height: 100%; width: 0%; transition: width 0.3s; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 12px;">
                            0%
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        setTimeout(() => this.setupEventListeners(), 0);

        return html;
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        const botones = document.querySelectorAll('.btn-opcion');

        botones.forEach(boton => {
            boton.addEventListener('click', (e) => {
                const preguntaId = boton.dataset.pregunta;
                const valor = boton.dataset.valor;

                // Desmarcar anterior
                const opcionesActuales = document.querySelectorAll(`[data-pregunta="${preguntaId}"]`);
                opcionesActuales.forEach(b => {
                    b.style.background = 'white';
                    b.style.borderColor = '#e1e8ed';
                });

                // Marcar nueva
                boton.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                boton.style.color = 'white';
                boton.style.borderColor = '#667eea';

                // Guardar respuesta
                this.respuestas[preguntaId] = parseInt(valor);

                // Actualizar indicador
                document.getElementById(`respuesta-${preguntaId}`).textContent = `${valor}/5`;
                document.getElementById(`respuesta-${preguntaId}`).style.background = '#667eea';
                document.getElementById(`respuesta-${preguntaId}`).style.color = 'white';

                // Actualizar progreso
                this.actualizarProgreso();
            });
        });
    }

    /**
     * Actualizar barra de progreso
     */
    actualizarProgreso() {
        const total = this.preguntas.length;
        const respondidas = Object.keys(this.respuestas).length;
        const porcentaje = Math.round((respondidas / total) * 100);

        const barra = document.getElementById('barraProgreso');
        if (barra) {
            barra.style.width = porcentaje + '%';
            barra.textContent = porcentaje + '%';
        }
    }

    /**
     * Obtener respuestas
     */
    obtenerRespuestas() {
        return this.respuestas;
    }
}

export default Formulario7S;