const bcrypt = require('bcryptjs');
const db = require('./database/database');

async function setupDatabase() {
  try {
    console.log('Setting up database...');
    
    // Initialize database
    await db.init();
    
    // Hash demo passwords
    const password = 'password123'; // Demo password for all users
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('Creating demo users...');
    
    // Update or insert demo users with proper password hashes
    await db.run(
      'INSERT OR REPLACE INTO users (id, username, email, password_hash, display_name, status) VALUES (?, ?, ?, ?, ?, ?)',
      [1, 'alice', 'alice@example.com', passwordHash, 'Alice Johnson', 'offline']
    );
    
    await db.run(
      'INSERT OR REPLACE INTO users (id, username, email, password_hash, display_name, status) VALUES (?, ?, ?, ?, ?, ?)',
      [2, 'bob', 'bob@example.com', passwordHash, 'Bob Smith', 'offline']
    );
    
    await db.run(
      'INSERT OR REPLACE INTO users (id, username, email, password_hash, display_name, status) VALUES (?, ?, ?, ?, ?, ?)',
      [3, 'charlie', 'charlie@example.com', passwordHash, 'Charlie Brown', 'offline']
    );
    
    console.log('Demo users created successfully!');
    console.log('You can login with:');
    console.log('- Username: alice, Password: password123');
    console.log('- Username: bob, Password: password123');
    console.log('- Username: charlie, Password: password123');
    
    process.exit(0);
  } catch (error) {
    console.error('Database setup error:', error);
    process.exit(1);
  }
}

setupDatabase();