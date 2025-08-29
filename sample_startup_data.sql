-- Sample data for Startup Obituaries platform
-- This data will populate the leaderboards with realistic startup failures

USE startup_obituaries;

-- Insert sample users (skip if they already exist)
INSERT IGNORE INTO Users (id, username, email, password_hash, first_name, last_name, bio) VALUES
(1, 'techfounder', 'john@example.com', '$2b$10$hashedpassword1', 'John', 'Doe', 'Serial entrepreneur with 3 failed startups'),
(2, 'sarahtechie', 'sarah@example.com', '$2b$10$hashedpassword2', 'Sarah', 'Chen', 'Former Google engineer turned founder'),
(3, 'mikevc', 'mike@example.com', '$2b$10$hashedpassword3', 'Mike', 'Johnson', 'Ex-McKinsey consultant'),
(4, 'alexfounder', 'alex@example.com', '$2b$10$hashedpassword4', 'Alex', 'Rivera', 'Stanford CS dropout, 2x founder'),
(5, 'jennytech', 'jenny@example.com', '$2b$10$hashedpassword5', 'Jenny', 'Kim', 'Former Facebook PM');

-- Insert sample startups (skip if they already exist)
INSERT IGNORE INTO Startups (id, name, description, industry, vision, autopsy_report, primary_failure_reason, lessons_learned, founded_year, died_year, stage_at_death, funding_amount_usd, key_investors, peak_metrics, links, is_anonymous, created_by_user_id) VALUES
(1, 'Theranos 2.0', 'Revolutionary blood testing with just a drop of blood', 'Healthcare', 'Democratize healthcare through accessible blood testing', 'Overpromised on technology capabilities. The science wasn''t there yet, but we kept pushing forward with fake demos. Investors believed the hype without proper due diligence.', 'Technical Debt', 'Never fake it till you make it with people''s health. Transparency with investors is crucial. Technical feasibility should be proven before making grand claims.', 2020, 2023, 'Series A', 15000000.00, '["Andreessen Horowitz", "Sequoia Capital", "Founders Fund"]', '{"users": 50000, "revenue": 500000, "tests_processed": 25000}', '{"website": "https://theranos2.com", "crunchbase": "https://crunchbase.com/theranos2"}', false, 1),

(2, 'CryptoKitties Clone', 'NFT pets that you can breed and trade on blockchain', 'Gaming', 'Create the next generation of digital collectibles', 'Launched right as the NFT bubble burst. Gas fees made our game unplayable - users were paying $50+ just to breed a virtual cat. Market sentiment shifted overnight.', 'Bad Timing', 'Market timing is everything. Don''t chase trends without understanding fundamentals. Build sustainable economics, not hype-driven models.', 2021, 2022, 'Seed', 2500000.00, '["Coinbase Ventures", "Pantera Capital", "Animoca Brands"]', '{"users": 25000, "transactions": 100000, "nfts_created": 75000}', '{"website": "https://cryptopets.io", "opensea": "https://opensea.io/cryptopets"}', false, 2),

(3, 'Juicero 2.0', 'AI-powered juice machine with subscription packets', 'Consumer Electronics', 'Revolutionize home juicing with precision technology', 'Built a $400 machine that did what hands could do for free. Overengineered solution to a non-problem. The Bloomberg video showing manual packet squeezing killed us overnight.', 'No Product-Market Fit', 'Sometimes the simplest solution is the best. Don''t over-engineer. Validate the problem before building the solution. Price sensitivity matters in consumer products.', 2019, 2021, 'Series A', 8000000.00, '["Kleiner Perkins", "GV", "Campbell Soup Company"]', '{"units_sold": 5000, "subscribers": 2000, "packets_shipped": 50000}', '{"website": "https://juicero2.com", "youtube": "https://youtube.com/juicero2"}', false, 3),

