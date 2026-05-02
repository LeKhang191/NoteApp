// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import NoteCard from '../components/NoteCard';
import { LayoutGrid, List, Search, Plus } from 'lucide-react'; 

const Dashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState(""); 
  const [notes, setNotes] = useState([
    { id: 1, title: "Test1", content: "complelte dashboard interface" },
    { id: 2, title: "Test2", content: "using color" },
    { id: 3, title: "Test3", content: "rubrik checkcheck" }
  ]);

  const handleDelete = (id) => {
    if (window.confirm("U sure to delete this note?")) { 
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white p-8 text-[#37352f]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Note</h1>
            <p className="text-[#9b9a97] mt-2">Save place</p>
          </div>
          <button className="flex items-center gap-2 bg-[#37352f] text-white px-4 py-2 rounded-md hover:bg-black transition-all shadow-sm">
            <Plus size={18} /> Add Note
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-2.5 text-[#9b9a97]" size={18} />
            <input 
              type="text" 
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-[#f7f7f5] border border-[#e9e9e8] rounded-md focus:outline-none focus:ring-1 focus:ring-[#37352f]"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex bg-[#f7f7f5] p-1 rounded-lg border border-[#e9e9e8]">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#37352f]' : 'text-[#9b9a97] hover:text-[#37352f]'}`}
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md flex items-center gap-2 text-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[#37352f]' : 'text-[#9b9a97] hover:text-[#37352f]'}`}
            >
              <List size={16} /> List
            </button>
          </div>
        </div>

        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "flex flex-col gap-3" 
        }>
          {filteredNotes.map(note => (
            <div key={note.id} className="relative group">
              <NoteCard title={note.title} content={note.content} viewMode={viewMode} />
              
              <button 
                onClick={() => handleDelete(note.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-red-100 text-red-400 hover:text-red-600 rounded-md shadow-sm transition-all"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        {filteredNotes.length === 0 && (
          <div className="text-center mt-20 text-[#9b9a97]">
            <p>No suitable note found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;