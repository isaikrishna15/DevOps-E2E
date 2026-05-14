const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const redis = require('redis');

const app = express();

app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432,
});

// Redis Connection
const redisClient = redis.createClient({
  url: `redis://${process.env.REDIS_HOST}:6379`,
});

redisClient.on('error', (err) => {
  console.error('Redis Error:', err);
});

// Connect Redis
(async () => {
  await redisClient.connect();
  console.log('Connected to Redis');
})();

// Create Table If Not Exists
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255)
      )
    `);

    console.log('Tasks table ready');
  } catch (err) {
    console.error('DB Init Error:', err);
  }
})();

// Get All Tasks
app.get('/tasks', async (req, res) => {
  try {
    // Check Redis Cache
    const cachedTasks = await redisClient.get('tasks');

    if (cachedTasks) {
      console.log('Serving from Redis cache');
      return res.json(JSON.parse(cachedTasks));
    }

    // Fetch From PostgreSQL
    const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');

    // Save To Redis
    await redisClient.set('tasks', JSON.stringify(result.rows));

    console.log('Serving from PostgreSQL');

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching tasks');
  }
});

// Add Task
app.post('/tasks', async (req, res) => {
  try {
    const { title } = req.body;

    if (!title) {
      return res.status(400).send('Title is required');
    }

    await pool.query(
      'INSERT INTO tasks(title) VALUES($1)',
      [title]
    );

    // Clear Cache
    await redisClient.del('tasks');

    res.send('Task Added Successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error adding task');
  }
});

// Health Check Route
app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Start Server
app.listen(5000, () => {
  console.log('Backend running on port 5000');
});