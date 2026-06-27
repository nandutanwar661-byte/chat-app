const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// 🌐 CORS CONFIGURATION (Ab koi bhi Vercel link block nahi hoga)
app.use(cors({
    origin: true, 
    methods: ["GET", "POST"],
    credentials: true
}));
app.use(express.json());

const server = http.createServer(app);

// ⚡ SOCKET.IO CORS CONFIGURATION
const io = new Server(server, {
    cors: { 
        origin: true, 
        methods: ["GET", "POST"],
        credentials: true
    }
});

// 📁 LOCAL JSON FILES
const USERS_FILE = path.join(__dirname, 'users.json');
const MESSAGES_FILE = path.join(__dirname, 'messages.json');

const readData = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content ? JSON.parse(content) : [];
    } catch (e) {
        return [];
    }
};

const writeData = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
        console.error("File write error:", e);
    }
};

// --- APIs ---

// 1. Auth (Login/Register)
app.post('/api/auth', async (req, res) => {
    try {
        const { phoneNumber, name, avatar, password, isLogin } = req.body;
        if (!phoneNumber || !password) {
            return res.status(400).json({ error: "Mobile number aur password zaroori hain!" });
        }

        const cleanPhone = phoneNumber.toString().trim();
        const cleanPassword = password.toString().trim();

        const localUsersTable = readData(USERS_FILE);
        let user = localUsersTable.find(u => u.phoneNumber === cleanPhone);
        
        if (isLogin) {
            if (!user) return res.status(404).json({ error: "Registered nahi hai!" });
            if (user.password !== cleanPassword) return res.status(401).json({ error: "Password galat hai!" });
            return res.status(200).json(user);
        } else {
            if (user) return res.status(400).json({ error: "Pehle se registered hai!" });
            
            const newUser = {
                _id: "usr_" + Math.random().toString(36).substr(2, 9),
                phoneNumber: cleanPhone,
                name: name ? name.toString().trim() : "User",
                avatar: avatar || "👑",
                password: cleanPassword,
                hiddenChats: [] 
            };
            
            localUsersTable.push(newUser);
            writeData(USERS_FILE, localUsersTable);
            return res.status(201).json(newUser);
        }
    } catch (err) {
        return res.status(500).json({ error: "Server error." });
    }
});

// 2. Chat History Retrieval
app.get('/api/messages/:user1/:user2', async (req, res) => {
    try {
        const { user1, user2 } = req.params;
        const localMessagesTable = readData(MESSAGES_FILE);
        
        const history = localMessagesTable.filter(m => 
            (m.sender === user1 && m.receiver === user2) || 
            (m.sender === user2 && m.receiver === user1)
        );
        return res.json(history);
    } catch (err) {
        return res.status(500).json([]);
    }
});

// 3. Recent Chats Tracker
app.get('/api/recent/:phone', async (req, res) => {
    try {
        const { phone } = req.params;
        const localMessagesTable = readData(MESSAGES_FILE);
        const localUsersTable = readData(USERS_FILE);
        
        const currentUser = localUsersTable.find(u => u.phoneNumber === phone);
        const hiddenChats = currentUser && currentUser.hiddenChats ? currentUser.hiddenChats : [];

        const interactionNumbers = new Set();
        localMessagesTable.forEach(m => {
            if (m.sender === phone) interactionNumbers.add(m.receiver);
            if (m.receiver === phone) interactionNumbers.add(m.sender);
        });

        const activeChats = Array.from(interactionNumbers)
            .filter(num => !hiddenChats.includes(num)) 
            .map(num => {
                const foundUser = localUsersTable.find(u => u.phoneNumber === num);
                return {
                    _id: foundUser ? foundUser._id : "usr_" + Math.random().toString(36).substr(2, 9),
                    phoneNumber: num,
                    name: foundUser ? foundUser.name : `User (${num})`,
                    avatar: foundUser ? foundUser.avatar : "👑"
                };
            });

        return res.json(activeChats);
    } catch (err) {
        return res.status(500).json([]);
    }
});

// 4. DELETE CHAT API
app.post('/api/chats/delete', (req, res) => {
    try {
        const { myPhone, targetPhone } = req.body;
        let localMessagesTable = readData(MESSAGES_FILE);

        localMessagesTable = localMessagesTable.filter(m => 
            !((m.sender === myPhone && m.receiver === targetPhone) || 
              (m.sender === targetPhone && m.receiver === myPhone))
        );

        writeData(MESSAGES_FILE, localMessagesTable);
        return res.json({ success: true, message: "Chat deleted permanently!" });
    } catch (e) {
        return res.status(500).json({ error: "Delete failed" });
    }
});

// 5. HIDE CHAT API
app.post('/api/chats/hide', (req, res) => {
    try {
        const { myPhone, targetPhone } = req.body;
        const localUsersTable = readData(USERS_FILE);

        const user = localUsersTable.find(u => u.phoneNumber === myPhone);
        if (user) {
            if (!user.hiddenChats) user.hiddenChats = [];
            if (!user.hiddenChats.includes(targetPhone)) {
                user.hiddenChats.push(targetPhone);
            }
            writeData(USERS_FILE, localUsersTable);
        }
        return res.json({ success: true, message: "Chat hidden successfully!" });
    } catch (e) {
        return res.status(500).json({ error: "Hide failed" });
    }
});

// --- SOCKETS ---
const activeSockets = {};

io.on('connection', (socket) => {
    socket.on("register_user", (phone) => { 
        if (phone) activeSockets[phone] = socket.id; 
    });

    socket.on("send_message", (data) => {
        try {
            const localMessagesTable = readData(MESSAGES_FILE);
            const localUsersTable = readData(USERS_FILE);
            
            [data.sender, data.receiver].forEach(p => {
                const u = localUsersTable.find(user => user.phoneNumber === p);
                if (u && u.hiddenChats) {
                    u.hiddenChats = u.hiddenChats.filter(x => x !== (p === data.sender ? data.receiver : data.sender));
                }
            });
            writeData(USERS_FILE, localUsersTable);

            const msgObj = {
                _id: data._id || "msg_" + Math.random().toString(36).substr(2, 9),
                id: data.id || Date.now().toString(),
                sender: data.sender,
                receiver: data.receiver,
                message: data.message,
                timestamp: data.timestamp || new Date().toLocaleTimeString()
            };
            
            localMessagesTable.push(msgObj);
            writeData(MESSAGES_FILE, localMessagesTable);
            
            if (activeSockets[data.receiver]) io.to(activeSockets[data.receiver]).emit("receive_message", msgObj);
            if (activeSockets[data.sender]) io.to(activeSockets[data.sender]).emit("receive_message", msgObj);
            
            if (activeSockets[data.receiver]) io.to(activeSockets[data.receiver]).emit("recent_updated");
            if (activeSockets[data.sender]) io.to(activeSockets[data.sender]).emit("recent_updated");
            
        } catch(e) { 
            console.error(e); 
        }
    });

    socket.on('disconnect', () => {
        for (let p in activeSockets) { 
            if (activeSockets[p] === socket.id) { delete activeSockets[p]; break; } 
        }
    });
});

// 🚀 RENDER DEPLOYMENT PORT
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});