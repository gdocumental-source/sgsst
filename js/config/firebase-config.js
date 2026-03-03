// ============================================
// firebase-config.js - VERSIÓN CORREGIDA COMPLETA
// ============================================
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { 
    getAuth, 
    signInWithPopup,
    signInWithRedirect,
    getRedirectResult,
    GoogleAuthProvider,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    query, 
    where, 
    orderBy,
    onSnapshot,
    serverTimestamp,
    getDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    getDownloadURL 
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// ============================================
// CONFIGURACIÓN DE FIREBASE
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyC57wX-bhIEoZuO7g-Kn52NwStMHwf-dWA",
    authDomain: "sgsst-reservas.firebaseapp.com",
    projectId: "sgsst-reservas",
    storageBucket: "sgsst-reservas.firebasestorage.app",
    messagingSenderId: "8497409289",
    appId: "1:8497409289:web:7f43df201769666d58f7d8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // ✅ Inicializar Storage

console.log('✅ Firebase inicializado correctamente');

let usuarioActual = null;

// ============================================
// ⭐ CONFIGURACIÓN DE EMAILJS
// ============================================
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_djjqpm2',
    TEMPLATE_CONFIRMACION: 'template_4m64vpl',
    TEMPLATE_REAGENDAMIENTO: 'template_buex5tk',
    PUBLIC_KEY: '2p61NjRhHu3CiwopM'
};

// ============================================
// ⭐ LINKS DE GOOGLE MEET POR USUARIO
// ============================================
const LINKS_MEET_POR_USUARIO = {
    'juridico27@centrojuridicointernacional.com': 'https://meet.google.com/fqj-yqth-eka?authuser=0',
    'juridico30@centrojuridicointernacional.com': 'https://meet.google.com/xie-ibyi-qfb?authuser=0',
    'juridico38@centrojuridicointernacional.com': 'https://meet.google.com/iiv-udtd-off?authuser=0',
    'juridico59@centrojuridicointernacional.com': 'https://meet.google.com/tzq-simw-yow?authuser=0',
    'juridico15@centrojuridicointernacional.com': 'https://meet.google.com/kci-mtaa-vyy?authuser=0',
    'talento@centrojuridicointernacional.com': 'https://meet.google.com/kyt-tbov-jdi',
    'juridico61@centrojuridicointernacional.com': 'https://meet.google.com/jng-ukxo-qce',
    'juridico62@centrojuridicointernacional.com': 'https://meet.google.com/xcj-vdgn-znj',
    'juridico10@centrojuridicointernacional.com': 'https://meet.google.com/kyt-tbov-jdi',
    'gdocumental@centrojuridicointernacional.com': 'https://meet.google.com/kyt-tbov-jdi'
};

// ⭐ Función para obtener el link de Meet según el usuario
function obtenerLinkMeet(emailUsuario) {
    if (!emailUsuario) return null;
    const emailLower = emailUsuario.toLowerCase().trim();
    return LINKS_MEET_POR_USUARIO[emailLower] || null;
}

