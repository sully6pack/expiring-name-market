
import PageLayout from "@/components/PageLayout";
import { Card, CardContent } from "@/components/ui/card";

const Privacy = () => {
  return (
    <PageLayout 
      title="Privacy Policy" 
      description="This Privacy Policy describes how we collect, use, and share your information."
    >
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="prose prose-blue max-w-none">
            <p className="text-sm text-gray-500 mb-6">Last updated: April 6, 2025</p>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
              <p>
                At NotRenewing.com, we respect your privacy and are committed to protecting it through our compliance with this policy.
                This Privacy Policy describes the types of information we may collect from you or that you may provide when you visit 
                NotRenewing.com and our practices for collecting, using, maintaining, protecting, and disclosing that information.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
              <p>We collect several types of information from and about users of our website, including:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li><strong>Personal Information:</strong> This includes information by which you may be personally identified, such as name, postal address, email address, telephone number, or any other identifier by which you may be contacted online or offline.</li>
                <li><strong>Payment Information:</strong> When you make a purchase, we collect payment information necessary to process the transaction.</li>
                <li><strong>Domain Information:</strong> If you list a domain for sale, we collect information about that domain.</li>
                <li><strong>Usage Information:</strong> We collect information about your use of our website, including the pages you visit, the time and date of your visit, and the time spent on each page.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. How We Use Your Information</h2>
              <p>We use information that we collect about you or that you provide to us, including any personal information:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>To present our website and its contents to you.</li>
                <li>To provide you with information, products, or services that you request from us.</li>
                <li>To fulfill any other purpose for which you provide it.</li>
                <li>To process payments and facilitate domain transfers.</li>
                <li>To notify you about changes to our website or any products or services we offer or provide through it.</li>
                <li>To improve our website and customer service.</li>
                <li>For any other purpose with your consent.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Disclosure of Your Information</h2>
              <p>We may disclose personal information that we collect or you provide as described in this privacy policy:</p>
              <ul className="list-disc pl-6 space-y-2 my-4">
                <li>To contractors, service providers, and other third parties we use to support our business.</li>
                <li>To a buyer or other successor in the event of a merger, divestiture, restructuring, reorganization, dissolution, or other sale or transfer of some or all of NotRenewing Inc.'s assets.</li>
                <li>To fulfill the purpose for which you provide it.</li>
                <li>For any other purpose disclosed by us when you provide the information.</li>
                <li>With your consent.</li>
                <li>To comply with any court order, law, or legal process, including to respond to any government or regulatory request.</li>
              </ul>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
              <p>
                We have implemented measures designed to secure your personal information from accidental loss and from unauthorized 
                access, use, alteration, and disclosure. All information you provide to us is stored on secure servers behind firewalls.
                Any payment transactions will be encrypted using SSL technology.
              </p>
              <p>
                The safety and security of your information also depends on you. Where we have given you (or where you have chosen) a 
                password for access to certain parts of our website, you are responsible for keeping this password confidential. We ask 
                you not to share your password with anyone.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Your Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, such as the right to 
                access, correct, delete, or restrict processing of your personal information. You may also have the right to object 
                to processing and the right to data portability.
              </p>
              <p>
                To exercise any of these rights, please contact us at privacy@notrenewing.com. We will respond to your request within 
                a reasonable timeframe.
              </p>
            </section>
            
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Changes to Our Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. If we make material changes to how we treat our users' personal 
                information, we will notify you through a notice on the website home page or by email to the email address specified 
                in your account.
              </p>
              <p>
                The date the Privacy Policy was last revised is identified at the top of the page. You are responsible for ensuring 
                we have an up-to-date active and deliverable email address for you, and for periodically visiting our website and 
                this Privacy Policy to check for any changes.
              </p>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4">8. Contact Information</h2>
              <p>
                To ask questions or comment about this Privacy Policy and our privacy practices, contact us at:
              </p>
              <p>
                NotRenewing Inc.<br />
                Email: privacy@notrenewing.com<br />
                Address: 123 Domain Street, San Francisco, CA 94107
              </p>
            </section>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default Privacy;
