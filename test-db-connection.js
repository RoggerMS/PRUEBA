const { Client } = require('pg');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'postgres',
  database: 'crunevo'
});

async function testConnection() {
  try {
    console.log('Attempting to connect to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected successfully!');
    
    const result = await client.query('SELECT current_database(), current_user, version()');
    console.log('Database info:', result.rows[0]);
    
    await client.end();
    console.log('Connection closed.');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
  }
}

testConnection();