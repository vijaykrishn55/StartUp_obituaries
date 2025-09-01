const bcrypt = require('bcryptjs');
const axios = require('axios');
const db = require('../database/database');

const testUserSearch = async () => {
  try {
    console.log('=== Testing User Search Functionality ===');
    
    // Initialize database
    console.log('1. Initializing database...');
    await db.init();
    
    // Create demo users
    console.log('2. Creating demo users...');
    const password = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    // Clear existing demo users
    await db.run('DELETE FROM users WHERE username IN (?, ?, ?)', ['alice', 'bob', 'charlie']);
    
    // Insert demo users
    const users = [
      { username: 'alice', email: 'alice@example.com', display_name: 'Alice Johnson', status: 'online' },
      { username: 'bob', email: 'bob@example.com', display_name: 'Bob Smith', status: 'offline' },
      { username: 'charlie', email: 'charlie@example.com', display_name: 'Charlie Brown', status: 'away' }
    ];
    
    for (const user of users) {
      await db.run(\n        'INSERT INTO users (username, email, password_hash, display_name, status) VALUES (?, ?, ?, ?, ?)',\n        [user.username, user.email, hash, user.display_name, user.status]\n      );\n      console.log(`Created user: ${user.username}`);\n    }\n    \n    // Verify users were created\n    const allUsers = await db.all('SELECT id, username, display_name FROM users');\n    console.log('\\n3. Users in database:');\n    console.table(allUsers);\n    \n    // Test login\n    console.log('\\n4. Testing login...');\n    try {\n      const loginResponse = await axios.post('http://localhost:3001/api/auth/login', {\n        username: 'alice',\n        password: 'password123'\n      });\n      \n      const token = loginResponse.data.token;\n      console.log('Login successful! Token:', token.substring(0, 50) + '...');\n      \n      // Test user search\n      console.log('\\n5. Testing user search...');\n      const searchResponse = await axios.get('http://localhost:3001/api/conversations/search-users?query=bob', {\n        headers: {\n          'Authorization': `Bearer ${token}`\n        }\n      });\n      \n      console.log('Search response:', searchResponse.data);\n      \n      if (searchResponse.data.users && searchResponse.data.users.length > 0) {\n        console.log('\\n✅ User search is working correctly!');\n        console.log('Found users:', searchResponse.data.users.map(u => `${u.username} (${u.display_name})`));\n      } else {\n        console.log('\\n❌ User search returned no results');\n      }\n      \n    } catch (loginError) {\n      console.error('Login failed:', loginError.response?.data || loginError.message);\n    }\n    \n  } catch (error) {\n    console.error('Test failed:', error);\n  } finally {\n    process.exit(0);\n  }\n};\n\ntestUserSearch();