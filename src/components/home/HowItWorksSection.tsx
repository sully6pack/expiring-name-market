
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HowItWorksSection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="rounded-full bg-brand-blue text-white w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
              <h3 className="text-xl font-semibold mb-2">List Your Domain</h3>
              <p>Register, verify your account, and list your soon-to-expire domain.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="rounded-full bg-brand-blue text-white w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
              <h3 className="text-xl font-semibold mb-2">Connect with Buyers</h3>
              <p>Interested buyers will express interest in your domain.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="rounded-full bg-brand-blue text-white w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
              <h3 className="text-xl font-semibold mb-2">Complete the Sale</h3>
              <p>Finalize the sale directly with the buyer for $99.</p>
            </CardContent>
          </Card>
        </div>
        <div className="text-center mt-8">
          <Link to="/how-it-works">
            <Button variant="outline">Learn More About How It Works</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
