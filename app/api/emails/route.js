import { NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { validateEmail, sanitizeEmail } from "@/lib/validators";

export async function POST(request) {
  try {
    const { email } = await request.json();

    // Validate email
    const validation = validateEmail(email);
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const cleanEmail = sanitizeEmail(email);

    const connection = await pool.getConnection();
    try {
      await connection.execute("INSERT INTO kics_emails (email) VALUES (?)", [
        cleanEmail,
      ]);
    } catch (error) {
      if (error.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
      throw error;
    } finally {
      connection.release();
    }

    return NextResponse.json(
      { message: "Email saved successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving email:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
