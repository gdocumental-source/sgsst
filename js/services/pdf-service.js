/**
 * Servicio de Generación de PDF
 * Crea reportes en PDF con jsPDF y html2canvas
 */

import { alertService } from '../ui/alerts.js';
import { FIRMAS_POR_EMAIL } from '../config/constants.js';

export class PDFService {
    constructor(firebaseAuth) {
        this.auth = firebaseAuth;
        this.db = firebase.firestore();
    }

    /**
     * Generar PDF del diagnóstico
     */
    async generarPDFDiagnostico(diagnosticoId, empresaData, diagnosticoData) {
        try {
            // Cargar jsPDF y html2canvas
            const { jsPDF } = window.jspdf;
            const html2canvas = window.html2canvas;

            if (!jsPDF || !html2canvas) {
                throw new Error('Librerías PDF no cargadas');
            }

            const doc = new jsPDF('p', 'mm', 'letter');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let yPosition = margin;

            // ===== ENCABEZADO =====
            doc.setFillColor(102, 126, 234);
            doc.rect(0, 0, pageWidth, 35, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('DIAGNÓSTICO SG-SST', margin, yPosition + 15);
            
            doc.setFontSize(10);
            doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, pageWidth - margin - 50, yPosition + 15);

            yPosition += 40;

            // ===== INFORMACIÓN EMPRESA =====
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text('INFORMACIÓN DE LA EMPRESA', margin, yPosition);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            yPosition += 8;

            const empresaInfo = [
                [`Empresa: ${empresaData.nombre}`, `NIT: ${empresaData.nit}`],
                [`Ciudad: ${empresaData.ciudad}`, `Trabajadores: ${empresaData.numeroTrabajadores}`],
                [`Actividad: ${empresaData.actividadEconomica}`, `Riesgo Principal: ${empresaData.riesgoPrincipal}`],
                [`Email: ${empresaData.email}`, `Teléfono: ${empresaData.telefono}`]
            ];

            empresaInfo.forEach(row => {
                doc.text(row[0], margin, yPosition);
                doc.text(row[1], pageWidth / 2, yPosition);
                yPosition += 6;
            });

            yPosition += 5;

            // ===== RESULTADO DEL DIAGNÓSTICO =====
            doc.setFont(undefined, 'bold');
            doc.setFontSize(12);
            doc.text('RESULTADO DEL DIAGNÓSTICO', margin, yPosition);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            yPosition += 8;

            if (diagnosticoData.resultado) {
                const resultado = diagnosticoData.resultado;
                
                doc.text(`Tipo de Diagnóstico: ${diagnosticoData.tipo.toUpperCase()}`, margin, yPosition);
                yPosition += 6;
                
                doc.text(`Puntuación: ${resultado.puntuacion}/5.0`, margin, yPosition);
                yPosition += 6;
                
                doc.text(`Estado: ${resultado.estado}`, margin, yPosition);
                yPosition += 8;

                // Recomendaciones
                if (resultado.recomendaciones && resultado.recomendaciones.length > 0) {
                    doc.setFont(undefined, 'bold');
                    doc.text('Recomendaciones:', margin, yPosition);
                    doc.setFont(undefined, 'normal');
                    yPosition += 6;

                    resultado.recomendaciones.forEach((rec, index) => {
                        const splitText = doc.splitTextToSize(
                            `${index + 1}. ${rec}`,
                            pageWidth - margin * 2
                        );
                        
                        splitText.forEach(line => {
                            if (yPosition > pageHeight - margin) {
                                doc.addPage();
                                yPosition = margin;
                            }
                            doc.text(line, margin + 5, yPosition);
                            yPosition += 5;
                        });
                    });
                }
            }

            yPosition += 10;

            // ===== FIRMA DIGITAL =====
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = margin;
            }

            doc.setFont(undefined, 'bold');
            doc.setFontSize(11);
            doc.text('FIRMA DIGITAL', margin, yPosition);
            
            doc.setFont(undefined, 'normal');
            doc.setFontSize(9);
            yPosition += 8;

            const userEmail = this.auth.currentUser?.email || '';
            const firmaConfig = FIRMAS_POR_EMAIL[userEmail] || null;

            if (firmaConfig && firmaConfig.firma1) {
                const firma1 = firmaConfig.firma1;
                doc.text(`Firmado por: ${firma1.nombre}`, margin, yPosition);
                yPosition += 5;
                doc.text(`Cédula: ${firma1.cedula}`, margin, yPosition);
                yPosition += 5;
                doc.text(`Cargo: ${firma1.cargo}`, margin, yPosition);
                yPosition += 5;
                doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, margin, yPosition);
            } else {
                doc.text(`Generado por: ${userEmail}`, margin, yPosition);
                yPosition += 5;
                doc.text(`Fecha: ${new Date().toLocaleDateString('es-CO')}`, margin, yPosition);
            }

