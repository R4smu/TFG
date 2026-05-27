import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { createClient } from '@supabase/supabase-js'

const urlSupabase = import.meta.env.VITE_SUPABASE_URL
const claveAnonSupabase = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseParaCrear = createClient(urlSupabase, claveAnonSupabase, {
  auth: { persistSession: false, autoRefreshToken: false }
})

interface Usuario {
  idusuario: number;
  nombre: string;
  email: string;
  telefono: string | null;
  esadmin: boolean;
  alta: boolean;
}

export default function GestorUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modoEdicion, setModoEdicion] = useState(false)
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Partial<Usuario> & { password?: string }>({})
  const [procesando, setProcesando] = useState(false)
  const [paginaActual, setPaginaActual] = useState(1)
  const itemsPorPagina = 8

  const cargarUsuarios = async () => {
    setCargando(true)
    const { data, error } = await supabase.from('usuario').select('*').order('nombre', { ascending: true })
    if (data) setUsuarios(data)
    if (error) console.error("Error cargando usuarios:", error)
    setCargando(false)
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const totalPaginas = Math.ceil(usuarios.length / itemsPorPagina)
  if (paginaActual > totalPaginas && totalPaginas > 0) setPaginaActual(totalPaginas)

  const indiceUltimoItem = paginaActual * itemsPorPagina
  const indicePrimerItem = indiceUltimoItem - itemsPorPagina
  const usuariosPaginados = usuarios.slice(indicePrimerItem, indiceUltimoItem)

  const abrirModalCrear = () => {
    setUsuarioSeleccionado({ nombre: '', email: '', telefono: '', esadmin: false, alta: true, password: '' })
    setModoEdicion(false)
    setModalAbierto(true)
  }

  const abrirModalEditar = (u: Usuario) => {
    setUsuarioSeleccionado(u)
    setModoEdicion(true)
    setModalAbierto(true)
  }

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUsuarioSeleccionado({ ...usuarioSeleccionado, [e.target.name]: e.target.value })
  }

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)

    const esAdminFinal = usuarioSeleccionado.esadmin === true || String(usuarioSeleccionado.esadmin) === 'true';

    if (modoEdicion) {
      const { idusuario, password, ...datosAActualizar } = usuarioSeleccionado as any
      const { error } = await supabase
        .from('usuario')
        .update({ ...datosAActualizar, esadmin: esAdminFinal })
        .eq('idusuario', idusuario)
      
      if (error) alert("Error al actualizar: " + error.message)
      else setModalAbierto(false)

    } else {
      const password = usuarioSeleccionado.password || ''
      if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/.test(password)) {
        alert("Error: La contraseña debe tener al menos 6 caracteres, 1 mayúscula, 1 número y 1 símbolo.")
        setProcesando(false)
        return
      }

      const { data: authData, error: errorAuth } = await supabaseParaCrear.auth.signUp({
        email: usuarioSeleccionado.email!,
        password: password,
        options: { data: { nombre: usuarioSeleccionado.nombre, telefono: usuarioSeleccionado.telefono } }
      })

      if (errorAuth) {
        alert("Error al registrar: " + errorAuth.message)
      } else if (authData.user) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        const { data: checkData, error: dbError } = await supabase
          .from('usuario')
          .update({ esadmin: esAdminFinal, alta: usuarioSeleccionado.alta })
          .eq('email', usuarioSeleccionado.email)
          .select()

        if (dbError) {
          alert("Usuario creado, pero fallaron los permisos: " + dbError.message)
        } else if (!checkData || checkData.length === 0) {
          alert("El usuario se ha creado, pero tu base de datos ha bloqueado el cambio de rol. Comprueba que el RLS esté desactivado.")
        } else {
          setModalAbierto(false)
          setPaginaActual(Math.ceil((usuarios.length + 1) / itemsPorPagina))
        }
      }
    }

    setProcesando(false)
    cargarUsuarios()
  }

  const alternarAltaBaja = async (u: Usuario) => {
    const palabra = u.alta ? 'dar de BAJA' : 'dar de ALTA'
    if (!window.confirm(`¿Estás seguro de que quieres ${palabra} al usuario ${u.nombre}?`)) return

    const { error } = await supabase.from('usuario').update({ alta: !u.alta }).eq('idusuario', u.idusuario)
    if (error) alert("Error: " + error.message)
    else cargarUsuarios()
  }

  if (cargando) return <div className="text-gray-500 p-4 text-center">Cargando lista de usuarios...</div>

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Control de Usuarios ({usuarios.length})</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Gestiona los permisos de administrador y los estados de alta/baja.</p>
        </div>
        <button onClick={abrirModalCrear} className="cursor-pointer bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm">
          <span>+</span> Nuevo Usuario
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Usuario</th>
              <th className="p-4 font-semibold">Teléfono</th>
              <th className="p-4 font-semibold">Rol</th>
              <th className="p-4 font-semibold">Estado</th>
              <th className="p-4 text-right font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
            {usuariosPaginados.map(u => (
              <tr key={u.idusuario} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors bg-white dark:bg-transparent">
                <td className="p-4">
                  <p className="font-bold text-gray-900 dark:text-white">{u.nombre}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                </td>
                <td className="p-4 text-gray-700 dark:text-gray-300">{u.telefono || '—'}</td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.esadmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                    {u.esadmin ? 'Admin' : 'Cliente'}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${u.alta ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'}`}>
                    {u.alta ? 'Activo (Alta)' : 'Inactivo (Baja)'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => abrirModalEditar(u)} className="cursor-pointer bg-blue-100 dark:bg-blue-600/20 text-blue-700 dark:text-blue-400 hover:bg-blue-600 hover:text-white px-3 py-1 rounded font-medium transition-colors">Editar</button>
                  <button 
                    onClick={() => alternarAltaBaja(u)} 
                    className={`cursor-pointer px-3 py-1 rounded font-medium transition-colors ${u.alta ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 hover:bg-red-600 hover:text-white' : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 hover:bg-green-600 hover:text-white'}`}
                  >
                    {u.alta ? 'Dar de Baja' : 'Activar'}
                  </button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {modoEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setModalAbierto(false)} className="cursor-pointer text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>
            
            <form onSubmit={guardarUsuario} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Nombre Completo</label>
                <input required name="nombre" value={usuarioSeleccionado.nombre || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Correo Electrónico</label>
                <input required type="email" name="email" disabled={modoEdicion} value={usuarioSeleccionado.email || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" />
              </div>

              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Teléfono</label>
                <input name="telefono" value={usuarioSeleccionado.telefono || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
              </div>

              {!modoEdicion && (
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Contraseña Temporal</label>
                  <input required type="password" name="password" value={usuarioSeleccionado.password || ''} onChange={manejarCambioInput} placeholder="••••••••" className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
                </div>
              )}
              
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Rol en el sistema</label>
                <select name="esadmin" value={usuarioSeleccionado.esadmin ? 'true' : 'false'} onChange={(e) => setUsuarioSeleccionado({...usuarioSeleccionado, esadmin: e.target.value === 'true'})} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500">
                  <option value="false">Cliente (Usuario estándar)</option>
                  <option value="true">Administrador</option>
                </select>
              </div>

              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <button type="button" onClick={() => setModalAbierto(false)} className="cursor-pointer px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium">Cancelar</button>
                <button type="submit" disabled={procesando} className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold shadow-md disabled:opacity-50">
                  {procesando ? 'Guardando...' : (modoEdicion ? 'Guardar Cambios' : 'Crear Usuario')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}