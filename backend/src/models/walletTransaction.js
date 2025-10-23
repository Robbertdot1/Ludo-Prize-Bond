
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const WalletTransaction = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  amount: Number,
  type: { type:String, enum:['deposit','withdraw','win','fee','refund'] },
  status: { type:String, enum:['pending','completed','rejected'], default:'completed' },
  relatedMatchId: { type: Schema.Types.ObjectId, ref: 'Match' },
},{ timestamps:true });
module.exports = mongoose.model('WalletTransaction', WalletTransaction);
