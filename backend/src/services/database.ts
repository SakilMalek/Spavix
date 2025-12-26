import { Pool, QueryResult } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    console.log('Connecting to database...');

    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false,
      },
      max: 10,
      min: 2,
      idleTimeoutMillis: 60000,
      connectionTimeoutMillis: 30000,
      statement_timeout: 60000,
      application_name: 'spavix-api',
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
      pool = null;
    });

    pool.on('connect', () => {
      console.log('New database connection established');
    });
  }

  return pool;
}

export class Database {
  static async query(text: string, params?: unknown[], retries: number = 3): Promise<QueryResult> {
    try {
      return await getPool().query(text, params);
    } catch (error: any) {
      // Retry on SSL/connection errors
      if (retries > 0 && (error.code === 'ECONNREFUSED' || error.message?.includes('SSL') || error.message?.includes('decryption'))) {
        console.warn(`Query failed, retrying... (${retries} retries left)`, error.message);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        return this.query(text, params, retries - 1);
      }
      throw error;
    }
  }

  static async createUser(email: string, passwordHash: string, name?: string, picture?: string): Promise<{ id: string }> {
    const result = await this.query(
      'INSERT INTO users (email, password_hash, name, picture, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
      [email, passwordHash, name || null, picture || null]
    );
    return result.rows[0];
  }

  static async getUserByEmail(email: string): Promise<{ id: string; email: string; password_hash: string; name?: string; picture?: string } | null> {
    const result = await this.query('SELECT id, email, password_hash, name, picture FROM users WHERE email = $1', [email]);
    return result.rows[0] || null;
  }

  static async getUserById(id: string): Promise<{ id: string; email: string; name?: string; picture?: string } | null> {
    const result = await this.query('SELECT id, email, name, picture FROM users WHERE id = $1', [id]);
    return result.rows[0] || null;
  }

  static async updateUserProfile(id: string, name?: string, picture?: string): Promise<void> {
    await this.query(
      'UPDATE users SET name = COALESCE($2, name), picture = COALESCE($3, picture), updated_at = NOW() WHERE id = $1',
      [id, name || null, picture || null]
    );
  }

  static async saveGeneration(
    userId: string,
    beforeImageUrl: string,
    afterImageUrl: string,
    style: string,
    materials: Record<string, string>,
    roomType: string
  ): Promise<{ id: string }> {
    const result = await this.query(
      `INSERT INTO generations (user_id, before_image_url, after_image_url, style, materials, room_type, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING id`,
      [userId, beforeImageUrl, afterImageUrl, style, JSON.stringify(materials), roomType]
    );
    return result.rows[0];
  }

  static async getGenerations(userId: string, limit = 20, offset = 0): Promise<unknown[]> {
    const result = await this.query(
      'SELECT * FROM generations WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    return result.rows;
  }

  static async getGenerationById(id: string, userId: string): Promise<{
    id: string;
    user_id: string;
    before_image_url: string;
    after_image_url: string;
    style: string;
    materials: any;
    room_type: string;
    created_at: string;
  } | null> {
    const result = await this.query(
      'SELECT * FROM generations WHERE id = $1 AND user_id = $2',
      [id, userId]
    );
    return result.rows[0] || null;
  }

  static async initializeDatabase(): Promise<void> {
    await this.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS generations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        before_image_url TEXT NOT NULL,
        after_image_url TEXT NOT NULL,
        style VARCHAR(100) NOT NULL,
        materials JSONB,
        room_type VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
      CREATE INDEX IF NOT EXISTS idx_generations_created_at ON generations(created_at DESC);

      CREATE TABLE IF NOT EXISTS shopping_lists (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        generation_id UUID NOT NULL REFERENCES generations(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        shopping_list JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_shopping_lists_generation_id ON shopping_lists(generation_id);
      CREATE INDEX IF NOT EXISTS idx_shopping_lists_user_id ON shopping_lists(user_id);
    `);
  }

  static async saveShoppingList(
    generationId: string,
    userId: string,
    shoppingList: string
  ): Promise<{ id: string }> {
    const result = await this.query(
      `INSERT INTO shopping_lists (generation_id, user_id, shopping_list, created_at)
       VALUES ($1, $2, $3::jsonb, NOW())
       RETURNING id`,
      [generationId, userId, JSON.stringify({ content: shoppingList })]
    );
    return result.rows[0];
  }

  static async getShoppingList(generationId: string, userId: string): Promise<string | null> {
    const result = await this.query(
      'SELECT shopping_list FROM shopping_lists WHERE generation_id = $1 AND user_id = $2 LIMIT 1',
      [generationId, userId]
    );
    if (result.rows[0]?.shopping_list) {
      const data = result.rows[0].shopping_list;
      return typeof data === 'string' ? data : data.content || null;
    }
    return null;
  }
}
