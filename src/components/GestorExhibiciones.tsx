import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Pelicula {
  idpelicula: number;
  titulo: string;
}

interface Sala {
  idsala: number;
  nombresala: string;
  capacidad: number;
}

interface Exhibicion {
  idexhibicion: number;
  fecha: string;
  horainicio: string;
  preciobase: number;
  descuento_porcentaje: number;
  sala: { nombresala: string };
}

interface GestorExhibicionesProps {
  pelicula: Pelicula;
  onClose: () => void;
}

export default function GestorExhibiciones({ pelicula, onClose }: GestorExhibicionesProps) {
  const [exhibiciones, setExhibiciones] = useState<Exhibicion[]>([])
  const [salas, setSalas] = useState<Sala[]>([])
  const [cargando, setCargando] = useState(true)
  const [procesando, setProcesando] = useState(false)

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 9

  const fechaHoy = new Date().toISOString().split('T')[0]

  const [formData, setFormData] = useState({
    fecha: fechaHoy,
    horainicio: '18:00',
    idsala: '',
    preciobase: 7.50,
    descuento_porcentaje: 0
  })

  const cargarDatos = async () => {
    setCargando(true)
    
    const { data: dataSalas } = await supabase.from('sala').select('*').eq('activa', true).order('idsala')
    
    if (dataSalas) {
      setSalas(dataSalas)
      if (dataSalas.length > 0 && !formData.idsala) {
        setFormData(prev => ({ ...prev, idsala: dataSalas[0].idsala.toString() }))
      }
    }

    const { data: dataExhib } = await supabase
      .from('exhibicion')
      .select('idexhibicion, fecha, horainicio, preciobase, descuento_porcentaje, sala(nombresala)') 
      .eq('idpelicula', pelicula.idpelicula)
      .order('fecha')
      .order('horainicio')

    if (dataExhib) setExhibiciones(dataExhib as any[])
    setCargando(false)
  }

  useEffect(() => {
    cargarDatos()
  }, [pelicula.idpelicula])

  const totalPaginas = Math.ceil(exhibiciones.length / itemsPorPagina)
  if (paginaActual > totalPaginas && totalPaginas > 0) setPaginaActual(totalPaginas)

  const indiceUltimoItem = paginaActual * itemsPorPagina
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina
  const exhibicionesPaginadas = exhibiciones.slice(indicePrimerItem, indiceUltimoItem)

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const crearExhibicion = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)

    const fechaHoraActual = new Date()
    const fechaHoraElegida = new Date(`${formData.fecha}T${formData.horainicio}`)

    if (fechaHoraElegida < fechaHoraActual) {
      alert("Error: No se pueden crear sesiones para una fecha u hora que ya han pasado.")
      setProcesando(false)
      return
    }

    const nuevaExhibicion = {
      idpelicula: pelicula.idpelicula,
      idsala: parseInt(formData.idsala),
      fecha: formData.fecha,
      horainicio: formData.horainicio,
      preciobase: parseFloat(formData.preciobase.toString()),
      descuento_porcentaje: parseInt(formData.descuento_porcentaje.toString()) || 0
    }

    const { error } = await supabase.from('exhibicion').insert([nuevaExhibicion])
    if (error) {
      alert("Error al crear sesión: " + error.message)
    } else {
      cargarDatos()
    }
    
    setProcesando(false)
  }

  const borrarExhibicion = async (id: number) => {
    if (!window.confirm("¿Seguro que quieres borrar esta sesión? Se cancelarán todas las entradas vendidas para ella.")) return
    const { error } = await supabase.from('exhibicion').delete().eq('idexhibicion', id)
    if (error) alert("Error al borrar: " + error.message)
    else cargarDatos()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-2xl animate-fade-in transition-colors">
        
        {/* Header del Modal */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10 shrink-0 transition-colors">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">Sesiones programadas</h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm mt-1 font-medium transition-colors">{pelicula.titulo}</p>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Formulario de Nueva Sesión */}
          <div className="bg-gray-50 dark:bg-gray-800 p-5 rounded-xl border border-gray-200 dark:border-gray-700 transition-colors">
            <h4 className="text-sm uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-4 transition-colors">Añadir nueva sesión</h4>
            <form onSubmit={crearExhibicion} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 transition-colors">Fecha</label>
                <input required type="date" name="fecha" min={fechaHoy} value={formData.fecha} onChange={manejarCambio} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 [color-scheme:light_dark] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 transition-colors">Hora</label>
                <input required type="time" name="horainicio" value={formData.horainicio} onChange={manejarCambio} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 [color-scheme:light_dark] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 transition-colors">Sala</label>
                <select required name="idsala" value={formData.idsala} onChange={manejarCambio} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors">
                  {salas.map(sala => (
                    <option key={sala.idsala} value={sala.idsala}>{sala.nombresala}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 transition-colors">Precio (€)</label>
                <input required type="number" step="0.10" name="preciobase" value={formData.preciobase} onChange={manejarCambio} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 transition-colors">% Desc.</label>
                <input required type="number" min="0" max="100" name="descuento_porcentaje" value={formData.descuento_porcentaje} onChange={manejarCambio} className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 transition-colors" title="Dejar en 0 si no hay oferta" />
              </div>

              <button type="submit" disabled={procesando || salas.length === 0} className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">
                {procesando ? '...' : '+ Añadir'}
              </button>
            </form>
          </div>

          {/* Lista de Sesiones Existentes */}
          <div>
            <h4 className="text-sm uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400 mb-4 transition-colors">Horarios actuales</h4>
            {cargando ? (
              <p className="text-gray-500 text-sm">Cargando sesiones...</p>
            ) : exhibiciones.length === 0 ? (
              <p className="text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10 p-4 rounded-lg text-sm border border-yellow-200 dark:border-yellow-500/20 transition-colors">No hay ninguna sesión programada para esta película. No aparecerá en la cartelera de compra hasta que añadas al menos una.</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {exhibicionesPaginadas.map(ex => {
                    const tieneDescuento = ex.descuento_porcentaje > 0;
                    const precioFinal = ex.preciobase - (ex.preciobase * (ex.descuento_porcentaje / 100));

                    return (
                      <div key={ex.idexhibicion} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-xl flex justify-between items-center group hover:border-blue-500 dark:hover:border-gray-500 transition-colors shadow-sm">
                        <div>
                          <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2 transition-colors">
                            {new Date(ex.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                            <span className="text-blue-600 dark:text-blue-400">{ex.horainicio.substring(0, 5)}</span>
                          </p>
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 transition-colors flex items-center gap-1.5">
                            <span>{ex.sala.nombresala}</span>
                            <span>•</span>
                            
                            {tieneDescuento ? (
                              <span className="flex items-center gap-1.5">
                                <span className="line-through opacity-60">{ex.preciobase}€</span>
                                <span className="font-bold text-green-600 dark:text-green-400">{precioFinal.toFixed(2)}€</span>
                                <span className="bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 px-1.5 py-0.5 rounded text-[10px] font-bold">
                                  -{ex.descuento_porcentaje}%
                                </span>
                              </span>
                            ) : (
                              <span>{ex.preciobase}€</span>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => borrarExhibicion(ex.idexhibicion)} 
                          className="cursor-pointer text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-500 dark:hover:bg-red-500/10 p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Borrar sesión"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    )
                  })}
                </div>

                {totalPaginas > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
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
              </>
            )}
          </div>
          
        </div>
      </div>
    </div>
  )
}