import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { logout, getToken } from '../../api/auth';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { to: '/map', label: '지도' },
  { to: '/routes', label: '경로 비교' },
  { to: '/draw', label: '경로 그리기' },
  { to: '/custom', label: '경로 목록' },
];

function NavBar() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getToken());
  const { theme, toggleTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="relative bg-secondary text-white shadow-md">
      <div className="px-6 py-3 flex items-center gap-8">
        <NavLink
          to="/"
          end
          className="font-extrabold text-lg tracking-tight text-white hover:opacity-80 transition-opacity"
          onClick={() => setMenuOpen(false)}
        >
          Weather Map
        </NavLink>

        {/* 데스크탑 메뉴 */}
        <div className="hidden md:flex gap-6">
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

        {/* 우상단 버튼 그룹 */}
        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="text-white hover:opacity-75 transition-opacity"
            aria-label="테마 전환"
          >
            <span className="material-symbols-outlined text-xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

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
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-white hover:opacity-75 transition-all"
            >
              로그인
            </NavLink>
          )}

          {/* 햄버거 (모바일만 표시) */}
          <button
            className="md:hidden text-white hover:opacity-75 transition-opacity"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="메뉴 열기"
          >
            <span className="material-symbols-outlined text-2xl">
              {menuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 드롭다운 */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-secondary z-50 shadow-lg border-t border-white/10">
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `block px-6 py-3.5 text-sm font-medium transition-all ${
                  isActive ? 'text-tertiary bg-white/10' : 'text-white hover:bg-white/10'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}

export default NavBar;