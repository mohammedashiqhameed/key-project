const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Check for required environment variables
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment variables");
  console.log("Please create a .env file with your database connection string");
  console.log("Example: DATABASE_URL=postgresql://username:password@localhost:5432/database_name");
  process.exit(1);
}

if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET is not set, using default (not recommended for production)");
  process.env.JWT_SECRET = "default_jwt_secret_change_in_production";
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('Please check your DATABASE_URL in the .env file');
  } else {
    console.log('✅ Database connected successfully');
  }
});

// Middleware to verify token
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    console.log("❌ No authorization token provided");
    return res.status(401).json({ message: "No authorization token provided" });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("❌ Invalid token:", err.message);
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hash]);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Registration failed" });
  }
});
  
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
    const user = result.rows[0];
    if (user && (await bcrypt.compare(password, user.password))) {
      const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: "1h" });
      res.json({ token });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Password Routes
app.post("/api/passwords", authenticateToken, async (req, res) => {
  try {
    const { title, username, password, website, notes, category } = req.body;
    
    // Validate required fields
    if (!title || !password) {
      return res.status(400).json({ message: "Title and password are required" });
    }
    
    console.log("📝 Adding password for user:", req.user.id);
    console.log("📝 Password data:", { title, username, website, category, notes: notes ? "provided" : "not provided" });
    
    const result = await pool.query(
      "INSERT INTO passwordss (user_id, title, username, password, website, notes, category) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [req.user.id, title, username || null, password, website || null, notes || null, category || 'Website']
    );
    
    console.log("✅ Password added successfully with ID:", result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("❌ Store password error:", err);
    
    // Check for specific database errors
    if (err.code === '42P01') {
      return res.status(500).json({ message: "Database table 'passwordss' not found. Please create the table first." });
    }
    if (err.code === '23505') {
      return res.status(400).json({ message: "A password with this title already exists" });
    }
    if (err.code === '23503') {
      return res.status(400).json({ message: "Invalid user_id. Please login again." });
    }
    
    res.status(500).json({ message: "Failed to store password", error: err.message });
  }
});

app.get("/api/passwords", authenticateToken, async (req, res) => {
  try {
    console.log("📖 Fetching passwords for user:", req.user.id);
    
    const result = await pool.query(
      "SELECT id, title, username, password, website, notes, category, created_at FROM passwordss WHERE user_id = $1 ORDER BY created_at DESC",
      [req.user.id]
    );
    
    console.log("✅ Found", result.rows.length, "passwords");
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Fetch passwords error:", err);
    
    if (err.code === '42P01') {
      return res.status(500).json({ message: "Database table 'passwordss' not found. Please create the table first." });
    }
    
    res.status(500).json({ message: "Failed to fetch passwords", error: err.message });
  }
});

app.put("/api/passwords/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, username, password, website, notes, category } = req.body;
    
    const result = await pool.query(
      "UPDATE passwordss SET title = $1, username = $2, password = $3, website = $4, notes = $5, category = $6 WHERE id = $7 AND user_id = $8 RETURNING *",
      [title, username, password, website, notes, category, id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Password not found" });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update password error:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
});

app.delete("/api/passwords/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM passwordss WHERE id = $1 AND user_id = $2 RETURNING id",
      [id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Password not found" });
    }
    
    res.json({ message: "Password deleted successfully" });
  } catch (err) {
    console.error("Delete password error:", err);
    res.status(500).json({ message: "Failed to delete password" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
