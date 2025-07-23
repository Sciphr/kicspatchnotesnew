# KICS Release Notes Application

This is a [Next.js](https://nextjs.org) project for managing and sending release note emails.

## Email Processing

This application now uses **server-side email processing** instead of browser-based processing.

### How to run:

1. **Start the main application:**
   ```bash
   npm run start
   ```

2. **Start the email worker (in a separate terminal):**
   ```bash
   npm run email-worker
   ```

### How it works:

- When you create an email job through the web interface, it's saved to the database
- The `emailWorker.js` process runs continuously and automatically processes jobs
- **Active mode:** Checks for jobs every 5 seconds when jobs exist
- **Idle mode:** Checks every 30 seconds when no jobs (saves resources)
- Automatically switches between modes as needed
- Jobs continue processing even if you close your browser or refresh the page
- The worker handles batching (15 emails per batch with 4-second delays)
- Jobs survive server restarts (you just need to restart the worker)

### Benefits:

- ✅ Browser-independent processing
- ✅ Jobs survive page refreshes
- ✅ Reliable background processing  
- ✅ Easy to monitor via worker logs
- ✅ Graceful shutdown with Ctrl+C

### Production deployment:

For production, you should run the email worker as a service using:
- **Windows:** Windows Service or Task Scheduler
- **Linux:** systemd service or PM2
- **Docker:** Separate container for the worker

## Development

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
