import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

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

  const maxDinero = datosDiarios.length > 0 ? Math.max(...datosDiarios.map(d => d.dinero_ganado)) : 0;
  const maxEntradasTop = topPeliculas.length > 0 ? Math.max(...topPeliculas.map(p => p.entradas_compradas)) : 0;

  return (
    <div className="space-y-6">
      
      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Caja Total Acumulada</p>
          <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1">{totales.ingresos.toFixed(2)}€</p>
          <p className="text-[10px] text-gray-400 mt-1">Suma de todas las entradas online registradas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Entradas Vendidas</p>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1">{totales.entradas} <span className="text-lg">tickets</span></p>
          <p className="text-[10px] text-gray-400 mt-1">Volumen total de espectadores en salas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors flex flex-col justify-center">
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Mayor Éxito Comercial</p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate" title={totales.peliTop}>{totales.peliTop}</p>
          <p className="text-[10px] text-purple-600 dark:text-purple-400 font-bold mt-1.5 uppercase tracking-widest">Nº1 en Taquilla</p>
        </div>
      </div>

      {/* GRÁFICAS DE ANALÍTICA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* EVOLUCIÓN DIARIA */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Evolución Diaria</h3>
              <p className="text-xs text-gray-400">Recaudación por día de sesión</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-3 h-3 rounded bg-blue-500 inline-block"></span> Ingresos (€)
            </div>
          </div>
          
          <div className="h-64 mt-4">
            {datosDiarios.length === 0 ? (
              <p className="text-gray-500 text-sm h-full flex items-center justify-center">No hay suficientes datos registrados.</p>
            ) : (
              <div className="flex items-end justify-around gap-2 h-full pb-6 border-b border-gray-200 dark:border-gray-700 relative">
                {datosDiarios.map(d => {
                  const heightPorcentaje = maxDinero > 0 ? (d.dinero_ganado / maxDinero) * 100 : 0;
                  
                  return (
                    <div key={d.fecha} className="flex-1 flex flex-col justify-end items-center group relative h-full">
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-12 bg-gray-900 dark:bg-gray-700 text-white text-xs py-1 px-2 rounded shadow-lg pointer-events-none transition-opacity whitespace-nowrap z-10">
                        <span className="font-bold text-green-400">{d.dinero_ganado.toFixed(2)}€</span>
                        <br/>
                        <span className="text-[10px] text-gray-300">{d.entradas_vendidas} tickets</span>
                      </div>
                      
                      <div 
                        className="w-full max-w-[40px] bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-t-md transition-all duration-700 ease-out"
                        style={{ height: `${heightPorcentaje}%`, minHeight: '4px' }}
                      ></div>
                      
                      <span className="text-[10px] font-medium text-gray-400 mt-2 absolute -bottom-6 truncate w-full text-center">
                        {d.fecha.split(' ')[0]}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* PELÍCULAS MÁS VENDIDAS */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
          <div className="mb-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Top Películas</h3>
            <p className="text-xs text-gray-400">Ranking por volumen de tickets vendidos</p>
          </div>
          
          <div className="mt-2 space-y-6">
            {topPeliculas.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-10">No hay entradas vendidas todavía.</p>
            ) : (
              topPeliculas.map((peli, index) => {
                const widthPorcentaje = maxEntradasTop > 0 ? (peli.entradas_compradas / maxEntradasTop) * 100 : 0;
                
                return (
                  <div key={peli.titulo} className="relative group">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="font-bold text-gray-800 dark:text-gray-200 truncate pr-4">
                        <span className="text-purple-500 dark:text-purple-400 mr-2">#{index + 1}</span>
                        {peli.titulo}
                      </span>
                      <span className="text-gray-500 font-bold">{peli.entradas_compradas} tickets</span>
                    </div>
                    
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-3.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-purple-500 dark:bg-purple-600 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${widthPorcentaje}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

      </div>
    </div>
  )
}