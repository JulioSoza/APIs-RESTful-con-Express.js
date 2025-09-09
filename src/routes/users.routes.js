const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const validateCreateUser = require('../middlewares/validate');
const db = require('../db');

// Crear usuario
router.post('/users', validateCreateUser, async (req, res) => {
  try {
    const { username, password, role_id } = req.body;

    // validar unicidad de username
    const exists = await db.query('SELECT 1 FROM users WHERE username = $1', [username]);
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'username ya existe' });
    }

    // hash del password
    const hash = await bcrypt.hash(password, 10);

    const insert = `
      INSERT INTO users (username, password, role_id)
      VALUES ($1, $2, $3)
      RETURNING id, username, role_id, created_at
    `;

    const { rows } = await db.query(insert, [username, hash, role_id]);
    return res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /users error:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Listar usuarios
router.get('/users', async (_req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, username, role_id, created_at FROM users ORDER BY created_at DESC'
    );
    return res.json(rows);
  } catch (err) {
    console.error('GET /users error:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Obtener un usuario por id
router.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query(
      'SELECT id, username, role_id, created_at FROM users WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.json(rows[0]);
  } catch (err) {
    console.error('GET /users/:id error:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Actualizar usuario (parcial: cualquiera de los 3 campos)
router.put('/users/:id', validateCreateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, password, role_id } = req.body;

    // construir SET dinámico
    const sets = [];
    const values = [];
    let idx = 1;

    if (username) {
      sets.push(`username = $${idx++}`);
      values.push(username);
    }
    if (password) {
      const hash = await bcrypt.hash(password, 10);
      sets.push(`password = $${idx++}`); // <- usar la columna "password"
      values.push(hash);
    }
    if (role_id) {
      sets.push(`role_id = $${idx++}`);
      values.push(role_id);
    }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'Nada para actualizar' });
    }

    values.push(id); // último parámetro para WHERE

    const update = `
      UPDATE users SET ${sets.join(', ')}
      WHERE id = $${idx}
      RETURNING id, username, role_id, created_at
    `;

    const { rows } = await db.query(update, values);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

    return res.json(rows[0]);
  } catch (err) {
    console.error('PUT /users/:id error:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

// Eliminar usuario
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const del = await db.query('DELETE FROM users WHERE id = $1', [id]);
    if (del.rowCount === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    return res.status(204).send(); // sin cuerpo
  } catch (err) {
    console.error('DELETE /users/:id error:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
});

module.exports = router;
