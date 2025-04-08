
// Export domain verification related functions
export { fetchDomainExpirationDate, getWhoisEmail } from './verificationUtils';

// Export simplified verification helpers
export const generateVerificationCode = (): string => {
  return `verify-${Math.random().toString(36).substring(2, 8)}`;
};

// Simple function to check domain verification
export const verifyDomain = async (domain: string): Promise<boolean> => {
  try {
    // Using the WhoisXML API to check if domain exists
    const expirationDate = await fetchDomainExpirationDate(domain);
    return expirationDate !== null;
  } catch (error) {
    console.error("Error verifying domain:", error);
    return false;
  }
};
