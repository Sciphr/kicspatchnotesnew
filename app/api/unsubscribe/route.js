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
      // Check if email exists
      const [rows] = await connection.execute(
        "SELECT * FROM kics_emails WHERE email = ? LIMIT 1",
        [cleanEmail]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Email not found in our subscribe list." },
          { status: 404 }
        );
      }

      // Delete the email
      await connection.execute("DELETE FROM kics_emails WHERE email = ?", [
        cleanEmail,
      ]);
    } finally {
      connection.release();
    }

    return NextResponse.json({ message: "Unsubscribed successfully." });
  } catch (error) {
    console.error("Error in unsubscribe route:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
