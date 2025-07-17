// scripts/insert-dummy-data.js
import pool from "../app/lib/mysql";

// The dummy data from your ReleaseNotesApp component
const dummyData = [
  {
    id: "1",
    version: "2.4.1",
    date: "2025-01-15",
    type: "patch",
    title: "Bug Fixes and Performance Improvements",
    description:
      "This release focuses on stability improvements and bug fixes based on user feedback.",
    tags: ["bug-fixes", "performance", "mobile", "dashboard"],
    changes: [
      {
        type: "fix",
        text: "Fixed authentication timeout issues in mobile apps",
      },
      { type: "fix", text: "Resolved memory leak in dashboard components" },
      {
        type: "improvement",
        text: "Improved loading times by 25% across all pages",
      },
      { type: "fix", text: "Fixed export functionality for large datasets" },
    ],
  },
  {
    id: "2",
    version: "2.4.0",
    date: "2025-01-08",
    type: "minor",
    title: "New Dashboard Features",
    description:
      "Introducing enhanced analytics and customizable dashboard widgets.",
    tags: ["dashboard", "analytics", "widgets", "mobile", "dark-mode"],
    changes: [
      { type: "feature", text: "Added customizable dashboard widgets" },
      { type: "feature", text: "New analytics charts with real-time data" },
      { type: "improvement", text: "Enhanced mobile responsiveness" },
      { type: "feature", text: "Dark mode support for all components" },
    ],
  },
  {
    id: "3",
    version: "2.3.2",
    date: "2024-12-20",
    type: "patch",
    title: "Holiday Security Update",
    description: "Important security patches and stability improvements.",
    tags: ["security", "patches", "xss", "authentication"],
    changes: [
      { type: "security", text: "Patched XSS vulnerability in user profiles" },
      { type: "security", text: "Updated authentication encryption standards" },
      { type: "fix", text: "Fixed timezone display issues" },
      { type: "improvement", text: "Improved error handling and logging" },
    ],
  },
  {
    id: "4",
    version: "2.3.1",
    date: "2024-12-15",
    type: "patch",
    title: "Quick Fixes",
    description: "Addressing critical issues reported by our community.",
    tags: ["bug-fixes", "search", "file-upload", "ux"],
    changes: [
      {
        type: "fix",
        text: "Fixed search functionality not working with special characters",
      },
      { type: "fix", text: "Resolved file upload timeout issues" },
      {
        type: "improvement",
        text: "Better error messages for failed operations",
      },
    ],
  },
  {
    id: "5",
    version: "2.3.0",
    date: "2024-12-01",
    type: "minor",
    title: "Enhanced User Experience",
    description: "Major UX improvements and new collaboration features.",
    tags: ["ux", "collaboration", "notifications", "accessibility", "search"],
    changes: [
      { type: "feature", text: "Real-time collaboration on documents" },
      {
        type: "feature",
        text: "New notification system with granular controls",
      },
      {
        type: "improvement",
        text: "Redesigned navigation with improved accessibility",
      },
      { type: "feature", text: "Advanced search with filters and sorting" },
      { type: "improvement", text: "Faster page transitions and animations" },
    ],
  },
  {
    id: "6",
    version: "2.2.3",
    date: "2024-11-28",
    type: "patch",
    title: "Thanksgiving Update",
    description: "Small but important fixes for a smoother experience.",
    tags: ["bug-fixes", "calendar", "mobile", "performance"],
    changes: [
      {
        type: "fix",
        text: "Fixed calendar sync issues with external providers",
      },
      { type: "fix", text: "Resolved layout breaking on very small screens" },
      { type: "improvement", text: "Optimized images for faster loading" },
    ],
  },
  {
    id: "7",
    version: "2.2.2",
    date: "2024-11-15",
    type: "patch",
    title: "Stability Improvements",
    description: "Backend optimizations and bug fixes.",
    tags: ["backend", "performance", "database", "security", "file-upload"],
    changes: [
      { type: "fix", text: "Fixed database connection pooling issues" },
      { type: "improvement", text: "Reduced API response times by 40%" },
      {
        type: "fix",
        text: "Fixed rare crash when handling large file uploads",
      },
      { type: "security", text: "Enhanced rate limiting to prevent abuse" },
    ],
  },
  {
    id: "8",
    version: "2.2.1",
    date: "2024-11-08",
    type: "patch",
    title: "Quick Bug Fixes",
    description: "Addressing urgent issues from the 2.2.0 release.",
    tags: ["bug-fixes", "payments", "notifications", "validation"],
    changes: [
      { type: "fix", text: "Fixed critical bug in payment processing" },
      { type: "fix", text: "Resolved email notification delivery issues" },
      { type: "improvement", text: "Better validation for form inputs" },
    ],
  },
  {
    id: "9",
    version: "2.2.0",
    date: "2024-11-01",
    type: "minor",
    title: "Payment System Overhaul",
    description: "Complete redesign of our payment and billing system.",
    tags: ["payments", "dashboard", "analytics", "security", "enterprise"],
    changes: [
      {
        type: "feature",
        text: "New payment dashboard with detailed analytics",
      },
      { type: "feature", text: "Support for multiple payment methods" },
      { type: "feature", text: "Automated invoice generation and delivery" },
      { type: "improvement", text: "Enhanced security for payment processing" },
      {
        type: "feature",
        text: "Subscription management for enterprise customers",
      },
    ],
  },
];

const insertDummyData = async () => {
  try {
    console.log("🔄 Clearing existing data...");

    // Clear existing data
    const connection = await pool.getConnection();
    await connection.execute("DELETE FROM kics_release_notes");
    console.log("✅ Existing data cleared");

    console.log("🔄 Inserting dummy data...");

    // Insert dummy data
    for (const item of dummyData) {
      try {
        await connection.execute(
          `INSERT INTO kics_release_notes 
           (version, title, description, type, tags, notes, created_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            item.version,
            item.title,
            item.description,
            item.type,
            JSON.stringify(item.tags),
            JSON.stringify(item.changes), // Store changes as notes
            new Date(item.date + "T12:00:00Z"), // Convert date to datetime
          ]
        );
        console.log(`✅ Inserted version ${item.version}: ${item.title}`);
      } catch (error) {
        console.error(`❌ Failed to insert ${item.version}:`, error.message);
      }
    }

    connection.release();

    // Verify the data was inserted
    const verifyConnection = await pool.getConnection();
    const [rows] = await verifyConnection.execute(
      "SELECT COUNT(*) as count FROM kics_release_notes"
    );
    verifyConnection.release();

    console.log(`🎉 Successfully inserted ${rows[0].count} release notes!`);

    // Show a sample of the data
    const sampleConnection = await pool.getConnection();
    const [sampleRows] = await sampleConnection.execute(
      "SELECT version, title, tags, notes FROM kics_release_notes LIMIT 2"
    );
    sampleConnection.release();

    console.log("\n📋 Sample data:");
    sampleRows.forEach((row, index) => {
      console.log(`${index + 1}. Version ${row.version}: ${row.title}`);
      console.log(`   Tags: ${row.tags}`);
      console.log(`   Notes: ${row.notes.substring(0, 100)}...`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error inserting dummy data:", error.message);
    process.exit(1);
  }
};

insertDummyData();
