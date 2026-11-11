import { Route, Routes } from 'react-router-dom';
import Graph from './pages/Graph/Graph.jsx';
import Landing from './pages/Landing/Landing.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/graph" element={<Graph />} />
      {/* Остальные пути пока отдают лендинг, как SPA-fallback. */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
