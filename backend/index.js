import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/api/ping', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ serverTime: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB failed' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend on port ${PORT}`));
