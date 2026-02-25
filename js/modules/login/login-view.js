/**
 * Vista del módulo Login
 * Maneja la presentación del formulario de autenticación
 */

export class LoginView {
    constructor() {
        this.loginScreen = document.getElementById('loginScreen');
        this.render();
    }

    /**
     * Renderizar la vista de login
     */
    render() {
        this.loginScreen.innerHTML = `
            <div class="login-box">
                <!-- Logo/Título -->
                <div style="text-align: center; margin-bottom: 30px;">
                    <div style="font-size: 64px; margin-bottom: 15px;">🛡️</div>
                    <h1 style="font-size: 32px; margin: 0 0 10px 0; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">SG-SST</h1>
                    <p style="color: #95a5a6; font-size: 14px; margin: 0;">Sistema de Gestión en Seguridad y Salud en el Trabajo</p>
                </div>

                <!-- Formulario Login -->
                <div id="formLogin" class="login-form">
                    <div class="form-group">
                        <label for="emailLogin">📧 Email</label>
                        <input 
                            type="email" 
                            id="emailLogin" 
                            placeholder="tu@email.com"
                            autocomplete="email"
                        >
                    </div>

                    <div class="form-group">
                        <label for="passwordLogin">🔒 Contraseña</label>
                        <input 
                            type="password" 
                            id="passwordLogin" 
                            placeholder="••••••••"
                            autocomplete="current-password"
                        >
                    </div>

                    <button id="btnLoginEmail" class="btn btn-primary" style="width: 100%; margin-bottom: 12px;">
                        Iniciar Sesión
                    </button>

                    <button id="btnLoginGoogle" class="btn btn-secondary" style="width: 100%; margin-bottom: 15px;">
                        🔗 Iniciar con Google
                    </button>

                    <div style="display: flex; justify-content: space-between; gap: 10px; margin-bottom: 10px;">
                        <button id="btnOlvideContraseña" class="btn btn-secondary btn-sm" style="flex: 1; padding: 8px;">
                            ¿Olvidaste tu contraseña?
                        </button>
                        <button id="btnMostrarRegistro" class="btn btn-primary btn-sm" style="flex: 1; padding: 8px;">
                            Crear Cuenta
                        </button>
                    </div>
                </div>

                <!-- Formulario Registro -->
                <div id="formRegistro" class="login-form" style="display: none;">
                    <h2 style="margin-top: 0; margin-bottom: 20px; text-align: center;">Crear Cuenta</h2>

                    <div class="form-group">
                        <label for="nombreRegistro">👤 Nombre Completo</label>
                        <input 
                            type="text" 
                            id="nombreRegistro" 
                            placeholder="Juan Pérez"
                        >
                    </div>

                    <div class="form-group">
                        <label for="emailRegistro">📧 Email</label>
                        <input 
                            type="email" 
                            id="emailRegistro" 
                            placeholder="tu@email.com"
                        >
                    </div>

                    <div class="form-group">
                        <label for="passwordRegistro">🔒 Contraseña</label>
                        <input 
                            type="password" 
                            id="passwordRegistro" 
                            placeholder="Mínimo 6 caracteres"
                        >
                    </div>

                    <div class="form-group">
                        <label for="passwordConfirm">🔒 Confirmar Contraseña</label>
                        <input 
                            type="password" 
                            id="passwordConfirm" 
                            placeholder="Repite tu contraseña"
                        >
                    </div>

                    <button id="btnRegistrar" class="btn btn-primary" style="width: 100%; margin-bottom: 12px;">
                        Registrarse
                    </button>

                    <button id="btnVolverLogin" class="btn btn-secondary" style="width: 100%;">
                        Volver al Login
                    </button>
                </div>

                <!-- Formulario Recuperación -->
                <div id="formRecuperacion" class="login-form" style="display: none;">
                    <h2 style="margin-top: 0; margin-bottom: 20px; text-align: center;">Recuperar Contraseña</h2>

                    <p style="color: #95a5a6; text-align: center; margin-bottom: 20px; font-size: 14px;">
                        Ingresa tu email para recibir instrucciones de recuperación
                    </p>

                    <div class="form-group">
                        <label for="emailRecuperacion">📧 Email</label>
                        <input 
                            type="email" 
                            id="emailRecuperacion" 
                            placeholder="tu@email.com"
                        >
                    </div>

                    <button id="btnEnviarRecuperacion" class="btn btn-primary" style="width: 100%; margin-bottom: 12px;">
                        Enviar Link de Recuperación
                    </button>

                    <button id="btnVolverDesdeRecuperacion" class="btn btn-secondary" style="width: 100%;">
                        Volver al Login
                    </button>
                </div>

                <!-- Loader -->
                <div id="loginLoader" style="display: none; text-align: center; padding: 20px;">
                    <div style="
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #667eea;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto;
                    "></div>
                    <p style="color: #95a5a6; margin-top: 15px;">Procesando...</p>
                </div>
            </div>

            <style>
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                .login-form {
                    animation: fadeIn 0.3s ease;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            </style>
        `;
    }

    /**
     * Mostrar formulario de login
     */
    mostrarFormularioLogin() {
        document.getElementById('formLogin').style.display = 'block';
        document.getElementById('formRegistro').style.display = 'none';
        document.getElementById('formRecuperacion').style.display = 'none';
        this.limpiarInputs();
    }

    /**
     * Mostrar formulario de registro
     */
    mostrarFormularioRegistro() {
        document.getElementById('formLogin').style.display = 'none';
        document.getElementById('formRegistro').style.display = 'block';
        document.getElementById('formRecuperacion').style.display = 'none';
        this.limpiarInputs();
    }

    /**
     * Mostrar formulario de recuperación
     */
    mostrarRecuperarContraseña() {
        document.getElementById('formLogin').style.display = 'none';
        document.getElementById('formRegistro').style.display = 'none';
        document.getElementById('formRecuperacion').style.display = 'block';
        this.limpiarInputs();
    }

    /**
     * Mostrar loader
     */
    mostrarCargando() {
        document.getElementById('loginLoader').style.display = 'block';
        document.querySelectorAll('.btn').forEach(btn => btn.disabled = true);
    }

    /**
     * Ocultar loader
     */
    ocultarCargando() {
        document.getElementById('loginLoader').style.display = 'none';
        document.querySelectorAll('.btn').forEach(btn => btn.disabled = false);
    }

    /**
     * Limpiar inputs
     */
    limpiarInputs() {
        document.querySelectorAll('input[type="email"], input[type="password"], input[type="text"]').forEach(input => {
            input.value = '';
        });
    }
}

export default LoginView;