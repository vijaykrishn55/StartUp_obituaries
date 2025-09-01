USE startup_obituaries;

-- Drop tables with foreign key dependencies first
DROP TABLE IF EXISTS MessageReactions;
DROP TABLE IF EXISTS MessageReadStatus;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Conversations;

-- Create Conversations table
CREATE TABLE Conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('direct') DEFAULT 'direct', -- Only direct messaging, no groups
    connection_id INT NOT NULL, -- Link to the connection for access control
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NULL,
    FOREIGN KEY (connection_id) REFERENCES Connections(id) ON DELETE CASCADE,
    UNIQUE KEY unique_connection_conversation (connection_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create new Messages table with conversation support
CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    conversation_id INT NOT NULL,
    sender_id INT NOT NULL,
    content TEXT NOT NULL,
    message_type ENUM('text', 'image', 'file') DEFAULT 'text',
    reply_to_id INT NULL, -- For replying to specific messages
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL, -- Soft delete support
    FOREIGN KEY (conversation_id) REFERENCES Conversations(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (reply_to_id) REFERENCES Messages(id) ON DELETE SET NULL,
    INDEX idx_conversation_created (conversation_id, created_at),
    INDEX idx_sender_created (sender_id, created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create MessageReadStatus table for read receipts
CREATE TABLE MessageReadStatus (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES Messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_user_read (message_id, user_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create MessageReactions table for emoji reactions
CREATE TABLE MessageReactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction VARCHAR(50) NOT NULL, -- emoji or reaction type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (message_id) REFERENCES Messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_user_reaction (message_id, user_id, reaction)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Add last_seen column to Users table for online status tracking
ALTER TABLE Users ADD COLUMN last_seen TIMESTAMP NULL;
ALTER TABLE Users ADD COLUMN status ENUM('online', 'offline', 'away') DEFAULT 'offline';