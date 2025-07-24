import mysql from './mysql';
import nodemailer from 'nodemailer';

const BATCH_SIZE = 15; // Send 15 emails per batch
const BATCH_DELAY = 60000; // Wait 1 minute between batches
const EMAIL_DELAY = 5000; // Wait 5 seconds between individual emails

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

function generateEmailHTML(releaseNote) {
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
          background-color: #ffffff;
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
          height: 60px;
          margin: 0 auto 16px;
          display: block;
        }
        .version-badge {
  display: inline-block;
  padding: 4px 12px;  
  border-radius: 16px;
  margin-bottom: 4px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid;
  box-sizing: border-box;  
  ${getVersionBadgeStyle(releaseNote.version_type)}
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
          background-color: #ffffff;
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
   
        .tags {
          margin: 24px 0;
        }
        .tag {
          display: inline-block;
          background-color: #ffffff;
          color: #374151;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          margin-right: 12px;
          margin-bottom: 4px;
          border: 1px solid #e5e7eb;
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
          <img src="${process.env.SITE_URL || "http://localhost:3000"}/kicshorizontal.png" 
               alt="KICS" 
               width="240" 
               height="60" 
               style="height: 60px !important; width: 240px !important; max-width: 240px !important; margin: 0 auto 16px; display: block; border: 0;">
          <h1 style="margin: 0; color: #111827; font-size: 28px;">KICS Release Notes</h1>
          <p style="margin: 8px 0 0; color: #6b7280;">Stay updated with our latest changes</p>
        </div>

        <div style="text-align: center; margin-bottom: 24px;">
          <span class="version-badge">v${releaseNote.version}</span>
          <div class="date">${formatDate(new Date())}</div>
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
              .join(" ")}
          </div>
        `
            : ""
        }

        <div class="changes-section">
  <h3 class="changes-title">What's Changed:</h3>
  <table width="100%" cellpadding="0" cellspacing="0">
    ${releaseNote.changes
      .map(
        (change) => `
      <tr>
        <td width="20" style="padding: 8px 12px 8px 0; vertical-align: top; font-size: 16px;">
          ${getChangeIcon(change.type)}
        </td>
        <td style="padding: 8px 0; vertical-align: top; color: #374151; line-height: 1.5;">
          ${change.text}
        </td>
      </tr>
    `
      )
      .join("")}
  </table>
</div>

        <div class="footer">
          <p style="margin-top: 16px;">
  <a href="${process.env.SITE_URL || "http://localhost:3000"}"
     style="color: #3b82f6; text-decoration: none; font-size: 14px; font-weight: 500;">
    📋 Click here to view all KICS release notes
  </a>
</p>
<p style="margin-top: 16px;">
  <a href="${
    process.env.SITE_URL || "http://localhost:3000"
  }/unsubscribe" 
   class="unsubscribe">
    Unsubscribe from these notifications
  </a>
</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function generateEmailText(releaseNote) {
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
    process.env.SITE_URL || "http://localhost:3000"
  }/unsubscribe
  `.trim();
}

function isIndividualEmailError(error) {
  const individualErrorCodes = [
    "RCPT_TO_FAILED",
    "INVALID_RECIPIENT", 
    "USER_NOT_FOUND",
    "MAILBOX_FULL",
    "DOMAIN_NOT_FOUND",
  ];

  const errorString = error.message || error.toString();
  return (
    individualErrorCodes.some((code) => errorString.includes(code)) ||
    errorString.includes("550") ||
    errorString.includes("551") ||
    errorString.includes("552") ||
    errorString.includes("553")
  );
}

async function processEmailBatch(job, releaseNote, transport) {
  // Get emails for this batch
  const [emailRows] = await mysql.execute(
    "SELECT email FROM kics_emails LIMIT ? OFFSET ?",
    [BATCH_SIZE, job.current_batch_start]
  );

  let batchSuccess = 0;
  let batchFailed = 0;
  const failedEmails = [];

  for (const emailRow of emailRows) {
    try {
      const mailOptions = {
        from: `"KICS Release Notes" <announcements@parklanesys.com>`,
        to: emailRow.email,
        subject: `🚀 KICS v${releaseNote.version} Released - ${releaseNote.title}`,
        text: generateEmailText(releaseNote),
        html: generateEmailHTML(releaseNote),
      };

      await transport.sendMail(mailOptions);
      batchSuccess++;

      // 5 second delay between individual emails
      await new Promise((resolve) => setTimeout(resolve, EMAIL_DELAY));
    } catch (error) {
      if (isIndividualEmailError(error)) {
        failedEmails.push({
          email: emailRow.email,
          error: error.message,
        });
        batchFailed++;
      } else {
        // Server/infrastructure error - throw to pause job
        throw error;
      }
    }
  }

  // Update job progress
  const newEmailsSent = job.emails_sent + batchSuccess;
  const newEmailsFailed = job.emails_failed + batchFailed;
  const newBatchStart = job.current_batch_start + BATCH_SIZE;

  const isCompleted = newEmailsSent + newEmailsFailed >= job.total_emails;
  const status = isCompleted ? "completed" : "processing";
  const completedAt = isCompleted ? new Date() : null;

  await mysql.execute(
    `UPDATE kics_email_jobs 
     SET emails_sent = ?, emails_failed = ?, current_batch_start = ?, 
         status = ?, ${isCompleted ? "completed_at = ?" : ""}
     WHERE id = ?`,
    isCompleted
      ? [newEmailsSent, newEmailsFailed, newBatchStart, status, completedAt, job.id]
      : [newEmailsSent, newEmailsFailed, newBatchStart, status, job.id]
  );

  // Create email history record when job is completed
  if (isCompleted) {
    const finalStatus = newEmailsFailed === 0 ? "sent" : newEmailsSent === 0 ? "failed" : "sent";
    const errorMessage = newEmailsFailed > 0 
      ? `${newEmailsFailed} of ${job.total_emails} emails failed to send`
      : null;

    await mysql.execute(
      `INSERT INTO kics_email_notifications 
       (release_note_id, email_count, status, error_message, email_type, sent_at) 
       VALUES (?, ?, ?, ?, 'bulk', NOW())`,
      [job.release_note_id, job.total_emails, finalStatus, errorMessage]
    );

    // Auto-cleanup: Keep only the most recent 100 email history records
    await mysql.execute(
      `DELETE FROM kics_email_notifications 
       WHERE id NOT IN (
         SELECT id FROM (
           SELECT id FROM kics_email_notifications 
           ORDER BY sent_at DESC 
           LIMIT 100
         ) AS recent_records
       )`
    );
  }

  return {
    batchSent: batchSuccess,
    batchFailed: batchFailed,
    isCompleted,
    failedEmails,
  };
}

