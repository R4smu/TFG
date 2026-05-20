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
  director: string;
  clasificacionedad: string;
}

export default function Cartelera() {
  const [peliculas, setPeliculas] = useState<Pelicula[]>([])
  const [cargando, setCargando] = useState(true)
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState<Pelicula | null>(null)

  useEffect(() => {
    const obtenerPeliculas = async () => {
      const { data } = await supabase.from('pelicula').select('*')
      if (data) setPeliculas(data)
      setCargando(false)
    }
    obtenerPeliculas()
  }, [])

  if (cargando) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex justify-center items-center transition-colors duration-300">
        Cargando cartelera...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-500 mb-8 tracking-tight transition-colors">
          En Cartelera
        </h1>
        
        {/* Usamos el componente Carrusel con los datos de la DB */}
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