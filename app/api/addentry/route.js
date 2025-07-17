import { NextResponse } from "next/server";
import pool from "../../lib/mysql";
import { validateReleaseNote, sanitizeReleaseNote } from "../../lib/validators";

export async function POST(request) {
  try {
    const formData = await request.formData();
    const version = formData.get("versionNumber");
    const title = formData.get("entryTitle");
    const notes = formData.get("notes");
    const description = formData.get("description");
    const type = formData.get("type") || "patch";
    const tags = formData.get("tags");

    let parsedNotes, parsedTags;
    try {
      parsedNotes = JSON.parse(notes);
      parsedTags = tags ? JSON.parse(tags) : [];
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON format for notes or tags" },
        { status: 400 }
      );
    }

    // Prepare data for validation
    const releaseData = {
      version,
      title,
      description,
      type,
      tags: parsedTags,
      notes: parsedNotes,
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

      console.log("Release note saved to MySQL with ID:", result.insertId);

      return NextResponse.json(
        {
          message: "Release notes saved successfully.",
          id: result.insertId,
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("API route error:", error);

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