// ⭐ Función para generar link de Google Calendar - VERSIÓN CORREGIDA
function generarLinkCalendario(titulo, fecha, hora, duracion, descripcion, ubicacion) {
    try {
        console.log('📅 Generando link de calendario...');
        console.log('   Fecha recibida:', fecha);
        console.log('   Hora recibida:', hora);
        
        // ✅ PARSEAR FECHA (puede venir en DD/MM/YYYY o YYYY-MM-DD)
        let dia, mes, anio;
        
        if (fecha.includes('/')) {
            // Formato: DD/MM/YYYY
            [dia, mes, anio] = fecha.split('/');
        } else if (fecha.includes('-')) {
            // Formato: YYYY-MM-DD
            [anio, mes, dia] = fecha.split('-');
        } else {
            throw new Error('Formato de fecha inválido');
        }
        
        // ✅ PARSEAR HORA (extraer solo inicio, ignorar rango)
        let horaInicio = hora;
        if (hora.includes(' - ')) {
            // Si viene con rango "08:00 AM - 09:00 AM", tomar solo inicio
            horaInicio = hora.split(' - ')[0].trim();
        }
        
        // ✅ CONVERTIR HORA A 24H SI TIENE AM/PM
        let horas, minutos;
        
        if (horaInicio.includes('AM') || horaInicio.includes('PM')) {
            // Formato 12h: "08:00 AM"
            const [tiempo, periodo] = horaInicio.split(' ');
            [horas, minutos] = tiempo.split(':').map(Number);
            
            if (periodo === 'PM' && horas !== 12) {
                horas += 12;
            } else if (periodo === 'AM' && horas === 12) {
                horas = 0;
            }
        } else {
            // Formato 24h: "14:00"
            [horas, minutos] = horaInicio.split(':').map(Number);
        }
        
        console.log('   Fecha procesada:', `${anio}-${mes}-${dia}`);
        console.log('   Hora procesada:', `${horas}:${minutos}`);
        
        // ✅ CREAR FECHAS EN HORA DE BOGOTÁ
        const fechaInicio = new Date(Date.UTC(
            parseInt(anio),
            parseInt(mes) - 1,
            parseInt(dia),
            parseInt(horas) + 5, // +5 porque Bogotá es UTC-5
            parseInt(minutos),
            0
        ));
        
        const fechaFin = new Date(fechaInicio);
        fechaFin.setMinutes(fechaFin.getMinutes() + duracion);
        
        // ✅ FORMATEAR PARA GOOGLE CALENDAR (YYYYMMDDTHHmmssZ)
        const formatoGoogle = (fecha) => {
            const y = fecha.getUTCFullYear();
            const m = String(fecha.getUTCMonth() + 1).padStart(2, '0');
            const d = String(fecha.getUTCDate()).padStart(2, '0');
            const h = String(fecha.getUTCHours()).padStart(2, '0');
            const min = String(fecha.getUTCMinutes()).padStart(2, '0');
            const s = '00';
            return `${y}${m}${d}T${h}${min}${s}Z`;
        };
        
        const inicioFormatted = formatoGoogle(fechaInicio);
        const finFormatted = formatoGoogle(fechaFin);
        
        console.log('✅ Fecha inicio (UTC):', inicioFormatted);
        console.log('✅ Fecha fin (UTC):', finFormatted);
        
        // ✅ CONSTRUIR URL
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: titulo,
            dates: `${inicioFormatted}/${finFormatted}`,
            details: descripcion,
            location: ubicacion || 'Reunión Virtual',
            ctz: 'America/Bogota',
            trp: 'false'
        });
        
        const calendarUrl = `https://calendar.google.com/calendar/render?${params.toString()}`;
        console.log('✅ Link generado:', calendarUrl);
        
        return calendarUrl;
        
    } catch (error) {
        console.error('❌ Error generando link de calendario:', error);
        return 'https://calendar.google.com/calendar/';
    }
}

// ============================================
// ROLES POR EMAIL
// ============================================
const ROLES_POR_EMAIL = {
    directores: [
        'gdocumental@centrojuridicointernacional.com',
        'talento@centrojuridicointernacional.com',
        'cjinegocios@centrojuridicointernacional.com',
        'cjinegocios@hotmail.com',
        'juridico5@centrojuridicointernacional.com',
    ],
    coordinadores: []
};

function determinarRolPorEmail(email) {
    const emailLower = email.toLowerCase().trim();
    
    if (ROLES_POR_EMAIL.directores.some(e => e.toLowerCase() === emailLower)) {
        return 'director';
    }
    
    if (ROLES_POR_EMAIL.coordinadores.some(e => e.toLowerCase() === emailLower)) {
        return 'coordinador';
    }
    
    return 'gestor';
}

// ============================================
// FUNCIONES DE ENVÍO DE CORREOS
// ============================================

