import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { Link } from 'react-router-dom'

export default function MisEntradas() {
  const [entradas, setEntradas] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 6

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
        .order('fechacompra', { ascending: false })

      if (data) setEntradas(data)
      if (error) console.error("Error cargando entradas:", error.message)
      
      setCargando(false)
    }

    cargarMisEntradas()
  }, [])

  const totalPaginas = Math.ceil(entradas.length / itemsPorPagina)
  if (paginaActual > totalPaginas && totalPaginas > 0) setPaginaActual(totalPaginas)

  const indiceUltimoItem = paginaActual * itemsPorPagina
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina
  const entradasPaginadas = entradas.slice(indicePrimerItem, indiceUltimoItem)

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entradasPaginadas.map(entrada => {
                const peli = Array.isArray(entrada.exhibicion.pelicula) ? entrada.exhibicion.pelicula[0] : entrada.exhibicion.pelicula;
                const esActiva = entrada.estado === 'Activa' || entrada.estado === 'Comprada';

                return (
                  <Link 
                    to={`/ticket/${entrada.identrada}`} 
                    key={entrada.identrada}
                    className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500 dark:hover:border-blue-500 transition-all flex h-40"
                  >
                    {/* Póster */}
                    <div className="w-28 shrink-0 relative overflow-hidden">
                      <img src={peli.posterurl} alt="Poster" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {!esActiva && <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm"><span className="text-white text-xs font-bold uppercase tracking-widest rotate-[-45deg] bg-red-600 px-3 py-1">Usada</span></div>}
                    </div>

                    {/* Info */}
                    <div className="p-4 flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded inline-block mb-1.5 ${esActiva ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {entrada.estado}
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

            {totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
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