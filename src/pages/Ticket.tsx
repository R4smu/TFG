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
  const [generandoPDF, setGenerandoPDF] = useState(false)

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

  const descargarPDF = async () => {
    const elemento = document.getElementById('comprobante-pdf')
    if (!elemento) return

    setGenerandoPDF(true)

    try {
      if (!(window as any).html2pdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script')
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
          script.onload = resolve
          script.onerror = reject
          document.body.appendChild(script)
        })
      }

      const opciones = {
        margin: 10,
        filename: `Novavista-Ticket-${ticket?.identrada || 'cine'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' }, 
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }

      const esModoOscuro = document.documentElement.classList.contains('dark')
      if (esModoOscuro) document.documentElement.classList.remove('dark')

      await (window as any).html2pdf().set(opciones).from(elemento).save()

      if (esModoOscuro) document.documentElement.classList.add('dark')

    } catch (error) {
      console.error("Error al generar PDF:", error)
      alert("Hubo un problema al crear el PDF. Tu navegador podría estar bloqueándolo.")
    } finally {
      setGenerandoPDF(false)
    }
  }

  useEffect(() => {
    if (!cargando && ticket && searchParams.get('download') === 'true') {
      const timer = setTimeout(() => descargarPDF(), 800)
      return () => clearTimeout(timer)
    }
  }, [cargando, ticket, searchParams])

  if (cargando) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-center">Generando acceso al ticket...</div>
  if (!ticket) return <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col justify-center items-center gap-4"><p>El ticket solicitado no existe o ha caducado.</p><Link to="/" className="text-blue-500 underline">Volver a la cartelera</Link></div>

  const peli = Array.isArray(ticket.exhibicion.pelicula) ? ticket.exhibicion.pelicula[0] : ticket.exhibicion.pelicula;
  const salaNombre = (ticket.exhibicion.sala as any)?.nombresala || 'Principal';
  const datosAsiento = (ticket.asiento as any);

  const urlQrConAutoDescarga = `${window.location.origin}/ticket/${id}?download=true`;
  const urlApiQrCode = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlQrConAutoDescarga)}`;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 sm:p-8 flex flex-col items-center justify-center transition-colors duration-300">
      <div className="max-w-xl w-full space-y-6">
        
        <div className="flex justify-between items-center px-2">
          <Link to="/mis-entradas" className="text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">← Mis Entradas</Link>
          <button 
            onClick={descargarPDF} 
            disabled={generandoPDF}
            className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-sm shadow-md transition-all disabled:opacity-50"
          >
            {generandoPDF ? 'Procesando...' : '📥 Descargar PDF'}
          </button>
        </div>

        {/* TICKET */}
        <div id="comprobante-pdf" className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700 p-8 space-y-8 tracking-normal transition-colors">
          
          <div className="text-center border-b border-gray-100 dark:border-gray-700 pb-6 transition-colors">
            <h1 className="text-3xl font-black tracking-widest text-blue-600 dark:text-blue-400">NOVAVISTA</h1>
            <p className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold tracking-wider mt-1">Comprobante Oficial de Entrada</p>
          </div>

          <div className="flex gap-6 items-center">
            <img src={peli.posterurl} alt="Poster" crossOrigin="anonymous" className="w-20 h-28 object-cover rounded-lg shadow-sm bg-gray-100 dark:bg-gray-900" />
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
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <img src={urlApiQrCode} alt="Código QR" crossOrigin="anonymous" className="w-44 h-44" />
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