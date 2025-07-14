import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import pool from "@/lib/mysql";
import { createClient } from "@supabase/supabase-js";
import { validateReleaseNote, sanitizeReleaseNote } from "@/lib/validators";

export async function POST(request) {
  const supabaseUrl = process.env.DATABASE_URL;
  const supabaseKey = process.env.API_STORAGE;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const formData = await request.formData();
    const file = formData.get("pictureUpload");
    const version = formData.get("versionNumber");
    const title = formData.get("entryTitle");
    const notes = formData.get("notes");
    const description = formData.get("description"); // Make sure this field exists
    const type = formData.get("type") || "patch";
    const tags = formData.get("tags"); // Should be JSON string

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

    // Handle file upload (if you're still using it)
    let imageUrl = null,
      filePath = null;
    if (file) {
      const fileName = `${uuidv4()}-${file.name}`;
      filePath = `pictures/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("kics-pictures")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        return NextResponse.json(
          { error: "Failed to upload file." },
          { status: 500 }
        );
      }

      const { data: publicUrlData } = supabase.storage
        .from("kics-pictures")
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    // Database insert
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        "INSERT INTO kics_release_notes (version, title, description, type, tags, notes, picture_url, picture_path, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())",
        [
          cleanData.version,
          cleanData.title,
          cleanData.description,
          cleanData.type,
          JSON.stringify(cleanData.tags),
          JSON.stringify(cleanData.notes),
          imageUrl,
          filePath,
        ]
      );
    } finally {
      connection.release();
    }

    return NextResponse.json(
      { message: "Release notes saved successfully.", imageUrl },
      { status: 201 }
    );
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
