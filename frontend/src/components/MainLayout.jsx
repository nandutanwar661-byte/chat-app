import React, { useState } from 'react';
import { Home, MessageSquare, Camera, PhoneCall, User } from 'lucide-react';
import ReelsFeed from './ReelsFeed';
import ChatSection from './ChatSection';
import AvatarCreator from './AvatarCreator';
import ProfileSection from './ProfileSection';

export default function MainLayout({ currentUser }) {
  const [activeTab, setActiveTab] = useState('feed');

  // Navigation Items array
  const navItems = [
    { id: 'feed', label: 'Home/Reels', icon: Home },
    { id: 'chats', label: 'Chats', icon: MessageSquare },
    { id: 'avatar', label: 'Bitmoji/Camera', icon: Camera },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-white font-sans">
      
      {/* LAPTOP SIDEBAR: Hidden on mobile, visible on medium screens and up */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-800 p-4 justify-between">
        <div>
          <div className="flex items-center gap-2 px-2 py-4 mb-6">
            <span className="text-2xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-transparent">
              VIBEMIXER
            </span>
          </div>
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-4 w-full px-4 py-3 rounded-xl font-medium transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        
        {/* User Badge at Sidebar Bottom */}
        <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-xl">
          <img 
            src={`https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser?.username || 'default'}`} 
            className="w-10 h-10 rounded-full bg-slate-700" 
            alt="avatar"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{currentUser?.username || 'Guest User'}</p>
            <p className="text-xs text-green-400 font-medium">● Online</p>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER CONTENT */}
      <main className="flex-1 h-full overflow-hidden pb-16 md:pb-0 relative bg-slate-950">
        {activeTab === 'feed' && <ReelsFeed />}
        {activeTab === 'chats' && <ChatSection currentUser={currentUser} />}
        {activeTab === 'avatar' && <AvatarCreator currentUser={currentUser} />}
        {activeTab === 'profile' && <ProfileSection currentUser={currentUser} />}
      </main>

      {/* MOBILE BOTTOM NAVIGATION: Visible only on small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-around items-center z-50 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
                isActive ? 'text-pink-500 scale-110' : 'text-slate-400'
              }`}
            >
              <Icon size={24} />
              <span className="text-[10px] mt-0.5 font-medium">{item.label.split('/')[0]}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}