import React, { useState } from 'react';
import { Sparkles, RefreshCw } from 'lucide-react';

export default function AvatarCreator({ currentUser }) {
  const [avatarSeed, setAvatarSeed] = useState(currentUser?.username || 'vibeUser');
  const [styleType, setStyleType] = useState('bottts'); // Options: bottts, avataaars, lorelei

  const randomiseSeed = () => {
    const randomString = Math.random().toString(36).substring(7);
    setAvatarSeed(randomString);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center p-6 overflow-y-auto max-w-xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 w-full text-center space-y-6 shadow-2xl relative overflow-hidden">
        
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600" />
        
        <div>
          <h2 className="text-2xl font-black flex items-center justify-center gap-2">
            <Sparkles className="text-yellow-400 fill-yellow-400" size={24} />
            CREATE YOUR MIXER BITMOJI
          </h2>
          <p className="text-xs text-slate-400 mt-1">Design your permanent cross-app digital identity index</p>
        </div>

        {/* Live Vector Engine Preview Window */}
        <div className="relative group mx-auto w-40 h-40 bg-slate-950 rounded-2xl p-4 border-2 border-slate-800 flex items-center justify-center shadow-inner">
          <img 
            src={`https://api.dicebear.com/7.x/${styleType}/svg?seed=${avatarSeed}`} 
            className="w-full h-full object-contain" 
            alt="Custom Bitmoji Avatar Preview" 
          />
        </div>

        {/* Configurator Selection Knobs Controls */}
        <div className="space-y-4 text-left">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Style Engine Theme</label>
            <div className="grid grid-cols-3 gap-2">
              {['bottts', 'avataaars', 'lorelei'].map((style) => (
                <button
                  key={style}
                  onClick={() => setStyleType(style)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all uppercase ${
                    styleType === style 
                      ? 'bg-purple-600/20 border-purple-500 text-purple-300' 
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Custom Seed Handle</label>
            <div className="flex gap-2">
              <input 
                type="text"
                value={avatarSeed}
                onChange={(e) => setAvatarSeed(e.target.value.replace(/\s+/g, ''))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none text-white focus:border-purple-500 flex-1 font-mono"
              />
              <button 
                onClick={randomiseSeed}
                className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl border border-slate-700 text-white transition-colors"
                title="Randomise Avatar Seed DNA"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Form CTA Submission Trigger */}
        <button 
          onClick={() => alert(`Bitmoji Saved Successfully: ${avatarSeed}`)}
          className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-slate-950 font-black py-3 rounded-xl transition-all shadow-lg text-sm uppercase tracking-wider"
        >
          Save Identity Profile Badge
        </button>

      </div>
    </div>
  );
}
