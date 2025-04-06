
import emailjs from 'emailjs-com';
import { toast } from "sonner";

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

// EmailJS configuration
const EMAILJS_SERVICE_ID = "service_notrenewing"; // Replace with your actual service ID
const EMAILJS_USER_ID = "user_your_user_id"; // Replace with your actual user ID

// Map our internal templates to EmailJS template IDs
const templateIdMap: Record<EmailTemplate, string> = {
  DOMAIN_PURCHASE: "template_purchase",
  DOMAIN_LISTING: "template_listing",
  INTERESTED_BUYER: "template_buyer",
  PASSWORD_RESET: "template_reset",
  WELCOME: "template_welcome",
  DOMAIN_VERIFICATION: "template_verification",
  VERIFICATION_SUCCESS: "template_ver_success",
  VERIFICATION_FAILURE: "template_ver_failure"
};

export const sendEmail = async (
  template: EmailTemplate,
  data: EmailData
): Promise<boolean> => {
  try {
    console.log(`[EMAIL SERVICE] Sending email template: ${template}`, data);
    
    // For development, default to using the EmailJS service if available
    const emailjsTemplateId = templateIdMap[template];
    
    // Prepare the email content
    const emailContent = {
      to_email: data.to,
      to_name: data.to.split('@')[0], // Simple name extraction
      subject: data.subject || getDefaultSubject(template),
      ...data.templateData
    };
    
    // In production environment, send the actual email
    if (import.meta.env.PROD) {
      try {
        const result = await emailjs.send(
          EMAILJS_SERVICE_ID,
          emailjsTemplateId,
          emailContent,
          EMAILJS_USER_ID
        );
        
        console.log(`[EMAIL SERVICE] Email sent successfully to ${data.to}`, result);
        return true;
      } catch (error) {
        console.error('[EMAIL SERVICE] Error sending email:', error);
        toast.error("Failed to send email. Please try again later.");
        return false;
      }
    }
    
    // For development, simulate success and log the email details
    console.log(`[EMAIL SERVICE] 📧 Development mode: Email would be sent with:`, {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: emailjsTemplateId,
      content: emailContent,
      userId: EMAILJS_USER_ID
    });
    
    // Show toast in development for visibility
    toast.success(`Email would be sent to ${data.to} (${template})`);
    
    return true;
  } catch (error) {
    console.error('[EMAIL SERVICE] Error in email service:', error);
    return false;
  }
};

// Get default subject line based on template
const getDefaultSubject = (template: EmailTemplate): string => {
  switch (template) {
    case "DOMAIN_PURCHASE":
      return "Your Domain Purchase Confirmation";
    case "DOMAIN_LISTING":
      return "Your Domain Has Been Listed Successfully";
    case "INTERESTED_BUYER":
      return "Someone Is Interested In Your Domain";
    case "PASSWORD_RESET":
      return "Reset Your NotRenewing.com Password";
    case "WELCOME":
      return "Welcome to NotRenewing.com";
    case "DOMAIN_VERIFICATION":
      return "Verify Your Domain Ownership";
    case "VERIFICATION_SUCCESS":
      return "Domain Verification Successful";
    case "VERIFICATION_FAILURE":
      return "Domain Verification Failed";
    default:
      return "Notification from NotRenewing.com";
  }
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
      supportEmail: "support@notrenewing.com",
    },
  });
};
