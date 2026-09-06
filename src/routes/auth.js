const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

// GET /register - Render the registration page
router.get('/register', (req, res) => res.render('register', { error: null, username: null }));

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
      [username, hash]
    );
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Utilizador já existe ou dados inválidos.', username: null });
  }
});

router.get('/login', (req, res) => res.render('login', { error: null, username: null }));

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.render('login', { error: 'Credenciais inválidas.', username: null });
  }

  req.session.userId = user.id;
  req.session.username = user.username; // novo: para mostrar na navbar
  res.redirect('/tasks');
});

// GET /logout - Handle user logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

module.exports = router;