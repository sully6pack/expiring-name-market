
import { loadStripe } from '@stripe/stripe-js';

// Replace with your actual publishable key from the Stripe dashboard
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51OUWHtBhSYxIxTdvDfx7jI1mxRXGlLO7JNB75tEZVWQbszIKKuPdTiA9gZtfCtD2l1paNgW9t8iJsWnV4l23S2JD00mAfN66G1';

// Initialize the Stripe instance once for reuse
export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

// Helper function to format price for Stripe (in cents)
export const formatPriceForStripe = (price: number): number => {
  return Math.round(price * 100);
};
