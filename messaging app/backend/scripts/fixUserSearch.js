const bcrypt = require('bcryptjs');
const db = require('../database/database');
const fs = require('fs');
const path = require('path');

const fixUserSearchIssue = async () => {
  try {
    console.log('🔧 Fixing User Search Issue...');
    console.log('==========================================');
    
    // Step 1: Initialize database
    console.log('1. Initializing database...');
    await db.init();
    
    // Step 2: Clear and recreate demo users with proper passwords
    console.log('2. Creating demo users with proper password hashes...');
    
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Password hash generated:', hash.substring(0, 30) + '...');
    
    // Clear existing users
    await db.run('DELETE FROM users');
    console.log('Cleared existing users');
    
    // Insert demo users
    const demoUsers = [
      { id: 1, username: 'alice', email: 'alice@example.com', display_name: 'Alice Johnson', status: 'online' },
      { id: 2, username: 'bob', email: 'bob@example.com', display_name: 'Bob Smith', status: 'offline' },
      { id: 3, username: 'charlie', email: 'charlie@example.com', display_name: 'Charlie Brown', status: 'away' }
    ];
    
    for (const user of demoUsers) {
      await db.run(`
        INSERT INTO users (id, username, email, password_hash, display_name, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [user.id, user.username, user.email, hash, user.display_name, user.status]);
      console.log(`✅ Created user: ${user.username} (${user.display_name})`);
    }
    
    // Step 3: Verify users exist
    console.log('\\n3. Verifying users in database...');
    const allUsers = await db.all('SELECT id, username, display_name, email FROM users');
    console.table(allUsers);
    
    // Step 4: Test direct database search
    console.log('4. Testing direct database search...');
    const searchResults = await db.all(`
      SELECT id, username, display_name, avatar_url, status
      FROM users 
      WHERE (username LIKE ? OR display_name LIKE ?) AND id != ?
      LIMIT 20
    `, ['%bob%', '%bob%', 1]);
    
    console.log('Direct DB search results for \"bob\":', searchResults);
    
    console.log('\\n🎉 User search fix completed!');
    console.log('==========================================');
    console.log('Demo users available:');
    console.log('- alice / password123 (Alice Johnson)');
    console.log('- bob / password123 (Bob Smith)');
    console.log('- charlie / password123 (Charlie Brown)');
    console.log('\\nPlease restart the backend server and test again.');
    
  } catch (error) {
    console.error('❌ Error fixing user search:', error);
  } finally {
    process.exit(0);
  }
};

fixUserSearchIssue();