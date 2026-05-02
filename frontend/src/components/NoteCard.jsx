import React from 'react';

const NoteCard = ({ title, content }) => {
  return (
    <div className="p-4 border border-[#e9e9e8] rounded-md hover:shadow-sm transition-all">
      <h3 className="font-bold text-[#37352f]">{title}</h3>
      <p className="text-sm text-[#9b9a97]">{content}</p>
    </div>
  );
};

export default NoteCard;