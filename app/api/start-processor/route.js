export async function POST(request) {
  try {
    // Email processing is now handled server-side by emailWorker.js
    // This endpoint is no longer needed but kept for backward compatibility
    return Response.json({ success: true, message: 'Email processing handled by server worker' });
  } catch (error) {
    console.error('Error in start-processor endpoint:', error);
    return Response.json({ error: 'Email processing handled by server worker' }, { status: 500 });
  }
}