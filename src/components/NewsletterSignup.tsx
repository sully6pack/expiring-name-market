
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail } from 'lucide-react';

const NewsletterSignup = () => {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!firstName.trim() || !email.trim()) {
      toast.error('Please enter both your name and email');
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          first_name: firstName.trim(),
          email: email.trim().toLowerCase(),
          source: 'website'
        });

      if (error) {
        if (error.code === '23505') {
          // Unique constraint violation (email already exists)
          toast.error('This email is already subscribed to our newsletter');
        } else {
          throw error;
        }
      } else {
        toast.success('Successfully subscribed to our newsletter!');
        // Clear form after successful submission
        setFirstName('');
        setEmail('');
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Mail className="mr-2 text-brand-blue" />
            Get the Hottest Domain Picks
          </h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter and get exclusive insights on expiring domains directly in your inbox.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : 'Subscribe to Newsletter'}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;
