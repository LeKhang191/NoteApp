require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes    = require('./routers/auth');
const profileRoutes = require('./routers/profile');
const noteRoutes    = require('./routers/notes');

const app = express();

app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('[O] MongoDB successfully connected!'))
    .catch(err => console.error('[X] error:', err.message));

// ← THÊM 3 DÒNG NÀY
app.use('/api/auth',    authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notes',   noteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server successfully started on port ${PORT}`));