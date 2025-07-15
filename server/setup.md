# PassX Server Setup Guide

## 1. Create Environment File

Create a `.env` file in the server directory with the following content:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name

# JWT Secret (change this to a secure random string)
JWT_SECRET=your_secure_jwt_secret_here

# Server Configuration
PORT=5000
```

## 2. Database Setup

Make sure you have:
1. PostgreSQL installed and running
2. Created your database
3. Created the `passwordss` table with this SQL:

```sql
CREATE TABLE passwordss (
    id BIGSERIAL PRIMARY KEY,
    user_id INT,
    title VARCHAR(255) NOT NULL,
    username VARCHAR(255),
    password TEXT NOT NULL,
    website VARCHAR(255),
    notes TEXT,
    category VARCHAR(50) DEFAULT 'Website',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 3. Users Table

You also need a `users` table for authentication:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 4. Start the Server

```bash
cd server
npm start
```

## 5. Test the Connection

The server will show:
- ✅ Database connected successfully
- ✅ Server running on port 5000

If you see errors, check:
- Database connection string in .env
- PostgreSQL is running
- Tables exist in your database 