(4, 'WeWork for Dogs', 'Co-working spaces but for dogs and their owners', 'Real Estate', 'Create community spaces where remote workers can bring their pets', 'Turns out dogs don''t work well in open office environments. Constant barking, accidents, territorial fights. Insurance costs skyrocketed after multiple bite incidents.', 'No Product-Market Fit', 'Just because two good ideas exist doesn''t mean combining them works. Test assumptions early and cheaply. Regulatory compliance is harder than you think.', 2020, 2022, 'Pre-seed', 500000.00, '["Local Angel Investors", "Petco Ventures"]', '{"locations": 3, "members": 150, "dogs": 200}', '{"website": "https://weworkfordogs.com", "instagram": "@weworkfordogs"}', false, 1),

(5, 'Quibi', 'Short-form premium content for mobile viewing', 'Entertainment', 'Create Hollywood-quality content optimized for mobile consumption', 'Launched during COVID when everyone was at home with big screens. Couldn''t pivot fast enough. Content was expensive but viewing habits didn''t match our thesis.', 'Bad Timing', 'Even with $1.75B, you can''t force a market that doesn''t exist yet. Timing and market readiness trump execution. Pivot quickly when assumptions prove wrong.', 2018, 2020, 'Series B+', 1750000000.00, '["Disney", "NBCUniversal", "Sony Pictures", "Alibaba", "Goldman Sachs"]', '{"downloads": 10000000, "subscribers": 500000, "content_hours": 8500}', '{"wikipedia": "https://en.wikipedia.org/wiki/Quibi", "variety": "https://variety.com/quibi"}', false, 4),

(6, 'Segway', 'Revolutionary personal transportation device', 'Transportation', 'Replace walking with effortless personal mobility', 'Overhyped as world-changing but was just an expensive toy. Safety concerns, impracticality for daily use, and regulatory issues killed mass adoption. Great engineering, wrong market.', 'No Product-Market Fit', 'Revolutionary technology doesn''t guarantee market success. Practical adoption matters more than innovation. Price point and use cases must align with reality.', 1999, 2020, 'Series B+', 100000000.00, '["Kleiner Perkins", "Credit Suisse First Boston", "John Doerr"]', '{"units_sold": 140000, "revenue": 500000000, "patents": 400}', '{"wikipedia": "https://en.wikipedia.org/wiki/Segway", "wired": "https://wired.com/segway-story"}', false, 5),

(7, 'Color Labs', 'Social photo sharing app with automatic friend detection', 'Social Media', 'Automatically connect people through shared photo experiences', 'Raised $41M before launching. App was confusing, battery-draining, and solved no real problem. Users couldn''t understand why they needed another photo app.', 'No Product-Market Fit', 'Don''t raise massive rounds before proving product-market fit. Hype doesn''t equal success. User experience trumps clever algorithms. Solve real problems.', 2011, 2012, 'Series A', 41000000.00, '["Sequoia Capital", "Bain Capital Ventures", "Silicon Valley Bank"]', '{"downloads": 100000, "daily_active_users": 5000, "photos_shared": 500000}', '{"techcrunch": "https://techcrunch.com/color-labs", "mashable": "https://mashable.com/color-app"}', false, 2),

(8, 'Pets.com', 'Online pet supplies with fast delivery', 'E-commerce', 'Become the Amazon for pet supplies', 'Spent more on marketing than revenue. Dot-com bubble burst and unit economics never worked. The sock puppet mascot was more famous than our actual service.', 'Poor Unit Economics', 'Marketing spend means nothing if your unit economics don''t work. Growth at all costs is unsustainable. Focus on fundamentals before scaling. Timing matters.', 1998, 2000, 'Series B+', 300000000.00, '["Amazon", "Hummer Winblad Venture Partners", "Bowman Capital"]', '{"revenue": 60000000, "customers": 570000, "orders": 2000000}', '{"wikipedia": "https://en.wikipedia.org/wiki/Pets.com", "cnn": "https://cnn.com/pets-dot-com"}', false, 3),

(9, 'Vine', 'Six-second looping video platform', 'Social Media', 'Democratize video creation with constraints that spark creativity', 'Twitter acquired us but never figured out monetization. TikTok ate our lunch with better creator tools and algorithm. We were too early and too constrained.', 'Got outcompeted', 'Being first doesn''t guarantee winning. Monetization strategy is crucial. Listen to creator feedback. International expansion and localization matter for social platforms.', 2012, 2017, 'Series B+', 30000000.00, '["Twitter", "Andreessen Horowitz", "Lowercase Capital"]', '{"users": 200000000, "videos": 1000000000, "loops": 1500000000000}', '{"wikipedia": "https://en.wikipedia.org/wiki/Vine_(service)", "verge": "https://theverge.com/vine"}', false, 4),

