import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type FAQ = {
  id: string;
  question: string;
  answer: string;
  orderNumber: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

// Fetch all active FAQs
export const fetchFAQs = async (): Promise<FAQ[]> => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .select('*')
      .order('order_number', { ascending: true });
    
    if (error) {
      console.error('Error fetching FAQs:', error);
      toast.error("Failed to load FAQs");
      return [];
    }
    
    if (!data) return [];
    
    return data.map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      orderNumber: item.order_number,
      isActive: item.is_active,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at)
    }));
  } catch (error) {
    console.error('Error in fetchFAQs:', error);
    toast.error("Failed to load FAQs");
    return [];
  }
};

// For Admin: Add a new FAQ
export const addFAQ = async (faq: Omit<FAQ, 'id' | 'createdAt' | 'updatedAt'>): Promise<FAQ | null> => {
  try {
    const { data, error } = await supabase
      .from('faqs')
      .insert({
        question: faq.question,
        answer: faq.answer,
        order_number: faq.orderNumber,
        is_active: faq.isActive
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding FAQ:', error);
      toast.error("Failed to add FAQ");
      return null;
    }
    
    toast.success("FAQ added successfully");
    
    if (!data) return null;
    
    return {
      id: data.id,
      question: data.question,
      answer: data.answer,
      orderNumber: data.order_number,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  } catch (error) {
    console.error('Error in addFAQ:', error);
    toast.error("Failed to add FAQ");
    return null;
  }
};

// For Admin: Update an existing FAQ
export const updateFAQ = async (faq: FAQ): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('faqs')
      .update({
        question: faq.question,
        answer: faq.answer,
        order_number: faq.orderNumber,
        is_active: faq.isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', faq.id);
    
    if (error) {
      console.error('Error updating FAQ:', error);
      toast.error("Failed to update FAQ");
      return false;
    }
    
    toast.success("FAQ updated successfully");
    return true;
  } catch (error) {
    console.error('Error in updateFAQ:', error);
    toast.error("Failed to update FAQ");
    return false;
  }
};

// For Admin: Delete a FAQ
export const deleteFAQ = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting FAQ:', error);
      toast.error("Failed to delete FAQ");
      return false;
    }
    
    toast.success("FAQ deleted successfully");
    return true;
  } catch (error) {
    console.error('Error in deleteFAQ:', error);
    toast.error("Failed to delete FAQ");
    return false;
  }
};

// Function to update the specific FAQ about platform fees
export const updatePlatformFeesFAQ = async (): Promise<boolean> => {
  try {
    // First, we need to find the FAQ about platform fees
    const { data: faqs, error: fetchError } = await supabase
      .from('faqs')
      .select('*')
      .eq('question', 'Is there a fee for using the platform?')
      .single();
    
    if (fetchError || !faqs) {
      console.error('Error finding FAQ:', fetchError);
      toast.error("Failed to find FAQ about platform fees");
      return false;
    }

    // Update the answer for this specific FAQ
    const { error } = await supabase
      .from('faqs')
      .update({
        answer: 'We charge $1 to list a domain name to maintain the platform and ensure a secure marketplace experience.',
        updated_at: new Date().toISOString()
      })
      .eq('id', faqs.id);
    
    if (error) {
      console.error('Error updating FAQ:', error);
      toast.error("Failed to update platform fees FAQ");
      return false;
    }
    
    toast.success("Platform fees FAQ updated successfully");
    return true;
  } catch (error) {
    console.error('Error in updatePlatformFeesFAQ:', error);
    toast.error("Failed to update platform fees FAQ");
    return false;
  }
};
