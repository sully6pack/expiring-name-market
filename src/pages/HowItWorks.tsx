
import React from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { 
  Check, 
  ArrowRight, 
  User, 
  Search, 
  DollarSign, 
  Shield, 
  Mail, 
  Clock 
} from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-brand-blue to-blue-600 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">How NotRenewing.com Works</h1>
            <p className="text-xl max-w-3xl mx-auto">
              The simple, straightforward marketplace for soon-to-expire domain names.
              No auctions, no bidding wars - just fixed prices and straightforward transactions.
            </p>
          </div>
        </section>
        
        {/* Process Overview */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Our Simple Process</h2>
            
            <div className="grid gap-8 lg:grid-cols-3">
              <Card className="border-t-4 border-t-brand-blue">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-brand-blue rounded-full p-3 text-white">
                      <User size={24} />
                    </div>
                    <h3 className="text-xl font-semibold">1. Create an Account</h3>
                  </div>
                  <p className="text-gray-600">
                    Register for free with your email address. Verify your account to
                    start listing domains or expressing interest in purchases.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-brand-blue">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-brand-blue rounded-full p-3 text-white">
                      <Search size={24} />
                    </div>
                    <h3 className="text-xl font-semibold">2. List or Browse</h3>
                  </div>
                  <p className="text-gray-600">
                    List your soon-to-expire domain or browse our marketplace of 
                    available domains. Every domain is priced at a flat $99.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border-t-4 border-t-brand-blue">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-brand-blue rounded-full p-3 text-white">
                      <DollarSign size={24} />
                    </div>
                    <h3 className="text-xl font-semibold">3. Complete Transaction</h3>
                  </div>
                  <p className="text-gray-600">
                    Make secure payments through our platform and finalize domain transfers.
                    We guide you through every step of the process.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* For Domain Sellers */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">For Domain Sellers</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">List Your Domain</h3>
                    <p className="text-gray-600">
                      Have a domain that's nearing its expiration date? List it on our platform
                      in minutes. Simply create an account, provide domain details, and verify
                      ownership through our simple verification process.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Domain Verification</h3>
                    <p className="text-gray-600">
                      We verify all domains to ensure legitimacy. Choose from DNS record 
                      verification or file upload methods to prove you control the domain.
                      This protects both sellers and buyers.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Find a Buyer</h3>
                    <p className="text-gray-600">
                      Once your domain is listed, interested buyers will express interest.
                      You'll receive notifications when someone is interested in your domain,
                      and you can communicate directly through our messaging system.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Fixed Price Sale</h3>
                    <p className="text-gray-600">
                      No haggling or bidding wars. Every domain sells for a fixed price of $99.
                      This simplifies the process and ensures transparency for all parties.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <Link to="/dashboard">
                  <Button className="gap-2">
                    List Your Domain <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* For Domain Buyers */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">For Domain Buyers</h2>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Browse Domains</h3>
                    <p className="text-gray-600">
                      Explore our marketplace of soon-to-expire domains. Use our search 
                      and filter tools to find the perfect domain for your project.
                      All domains are verified and available at a fixed price.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Express Interest</h3>
                    <p className="text-gray-600">
                      Found a domain you like? Express your interest with a click. 
                      The seller will be notified, and you can begin communication 
                      to finalize the purchase.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Secure Payment</h3>
                    <p className="text-gray-600">
                      When you're ready to purchase, make a secure payment through our platform.
                      Your payment is held in escrow until the domain transfer is complete,
                      ensuring a safe transaction for both parties.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex-shrink-0 bg-blue-100 rounded-full p-2">
                    <Check className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Domain Transfer</h3>
                    <p className="text-gray-600">
                      We guide you through the domain transfer process, ensuring a smooth
                      transition of ownership. Our step-by-step instructions make it easy,
                      even for first-time buyers.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-10 text-center">
                <Link to="/domains">
                  <Button className="gap-2">
                    Browse Domains <ArrowRight size={16} />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Why Choose NotRenewing.com</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto bg-brand-blue text-white w-14 h-14 rounded-full flex items-center justify-center mb-4">
                    <Shield size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Secure Transactions</h3>
                  <p className="text-gray-600">
                    Every transaction is protected with our secure payment processing
                    and escrow system, ensuring both parties are protected.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto bg-brand-blue text-white w-14 h-14 rounded-full flex items-center justify-center mb-4">
                    <DollarSign size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Fixed Pricing</h3>
                  <p className="text-gray-600">
                    No bidding wars or hidden fees. Every domain on our platform is
                    available for a transparent, fixed price of $99.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto bg-brand-blue text-white w-14 h-14 rounded-full flex items-center justify-center mb-4">
                    <Mail size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Direct Communication</h3>
                  <p className="text-gray-600">
                    Our platform facilitates direct communication between buyers and sellers,
                    streamlining the negotiation and transfer process.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto bg-brand-blue text-white w-14 h-14 rounded-full flex items-center justify-center mb-4">
                    <Clock size={28} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">Quick Process</h3>
                  <p className="text-gray-600">
                    List or purchase domains quickly with our streamlined process.
                    No lengthy waiting periods or complicated procedures.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        {/* FAQs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-left">
                    How does the fixed pricing model work?
                  </AccordionTrigger>
                  <AccordionContent>
                    Every domain on NotRenewing.com is priced at $99, regardless of its perceived market value. 
                    This creates a level playing field and removes the stress of bidding wars and negotiations. 
                    Sellers benefit from a quick, guaranteed sale, while buyers enjoy transparent pricing.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-left">
                    How do I verify domain ownership?
                  </AccordionTrigger>
                  <AccordionContent>
                    After listing your domain, you'll need to verify ownership. We offer two methods:
                    DNS verification (adding a specific TXT record) or file upload verification 
                    (uploading a provided file to your domain). Both methods prove you have 
                    administrative control over the domain.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-left">
                    How is the domain transfer handled?
                  </AccordionTrigger>
                  <AccordionContent>
                    Once a buyer expresses interest and payment is made, we provide both parties with 
                    step-by-step instructions for transferring the domain. This typically involves the 
                    seller providing an authorization code (EPP code) to the buyer, who then initiates 
                    the transfer through their chosen registrar. We monitor the process and only release 
                    funds to the seller once the transfer is complete.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-left">
                    What happens if a domain transfer fails?
                  </AccordionTrigger>
                  <AccordionContent>
                    If a domain transfer cannot be completed for any reason, the buyer's payment is 
                    refunded in full. Our support team is available to help troubleshoot any issues 
                    that arise during the transfer process, ensuring a smooth experience for both parties.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-left">
                    Can I list multiple domains at once?
                  </AccordionTrigger>
                  <AccordionContent>
                    Yes, you can list as many domains as you own. Each domain will need to go through 
                    the verification process individually to ensure ownership. Your seller dashboard 
                    provides an overview of all your listed domains and their current status.
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-left">
                    How long does the entire process take?
                  </AccordionTrigger>
                  <AccordionContent>
                    The timeline varies depending on buyer interest and the speed of the domain transfer. 
                    Typically, once a buyer expresses interest, the entire process from payment to completed 
                    transfer can take 3-7 days. Domain verification for sellers usually takes 24-48 hours.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
            
            <div className="mt-12 text-center">
              <p className="mb-4 text-lg">Still have questions?</p>
              <Link to="/contact">
                <Button variant="outline">Contact Our Support Team</Button>
              </Link>
            </div>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-brand-blue to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-xl max-w-2xl mx-auto mb-8">
              Whether you're looking to sell a soon-to-expire domain or find the perfect domain for your project,
              NotRenewing.com makes the process simple and transparent.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/domains">
                <Button size="lg" variant="white" className="hover:bg-gray-100">
                  Browse Domains
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-brand-blue">
                  List Your Domain
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div className="mb-8 md:mb-0">
              <h2 className="text-2xl font-bold mb-4">NotRenewing.com</h2>
              <p className="max-w-md">
                The marketplace for soon-to-expire domain names.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="hover:underline">Home</Link></li>
                  <li><Link to="/domains" className="hover:underline">Browse Domains</Link></li>
                  <li><Link to="/dashboard" className="hover:underline">My Account</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li><Link to="/how-it-works" className="hover:underline">How It Works</Link></li>
                  <li><Link to="/faq" className="hover:underline">FAQ</Link></li>
                  <li><Link to="/contact" className="hover:underline">Contact Us</Link></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link to="/terms" className="hover:underline">Terms of Service</Link></li>
                  <li><Link to="/privacy" className="hover:underline">Privacy Policy</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} NotRenewing.com. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HowItWorks;
