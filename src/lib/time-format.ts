/**
 * Format a date as a relative time string (e.g., "2h ago", "1d ago")
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';

  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return formatAbsoluteDate(dateString);
  }
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
}

/**
 * Format a date as an absolute date (e.g., "Feb 15, 2025")
 */
function formatAbsoluteDate(dateString: string): string {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return dateString; // Return original if parsing fails
  }
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
