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
  const animandoRef = useRef(false)

  const peliculasInfinitas = [...peliculas, ...peliculas, ...peliculas, ...peliculas, ...peliculas]

  const obtenerAnchoTarjeta = useCallback(() => {
    if (!carruselRef.current || carruselRef.current.children.length === 0) return 304;
    const tarjeta = carruselRef.current.children[0] as HTMLElement;
    const estilos = window.getComputedStyle(carruselRef.current);
    const gap = parseFloat(estilos.gap) || 24; // 24px = gap-6
    return tarjeta.offsetWidth + gap;
  }, []);

  const verificarSaltosInfinitos = useCallback(() => {
    if (!carruselRef.current || peliculas.length === 0) return;
    
    const el = carruselRef.current;
    const anchoBloque = peliculas.length * obtenerAnchoTarjeta();
    const scrollActual = el.scrollLeft;
    
    if (scrollActual <= anchoBloque) {
      el.style.scrollSnapType = 'none';
      el.scrollLeft = scrollActual + (anchoBloque * 2);
      void el.offsetWidth;
      el.style.scrollSnapType = 'x mandatory';
    } else if (scrollActual >= anchoBloque * 4) {
      el.style.scrollSnapType = 'none';
      el.scrollLeft = scrollActual - (anchoBloque * 2);
      void el.offsetWidth;
      el.style.scrollSnapType = 'x mandatory';
    }
  }, [peliculas.length, obtenerAnchoTarjeta]);


  const animarDesplazamiento = useCallback((direccion: 1 | -1) => {
    if (!carruselRef.current || animandoRef.current) return;
    
    const el = carruselRef.current;
    const anchoDesplazamiento = obtenerAnchoTarjeta();
    
    animandoRef.current = true;
    el.style.scrollSnapType = 'none';
    el.style.scrollBehavior = 'auto';

    const posicionInicial = el.scrollLeft;
    const distanciaFinal = anchoDesplazamiento * direccion;
    const duracionAnimacion = 500;
    let tiempoInicio: number | null = null;

    const pasoAnimacion = (tiempoActual: number) => {
      if (tiempoInicio === null) tiempoInicio = tiempoActual;
      const tiempoTranscurrido = tiempoActual - tiempoInicio;
      const progreso = Math.min(tiempoTranscurrido / duracionAnimacion, 1);
      
      const curvaSuave = progreso < 0.5 ? 2 * progreso * progreso : 1 - Math.pow(-2 * progreso + 2, 2) / 2;
      
      el.scrollLeft = posicionInicial + (distanciaFinal * curvaSuave);

      if (progreso < 1) {
        requestAnimationFrame(pasoAnimacion);
      } else {
        el.style.scrollSnapType = 'x mandatory';
        animandoRef.current = false;
        verificarSaltosInfinitos();
      }
    };

    requestAnimationFrame(pasoAnimacion);
  }, [obtenerAnchoTarjeta, verificarSaltosInfinitos]);

  const iniciarAutoPlay = useCallback(() => {
    if (intervaloRef.current) clearInterval(intervaloRef.current)
    intervaloRef.current = setInterval(() => {
      animarDesplazamiento(1)
    }, 3500)
  }, [animarDesplazamiento])

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
        const el = carruselRef.current
        el.style.scrollSnapType = 'none';
        el.scrollLeft = (peliculas.length * obtenerAnchoTarjeta()) * 2;
        void el.offsetWidth;
        el.style.scrollSnapType = 'x mandatory';
      }
    } else {
      detenerAutoPlay()
    }
    return () => detenerAutoPlay()
  }, [peliculas, iniciarAutoPlay, detenerAutoPlay, modalAbierto, obtenerAnchoTarjeta])

  const handleScrollManual = () => {
    if (!animandoRef.current) {
      verificarSaltosInfinitos();
    }
  }

  const scrollIzquierda = () => {
    animarDesplazamiento(-1);
    iniciarAutoPlay();
  }

  const scrollDerecha = () => {
    animarDesplazamiento(1);
    iniciarAutoPlay();
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

      {/* Contenedor del Carrusel */}
      <div 
        ref={carruselRef} 
        onScroll={handleScrollManual} 
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 pt-4 px-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
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