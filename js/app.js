// js/app.js

/**
 * Archivo principal de la aplicación
 */

import { initAuth } from './controllers/auth-controller.js';
import { initMainController } from './controllers/main-controller.js';
import { initEmpresaController } from './controllers/empresa-controller.js';
import { initDiagnosticoController } from './controllers/diagnostico-controller.js';
import { initAgendaController } from './controllers/agenda-controller.js';
import { initSupervisionController } from './controllers/supervision-controller.js';
import { initInformesController } from './controllers/informes-controller.js';
import { initExportarController } from './controllers/exportar-controller.js';
import { EMAILJS_CONFIG } from './config/constants.js';

// Inicializar EmailJS
emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);

console.log('🚀 Iniciando aplicación SG-SST...');

// Inicializar todos los controladores
initAuth();
initMainController();
initEmpresaController();
initDiagnosticoController();
initAgendaController();
initSupervisionController();
initInformesController();
initExportarController();

// Escuchar cambios de panel
document.addEventListener('panel-changed', async (event) => {
    const { panel } = event.detail;
    
    switch(panel) {
        case 'empresas':
            const { renderEstadisticasUsuario } = await import('./controllers/empresa-controller.js');
            renderEstadisticasUsuario();
            break;
        case 'agenda':
            const { renderCitasHoy } = await import('./controllers/agenda-controller.js');
            renderCitasHoy();
            break;
        case 'informes':
            const { renderInformes } = await import('./controllers/informes-controller.js');
            renderInformes();
            break;
        case 'exportar':
            const { renderPanelEnvioInformes } = await import('./controllers/exportar-controller.js');
            renderPanelEnvioInformes();
            break;
        case 'supervision':
            const { cargarPanelSupervision } = await import('./controllers/supervision-controller.js');
            await cargarPanelSupervision();
            break;
    }
});

// Cuando el usuario se autentica
document.addEventListener('user-authenticated', async () => {
    const { cargarDatosGlobales } = await import('./controllers/main-controller.js');
    await cargarDatosGlobales();
    console.log('✅ Datos globales cargados');
});

console.log('✅ Aplicación inicializada correctamente');