// app/api/send-emails/route.js
import { NextResponse } from "next/server";
import pool from "../../lib/mysql";
import { validateEmail, sanitizeEmail } from "../../lib/validators";
import nodemailer from "nodemailer";

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Helper function to generate email HTML
const generateEmailHTML = (releaseNote) => {
  const getChangeIcon = (type) => {
    switch (type) {
      case "feature":
        return "🌟";
      case "improvement":
        return "⚡";
      case "fix":
        return "🐛";
      case "security":
        return "🔒";
      default:
        return "✅";
    }
  };

  const getVersionBadgeStyle = (type) => {
    switch (type) {
      case "major":
        return "background-color: #fee2e2; color: #991b1b; border-color: #fecaca;";
      case "minor":
        return "background-color: #dbeafe; color: #1e3a8a; border-color: #bfdbfe;";
      case "patch":
        return "background-color: #dcfce7; color: #166534; border-color: #bbf7d0;";
      default:
        return "background-color: #f3f4f6; color: #374151; border-color: #d1d5db;";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KICS Release v${releaseNote.version}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #374151;
          max-width: 600px;
          margin: 0 auto;
          background-color: #f9fafb;
          padding: 20px;
        }
        .container {
          background-color: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 2px solid #e5e7eb;
        }
        .logo {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 12px;
          margin: 0 auto 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }
        .version-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 12px;
          font-weight: 600;
          border: 1px solid;
          ${getVersionBadgeStyle(releaseNote.type)}
        }
        .title {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin: 16px 0 8px;
        }
        .date {
          color: #6b7280;
          font-size: 14px;
        }
        .description {
          background-color: #f8fafc;
          padding: 20px;
          border-radius: 8px;
          margin: 24px 0;
          border-left: 4px solid #3b82f6;
        }
        .changes-section {
          margin: 32px 0;
        }
        .changes-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 16px;
        }
        .change-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 12px;
          padding: 12px;
          background-color: #f9fafb;
          border-radius: 6px;
        }
        .change-icon {
          margin-right: 12px;
          font-size: 16px;
        }
        .change-text {
          flex: 1;
          color: #374151;
        }
        .tags {
          margin: 24px 0;
        }
        .tag {
          display: inline-block;
          background-color: #f3f4f6;
          color: #374151;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-right: 8px;
          margin-bottom: 4px;
        }
        .footer {
          margin-top: 40px;
          padding-top: 24px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .unsubscribe {
          color: #6b7280;
          text-decoration: none;
          font-size: 12px;
        }
        .unsubscribe:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🔔</div>
          <h1 style="margin: 0; color: #111827; font-size: 28px;">KICS Release Notes</h1>
          <p style="margin: 8px 0 0; color: #6b7280;">Stay updated with our latest changes</p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <span class="version-badge">v${releaseNote.version}</span>
          <div class="date">${formatDate(releaseNote.date)}</div>
        </div>

        <h2 class="title">${releaseNote.title}</h2>

        <div class="description">
          <p style="margin: 0;">${releaseNote.description}</p>
        </div>

        ${
          releaseNote.tags && releaseNote.tags.length > 0
            ? `
          <div class="tags">
            ${releaseNote.tags
              .map((tag) => `<span class="tag">${tag.replace("-", " ")}</span>`)
              .join("")}
          </div>
        `
            : ""
        }

        <div class="changes-section">
          <h3 class="changes-title">What's Changed:</h3>
          ${releaseNote.changes
            .map(
              (change) => `
            <div class="change-item">
              <span class="change-icon">${getChangeIcon(change.type)}</span>
              <div class="change-text">${change.text}</div>
            </div>
          `
            )
            .join("")}
        </div>

        <div class="footer">
          <p>Have questions about this release? Contact our support team.</p>
          <p style="margin-top: 16px;">
            <a href="${
              process.env.NEXTAUTH_URL || "http://localhost:3000"
            }/unsubscribe?email={{EMAIL}}" class="unsubscribe">
              Unsubscribe from these notifications
            </a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Helper function to generate plain text email
