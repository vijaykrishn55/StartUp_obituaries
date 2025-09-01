-- Messaging App Database Schema
-- This schema supports a complete messaging system with users, conversations, and messages

-- Users table - stores user information and authentication data
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url VARCHAR(255),
    status VARCHAR(20) DEFAULT 'offline', -- online, offline, away
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Conversations table - represents chat conversations (1-on-1 or group)
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(20) DEFAULT 'direct', -- direct, group
    title VARCHAR(100), -- for group conversations
    description TEXT,
    created_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_message_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Conversation participants - manages who is in each conversation
CREATE TABLE IF NOT EXISTS conversation_participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    role VARCHAR(20) DEFAULT 'member', -- admin, member
    joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    left_at DATETIME NULL,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(conversation_id, user_id)
);

-- Messages table - stores all messages
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sender_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text', -- text, image, file, system
    reply_to_id INTEGER NULL, -- for threaded conversations
    edited_at DATETIME NULL,
    deleted_at DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES messages(id) ON DELETE SET NULL
);

-- Message read status - tracks which messages have been read by which users
CREATE TABLE IF NOT EXISTS message_read_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(message_id, user_id)
);

-- Message reactions - for emoji reactions to messages
CREATE TABLE IF NOT EXISTS message_reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    message_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    reaction VARCHAR(10) NOT NULL, -- emoji or reaction type
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(message_id, user_id, reaction)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation ON conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_read_status_user ON message_read_status(user_id);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create triggers to update timestamps
CREATE TRIGGER IF NOT EXISTS update_users_updated_at 
    AFTER UPDATE ON users
    BEGIN
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_conversations_updated_at 
    AFTER UPDATE ON conversations
    BEGIN
        UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Update conversation's last_message_at when a new message is added
CREATE TRIGGER IF NOT EXISTS update_conversation_last_message 
    AFTER INSERT ON messages
    BEGIN
        UPDATE conversations 
        SET last_message_at = NEW.created_at 
        WHERE id = NEW.conversation_id;
    END;

-- Insert some sample data for testing
-- Note: password123 hashed with bcrypt salt rounds 10
INSERT OR REPLACE INTO users (id, username, email, password_hash, display_name, status) VALUES 
(1, 'alice', 'alice@example.com', '$2b$10$K6JL5fKGxF7JZ8bZcF7ZO.rLUWq7/8tTqKGKZ1qGXHq4L5ZL3.JL2', 'Alice Johnson', 'online'),
(2, 'bob', 'bob@example.com', '$2b$10$K6JL5fKGxF7JZ8bZcF7ZO.rLUWq7/8tTqKGKZ1qGXHq4L5ZL3.JL2', 'Bob Smith', 'offline'),
(3, 'charlie', 'charlie@example.com', '$2b$10$K6JL5fKGxF7JZ8bZcF7ZO.rLUWq7/8tTqKGKZ1qGXHq4L5ZL3.JL2', 'Charlie Brown', 'away');

-- Create a sample conversation
INSERT OR IGNORE INTO conversations (id, type, title, created_by) VALUES 
(1, 'direct', NULL, 1),
(2, 'group', 'Project Team', 1);

-- Add participants to conversations
INSERT OR IGNORE INTO conversation_participants (conversation_id, user_id, role) VALUES 
(1, 1, 'member'),
(1, 2, 'member'),
(2, 1, 'admin'),
(2, 2, 'member'),
(2, 3, 'member');

-- Add some sample messages
INSERT OR IGNORE INTO messages (id, conversation_id, sender_id, content, message_type) VALUES 
(1, 1, 1, 'Hey Bob! How are you?', 'text'),
(2, 1, 2, 'Hi Alice! I''m doing great, thanks for asking!', 'text'),
(3, 2, 1, 'Welcome to the project team chat!', 'text'),
(4, 2, 3, 'Thanks! Excited to be working with you all.', 'text');