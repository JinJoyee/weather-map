import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getToken } from '../../api/auth';

const NAV_ITEMS = [
  { to: '/map', label: '지도' },
  { to: '/routes', label: '경로 비교' },
  { to: '/draw', label: '경로 그리기' },
  { to: '/custom', label: '경로 목록' },
];

function NavBar() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getToken());

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-secondary text-white px-6 py-3 flex items-center gap-8 shadow-md">
      <NavLink
        to="/"
        end
        className="font-extrabold text-lg tracking-tight text-white hover:opacity-80 transition-opacity"
      >
        Weather Map
      </NavLink>

      <div className="flex gap-6">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `text-sm font-medium transition-all ${
                isActive
                  ? 'text-tertiary underline underline-offset-4'
                  : 'text-white hover:opacity-75'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </div>

      <div className="ml-auto">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white hover:opacity-75 transition-all"
          >
            로그아웃
          </button>
        ) : (
          <NavLink
            to="/login"
            className="text-sm font-medium text-white hover:opacity-75 transition-all"
          >
            로그인
          </NavLink>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
