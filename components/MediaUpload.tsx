import React, { useCallback, useState } from 'react';
import { Upload, X, Image as ImageIcon, Video as VideoIcon, Film } from 'lucide-react';

interface MediaUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

const MediaUpload: React.FC<MediaUploadProps> = ({ onFileSelect, selectedFile }) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    // Accept images and videos
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      alert('Please upload an image or video file.');
      return;
    }
    
    onFileSelect(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const clearFile = () => {
    onFileSelect(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  React.useEffect(() => {
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, []);

  if (selectedFile && previewUrl) {
    const isVideo = selectedFile.type.startsWith('video/');
    return (
      <div className="relative mt-4 bg-slate-100 rounded-xl overflow-hidden border border-slate-200 max-h-[300px] flex justify-center group">
        <button 
          onClick={clearFile}
          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
        >
          <X size={16} />
        </button>
        
        {isVideo ? (
          <video src={previewUrl} controls className="h-full max-h-[280px] w-auto rounded-lg" />
        ) : (
          <img src={previewUrl} alt="Preview" className="h-full max-h-[280px] w-auto object-contain rounded-lg" />
        )}
        
        <div className="absolute bottom-2 left-2 px-3 py-1 bg-black/60 text-white text-xs rounded-full backdrop-blur-sm">
           {isVideo ? <span className="flex items-center gap-1"><Film size={12}/> Video attached</span> : <span className="flex items-center gap-1"><ImageIcon size={12}/> Image attached</span>}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative mt-4 group transition-all ${dragActive ? 'scale-[1.01]' : ''}`}
      onDragEnter={handleDrag} 
      onDragLeave={handleDrag} 
      onDragOver={handleDrag} 
      onDrop={handleDrop}
    >
      <label 
        htmlFor="media-upload" 
        className={`
          flex flex-col items-center justify-center w-full h-24 
          border-2 border-dashed rounded-xl cursor-pointer 
          transition-colors duration-200 ease-in-out
          ${dragActive ? 'border-red-500 bg-red-50' : 'border-slate-300 bg-white/50 hover:bg-white hover:border-red-400'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <div className="flex gap-4 text-slate-500 mb-1">
             <ImageIcon className="w-6 h-6" />
             <VideoIcon className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-500 font-medium">
            <span className="font-semibold text-red-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-400">Images or Videos to verify</p>
        </div>
        <input id="media-upload" type="file" className="hidden" onChange={handleChange} accept="image/*,video/*" />
      </label>
    </div>
  );
};

export default MediaUpload;
