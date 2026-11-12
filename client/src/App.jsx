import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes } from 'react-router-dom';
import RequireAuth from './components/RequireAuth.jsx';
import Graph from './pages/Graph/Graph.jsx';
import Landing from './pages/Landing/Landing.jsx';
import Login from './pages/Login/Login.jsx';
import Repo from './pages/Repo/Repo.jsx';
import Runs from './pages/Runs/Runs.jsx';
import { fetchCurrentUser } from './store/authSlice.js';

export default function App() {
  const dispatch = useDispatch();
  const initialized = useSelector((state) => state.auth.initialized);

  // Один раз при запуске узнаём у сервера, вошёл ли пользователь (по cookie сессии).
  useEffect(() => {
    if (!initialized) dispatch(fetchCurrentUser());
  }, [dispatch, initialized]);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/graph" element={<Graph />} />
      <Route path="/repo/:owner/:name" element={<Repo />} />
      <Route
        path="/runs"
        element={
          <RequireAuth>
            <Runs />
          </RequireAuth>
        }
      />
      {/* Остальные пути пока отдают лендинг, как SPA-fallback. */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}
