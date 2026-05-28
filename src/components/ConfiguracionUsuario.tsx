import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ConfiguracionUsuario() {
  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error', texto: string } | null>(null)
  
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null)
  const [previewImagen, setPreviewImagen] = useState<string | null>(null)
  const [estaArrastrando, setEstaArrastrando] = useState(false)
  const inputArchivoRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    cargarDatosUsuario()
  }, [])

  const cargarDatosUsuario = async () => {
    setCargando(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && user.email) {
      setEmail(user.email)
      const { data } = await supabase
        .from('usuario')
        .select('nombre, telefono, avatar_url')
        .eq('email', user.email)
        .single()
        
      if (data) {
        setNombre(data.nombre || '')
        setTelefono(data.telefono || '')
        setAvatarUrl(data.avatar_url || null)
      }
    }
    setCargando(false)
  }

  const procesarArchivo = (archivo: File) => {
    if (archivo.size > 2 * 1024 * 1024) {
      setMensaje({ tipo: 'error', texto: 'La imagen es demasiado grande. Máximo 2MB.' })
      return
    }
    setArchivoImagen(archivo)
    setPreviewImagen(URL.createObjectURL(archivo))
    setMensaje(null)
  }

  const manejarSeleccionImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) procesarArchivo(e.target.files[0])
  }

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setEstaArrastrando(true); }
  const handleDragLeave = () => setEstaArrastrando(false)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setEstaArrastrando(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) procesarArchivo(e.dataTransfer.files[0])
  }

  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje(null)

    try {
      let nuevaAvatarUrl = avatarUrl

      if (archivoImagen) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error("No hay sesión activa")

        const extension = archivoImagen.name.split('.').pop()
        const nombreArchivo = `${user.id}-${Date.now()}.${extension}`
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(nombreArchivo, archivoImagen, { upsert: true })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(nombreArchivo)
          
        nuevaAvatarUrl = urlData.publicUrl
      }

      const { error: dbError } = await supabase
        .from('usuario')
        .update({ nombre, telefono, avatar_url: nuevaAvatarUrl })
        .eq('email', email)

      if (dbError) throw dbError

      setAvatarUrl(nuevaAvatarUrl)
      setArchivoImagen(null)
      setMensaje({ tipo: 'exito', texto: '¡Perfil actualizado correctamente!' })
      
    } catch (error: any) {
      setMensaje({ tipo: 'error', texto: 'Error al guardar: ' + error.message })
    } finally {
      setGuardando(false)
    }
  }

  if (cargando) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-12 flex flex-col justify-center items-center transition-colors w-full max-w-2xl mx-auto">
        <img src="/rollopeli.gif" alt="Cargando" className="w-16 h-16 mb-4 drop-shadow-md" />
        <p className="text-sm font-bold text-blue-600 dark:text-blue-500 animate-pulse tracking-wide">
          Cargando tu configuración...
        </p>
      </div>
    )
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-md p-8 transition-colors duration-300 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Configuración de Perfil</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Actualiza tu información personal y foto de perfil.</p>

      {mensaje && (
        <div className={`p-4 rounded-lg mb-6 text-sm font-medium transition-colors ${mensaje.tipo === 'exito' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
          {mensaje.texto}
        </div>
      )}

      <form onSubmit={guardarCambios} className="space-y-6">
        
        {/* FOTO DE PERFIL */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div 
            className={`relative group cursor-pointer border-4 rounded-full transition-all ${estaArrastrando ? 'border-blue-500 scale-105' : 'border-white dark:border-gray-800'}`}
            onClick={() => inputArchivoRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg relative">
              {previewImagen || avatarUrl ? (
                <img src={previewImagen || avatarUrl!} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                  <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-[10px] font-bold uppercase">Arrastrar</span>
              </div>
            </div>
            <input type="file" accept="image/*" className="hidden" ref={inputArchivoRef} onChange={manejarSeleccionImagen} />
          </div>
          
          <div className="text-center sm:text-left">
            <h3 className="text-gray-900 dark:text-white font-bold">Foto de perfil</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Arrastra tu foto aquí o haz clic para subir.</p>
          </div>
        </div>

        {/* CAMPOS DE TEXTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nombre Completo</label>
            <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Teléfono</label>
            <input type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <input type="email" value={email} disabled className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-500 rounded-lg p-3 cursor-not-allowed transition-colors opacity-70" />
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={guardando} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors disabled:opacity-50">
            {guardando ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}