const generateEmailText = (releaseNote) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return `
KICS Release Notes - v${releaseNote.version}

${releaseNote.title}
Released: ${formatDate(releaseNote.date)}

${releaseNote.description}

What's Changed:
${releaseNote.changes.map((change) => `• ${change.text}`).join("\n")}

${
  releaseNote.tags && releaseNote.tags.length > 0
    ? `\nTags: ${releaseNote.tags.join(", ")}\n`
    : ""
}

Have questions about this release? Contact our support team.

---
To unsubscribe from these notifications, visit: ${
    process.env.NEXTAUTH_URL || "http://localhost:3000"
  }/unsubscribe
  `.trim();
};

// POST - Send release note emails
export async function POST(request) {
  try {
    const { releaseNoteId, testEmail } = await request.json();

    if (!releaseNoteId) {
      return NextResponse.json(
        { error: "Release note ID is required" },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    let releaseNote;
    let emailList = [];

    try {
      // Fetch the release note
      const [releaseRows] = await connection.execute(
        "SELECT * FROM kics_release_notes WHERE id = ?",
        [releaseNoteId]
      );

      if (releaseRows.length === 0) {
        return NextResponse.json(
          { error: "Release note not found" },
          { status: 404 }
        );
      }

      const rawNote = releaseRows[0];

      // Parse JSON fields safely
      const tags = (() => {
        try {
          return JSON.parse(rawNote.tags || "[]");
        } catch {
          return [];
        }
      })();

      const changes = (() => {
        try {
          return JSON.parse(rawNote.notes || "[]");
        } catch {
          return [];
        }
      })();

      releaseNote = {
        id: rawNote.id,
        version: rawNote.version,
        title: rawNote.title,
        description: rawNote.description,
        type: rawNote.type,
        tags: Array.isArray(tags) ? tags : [],
        changes: Array.isArray(changes) ? changes : [],
        date: rawNote.created_at.toISOString().split("T")[0],
      };

      // Get email list
      if (testEmail) {
        // Validate test email
        const validation = validateEmail(testEmail);
        if (!validation.isValid) {
          return NextResponse.json(
            { error: "Invalid test email address" },
            { status: 400 }
          );
        }
        emailList = [sanitizeEmail(testEmail)];
      } else {
        // Get all subscribed emails
        const [emailRows] = await connection.execute(
          "SELECT email FROM kics_emails ORDER BY created_at ASC"
        );
        emailList = emailRows.map((row) => row.email);
      }

      if (emailList.length === 0) {
        return NextResponse.json(
          {
            error: testEmail
              ? "Test email is required"
              : "No subscribers found",
          },
          { status: 400 }
        );
      }
    } finally {
      connection.release();
    }

    // Create email transporter
    const transporter = createTransporter();

    // Generate email content
    const htmlContent = generateEmailHTML(releaseNote);
    const textContent = generateEmailText(releaseNote);

    // Send emails
    const emailPromises = emailList.map(async (email) => {
      try {
        await transporter.sendMail({
          from: `"KICS Release Notes" <${
            process.env.SMTP_FROM || process.env.SMTP_USER
          }>`,
          to: email,
          subject: `🚀 KICS v${releaseNote.version} Released - ${releaseNote.title}`,
          text: textContent,
          html: htmlContent.replace("{{EMAIL}}", encodeURIComponent(email)),
        });
        return { email, status: "sent" };
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        return { email, status: "failed", error: error.message };
      }
    });

    const results = await Promise.all(emailPromises);
    const successCount = results.filter((r) => r.status === "sent").length;
    const failureCount = results.filter((r) => r.status === "failed").length;

    // Log the email notification in the database
    if (!testEmail) {
      const dbConnection = await pool.getConnection();
      try {
        await dbConnection.execute(
          `INSERT INTO kics_email_notifications 
           (release_note_id, email_count, sent_count, failed_count, status, created_at) 
           VALUES (?, ?, ?, ?, ?, NOW())`,
          [
            releaseNoteId,
            emailList.length,
            successCount,
            failureCount,
            failureCount === 0 ? "sent" : "partial",
          ]
        );
      } catch (error) {
        console.error("Failed to log email notification:", error);
      } finally {
        dbConnection.release();
      }
    }

    return NextResponse.json(
      {
        message: testEmail
          ? `Test email ${
              successCount > 0 ? "sent successfully" : "failed to send"
            }`
          : `Emails sent to ${successCount} of ${emailList.length} subscribers`,
        results: {
          total: emailList.length,
          sent: successCount,
          failed: failureCount,
          details: results,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "Failed to send emails. Please check your SMTP configuration." },
      { status: 500 }
    );
  }
}
