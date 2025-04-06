
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";

const Terms = () => {
  return (
    <PageLayout 
      title="Terms of Service" 
      description="Please read these terms carefully before using our service."
    >
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="prose prose-blue max-w-none">
            <p className="text-sm text-gray-500 mb-6">Last updated: April 6, 2025</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p>
                Welcome to NotRenewing.com. These Terms of Service ("Terms") govern your use of our website and services.
                By accessing or using NotRenewing.com, you agree to be bound by these Terms. If you disagree with any part of the terms, 
                you may not access the website or use our services.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Definitions</h2>
              <p><strong>"Service"</strong> refers to the NotRenewing.com website operated by NotRenewing Inc.</p>
              <p><strong>"User"</strong> refers to individuals who register for and use our Service.</p>
              <p><strong>"Seller"</strong> refers to Users who list domains for sale on our Service.</p>
              <p><strong>"Buyer"</strong> refers to Users who purchase domains through our Service.</p>
              <p><strong>"Domain"</strong> refers to internet domain names listed on our Service.</p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
              <p>
                To use certain features of the Service, you must register for an account. You agree to provide accurate, 
                current, and complete information during the registration process and to update such information to keep it 
                accurate, current, and complete.
              </p>
              <p>
                You are responsible for safeguarding the password you use to access the Service and for any activities or 
                actions under your password. You agree not to disclose your password to any third party. You must notify us 
                immediately upon becoming aware of any breach of security or unauthorized use of your account.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Domain Listings</h2>
              <p>
                Sellers may list domains that they legally own and have the right to sell. By listing a domain, Sellers 
                represent and warrant that they have the legal right to sell the domain and that the domain does not infringe 
                upon any third party's intellectual property rights.
              </p>
              <p>
                NotRenewing.com reserves the right to remove any domain listing at its sole discretion, particularly if the 
                domain is suspected to be illegal, fraudulent, or otherwise in violation of these Terms.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Domain Purchases</h2>
              <p>
                When a Buyer purchases a domain, they agree to complete the transaction as described in the listing. The Buyer 
                agrees to pay the full purchase price and any additional fees that may apply.
              </p>
              <p>
                NotRenewing.com facilitates the transaction between Buyers and Sellers but does not guarantee the quality, 
                safety, or legality of the domains listed on the Service. Buyers are responsible for conducting due diligence 
                before purchasing a domain.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Fees and Payments</h2>
              <p>
                NotRenewing.com charges fees for using certain features of the Service. These fees are described on the website 
                and may be updated from time to time. You agree to pay all fees associated with your use of the Service.
              </p>
              <p>
                Payments are processed through third-party payment processors. By using the Service, you agree to be bound by 
                the terms of service of these payment processors.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, NotRenewing Inc. shall not be liable for any indirect, incidental, 
                special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. If we make changes, we will provide notice of such changes, 
                such as by sending an email notification, providing notice through the Service, or updating the "Last Updated" date 
                at the beginning of these Terms. Your continued use of the Service following the posting of updated Terms means that 
                you accept and agree to the changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at:
              </p>
              <p>
                NotRenewing Inc.<br />
                Email: legal@notrenewing.com<br />
                Address: 123 Domain Street, San Francisco, CA 94107
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Terms;
