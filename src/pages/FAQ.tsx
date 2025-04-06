
import { useState } from "react";
import PageLayout from "@/components/PageLayout";
import FAQAccordion from "@/components/FAQAccordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const FAQ = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <PageLayout 
      title="Frequently Asked Questions" 
      description="Find answers to common questions about NotRenewing.com."
    >
      <div className="max-w-3xl mx-auto w-full">
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <FAQAccordion className="mb-12" />

        <div className="text-center bg-white p-8 rounded-lg shadow-sm">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-gray-600 mb-6">
            Our team is here to help. Contact us if you couldn't find the answer you were looking for.
          </p>
          <Button asChild>
            <a href="/contact">Contact Support</a>
          </Button>
        </div>
      </div>
    </PageLayout>
  );
};

export default FAQ;
