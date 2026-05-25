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
  
  const [ordenCambiado, setOrdenCambiado] = useState(false)
  const [guardandoOrden, setGuardandoOrden] = useState(false)
  const dragItem = useRef<number | null>(null)
  const dragOverItem = useRef<number | null>(null)

  const cargarNoticias = async () => {
    setCargando(true)
    const { data } = await supabase
      .from('noticia')
      .select('*')
      .order('orden', { ascending: true })
      .order('fechapublicacion', { ascending: false })
      
    if (data) setNoticias(data as Noticia[])
    setCargando(false)
  }

  useEffect(() => {
    cargarNoticias()
  }, [])

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
    for (let i = 0; i < noticias.length; i++) {
      await supabase.from('noticia').update({ orden: i }).eq('idnoticia', noticias[i].idnoticia)
    }
    setOrdenCambiado(false)
    setGuardandoOrden(false)
  }

  // --- CRUD ADMIN ---
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
    await supabase.from('noticia').delete().eq('idnoticia', id)
    cargarNoticias()
  }

  const guardarNoticia = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)

    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = await supabase.from('usuario').select('idusuario').eq('email', user?.email).single()
    
    if (!userData) { alert("Error de sesión"); setProcesando(false); return; }

    if (formData.idnoticia) {
      const { idnoticia, ...datosActualizar } = formData
      await supabase.from('noticia').update(datosActualizar).eq('idnoticia', idnoticia)
    } else {
      const nueva = { ...formData, idusuario: userData.idusuario, orden: 0 }
      await supabase.from('noticia').insert([nueva])
    }

    setModalFormAbierto(false)
    setProcesando(false)
    cargarNoticias()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm transition-colors duration-300">
      
      {/* MODAL PRINCIPAL */}
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl max-h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-gray-200 dark:border-gray-700 transition-colors relative">
        
        {/* CABECERA */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10 transition-colors shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600 dark:text-blue-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H14" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">Noticias</h2>
              {esadmin && <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest bg-purple-100 dark:bg-purple-900/30 px-2 py-0.5 rounded">Modo Editor</span>}
            </div>
          </div>
          <button onClick={onClose} className="cursor-pointer text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
        </div>

        {/* BOTONES ADMIN */}
        {esadmin && !modalFormAbierto && (
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center transition-colors">
            <button onClick={abrirParaCrear} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm flex items-center gap-2 shadow-sm">
              <span>+</span> Crear Noticia
            </button>
            {ordenCambiado && (
              <button onClick={guardarOrdenNuevo} disabled={guardandoOrden} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold transition-colors text-sm shadow-sm animate-pulse">
                {guardandoOrden ? 'Guardando...' : 'Guardar Nuevo Orden'}
              </button>
            )}
          </div>
        )}

        {/* LISTA DE NOTICIAS */}
        <div className="p-6 overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-900/50 transition-colors space-y-4">
          {cargando ? (
            <p className="text-center text-gray-500 py-8">Cargando noticias...</p>
          ) : noticias.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No hay noticias publicadas.</p>
          ) : (
            noticias.map((noticia, index) => {
              const estaExpandida = expandidaId === noticia.idnoticia;
              
              return (
                <div 
                  key={noticia.idnoticia} 
                  draggable={esadmin}
                  onDragStart={() => dragItem.current = index}
                  onDragEnter={() => dragOverItem.current = index}
                  onDragEnd={handleSort}
                  onDragOver={(e) => e.preventDefault()}
                  className={`bg-white dark:bg-gray-800 border rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer ${esadmin ? 'cursor-grab active:cursor-grabbing' : ''} ${estaExpandida ? 'border-blue-500 dark:border-blue-500 ring-1 ring-blue-500' : 'border-gray-200 dark:border-gray-700'}`}
                  onClick={() => setExpandidaId(estaExpandida ? null : noticia.idnoticia)}
                >
                  <div className="p-5 flex justify-between items-start gap-4">
                    <div className="flex gap-4 w-full">
                      {esadmin && (
                        <div className="text-gray-300 dark:text-gray-600 mt-2 cursor-grab" title="Arrastrar para ordenar">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0zM16 6a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 11-4 0 2 2 0 014 0zM16 18a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        </div>
                      )}
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">
                            {new Date(noticia.fechapublicacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                          
                          {/* BOTONES DE EDICIÓN ADMIN EN LA ESQUINA */}
                          {esadmin && (
                            <div className="flex gap-2 relative z-10">
                              <button onClick={(e) => abrirParaEditar(e, noticia)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded transition-colors" title="Editar">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                              </button>
                              <button onClick={(e) => borrarNoticia(e, noticia.idnoticia)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded transition-colors" title="Borrar">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </div>
                          )}
                        </div>
                        <h3 className={`font-bold transition-colors pr-6 ${estaExpandida ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'}`}>
                          {noticia.titulo}
                        </h3>
                      </div>
                    </div>
                    <div className={`text-gray-400 transition-transform duration-300 ${estaExpandida ? 'rotate-180 text-blue-500' : ''}`}>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>

                  {/* CONTENIDO EXPANDIDO */}
                  {estaExpandida && (
                    <div className="p-5 border-t border-gray-100 dark:border-gray-700 animate-fade-in transition-colors bg-gray-50/50 dark:bg-gray-800/50">
                      {noticia.imagenurl && (
                        <img src={noticia.imagenurl} alt="Noticia" className="w-full max-h-64 object-cover rounded-lg mb-4 shadow-sm" />
                      )}
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {noticia.descripcion}
                      </p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* --- MODAL INTERNO DE EDICIÓN/CREACIÓN --- */}
        {modalFormAbierto && (
          <div className="absolute inset-0 bg-white dark:bg-gray-900 z-20 flex flex-col transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.idnoticia ? 'Editar Noticia' : 'Crear Noticia'}</h3>
              <button type="button" onClick={() => setModalFormAbierto(false)} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">✕</button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="form-noticia" onSubmit={guardarNoticia} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Título</label>
                  <input required type="text" value={formData.titulo || ''} onChange={e => setFormData({...formData, titulo: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">URL de la Imagen (Opcional)</label>
                  <input type="text" value={formData.imagenurl || ''} onChange={e => setFormData({...formData, imagenurl: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Fecha de Publicación</label>
                  <input required type="date" value={formData.fechapublicacion || ''} onChange={e => setFormData({...formData, fechapublicacion: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 [color-scheme:light_dark]" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">Contenido / Descripción</label>
                  <textarea required rows={5} value={formData.descripcion || ''} onChange={e => setFormData({...formData, descripcion: e.target.value})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none"></textarea>
                </div>
              </form>
            </div>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 flex justify-end gap-4 bg-gray-50 dark:bg-gray-900/50">
              <button type="button" onClick={() => setModalFormAbierto(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 font-medium">Cancelar</button>
              <button type="submit" form="form-noticia" disabled={procesando} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md disabled:opacity-50">
                {procesando ? 'Guardando...' : 'Guardar Noticia'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}