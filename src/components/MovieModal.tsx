import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// --- Interfaces ---
interface Pelicula {
  idpelicula: number;
  titulo: string;
  genero: string;
  duracion: number;
  posterurl: string;
  sinopsis: string;
}

interface Exhibicion {
  idexhibicion: number;
  fecha: string;
  horainicio: string;
  idsala: number;
  preciobase: number;
  sala: { nombresala: string };
}

interface Asiento {
  idasiento: number;
  idsala: number;
  fila: number;
  numasiento: number;
}

interface MovieModalProps {
  pelicula: Pelicula;
  onClose: () => void;
}

export default function MovieModal({ pelicula, onClose }: MovieModalProps) {
  const [vistaModal, setVistaModal] = useState<'info' | 'horarios' | 'butacas'>('info')
  const [exhibiciones, setExhibiciones] = useState<Exhibicion[]>([])
  const [exhibicionSeleccionada, setExhibicionSeleccionada] = useState<Exhibicion | null>(null)
  const [cargandoSesiones, setCargandoSesiones] = useState(false)

  const [asientos, setAsientos] = useState<Asiento[]>([])
  const [asientosOcupados, setAsientosOcupados] = useState<number[]>([])
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<number[]>([])
  const [procesandoCompra, setProcesandoCompra] = useState(false)

  const cargarHorarios = async () => {
    setCargandoSesiones(true)
    setVistaModal('horarios')
    
    const { data } = await supabase
      .from('exhibicion')
      .select(`idexhibicion, fecha, horainicio, preciobase, idsala, sala ( nombresala )`)
      .eq('idpelicula', pelicula.idpelicula)
      .order('fecha', { ascending: true })
      .order('horainicio', { ascending: true })

    if (data) setExhibiciones(data as any)
    setCargandoSesiones(false)
  }

  const seleccionarExhibicion = async (ex: Exhibicion) => {
    setExhibicionSeleccionada(ex)
    setVistaModal('butacas')
    setAsientosSeleccionados([])

    const { data: datosAsientos } = await supabase.from('asiento').select('*').eq('idsala', ex.idsala).order('fila').order('numasiento')
    if (datosAsientos) setAsientos(datosAsientos)

    const { data: datosEntradas } = await supabase.from('entrada').select('idasiento').eq('idexhibicion', ex.idexhibicion)
    if (datosEntradas) setAsientosOcupados(datosEntradas.map(e => e.idasiento))
  }

  const toggleAsiento = (idasiento: number) => {
    if (asientosOcupados.includes(idasiento)) return
    setAsientosSeleccionados(prev => prev.includes(idasiento) ? prev.filter(id => id !== idasiento) : [...prev, idasiento])
  }

  const realizarCompra = async () => {
    if (asientosSeleccionados.length === 0 || !exhibicionSeleccionada) return
    setProcesandoCompra(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("Debes iniciar sesión para comprar.")
      setProcesandoCompra(false)
      return
    }

    const { data: datosUsuario } = await supabase.from('usuario').select('idusuario').eq('email', user.email).single()
    if (!datosUsuario) return

    const entradasAInsertar = asientosSeleccionados.map(idasiento => ({
      idexhibicion: exhibicionSeleccionada.idexhibicion,
      idusuario: datosUsuario.idusuario,
      idasiento: idasiento,
      fechacompra: new Date().toISOString(),
      preciofinal: exhibicionSeleccionada.preciobase,
      estado: 'Confirmada',
      tipocompra: 'Online',
      comprobanteurl: `/ticket/${crypto.randomUUID()}`
    }))

    const { error } = await supabase.from('entrada').insert(entradasAInsertar)
    if (error) alert("Error: " + error.message)
    else { alert("¡Compra realizada!"); onClose(); }
    
    setProcesandoCompra(false)
  }

  const filasDeAsientos = Array.from(new Set(asientos.map(a => a.fila))).sort((a, b) => a - b)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md transition-colors duration-300">
      <div className="bg-white dark:bg-gray-900 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col relative animate-fade-in text-gray-900 dark:text-white shadow-2xl transition-colors">
        
        {/* Botón Cerrar */}
        <button onClick={onClose} className="absolute top-4 right-4 z-20 bg-gray-100 dark:bg-black/50 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 rounded-full p-2 transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="overflow-y-auto">
          {/* Header del Modal con efecto Glass */}
          <div className="relative h-[200px] w-full">
            <img src={pelicula.posterurl} className="w-full h-full object-cover opacity-30 dark:opacity-20 blur-md" alt="" />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
            <div className="absolute bottom-0 p-8">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">{pelicula.titulo}</h1>
              {vistaModal !== 'info' && (
                <button onClick={() => vistaModal === 'butacas' ? setVistaModal('horarios') : setVistaModal('info')} className="text-blue-600 dark:text-blue-400 text-sm font-bold mt-2 hover:underline transition-all">
                  ← Volver atrás
                </button>
              )}
            </div>
          </div>

          {/* Cuerpo del Modal */}
          <div className="p-8">
            {vistaModal === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <h2 className="text-xl font-bold text-blue-600 dark:text-blue-500 mb-4 uppercase tracking-wider text-sm">Sinopsis</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{pelicula.sinopsis}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-fit transition-colors">
                  <h3 className="font-bold mb-4 text-gray-900 dark:text-white">¿Quieres verla?</h3>
                  <button onClick={cargarHorarios} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold shadow-lg shadow-blue-600/20 transition-all active:scale-95">Comprar Entradas</button>
                </div>
              </div>
            )}

            {vistaModal === 'horarios' && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold text-blue-600 dark:text-blue-500 mb-6 uppercase tracking-wider text-sm">Sesiones Disponibles</h2>
                {cargandoSesiones ? (
                  <p className="text-gray-500 dark:text-gray-400 animate-pulse">Buscando horarios...</p>
                ) : exhibiciones.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exhibiciones.map((ex) => (
                      <button key={ex.idexhibicion} onClick={() => seleccionarExhibicion(ex)} className="bg-white dark:bg-gray-800 hover:border-blue-500 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 p-4 rounded-xl text-left transition-all shadow-sm">
                        <div className="text-blue-600 dark:text-blue-400 font-bold text-lg">{ex.horainicio.substring(0, 5)} h</div>
                        <div className="text-gray-900 dark:text-white text-sm font-medium">{new Date(ex.fecha).toLocaleDateString()}</div>
                        <div className="text-gray-500 dark:text-gray-400 text-xs mt-2 uppercase">{ex.sala.nombresala} • <span className="text-green-600 dark:text-green-500 font-bold">{ex.preciobase}€</span></div>
                      </button>
                    ))}
                  </div>
                ) : <p className="text-gray-500 dark:text-gray-400 italic">No hay sesiones programadas.</p>}
              </div>
            )}

            {vistaModal === 'butacas' && exhibicionSeleccionada && (
              <div className="animate-fade-in flex flex-col lg:grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 flex flex-col items-center transition-colors">
                  {/* Pantalla simulada */}
                  <div className="w-full max-w-sm h-1.5 bg-gray-300 dark:bg-blue-500 rounded-full mb-12 shadow-[0_4px_20px_rgba(59,130,246,0.3)]"></div>
                  
                  <div className="flex flex-col gap-3 overflow-x-auto w-full items-center py-4">
                    {filasDeAsientos.map(fila => (
                      <div key={`fila-${fila}`} className="flex items-center gap-4 shrink-0">
                        <span className="text-gray-400 dark:text-gray-600 text-[10px] font-black w-4 text-right uppercase">F{fila}</span>
                        <div className="flex gap-2">
                          {asientos.filter(a => a.fila === fila).map(asiento => {
                            const ocupado = asientosOcupados.includes(asiento.idasiento)
                            const seleccionado = asientosSeleccionados.includes(asiento.idasiento)
                            return (
                              <button 
                                key={asiento.idasiento} 
                                onClick={() => toggleAsiento(asiento.idasiento)} 
                                disabled={ocupado}
                                title={`Fila ${asiento.fila}, Asiento ${asiento.numasiento}`}
                                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-t-lg transition-all text-[10px] font-bold border-b-4 
                                  ${ocupado 
                                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed border-gray-300 dark:border-gray-900' 
                                    : seleccionado 
                                      ? 'bg-blue-600 text-white shadow-lg border-blue-800 scale-110 -translate-y-1' 
                                      : 'bg-white dark:bg-gray-600 text-gray-400 dark:text-transparent hover:text-blue-600 dark:hover:text-white border-gray-300 dark:border-gray-800 hover:border-blue-400'
                                  }`}
                              >
                                {asiento.numasiento}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Leyenda */}
                  <div className="flex gap-6 mt-8 text-xs font-bold text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-800 rounded-sm"></div> Libre</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-600 rounded-sm"></div> Elegido</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-200 dark:bg-gray-700 rounded-sm"></div> Ocupado</div>
                  </div>
                </div>

                <div className="w-full">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm transition-colors sticky top-0">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">Resumen de compra</h3>
                    <div className="space-y-2 mb-6">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Asientos: <span className="text-gray-900 dark:text-white font-bold">{asientosSeleccionados.length}</span></p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Precio unidad: <span className="text-gray-900 dark:text-white font-bold">{exhibicionSeleccionada.preciobase}€</span></p>
                    </div>
                    <p className="text-xs text-gray-400 uppercase font-black">Total a pagar:</p>
                    <p className="text-3xl font-black text-green-600 dark:text-green-500 mb-6 transition-colors">{(asientosSeleccionados.length * exhibicionSeleccionada.preciobase).toFixed(2)}€</p>
                    <button 
                      onClick={realizarCompra} 
                      disabled={asientosSeleccionados.length === 0 || procesandoCompra} 
                      className={`w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest transition-all shadow-lg 
                        ${asientosSeleccionados.length === 0 
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed shadow-none' 
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'}`}
                    >
                      {procesandoCompra ? 'Procesando...' : 'Confirmar Reserva'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}