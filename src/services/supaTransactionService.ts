
import { supabase } from '@/lib/supabase';

// Record a domain purchase transaction
export const recordDomainPurchase = async (
  domainId: string,
  buyerId: string,
  sellerId: string,
  amount: number,
  paymentIntentId?: string
): Promise<boolean> => {
  try {
    // Start a transaction by inserting into the transactions table
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        domain_id: domainId,
        buyer_id: buyerId,
        seller_id: sellerId,
        amount,
        status: paymentIntentId ? 'completed' : 'pending',
        payment_intent_id: paymentIntentId,
        created_at: new Date().toISOString(),
        completed_at: paymentIntentId ? new Date().toISOString() : null
      })
      .select()
      .single();
    
    if (transactionError) {
      console.error('Error recording transaction:', transactionError);
      return false;
    }
    
    // Update the domain with the buyer information
    const { error: domainError } = await supabase
      .from('domains')
      .update({
        buyer_id: buyerId,
        purchase_date: new Date().toISOString()
      })
      .eq('id', domainId);
    
    if (domainError) {
      console.error('Error updating domain with buyer info:', domainError);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in recordDomainPurchase:', error);
    return false;
  }
};

// Get transactions for a user (either as buyer or seller)
export const getUserTransactions = async (userId: string): Promise<any[]> => {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        domains:domain_id (name, expiration_date)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserTransactions:', error);
    return [];
  }
};

// Complete a pending transaction
export const completeTransaction = async (
  transactionId: string,
  paymentIntentId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'completed',
        payment_intent_id: paymentIntentId,
        completed_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .eq('status', 'pending');
    
    if (error) {
      console.error('Error completing transaction:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in completeTransaction:', error);
    return false;
  }
};
