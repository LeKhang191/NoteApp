import React from 'react';
import { Pin } from 'lucide-react';

const NoteCard = ({ title, content, isPinned, onTogglePin, viewMode }) => {
  return (
    <div className={`
      relative p-4 border rounded-lg transition-all group
      ${viewMode === 'list' ? 'flex items-center justify-between gap-4' : 'flex flex-col'}
      /* Giữ màu tối theo giao diện trong hình image_02be5b.jpg */
      bg-[#1a1a1a] border-gray-700 hover:border-gray-500
    `}>

      <button 
        onClick={(e) => {
          e.stopPropagation();
          onTogglePin();
        }}
        className={`absolute top-3 right-12 p-1.5 rounded-md transition-all z-10
          ${isPinned 
            ? 'text-yellow-400 bg-yellow-400/10' 
            : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
          }`}
      >
        <Pin size={18} fill={isPinned ? "currentColor" : "none"} />
      </button>

      <div className={viewMode === 'list' ? 'flex-1' : ''}>
        <h3 className="font-bold text-white pr-16">{title || "Untitled"}</h3>
        <p className="text-sm text-gray-400 mt-2 line-clamp-3">{content}</p>
      </div>

      {isPinned && (
        <span className="mt-2 text-[10px] text-yellow-500 font-bold tracking-widest uppercase">
          Pinned
        </span>
      )}
    </div>
  );
};

export default NoteCard;