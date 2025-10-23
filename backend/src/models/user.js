
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const UserSchema = new Schema({
  username: { type:String, required:true },
  email: { type:String, required:true, unique:true },
  passwordHash: { type:String, required:true },
  walletBalance: { type:Number, default:0 },
  avatarUrl: { type:String },
  isBanned: { type:Boolean, default:false },
  referralCode: { type:String },
  deviceToken: { type:String },
},{ timestamps:true });
module.exports = mongoose.model('User', UserSchema);
