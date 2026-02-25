/**
 * Servicio de Autenticación
 * Maneja login, logout y validación de sesiones con Firebase
 */

import { alertService } from '../ui/alerts.js';
import { ROLES } from '../config/constants.js';

export class AuthService {
    constructor(firebaseAuth) {
        this.auth = firebaseAuth;
        this.currentUser = null;
        this.userRole = null;
    }

    /**
     * Inicializar listeners de autenticación
     * @param {Function} onAuthChange - Callback cuando cambia el estado de auth
     */
    initAuthListener(onAuthChange) {
        this.auth.onAuthStateChanged((user) => {
            if (user) {
                this.currentUser = user;
                this.loadUserRole(user.uid).then(() => {
                    onAuthChange(user, this.userRole);
                });
            } else {
                this.currentUser = null;
                this.userRole = null;
                onAuthChange(null, null);
            }
        });
    }

    /**
     * Login con email y contraseña
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña
     * @returns {Promise<Object>} User object
     */
    async loginWithEmail(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            this.currentUser = userCredential.user;
            await this.loadUserRole(userCredential.user.uid);
            return { success: true, user: userCredential.user };
        } catch (error) {
            const message = this.getErrorMessage(error.code);
            alertService.error(message);
            return { success: false, error: message };
        }
    }

    /**
     * Login con Google
     * @param {Object} googleAuthProvider - Google provider de Firebase
     * @returns {Promise<Object>} User object
     */
    async loginWithGoogle(googleAuthProvider) {
        try {
            const userCredential = await this.auth.signInWithPopup(googleAuthProvider);
            this.currentUser = userCredential.user;
            await this.loadUserRole(userCredential.user.uid);
            return { success: true, user: userCredential.user };
        } catch (error) {
            const message = this.getErrorMessage(error.code);
            alertService.error(message);
            return { success: false, error: message };
        }
    }

    /**
     * Logout del usuario actual
     */
    async logout() {
        try {
            await this.auth.signOut();
            this.currentUser = null;
            this.userRole = null;
            return { success: true };
        } catch (error) {
            alertService.error('Error al cerrar sesión');
            return { success: false, error: error.message };
        }
    }

    /**
     * Cargar rol del usuario desde Firestore
     * @param {string} uid - UID del usuario
     */
    async loadUserRole(uid) {
        try {
            const db = this.getFirestore();
            const userDoc = await db.collection('users').doc(uid).get();
            
            if (userDoc.exists) {
                this.userRole = userDoc.data().role || ROLES.GESTOR;
            } else {
                this.userRole = ROLES.GESTOR; // Rol por defecto
            }
        } catch (error) {
            console.error('Error loading user role:', error);
            this.userRole = ROLES.GESTOR;
        }
    }

    /**
     * Obtener rol actual del usuario
     */
    getUserRole() {
        return this.userRole;
    }

    /**
     * Obtener usuario actual
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Verificar si usuario tiene rol específico
     */
    hasRole(role) {
        return this.userRole === role;
    }

    /**
     * Verificar si usuario tiene uno de los roles especificados
     */
    hasAnyRole(roles) {
        return roles.includes(this.userRole);
    }

    /**
     * Verificar si usuario está autenticado
     */
    isAuthenticated() {
        return this.currentUser !== null;
    }

    /**
     * Enviar email de recuperación de contraseña
     */
    async sendPasswordReset(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
            alertService.success('Email de recuperación enviado. Revisa tu bandeja de entrada.');
            return { success: true };
        } catch (error) {
            const message = this.getErrorMessage(error.code);
            alertService.error(message);
            return { success: false, error: message };
        }
    }

    /**
     * Cambiar contraseña del usuario actual
     */
    async changePassword(newPassword) {
        try {
            if (!this.currentUser) {
                throw new Error('No hay usuario autenticado');
            }
            await this.currentUser.updatePassword(newPassword);
            alertService.success('Contraseña actualizada correctamente');
            return { success: true };
        } catch (error) {
            const message = this.getErrorMessage(error.code);
            alertService.error(message);
            return { success: false, error: message };
        }
    }

    /**
     * Mapear códigos de error de Firebase a mensajes amigables
     */
    getErrorMessage(errorCode) {
        const errorMessages = {
            'auth/user-not-found': 'Usuario no encontrado',
            'auth/wrong-password': 'Contraseña incorrecta',
            'auth/invalid-email': 'Email inválido',
            'auth/user-disabled': 'Cuenta deshabilitada',
            'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
            'auth/popup-closed-by-user': 'Inicio de sesión cancelado',
            'auth/network-request-failed': 'Error de conexión',
            'auth/weak-password': 'Contraseña muy débil',
            'auth/email-already-in-use': 'Email ya registrado',
            'auth/invalid-password': 'Contraseña inválida'
        };

        return errorMessages[errorCode] || 'Error desconocido. Intenta de nuevo.';
    }

    /**
     * Obtener instancia de Firestore
     */
    getFirestore() {
        return firebase.firestore();
    }

    /**
     * Obtener email del usuario actual
     */
    getCurrentUserEmail() {
        return this.currentUser?.email || null;
    }

    /**
     * Obtener UID del usuario actual
     */
    getCurrentUserUID() {
        return this.currentUser?.uid || null;
    }
}

// Exportar clase para instanciar con Firebase
export default AuthService;