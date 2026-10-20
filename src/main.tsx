import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './index.css'
import { I18nProvider } from './i18n'
import { AuthProvider } from './auth'
import Layout from './Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Ranking from './pages/Ranking'
import Guides from './pages/Guides'
import Admin from './pages/Admin'
import Action from './pages/Action'
import Games from './games/Games'
import Snake from './games/Snake'
import Room from './games/Room'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="perfil" element={<Profile />} />
              <Route path="ranking" element={<Ranking />} />
              <Route path="guias" element={<Guides />} />
              <Route path="juegos" element={<Games />} />
              <Route path="juegos/snake" element={<Snake />} />
              <Route path="sala/:code" element={<Room />} />
              <Route path="admin" element={<Admin />} />
              <Route path="accion" element={<Action />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </I18nProvider>
  </StrictMode>,
)
