const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

router.get('/tasks', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE owner_id = $1 ORDER BY created_at DESC',
    [req.session.userId]
  );
  res.render('tasks', { tasks: result.rows, username: req.session.username });
});

router.post('/tasks', requireAuth, async (req, res) => {
  const { title, description } = req.body;
  await pool.query(
    'INSERT INTO tasks (owner_id, title, description) VALUES ($1, $2, $3)',
    [req.session.userId, title, description]
  );
  res.redirect('/tasks');
});

router.get('/tasks/:id', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE id = $1 AND owner_id = $2',
    [req.params.id, req.session.userId]
  );
  const task = result.rows[0];
  if (!task) {
    return res.status(404).render('task-not-found', { username: req.session.username });
  }
  res.render('task-detail', { task, username: req.session.username });
});

router.get('/tasks/:id/edit', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM tasks WHERE id = $1 AND owner_id = $2',
    [req.params.id, req.session.userId]
  );
  const task = result.rows[0];
  if (!task) {
    return res.status(404).render('task-not-found', { username: req.session.username });
  }
  res.render('task-edit', { task, username: req.session.username, error: null });
});

router.post('/tasks/:id/edit', requireAuth, async (req, res) => {
  const { title, description } = req.body;
  await pool.query(
    'UPDATE tasks SET title = $1, description = $2 WHERE id = $3 AND owner_id = $4',
    [title, description, req.params.id, req.session.userId]
  );
  res.redirect(`/tasks/${req.params.id}`);
});

router.post('/tasks/:id/toggle', requireAuth, async (req, res) => {
  await pool.query(
    'UPDATE tasks SET is_done = NOT is_done WHERE id = $1 AND owner_id = $2',
    [req.params.id, req.session.userId]
  );
  res.redirect('/tasks');
});

router.post('/tasks/:id/delete', requireAuth, async (req, res) => {
  await pool.query('DELETE FROM tasks WHERE id = $1 AND owner_id = $2', [
    req.params.id,
    req.session.userId,
  ]);
  res.redirect('/tasks');
});

module.exports = router;