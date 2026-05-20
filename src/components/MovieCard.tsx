import { Link } from 'react-router-dom'

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

interface MovieCardProps {
  pelicula: Pelicula;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onVerDetalles: (pelicula: Pelicula) => void;
}

export default function MovieCard({ pelicula, onMouseEnter, onMouseLeave, onVerDetalles }: MovieCardProps) {
  return (
    <div 
      className="min-w-[280px] w-[280px] snap-start shrink-0 bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:scale-105 transition-all duration-300 flex flex-col border border-gray-700"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="h-[400px] relative">
        <img src={pelicula.posterurl} alt={pelicula.titulo} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80"></div>
      </div>
      <div className="p-5 flex-1 flex flex-col justify-between z-10 -mt-16">
        <div>
          <h2 className="text-xl font-bold mb-2 line-clamp-1 text-white">{pelicula.titulo}</h2>
          <p className="text-gray-300 text-sm mb-4 bg-gray-900/60 inline-block px-2 py-1 rounded backdrop-blur-sm">
            {pelicula.genero} • {pelicula.duracion} min
          </p>
        </div>
        <button 
          onClick={() => onVerDetalles(pelicula)}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-semibold transition-colors"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  )
}