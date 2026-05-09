import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock } from 'lucide-react';
import axiosClient from '../api/axiosClient';

// mode: 'verify' | 'enable' | 'disable' | 'change'
const NotePasswordModal = ({ noteId, mode, onSuccess, onClose }) => {
  const [form, setForm] = useState({
    password: '', confirmPassword: '',
    currentPassword: '', newPassword: '', newConfirm: ''
  });
  const [show, setShow] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleShow = (field) => setShow(p => ({ ...p, [field]: !p[field] }));

  const Input = ({ field, placeholder, label }) => (
    <div>
      {label && <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">{label}</label>}
      <div className="relative mt-1">
        <input
          type={show[field] ? 'text' : 'password'}
          placeholder={placeholder || '••••••••'}
          value={form[field]}
          onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
          className="w-full px-3 py-2 pr-10 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f] text-sm"
        />
        <button type="button" onClick={() => toggleShow(field)}
          className="absolute right-3 top-2.5 text-[#9b9a97] hover:text-[#37352f]">
          {show[field] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'verify') {
        const res = await axiosClient.post(`/notes/${noteId}/verify-password`, { password: form.password });
        onSuccess(res.data.note);

      } else if (mode === 'enable') {
        if (form.password !== form.confirmPassword)
          return setError('Mật khẩu xác nhận không khớp!');
        await axiosClient.post(`/notes/${noteId}/enable-password`, {
          password: form.password, confirmPassword: form.confirmPassword
        });
        onSuccess();

      } else if (mode === 'disable') {
        await axiosClient.post(`/notes/${noteId}/disable-password`, { password: form.password });
        onSuccess();

      } else if (mode === 'change') {
        if (form.newPassword !== form.newConfirm)
          return setError('Mật khẩu mới không khớp!');
        await axiosClient.post(`/notes/${noteId}/change-password`, {
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.newConfirm
        });
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const titles = {
    verify:  '🔒 Nhập mật khẩu để mở note',
    enable:  '🔒 Bật bảo vệ mật khẩu',
    disable: '🔓 Tắt bảo vệ mật khẩu',
    change:  '🔑 Đổi mật khẩu note',
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e9e9e8]">
          <div className="flex items-center gap-2">
            <Lock size={16} />
            <h3 className="font-semibold text-sm">{titles[mode]}</h3>
          </div>
          <button onClick={onClose} className="text-[#9b9a97] hover:text-[#37352f]">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-md">{error}</div>}

          {/* VERIFY: chỉ nhập password */}
          {mode === 'verify' && <Input field="password" label="Mật khẩu" />}

          {/* ENABLE: nhập 2 lần */}
          {mode === 'enable' && <>
            <Input field="password" label="Mật khẩu mới" />
            <Input field="confirmPassword" label="Xác nhận mật khẩu" />
          </>}

          {/* DISABLE: nhập mật khẩu hiện tại */}
          {mode === 'disable' && <Input field="password" label="Nhập mật khẩu hiện tại để xác nhận" />}

          {/* CHANGE: nhập cũ → mới 2 lần */}
          {mode === 'change' && <>
            <Input field="currentPassword" label="Mật khẩu hiện tại" />
            <Input field="newPassword" label="Mật khẩu mới" />
            <Input field="newConfirm" label="Xác nhận mật khẩu mới" />
          </>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 text-sm text-[#9b9a97] hover:text-[#37352f] border border-[#e9e9e8] rounded-md transition-colors">
              Hủy
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2 text-sm bg-[#37352f] text-white rounded-md hover:bg-black transition-colors disabled:opacity-50">
              {loading ? 'Đang xử lý...' : 'Xác nhận'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NotePasswordModal;