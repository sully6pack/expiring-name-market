
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FAQAccordion from "@/components/FAQAccordion";

const steps = [
  {
    title: "Find Expiring Domains",
    description: "Browse our extensive collection of domains that are set to expire but won't be renewed by their current owners.",
    icon: "🔍"
  },
  {
    title: "Check Domain Details",
    description: "Review domain information including expiration date, current traffic, SEO metrics, and pricing.",
    icon: "📊"
  },
  {
    title: "Secure Your Purchase",
    description: "Complete your purchase securely through our platform with various payment options.",
    icon: "💳"
  },
  {
    title: "Transfer Process",
    description: "We'll guide you through the domain transfer process to ensure a smooth transition of ownership.",
    icon: "🔄"
  }
];

const sellerSteps = [
  {
    title: "List Your Domain",
    description: "Create a free account and list your domain that you don't plan to renew.",
    icon: "📝"
  },
  {
    title: "Verify Ownership",
    description: "Verify that you own the domain through our simple verification process.",
    icon: "✅"
  },
  {
    title: "Set Your Price",
    description: "Determine how much you want to sell your domain for based on our suggested pricing or your preference.",
    icon: "💰"
  },
  {
    title: "Complete the Sale",
    description: "Once sold, we'll guide you through transferring the domain to the buyer and receiving your payment.",
    icon: "🎉"
  }
];

const HowItWorks = () => {
  const [activeTab, setActiveTab] = useState("buyers");

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-center mb-4">How NotRenewing.com Works</h1>
        <p className="text-xl text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Our platform connects domain buyers with sellers who don't plan to renew their domains, creating a win-win marketplace.
        </p>
        
        <Tabs defaultValue="buyers" className="w-full mb-16" onValueChange={setActiveTab}>
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="buyers">For Buyers</TabsTrigger>
              <TabsTrigger value="sellers">For Sellers</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="buyers" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <Card key={index} className="border-2 border-primary/10 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Benefits For Buyers</h2>
              <ul className="space-y-4 list-disc pl-5">
                <li className="text-gray-800">Access to domains before they expire and become available to the general public</li>
                <li className="text-gray-800">Avoid competing in domain auctions that can drive up prices</li>
                <li className="text-gray-800">Secure established domains with existing SEO value and traffic</li>
                <li className="text-gray-800">Transparent pricing without hidden fees</li>
                <li className="text-gray-800">Secure transaction process with buyer protection</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="sellers" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sellerSteps.map((step, index) => (
                <Card key={index} className="border-2 border-primary/10 hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="text-4xl mb-4">{step.icon}</div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold mb-6">Benefits For Sellers</h2>
              <ul className="space-y-4 list-disc pl-5">
                <li className="text-gray-800">Generate revenue from domains you no longer need or plan to renew</li>
                <li className="text-gray-800">Save on renewal fees for domains you don't want to keep</li>
                <li className="text-gray-800">Access to a marketplace of active domain buyers</li>
                <li className="text-gray-800">Simple listing and verification process</li>
                <li className="text-gray-800">Secure payment handling through our platform</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <FAQAccordion className="max-w-3xl mx-auto" />
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you're looking to buy domains before they expire or sell domains you don't plan to renew, NotRenewing.com is your marketplace.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/domains" className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md font-medium">
              Browse Domains
            </a>
            <a href="/dashboard" className="bg-white hover:bg-gray-100 text-primary border border-primary px-6 py-3 rounded-md font-medium">
              Sell Your Domain
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