async function enviarCorreoConfirmacion(diagnosticoData, empresaData) {
    try {
        const emailsDisponibles = empresaData.emails && empresaData.emails.length > 0 
            ? empresaData.emails 
            : (empresaData.email ? [empresaData.email] : []);
        
        if (emailsDisponibles.length === 0) {
            console.log('⚠️ Empresa sin emails registrados');
            return { success: false, error: 'Sin emails' };
        }

        const destinatarios = emailsDisponibles.join(', ');
        
        console.log('📧 Enviando email de confirmación a:', destinatarios);

        const linkMeet = obtenerLinkMeet(auth.currentUser?.email);
        
        const descripcionCalendario = `Consultoría SG-SST - Centro Jurídico Internacional

🏢 Empresa: ${empresaData.nombre}
📄 Orden de Servicio: ${diagnosticoData.ordenServicio}
📋 Tipo de Servicio: ${diagnosticoData.titulo}
👤 Consultor: ${auth.currentUser?.displayName || auth.currentUser?.email}

${linkMeet ? '🎥 Link de reunión: ' + linkMeet : ''}

${diagnosticoData.notas ? '📝 Observaciones: ' + diagnosticoData.notas : ''}`;

        const calendarLink = generarLinkCalendario(
            `Cita SG-SST - ${empresaData.nombre}`,
            diagnosticoData.fechaAgendada,
            diagnosticoData.horaAgendada,
            90,
            descripcionCalendario,
            linkMeet || 'Reunión Virtual Google Meet'
        );
        
        const templateParams = {
            to_email: destinatarios,
            to_name: empresaData.responsable || empresaData.nombre,
            empresa_nombre: empresaData.nombre,
            fecha_cita: diagnosticoData.fechaAgendada,
            hora_cita: diagnosticoData.horaAgendada,
            tipo_servicio: diagnosticoData.titulo,
            orden_servicio: diagnosticoData.ordenServicio,
            consultor_nombre: auth.currentUser?.displayName || auth.currentUser?.email || 'Sistema',
            notas: diagnosticoData.notas || '',
            link_meet: linkMeet || 'Link de reunión no disponible',
            calendar_link: calendarLink
        };

        console.log('🔍 Template params:', templateParams);

        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_CONFIRMACION,
            templateParams,
            EMAILJS_CONFIG.PUBLIC_KEY
        );

        console.log('✅ Email de confirmación enviado exitosamente');
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error enviando email de confirmación:', error);
        return { success: false, error: error.message };
    }
}

async function enviarCorreoReagendamiento(diagnosticoData, empresaData, fechaAnterior, horaAnterior) {
    try {
        const emailsDisponibles = empresaData.emails && empresaData.emails.length > 0 
            ? empresaData.emails 
            : (empresaData.email ? [empresaData.email] : []);
        
        if (emailsDisponibles.length === 0) {
            console.log('⚠️ Empresa sin emails registrados');
            return { success: false, error: 'Sin emails' };
        }

        const destinatarios = emailsDisponibles.join(', ');
        
        console.log('📧 Enviando email de reagendamiento a:', destinatarios);

        const linkMeet = obtenerLinkMeet(auth.currentUser?.email);
        
        const descripcionCalendario = `Consultoría SG-SST (REAGENDADA) - Centro Jurídico Internacional

🏢 Empresa: ${empresaData.nombre}
📄 Orden de Servicio: ${diagnosticoData.ordenServicio}
📋 Tipo de Servicio: ${diagnosticoData.titulo}
👤 Consultor: ${auth.currentUser?.displayName || auth.currentUser?.email}

💬 Motivo del reagendamiento: ${diagnosticoData.motivoReagendamiento || 'Ajuste de agenda'}

${linkMeet ? '🎥 Link de reunión: ' + linkMeet : ''}`;

        const calendarLink = generarLinkCalendario(
            `Cita SG-SST REAGENDADA - ${empresaData.nombre}`,
            diagnosticoData.fechaAgendada,
            diagnosticoData.horaAgendada,
            90,
            descripcionCalendario,
            linkMeet || 'Reunión Virtual Google Meet'
        );

        const templateParams = {
            to_email: destinatarios,
            to_name: empresaData.responsable || empresaData.nombre,
            empresa_nombre: empresaData.nombre,
            fecha_anterior: fechaAnterior,
            hora_anterior: horaAnterior,
            nueva_fecha: diagnosticoData.fechaAgendada,
            nueva_hora: diagnosticoData.horaAgendada,
            tipo_servicio: diagnosticoData.titulo,
            orden_servicio: diagnosticoData.ordenServicio,
            motivo: diagnosticoData.motivoReagendamiento || 'Ajuste de agenda',
            consultor_nombre: auth.currentUser?.displayName || auth.currentUser?.email || 'Sistema',
            link_meet: linkMeet || 'Link de reunión no disponible',
            calendar_link: calendarLink
        };

        console.log('🔍 Template params reagendamiento:', templateParams);

        const response = await emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_REAGENDAMIENTO,
            templateParams,
            EMAILJS_CONFIG.PUBLIC_KEY
        );

        console.log('✅ Email de reagendamiento enviado exitosamente');
        return { success: true, response };
    } catch (error) {
        console.error('❌ Error enviando email de reagendamiento:', error);
        return { success: false, error: error.message };
    }
}

