import React from 'react';
import { ShieldCheck, Menu, X, KeyRound } from 'lucide-react';
import { getStoredApiKey } from './ApiKeyModal';

interface Props {
  onKeyClick: () => void;
}

const Header: React.FC<Props> = ({ onKeyClick }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const hasKey = !!getStoredApiKey();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-red-600 p-1.5 rounded-md text-white">
              <ShieldCheck size={24} strokeWidth={3} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">FactChecker</h1>
              <p className="text-[0.65rem] font-semibold text-slate-500 tracking-widest uppercase">Truth & Accuracy</p>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-8">
            <a href="#" className="text-sm font-medium text-slate-900 hover:text-red-600 transition-colors">Latest Checks</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">Trusted Sources</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">Methodology</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-red-600 transition-colors">About Us</a>
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            {/* API Key button */}
            <button
              onClick={onKeyClick}
              title={hasKey ? 'API key set — click to manage' : 'Add your API key'}
              className={`relative p-2 rounded-lg border transition-all ${hasKey
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                  : 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 animate-pulse'
                }`}
            >
              <KeyRound size={18} />
              {!hasKey && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
              )}
            </button>

            <button className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
              Report a Claim
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onKeyClick}
              className={`p-2 rounded-lg border ${hasKey ? 'border-emerald-200 text-emerald-600' : 'border-amber-200 text-amber-600'}`}
            >
              <KeyRound size={18} />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-slate-900 bg-slate-50">Latest Checks</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50">Trusted Sources</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50">Methodology</a>
            <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-50">About Us</a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;