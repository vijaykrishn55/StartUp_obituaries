-- Complete Database Setup Script for Startup Obituaries Platform
-- Run this script to create the database and all tables from scratch

-- Temporarily disable safe update mode
SET SQL_SAFE_UPDATES = 0;

-- Create database
CREATE DATABASE IF NOT EXISTS startup_obituaries
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Select the database
USE startup_obituaries;

-- Drop existing tables in correct order (if they exist)
DROP TABLE IF EXISTS Reports;
DROP TABLE IF EXISTS Messages;
DROP TABLE IF EXISTS PasswordResetTokens;
DROP TABLE IF EXISTS TeamJoinRequests;
DROP TABLE IF EXISTS TeamMembers;
DROP TABLE IF EXISTS Comments;
DROP TABLE IF EXISTS Reactions;
DROP TABLE IF EXISTS Connections;
DROP TABLE IF EXISTS Startups;
DROP TABLE IF EXISTS Users;

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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_user_role (user_role),
    INDEX idx_is_recruiter (is_recruiter),
    INDEX idx_open_to_work (open_to_work)
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

-- Reactions table
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

-- Messages table
CREATE TABLE Messages (
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
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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

-- Reports table
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

-- Re-enable safe update mode
SET SQL_SAFE_UPDATES = 1;

-- Success message
SELECT 'Database setup completed successfully!' as Status;