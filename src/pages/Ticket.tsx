import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface TicketData {
  identrada: number;
  fechacompra: string;
  preciofinal: number;
  estado: string;
  comprobanteurl: string;
  exhibicion: {
    fecha: string;
    horainicio: string;
    pelicula: {
      titulo: string;
      posterurl: string;
      duracion: number;
      clasificacionedad: string;
    };
    sala: {
      nombresala: string;
    };
  };
  asiento: {
    fila: number;
    numasiento: number;
  };
  usuario: {
    nombre: string;
  };
}

export default function Ticket() {
  const { id } = useParams<{ id: string }>()
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarTicket = async () => {
      const rutaBuscada = `/ticket/${id}`

      const { data, error } = await supabase
        .from('entrada')
        .select(`
          identrada,
          fechacompra,
          preciofinal,
          estado,
          comprobanteurl,
          exhibicion (
            fecha,
            horainicio,
            pelicula ( titulo, posterurl, duracion, clasificacionedad ),
            sala ( nombresala )
          ),
          asiento ( fila, numasiento ),
          usuario ( nombre )
        `)
        .eq('comprobanteurl', rutaBuscada)
        .maybeSingle() 

      if (error) {
        setError(error.message)
      } else if (!data) {
        setError("No se ha encontrado el ticket. Es posible que el enlace sea incorrecto.")
      } else {
        setTicket(data as unknown as TicketData)
      }
      
      setCargando(false)
    }

    cargarTicket()
  }, [id])

  if (cargando) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-center transition-colors duration-300">Generando tu ticket...</div>
  
  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col justify-center items-center p-8 transition-colors duration-300">
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500 text-red-600 dark:text-red-500 p-6 rounded-xl max-w-md text-center transition-colors">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <h2 className="text-xl font-bold mb-2">Ticket no válido</h2>
          <p className="text-sm">{error}</p>
          <Link to="/mis-entradas" className="mt-6 inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-colors">Volver a Mis Entradas</Link>
        </div>
      </div>
    )
  }

  const pelicula = Array.isArray(ticket.exhibicion.pelicula) ? ticket.exhibicion.pelicula[0] : ticket.exhibicion.pelicula
  const sala = Array.isArray(ticket.exhibicion.sala) ? ticket.exhibicion.sala[0] : ticket.exhibicion.sala
  const asiento = Array.isArray(ticket.asiento) ? ticket.asiento[0] : ticket.asiento
  const comprador = Array.isArray(ticket.usuario) ? ticket.usuario[0] : ticket.usuario

  // Forzamos el QR en blanco y negro para máxima escaneabilidad en lectores láser del cine
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${id}&color=000000&bgcolor=ffffff`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 flex justify-center items-start transition-colors duration-300">
      
      <div className="w-full max-w-md animate-fade-in drop-shadow-2xl">
        
        {/* PARTE SUPERIOR */}
        <div className="bg-white dark:bg-gray-800 rounded-t-3xl overflow-hidden relative border-x border-t border-gray-200 dark:border-gray-700 transition-colors">
          <div className="absolute inset-0">
            <img src={pelicula.posterurl} alt="Fondo" className="w-full h-full object-cover opacity-10 dark:opacity-30 blur-sm" />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-gray-800 to-transparent"></div>
          </div>
          <div className="relative p-8 text-center pt-12 pb-6">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2 tracking-tight drop-shadow-sm transition-colors">{pelicula.titulo}</h1>
            <p className="text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-xs transition-colors">Novavista Cines</p>
          </div>
        </div>

        {/* PARTE CENTRAL */}
        <div className="bg-white dark:bg-gray-800 p-8 relative border-x border-gray-200 dark:border-gray-700 transition-colors">
          
          <div className="absolute -left-4 top-0 w-8 h-8 bg-gray-50 dark:bg-gray-900 rounded-full -translate-y-1/2 border-r border-gray-200 dark:border-gray-700 transition-colors"></div>
          <div className="absolute -right-4 top-0 w-8 h-8 bg-gray-50 dark:bg-gray-900 rounded-full -translate-y-1/2 border-l border-gray-200 dark:border-gray-700 transition-colors"></div>
          <div className="absolute top-0 left-6 right-6 border-t-2 border-dashed border-gray-300 dark:border-gray-600 -translate-y-1/2 transition-colors"></div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1 transition-colors">Fecha</p>
              <p className="text-gray-900 dark:text-white font-bold transition-colors">{new Date(ticket.exhibicion.fecha).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1 transition-colors">Hora</p>
              <p className="text-gray-900 dark:text-white font-bold transition-colors">{ticket.exhibicion.horainicio.substring(0, 5)} h</p>
            </div>

            <div>
              <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1 transition-colors">Sala</p>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-lg transition-colors">{sala.nombresala}</p>
            </div>
            <div className="text-right flex justify-end gap-6">
              <div>
                <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1 transition-colors">Fila</p>
                <p className="text-gray-900 dark:text-white font-bold text-lg transition-colors">{asiento.fila}</p>
              </div>
              <div>
                <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1 transition-colors">Butaca</p>
                <p className="text-gray-900 dark:text-white font-bold text-lg transition-colors">{asiento.numasiento}</p>
              </div>
            </div>

            <div className="col-span-2 pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors">
              <p className="text-gray-400 dark:text-gray-500 text-xs uppercase font-bold mb-1 transition-colors">Titular</p>
              <p className="text-gray-900 dark:text-white font-medium transition-colors">{comprador.nombre}</p>
            </div>
          </div>
        </div>

        {/* PARTE INFERIOR (QR) */}
        <div className="bg-white dark:bg-gray-800 rounded-b-3xl p-8 relative pt-2 border-x border-b border-gray-200 dark:border-gray-700 transition-colors">
          
          <div className="absolute -left-4 top-0 w-8 h-8 bg-gray-50 dark:bg-gray-900 rounded-full -translate-y-1/2 border-r border-gray-200 dark:border-gray-700 transition-colors"></div>
          <div className="absolute -right-4 top-0 w-8 h-8 bg-gray-50 dark:bg-gray-900 rounded-full -translate-y-1/2 border-l border-gray-200 dark:border-gray-700 transition-colors"></div>
          <div className="absolute top-0 left-6 right-6 border-t-2 border-dashed border-gray-300 dark:border-gray-600 -translate-y-1/2 transition-colors"></div>

          <div className="flex flex-col items-center justify-center pt-6">
            <div className="bg-white p-4 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-inner transition-colors">
              <img src={qrCodeUrl} alt="QR" className="w-40 h-40 object-contain rounded-lg" />
            </div>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-4 tracking-[0.2em] font-mono transition-colors">ID: {ticket.identrada.toString().padStart(6, '0')}</p>
            
            <span className={`mt-4 px-3 py-1 rounded-full text-xs font-bold transition-colors ${ticket.estado === 'Confirmada' ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-500/20 dark:text-green-400 dark:border-green-500/50' : 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/50'}`}>
              Estado: {ticket.estado}
            </span>
          </div>
        </div>

      </div>
    </div>
  )
}