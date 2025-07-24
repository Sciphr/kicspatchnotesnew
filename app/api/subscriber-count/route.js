import mysql from "../../lib/mysql";

export async function GET(request) {
  try {
    const [result] = await mysql.execute(
      "SELECT COUNT(*) as count FROM kics_emails"
    );
    
    const subscriberCount = result[0]?.count || 0;
    
    return Response.json({ 
      success: true, 
      count: subscriberCount 
    });
  } catch (error) {
    console.error("Error fetching subscriber count:", error);
    return Response.json(
      { error: "Failed to fetch subscriber count" },
      { status: 500 }
    );
  }
}