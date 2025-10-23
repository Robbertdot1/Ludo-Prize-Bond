
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Match = new Schema({
  roomCode: String,
  players: [{ userId: { type: Schema.Types.ObjectId, ref:'User' }, seat:Number }],
  entryFee: Number,
  state: { type:String, enum:['waiting','playing','finished'], default:'waiting' },
  movesLog: [{ at:Date, userId:Schema.Types.ObjectId, payload:Schema.Types.Mixed }],
  winnerId: { type: Schema.Types.ObjectId, ref:'User' },
},{ timestamps:true });
module.exports = mongoose.model('Match', Match);
