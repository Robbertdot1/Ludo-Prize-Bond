
require('dotenv').config();
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const { Server } = require('socket.io');
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const adminRoutes = require('./routes/admin');
const gameSocket = require('./sockets/game');
const app = express();

const PORT = process.env.PORT || 4000;
const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/ludo_realm_pkr';

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60*1000, max: 200 }));

app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/admin', adminRoutes);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: true } });

gameSocket(io);

mongoose.connect(MONGO).then(()=>{
  console.log('Mongo connected');
  server.listen(PORT, ()=> console.log('Server listening on', PORT));
}).catch(err=>{ console.error('Mongo connection error', err); process.exit(1); });
