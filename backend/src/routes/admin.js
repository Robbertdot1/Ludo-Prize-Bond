
const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const User = require('../models/user');
const WalletTransaction = require('../models/walletTransaction');
const Withdrawal = require('../models/withdrawal');

// Simple admin check via header X-ADMIN-TOKEN (for demo only)
function adminAuth(req,res,next){
  const t = req.headers['x-admin-token'];
  if(t && t === (process.env.ADMIN_TOKEN || 'admintoken')) return next();
  res.status(401).json({ error:'unauthorized' });
}

router.get('/users', adminAuth, async (req,res)=>{
  const users = await User.find().select('-passwordHash');
  res.json({ users });
});

router.get('/withdrawals', adminAuth, async (req,res)=>{
  const w = await Withdrawal.find().populate('userId','username email');
  res.json({ withdrawals: w });
});

router.post('/withdrawals/:id/approve', adminAuth, async (req,res)=>{
  const id = req.params.id;
  const w = await Withdrawal.findById(id);
  if(!w) return res.status(404).json({ error:'not found' });
  w.status = 'approved'; await w.save();
  // mark related tx as completed (simple)
  await WalletTransaction.findOneAndUpdate({ userId:w.userId, type:'withdraw', status:'pending' }, { status:'completed' });
  res.json({ ok:true });
});

module.exports = router;
