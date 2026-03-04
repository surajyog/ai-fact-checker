import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FactCheckResponse } from '../types';
import VerdictBadge from './VerdictBadge';
import SourceCard from './SourceCard';
import { ArrowLeft, Languages, Loader2, Globe, Info } from 'lucide-react';
import { translateContent } from '../services/geminiService';

interface FactCheckDetailProps {
  data: FactCheckResponse;
  onBack: () => void;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ne', name: 'Nepali' },
  { code: 'hi', name: 'Hindi' },
  { code: 'mai', name: 'Maithili' },
];

const FactCheckDetail: React.FC<FactCheckDetailProps> = ({ data, onBack }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedText, setTranslatedText] = useState<Record<string, string>>({
    en: data.text
  });

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === currentLanguage) return;
    
    setCurrentLanguage(langCode);

    if (!translatedText[langCode]) {
      setIsTranslating(true);
      const langName = SUPPORTED_LANGUAGES.find(l => l.code === langCode)?.name || 'English';
      try {
        const translated = await translateContent(data.text, langName);
        setTranslatedText(prev => ({
          ...prev,
          [langCode]: translated
        }));
      } catch (error) {
        console.error("Translation failed");
        // Fallback to english if failed
        setCurrentLanguage('en');
      } finally {
        setIsTranslating(false);
      }
    }
  };

  return (
    <div className="animate-fade-in pb-12">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to Search
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header Section */}
        <div className="p-6 md:p-10 border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white relative">
          
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div className="flex flex-col gap-4 items-start">
               {/* Highlighted Verdict Badge */}
               <VerdictBadge verdict={data.verdict} />
               
               <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                 <Globe size={12} /> Verified by RUJU AI • {new Date().toLocaleDateString()}
               </span>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  disabled={isTranslating}
                  className={`
                    relative px-4 py-2 text-sm font-semibold rounded-lg transition-all
                    ${currentLanguage === lang.code 
                      ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                  `}
                >
                  {isTranslating && currentLanguage === lang.code ? (
                    <span className="flex items-center gap-2">
                       <Loader2 size={14} className="animate-spin" /> Translating...
                    </span>
                  ) : (
                    lang.name
                  )}
                </button>
              ))}
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight tracking-tight">
            Fact Check Analysis
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 p-6 md:p-10">
            {isTranslating ? (
               <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                 <Loader2 size={48} className="animate-spin mb-4 text-blue-600" />
                 <p className="font-medium">Translating analysis for you...</p>
               </div>
            ) : (
              <div className="prose prose-lg prose-slate prose-headings:font-bold prose-headings:text-slate-900 prose-p:text-slate-700 prose-a:text-blue-600 prose-strong:text-slate-900 max-w-none">
                 {/* Render Markdown properly */}
                 {(translatedText[currentLanguage] || data.text).split('\n').map((line, i) => (
                    <div key={i}>
                      {line.startsWith('# ') ? (
                        <h3 className="text-2xl font-bold mt-8 mb-4 text-slate-900">{line.replace('# ', '')}</h3>
                      ) : line.startsWith('## ') ? (
                        <h4 className="text-xl font-bold mt-6 mb-3 text-slate-800">{line.replace('## ', '')}</h4>
                      ) : line.startsWith('- ') || line.startsWith('* ') ? (
                        <div className="flex gap-3 mb-2 ml-1">
                          <span className="text-slate-400 mt-1.5">•</span>
                          <p className="my-0" dangerouslySetInnerHTML={{ 
                            __html: line.replace(/^[-*] /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                          }} />
                        </div>
                      ) : (
                        <p className="mb-4 whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ 
                            __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                          }} 
                        />
                      )}
                    </div>
                 ))}
              </div>
            )}
          </div>

          {/* Sidebar Sources */}
          <div className="bg-slate-50/80 p-6 md:p-10 border-l border-slate-200 backdrop-blur-sm">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-1 bg-red-500 rounded-full"></div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Verified Sources
                </h3>
              </div>
              
              {data.groundingChunks && data.groundingChunks.length > 0 ? (
                <div className="space-y-3">
                  {data.groundingChunks.map((chunk, idx) => (
                    chunk.web?.uri && (
                      <SourceCard 
                        key={idx} 
                        url={chunk.web.uri} 
                        title={chunk.web.title || "Referenced Source"} 
                      />
                    )
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-white rounded-lg border border-slate-200 text-sm text-slate-500 italic text-center">
                  AI analysis based on internal knowledge. No specific web links returned.
                </div>
              )}

              <div className="mt-12 p-6 bg-blue-50 rounded-2xl border border-blue-100">
                 <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center gap-2">
                   <Info size={14} /> Disclaimer
                 </h3>
                 <p className="text-xs text-blue-800/80 leading-relaxed">
                   RUJU uses Artificial Intelligence to analyze claims against publicly available information. Always cross-reference with primary sources.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FactCheckDetail;