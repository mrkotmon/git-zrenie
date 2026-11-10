import { Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing/Landing.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      {/* Пока это единственная страница: любой путь отдаёт лендинг, как SPA-fallback. */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
