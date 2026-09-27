/**
 * Get greeting based on current time of day
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Format a date to relative time (e.g. "2 min ago")
 */
export function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/**
 * Get CSS class for status badge
 */
export function statusClass(status) {
  const map = {
    'New': 'status-new',
    'Accepted': 'status-accepted',
    'In Progress': 'status-in-progress',
    'Ready': 'status-ready',
    'Completed': 'status-completed',
    'Rejected': 'status-rejected',
    'Cancelled': 'status-cancelled',
    'Available': 'status-available',
    'Occupied': 'status-occupied',
    'Cleaning': 'status-cleaning',
    'Maintenance': 'status-maintenance',
    'Out of Service': 'status-oos',
    'Unavailable': 'status-cancelled',
  };
  return map[status] || 'status-new';
}

/**
 * Generate a request ID
 */
export function generateId(prefix = 'JR') {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Format price in INR
 */
export function formatPrice(amount) {
  return `₹ ${Number(amount).toLocaleString('en-IN')}`;
}

/**
 * Truncate string
 */
export function truncate(str, len = 40) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
}
