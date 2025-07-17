// scripts/setup-database.js
import pool from "../lib/mysql.js";

const setupDatabase = async () => {
  try {
    console.log("🔧 Setting up database tables...");

    // Create kics_emails table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS kics_emails (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email)
      )
    `);
    console.log("✅ kics_emails table created/verified");

    // Create kics_release_notes table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS kics_release_notes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        version VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        type ENUM('major', 'minor', 'patch') DEFAULT 'patch',
        tags JSON,
        notes JSON,
        picture_url VARCHAR(500),
        picture_path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_version (version),
        INDEX idx_type (type),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log("✅ kics_release_notes table created/verified");

    // Create kics_email_notifications table
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS kics_email_notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        release_note_id INT NOT NULL,
        email_count INT DEFAULT 0,
        status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
        sent_at TIMESTAMP NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (release_note_id) REFERENCES kics_release_notes(id) ON DELETE CASCADE,
        INDEX idx_release_note_id (release_note_id),
        INDEX idx_status (status)
      )
    `);
    console.log("✅ kics_email_notifications table created/verified");

    // Test database connection
    const [rows] = await pool.execute(
      "SELECT COUNT(*) as count FROM kics_emails"
    );
    console.log(`📊 Current email subscribers: ${rows[0].count}`);

    console.log("🎉 Database setup completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Database setup failed:", error.message);
    process.exit(1);
  }
};

setupDatabase();
