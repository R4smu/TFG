import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8">
        
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-500 tracking-tight">Mi Perfil</h1>

        {/* TARJETA DE INFO DEL USUARIO */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg relative overflow-hidden transition-colors">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-6 z-10">
            {usuario.avatar_url ? (
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg shadow-blue-900/20 border-4 border-white dark:border-gray-800">
                <img src={usuario.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-blue-900/20">
                {usuario.nombre.charAt(0).toUpperCase()}
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-3">
                {usuario.nombre}
                {esadmin && <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full uppercase tracking-widest font-bold">Admin</span>}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{usuario.email}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 font-medium">Teléfono: {usuario.telefono || 'No especificado'}</p>
            </div>
          </div>
        </div>

        {/* ACCESOS DIRECTOS */}
        <div className="mt-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-wider text-sm transition-colors">Mi Actividad</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link 
              to="/mis-entradas" 
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 p-6 rounded-xl flex items-center justify-between group transition-all shadow-md"
            >
              <div className="flex items-center gap-5">
                <div className="bg-blue-600/10 dark:bg-blue-600/20 p-4 rounded-xl text-blue-600 dark:text-blue-500 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Mis Entradas</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Ver y gestionar tus tickets de cine</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>

            {/* BOTÓN ABRIR/CERRAR AJUSTES */}
            <button 
              onClick={() => setMostrarAjustes(!mostrarAjustes)}
              className={`cursor-pointer bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 p-6 rounded-xl flex items-center justify-between group transition-all shadow-md text-left ${mostrarAjustes ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-xl transition-colors ${mostrarAjustes ? 'bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
                <div>
                  <h3 className={`text-xl font-bold transition-colors ${mostrarAjustes ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'}`}>Ajustes de cuenta</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Modifica tus datos personales</p>
                </div>
              </div>
              <svg className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${mostrarAjustes ? 'rotate-90 text-blue-500' : 'group-hover:translate-x-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        {mostrarAjustes && (
          <div className="animate-fade-in mt-8">
            <ConfiguracionUsuario />
          </div>
        )}

      </div>
    </div>
  )
}