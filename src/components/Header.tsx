import { Link } from 'react-router-dom'
import { useState } from 'react'
import NoticiasModal from './NoticiasModal'

interface HeaderProps {
  session: any;
  nombreUsuario: string;
  avatarUrl?: string | null;
  esadmin: boolean;
  onLogout: () => void;
  modoOscuro: boolean;
  onToggleTema: () => void;
}

export default function Header({ session, nombreUsuario, avatarUrl, esadmin, onLogout, modoOscuro, onToggleTema }: HeaderProps) {
  const [mostrarNoticias, setMostrarNoticias] = useState(false);
  const inicial = (nombreUsuario || (session?.user?.email) || 'U').charAt(0).toUpperCase();

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 shrink-0 transition-colors duration-300">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-900 dark:text-white">
          <Link to="/" className="text-2xl font-bold text-blue-600 dark:text-blue-500 tracking-tight">🎥 Novavista</Link>
          
          <div className="space-x-4 flex items-center">
            <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm">Cartelera</Link>
            
            <button 
              onClick={() => setMostrarNoticias(true)}
              className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm"
            >
              Noticias
            </button>

            {session && (
              <Link 
                to="/mis-entradas" 
                className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm"
              >
                Mis Entradas
              </Link>
            )}

            {/* BOTÓN EXCLUSIVO PARA ADMINISTRADORES */}
            {esadmin && (
              <Link 
                to="/admin" 
                className="hover:text-purple-600 dark:hover:text-purple-400 text-purple-600 dark:text-purple-400 font-bold transition-colors text-sm bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-md"
              >
                Panel Admin 🛠️
              </Link>
            )}
            
            <button onClick={onToggleTema} className="cursor-pointer p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-2">
              {modoOscuro ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>

            {session ? (
              <div className="flex items-center gap-4 ml-4 border-l border-gray-300 dark:border-gray-700 pl-4">
                <Link to="/perfil" className="group flex items-center gap-2 transition-all" title="Ir a mi perfil">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Perfil" className="w-9 h-9 rounded-full object-cover border-2 border-transparent group-hover:border-blue-500 transition-colors" />
                  ) : (
                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold text-white border-2 border-transparent group-hover:border-blue-500 transition-colors">{inicial}</div>
                  )}
                  <span className="hidden sm:block text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{nombreUsuario || session.user.email}</span>
                </Link>
                <button onClick={onLogout} className="cursor-pointer bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-600 dark:text-white dark:hover:bg-red-700 px-4 py-2 rounded-lg font-semibold transition-colors text-sm">Cerrar Sesión</button>
              </div>
            ) : (
              <div className="border-l border-gray-300 dark:border-gray-700 pl-4">
                <Link to="/login" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm">Iniciar Sesión</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {mostrarNoticias && <NoticiasModal esadmin={esadmin} onClose={() => setMostrarNoticias(false)} />}
    </>
  )
}