import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Trash2, CheckCircle } from 'lucide-react';

const STORAGE_KEY = 'factchecker_gemini_key';

export function getStoredApiKey(): string | null {
    return localStorage.getItem(STORAGE_KEY);
}

export function clearStoredApiKey(): void {
    localStorage.removeItem(STORAGE_KEY);
}

interface Props {
    onKeySaved: () => void;
}

const ApiKeySetup: React.FC<Props> = ({ onKeySaved }) => {
    const [input, setInput] = useState('');
    const [show, setShow] = useState(false);
    const [saved, setSaved] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    useEffect(() => {
        const existing = getStoredApiKey();
        if (existing) {
            setInput(existing);
            setHasSaved(true);
        }
    }, []);

    const handleSave = () => {
        const trimmed = input.trim();
        if (!trimmed) return;
        localStorage.setItem(STORAGE_KEY, trimmed);
        setHasSaved(true);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        onKeySaved();
    };

    const handleClear = () => {
        clearStoredApiKey();
        setInput('');
        setHasSaved(false);
        onKeySaved();
    };

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
                <Key size={16} className="text-slate-500" />
                <p className="text-sm font-semibold text-slate-700">Gemini API Key</p>
                {hasSaved && (
                    <span className="ml-auto flex items-center gap-1 text-xs font-medium text-emerald-600">
                        <CheckCircle size={12} /> Saved
                    </span>
                )}
            </div>

            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input
                        type={show ? 'text' : 'password'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        placeholder="Paste your Gemini API key..."
                        className="w-full pl-3 pr-9 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                    />
                    <button
                        type="button"
                        onClick={() => setShow(s => !s)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                        {show ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                </div>

                <button
                    onClick={handleSave}
                    disabled={!input.trim()}
                    className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    {saved ? '✓ Saved' : 'Save'}
                </button>

                {hasSaved && (
                    <button
                        onClick={handleClear}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Clear API key"
                    >
                        <Trash2 size={16} />
                    </button>
                )}
            </div>

            <p className="text-xs text-slate-400 mt-2">
                Stored only in your browser. Never sent to any server.{' '}
                <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-500 hover:underline"
                >
                    Get a free key →
                </a>
            </p>
        </div>
    );
};

export default ApiKeySetup;
