import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Game from './pages/Game';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  return token ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/game"
            element={
              <PrivateRoute>
                <Game />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/game" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