// Main function to process a complete email job (all batches)
export async function processCompleteEmailJob(jobId) {
  console.log(`Starting complete processing for job ${jobId}`);
  
  try {
    // Get the job details
    const [jobRows] = await mysql.execute(
      `SELECT ej.*, rn.title, rn.version, rn.type as version_type, rn.description, rn.tags, rn.notes as changes, rn.created_at as release_date
       FROM kics_email_jobs ej 
       JOIN kics_release_notes rn ON ej.release_note_id = rn.id 
       WHERE ej.id = ? AND ej.status IN ('pending', 'processing')`,
      [jobId]
    );

    if (jobRows.length === 0) {
      console.log(`No processable job found with ID ${jobId}`);
      return { success: false, message: "Job not found or already completed" };
    }

    const job = jobRows[0];

    // Mark job as processing
    await mysql.execute(
      "UPDATE kics_email_jobs SET status = 'processing', started_at = COALESCE(started_at, NOW()) WHERE id = ?",
      [job.id]
    );

    // Parse JSON fields
    const tags = (() => {
      try {
        return JSON.parse(job.tags || "[]");
      } catch {
        return [];
      }
    })();

    const changes = (() => {
      try {
        return JSON.parse(job.changes || "[]");
      } catch {
        return [];
      }
    })();

    // Structure the release note data
    const releaseNote = {
      id: job.release_note_id,
      version: job.version,
      title: job.title,
      description: job.description || "",
      version_type: job.version_type,
      tags: Array.isArray(tags) ? tags : [],
      changes: Array.isArray(changes) ? changes : [],
      date: job.release_date ? job.release_date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    };

    const transport = createTransport();
    let totalSent = job.emails_sent || 0;
    let totalFailed = job.emails_failed || 0;

    // Process all batches until complete
    while (totalSent + totalFailed < job.total_emails) {
      console.log(`Processing batch starting at ${job.current_batch_start || 0}. Progress: ${totalSent + totalFailed}/${job.total_emails}`);
      
      const result = await processEmailBatch(job, releaseNote, transport);
      
      totalSent += result.batchSent;
      totalFailed += result.batchFailed;

      console.log(`Batch completed: ${result.batchSent} sent, ${result.batchFailed} failed`);

      if (result.isCompleted) {
        console.log(`Job ${jobId} completed! Total: ${totalSent} sent, ${totalFailed} failed`);
        break;
      }

      // Update job object for next iteration
      job.emails_sent = totalSent;
      job.emails_failed = totalFailed;
      job.current_batch_start = (job.current_batch_start || 0) + BATCH_SIZE;

      // Wait between batches (1 minute)
      if (totalSent + totalFailed < job.total_emails) {
        console.log(`Waiting ${BATCH_DELAY/1000} seconds before next batch...`);
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY));
      }
    }

    console.log(`Complete processing finished for job ${jobId}`);
    
    return {
      success: true,
      jobId: jobId,
      totalSent: totalSent,
      totalFailed: totalFailed,
      isCompleted: true
    };

  } catch (error) {
    console.error(`Error in complete job processing for job ${jobId}:`, error);
    
    // Mark job as paused with error
    const retryCount = (job?.retry_count || 0) + 1;
    const retryDelay = Math.min(Math.pow(2, retryCount) * 60000, 30 * 60000);
    const nextRetryAt = new Date(Date.now() + retryDelay);

    await mysql.execute(
      "UPDATE kics_email_jobs SET status = 'paused', retry_count = ?, next_retry_at = ?, error_message = ? WHERE id = ?",
      [retryCount, nextRetryAt, error.message, jobId]
    );

    return {
      success: false,
      jobId: jobId,
      error: error.message,
      retryAt: nextRetryAt
    };
  }
}