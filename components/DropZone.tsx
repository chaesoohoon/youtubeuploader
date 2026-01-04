
import React, { useRef, useState } from 'react';

interface DropZoneProps {
  onFilesAdded: (files: FileList) => void;
}

const DropZone: React.FC<DropZoneProps> = ({ onFilesAdded }) => {
  const [isOver, setIsOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(e.target.files);
    }
  };

  return (
    <div 
      className={`relative group flex flex-col items-center justify-center h-64 rounded-xl cursor-pointer transition-all ${
        isOver ? 'bg-zinc-800 scale-[1.01]' : 'bg-transparent'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input 
        type="file" 
        multiple 
        accept="video/*" 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      
      <div className={`p-5 rounded-full mb-4 transition-transform group-hover:scale-110 ${isOver ? 'bg-red-600' : 'bg-zinc-800'}`}>
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      
      <div className="text-center">
        <p className="text-lg font-semibold">동영상 파일을 드래그하여 놓으세요</p>
        <p className="text-zinc-500 text-sm mt-1">또는 클릭하여 파일 탐색기 열기</p>
      </div>
      
      <div className="mt-6 flex gap-4 text-xs text-zinc-600">
        <span>MP4, MOV, AVI 지원</span>
        <span>최대 2GB</span>
      </div>
    </div>
  );
};

export default DropZone;
