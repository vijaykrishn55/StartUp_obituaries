const { pool } = require('./config/database');

const verifyMessagingTables = async () => {
  try {
    console.log('🔍 Verifying messaging system database setup...\n');
    
    // Check if database exists
    const [databases] = await pool.execute("SHOW DATABASES LIKE 'startup_obituaries'");
    if (databases.length === 0) {
      console.log('❌ Database "startup_obituaries" does not exist');
      return false;
    }
    console.log('✅ Database "startup_obituaries" exists');
    
    // Check required tables
    const requiredTables = ['Users', 'Connections', 'Conversations', 'Messages', 'MessageReadStatus', 'MessageReactions'];
    
    for (const table of requiredTables) {
      try {
        const [tables] = await pool.execute(`SHOW TABLES LIKE '${table}'`);
        if (tables.length === 0) {
          console.log(`❌ Table "${table}" does not exist`);
          return false;
        }
        console.log(`✅ Table "${table}" exists`);
        
        // Show table structure
        const [columns] = await pool.execute(`DESCRIBE ${table}`);
        console.log(`   Columns: ${columns.map(col => col.Field).join(', ')}`);
      } catch (error) {
        console.log(`❌ Error checking table "${table}": ${error.message}`);
        return false;
      }
    }
    
    // Test the specific query that's failing
    console.log('\n🧪 Testing the failing query...');
    try {
      const conversationId = 1;
      const userId = 1;
      
      // First check if conversation exists
      const [conversations] = await pool.execute(
        `SELECT c.id, c.connection_id, conn.sender_user_id, conn.receiver_user_id, conn.status 
         FROM Conversations c
         JOIN Connections conn ON c.connection_id = conn.id
         WHERE c.id = ? AND (conn.sender_user_id = ? OR conn.receiver_user_id = ?) AND conn.status = 'accepted'`,
        [conversationId, userId, userId]
      );
      
      console.log(`   Found ${conversations.length} accessible conversations`);
      
      if (conversations.length > 0) {
        // Test the messages query
        const [messages] = await pool.execute(
          `SELECT m.id, m.content, m.message_type, m.reply_to_id, m.created_at, m.edited_at, 
                  m.sender_id, u.username, u.first_name, u.last_name,
                  (SELECT COUNT(*) FROM MessageReadStatus mrs WHERE mrs.message_id = m.id AND mrs.user_id = ?) as is_read_by_user,
                  rm.content as reply_content, ru.first_name as reply_sender_name
           FROM Messages m
           JOIN Users u ON m.sender_id = u.id
           LEFT JOIN Messages rm ON m.reply_to_id = rm.id
           LEFT JOIN Users ru ON rm.sender_id = ru.id
           WHERE m.conversation_id = ? AND m.deleted_at IS NULL
           ORDER BY m.created_at ASC
           LIMIT 50 OFFSET 0`,
          [userId, conversationId]
        );
        
        console.log(`   Found ${messages.length} messages`);
        console.log('✅ Messages query executed successfully');
      } else {
        console.log('   No accessible conversations found for testing');
      }
      
    } catch (queryError) {
      console.log(`❌ Query test failed: ${queryError.message}`);
      console.log(`   SQL State: ${queryError.sqlState}`);
      console.log(`   Error Code: ${queryError.code}`);
      return false;
    }
    
    console.log('\n✅ All messaging system checks passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return false;
  }
};

const setupTestData = async () => {
  try {
    console.log('\n🔧 Setting up test data...');
    
    // Create test users if they don't exist
    await pool.execute(`
      INSERT IGNORE INTO Users (id, username, email, password_hash, first_name, last_name) 
      VALUES (1, 'testuser1', 'test1@example.com', 'hash1', 'Test', 'User1'),
             (2, 'testuser2', 'test2@example.com', 'hash2', 'Test', 'User2')
    `);
    
    // Create test connection
    await pool.execute(`
      INSERT IGNORE INTO Connections (id, sender_user_id, receiver_user_id, status) 
      VALUES (1, 1, 2, 'accepted')
    `);
    
    // Create test conversation
    await pool.execute(`
      INSERT IGNORE INTO Conversations (id, connection_id) 
      VALUES (1, 1)
    `);
    
    // Create test message
    await pool.execute(`
      INSERT IGNORE INTO Messages (id, conversation_id, sender_id, content) 
      VALUES (1, 1, 1, 'Test message')
    `);
    
    console.log('✅ Test data created successfully');
    
  } catch (error) {
    console.error('❌ Failed to setup test data:', error.message);
  }
};

const main = async () => {
  try {
    const isValid = await verifyMessagingTables();
    
    if (!isValid) {
      console.log('\n🚨 Database setup issues detected. Please run the complete schema setup.');
      console.log('   Run: mysql -u root -p startup_obituaries < complete_schema_latest.sql');
      process.exit(1);
    }
    
    await setupTestData();
    
    console.log('\n🎉 Database verification completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Verification script failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

main();
