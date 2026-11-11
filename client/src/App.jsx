import { Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing/Landing.jsx';
import Login from './pages/Login/Login.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      {/* Пока это единственная страница: любой путь отдаёт лендинг, как SPA-fallback. */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
