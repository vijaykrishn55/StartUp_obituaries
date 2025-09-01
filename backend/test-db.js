const mysql = require('mysql2/promise');

const testDB = async () => {
  try {
    console.log('Testing database connection...');
    
    const pool = mysql.createPool({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'startup_obituaries',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    
    // Test a simple query
    const [rows] = await connection.execute('SELECT 1 as test');
    console.log('✅ Query test successful:', rows);
    
    connection.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.error('Error code:', error.code);
  }
};

testDB();
