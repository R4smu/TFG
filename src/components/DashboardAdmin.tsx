import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts'

interface DatosDiarios {
  fecha: string;
  entradas_vendidas: number;
  dinero_ganado: number;
}

interface DatosTopPeliculas {
  titulo: string;
  entradas_compradas: number;
}

export default function DashboardAdmin() {
  const [datosDiarios, setDatosDiarios] = useState<DatosDiarios[]>([])
  const [topPeliculas, setTopPeliculas] = useState<DatosTopPeliculas[]>([])
  const [cargando, setCargando] = useState(true)

  const [totales, setTotales] = useState({ ingresos: 0, entradas: 0, peliTop: '—' })

  useEffect(() => {
    const cargarAnaliticas = async () => {
      setCargando(true)

      const { data: diario } = await supabase.from('vista_dashboard_diario').select('*')
      const { data: topPelis } = await supabase.from('vista_dashboard_top_peliculas').select('*')

      if (diario) {
        const formateado = diario.map((d: any) => ({
          ...d,
          fecha: new Date(d.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
        }))
        setDatosDiarios(formateado)

        const ingresosAcumulados = diario.reduce((acc: number, curr: any) => acc + (curr.dinero_ganado || 0), 0)
        const entradasAcumuladas = diario.reduce((acc: number, curr: any) => acc + curr.entradas_vendidas, 0)
        
        setTotales(prev => ({
          ...prev,
          ingresos: ingresosAcumulados,
          entradas: entradasAcumuladas
        }))
      }

      if (topPelis) {
        setTopPeliculas(topPelis as DatosTopPeliculas[])
        if (topPelis.length > 0) {
          setTotales(prev => ({ ...prev, peliTop: topPelis[0].titulo }))
        }
      }

      setCargando(false)
    }

    cargarAnaliticas()
  }, [])

  if (cargando) return <div className="p-8 text-center text-gray-500 dark:text-gray-400 animate-pulse text-sm">Cargando métricas de negocio...</div>

  return (
    <div className="space-y-6">
      
      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta Ingresos */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Caja Total Acumulada</p>
          <p className="text-2xl font-black text-green-600 dark:text-green-400 mt-1">{totales.ingresos.toFixed(2)}€</p>
          <p className="text-[10px] text-gray-400 mt-1">Suma de todas las entradas online registradas</p>
        </div>

        {/* Tarjeta Tickets */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Entradas Vendidas</p>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{totales.entradas} tickets</p>
          <p className="text-[10px] text-gray-400 mt-1">Volumen total de espectadores en salas</p>
        </div>

        {/* Tarjeta Top Película */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Mayor Éxito Comercial</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 truncate" title={totales.peliTop}>{totales.peliTop}</p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1.5 uppercase tracking-widest">Nº1 en Taquilla</p>
        </div>
      </div>

      {/* GRÁFICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* EVOLUCIÓN DIARIA (ENTRADAS Y DINERO) */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Evolución Diaria</h3>
            <p className="text-xs text-gray-400">Relación de recaudación y tickets por día de sesión</p>
          </div>
          <div className="w-full h-72 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={datosDiarios} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="opacity-30" />
                <XAxis dataKey="fecha" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }} />
                <Legend />
                <Line type="monotone" dataKey="dinero_ganado" name="Ganancia (€)" stroke="#16a34a" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="entradas_vendidas" name="Entradas (Uds)" stroke="#2563eb" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PELÍCULAS MÁS VENDIDAS (TOP) */}
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Top 5 Películas</h3>
            <p className="text-xs text-gray-400">Las películas preferidas por los espectadores</p>
          </div>
          <div className="w-full h-72 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topPeliculas} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="opacity-30" />
                <XAxis type="number" stroke="#94a3b8" />
                <YAxis dataKey="titulo" type="category" stroke="#94a3b8" width={90} className="font-medium" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', color: '#fff', borderRadius: '8px', border: 'none' }} />
                <Legend />
                <Bar dataKey="entradas_compradas" name="Entradas vendidas" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  )
}