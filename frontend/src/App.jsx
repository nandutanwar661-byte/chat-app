import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { Send, Trash2, Edit2, LogOut, UserPlus, MessageCircle, Video } from 'lucide-react';

const BACKEND_URL = 'https://chat-app-jdgi.onrender.com';

const socket = io(BACKEND_URL, {
  transports: ['websocket', 'polling'],
  withCredentials: true
});

const AVATARS = ['👑', '🐱', '🦊', '🚀', '👻', '🎸'];

const theme = {
  bg: '#0B0F19',
  surface: '#151B2C',
  surfaceLight: '#1F293D',
  accent: '#7C3AED', 
  accentHover: '#6D28D9',
  text: '#F3F4F6',
  textMuted: '#9CA3AF',
  meBubble: '#7C3AED',
  themBubble: '#1F293D'
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage] = useState('auth'); 
  const [isLoginMode, setIsLoginMode] = useState(true);
  
  const [myPhone, setMyPhone] = useState('');
  const [myName, setMyName] = useState('');
  const [myAvatar, setMyAvatar] = useState('👑');
  const [myPassword, setMyPassword] = useState('');

  const [recentChats, setRecentChats] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null); 
  const [newContactPhone, setNewContactPhone] = useState('');

  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [isCalling, setIsCalling] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const syncSidebarList = () => {
    if (myPhone) {
      fetch(`${BACKEND_URL}/api/recent/${myPhone}`)
        .then(res => res.json())
        .then(data => { if(Array.isArray(data)) setRecentChats(data); });
    }
  };

  useEffect(() => {
    if (page === 'messenger' && activeChatUser) {
      fetch(`${BACKEND_URL}/api/messages/${myPhone}/${activeChatUser.phoneNumber}`)
        .then(res => res.json())
        .then(data => { if(Array.isArray(data)) setMessages(data); });
    }
  }, [page, activeChatUser, myPhone]);

  useEffect(() => {
    if (page === 'messenger') syncSidebarList();
  }, [page, activeChatUser]);

  useEffect(() => {
    socket.on("receive_message", (data) => {
      if (activeChatUser && (data.sender === activeChatUser.phoneNumber || data.receiver === activeChatUser.phoneNumber)) {
        setMessages((prev) => [...prev, data]);
      }
      syncSidebarList();
    });

    socket.on("message_edited", (data) => {
      setMessages((prev) => prev.map(m => m.id === data.id ? { ...m, message: data.message } : m));
    });

    socket.on("message_deleted", (data) => {
      setMessages((prev) => prev.filter(m => m.id !== data.id));
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_edited");
      socket.off("message_deleted");
    };
  }, [activeChatUser]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BACKEND_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: myPhone,
          name: myName,
          avatar: myAvatar,
          password: myPassword,
          isLogin: isLoginMode
        })
      });
      const data = await response.json();
      if (data.error) {
        alert(data.error);
      } else {
        setMyName(data.name);
        setMyAvatar(data.avatar);
        socket.emit("register_user", data.phoneNumber);
        setPage('messenger');
      }
    } catch (err) {
      alert("Authentication connection failed!");
    }
  };

  const handleAddNewContact = (e) => {
    e.preventDefault();
    const targetPhone = newContactPhone.trim();
    if(targetPhone === myPhone) return alert("Aap khud se chat nahi kar sakte!");
    
    if(targetPhone !== "") {
      const mockContact = { 
        phoneNumber: targetPhone, 
        name: `User (${targetPhone.slice(-4)})`, 
        avatar: '🐱' 
      };
      setActiveChatUser(mockContact);

      const initMessage = {
        id: "msg_" + Date.now(),
        sender: myPhone,
        receiver: targetPhone,
        message: "👋 Hey, let's connect on VibeChat!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages([initMessage]);
      socket.emit("send_message", initMessage);
      setNewContactPhone('');
      setTimeout(() => { syncSidebarList(); }, 300);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() === "" || !activeChatUser) return;

    if (editingMsgId) {
      const updatedText = messageInput;
      setMessages((prev) => prev.map(m => m.id === editingMsgId ? { ...m, message: updatedText } : m));
      socket.emit("edit_message", { id: editingMsgId, receiver: activeChatUser.phoneNumber, message: updatedText });
      setEditingMsgId(null);
    } else {
      const newMessage = {
        id: "msg_" + Date.now(),
        sender: myPhone,
        receiver: activeChatUser.phoneNumber,
        message: messageInput,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, newMessage]);
      socket.emit("send_message", newMessage);
    }
    setMessageInput('');
  };

  const handleDelete = (msgId) => {
    if(window.confirm("Delete this message?")) {
      setMessages((prev) => prev.filter(m => m.id !== msgId));
      socket.emit("delete_message", { id: msgId, receiver: activeChatUser.phoneNumber });
    }
  };

  const startCall = async (element) => {
    if (!element) return;
    const appID = 2088331165; 
    const serverSecret = "66f3682974bb81f7cb8be94fb003be18"; 
    const roomID = [myPhone, activeChatUser.phoneNumber].sort().join("_");
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(appID, serverSecret, roomID, myPhone, myName || myPhone);
    const zp = ZegoUIKitPrebuilt.create(kitToken);
    
    zp.joinRoom({
      container: element,
      scenario: { mode: ZegoUIKitPrebuilt.Scenario.GroupCall },
      showScreenSharingButton: false,
      onLeaveRoom: () => setIsCalling(false)
    });
  };

  if (showSplash) {
    return (
      <div style={{height:'100vh', width:'100vw', background:theme.bg, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', color:'white', fontFamily:'sans-serif'}}>
        <div style={{fontSize:'64px', marginBottom:'20px'}}>⚡</div>
        <h1 style={{fontSize:'28px', fontWeight:'800', letterSpacing:'1px'}}>VIBECHAT</h1>
      </div>
    );
  }

  return (
    <div style={{height:'100vh', width:'100vw', background:theme.bg, color:theme.text, fontFamily:'system-ui, sans-serif', display:'flex', flexDirection:'column', overflow:'hidden'}}>
      
      {page === 'auth' ? (
        <div style={{display:'flex', justifyContent:'center', alignItems:'center', flexGrow:1, padding:'20px'}}>
          <div style={{background:theme.surface, padding:'40px', borderRadius:'24px', width:'100%', maxWidth:'400px', border:'1px solid #232D42', boxShadow:'0 20px 40px rgba(0,0,0,0.3)'}}>
            <h2 style={{textAlign:'center', marginBottom:'30px', fontSize:'28px', fontWeight:'800'}}>{isLoginMode ? "🔑 Welcome Back" : "📝 Create Account"}</h2>
            <form onSubmit={handleAuthSubmit} style={{display:'flex', flexDirection:'column', gap:'20px'}}>
              <div>
                <label style={{fontSize:'12px', fontWeight:'600', color:theme.textMuted, textTransform:'uppercase'}}>Mobile Number / Username</label>
                <input type="text" placeholder="Enter number or username" value={myPhone} onChange={e => setMyPhone(e.target.value)} required style={{width:'100%', boxSizing:'border-box', padding:'14px', marginTop:'6px', borderRadius:'12px', border:'1px solid #232D42', background:theme.bg, color:'white', outline:'none'}} />
              </div>
              {!isLoginMode && (
                <>
                  <div>
                    <label style={{fontSize:'12px', fontWeight:'600', color:theme.textMuted, textTransform:'uppercase'}}>Display Name</label>
                    <input type="text" placeholder="e.g. Nishu" value={myName} onChange={e => setMyName(e.target.value)} required style={{width:'100%', boxSizing:'border-box', padding:'14px', marginTop:'6px', borderRadius:'12px', border:'1px solid #232D42', background:theme.bg, color:'white', outline:'none'}} />
                  </div>
                  <div>
                    <label style={{fontSize:'12px', fontWeight:'600', color:theme.textMuted, textTransform:'uppercase', display:'block', marginBottom:'8px'}}>Choose Avatar</label>
                    <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                      {AVATARS.map(av => (
                        <span key={av} onClick={() => setMyAvatar(av)} style={{fontSize:'22px', cursor:'pointer', padding:'8px', background: myAvatar === av ? theme.accent : theme.surfaceLight, borderRadius:'50%', width:'35px', height:'35px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                          {av}
                        </span>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <div>
                <label style={{fontSize:'12px', fontWeight:'600', color:theme.textMuted, textTransform:'uppercase'}}>Password</label>
                <input type="password" placeholder="••••••••" value={myPassword} onChange={e => setMyPassword(e.target.value)} required style={{width:'100%', boxSizing:'border-box', padding:'14px', marginTop:'6px', borderRadius:'12px', border:'1px solid #232D42', background:theme.bg, color:'white', outline:'none'}} />
              </div>
              <button type="submit" style={{background:theme.accent, color:'white', border:'none', padding:'14px', borderRadius:'12px', cursor:'pointer', fontWeight:'bold', fontSize:'16px', marginTop:'10px'}}>
                {isLoginMode ? "Sign In" : "Get Started"}
              </button>
              <p onClick={() => setIsLoginMode(!isLoginMode)} style={{textAlign:'center', marginTop:'10px', color:theme.textMuted, cursor:'pointer', fontSize:'14px'}}>
                {isLoginMode ? "Don't have an account? Register" : "Already registered? Login"}
              </p>
            </form>
          </div>
        </div>
      ) : (
        <div style={{display:'flex', flexGrow:1, height:'100vh', overflow:'hidden'}}>
          <div style={{width:'340px', background:theme.surface, borderRight:'1px solid #232D42', display:'flex', flexDirection:'column'}}>
            <div style={{padding:'20px', borderBottom:'1px solid #232D42', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                <div style={{fontSize:'28px', background:theme.surfaceLight, padding:'6px', borderRadius:'50%'}}>{myAvatar}</div>
                <div>
                  <div style={{fontWeight:'700', fontSize:'16px'}}>{myName || myPhone}</div>
                  <div style={{fontSize:'12px', color:'#10B981'}}>● Online</div>
                </div>
              </div>
              <button onClick={() => { setPage('auth'); setActiveChatUser(null); }} style={{background:'none', border:'none', color:theme.textMuted, cursor:'pointer'}} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
            <div style={{padding:'20px', borderBottom:'1px solid #232D42'}}>
              <form onSubmit={handleAddNewContact} style={{display:'flex', gap:'8px'}}>
                <input type="text" placeholder="🔍 Enter number to chat..." value={newContactPhone} onChange={e => setNewContactPhone(e.target.value)} required 
                  style={{flexGrow:1, padding:'12px', borderRadius:'12px', border:'1px solid #232D42', background:theme.bg, color:'white', outline:'none', fontSize:'14px'}} />
                <button type="submit" style={{background:theme.accent, color:'white', border:'none', width:'42px', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                  <UserPlus size={18} />
                </button>
              </form>
            </div>
            <div style={{flexGrow:1, overflowY:'auto', padding:'10px'}}>
              <div style={{fontSize:'11px', fontWeight:'700', color:theme.textMuted, padding:'10px 10px 5px 10px', letterSpacing:'1px'}}>CHATS</div>
              {recentChats.map(chat => {
                const isSelected = activeChatUser?.phoneNumber === chat.phoneNumber;
                return (
                  <div key={chat.phoneNumber} onClick={() => setActiveChatUser(chat)} 
                    style={{display:'flex', alignItems:'center', gap:'14px', padding:'12px', borderRadius:'16px', cursor:'pointer', background: isSelected ? theme.surfaceLight : 'transparent', marginBottom:'4px'}}>
                    <div style={{fontSize:'24px', background:theme.bg, width:'45px', height:'45px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      {chat.avatar || '🐱'}
                    </div>
                    <div style={{flexGrow:1}}>
                      <div style={{fontWeight:'600', fontSize:'15px'}}>{chat.name}</div>
                      <div style={{fontSize:'12px', color:theme.textMuted, marginTop:'2px'}}>{chat.phoneNumber}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{flexGrow:1, background:theme.bg, display:'flex', flexDirection:'column', position:'relative'}}>
            {activeChatUser ? (
              <>
                <div style={{padding:'18px 24px', background:theme.surface, borderBottom:'1px solid #232D42', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:'14px'}}>
                    <div style={{fontSize:'24px', background:theme.surfaceLight, width:'42px', height:'42px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      {activeChatUser.avatar || '🐱'}
                    </div>
                    <div>
                      <div style={{fontWeight:'700', fontSize:'16px'}}>{activeChatUser.name}</div>
                      <div style={{fontSize:'12px', color:theme.textMuted}}>{activeChatUser.phoneNumber}</div>
                    </div>
                  </div>
                  <div style={{display:'flex', gap:'12px'}}>
                    <button onClick={() => setIsCalling(true)} style={{background:theme.surfaceLight, border:'none', color:'white', width:'40px', height:'40px', borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center'}}>
                      <Video size={18} />
                    </button>
                  </div>
                </div>

                {isCalling ? (
                  <div ref={startCall} style={{ width: '100%', height: '100%', background:'#000' }}></div>
                ) : (
                  <>
                    <div style={{flexGrow:1, overflowY:'auto', padding:'24px', display:'flex', flexDirection:'column', gap:'12px'}}>
                      {messages.map(msg => {
                        const isMe = msg.sender === myPhone;
                        return (
                          <div key={msg.id} style={{display:'flex', justifyContent: isMe ? 'flex-end' : 'flex-start'}}>
                            <div style={{display:'flex', flexDirection:'column', alignItems: isMe ? 'flex-end' : 'flex-start', maxWidth:'65%'}}>
                              <div style={{background: isMe ? theme.meBubble : theme.themBubble, color:'white', padding:'12px 16px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px', fontSize:'15px', position:'relative', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', wordBreak:'break-word'}}>
                                <div>{msg.message}</div>
                                {isMe && (
                                  <div style={{display:'flex', gap:'8px', marginTop:'6px', justifyContent:'flex-end', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'4px'}}>
                                    <button onClick={() => { setEditingMsgId(msg.id); setMessageInput(msg.message); }} style={{background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', padding:0}}><Edit2 size={12}/></button>
                                    <button onClick={() => handleDelete(msg.id)} style={{background:'none', border:'none', color:'rgba(255,255,255,0.6)', cursor:'pointer', padding:0}}><Trash2 size={12}/></button>
                                  </div>
                                )}
                              </div>
                              <span style={{fontSize:'10px', color:theme.textMuted, marginTop:'4px', padding:'0 4px'}}>{msg.timestamp}</span>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={chatEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} style={{padding:'20px', background:theme.surface, borderTop:'1px solid #232D42', display:'flex', gap:'12px'}}>
                      <input type="text" placeholder={editingMsgId ? "📝 Modify your message..." : "Type a message..."} value={messageInput} onChange={e => setMessageInput(e.target.value)} required 
                        style={{flexGrow:1, background:theme.bg, border:'1px solid #232D42', borderRadius:'14px', padding:'14px 18px', color:'white', outline:'none', fontSize:'15px'}} />
                      <button type="submit" style={{background:theme.accent, color:'white', border:'none', padding:'0 22px', borderRadius:'14px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center'}}>
                        <Send size={18} />
                      </button>
                    </form>
                  </>
                )}
              </>
            ) : (
              <div style={{flexGrow:1, display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', color:theme.textMuted}}>
                <MessageCircle size={48} style={{color:theme.accent, marginBottom:'16px'}} />
                <h3 style={{color:'white', marginBottom:'6px', fontSize:'18px', fontWeight:'700'}}>Your Space is Ready</h3>
                <p style={{fontSize:'14px'}}>Select an active chat room or search numbers from left panel to start.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;