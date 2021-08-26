const express = require('express');
const cors = require('cors');
const client = require('./client.js');
const app = express();
const morgan = require('morgan');
const ensureAuth = require('./auth/ensure-auth');
const createAuthRoutes = require('./auth/create-auth-routes');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev')); // http logging

const authRoutes = createAuthRoutes();

app.use('/auth', authRoutes);

app.use('/api', ensureAuth);

app.get('/api/test', (req, res) => {
  res.json({
    message: `in this protected route, we get the user's id like so: ${req.userId}`
  });
});

app.get('/api/to-dos', async(req, res) => {
  try {
    const data = await client.query('SELECT * from to_do_list');
    
    res.json(data.rows);
  } catch(e) { 
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/to-dos', async(req, res) => {
  try {
    const data = await client.query(`
    INSERT INTO to_do_list(
      todo,
      completed,
      user_id
    ) VALUES ($1, $2, $3)
    RETURNING *;`, [
      req.body.todo,
      req.body.completed,
      req.body.user_id,
    ]);
    res.json(data.rows[0]);
  }catch(e){
    res.status(500).json({ error: e.message });
  }
});

app.put('/to-dos/:id', async(req, res) => {
  try {
    const data = await client.query(`
    UPDATE to_do_list
    SET
      todo = $2,
      completed = $3,
      user_id = $4
    WHERE id = $1
    RETURNING *;
    `, [
      req.params.id,
      req.body.todo,
      req.body.completed,
      req.body.user_id
    ]);
    res.json(data.rows[0]);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(require('./middleware/error'));

module.exports = app;
