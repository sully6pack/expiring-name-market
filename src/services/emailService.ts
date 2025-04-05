
// This is a placeholder email service that will be replaced with a real email service
// when integrated with a backend service like Supabase Edge Functions

export type EmailTemplate = 
  | "DOMAIN_PURCHASE"
  | "DOMAIN_LISTING"
  | "INTERESTED_BUYER"
  | "PASSWORD_RESET"
  | "WELCOME";

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

