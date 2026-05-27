import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

export default function MisEntradas() {
  const [entradas, setEntradas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 6
  
  const [filtroTexto, setFiltroTexto] = useState('')
  const [ordenarPor, setOrdenarPor] = useState<'fecha' | 'precio' | 'titulo'>('fecha')
  const [ordenAscendente, setOrdenAscendente] = useState(false) // Por defecto descendente (más recientes primero)

  useEffect(() => {
    const cargarMisEntradas = async () => {
      setCargando(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: userData } = await supabase.from('usuario').select('idusuario').eq('email', user.email).single()
      if (!userData) return

      const { data, error } = await supabase
        .from('entrada')
        .select(`
          identrada, fechacompra, estado, preciofinal,
          exhibicion ( fecha, horainicio, pelicula ( titulo, posterurl ) )
        `)
        .eq('idusuario', userData.idusuario)

      if (data) setEntradas(data)
      if (error) console.error("Error cargando entradas:", error.message)
      
      setCargando(false)
    }

    cargarMisEntradas()
  }, [])

  const entradasProcesadas = [...entradas]
    .filter(entrada => {
      if (!filtroTexto) return true;
      const peli = Array.isArray(entrada.exhibicion.pelicula) ? entrada.exhibicion.pelicula[0] : entrada.exhibicion.pelicula;
      return peli.titulo.toLowerCase().includes(filtroTexto.toLowerCase());
    })
    .sort((a, b) => {
      const peliA = Array.isArray(a.exhibicion.pelicula) ? a.exhibicion.pelicula[0] : a.exhibicion.pelicula;
      const peliB = Array.isArray(b.exhibicion.pelicula) ? b.exhibicion.pelicula[0] : b.exhibicion.pelicula;

      let comparacion = 0;
      
      if (ordenarPor === 'fecha') {
        const fechaA = new Date(`${a.exhibicion.fecha}T${a.exhibicion.horainicio}`).getTime();
        const fechaB = new Date(`${b.exhibicion.fecha}T${b.exhibicion.horainicio}`).getTime();
        comparacion = fechaA - fechaB;
      } else if (ordenarPor === 'precio') {
        comparacion = a.preciofinal - b.preciofinal;
      } else if (ordenarPor === 'titulo') {
        comparacion = peliA.titulo.localeCompare(peliB.titulo);
      }

      return ordenAscendente ? comparacion : -comparacion;
    });

  useEffect(() => {
    setPaginaActual(1)
  }, [filtroTexto, ordenarPor, ordenAscendente])

  const totalPaginas = Math.ceil(entradasProcesadas.length / itemsPorPagina)
  if (paginaActual > totalPaginas && totalPaginas > 0) setPaginaActual(totalPaginas)

  const indiceUltimoItem = paginaActual * itemsPorPagina
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina
  const entradasPaginadas = entradasProcesadas.slice(indicePrimerItem, indiceUltimoItem)

  if (cargando) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-center">Buscando tus entradas...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white tracking-tight">Mis Entradas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Aquí tienes el historial de todos tus tickets de cine.</p>
        </div>

        {entradas.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-sm transition-colors">
            <span className="text-5xl block mb-4">🎟️</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Aún no tienes entradas</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 mb-6">Parece que todavía no has comprado ningún ticket.</p>
            <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-colors">Ver Cartelera</Link>
          </div>
        ) : (
          <>
            {/* BARRA DE BÚSQUEDA Y ORDENACIÓN */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
              
              {/* Buscador */}
              <div className="relative w-full sm:w-1/2 md:w-1/3">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Buscar película..." 
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>

              {/* Filtros */}
              <div className="flex w-full sm:w-auto gap-2">
                <select 
                  value={ordenarPor} 
                  onChange={(e) => setOrdenarPor(e.target.value as any)}
                  className="w-full sm:w-auto bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer"
                >
                  <option value="fecha">Fecha de Sesión</option>
                  <option value="titulo">Nombre Película</option>
                  <option value="precio">Precio</option>
                </select>

                <button 
                  onClick={() => setOrdenAscendente(!ordenAscendente)}
                  className="shrink-0 bg-gray-100 hover:bg-gray-200 dark:bg-gray-900 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                  title={ordenAscendente ? "Orden Ascendente" : "Orden Descendente"}
                >
                  <svg className={`w-5 h-5 transition-transform duration-300 ${ordenAscendente ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                  </svg>
                </button>
              </div>

            </div>

            {entradasProcesadas.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No hay entradas que coincidan con tu búsqueda.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {entradasPaginadas.map(entrada => {
                  const peli = Array.isArray(entrada.exhibicion.pelicula) ? entrada.exhibicion.pelicula[0] : entrada.exhibicion.pelicula;
                  
                  const fechaSolo = entrada.exhibicion.fecha.split('T')[0];
                  const [anio, mes, dia] = fechaSolo.split('-');
                  const [hora, minuto] = entrada.exhibicion.horainicio.split(':');
                  
                  const fechaExhibicion = new Date(Number(anio), Number(mes) - 1, Number(dia), Number(hora), Number(minuto));
                  const fechaCaducidad = new Date(fechaExhibicion.getTime() + (3 * 60 * 60 * 1000));
                  const ahora = new Date();
                  
                  const haCaducado = ahora > fechaCaducidad;
                  
                  const estadoLimpio = String(entrada.estado || '').toLowerCase().trim();
                  const esCanceladaDB = estadoLimpio === 'cancelada';

                  const esActiva = !haCaducado && !esCanceladaDB;

                  return (
                    <Link 
                      to={`/ticket/${entrada.identrada}`} 
                      key={entrada.identrada}
                      className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all flex h-40 relative"
                    >
                      {/* Póster */}
                      <div className="w-28 shrink-0 relative overflow-hidden">
                        <img src={peli.posterurl} alt="Poster" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        
                        {/* Sello de Estado */}
                        {!esActiva && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm z-10">
                            <span className="text-white text-[10px] sm:text-xs font-bold uppercase tracking-widest rotate-[-45deg] bg-red-600 px-3 py-1 whitespace-nowrap shadow-md">
                              {esCanceladaDB ? 'Cancelada' : 'Finalizada'}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Contenido de la Tarjeta */}
                      <div className={`p-4 flex flex-col justify-between flex-1 min-w-0 ${!esActiva ? 'opacity-60' : ''}`}>
                        <div>
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded inline-block mb-1.5 ${
                            esActiva 
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                              : esCanceladaDB 
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                          }`}>
                            {esActiva ? (entrada.estado || 'Activa') : haCaducado ? 'Historial' : entrada.estado}
                          </span>
                          <h3 className="font-bold text-gray-900 dark:text-white truncate text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{peli.titulo}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(entrada.exhibicion.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'long' })} • {entrada.exhibicion.horainicio.substring(0, 5)}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-black text-blue-600 dark:text-blue-400">{entrada.preciofinal}€</span>
                          <span className="text-[10px] font-mono text-gray-400">#NV-{entrada.identrada}</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* BOTONERA DE PAGINACIÓN */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="cursor-pointer px-3 py-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:no-underline transition-all"
                >
                  &lt; Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                    <button
                      key={num}
                      onClick={() => setPaginaActual(num)}
                      className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                        paginaActual === num 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="cursor-pointer px-3 py-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:no-underline transition-all"
                >
                  Siguiente &gt;
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}