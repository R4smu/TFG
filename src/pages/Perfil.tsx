import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'
import ConfiguracionUsuario from '../components/ConfiguracionUsuario'

interface PerfilProps {
  esadmin: boolean;
}

export default function Perfil({ esadmin }: PerfilProps) {
  const [usuario, setUsuario] = useState<any>(null)
  const [cargando, setCargando] = useState(true)
  const [mostrarAjustes, setMostrarAjustes] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const obtenerPerfil = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return; }

      const { data } = await supabase.from('usuario').select('*').eq('email', user.email).single()
      if (data) setUsuario(data)
      setCargando(false)
    }
    obtenerPerfil()
  }, [navigate])

  if (cargando) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-center">Cargando perfil...</div>
  if (!usuario) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <h1 className="text-3xl sm:text-4xl font-bold text-blue-600 dark:text-blue-500 tracking-tight">Mi Perfil</h1>

        {/* TARJETA DE INFO DEL USUARIO */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-lg relative overflow-hidden transition-colors">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-5 sm:gap-6 z-10 w-full sm:w-auto">
            {usuario.avatar_url ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden shadow-lg shadow-blue-900/20 border-4 border-white dark:border-gray-800 shrink-0">
                <img src={usuario.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold text-white shadow-lg shadow-blue-900/20 shrink-0">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold flex flex-wrap items-center gap-2 sm:gap-3">
                {usuario.nombre}
                {esadmin && <span className="bg-purple-600 text-white text-[10px] sm:text-xs px-2 py-0.5 sm:py-1 rounded-full uppercase tracking-widest font-bold">Admin</span>}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm sm:text-base">{usuario.email}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm mt-1 font-medium">Teléfono: {usuario.telefono || 'No especificado'}</p>
            </div>
          </div>

          <div className="z-10 w-full sm:w-auto mt-2 sm:mt-0">
            <button 
              onClick={() => setMostrarAjustes(!mostrarAjustes)}
              className={`cursor-pointer w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${mostrarAjustes ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              {mostrarAjustes ? 'Ocultar Ajustes' : 'Editar Perfil'}
            </button>
          </div>
        </div>

        {/* CONTENEDOR DESPLEGABLE DE CONFIGURACIÓN */}
        {mostrarAjustes && (
          <div className="animate-fade-in">
            <ConfiguracionUsuario />
          </div>
        )}

      </div>
    </div>
  )
}