-- Redesign Conversations Schema to Use User IDs Directly
-- This migration simplifies the conversation system by removing dependency on connection IDs

USE startup_obituaries;

-- Drop existing tables in correct order (due to foreign key constraints)
DROP TABLE IF EXISTS MessageReactions;
DROP TABLE IF EXISTS MessageReadStatus;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Conversations;

-- Create new simplified Conversations table
CREATE TABLE Conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user1_id INT NOT NULL,
    user2_id INT NOT NULL,
    type ENUM('direct') DEFAULT 'direct',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NULL,
    
    FOREIGN KEY (user1_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (user2_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    -- Ensure user1_id is always smaller than user2_id for consistency
    CONSTRAINT chk_user_order CHECK (user1_id < user2_id),
    
    -- Unique constraint to prevent duplicate conversations
    UNIQUE KEY unique_user_pair (user1_id, user2_id),
    
    INDEX idx_user1 (user1_id),
    INDEX idx_user2 (user2_id),
    INDEX idx_last_message (last_message_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Recreate Messages table (unchanged structure)
CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    reply_to_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    
    FOREIGN KEY (conversation_id) REFERENCES Conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES Messages(id) ON DELETE SET NULL,
    
    INDEX idx_conversation_created (conversation_id, created_at),
    INDEX idx_sender_created (sender_id, created_at),
    INDEX idx_reply_to (reply_to_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Recreate MessageReadStatus table (unchanged structure)
CREATE TABLE MessageReadStatus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES Messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_message_user_read (message_id, user_id),
    INDEX idx_user_read (user_id, read_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Recreate MessageReactions table (unchanged structure)
CREATE TABLE MessageReactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES Messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    UNIQUE KEY unique_message_user_reaction (message_id, user_id, reaction),
    INDEX idx_message_reactions (message_id, reaction)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Success message
SELECT 'Conversations schema redesigned successfully!' as Status,
       'Conversations now use user IDs directly instead of connection IDs' as Details;
