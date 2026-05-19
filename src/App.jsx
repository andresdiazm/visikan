import { HashRouter as BrowserRouter, Routes, Route } from 'react-router-dom'
import AppShell from './components/layout/AppShell'
import Landing from './pages/Landing'
import ServiceDashboard from './pages/ServiceDashboard'
import TeamKanban from './pages/TeamKanban'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Landing />} />
          <Route path="/service/:serviceId" element={<ServiceDashboard />} />
          <Route path="/service/:serviceId/team/:teamId" element={<TeamKanban />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
