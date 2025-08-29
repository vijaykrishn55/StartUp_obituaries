-- Create Messages table for real-time messaging
USE startup_obituaries;

CREATE TABLE IF NOT EXISTS Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    connection_id INT NOT NULL,
    sender_user_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (connection_id) REFERENCES Connections(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    INDEX idx_connection_created (connection_id, created_at),
    INDEX idx_sender_user (sender_user_id),
    INDEX idx_unread (is_read, connection_id)
);
