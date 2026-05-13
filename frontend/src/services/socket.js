import { io } from 'socket.io-client';

const io = new Server(server, {
  cors: {
    origin: "https://noteapp-frontend-w2l9.onrender.com", 
    methods: ["GET", "POST"]
  }
});
export default socket;