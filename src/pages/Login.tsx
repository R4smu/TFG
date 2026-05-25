import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import AuthForm from '../components/AuthForm'

export default function Login() {
  const [isLogin, setIsLogin] = useState(true)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const navigate = useNavigate()

  const procesarAuth = async (email: string, password: string, nombre?: string, telefono?: string) => {
    setCargando(true)
    setError(null)

    try {
      if (isLogin) {
        // --- INICIO DE SESIÓN ---
        const { error: errorAuth } = await supabase.auth.signInWithPassword({ email, password })
        if (errorAuth) throw new Error("Credenciales incorrectas. Inténtalo de nuevo.")
        
        // --- COMPROBACIÓN DE ALTA/BAJA ---
        const { data: dbUser } = await supabase
          .from('usuario')
          .select('alta')
          .eq('email', email)
          .single()

        if (dbUser && dbUser.alta === false) {
          await supabase.auth.signOut()
          throw new Error("Esta cuenta ha sido desactivada y no tiene acceso al sistema.")
        }
        
        navigate('/')
      } else {
        // --- REGISTRO ---
        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
        if (!passwordRegex.test(password)) {
          throw new Error("La contraseña no cumple con los requisitos de seguridad mínimos.");
        }

        const { data, error: errorAuth } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              nombre: nombre || 'Usuario Nuevo',
              telefono: telefono
            }
          }
        })

        if (errorAuth) throw new Error(errorAuth.message)

        if (!data.session) {
          alert("¡Registro casi completado! Revisa tu bandeja de entrada (y la carpeta de SPAM) para confirmar tu cuenta.")
          setIsLogin(true)
        } else {
          navigate('/perfil') 
        }
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
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