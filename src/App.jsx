import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Landing from './pages/Landing'
import Sectores from './pages/Sectores'
import ServiceDashboard from './pages/ServiceDashboard'
import TeamKanban from './pages/TeamKanban'
import Altas from './pages/Altas'
import AdminUsers from './pages/AdminUsers'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/"                                    element={<Landing />} />
          <Route path="/sectores"                            element={<Sectores />} />
          <Route path="/altas"                               element={<Altas />} />
          <Route path="/admin/users"                         element={<AdminUsers />} />
          <Route path="/service/:serviceId"                  element={<ServiceDashboard />} />
          <Route path="/service/:serviceId/team/:teamId"     element={<TeamKanban />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
