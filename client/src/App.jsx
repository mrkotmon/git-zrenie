import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Route, Routes, useLocation } from 'react-router-dom';
import RequireAuth from './components/RequireAuth.jsx';
import Graph from './pages/Graph/Graph.jsx';
import Landing from './pages/Landing/Landing.jsx';
import Login from './pages/Login/Login.jsx';
import Repo from './pages/Repo/Repo.jsx';
import Runs from './pages/Runs/Runs.jsx';
import { fetchCurrentUser, logoutUser } from './store/authSlice.js';

export default function App() {
  const dispatch = useDispatch();
  const location = useLocation();

  const initialized = useSelector((state) => state.auth.initialized);
  const logoutRequested = useSelector((state) => state.auth.logoutRequested);

  const logoutStarted = useRef(false);

  // При запуске приложения проверяем, есть ли действующая сессия.
  useEffect(() => {
    if (!initialized) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, initialized]);

  // Запускаем запрос выхода, когда пользователь уже перешёл на главную.
  useEffect(() => {
    if (
      !logoutRequested ||
      location.pathname !== '/' ||
      logoutStarted.current
    ) {
      return;
    }

    logoutStarted.current = true;

    dispatch(logoutUser()).finally(() => {
      logoutStarted.current = false;
    });
  }, [dispatch, location.pathname, logoutRequested]);

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
      <Route path="*" element={<Landing />} />
    </Routes>
  );
}