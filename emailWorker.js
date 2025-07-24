// Server-side email processor worker
// Run this with: node emailWorker.js

let processingInterval = null;
let isProcessing = false;
let isIdle = false;
let currentInterval = 5000; // Start checking every 5 seconds

const ACTIVE_INTERVAL = 5000; // 5 seconds when jobs exist
const IDLE_INTERVAL = 30000; // 30 seconds when no jobs

function startEmailProcessor() {
  if (processingInterval) {
    return; // Already running
  }

  console.log("Starting server-side email processor (continuous mode)...");

  processingInterval = setInterval(async () => {
    if (isProcessing) {
      return; // Skip if already processing
    }

    try {
      isProcessing = true;

      const response = await fetch(
        `${
          process.env.SITE_URL || "http://localhost:3000"
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
          console.log(
            `Processed batch for job ${result.jobId}: ${result.batchSent} sent, ${result.batchFailed} failed`
          );
          if (result.isCompleted) {
            console.log(`Job ${result.jobId} completed!`);
          }
          // Switch to active mode if we were idle
          if (isIdle) {
            switchToActiveMode();
          }
        }
      } else if (result.message === "No jobs to process") {
        // Switch to idle mode - keep running but check less frequently
        if (!isIdle) {
          switchToIdleMode();
        }
      } else if (result.error) {
        console.error("Email processor error:", result.error);
      }
    } catch (error) {
      console.error("Email processor fetch error:", error);
    } finally {
      isProcessing = false;
    }
  }, currentInterval);
}

function switchToIdleMode() {
  console.log(
    "No jobs found - switching to idle mode (checking every 30 seconds)"
  );
  isIdle = true;
  currentInterval = IDLE_INTERVAL;
  restartInterval();
}

function switchToActiveMode() {
  console.log(
    "Jobs detected - switching to active mode (checking every 5 seconds)"
  );
  isIdle = false;
  currentInterval = ACTIVE_INTERVAL;
  restartInterval();
}

function restartInterval() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = setInterval(async () => {
      if (isProcessing) {
        return;
      }

      try {
        isProcessing = true;

        const response = await fetch(
          `${
            process.env.SITE_URL || "http://localhost:3000"
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
            console.log(
              `Processed batch for job ${result.jobId}: ${result.batchSent} sent, ${result.batchFailed} failed`
            );
            if (result.isCompleted) {
              console.log(`Job ${result.jobId} completed!`);
            }
            if (isIdle) {
              switchToActiveMode();
            }
          }
        } else if (result.message === "No jobs to process") {
          if (!isIdle) {
            switchToIdleMode();
          }
        } else if (result.error) {
          console.error("Email processor error:", result.error);
        }
      } catch (error) {
        console.error("Email processor fetch error:", error);
      } finally {
        isProcessing = false;
      }
    }, currentInterval);
  }
}

function stopEmailProcessor() {
  if (processingInterval) {
    clearInterval(processingInterval);
    processingInterval = null;
    isProcessing = false;
    console.log("Email processor stopped");
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\nReceived SIGINT. Graceful shutdown...");
  stopEmailProcessor();
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\nReceived SIGTERM. Graceful shutdown...");
  stopEmailProcessor();
  process.exit(0);
});

// Start the processor
startEmailProcessor();

console.log("Email worker started. Press Ctrl+C to stop.");
