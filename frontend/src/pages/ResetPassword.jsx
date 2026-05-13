import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (form.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/auth/reset-password', {
        email,
        token,
        password: form.password,
        confirmPassword: form.confirmPassword,
      });

      setSuccess('Đặt lại mật khẩu thành công! Đang chuyển về trang đăng nhập...');
      // Bắt buộc login lại thủ công - xóa token cũ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setTimeout(() => navigate('/'), 2500);

    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col justify-center items-center px-4 font-sans text-[#37352f]">
      <div className="w-full max-w-[400px]">
        <div className="bg-white rounded-xl border border-[#e9e9e8] p-8">
          <h2 className="text-2xl font-bold mb-1">Đặt lại mật khẩu</h2>
          <p className="text-sm text-[#9b9a97] mb-6">Nhập mật khẩu mới cho tài khoản <strong>{email}</strong></p>

          {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">{error}</div>}
          {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">{success}</div>}

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mật khẩu mới */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">Mật khẩu mới</label>
                <div className="relative mt-1">
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] text-sm"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-2.5 text-[#9b9a97]">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Xác nhận mật khẩu */}
              <div>
                <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">Xác nhận mật khẩu</label>
                <div className="relative mt-1">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    required
                    placeholder="••••••••"
                    className="w-full px-3 py-2 pr-10 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] text-sm"
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-2.5 text-[#9b9a97]">
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#37352f] text-white py-2.5 rounded-md font-semibold hover:bg-black transition-all disabled:opacity-50 text-sm">
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;