// ============================================
// AUTENTICACIÓN
// ============================================

export function observarEstadoAuth(callback) {
    return onAuthStateChanged(auth, (user) => {
        usuarioActual = user;
        callback(user);
    });
}

async function guardarPerfilUsuario(user) {
    try {
        const userRef = doc(db, 'usuarios', user.uid);
        const userDoc = await getDoc(userRef);
        const rolAsignado = determinarRolPorEmail(user.email);
        
        if (!userDoc.exists()) {
            await setDoc(userRef, {
                nombre: user.displayName || 'Usuario',
                email: user.email,
                foto: user.photoURL,
                rol: rolAsignado,
                fechaCreacion: serverTimestamp(),
                ultimoAcceso: serverTimestamp()
            });
        } else {
            const datosActuales = userDoc.data();
            const rolActual = datosActuales.rol || 'gestor';
            
            if (rolActual !== rolAsignado) {
                await updateDoc(userRef, {
                    rol: rolAsignado,
                    ultimoAcceso: serverTimestamp(),
                    rolActualizadoEn: serverTimestamp()
                });
            } else {
                await updateDoc(userRef, {
                    ultimoAcceso: serverTimestamp()
                });
            }
        }
    } catch (error) {
        console.error('Error guardando perfil:', error);
    }
}

export async function loginConGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    try {
        const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (esMovil) {
            await signInWithRedirect(auth, provider);
            return { redirecting: true };
        }
        
        try {
            const result = await signInWithPopup(auth, provider);
            await guardarPerfilUsuario(result.user);
            return { success: true, user: result.user };
        } catch (popupError) {
            if (popupError.code === 'auth/popup-blocked' || 
                popupError.code === 'auth/popup-closed-by-user' ||
                popupError.code === 'auth/cancelled-popup-request') {
                await signInWithRedirect(auth, provider);
                return { redirecting: true };
            }
            throw popupError;
        }
    } catch (error) {
        return { success: false, error: obtenerMensajeErrorAuth(error) };
    }
}

export async function manejarRedirectGoogle() {
    try {
        const result = await getRedirectResult(auth);
        if (result && result.user) {
            await guardarPerfilUsuario(result.user);
            return { success: true, user: result.user };
        }
        return null;
    } catch (error) {
        return { success: false, error: obtenerMensajeErrorAuth(error) };
    }
}

export async function loginUsuario(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await updateDoc(doc(db, 'usuarios', userCredential.user.uid), {
            ultimoAcceso: serverTimestamp()
        }).catch(() => {});
        
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: obtenerMensajeError(error) };
    }
}

export async function registrarUsuario(email, password, nombre) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: nombre });
        
        const rolAsignado = determinarRolPorEmail(email);
        
        await setDoc(doc(db, 'usuarios', userCredential.user.uid), {
            nombre: nombre,
            email: email,
            foto: null,
            rol: rolAsignado,
            fechaCreacion: serverTimestamp(),
            ultimoAcceso: serverTimestamp()
        });
        
        return { success: true, user: userCredential.user };
    } catch (error) {
        return { success: false, error: obtenerMensajeError(error) };
    }
}

