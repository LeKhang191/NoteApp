import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu mới không khớp!');
      return;
    }

    if (form.newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự!');
      return;
    }

    setLoading(true);
    try {
      await axiosClient.post('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      setSuccess('Đổi mật khẩu thành công!');
      setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => navigate('/profile'), 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-sans text-[#37352f]">
      {/* Header */}
      <div className="bg-white border-b border-[#e9e9e8] px-6 py-4 flex items-center gap-4">
        <button
          onClick={() => navigate('/profile')}
          className="p-1.5 hover:bg-[#f7f7f5] rounded-md transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">Change Password</h1>
      </div>

      <div className="max-w-md mx-auto px-6 py-10">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">
            {success}
          </div>
        )}

        <div className="bg-white rounded-xl border border-[#e9e9e8] p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Mật khẩu cũ */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">
                Mật khẩu hiện tại
              </label>
              <div className="relative mt-1">
                <input
                  type={showOld ? 'text' : 'password'}
                  value={form.oldPassword}
                  onChange={(e) => setForm({ ...form, oldPassword: e.target.value })}
                  required
                  className="w-full px-3 py-2 pr-10 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowOld(!showOld)}
                  className="absolute right-3 top-2.5 text-[#9b9a97] hover:text-[#37352f]">
                  {showOld ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Mật khẩu mới */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">
                Mật khẩu mới
              </label>
              <div className="relative mt-1">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={form.newPassword}
                  onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                  required
                  className="w-full px-3 py-2 pr-10 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-2.5 text-[#9b9a97] hover:text-[#37352f]">
                  {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu mới */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">
                Xác nhận mật khẩu mới
              </label>
              <div className="relative mt-1">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                  className="w-full px-3 py-2 pr-10 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-2.5 text-[#9b9a97] hover:text-[#37352f]">
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#37352f] text-white py-2.5 rounded-md font-semibold hover:bg-black transition-all disabled:opacity-50 text-sm"
            >
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;