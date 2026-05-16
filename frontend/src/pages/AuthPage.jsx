import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State hiện/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const res = await axiosClient.post('/auth/login', { email, password });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      } else {
        if (password !== confirmPassword) {
          setError('Mật khẩu xác nhận không khớp!');
          setLoading(false);
          return;
        }
        const res = await axiosClient.post('/auth/register', {
          email, displayName, password, confirmPassword,
        });
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra, thử lại nhé!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col justify-center items-center px-4 font-sans text-[#37352f]">
      <div className="mb-10 flex flex-col items-center">
        <div className="w-12 h-12 border-2 border-[#37352f] rounded-xl flex items-center justify-center mb-3 shadow-[4px_4px_0px_0px_rgba(55,53,47,1)]">
          <span className="text-2xl font-black">N</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight">Note App</h1>
      </div>

      <div className="w-full max-w-[400px] space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            {isLogin ? "Welcome back" : "Create Account"}
          </h2>
          <p className="text-[#9b9a97] text-sm">
            {isLogin ? "Log in to organize notes." : "Sign up to organize your work."}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97] ml-1">
                Display Name
              </label>
              <input
                type="text"
                placeholder="Your name..."
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                className="w-full px-4 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] transition-all placeholder:text-gray-300"
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97] ml-1">
              Email
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] transition-all placeholder:text-gray-300"
            />
          </div>

          {/* Password + icon mắt */}
          <div className="space-y-1">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">
                Password
              </label>
              {isLogin && (
                <button type="button" onClick={() => navigate('/forgot-password')}
                  className="text-[11px] text-[#9b9a97] hover:text-[#37352f] hover:underline underline-offset-2 transition-all">
                  Quên mật khẩu?
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 pr-10 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] transition-all placeholder:text-gray-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-[#9b9a97] hover:text-[#37352f] transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm Password + icon mắt */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97] ml-1">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 pr-10 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-[#9b9a97] hover:text-[#37352f] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#37352f] text-white py-2.5 rounded-md font-semibold hover:bg-black transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : (isLogin ? 'Log in' : 'Sign up')}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="pt-4 border-t border-[#e9e9e8] text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setShowPassword(false); setShowConfirm(false); }}
            className="text-sm text-[#37352f] opacity-60 hover:opacity-100 hover:underline underline-offset-4 transition-all"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Log in"}
        </button>
        </div>
      </div>

      <footer className="mt-20 text-[12px] text-[#9b9a97]">
        <p>© 2026 NoteApp</p>
      </footer>
    </div>
  );
};

export default AuthPage;