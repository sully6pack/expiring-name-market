
import { supabase } from '@/lib/supabase';

// Type definitions for email templates
export type EmailTemplate = 
  | 'WELCOME'
  | 'PASSWORD_RESET'
  | 'DOMAIN_VERIFICATION'
  | 'DOMAIN_SOLD'
  | 'DOMAIN_PURCHASED'
  | 'VERIFICATION_SUCCESS'
  | 'VERIFICATION_FAILURE';

interface EmailOptions {
  to: string;
  subject?: string;
  templateData?: Record<string, any>;
}

// Send email using Supabase Edge Function
export const sendEmail = async (
  template: EmailTemplate,
  options: EmailOptions
): Promise<boolean> => {
  try {
    // Call the Supabase Edge Function for sending emails
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: {
        template,
        to: options.to,
        subject: options.subject,
        templateData: options.templateData
      }
    });
    
    if (error) {
      console.error('Error sending email:', error);
      return false;
    }
    
    console.log('Email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in sendEmail:', error);
    return false;
  }
};

// Helper functions for specific email types
export const sendWelcomeEmail = async (to: string, name: string): Promise<boolean> => {
  return sendEmail('WELCOME', {
    to,
    subject: 'Welcome to NotRenewing.com',
    templateData: { name }
  });
};

export const sendPasswordResetEmail = async (
  to: string,
  resetUrl: string
): Promise<boolean> => {
  return sendEmail('PASSWORD_RESET', {
    to,
    subject: 'Reset Your NotRenewing.com Password',
    templateData: { resetUrl }
  });
};

export const sendDomainVerificationEmail = async (
  to: string,
  domainName: string,
  verificationCode: string,
  verificationUrl: string
): Promise<boolean> => {
  return sendEmail('DOMAIN_VERIFICATION', {
    to,
    subject: `Verify your ownership of ${domainName}`,
    templateData: {
      domainName,
      verificationCode,
      verificationUrl
    }
  });
};

export const sendDomainSoldEmail = async (
  to: string,
  domainName: string,
  amount: number,
  buyerName: string
): Promise<boolean> => {
  return sendEmail('DOMAIN_SOLD', {
    to,
    subject: `Your domain ${domainName} has been sold!`,
    templateData: {
      domainName,
      amount,
      buyerName
    }
  });
};

export const sendDomainPurchasedEmail = async (
  to: string,
  domainName: string,
  amount: number
): Promise<boolean> => {
  return sendEmail('DOMAIN_PURCHASED', {
    to,
    subject: `Your purchase of ${domainName} is complete`,
    templateData: {
      domainName,
      amount
    }
  });
};

export const sendVerificationSuccessEmail = async (
  userId: string,
  domainName: string
): Promise<boolean> => {
  // Get user email from their ID
  const { data: user, error } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    console.error('Error getting user email for verification success:', error);
    return false;
  }
  
  return sendEmail('VERIFICATION_SUCCESS', {
    to: user.email,
    subject: `Domain ${domainName} has been verified successfully`,
    templateData: {
      domainName
    }
  });
};

export const sendVerificationFailureEmail = async (
  userId: string,
  domainName: string,
  reason: string
): Promise<boolean> => {
  // Get user email from their ID
  const { data: user, error } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single();
  
  if (error || !user) {
    console.error('Error getting user email for verification failure:', error);
    return false;
  }
  
  return sendEmail('VERIFICATION_FAILURE', {
    to: user.email,
    subject: `Domain ${domainName} verification failed`,
    templateData: {
      domainName,
      reason
    }
  });
};
