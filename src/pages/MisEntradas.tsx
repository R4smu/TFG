import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'

interface Entrada {
  identrada: number;
  fechacompra: string;
  estado: string;
  comprobanteurl: string;
  exhibicion: {
    fecha: string;
    horainicio: string;
    pelicula: {
      titulo: string;
      posterurl: string;
    }
  }
}

export default function MisEntradas() {
  const [entradas, setEntradas] = useState<Entrada[]>([])
  const [cargando, setCargando] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const cargarEntradas = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/login')
        return
      }

      // Buscamos el ID del usuario en nuestra tabla
      const { data: userData } = await supabase.from('usuario').select('idusuario').eq('email', user.email).single()

      if (userData) {
        // Traemos sus entradas con la información de la película
        const { data: entradasData } = await supabase
          .from('entrada')
          .select(`
            identrada, fechacompra, estado, comprobanteurl,
            exhibicion ( fecha, horainicio, pelicula ( titulo, posterurl ) )
          `)
          .eq('idusuario', userData.idusuario)
          .order('fechacompra', { ascending: false })

        if (entradasData) {
          // Ajustamos los tipos que devuelve Supabase
          setEntradas(entradasData as unknown as Entrada[])
        }
      }
      setCargando(false)
    }

    cargarEntradas()
  }, [navigate])

  if (cargando) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-center transition-colors">Buscando tus entradas...</div>

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to="/perfil" className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 p-2 rounded-full transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors">Mis Entradas</h1>
        </div>

        {entradas.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-md transition-colors">
            <div className="bg-gray-100 dark:bg-gray-900 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors">
              <svg className="w-12 h-12 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Aún no tienes entradas</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 transition-colors">Parece que todavía no has comprado ninguna entrada para nuestras películas.</p>
            <Link to="/" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-colors">
              Ir a la Cartelera
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {entradas.map((entrada) => {
              // Ajustamos la estructura de los JOINs
              const peli = Array.isArray(entrada.exhibicion.pelicula) ? entrada.exhibicion.pelicula[0] : entrada.exhibicion.pelicula;
              
              // Extraemos el ID del ticket de la URL que guardaste (ej: de "/ticket/123" sacamos "123")
              const idUrlTicket = entrada.comprobanteurl.split('/').pop() || entrada.identrada;

              return (
                <div key={entrada.identrada} className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row">
                  
                  {/* Mini-póster */}
                  <div className="w-full sm:w-32 h-40 sm:h-auto bg-gray-200 dark:bg-gray-900 shrink-0 transition-colors">
                    <img src={peli.posterurl} alt={peli.titulo} className="w-full h-full object-cover" />
                  </div>
                  
                  {/* Detalles de la entrada */}
                  <div className="p-6 flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{peli.titulo}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${entrada.estado === 'Confirmada' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                        {entrada.estado}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold transition-colors">Sesión</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors">
                          {new Date(entrada.exhibicion.fecha).toLocaleDateString()} a las {entrada.exhibicion.horainicio.substring(0, 5)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold transition-colors">Comprada el</p>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 transition-colors">
                          {new Date(entrada.fechacompra).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botón de acceso al Ticket */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-center border-t sm:border-t-0 sm:border-l border-gray-200 dark:border-gray-700 transition-colors">
                    <Link 
                      to={`/ticket/${idUrlTicket}`}
                      className="w-full sm:w-auto text-center bg-gray-900 text-white hover:bg-gray-700 dark:bg-blue-600/20 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white px-6 py-3 rounded-lg font-bold transition-colors"
                    >
                      Ver Ticket
                    </Link>
                  </div>

                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}