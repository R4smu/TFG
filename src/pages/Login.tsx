import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()

  // Añadimos el teléfono a los parámetros que recibe la función
  const procesarAuth = async (email: string, password: string, nombre?: string, telefono?: string) => {
    setCargando(true)
    setError(null)

    try {
      if (isLogin) {
        // --- INICIO DE SESIÓN ---
        const { error: errorAuth } = await supabase.auth.signInWithPassword({ email, password })
        if (errorAuth) throw new Error("Credenciales incorrectas. Inténtalo de nuevo.")
        navigate('/')
      } else {
        // --- REGISTRO ---
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error("La contraseña no cumple con los requisitos de seguridad mínimos.");
        }

        // AQUÍ ESTÁ LA MAGIA: Mandamos nombre y teléfono como "metadatos"
        const { error: errorAuth } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              nombre: nombre || 'Usuario Nuevo',
              telefono: telefono
            }
          }
        })

        // Si falla (ya sea la contraseña o nuestro Trigger de la BD), saltará este error
        if (errorAuth) throw new Error(errorAuth.message)

        // ¡Y ya está! Hemos borrado el "supabase.from('usuario').insert(...)".
        // La base de datos lo hace por nosotros en segundo plano.

        alert("¡Registro exitoso! Ya puedes iniciar sesión.")
        setIsLogin(true) 
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    // Hemos quitado el bg-gray-900 de aquí para que herede de App.tsx
    <div className="flex flex-col items-center justify-center flex-grow p-4 w-full">
      <AuthForm 
        isLogin={isLogin} 
        cargando={cargando} 
        error={error} 
        onSubmit={procesarAuth} 
        onToggleMode={() => setIsLogin(!isLogin)} 
      />
    </div>
  )
}