import { startEmailProcessor } from '../../lib/emailProcessor';

export async function POST(request) {
  try {
    startEmailProcessor();
    return Response.json({ success: true, message: 'Email processor started' });
  } catch (error) {
    console.error('Error starting email processor:', error);
    return Response.json({ error: 'Failed to start email processor' }, { status: 500 });
  }
}