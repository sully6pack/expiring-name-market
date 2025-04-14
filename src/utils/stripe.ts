
import { loadStripe } from '@stripe/stripe-js';
import { toast } from "sonner";
import { getCurrentUser } from '@/services/authService';
import { Domain } from '@/types';
import { markDomainAsPurchased } from '@/utils/purchaseUtils';
import { initiateTransfer } from '@/services/transferService';

// Replace with your actual publishable key from the Stripe dashboard
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51OUWHtBhSYxIxTdvDfx7jI1mxRXGlLO7JNB75tEZVWQbszIKKuPdTiA9gZtfCtD2l1paNgW9t8iJsWnV4l23S2JD00mAfN66G1';

// Initialize the Stripe instance once for reuse
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Helper function to format price for Stripe (in cents)
export const formatPriceForStripe = (price: number): number => {
  return Math.round(price * 100);
};

export interface PurchaseResponse {
  success: boolean;
  url?: string;
  error?: string;
  sessionId?: string;
}

// Function to handle domain purchase payments
export const handleDomainPurchase = async (domain: {
  id: string;
  name: string;
  price: number;
  platformFee?: number;
}): Promise<PurchaseResponse> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      toast.error("Please sign in to purchase a domain");
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error("Failed to load Stripe");
    }

    // Default platform fee to $1 if not provided
    const platformFee = domain.platformFee !== undefined ? domain.platformFee : 1;
    const totalAmount = domain.price + platformFee;

    // In a real implementation, this would call your backend API
    // to create a Checkout Session and return the session ID
    // Mock example:
    // const response = await fetch('/api/create-checkout-session', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ 
    //     domainId: domain.id, 
    //     userId: user.id, 
    //     platformFee: platformFee,
    //     domainPrice: domain.price,
    //     totalAmount: totalAmount
    //   }),
    // });
    // const { sessionId } = await response.json();
    // const result = await stripe.redirectToCheckout({ sessionId });
    
    // For demo purposes, we'll redirect to the checkout page
    // which will handle the mock payment flow
    console.log(`Processing purchase for domain: ${domain.name}, Price: ${domain.price}, Platform Fee: ${platformFee}, Total: ${totalAmount}, User: ${user.email}`);
    
    // Simulating successful redirect to checkout
    return {
      success: true,
      url: `/checkout/${domain.id}`,
      sessionId: `demo_session_${Math.random().toString(36).substring(2, 10)}`,
    };
  } catch (error) {
    console.error("Error starting checkout process:", error);
    toast.error("Payment processing failed. Please try again.");
    return {
      success: false,
      error: "Payment processing failed. Please try again.",
    };
  }
};

// Function to handle domain listing payments (for sellers)
export const handleDomainListingPayment = async (listingFee: number): Promise<PurchaseResponse> => {
  try {
    const user = getCurrentUser();
    if (!user) {
      toast.error("Please sign in to list a domain");
      return {
        success: false,
        error: "User not authenticated",
      };
    }

    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error("Failed to load Stripe");
    }
    
    // In production, this would create a checkout session via your backend
    console.log(`Processing listing fee payment: $${listingFee}, User: ${user.email}`);
    
    // For demo, simulate success
    return {
      success: true,
      // In a real app, this would be a URL provided by your backend after creating a session
      url: `/dashboard?listing-payment=success`,
      sessionId: `listing_session_${Math.random().toString(36).substring(2, 10)}`,
    };
  } catch (error) {
    console.error("Error processing listing payment:", error);
    toast.error("Payment processing failed. Please try again.");
    return {
      success: false,
      error: "Payment processing failed. Please try again.",
    };
  }
};

// Function to validate payment after purchase (would connect to backend in production)
export const validatePayment = async (sessionId: string, domainId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // In a real app, this would verify the payment with your backend/Stripe
    console.log(`Validating payment for session: ${sessionId}, Domain: ${domainId}`);
    
    // For demo purposes, we'll simulate a successful validation
    // In production, this would check the payment status with Stripe
    return {
      success: true,
      message: "Payment validated successfully",
    };
  } catch (error) {
    console.error("Error validating payment:", error);
    return {
      success: false,
      message: "Failed to validate payment",
    };
  }
};

// Function to complete a successful purchase transaction
export const completePurchaseTransaction = async (domain: Domain): Promise<boolean> => {
  try {
    // Mark the domain as purchased in local storage
    markDomainAsPurchased(domain.name);
    
    // Initiate the transfer process
    const transfer = await initiateTransfer(domain);
    
    if (!transfer) {
      console.error("Failed to initiate domain transfer");
      return false;
    }
    
    console.log(`Purchase transaction completed for domain: ${domain.name}`);
    return true;
  } catch (error) {
    console.error("Error completing purchase transaction:", error);
    return false;
  }
};

// Export the key for components that need to check it
export const getStripePublishableKey = (): string => STRIPE_PUBLISHABLE_KEY;
