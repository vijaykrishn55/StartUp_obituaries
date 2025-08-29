# Database Setup Guide

## Error Fix: "No database selected" & Safe Update Mode

You may encounter two common MySQL errors:
1. **Error 1046**: "No database selected" 
2. **Error 1175**: "Safe update mode" prevents updates without KEY columns

Both are now fixed in the migration scripts.

## Option 1: Use the Complete Setup Script (RECOMMENDED)

Run the complete database setup script that includes everything:

```bash
mysql -u root -p < backend/complete_database_setup.sql
```

This script will:
- Create the database
- Create all tables with proper indexes
- Handle all dependencies correctly

## Option 2: Manual Database Creation

If you prefer to run step by step:

1. **First, create and select the database:**
```sql
CREATE DATABASE IF NOT EXISTS startup_obituaries 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;
USE startup_obituaries;
```

2. **Then run the main schema:**
```bash
mysql -u root -p startup_obituaries < backend/schema.sql
```

3. **Finally, run migrations in order:**
```bash
mysql -u root -p startup_obituaries < backend/migrations/add_password_reset_tokens.sql
mysql -u root -p startup_obituaries < backend/migrations/add_user_roles_simple.sql
mysql -u root -p startup_obituaries < backend/migrations/add_logo_url_to_startups.sql
mysql -u root -p startup_obituaries < backend/migrations/add_pivot_reaction.sql
mysql -u root -p startup_obituaries < backend/migrations/create_messages_table.sql
mysql -u root -p startup_obituaries < backend/migrations/create_reports_table.sql
```

## Option 3: Using MySQL Workbench

1. **Connect to your MySQL server**
2. **Right-click in the SCHEMAS panel and select "Create Schema"**
3. **Name it `startup_obituaries`**
4. **Double-click the new schema to select it**
5. **Copy and paste the contents of `backend/complete_database_setup.sql`**
6. **Execute the script**

## Environment Setup

After setting up the database, update your `.env` file:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=startup_obituaries
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Test the Setup

1. **Start the backend:**
```bash
cd backend
npm start
```

2. **You should see:**
```
✅ Database connected successfully
🚀 Server running on port 3000
📊 Health check: http://localhost:3000/health
🔗 API Base URL: http://localhost:3000/api
🔌 Socket.IO server initialized
📝 Environment: development
```

## Common Issues

- **Error 1045**: Wrong MySQL password - update DB_PASSWORD in .env
- **Error 1049**: Database doesn't exist - run Option 1 above
- **Error 1046**: No database selected - the migrations now include USE statements
- **Error 1064**: SQL syntax error - use the simple migration scripts
- **Error 1175**: Safe update mode - choose one of these solutions:

### Safe Update Mode Solutions:

**Solution A (Temporary)**: Run this command in MySQL before migrations:
```sql
SET SQL_SAFE_UPDATES = 0;
-- Run your migrations here
SET SQL_SAFE_UPDATES = 1;
```

**Solution B (Permanent)**: In MySQL Workbench:
1. Go to Edit → Preferences → SQL Editor
2. Uncheck "Safe Updates"
3. Reconnect to your database

**Solution C (Use Simple Migration)**: Use the simple, reliable migration:
```bash
mysql -u root -p startup_obituaries < backend/migrations/add_user_roles_simple.sql
```

**Solution D (Use Safe Migration)**: Use the safe mode friendly migration:
```bash
mysql -u root -p startup_obituaries < backend/migrations/add_user_roles_safe.sql
```

The migration files have been updated to handle both issues automatically.