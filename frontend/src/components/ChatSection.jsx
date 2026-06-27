import React, { useState } from 'react';
import { Send, EyeOff, Search, Phone, Video } from 'lucide-react';

export default function ChatSection({ currentUser }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [snapchatMode, setSnapchatMode] = useState(false); // Disappearing flag

  // Mock Active User Directory list for sidebar tracking
  const [usersList] = useState([
    { id: '1', username: 'nitu', active: true },
    { id: '2', username: 'rahul_dev', active: false },
    { id: '3', username: 'priya_vibe', active: true }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: currentUser?.username || 'Me',
      text: inputMsg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isDisappearing: snapchatMode
    };

    setMessages(prev => [...prev, newMsg]);
    setInputMsg('');

    // SNAPCHAT DISAPPEARING LOGIC: 5 Seconds Auto Destruction Hook
    if (snapchatMode) {
      setTimeout(() => {
        setMessages(prev => prev.filter(m => m.id !== newMsg.id));
      }, 5000);
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full h-full flex bg-slate-950">
      
      {/* INTERNAL SEARCHABLE SIDEBAR CHATS LIST */}
      <div className={`w-full md:w-80 border-r border-slate-900 flex-col ${selectedUser ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-slate-900">
          <h2 className="text-xl font-bold mb-3 text-slate-100">VibeChats</h2>
          <div className="relative bg-slate-900 rounded-xl flex items-center px-3 py-2 border border-slate-800">
            <Search size={18} className="text-slate-500 mr-2" />
            <input 
              type="text" 
              placeholder="Search user profile..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredUsers.map(user => (
            <button
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                selectedUser?.id === user.id ? 'bg-slate-800' : 'hover:bg-slate-900'
              }`}
            >
              <div className="relative">
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} className="w-12 h-12 bg-slate-800 rounded-xl" alt="" />
                {user.active && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full" />}
              </div>
              <div className="text-left flex-1 min-w-0">
                <p className="font-semibold text-slate-200 truncate">{user.username}</p>
                <p className="text-xs text-slate-500 truncate">Tap to start vibing</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* CHAT WINDOW INTERFACE */}
      <div className={`flex-1 flex flex-col h-full bg-slate-900/30 ${!selectedUser ? 'hidden md:flex items-center justify-center text-slate-500' : 'flex'}`}>
        {selectedUser ? (
          <>
            {/* Header Toolbar */}
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedUser(null)} className="md:hidden text-slate-400 mr-1 font-bold">←</button>
                <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${selectedUser.username}`} className="w-10 h-10 bg-slate-800 rounded-xl" alt="" />
                <div>
                  <h3 className="font-bold text-slate-200">{selectedUser.username}</h3>
                  <p className="text-xs text-slate-400">Active conversation thread</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {/* SNAPCHAT TOGGLE OPTION BUTTON */}
                <button 
                  onClick={() => setSnapchatMode(!snapchatMode)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs transition-all ${
                    snapchatMode 
                      ? 'bg-yellow-500 text-slate-950 shadow-md animate-pulse' 
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <EyeOff size={14} />
                  <span>{snapchatMode ? "Disappearing ON (5s)" : "Disappearing OFF"}</span>
                </button>
                <Phone size={20} className="text-slate-400 hover:text-white cursor-pointer" />
                <Video size={20} className="text-slate-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            {/* Conversation Messages Thread Box */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === (currentUser?.username || 'Me') ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm relative shadow-md ${
                    msg.sender === (currentUser?.username || 'Me')
                      ? msg.isDisappearing ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-medium' : 'bg-purple-600 text-white'
                      : 'bg-slate-800 text-slate-100'
                  }`}>
                    <p>{msg.text}</p>
                    {msg.isDisappearing && (
                      <span className="block text-[9px] mt-1 opacity-80 uppercase tracking-widest font-extrabold">⚡ Self Destruct Active</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Sticky Lower Messaging Input Dock Container */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-900/60 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder={snapchatMode ? "Send a disappearing snap chat message..." : "Type message standard view..."}
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-purple-500"
              />
              <button type="submit" className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-xl transition-all shadow-lg flex items-center justify-center">
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-slate-400">Select conversation to start</p>
            <p className="text-xs text-slate-600">Choose any workspace profiles active from layout panel</p>
          </div>
        )}
      </div>

    </div>
  );
}