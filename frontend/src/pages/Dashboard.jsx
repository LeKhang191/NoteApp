import React, { useState, useEffect } from 'react';
import NoteCard from '../components/NoteCard';
import { 
  LayoutGrid, List, Search, Plus, Pin, Trash2, 
  Settings, Clock, ChevronLeft, Menu, Tag, BookOpen
} from 'lucide-react'; 

const Dashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [newNote, setNewNote] = useState({ title: "", content: "", image: null });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('note-app-data');
    if (saved) return JSON.parse(saved);
    return [
      { id: 1, title: "Test1", content: "complelte dashboard interface", isPinned: false },
      { id: 2, title: "Test2", content: "using color", isPinned: false },
      { id: 3, title: "Test3", content: "rubrik checkcheck", isPinned: false }
    ];
  });

  useEffect(() => {
    localStorage.setItem('note-app-data', JSON.stringify(notes));
  }, [notes]);

  const handleDelete = (id) => {
    if (window.confirm("U sure to delete this note?")) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const handleSaveNote = (e) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;
    if (editingNote) {
      setNotes(notes.map(n => n.id === editingNote.id ? { ...n, ...newNote} : n));
    } else {
      const noteToAdd = { id: Date.now(), ...newNote, isPinned: false };
      setNotes([noteToAdd, ...notes]);
    }
    setEditingNote(null);
    setNewNote({ title: "", content: "", image: null });
    setIsModalOpen(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewNote({ ...newNote, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const startEditing = (note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content, image: note.image || null });
    setIsModalOpen(true);
  };

  const togglePin = (id) => {
    setNotes(notes.map(note => note.id === id ? { ...note, isPinned: !note.isPinned } : note));
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayNotes = [...filteredNotes].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="flex min-h-screen bg-white font-sans text-[#37352f]">
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-0'} bg-[#f7f7f5] transition-all duration-300 border-r border-[#e9e9e8] flex flex-col overflow-hidden relative group`}>
        <div className="p-4 flex flex-col gap-1 min-w-[256px]">
          <div className="flex items-center justify-between p-2 hover:bg-[#ebebeb] rounded-md cursor-pointer mb-4">
            <div className="flex items-center gap-2 font-semibold">
              <div className="w-5 h-5 bg-[#37352f] text-white rounded flex items-center justify-center text-[10px]">K</div>
              <span className="truncate text-sm">Neat New Note</span>
            </div>
            <ChevronLeft size={16} onClick={() => setIsSidebarOpen(false)} className="text-[#9b9a97] hover:text-[#37352f]" />
          </div>
          
          <button className="flex items-center gap-2 p-1.5 hover:bg-[#ebebeb] rounded-md text-sm"><Search size={16}/> Search</button>
          <button className="flex items-center gap-2 p-1.5 hover:bg-[#ebebeb] rounded-md text-sm"><Clock size={16}/> Updates</button>
          <button className="flex items-center gap-2 p-1.5 hover:bg-[#ebebeb] rounded-md text-sm"><Settings size={16}/> Settings</button>
          
          <div className="mt-6 text-[11px] font-semibold text-[#9b9a97] px-2 py-1 uppercase tracking-wider">Workspace</div>
          <button className="flex items-center justify-between p-1.5 hover:bg-[#ebebeb] rounded-md text-sm">
            <div className="flex items-center gap-2"><BookOpen size={16}/> Library</div>
          </button>
          <button className="flex items-center justify-between p-1.5 hover:bg-[#ebebeb] rounded-md text-sm">
            <div className="flex items-center gap-2"><Tag size={16}/> Promotion</div>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-white">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="fixed top-4 left-4 p-2 hover:bg-[#f7f7f5] rounded-md z-50 text-[#9b9a97]">
            <Menu size={20} />
          </button>
        )}

        <div className="max-w-[1200px] w-full mx-auto px-6 md:px-16 py-12">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold tracking-tight">My Note</h1>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 bg-[#37352f] text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-black transition-all shadow-sm"
            >
              <Plus size={16} /> New
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-[#9b9a97]" size={16} />
              <input 
                type="text" 
                placeholder="Search notes..."
                className="w-full pl-9 pr-4 py-1.5 bg-[#f7f7f5] border border-[#e9e9e8] rounded outline-none focus:ring-1 focus:ring-[#37352f]/20 transition-all text-sm"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex bg-[#f7f7f5] p-1 rounded-md border border-[#e9e9e8]">
              <button 
                onClick={() => setViewMode('grid')} 
                className={`p-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#37352f]' : 'text-[#9b9a97]'}`}
              >
                <LayoutGrid size={14} /> Grid
              </button> 
              <button 
                onClick={() => setViewMode('list')} 
                className={`p-1.5 rounded flex items-center gap-2 text-xs font-medium transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#37352f]' : 'text-[#9b9a97]'}`}
              >
                <List size={14} /> List
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
            : "flex flex-col gap-2"
          }>
            {displayNotes.map(note => (
              <div 
                key={note.id} 
                className="relative group cursor-pointer" 
                onClick={() => startEditing(note)}
              >
                <NoteCard 
                  title={note.title} 
                  content={note.content} 
                  image={note.image}
                  viewMode={viewMode}
                  isPinned={note.isPinned}
                />
                
                <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); togglePin(note.id)}} 
                    className={`p-1 rounded border shadow-sm transition-all ${note.isPinned ? 'bg-yellow-50 border-yellow-200 text-yellow-600' : 'bg-white border-gray-200 text-gray-400 hover:text-black'}`}
                  >
                    <Pin size={12} fill={note.isPinned ? "currentColor" : "none"} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDelete(note.id)}} 
                    className="p-1 bg-white border border-gray-200 text-gray-400 hover:text-red-600 hover:border-red-100 rounded shadow-sm transition-all"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#37352f]/40 flex items-center justify-center z-50 p-4 backdrop-blur-[1px]">
          <div className="bg-white w-full max-w-2xl rounded-lg p-10 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <form onSubmit={handleSaveNote}>
              <input 
                type="text" 
                placeholder='Untitled' 
                className="w-full text-4xl font-bold mb-6 outline-none text-[#37352f] placeholder-gray-200" 
                value={newNote.title} 
                onChange={(e) => setNewNote({...newNote, title: e.target.value})} 
                autoFocus
              />
              <textarea 
                placeholder="Empty note..." 
                className="w-full outline-none text-gray-700 min-h-[200px] resize-none leading-relaxed text-lg" 
                value={newNote.content} 
                onChange={(e) => setNewNote({...newNote, content: e.target.value})}
              ></textarea>
              
              <div className="mt-8 pt-6 border-t border-gray-100"> 
                <label className="text-[11px] font-bold text-[#9b9a97] uppercase tracking-widest block mb-3">Cover Image</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-[#9b9a97] file:mr-4 file:py-1.5 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#f7f7f5] file:text-[#37352f] hover:file:bg-[#ebebeb] cursor-pointer"
                  />
                  {newNote.image && (
                    <div className="relative inline-block group">
                      <img src={newNote.image} alt="Preview" className="h-12 w-12 object-cover rounded border" />
                      <button
                        type="button"
                        onClick={() => setNewNote({ ...newNote, image: null })}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Plus size={10} className="rotate-45" /> 
                      </button>
                    </div>
                  )}
                </div>           
              </div>

              <div className="flex justify-end gap-3 mt-10">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingNote(null); }} className="px-3 py-1.5 text-sm text-[#9b9a97] hover:text-[#37352f] transition-colors">Discard</button>
                <button type="submit" className="px-4 py-1.5 bg-[#37352f] text-white rounded text-sm font-medium hover:bg-black transition-all">
                  {editingNote ? "Save changes" : "Create page"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;