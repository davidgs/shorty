const { Pool } = require('pg');

const pool = new Pool({
  user: 'shorty',
  host: 'localhost',
  database: 'shorty',
  password: 'Shorty78.Mime!',
  port: 5432,
});

async function createTables() {
  try {
    // drop tables
    await pool.query(`DROP TABLE IF EXISTS short_links_stats`);
    await pool.query(`DROP TABLE IF EXISTS short_links`);
    // Create short_links table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS short_links (
        short_link VARCHAR(10) PRIMARY KEY,
        original_url VARCHAR(255) NOT NULL,
        short_domain VARCHAR(10)
      )
    `);

    // Create short_links_stats table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS short_links_stats (
        id SERIAL PRIMARY KEY,
        short_link VARCHAR(10) REFERENCES short_links(short_link),
        access_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        host_address VARCHAR(255)
      )
    `);

    console.log('Tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    pool.end(); // Close the database connection
  }
}

createTables();
