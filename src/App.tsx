import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import LoginPage from './pages/LoginPage';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="doctors" element={<Doctors />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<Register />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
    </Routes>
  );
}
export default App;