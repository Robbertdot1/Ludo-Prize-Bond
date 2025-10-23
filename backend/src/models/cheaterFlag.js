
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const CheaterFlag = new Schema({
  userId: { type: Schema.Types.ObjectId, ref:'User' },
  matchId: { type: Schema.Types.ObjectId, ref:'Match' },
  reason: String,
  reviewed: { type:Boolean, default:false },
},{ timestamps:true });
module.exports = mongoose.model('CheaterFlag', CheaterFlag);
