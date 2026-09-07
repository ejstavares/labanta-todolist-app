const express = require('express');
const pool = require('../db');
const router = express.Router();

// ============================================================================
// API de Tarefas — versão VULNERÁVEL (baseline de partida do curso)
//
// VULNERÁVEL (OWASP API Security Top 10 — API2:2023 Broken Authentication):
// Nenhum destes endpoints exige qualquer credencial (nem sessão, nem token).
// Basta um `curl`/Postman para ler, criar, editar ou apagar tarefas de
// QUALQUER utilizador — sem sequer estar autenticado.
//
// VULNERÁVEL (API1:2023 Broken Object Level Authorization — BOLA):
// mesmo assumindo que alguém "está autenticado", nenhum endpoint confirma
// que o objeto pedido (a tarefa com `id`) pertence a quem faz o pedido.
//
// Numa sessão futura (Broken Access Control / JWT) isto vai ser corrigido:
// - adicionar `POST /api/login` a emitir um JWT;
// - middleware `authenticateJWT` a aplicar a todas as rotas `/api`;
// - usar `req.user.id` (vindo do token) para filtrar/atribuir owner_id,
//   em vez de confiar em nada vindo do cliente.
// ============================================================================

router.get('/api/tasks', async (req, res) => {
  const query = `SELECT tasks.*, users.username AS owner_username FROM tasks JOIN users ON tasks.owner_id = users.id ORDER BY tasks.created_at DESC`;
  const result = await pool.query(query);
  res.json(result.rows);
});

router.get('/api/tasks/:id', async (req, res) => {
  const query = `SELECT tasks.*, users.username AS owner_username FROM tasks JOIN users ON tasks.owner_id = users.id WHERE tasks.id = ${req.params.id}`;
  const result = await pool.query(query);
  const task = result.rows[0];
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.json(task);
});

router.post('/api/tasks', async (req, res) => {
  const { ownerId, title, description } = req.body;
  const query = `INSERT INTO tasks (owner_id, title, description) VALUES (${ownerId}, '${title}', '${description}') RETURNING *`;
  const result = await pool.query(query);
  res.status(201).json(result.rows[0]);
});

router.put('/api/tasks/:id', async (req, res) => {
  const { title, description } = req.body;
  const query = `UPDATE tasks SET title = '${title}', description = '${description}' WHERE id = ${req.params.id} RETURNING *`;
  const result = await pool.query(query);
  const task = result.rows[0];
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.json(task);
});

router.delete('/api/tasks/:id', async (req, res) => {
  const query = `DELETE FROM tasks WHERE id = ${req.params.id} RETURNING *`;
  const result = await pool.query(query);
  const task = result.rows[0];
  if (!task) return res.status(404).json({ error: 'Tarefa não encontrada.' });
  res.json({ deleted: task });
});

module.exports = router;