            // ===== GUARDAR =====
            const filename = `Diagnostico_${empresaData.nombre}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);

            alertService.success('PDF generado correctamente');
            return { success: true, filename };

        } catch (error) {
            alertService.error(`Error al generar PDF: ${error.message}`);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generar PDF de informe completo
     */
    async generarPDFInforme(empresaId, diagnosticos) {
        try {
            const { jsPDF } = window.jspdf;

            if (!jsPDF) {
                throw new Error('Librería PDF no cargada');
            }

            const doc = new jsPDF('p', 'mm', 'letter');
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let yPosition = margin;

            // Obtener datos de la empresa
            const empresaDoc = await this.db.collection('empresas').doc(empresaId).get();
            const empresaData = empresaDoc.data();

            // ===== ENCABEZADO =====
            doc.setFillColor(102, 126, 234);
            doc.rect(0, 0, pageWidth, 35, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.text('INFORME SG-SST', margin, yPosition + 15);

            yPosition += 40;

            // ===== INFORMACIÓN EMPRESA =====
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Empresa: ${empresaData.nombre}`, margin, yPosition);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            yPosition += 8;
            doc.text(`NIT: ${empresaData.nit}`, margin, yPosition);
            yPosition += 6;
            doc.text(`Número de Diagnósticos Realizados: ${diagnosticos.length}`, margin, yPosition);

            yPosition += 12;

            // ===== TABLA DE DIAGNÓSTICOS =====
            const tableData = [
                ['Tipo', 'Estado', 'Puntuación', 'Resultado', 'Fecha'],
                ...diagnosticos.map(d => [
                    d.tipo.toUpperCase(),
                    d.estado,
                    d.resultado?.puntuacion || '-',
                    d.resultado?.estado || '-',
                    new Date(d.createdAt.seconds * 1000).toLocaleDateString('es-CO')
                ])
            ];

            doc.autoTable({
                head: [tableData[0]],
                body: tableData.slice(1),
                startY: yPosition,
                margin: margin,
                styles: {
                    fontSize: 9,
                    cellPadding: 3
                },
                headStyles: {
                    fillColor: [102, 126, 234],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold'
                }
            });

            yPosition = doc.lastAutoTable.finalY + 10;

            // ===== RESUMEN Y RECOMENDACIONES =====
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = margin;
            }

            doc.setFont(undefined, 'bold');
            doc.setFontSize(12);
            doc.text('RESUMEN Y RECOMENDACIONES', margin, yPosition);

            doc.setFont(undefined, 'normal');
            doc.setFontSize(10);
            yPosition += 10;

            const textoResumen = 'Se ha realizado el análisis integral del Sistema de Gestión en Seguridad y Salud en el Trabajo (SG-SST) según los estándares aplicables. Los resultados reflejan el nivel de madurez del sistema y orientan las acciones de mejora continua.';
            
            const splitText = doc.splitTextToSize(textoResumen, pageWidth - margin * 2);
            splitText.forEach(line => {
                doc.text(line, margin, yPosition);
                yPosition += 5;
            });

            // ===== GUARDAR =====
            const filename = `Informe_${empresaData.nombre}_${new Date().toISOString().split('T')[0]}.pdf`;
            doc.save(filename);

            alertService.success('Informe PDF generado correctamente');
            return { success: true, filename };

        } catch (error) {
            alertService.error(`Error al generar informe: ${error.message}`);
            return { success: false, error: error.message };
        }
    }
}

export default PDFService;