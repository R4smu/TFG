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
  dinero_recaudado?: number;
}

export default function DashboardAdmin() {
  const [datosDiarios, setDatosDiarios] = useState<DatosDiarios[]>([])
  const [topPeliculas, setTopPeliculas] = useState<DatosTopPeliculas[]>([])
  const [cargando, setCargando] = useState(true)

  const [animarGraficas, setAnimarGraficas] = useState(false)

  const [totales, setTotales] = useState({ 
    ingresos: 0, 
    entradas: 0, 
    peliTop: { titulo: '—', entradas: 0, ingresos: 0 } 
  })

  const coloresGrafico = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

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
          setTotales(prev => ({ 
            ...prev, 
            peliTop: {
              titulo: topPelis[0].titulo,
              entradas: topPelis[0].entradas_compradas,
              ingresos: topPelis[0].dinero_recaudado || 0
            } 
          }))
        }
      }

      setCargando(false)
    }

    cargarAnaliticas()
  }, [])

  useEffect(() => {
    if (!cargando) {
      const timer = setTimeout(() => setAnimarGraficas(true), 150)
      return () => clearTimeout(timer)
    }
  }, [cargando])

  if (cargando) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-20 flex flex-col justify-center items-center shadow-md transition-colors w-full h-[60vh]">
        <img src="/rollopeli.gif" alt="Cargando" className="w-20 h-20 mb-4 drop-shadow-md" />
        <p className="text-lg font-bold text-blue-600 dark:text-blue-500 animate-pulse tracking-wide">
          Cargando analíticas del cine...
        </p>
      </div>
    )
  }

  const maxDinero = datosDiarios.length > 0 ? Math.max(...datosDiarios.map(d => d.dinero_ganado)) : 0;
  const totalEntradasTop = topPeliculas.reduce((acc, curr) => acc + curr.entradas_compradas, 0);

  let porcentajeAcumuladoSVG = 0;

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-100 dark:bg-green-900/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider relative z-10">Caja Total Acumulada</p>
          <p className="text-3xl font-black text-green-600 dark:text-green-400 mt-1 relative z-10">{totales.ingresos.toFixed(2)}€</p>
          <p className="text-[10px] text-gray-400 mt-1 relative z-10">Suma de todas las entradas online registradas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider relative z-10">Entradas Vendidas</p>
          <p className="text-3xl font-black text-blue-600 dark:text-blue-400 mt-1 relative z-10">{totales.entradas} <span className="text-lg">tickets</span></p>
          <p className="text-[10px] text-gray-400 mt-1 relative z-10">Volumen total de espectadores en salas</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-100 dark:bg-purple-900/20 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
          <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider relative z-10 flex items-center gap-2">
            Mayor Éxito Comercial
          </p>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1 truncate relative z-10" title={totales.peliTop.titulo}>{totales.peliTop.titulo}</p>
          
          {/* COMBINACIÓN DE TICKETS Y RECAUDACIÓN */}
          <div className="flex gap-4 mt-2 relative z-10">
            <p className="text-sm font-bold text-blue-500 flex items-center gap-1">
              Entradas: {totales.peliTop.entradas}
            </p>
            <p className="text-sm font-bold text-green-500 flex items-center gap-1">
              Ingresos: {totales.peliTop.ingresos.toFixed(2)}€
            </p>
          </div>
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
                      
                      {/* BARRA ANIMADA DESDE ABAJO */}
                      <div 
                        className="w-full max-w-[40px] bg-blue-500 hover:bg-blue-400 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-t-md transition-all duration-[1500ms] ease-out origin-bottom"
                        style={{ 
                          height: animarGraficas ? `${heightPorcentaje}%` : '0%', 
                          minHeight: animarGraficas ? '4px' : '0px'
                        }}
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
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors flex flex-col">
          <div className="mb-2">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Top Películas</h3>
            <p className="text-xs text-gray-400">Ranking por volumen de tickets vendidos</p>
          </div>
          
          {topPeliculas.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-10 flex-1 flex items-center justify-center">No hay entradas vendidas todavía.</p>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 flex-1 mt-4">
              
              {/* GRÁFICO CIRCULAR */}
              <div className="relative w-40 h-40 shrink-0">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-3xl font-black text-gray-900 dark:text-white leading-none">{totales.entradas}</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total</span>
                </div>
                
                <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90 drop-shadow-md">
                  <circle cx="21" cy="21" r="15.91549431" fill="transparent" stroke="currentColor" className="text-gray-100 dark:text-gray-700" strokeWidth="6"></circle>
                  
                  {topPeliculas.map((peli, index) => {
                    const porcentaje = totalEntradasTop > 0 ? (peli.entradas_compradas / totalEntradasTop) * 100 : 0;
                    const offset = porcentajeAcumuladoSVG;
                    porcentajeAcumuladoSVG += porcentaje;
                    
                    return (
                      <circle 
                        key={`circle-${peli.titulo}`}
                        cx="21" cy="21" r="15.91549431" 
                        fill="transparent" 
                        stroke={coloresGrafico[index % coloresGrafico.length]} 
                        strokeWidth="6"
                        strokeDasharray={`${animarGraficas ? porcentaje : 0} ${animarGraficas ? 100 - porcentaje : 100}`}
                        strokeDashoffset={-offset}
                        className="transition-all duration-[1500ms] ease-out"
                        strokeLinecap="round"
                      ></circle>
                    )
                  })}
                </svg>
              </div>

              {/* LEYENDA LATERAL */}
              <div className="flex-1 w-full space-y-3">
                {topPeliculas.map((peli, index) => (
                  <div key={`legend-${peli.titulo}`} className="flex justify-between items-center text-xs group">
                    <div className="flex items-center gap-3 truncate pr-4">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-150" 
                        style={{ backgroundColor: coloresGrafico[index % coloresGrafico.length] }}
                      ></span>
                      <span className="font-bold text-gray-800 dark:text-gray-200 truncate" title={peli.titulo}>
                        {peli.titulo}
                      </span>
                    </div>
                    <span className="text-gray-500 font-bold shrink-0">{peli.entradas_compradas} tkts</span>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  )
}