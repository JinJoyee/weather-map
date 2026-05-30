import { NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { to: '/map', label: '지도' },
  { to: '/routes', label: '경로 비교' },
  { to: '/custom', label: '경로 목록' },
];

function NavBar() {
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
    </nav>
  );
}

export default NavBar;
