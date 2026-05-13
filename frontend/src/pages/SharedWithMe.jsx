import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, Edit3, User } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import { debounce } from '../utils/debounce';
import socket from '../services/socket';

const SharedWithMe = () => {
  const navigate = useNavigate();
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingShare, setEditingShare] = useState(null);
  const [noteContent, setNoteContent] = useState({ title: '', content: '' });
  const [saveStatus, setSaveStatus] = useState('');

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

  // Auto-save cho note edit
  const autoSave = useCallback(
    debounce(async (noteId, title, content) => {
      try {
        setSaveStatus('Saving...');
        await axiosClient.put(`/notes/${noteId}`, { title, content });
        setSaveStatus('Saved ✓');
        setTimeout(() => setSaveStatus(''), 2000);
      } catch {
        setSaveStatus('Error saving');
      }
    }, 800),
    []
  );

  // Mở note
  const openNote = (share) => {
    setEditingShare(share);
    setNoteContent({ title: share.note.title, content: share.note.content });
    socket.emit('join-note', share.note._id);
  };

  // Lắng nghe real-time
  useEffect(() => {
    socket.on('note-updated', ({ content, title }) => {
      setNoteContent(prev => ({
        ...prev,
        ...(content !== undefined && { content }),
        ...(title !== undefined && { title }),
      }));
    });
    return () => socket.off('note-updated');
  }, []);

  // Khi gõ
  const handleChange = (field, value) => {
    const updated = { ...noteContent, [field]: value };
    setNoteContent(updated);
    if (editingShare?.permission === 'edit') {
      socket.emit('note-change', {
        noteId: editingShare.note._id,
        content: updated.content,
        title: updated.title,
      });
      autoSave(editingShare.note._id, updated.title, updated.content);
    }
  };

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
            <div key={idx}
              onClick={() => openNote(s)}
              className="bg-white border border-[#e9e9e8] rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{s.note?.title || 'Untitled'}</h3>
                  <p className="text-xs text-[#9b9a97] mt-0.5 line-clamp-2">{s.note?.content || ''}</p>
                </div>
                <span className={`flex-shrink-0 flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                  s.permission === 'edit'
                    ? 'bg-blue-50 text-blue-600 border border-blue-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}>
                  {s.permission === 'edit' ? <><Edit3 size={10} /> Chỉnh sửa</> : <><Eye size={10} /> Chỉ xem</>}
                </span>
              </div>
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

      {/* Modal xem/edit note */}
      {editingShare && (
        <div className="fixed inset-0 bg-[#37352f]/40 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
          <div className="bg-white w-full max-w-2xl rounded-lg p-10 shadow-2xl">
            <div className="text-right text-xs text-[#9b9a97] mb-2 h-4">{saveStatus}</div>

            <input
              type="text"
              className="w-full text-4xl font-bold mb-6 outline-none text-[#37352f] placeholder-gray-200"
              value={noteContent.title}
              onChange={(e) => handleChange('title', e.target.value)}
              readOnly={editingShare.permission !== 'edit'}
              placeholder="Untitled"
              autoFocus
            />
            <textarea
              className="w-full outline-none text-gray-700 min-h-[200px] resize-none leading-relaxed text-lg"
              value={noteContent.content}
              onChange={(e) => handleChange('content', e.target.value)}
              readOnly={editingShare.permission !== 'edit'}
              placeholder="Empty note..."
            />

            {editingShare.permission !== 'edit' && (
              <p className="text-xs text-[#9b9a97] mt-4 flex items-center gap-1">
                <Eye size={12} /> Bạn chỉ có quyền xem note này.
              </p>
            )}

            <div className="flex justify-end mt-10">
              <button
                onClick={() => { setEditingShare(null); setSaveStatus(''); }}
                className="px-4 py-1.5 bg-[#37352f] text-white rounded text-sm font-medium hover:bg-black transition-all">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SharedWithMe;