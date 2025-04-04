
/**
 * Validates if a domain should be displayed based on its expiration date
 * Rules:
 * 1. Must be within 90 days of expiring (to display)
 * 2. Must not have passed expiration date + 15 days
 */
export function isDomainValid(expirationDate: Date): boolean {
  const now = new Date();
  const ninetyDaysInMs = 90 * 24 * 60 * 60 * 1000;
  const fifteenDaysInMs = 15 * 24 * 60 * 60 * 1000;
  
  // Check if expiration is within 90 days (future)
  const isWithinNinetyDays = expirationDate.getTime() - now.getTime() <= ninetyDaysInMs;
  
  // Check if expiration + 15 days is not in the past
  const fifteenDaysAfterExpiration = new Date(expirationDate.getTime() + fifteenDaysInMs);
  const isNotTooLate = fifteenDaysAfterExpiration.getTime() >= now.getTime();
  
  return isWithinNinetyDays && isNotTooLate;
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
