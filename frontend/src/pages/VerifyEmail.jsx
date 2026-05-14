import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    const verify = async () => {
      try {
        await axiosClient.get(`/auth/verify/${token}`);

        // Cập nhật isActivated trong localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.isActivated = true;
        localStorage.setItem('user', JSON.stringify(user));

        setStatus('success');
        setTimeout(() => navigate('/dashboard'), 3000);
      } catch (error) {
        setStatus('error');
      }
    };
    verify();
  }, [token]);

  return (
    <div className="min-h-screen bg-[#f7f7f5] flex items-center justify-center font-sans">
      <div className="bg-white rounded-xl border border-[#e9e9e8] p-10 max-w-md w-full text-center shadow-sm">
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-[#37352f] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[#37352f] font-medium">Đang kích hoạt tài khoản...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-[#37352f] mb-2">Kích hoạt thành công!</h2>
            <p className="text-[#9b9a97] text-sm">Đang chuyển về trang đăng nhập...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-xl font-bold text-[#37352f] mb-2">Link không hợp lệ!</h2>
            <p className="text-[#9b9a97] text-sm mb-4">Link đã hết hạn hoặc không đúng.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-[#37352f] text-white px-6 py-2 rounded-md text-sm hover:bg-black transition-colors"
            >
              Về trang đăng nhập
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;