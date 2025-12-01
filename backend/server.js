const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const path = require('path'); // Novo: Importa o módulo 'path' para lidar com caminhos de arquivo

const app = express();
// NOVO: Usa a variável de ambiente PORT do Render ou a porta 3001 como fallback
const port = process.env.PORT || 3001; 

// Habilita JSON e chamadas do Frontend
app.use(cors());
app.use(express.json());

// --- CONEXÃO COM O NEON ---
// A string de conexão DEVE vir de uma variável de ambiente (Render/Docker) em produção!
// Usaremos a string fornecida como fallback, mas NUNCA a deixe no código final.
const connectionString = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_5CkwD2shOAZt@ep-weathered-water-ahm3p7pr-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Necessário para conexão SSL/TLS
  },
});

// --- INICIALIZAÇÃO DO BANCO (O mesmo) ---
const initDB = async () => {
  try {
    const client = await pool.connect();
    // Cria as tabelas users e posts se não existirem
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        avatar_url TEXT
      );
    `);
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
    console.log("✅ Banco de dados Neon sincronizado.");
    client.release();
  } catch (err) {
    console.error("❌ Erro ao conectar no Neon:", err.message);
  }
};
initDB();

// --- ROTA DA API ---
// 1. GET /api/posts: Pegar todos os posts (Feed)
// Adicionamos o prefixo /api para diferenciar das rotas do frontend
app.get('/api/posts', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, p.image_url, p.caption, p.likes, p.created_at,
        u.username, u.avatar_url as "userAvatar", u.id as "userId"
      FROM posts p JOIN users u ON p.user_id = u.id ORDER BY p.created_at DESC
    `);
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

// 2. POST /api/posts: Criar um novo post
app.post('/api/posts', async (req, res) => {
  const { id, userId, username, userAvatar, imageUrl, caption } = req.body;
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Garante que o usuário existe
    await client.query(`
      INSERT INTO users (id, username, avatar_url)
      VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING
    `, [userId, username, userAvatar]);

    // Cria o post
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

// 3. POST /api/posts/:id/like: Dar Like
app.post('/api/posts/:id/like', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`
      UPDATE posts SET likes = likes + 1 WHERE id = $1
    `, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao dar like no DB' });
  }
});


// ----------------------------------------------------------------------------------
// NOVO: SERVIÇO DE ARQUIVOS ESTÁTICOS DO REACT (Deve vir DEPOIS de todas as rotas da API)
// ----------------------------------------------------------------------------------

// Serve os arquivos estáticos da pasta 'public' (onde o Docker copiou o build do React)
app.use(express.static(path.join(__dirname, 'public')));

// Qualquer outra requisição que não seja a API, envia o index.html do React
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// ----------------------------------------------------------------------------------

app.listen(port, () => {
  console.log(`🚀 Servidor de Produção rodando na porta: ${port}`);
});
