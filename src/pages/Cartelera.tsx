import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import MovieCarousel from '../components/MovieCarousel'
import MovieModal from '../components/MovieModal'

interface Pelicula {
  idpelicula: number;
  titulo: string;
  genero: string;
  duracion: number;
  posterurl: string;
  sinopsis: string;
  clasificacionedad?: string;
  trailerurl?: string; 
  director?: string; 
}

export default function Cartelera() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([])
  const [cargando, setCargando] = useState(true)
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState<Pelicula | null>(null)
  
  const [animarBanner, setAnimarBanner] = useState(false)

  useEffect(() => {
    const obtenerPeliculas = async () => {
      const { data } = await supabase.from('pelicula').select('*').eq('activa', true)
      
      if (data) setPeliculas(data)
      setCargando(false)

      setTimeout(() => {
        setAnimarBanner(true)
      }, 100)
    }
    obtenerPeliculas()
  }, [])

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center transition-colors duration-300">
        <img src="/rollopeli.gif" alt="Cargando" className="w-24 h-24 sm:w-32 sm:h-32 mb-4 drop-shadow-lg" />
        <p className="text-lg sm:text-xl font-bold text-blue-600 dark:text-blue-500 animate-pulse tracking-wide">
          Cargando cartelera...
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 pb-16">
      
      <div className="relative w-full h-[400px] md:h-[500px] bg-black overflow-hidden flex items-center shadow-2xl mb-12">
        <div className="absolute inset-0 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 opacity-30">
          {[...peliculas, ...peliculas, ...peliculas, ...peliculas].slice(0, 24).map((p, i) => (
            <img key={i} src={p.posterurl} alt="" className="w-full h-full object-cover opacity-70" />
          ))}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent dark:from-black dark:via-black/90 dark:to-black/30"></div>
        
        {/* Contenido de texto  */}
        <div className="relative z-10 max-w-7xl mx-auto px-8 w-full">
          <div className="max-w-2xl overflow-hidden">
            
            <h1 className={`text-5xl md:text-7xl font-black text-white tracking-tight mb-6 drop-shadow-xl transform transition-all duration-1000 ease-out ${
              animarBanner ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}>
              NOVAVISTA
            </h1>
            
            <p className={`text-lg md:text-xl text-gray-200 leading-relaxed font-medium drop-shadow-md transform transition-all duration-1000 ease-out delay-300 ${
              animarBanner ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'
            }`}>
              Tu experiencia de cine en la palma de tu mano. Reserva tus entradas, elige tus butacas y disfruta de la magia del séptimo arte con la mejor calidad.
            </p>
            
          </div>
        </div>
      </div>

      {/* CONTENEDOR DE LA CARTELERA */}
      <div className="max-w-7xl mx-auto px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-500 mb-8 tracking-tight transition-colors">
          En Cartelera
        </h2>
        
        <MovieCarousel 
          peliculas={peliculas} 
          onVerDetalles={setPeliculaSeleccionada}
          modalAbierto={peliculaSeleccionada !== null} 
        />
      </div>

      {/* Renderizado del Modal */}
      {peliculaSeleccionada && (
        <MovieModal 
          pelicula={peliculaSeleccionada} 
          onClose={() => setPeliculaSeleccionada(null)} 
        />
      )}
    </div>
  )
}