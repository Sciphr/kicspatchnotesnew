import mysql from '../../lib/mysql';

export async function POST(request) {
  try {
    const { releaseNoteId } = await request.json();

    if (!releaseNoteId) {
      return Response.json({ error: 'Release note ID is required' }, { status: 400 });
    }

    // Get total email count
    const [emailRows] = await mysql.execute('SELECT COUNT(*) as count FROM kics_emails');
    const totalEmails = emailRows[0].count;

    if (totalEmails === 0) {
      return Response.json({ error: 'No subscribers found' }, { status: 400 });
    }

    // Create the email job
    const [result] = await mysql.execute(
      'INSERT INTO kics_email_jobs (release_note_id, total_emails) VALUES (?, ?)',
      [releaseNoteId, totalEmails]
    );

    // Trigger processing in background immediately (don't await)
    const triggerProcessing = async () => {
      try {
        console.log('Triggering immediate processing for job:', result.insertId);
        const processResponse = await fetch(
          `${process.env.SITE_URL || "http://localhost:3000"}/api/process-email-jobs`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        
        const processResult = await processResponse.json();
        console.log('Immediate processing completed:', processResult);
      } catch (error) {
        console.error('Failed to trigger immediate processing:', error);
        // The background pollers will pick it up
      }
    };

    // Start processing but don't wait for it
    triggerProcessing();

    // Return response immediately
    return Response.json({
      success: true,
      jobId: result.insertId,
      totalEmails: totalEmails,
      message: 'Email job started - processing immediately'
    });

  } catch (error) {
    console.error('Error creating email job:', error);
    return Response.json({ error: 'Failed to create email job' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const jobId = url.searchParams.get('jobId');

    if (jobId) {
      // Get specific job status
      const [jobRows] = await mysql.execute(
        'SELECT * FROM kics_email_jobs WHERE id = ?',
        [jobId]
      );

      if (jobRows.length === 0) {
        return Response.json({ error: 'Job not found' }, { status: 404 });
      }

      return Response.json({ job: jobRows[0] });
    } else {
      // Get all active and recently completed jobs
      const [jobs] = await mysql.execute(
        `SELECT ej.*, rn.title as release_note_title 
         FROM kics_email_jobs ej 
         JOIN kics_release_notes rn ON ej.release_note_id = rn.id 
         WHERE ej.status IN ('pending', 'processing', 'paused') 
         OR (ej.status = 'completed' AND ej.completed_at > DATE_SUB(NOW(), INTERVAL 2 MINUTE))
         ORDER BY ej.created_at DESC`
      );

      return Response.json({ jobs });
    }

  } catch (error) {
    console.error('Error fetching email jobs:', error);
    return Response.json({ error: 'Failed to fetch email jobs' }, { status: 500 });
  }
}