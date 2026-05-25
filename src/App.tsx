import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import Cartelera from './pages/Cartelera'
import Login from './pages/Login'
import Perfil from './pages/Perfil'
import MisEntradas from './pages/MisEntradas'
import Footer from './components/Footer'
import Header from './components/Header'
import Ticket from './pages/Ticket'

function AppContent() {
  const [session, setSession] = useState<any>(null)
  const [esadmin, setEsAdmin] = useState(false)
  const [nombreUsuario, setNombreUsuario] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null) 

  const [modoOscuro, setModoOscuro] = useState(() => {
    const temaGuardado = localStorage.getItem('tema')
    return temaGuardado ? temaGuardado === 'dark' : true
  })

  const navigate = useNavigate() 

  useEffect(() => {
    if (modoOscuro) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tema', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tema', 'light')
    }
  }, [modoOscuro])

  useEffect(() => {
    const checkUser = async (currentSession: any) => {
      setSession(currentSession)
      if (currentSession?.user) {
        const { data } = await supabase
          .from('usuario')
          .select('nombre, esadmin, avatar_url') 
          .eq('email', currentSession.user.email)
          .maybeSingle()
        
        if (data) {
          setEsAdmin(data.esadmin || false)
          setNombreUsuario(data.nombre || '')
          setAvatarUrl(data.avatar_url || null) 
        }
      } else {
        setEsAdmin(false)
        setNombreUsuario('')
        setAvatarUrl(null)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      checkUser(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      checkUser(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleCerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      
      <Header 
        session={session} 
        nombreUsuario={nombreUsuario} 
        avatarUrl={avatarUrl} 
        esadmin={esadmin}
        onLogout={handleCerrarSesion} 
        modoOscuro={modoOscuro}
        onToggleTema={() => setModoOscuro(!modoOscuro)}
      />

      <main className="flex-grow flex flex-col">
        <Routes>
          <Route path="/" element={<Cartelera />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<Perfil esadmin={esadmin} />} />
          <Route path="/mis-entradas" element={<MisEntradas />} />
          <Route path="/ticket/:id" element={<Ticket />} />
        </Routes>
      </main>

      <Footer />
      
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}