import { NextResponse } from "next/server";
import pool from "../../lib/mysql";

export async function GET(request) {
  try {
    const connection = await pool.getConnection();

    try {
      // Fetch all release notes ordered by creation date (newest first)
      const [rows] = await connection.execute(
        `SELECT 
          id, 
          version, 
          title, 
          description, 
          type, 
          tags, 
          notes, 
          created_at, 
          updated_at 
        FROM kics_release_notes 
        ORDER BY created_at DESC`
      );

      console.log("Raw database rows:", rows.length);

      // Transform the data to match the frontend format
      const releaseNotes = rows.map((row, index) => {
        console.log(`Processing row ${index + 1}:`, {
          id: row.id,
          version: row.version,
          title: row.title,
        });

        // Safely parse tags
        const tags = safeJSONParse(row.tags, []);

        // Safely parse notes (should be an array of changes)
        const changes = safeJSONParse(row.notes, []);

        // Ensure changes is always an array
        const validChanges = Array.isArray(changes) ? changes : [];

        return {
          id: row.id.toString(),
          version: row.version,
          title: row.title,
          description: row.description,
          type: row.type,
          tags: Array.isArray(tags) ? tags : [],
          changes: validChanges,
          date: row.created_at.toISOString().split("T")[0], // Format as YYYY-MM-DD
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      });

      console.log("Processed release notes:", releaseNotes.length);

      return NextResponse.json(
        {
          data: releaseNotes,
          count: releaseNotes.length,
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching release notes:", error);

    return NextResponse.json(
      { error: "Failed to fetch release notes" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import pool from "../../lib/mysql";

// Helper function to safely parse JSON
const safeJSONParse = (jsonString, fallback = []) => {
  if (!jsonString || jsonString.trim() === "") {
    return fallback;
  }

  try {
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (error) {
    console.error("JSON parsing error:", error, "Original string:", jsonString);
    return fallback;
  }
};

export async function GET(request) {
  try {
    const connection = await pool.getConnection();

    try {
      // Fetch all release notes ordered by creation date (newest first)
      const [rows] = await connection.execute(
        `SELECT 
          id, 
          version, 
          title, 
          description, 
          type, 
          tags, 
          notes, 
          created_at, 
          updated_at 
        FROM kics_release_notes 
        ORDER BY created_at DESC`
      );

      console.log("Raw database rows:", rows.length);

      // Transform the data to match the frontend format
      const releaseNotes = rows.map((row, index) => {
        console.log(`Processing row ${index + 1}:`, {
          id: row.id,
          version: row.version,
          tags: row.tags ? row.tags.substring(0, 100) + "..." : "null",
          notes: row.notes ? row.notes.substring(0, 100) + "..." : "null",
        });

        // Safely parse tags
        const tags = safeJSONParse(row.tags, []);

        // Safely parse notes (should be an array of changes)
        const changes = safeJSONParse(row.notes, []);

        // Ensure changes is always an array
        const validChanges = Array.isArray(changes) ? changes : [];

        return {
          id: row.id.toString(),
          version: row.version,
          title: row.title,
          description: row.description,
          type: row.type,
          tags: Array.isArray(tags) ? tags : [],
          changes: validChanges,
          date: row.created_at.toISOString().split("T")[0], // Format as YYYY-MM-DD
          created_at: row.created_at,
          updated_at: row.updated_at,
        };
      });

      console.log("Processed release notes:", releaseNotes.length);

      return NextResponse.json(
        {
          data: releaseNotes,
          count: releaseNotes.length,
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching release notes:", error);

    return NextResponse.json(
      { error: "Failed to fetch release notes" },
      { status: 500 }
    );
  }
}
