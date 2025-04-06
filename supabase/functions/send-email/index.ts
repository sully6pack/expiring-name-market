
// Follow the Supabase Edge Functions Quickstart guide to setup:
// https://supabase.com/docs/guides/functions/quickstart

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// You'll need to set the following environment variables in your Supabase project
// EMAIL_SERVICE (e.g., 'sendgrid', 'mailgun', etc.)
// EMAIL_API_KEY
// EMAIL_FROM - The sender email address

interface EmailRequest {
  template: string;
  to: string;
  subject?: string;
  templateData?: Record<string, any>;
}

serve(async (req) => {
  try {
    // Create a Supabase client with the Auth context of the logged in user
    const authorization = req.headers.get('Authorization');
    
    if (!authorization) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get the JWT token from the Authorization header
    const token = authorization.replace('Bearer ', '');
    
    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );
    
    // Get the user from the Auth context
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get request body
    const { template, to, subject, templateData } = await req.json() as EmailRequest;
    
    // Check if we have all required fields
    if (!template || !to) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Get email service configuration
    const emailService = Deno.env.get('EMAIL_SERVICE');
    const apiKey = Deno.env.get('EMAIL_API_KEY');
    const fromEmail = Deno.env.get('EMAIL_FROM');
    
    if (!emailService || !apiKey || !fromEmail) {
      return new Response(JSON.stringify({ error: 'Email service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    // Render the email template based on the template name
    const emailContent = renderEmailTemplate(template, templateData || {});
    const emailSubject = subject || getDefaultSubject(template);
    
    // Send the email using the configured service
    let success = false;
    let error;
    
    if (emailService === 'sendgrid') {
      // SendGrid implementation
      const result = await sendWithSendGrid(to, fromEmail, emailSubject, emailContent, apiKey);
      success = result.success;
      error = result.error;
    } else if (emailService === 'mailgun') {
      // Mailgun implementation
      const result = await sendWithMailgun(to, fromEmail, emailSubject, emailContent, apiKey);
      success = result.success;
      error = result.error;
    } else {
      // Default - log to console for development
      console.log(`Email to: ${to}, Subject: ${emailSubject}, Content: ${emailContent}`);
      success = true;
    }
    
    // Record the email in the database for tracking
    if (success) {
      const { error: dbError } = await supabaseClient
        .from('email_logs')
        .insert({
          user_id: user.id,
          recipient: to,
          subject: emailSubject,
          template,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
      
      if (dbError) {
        console.error('Error logging email:', dbError);
      }
    }
    
    // Return the result
    if (success) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({ success: false, error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Helper function to render email templates
function renderEmailTemplate(template: string, data: Record<string, any>): string {
  // In a real implementation, you would use a template engine
  // For simplicity, we're using string replacements
  let content = getTemplateContent(template);
  
  // Replace variables in the template
  Object.entries(data).forEach(([key, value]) => {
    content = content.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
  });
  
  return content;
}

// Get template content
function getTemplateContent(template: string): string {
  switch (template) {
    case 'WELCOME':
      return `
        <h1>Welcome to NotRenewing.com!</h1>
        <p>Hello {{name}},</p>
        <p>Thank you for joining NotRenewing.com. We're excited to have you as a member of our community.</p>
        <p>You can now list domains you're not planning to renew, or browse domains others have listed.</p>
        <p>Best regards,</p>
        <p>The NotRenewing.com Team</p>
      `;
    
    case 'PASSWORD_RESET':
      return `
        <h1>Reset Your Password</h1>
        <p>You requested a password reset for your NotRenewing.com account.</p>
        <p>Click the link below to reset your password:</p>
        <p><a href="{{resetUrl}}">Reset Password</a></p>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>The NotRenewing.com Team</p>
      `;
    
    case 'DOMAIN_VERIFICATION':
      return `
        <h1>Verify Domain Ownership</h1>
        <p>Please complete the verification process for your domain: <strong>{{domainName}}</strong></p>
        <p>Your verification code is: <strong>{{verificationCode}}</strong></p>
        <p>Click the link below to complete verification:</p>
        <p><a href="{{verificationUrl}}">Complete Verification</a></p>
        <p>The NotRenewing.com Team</p>
      `;
    
    case 'DOMAIN_SOLD':
      return `
        <h1>Your Domain Has Been Sold!</h1>
        <p>Great news! Your domain <strong>{{domainName}}</strong> has been sold for <strong>${{amount}}</strong>.</p>
        <p>The buyer is: {{buyerName}}</p>
        <p>We'll process the payment and transfer the funds to your account.</p>
        <p>The NotRenewing.com Team</p>
      `;
    
    case 'DOMAIN_PURCHASED':
      return `
        <h1>Domain Purchase Confirmation</h1>
        <p>Thank you for your purchase of <strong>{{domainName}}</strong> for <strong>${{amount}}</strong>.</p>
        <p>We'll guide you through the transfer process to ensure a smooth transition.</p>
        <p>The NotRenewing.com Team</p>
      `;
    
    case 'VERIFICATION_SUCCESS':
      return `
        <h1>Domain Verification Successful</h1>
        <p>Congratulations! Your domain <strong>{{domainName}}</strong> has been successfully verified.</p>
        <p>Your domain is now listed on our marketplace and available for potential buyers to see.</p>
        <p>The NotRenewing.com Team</p>
      `;
    
    case 'VERIFICATION_FAILURE':
      return `
        <h1>Domain Verification Failed</h1>
        <p>We were unable to verify your domain <strong>{{domainName}}</strong>.</p>
        <p><strong>Reason:</strong> {{reason}}</p>
        <p>Please try again or contact our support team for assistance.</p>
        <p>The NotRenewing.com Team</p>
      `;
    
    default:
      return `
        <h1>NotRenewing.com</h1>
        <p>Thank you for using our service.</p>
        <p>The NotRenewing.com Team</p>
      `;
  }
}

// Get default subject for each template
function getDefaultSubject(template: string): string {
  switch (template) {
    case 'WELCOME':
      return 'Welcome to NotRenewing.com';
    case 'PASSWORD_RESET':
      return 'Reset Your NotRenewing.com Password';
    case 'DOMAIN_VERIFICATION':
      return 'Verify Your Domain Ownership';
    case 'DOMAIN_SOLD':
      return 'Your Domain Has Been Sold!';
    case 'DOMAIN_PURCHASED':
      return 'Your Domain Purchase Confirmation';
    case 'VERIFICATION_SUCCESS':
      return 'Domain Verification Successful';
    case 'VERIFICATION_FAILURE':
      return 'Domain Verification Failed';
    default:
      return 'Notification from NotRenewing.com';
  }
}

// SendGrid implementation
async function sendWithSendGrid(
  to: string,
  from: string,
  subject: string,
  content: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: from },
        subject,
        content: [{ type: 'text/html', value: content }]
      })
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.text();
      return { success: false, error: errorData };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Mailgun implementation
async function sendWithMailgun(
  to: string,
  from: string,
  subject: string,
  content: string,
  apiKey: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Extract domain from API key (this is just an example, you might need to provide it differently)
    const domain = apiKey.split('-')[1];
    
    // Use FormData for Mailgun API
    const formData = new FormData();
    formData.append('from', from);
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('html', content);
    
    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${apiKey}`)}`
      },
      body: formData
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      const errorData = await response.text();
      return { success: false, error: errorData };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
