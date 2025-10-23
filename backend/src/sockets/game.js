
const { v4: uuidv4 } = require('uuid');
const Match = require('../models/match');
const User = require('../models/user');
const WalletTransaction = require('../models/walletTransaction');

module.exports = function(io){
  const rooms = {}; // in-memory room state for demo; persisted on match create

  io.on('connection', (socket)=>{
    socket.on('join-room', async ({ token, roomCode })=>{
      // Very simple token -> userId decode (for demo; in prod verify properly)
      try{
        const payload = require('jsonwebtoken').verify(token, process.env.JWT_SECRET || 'devsecret');
        const userId = payload.id;
        let room = rooms[roomCode];
        if(!room){
          room = { id:roomCode, players:[], entryFee: parseInt(process.env.DEFAULT_ENTRY_FEE||100), state:'waiting' };
          rooms[roomCode]=room;
        }
        if(room.players.find(p=>p.userId==userId)) return;
        if(room.players.length>=4) return socket.emit('room-full');
        room.players.push({ userId, socketId: socket.id, seat: room.players.length });
        socket.join(roomCode);
        io.to(roomCode).emit('room-update', { players: room.players.map(p=>p.userId), state: room.state, entryFee:room.entryFee });
        if(room.players.length===4){
          // auto-start after short delay
          setTimeout(()=> startMatch(io, roomCode), 1000);
        }
      }catch(e){ socket.emit('error','invalid token'); }
    });

    socket.on('roll-dice-request', async ({ roomCode })=>{
      const room = rooms[roomCode];
      if(!room) return;
      // server-side randomness
      const dice = Math.floor(Math.random()*6)+1;
      // broadcast dice
      io.to(roomCode).emit('dice-rolled', { dice });
      // For demo, we do not compute full ludo moves; clients will ask server to move and server verifies turn.
    });

    socket.on('move-token', async ({ roomCode, userId, payload })=>{
      // Append move to match log (demo)
      io.to(roomCode).emit('move-made', { userId, payload });
    });

    socket.on('leave-room', ({ roomCode })=>{
      const room = rooms[roomCode];
      if(room){
        room.players = room.players.filter(p=>p.socketId!==socket.id);
        io.to(roomCode).emit('room-update', { players: room.players.map(p=>p.userId) });
      }
      socket.leave(roomCode);
    });
  });

  async function startMatch(io, roomCode){
    const room = rooms[roomCode];
    if(!room) return;
    room.state='playing';
    // create match doc
    const m = await Match.create({ roomCode, players: room.players.map((p,i)=>({ userId:p.userId, seat:i })), entryFee: room.entryFee, state:'playing' });
    io.to(roomCode).emit('match-started', { matchId: m._id });
    // For demo, after 12s choose random winner and pay out
    setTimeout(async ()=>{
      const winnerIdx = Math.floor(Math.random()*room.players.length);
      const winner = room.players[winnerIdx];
      m.winnerId = winner.userId; m.state='finished'; await m.save();
      // payout logic: winner receives 2x own entry fee, platform keeps remainder per PLATFORM_FEE_PERCENT
      const entry = room.entryFee;
      const totalPool = entry * room.players.length;
      const winnerAmount = entry * 2;
      const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || 20);
      const platformTake = Math.round(totalPool - winnerAmount);
      // credit winner
      await WalletTransaction.create({ userId: winner.userId, amount: winnerAmount, type:'win', status:'completed', relatedMatchId: m._id });
      await User.findByIdAndUpdate(winner.userId, { $inc: { walletBalance: winnerAmount } });
      io.to(roomCode).emit('game-ended', { winner: winner.userId, winnerAmount, platformTake });
    }, 12000);
  }
};
