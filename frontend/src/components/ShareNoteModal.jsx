import React, { useState, useEffect } from 'react';
import { X, Share2, Trash2, Plus } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const ShareNoteModal = ({ note, onClose }) => {
  const [emails, setEmails] = useState(['']);
  const [permission, setPermission] = useState('read');
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load danh sách đang share
  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      const res = await axiosClient.get(`/notes/${note._id}/shares`);
      setShares(res.data.sharedWith || []);
    } catch {}
  };

  const handleShare = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const validEmails = emails.filter(e => e.trim());
    if (!validEmails.length) return setError('Nhập ít nhất 1 email!');
    setLoading(true);
    try {
      const res = await axiosClient.post(`/notes/${note._id}/share`, {
        emails: validEmails, permission
      });
      setSuccess('Chia sẻ thành công!');
      setEmails(['']);
      loadShares();
    } catch (err) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePermission = async (email, newPermission) => {
    try {
      await axiosClient.put(`/notes/${note._id}/share`, { email, permission: newPermission });
      loadShares();
    } catch {}
  };

  const handleRevoke = async (email) => {
    if (!window.confirm(`Thu hồi quyền của ${email}?`)) return;
    try {
      await axiosClient.delete(`/notes/${note._id}/share`, { data: { email } });
      loadShares();
    } catch {}
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#e9e9e8]">
          <div className="flex items-center gap-2">
            <Share2 size={16} />
            <div>
              <h3 className="font-semibold text-sm">Chia sẻ note</h3>
              <p className="text-xs text-[#9b9a97]">{note.title || 'Untitled'}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#9b9a97] hover:text-[#37352f]"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-5">
          {/* Form chia sẻ */}
          <form onSubmit={handleShare} className="space-y-3">
            {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs px-3 py-2 rounded-md">{error}</div>}
            {success && <div className="bg-green-50 border border-green-200 text-green-700 text-xs px-3 py-2 rounded-md">{success}</div>}

            {/* Danh sách email */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">Email người nhận</label>
              {emails.map((email, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => {
                      const arr = [...emails];
                      arr[idx] = e.target.value;
                      setEmails(arr);
                    }}
                    placeholder="email@example.com"
                    className="flex-1 px-3 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#37352f]"
                  />
                  {emails.length > 1 && (
                    <button type="button" onClick={() => setEmails(emails.filter((_, i) => i !== idx))}
                      className="text-[#9b9a97] hover:text-red-500">
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={() => setEmails([...emails, ''])}
                className="flex items-center gap-1 text-xs text-[#9b9a97] hover:text-[#37352f]">
                <Plus size={12} /> Thêm email
              </button>
            </div>

            {/* Quyền */}
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97]">Quyền truy cập</label>
              <div className="flex gap-2 mt-1">
                <button type="button" onClick={() => setPermission('read')}
                  className={`flex-1 py-2 text-xs rounded-md border font-medium transition-all ${permission === 'read' ? 'bg-[#37352f] text-white border-[#37352f]' : 'border-[#e9e9e8] text-[#9b9a97] hover:bg-[#f7f7f5]'}`}>
                  👁 Chỉ xem
                </button>
                <button type="button" onClick={() => setPermission('edit')}
                  className={`flex-1 py-2 text-xs rounded-md border font-medium transition-all ${permission === 'edit' ? 'bg-[#37352f] text-white border-[#37352f]' : 'border-[#e9e9e8] text-[#9b9a97] hover:bg-[#f7f7f5]'}`}>
                  ✏️ Chỉnh sửa
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2 bg-[#37352f] text-white text-sm rounded-md hover:bg-black transition-colors disabled:opacity-50">
              {loading ? 'Đang chia sẻ...' : 'Chia sẻ'}
            </button>
          </form>

          {/* Danh sách đang share */}
          {shares.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#9b9a97] mb-2">Đang chia sẻ với</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {shares.map((s, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#f7f7f5] px-3 py-2 rounded-md">
                    <span className="text-sm truncate flex-1">{s.email}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <select value={s.permission}
                        onChange={e => handleUpdatePermission(s.email, e.target.value)}
                        className="text-xs bg-white border border-[#e9e9e8] rounded px-1 py-0.5 focus:outline-none">
                        <option value="read">Chỉ xem</option>
                        <option value="edit">Chỉnh sửa</option>
                      </select>
                      <button onClick={() => handleRevoke(s.email)}
                        className="text-[#9b9a97] hover:text-red-500 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareNoteModal;