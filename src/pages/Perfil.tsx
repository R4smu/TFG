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
    
    if (!mostrarAjustes) {
      obtenerPerfil()
    }
  }, [navigate, mostrarAjustes])

  if (cargando) return <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white flex justify-center items-center">Cargando perfil...</div>
  if (!usuario) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Mi Perfil</h1>

        {/* CONTENEDOR PRINCIPAL DEL PERFIL */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden transition-colors">
          
          {/* BANNER DE FONDO */}
          <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
            {/* Botón de Editar */}
            <button 
              onClick={() => setMostrarAjustes(!mostrarAjustes)}
              className="absolute top-4 right-4 cursor-pointer bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/30 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
            >
              {mostrarAjustes ? (
                <>✕ Cancelar Edición</>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  Editar Perfil
                </>
              )}
            </button>
          </div>

          {/* ZONA DE CONTENIDO */}
          <div className="px-6 sm:px-12 pb-10">
            
            {/* AVATAR */}
            <div className="relative flex justify-between items-end -mt-16 sm:-mt-20 mb-6">
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-gray-900 bg-blue-600 overflow-hidden shadow-xl z-10 flex items-center justify-center text-5xl sm:text-6xl font-bold text-white transition-colors">
                {usuario.avatar_url ? (
                  <img src={usuario.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  usuario.nombre.charAt(0).toUpperCase()
                )}
              </div>
            </div>

            {/* NOMBRE Y ROL */}
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white flex items-center gap-3 transition-colors">
                {usuario.nombre}
                {esadmin && <span className="bg-purple-600 text-white text-[10px] sm:text-xs px-3 py-1 rounded-full uppercase tracking-widest font-bold align-middle shadow-sm">Admin</span>}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">{usuario.email}</p>
            </div>

            <hr className="border-gray-100 dark:border-gray-800 mb-8 transition-colors" />

            {/* --- SWITCH: MODO VISTA / MODO EDICIÓN --- */}
            {mostrarAjustes ? (
              
              // MODO EDICIÓN
              <div className="animate-fade-in bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 transition-colors">
                <ConfiguracionUsuario />
              </div>

            ) : (

              // MODO VISTA
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                
                {/* Columna Contacto */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-4 transition-colors">Información de Contacto</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Correo Electrónico</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{usuario.email}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Número de Teléfono</p>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{usuario.telefono || 'No especificado'}</p>
                    </div>
                  </div>
                </div>

                {/* Columna Detalles de Cuenta */}
                <div>
                  <h3 className="text-xs uppercase tracking-widest font-bold text-gray-400 dark:text-gray-500 mb-4 transition-colors">Estado de la Cuenta</h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${esadmin ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-medium">Nivel de Permisos</p>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">{esadmin ? 'Administrador del Sistema' : 'Cliente Estándar'}</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 p-5 rounded-xl border border-gray-100 dark:border-gray-800 transition-colors flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5 font-medium">Estado del Perfil</p>
                        <p className="font-bold text-green-600 dark:text-green-400 text-lg">Cuenta Activa</p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}