export async function cerrarSesion() {
    try {
        await signOut(auth);
        usuarioActual = null;
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

function obtenerMensajeError(error) {
    const mensajes = {
        'auth/invalid-email': 'Email inválido',
        'auth/user-disabled': 'Cuenta deshabilitada',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/email-already-in-use': 'Email ya registrado',
        'auth/weak-password': 'Contraseña muy débil (mínimo 6 caracteres)',
        'auth/network-request-failed': 'Error de conexión',
        'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos'
    };
    return mensajes[error.code] || error.message;
}

function obtenerMensajeErrorAuth(error) {
    const mensajes = {
        'auth/unauthorized-domain': `⚠️ DOMINIO NO AUTORIZADO\n\nDominio: ${window.location.hostname}\n\nSOLUCIÓN:\n1. Firebase Console → Authentication\n2. Settings → Authorized domains\n3. Agrega: ${window.location.hostname}`,
        'auth/operation-not-allowed': '⚠️ GOOGLE LOGIN DESHABILITADO\n\nHabilita Google en Firebase Console',
        'auth/popup-blocked': '⚠️ POPUP BLOQUEADO\n\nPermite popups para este sitio',
        'auth/network-request-failed': '⚠️ ERROR DE CONEXIÓN\n\nVerifica tu internet',
    };
    return mensajes[error.code] || `Error: ${error.message}`;
}

// ============================================
// EMPRESAS
// ============================================

export async function buscarEmpresaPorNitONombre(nit, nombre) {
    try {
        const qNit = query(collection(db, 'empresas'), where('nit', '==', nit));
        const qNombre = query(collection(db, 'empresas'), where('nombre', '==', nombre));
        
        const [snapshotNit, snapshotNombre] = await Promise.all([getDocs(qNit), getDocs(qNombre)]);
        
        if (!snapshotNit.empty) {
            return { existe: true, campo: 'NIT', empresa: { id: snapshotNit.docs[0].id, ...snapshotNit.docs[0].data() }};
        }
        
        if (!snapshotNombre.empty) {
            return { existe: true, campo: 'nombre', empresa: { id: snapshotNombre.docs[0].id, ...snapshotNombre.docs[0].data() }};
        }
        
        return { existe: false };
    } catch (error) {
        return { existe: false };
    }
}

export async function crearEmpresa(empresaData) {
    try {
        const user = usuarioActual || auth.currentUser;
        if (!user) return { success: false, error: 'Usuario no autenticado' };
        
        const docRef = await addDoc(collection(db, 'empresas'), {
            ...empresaData,
            creadoPor: {
                uid: user.uid,
                nombre: user.displayName || user.email,
                email: user.email
            },
            fechaCreacion: serverTimestamp()
        });
        
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function obtenerEmpresas() {
    try {
        const querySnapshot = await getDocs(collection(db, 'empresas'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        return [];
    }
}

export async function actualizarEmpresa(empresaId, empresaData) {
    try {
        await updateDoc(doc(db, 'empresas', empresaId), {
            ...empresaData,
            fechaActualizacion: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export function escucharEmpresas(callback) {
    return onSnapshot(
        collection(db, 'empresas'),
        (snapshot) => {
            const empresas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(empresas);
        },
        (error) => console.error('Error escuchando empresas:', error)
    );
}

// ============================================
// DIAGNÓSTICOS
// ============================================

export async function crearDiagnostico(diagnosticoData) {
    try {
        const user = usuarioActual || auth.currentUser;
        if (!user) return { success: false, error: 'Usuario no autenticado' };
        
        const docRef = await addDoc(collection(db, 'diagnosticos'), {
            ...diagnosticoData,
            creadoPor: {
                uid: user.uid,
                nombre: user.displayName || user.email,
                email: user.email
            },
            fechaCreacion: serverTimestamp()
        });
        
        console.log('✅ Diagnóstico creado:', docRef.id);
        
        // ⭐ ENVIAR EMAIL DE CONFIRMACIÓN
        const empresaDoc = await getDoc(doc(db, 'empresas', diagnosticoData.empresaId));
        if (empresaDoc.exists()) {
            const empresaData = empresaDoc.data();
            const resultadoEmail = await enviarCorreoConfirmacion(diagnosticoData, empresaData);
            
            if (resultadoEmail.success) {
                console.log('✅ Email de confirmación enviado');
            } else {
                console.log('⚠️ No se pudo enviar email:', resultadoEmail.error);
            }
        }
        
        return { success: true, id: docRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function obtenerDiagnosticosDelUsuario() {
    try {
        const querySnapshot = await getDocs(collection(db, 'diagnosticos'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        return [];
    }
}

export async function obtenerCitasHoyDelUsuario() {
    try {
        const hoy = new Date().toISOString().split('T')[0];
        const q = query(collection(db, 'diagnosticos'), where('fechaAgendada', '==', hoy));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        return [];
    }
}

export async function actualizarEstadoDiagnostico(diagnosticoId, nuevoEstado) {
    try {
        await updateDoc(doc(db, 'diagnosticos', diagnosticoId), {
            estado: nuevoEstado,
            fechaActualizacion: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function guardarRespuestasDiagnostico(diagnosticoId, resultadoData) {
    try {
        await updateDoc(doc(db, 'diagnosticos', diagnosticoId), {
            resultado: resultadoData,
            fechaCompletado: serverTimestamp()
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function verificarDisponibilidad(fecha, hora) {
    try {
        const user = usuarioActual || auth.currentUser;
        if (!user) return false;
        
        const q = query(
            collection(db, 'diagnosticos'),
            where('fechaAgendada', '==', fecha),
            where('horaAgendada', '==', hora),
            where('creadoPor.uid', '==', user.uid)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.empty;
    } catch (error) {
        console.error('Error verificando disponibilidad:', error);
        return false;
    }
}

export function escucharDiagnosticosDelUsuario(callback) {
    return onSnapshot(
        collection(db, 'diagnosticos'),
        (snapshot) => {
            const diagnosticos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            callback(diagnosticos);
        },
        (error) => console.error('Error escuchando diagnósticos:', error)
    );
}

export async function obtenerDiagnosticosActivosPorEmpresa(empresaId) {
    try {
        const estadosActivos = [
            'agendado', 
            'en-proceso', 
            'completado',
            'entrega-agendada'
        ];
        
        const q = query(
            collection(db, 'diagnosticos'),
            where('empresaId', '==', empresaId),
            where('estado', 'in', estadosActivos)
        );
        
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error obteniendo diagnósticos activos:', error);
        return [];
    }
}

export async function reagendarDiagnostico(diagnosticoId, nuevaFecha, nuevaHora, motivoReagendamiento) {
    try {
        console.log('🔄 Iniciando reagendarDiagnostico...');
        
        const diagnosticoRef = doc(db, 'diagnosticos', diagnosticoId);
        const diagDoc = await getDoc(diagnosticoRef);
        
        if (!diagDoc.exists()) {
            return { success: false, error: 'Diagnóstico no encontrado' };
        }
        
        const diagData = diagDoc.data();
        const fechaAnterior = diagData.fechaAgendada;
        const horaAnterior = diagData.horaAgendada;
        
        await updateDoc(diagnosticoRef, {
            fechaAgendada: nuevaFecha,
            horaAgendada: nuevaHora,
            motivoReagendamiento: motivoReagendamiento,
            fechaReagendamiento: serverTimestamp(),
            reagendamientoAprobado: false,
            reagendamientoRechazado: false
        });
        
        console.log('✅ Reagendamiento guardado en Firestore');
        
        // ⭐ ENVIAR EMAIL DE REAGENDAMIENTO
        const empresaDoc = await getDoc(doc(db, 'empresas', diagData.empresaId));
        if (empresaDoc.exists()) {
            const empresaData = empresaDoc.data();
            const resultadoEmail = await enviarCorreoReagendamiento(
                { ...diagData, fechaAgendada: nuevaFecha, horaAgendada: nuevaHora, motivoReagendamiento },
                empresaData,
                fechaAnterior,
                horaAnterior
            );
            
            if (resultadoEmail.success) {
                console.log('✅ Email de reagendamiento enviado');
            } else {
                console.log('⚠️ No se pudo enviar email:', resultadoEmail.error);
            }
        }
        
        await guardarReporteReagendamiento(diagnosticoId, motivoReagendamiento, fechaAnterior, horaAnterior);
        
        return { success: true };
    } catch (error) {
        console.error('❌ Error en reagendarDiagnostico:', error);
        return { success: false, error: error.message };
    }
}

export async function aprobarReagendamiento(diagnosticoId) {
    try {
        await updateDoc(doc(db, 'diagnosticos', diagnosticoId), {
            motivoReagendamiento: null,
            reagendamientoAprobado: true,
            aprobadoPor: auth.currentUser ? auth.currentUser.uid : null,
            fechaAprobacion: serverTimestamp()
        });
        
        console.log('✅ Reagendamiento aprobado');
        return { success: true };
    } catch (error) {
        console.error('❌ Error aprobando reagendamiento:', error);
        return { success: false, error: error.message };
    }
}

export async function rechazarReagendamiento(diagnosticoId, motivoRechazo) {
    try {
        const diagnosticoRef = doc(db, 'diagnosticos', diagnosticoId);
        
        await updateDoc(diagnosticoRef, {
            motivoReagendamiento: null,
            reagendamientoRechazado: true,
            motivoRechazo: motivoRechazo,
            rechazadoPor: auth.currentUser.uid,
            fechaRechazo: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        console.error('Error rechazando reagendamiento:', error);
        return { success: false, error: error.message };
    }
}

export function esCitaVencida(fechaAgendada, estado) {
    if (estado !== 'agendado') return false;
    
    const fechaCita = new Date(fechaAgendada + 'T00:00:00');
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    fechaCita.setHours(0, 0, 0, 0);
    
    return fechaCita < hoy;
}

// ============================================
// ROLES
// ============================================

export async function obtenerRolUsuario(uid) {
    try {
        const userDoc = await getDoc(doc(db, 'usuarios', uid));
        if (userDoc.exists()) {
            return userDoc.data().rol || 'gestor';
        }
        return 'gestor';
    } catch (error) {
        return 'gestor';
    }
}

export async function actualizarRolUsuario(uid, nuevoRol) {
    try {
        const rolesValidos = ['gestor', 'coordinador', 'director'];
        if (!rolesValidos.includes(nuevoRol)) {
            return { success: false, error: 'Rol inválido' };
        }

        await updateDoc(doc(db, 'usuarios', uid), {
            rol: nuevoRol,
            fechaActualizacionRol: serverTimestamp()
        });

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function obtenerTodosUsuarios() {
    try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        return [];
    }
}

export async function sincronizarRolesDeTodosLosUsuarios() {
    try {
        const querySnapshot = await getDocs(collection(db, 'usuarios'));
        let actualizados = 0;
        let sinCambios = 0;
        
        for (const docSnap of querySnapshot.docs) {
            const userData = docSnap.data();
            const email = userData.email;
            const rolActual = userData.rol || 'gestor';
            const rolCorrecto = determinarRolPorEmail(email);
            
            if (rolActual !== rolCorrecto) {
                await updateDoc(doc(db, 'usuarios', docSnap.id), {
                    rol: rolCorrecto,
                    rolActualizadoEn: serverTimestamp()
                });
                actualizados++;
            } else {
                sinCambios++;
            }
        }
        
        return { success: true, actualizados, sinCambios, total: querySnapshot.size };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// ============================================
// REPORTES
// ============================================

export async function guardarReporteReagendamiento(diagnosticoId, motivoReagendamiento, fechaAnterior, horaAnterior) {
    try {
        const reporteRef = await addDoc(collection(db, 'reportes_reagendamiento'), {
            diagnosticoId: diagnosticoId,
            motivo: motivoReagendamiento,
            fechaAnterior: fechaAnterior,
            horaAnterior: horaAnterior,
            fechaReporte: serverTimestamp(),
            reportadoPor: {
                uid: auth.currentUser.uid,
                nombre: auth.currentUser.displayName || auth.currentUser.email,
                email: auth.currentUser.email
            }
        });

        return { success: true, id: reporteRef.id };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function obtenerReportesReagendamiento() {
    try {
        const q = query(
            collection(db, 'reportes_reagendamiento'),
            orderBy('fechaReporte', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        return [];
    }
}

// ============================================
// ✅ EXPORTACIONES FINALES - ¡IMPORTANTE!
// ============================================
export { 
    db, 
    auth, 
    firebaseConfig,
    storage,
    getStorage,
    ref,
    uploadBytes,
    getDownloadURL
};