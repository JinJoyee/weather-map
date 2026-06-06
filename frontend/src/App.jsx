import { useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { getToken, logout } from './api/auth';
import AppLayout from './layout/AppLayout';
import MapView from './components/Map/MapView';
import RouteCompare from './components/Route/RouteCompare';
import RouteList from './components/Route/RouteList';
import CustomRouteDraw from './components/Route/CustomRouteDraw';
import LoginPage from './components/Auth/LoginPage';
import SignupPage from './components/Auth/SignupPage';
import ResetPasswordPage from './components/Auth/ResetPasswordPage';

function App() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(!!getToken());

  const handleAccount = () => {
    if (loggedIn) {
      logout();
      setLoggedIn(false);
      navigate('/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/map" replace />} />
      <Route element={<AppLayout loggedIn={loggedIn} onAccount={handleAccount} />}>
        <Route path="/map"    element={<MapView />} />
        <Route path="/routes" element={<RouteCompare />} />
        <Route path="/custom" element={<RouteList loggedIn={loggedIn} />} />
        <Route path="/draw"   element={<CustomRouteDraw />} />
      </Route>
      <Route path="/login"  element={<LoginPage onLogin={() => setLoggedIn(true)} />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/reset"  element={<ResetPasswordPage />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-bg flex flex-col items-center justify-center px-6">
            <div className="bg-card rounded-card shadow-md border border-line p-8 max-w-md w-full text-center">
              <h2 className="text-3xl font-bold text-secondary mb-3">404</h2>
              <p className="text-muted mb-8">페이지를 찾을 수 없습니다.</p>
              <button
                onClick={() => navigate('/map')}
                className="w-full bg-cta text-white py-3 rounded-lvl2 font-bold hover:opacity-90 transition-all"
              >
                홈으로 돌아가기
              </button>
            </div>
          </div>
        }
      />
    </Routes>
  );
}

export default App;
