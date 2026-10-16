import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import Layout from './components/Layout';
import RotaPrivada from './components/RotaPrivada';
import RotaAdmin from './components/RotaAdmin';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import AdminPaises from './pages/admin/Paises';
import PaisForm from './pages/admin/PaisForm';
import CidadeForm from './pages/admin/CidadeForm';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* única página aberta */}
          <Route path="login" element={<Login />} />

          {/* todo o resto exige login */}
          <Route element={<RotaPrivada><Layout /></RotaPrivada>}>
            <Route index element={<Inicio />} />

            <Route path="admin" element={<RotaAdmin><AdminPaises /></RotaAdmin>} />
            <Route path="admin/paises/novo" element={<RotaAdmin><PaisForm /></RotaAdmin>} />
            <Route path="admin/paises/:id" element={<RotaAdmin><PaisForm /></RotaAdmin>} />
            <Route path="admin/paises/:paisId/cidades/nova"
                   element={<RotaAdmin><CidadeForm /></RotaAdmin>} />
            <Route path="admin/cidades/:id" element={<RotaAdmin><CidadeForm /></RotaAdmin>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
