// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import NoteCard from '../components/NoteCard';

const Dashboard = () => {
  const [viewMode, setViewMode] = useState('grid');
  const [notes, setNotes] = useState([
    { id: 1, title: "Học React", content: "Hoàn thành giao diện Dashboard phong cách Notion." },
    { id: 2, title: "Thiết kế UI", content: "Sử dụng màu #37352f cho đúng tiêu chuẩn." },
    { id: 3, title: "Đồ án Web", content: "Kiểm tra lại các tiêu chí chấm điểm của giảng viên." }
  ]);

  // Hàm xóa ghi chú có xác nhận (Tiêu chí 13)
  const handleDelete = (id) => {
    if (window.confirm("AAre you sure to delete this note?")) {
      setNotes(notes.filter(note => note.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-white p-8 text-[#37352f]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight">My Notes</h1>
          <button 
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="px-4 py-2 border border-[#e9e9e8] rounded-md text-sm hover:bg-[#f7f7f5] transition-all"
          >
            Chế độ {viewMode === 'grid' ? 'Danh sách' : 'Lưới'}
          </button>
        </div>

        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "flex flex-col gap-3" 
        }>
          {notes.map(note => (
            <div key={note.id} className="relative group">
              <NoteCard title={note.title} content={note.content} />
              
              <button 
                onClick={() => handleDelete(note.id)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-600 transition-all"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center mt-20 text-[#9b9a97]">
            <p>There is no note. Create new one</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;