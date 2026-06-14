import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back, Admin!');
      navigate('/console/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Decorative clean background mesh */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -mr-60 -mt-60" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-brand-50 rounded-full mix-blend-multiply filter blur-3xl opacity-40 -ml-60 -mb-60" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-700 rounded-2xl flex items-center justify-center font-bold text-white text-2xl font-display mx-auto mb-4 shadow-elevated">
            JN
          </div>
          <h1 className="font-display text-3xl font-extrabold text-surface-900 tracking-tight">Admin Portal</h1>
          <p className="text-surface-500 mt-1 text-sm font-medium">Sign in to manage your training portfolio</p>
        </div>

        <div className="card p-8 bg-white shadow-float border border-surface-200">
          <form onSubmit={handleSubmit} className="space-y-5" id="admin-login-form">
            <div>
              <label className="input-label" htmlFor="admin-email">
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="admin@portfolio.com"
                className="input"
              />
            </div>
            <div>
              <label className="input-label" htmlFor="admin-password">
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="input"
              />
            </div>
            <button
              id="admin-login-submit"
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In →'
              )}
            </button>
          </form>
        </div>


      </div>
    </div>
  );
}
