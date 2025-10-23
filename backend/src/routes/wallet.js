
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const WalletTransaction = require('../models/walletTransaction');
const Withdrawal = require('../models/withdrawal');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function auth(req,res,next){
  const h = req.headers.authorization;
  if(!h) return res.status(401).json({ error:'Unauthorized' });
  const token = h.split(' ')[1];
  try{
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.id; next();
  }catch(e){ return res.status(401).json({ error:'Invalid token' }); }
}

router.get('/balance', auth, async (req,res)=>{
  const u = await User.findById(req.userId);
  res.json({ balance: u.walletBalance });
});

// start a mock deposit (returns a mock checkout URL)
router.post('/deposit', auth, async (req,res)=>{
  const { amount } = req.body;
  if(!amount || amount<=0) return res.status(400).json({ error:'Invalid amount' });
  // Create pending transaction
  const tx = await WalletTransaction.create({ userId:req.userId, amount, type:'deposit', status:'pending' });
  // Return a mock 'checkout' url and webhook hint
  res.json({ checkoutUrl: `https://mockpay.local/checkout/${tx._id}`, webhookHint:'/api/wallet/webhook (POST) with { txId, status }' });
});

// webhook to mark deposit complete (mock)
router.post('/webhook', async (req,res)=>{
  const { txId, status } = req.body;
  const tx = await WalletTransaction.findById(txId);
  if(!tx) return res.status(404).json({ error:'tx not found' });
  if(status === 'completed'){
    tx.status = 'completed';
    await tx.save();
    await User.findByIdAndUpdate(tx.userId, { $inc: { walletBalance: tx.amount } });
  } else {
    tx.status = 'rejected'; await tx.save();
  }
  res.json({ ok:true });
});

router.post('/withdraw', auth, async (req,res)=>{
  const { amount } = req.body;
  if(!amount || amount<=0) return res.status(400).json({ error:'Invalid amount' });
  const u = await User.findById(req.userId);
  if(u.walletBalance < amount) return res.status(400).json({ error:'Insufficient balance' });
  // Create withdrawal request (pending)
  const w = await Withdrawal.create({ userId:req.userId, amount, status:'pending' });
  // lock funds (simple): decrement balance, create tx
  u.walletBalance -= amount;
  await u.save();
  await WalletTransaction.create({ userId:req.userId, amount, type:'withdraw', status:'pending' });
  res.json({ ok:true, withdrawalId: w._id });
});

module.exports = router;
