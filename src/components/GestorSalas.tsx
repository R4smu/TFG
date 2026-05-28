import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Sala {
  idsala: number;
  nombresala: string;
  capacidad: number;
  activa: boolean;
}

export default function GestorSalas() {
  const [salas, setSalas] = useState<Sala[]>([])
  const [cargando, setCargando] = useState(true)
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [procesando, setProcesando] = useState(false)

  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 8

  const [formData, setFormData] = useState({
    idsala: 0,
    nombresala: '',
    filas: 5,
    asientosPorFila: 10
  })

  const cargarSalas = async () => {
    setCargando(true)
    const { data, error } = await supabase.from('sala').select('*').order('idsala')
    if (data) setSalas(data as Sala[])
    if (error) console.error("Error al cargar salas:", error.message)
    setCargando(false)
  }

  useEffect(() => {
    cargarSalas()
  }, [])

  const totalPaginas = Math.ceil(salas.length / itemsPorPagina)
  if (paginaActual > totalPaginas && totalPaginas > 0) {
    setPaginaActual(totalPaginas)
  }
  
  const indiceUltimoItem = paginaActual * itemsPorPagina
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina
  const salasPaginadas = salas.slice(indicePrimerItem, indiceUltimoItem)

  const abrirParaCrear = () => {
    setFormData({ idsala: 0, nombresala: '', filas: 5, asientosPorFila: 10 })
    setModoEdicion(false)
    setModalAbierto(true)
  }

  const abrirParaEditar = (sala: Sala) => {
    setFormData({ idsala: sala.idsala, nombresala: sala.nombresala, filas: 0, asientosPorFila: 0 })
    setModoEdicion(true)
    setModalAbierto(true)
  }

  const toggleEstadoSala = async (sala: Sala) => {
    const accion = sala.activa ? "dar de BAJA (desactivar)" : "dar de ALTA (activar)"
    if (!window.confirm(`¿Seguro que quieres ${accion} la ${sala.nombresala}?`)) return

    const { error } = await supabase.from('sala').update({ activa: !sala.activa }).eq('idsala', sala.idsala)
    if (error) alert("Error al cambiar estado: " + error.message)
    else cargarSalas()
  }

  const guardarSala = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)

    try {
      if (modoEdicion) {
        const { error } = await supabase.from('sala').update({ nombresala: formData.nombresala }).eq('idsala', formData.idsala)
        if (error) throw error
      } else {
        const capacidadTotal = formData.filas * formData.asientosPorFila;
        const { data: nuevaSalaData, error: salaError } = await supabase
          .from('sala')
          .insert([{ nombresala: formData.nombresala, capacidad: capacidadTotal, activa: true }])
          .select()
          .single()
          
        if (salaError) throw salaError

        const nuevosAsientos = []
        for (let fila = 1; fila <= formData.filas; fila++) {
          for (let asiento = 1; asiento <= formData.asientosPorFila; asiento++) {
            nuevosAsientos.push({
              idsala: nuevaSalaData.idsala,
              fila: fila,
              numasiento: asiento
            })
          }
        }

        const { error: asientosError } = await supabase.from('asiento').insert(nuevosAsientos)
        if (asientosError) throw asientosError
        
        setPaginaActual(Math.ceil((salas.length + 1) / itemsPorPagina))
      }

      setModalAbierto(false)
      cargarSalas()
    } catch (error: any) {
      alert("Hubo un error guardando la sala: " + error.message)
    } finally {
      setProcesando(false)
    }
  }

  if (cargando) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-20 flex flex-col justify-center items-center shadow-md transition-colors">
        <img src="/rollopeli.gif" alt="Cargando" className="w-20 h-20 mb-4 drop-shadow-md" />
        <p className="text-lg font-bold text-blue-600 dark:text-blue-500 animate-pulse tracking-wide">
          Cargando salas...
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md transition-colors duration-300">
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Gestión de Salas</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 transition-colors">Añade nuevos espacios o deshabilita salas en mantenimiento.</p>
        </div>
        <button onClick={abrirParaCrear} className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm text-sm">
          <span>+</span> Nueva Sala
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-inner transition-colors">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider transition-colors">
              <th className="p-4 font-bold whitespace-nowrap">ID</th>
              <th className="p-4 font-bold whitespace-nowrap">Nombre de la Sala</th>
              <th className="p-4 font-bold text-center whitespace-nowrap">Capacidad</th>
              <th className="p-4 font-bold text-center whitespace-nowrap">Estado</th>
              <th className="p-4 font-bold text-right whitespace-nowrap">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm transition-colors">
            {salasPaginadas.map(sala => (
              <tr key={sala.idsala} className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!sala.activa ? 'opacity-60 bg-gray-50 dark:bg-gray-900/30' : 'bg-white dark:bg-transparent'}`}>
                <td className="p-4 text-gray-400 font-mono whitespace-nowrap">#{sala.idsala}</td>
                <td className="p-4 font-bold text-gray-900 dark:text-white whitespace-nowrap">{sala.nombresala}</td>
                <td className="p-4 text-center text-gray-600 dark:text-gray-300 whitespace-nowrap">{sala.capacidad} butacas</td>
                <td className="p-4 text-center whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${sala.activa ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {sala.activa ? 'Operativa' : 'De Baja'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end items-center gap-2">
                    <button onClick={() => abrirParaEditar(sala)} className="cursor-pointer bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors font-semibold text-xs">
                      Renombrar
                    </button>
                    <button onClick={() => toggleEstadoSala(sala)} className={`cursor-pointer px-3 py-1.5 rounded-lg transition-colors font-semibold text-xs ${sala.activa ? 'bg-orange-100 text-orange-700 hover:bg-orange-600 hover:text-white dark:bg-orange-900/30 dark:text-orange-400' : 'bg-green-100 text-green-700 hover:bg-green-600 hover:text-white dark:bg-green-900/30 dark:text-green-400'}`}>
                      {sala.activa ? 'Dar de Baja' : 'Dar de Alta'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
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
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
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

      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/80 backdrop-blur-sm transition-colors">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl transition-colors overflow-hidden">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{modoEdicion ? 'Renombrar Sala' : 'Configurar Nueva Sala'}</h3>
              <button onClick={() => setModalAbierto(false)} className="cursor-pointer text-gray-400 hover:text-gray-900 dark:hover:text-white w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 transition-colors">✕</button>
            </div>
            
            <form onSubmit={guardarSala} className="p-6 space-y-5">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 font-bold mb-1.5">Nombre de la Sala</label>
                <input required type="text" value={formData.nombresala} onChange={e => setFormData({...formData, nombresala: e.target.value})} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors text-sm" placeholder="Ej: Sala 2 - IMAX" />
              </div>

              {!modoEdicion && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-4 rounded-xl">
                    <p className="text-xs text-blue-800 dark:text-blue-300 mb-4 font-medium leading-relaxed">
                      El sistema generará automáticamente la plantilla de butacas para esta sala basándose en estos datos.
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 font-bold mb-1.5">Filas Totales</label>
                        <input required type="number" min="1" max="50" value={formData.filas} onChange={e => setFormData({...formData, filas: parseInt(e.target.value) || 0})} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2 text-gray-900 dark:text-white text-sm" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 font-bold mb-1.5">Butacas por Fila</label>
                        <input required type="number" min="1" max="50" value={formData.asientosPorFila} onChange={e => setFormData({...formData, asientosPorFila: parseInt(e.target.value) || 0})} className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-xl p-2 text-gray-900 dark:text-white text-sm" />
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs font-bold text-gray-500 dark:text-gray-400">
                    Capacidad calculada: <span className="text-blue-600 dark:text-blue-400 text-sm">{formData.filas * formData.asientosPorFila} butacas</span>
                  </div>
                </>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setModalAbierto(false)} className="cursor-pointer px-4 py-2.5 text-gray-600 dark:text-gray-400 text-sm font-bold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors">Cancelar</button>
                <button type="submit" disabled={procesando} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors disabled:opacity-50 flex items-center gap-2">
                  {procesando ? 'Procesando...' : (modoEdicion ? 'Guardar Cambios' : 'Crear Sala y Butacas')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}