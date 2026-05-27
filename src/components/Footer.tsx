import { useState } from 'react'

const contenidosFooter: Record<string, string> = {
  'Aviso Legal': 'Novavista Cines S.L. con CIF B-12345678, inscrita en el Registro Mercantil de Badajoz. Domicilio fiscal en Mérida, Extremadura. Todos los derechos sobre el contenido, diseño y código fuente de esta web están reservados.',
  'Política de Privacidad': 'En Novavista protegemos tus datos conforme al RGPD europeo. Tu información personal (nombre, email) solo se utiliza para gestionar tus reservas, enviarte las entradas y garantizar la seguridad de tu cuenta. Nunca venderemos tus datos a terceros.',
  'Política de Cookies': 'Utilizamos cookies técnicas que son estrictamente necesarias para mantener tu sesión abierta y procesar tus compras de forma segura. También usamos cookies analíticas básicas para entender cómo navegas por la cartelera y mejorar la web.',
  'Términos y Condiciones': 'Al comprar una entrada, el cliente acepta cumplir con la normativa de nuestras instalaciones (respeto de la clasificación por edades, prohibición de grabar la pantalla, etc.). Las entradas adquiridas online no admiten cambios ni devoluciones salvo cancelación de la sesión por causas técnicas.',
  'Contacto': '¡Estamos aquí para ayudarte! Puedes escribirnos a soporte@novavistacines.es, llamarnos al 924 123 456 o hablar con el personal de nuestras taquillas en Mérida de lunes a domingo (15:30 a 23:30).',
  'Preguntas Frecuentes': '¿Necesito imprimir la entrada? No, mostrar el código QR desde tu móvil es suficiente. ¿Puedo entrar una vez empezada la película? Sí, pero te pediremos que lo hagas en silencio y sin encender la linterna para no molestar al resto del público.',
  'Gestión de Entradas': 'Todas tus entradas compradas se vinculan automáticamente a tu cuenta. Puedes acceder a ellas en cualquier momento desde la sección "Mis Entradas" de tu perfil para ver tu asiento, la sala y el código de acceso.',
  'Trabaja con nosotros': '¿Te apasiona el mundo del cine y la atención al cliente? Siempre estamos buscando talento para nuestras áreas de taquilla, bar y proyección. Envía tu currículum actualizado a empleo@novavistacines.es y te tendremos en cuenta para futuras vacantes.'
}

export default function Footer() {
  const anioActual = new Date().getFullYear()
  
  const [modalAbierto, setModalAbierto] = useState(false)
  const [tituloModal, setTituloModal] = useState('')
  const [textoModal, setTextoModal] = useState('')

  const abrirInformacion = (titulo: string) => {
    setTituloModal(titulo)
    setTextoModal(contenidosFooter[titulo] || 'Información no disponible en este momento.')
    setModalAbierto(true)
  }

  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 pt-16 pb-8 mt-auto transition-colors duration-300 relative">
      <div className="max-w-7xl mx-auto px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          {/* Columna 1 */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-black text-blue-600 dark:text-blue-500 mb-4 tracking-tight transition-colors">NOVAVISTA</h2>
            <p className="text-sm leading-relaxed mb-6">
              Tu experiencia de cine en la palma de tu mano. Reserva tus entradas, elige tus butacas y disfruta de la magia del séptimo arte con la mejor calidad.
            </p>
          </div>

          {/* Columna 2 */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4 uppercase tracking-wider text-sm transition-colors">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => abrirInformacion('Aviso Legal')} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Aviso Legal</button></li>
              <li><button onClick={() => abrirInformacion('Política de Privacidad')} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Política de Privacidad</button></li>
              <li><button onClick={() => abrirInformacion('Política de Cookies')} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Política de Cookies</button></li>
              <li><button onClick={() => abrirInformacion('Términos y Condiciones')} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Términos y Condiciones</button></li>
            </ul>
          </div>

          {/* Columna 3 */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4 uppercase tracking-wider text-sm transition-colors">Ayuda</h3>
            <ul className="space-y-3 text-sm">
              <li><button onClick={() => abrirInformacion('Contacto')} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Contacto</button></li>
              <li><button onClick={() => abrirInformacion('Preguntas Frecuentes')} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Preguntas Frecuentes</button></li>
              <li><button onClick={() => abrirInformacion('Gestión de Entradas')} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Gestión de Entradas</button></li>
              <li><button onClick={() => abrirInformacion('Trabaja con nosotros')} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-left">Trabaja con nosotros</button></li>
            </ul>
          </div>

          {/* Columna 4 (Redes Sociales) */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-bold mb-4 uppercase tracking-wider text-sm transition-colors">Síguenos</h3>
            <div className="flex gap-4">
              
              {/* Botón de X */}
              <a href="https://twitter.com/login" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-2 rounded-full hover:bg-black dark:hover:bg-gray-200 hover:text-white dark:hover:text-black transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
              </a>

              {/* Botón de Instagram */}
              <a href="https://www.instagram.com/accounts/login/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-2 rounded-full hover:bg-pink-600 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" /></svg>
              </a>

              {/* Botón de Facebook */}
              <a href="https://www.facebook.com/login/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="cursor-pointer bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
              </a>

            </div>
          </div>

        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs">
          <p>© {anioActual} Cine Novavista. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <span>DAW2B - IES Albarregas</span>
          </div>
        </div>

      </div>

      {/* --- MODAL DE INFORMACIÓN --- */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm transition-colors duration-300">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg p-8 pb-10 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 animate-fade-in relative transition-colors duration-300">
            
            {/* Botón de cerrar (X) */}
            <button 
              onClick={() => setModalAbierto(false)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 w-8 h-8 flex items-center justify-center rounded-full transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Contenido del Modal */}
            <div className="text-center mt-2">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100 dark:border-blue-500/20">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors">
                {tituloModal}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed transition-colors text-left bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800 m-0">
                {textoModal}
              </p>
            </div>
            
          </div>
        </div>
      )}
    </footer>
  )
}