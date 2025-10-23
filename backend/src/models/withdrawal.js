
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Withdrawal = new Schema({
  userId: { type: Schema.Types.ObjectId, ref:'User' },
  amount: Number,
  status: { type:String, enum:['pending','approved','rejected'], default:'pending' },
},{ timestamps:true });
module.exports = mongoose.model('Withdrawal', Withdrawal);
