
import { useState, useEffect } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchFAQs, FAQ } from "@/services/faqService";
import { useQuery } from "@tanstack/react-query";

interface FAQAccordionProps {
  className?: string;
}

const FAQAccordion = ({ className = "" }: FAQAccordionProps) => {
  const { data: faqs, isLoading, error } = useQuery({
    queryKey: ['faqs'],
    queryFn: fetchFAQs,
  });

  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !faqs) {
    return (
      <div className={`p-4 text-center text-red-500 ${className}`}>
        Failed to load FAQs. Please try again later.
      </div>
    );
  }

  if (faqs.length === 0) {
    return (
      <div className={`p-4 text-center text-gray-500 ${className}`}>
        No FAQs available at the moment.
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className={`w-full ${className}`}>
      {faqs.filter(faq => faq.isActive).map((faq) => (
        <AccordionItem key={faq.id} value={faq.id}>
          <AccordionTrigger className="text-lg font-medium">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-gray-600">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default FAQAccordion;
