const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = 3001; // Porta padrão para a API

// Habilita JSON e chamadas do Frontend (CORS)
app.use(cors());
app.use(express.json());

// --- CONEXÃO COM O NEON ---
// Usando a connection string fornecida, ajustada para o driver Node (sem pooler no fim)
const connectionString = 'postgresql://neondb_owner:npg_5CkwD2shOAZt@ep-weathered-water-ahm3p7pr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Necessário para conexão SSL/TLS
  },
});

// --- INICIALIZAÇÃO DO BANCO ---
// Cria as tabelas users e posts se não existirem
const initDB = async () => {
  try {
    const client = await pool.connect();
    
    // Tabela de Usuários
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        avatar_url TEXT
      );
    `);

    // Tabela de Posts
    await client.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        image_url TEXT NOT NULL,
        caption TEXT,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Banco de dados Neon sincronizado e tabelas verificadas.");
    client.release();
  } catch (err) {
    console.error("❌ Erro ao conectar no Neon. Verifique a string de conexão ou a rede:", err);
  }
};

initDB();

// --- ROTAS (API) ---

// 1. GET /posts: Pegar todos os posts (Feed)
app.get('/posts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, p.image_url, p.caption, p.likes, p.created_at,
        u.username, u.avatar_url as "userAvatar", u.id as "userId"
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
    `);
    
    // Formata o timestamp para o frontend
    const posts = result.rows.map(row => ({
      ...row,
      timestamp: new Date(row.created_at).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})
    }));

    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar posts no DB' });
  }
});

// 2. POST /posts: Criar um novo post
app.post('/posts', async (req, res) => {
  const { id, userId, username, userAvatar, imageUrl, caption } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Garante que o usuário existe (ON CONFLICT DO NOTHING evita duplicatas)
    await client.query(`
      INSERT INTO users (id, username, avatar_url)
      VALUES ($1, $2, $3)
      ON CONFLICT (id) DO NOTHING
    `, [userId, username, userAvatar]);

    // 2. Cria o post
    await client.query(`
      INSERT INTO posts (id, user_id, image_url, caption, likes)
      VALUES ($1, $2, $3, $4, 0)
    `, [id, userId, imageUrl, caption]);

    await client.query('COMMIT');
    res.json({ success: true, message: 'Post criado com sucesso.' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar post no DB' });
  } finally {
    client.release();
  }
});

// 3. POST /posts/:id/like: Dar Like
app.post('/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      UPDATE posts SET likes = likes + 1 WHERE id = $1 RETURNING likes
    `, [id]);
    res.json({ success: true, newLikes: result.rows[0].likes });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao dar like no DB' });
  }
});

app.listen(port, () => {
  console.log(`🚀 Servidor API rodando em http://localhost:${port}`);
});
