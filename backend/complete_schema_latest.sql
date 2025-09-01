-- Complete Database Setup Script for Startup Obituaries Platform
-- Version: Latest (includes all migrations as of 2025)
-- Run this script to create the database and all tables from scratch

-- Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Create database with emoji-safe collation
CREATE DATABASE IF NOT EXISTS startup_obituaries
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Select the database
USE startup_obituaries;

-- Drop existing tables in correct order (if they exist)
-- Drop messaging system tables first (due to dependencies)
DROP TABLE IF EXISTS MessageReactions;
DROP TABLE IF EXISTS MessageReadStatus;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS Conversations;
-- Drop other tables
DROP TABLE IF EXISTS Reports;
DROP TABLE IF EXISTS PasswordResetTokens;
DROP TABLE IF EXISTS TeamJoinRequests;
DROP TABLE IF EXISTS TeamMembers;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Reactions;
DROP TABLE IF EXISTS Connections;
DROP TABLE IF EXISTS Startups;
DROP TABLE IF EXISTS Users;

-- ====================================================================
-- CORE TABLES
-- ====================================================================

-- Users table
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    bio TEXT,
    skills JSON,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    user_role ENUM('student', 'founder', 'investor', 'recruiter') DEFAULT 'student',
    is_recruiter BOOLEAN DEFAULT FALSE,
    open_to_work BOOLEAN DEFAULT FALSE,
    open_to_co_founding BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMP NULL,
    status ENUM('online', 'offline', 'away') DEFAULT 'offline',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_user_role (user_role),
    INDEX idx_is_recruiter (is_recruiter),
    INDEX idx_open_to_work (open_to_work),
    INDEX idx_status (status)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Startups table
CREATE TABLE Startups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    industry VARCHAR(100),
    vision TEXT,
    autopsy_report TEXT,
    primary_failure_reason ENUM(
        'Ran out of funding',
        'No Product-Market Fit',
        'Poor Unit Economics',
        'Co-founder Conflict',
        'Technical Debt',
        'Got outcompeted',
        'Bad Timing',
        'Legal/Regulatory Issues',
        'Pivot Fatigue',
        'Other'
    ) NOT NULL,
    lessons_learned TEXT,
    founded_year INT,
    died_year INT,
    stage_at_death ENUM('Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B+'),
    funding_amount_usd DECIMAL(15, 2),
    key_investors JSON,
    peak_metrics JSON,
    links JSON,
    logo_url VARCHAR(500),
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_by_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_created_by (created_by_user_id),
    INDEX idx_industry (industry),
    INDEX idx_failure_reason (primary_failure_reason),
    INDEX idx_stage (stage_at_death),
    INDEX idx_funding (funding_amount_usd),
    INDEX idx_created_at (created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ====================================================================
-- TEAM & COLLABORATION TABLES
-- ====================================================================

-- TeamMembers table
CREATE TABLE TeamMembers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    startup_id INT NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    tenure_start_year INT,
    tenure_end_year INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (startup_id) REFERENCES Startups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (user_id, startup_id),
    INDEX idx_user_startup (user_id, startup_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Team Join Requests table
CREATE TABLE TeamJoinRequests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    startup_id INT NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    tenure_start_year INT,
    tenure_end_year INT,
    message TEXT,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (startup_id) REFERENCES Startups(id) ON DELETE CASCADE,
    INDEX idx_startup_status (startup_id, status),
    INDEX idx_user_requests (user_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ====================================================================
-- SOCIAL INTERACTION TABLES
-- ====================================================================

-- Comments table
CREATE TABLE Comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    startup_id INT NOT NULL,
    parent_comment_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (startup_id) REFERENCES Startups(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES Comments(id) ON DELETE CASCADE,
    INDEX idx_startup_comments (startup_id, created_at),
    INDEX idx_user_comments (user_id),
    INDEX idx_parent_comment (parent_comment_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Reactions table (includes pivot reaction)
CREATE TABLE Reactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('upvote', 'downvote', 'pivot') NOT NULL,
    user_id INT NOT NULL,
    startup_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (startup_id) REFERENCES Startups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_startup (user_id, startup_id),
    INDEX idx_startup_reactions (startup_id, type),
    INDEX idx_user_reactions (user_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ====================================================================
-- NETWORKING & MESSAGING SYSTEM
-- ====================================================================

-- Connections table
CREATE TABLE Connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_user_id INT NOT NULL,
    receiver_user_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (sender_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_sender_receiver (sender_user_id, receiver_user_id),
    INDEX idx_receiver_status (receiver_user_id, status),
    INDEX idx_created_at (created_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Conversations table (latest messaging system)
CREATE TABLE Conversations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('direct') DEFAULT 'direct', -- Only direct messaging, no groups
    connection_id INT NOT NULL, -- Link to the connection for access control
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP NULL,
    
    FOREIGN KEY (connection_id) REFERENCES Connections(id) ON DELETE CASCADE,
    UNIQUE KEY unique_connection_conversation (connection_id),
    INDEX idx_last_message (last_message_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Messages table (latest version with conversation support)
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
    INDEX idx_sender_created (sender_id, created_at),
    INDEX idx_reply_to (reply_to_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- MessageReadStatus table for read receipts
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

-- MessageReactions table for emoji reactions
CREATE TABLE MessageReactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    message_id INT NOT NULL,
    user_id INT NOT NULL,
    reaction VARCHAR(50) NOT NULL, -- emoji or reaction type
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (message_id) REFERENCES Messages(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_message_user_reaction (message_id, user_id, reaction),
    INDEX idx_message_reactions (message_id, reaction)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ====================================================================
-- AUTHENTICATION & SECURITY TABLES
-- ====================================================================

-- Password Reset Tokens table
CREATE TABLE PasswordResetTokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ====================================================================
-- MODERATION & REPORTING TABLES
-- ====================================================================

-- Reports table for content moderation
CREATE TABLE Reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reporter_user_id INT NOT NULL,
    reported_startup_id INT,
    reported_comment_id INT,
    reported_user_id INT,
    report_type ENUM('spam', 'inappropriate', 'fake', 'harassment', 'copyright', 'other') NOT NULL,
    reason TEXT,
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
    reviewed_by_user_id INT,
    reviewed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (reporter_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_startup_id) REFERENCES Startups(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_comment_id) REFERENCES Comments(id) ON DELETE CASCADE,
    FOREIGN KEY (reported_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by_user_id) REFERENCES Users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_reporter (reporter_user_id),
    INDEX idx_report_type (report_type),
    
    CONSTRAINT chk_report_target CHECK (
        (reported_startup_id IS NOT NULL AND reported_comment_id IS NULL AND reported_user_id IS NULL) OR
        (reported_startup_id IS NULL AND reported_comment_id IS NOT NULL AND reported_user_id IS NULL) OR
        (reported_startup_id IS NULL AND reported_comment_id IS NULL AND reported_user_id IS NOT NULL)
    )
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ====================================================================
-- CONFIGURATION
-- ====================================================================

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Success message
SELECT 'Complete database setup completed successfully!' as Status,
       'All tables created with latest schema including all migrations' as Details,
       '2025-01-01' as Version;

-- Display table summary
SELECT 
    COUNT(*) as 'Total Tables Created',
    'Users, Startups, TeamMembers, TeamJoinRequests, Comments, Reactions, Connections, Conversations, Messages, MessageReadStatus, MessageReactions, PasswordResetTokens, Reports' as 'Table Names'
FROM information_schema.tables 
WHERE table_schema = 'startup_obituaries';