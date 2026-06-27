import React from 'react';

export default function ProfileSection({ currentUser }) {
  return (
    <div className="h-full w-full flex items-center justify-center text-slate-400 p-4">
      <div className="text-center max-w-sm">
        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'vibe'}`} className="w-24 h-24 mx-auto mb-4 bg-slate-900 rounded-full p-2 border border-slate-800" alt="" />
        <h3 className="text-xl font-bold text-white mb-1">{currentUser?.username || 'Nishu'}</h3>
        <p className="text-xs text-purple-400 font-mono mb-4">ID: backend_synced_session_verified</p>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-4">
          <div><p className="text-xl font-bold text-white">24</p><p className="text-[10px] uppercase text-slate-500 font-bold">Vibe Reels</p></div>
          <div><p className="text-xl font-bold text-white">1.2K</p><p className="text-[10px] uppercase text-slate-500 font-bold">Connections</p></div>
        </div>
      </div>
    </div>
  );
}