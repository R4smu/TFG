import { useState } from 'react'

interface AuthFormProps {
  isLogin: boolean;
  cargando: boolean;
  error: string | null;
  onSubmit: (email: string, password: string, nombre?: string, telefono?: string) => void;
  onToggleMode: () => void;
}

export default function AuthForm({ isLogin, cargando, error, onSubmit, onToggleMode }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(email, password, isLogin ? undefined : nombre, isLogin ? undefined : telefono)
  }

  const evaluarFuerzaPassword = (pass: string) => {
    let puntos = 0;
    if (pass.length >= 6) puntos++;
    if (/[A-Z]/.test(pass)) puntos++;
    if (/\d/.test(pass)) puntos++;
    if (/[\W_]/.test(pass)) puntos++;
    return puntos;
  }

  const fuerza = evaluarFuerzaPassword(password);
  const passwordsCoinciden = password === confirmPassword && confirmPassword.length > 0;

  let colorBarra = 'bg-gray-200 dark:bg-gray-700';
  let anchoBarra = 'w-0';

  if (password.length > 0) {
    if (fuerza === 1) { colorBarra = 'bg-red-500'; anchoBarra = 'w-1/4'; }
    else if (fuerza === 2) { colorBarra = 'bg-orange-500'; anchoBarra = 'w-2/4'; }
    else if (fuerza === 3) { colorBarra = 'bg-yellow-400'; anchoBarra = 'w-3/4'; }
    else if (fuerza === 4) { colorBarra = 'bg-green-500'; anchoBarra = 'w-full'; }
  }

  const formInvalido = !isLogin && (fuerza < 4 || !passwordsCoinciden);

  return (
    <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl dark:shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md animate-fade-in transition-colors duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 transition-colors">
          {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">
          {isLogin ? 'Inicia sesión para gestionar tus entradas' : 'Únete a Novavista y disfruta del mejor cine'}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500 text-red-600 dark:text-red-500 p-3 rounded-lg text-sm mb-6 text-center transition-colors">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {!isLogin && (
          <>
            <div>
              <label className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2 transition-colors">Nombre completo</label>
              <input 
                type="text" 
                required 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ej: Laura García"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2 transition-colors">Teléfono</label>
              <input 
                type="tel" 
                required 
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ej: 600123456"
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2 transition-colors">Correo electrónico</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onClick={() => {
              setEmail('')
              setPassword('')
            }}
            className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            placeholder="tu@email.com"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2 transition-colors">Contraseña</label>
          <div className="relative">
            <input 
              type={mostrarPassword ? "text" : "password"} 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
            
            <button
              type="button" 
              onClick={() => setMostrarPassword(!mostrarPassword)}
              className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1 
                ${mostrarPassword ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400'}`}
            >
              {mostrarPassword ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
              )}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-3 mb-4">
              <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden transition-colors">
                <div className={`h-full ${colorBarra} ${anchoBarra} transition-all duration-500 ease-out`}></div>
              </div>
              <p className={`text-xs mt-2 transition-colors duration-300 ${fuerza === 4 ? 'text-green-600 dark:text-green-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>
                {fuerza === 4 ? '¡Contraseña segura y lista!' : 'Debe tener: 6 caracteres, 1 mayúscula, 1 número y 1 símbolo.'}
              </p>
            </div>
          )}
        </div>

        {!isLogin && (
          <div>
            <label className="block text-gray-700 dark:text-gray-400 text-sm font-bold mb-2 transition-colors">Confirmar Contraseña</label>
            <div className="relative">
              <input 
                type={mostrarConfirmPassword ? "text" : "password"} 
                required 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg px-4 py-3 pr-12 focus:outline-none transition-colors 
                  ${confirmPassword.length === 0 
                    ? 'border-gray-300 dark:border-gray-600 focus:border-blue-500' 
                    : passwordsCoinciden 
                      ? 'border-green-500 focus:border-green-500'
                      : 'border-red-500 focus:border-red-500'
                  }`}
                placeholder="Repite tu contraseña"
              />
              
              <button
                type="button" 
                onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors p-1 
                  ${mostrarConfirmPassword ? 'text-blue-600 dark:text-blue-500' : 'text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400'}`}
              >
                {mostrarConfirmPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                )}
              </button>
            </div>
            {confirmPassword.length > 0 && !passwordsCoinciden && (
              <p className="text-xs text-red-600 dark:text-red-500 mt-2 font-medium">Las contraseñas no coinciden.</p>
            )}
            {confirmPassword.length > 0 && passwordsCoinciden && (
              <p className="text-xs text-green-600 dark:text-green-500 mt-2 font-medium">¡Las contraseñas coinciden!</p>
            )}
          </div>
        )}

        <button 
          type="submit" 
          disabled={cargando || formInvalido} 
          className={`w-full py-3 rounded-lg font-bold text-white transition-all shadow-lg mt-4 
            ${(cargando || formInvalido) ? 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-500 shadow-blue-500/30 dark:shadow-blue-900/20'}`}
        >
          {cargando ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-6 transition-colors">
        {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes una cuenta? '}
        <button 
          onClick={() => {
            onToggleMode()
            setPassword('') 
            setConfirmPassword('') 
          }}
          type="button"
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold transition-colors"
        >
          {isLogin ? 'Regístrate aquí' : 'Inicia sesión'}
        </button>
      </div>
    </div>
  )
}