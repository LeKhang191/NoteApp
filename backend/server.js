require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes         = require('./routers/auth');
const profileRoutes      = require('./routers/profile');
const noteRoutes         = require('./routers/notes');
const noteAdvancedRoutes = require('./routers/noteAdvanced'); 

const app    = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: ['http://localhost:5173', 'http://localhost:3000, https://noteapp-frontend-w2l9.onrender.com'], credentials: true }
});

app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('[O] MongoDB connected!'))
    .catch(err => console.error('[X] error:', err.message));

app.use('/api/auth',           authRoutes);
app.use('/api/profile',        profileRoutes);
app.use('/api/notes',          noteRoutes);
app.use('/api/notes-advanced', noteAdvancedRoutes);

io.on('connection', (socket) => {
    socket.on('join-note', (noteId) => socket.join(noteId));
    socket.on('note-change', ({ noteId, content, title }) => {
        socket.to(noteId).emit('note-updated', { content, title });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server on port ${PORT}`));