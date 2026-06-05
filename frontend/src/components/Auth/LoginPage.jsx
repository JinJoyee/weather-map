import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../../api/auth';
import { resolveApiError } from '../../utils/apiErrorHandler';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.username, form.password);
      navigate('/map');
    } catch (err) {
      const { message } = resolveApiError(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral dark:bg-surface-dark flex items-center justify-center px-6">
      <div className="glass-panel p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-secondary dark:text-blue-300 mb-6 text-center">로그인</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="username"
            type="text"
            placeholder="아이디"
            value={form.username}
            onChange={handleChange}
            required
            className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[#191C1E] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lvl2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            name="password"
            type="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
            className="border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-[#191C1E] dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 rounded-lvl2 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {error && <p className="text-red-500 dark:text-red-400 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="bg-primary dark:bg-blue-600 text-white py-2.5 rounded-lvl2 font-bold hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-slate-400 mt-4">
          계정이 없으신가요?{' '}
          <Link to="/signup" className="text-primary font-semibold">회원가입</Link>
        </p>
      </div>
    </div>
  );
}