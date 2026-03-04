import React, { useState } from 'react';
import Header from './components/Header';
import TrustedMediaBar from './components/TrustedMediaBar';
import FactCheckDetail from './components/FactCheckDetail';
import MediaUpload from './components/MediaUpload';
import ApiKeyModal, { getStoredApiKey } from './components/ApiKeyModal';
import { Search, ArrowRight, Loader2, TrendingUp, ShieldAlert, KeyRound } from 'lucide-react';
import { verifyClaim, verifyMediaClaim, findAndVerifyRecentNews } from './services/geminiService';
import { FactCheckResponse } from './types';

function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<FactCheckResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // API key modal state
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyModalMsg, setKeyModalMsg] = useState<string | undefined>();
  const [hasKey, setHasKey] = useState(() => !!getStoredApiKey());

  const openKeyModal = (msg?: string) => {
    setKeyModalMsg(msg);
    setKeyModalOpen(true);
  };

  const handleKeySaved = () => {
    setHasKey(!!getStoredApiKey());
  };

  const requireKey = (): boolean => {
    if (!getStoredApiKey()) {
      openKeyModal('You need a Gemini API key to run a fact check.');
      return false;
    }
    return true;
  };

  const handleCheck = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() && !selectedFile) return;
    if (!requireKey()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      let data: FactCheckResponse;
      if (selectedFile) {
        data = await verifyMediaClaim(selectedFile, query);
      } else {
        data = await verifyClaim(query);
      }
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("We couldn't verify that claim right now. Please try again or check your file format.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrendingCheck = async () => {
    if (!requireKey()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);
    setSelectedFile(null);
    setQuery('Checking trending viral news globally...');

    try {
      const data = await findAndVerifyRecentNews();
      setResult(data);
    } catch (err) {
      setError('Could not fetch trending news analysis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setQuery('');
    setSelectedFile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-[#F8FAFC]">
      <Header onKeyClick={() => openKeyModal()} />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={keyModalOpen}
        onClose={() => setKeyModalOpen(false)}
        onKeySaved={handleKeySaved}
        message={keyModalMsg}
      />

      <main className="flex-grow">
        {!result ? (
          <>
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-900 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-600 opacity-20 blur-3xl"></div>
                <div className="absolute top-48 -left-24 w-72 h-72 rounded-full bg-blue-600 opacity-20 blur-3xl"></div>
              </div>

              <div className="relative max-w-3xl mx-auto text-center z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mb-6">
                  <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                  <span className="text-xs font-medium text-slate-300 uppercase tracking-wide">Live Verification System</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-6 leading-tight">
                  Verify Public Information. <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                    Promote Truth.
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                  FactChecker is an open source AI-powered fact-checking platform. Upload news screenshots, videos, or text to verify claims instantly.
                </p>

                {/* Search Input */}
                <div className="max-w-2xl mx-auto">
                  <form onSubmit={handleCheck} className="relative group mb-4">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder={selectedFile ? 'Add a caption or context (optional)...' : 'Paste a headline, rumor, or claim here...'}
                      className="block w-full pl-11 pr-36 py-4 rounded-xl border-0 bg-white/10 backdrop-blur-sm text-white placeholder-slate-400 ring-1 ring-slate-700 focus:ring-2 focus:ring-red-500 focus:bg-slate-900/50 transition-all shadow-lg text-lg"
                    />
                    <div className="absolute inset-y-0 right-2 flex items-center gap-1.5">
                      {/* Key status pill inside input */}
                      <button
                        type="button"
                        onClick={() => openKeyModal()}
                        title={hasKey ? 'API key set' : 'Add API key'}
                        className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-semibold transition-colors ${hasKey
                            ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 animate-pulse'
                          }`}
                      >
                        <KeyRound size={12} />
                        {hasKey ? 'Key set' : 'No key'}
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || (!query.trim() && !selectedFile)}
                        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <span className="flex items-center gap-2">Check <ArrowRight size={16} /></span>}
                      </button>
                    </div>
                  </form>

                  {/* Media Upload */}
                  <MediaUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />
                </div>

                {/* Quick Action */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleTrendingCheck}
                    disabled={isLoading}
                    className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors border-b border-transparent hover:border-red-500 pb-0.5"
                  >
                    <TrendingUp size={16} className="text-red-500" />
                    Scan latest viral news globally
                  </button>
                </div>
              </div>
            </div>

            <TrustedMediaBar />

            {/* Features Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900">Multimodal Fact Checking</h2>
                <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                  We use advanced AI to analyze text, images, and video content against verified sources.
                </p>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  { title: 'Video Analysis', desc: 'Upload news clips. We extract frames, analyze the visual events, and cross-reference them with real news events.', icon: <Search className="w-8 h-8 text-blue-600" /> },
                  { title: 'Image Verification', desc: 'Spotted a suspicious screenshot? Upload it. We detect manipulation and find the original context.', icon: <ShieldAlert className="w-8 h-8 text-red-600" /> },
                  { title: 'Truth Focused', desc: 'Independent and non-partisan. Our goal is purely to verify public information for accuracy.', icon: <TrendingUp className="w-8 h-8 text-emerald-600" /> },
                ].map((feature, idx) => (
                  <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="bg-slate-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <FactCheckDetail data={result} onBack={handleReset} />
          </div>
        )}

        {error && (
          <div className="fixed bottom-8 right-8 bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 z-50">
            <ShieldAlert size={24} />
            {error}
            <button onClick={() => setError(null)} className="ml-4 text-red-900 font-bold hover:underline">Dismiss</button>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h4 className="text-xl font-black text-slate-900">FactChecker</h4>
            <p className="text-slate-500 text-sm mt-1">© {new Date().getFullYear()} FactChecker — Open Source</p>
          </div>
          <div className="flex gap-6 text-sm text-slate-600">
            <a href="#" className="hover:text-red-600">Privacy Policy</a>
            <a href="#" className="hover:text-red-600">Terms of Service</a>
            <a href="#" className="hover:text-red-600">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
