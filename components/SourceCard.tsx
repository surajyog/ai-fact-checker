import React from 'react';
import { ExternalLink } from 'lucide-react';

interface SourceCardProps {
  url: string;
  title: string;
}

const SourceCard: React.FC<SourceCardProps> = ({ url, title }) => {
  // Simple domain extraction for display
  let domain = '';
  try {
    domain = new URL(url).hostname.replace('www.', '');
  } catch (e) {
    domain = 'Source Link';
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:border-blue-300 transition-all group"
    >
      <div className="bg-slate-100 p-2 rounded-md text-slate-500 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
        <ExternalLink size={16} />
      </div>
      <div className="overflow-hidden">
        <h4 className="text-sm font-medium text-slate-900 truncate">{title || domain}</h4>
        <p className="text-xs text-slate-500 truncate">{domain}</p>
      </div>
    </a>
  );
};

export default SourceCard;