/**
 * Controlador del módulo Login
 * Gestiona autenticación con email/password y Google
 */

import { alertService } from '../../ui/alerts.js';
import { modalManager } from '../../ui/modal-manager.js';
import { AuthService } from '../../services/auth-service.js';
import { LoginView } from './login-view.js';

export class LoginController {
    constructor(firebaseAuth, googleAuthProvider) {
        this.auth = firebaseAuth;
        this.googleAuthProvider = googleAuthProvider;
        this.authService = new AuthService(firebaseAuth);
        this.view = new LoginView();
        this.setupEventListeners();
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Formulario de login
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'btnLoginEmail') {
                await this.loginConEmail();
            }
            if (e.target.id === 'btnLoginGoogle') {
                await this.loginConGoogle();
            }
            if (e.target.id === 'btnMostrarRegistro') {
                this.view.mostrarFormularioRegistro();
            }
            if (e.target.id === 'btnVolverLogin') {
                this.view.mostrarFormularioLogin();
            }
            if (e.target.id === 'btnRegistrar') {
                await this.registrarNuevoUsuario();
            }
            if (e.target.id === 'btnOlvideContraseña') {
                this.view.mostrarRecuperarContraseña();
            }
            if (e.target.id === 'btnEnviarRecuperacion') {
                await this.enviarRecuperacion();
            }
            if (e.target.id === 'btnVolverDesdeRecuperacion') {
                this.view.mostrarFormularioLogin();
            }
        });

        // Enter en inputs
        document.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const emailInput = document.getElementById('emailLogin');
                const passwordInput = document.getElementById('passwordLogin');
                
                if (emailInput && passwordInput && document.activeElement === passwordInput) {
                    await this.loginConEmail();
                }
            }
        });
    }

    /**
     * Login con email y contraseña
     */
    async loginConEmail() {
        const email = document.getElementById('emailLogin')?.value?.trim();
        const password = document.getElementById('passwordLogin')?.value;

        if (!email || !password) {
            alertService.error('Por favor completa email y contraseña');
            return;
        }

        if (!this.validarEmail(email)) {
            alertService.error('Email inválido');
            return;
        }

        try {
            this.view.mostrarCargando();
            const resultado = await this.authService.loginWithEmail(email, password);

            if (resultado.success) {
                console.log('✅ Login exitoso:', resultado.user.email);
                // El evento onAuthStateChanged se disparará automáticamente
            }
        } catch (error) {
            alertService.error('Error al iniciar sesión');
            console.error(error);
        } finally {
            this.view.ocultarCargando();
        }
    }

    /**
     * Login con Google
     */
    async loginConGoogle() {
        try {
            this.view.mostrarCargando();
            const resultado = await this.authService.loginWithGoogle(this.googleAuthProvider);

            if (resultado.success) {
                console.log('✅ Login con Google exitoso:', resultado.user.email);
                // El evento onAuthStateChanged se disparará automáticamente
            }
        } catch (error) {
            alertService.error('Error al iniciar sesión con Google');
            console.error(error);
        } finally {
            this.view.ocultarCargando();
        }
    }

    /**
     * Registrar nuevo usuario
     */
    async registrarNuevoUsuario() {
        const email = document.getElementById('emailRegistro')?.value?.trim();
        const password = document.getElementById('passwordRegistro')?.value;
        const confirmPassword = document.getElementById('passwordConfirm')?.value;
        const nombre = document.getElementById('nombreRegistro')?.value?.trim();

        if (!email || !password || !confirmPassword || !nombre) {
            alertService.error('Por favor completa todos los campos');
            return;
        }

        if (!this.validarEmail(email)) {
            alertService.error('Email inválido');
            return;
        }

        if (password.length < 6) {
            alertService.error('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            alertService.error('Las contraseñas no coinciden');
            return;
        }

        try {
            this.view.mostrarCargando();

            const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
            
            await userCredential.user.updateProfile({
                displayName: nombre
            });

            // Guardar usuario en Firestore
            const db = firebase.firestore();
            await db.collection('usuarios').doc(userCredential.user.uid).set({
                email: email,
                nombre: nombre,
                rol: this.determinarRol(email),
                createdAt: new Date(),
                estado: 'activo'
            });

            alertService.success('Cuenta creada exitosamente. Por favor inicia sesión.');
            this.view.mostrarFormularioLogin();
            
        } catch (error) {
            let mensaje = 'Error al registrarse';
            
            if (error.code === 'auth/email-already-in-use') {
                mensaje = 'El email ya está registrado';
            } else if (error.code === 'auth/weak-password') {
                mensaje = 'La contraseña es muy débil';
            } else if (error.code === 'auth/invalid-email') {
                mensaje = 'Email inválido';
            }
            
            alertService.error(mensaje);
            console.error(error);
        } finally {
            this.view.ocultarCargando();
        }
    }

    /**
     * Enviar email de recuperación
     */
    async enviarRecuperacion() {
        const email = document.getElementById('emailRecuperacion')?.value?.trim();

        if (!email || !this.validarEmail(email)) {
            alertService.error('Por favor ingresa un email válido');
            return;
        }

        try {
            this.view.mostrarCargando();
            const resultado = await this.authService.sendPasswordReset(email);

            if (resultado.success) {
                setTimeout(() => {
                    this.view.mostrarFormularioLogin();
                }, 2000);
            }
        } catch (error) {
            alertService.error('Error al enviar email de recuperación');
            console.error(error);
        } finally {
            this.view.ocultarCargando();
        }
    }

    /**
     * Validar formato de email
     */
    validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    /**
     * Determinar rol según email
     */
    determinarRol(email) {
        const directores = [
            'gdocumental@centrojuridicointernacional.com',
            'talento@centrojuridicointernacional.com',
            'cjinegocios@centrojuridicointernacional.com',
            'juridico5@centrojuridicointernacional.com',
        ];

        const coordinadores = [];

        if (directores.includes(email.toLowerCase())) {
            return 'director';
        }
        if (coordinadores.includes(email.toLowerCase())) {
            return 'coordinador';
        }
        return 'gestor';
    }
}

export default LoginController;