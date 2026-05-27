import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import GestorExhibiciones from './GestorExhibiciones'

interface Pelicula {
  idpelicula: number;
  titulo: string;
  genero: string;
  duracion: number;
  posterurl: string;
  trailerurl: string; 
  sinopsis: string;
  director: string;
  clasificacionedad: string;
  fechasalida: string;
  idusuario?: number;
}

export default function GestorPeliculas() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([])
  const [cargando, setCargando] = useState(true)
  const [idAdmin, setIdAdmin] = useState<number | null>(null)

  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [formData, setFormData] = useState<Partial<Pelicula>>({})
  const [procesando, setProcesando] = useState(false)
  const [peliculaParaExhibiciones, setPeliculaParaExhibiciones] = useState<Pelicula | null>(null)

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 8

  useEffect(() => {
    const inicializarPanel = async () => {
      setCargando(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: userData } = await supabase.from('usuario').select('idusuario').eq('email', user.email).single()
        if (userData) setIdAdmin(userData.idusuario)
      }
      const { data: pelisData } = await supabase.from('pelicula').select('*').order('idpelicula', { ascending: false })
      if (pelisData) setPeliculas(pelisData)
      setCargando(false)
    }
    inicializarPanel()
  }, [])

  const totalPaginas = Math.ceil(peliculas.length / itemsPorPagina)
  if (paginaActual > totalPaginas && totalPaginas > 0) setPaginaActual(totalPaginas)

  const indiceUltimoItem = paginaActual * itemsPorPagina
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina
  const peliculasPaginadas = peliculas.slice(indicePrimerItem, indiceUltimoItem)

  const abrirModalCrear = () => {
    const fechaHoy = new Date().toISOString().split('T')[0]
    setFormData({ titulo: '', genero: '', duracion: 120, posterurl: '', trailerurl: '', sinopsis: '', director: '', clasificacionedad: '+7', fechasalida: fechaHoy })
    setModoEdicion(false)
    setModalAbierto(true)
  }

  const abrirModalEditar = (pelicula: Pelicula) => {
    setFormData(pelicula)
    setModoEdicion(true)
    setModalAbierto(true)
  }

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const guardarPelicula = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)

    if (modoEdicion) {
      const { idpelicula, ...datosAActualizar } = formData as Pelicula;
      const { data, error } = await supabase.from('pelicula').update(datosAActualizar).eq('idpelicula', idpelicula).select()
      if (error) alert("Error al actualizar: " + error.message)
      else if (data && data.length === 0) alert("Ojo: No se ha actualizado nada (Revisa las RLS).");
    } else {
      if (!idAdmin) { alert("Error de sesión: No se ha podido identificar tu ID de administrador."); setProcesando(false); return; }
      const peliculaACrear = { ...formData, idusuario: idAdmin }
      const { error } = await supabase.from('pelicula').insert([peliculaACrear])
      if (error) alert("Error al crear: " + error.message)
      else setPaginaActual(1)
    }

    setProcesando(false)
    setModalAbierto(false)
    const { data: pelisData } = await supabase.from('pelicula').select('*').order('idpelicula', { ascending: false })
    if (pelisData) setPeliculas(pelisData)
  }

  const eliminarPelicula = async (id: number) => {
    if (!window.confirm("¿Estás seguro de eliminar esta película? Se borrarán sus horarios y entradas asociadas.")) return
    const { error } = await supabase.from('pelicula').delete().eq('idpelicula', id)
    if (error) alert("Error al eliminar: " + error.message)
    else {
      const { data: pelisData } = await supabase.from('pelicula').select('*').order('idpelicula', { ascending: false })
      if (pelisData) setPeliculas(pelisData)
    }
  }

  if (cargando) return <div className="text-gray-500 dark:text-gray-400 p-8 text-center transition-colors">Cargando cartelera administrativa...</div>

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-fade-in shadow-md transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Gestión de Cartelera ({peliculas.length})</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm transition-colors">Añade, edita o elimina películas de la base de datos.</p>
        </div>
        <button onClick={abrirModalCrear} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer">
          <span>+</span> Nueva Película
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 transition-colors">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider transition-colors">
              <th className="p-4 rounded-tl-lg font-semibold">Película</th>
              <th className="p-4 font-semibold">Género / Duración</th>
              <th className="p-4 font-semibold">Director</th>
              <th className="p-4 text-right rounded-tr-lg font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm transition-colors">
            {peliculasPaginadas.map(pelicula => (
              <tr key={pelicula.idpelicula} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors bg-white dark:bg-transparent">
                <td className="p-4 flex items-center gap-4">
                  <img src={pelicula.posterurl} alt="poster" className="w-10 h-14 object-cover rounded shadow border border-gray-200 dark:border-gray-700" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white transition-colors">{pelicula.titulo}</p>
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 mr-2 border border-gray-200 dark:border-transparent transition-colors">{pelicula.clasificacionedad}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 transition-colors">Hasta: {new Date(pelicula.fechasalida).toLocaleDateString()}</span>
                  </div>
                </td>
                <td className="p-4 text-gray-700 dark:text-gray-300 transition-colors">{pelicula.genero}<br/><span className="text-gray-500">{pelicula.duracion} min</span></td>
                <td className="p-4 text-gray-700 dark:text-gray-300 transition-colors">{pelicula.director}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => setPeliculaParaExhibiciones(pelicula)} className="bg-purple-100 dark:bg-purple-600/20 text-purple-700 dark:text-purple-400 hover:bg-purple-600 hover:text-white px-3 py-1 rounded transition-colors font-medium cursor-pointer">Sesiones</button>
                  <button onClick={() => abrirModalEditar(pelicula)} className="bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded transition-colors font-medium cursor-pointer">Editar</button>
                  <button onClick={() => eliminarPelicula(pelicula.idpelicula)} className="bg-red-100 dark:bg-red-600/20 text-red-700 dark:text-red-400 hover:bg-red-600 hover:text-white px-3 py-1 rounded transition-colors font-medium cursor-pointer">Borrar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* BOTONERA DE PAGINACIÓN */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} className="cursor-pointer px-3 py-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:no-underline transition-all">
            &lt; Anterior
          </button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
              <button key={num} onClick={() => setPaginaActual(num)} className={`cursor-pointer w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${paginaActual === num ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {num}
              </button>
            ))}
          </div>
          <button onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} className="cursor-pointer px-3 py-1 text-sm font-bold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:no-underline transition-all">
            Siguiente &gt;
          </button>
        </div>
      )}

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/80 backdrop-blur-sm transition-colors">
          <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10 transition-colors">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{modoEdicion ? 'Editar Película' : 'Nueva Película'}</h3>
              <button onClick={() => setModalAbierto(false)} className="cursor-pointer text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
            </div>
            
            <form onSubmit={guardarPelicula} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Título</label>
                  <input required name="titulo" value={formData.titulo || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Director</label>
                  <input required name="director" value={formData.director || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Género</label>
                  <input required name="genero" value={formData.genero || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Duración (minutos)</label>
                  <input required type="number" name="duracion" value={formData.duracion || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Clasificación</label>
                  <input required name="clasificacionedad" value={formData.clasificacionedad || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" placeholder="Ej: +12, TP" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Fecha de Salida</label>
                  <input required type="date" name="fechasalida" value={formData.fechasalida || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors [color-scheme:light_dark]" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">URL del Póster</label>
                  <input required name="posterurl" value={formData.posterurl || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">URL del Tráiler (YouTube)</label>
                  <input required name="trailerurl" value={formData.trailerurl || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Sinopsis</label>
                  <textarea required name="sinopsis" value={formData.sinopsis || ''} onChange={manejarCambioInput} rows={3} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"></textarea>
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800 transition-colors">
                <button type="button" onClick={() => setModalAbierto(false)} className="cursor-pointer px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">Cancelar</button>
                <button type="submit" disabled={procesando} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md transition-colors disabled:opacity-50">
                  {procesando ? 'Guardando...' : 'Guardar Película'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {peliculaParaExhibiciones && (
        <GestorExhibiciones 
          pelicula={peliculaParaExhibiciones} 
          onClose={() => setPeliculaParaExhibiciones(null)} 
        />
      )}
    </div>
  )
}