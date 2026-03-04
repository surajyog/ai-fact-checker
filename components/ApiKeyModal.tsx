import React, { useState, useEffect, useRef } from 'react';
import { Key, Eye, EyeOff, Trash2, X, ExternalLink, CheckCircle } from 'lucide-react';

const STORAGE_KEY = 'factchecker_gemini_key';

export function getStoredApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEY);
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onKeySaved: () => void;
    message?: string; // optional prompt message e.g. "Add a key to continue"
}

const ApiKeyModal: React.FC<Props> = ({ isOpen, onClose, onKeySaved, message }) => {
    const [input, setInput] = useState('');
    const [show, setShow] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            const existing = getStoredApiKey();
            if (existing) { setInput(existing); setHasSaved(true); }
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleSave = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        localStorage.setItem(STORAGE_KEY, trimmed);
        setHasSaved(true);
        setSaved(true);
        onKeySaved();
        setTimeout(() => { setSaved(false); onClose(); }, 900);
    };

    const handleClear = () => {
        localStorage.removeItem(STORAGE_KEY);
        setInput('');
        setHasSaved(false);
        onKeySaved();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-[fadeInUp_0.2s_ease-out]">
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center">
                        <Key size={20} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900">Gemini API Key</h2>
                        <p className="text-xs text-slate-500">Required to run fact checks</p>
                    </div>
                </div>

                {/* Optional message */}
                {message && (
                    <div className="mt-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 font-medium">
                        {message}
                    </div>
                )}

                {/* Input */}
                <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Your API Key</label>
                    <div className="relative">
                        <input
                            ref={inputRef}
                            type={show ? 'text' : 'password'}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            placeholder="AIza..."
                            className="w-full pl-4 pr-10 py-3 text-sm border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono tracking-wider placeholder:font-sans placeholder:tracking-normal"
                        />
                        <button
                            type="button"
                            onClick={() => setShow(s => !s)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            {show ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        disabled={!input.trim()}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                        {saved ? <><CheckCircle size={16} /> Saved!</> : <><Key size={14} /> Save Key</>}
                    </button>

                    {hasSaved && (
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <Trash2 size={14} /> Clear
                        </button>
                    )}
                </div>

                {/* Footer */}
                <p className="mt-3 text-xs text-slate-400 text-center">
                    Stored in your browser only — never sent to any server.{' '}
                    <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-red-500 hover:underline inline-flex items-center gap-0.5"
                    >
                        Get a free key <ExternalLink size={10} />
                    </a>
                </p>
            </div>

            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
      `}</style>
        </div>
    );
};

export default ApiKeyModal;
