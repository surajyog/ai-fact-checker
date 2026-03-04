import React from 'react';

const sources = [
  { name: "Reuters", color: "bg-orange-600" },
  { name: "BBC News", color: "bg-red-600" },
  { name: "AP News", color: "bg-slate-800" },
  { name: "The Guardian", color: "bg-blue-700" },
  { name: "Al Jazeera", color: "bg-teal-600" },
  { name: "Bloomberg", color: "bg-black" },
];

const TrustedMediaBar: React.FC = () => {
  return (
    <div className="py-8 border-y border-slate-200 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-semibold text-slate-400 uppercase tracking-widest mb-6">
          Monitoring Verified Public Sources
        </p>
        <div className="flex flex-wrap justify-center gap-4 opacity-75 hover:opacity-100 transition-opacity">
          {sources.map((s) => (
            <div key={s.name} className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${s.color}`}></span>
              <span className="text-sm font-medium text-slate-700">{s.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustedMediaBar;