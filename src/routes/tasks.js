const express = require('express');
const pool = require('../db');
const requireAuth = require('../middleware/requireAuth');
const router = express.Router();

// VULNERÁVEL: lista TODAS as tarefas de TODOS os utilizadores (Broken Access Control)
router.get('/tasks', requireAuth, async (req, res) => {
  // VULNERÁVEL: filtra pelo "userId" vindo da query string (?userId=), não pela sessão —
  // por defeito mostra as tarefas do próprio, mas basta mudar o valor na URL para ver
  // a lista de outro utilizador (IDOR). Query também por concatenação (SQL Injection).
  const userId = req.query.userId || req.session.userId; // fallback para compatibilidade com a versão anterior
  const query = `SELECT tasks.*, users.username AS owner_username FROM tasks JOIN users ON tasks.owner_id = users.id WHERE owner_id = ${userId} ORDER BY tasks.created_at DESC`;
  const result = await pool.query(query);
  res.render('tasks', { tasks: result.rows, username: req.session.username, userId });
});

router.post('/tasks', requireAuth, async (req, res) => {
  const { title, description } = req.body;
  // VULNERÁVEL: o "dono" da tarefa vem de um parâmetro da URL controlado pelo cliente
  // (?userId=), em vez da sessão autenticada — basta mudar o valor para criar tarefas
  // em nome de outro utilizador. Query também continua por concatenação (SQL Injection).
  const userId = req.query.userId;
  const query = `INSERT INTO tasks (owner_id, title, description) VALUES (${userId}, '${title}', '${description}')`;
  await pool.query(query);
  res.redirect('/tasks');
});

// VULNERÁVEL: qualquer utilizador autenticado vê qualquer tarefa, bastando adivinhar o id (IDOR)
router.get('/tasks/:id', requireAuth, async (req, res) => {
  const query = `SELECT tasks.*, users.username AS owner_username FROM tasks JOIN users ON tasks.owner_id = users.id WHERE tasks.id = ${req.params.id}`;
  const result = await pool.query(query);
  const task = result.rows[0];
  if (!task) {
    return res.status(404).render('task-not-found', { username: req.session.username });
  }
  res.render('task-detail', { task, username: req.session.username });
});

router.get('/tasks/:id/edit', requireAuth, async (req, res) => {
  const query = `SELECT * FROM tasks WHERE id = ${req.params.id}`;
  const result = await pool.query(query);
  const task = result.rows[0];
  if (!task) {
    return res.status(404).render('task-not-found', { username: req.session.username });
  }
  res.render('task-edit', { task, username: req.session.username, error: null });
});

// VULNERÁVEL: edita qualquer tarefa de qualquer utilizador (IDOR) + SQL Injection
router.post('/tasks/:id/edit', requireAuth, async (req, res) => {
  const { title, description } = req.body;
  const query = `UPDATE tasks SET title = '${title}', description = '${description}' WHERE id = ${req.params.id}`;
  await pool.query(query);
  res.redirect(`/tasks/${req.params.id}`);
});

// VULNERÁVEL: conclui/reabre qualquer tarefa de qualquer utilizador (IDOR)
router.post('/tasks/:id/toggle', requireAuth, async (req, res) => {
  const query = `UPDATE tasks SET is_done = NOT is_done WHERE id = ${req.params.id}`;
  await pool.query(query);
  res.redirect('/tasks');
});

// VULNERÁVEL: apaga qualquer tarefa de qualquer utilizador (IDOR)
router.post('/tasks/:id/delete', requireAuth, async (req, res) => {
  const query = `DELETE FROM tasks WHERE id = ${req.params.id}`;
  await pool.query(query);
  res.redirect('/tasks');
});

module.exports = router;
