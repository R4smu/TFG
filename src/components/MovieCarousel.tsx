import { useEffect, useRef, useCallback } from 'react'
import MovieCard from './MovieCard'

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

interface MovieCarouselProps {
  peliculas: Pelicula[];
  onVerDetalles: (pelicula: Pelicula) => void;
  modalAbierto: boolean;
}

export default function MovieCarousel({ peliculas, onVerDetalles, modalAbierto }: MovieCarouselProps) {
  const carruselRef = useRef<HTMLDivElement>(null)
  const intervaloRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const peliculasInfinitas = [...peliculas, ...peliculas, ...peliculas, ...peliculas, ...peliculas]
  
  const iniciarAutoPlay = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current)
    intervaloRef.current = setInterval(() => {
      if (carruselRef.current) {
        carruselRef.current.scrollLeft += 304 
      }
    }, 3500)
  }, [])

  const detenerAutoPlay = useCallback(() => {
    if (intervaloRef.current) { 
      clearInterval(intervaloRef.current)
      intervaloRef.current = null 
    }
  }, [])

  useEffect(() => {
    if (peliculas.length > 0 && !modalAbierto) {
      iniciarAutoPlay()
      if (carruselRef.current && carruselRef.current.scrollLeft === 0) {
        carruselRef.current.style.scrollBehavior = 'auto'
        carruselRef.current.scrollLeft = (peliculas.length * 304) * 2
        setTimeout(() => {
          if (carruselRef.current) carruselRef.current.style.scrollBehavior = 'smooth'
        }, 50)
      }
    } else if (modalAbierto) {
      detenerAutoPlay()
    }
    return () => detenerAutoPlay()
  }, [peliculas, iniciarAutoPlay, detenerAutoPlay, modalAbierto])

  const handleScroll = () => {
    if (!carruselRef.current || peliculas.length === 0) return
    const anchoBloque = peliculas.length * 304
    const { scrollLeft } = carruselRef.current
    
    if (scrollLeft <= anchoBloque) {
      carruselRef.current.style.scrollBehavior = 'auto'
      carruselRef.current.scrollLeft = scrollLeft + (anchoBloque * 2)
      setTimeout(() => { if(carruselRef.current) carruselRef.current.style.scrollBehavior = 'smooth' }, 50)
    } else if (scrollLeft >= anchoBloque * 4) {
      carruselRef.current.style.scrollBehavior = 'auto'
      carruselRef.current.scrollLeft = scrollLeft - (anchoBloque * 2)
      setTimeout(() => { if(carruselRef.current) carruselRef.current.style.scrollBehavior = 'smooth' }, 50)
    }
  }

  const scrollIzquierda = () => {
    if (carruselRef.current) {
      carruselRef.current.scrollLeft -= 304
      iniciarAutoPlay()
    }
  }

  const scrollDerecha = () => {
    if (carruselRef.current) {
      carruselRef.current.scrollLeft += 304
      iniciarAutoPlay()
    }
  }

  if (peliculas.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400 transition-colors">No hay películas en cartelera en este momento.</p>
  }

  return (
    <div 
      className="relative group transition-colors duration-300"
      onMouseEnter={detenerAutoPlay}
      onMouseLeave={() => { if (!modalAbierto) iniciarAutoPlay() }}
    >
      {/* Botón Izquierda */}
      <button 
        onClick={scrollIzquierda}
        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 z-20 cursor-pointer bg-white/90 dark:bg-gray-800/90 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white text-gray-800 dark:text-white w-12 h-12 flex items-center justify-center rounded-full shadow-xl border border-gray-200 dark:border-gray-600 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      {/* Contenedor Carrusel */}
      <div 
        ref={carruselRef} 
        onScroll={handleScroll} 
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-8 pt-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {peliculasInfinitas.map((pelicula, index) => (
          <div key={`${pelicula.idpelicula}-${index}`} className="snap-start shrink-0">
            <MovieCard 
              pelicula={pelicula}
              onMouseEnter={() => {}} 
              onMouseLeave={() => {}}
              onVerDetalles={onVerDetalles}
            />
          </div>
        ))}
      </div>

      {/* Botón Derecha */}
      <button 
        onClick={scrollDerecha}
        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 z-20 cursor-pointer bg-white/90 dark:bg-gray-800/90 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white dark:hover:text-white text-gray-800 dark:text-white w-12 h-12 flex items-center justify-center rounded-full shadow-xl border border-gray-200 dark:border-gray-600 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  )
}