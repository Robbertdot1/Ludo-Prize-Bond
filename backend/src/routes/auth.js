
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

router.post('/register', async (req,res)=>{
  const { username, email, password } = req.body;
  if(!email || !password || !username) return res.status(400).json({ error:'Missing fields' });
  const exists = await User.findOne({ email });
  if(exists) return res.status(400).json({ error:'Email exists' });
  const hash = await bcrypt.hash(password, 10);
  const u = new User({ username, email, passwordHash:hash, walletBalance:0 });
  await u.save();
  const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user: { id:u._id, username:u.username, email:u.email, walletBalance:u.walletBalance } });
});

router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error:'Missing' });
  const u = await User.findOne({ email });
  if(!u) return res.status(400).json({ error:'Invalid' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if(!ok) return res.status(400).json({ error:'Invalid' });
  const token = jwt.sign({ id: u._id }, JWT_SECRET, { expiresIn:'7d' });
  res.json({ token, user:{ id:u._id, username:u.username, email:u.email, walletBalance:u.walletBalance } });
});

module.exports = router;
