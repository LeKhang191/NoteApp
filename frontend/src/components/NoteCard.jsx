import React from 'react';
import { Pin } from 'lucide-react';

const NoteCard = ({ title, content, image, isPinned, viewMode }) => {
  return (
    <div className={`
      relative border rounded-lg transition-all group overflow-hidden
      ${viewMode === 'list' ? 'flex items-center gap-4 p-3' : 'flex flex-col'}
      bg-[#1a1a1a] border-gray-700 hover:border-gray-500 hover:shadow-lg
    `}>

      {image && viewMode === 'grid' && (
        <div className="w-full h-40 overflow-hidden border-b border-gray-700">
          <img 
            src={image}
            alt="Attachment" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {image && viewMode === 'list' && (
        <div className="w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-700 ml-2">
          <img 
            src={image}
            alt="Thumbnail" 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className={`p-4 ${image && viewMode === 'grid' ? 'pt-3' : ''} flex-1`}>
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-white line-clamp-1 leading-tight flex-1">{title || "Untitled"}</h3>
        </div>

        <p className="text-sm text-gray-400 mt-2 line-clamp-3 leading-relaxed">
          {content || "No content..."}
        </p>

        {isPinned && (
          <div className="mt-3 flex items-center gap-1 text-[10px] text-yellow-500 font-bold tracking-widest uppercase">
            <Pin size={10} fill="currentColor" /> Pinned
          </div>
        )}
      </div>
    </div>
  );
};

export default NoteCard;