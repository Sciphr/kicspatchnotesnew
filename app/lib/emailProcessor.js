let processingInterval = null;
let isProcessing = false;

export function startEmailProcessor() {
  if (processingInterval) {
    return; // Already running
  }

  console.log('Starting email processor...');
  
  processingInterval = setInterval(async () => {
    if (isProcessing) {
      return; // Skip if already processing
    }

    try {
      isProcessing = true;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/process-email-jobs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success) {
        if (result.jobId) {
          console.log(`Processed batch for job ${result.jobId}: ${result.batchSent} sent, ${result.batchFailed} failed`);
          if (result.isCompleted) {
            console.log(`Job ${result.jobId} completed!`);
          }
        }
      } else if (result.message === 'No jobs to process') {
        // Stop processor when no jobs are available
        stopEmailProcessor();
        console.log('No email jobs to process - processor stopped');
      } else if (result.error) {
        console.error('Email processor error:', result.error);
      }

    } catch (error) {
      console.error('Email processor fetch error:', error);
    } finally {
      isProcessing = false;
    }
  }, 5000); // Check every 5 seconds
}

export function stopEmailProcessor() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    isProcessing = false;
    console.log('Email processor stopped');
  }
}