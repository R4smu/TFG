import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

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
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Partial<Usuario>>({})
  const [procesando, setProcesando] = useState(false)

  const cargarUsuarios = async () => {
    setCargando(true)
    const { data } = await supabase.from('usuario').select('*').order('nombre', { ascending: true })
    if (data) setUsuarios(data)
    setCargando(false)
  }

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const abrirModalEditar = (u: Usuario) => {
    setUsuarioSeleccionado(u)
    setModalAbierto(true)
  }

  const manejarCambioInput = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
    setUsuarioSeleccionado({ ...usuarioSeleccionado, [e.target.name]: value })
  }

  const guardarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    setProcesando(true)

    const { idusuario, ...datosAActualizar } = usuarioSeleccionado as Usuario

    const { error } = await supabase
      .from('usuario')
      .update(datosAActualizar)
      .eq('idusuario', idusuario)

    if (error) {
      alert("Error al actualizar: " + error.message)
    } else {
      setModalAbierto(false)
      cargarUsuarios()
    }
    setProcesando(false)
  }

  // Función rápida para dar de alta o baja desde la tabla
  const alternarAltaBaja = async (u: Usuario) => {
    const palabra = u.alta ? 'dar de BAJA' : 'dar de ALTA'
    if (!window.confirm(`¿Estás seguro de que quieres ${palabra} al usuario ${u.nombre}?`)) return

    const { error } = await supabase
      .from('usuario')
      .update({ alta: !u.alta })
      .eq('idusuario', u.idusuario)

    if (error) alert("Error: " + error.message)
    else cargarUsuarios()
  }

  if (cargando) return <div className="text-gray-500 p-4 text-center">Cargando lista de usuarios...</div>

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-md transition-colors duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Control de Usuarios</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Gestiona los permisos de administrador y los estados de alta/baja.</p>
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
            {usuarios.map(u => (
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

      {/* MODAL EDICIÓN DE USUARIO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 dark:bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl transition-colors">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 z-10 rounded-t-2xl">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Editar Usuario</h3>
              <button onClick={() => setModalAbierto(false)} className="cursor-pointer text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
            </div>
            
            <form onSubmit={guardarUsuario} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Nombre Completo</label>
                <input required name="nombre" value={usuarioSeleccionado.nombre || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold mb-1">Teléfono</label>
                <input name="telefono" value={usuarioSeleccionado.telefono || ''} onChange={manejarCambioInput} className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500" />
              </div>
              
              {/* Select para cambiar el rol */}
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
                  {procesando ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}