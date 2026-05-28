import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

interface Noticia {
  idnoticia: number;
  titulo: string;
  descripcion: string;
  fechapublicacion: string;
  imagenurl: string;
  orden: number;
  idusuario: number;
}

interface NoticiasModalProps {
  onClose: () => void;
  esadmin: boolean;
}

export default function NoticiasModal({ onClose, esadmin }: NoticiasModalProps) {
  const [noticias, setNoticias] = useState<Noticia[]>([])
  const [cargando, setCargando] = useState(true)
  const [expandidaId, setExpandidaId] = useState<number | null>(null)
  
  const [modalFormAbierto, setModalFormAbierto] = useState(false)
  const [formData, setFormData] = useState<Partial<Noticia>>({})
  const [procesando, setProcesando] = useState(false)
  
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 5

  const [ordenCambiado, setOrdenCambiado] = useState(false)
  const [guardandoOrden, setGuardandoOrden] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const cargarNoticias = async () => {
    setCargando(true)
    const { data, error } = await supabase
      .from('noticia')
      .select('*')
      .order('orden', { ascending: true }) 
      .order('fechapublicacion', { ascending: false })
      
    if (error) {
      console.error("Error al cargar noticias:", error.message)
    } else if (data) {
      setNoticias(data as Noticia[])
    }
    setCargando(false)
  }

  useEffect(() => {
    cargarNoticias()
  }, [])

  const totalPaginas = Math.ceil(noticias.length / itemsPorPagina)
  if (paginaActual > totalPaginas && totalPaginas > 0) setPaginaActual(totalPaginas)

  const indiceUltimoItem = paginaActual * itemsPorPagina
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina
  const noticiasPaginadas = noticias.slice(indicePrimerItem, indiceUltimoItem)

  const handleSort = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    
    const _noticias = [...noticias];
    const draggedItemContent = _noticias.splice(dragItem.current, 1)[0];
    _noticias.splice(dragOverItem.current, 0, draggedItemContent);
    
    dragItem.current = null;
    dragOverItem.current = null;
    
    setNoticias(_noticias);
    setOrdenCambiado(true);
  }

  const guardarOrdenNuevo = async () => {
    setGuardandoOrden(true)
    try {
      for (let i = 0; i < noticias.length; i++) {
        const { error } = await supabase.from('noticia').update({ orden: i }).eq('idnoticia', noticias[i].idnoticia)
        if (error) throw error
      }
      setOrdenCambiado(false)
    } catch (error: any) {
      alert("Error al guardar el nuevo orden: " + error.message)
    } finally {
      setGuardandoOrden(false)
    }
  }

  // --- CRUD ADMINISTRADOR ---
  const abrirParaCrear = () => {
    setFormData({ titulo: '', descripcion: '', fechapublicacion: new Date().toISOString().split('T')[0], imagenurl: '' })
    setModalFormAbierto(true)
  }

  const abrirParaEditar = (e: React.MouseEvent, noticia: Noticia) => {
    e.stopPropagation() 
    setFormData(noticia)
    setModalFormAbierto(true)
  }

  const borrarNoticia = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation()
    if (!window.confirm("¿Seguro que quieres borrar esta noticia?")) return
    
    const { error } = await supabase.from('noticia').delete().eq('idnoticia', id)
    if (error) {
      alert("Error al borrar: " + error.message)
    } else {
      cargarNoticias()
    }
  }

  const guardarNoticia = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { data: userData, error: userError } = await supabase.from('usuario').select('idusuario').eq('email', user?.email).single()
      
      if (userError || !userData) { 
        throw new Error("No se pudo verificar tu cuenta de administrador.") 
      }

      if (formData.idnoticia) {
        const { idnoticia, ...datosActualizar } = formData
        const { error } = await supabase.from('noticia').update(datosActualizar).eq('idnoticia', idnoticia)
        if (error) throw error
      } else {
        const nueva = { ...formData, idusuario: userData.idusuario, orden: 0 }
        const { error } = await supabase.from('noticia').insert([nueva])
        if (error) throw error
        setPaginaActual(1)
      }

      setModalFormAbierto(false)
      cargarNoticias()
    } catch (error: any) {
      alert("Error al guardar la noticia: " + error.message)
    } finally {
      setProcesando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 lg:p-8 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300">
      
      {/* MODAL PRINCIPAL */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-4xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700 transition-colors relative">
        
        <div className="p-5 md:px-8 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10 transition-colors shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" /></svg>
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white transition-colors">Noticias Novavista</h2>
              {esadmin && <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded mt-0.5 inline-block">Modo Editor</span>}
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors text-sm">✕</button>
        </div>

        {/* BOTONERA ADMIN */}
        {esadmin && !modalFormAbierto && (
          <div className="bg-gray-50 dark:bg-gray-800/50 px-8 py-3 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center transition-colors">
            <button onClick={abrirParaCrear} className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm flex items-center gap-2 shadow-sm">
              <span className="text-base leading-none">+</span> Crear Noticia
            </button>
            {ordenCambiado && (
              <button onClick={guardarOrdenNuevo} disabled={guardandoOrden} className="cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm animate-pulse">
                {guardandoOrden ? 'Guardando...' : 'Guardar Nuevo Orden'}
              </button>
            )}
          </div>
        )}

        {/* LISTA DE NOTICIAS */}
        <div className="p-6 md:p-8 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50 transition-colors flex flex-col">
          <div className="space-y-4 flex-1">
            {cargando ? (
              <div className="flex flex-col justify-center items-center py-12">
                <img src="/rollopeli.gif" alt="Cargando" className="w-16 h-16 mb-3 drop-shadow-sm opacity-80" />
                <p className="text-sm font-bold text-blue-600 dark:text-blue-500 animate-pulse">
                  Cargando noticias...
                </p>
              </div>
            ) : noticias.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 text-base">No hay noticias publicadas en este momento.</p>
                <p className="text-gray-400 text-sm mt-1">Mantente atento a las próximas novedades.</p>
              </div>
            ) : (
              noticiasPaginadas.map((noticia, indexVisual) => {
                const estaExpandida = expandidaId === noticia.idnoticia;
                const indiceAbsoluto = indicePrimerItem + indexVisual;
                
                return (
                  <div 
                    key={noticia.idnoticia} 
                    draggable={esadmin}
                    onDragStart={() => dragItem.current = indiceAbsoluto}
                    onDragEnter={() => dragOverItem.current = indiceAbsoluto}
                    onDragEnd={handleSort}
                    onDragOver={(e) => e.preventDefault()}
                    className={`bg-white dark:bg-gray-800 border rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${esadmin ? 'cursor-grab active:cursor-grabbing' : ''} ${estaExpandida ? 'border-blue-500 dark:border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                    onClick={() => setExpandidaId(estaExpandida ? null : noticia.idnoticia)}
                  >
                    <div className="p-5 flex justify-between items-start gap-4">
                      <div className="flex gap-3 w-full">
                        {esadmin && (
                          <div className="text-gray-300 dark:text-gray-600 mt-1 cursor-grab" title="Arrastrar para ordenar">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM16 6a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 11-4 0 2 2 0 014 0zM16 18a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          </div>
                        )}
                        <div className="w-full">
                          <div className="flex justify-between items-start mb-1.5">
                            <span className="text-[10px] md:text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                              {new Date(noticia.fechapublicacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </span>
                            
                            {/* BOTONES DE EDICIÓN ADMIN */}
                            {esadmin && (
                              <div className="flex gap-1.5 relative z-10">
                                <button onClick={(e) => abrirParaEditar(e, noticia)} className="cursor-pointer text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg transition-colors" title="Editar">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button onClick={(e) => borrarNoticia(e, noticia.idnoticia)} className="cursor-pointer text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg transition-colors" title="Borrar">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            )}
                          </div>
                          <h3 className={`text-base md:text-lg font-bold transition-colors pr-6 ${estaExpandida ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                            {noticia.titulo}
                          </h3>
                        </div>
                      </div>
                      <div className={`text-gray-400 transition-transform duration-300 mt-1 ${estaExpandida ? 'rotate-180 text-blue-500' : ''}`}>
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>

                    {estaExpandida && (
                      <div className="p-5 md:px-8 md:pb-6 border-t border-gray-100 dark:border-gray-700 animate-fade-in transition-colors bg-gray-50/50 dark:bg-gray-800/30">
                        {noticia.imagenurl && (
                          <div className="w-full mb-4 rounded-lg overflow-hidden shadow-sm">
                            <img src={noticia.imagenurl} alt={noticia.titulo} className="w-full max-h-[300px] object-cover" />
                          </div>
                        )}
                        <div className="text-gray-600 dark:text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                          {noticia.descripcion}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {totalPaginas > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pt-4 border-t border-gray-200 dark:border-gray-800">
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
        </div>

        {/* --- MODAL DE EDICIÓN/CREACIÓN --- */}
        {modalFormAbierto && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 z-20 flex flex-col transition-colors">
            <div className="p-5 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.idnoticia ? 'Editar Noticia' : 'Crear Noticia'}</h3>
              <button type="button" onClick={() => setModalFormAbierto(false)} className="cursor-pointer text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-sm">✕</button>
            </div>
            <div className="p-6 md:p-8 overflow-y-auto flex-1">
              <form id="form-noticia" onSubmit={guardarNoticia} className="space-y-5 max-w-3xl mx-auto">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Título de la Noticia</label>
                  <input required type="text" value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-base" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">URL de la Imagen (Opcional)</label>
                    <input type="text" value={formData.imagenurl || ''} onChange={e => setFormData({...formData, imagenurl: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="https://ejemplo.com/foto.jpg" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Fecha de Publicación</label>
                    <input required type="date" value={formData.fechapublicacion || ''} onChange={e => setFormData({...formData, fechapublicacion: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2.5 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm [color-scheme:light_dark]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5">Cuerpo de la Noticia</label>
                  <textarea required rows={8} value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm leading-relaxed"></textarea>
                </div>
              </form>
            </div>
            <div className="p-5 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 shrink-0">
              <button type="button" onClick={() => setModalFormAbierto(false)} className="cursor-pointer px-5 py-2.5 text-gray-600 dark:text-gray-400 text-sm font-bold hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg transition-colors">Cancelar</button>
              <button type="submit" form="form-noticia" disabled={procesando} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md disabled:opacity-50 transition-colors">
                {procesando ? 'Guardando...' : 'Guardar Publicación'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}