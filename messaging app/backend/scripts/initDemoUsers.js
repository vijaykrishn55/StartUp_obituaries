const bcrypt = require('bcryptjs');
const db = require('../database/database');

const initDemoUsers = async () => {
  try {
    console.log('Initializing demo users...');
    
    // Initialize database first
    await db.init();
    
    // Hash password for demo users
    const password = 'password123';
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Demo users data
    const demoUsers = [
      {
        id: 1,
        username: 'alice',
        email: 'alice@example.com',
        display_name: 'Alice Johnson',
        status: 'online'
      },
      {
        id: 2,
        username: 'bob',
        email: 'bob@example.com',
        display_name: 'Bob Smith',
        status: 'offline'
      },
      {
        id: 3,
        username: 'charlie',
        email: 'charlie@example.com',
        display_name: 'Charlie Brown',
        status: 'away'
      }
    ];
    
    // Insert or update demo users
    for (const user of demoUsers) {
      try {
        // Check if user exists
        const existingUser = await db.get('SELECT id FROM users WHERE username = ?', [user.username]);
        
        if (existingUser) {
          // Update existing user with new password hash
          await db.run(`
            UPDATE users 
            SET password_hash = ?, email = ?, display_name = ?, status = ?
            WHERE username = ?
          `, [passwordHash, user.email, user.display_name, user.status, user.username]);
          console.log(`Updated user: ${user.username}`);
        } else {
          // Insert new user
          await db.run(`
            INSERT INTO users (username, email, password_hash, display_name, status)
            VALUES (?, ?, ?, ?, ?)
          `, [user.username, user.email, passwordHash, user.display_name, user.status]);
          console.log(`Created user: ${user.username}`);
        }
      } catch (error) {
        console.error(`Error processing user ${user.username}:`, error);
      }
    }
    
    // Verify users were created
    const users = await db.all('SELECT id, username, display_name, status FROM users');
    console.log('Demo users in database:');
    console.table(users);
    
    console.log('Demo users initialization completed!');
    console.log('You can now login with:');
    console.log('- alice / password123');
    console.log('- bob / password123');
    console.log('- charlie / password123');
    
  } catch (error) {
    console.error('Error initializing demo users:', error);
  } finally {
    process.exit(0);
  }
};

initDemoUsers();