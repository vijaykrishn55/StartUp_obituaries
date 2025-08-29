-- Create the database with emoji-safe collation
CREATE DATABASE IF NOT EXISTS startup_obituaries
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE startup_obituaries;

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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
    FOREIGN KEY (created_by_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- TeamMembers
CREATE TABLE TeamMembers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    startup_id INT NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    tenure_start_year INT,
    tenure_end_year INT,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (startup_id) REFERENCES Startups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_membership (user_id, startup_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Comments
CREATE TABLE Comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    content TEXT NOT NULL,
    user_id INT NOT NULL,
    startup_id INT NOT NULL,
    parent_comment_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (startup_id) REFERENCES Startups(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES Comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE Reactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('upvote', 'downvote', 'pivot') NOT NULL,
    user_id INT NOT NULL,
    startup_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (startup_id) REFERENCES Startups(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_startup (user_id, startup_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Connections
CREATE TABLE Connections (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_user_id INT NOT NULL,
    receiver_user_id INT NOT NULL,
    message TEXT,
    status ENUM('pending', 'accepted', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (sender_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Messages
CREATE TABLE Messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    connection_id INT NOT NULL,
    sender_user_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (connection_id) REFERENCES Connections(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_user_id) REFERENCES Users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- TeamJoinRequests
CREATE TABLE TeamJoinRequests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    startup_id INT NOT NULL,
    role_title VARCHAR(255) NOT NULL,
    tenure_start_year INT,
    tenure_end_year INT,
    message TEXT, -- The user can explain their role/tenure
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (startup_id) REFERENCES Startups(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
