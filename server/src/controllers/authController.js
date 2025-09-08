const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.signup = async (req,res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const existing = await prisma.user.findUnique({ where: { email }});
    if (existing) return res.status(409).json({ message: 'Email exists' });
    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { email, passwordHash: hash, name }});
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ accessToken: token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  } catch (err) {
    console.error('signup err', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req,res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });
    const user = await prisma.user.findUnique({ where: { email }});
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ accessToken: token, user: { id: user.id, email: user.email, name: user.name, role: user.role }});
  } catch (err) {
    console.error('login err', err);
    res.status(500).json({ message: 'Server error' });
  }
};
