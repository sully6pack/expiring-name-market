
// This is a placeholder email service that will be replaced with a real email service
// when integrated with a backend service like Supabase Edge Functions

export type EmailTemplate = 
  | "DOMAIN_PURCHASE"
  | "DOMAIN_LISTING"
  | "INTERESTED_BUYER"
  | "PASSWORD_RESET"
  | "WELCOME"
  | "DOMAIN_VERIFICATION"
  | "VERIFICATION_SUCCESS"
  | "VERIFICATION_FAILURE";

export interface EmailData {
  to: string;
  subject?: string;
  templateData?: Record<string, any>;
}

// This function would be replaced with a real email sending function in production
export const sendEmail = async (
  template: EmailTemplate,
  data: EmailData
): Promise<boolean> => {
  // In production, this would call a Supabase Edge Function to send the email
  console.log(`[EMAIL SERVICE] Sending email template: ${template}`, data);
  
  // For development, we'll simulate success
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[EMAIL SERVICE] Email sent successfully to ${data.to}`);
      resolve(true);
    }, 1000);
  });
};

// Helper functions for specific email types
export const sendPurchaseConfirmationEmail = async (
  email: string,
  domainName: string,
  price: number
): Promise<boolean> => {
  return sendEmail("DOMAIN_PURCHASE", {
    to: email,
    templateData: {
      domainName,
      price,
      purchaseDate: new Date().toISOString(),
    },
  });
};

export const sendListingConfirmationEmail = async (
  email: string,
  domainName: string
): Promise<boolean> => {
  return sendEmail("DOMAIN_LISTING", {
    to: email,
    templateData: {
      domainName,
      listingDate: new Date().toISOString(),
    },
  });
};

export const sendInterestedBuyerNotification = async (
  sellerEmail: string,
  buyerEmail: string,
  domainName: string
): Promise<boolean> => {
  return sendEmail("INTERESTED_BUYER", {
    to: sellerEmail,
    templateData: {
      buyerEmail,
      domainName,
      interestDate: new Date().toISOString(),
    },
  });
};

export const sendDomainVerificationEmail = async (
  email: string,
  domainName: string,
  verificationCode: string,
  verificationUrl: string
): Promise<boolean> => {
  return sendEmail("DOMAIN_VERIFICATION", {
    to: email,
    subject: `Verify your ownership of ${domainName}`,
    templateData: {
      domainName,
      verificationCode,
      verificationUrl,
    },
  });
};

export const sendVerificationSuccessEmail = async (
  email: string,
  domainName: string
): Promise<boolean> => {
  return sendEmail("VERIFICATION_SUCCESS", {
    to: email,
    subject: `Domain verification successful: ${domainName}`,
    templateData: {
      domainName,
      verificationDate: new Date().toISOString(),
    },
  });
};

export const sendVerificationFailureEmail = async (
  email: string,
  domainName: string,
  reason: string
): Promise<boolean> => {
  return sendEmail("VERIFICATION_FAILURE", {
    to: email,
    subject: `Domain verification failed: ${domainName}`,
    templateData: {
      domainName,
      reason,
      supportEmail: "support@example.com",
    },
  });
};
