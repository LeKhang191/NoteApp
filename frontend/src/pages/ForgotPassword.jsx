import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Bước 1: Gửi email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosClient.post('/auth/forgot-password', { email });
      setSuccess('Email đã được gửi! Kiểm tra hộp thư của bạn.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  // Bước 2: Xác nhận OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axiosClient.post('/auth/verify-otp', { email, otp });
      // Chuyển sang trang đặt lại mật khẩu kèm token
      navigate(`/reset-password?token=${res.data.token}&email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP không đúng!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex flex-col justify-center items-center px-4 font-sans text-[#37352f]">
      <div className="w-full max-w-[400px]">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-[#9b9a97] hover:text-[#37352f] mb-8 transition-colors">
          <ArrowLeft size={16} /> Quay lại đăng nhập
        </button>

        <div className="bg-white rounded-xl border border-[#e9e9e8] p-8">
          <h2 className="text-2xl font-bold mb-1">Quên mật khẩu</h2>

          {/* BƯỚC 1: Nhập email */}
          {step === 1 && (
            <>
              <p className="text-sm text-[#9b9a97] mb-6">Nhập email để nhận link + OTP đặt lại mật khẩu.</p>
              {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">{error}</div>}
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@example.com"
                    className="mt-1 w-full px-3 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] text-sm"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#37352f] text-white py-2.5 rounded-md font-semibold hover:bg-black transition-all disabled:opacity-50 text-sm">
                  {loading ? 'Đang gửi...' : 'Gửi email'}
                </button>
              </form>
            </>
          )}

          {/* BƯỚC 2: Nhập OTP */}
          {step === 2 && (
            <>
              <p className="text-sm text-[#9b9a97] mb-2">Email đã được gửi đến <strong>{email}</strong></p>
              <p className="text-sm text-[#9b9a97] mb-6">Nhập mã OTP 6 số từ email <span className="text-[#37352f]">hoặc</span> click link trong email.</p>
              {success && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-md">{success}</div>}
              {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-md">{error}</div>}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">Mã OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    maxLength={6}
                    placeholder="123456"
                    className="mt-1 w-full px-3 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] text-sm tracking-widest text-center text-lg font-bold"
                  />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-[#37352f] text-white py-2.5 rounded-md font-semibold hover:bg-black transition-all disabled:opacity-50 text-sm">
                  {loading ? 'Đang xác nhận...' : 'Xác nhận OTP'}
                </button>
                <button type="button" onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                  className="w-full text-sm text-[#9b9a97] hover:text-[#37352f] transition-colors">
                  Gửi lại email
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;