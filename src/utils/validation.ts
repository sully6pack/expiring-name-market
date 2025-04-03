
/**
 * Validates if a domain should be displayed based on its expiration date
 * Rules:
 * 1. Must be within 30 days of expiring (to display)
 * 2. Must not have passed expiration date + 30 days
 */
export function isDomainValid(expirationDate: Date): boolean {
  const now = new Date();
  const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
  
  // Check if expiration is within 30 days (future)
  const isWithinThirtyDays = expirationDate.getTime() - now.getTime() <= thirtyDaysInMs;
  
  // Check if expiration + 30 days is not in the past
  const thirtyDaysAfterExpiration = new Date(expirationDate.getTime() + thirtyDaysInMs);
  const isNotTooLate = thirtyDaysAfterExpiration.getTime() >= now.getTime();
  
  return isWithinThirtyDays && isNotTooLate;
}

/**
 * Formats a date to a friendly string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }).format(date);
}

/**
 * Returns days until expiration as a string
 */
export function getDaysUntilExpiration(expirationDate: Date): string {
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Expired ${Math.abs(diffDays)} days ago`;
  }
  
  return diffDays === 0 ? 'Expires today' : `Expires in ${diffDays} days`;
}
