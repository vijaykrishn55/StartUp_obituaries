-- Create Reports table for content moderation
USE startup_obituaries;

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
  CONSTRAINT chk_report_target CHECK (
    (reported_startup_id IS NOT NULL AND reported_comment_id IS NULL AND reported_user_id IS NULL) OR
    (reported_startup_id IS NULL AND reported_comment_id IS NOT NULL AND reported_user_id IS NULL) OR
    (reported_startup_id IS NULL AND reported_comment_id IS NULL AND reported_user_id IS NOT NULL)
  )
);
