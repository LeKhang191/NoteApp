import React, { useState, useEffect } from 'react';
import NoteCard from '../components/NoteCard';
import { LayoutGrid, List, Search, Plus, Pin, Trash2 } from 'lucide-react'; 

const Dashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [editingNote, setEditingNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState(""); 
  const [newNote, setNewNote] = useState({ title: "", content: ""});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 14
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('note-app-data');
    if (saved) 
      return JSON.parse(saved);
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
    if (window.confirm("U sure to delete this note?")) { // 13
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newNote.title.trim()) return;
    if (editingNote) {
      //update note
      setNotes(notes.map(n => n.id === editingNote.id ? { ...n, ...newNote} : n));
    } else {
      //Create new note
      const noteToAdd = { id: Date.now(), ...newNote, isPinned: false, labels: [] };
      setNotes([noteToAdd, ...notes]);
    }
    setEditingNote(null);
    setNewNote({ title: "", content: "" });
    setIsModalOpen(false);
  };

  // 15
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
    setNewNote({ title:note.title, content: note.content });
    setIsModalOpen(true);
  };

  const togglePin = (id) => { // 16
    setNotes(notes.map(note => note.id === id ? { ...note, isPinned: !note.isPinned } : note));
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) || note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayNotes = [...filteredNotes].sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));

  return (
    <div className="min-h-screen bg-white p-8 text-[#37352f]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-black">MY NOTE</h1>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#37352f] text-white px-4 py-2 rounded-md hover:bg-black transition-all"
          >
            <Plus size={18} /> Add 
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10 text-black">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-[#9b9a97]" size={18} />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md outline-none"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-[#f7f7f5] p-1 rounded-lg border border-[#e9e9e8]">
            <button 
              onClick={() => setViewMode('grid')} 
              className={`p-2 rounded-md flex items-center gap-2 text-sm ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-[#9b9a97]'}`}
            >
              <LayoutGrid size={16} /> Grid
            </button> 
            <button 
              onClick={() => setViewMode('list')} 
              className={`p-2 rounded-md flex items-center gap-2 text-sm ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-[#9b9a97]'}`}
            >
              <List size={16} /> List
            </button>
          </div>
        </div>

        <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-3"}>
          {displayNotes.map(note => (
            <div 
              key={note.id} 
              className="relative group" 
              onClick={() => startEditing(note)}
            >
              <NoteCard 
                title={note.title} 
                content={note.content} 
                image={note.image}
                viewMode={viewMode}
                isPinned={note.isPinned}
              />
              
              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all z-20">
                <button onClick={(e) => { e.stopPropagation(); togglePin(note.id)}} className={`p-1.5 rounded-md border ${note.isPinned ? 'bg-yellow-500/20 border-yellow-500 text-yellow-600' : 'bg-white border-gray-200 text-gray-400'}`}>
                  <Pin size={14} fill={note.isPinned ? "currentColor" : "none"} />
                </button>
                <button onClick={(e) => { e.stopPropagation(); handleDelete(note.id)}} className="p-1.5 bg-white border border-red-100 text-red-400 hover:bg-red-50 rounded-md">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-gray-200 w-full max-w-md rounded-xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4">{editingNote ? "Edit Note" : "New Note"}</h2>
            <form onSubmit={handleCreateNote}>
              <input type="text" placeholder='Title' className="w-full border-b pb-2 mb-4 outline-none font-semibold text-black" value={newNote.title} onChange={(e) => setNewNote({...newNote, title: e.target.value})} />
              <textarea placeholder="Write something..." className="w-full outline-none text-gray-600 h-32 resize-none" value={newNote.content} onChange={(e) => setNewNote({...newNote, content: e.target.value})}></textarea>
              <div className="mt-4"> 
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-sm text-gray-500 file:py-1 file:px-3 file: rounded-full file: border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  />
                  {newNote.image && (
                    <div className="mt-2 relative inline-block">
                      <img src={newNote.image} alt="Preview" className="h-20 w-auto rounded border" />
                      <button
                        type="button"
                        onClick={() => setNewNote({ ...newNote, image: null })}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <Plus size={12} className="rotate-45" /> 
                      </button>
                    </div>
                  )}           
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingNote(null); }} className="px-4 py-2 text-gray-400">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">{editingNote ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>

    
  );
};

export default Dashboard;