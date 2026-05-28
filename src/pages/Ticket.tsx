import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'

interface TicketData {
  identrada: number;
  fechacompra: string;
  estado: string;
  preciofinal: number;
  comprobanteurl: string;
  asiento: {
    fila: number;
    numasiento: number;
  };
  exhibicion: {
    fecha: string;
    horainicio: string;
    sala: { nombresala: string };
    pelicula: {
      titulo: string;
      posterurl: string;
      genero: string;
      duracion: number;
    }
  }
}

export default function Ticket() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [ticket, setTicket] = useState<TicketData | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const obtenerDatosTicket = async () => {
      setCargando(true)
      if (!id) return

      let query = supabase.from('entrada').select(`
        identrada, fechacompra, estado, preciofinal, comprobanteurl,
        asiento ( fila, numasiento ),
        exhibicion ( fecha, horainicio, sala ( nombresala ), pelicula ( titulo, posterurl, genero, duracion ) )
      `)

      if (isNaN(Number(id))) {
        query = query.like('comprobanteurl', `%${id}`)
      } else {
        query = query.eq('identrada', Number(id))
      }

      const { data, error } = await query.maybeSingle()

      if (data) setTicket(data as unknown as TicketData)
      else if (error) console.error("Error cargando ticket:", error.message)
      
      setCargando(false)
    }

    obtenerDatosTicket()
  }, [id])

  const ejecutarImpresion = () => {
    window.print();
  }

  useEffect(() => {
    if (!cargando && ticket && searchParams.get('download') === 'true') {
      const timer = setTimeout(() => ejecutarImpresion(), 1000)
      return () => clearTimeout(timer)
    }
  }, [cargando, ticket, searchParams])

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center transition-colors duration-300">
        <img src="/rollopeli.gif" alt="Cargando" className="w-24 h-24 sm:w-32 sm:h-32 mb-4 drop-shadow-lg" />
        <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-500 animate-pulse tracking-wide">
          Generando acceso al ticket...
        </p>
      </div>
    )
  }  
  
  if (!ticket) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col justify-center items-center gap-4"><p>El ticket solicitado no existe o ha caducado.</p><Link to="/" className="text-blue-500 underline">Volver a la cartelera</Link></div>

  const peli = Array.isArray(ticket.exhibicion.pelicula) ? ticket.exhibicion.pelicula[0] : ticket.exhibicion.pelicula;
  const salaNombre = (ticket.exhibicion.sala as any)?.nombresala || 'Principal';
  const datosAsiento = (ticket.asiento as any);

  const urlQrConAutoDescarga = `${window.location.origin}/ticket/${id}?download=true`;
  const urlApiQrCode = `https://quickchart.io/qr?size=180&margin=1&text=${encodeURIComponent(urlQrConAutoDescarga)}`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8 flex flex-col items-center justify-center transition-colors duration-300">
      
      <style>{`
        @media print {
          /* Limpiamos la hoja entera */
          body, html, .min-h-screen {
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          /* Ocultamos los botones de la web */
          .no-imprimir {
            display: none !important;
          }
          /* Forzamos que el ticket NO ocupe toda la página estirado */
          #comprobante-pdf {
            box-shadow: none !important;
            border: 2px solid #e2e8f0 !important;
            background: #ffffff !important;
            padding: 30px !important;
            max-width: 450px !important; /* <-- Esto evita que se haga gigante */
            margin: 40px auto !important; /* Centrado perfecto en el PDF */
            border-radius: 24px !important;
          }
          /* Forzamos que los textos salgan oscuros legibles en el PDF */
          h1, h2, h3, p, span, div, td {
            color: #000000 !important;
          }
          /* Mantenemos los colores de marca bonitos en el PDF */
          .text-blue-600, .dark\\:text-blue-400 { color: #2563eb !important; }
          .text-green-600, .dark\\:text-green-400 { color: #16a34a !important; }
          .bg-gray-50, .dark\\:bg-gray-900\\/50 { background-color: #f9fafb !important; border: 1px solid #f1f5f9 !important; }
          
          /* Forzar impresión de fondos en Chrome/Safari/Firefox */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="max-w-xl w-full space-y-6">
        
        <div className="flex justify-between items-center px-2 no-imprimir">
          <Link to="/mis-entradas" className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">← Mis Entradas</Link>
          <button 
            onClick={ejecutarImpresion} 
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-md transition-all active:scale-95"
          >
            Descargar PDF / Imprimir
          </button>
        </div>

        {/* TICKET */}
        <div id="comprobante-pdf" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-8 space-y-8 tracking-normal transition-colors">
          
          <div className="text-center border-b border-gray-100 dark:border-gray-700 pb-6 transition-colors">
            <h1 className="text-3xl font-black tracking-widest text-blue-600 dark:text-blue-400">NOVAVISTA</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-1">Comprobante Oficial de Entrada</p>
          </div>

          <div className="flex gap-6 items-center">
            <img src={peli.posterurl} alt="Poster" className="w-20 h-28 object-cover rounded-lg shadow-sm bg-gray-100 dark:bg-gray-900" />
            <div className="space-y-1">
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-[10px] font-black px-2 py-0.5 rounded uppercase transition-colors">{peli.genero}</span>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight transition-colors">{peli.titulo}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium transition-colors">Duración: {peli.duracion} minutos</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-6 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl text-sm border border-gray-100 dark:border-gray-700 transition-colors">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider">Fecha</p>
              <p className="font-bold text-gray-800 dark:text-gray-200">{new Date(ticket.exhibicion.fecha).toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider">Hora</p>
              <p className="font-bold text-blue-600 dark:text-blue-400 text-base">{ticket.exhibicion.horainicio.substring(0, 5)} h</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider">Sala</p>
              <p className="font-bold text-gray-800 dark:text-gray-200">{salaNombre}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider">Butaca</p>
              <p className="font-bold text-gray-800 dark:text-gray-200">Fila {datosAsiento?.fila || '—'} • Asiento {datosAsiento?.numasiento || '—'}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center border-t border-b border-dashed border-gray-200 dark:border-gray-700 py-6 my-2 bg-gray-50/50 dark:bg-gray-900/30 rounded-xl transition-colors">
            <div className="bg-white p-3 rounded-2xl border border-gray-100">
              <img src={urlApiQrCode} alt="Código QR" className="w-44 h-44" />
            </div>
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider mt-4">Código Digital</p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 font-medium max-w-xs text-center mt-1">Escanea este código en el torno de entrada para acceder a la sala.</p>
          </div>

          <div className="flex justify-between items-center pt-2 text-sm transition-colors">
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider">Operación</p>
              <p className="font-mono text-xs text-gray-600 dark:text-gray-400">#NV-{ticket.identrada}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Estado: <span className="text-green-600 dark:text-green-400 font-bold">{ticket.estado}</span></p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-wider">Total Pagado</p>
              <p className="text-3xl font-black text-green-600 dark:text-green-400">{ticket.preciofinal.toFixed(2)}€</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}