import { NextResponse } from "next/server";
import pool from "../../lib/mysql";
import { validateReleaseNote, sanitizeReleaseNote } from "../../lib/validators";

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

// GET - Fetch all release notes
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

// POST - Create new release note
export async function POST(request) {
  try {
    const body = await request.json();
    const { version, title, description, type, tags, changes } = body;

    // Prepare data for validation
    const releaseData = {
      version,
      title,
      description,
      type: type || "patch",
      tags: tags || [],
      notes: changes || [], // Frontend sends 'changes', we store as 'notes'
    };

    // Validate the data
    const validation = validateReleaseNote(releaseData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Sanitize the data
    const cleanData = sanitizeReleaseNote(releaseData);

    // MySQL database insert
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO kics_release_notes 
         (version, title, description, type, tags, notes, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          cleanData.version,
          cleanData.title,
          cleanData.description,
          cleanData.type,
          JSON.stringify(cleanData.tags),
          JSON.stringify(cleanData.notes),
        ]
      );

      console.log("Release note created with ID:", result.insertId);

      return NextResponse.json(
        {
          message: "Release note created successfully.",
          id: result.insertId,
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error creating release note:", error);

    // Handle specific MySQL errors
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A release with this version already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// PUT - Update existing release note
export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, version, title, description, type, tags, changes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Release note ID is required for updates" },
        { status: 400 }
      );
    }

    // Prepare data for validation
    const releaseData = {
      version,
      title,
      description,
      type: type || "patch",
      tags: tags || [],
      notes: changes || [], // Frontend sends 'changes', we store as 'notes'
    };

    // Validate the data
    const validation = validateReleaseNote(releaseData);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Sanitize the data
    const cleanData = sanitizeReleaseNote(releaseData);

    // MySQL database update
    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `UPDATE kics_release_notes 
         SET version = ?, title = ?, description = ?, type = ?, tags = ?, notes = ?, updated_at = NOW()
         WHERE id = ?`,
        [
          cleanData.version,
          cleanData.title,
          cleanData.description,
          cleanData.type,
          JSON.stringify(cleanData.tags),
          JSON.stringify(cleanData.notes),
          id,
        ]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: "Release note not found" },
          { status: 404 }
        );
      }

      console.log("Release note updated, ID:", id);

      return NextResponse.json(
        {
          message: "Release note updated successfully.",
          id: id,
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error updating release note:", error);

    // Handle specific MySQL errors
    if (error.code === "ER_DUP_ENTRY") {
      return NextResponse.json(
        { error: "A release with this version already exists." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// DELETE - Delete release note
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Release note ID is required for deletion" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        "DELETE FROM kics_release_notes WHERE id = ?",
        [id]
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { error: "Release note not found" },
          { status: 404 }
        );
      }

      console.log("Release note deleted, ID:", id);

      return NextResponse.json(
        {
          message: "Release note deleted successfully.",
          id: id,
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error deleting release note:", error);

    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