(10, 'Google+', 'Social network to compete with Facebook', 'Social Media', 'Create a more organized, privacy-focused social network', 'Forced integration with other Google products annoyed users. Couldn''t overcome Facebook''s network effects. Privacy breach was the final nail in the coffin.', 'Got outcompeted', 'Network effects are incredibly powerful. Forced adoption doesn''t work. Privacy and security are table stakes, not differentiators. Timing and execution matter more than resources.', 2011, 2019, 'Series B+', 585000000.00, '["Google Internal Funding"]', '{"users": 540000000, "posts": 1500000000, "circles": 4600000000}', '{"wikipedia": "https://en.wikipedia.org/wiki/Google%2B", "techcrunch": "https://techcrunch.com/google-plus"}', false, 5);

-- Insert reactions for leaderboard data (skip duplicates)
INSERT IGNORE INTO Reactions (user_id, startup_id, type) VALUES
-- Most Downvoted: Theranos 2.0, CryptoKitties Clone, WeWork for Dogs
(1, 1, 'downvote'), (2, 1, 'downvote'), (3, 1, 'downvote'), (4, 1, 'downvote'), (5, 1, 'downvote'),
(1, 2, 'downvote'), (3, 2, 'downvote'), (4, 2, 'downvote'), (5, 2, 'downvote'),
(2, 4, 'downvote'), (3, 4, 'downvote'), (5, 4, 'downvote'),

-- Most Upvoted: Quibi, Vine, Segway (brilliant failures with lessons)
(1, 5, 'upvote'), (2, 5, 'upvote'), (3, 5, 'upvote'), (4, 5, 'upvote'), (5, 5, 'upvote'),
(1, 9, 'upvote'), (2, 9, 'upvote'), (3, 9, 'upvote'), (4, 9, 'upvote'),
(1, 6, 'upvote'), (2, 6, 'upvote'), (3, 6, 'upvote'),

-- Mixed reactions for other startups
(1, 3, 'upvote'), (4, 3, 'upvote'),
(2, 7, 'downvote'), (5, 7, 'downvote'),
(3, 8, 'upvote'), (4, 8, 'downvote'),
(2, 10, 'downvote'), (4, 10, 'upvote');

-- Insert some sample comments (skip duplicates)
INSERT IGNORE INTO Comments (content, user_id, startup_id) VALUES
('This is exactly why healthcare startups need proper clinical validation before making claims.', 2, 1),
('The NFT bubble was so obvious in hindsight. Glad I didn''t invest.', 3, 2),
('I actually bought a Juicero. Still have it as a $400 paperweight.', 1, 3),
('Dogs and coworking... what were they thinking? 😂', 4, 4),
('Quibi had amazing content but wrong platform. Should have been Netflix.', 5, 5),
('Segway tours are still popular though. Found a niche eventually.', 2, 6),
('Color raised way too much too early. Classic mistake.', 3, 7),
('That Pets.com Super Bowl ad was iconic though.', 1, 8),
('RIP Vine. TikTok owes everything to you.', 4, 9),
('Google+ circles were actually a good idea, just poorly executed.', 5, 10);

-- Insert team members for some startups (skip duplicates)
INSERT IGNORE INTO TeamMembers (user_id, startup_id, role_title, tenure_start_year, tenure_end_year) VALUES
(1, 1, 'CEO & Founder', 2020, 2023),
(2, 2, 'CTO & Co-founder', 2021, 2022),
(3, 3, 'CEO & Founder', 2019, 2021),
(1, 4, 'CEO & Co-founder', 2020, 2022),
(4, 5, 'Head of Content', 2018, 2020),
(5, 6, 'VP of Marketing', 2015, 2020),
(2, 7, 'Lead Engineer', 2011, 2012),
(3, 8, 'VP of Operations', 1999, 2000),
(4, 9, 'Product Manager', 2013, 2017),
(5, 10, 'Community Manager', 2012, 2019);

COMMIT;
