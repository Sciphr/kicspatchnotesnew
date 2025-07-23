// app/api/email-history/route.js
import { NextResponse } from "next/server";
import pool from "../../lib/mysql";

// GET - Fetch all email notification history (client-side pagination)
export async function GET(request) {
  try {
    const connection = await pool.getConnection();

    try {
      // Fetch all email notification history with release note details
      const [rows] = await connection.execute(
        `SELECT 
          en.id,
          en.release_note_id,
          en.email_count,
          en.sent_at,
          en.status,
          en.error_message,
          en.email_type,
          rn.version,
          rn.title,
          rn.type
        FROM kics_email_notifications en
        LEFT JOIN kics_release_notes rn ON en.release_note_id = rn.id
        ORDER BY en.sent_at DESC`
      );

      // Transform the data for the frontend
      const history = rows.map((row) => ({
        id: row.id,
        release_note_id: row.release_note_id,
        email_count: row.email_count,
        sent_at: row.sent_at,
        status: row.status,
        error_message: row.error_message,
        email_type: row.email_type || "bulk",
        version: row.version || "Unknown",
        title: row.title || "Deleted Release",
        type: row.type || "unknown",
      }));

      return NextResponse.json(
        {
          history: history,
          totalRecords: history.length,
        },
        { status: 200 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error fetching email history:", error);

    return NextResponse.json(
      { error: "Failed to fetch email history" },
      { status: 500 }
    );
  }
}

// Optional: DELETE - Clear email history (admin only)
// export async function DELETE(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const confirmDelete = searchParams.get("confirm");

//     if (confirmDelete !== "true") {
//       return NextResponse.json(
//         {
//           error:
//             "Confirmation required. Add ?confirm=true to delete all history.",
//         },
//         { status: 400 }
//       );
//     }

//     const connection = await pool.getConnection();
//     try {
//       const [result] = await connection.execute(
//         "DELETE FROM kics_email_notifications"
//       );

//       return NextResponse.json(
//         {
//           message: `Deleted ${result.affectedRows} email history records`,
//           deleted_count: result.affectedRows,
//         },
//         { status: 200 }
//       );
//     } finally {
//       connection.release();
//     }
//   } catch (error) {
//     console.error("Error deleting email history:", error);

//     return NextResponse.json(
//       { error: "Failed to delete email history" },
//       { status: 500 }
//     );
//   }
// }
