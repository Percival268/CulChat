const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: "*", // Allow all origins (update for production)
    methods: ["GET", "POST"]
  }
});
const path = require('path');
const PORT = process.env.PORT || 3000;

// Enhanced server logging
console.log(`Starting CulChat server on port ${PORT}...`);
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  console.log('Serving main page');
  res.sendFile(path.join(__dirname, 'public', 'deepCulchat.html'));
});

app.get('/global', (req, res) => {
  console.log('Serving global chat page');
  res.sendFile(path.join(__dirname, 'public', 'global-chat.html'));
});

// Track active connections
const activeRooms = new Map();

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`New connection: ${socket.id}`);
  
  // Client authentication timeout (15 seconds)
  const authTimeout = setTimeout(() => {
    if (!socket.room) {
      console.log(`Disconnecting unauthorized socket: ${socket.id}`);
      socket.disconnect(true);
    }
  }, 15000);

  // Join room handler
  socket.on('joinRoom', ({ name, room } = {}) => {
    if (!name || !room) {
      console.log(`Invalid joinRoom request from ${socket.id}`);
      socket.emit('error', 'Name and room are required');
      return;
    }

    clearTimeout(authTimeout);
    
    // Leave previous room if exists
    if (socket.room) {
      socket.leave(socket.room);
      console.log(`${name} left room ${socket.room}`);
    }

    // Join new room
    socket.join(room);
    socket.name = name;
    socket.room = room;
    
    // Update active rooms tracking
    if (!activeRooms.has(room)) {
      activeRooms.set(room, new Set());
    }
    activeRooms.get(room).add(socket.id);

    console.log(`${name} joined room ${room} (${Array.from(activeRooms.get(room)).length} users)`);

    // Welcome messages
    socket.emit('message', {
      name: 'CulChat Bot',
      text: `Welcome to ${room}, ${name}! Start chatting about culinary adventures.`,
      time: new Date().toLocaleTimeString()
    });

    socket.broadcast.to(room).emit('message', {
      name: 'CulChat Bot',
      text: `${name} has joined the kitchen! 👨‍🍳`,
      time: new Date().toLocaleTimeString()
    });

    // Send updated user list
    updateUserList(room);
  });

  // Message handler
  socket.on('chatMessage', (msg) => {
    if (!socket.room || !socket.name) {
      socket.emit('error', 'You must join a room first');
      return;
    }

    if (typeof msg !== 'string' || msg.trim().length === 0) {
      console.log(`Invalid message from ${socket.name} in ${socket.room}`);
      return;
    }

    console.log(`Message from ${socket.name} in ${socket.room}: ${msg}`);

    // Broadcast to room
    io.to(socket.room).emit('message', {
      name: socket.name,
      text: msg,
      time: new Date().toLocaleTimeString()
    });
  });

  // Typing indicator
  socket.on('activity', () => {
    if (socket.room && socket.name) {
      socket.broadcast.to(socket.room).emit('activity', socket.name);
    }
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`Disconnected: ${socket.id} (${socket.name || 'anonymous'})`);
    
    if (socket.room) {
      // Remove from active rooms
      if (activeRooms.has(socket.room)) {
        activeRooms.get(socket.room).delete(socket.id);
        
        // Notify room
        io.to(socket.room).emit('message', {
          name: 'CulChat Bot',
          text: `${socket.name} has left the kitchen. 👋`,
          time: new Date().toLocaleTimeString()
        });

        // Update user list
        updateUserList(socket.room);
      }
    }
  });

  // Error handler
  socket.on('error', (err) => {
    console.error(`Socket error (${socket.id}):`, err);
  });
});

// Helper function to update user lists
function updateUserList(room) {
  io.in(room).fetchSockets().then(sockets => {
    const users = sockets.map(s => s.name).filter(Boolean);
    io.to(room).emit('userList', { 
      users,
      count: users.length,
      room
    });
    console.log(`Updated user list for ${room}: ${users.join(', ')}`);
  });
}

// Server error handlers
http.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

// Start server
http.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}/socket.io/`);
});