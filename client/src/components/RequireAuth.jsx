import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { CircularProgress } from '@mui/material';

/** Пускает на страницу только вошедшего пользователя, остальных отправляет на /login. */
export default function RequireAuth({ children }) {
  const { isAuthenticated, initialized } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!initialized) {
    return (
      <div className="require-auth" role="status" aria-label="Проверяем вход">
        <CircularProgress size={28} color="inherit" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}
