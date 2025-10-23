
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Admin = new Schema({
  username: String,
  passwordHash: String,
},{ timestamps:true });
module.exports = mongoose.model('Admin', Admin);
