import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Edit3, User } from 'lucide-react';
import axiosClient from '../api/axiosClient';

const SharedWithMe = () => {
  const navigate = useNavigate();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await axiosClient.get('/notes/shared-with-me');
        setShares(res.data);
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#f7f7f5] font-sans text-[#37352f]">
      <div className="bg-white border-b border-[#e9e9e8] px-6 py-4 flex items-center gap-4">
        <button onClick={() => navigate('/dashboard')} className="p-1.5 hover:bg-[#f7f7f5] rounded-md">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-semibold">Shared with me</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {loading && <p className="text-center text-[#9b9a97] text-sm">Đang tải...</p>}

        {!loading && shares.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-[#9b9a97] text-sm">Chưa có note nào được chia sẻ với bạn.</p>
          </div>
        )}

        <div className="space-y-3">
          {shares.map((s, idx) => (
            <div key={idx} className="bg-white border border-[#e9e9e8] rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{s.note?.title || 'Untitled'}</h3>
                  <p className="text-xs text-[#9b9a97] mt-0.5 line-clamp-2">{s.note?.content || ''}</p>
                </div>

                {/* Badge quyền */}
                <span className={`flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                  s.permission === 'edit'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}>
                  {s.permission === 'edit' ? <><Edit3 size={10} /> Chỉnh sửa</> : <><Eye size={10} /> Chỉ xem</>}
                </span>
              </div>

              {/* Thông tin người chia sẻ */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#f7f7f5]">
                <div className="w-5 h-5 rounded-full bg-[#37352f] flex items-center justify-center">
                  <User size={10} className="text-white" />
                </div>
                <p className="text-xs text-[#9b9a97]">
                  Chia sẻ bởi <strong className="text-[#37352f]">{s.owner?.displayName || s.owner?.email}</strong>
                  {' · '}
                  {new Date(s.sharedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharedWithMe;