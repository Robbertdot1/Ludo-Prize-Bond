
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Admin = require('./models/admin');
const WalletTransaction = require('./models/walletTransaction');

const MONGO = process.env.MONGO_URI||'mongodb://localhost:27017/ludo_realm_pkr';

async function run(){
  await mongoose.connect(MONGO);
  console.log('Connected to mongo for seeding');
  await User.deleteMany({ email: /example.com$/ });
  const users = [];
  for(let i=1;i<=4;i++){
    const pw = await bcrypt.hash('demoPass123', 10);
    const u = await User.create({ username:`demo${i}`, email:`demo${i}@example.com`, passwordHash: pw, walletBalance:1000, referralCode:`REF${i}` });
    users.push(u);
    await WalletTransaction.create({ userId:u._id, amount:1000, type:'deposit', status:'completed' });
  }
  await Admin.deleteMany({});
  const apw = await bcrypt.hash('adminPass123', 10);
  await Admin.create({ username:'admin', passwordHash:apw });
  console.log('Seed finished. Created demo users demo1..demo4 with password demoPass123 and admin/adminPass123');
  process.exit(0);
}
run().catch(e=>{ console.error(e); process.exit(1); });
