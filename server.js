require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

const notes = {}; // Store notes in-memory for simplicity

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Joining a room
    socket.on('joinRoom', (room) => {
        socket.join(room);
        socket.to(room).emit('userJoined', `User ${socket.id} joined room ${room}`);
        if (notes[room]) {
            socket.emit('loadNote', notes[room]); // Send existing note
        }
    });

    // Handling real-time note editing
    socket.on('editNote', ({ room, content }) => {
        notes[room] = content; // Save note content
        socket.to(room).emit('noteUpdated', content);
    });

    // Leaving a room
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

server.listen(5000, () => console.log("Server running on port 5000"));
