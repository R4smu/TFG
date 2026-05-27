import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import DashboardAdmin from '../components/DashboardAdmin'
import GestorSalas from '../components/GestorSalas'
import GestorPeliculas from '../components/GestorPeliculas'
import GestorUsuarios from '../components/GestorUsuarios'

interface AdminPanelProps {
  esadmin: boolean;
}

export default function AdminPanel({ esadmin }: AdminPanelProps) {
  if (!esadmin) {
    return <Navigate to="/" replace />
  }

  const [pestanaActiva, setPestanaActiva] = useState<'metricas' | 'peliculas' | 'salas' | 'usuarios'>('metricas')

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex flex-col md:flex-row transition-colors duration-300">
      
      {/* MENÚ LATERAL DE NAVEGACIÓN */}
      <div className="w-full md:w-64 bg-white dark:bg-gray-900 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 p-6 space-y-6 shrink-0 transition-colors">
        <div>
          <h1 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">Panel de Control</h1>
          <p className="text-xs text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest mt-1">Administración</p>
        </div>

        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-3 md:pb-0 scrollbar-none">
          {/* Botón Métricas */}
          <button
            onClick={() => setPestanaActiva('metricas')}
            className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              pestanaActiva === 'metricas'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Métricas y Negocio
          </button>

          {/* Botón Películas */}
          <button
            onClick={() => setPestanaActiva('peliculas')}
            className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              pestanaActiva === 'peliculas'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            🎬 Gestionar Películas
          </button>

          {/* Botón Salas */}
          <button
            onClick={() => setPestanaActiva('salas')}
            className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              pestanaActiva === 'salas'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            🏛️ Gestionar Salas
          </button>

          {/* Botón Usuarios */}
          <button
            onClick={() => setPestanaActiva('usuarios')}
            className={`cursor-pointer w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              pestanaActiva === 'usuarios'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            👥 Control de Usuarios
          </button>
        </nav>
      </div>

      {/* CONTENEDOR DE CONTENIDO DINÁMICO */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {pestanaActiva === 'metricas' && <DashboardAdmin />}
        
        {pestanaActiva === 'peliculas' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 text-sm">
            <GestorPeliculas />
            <p>Componente de películas integrado en el panel único.</p>
          </div>
        )}

        {pestanaActiva === 'salas' && <GestorSalas />}

        {pestanaActiva === 'usuarios' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 text-sm">
            <GestorUsuarios />
            <p>Componente de control de usuarios e invitaciones de administración.</p>
          </div>
        )}
      </div>

    </div>
  )
}