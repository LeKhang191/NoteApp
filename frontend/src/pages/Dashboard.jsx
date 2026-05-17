import React, { useState, useEffect, useCallback, useRef } from 'react';
import { debounce } from '../utils/debounce';
import NoteCard from '../components/NoteCard';
import NotePasswordModal from '../components/NotePasswordModal';
import ShareNoteModal from '../components/ShareNoteModal';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import socket from '../services/socket';

import { 
  LayoutGrid, List, Search, Plus, Pin, Trash2, 
  Settings, Clock, ChevronLeft, Menu, Tag, BookOpen,
  LogOut, User, Lock, Share2
} from 'lucide-react'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid');
  const [editingNote, setEditingNote] = useState(null);
  const autoSaveRef = useRef(null);
  const [saveStatus, setSaveStatus] = useState(''); 
  const [searchTerm, setSearchTerm] = useState(""); 
  const [newNote, setNewNote] = useState({ title: "", content: "", image: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  // State cho password modal & share modal
  const [passwordModal, setPasswordModal] = useState(null);
  const [shareModal, setShareModal] = useState(null);

  // Debounce search
  const [searchDebounce, setSearchDebounce] = useState("");

  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  // Load notes từ API
  const loadNotes = useCallback(async () => {
    try {
      const res = await axiosClient.get('/notes');
      setNotes(res.data);
    } catch (error) {
      console.error('Load notes error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  // Debounce search 300ms
  useEffect(() => {
    const timer = setTimeout(() => setSearchDebounce(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

useEffect(() => {
    socket.on('note-updated', ({ content, title }) => {
        setNewNote(prev => ({
            ...prev,
            ...(content !== undefined && { content }),
            ...(title   !== undefined && { title }),
        }));
    });
    return () => socket.off('note-updated');
}, []);

  const handleNoteClick = (note) => {
    if (note.isProtected) {
      setPasswordModal({ noteId: note._id, mode: 'verify' });
    } else {
      startEditing(note);
    }
  };

  // Xác thực password thành công
  const handleVerifySuccess = (unlockedNote) => {
    setPasswordModal(null);
    if (unlockedNote) startEditing(unlockedNote);
  };

  // Tạo note mới
  const handleCreateNote = async () => {
    try {
        const res = await axiosClient.post('/notes', { title: 'Untitled', content: '' });
        await loadNotes();
        startEditing(res.data);
    } catch (error) {
        console.error('Create note error:', error);
    }
};

// Auto-save khi đang edit
const autoSave = useCallback(
    debounce(async (noteId, title, content, image) => {
        try {
            setSaveStatus('Saving...');
            await axiosClient.put(`/notes/${noteId}`, { title, content, image });
            await loadNotes();
            setSaveStatus('Saved ✓');
            setTimeout(() => setSaveStatus(''), 2000);
        } catch (err) {
            setSaveStatus('Error saving');
        }
    }, 800),
    []
);

// Khi user gõ trong modal
const handleNoteChange = (field, value) => {
    const updated = { ...newNote, [field]: value };
    setNewNote(updated);
    if (editingNote) {
        socket.emit('note-change', {
            noteId:  editingNote._id,
            content: updated.content,
            title:   updated.title,
            image:   updated.image,
        });
        autoSave(editingNote._id, updated.title, updated.content, updated.image);
    }
};

  // Xóa note
  const handleDelete = async (e, note) => {
    e.stopPropagation();
    if (note.isProtected) {
      setPasswordModal({ noteId: note._id, mode: 'verify', afterVerify: 'delete' });
      return;
    }
    if (window.confirm("Bạn có chắc muốn xóa note này?")) {
      try {
        await axiosClient.delete(`/notes/${note._id}`);
        await loadNotes();
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  // Pin/unpin note
  const togglePin = async (e, noteId) => {
    e.stopPropagation();
    try {
      await axiosClient.patch(`/notes/${noteId}/pin`);
      await loadNotes();
    } catch (error) {
      console.error('Pin error:', error);
    }
  };

  const startEditing = (note) => {
      setEditingNote(note);
      setNewNote({ title: note.title, content: note.content, image: note.image || null });
      setIsModalOpen(true);
      socket.emit('join-note', note._id);
  };

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Image = reader.result;
      
      setNewNote(prev => {
        const updated = { ...prev, image: base64Image };
        
        if (editingNote) {
          autoSave(editingNote._id, updated.title, updated.content, base64Image);

          setNotes(prevNotes => 
            prevNotes.map(note => 
              note._id === editingNote._id ? { ...note, image: base64Image } : note
            )
          );
        }
        return updated;
      });
    };
    reader.readAsDataURL(file);
  }
};

  // Cập nhật isProtected sau enable/disable
  const handlePasswordSuccess = () => {
    setPasswordModal(null);
    loadNotes();
  };

  // Filter + sort notes
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchDebounce.toLowerCase()) ||
    note.content.toLowerCase().includes(searchDebounce.toLowerCase())
  );
  const displayNotes = [...filteredNotes].sort((a, b) => {
    if (b.isPinned && !a.isPinned) return 1;
    if (a.isPinned && !b.isPinned) return -1;
    if (a.isPinned && b.isPinned) return new Date(b.pinnedAt) - new Date(a.pinnedAt);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });
  return (
    <div className="flex min-h-screen bg-white font-sans text-[#37352f]">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-[#f7f7f5] transition-all duration-300 border-r border-[#e9e9e8] flex flex-col overflow-hidden relative`}>
        <div className="p-4 flex flex-col gap-1 min-w-[256px]">
          <div className="flex items-center justify-between p-2 hover:bg-[#ebebeb] rounded-md cursor-pointer mb-4">
            <div className="flex items-center gap-2 font-semibold">
              <div className="w-5 h-5 bg-[#37352f] text-white rounded flex items-center justify-center text-[10px]">N</div>
              <span className="truncate text-sm">Neat New Note</span>
            </div>
            <ChevronLeft size={16} onClick={() => setIsSidebarOpen(false)} className="text-[#9b9a97] hover:text-[#37352f]" />
          </div>
          
          <button className="flex items-center gap-2 p-1.5 hover:bg-[#ebebeb] rounded-md text-sm">
            <Search size={16}/> Search
          </button>
          <button className="flex items-center gap-2 p-1.5 hover:bg-[#ebebeb] rounded-md text-sm">
            <Clock size={16}/> Updates
          </button>
          <button onClick={() => navigate('/preferences')}
            className="flex items-center gap-2 p-1.5 hover:bg-[#ebebeb] rounded-md text-sm">
            <Settings size={16}/> Settings
          </button>
          
          <div className="mt-6 text-[11px] font-semibold text-[#9b9a97] px-2 py-1 uppercase tracking-wider">Workspace</div>
          <button className="flex items-center gap-2 p-1.5 hover:bg-[#ebebeb] rounded-md text-sm">
            <BookOpen size={16}/> Library
          </button>
          <button className="flex items-center gap-2 p-1.5 hover:bg-[#ebebeb] rounded-md text-sm">
            <Tag size={16}/> Labels
          </button>
          <button onClick={() => navigate('/shared-with-me')}
            className="flex items-center gap-2 p-1.5 hover:bg-[#ebebeb] rounded-md text-sm">
            <Share2 size={16}/> Shared with me
          </button>

          <div className="flex-1 mt-4" />

          <button onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-2 hover:bg-[#ebebeb] rounded-md text-sm mt-2">
            <div className="w-6 h-6 rounded-full bg-[#37352f] overflow-hidden flex items-center justify-center flex-shrink-0">
              {user.avatar
                ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                : <User size={12} className="text-white" />}
            </div>
            <span className="truncate text-sm">{user.displayName || 'Profile'}</span>
          </button>

          <button onClick={() => {
              if (window.confirm("Are you sure to log out?")) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
              }
            }}
            className="flex items-center gap-2 p-1.5 hover:bg-[#fee2e2] hover:text-red-600 rounded-md text-sm transition-colors">
            <LogOut size={16} /><span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {/* Banner chưa xác thực */}
        {!user.isActivated && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-3">
            <p className="text-sm text-yellow-800">⚠️ Tài khoản chưa được xác thực. Kiểm tra email để kích hoạt.</p>
          </div>
        )}

        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="fixed top-4 left-4 p-2 hover:bg-[#f7f7f5] rounded-md z-50 text-[#9b9a97]">
            <Menu size={20} />
          </button>
        )}

        <div className="max-w-[1200px] w-full mx-auto px-6 md:px-16 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">My Notes</h1>
              <button onClick={handleCreateNote}
                className="flex items-center gap-1.5 bg-[#37352f] text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-black transition-all shadow-sm">
                <Plus size={16} /> New
              </button>            
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-[#9b9a97]" size={16} />
              <input type="text" placeholder="Search notes..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#f7f7f5] border border-[#e9e9e8] rounded outline-none focus:ring-1 focus:ring-[#37352f]/20 text-sm"
                onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <div className="flex bg-[#f7f7f5] p-1 rounded-md border border-[#e9e9e8]">
              <button onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#37352f]' : 'text-[#9b9a97]'}`}>
                <LayoutGrid size={14} /> Grid
              </button>
              <button onClick={() => setViewMode('list')}
                className={`p-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#37352f]' : 'text-[#9b9a97]'}`}>
                <List size={14} /> List
              </button>
            </div>
          </div>

          {loading && (
            <div className="text-center py-16 text-[#9b9a97] text-sm">Đang tải...</div>
          )}

          {!loading && displayNotes.length === 0 && (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">📝</p>
              <p className="text-[#9b9a97] text-sm">Chưa có note nào. Tạo note mới thôi!</p>
            </div>
          )}

          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex flex-col gap-2"}>
            {displayNotes.map(note => (
              <div key={note._id} className="relative group cursor-pointer"
                onClick={() => handleNoteClick(note)}>
                <NoteCard
                  title={note.title}
                  content={note.content}
                  image={note.image}
                  viewMode={viewMode}
                  isPinned={note.isPinned}
                  isProtected={note.isProtected}
                  isShared={note.sharedWith?.length > 0}
                />

                {/* Icon khóa + share */}
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  {note.isProtected && (
                    <span className="bg-white border border-gray-200 rounded p-0.5 shadow-sm">
                      <Lock size={10} className="text-orange-400" />
                    </span>
                  )}
                  {note.sharedWith?.length > 0 && (
                    <span className="bg-white border border-gray-200 rounded p-0.5 shadow-sm">
                      <Share2 size={10} className="text-blue-400" />
                    </span>
                  )}
                </div>

                {/* Nút hover */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <button onClick={(e) => togglePin(e, note._id)}
                    className={`p-1 rounded border shadow-sm transition-all ${note.isPinned ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-gray-200 text-gray-400 hover:text-black'}`}>
                    <Pin size={12} fill={note.isPinned ? "currentColor" : "none"} />
                  </button>

                  <button onClick={(e) => { e.stopPropagation(); setPasswordModal({ noteId: note._id, mode: note.isProtected ? 'disable' : 'enable' }); }}
                    className={`p-1 rounded border shadow-sm transition-all ${note.isProtected ? 'bg-orange-50 border-orange-200 text-orange-500' : 'bg-white border-gray-200 text-gray-400 hover:text-orange-500'}`}>
                    <Lock size={12} />
                  </button>

                  <button onClick={(e) => { e.stopPropagation(); setShareModal(note); }}
                    className="p-1 bg-white border border-gray-200 text-gray-400 hover:text-blue-500 rounded shadow-sm transition-all">
                    <Share2 size={12} />
                  </button>

                  <button onClick={(e) => handleDelete(e, note)}
                    className="p-1 bg-white border border-gray-200 text-gray-400 hover:text-red-600 rounded shadow-sm transition-all">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Modal tạo/sửa note */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[#37352f]/40 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
          <div className="bg-white w-full max-w-2xl rounded-lg p-10 shadow-2xl">
            <div className="text-right text-xs text-[#9b9a97] mb-2 h-4">{saveStatus}</div>

            <input type="text" placeholder='Untitled'
              className="w-full text-4xl font-bold mb-6 outline-none text-[#37352f] placeholder-gray-200"
              value={newNote.title}
              onChange={(e) => handleNoteChange('title', e.target.value)}
              autoFocus />
            <textarea placeholder="Empty note..."
              className="w-full outline-none text-gray-700 min-h-[200px] resize-none leading-relaxed text-lg"
              value={newNote.content}
              onChange={(e) => handleNoteChange('content', e.target.value)} />

              {editingNote?.isProtected && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button type="button"
                    onClick={() => { setIsModalOpen(false); setPasswordModal({ noteId: editingNote._id, mode: 'change' }); }}
                    className="text-xs text-[#9b9a97] hover:text-[#37352f] underline">
                    Đổi mật khẩu note
                  </button>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100">
                <label className="text-[11px] font-bold text-[#9b9a97] uppercase tracking-widest block mb-3">Cover Image</label>
                <div className="flex items-center gap-4">
                  <input type="file" accept="image/*" onChange={handleImageChange}
                    className="text-xs text-[#9b9a97] file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#f7f7f5] file:text-[#37352f] hover:file:bg-[#ebebeb] cursor-pointer" />
                  {newNote.image && (
                    <div className="relative inline-block group">
                      <img src={newNote.image} alt="Preview" className="h-12 w-12 object-cover rounded border" />
                      <button type="button" onClick={() => setNewNote({ ...newNote, image: null })}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-all">
                        <Plus size={10} className="rotate-45" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-10">
                  <button type="button"
                      onClick={() => { setIsModalOpen(false); setEditingNote(null); setSaveStatus(''); }}
                      className="px-4 py-1.5 bg-[#37352f] text-white rounded text-sm font-medium hover:bg-black transition-all">
                      Close
                  </button>
              </div>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModal && (
        <NotePasswordModal
          noteId={passwordModal.noteId}
          mode={passwordModal.mode}
          onSuccess={passwordModal.mode === 'verify' ? handleVerifySuccess : handlePasswordSuccess}
          onClose={() => setPasswordModal(null)}
        />
      )}

      {/* Share Modal */}
      {shareModal && (
        <ShareNoteModal
          note={shareModal}
          onClose={() => { setShareModal(null); loadNotes(); }}
        />
      )}
    </div>
  );
};

export default Dashboard;