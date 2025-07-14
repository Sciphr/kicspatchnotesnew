// Helper functions used across components

export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const getMonthYear = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
};

export const getUniqueMonths = (notes) => {
  const months = notes.map((note) => getMonthYear(note.date));
  return [...new Set(months)].sort((a, b) => new Date(b) - new Date(a));
};

export const getVersionBadgeColor = (type) => {
  switch (type) {
    case "major":
      return "bg-red-100 text-red-800 border-red-200";
    case "minor":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "patch":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

// Configuration for admin access
export const ADMIN_IP_RANGES = [
  "192.168.1.0/24", // Local network
  "10.0.0.0/8", // Private network
  "172.16.0.0/12", // Private network
  "203.0.113.0/24", // Example VPN range - replace with your actual VPN IP range
];

// Function to check if IP is in admin range
export const isAdminIP = async () => {
  try {
    // In a real application, you'd get the actual client IP
    // For demo purposes, we'll simulate admin access
    // You can replace this with actual IP checking logic

    // Simulate getting client IP (in production, use a service or server-side logic)
    const response = await fetch("https://api.ipify.org?format=json");
    const data = await response.json();
    const clientIP = data.ip;

    // For demo purposes, always return true
    // In production, implement proper IP range checking
    return true; // Replace with actual IP range validation
  } catch (error) {
    console.error("Error checking IP:", error);
    return false;
  }
};
