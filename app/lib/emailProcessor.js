let isProcessing = false;
let transferActive = false;

export async function processEmailJobs() {
  if (isProcessing || transferActive) {
    console.log("Skipping poll - processor busy or transfer active");
    return;
  }

  try {
    isProcessing = true;

    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/api/process-email-jobs`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    if (result.success) {
      if (result.jobId) {
        transferActive = true; // Set flag when job starts
        console.log(
          `Processing job ${result.jobId}: ${result.batchSent} sent, ${result.batchFailed} failed`
        );
        if (result.isCompleted) {
          console.log(`Job ${result.jobId} completed!`);
          transferActive = false; // Clear flag when job completes
        }
      }
    } else if (result.message === "No jobs to process") {
      console.log("No email jobs to process");
      transferActive = false; // Ensure flag is cleared
    } else if (result.error) {
      console.error("Email processor error:", result.error);
      transferActive = false; // Clear flag on error
    }
  } catch (error) {
    console.error("Email processor fetch error:", error);
    transferActive = false; // Clear flag on error
  } finally {
    isProcessing = false;
  }
}

// Removed automatic polling - processEmailJobs() is now called manually when needed
